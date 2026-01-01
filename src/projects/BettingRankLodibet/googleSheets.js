// Google Sheets API Integration Module (Betting Rank)
import { GOOGLE_SHEETS_CONFIG } from "./config";

export const googleSheetsAPI = {
  // Extract Sheet ID from Google Sheets URL
  extractSheetId(url) {
    const match = url.match(/\/spreadsheets\/d\/([a-zA-Z0-9-_]+)/);
    return match ? match[1] : null;
  },

  // Build CSV export URL
  buildCSVUrl(sheetId, gid = 0) {
    return `https://docs.google.com/spreadsheets/d/${sheetId}/export?format=csv&gid=${gid}`;
  },

  // Fetch raw data for a specific week
  async fetchWeekData(sheetId, weekGid) {
    try {
      const csvUrl = this.buildCSVUrl(sheetId, weekGid);
      console.log(`Fetching week data: gid=${weekGid}`, csvUrl);

      const response = await fetch(csvUrl);
      if (!response.ok) {
        throw new Error(`HTTP Error: ${response.status}`);
      }

      const csvText = await response.text();
      return this.parseWeekData(csvText);
    } catch (error) {
      console.error("Failed to fetch data:", error);
      throw error;
    }
  },

  // Parse week data (simplified, only 2 fields)
  parseWeekData(csvText) {
    const lines = csvText.split("\n");
    const data = [];

    // Skip header row
    for (let i = 1; i < lines.length; i++) {
      const line = lines[i].trim();
      if (line === "") continue;

      const fields = this.parseCSVLine(line);
      if (fields.length >= 2) {
        const [player_id, bet_amount] = fields;

        if (player_id && bet_amount) {
          data.push({
            playerId: player_id,
            betAmount: parseFloat(bet_amount),
          });
        }
      }
    }

    console.log(`Parsing complete, ${data.length} records found`);
    return data;
  },

  // Calculate rankings and points (frontend processing)
  calculateRankings(weekData, weeklyPointsPool = 100000) {
    // 1. Calculate total betting amount
    const totalBetAmount = weekData.reduce(
      (sum, player) => sum + player.betAmount,
      0
    );

    // 2. Sort by betting amount (descending)
    const sortedData = [...weekData].sort((a, b) => b.betAmount - a.betAmount);

    // 3. Calculate rank, points, and percentage for each player
    const rankings = sortedData.map((player, index) => {
      const percentage = (player.betAmount / totalBetAmount) * 100;
      // Keep full precision during calculation, only floor when displaying
      const points = (player.betAmount / totalBetAmount) * weeklyPointsPool;

      return {
        rank: index + 1,
        playerId: player.playerId,
        maskedPlayerId: this.maskPlayerId(player.playerId),
        betAmount: player.betAmount,
        percentage: percentage.toFixed(2),
        points: points,
      };
    });

    return {
      rankings,
      totalBetAmount,
      totalPlayers: rankings.length,
      weeklyPointsPool,
    };
  },

  // Mask player ID (keep first 2 and last 1 character)
  maskPlayerId(playerId) {
    if (!playerId || playerId.length <= 3) return playerId;
    return `${playerId.slice(0, 2)}${"*".repeat(
      playerId.length - 3
    )}${playerId.slice(-1)}`;
  },

  // Fetch week rankings (combined fetch and calculate)
  async fetchWeekRankings(sheetId, weekGid, weeklyPointsPool = 100000) {
    const weekData = await this.fetchWeekData(sheetId, weekGid);
    return this.calculateRankings(weekData, weeklyPointsPool);
  },

  // Find specific player rank (supports fuzzy matching)
  findPlayerRank(rankings, searchId) {
    const normalizedSearch = searchId.toLowerCase().trim();

    // Only exact match (case-insensitive)
    const found = rankings.find(
      (r) => r.playerId.toLowerCase() === normalizedSearch
    );

    return found || null;
  },

  // Parse CSV line (properly handle fields with commas)
  parseCSVLine(line) {
    const result = [];
    let current = "";
    let inQuotes = false;
    let i = 0;

    while (i < line.length) {
      const char = line[i];

      if (char === '"') {
        if (inQuotes && line[i + 1] === '"') {
          // 处理双引号转义
          current += '"';
          i += 2;
        } else {
          // 切换引号状态
          inQuotes = !inQuotes;
          i++;
        }
      } else if (char === "," && !inQuotes) {
        // 字段分隔符
        result.push(current.trim());
        current = "";
        i++;
      } else {
        current += char;
        i++;
      }
    }

    // 添加最后一个字段
    result.push(current.trim());

    return result;
  },

  // Test Google Sheets connection
  async testConnection(sheetId, weekGid) {
    try {
      const result = await this.fetchWeekRankings(sheetId, weekGid, 100000);
      return {
        success: true,
        ...result,
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
      };
    }
  },

  // Fetch multiple weeks data (for cumulative statistics)
  // This function now checks localStorage cache before fetching
  async fetchMultipleWeeks(sheetId, weekNumbers) {
    try {
      const allWeeksData = {};

      for (const weekNum of weekNumbers) {
        const gid = GOOGLE_SHEETS_CONFIG.WEEK_GIDS[weekNum];
        const pointsPool =
          GOOGLE_SHEETS_CONFIG.WEEK_PERIODS[weekNum].pointsPool;

        if (gid !== undefined) {
          // Check cache first (this is called from index.jsx which manages cache)
          // The cache keys are managed by the parent component
          // We just fetch the data here, caching is handled at a higher level
          allWeeksData[weekNum] = await this.fetchWeekRankings(
            sheetId,
            gid,
            pointsPool
          );
        }
      }

      return allWeeksData;
    } catch (error) {
      console.error("Failed to fetch multiple weeks data:", error);
      throw error;
    }
  },

  // Calculate cumulative ranks for all players at each week
  calculateAllPlayersCumulativeRanks(allWeeksData) {
    const sortedWeeks = Object.keys(allWeeksData)
      .map(Number)
      .sort((a, b) => a - b);
    const playerCumulativeData = new Map(); // playerId -> { cumulativeBet, cumulativePoints }
    const weeklyRanks = {}; // week -> { playerId: rank }

    let cumulativeTotalBet = 0;
    let cumulativePointsPool = 0;

    for (const weekNum of sortedWeeks) {
      const weekData = allWeeksData[weekNum];
      const weekTotalBet =
        weekData.totalBetAmount ||
        weekData.rankings.reduce((sum, p) => sum + p.betAmount, 0);
      cumulativeTotalBet += weekTotalBet;
      cumulativePointsPool += weekData.weeklyPointsPool || 2000000;

      // Update each player's cumulative data
      for (const player of weekData.rankings) {
        const playerData = playerCumulativeData.get(player.playerId) || {
          cumulativeBet: 0,
        };
        playerData.cumulativeBet += player.betAmount;
        playerData.cumulativePoints =
          cumulativeTotalBet > 0
            ? (playerData.cumulativeBet / cumulativeTotalBet) *
              cumulativePointsPool
            : 0;
        playerCumulativeData.set(player.playerId, playerData);
      }

      // Sort all players by cumulative points for this week
      const sortedPlayers = Array.from(playerCumulativeData.entries())
        .map(([playerId, data]) => ({
          playerId,
          cumulativePoints: data.cumulativePoints,
          cumulativeBet: data.cumulativeBet,
        }))
        .sort((a, b) => b.cumulativePoints - a.cumulativePoints);

      // Assign cumulative ranks
      const weekRanks = {};
      sortedPlayers.forEach((player, index) => {
        weekRanks[player.playerId] = index + 1;
      });

      weeklyRanks[weekNum] = weekRanks;
    }

    return weeklyRanks;
  },

  // Calculate player cumulative data with progressive cumulative stats and ranks
  calculatePlayerCumulative(allWeeksData, playerId) {
    let cumulativeBet = 0;
    let cumulativeTotalBet = 0; // All players cumulative bet
    let cumulativePointsPool = 0;
    let bestRank = null;
    let bestCumulativeRank = null;
    let weeklyDetails = [];

    // Calculate cumulative ranks for all players at each week
    const weeklyRanks = this.calculateAllPlayersCumulativeRanks(allWeeksData);

    // Sort weeks to ensure proper cumulative calculation
    const sortedWeeks = Object.keys(allWeeksData)
      .map(Number)
      .sort((a, b) => a - b);

    for (const weekNum of sortedWeeks) {
      const weekData = allWeeksData[weekNum];
      const playerRank = this.findPlayerRank(weekData.rankings, playerId);

      // Accumulate total bet from all players this week
      const weekTotalBet =
        weekData.totalBetAmount ||
        weekData.rankings.reduce((sum, p) => sum + p.betAmount, 0);
      cumulativeTotalBet += weekTotalBet;
      cumulativePointsPool += weekData.weeklyPointsPool || 2000000;

      // Get cumulative rank for this week
      const cumulativeRank = weeklyRanks[weekNum]?.[playerId] || null;

      if (playerRank) {
        // Accumulate player's bet
        cumulativeBet += playerRank.betAmount;

        // Update best rank (weekly)
        if (bestRank === null || playerRank.rank < bestRank) {
          bestRank = playerRank.rank;
        }

        // Update best cumulative rank (ONLY if player participated this week)
        // This ensures we only track cumulative ranks for weeks where player actually bet
        if (
          cumulativeRank &&
          (bestCumulativeRank === null || cumulativeRank < bestCumulativeRank)
        ) {
          bestCumulativeRank = cumulativeRank;
        }

        // Calculate cumulative points and percentage up to this week
        const cumulativePoints =
          cumulativeTotalBet > 0
            ? (cumulativeBet / cumulativeTotalBet) * cumulativePointsPool
            : 0;
        const cumulativePercentage =
          cumulativeTotalBet > 0
            ? ((cumulativeBet / cumulativeTotalBet) * 100).toFixed(2)
            : "0.00";

        weeklyDetails.push({
          week: weekNum,
          // This week's data
          rank: playerRank.rank,
          betAmount: playerRank.betAmount,
          points: playerRank.points,
          percentage: playerRank.percentage,
          // Cumulative data up to this week
          cumulativeBet: cumulativeBet,
          cumulativePoints: cumulativePoints,
          cumulativePercentage: cumulativePercentage,
          cumulativeRank: cumulativeRank,
        });
      } else {
        // Player didn't participate this week, but still show cumulative
        const cumulativePoints =
          cumulativeTotalBet > 0
            ? (cumulativeBet / cumulativeTotalBet) * cumulativePointsPool
            : 0;

        weeklyDetails.push({
          week: weekNum,
          rank: null,
          betAmount: 0,
          points: 0,
          percentage: "0.00",
          cumulativeBet: cumulativeBet,
          cumulativePoints: cumulativePoints,
          cumulativePercentage:
            cumulativeTotalBet > 0
              ? ((cumulativeBet / cumulativeTotalBet) * 100).toFixed(2)
              : "0.00",
          cumulativeRank: cumulativeRank,
        });
      }
    }

    // Final cumulative stats (up to last week)
    const finalCumulativePoints =
      cumulativeTotalBet > 0
        ? (cumulativeBet / cumulativeTotalBet) * cumulativePointsPool
        : 0;

    return {
      totalBet: cumulativeBet,
      totalPoints: finalCumulativePoints,
      bestRank, // Best weekly rank
      bestCumulativeRank, // Best cumulative rank
      weeklyDetails,
      participatedWeeks: weeklyDetails.filter((w) => w.betAmount > 0).length,
    };
  },
};

// 默认导出配置
export { GOOGLE_SHEETS_CONFIG };

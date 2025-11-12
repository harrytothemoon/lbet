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
  async fetchMultipleWeeks(sheetId, weekNumbers) {
    try {
      const allWeeksData = {};

      for (const weekNum of weekNumbers) {
        const gid = GOOGLE_SHEETS_CONFIG.WEEK_GIDS[weekNum];
        const pointsPool =
          GOOGLE_SHEETS_CONFIG.WEEK_PERIODS[weekNum].pointsPool;

        if (gid !== undefined) {
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

  // Calculate player cumulative data
  calculatePlayerCumulative(allWeeksData, playerId) {
    let totalBet = 0;
    let totalPoints = 0;
    let bestRank = null;
    let weeklyDetails = [];

    for (const [weekNum, weekData] of Object.entries(allWeeksData)) {
      const playerRank = this.findPlayerRank(weekData.rankings, playerId);

      if (playerRank) {
        totalBet += playerRank.betAmount;
        totalPoints += playerRank.points;

        if (bestRank === null || playerRank.rank < bestRank) {
          bestRank = playerRank.rank;
        }

        weeklyDetails.push({
          week: parseInt(weekNum),
          rank: playerRank.rank,
          betAmount: playerRank.betAmount,
          points: playerRank.points,
          percentage: playerRank.percentage,
        });
      }
    }

    return {
      totalBet,
      totalPoints,
      bestRank,
      weeklyDetails,
      participatedWeeks: weeklyDetails.length,
    };
  },
};

// 默认导出配置
export { GOOGLE_SHEETS_CONFIG };

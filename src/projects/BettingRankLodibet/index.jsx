// Lodibet Betting Rank Main Component
import React, { useState, useEffect, useCallback } from "react";
import {
  CONFIG,
  GOOGLE_SHEETS_CONFIG,
  getCurrentWeek,
  getWeekStatus,
} from "./config";
import { googleSheetsAPI } from "./googleSheets";
import { lodibetAPI, formatDate } from "./api";
import useFavicon from "../../hooks";

// Import shared components
import ActivityDescription from "../../components/BettingRank/ActivityDescription";
import PlayerQuery from "../../components/BettingRank/PlayerQuery";
import WeeklyRanking from "../../components/BettingRank/WeeklyRanking";
import PrizeList from "../../components/BettingRank/PrizeList";
import PlayerResultDialog from "../../components/BettingRank/PlayerResultDialog";
import TermsConditions from "../../components/BettingRank/TermsConditions";

const BettingRankLodibet = () => {
  // Set page title and favicon
  useFavicon();

  const [currentWeek] = useState(getCurrentWeek());
  const [selectedWeek, setSelectedWeek] = useState(getCurrentWeek());
  const [rankings, setRankings] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [playerResult, setPlayerResult] = useState(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [dialogWeek, setDialogWeek] = useState(getCurrentWeek());
  const [isLoadingDialogWeek, setIsLoadingDialogWeek] = useState(false);
  const [currentPlayerId, setCurrentPlayerId] = useState(null);
  const [isTotalRanking, setIsTotalRanking] = useState(false);

  // Safe localStorage setter to handle quota exceeded errors
  const safeSetItem = (key, value) => {
    try {
      localStorage.setItem(key, value);
      return true;
    } catch (err) {
      if (err.name === "QuotaExceededError") {
        console.warn(`LocalStorage quota exceeded for key: ${key}`);
        // Try to clear old cache entries
        try {
          const keysToRemove = [];
          for (let i = 0; i < localStorage.length; i++) {
            const storageKey = localStorage.key(i);
            if (
              storageKey.startsWith("lodibet_") ||
              storageKey.startsWith("hawk_")
            ) {
              keysToRemove.push(storageKey);
            }
          }
          // Remove oldest entries (keep last 20)
          if (keysToRemove.length > 20) {
            keysToRemove.slice(0, keysToRemove.length - 20).forEach((k) => {
              localStorage.removeItem(k);
            });
            // Try setting again
            localStorage.setItem(key, value);
            return true;
          }
        } catch (clearErr) {
          console.warn("Failed to clear cache:", clearErr);
        }
      } else {
        console.error("LocalStorage error:", err);
      }
      return false;
    }
  };

  // Get next daily update time
  const getNextDailyUpdateTime = () => {
    const now = new Date();
    const [hours, minutes] =
      GOOGLE_SHEETS_CONFIG.DAILY_UPDATE_TIME.split(":").map(Number);
    const nextUpdate = new Date(now);
    nextUpdate.setHours(hours, minutes, 0, 0);

    // If today's update time has passed, set to tomorrow
    if (now >= nextUpdate) {
      nextUpdate.setDate(nextUpdate.getDate() + 1);
    }

    return nextUpdate.getTime();
  };

  // Check if Sheet cache is still valid (daily cache)
  const isSheetCacheValid = useCallback((cacheTime) => {
    if (!cacheTime) return false;
    const nextUpdateTime = getNextDailyUpdateTime();
    const cacheTimestamp = parseInt(cacheTime);
    // Cache is valid if it was created after the last daily update
    const lastUpdateTime = new Date(nextUpdateTime);
    lastUpdateTime.setDate(lastUpdateTime.getDate() - 1);
    return (
      cacheTimestamp > lastUpdateTime.getTime() && Date.now() < nextUpdateTime
    );
  }, []);

  // Check if API cache is still valid (5 minutes)
  const isAPICacheValid = useCallback((cacheTime) => {
    if (!cacheTime) return false;
    const API_CACHE_DURATION = 5 * 60 * 1000; // 5 minutes
    return Date.now() - parseInt(cacheTime) < API_CACHE_DURATION;
  }, []);

  const loadWeekRankings = useCallback(
    async (weekNumber, forceRefresh = false) => {
      const cacheKey = `lodibet_sheet_week_${weekNumber}`;
      const cacheTimeKey = `lodibet_sheet_time_week_${weekNumber}`;

      // Check cache if not forcing refresh (use daily cache for Sheet data)
      if (!forceRefresh) {
        try {
          const cachedData = localStorage.getItem(cacheKey);
          const cachedTime = localStorage.getItem(cacheTimeKey);

          if (cachedData && cachedTime && isSheetCacheValid(cachedTime)) {
            setRankings(JSON.parse(cachedData));
            setLoading(false);
            console.log(
              `Using cached Sheet data for week ${weekNumber}, updated: ${new Date(
                parseInt(cachedTime)
              ).toLocaleString()}`
            );
            return;
          }
        } catch (err) {
          console.error("Cache read error:", err);
          // Continue to fetch from Sheet if cache fails
        }
      }

      setLoading(true);
      setError(null);

      try {
        const gid = GOOGLE_SHEETS_CONFIG.WEEK_GIDS[weekNumber];
        const pointsPool =
          GOOGLE_SHEETS_CONFIG.WEEK_PERIODS[weekNumber].pointsPool;

        if (gid === undefined) {
          throw new Error(`Week ${weekNumber} configuration not found`);
        }

        const result = await googleSheetsAPI.fetchWeekRankings(
          GOOGLE_SHEETS_CONFIG.SHEET_ID,
          gid,
          pointsPool
        );

        setRankings(result.rankings);

        // Save to cache
        safeSetItem(cacheKey, JSON.stringify(result.rankings));
        safeSetItem(cacheTimeKey, Date.now().toString());
      } catch (err) {
        console.error("Failed to load rankings:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    },
    [isSheetCacheValid]
  ); // Depends on isSheetCacheValid

  // Load total cumulative rankings across all weeks
  const loadTotalRanking = useCallback(
    async (forceRefresh = false) => {
      const cacheKey = "lodibet_total_ranking";
      const cacheTimeKey = "lodibet_total_ranking_time";

      // Check cache if not forcing refresh
      if (!forceRefresh) {
        try {
          const cachedData = localStorage.getItem(cacheKey);
          const cachedTime = localStorage.getItem(cacheTimeKey);

          if (cachedData && cachedTime && isSheetCacheValid(cachedTime)) {
            console.log(
              `✅ Using cached total ranking data (${
                JSON.parse(cachedData).length
              } players), updated: ${new Date(
                parseInt(cachedTime)
              ).toLocaleString()}`
            );
            setRankings(JSON.parse(cachedData));
            setLoading(false);
            setError(null);
            return;
          } else {
            console.log(
              "⚠️ Total ranking cache invalid or expired, recalculating..."
            );
          }
        } catch (err) {
          console.error("Cache read error:", err);
        }
      }

      setLoading(true);
      setError(null);

      try {
        // Fetch all weeks data
        const playerTotals = {}; // {playerId: {totalPoints, totalBet, playerId, maskedPlayerId}}

        for (let week = 1; week <= CONFIG.ACTIVITY.totalWeeks; week++) {
          const gid = GOOGLE_SHEETS_CONFIG.WEEK_GIDS[week];
          const pointsPool = GOOGLE_SHEETS_CONFIG.WEEK_PERIODS[week].pointsPool;

          if (gid !== undefined) {
            // Try to use cached week data first
            const weekCacheKey = `lodibet_sheet_week_${week}`;
            const weekCacheTimeKey = `lodibet_sheet_time_week_${week}`;
            let weekRankings;

            const cachedWeekData = localStorage.getItem(weekCacheKey);
            const cachedWeekTime = localStorage.getItem(weekCacheTimeKey);

            if (
              cachedWeekData &&
              cachedWeekTime &&
              isSheetCacheValid(cachedWeekTime)
            ) {
              weekRankings = JSON.parse(cachedWeekData);
              console.log(`Using cached data for week ${week}`);
            } else {
              const result = await googleSheetsAPI.fetchWeekRankings(
                GOOGLE_SHEETS_CONFIG.SHEET_ID,
                gid,
                pointsPool
              );
              weekRankings = result.rankings;

              // Cache the week data
              safeSetItem(weekCacheKey, JSON.stringify(weekRankings));
              safeSetItem(weekCacheTimeKey, Date.now().toString());
            }

            // Accumulate points for each player
            weekRankings.forEach((player) => {
              if (!playerTotals[player.playerId]) {
                playerTotals[player.playerId] = {
                  playerId: player.playerId,
                  maskedPlayerId: player.maskedPlayerId,
                  totalPoints: 0,
                  totalBet: 0,
                };
              }
              playerTotals[player.playerId].totalPoints += player.points;
              playerTotals[player.playerId].totalBet += player.betAmount;
            });
          }
        }

        // Calculate total prize pool (sum of all weeks)
        const totalPrizePool =
          CONFIG.ACTIVITY.totalWeeks *
          GOOGLE_SHEETS_CONFIG.WEEK_PERIODS[1].pointsPool;

        // Convert to array and sort by total points, take only top 10
        const allRankings = Object.values(playerTotals).sort(
          (a, b) => b.totalPoints - a.totalPoints
        );

        const totalRankings = allRankings
          .slice(0, 10) // Only take top 10
          .map((player, index) => ({
            rank: index + 1,
            playerId: player.playerId,
            maskedPlayerId: player.maskedPlayerId,
            betAmount: player.totalBet,
            points: player.totalPoints,
            percentage: parseFloat(
              ((player.totalPoints / totalPrizePool) * 100).toFixed(2)
            ),
          }));

        console.log(
          `✅ Total ranking calculated: Top 10 out of ${allRankings.length} players`
        );
        setRankings(totalRankings);

        // Save calculated result to cache
        const dataString = JSON.stringify(totalRankings);
        console.log(
          `💾 Attempting to cache total ranking (${(
            dataString.length / 1024
          ).toFixed(2)} KB)...`
        );

        const dataSaved = safeSetItem(cacheKey, dataString);
        const timeSaved = safeSetItem(cacheTimeKey, Date.now().toString());

        if (dataSaved && timeSaved) {
          console.log("✅ Total ranking cached successfully");
        } else {
          console.warn(
            "⚠️ Failed to cache total ranking - data may be too large"
          );
          // Clear the time key if data wasn't saved
          if (!dataSaved && timeSaved) {
            localStorage.removeItem(cacheTimeKey);
          }
        }
      } catch (err) {
        console.error("Failed to load total rankings:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    },
    [isSheetCacheValid]
  );

  const handlePlayerQuery = async (playerId, weekToQuery = currentWeek) => {
    setCurrentPlayerId(playerId); // Save player ID for week changes
    try {
      // Always query current week by default
      // Check if selected week is the current week
      const isCurrentWeek = weekToQuery === currentWeek;

      if (isCurrentWeek) {
        // ==== Current Week: Use API for real-time data ====
        const currentWeekPeriod =
          GOOGLE_SHEETS_CONFIG.WEEK_PERIODS[weekToQuery];

        if (!currentWeekPeriod) {
          alert(`Week ${weekToQuery} configuration not found`);
          return;
        }

        // Get current week rankings (ensure sheet data is cached)
        const cacheKey = `lodibet_sheet_week_${weekToQuery}`;
        const cacheTimeKey = `lodibet_sheet_time_week_${weekToQuery}`;
        const currentWeekGid = GOOGLE_SHEETS_CONFIG.WEEK_GIDS[weekToQuery];

        let currentWeekRankings;
        const cachedData = localStorage.getItem(cacheKey);
        const cachedTime = localStorage.getItem(cacheTimeKey);

        if (cachedData && cachedTime && isSheetCacheValid(cachedTime)) {
          currentWeekRankings = JSON.parse(cachedData);
          console.log(
            `[Search] Using cached Sheet data for week ${weekToQuery} (shared with rank block)`
          );
        } else {
          const result = await googleSheetsAPI.fetchWeekRankings(
            GOOGLE_SHEETS_CONFIG.SHEET_ID,
            currentWeekGid,
            currentWeekPeriod.pointsPool
          );
          currentWeekRankings = result.rankings;
          safeSetItem(cacheKey, JSON.stringify(currentWeekRankings));
          safeSetItem(cacheTimeKey, Date.now().toString());
          console.log(`[Search] Cached Sheet data for week ${weekToQuery}`);
        }

        // Get current time as end time
        const now = new Date();
        const endTime = formatDate(now);
        const startTime = currentWeekPeriod.start;

        // Check cache for current week player API data (5 minutes cache)
        const playerApiCacheKey = `lodibet_api_${playerId}_${weekToQuery}`;
        const playerApiCacheTimeKey = `lodibet_api_time_${playerId}_${weekToQuery}`;

        let apiResult;
        const cachedPlayerData = localStorage.getItem(playerApiCacheKey);
        const cachedPlayerTime = localStorage.getItem(playerApiCacheTimeKey);

        if (
          cachedPlayerData &&
          cachedPlayerTime &&
          isAPICacheValid(cachedPlayerTime)
        ) {
          apiResult = JSON.parse(cachedPlayerData);
          const cacheAge = Math.floor(
            (Date.now() - parseInt(cachedPlayerTime)) / 1000
          );
          console.log(
            `[Search] Using cached API data for player ${playerId}, age: ${cacheAge}s`
          );
        } else {
          // Call API to get current week's real-time bet data
          apiResult = await lodibetAPI.getPlayerBetDetail(
            playerId,
            startTime,
            endTime
          );

          if (apiResult.success) {
            // 只缓存计算结果，不缓存原始数据以节省空间
            const cacheData = {
              success: apiResult.success,
              totalValidBet: apiResult.totalValidBet,
              total: apiResult.total,
              username: apiResult.username,
            };
            safeSetItem(playerApiCacheKey, JSON.stringify(cacheData));
            safeSetItem(playerApiCacheTimeKey, Date.now().toString());
          }
        }

        // Calculate current week points based on API data
        const currentWeekBetAmount = apiResult.success
          ? apiResult.totalValidBet
          : 0;
        const totalBetAmount = currentWeekRankings.reduce(
          (sum, player) => sum + player.betAmount,
          0
        );
        const currentWeekPercentage =
          totalBetAmount > 0
            ? ((currentWeekBetAmount / totalBetAmount) * 100).toFixed(2)
            : "0.00";
        const currentWeekPoints = Math.floor(
          (currentWeekBetAmount / totalBetAmount) * currentWeekPeriod.pointsPool
        );

        // Find current rank in rankings (approximate)
        let currentRank = 1;
        for (const player of currentWeekRankings) {
          if (currentWeekBetAmount < player.betAmount) {
            currentRank++;
          } else {
            break;
          }
        }

        // Check cache for cumulative data first (shares time with API cache)
        const currentWeekCumulativeCacheKey = `lodibet_player_cumulative_current_${playerId}_${weekToQuery}`;
        const cachedCumulativeData = localStorage.getItem(
          currentWeekCumulativeCacheKey
        );

        let cumulativeData;
        let hasHistoricalData = false;

        // If cumulative cache exists and API cache is still valid, use it directly
        if (
          cachedCumulativeData &&
          cachedPlayerTime &&
          isAPICacheValid(cachedPlayerTime)
        ) {
          cumulativeData = JSON.parse(cachedCumulativeData);
          hasHistoricalData =
            cumulativeData.participatedWeeks >
            (currentWeekBetAmount > 0 ? 1 : 0);

          // Update current week data in cached cumulative
          const currentWeekDetail = {
            week: weekToQuery,
            rank: currentRank,
            betAmount: currentWeekBetAmount,
            points: currentWeekPoints,
            percentage: currentWeekPercentage,
          };

          // Find if current week exists in weeklyDetails
          const existingWeekIndex = cumulativeData.weeklyDetails.findIndex(
            (w) => w.week === weekToQuery
          );
          if (existingWeekIndex >= 0) {
            // Update existing week
            cumulativeData.weeklyDetails[existingWeekIndex] = currentWeekDetail;
          } else {
            // Add new week
            cumulativeData.weeklyDetails.push(currentWeekDetail);
          }

          // Recalculate totals with updated current week data
          cumulativeData.totalBet = cumulativeData.weeklyDetails.reduce(
            (sum, w) => sum + w.betAmount,
            0
          );
          cumulativeData.totalPoints = cumulativeData.weeklyDetails.reduce(
            (sum, w) => sum + w.points,
            0
          );
          cumulativeData.bestRank = Math.min(
            ...cumulativeData.weeklyDetails.map((w) => w.rank)
          );
          cumulativeData.participatedWeeks =
            cumulativeData.weeklyDetails.filter((w) => w.betAmount > 0).length;

          console.log(
            `[Search] Using cached cumulative data for player ${playerId} week ${weekToQuery} (synced with API cache)`
          );
        } else {
          // No cache or cache expired, calculate from scratch
          // Fetch previous weeks' data from Google Sheets
          cumulativeData = {
            totalBet: currentWeekBetAmount,
            totalPoints: currentWeekPoints,
            bestRank: currentRank,
            participatedWeeks: currentWeekBetAmount > 0 ? 1 : 0,
            weeklyDetails: [
              {
                week: weekToQuery,
                rank: currentRank,
                betAmount: currentWeekBetAmount,
                points: currentWeekPoints,
                percentage: currentWeekPercentage,
              },
            ],
          };

          // Fetch previous weeks' data if not Week 1
          if (weekToQuery > 1) {
            try {
              const previousWeeks = Array.from(
                { length: weekToQuery - 1 },
                (_, i) => i + 1
              );

              // Reuse individual week caches instead of multi-week cache
              const allWeeksData = await googleSheetsAPI.fetchMultipleWeeks(
                GOOGLE_SHEETS_CONFIG.SHEET_ID,
                previousWeeks
              );

              const previousCumulative =
                googleSheetsAPI.calculatePlayerCumulative(
                  allWeeksData,
                  playerId
                );

              // Check if player has any historical data
              if (previousCumulative.participatedWeeks > 0) {
                hasHistoricalData = true;
              }

              // Merge with current week data
              const mergedWeeklyDetails = [
                ...previousCumulative.weeklyDetails,
                {
                  week: weekToQuery,
                  rank: currentRank,
                  betAmount: currentWeekBetAmount,
                  points: currentWeekPoints,
                  percentage: currentWeekPercentage,
                },
              ];

              cumulativeData = {
                totalBet: previousCumulative.totalBet + currentWeekBetAmount,
                totalPoints: previousCumulative.totalPoints + currentWeekPoints,
                bestRank: Math.min(
                  previousCumulative.bestRank || currentRank,
                  currentRank
                ),
                participatedWeeks: mergedWeeklyDetails.filter(
                  (w) => w.betAmount > 0
                ).length,
                weeklyDetails: mergedWeeklyDetails,
              };
            } catch (err) {
              console.warn("Failed to fetch previous weeks data:", err);
            }
          }

          // Cache the cumulative result (no separate time key, synced with API cache)
          safeSetItem(
            currentWeekCumulativeCacheKey,
            JSON.stringify(cumulativeData)
          );
          console.log(
            `[Search] Cached cumulative data for player ${playerId} week ${weekToQuery}`
          );
        }

        // Check if player has any data (current week or historical)
        if (currentWeekBetAmount === 0 && !hasHistoricalData) {
          alert(`🎄 Oops! No Points Yet. Please check your ID again!`);
          setPlayerResult(null);
          return;
        }

        // Set player result
        setPlayerResult({
          rank: currentRank,
          playerId: playerId,
          maskedPlayerId: googleSheetsAPI.maskPlayerId(playerId),
          betAmount: currentWeekBetAmount,
          percentage: currentWeekPercentage,
          points: currentWeekPoints,
          cumulative: cumulativeData,
        });
      } else {
        // ==== Historical Week: Use Google Sheets data ====
        const playerRank = googleSheetsAPI.findPlayerRank(rankings, playerId);

        if (!playerRank) {
          alert(`🎄 Oops! No Points Yet. Please check your ID again!`);
          setPlayerResult(null);
          return;
        }

        // Fetch cumulative data from all weeks up to selected week
        try {
          const weeksToFetch = Array.from(
            { length: weekToQuery },
            (_, i) => i + 1
          );

          // Reuse individual week caches instead of multi-week cache
          const allWeeksData = await googleSheetsAPI.fetchMultipleWeeks(
            GOOGLE_SHEETS_CONFIG.SHEET_ID,
            weeksToFetch
          );

          const cumulative = googleSheetsAPI.calculatePlayerCumulative(
            allWeeksData,
            playerId
          );

          setPlayerResult({
            ...playerRank,
            cumulative,
          });
        } catch (err) {
          // If cumulative fetch fails, just show current week data
          console.warn("Failed to fetch cumulative data:", err);
          setPlayerResult(playerRank);
        }
      }

      // Open dialog to show result
      setDialogWeek(weekToQuery);
      setIsDialogOpen(true);
    } catch (err) {
      console.error("Player query failed:", err);
      alert("Failed to query player data");
      setIsDialogOpen(false);
    }
  };

  // Handle week change in dialog
  const handleDialogWeekChange = async (newWeek) => {
    if (!currentPlayerId || newWeek === dialogWeek) return;

    setDialogWeek(newWeek);
    setIsLoadingDialogWeek(true);

    try {
      // Check if selected week is the current week
      const isCurrentWeek = newWeek === currentWeek;

      if (isCurrentWeek) {
        // ==== Current Week: Use API for real-time data ====
        const currentWeekPeriod = GOOGLE_SHEETS_CONFIG.WEEK_PERIODS[newWeek];

        if (!currentWeekPeriod) {
          alert(`Week ${newWeek} configuration not found`);
          setIsLoadingDialogWeek(false);
          return;
        }

        // Get current week rankings (shared cache with rank block)
        const cacheKey = `lodibet_sheet_week_${newWeek}`;
        const cacheTimeKey = `lodibet_sheet_time_week_${newWeek}`;
        const currentWeekGid = GOOGLE_SHEETS_CONFIG.WEEK_GIDS[newWeek];

        let currentWeekRankings;
        const cachedData = localStorage.getItem(cacheKey);
        const cachedTime = localStorage.getItem(cacheTimeKey);

        if (cachedData && cachedTime && isSheetCacheValid(cachedTime)) {
          currentWeekRankings = JSON.parse(cachedData);
          console.log(
            `Using cached Sheet data for week ${newWeek} (shared with rank block)`
          );
        } else {
          const result = await googleSheetsAPI.fetchWeekRankings(
            GOOGLE_SHEETS_CONFIG.SHEET_ID,
            currentWeekGid,
            currentWeekPeriod.pointsPool
          );
          currentWeekRankings = result.rankings;
          safeSetItem(cacheKey, JSON.stringify(currentWeekRankings));
          safeSetItem(cacheTimeKey, Date.now().toString());
        }

        // Get current time as end time
        const now = new Date();
        const endTime = formatDate(now).substring(0, 16);
        const startTime = currentWeekPeriod.start.substring(0, 16);

        // Check cache for current week player API data (5 minutes cache)
        const playerApiCacheKey = `lodibet_api_${currentPlayerId}_${newWeek}`;
        const playerApiCacheTimeKey = `lodibet_api_time_${currentPlayerId}_${newWeek}`;

        let apiResult;
        const cachedPlayerData = localStorage.getItem(playerApiCacheKey);
        const cachedPlayerTime = localStorage.getItem(playerApiCacheTimeKey);

        if (
          cachedPlayerData &&
          cachedPlayerTime &&
          isAPICacheValid(cachedPlayerTime)
        ) {
          apiResult = JSON.parse(cachedPlayerData);
          const cacheAge = Math.floor(
            (Date.now() - parseInt(cachedPlayerTime)) / 1000
          );
          console.log(
            `Using cached API data for player ${currentPlayerId} in dialog, age: ${cacheAge}s`
          );
        } else {
          // Call API to get current week's real-time bet data
          apiResult = await lodibetAPI.getPlayerBetLogSummary(
            currentPlayerId,
            startTime,
            endTime
          );

          if (apiResult.success) {
            // 只缓存计算结果，不缓存原始数据以节省空间
            const cacheData = {
              success: apiResult.success,
              totalValidBet: apiResult.totalValidBet,
              total: apiResult.total,
              username: apiResult.username,
            };
            safeSetItem(playerApiCacheKey, JSON.stringify(cacheData));
            safeSetItem(playerApiCacheTimeKey, Date.now().toString());
          }
        }

        // Calculate current week points
        // If no data, set to 0 instead of showing error
        const currentWeekBetAmount = apiResult.success
          ? apiResult.totalValidBet
          : 0;
        const totalBetAmount = currentWeekRankings.reduce(
          (sum, player) => sum + player.betAmount,
          0
        );
        const currentWeekPercentage =
          totalBetAmount > 0
            ? ((currentWeekBetAmount / totalBetAmount) * 100).toFixed(2)
            : "0.00";
        const currentWeekPoints = Math.floor(
          (currentWeekBetAmount / totalBetAmount) * currentWeekPeriod.pointsPool
        );

        // Find current rank
        let currentRank = 1;
        for (const player of currentWeekRankings) {
          if (currentWeekBetAmount < player.betAmount) {
            currentRank++;
          } else {
            break;
          }
        }

        // Check cache for cumulative data first (shares time with API cache)
        const currentWeekCumulativeCacheKey = `lodibet_player_cumulative_current_${currentPlayerId}_${newWeek}`;

        const cachedCumulativeData = localStorage.getItem(
          currentWeekCumulativeCacheKey
        );

        let cumulativeData;
        let hasHistoricalData = false;

        // If cumulative cache exists and API cache is still valid, use it directly
        if (
          cachedCumulativeData &&
          cachedPlayerTime &&
          isAPICacheValid(cachedPlayerTime)
        ) {
          cumulativeData = JSON.parse(cachedCumulativeData);
          hasHistoricalData =
            cumulativeData.participatedWeeks >
            (currentWeekBetAmount > 0 ? 1 : 0);

          // Update current week data in cached cumulative
          const currentWeekDetail = {
            week: newWeek,
            rank: currentRank,
            betAmount: currentWeekBetAmount,
            points: currentWeekPoints,
            percentage: currentWeekPercentage,
          };

          // Find if current week exists in weeklyDetails
          const existingWeekIndex = cumulativeData.weeklyDetails.findIndex(
            (w) => w.week === newWeek
          );
          if (existingWeekIndex >= 0) {
            // Update existing week
            cumulativeData.weeklyDetails[existingWeekIndex] = currentWeekDetail;
          } else {
            // Add new week
            cumulativeData.weeklyDetails.push(currentWeekDetail);
          }

          // Recalculate totals with updated current week data
          cumulativeData.totalBet = cumulativeData.weeklyDetails.reduce(
            (sum, w) => sum + w.betAmount,
            0
          );
          cumulativeData.totalPoints = cumulativeData.weeklyDetails.reduce(
            (sum, w) => sum + w.points,
            0
          );
          cumulativeData.bestRank = Math.min(
            ...cumulativeData.weeklyDetails.map((w) => w.rank)
          );
          cumulativeData.participatedWeeks =
            cumulativeData.weeklyDetails.filter((w) => w.betAmount > 0).length;

          console.log(
            `Using cached cumulative data for current week ${newWeek}, player ${currentPlayerId} (synced with API cache)`
          );
        } else {
          // No cache or cache expired, calculate from scratch
          // Initialize cumulative data
          cumulativeData = {
            totalBet: currentWeekBetAmount,
            totalPoints: currentWeekPoints,
            bestRank: currentRank,
            participatedWeeks: currentWeekBetAmount > 0 ? 1 : 0,
            weeklyDetails: [
              {
                week: newWeek,
                rank: currentRank,
                betAmount: currentWeekBetAmount,
                points: currentWeekPoints,
                percentage: currentWeekPercentage,
              },
            ],
          };

          // Fetch previous weeks' data if not Week 1
          if (newWeek > 1) {
            try {
              const previousWeeks = Array.from(
                { length: newWeek - 1 },
                (_, i) => i + 1
              );

              // Reuse individual week caches instead of multi-week cache
              const allWeeksData = await googleSheetsAPI.fetchMultipleWeeks(
                GOOGLE_SHEETS_CONFIG.SHEET_ID,
                previousWeeks
              );

              const previousCumulative =
                googleSheetsAPI.calculatePlayerCumulative(
                  allWeeksData,
                  currentPlayerId
                );

              // Check if player has any historical data
              if (previousCumulative.participatedWeeks > 0) {
                hasHistoricalData = true;
              }

              // Merge with current week data
              const mergedWeeklyDetails = [
                ...previousCumulative.weeklyDetails,
                {
                  week: newWeek,
                  rank: currentRank,
                  betAmount: currentWeekBetAmount,
                  points: currentWeekPoints,
                  percentage: currentWeekPercentage,
                },
              ];

              cumulativeData = {
                totalBet: previousCumulative.totalBet + currentWeekBetAmount,
                totalPoints: previousCumulative.totalPoints + currentWeekPoints,
                bestRank: Math.min(
                  previousCumulative.bestRank || currentRank,
                  currentRank
                ),
                participatedWeeks: mergedWeeklyDetails.filter(
                  (w) => w.betAmount > 0
                ).length,
                weeklyDetails: mergedWeeklyDetails,
              };
            } catch (err) {
              console.warn("Failed to fetch previous weeks data:", err);
            }
          }
        }

        // Check if player has any data (current week or historical)
        if (currentWeekBetAmount === 0 && !hasHistoricalData) {
          alert(`🎄 Oops! No Points Yet. Please check your ID again!`);
          setPlayerResult(null);
          setIsLoadingDialogWeek(false);
          return;
        }

        // Cache the cumulative result for current week (no separate time key, synced with API cache)
        safeSetItem(
          currentWeekCumulativeCacheKey,
          JSON.stringify(cumulativeData)
        );

        // Set player result
        setPlayerResult({
          rank: currentRank,
          playerId: currentPlayerId,
          maskedPlayerId: googleSheetsAPI.maskPlayerId(currentPlayerId),
          betAmount: currentWeekBetAmount,
          percentage: currentWeekPercentage,
          points: currentWeekPoints,
          cumulative: cumulativeData,
        });
      } else {
        // ==== Historical Week: Use Google Sheets data ====
        // Check if week GID exists
        const weekGid = GOOGLE_SHEETS_CONFIG.WEEK_GIDS[newWeek];
        if (weekGid === undefined) {
          alert(
            `Week ${newWeek} data is not available yet. Please try again later.`
          );
          setIsLoadingDialogWeek(false);
          return;
        }

        // Check cache first (shared with rank block - daily cache)
        const cacheKey = `lodibet_sheet_week_${newWeek}`;
        const cacheTimeKey = `lodibet_sheet_time_week_${newWeek}`;

        let weekRankings;
        const cachedData = localStorage.getItem(cacheKey);
        const cachedTime = localStorage.getItem(cacheTimeKey);

        if (cachedData && cachedTime && isSheetCacheValid(cachedTime)) {
          weekRankings = JSON.parse(cachedData);
          console.log(
            `Using cached Sheet data for week ${newWeek} (shared with rank block)`
          );
        } else {
          const result = await googleSheetsAPI.fetchWeekRankings(
            GOOGLE_SHEETS_CONFIG.SHEET_ID,
            weekGid,
            GOOGLE_SHEETS_CONFIG.WEEK_PERIODS[newWeek].pointsPool
          );
          weekRankings = result.rankings;
          safeSetItem(cacheKey, JSON.stringify(weekRankings));
          safeSetItem(cacheTimeKey, Date.now().toString());
        }

        // Find player in this week's rankings
        const playerRank = googleSheetsAPI.findPlayerRank(
          weekRankings,
          currentPlayerId
        );

        // Check cache for cumulative data (permanent cache for historical weeks)
        const cumulativeCacheKey = `lodibet_player_cumulative_${currentPlayerId}_${newWeek}`;

        let cumulativeData = null;

        // Try to get cumulative data from cache (no time check - permanent cache)
        const cachedCumulative = localStorage.getItem(cumulativeCacheKey);

        if (cachedCumulative) {
          cumulativeData = JSON.parse(cachedCumulative);
          console.log(
            `Using cached cumulative data for ${currentPlayerId} week ${newWeek} (permanent cache)`
          );
        } else {
          // Fetch cumulative data from all weeks up to selected week
          try {
            const weeksToFetch = Array.from(
              { length: newWeek },
              (_, i) => i + 1
            );

            // Reuse individual week caches instead of multi-week cache
            const allWeeksData = await googleSheetsAPI.fetchMultipleWeeks(
              GOOGLE_SHEETS_CONFIG.SHEET_ID,
              weeksToFetch
            );

            cumulativeData = googleSheetsAPI.calculatePlayerCumulative(
              allWeeksData,
              currentPlayerId
            );

            // Cache the cumulative result (permanent - no time key needed)
            safeSetItem(cumulativeCacheKey, JSON.stringify(cumulativeData));
          } catch (err) {
            console.warn("Failed to fetch cumulative data:", err);
          }
        }

        // Always show result, even if current week has no data (show 0)
        const currentWeekData = playerRank || {
          rank: "-",
          playerId: currentPlayerId,
          maskedPlayerId: googleSheetsAPI.maskPlayerId(currentPlayerId),
          betAmount: 0,
          percentage: 0,
          points: 0,
        };

        setPlayerResult({
          ...currentWeekData,
          cumulative: cumulativeData,
        });
      }
    } catch (err) {
      console.error("Failed to change week:", err);
      alert("Failed to load week data");
    } finally {
      setIsLoadingDialogWeek(false);
    }
  };

  const handleWeekChange = (weekNumber) => {
    setSelectedWeek(weekNumber);
    setPlayerResult(null); // Clear player result when changing weeks
    setIsDialogOpen(false); // Close dialog when changing weeks
    setIsTotalRanking(false); // Exit total ranking mode
  };

  const handleTotalRankingClick = () => {
    setIsTotalRanking(!isTotalRanking);
    setPlayerResult(null); // Clear player result
    setIsDialogOpen(false); // Close dialog
  };

  const isXmasSeason = () => {
    const now = new Date();
    const month = now.getMonth() + 1;
    return month === 12 || month === 1; // 12月和1月使用圣诞主题
  };

  const [activeMascot] = useState(() => {
    const mascotArray = isXmasSeason()
      ? CONFIG.SITE.mascotsXmas
      : CONFIG.SITE.mascots;
    return Math.floor(Math.random() * mascotArray.length);
  });

  // Load rankings for selected week or total ranking
  useEffect(() => {
    if (isTotalRanking) {
      loadTotalRanking();
    } else {
      loadWeekRankings(selectedWeek);
    }
  }, [selectedWeek, isTotalRanking, loadWeekRankings, loadTotalRanking]);

  // Auto refresh every 5 minutes
  useEffect(() => {
    if (!GOOGLE_SHEETS_CONFIG.AUTO_REFRESH) return;

    const interval = setInterval(() => {
      if (isTotalRanking) {
        loadTotalRanking();
      } else {
        loadWeekRankings(selectedWeek);
      }
    }, GOOGLE_SHEETS_CONFIG.REFRESH_INTERVAL * 60 * 1000);

    return () => clearInterval(interval);
  }, [selectedWeek, isTotalRanking, loadWeekRankings, loadTotalRanking]);

  return (
    <div
      className="min-h-screen py-8 relative overflow-hidden"
      style={{
        background: CONFIG.SITE.bgGradient,
      }}
    >
      {/* Banner 背景 */}
      <div
        className="absolute top-0 left-0 w-full h-64 opacity-30 pointer-events-none flex items-center justify-center"
        style={{
          backgroundImage: `url(${CONFIG.SITE.banner2})`,
          backgroundSize: "contain",
          backgroundRepeat: "no-repeat",
          backgroundPosition: "center 60%",
          maskImage:
            "linear-gradient(to bottom, rgba(0,0,0,0.8) 0%, transparent 100%)",
          WebkitMaskImage:
            "linear-gradient(to bottom, rgba(0,0,0,0.8) 0%, transparent 100%)",
        }}
      />

      {/* Mascot 吉祥物 */}
      <img
        src={
          isXmasSeason()
            ? CONFIG.SITE.mascotsXmas[activeMascot]
            : CONFIG.SITE.mascots[activeMascot]
        }
        alt="Mascot"
        className="fixed bottom-0 right-0 w-48 md:w-64 lg:w-80 opacity-40 pointer-events-none z-10"
        style={{
          filter: "drop-shadow(0 0 20px rgba(139,92,246,0.4))",
          animation: "float 6s ease-in-out infinite",
        }}
      />

      {/* Casino-style decorative background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Glowing orbs */}
        <div
          className="absolute top-20 right-20 w-96 h-96 rounded-full blur-3xl opacity-20 animate-pulse"
          style={{
            backgroundColor: CONFIG.SITE.primaryColor,
            animation: "pulse 4s ease-in-out infinite",
          }}
        ></div>
        <div
          className="absolute bottom-20 left-20 w-96 h-96 rounded-full blur-3xl opacity-15 animate-pulse"
          style={{
            backgroundColor: CONFIG.SITE.accentColor,
            animation: "pulse 5s ease-in-out infinite",
          }}
        ></div>
        <div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full blur-3xl opacity-10"
          style={{
            background: `radial-gradient(circle, ${CONFIG.SITE.primaryColor}40, transparent 70%)`,
          }}
        ></div>

        {/* Grid pattern overlay */}
        <div
          className="absolute inset-0 opacity-5"
          style={{
            backgroundImage: `
              linear-gradient(${CONFIG.SITE.primaryColor}40 1px, transparent 1px),
              linear-gradient(90deg, ${CONFIG.SITE.primaryColor}40 1px, transparent 1px)
            `,
            backgroundSize: "50px 50px",
          }}
        ></div>

        {/* Diagonal lines pattern */}
        <div
          className="absolute inset-0 opacity-5"
          style={{
            backgroundImage: `repeating-linear-gradient(
              45deg,
              ${CONFIG.SITE.accentColor}30,
              ${CONFIG.SITE.accentColor}30 2px,
              transparent 2px,
              transparent 30px
            )`,
          }}
        ></div>

        {/* Spotlight effects */}
        <div
          className="absolute -top-40 -left-40 w-96 h-96 opacity-30"
          style={{
            background: `radial-gradient(circle, ${CONFIG.SITE.primaryColor}60, transparent 70%)`,
            filter: "blur(60px)",
          }}
        ></div>
        <div
          className="absolute -bottom-40 -right-40 w-96 h-96 opacity-30"
          style={{
            background: `radial-gradient(circle, ${CONFIG.SITE.accentColor}60, transparent 70%)`,
            filter: "blur(60px)",
          }}
        ></div>

        {/* Floating particles */}
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 rounded-full animate-float"
            style={{
              backgroundColor:
                i % 2 === 0
                  ? CONFIG.SITE.primaryColor
                  : CONFIG.SITE.accentColor,
              top: `${Math.random() * 100}%`,
              left: `${Math.random() * 100}%`,
              opacity: Math.random() * 0.3 + 0.1,
              animationDelay: `${Math.random() * 5}s`,
              animationDuration: `${Math.random() * 10 + 10}s`,
            }}
          />
        ))}
      </div>

      {/* Content container with glass morphism */}
      <div className="container mx-auto px-4 max-w-6xl relative z-10">
        {/* Activity Description */}
        <ActivityDescription config={CONFIG} />

        {/* Player Query */}
        <PlayerQuery config={CONFIG} onQuery={handlePlayerQuery} />

        {/* Weekly Rankings (with integrated Week Selector) */}
        <WeeklyRanking
          config={CONFIG}
          weekNumber={selectedWeek}
          rankings={rankings}
          loading={loading}
          error={error}
          currentWeek={currentWeek}
          selectedWeek={selectedWeek}
          onWeekChange={handleWeekChange}
          getWeekStatus={getWeekStatus}
          weekPeriods={GOOGLE_SHEETS_CONFIG.WEEK_PERIODS}
          onTotalRankingClick={handleTotalRankingClick}
          isTotalRanking={isTotalRanking}
        />

        {/* Prize List */}
        <PrizeList config={CONFIG} />

        {/* Terms & Conditions */}
        <TermsConditions config={CONFIG} />

        {/* Footer */}
        <div className="text-center text-sm text-gray-400 mt-8 opacity-60">
          <p>© 2025 {CONFIG.SITE.name}. All rights reserved.</p>
        </div>
      </div>

      {/* Player Result Dialog */}
      <PlayerResultDialog
        config={CONFIG}
        playerData={playerResult}
        weekNumber={dialogWeek}
        isOpen={isDialogOpen}
        onClose={() => {
          setIsDialogOpen(false);
          setCurrentPlayerId(null);
        }}
        onWeekChange={handleDialogWeekChange}
        totalWeeks={CONFIG.ACTIVITY.totalWeeks}
        isLoadingWeek={isLoadingDialogWeek}
        currentWeek={currentWeek}
      />

      {/* Back to Game Floating Button */}
      <a
        href={CONFIG.WEBSITE_URL}
        target="_blank"
        rel="noopener noreferrer"
        className="fixed bottom-6 right-6 z-50 px-6 py-3 rounded-full shadow-2xl hover:shadow-3xl transition-all transform hover:scale-105 font-bold text-sm sm:text-base flex items-center gap-2 animate-bounce-slow"
        style={{
          background: `linear-gradient(135deg, ${CONFIG.SITE.primaryColor}, ${CONFIG.SITE.accentColor})`,
          color: "white",
          border: `2px solid ${CONFIG.SITE.accentColor}`,
        }}
      >
        <span className="text-xl">🎮</span>
        <span>Back to game and Win</span>
      </a>

      {/* Add custom animations */}
      <style>{`
        @keyframes float {
          0%, 100% {
            transform: translateY(0) translateX(0) rotate(0deg);
          }
          25% {
            transform: translateY(-20px) translateX(10px) rotate(2deg);
          }
          50% {
            transform: translateY(-40px) translateX(-10px) rotate(-2deg);
          }
          75% {
            transform: translateY(-20px) translateX(10px) rotate(1deg);
          }
        }
        .animate-float {
          animation: float 15s ease-in-out infinite;
        }
        @keyframes bounce-slow {
          0%, 100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(-10px);
          }
        }
        .animate-bounce-slow {
          animation: bounce-slow 3s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
};

export default BettingRankLodibet;

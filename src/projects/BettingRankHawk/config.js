// Hawk Betting Rank Activity Configuration
const WEEK_POINTS_POOL = 2000000;
export const CONFIG = {
  // Site Information
  SITE: {
    name: "HawkPlay",
    logo: `${process.env.PUBLIC_URL}/BettingRankHawk/logo.png`,
    banner: `${process.env.PUBLIC_URL}/BettingRankHawk/banner.png`,
    banner2: `${process.env.PUBLIC_URL}/BettingRankHawk/banner2.png`,
    favicon: `${process.env.PUBLIC_URL}/BettingRankHawk/favicon.ico`,
    mascots: [
      `${process.env.PUBLIC_URL}/BettingRankHawk/mascot1.png`,
      `${process.env.PUBLIC_URL}/BettingRankHawk/mascot2.png`,
      `${process.env.PUBLIC_URL}/BettingRankHawk/mascot3.png`,
      `${process.env.PUBLIC_URL}/BettingRankHawk/mascot4.png`,
      `${process.env.PUBLIC_URL}/BettingRankHawk/mascot5.png`,
      `${process.env.PUBLIC_URL}/BettingRankHawk/mascot6.png`,
      `${process.env.PUBLIC_URL}/BettingRankHawk/mascot7.png`,
    ],
    primaryColor: "#0066CC", // Hawk 蓝色主题
    accentColor: "#00D4FF", // 亮蓝色强调色
    bgGradient:
      "linear-gradient(135deg, #0a0e1a 0%, #12172e 50%, #0d1020 100%)",
  },

  // Activity Information
  ACTIVITY: {
    title: "Christmas Gift Hunt",
    subtitle: "Earn Points Win Amazing Rewards",
    description:
      "Let's welcome the Ber Months with festive cheer! Place your bets, earn points, and win exciting Christmas gifts. Make this holiday season one you'll never forget! 🎁",
    startDate: "2025-11-13",
    endDate: "2025-12-31",
    totalWeeks: 7,
  },

  // API 通过 AWS Lightsail + Cloudflare Tunnel 代理
  // 认证信息在 Nginx 配置中，前端不需要

  // Prize Configuration
  PRIZES: [
    {
      rank: 1,
      prize: "🥇 1st Place",
      reward: "iPhone 17 Pro Max (512 GB) + 200,000 Points",
    },
    {
      rank: 2,
      prize: "🥈 2nd Place",
      reward: "iPhone 17 Pro Max (512 GB) + 80,000 Points",
    },
    {
      rank: 3,
      prize: "🥉 3rd Place",
      reward: "iPhone 17 Pro Max (512 GB) + 50,000 Points",
    },
    {
      rank: "4-10",
      prize: "📱 4th-10th Place",
      reward: "iPhone 17 + 10,000 Points",
    },
    { rank: "11-50", prize: "🎁 11th-50th Place", reward: "10,000 Points" },
    { rank: "51-100", prize: "🎉 51st-100th Place", reward: "8,000 Points" },
    { rank: "101-200", prize: "💎 101st-200th Place", reward: "6,000 Points" },
    { rank: "201-300", prize: "⭐ 201st-300th Place", reward: "4,000 Points" },
    { rank: "301-400", prize: "🌟 301st-400th Place", reward: "3,000 Points" },
    { rank: "401-500", prize: "✨ 401st-500th Place", reward: "2,000 Points" },
    {
      rank: "501-1000",
      prize: "🎊 501st-1000th Place",
      reward: "1,000 Points",
    },
  ],

  // Activity Rules
  RULES: [
    {
      title: "Weekly Points",
      content:
        "Each week, a total of 2,000,000 points will be shared among all players. Your earned points depend on your share of the total weekly slot bets.",
      example:
        "Example: If you bet 1,000,000 from Nov 10–16, and the total site bets are 10,000,000, you will receive: 2,000,000 × (1,000,000 ÷ 10,000,000) = 200,000 points",
    },
    {
      title: "Event Duration & Rewards",
      content:
        "The event runs for 7 weeks. Your total accumulated points will determine your rank, and you'll receive exclusive Christmas gifts based on your final position.",
    },
  ],

  // Website URL for "Back to game" button
  WEBSITE_URL: "https://hawkplay.com",
};

// Google Sheets Configuration (same structure, different Sheet ID if needed)
export const GOOGLE_SHEETS_CONFIG = {
  // Google Sheets ID - Hawk Betting Rankings
  SHEET_ID: "1TwCGFcwert_cAqgMgAQtQu8dQXZKD6vGA_YgG_FvdSs",

  // Weekly GID mapping (configure based on actual Google Sheets)
  WEEK_GIDS: {
    1: 0, // Week1 tab gid
    2: 925056114, // Week2 tab gid (check URL for actual value)
    3: 562913884, // Week3 tab gid
    4: 1272086023, // Week4 tab gid
    5: 143427062, // Week5 tab gid
    6: 1569763065, // Week6 tab gid
    7: 1050389095, // Week7 tab gid
    8: 1764426015, // Week8 tab gid
    9: 890123, // Week9 tab gid
    10: 901234, // Week10 tab gid
  },

  WEEK_PERIODS: {
    1: {
      start: "2025-11-13 00:00:00",
      end: "2025-11-19 23:59:59",
      pointsPool: WEEK_POINTS_POOL,
    },
    2: {
      start: "2025-11-20 00:00:00",
      end: "2025-11-26 23:59:59",
      pointsPool: WEEK_POINTS_POOL,
    },
    3: {
      start: "2025-11-27 00:00:00",
      end: "2025-12-03 23:59:59",
      pointsPool: WEEK_POINTS_POOL,
    },
    4: {
      start: "2025-12-04 00:00:00",
      end: "2025-12-10 23:59:59",
      pointsPool: WEEK_POINTS_POOL,
    },
    5: {
      start: "2025-12-11 00:00:00",
      end: "2025-12-17 23:59:59",
      pointsPool: WEEK_POINTS_POOL,
    },
    6: {
      start: "2025-12-18 00:00:00",
      end: "2025-12-24 23:59:59",
      pointsPool: WEEK_POINTS_POOL,
    },
    7: {
      start: "2025-12-25 00:00:00",
      end: "2025-12-31 23:59:59",
      pointsPool: WEEK_POINTS_POOL,
    },
  },

  // Data refresh interval (minutes)
  REFRESH_INTERVAL: 5,

  // Auto refresh enabled
  AUTO_REFRESH: true,

  // Daily sheet data update time (24-hour format)
  DAILY_UPDATE_TIME: "09:00", // Sheet data updates at 9:00 AM daily
};

// Get current week number based on current time
export const getCurrentWeek = () => {
  const now = new Date();
  for (let week = 1; week <= 7; week++) {
    const period = GOOGLE_SHEETS_CONFIG.WEEK_PERIODS[week];
    const start = new Date(period.start);
    const end = new Date(period.end);
    if (now >= start && now <= end) {
      return week;
    }
  }
  return 1; // Default to week 1
};

// Get week status
export const getWeekStatus = (weekNumber) => {
  const now = new Date();
  const period = GOOGLE_SHEETS_CONFIG.WEEK_PERIODS[weekNumber];
  if (!period) return "unknown";

  const start = new Date(period.start);
  const end = new Date(period.end);

  if (now < start) return "upcoming"; // Not started
  if (now >= start && now <= end) return "ongoing"; // Ongoing
  if (now > end) return "ended"; // Ended

  return "unknown";
};

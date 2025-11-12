// Lodibet Betting Rank Activity Configuration

const WEEK_POINTS_POOL = 2000000;
export const CONFIG = {
  // Site Information
  SITE: {
    name: "Lodibet",
    logo: `${process.env.PUBLIC_URL}/BettingRankLodibet/logo.png`,
    banner: `${process.env.PUBLIC_URL}/BettingRankLodibet/banner.png`,
    banner2: `${process.env.PUBLIC_URL}/BettingRankLodibet/banner2.png`,
    favicon: `${process.env.PUBLIC_URL}/BettingRankLodibet/favicon.ico`,
    mascots: [
      `${process.env.PUBLIC_URL}/BettingRankLodibet/mascot-1.png`,
      `${process.env.PUBLIC_URL}/BettingRankLodibet/mascot-2.png`,
      `${process.env.PUBLIC_URL}/BettingRankLodibet/mascot-3.png`,
    ],
    mascotsXmas: [
      `${process.env.PUBLIC_URL}/BettingRankLodibet/mascot-xmas-1.png`,
      `${process.env.PUBLIC_URL}/BettingRankLodibet/mascot-xmas-2.png`,
      `${process.env.PUBLIC_URL}/BettingRankLodibet/mascot-xmas-3.png`,
      `${process.env.PUBLIC_URL}/BettingRankLodibet/mascot-xmas-4.png`,
    ],
    primaryColor: "#8B5CF6", // Lodibet 紫色主题
    accentColor: "#FCD34D", // 黄色强调色
    bgGradient:
      "linear-gradient(135deg, #1a0a2e 0%, #2d1b4e 50%, #1a0f3a 100%)",
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
      reward: "iPhone 17 Pro Max (512 GB) + 100,000 Points",
    },
    {
      rank: 2,
      prize: "🥈 2nd Place",
      reward: "iPhone 17 Pro Max (512 GB) + 50,000 Points",
    },
    {
      rank: 3,
      prize: "🥉 3rd Place",
      reward: "iPhone 17 Pro Max (512 GB) + 20,000 Points",
    },
    {
      rank: "4-10",
      prize: "📱 4th-10th Place",
      reward: "Realme G7 (12GB+512 GB)",
    },
    { rank: "11-50", prize: "🎁 11th-50th Place", reward: "6,000 Points" },
    { rank: "51-100", prize: "🎉 51st-100th Place", reward: "3,600 Points" },
    { rank: "101-200", prize: "💎 101st-200th Place", reward: "2,000 Points" },
    { rank: "201-300", prize: "⭐ 201st-300th Place", reward: "1,200 Points" },
    { rank: "301-400", prize: "🌟 301st-400th Place", reward: "800 Points" },
    { rank: "401-500", prize: "✨ 401st-500th Place", reward: "500 Points" },
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
  WEBSITE_URL: "https://lodibet99.com",
};

// Google Sheets Configuration
export const GOOGLE_SHEETS_CONFIG = {
  // Google Sheets ID
  SHEET_ID: "1OC8Egwo-JJLUkgNw0Nr_MbeQpej5IqDt8n3mgJaE1dk",

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
    9: 890123456, // Week9 tab gid (TODO: Update with actual gid from Google Sheets URL)
    10: 901234567, // Week10 tab gid (TODO: Update with actual gid from Google Sheets URL)
  },

  // Weekly time periods and points pool configuration (adjustable)
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

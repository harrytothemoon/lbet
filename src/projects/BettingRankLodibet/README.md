# Betting Rank Activity - Lodibet & Hawk

## Overview

Weekly betting rankings activity for Lodibet and Hawk platforms. Players compete for weekly rankings and share the points pool based on their betting amounts.

## Features

- ✅ Weekly betting rankings (10 weeks total)
- ✅ Player ID search functionality
- ✅ Real-time ranking display (top 50 players)
- ✅ Points distribution based on betting percentage
- ✅ Cumulative statistics across all weeks
- ✅ Mobile-first responsive design
- ✅ Auto-refresh every 5 minutes
- ✅ Prize distribution display

## Routes

- **Lodibet**: `/lottery/betting-rank-lodibet`
- **Hawk**: `/lottery/betting-rank-hawk`

## Configuration

### 1. Update Google Sheets ID

Edit `config.js`:

```javascript
export const GOOGLE_SHEETS_CONFIG = {
  SHEET_ID: "YOUR_ACTUAL_SHEET_ID", // Update this
  // ...
};
```

### 2. Configure Weekly GIDs

After creating weekly tabs in Google Sheets, update the GID mapping:

```javascript
WEEK_GIDS: {
  1: 0,        // Week1 tab gid (check URL: gid=0)
  2: 123456,   // Week2 tab gid (check URL: gid=123456)
  // ... continue for all weeks
}
```

### 3. Configure API Token

For Lodibet, edit `config.js`:

```javascript
API: {
  token: "YOUR_API_TOKEN", // Or use environment variable
  // ...
}
```

For Hawk, the API configuration may differ based on their authentication method.

### 4. Adjust Weekly Points Pool

You can set different points pools for each week:

```javascript
WEEK_PERIODS: {
  1: { 
    start: "2025-11-10 00:00:00", 
    end: "2025-11-16 23:59:59",
    pointsPool: 100000  // Week 1: 100k points
  },
  5: {
    start: "2025-12-08 00:00:00",
    end: "2025-12-14 23:59:59", 
    pointsPool: 200000  // Week 5: 200k points (increased!)
  },
  // ...
}
```

## Google Sheets Setup

### Data Format

The Google Sheets should contain the following columns:

| player_id | bet_amount |
|-----------|------------|
| matt143   | 150000     |
| john456   | 120000     |
| ...       | ...        |

### Weekly Organization

- Create one tab per week: `Week1`, `Week2`, ..., `Week10`
- Each tab should have the same column structure
- Update data daily
- Rankings are calculated on the frontend

### How to Get GID

1. Open your Google Sheet
2. Click on a tab (e.g., Week2)
3. Look at the URL: `...edit#gid=123456`
4. The number after `gid=` is the GID (123456)

## Points Calculation Formula

```
Player Points = Weekly Points Pool × (Player Bet / Total Bets)
```

Example:
- Weekly Points Pool: 100,000
- Player Bet: 50,000
- Total Bets: 1,000,000
- Player Points = 100,000 × (50,000 / 1,000,000) = 5,000

## Components

### Shared Components (`/src/components/BettingRank/`)

- `ActivityDescription.jsx` - Activity information and rules
- `PlayerQuery.jsx` - Player ID search input
- `WeeklyRanking.jsx` - Rankings table display
- `PrizeList.jsx` - Prize distribution display
- `PlayerResult.jsx` - Individual player statistics
- `WeekSelector.jsx` - Week navigation

### Project-Specific Files

Each project (Lodibet/Hawk) has:
- `config.js` - Site configuration
- `api.js` - API integration
- `googleSheets.js` - Google Sheets data fetching
- `index.jsx` - Main component

## Customization

### Change Colors

Edit `config.js`:

```javascript
SITE: {
  primaryColor: "#FF6B00", // Change this
  accentColor: "#FFA500",  // And this
}
```

### Update Prizes

Edit `config.js`:

```javascript
PRIZES: [
  { rank: 1, prize: "🥇 1st Place", reward: "Your Prize Here" },
  // ...
]
```

### Modify Rules

Edit `config.js`:

```javascript
RULES: [
  "1. Your custom rule here",
  "2. Another rule",
  // ...
]
```

## Development

```bash
npm install
npm start
```

Visit:
- http://localhost:3000/lottery/betting-rank-lodibet
- http://localhost:3000/lottery/betting-rank-hawk

## Deployment

1. Configure API tokens (use environment variables in production)
2. Set up Google Sheets with correct permissions (public read access)
3. Update GIDs after creating all weekly tabs
4. Build and deploy:

```bash
npm run build
```

## API Requirements

### Lodibet API

- **U-008 (Personal Financial Data)**: Used for individual player queries
- Token-based authentication
- Endpoint: `/player/personal-financial-data-extend`

### Hawk API

- Bearer token authentication
- Endpoint format may differ from Lodibet
- Update `api.js` based on actual Hawk API documentation

## Troubleshooting

### Rankings Not Loading

1. Check if Google Sheets is publicly accessible
2. Verify SHEET_ID is correct
3. Check browser console for errors
4. Confirm GID matches the tab

### Player Search Not Working

1. Ensure player ID exists in the current week's data
2. Try partial match (e.g., "matt" instead of "matt143")
3. Check that rankings data is loaded

### API Errors

1. Verify API token is correct
2. Check API endpoint URLs
3. Review CORS settings if calling from frontend

## Security Notes

⚠️ **Important**: 

1. Never commit actual API tokens to Git
2. Use environment variables for production
3. Consider using a backend proxy for API calls
4. Google Sheets should be read-only public

## Support

For questions or issues, contact the development team.

---

© 2025 Lodibet/Hawk. All rights reserved.


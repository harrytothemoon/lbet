// Virtual Ranking Component with Fixed Top 3
import React, { useState, useRef } from "react";
import { formatNumber } from "../../projects/BettingRankLodibet/api";

const VirtualRanking = ({ config, rankings, showTopThree = false }) => {
  const { SITE, PRIZES } = config;
  const scrollContainerRef = useRef(null);
  const [visibleRange, setVisibleRange] = useState({ start: 0, end: 10 });
  const [showScrollHint, setShowScrollHint] = useState(true);

  const ITEM_HEIGHT = 45; // Height of each row
  const VISIBLE_ITEMS = 7; // Show 7 items (top 3 are fixed above)
  const CONTAINER_HEIGHT = ITEM_HEIGHT * VISIBLE_ITEMS;

  // Top 3 players for podium display (only when showTopThree is true)
  const topThree = showTopThree ? rankings.slice(0, 3) : [];
  // Rest of the players (virtual scrolling) - all players if not showing podium
  const restPlayers = showTopThree ? rankings.slice(3) : rankings;

  // Get rank display
  const getRankDisplay = (rank) => {
    if (rank === 1) return "🥇";
    if (rank === 2) return "🥈";
    if (rank === 3) return "🥉";
    return `#${rank}`;
  };

  // Get rank background color
  const getRankBgClass = (rank) => {
    if (rank === 1)
      return "bg-gradient-to-r from-yellow-100 to-yellow-50 border-l-4 border-yellow-500";
    if (rank === 2)
      return "bg-gradient-to-r from-gray-100 to-gray-50 border-l-4 border-gray-400";
    if (rank === 3)
      return "bg-gradient-to-r from-orange-100 to-orange-50 border-l-4 border-orange-400";
    return "bg-white hover:bg-gray-50";
  };

  // Handle scroll
  const handleScroll = (e) => {
    const scrollTop = e.target.scrollTop;
    const maxScroll = e.target.scrollHeight - e.target.clientHeight;
    const start = Math.floor(scrollTop / ITEM_HEIGHT);
    const end = Math.min(start + VISIBLE_ITEMS + 5, restPlayers.length); // +5 buffer
    setVisibleRange({ start, end });

    // Hide scroll hint when scrolled
    if (scrollTop > 50 || scrollTop >= maxScroll - 10) {
      setShowScrollHint(false);
    }
  };

  // Render player row
  const renderPlayerRow = (player, index) => {
    // Calculate position based on whether top 3 are shown separately
    const virtualIndex = showTopThree ? player.rank - 4 : player.rank - 1;

    return (
      <div
        key={player.playerId}
        className={`flex items-center px-2 sm:px-4 py-2 sm:py-3 border-b border-gray-200 transition-all ${getRankBgClass(
          player.rank
        )}`}
        style={{
          height: `${ITEM_HEIGHT}px`,
          position: "absolute",
          top: `${virtualIndex * ITEM_HEIGHT}px`,
          left: 0,
          right: 0,
        }}
      >
        {/* Rank */}
        <div className="w-16 sm:w-16 flex-shrink-0">
          <span className="text-base sm:text-xl font-bold">
            {getRankDisplay(player.rank)}
          </span>
        </div>

        {/* Player ID */}
        <div className="flex-1 min-w-0 px-1 sm:px-3">
          <span className="font-mono font-semibold text-gray-700 truncate block text-xs sm:text-sm">
            {player.maskedPlayerId}
          </span>
        </div>

        {/* Bet Amount */}
        <div className="w-20 sm:w-32 text-right px-1 sm:px-2 hidden sm:block">
          <span className="font-semibold text-gray-800 text-xs sm:text-sm">
            💰 {formatNumber(player.betAmount.toFixed(0))}
          </span>
        </div>

        {/* Share */}
        <div className="w-16 sm:w-24 text-right px-1 sm:px-2">
          <span
            className="inline-flex items-center gap-0.5 sm:gap-1 px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-full text-[10px] sm:text-xs font-bold text-white"
            style={{ backgroundColor: SITE.primaryColor }}
          >
            {player.percentage}%
          </span>
        </div>

        {/* Points */}
        <div className="w-20 sm:w-28 text-right">
          <span
            className="font-bold text-xs sm:text-base"
            style={{ color: SITE.accentColor }}
          >
            ⭐ {formatNumber(Math.floor(player.points))}
          </span>
        </div>
      </div>
    );
  };

  return (
    <div className="bg-white rounded-b-xl">
      {/* Fixed Top 3 - Podium Style */}
      {topThree.length > 0 && (
        <div
          className="border-b-4"
          style={{ borderColor: `${SITE.primaryColor}30` }}
        >
          {/* Podium Display */}
          <div
            className="relative px-4 py-8 overflow-hidden"
            style={{
              background: `linear-gradient(135deg, 
                ${SITE.primaryColor}25 0%, 
                ${SITE.accentColor}30 25%,
                ${SITE.primaryColor}35 50%,
                ${SITE.accentColor}30 75%,
                ${SITE.primaryColor}25 100%)`,
            }}
          >
            {/* Static mascot decorations - Multiple mascots with different angles */}
            {SITE.mascots && SITE.mascots[0] && (
              <>
                {/* ==== TOP AREA - More mascots ==== */}
                {/* Top Far Left */}
                <img
                  src={SITE.mascots[0]}
                  alt="Mascot"
                  className="absolute pointer-events-none z-0"
                  style={{
                    top: "3%",
                    left: "1%",
                    width: "65px",
                    opacity: 0.2,
                    filter: `drop-shadow(0 0 20px ${SITE.accentColor}40)`,
                    transform: "rotate(-25deg) scaleX(-1)",
                  }}
                />
                {/* Top Left */}
                <img
                  src={SITE.mascots[1] || SITE.mascots[0]}
                  alt="Mascot"
                  className="absolute pointer-events-none z-0"
                  style={{
                    top: "8%",
                    left: "8%",
                    width: "75px",
                    opacity: 0.25,
                    filter: `drop-shadow(0 0 20px ${SITE.primaryColor}40)`,
                    transform: "rotate(-15deg)",
                  }}
                />
                {/* Top Center Left */}
                <img
                  src={SITE.mascots[2] || SITE.mascots[0]}
                  alt="Mascot"
                  className="absolute pointer-events-none z-0"
                  style={{
                    top: "5%",
                    left: "25%",
                    width: "60px",
                    opacity: 0.18,
                    filter: `drop-shadow(0 0 20px ${SITE.accentColor}40)`,
                    transform: "rotate(10deg)",
                  }}
                />
                {/* Top Center Right */}
                <img
                  src={SITE.mascots[1] || SITE.mascots[0]}
                  alt="Mascot"
                  className="absolute pointer-events-none z-0"
                  style={{
                    top: "6%",
                    right: "25%",
                    width: "58px",
                    opacity: 0.18,
                    filter: `drop-shadow(0 0 20px ${SITE.primaryColor}40)`,
                    transform: "rotate(-18deg) scaleX(-1)",
                  }}
                />
                {/* Top Right */}
                <img
                  src={SITE.mascots[0]}
                  alt="Mascot"
                  className="absolute pointer-events-none z-0"
                  style={{
                    top: "12%",
                    right: "8%",
                    width: "75px",
                    opacity: 0.25,
                    filter: `drop-shadow(0 0 20px ${SITE.accentColor}40)`,
                    transform: "rotate(15deg) scaleX(-1)",
                  }}
                />
                {/* Top Far Right */}
                <img
                  src={SITE.mascots[2] || SITE.mascots[0]}
                  alt="Mascot"
                  className="absolute pointer-events-none z-0"
                  style={{
                    top: "4%",
                    right: "1%",
                    width: "65px",
                    opacity: 0.2,
                    filter: `drop-shadow(0 0 20px ${SITE.primaryColor}40)`,
                    transform: "rotate(22deg)",
                  }}
                />

                {/* ==== MIDDLE AREA ==== */}
                {/* Middle Left */}
                <img
                  src={SITE.mascots[1] || SITE.mascots[0]}
                  alt="Mascot"
                  className="absolute pointer-events-none z-0"
                  style={{
                    top: "35%",
                    left: "4%",
                    width: "65px",
                    opacity: 0.2,
                    filter: `drop-shadow(0 0 20px ${SITE.accentColor}40)`,
                    transform: "rotate(20deg) scaleX(-1)",
                  }}
                />
                {/* Middle Right */}
                <img
                  src={SITE.mascots[2] || SITE.mascots[0]}
                  alt="Mascot"
                  className="absolute pointer-events-none z-0"
                  style={{
                    top: "40%",
                    right: "4%",
                    width: "60px",
                    opacity: 0.18,
                    filter: `drop-shadow(0 0 20px ${SITE.primaryColor}40)`,
                    transform: "rotate(-25deg)",
                  }}
                />

                {/* ==== BOTTOM AREA - More mascots ==== */}
                {/* Bottom Far Left */}
                <img
                  src={SITE.mascots[2] || SITE.mascots[0]}
                  alt="Mascot"
                  className="absolute pointer-events-none z-0"
                  style={{
                    bottom: "2%",
                    left: "1%",
                    width: "60px",
                    opacity: 0.18,
                    filter: `drop-shadow(0 0 20px ${SITE.primaryColor}40)`,
                    transform: "rotate(-28deg) scaleX(-1)",
                  }}
                />
                {/* Bottom Left */}
                <img
                  src={SITE.mascots[0]}
                  alt="Mascot"
                  className="absolute pointer-events-none z-0"
                  style={{
                    bottom: "12%",
                    left: "7%",
                    width: "70px",
                    opacity: 0.22,
                    filter: `drop-shadow(0 0 20px ${SITE.accentColor}40)`,
                    transform: "rotate(10deg)",
                  }}
                />
                {/* Bottom Center Left */}
                <img
                  src={SITE.mascots[1] || SITE.mascots[0]}
                  alt="Mascot"
                  className="absolute pointer-events-none z-0"
                  style={{
                    bottom: "5%",
                    left: "23%",
                    width: "55px",
                    opacity: 0.18,
                    filter: `drop-shadow(0 0 20px ${SITE.primaryColor}40)`,
                    transform: "rotate(-15deg)",
                  }}
                />
                {/* Bottom Center Right */}
                <img
                  src={SITE.mascots[2] || SITE.mascots[0]}
                  alt="Mascot"
                  className="absolute pointer-events-none z-0"
                  style={{
                    bottom: "6%",
                    right: "23%",
                    width: "55px",
                    opacity: 0.18,
                    filter: `drop-shadow(0 0 20px ${SITE.accentColor}40)`,
                    transform: "rotate(20deg) scaleX(-1)",
                  }}
                />
                {/* Bottom Right */}
                <img
                  src={SITE.mascots[1] || SITE.mascots[0]}
                  alt="Mascot"
                  className="absolute pointer-events-none z-0"
                  style={{
                    bottom: "14%",
                    right: "7%",
                    width: "70px",
                    opacity: 0.22,
                    filter: `drop-shadow(0 0 20px ${SITE.primaryColor}40)`,
                    transform: "rotate(-12deg) scaleX(-1)",
                  }}
                />
                {/* Bottom Far Right */}
                <img
                  src={SITE.mascots[0]}
                  alt="Mascot"
                  className="absolute pointer-events-none z-0"
                  style={{
                    bottom: "3%",
                    right: "1%",
                    width: "60px",
                    opacity: 0.18,
                    filter: `drop-shadow(0 0 20px ${SITE.accentColor}40)`,
                    transform: "rotate(25deg)",
                  }}
                />

                {/* Center for mobile - slightly visible */}
                <img
                  src={SITE.mascots[0]}
                  alt="Mascot"
                  className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none z-0"
                  style={{
                    width: "200px",
                    opacity: 0.12,
                    filter: `drop-shadow(0 0 30px ${SITE.primaryColor}30)`,
                  }}
                />
              </>
            )}

            {/* Rich gradient overlay with shine effect */}
            <div
              className="absolute inset-0 z-0"
              style={{
                background: `radial-gradient(ellipse at 50% 30%, 
                ${SITE.accentColor}20 0%, 
                transparent 50%,
                ${SITE.primaryColor}15 100%)`,
              }}
            />

            {/* Animated shimmer effect */}
            <div
              className="absolute inset-0 opacity-30 z-0"
              style={{
                background: `linear-gradient(90deg, 
                transparent 0%, 
                ${SITE.accentColor}20 50%, 
                transparent 100%)`,
                animation: "shimmer 3s infinite",
              }}
            />

            {/* 3 Podiums Container - 2nd, 1st, 3rd order */}
            <div className="flex items-end justify-center gap-2 sm:gap-4 relative z-10 max-w-4xl mx-auto">
              {/* 2nd Place */}
              {topThree[1] && (
                <div className="flex-1 max-w-[140px] sm:max-w-[200px]">
                  <div className="relative">
                    {/* Crown/Trophy */}
                    <div className="text-center mb-2">
                      <div className="text-4xl sm:text-5xl">🥈</div>
                    </div>

                    {/* Player Info Card */}
                    <div className="bg-gradient-to-br from-gray-100 to-gray-200 rounded-t-xl p-2 sm:p-3 border-4 border-gray-400 shadow-xl">
                      <div className="text-center mb-2">
                        <div className="text-xs text-gray-600 font-semibold mb-1">
                          2ND PLACE
                        </div>
                        <div className="font-mono text-xs sm:text-sm font-bold text-gray-800 truncate">
                          {topThree[1].maskedPlayerId}
                        </div>
                      </div>
                      <div className="text-center py-2 bg-white/60 rounded-lg mb-2">
                        <div className="text-xs sm:text-sm font-extrabold text-gray-700">
                          {formatNumber(Math.floor(topThree[1].points))}
                        </div>
                      </div>
                      {PRIZES && PRIZES[1] && (
                        <div className="relative">
                          {/* Ribbon Tag */}
                          <div className="absolute -top-3 left-1/2 -translate-x-1/2 z-20">
                            <div className="relative">
                              <div className="bg-gradient-to-r from-yellow-400 via-yellow-300 to-yellow-400 px-3 py-1 rounded-full shadow-lg border-2 border-yellow-500">
                                <div className="text-[9px] sm:text-[10px] font-black text-yellow-900 whitespace-nowrap">
                                  🏆 PRIZE
                                </div>
                              </div>
                            </div>
                          </div>

                          {/* Gift Box */}
                          <div
                            className="relative mt-2 p-1 rounded-xl shadow-xl overflow-hidden"
                            style={{
                              background: `linear-gradient(135deg, #FEF3C7 0%, #FDE68A 100%)`,
                              border: "3px solid #F59E0B",
                            }}
                          >
                            {/* Sparkles - Top only */}
                            <div className="absolute top-0 right-1 text-yellow-500 text-xs animate-pulse">
                              ✨
                            </div>
                            <div
                              className="absolute top-0 left-1 text-yellow-500 text-xs animate-pulse"
                              style={{ animationDelay: "0.5s" }}
                            >
                              ✨
                            </div>

                            <div className="text-center relative z-10">
                              <div className="text-2xl sm:text-3xl mb-1 animate-bounce-slow">
                                🎁
                              </div>
                              <div className="text-[9px] sm:text-[10px] font-black text-gray-800 leading-tight">
                                {PRIZES[1].reward}
                              </div>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Simple Bottom Border */}
                    <div
                      className="h-1 rounded-b-lg"
                      style={{
                        background:
                          "linear-gradient(90deg, #9CA3AF, #6B7280, #9CA3AF)",
                      }}
                    ></div>
                  </div>
                </div>
              )}

              {/* 1st Place - Tallest */}
              {topThree[0] && (
                <div className="flex-1 max-w-[160px] sm:max-w-[220px] relative">
                  <div className="relative">
                    {/* Crown/Trophy with glow */}
                    <div className="text-center mb-3 relative">
                      <div
                        className="absolute inset-0 blur-xl opacity-50"
                        style={{
                          background: `radial-gradient(circle, ${SITE.accentColor}, transparent)`,
                        }}
                      />
                      <div className="text-5xl sm:text-6xl relative">🏆</div>
                    </div>

                    {/* Player Info Card */}
                    <div
                      className="bg-gradient-to-br from-yellow-100 to-yellow-200 rounded-t-xl p-1 sm:p-4 border-4 shadow-2xl relative overflow-hidden"
                      style={{ borderColor: SITE.accentColor }}
                    >
                      {/* Shine effect */}
                      <div className="absolute top-0 right-0 w-20 h-20 bg-white/30 rounded-full blur-2xl"></div>

                      <div className="text-center mb-2 relative z-10">
                        <div
                          className="text-xs sm:text-sm font-bold mb-1"
                          style={{ color: SITE.primaryColor }}
                        >
                          🥇 CHAMPION
                        </div>
                        <div className="font-mono text-xs sm:text-base font-extrabold text-gray-900 truncate">
                          {topThree[0].maskedPlayerId}
                        </div>
                      </div>
                      <div className="text-center py-2 bg-white/80 rounded-lg mb-2 shadow-md relative z-10">
                        <div
                          className="text-sm sm:text-base font-black"
                          style={{ color: SITE.primaryColor }}
                        >
                          {formatNumber(Math.floor(topThree[0].points))}
                        </div>
                      </div>
                      {PRIZES && PRIZES[0] && (
                        <div className="relative">
                          {/* Grand Prize Ribbon */}
                          <div className="absolute -top-4 left-1/2 -translate-x-1/2 z-20">
                            <div className="relative">
                              <div
                                className="px-4 py-1.5 rounded-full shadow-2xl border-3"
                                style={{
                                  background: `linear-gradient(90deg, ${SITE.primaryColor}, ${SITE.accentColor}, ${SITE.primaryColor})`,
                                  borderColor: SITE.accentColor,
                                }}
                              >
                                <div className="text-[10px] sm:text-xs font-black text-white whitespace-nowrap">
                                  👑 GRAND PRIZE
                                </div>
                              </div>
                              {/* Ribbon tails */}
                              <div
                                className="absolute -bottom-2 left-1 w-0 h-0 border-l-[8px] border-l-transparent border-t-[10px] border-r-[8px] border-r-transparent"
                                style={{ borderTopColor: SITE.primaryColor }}
                              ></div>
                              <div
                                className="absolute -bottom-2 right-1 w-0 h-0 border-l-[8px] border-l-transparent border-t-[10px] border-r-[8px] border-r-transparent"
                                style={{ borderTopColor: SITE.primaryColor }}
                              ></div>
                            </div>
                          </div>

                          {/* Champion Gift Box */}
                          <div
                            className="relative mt-3 p-2 rounded-xl shadow-2xl overflow-hidden"
                            style={{
                              background: `linear-gradient(135deg, ${SITE.primaryColor}20, ${SITE.accentColor}30, ${SITE.primaryColor}20)`,
                              border: `4px solid ${SITE.accentColor}`,
                            }}
                          >
                            {/* Simple Sparkles - Top only */}
                            <div className="absolute top-0 right-1 text-sm animate-pulse">
                              ✨
                            </div>
                            <div
                              className="absolute top-0 left-1 text-sm animate-pulse"
                              style={{ animationDelay: "0.5s" }}
                            >
                              ✨
                            </div>

                            {/* Glow effect */}
                            <div
                              className="absolute inset-0 opacity-20 animate-pulse"
                              style={{
                                background: `radial-gradient(circle at center, ${SITE.accentColor}40, transparent 70%)`,
                              }}
                            ></div>

                            <div className="text-center relative z-10">
                              <div className="text-3xl sm:text-4xl mb-2 animate-bounce-slow">
                                🎁
                              </div>
                              <div className="text-[10px] sm:text-xs font-black text-gray-900 leading-tight px-1">
                                {PRIZES[0].reward}
                              </div>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Simple Bottom Border with Shine */}
                    <div
                      className="h-1.5 rounded-b-lg relative overflow-hidden"
                      style={{
                        background: `linear-gradient(90deg, ${SITE.primaryColor}, ${SITE.accentColor}, ${SITE.primaryColor})`,
                      }}
                    >
                      {/* Shine effect */}
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent animate-shimmer"></div>
                    </div>
                  </div>
                </div>
              )}

              {/* 3rd Place */}
              {topThree[2] && (
                <div className="flex-1 max-w-[140px] sm:max-w-[200px]">
                  <div className="relative">
                    {/* Crown/Trophy */}
                    <div className="text-center mb-2">
                      <div className="text-4xl sm:text-5xl">🥉</div>
                    </div>

                    {/* Player Info Card */}
                    <div className="bg-gradient-to-br from-orange-100 to-orange-200 rounded-t-xl p-2 sm:p-3 border-4 border-orange-400 shadow-xl">
                      <div className="text-center mb-2">
                        <div className="text-xs text-orange-700 font-semibold mb-1">
                          3RD PLACE
                        </div>
                        <div className="font-mono text-xs sm:text-sm font-bold text-orange-900 truncate">
                          {topThree[2].maskedPlayerId}
                        </div>
                      </div>
                      <div className="text-center py-2 bg-white/60 rounded-lg mb-2">
                        <div className="text-xs sm:text-sm font-extrabold text-orange-700">
                          {formatNumber(Math.floor(topThree[2].points))}
                        </div>
                      </div>
                      {PRIZES && PRIZES[2] && (
                        <div className="relative">
                          {/* Ribbon Tag */}
                          <div className="absolute -top-3 left-1/2 -translate-x-1/2 z-20">
                            <div className="relative">
                              <div className="bg-gradient-to-r from-orange-400 via-orange-300 to-orange-400 px-3 py-1 rounded-full shadow-lg border-2 border-orange-500">
                                <div className="text-[9px] sm:text-[10px] font-black text-orange-900 whitespace-nowrap">
                                  🏆 PRIZE
                                </div>
                              </div>
                            </div>
                          </div>

                          {/* Gift Box */}
                          <div
                            className="relative mt-2 p-1 rounded-xl shadow-xl overflow-hidden"
                            style={{
                              background: `linear-gradient(135deg, #FFEDD5 0%, #FED7AA 100%)`,
                              border: "3px solid #F97316",
                            }}
                          >
                            {/* Sparkles - Top only */}
                            <div className="absolute top-0 right-1 text-orange-500 text-xs animate-pulse">
                              ✨
                            </div>
                            <div
                              className="absolute top-0 left-1 text-orange-500 text-xs animate-pulse"
                              style={{ animationDelay: "0.5s" }}
                            >
                              ✨
                            </div>

                            <div className="text-center relative z-10">
                              <div className="text-2xl sm:text-3xl mb-1 animate-bounce-slow">
                                🎁
                              </div>
                              <div className="text-[9px] sm:text-[10px] font-black text-gray-800 leading-tight">
                                {PRIZES[2].reward}
                              </div>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Simple Bottom Border */}
                    <div
                      className="h-1 rounded-b-lg"
                      style={{
                        background:
                          "linear-gradient(90deg, #FB923C, #EA580C, #FB923C)",
                      }}
                    ></div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Header for Rest */}
      {restPlayers.length > 0 && (
        <div
          className="bg-gray-100 px-2 sm:px-4 py-2 sm:py-3 flex items-center border-b-2"
          style={{ borderColor: `${SITE.primaryColor}20` }}
        >
          <div className="w-10 sm:w-16 flex-shrink-0 font-bold text-gray-700 text-[10px] sm:text-sm">
            Rank
          </div>
          <div className="flex-1 px-1 sm:px-3 font-bold text-gray-700 text-[10px] sm:text-sm">
            Player ID
          </div>
          <div className="w-20 sm:w-32 text-right px-1 sm:px-2 font-bold text-gray-700 text-[10px] sm:text-sm hidden sm:block">
            Bet Amount
          </div>
          <div className="w-16 sm:w-24 text-right px-1 sm:px-2 font-bold text-gray-700 text-[10px] sm:text-sm">
            Share
          </div>
          <div className="w-20 sm:w-28 text-right font-bold text-gray-700 text-[10px] sm:text-sm">
            Points
          </div>
        </div>
      )}

      {/* Virtual Scrolling Area */}
      {restPlayers.length > 0 && (
        <div className="relative">
          <div
            ref={scrollContainerRef}
            onScroll={handleScroll}
            className="overflow-y-auto relative"
            style={{
              height: `${CONTAINER_HEIGHT}px`,
            }}
          >
            {/* Spacer for total height */}
            <div
              style={{
                height: `${restPlayers.length * ITEM_HEIGHT}px`,
                position: "relative",
              }}
            >
              {restPlayers
                .slice(visibleRange.start, visibleRange.end)
                .map((player) => renderPlayerRow(player))}
            </div>
          </div>
          {/* Scroll hint overlay - bottom gradient with text */}
          {showScrollHint && restPlayers.length > VISIBLE_ITEMS && (
            <div
              className="absolute bottom-0 left-0 right-0 pointer-events-none"
              style={{
                height: "60px",
                background: `linear-gradient(to top, rgba(255,255,255,0.95), transparent)`,
                display: "flex",
                alignItems: "flex-end",
                justifyContent: "center",
                paddingBottom: "8px",
              }}
            >
              <div
                className="flex items-center gap-2 text-xs font-semibold opacity-70 animate-pulse"
                style={{ color: SITE.primaryColor }}
              >
                <span>↓</span>
                <span>Scroll for more</span>
                <span>↓</span>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Data Update Notice */}
      <div className="p-3 sm:p-4 text-center bg-gray-50/80 border-t border-gray-200">
        <div className="flex flex-col items-center gap-1 text-gray-600">
          <div className="flex items-center gap-2 text-xs sm:text-sm">
            <span className="text-base">⏰</span>
            <p className="text-center">
              <span className="font-semibold">Ranking Data:</span> Updated daily
              at 12:00 PM (UTC+8)
            </p>
          </div>
        </div>
      </div>

      {/* Add custom animations */}
      <style>{`
        @keyframes shimmer {
          0% {
            transform: translateX(-100%);
          }
          100% {
            transform: translateX(200%);
          }
        }
        .animate-shimmer {
          animation: shimmer 3s infinite;
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
          animation: bounce-slow 2s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
};

export default VirtualRanking;

// Weekly Ranking Component
import React, { useRef, useEffect, useState, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { formatNumber } from "../../projects/BettingRankLodibet/api";
import VirtualRanking from "./VirtualRanking";

const WeeklyRanking = ({
  config,
  weekNumber,
  rankings,
  loading,
  error,
  currentWeek,
  selectedWeek,
  onWeekChange,
  getWeekStatus,
  weekPeriods,
  onTotalRankingClick, // New prop for total ranking
  isTotalRanking, // New prop to indicate if showing total ranking
}) => {
  const { SITE, ACTIVITY } = config;
  const weekTabsRef = useRef(null);
  const [showLeftShadow, setShowLeftShadow] = useState(false);
  const [showRightShadow, setShowRightShadow] = useState(true);

  // Check scroll position to show/hide shadows
  const checkScrollPosition = useCallback(() => {
    if (weekTabsRef.current) {
      const container = weekTabsRef.current;
      const scrollLeft = container.scrollLeft;
      const maxScroll = container.scrollWidth - container.offsetWidth;

      setShowLeftShadow(scrollLeft > 10);
      setShowRightShadow(scrollLeft < maxScroll - 10);
    }
  }, []);

  // Auto scroll to selected week (only horizontally, don't affect page scroll)
  useEffect(() => {
    if (weekTabsRef.current && selectedWeek) {
      const container = weekTabsRef.current;
      const selectedButton = container.querySelector(
        `button:nth-child(${selectedWeek})`
      );
      if (selectedButton) {
        const containerWidth = container.offsetWidth;
        const buttonLeft = selectedButton.offsetLeft;
        const buttonWidth = selectedButton.offsetWidth;
        const scrollLeft = buttonLeft - containerWidth / 2 + buttonWidth / 2;

        container.scrollTo({
          left: scrollLeft,
          behavior: "smooth",
        });
      }
    }
  }, [selectedWeek]);

  // Check shadow position on mount and scroll
  useEffect(() => {
    const container = weekTabsRef.current;
    if (container) {
      checkScrollPosition();
      container.addEventListener("scroll", checkScrollPosition);
      window.addEventListener("resize", checkScrollPosition);

      return () => {
        container.removeEventListener("scroll", checkScrollPosition);
        window.removeEventListener("resize", checkScrollPosition);
      };
    }
  }, [checkScrollPosition]);

  return (
    <Card
      className="mb-6 shadow-2xl border-4 overflow-hidden relative"
      style={{
        borderColor: SITE.primaryColor,
        background: "linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)",
      }}
    >
      {/* Decorative corner accents */}
      <div className="absolute top-0 left-0 w-20 h-20 opacity-20">
        <div
          className="absolute top-0 left-0 w-full h-1"
          style={{
            background: `linear-gradient(to right, ${SITE.primaryColor}, transparent)`,
          }}
        ></div>
        <div
          className="absolute top-0 left-0 w-1 h-full"
          style={{
            background: `linear-gradient(to bottom, ${SITE.primaryColor}, transparent)`,
          }}
        ></div>
      </div>
      <div className="absolute top-0 right-0 w-20 h-20 opacity-20">
        <div
          className="absolute top-0 right-0 w-full h-1"
          style={{
            background: `linear-gradient(to left, ${SITE.accentColor}, transparent)`,
          }}
        ></div>
        <div
          className="absolute top-0 right-0 w-1 h-full"
          style={{
            background: `linear-gradient(to bottom, ${SITE.accentColor}, transparent)`,
          }}
        ></div>
      </div>

      {/* Decorative mascot - 使用可用的吉祥物（循环索引） */}
      {SITE.mascots && SITE.mascots.length > 0 && (
        <img
          src={SITE.mascots[Math.min(2, SITE.mascots.length - 1)]}
          alt="Mascot"
          className="absolute -right-4 top-4 w-24 h-24 opacity-15 pointer-events-none z-40"
          style={{
            filter: `drop-shadow(0 0 15px ${SITE.primaryColor})`,
          }}
        />
      )}

      <CardHeader
        className="relative overflow-hidden z-10"
        style={{
          background: `linear-gradient(135deg, ${SITE.primaryColor}30, ${SITE.accentColor}30)`,
          borderBottom: `2px solid ${SITE.primaryColor}80`,
          backdropFilter: "blur(10px)",
          padding: "1rem",
        }}
      >
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-3 text-2xl font-extrabold">
            <div
              className="w-12 h-12 rounded-full flex items-center justify-center text-3xl shadow-lg"
              style={{
                background: `linear-gradient(135deg, ${SITE.primaryColor}, ${SITE.accentColor})`,
              }}
            >
              📊
            </div>
            <span
              className="text-transparent bg-clip-text text-lg"
              style={{
                backgroundImage: `linear-gradient(135deg, ${SITE.primaryColor}, ${SITE.accentColor})`,
              }}
            >
              Christmas Champion Leaderboard
            </span>
          </CardTitle>
          <div className="flex items-center gap-2 bg-white/20 px-4 py-2 rounded-full backdrop-blur-sm">
            <span className="text-white text-sm font-semibold">Live</span>
            <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        {/* Week Selector Tabs - Always visible */}
        <div
          className="bg-white border-b-2"
          style={{ borderBottomColor: `${SITE.primaryColor}20` }}
        >
          <div className="px-4 py-3">
            <div className="flex items-center justify-between gap-2 mb-3">
              <div className="flex items-center gap-2">
                <span className="text-lg">📅</span>
                <h3
                  className="text-sm font-bold"
                  style={{ color: SITE.primaryColor }}
                >
                  Select Week
                </h3>
              </div>
              {/* Total Ranking Button */}
              <button
                onClick={onTotalRankingClick}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg font-semibold text-sm transition-all shadow-md hover:scale-105 ${
                  isTotalRanking ? "shadow-lg" : ""
                }`}
                style={{
                  background: isTotalRanking
                    ? `linear-gradient(135deg, ${SITE.primaryColor}, ${SITE.accentColor})`
                    : "white",
                  borderWidth: "2px",
                  borderStyle: "solid",
                  borderColor: isTotalRanking
                    ? SITE.primaryColor
                    : `${SITE.primaryColor}40`,
                  color: isTotalRanking ? "white" : SITE.primaryColor,
                }}
              >
                <span className="text-base">🏆</span>
                <span className="hidden sm:inline">Total Ranking</span>
                <span className="sm:hidden">Total</span>
              </button>
            </div>
            <div className="relative">
              {/* Left gradient shadow */}
              {showLeftShadow && (
                <div
                  className="absolute left-0 top-0 bottom-2 w-8 pointer-events-none z-10 transition-opacity duration-300"
                  style={{
                    background: `linear-gradient(to right, white, transparent)`,
                  }}
                ></div>
              )}
              {/* Right gradient shadow */}
              {showRightShadow && (
                <div
                  className="absolute right-0 top-0 bottom-2 w-8 pointer-events-none z-10 transition-opacity duration-300"
                  style={{
                    background: `linear-gradient(to left, white, transparent)`,
                  }}
                ></div>
              )}
              <div
                ref={weekTabsRef}
                className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide scroll-smooth"
                style={{
                  scrollbarWidth: "none",
                  msOverflowStyle: "none",
                }}
              >
                {Array.from(
                  { length: ACTIVITY.totalWeeks },
                  (_, i) => i + 1
                ).map((week) => {
                  const isSelected = !isTotalRanking && week === selectedWeek;
                  const isCurrent = week === currentWeek;
                  const isDisabled =
                    week !== 1 &&
                    getWeekStatus &&
                    getWeekStatus(week) === "upcoming";
                  const weekStatus = getWeekStatus ? getWeekStatus(week) : null;
                  const isEnded = weekStatus === "ended";

                  // Format date range
                  const getWeekDateRange = (weekNumber) => {
                    if (!weekPeriods) return "";
                    const weekPeriod = weekPeriods[weekNumber];
                    if (!weekPeriod) return "";
                    const formatDate = (dateStr) => {
                      const date = new Date(dateStr);
                      const month = date.getMonth() + 1;
                      const day = date.getDate();
                      return `${month}/${day}`;
                    };
                    const startDate = formatDate(weekPeriod.start);
                    const endDate = formatDate(weekPeriod.end);
                    return `${startDate}-${endDate}`;
                  };

                  return (
                    <button
                      key={week}
                      onClick={() =>
                        !isDisabled && onWeekChange && onWeekChange(week)
                      }
                      disabled={isDisabled}
                      className={`flex-shrink-0 px-4 py-3 rounded-lg font-semibold transition-all relative ${
                        !isDisabled && "hover:scale-105"
                      } ${isSelected ? "shadow-lg" : "shadow-sm"}`}
                      style={{
                        background: isDisabled
                          ? "#e5e7eb"
                          : isSelected
                          ? `linear-gradient(135deg, ${SITE.primaryColor}, ${SITE.accentColor})`
                          : "white",
                        borderWidth: "2px",
                        borderStyle: "solid",
                        borderColor: isDisabled
                          ? "#d1d5db"
                          : isSelected
                          ? SITE.primaryColor
                          : `${SITE.primaryColor}40`,
                        color: isDisabled
                          ? "#9ca3af"
                          : isSelected
                          ? "white"
                          : SITE.primaryColor,
                        opacity: isDisabled ? 0.5 : 1,
                        cursor: isDisabled ? "not-allowed" : "pointer",
                        minWidth: "100px",
                      }}
                    >
                      <div className="flex flex-col items-center gap-1">
                        <span className="text-sm font-bold">Week {week}</span>
                        <span
                          className="text-[10px] opacity-75"
                          style={{
                            color: isDisabled
                              ? "#9ca3af"
                              : isSelected
                              ? "rgba(255,255,255,0.9)"
                              : SITE.primaryColor,
                          }}
                        >
                          {getWeekDateRange(week)}
                        </span>
                        {isCurrent && !isDisabled && (
                          <span
                            className="text-[10px] px-2 py-0.5 rounded-full font-bold"
                            style={{
                              backgroundColor: isSelected
                                ? "rgba(255,255,255,0.3)"
                                : `${SITE.accentColor}20`,
                              color: isSelected ? "white" : SITE.accentColor,
                            }}
                          >
                            LIVE
                          </span>
                        )}
                        {isEnded && !isCurrent && (
                          <span
                            className="text-[10px] px-2 py-0.5 rounded-full font-bold"
                            style={{
                              backgroundColor: isSelected
                                ? "rgba(255,255,255,0.3)"
                                : "rgba(107, 114, 128, 0.2)",
                              color: isSelected ? "white" : "#6B7280",
                            }}
                          >
                            Ended
                          </span>
                        )}
                        {isDisabled && (
                          <span className="text-[10px] px-2 py-0.5 rounded-full font-bold bg-gray-300 text-gray-600">
                            🔒
                          </span>
                        )}
                      </div>
                      {isCurrent && !isDisabled && (
                        <span className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-white animate-pulse"></span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="text-center py-12" style={{ minHeight: "550px" }}>
            <div className="animate-pulse flex flex-col items-center gap-3">
              <div
                className="w-16 h-16 border-4 border-t-transparent rounded-full animate-spin"
                style={{
                  borderColor: `${SITE.primaryColor}40`,
                  borderTopColor: "transparent",
                }}
              ></div>
              <p className="text-gray-600 font-medium">Loading rankings...</p>
            </div>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="text-center py-12" style={{ minHeight: "550px" }}>
            <div className="text-6xl mb-3">⚠️</div>
            <p className="text-red-500 font-semibold text-lg">Error: {error}</p>
          </div>
        )}

        {/* Rankings Content */}
        {!loading && !error && rankings && rankings.length > 0 && (
          <div style={{ minHeight: "550px" }}>
            {/* Stats Summary - Only show for weekly rankings, not for total */}
            {!isTotalRanking && (
              <div
                className="bg-gradient-to-r from-blue-50 via-white to-purple-50 p-1 sm:p-6 border-b-4"
                style={{ borderBottomColor: `${SITE.primaryColor}` }}
              >
                <div className="grid grid-cols-2 gap-2 sm:gap-4">
                  <div className="text-center p-2 sm:p-5 bg-white rounded-lg sm:rounded-xl shadow-lg border-2 border-blue-200">
                    <div className="text-[10px] sm:text-xs uppercase tracking-wide text-gray-500 mb-1 sm:mb-2 font-semibold">
                      Total Players
                    </div>
                    <div
                      className="text-lg sm:text-2xl md:text-3xl font-extrabold"
                      style={{ color: SITE.primaryColor }}
                    >
                      {rankings.length.toLocaleString()}
                    </div>
                  </div>
                  <div className="text-center p-2 sm:p-5 bg-white rounded-lg sm:rounded-xl shadow-lg border-2 border-green-200">
                    <div className="text-[10px] sm:text-xs uppercase tracking-wide text-gray-500 mb-1 sm:mb-2 font-semibold">
                      Total Bets
                    </div>
                    <div
                      className="text-lg sm:text-2xl md:text-3xl font-extrabold break-all"
                      style={{ color: SITE.accentColor }}
                    >
                      {formatNumber(
                        rankings
                          .reduce((sum, r) => sum + r.betAmount, 0)
                          .toFixed(0)
                      )}
                    </div>
                  </div>
                  <div className="text-center p-2 sm:p-5 bg-white rounded-lg sm:rounded-xl shadow-lg border-2 border-purple-200 col-span-2">
                    <div className="text-[10px] sm:text-xs uppercase tracking-wide text-gray-500 mb-1 sm:mb-2 font-semibold">
                      Prize Pool
                    </div>
                    <div className="text-lg sm:text-2xl md:text-3xl font-extrabold break-all text-purple-600">
                      {formatNumber(
                        weekPeriods[weekNumber]?.pointsPool
                          ? Math.round(weekPeriods[weekNumber].pointsPool)
                          : 0
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Virtual Rankings */}
            <VirtualRanking
              config={config}
              rankings={rankings}
              showTopThree={isTotalRanking}
            />
          </div>
        )}

        {/* No Data State */}
        {!loading && !error && (!rankings || rankings.length === 0) && (
          <div className="text-center py-16" style={{ minHeight: "550px" }}>
            <div className="text-6xl mb-4">📊</div>
            <p className="text-gray-500 font-medium text-lg">
              No ranking data available yet
            </p>
            <p className="text-gray-400 text-sm mt-2">
              Rankings will appear once betting data is collected
            </p>
          </div>
        )}
      </CardContent>

      {/* Hide scrollbar CSS */}
      <style jsx>{`
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </Card>
  );
};

export default WeeklyRanking;

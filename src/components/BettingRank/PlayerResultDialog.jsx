// Player Result Dialog Component
import React, { useState, useRef, useEffect } from "react";
import { formatNumber } from "../../projects/BettingRankLodibet/api";

const PlayerResultDialog = ({
  config,
  playerData,
  weekNumber,
  isOpen,
  onClose,
  onWeekChange,
  totalWeeks,
  isLoadingWeek,
  currentWeek,
}) => {
  const { SITE } = config;
  const [dragOffset, setDragOffset] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const drawerRef = useRef(null);
  const dragHandleRef = useRef(null);
  const dragHeaderRef = useRef(null);
  const startYRef = useRef(0);
  const currentYRef = useRef(0);

  // Week tabs navigation
  const weekSelectorRef = useRef(null);
  const weekTabsRef = useRef(null);

  // Reset drag state when dialog closes (Hook must be at top level)
  useEffect(() => {
    if (!isOpen) {
      setDragOffset(0);
      setIsDragging(false);
    }
  }, [isOpen]);

  // Prevent body scroll when drawer is open
  useEffect(() => {
    if (isOpen) {
      // Save current scroll position
      const scrollY = window.scrollY;
      document.body.style.position = "fixed";
      document.body.style.top = `-${scrollY}px`;
      document.body.style.width = "100%";

      return () => {
        // Restore scroll position
        document.body.style.position = "";
        document.body.style.top = "";
        document.body.style.width = "";
        window.scrollTo(0, scrollY);
      };
    }
  }, [isOpen]);

  // Setup native touch events to prevent passive listener issue
  useEffect(() => {
    const handleElement = dragHandleRef.current;
    const headerElement = dragHeaderRef.current;

    if (!handleElement || !headerElement) return;

    const handleTouchStartNative = (e) => {
      // Only enable on mobile
      if (window.innerWidth >= 640) return;

      const touch = e.touches[0];
      startYRef.current = touch.clientY;
      currentYRef.current = touch.clientY;
      setIsDragging(true);
    };

    const handleTouchMoveNative = (e) => {
      // Only enable on mobile
      if (window.innerWidth >= 640) return;
      if (startYRef.current === 0) return;

      const touch = e.touches[0];
      currentYRef.current = touch.clientY;
      const deltaY = currentYRef.current - startYRef.current;

      // Only allow dragging down (positive offset)
      if (deltaY > 0) {
        e.preventDefault(); // This works with { passive: false }
        setDragOffset(deltaY);
        setIsDragging(true);
      }
    };

    const handleTouchEndNative = () => {
      // Only enable on mobile
      if (window.innerWidth >= 640) return;

      const finalOffset = dragOffset;
      setIsDragging(false);
      startYRef.current = 0;
      currentYRef.current = 0;

      // If dragged down more than 100px, close drawer
      if (finalOffset > 100) {
        onClose();
      } else {
        // Reset drag offset with animation
        setDragOffset(0);
      }
    };

    // Add event listeners with { passive: false }
    handleElement.addEventListener("touchstart", handleTouchStartNative, {
      passive: false,
    });
    handleElement.addEventListener("touchmove", handleTouchMoveNative, {
      passive: false,
    });
    handleElement.addEventListener("touchend", handleTouchEndNative);

    headerElement.addEventListener("touchstart", handleTouchStartNative, {
      passive: false,
    });
    headerElement.addEventListener("touchmove", handleTouchMoveNative, {
      passive: false,
    });
    headerElement.addEventListener("touchend", handleTouchEndNative);

    return () => {
      handleElement.removeEventListener("touchstart", handleTouchStartNative);
      handleElement.removeEventListener("touchmove", handleTouchMoveNative);
      handleElement.removeEventListener("touchend", handleTouchEndNative);

      headerElement.removeEventListener("touchstart", handleTouchStartNative);
      headerElement.removeEventListener("touchmove", handleTouchMoveNative);
      headerElement.removeEventListener("touchend", handleTouchEndNative);
    };
  }, [dragOffset, onClose]);

  // Auto scroll to selected week on mount or week change
  useEffect(() => {
    if (weekTabsRef.current && isOpen) {
      const container = weekTabsRef.current;
      const selectedTab = container.querySelector(
        `[data-week="${weekNumber}"]`
      );
      if (selectedTab) {
        const containerWidth = container.offsetWidth;
        const tabLeft = selectedTab.offsetLeft;
        const tabWidth = selectedTab.offsetWidth;
        const scrollTo = tabLeft - containerWidth / 2 + tabWidth / 2;
        container.scrollTo({ left: scrollTo, behavior: "smooth" });
      }
    }
  }, [weekNumber, isOpen]);

  // Get rank medal
  const getRankMedal = (rank) => {
    if (rank === 1) return "🥇";
    if (rank === 2) return "🥈";
    if (rank === 3) return "🥉";
    return "🏅";
  };

  // Early return after all hooks
  if (!isOpen || !playerData) return null;

  // Calculate opacity based on drag offset
  const backdropOpacity =
    dragOffset > 0 ? Math.max(0.3, 0.8 - dragOffset / 300) : 0.8;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 backdrop-blur-sm z-50 animate-fade-in"
        style={{
          backgroundColor: `rgba(0, 0, 0, ${backdropOpacity})`,
          transition: isDragging ? "none" : "background-color 0.3s ease-out",
        }}
        onClick={onClose}
      ></div>

      {/* Drawer - Mobile: bottom sheet, Desktop: centered dialog */}
      <div
        ref={drawerRef}
        className="fixed bottom-0 left-0 right-0 sm:inset-auto sm:left-1/2 sm:top-1/2 sm:-translate-x-1/2 sm:-translate-y-1/2 sm:w-full sm:max-w-2xl z-50 animate-slide-up-drawer sm:animate-slide-up"
        style={{
          transform: dragOffset > 0 ? `translateY(${dragOffset}px)` : undefined,
          transition: isDragging ? "none" : "transform 0.3s ease-out",
        }}
      >
        <div
          className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-t-3xl sm:rounded-2xl shadow-2xl border-t-4 sm:border-4 overflow-hidden max-h-[90vh] flex flex-col"
          style={{ borderColor: SITE.primaryColor }}
        >
          {/* Sticky Header with Close Button - Always visible at top */}
          <div
            className="sticky top-0 z-10 flex-shrink-0"
            style={{
              background: `linear-gradient(135deg, ${SITE.primaryColor}, ${SITE.accentColor})`,
            }}
          >
            {/* Drag Handle for mobile - draggable */}
            <div
              ref={dragHandleRef}
              className="flex justify-center pt-3 pb-2 sm:hidden cursor-grab active:cursor-grabbing select-none"
            >
              <div
                className={`w-12 rounded-full transition-all ${
                  isDragging ? "h-2 bg-white/70" : "h-1.5 bg-white/40"
                }`}
              ></div>
            </div>

            {/* Header content - also draggable on mobile */}
            <div className="relative p-4 sm:p-6 overflow-hidden">
              {/* Mascot decoration - right side */}
              {SITE.mascots && SITE.mascots[0] && (
                <img
                  src={SITE.mascots[0]}
                  alt="Mascot"
                  className="absolute -right-2 -bottom-2 sm:right-0 sm:bottom-0 w-20 h-20 sm:w-24 sm:h-24 opacity-20 pointer-events-none z-0"
                  style={{
                    filter: `drop-shadow(0 0 10px ${SITE.primaryColor}80)`,
                  }}
                />
              )}

              {/* Close Button - Fixed at top right, no overlap */}
              <button
                onClick={onClose}
                onTouchStart={(e) => e.stopPropagation()}
                className="absolute top-2 right-2 sm:top-4 sm:right-4 w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-black/30 hover:bg-black/50 flex items-center justify-center text-white text-2xl sm:text-3xl font-bold transition-all shadow-lg z-20 cursor-pointer"
                style={{ lineHeight: "1", touchAction: "auto" }}
                aria-label="Close"
              >
                ×
              </button>

              {/* Header info with padding for close button - draggable area */}
              <div
                ref={dragHeaderRef}
                className="flex items-center gap-2 sm:gap-4 pr-10 sm:pr-12 relative z-10"
              >
                <div className="text-3xl sm:text-4xl md:text-5xl flex-shrink-0">
                  {getRankMedal(playerData.rank)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-xs sm:text-sm text-white/80 mb-1">
                    Player ID
                  </div>
                  <div className="text-base sm:text-xl md:text-2xl font-bold text-white font-mono break-all">
                    {playerData.maskedPlayerId}
                  </div>
                </div>
                <div className="text-right flex-shrink-0">
                  <div className="text-xs sm:text-sm text-white/80 mb-1">
                    Rank
                  </div>
                  <div className="text-xl sm:text-2xl md:text-3xl font-extrabold text-white">
                    #{playerData.rank}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Week Tabs Selector - Independent Section Below Header */}
          <div
            ref={weekSelectorRef}
            className="flex-shrink-0 relative border-b-2 border-gray-700 bg-gray-800/50"
          >
            {/* Week Tabs Container */}
            <div
              ref={weekTabsRef}
              className="flex overflow-x-auto scrollbar-hide py-3 px-2 gap-2"
              style={{
                scrollbarWidth: "none",
                msOverflowStyle: "none",
                WebkitOverflowScrolling: "touch",
              }}
            >
              {Array.from({ length: totalWeeks || 0 }, (_, i) => i + 1).map(
                (week) => {
                  const isSelected = week === weekNumber;
                  const isCurrentWeek = week === currentWeek;
                  const isFutureWeek = week > currentWeek;
                  const isDisabled = isLoadingWeek || isFutureWeek;

                  return (
                    <button
                      key={week}
                      data-week={week}
                      onClick={() =>
                        !isDisabled && onWeekChange && onWeekChange(week)
                      }
                      disabled={isDisabled}
                      className={`
                      flex-shrink-0 px-6 py-2.5 rounded-lg font-semibold text-sm
                      transition-all duration-300 whitespace-nowrap relative
                      ${
                        isSelected
                          ? `text-white shadow-lg transform scale-105 z-10`
                          : isFutureWeek
                          ? "bg-gray-700/30 text-gray-600 cursor-not-allowed opacity-50"
                          : "bg-gray-700/80 text-gray-300 hover:bg-gray-600 hover:text-white hover:scale-102"
                      }
                    `}
                      style={
                        isSelected
                          ? {
                              background: `linear-gradient(135deg, ${SITE.primaryColor}, ${SITE.accentColor})`,
                              boxShadow: `0 0 20px ${SITE.primaryColor}60`,
                            }
                          : {}
                      }
                    >
                      <span className="flex items-center gap-2">
                        {isSelected && <span className="text-lg">🎯</span>}
                        {isFutureWeek && <span className="text-base">🔒</span>}
                        <span className={isCurrentWeek ? "font-bold" : ""}>
                          Week {week}
                        </span>
                        {isCurrentWeek && (
                          <span
                            className="absolute -top-2 -right-2 px-1.5 py-0.5 text-[10px] font-bold rounded animate-pulse uppercase"
                            style={{
                              backgroundColor: "#ef4444",
                              color: "white",
                              boxShadow: "0 0 10px rgba(239, 68, 68, 0.6)",
                            }}
                          >
                            LIVE
                          </span>
                        )}
                      </span>
                    </button>
                  );
                }
              )}
            </div>

            {/* Gradient Overlays for scroll indication */}
            <div className="absolute left-0 top-0 bottom-0 w-8 bg-gradient-to-r from-gray-800/90 to-transparent pointer-events-none" />
            <div className="absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-gray-800/90 to-transparent pointer-events-none" />
          </div>

          {/* Scrollable Content */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 relative">
            {/* Loading Overlay */}
            {isLoadingWeek && (
              <div className="absolute inset-0 bg-gray-900/80 backdrop-blur-sm z-50 flex items-center justify-center">
                <div className="text-center">
                  <div className="relative w-16 h-16 mx-auto mb-4">
                    <div
                      className="absolute inset-0 rounded-full border-4 border-transparent animate-spin"
                      style={{
                        borderTopColor: SITE.primaryColor,
                        borderRightColor: SITE.accentColor,
                      }}
                    ></div>
                    <div
                      className="absolute inset-2 rounded-full border-4 border-transparent animate-spin"
                      style={{
                        borderBottomColor: SITE.accentColor,
                        borderLeftColor: SITE.primaryColor,
                        animationDirection: "reverse",
                        animationDuration: "1s",
                      }}
                    ></div>
                  </div>
                  <p className="text-white font-semibold text-lg">Loading...</p>
                  <p className="text-white/60 text-sm mt-2">
                    Fetching Week {weekNumber} data
                  </p>
                </div>
              </div>
            )}

            {/* Current Week Data */}
            <div className="mb-6">
              <div
                className="flex items-center gap-2 mb-4 pb-2 border-b-2"
                style={{ borderBottomColor: `${SITE.primaryColor}40` }}
              >
                <span className="text-xl sm:text-2xl">🎯</span>
                <h3 className="text-base sm:text-lg font-bold text-white">
                  This Week's Summary
                </h3>
              </div>

              <div className="grid grid-cols-2 gap-3 sm:gap-4">
                {/* Your Bet Amount */}
                <div className="p-4 sm:p-5 bg-gradient-to-br from-orange-900/40 to-orange-800/20 rounded-xl border-2 border-orange-500/30">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-xl sm:text-2xl">💰</span>
                    <div className="text-[10px] sm:text-xs text-orange-300 font-semibold uppercase">
                      Your Bet Amount
                    </div>
                  </div>
                  <div
                    className="text-lg sm:text-2xl md:text-3xl font-extrabold break-all"
                    style={{ color: SITE.primaryColor }}
                  >
                    {formatNumber(playerData.betAmount.toFixed(0))}
                  </div>
                </div>

                {/* Your Share */}
                <div className="p-4 sm:p-5 bg-gradient-to-br from-purple-900/40 to-purple-800/20 rounded-xl border-2 border-purple-500/30">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-xl sm:text-2xl">📊</span>
                    <div className="text-[10px] sm:text-xs text-purple-300 font-semibold uppercase">
                      Your Share
                    </div>
                  </div>
                  <div className="text-lg sm:text-2xl md:text-3xl font-extrabold text-purple-400">
                    {playerData.percentage}%
                  </div>
                </div>

                {/* Expected Points */}
                <div className="p-4 sm:p-5 bg-gradient-to-br from-green-900/40 to-green-800/20 rounded-xl border-2 border-green-500/30">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-xl sm:text-2xl">⭐</span>
                    <div className="text-[10px] sm:text-xs text-green-300 font-semibold uppercase">
                      Expected Points
                    </div>
                  </div>
                  <div className="text-lg sm:text-2xl md:text-3xl font-extrabold text-green-400">
                    {formatNumber(Math.floor(playerData.points))}
                  </div>
                </div>

                {/* Current Rank */}
                <div className="p-4 sm:p-5 bg-gradient-to-br from-yellow-900/40 to-yellow-800/20 rounded-xl border-2 border-yellow-500/30">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-xl sm:text-2xl">🏆</span>
                    <div className="text-[10px] sm:text-xs text-yellow-300 font-semibold uppercase">
                      Current Rank
                    </div>
                  </div>
                  <div
                    className="text-lg sm:text-2xl md:text-3xl font-extrabold"
                    style={{ color: SITE.accentColor }}
                  >
                    #{playerData.rank}
                  </div>
                </div>
              </div>
            </div>

            {/* Cumulative Data */}
            {playerData.cumulative && (
              <div className="mb-4">
                <div
                  className="flex items-center gap-2 mb-4 pb-2 border-b-2"
                  style={{ borderBottomColor: `${SITE.primaryColor}40` }}
                >
                  <span className="text-xl sm:text-2xl">📊</span>
                  <h3 className="text-base sm:text-lg font-bold text-white">
                    Overall Summary
                  </h3>
                </div>

                <div className="grid grid-cols-2 gap-3 sm:gap-4">
                  {/* Total Bets */}
                  <div className="p-4 sm:p-5 bg-gradient-to-br from-blue-900/40 to-blue-800/20 rounded-xl border-2 border-blue-500/30">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-lg sm:text-xl">💵</span>
                      <div className="text-[10px] sm:text-xs text-blue-300 font-semibold">
                        Total Bets
                      </div>
                    </div>
                    <div className="text-base sm:text-xl font-bold text-blue-400 break-all">
                      {formatNumber(playerData.cumulative.totalBet.toFixed(0))}
                    </div>
                  </div>

                  {/* Your Overall Share */}
                  <div className="p-4 sm:p-5 bg-gradient-to-br from-purple-900/40 to-purple-800/20 rounded-xl border-2 border-purple-500/30">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-lg sm:text-xl">📊</span>
                      <div className="text-[10px] sm:text-xs text-purple-300 font-semibold">
                        Your Overall Share
                      </div>
                    </div>
                    <div className="text-base sm:text-xl font-bold text-purple-400">
                      {/* Calculate overall share if available */}
                      {playerData.percentage}%
                    </div>
                  </div>

                  {/* Total Points Earned */}
                  <div className="p-4 sm:p-5 bg-gradient-to-br from-green-900/40 to-green-800/20 rounded-xl border-2 border-green-500/30">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-lg sm:text-xl">🌟</span>
                      <div className="text-[10px] sm:text-xs text-green-300 font-semibold">
                        Total Points Earned
                      </div>
                    </div>
                    <div className="text-base sm:text-xl font-bold text-green-400">
                      {formatNumber(
                        Math.floor(playerData.cumulative.totalPoints)
                      )}
                    </div>
                  </div>

                  {/* Best Rank */}
                  <div className="p-4 sm:p-5 bg-gradient-to-br from-yellow-900/40 to-yellow-800/20 rounded-xl border-2 border-yellow-500/30">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-lg sm:text-xl">🥇</span>
                      <div className="text-[10px] sm:text-xs text-yellow-300 font-semibold">
                        Best Rank
                      </div>
                    </div>
                    <div className="text-base sm:text-xl font-bold text-yellow-400">
                      #{playerData.cumulative.bestRank}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Motivation Message */}
            <div
              className="p-4 rounded-xl relative overflow-hidden"
              style={{
                background: `linear-gradient(135deg, ${SITE.primaryColor}20, ${SITE.accentColor}20)`,
                border: `2px solid ${SITE.primaryColor}40`,
              }}
            >
              <div className="flex items-center gap-3 relative z-10">
                <span className="text-2xl sm:text-3xl">🎄</span>
                <div>
                  <p className="font-bold text-white text-sm sm:text-base mb-1">
                    keep going
                  </p>
                  <p className="text-xs sm:text-sm text-white/80 flex items-center gap-1">
                    <span>🎅</span>
                    Santa's on his way with your Christmas rewards!
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Animations */}
      <style>{`
        @keyframes fade-in {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes slide-up {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        @keyframes slide-up-drawer {
          from {
            transform: translateY(100%);
          }
          to {
            transform: translateY(0);
          }
        }
        .animate-fade-in {
          animation: fade-in 0.2s ease-out;
        }
        .animate-slide-up {
          animation: slide-up 0.3s ease-out;
        }
        .animate-slide-up-drawer {
          animation: slide-up-drawer 0.3s cubic-bezier(0.32, 0.72, 0, 1);
        }
        
        /* Hide scrollbar */
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        
        /* Hover scale effect for tabs */
        .hover\\:scale-102:hover {
          transform: scale(1.02);
        }
        
        /* Smooth scrolling for mobile */
        @media (max-width: 640px) {
          .overflow-y-auto {
            -webkit-overflow-scrolling: touch;
          }
        }
      `}</style>
    </>
  );
};

export default PlayerResultDialog;

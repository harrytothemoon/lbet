// Week Selector Component
import React from "react";
import { Button } from "../ui/button";

const WeekSelector = ({
  config,
  currentWeek,
  selectedWeek,
  onWeekChange,
  getWeekStatus,
  weekPeriods,
}) => {
  const { SITE, ACTIVITY } = config;

  const weeks = Array.from({ length: ACTIVITY.totalWeeks }, (_, i) => i + 1);

  // Check if week is disabled (upcoming, but Week 1 is always enabled)
  const isWeekDisabled = (weekNumber) => {
    if (weekNumber === 1) return false; // Week 1 is always enabled
    const status = getWeekStatus(weekNumber);
    return status === "upcoming";
  };

  // Format date range for display (MM/DD-MM/DD)
  const getWeekDateRange = (weekNumber) => {
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
    return `(${startDate}-${endDate})`;
  };

  return (
    <div
      className="mb-6 bg-white rounded-xl shadow-lg p-4 sm:p-6 border-2"
      style={{ borderColor: `${SITE.primaryColor}20` }}
    >
      <div className="flex items-center gap-2 mb-3 sm:mb-4">
        <span className="text-xl sm:text-2xl">📅</span>
        <h3
          className="text-base sm:text-xl font-bold"
          style={{ color: SITE.primaryColor }}
        >
          Select Week
        </h3>
      </div>
      <div className="gap-2 sm:gap-3 grid grid-cols-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
        {weeks.map((week) => {
          const isSelected = week === selectedWeek;
          const isCurrent = week === currentWeek;
          const isDisabled = isWeekDisabled(week);
          const weekStatus = getWeekStatus(week);
          const isEnded = weekStatus === "ended";

          return (
            <Button
              key={week}
              onClick={() => !isDisabled && onWeekChange(week)}
              variant={isSelected ? "default" : "outline"}
              size="sm"
              disabled={isDisabled}
              className={`min-w-[70px] sm:min-w-[90px] h-auto py-2 font-semibold relative transition-all text-xs sm:text-sm ${
                !isDisabled && "transform hover:scale-105"
              } ${isSelected ? "shadow-lg" : "shadow-sm hover:shadow-md"} ${
                isDisabled ? "opacity-40 cursor-not-allowed" : ""
              }`}
              style={{
                background: isDisabled
                  ? "#e5e7eb"
                  : isSelected
                  ? `linear-gradient(135deg, ${SITE.primaryColor}, ${SITE.accentColor})`
                  : "white",
                borderWidth: "2px",
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
              }}
            >
              <span className="flex flex-col items-center gap-0.5">
                <span className="text-xs sm:text-sm font-bold">
                  Week {week}
                </span>
                <span
                  className="text-[9px] sm:text-[10px] opacity-75 font-normal"
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
                    className="text-[10px] sm:text-xs px-1.5 sm:px-2 py-0.5 rounded-full font-bold mt-0.5"
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
                    className="text-[10px] sm:text-xs px-1.5 sm:px-2 py-0.5 rounded-full font-bold mt-0.5"
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
                  <span className="text-[10px] sm:text-xs px-1.5 sm:px-2 py-0.5 rounded-full font-bold bg-gray-300 text-gray-600 mt-0.5">
                    Coming
                  </span>
                )}
              </span>
              {isCurrent && !isDisabled && (
                <span className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-white animate-pulse"></span>
              )}
            </Button>
          );
        })}
      </div>
      <p className="text-xs text-gray-500 mt-4 text-center">
        💡 Select a week to view its rankings and participate
      </p>
    </div>
  );
};

export default WeekSelector;

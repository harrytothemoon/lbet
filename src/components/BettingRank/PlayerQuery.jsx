// Player Query Component
import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Input } from "../ui/input";
import { Button } from "../ui/button";

const PlayerQuery = ({ config, onQuery }) => {
  const { SITE } = config;
  const [playerId, setPlayerId] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!playerId.trim()) {
      alert("Please enter a player ID");
      return;
    }

    setLoading(true);
    try {
      await onQuery(playerId.trim());
    } finally {
      setLoading(false);
    }
  };

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

      <CardHeader
        className="relative p-2 sm:p-6"
        style={{
          background: `linear-gradient(135deg, ${SITE.primaryColor}30, ${SITE.accentColor}30)`,
          borderBottom: `2px solid ${SITE.primaryColor}80`,
          backdropFilter: "blur(10px)",
        }}
      >
        {/* Decorative mascot in corner */}
        {SITE.mascots && SITE.mascots[1] && (
          <img
            src={SITE.mascots[1]}
            alt="Mascot"
            className="absolute -right-4 -bottom-4 w-20 h-20 opacity-20 pointer-events-none z-0"
            style={{
              filter: `drop-shadow(0 0 10px ${SITE.primaryColor})`,
            }}
          />
        )}

        <CardTitle className="flex items-center justify-center gap-2 sm:gap-3 text-base sm:text-xl md:text-2xl font-extrabold relative z-10">
          <div
            className="w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center text-2xl sm:text-3xl shadow-lg flex-shrink-0"
            style={{
              background: `linear-gradient(135deg, ${SITE.primaryColor}, ${SITE.accentColor})`,
            }}
          >
            🔍
          </div>
          <span
            className="text-transparent bg-clip-text text-center"
            style={{
              backgroundImage: `linear-gradient(135deg, ${SITE.primaryColor}, ${SITE.accentColor})`,
            }}
          >
            Check my points
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-4 sm:pt-8 pb-4 sm:pb-8 px-4 sm:px-6 relative">
        {/* Glowing effect background */}
        <div
          className="absolute inset-0 opacity-5"
          style={{
            background: `radial-gradient(circle at 50% 50%, ${SITE.primaryColor}, transparent 70%)`,
          }}
        ></div>

        <form
          onSubmit={handleSubmit}
          className="flex flex-col sm:flex-row gap-3 sm:gap-4 relative z-10"
        >
          <div className="flex-1 relative group">
            <Input
              type="text"
              placeholder="Enter Player ID"
              value={playerId}
              onChange={(e) => setPlayerId(e.target.value)}
              className="h-12 sm:h-14 text-base border-3 focus:ring-2 transition-all font-semibold bg-white/10 text-white placeholder:text-gray-400"
              style={{
                borderColor: `${SITE.primaryColor}60`,
                boxShadow: `0 0 20px ${SITE.primaryColor}20`,
                fontSize: "16px", // Prevent iOS zoom on focus
              }}
              disabled={loading}
            />
            <div
              className="absolute right-3 sm:right-4 top-1/2 -translate-y-1/2 w-6 h-6 sm:w-8 sm:h-8 rounded-full flex items-center justify-center text-lg sm:text-xl"
              style={{
                background: `linear-gradient(135deg, ${SITE.primaryColor}20, ${SITE.accentColor}20)`,
              }}
            >
              👤
            </div>
            {/* Animated border on focus */}
            <div
              className="absolute inset-0 rounded-md opacity-0 group-focus-within:opacity-100 transition-opacity pointer-events-none"
              style={{
                boxShadow: `0 0 30px ${SITE.primaryColor}60`,
              }}
            ></div>
          </div>
          <Button
            type="submit"
            disabled={loading}
            className="h-12 sm:h-14 px-6 sm:px-10 font-bold text-sm sm:text-base md:text-lg shadow-2xl hover:shadow-3xl transition-all transform hover:scale-105 relative overflow-hidden whitespace-nowrap"
            style={{
              background: loading
                ? "#666"
                : `linear-gradient(135deg, ${SITE.primaryColor}, ${SITE.accentColor})`,
              color: "white",
              border: `2px solid ${SITE.accentColor}`,
            }}
          >
            {/* Shine effect */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent transform -skew-x-12 animate-shimmer"></div>

            {loading ? (
              <span className="flex items-center gap-2 relative z-10">
                <span className="animate-spin text-xl sm:text-2xl">⏳</span>
                <span className="text-xs sm:text-base">SEARCHING...</span>
              </span>
            ) : (
              <span className="flex items-center gap-2 relative z-10">
                <span className="text-xl sm:text-2xl">🎯</span>
                <span className="text-xs sm:text-base">SEARCH</span>
              </span>
            )}
          </Button>
        </form>

        {/* Info box with casino style */}
        <div
          className="mt-4 sm:mt-6 p-3 sm:p-4 rounded-lg relative overflow-hidden"
          style={{
            background: `linear-gradient(135deg, ${SITE.primaryColor}15, ${SITE.accentColor}15)`,
            border: `1px solid ${SITE.primaryColor}30`,
          }}
        >
          <div className="flex items-center gap-2 sm:gap-3 relative z-10">
            <span className="text-xl sm:text-2xl flex-shrink-0">💡</span>
            <p className="text-xs sm:text-sm font-semibold text-white/80">
              Please enter your ID to check your current points.
            </p>
          </div>
          {/* Animated dots pattern */}
          <div
            className="absolute inset-0 opacity-10"
            style={{
              backgroundImage: `radial-gradient(${SITE.primaryColor} 1px, transparent 1px)`,
              backgroundSize: "20px 20px",
            }}
          ></div>
        </div>
      </CardContent>

      {/* Add shimmer animation */}
      <style jsx>{`
        @keyframes shimmer {
          0% {
            transform: translateX(-100%) skewX(-12deg);
          }
          100% {
            transform: translateX(200%) skewX(-12deg);
          }
        }
        .animate-shimmer {
          animation: shimmer 3s infinite;
        }
      `}</style>
    </Card>
  );
};

export default PlayerQuery;

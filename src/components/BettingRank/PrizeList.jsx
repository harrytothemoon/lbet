// Prize List Component
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";

const PrizeList = ({ config }) => {
  const { SITE, PRIZES } = config;

  const getPrizeGradient = (index) => {
    if (index === 0) return "from-yellow-100 via-yellow-50 to-white";
    if (index === 1) return "from-gray-100 via-gray-50 to-white";
    if (index === 2) return "from-orange-100 via-orange-50 to-white";
    return "from-blue-50 to-white";
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

      {/* Decorative mascot - 使用可用的吉祥物（循环索引） */}
      {SITE.mascots && SITE.mascots.length > 0 && (
        <img
          src={SITE.mascots[Math.min(1, SITE.mascots.length - 1)]}
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
        <CardTitle className="flex items-center gap-2 sm:gap-3 text-lg sm:text-2xl font-extrabold">
          <div
            className="w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center text-2xl sm:text-3xl shadow-lg"
            style={{
              background: `linear-gradient(135deg, ${SITE.primaryColor}, ${SITE.accentColor})`,
            }}
          >
            🎁
          </div>
          <span
            className="text-transparent bg-clip-text"
            style={{
              backgroundImage: `linear-gradient(135deg, ${SITE.primaryColor}, ${SITE.accentColor})`,
            }}
          >
            Gift Hunter Rewards
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent className="p-2 bg-gradient-to-br from-white to-gray-50">
        <div className="space-y-4">
          {PRIZES.map((item, index) => (
            <div
              key={index}
              className={`relative flex items-center justify-between p-2 rounded-xl border-2 shadow-md hover:shadow-lg transition-all transform hover:scale-102 bg-gradient-to-r ${getPrizeGradient(
                index
              )}`}
              style={{
                borderColor:
                  index < 3
                    ? `${SITE.primaryColor}40`
                    : `${SITE.primaryColor}20`,
              }}
            >
              {/* Rank Badge */}
              <div className="flex items-center gap-4 flex-1">
                <div
                  className="flex-shrink-0 w-16 h-16 rounded-full flex items-center justify-center text-3xl shadow-lg border-4 border-white"
                  style={{
                    background:
                      index < 3
                        ? `linear-gradient(135deg, ${SITE.primaryColor}, ${SITE.accentColor})`
                        : "#f3f4f6",
                  }}
                >
                  {item.prize.split(" ")[0]}
                </div>

                <div className="flex-1">
                  <div className="font-bold text-base lg:text-lg text-gray-800 mb-1">
                    {item.prize}
                  </div>
                  <div className="text-sm lg:text-base text-gray-600 font-medium">
                    {item.reward}
                  </div>
                </div>
              </div>

              {/* Special Badge for Top 3 */}
              {index < 3 && (
                <div
                  className="absolute -top-2 -right-2 px-3 py-1 rounded-full text-xs font-bold text-white shadow-lg"
                  style={{ backgroundColor: SITE.accentColor }}
                >
                  TOP {index + 1}
                </div>
              )}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default PrizeList;

// Terms & Conditions Component
import React, { useState } from "react";
import { Card, CardContent } from "../ui/card";

const TermsConditions = ({ config }) => {
  const { SITE, RULES } = config;
  const [isRulesOpen, setIsRulesOpen] = useState(false);

  return (
    <Card
      className="mb-6 shadow-xl border-2"
      style={{ borderColor: SITE.primaryColor }}
    >
      <CardContent className="p-2 bg-gradient-to-br from-white to-gray-50">
        {/* Activity Rules with collapsible functionality */}
        <div className="bg-white rounded-xl shadow-md overflow-hidden">
          <button
            onClick={() => setIsRulesOpen(!isRulesOpen)}
            className="w-full flex items-center justify-between gap-2 p-4 sm:p-6 hover:bg-gray-50 transition-colors"
          >
            <div className="flex items-center gap-2">
              <span className="text-xl sm:text-2xl">📜</span>
              <h3
                className="font-bold text-lg sm:text-xl"
                style={{ color: SITE.primaryColor }}
              >
                Terms & Conditions
              </h3>
            </div>
            <span
              className="text-xl sm:text-2xl transition-transform duration-300"
              style={{
                transform: isRulesOpen ? "rotate(180deg)" : "rotate(0deg)",
              }}
            >
              ▼
            </span>
          </button>

          <div
            className={`overflow-hidden transition-all duration-300 ${
              isRulesOpen ? "max-h-[2000px] opacity-100" : "max-h-0 opacity-0"
            }`}
          >
            <div className="px-4 sm:px-6 pb-4 sm:pb-6 space-y-3 sm:space-y-4">
              {RULES.map((rule, index) => (
                <div
                  key={index}
                  className="p-3 sm:p-4 rounded-lg bg-gray-50 border-l-4"
                  style={{ borderLeftColor: SITE.primaryColor }}
                >
                  <div className="flex items-start gap-2 sm:gap-3 mb-2">
                    <span
                      className="flex-shrink-0 w-6 h-6 sm:w-7 sm:h-7 rounded-full flex items-center justify-center text-white text-xs sm:text-sm font-bold"
                      style={{ backgroundColor: SITE.primaryColor }}
                    >
                      {index + 1}
                    </span>
                    <div className="flex-1">
                      <h4 className="font-bold text-base sm:text-lg text-gray-800 mb-1 sm:mb-2">
                        {rule.title}
                      </h4>
                      <p className="text-sm sm:text-base text-gray-700 leading-relaxed mb-2">
                        {rule.content}
                      </p>
                      {rule.example && (
                        <div className="mt-2 sm:mt-3 p-2 sm:p-3 bg-white rounded-md border border-gray-200">
                          <p className="text-xs sm:text-sm text-gray-600 italic">
                            {rule.example}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default TermsConditions;

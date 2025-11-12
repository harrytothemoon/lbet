// Activity Description Component
import React from "react";
import { Card, CardContent } from "../ui/card";

const ActivityDescription = ({ config }) => {
  const { SITE, ACTIVITY } = config;

  return (
    <Card
      className="mb-6 overflow-hidden shadow-xl border-2"
      style={{ borderColor: SITE.primaryColor }}
    >
      {/* Banner Image Only */}
      {SITE.banner && (
        <div className="w-full overflow-hidden rounded-t-lg">
          <img
            src={SITE.banner}
            alt="Activity Banner"
            className="w-full h-auto object-cover"
            style={{
              display: "block",
            }}
          />
        </div>
      )}

      <CardContent className="p-2 bg-gradient-to-br from-white to-gray-50">
        <div className="space-y-6">
          {/* Activity Description with enhanced styling */}
          <div className="flex flex-col text-center p-2 bg-white rounded-xl shadow-md">
            {/* Event Period */}
            <div className="mb-2">
              <p className="text-sm font-semibold text-gray-600 mb-2">
                Event Period: {ACTIVITY.startDate}-{ACTIVITY.endDate}
              </p>
            </div>

            {/* Activity Description */}
            <div className="space-y-3">
              <p className="text-xs font-normal text-gray-700 leading-relaxed">
                Let's welcome the Ber Months with festive cheer!
              </p>
              <p className="text-xs font-normal text-gray-700 leading-relaxed">
                Place your bets, earn points, and win exciting Christmas gifts.
              </p>
              <p className="text-xs font-normal text-gray-700 leading-relaxed">
                Make this holiday season one you'll never forget! 🎁
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ActivityDescription;

// Hawk API Integration Module
// 通过 AWS Lightsail + Cloudflare Tunnel 代理访问

export const hawkAPI = {
  // Build API URL
  buildUrl(endpoint) {
    // 开发环境：使用本地代理
    // 生产环境：使用 AWS Lightsail + Cloudflare Tunnel
    const isDevelopment = process.env.NODE_ENV === "development";
    const baseUrl = isDevelopment
      ? "/api/hawk"
      : process.env.REACT_APP_HAWK_PROXY_URL || "";

    if (!baseUrl) {
      console.error("REACT_APP_HAWK_PROXY_URL is not configured");
      throw new Error("API proxy URL is not configured");
    }

    return `${baseUrl}${endpoint}`;
  },

  // Generic GET request
  async get(endpoint, params = {}) {
    try {
      const builtUrl = this.buildUrl(endpoint);
      const url = builtUrl.startsWith("http")
        ? new URL(builtUrl)
        : new URL(builtUrl, window.location.origin);

      // 添加查询参数
      Object.keys(params).forEach((key) => {
        if (params[key] !== undefined && params[key] !== null) {
          url.searchParams.append(key, params[key]);
        }
      });

      // 代理服务器会添加认证 headers，前端不需要
      const response = await fetch(url, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP Error: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error("API request failed:", error);
      throw error;
    }
  },

  // Get player bet log summary (for current week real-time data)
  async getPlayerBetLogSummary(account, startTime, endTime, category = "") {
    try {
      const params = {
        account,
        start_time: startTime,
        end_time: endTime,
      };

      if (category) {
        params.category = category;
      }

      const response = await this.get("/partner-api/bet_log_summary", params);

      console.log("getPlayerBetLogSummary response:", response);

      // Calculate total valid bet amount from the response
      let totalValidBet = 0;

      // Check if response has success and data
      if (response && response.success && response.data) {
        const dataContent = response.data.item || response.data;

        // Sum up total_valid_amount from all dates
        if (dataContent && typeof dataContent === "object") {
          Object.values(dataContent).forEach((dateData) => {
            if (dateData && typeof dateData === "object") {
              totalValidBet += dateData.total_valid_amount || 0;
            }
          });
        }

        return {
          success: true,
          totalValidBet: totalValidBet,
          data: dataContent,
          account: response.data.account || account,
        };
      } else if (response && response.item) {
        // Fallback: check old format (response.item directly)
        Object.values(response.item).forEach((dateData) => {
          totalValidBet += dateData.total_valid_amount || 0;
        });

        return {
          success: true,
          totalValidBet: totalValidBet,
          data: response.item,
          account: response.account,
        };
      } else {
        // Player not found or no data
        console.warn("No betting data found in response:", response);
        return {
          success: false,
          error: "Player not found or no betting data",
          totalValidBet: 0,
        };
      }
    } catch (error) {
      console.error("Failed to fetch player bet log summary:", error);
      return {
        success: false,
        error: error.message,
        totalValidBet: 0,
      };
    }
  },
};

// Utility function: Format date
export const formatDate = (date) => {
  const d = new Date(date);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  const hours = String(d.getHours()).padStart(2, "0");
  const minutes = String(d.getMinutes()).padStart(2, "0");
  const seconds = String(d.getSeconds()).padStart(2, "0");

  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
};

// Utility function: Format number
export const formatNumber = (num) => {
  return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
};

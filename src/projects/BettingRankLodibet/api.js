// Lodibet API Integration Module
// 通过 AWS Lightsail + Cloudflare Tunnel 代理访问

export const lodibetAPI = {
  // Build API URL
  buildUrl(endpoint) {
    // 开发环境：使用本地代理
    // 生产环境：使用 AWS Lightsail + Cloudflare Tunnel
    const isDevelopment = process.env.NODE_ENV === "development";
    const baseUrl = isDevelopment
      ? "/api/lodibet"
      : process.env.REACT_APP_LODIBET_PROXY_URL || "";

    if (!baseUrl) {
      console.error("REACT_APP_LODIBET_PROXY_URL is not configured");
      throw new Error("API proxy URL is not configured");
    }

    return `${baseUrl}${endpoint}`;
  },

  // Generic POST request
  async post(endpoint, data) {
    try {
      const url = this.buildUrl(endpoint);

      // 代理服务器会添加认证 headers，前端不需要
      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error(`HTTP Error: ${response.status}`);
      }

      const result = await response.json();
      return result;
    } catch (error) {
      console.error("API POST request failed:", error);
      throw error;
    }
  },

  // Get player bet details (for current week real-time data)
  async getPlayerBetDetail(
    username,
    startTime,
    endTime,
    gameTypeList = [1, 2, 3, 4],
    pageNum = 1,
    pageSize = 1000
  ) {
    try {
      // Build request body
      const body = {
        username,
        gameTypeList,
        startTime,
        endTime,
        pageNum,
        pageSize,
      };

      // 直接使用 post 方法，代理服务器会处理认证
      const response = await this.post("/bet-detail", body);

      // Check actual response structure: { errorCode, success, value }
      if (response && response.success && response.value) {
        // Calculate total bet amount from the response (use betAmount for Lodibet)
        let totalValidBet = 0;

        const apiResult = response.value;

        if (apiResult.data && Array.isArray(apiResult.data)) {
          totalValidBet = apiResult.data.reduce((sum, record) => {
            return sum + (parseFloat(record.betAmount) || 0);
          }, 0);
        }

        return {
          success: true,
          totalValidBet: totalValidBet,
          data: apiResult.data || [],
          total: apiResult.total || 0,
          username: username,
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
      console.error("Failed to fetch player bet details:", error);
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

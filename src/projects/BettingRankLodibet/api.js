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
  // 支持分页，自动获取所有页的数据
  async getPlayerBetDetail(
    username,
    startTime,
    endTime,
    gameTypeList = [1, 2, 3, 4],
    pageNum = 1,
    pageSize = 2500 // 使用最大页面大小减少请求次数
  ) {
    try {
      // 第一步：获取第一页数据，确定总页数
      const firstPageBody = {
        username,
        gameTypeList,
        startTime,
        endTime,
        pageNum: 1,
        pageSize,
      };

      const firstResponse = await this.post("/bet-detail", firstPageBody);

      if (!firstResponse || !firstResponse.success || !firstResponse.value) {
        console.warn("No betting data found in response:", firstResponse);
        return {
          success: false,
          error: "Player not found or no betting data",
          totalValidBet: 0,
        };
      }

      const firstPageResult = firstResponse.value;
      const totalPages = firstPageResult.pagination?.totalPage || 1;

      // 如果只有一页，直接返回
      if (totalPages === 1) {
        const validBet = (firstPageResult.dataList || []).reduce(
          (sum, record) => sum + (parseFloat(record.validBetAmount) || 0),
          0
        );
        return {
          success: true,
          totalValidBet: validBet,
          data: firstPageResult.dataList || [],
          total: firstPageResult.dataList?.length || 0,
          username: username,
        };
      }

      // 第二步：并行请求剩余所有页
      const remainingPages = Array.from(
        { length: totalPages - 1 },
        (_, i) => i + 2
      );

      const remainingRequests = remainingPages.map((pageNum) =>
        this.post("/bet-detail", {
          username,
          gameTypeList,
          startTime,
          endTime,
          pageNum,
          pageSize,
        })
      );

      // 并行执行所有请求
      const remainingResponses = await Promise.all(remainingRequests);

      // 第三步：汇总所有数据
      let allData = firstPageResult.dataList || [];
      let totalValidBet = allData.reduce(
        (sum, record) => sum + (parseFloat(record.validBetAmount) || 0),
        0
      );

      // 累加其他页的数据
      remainingResponses.forEach((response) => {
        if (response && response.success && response.value?.dataList) {
          const pageData = response.value.dataList;
          allData = allData.concat(pageData);
          totalValidBet += pageData.reduce(
            (sum, record) => sum + (parseFloat(record.validBetAmount) || 0),
            0
          );
        }
      });

      return {
        success: true,
        totalValidBet: totalValidBet,
        data: allData,
        total: allData.length,
        username: username,
      };
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

// Proxy configuration for development environment to bypass CORS
const { createProxyMiddleware } = require("http-proxy-middleware");

module.exports = function (app) {
  // Proxy for Lodibet API
  app.use(
    "/api/lodibet",
    createProxyMiddleware({
      target: "https://www.ldb789.com",
      changeOrigin: true,
      pathRewrite: {
        "^/api/lodibet": "/expose_api/player",
      },
      onProxyReq(proxyReq, req, res) {
        // Add authentication headers - 与生产环境 Nginx 配置一致
        proxyReq.setHeader("Host", "www.ldb789.com");
        proxyReq.setHeader("merchantCode", "lodibet");
        proxyReq.setHeader("token", process.env.REACT_APP_LODIBET_API_TOKEN);
        proxyReq.setHeader("lang", "EN");
        proxyReq.setHeader("Content-Type", "application/json");
      },
    })
  );

  // Proxy for Hawk API
  app.use(
    "/api/hawk",
    createProxyMiddleware({
      target: "https://admin.hawkplay.com",
      changeOrigin: true,
      pathRewrite: {
        "^/api/hawk": "/api/v5",
      },
      onProxyReq(proxyReq, req, res) {
        proxyReq.setHeader("PARTNER", "HAW");
        proxyReq.setHeader("SECRET", process.env.REACT_APP_HAWK_API_SECRET);
      },
    })
  );
};

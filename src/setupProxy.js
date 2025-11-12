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
        "^/api/lodibet": "/expose_api",
      },
      onProxyReq: (proxyReq, req, res) => {
        // Log proxy requests for debugging
        console.log("Proxying Lodibet request:", req.method, req.path);
      },
      onError: (err, req, res) => {
        console.error("Proxy error:", err);
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
      onProxyReq: (proxyReq, req, res) => {
        // Add Hawk API headers
        proxyReq.setHeader("PARTNER", "HAW");
        proxyReq.setHeader("SECRET", process.env.REACT_APP_HAWK_API_SECRET);
        console.log("Proxying Hawk request:", req.method, req.path);
      },
      onError: (err, req, res) => {
        console.error("Proxy error:", err);
      },
    })
  );
};

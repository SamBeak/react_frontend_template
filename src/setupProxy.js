const { createProxyMiddleware } = require('http-proxy-middleware');

// 환경별 백엔드 URL 가져오기
const getTargetUrl = () => {
  // 환경변수에서 API URL 읽기
  return process.env.REACT_APP_API_BASE_URL || 'http://localhost:5000';
};

// 프록시 로깅 설정
const createLogger = (prefix) => ({
  info: (msg) => console.log(`[${prefix}] ${msg}`),
  warn: (msg) => console.warn(`[${prefix}] ${msg}`),
  error: (msg) => console.error(`[${prefix}] ${msg}`),
});

module.exports = function(app) {
  const targetUrl = getTargetUrl();
  const logger = createLogger('Proxy');

  // API 프록시 설정
  app.use(
    '/api',
    createProxyMiddleware({
      target: targetUrl,
      changeOrigin: true,
      pathRewrite: { '^/api': '' }, // api 접두사 제거
      logLevel: process.env.NODE_ENV === 'development' ? 'debug' : 'warn',

      // 에러 처리
      onError: (err, req, res) => {
        logger.error(`프록시 에러: ${err.message}`);
        res.writeHead(500, {
          'Content-Type': 'application/json',
        });
        res.end(JSON.stringify({
          error: 'Proxy Error',
          message: process.env.NODE_ENV === 'development'
            ? err.message
            : 'Internal Server Error',
        }));
      },

      // 프록시 요청 전 처리
      onProxyReq: (proxyReq, req, res) => {
        // 개발 환경에서 요청 로깅
        if (process.env.NODE_ENV === 'development') {
          logger.info(`${req.method} ${req.path} → ${targetUrl}${req.path}`);
        }

        // 필요시 커스텀 헤더 추가
        // proxyReq.setHeader('X-Forwarded-For', req.ip);
        // proxyReq.setHeader('X-Request-ID', generateRequestId());
      },

      // 프록시 응답 후 처리
      onProxyRes: (proxyRes, req, res) => {
        // CORS 헤더 추가
        proxyRes.headers['Access-Control-Allow-Origin'] = '*';
        proxyRes.headers['Access-Control-Allow-Credentials'] = 'true';

        // 개발 환경에서 응답 로깅
        if (process.env.NODE_ENV === 'development') {
          logger.info(`${req.method} ${req.path} ← ${proxyRes.statusCode}`);
        }
      },
    })
  );

  // 인증 관련 프록시 (별도 인증 서버 사용시)
  // app.use(
  //   '/auth',
  //   createProxyMiddleware({
  //     target: process.env.REACT_APP_AUTH_DOMAIN || 'http://localhost:3001',
  //     changeOrigin: true,
  //     logLevel: 'debug',
  //     onError: (err, req, res) => {
  //       logger.error(`Auth 프록시 에러: ${err.message}`);
  //       res.writeHead(500, { 'Content-Type': 'application/json' });
  //       res.end(JSON.stringify({ error: 'Auth Proxy Error' }));
  //     },
  //   })
  // );

  // WebSocket 프록시 (Socket.io 등 사용시)
  // app.use(
  //   '/socket.io',
  //   createProxyMiddleware({
  //     target: targetUrl,
  //     changeOrigin: true,
  //     ws: true, // WebSocket 활성화
  //     logLevel: 'debug',
  //   })
  // );

  logger.info(`프록시 설정 완료: /api → ${targetUrl}`);
};

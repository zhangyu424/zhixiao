const { RateLimiterMemory } = require('rate-limiter-flexible');

// 通用API限流器
const apiLimiter = new RateLimiterMemory({
  points: 100, // 100次请求
  duration: 60, // 每60秒
});

// 登录限流器
const loginLimiter = new RateLimiterMemory({
  points: 5, // 5次尝试
  duration: 900, // 每15分钟
  blockDuration: 900, // 阻止15分钟
});

// 文件上传限流器
const uploadLimiter = new RateLimiterMemory({
  points: 10, // 10次上传
  duration: 60, // 每分钟
});

// 通用限流中间件
const rateLimitMiddleware = (limiter, keyGenerator = null) => {
  return async (req, res, next) => {
    try {
      const key = keyGenerator ? keyGenerator(req) : req.ip;
      await limiter.consume(key);
      next();
    } catch (rejRes) {
      const secs = Math.round(rejRes.msBeforeNext / 1000) || 1;
      res.set('Retry-After', String(secs));
      res.status(429).json({
        success: false,
        message: '请求过于频繁，请稍后再试',
        retryAfter: secs
      });
    }
  };
};

// API限流中间件
const apiRateLimit = rateLimitMiddleware(apiLimiter);

// 登录限流中间件
const loginRateLimit = rateLimitMiddleware(loginLimiter, (req) => {
  return req.ip + '_' + (req.body.openid || 'anonymous');
});

// 上传限流中间件
const uploadRateLimit = rateLimitMiddleware(uploadLimiter);

module.exports = {
  apiRateLimit,
  loginRateLimit,
  uploadRateLimit
};

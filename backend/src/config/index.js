require('dotenv').config();

module.exports = {
  // 服务器配置
  port: process.env.PORT || 3000,
  env: process.env.NODE_ENV || 'development',
  
  // JWT配置
  jwt: {
    secret: process.env.JWT_SECRET || 'fallback-secret-key',
    expiresIn: process.env.JWT_EXPIRES_IN || '7d'
  },
  
  // 微信小程序配置
  wechat: {
    appId: process.env.WECHAT_APPID,
    secret: process.env.WECHAT_SECRET,
    loginUrl: 'https://api.weixin.qq.com/sns/jscode2session'
  },
  
  // 文件上传配置
  upload: {
    path: process.env.UPLOAD_PATH || './uploads',
    maxSize: parseInt(process.env.MAX_FILE_SIZE) || 10 * 1024 * 1024, // 10MB
    allowedTypes: [
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'application/vnd.ms-excel',
      'text/csv'
    ]
  },
  
  // 日志配置
  log: {
    level: process.env.LOG_LEVEL || 'info',
    file: process.env.LOG_FILE || './logs/app.log'
  },
  
  // 分页配置
  pagination: {
    defaultLimit: 20,
    maxLimit: 100
  },
  
  // 缓存配置
  cache: {
    ttl: 300 // 5分钟
  }
};

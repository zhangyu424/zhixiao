// 生产环境配置
module.exports = {
  // API配置
  api: {
    baseUrl: 'https://api.yourdomain.com/api',
    timeout: 8000,
    retryCount: 2
  },

  // 调试配置
  debug: {
    enabled: false,
    logLevel: 'error',
    showApiLogs: false,
    showPerformanceLogs: false
  },

  // 性能监控
  performance: {
    enabled: true,
    slowApiThreshold: 1500,
    memoryWarningThreshold: 90
  },

  // 错误报告
  errorReporting: {
    enabled: true,
    autoReport: true,
    maxErrors: 50
  },

  // 数据验证
  validation: {
    strict: true,
    showValidationErrors: false
  },

  // 功能开关
  features: {
    mockData: false,
    offlineMode: false,
    experimentalFeatures: false
  }
};

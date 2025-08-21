// 开发环境配置
module.exports = {
  // API配置
  api: {
    baseUrl: 'http://140.143.143.195/api',
    timeout: 10000,
    retryCount: 3
  },

  // 调试配置
  debug: {
    enabled: true,
    logLevel: 'debug',
    showApiLogs: true,
    showPerformanceLogs: true
  },

  // 性能监控
  performance: {
    enabled: true,
    slowApiThreshold: 2000,
    memoryWarningThreshold: 80
  },

  // 错误报告
  errorReporting: {
    enabled: true,
    autoReport: false,
    maxErrors: 100
  },

  // 数据验证
  validation: {
    strict: true,
    showValidationErrors: true
  },

  // 功能开关
  features: {
    mockData: false,
    offlineMode: false,
    experimentalFeatures: true
  }
};

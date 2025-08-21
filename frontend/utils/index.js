// 工具模块统一导出文件
module.exports = {
  // API相关
  api: require('./api'),
  http: require('./api/http'),
  
  // 通用工具
  config: require('./common/config'),
  storage: require('./common/storage-helper'),
  errorReporter: require('./common/error-reporter'),
  performanceMonitor: require('./common/performance-monitor'),
  
  // 业务逻辑
  studyManager: require('./business/study-manager'),
  dataValidator: require('./business/data-validator'),
  
  // 常量
  constants: require('./constants'),
  permission: require('./permission'),
  configManager: require('./config-manager')
};

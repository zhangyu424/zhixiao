// 中间件统一导出
module.exports = {
  auth: require('./auth'),
  adminAuth: require('./adminAuth'),
  errorHandler: require('./errorHandler'),
  rateLimit: require('./rateLimit'),
  validation: require('./validation'),
  versionControl: require('./versionControl')
};

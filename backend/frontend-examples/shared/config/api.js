// 微信小程序API配置文件
// 使用方法: import API_CONFIG from './config/api.js'

const API_CONFIG = {
  // 开发环境配置
  development: {
    baseURL: 'http://localhost:3000/api',
    timeout: 10000,
    retryTimes: 3,
    enableLog: true
  },
  
  // 生产环境配置
  production: {
    baseURL: 'http://140.143.143.195/api',  // 您的生产服务器
    timeout: 10000,
    retryTimes: 3,
    enableLog: false
  }
}

// 自动环境检测
function getEnvironment() {
  // 微信小程序环境检测
  if (typeof wx !== 'undefined') {
    // 可以根据实际需要判断是开发版、体验版还是正式版
    const accountInfo = wx.getAccountInfoSync && wx.getAccountInfoSync()
    if (accountInfo && accountInfo.miniProgram) {
      const envVersion = accountInfo.miniProgram.envVersion
      if (envVersion === 'develop' || envVersion === 'trial') {
        return 'development'
      }
    }
    return 'production'
  }
  
  // 其他环境默认为开发环境
  return 'development'
}

const currentEnv = getEnvironment()
const config = API_CONFIG[currentEnv]

// 导出配置
export default {
  ...config,
  currentEnv,
  
  // 便捷方法
  getApiUrl: (path) => `${config.baseURL}${path}`,
  isProduction: () => currentEnv === 'production',
  isDevelopment: () => currentEnv === 'development'
}

// 如果是CommonJS环境（Node.js）
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    ...config,
    currentEnv,
    getApiUrl: (path) => `${config.baseURL}${path}`,
    isProduction: () => currentEnv === 'production',
    isDevelopment: () => currentEnv === 'development'
  }
}

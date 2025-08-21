// 统一请求封装 - 微信小程序版本
// 使用方法: import request from './utils/request.js'

import API_CONFIG from '../config/api.js'

class WeChatApiRequest {
  constructor() {
    this.baseURL = API_CONFIG.baseURL
    this.timeout = API_CONFIG.timeout
    this.retryTimes = API_CONFIG.retryTimes
    this.enableLog = API_CONFIG.enableLog
  }

  /**
   * 统一请求方法
   * @param {Object} options 请求配置
   * @param {string} options.url 请求路径
   * @param {string} options.method 请求方法
   * @param {Object} options.data 请求数据
   * @param {Object} options.header 请求头
   * @param {boolean} options.skipAuth 是否跳过认证
   */
  request(options) {
    const { 
      url, 
      method = 'GET', 
      data, 
      header = {}, 
      skipAuth = false 
    } = options

    // 构建完整请求头
    const requestHeader = {
      'Content-Type': 'application/json',
      'API-Version': 'v1',
      ...header
    }

    // 添加认证token（除非明确跳过）
    if (!skipAuth) {
      const token = wx.getStorageSync('token')
      if (token) {
        requestHeader.Authorization = `Bearer ${token}`
      }
    }

    // 日志记录
    if (this.enableLog) {
      console.log(`[API Request] ${method} ${url}`, data)
    }

    return new Promise((resolve, reject) => {
      wx.request({
        url: `${this.baseURL}${url}`,
        method,
        data,
        header: requestHeader,
        timeout: this.timeout,
        success: (res) => {
          if (this.enableLog) {
            console.log(`[API Response] ${method} ${url}`, res.data)
          }

          // 处理HTTP状态码
          if (res.statusCode === 200) {
            resolve(res.data)
          } else if (res.statusCode === 401) {
            // Token过期，清除本地数据并跳转登录
            this.handleTokenExpired()
            reject(new Error('登录已过期，请重新登录'))
          } else if (res.statusCode === 403) {
            wx.showToast({
              title: '权限不足',
              icon: 'none'
            })
            reject(new Error('权限不足'))
          } else if (res.statusCode === 429) {
            wx.showToast({
              title: '请求过于频繁',
              icon: 'none'
            })
            reject(new Error('请求过于频繁，请稍后重试'))
          } else {
            const errorMsg = res.data?.message || `HTTP ${res.statusCode}`
            wx.showToast({
              title: errorMsg,
              icon: 'none'
            })
            reject(new Error(errorMsg))
          }
        },
        fail: (error) => {
          console.error(`[API Error] ${method} ${url}`, error)
          
          // 网络错误处理
          if (error.errMsg.includes('timeout')) {
            wx.showToast({
              title: '请求超时，请检查网络',
              icon: 'none'
            })
            reject(new Error('请求超时'))
          } else if (error.errMsg.includes('fail')) {
            wx.showToast({
              title: '网络连接失败',
              icon: 'none'
            })
            reject(new Error('网络连接失败'))
          } else {
            reject(error)
          }
        }
      })
    })
  }

  /**
   * 处理Token过期
   */
  handleTokenExpired() {
    // 清除本地存储
    wx.removeStorageSync('token')
    wx.removeStorageSync('userInfo')
    
    // 更新全局状态
    if (getApp() && getApp().clearLoginInfo) {
      getApp().clearLoginInfo()
    }
    
    // 跳转到登录页面
    wx.showModal({
      title: '登录过期',
      content: '您的登录已过期，请重新登录',
      showCancel: false,
      success: () => {
        wx.reLaunch({
          url: '/pages/login/login'
        })
      }
    })
  }

  /**
   * 带重试的请求
   * @param {Object} options 请求配置
   * @param {number} retryCount 当前重试次数
   */
  async requestWithRetry(options, retryCount = 0) {
    try {
      return await this.request(options)
    } catch (error) {
      if (retryCount < this.retryTimes && !error.message.includes('401')) {
        console.log(`[API Retry] ${retryCount + 1}/${this.retryTimes}`)
        await this.delay(1000 * (retryCount + 1)) // 递增延迟
        return this.requestWithRetry(options, retryCount + 1)
      }
      throw error
    }
  }

  /**
   * 延迟函数
   */
  delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms))
  }

  // 便捷方法
  get(url, data, options = {}) {
    return this.request({ 
      url, 
      method: 'GET', 
      data, 
      ...options 
    })
  }

  post(url, data, options = {}) {
    return this.request({ 
      url, 
      method: 'POST', 
      data, 
      ...options 
    })
  }

  put(url, data, options = {}) {
    return this.request({ 
      url, 
      method: 'PUT', 
      data, 
      ...options 
    })
  }

  delete(url, data, options = {}) {
    return this.request({ 
      url, 
      method: 'DELETE', 
      data, 
      ...options 
    })
  }

  // 文件上传（如果需要）
  uploadFile(filePath, url, formData = {}, options = {}) {
    const token = wx.getStorageSync('token')
    const header = {
      'Authorization': token ? `Bearer ${token}` : '',
      ...options.header
    }

    return new Promise((resolve, reject) => {
      wx.uploadFile({
        url: `${this.baseURL}${url}`,
        filePath,
        name: 'file',
        formData,
        header,
        success: (res) => {
          try {
            const data = JSON.parse(res.data)
            resolve(data)
          } catch (e) {
            resolve(res.data)
          }
        },
        fail: reject
      })
    })
  }
}

// 导出单例
export default new WeChatApiRequest()

// 同时导出类，以便需要时创建多个实例
export { WeChatApiRequest }

// app.js
const ErrorReporter = require('./utils/common/error-reporter');
const PerformanceMonitor = require('./utils/common/performance-monitor');
const ConfigManager = require('./utils/common/config');
const ApiManager = require('./api/index');
const StudyManager = require('./utils/business/study-manager');

App({
  onLaunch: function () {
    console.log('学习质效分析小程序启动');

    // 初始化错误监控
    ErrorReporter.init();

    // 监控应用启动性能
    PerformanceMonitor.startTiming('app_launch');

    // 过滤微信开发者工具的内部错误
    const originalConsoleError = console.error;
    console.error = function (...args) {
      const message = args.join(' ');
      // 过滤已知的开发者工具内部错误
      if (
        message.includes('backgroundfetch privacy fail') ||
        message.includes('wxfile://usr/miniprogramLog') ||
        message.includes('private_getBackgroundFetchData')
      ) {
        return; // 忽略这些错误
      }
      // 其他错误正常输出
      originalConsoleError.apply(console, args);
    };

    // 检查登录状态
    this.checkLoginStatus();

    // 应用启动完成
    PerformanceMonitor.endTiming('app_launch');
  },

  // 检查登录状态
  checkLoginStatus: function () {
    const token = wx.getStorageSync('token');
    const userInfo = wx.getStorageSync('userInfo');

    if (token && userInfo) {
      this.globalData.token = token;
      this.globalData.userInfo = userInfo;
      this.globalData.isLogin = true;

      // 安全获取用户角色
      const userRole =
        userInfo.role ||
        (userInfo.currentRole && userInfo.currentRole.key) ||
        (userInfo.roles && userInfo.roles[0] && userInfo.roles[0].key) ||
        'student';
      this.globalData.userRole = userRole;

      // 延迟验证token，避免与登录过程冲突
      setTimeout(() => {
        this.validateToken();
      }, 2000);
    }
  },

  // 验证token有效性
  validateToken: function () {
    // 避免在登录过程中验证token
    if (this.validatingToken) {
      return;
    }

    this.validatingToken = true;

    wx.request({
      url: this.globalData.baseUrl + '/user/profile',
      method: 'GET',
      header: {
        Authorization: 'Bearer ' + this.globalData.token
      },
      success: res => {
        this.validatingToken = false;

        if (res.statusCode === 200 && res.data.success !== false) {
          // Token有效，更新用户信息
          if (res.data.data) {
            this.globalData.userInfo = res.data.data;
            wx.setStorageSync('userInfo', res.data.data);
          }
        } else if (
          res.statusCode === 401 ||
          (res.data &&
            res.data.success === false &&
            res.data.message &&
            res.data.message.includes('token'))
        ) {
          // 只有明确的认证错误才logout
          console.log('Token无效，需要重新登录');
          this.logout();
        }
        // 其他错误不处理，避免误logout
      },
      fail: err => {
        this.validatingToken = false;
        console.log('Token验证网络失败，跳过处理:', err);
        // 网络错误不执行logout，避免误操作
      }
    });
  },

  globalData: {
    baseUrl: 'http://140.143.143.195/api', // 后端API地址
    isLogin: false,
    userInfo: null,
    userRole: null, // student, instructor, manager, admin
    currentUnit: null,
    organizationStructure: [],
    appName: '学习质效分析系统',
    version: '1.0.0',
    token: '',
    // 请求频率控制
    requestQueue: [],
    lastRequestTime: 0,
    requestInterval: 1000, // 最小请求间隔1秒
    rateLimitUntil: 0 // 频率限制解除时间
  },

  // 全局方法
  login: function (callback) {
    wx.login({
      success: res => {
        if (res.code) {
          // 发送 res.code 到后台换取 openId, sessionKey, unionId
          this.request({
            url: '/auth/wxlogin',
            method: 'POST',
            data: {
              code: res.code
            },
            success: data => {
              if (data.openid) {
                this.globalData.isLogin = true;
                callback && callback(true, data);
              } else {
                callback && callback(false, '登录失败');
              }
            },
            fail: err => {
              console.log('登录请求失败:', err);
              callback && callback(false, '网络错误，请检查网络连接');
            }
          });
        } else {
          callback && callback(false, '微信登录失败');
        }
      },
      fail: err => {
        console.log('wx.login 失败:', err);
        callback && callback(false, '微信登录服务异常');
      }
    });
  },

  // 封装请求方法
  request: function (options) {
    return this.realRequest(options);
  },

  // 真实API请求方法
  realRequest: function (options) {
    return new Promise((resolve, reject) => {
      // 检查频率限制
      const now = Date.now();
      if (this.globalData.rateLimitUntil > now) {
        const waitTime = Math.ceil(
          (this.globalData.rateLimitUntil - now) / 1000
        );
        wx.showToast({
          title: `请求过于频繁，请等待${waitTime}秒`,
          icon: 'none',
          duration: 2000
        });
        reject({ message: '请求频率限制', retryAfter: waitTime });
        return;
      }

      // 控制请求频率
      const timeSinceLastRequest = now - this.globalData.lastRequestTime;
      if (timeSinceLastRequest < this.globalData.requestInterval) {
        const delay = this.globalData.requestInterval - timeSinceLastRequest;
        setTimeout(() => {
          this.realRequest(options).then(resolve).catch(reject);
        }, delay);
        return;
      }

      this.globalData.lastRequestTime = now;

      // 显示加载提示
      if (options.showLoading !== false) {
        wx.showLoading({
          title: options.loadingText || '请求中...',
          mask: true
        });
      }

      const token = wx.getStorageSync('token');

      wx.request({
        url: this.globalData.baseUrl + options.url,
        method: options.method || 'GET',
        data: options.data || {},
        header: {
          'Content-Type': 'application/json',
          Authorization: token ? `Bearer ${token}` : '',
          ...options.header
        },
        timeout: 10000,
        success: res => {
          if (options.showLoading !== false) {
            wx.hideLoading();
          }

          if (res.statusCode === 200) {
            // 检查业务状态码
            if (res.data.success === false) {
              // token失效处理
              if (res.data.message && res.data.message.includes('token')) {
                this.logout();
                return;
              }

              // 其他业务错误
              if (options.showError !== false) {
                wx.showToast({
                  title: res.data.message || '请求失败',
                  icon: 'none',
                  duration: 2000
                });
              }
              reject(res.data);
            } else {
              resolve(res.data);
            }
          } else if (res.statusCode === 429) {
            // 处理频率限制
            this.handleRateLimit(res, options, resolve, reject);
          } else {
            this.handleRequestError(res, options.showError);
            reject(res);
          }
        },
        fail: err => {
          if (options.showLoading !== false) {
            wx.hideLoading();
          }
          this.handleRequestError(err, options.showError);
          reject(err);
        }
      });
    });
  },

  // 处理频率限制
  handleRateLimit: function (res, options, resolve, reject) {
    const retryAfter = res.data.retryAfter || 60; // 默认60秒
    this.globalData.rateLimitUntil = Date.now() + retryAfter * 1000;

    wx.showModal({
      title: '请求过于频繁',
      content: `服务器繁忙，请${retryAfter}秒后再试。是否自动重试？`,
      confirmText: '自动重试',
      cancelText: '取消',
      success: modalRes => {
        if (modalRes.confirm) {
          // 自动重试
          setTimeout(() => {
            this.realRequest(options).then(resolve).catch(reject);
          }, retryAfter * 1000);

          wx.showToast({
            title: `将在${retryAfter}秒后重试`,
            icon: 'none',
            duration: 2000
          });
        } else {
          reject(res.data);
        }
      }
    });
  },

  // 处理请求错误
  handleRequestError: function (error, showError = true) {
    let message = '网络请求失败';

    if (error.statusCode) {
      switch (error.statusCode) {
      case 400:
        message = '请求参数错误';
        break;
      case 401:
        message = '未授权访问';
        this.logout();
        return;
      case 403:
        message = '禁止访问';
        break;
      case 404:
        message = '请求地址不存在';
        break;
      case 429:
        message = '请求过于频繁，请稍后再试';
        // 设置频率限制
        const retryAfter = (error.data && error.data.retryAfter) || 60;
        this.globalData.rateLimitUntil = Date.now() + retryAfter * 1000;
        break;
      case 500:
        message = '服务器内部错误';
        break;
      default:
        message = `请求失败 (${error.statusCode})`;
      }
    }

    if (showError) {
      wx.showToast({
        title: message,
        icon: 'none',
        duration: 2000
      });
    }
  },

  // 退出登录
  logout: function () {
    wx.removeStorageSync('token');
    wx.removeStorageSync('userInfo');
    wx.removeStorageSync('hasSubscribed');
    this.globalData.isLogin = false;
    this.globalData.userInfo = null;
    this.globalData.userRole = null;
    this.globalData.token = '';

    wx.reLaunch({
      url: '/pages/unified-login/unified-login'
    });
  }
});

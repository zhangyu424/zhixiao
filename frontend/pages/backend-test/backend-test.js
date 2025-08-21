// pages/backend-test/backend-test.js
// 后端API可用性测试页面 (整合了test-api和status页面的功能)

const { APISyncManager } = require('../../utils/api/api-sync-manager');

Page({
  data: {
    testing: false,
    testResults: [],
    overallStatus: 'unknown',
    baseUrl: '',
    testStartTime: null,
    testEndTime: null,
    
    // 统计数据
    successCount: 0,
    failedCount: 0,
    successRate: '0.0',
    
    // 系统状态监控 (来自status页面)
    backendStatus: 'checking',
    apiLimits: {
      current: 0,
      limit: 100,
      resetTime: '',
      rateLimitUntil: 0
    },
    requestHistory: [],
    systemInfo: {},
    
    // 测试配置
    testConfig: {
      timeout: 10000, // 10秒超时
      retryCount: 2,   // 重试2次
      testAPIs: [
        // 核心API测试列表
        { path: '/system/api-sync', method: 'POST', name: 'API同步接口', priority: 'high' },
        { path: '/auth/validate-token', method: 'GET', name: 'Token验证', priority: 'high' },
        { path: '/auth/account-login', method: 'POST', name: '账号登录', priority: 'high' },
        { path: '/auth/wechat-login', method: 'POST', name: '微信登录', priority: 'high' },
        { path: '/user/profile', method: 'GET', name: '用户信息', priority: 'medium' },
        { path: '/study/submit', method: 'POST', name: '学习提交', priority: 'medium' },
        { path: '/study/history', method: 'GET', name: '学习历史', priority: 'medium' },
        { path: '/analytics/personal', method: 'GET', name: '个人分析', priority: 'low' },
        { path: '/notifications/list', method: 'GET', name: '通知列表', priority: 'low' }
      ]
    }
  },

  onLoad: function() {
    this.apiSyncManager = new APISyncManager();
    this.initializeTest();
    this.loadSystemInfo(); // 来自status页面
    this.startStatusMonitor(); // 来自status页面
  },

  // 初始化测试
  initializeTest: function() {
    const app = getApp();
    const baseUrl = app.globalData.baseUrl || 'https://your-api-domain.com/api';
    
    this.setData({
      baseUrl: baseUrl
    });

    console.log('🧪 后端可用性测试初始化');
    console.log('📡 测试目标:', baseUrl);
  },

  // 加载系统信息 (来自status页面)
  loadSystemInfo: function() {
    wx.getSystemInfo({
      success: (res) => {
        this.setData({
          systemInfo: {
            platform: res.platform,
            version: res.version,
            model: res.model,
            pixelRatio: res.pixelRatio,
            windowWidth: res.windowWidth,
            windowHeight: res.windowHeight,
            networkType: '检测中...'
          }
        });
        
        // 获取网络状态
        wx.getNetworkType({
          success: (networkRes) => {
            this.setData({
              'systemInfo.networkType': networkRes.networkType
            });
          }
        });
      }
    });
  },

  // 开始状态监控 (来自status页面)
  startStatusMonitor: function() {
    // 每30秒检查一次状态
    this.statusTimer = setInterval(() => {
      this.checkBackendStatus();
      this.updateApiLimits();
    }, 30000);
  },

  // 检查后端状态 (来自status页面)
  checkBackendStatus: function() {
    const app = getApp();
    const startTime = Date.now();
    
    wx.request({
      url: app.globalData.baseUrl + '/auth/validate-token',
      method: 'GET',
      timeout: 5000,
      success: (res) => {
        const responseTime = Date.now() - startTime;
        this.setData({
          backendStatus: 'online'
        });
        
        this.addRequestHistory('GET', '/auth/validate-token', res.statusCode, responseTime);
      },
      fail: (err) => {
        const responseTime = Date.now() - startTime;
        this.setData({
          backendStatus: 'offline'
        });
        
        this.addRequestHistory('GET', '/auth/validate-token', 'fail', responseTime, err.errMsg);
      }
    });
  },

  // 更新API限制信息 (来自status页面)
  updateApiLimits: function() {
    const app = getApp();
    const now = Date.now();
    
    // 更新速率限制状态
    if (app.globalData.rateLimitUntil > now) {
      const remaining = Math.ceil((app.globalData.rateLimitUntil - now) / 1000);
      this.setData({
        'apiLimits.rateLimitUntil': remaining
      });
    } else {
      this.setData({
        'apiLimits.rateLimitUntil': 0
      });
    }
  },

  // 添加请求历史 (来自status页面)
  addRequestHistory: function(method, url, status, responseTime, error = null) {
    const history = this.data.requestHistory;
    const newRecord = {
      id: Date.now(),
      method: method,
      url: url,
      status: status,
      responseTime: responseTime,
      error: error,
      timestamp: new Date().toLocaleTimeString()
    };
    
    history.unshift(newRecord);
    
    // 只保留最近20条记录
    if (history.length > 20) {
      history.pop();
    }
    
    this.setData({
      requestHistory: history
    });
  },

  // 清除请求历史
  clearRequestHistory: function() {
    this.setData({
      requestHistory: []
    });
    
    wx.showToast({
      title: '已清除历史',
      icon: 'success'
    });
  },

  // 页面销毁时清理定时器
  onUnload: function() {
    if (this.statusTimer) {
      clearInterval(this.statusTimer);
    }
  },

  // 开始全面测试
  async startFullTest() {
    wx.showLoading({ title: '测试中...' });
    
    this.setData({
      testing: true,
      testResults: [],
      overallStatus: 'testing',
      testStartTime: new Date().toISOString()
    });

    console.log('🚀 开始后端API可用性测试...');

    try {
      // 并行测试所有API
      const testPromises = this.data.testConfig.testAPIs.map(api => 
        this.testSingleAPI(api)
      );

      const results = await Promise.allSettled(testPromises);
      
      // 处理测试结果
      const testResults = results.map((result, index) => {
        const api = this.data.testConfig.testAPIs[index];
        return {
          ...api,
          status: result.status === 'fulfilled' ? result.value.status : 'error',
          response: result.status === 'fulfilled' ? result.value.response : null,
          error: result.status === 'rejected' ? result.reason.message : null,
          duration: result.status === 'fulfilled' ? result.value.duration : 0,
          timestamp: new Date().toISOString()
        };
      });

      // 计算整体状态
      const overallStatus = this.calculateOverallStatus(testResults);

      this.setData({
        testing: false,
        testResults: testResults,
        overallStatus: overallStatus,
        testEndTime: new Date().toISOString()
      });

      this.updateStats();
      this.updateAPIConfigs();

      wx.hideLoading();
      
      // 显示测试完成消息
      this.showTestSummary(testResults, overallStatus);

    } catch (error) {
      console.error('测试过程出错:', error);
      wx.hideLoading();
      wx.showToast({
        title: '测试失败',
        icon: 'none'
      });
    }
  },

  // 测试单个API
  async testSingleAPI(apiConfig) {
    const startTime = Date.now();
    
    return new Promise((resolve) => {
      const app = getApp();
      const token = app.globalData.token || wx.getStorageSync('token');

      // 准备测试数据
      let testData = null;
      if (apiConfig.method === 'POST') {
        testData = this.getTestData(apiConfig.path);
      }

      wx.request({
        url: `${this.data.baseUrl}${apiConfig.path}`,
        method: apiConfig.method,
        data: testData,
        header: {
          'Content-Type': 'application/json',
          'Authorization': token ? `Bearer ${token}` : '',
          'X-Test-Request': 'true' // 标记为测试请求
        },
        timeout: this.data.testConfig.timeout,
        success: (res) => {
          const duration = Date.now() - startTime;
          console.log(`✅ ${apiConfig.name} 测试成功:`, res.statusCode);
          
          resolve({
            status: res.statusCode === 200 ? 'success' : 'error',
            response: res.data,
            duration: duration,
            statusCode: res.statusCode
          });
        },
        fail: (error) => {
          const duration = Date.now() - startTime;
          console.log(`❌ ${apiConfig.name} 测试失败:`, error.errMsg);
          
          // 分析错误类型
          let status = 'error';
          if (error.errMsg.includes('404')) {
            status = 'not_found';
          } else if (error.errMsg.includes('timeout')) {
            status = 'timeout';
          } else if (error.errMsg.includes('fail')) {
            status = 'network_error';
          }

          resolve({
            status: status,
            response: null,
            duration: duration,
            error: error.errMsg
          });
        }
      });
    });
  },

  // 获取测试数据
  getTestData: function(apiPath) {
    const testData = {
      '/system/api-sync': {
        timestamp: new Date().toISOString(),
        clientVersion: '1.0.0',
        testMode: true
      },
      '/auth/account-login': {
        account: 'test_user',
        password: 'test_password'
      },
      '/auth/wechat-login': {
        code: 'test_wx_code'
      },
      '/study/submit': {
        date: new Date().toISOString().split('T')[0],
        studyTime: 60,
        description: '测试学习记录'
      },
      '/notifications/mark-read': {
        notificationIds: ['test_notification_id']
      }
    };

    return testData[apiPath] || {};
  },

  // 计算整体状态
  calculateOverallStatus: function(results) {
    const highPriorityResults = results.filter(r => r.priority === 'high');
    const successCount = results.filter(r => r.status === 'success').length;
    const highPrioritySuccessCount = highPriorityResults.filter(r => r.status === 'success').length;

    if (successCount === 0) {
      return 'all_failed';
    } else if (highPrioritySuccessCount === highPriorityResults.length) {
      return 'core_available';
    } else if (highPrioritySuccessCount > 0) {
      return 'partial_available';
    } else {
      return 'core_unavailable';
    }
  },

  // 显示测试摘要
  showTestSummary: function(results, overallStatus) {
    const successCount = results.filter(r => r.status === 'success').length;
    const totalCount = results.length;
    const successRate = ((successCount / totalCount) * 100).toFixed(1);

    const statusMessages = {
      'all_failed': '❌ 所有API都不可用',
      'core_unavailable': '⚠️ 核心API不可用',
      'partial_available': '🟡 部分API可用',
      'core_available': '✅ 核心API可用',
      'all_available': '🎉 所有API都可用'
    };

    const message = `${statusMessages[overallStatus]}\n\n成功率: ${successRate}% (${successCount}/${totalCount})`;

    wx.showModal({
      title: '测试完成',
      content: message,
      showCancel: false,
      confirmText: '查看详情'
    });
  },

  // 测试特定API
  async testSpecificAPI(e) {
    const index = e.currentTarget.dataset.index;
    const apiConfig = this.data.testConfig.testAPIs[index];

    wx.showLoading({ title: `测试${apiConfig.name}...` });

    try {
      const result = await this.testSingleAPI(apiConfig);
      
      // 更新特定结果
      const testResults = [...this.data.testResults];
      const existingIndex = testResults.findIndex(r => r.path === apiConfig.path);
      
      const newResult = {
        ...apiConfig,
        ...result,
        timestamp: new Date().toISOString()
      };

      if (existingIndex >= 0) {
        testResults[existingIndex] = newResult;
      } else {
        testResults.push(newResult);
      }

      this.setData({ testResults });
      this.updateStats();
      this.updateAPIConfigs();

      wx.hideLoading();
      
      const statusText = this.getStatusText(result.status);
      wx.showToast({
        title: statusText,
        icon: result.status === 'success' ? 'success' : 'none'
      });

    } catch (error) {
      wx.hideLoading();
      wx.showToast({
        title: '测试失败',
        icon: 'none'
      });
    }
  },

  // 执行API同步测试
  async testAPISync() {
    wx.showLoading({ title: '同步测试中...' });

    try {
      const result = await this.apiSyncManager.syncAPIDocumentation();
      
      wx.hideLoading();
      
      if (result.success) {
        wx.showModal({
          title: '同步测试成功',
          content: result.message || '后端API同步接口工作正常',
          showCancel: false
        });
      } else {
        wx.showModal({
          title: '同步测试失败',
          content: result.message || '后端API同步接口不可用',
          showCancel: false
        });
      }

      // 刷新测试结果
      this.startFullTest();

    } catch (error) {
      wx.hideLoading();
      wx.showModal({
        title: '同步测试异常',
        content: error.message || '网络连接或后端服务异常',
        showCancel: false
      });
    }
  },

  // 更新统计数据
  updateStats: function() {
    const testResults = this.data.testResults;
    const successCount = testResults.filter(item => item.status === 'success').length;
    const failedCount = testResults.length - successCount;
    const successRate = testResults.length > 0 ? ((successCount / testResults.length) * 100).toFixed(1) : '0.0';
    
    this.setData({
      successCount,
      failedCount,
      successRate
    });
  },

  // 更新API配置以包含测试结果
  updateAPIConfigs: function() {
    const testConfig = this.data.testConfig;
    const testResults = this.data.testResults;
    
    testConfig.testAPIs = testConfig.testAPIs.map(api => {
      const result = testResults.find(r => r.path === api.path);
      return {
        ...api,
        testResult: result || null
      };
    });
    
    this.setData({ testConfig });
  },

  // 获取状态文本
  getStatusText: function(status) {
    const statusMap = {
      'success': '✅ 可用',
      'error': '❌ 错误',
      'not_found': '🔍 未找到',
      'timeout': '⏰ 超时',
      'network_error': '🌐 网络错误'
    };
    
    return statusMap[status] || status;
  },

  // 获取状态颜色
  getStatusColor: function(status) {
    const colorMap = {
      'success': '#27ae60',
      'error': '#e74c3c',
      'not_found': '#f39c12',
      'timeout': '#9b59b6',
      'network_error': '#34495e'
    };
    
    return colorMap[status] || '#95a5a6';
  },

  // 获取优先级文本
  getPriorityText: function(priority) {
    const priorityMap = {
      'high': '🔥 高',
      'medium': '📋 中',
      'low': '📊 低'
    };
    
    return priorityMap[priority] || priority;
  },

  // 查看详细结果
  viewDetailResult: function(e) {
    const index = e.currentTarget.dataset.index;
    const result = this.data.testResults[index];

    const detail = `接口: ${result.path}\n方法: ${result.method}\n状态: ${this.getStatusText(result.status)}\n耗时: ${result.duration}ms\n时间: ${result.timestamp}`;

    wx.showModal({
      title: result.name,
      content: detail,
      showCancel: false
    });
  },

  // 导出测试报告
  exportTestReport: function() {
    const report = {
      testTime: new Date().toISOString(),
      baseUrl: this.data.baseUrl,
      overallStatus: this.data.overallStatus,
      results: this.data.testResults,
      summary: {
        total: this.data.testResults.length,
        success: this.data.testResults.filter(r => r.status === 'success').length,
        failed: this.data.testResults.filter(r => r.status !== 'success').length
      }
    };

    console.log('📋 后端可用性测试报告:', JSON.stringify(report, null, 2));
    
    wx.showModal({
      title: '测试报告',
      content: '测试报告已输出到控制台，请在开发者工具中查看',
      showCancel: false
    });
  },

  // 页面分享
  onShareAppMessage: function() {
    return {
      title: '后端API测试工具',
      path: '/pages/backend-test/backend-test'
    };
  }
});

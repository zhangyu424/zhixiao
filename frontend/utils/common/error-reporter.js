// 错误监控和报告工具
const ErrorReporter = {
  // 错误收集
  errors: [],
  maxErrors: 100, // 最多保存100个错误

  // 初始化错误监控
  init: function () {
    // 监听小程序错误
    wx.onError(error => {
      this.captureError('runtime', error, {
        source: 'wx.onError'
      });
    });

    // 监听未处理的Promise拒绝
    wx.onUnhandledRejection(error => {
      this.captureError('promise', error.reason, {
        source: 'unhandledRejection',
        promise: error.promise
      });
    });

    console.log('🛡️ 错误监控已初始化');
  },

  // 捕获错误
  captureError: function (type, error, context = {}) {
    const errorInfo = {
      id: this.generateErrorId(),
      type: type, // 'runtime', 'api', 'business', 'promise'
      message: this.extractErrorMessage(error),
      stack: this.extractErrorStack(error),
      timestamp: new Date().toISOString(),
      context: context,
      userAgent: this.getUserAgent(),
      appVersion: this.getAppVersion()
    };

    // 添加到错误列表
    this.errors.unshift(errorInfo);

    // 保持错误数量限制
    if (this.errors.length > this.maxErrors) {
      this.errors = this.errors.slice(0, this.maxErrors);
    }

    // 记录错误
    console.error(`🔴 [${type.toUpperCase()}] ${errorInfo.message}`, errorInfo);

    // 严重错误处理
    if (this.isCriticalError(error)) {
      this.handleCriticalError(errorInfo);
    }

    // 自动上报（生产环境）
    if (this.shouldAutoReport()) {
      this.reportError(errorInfo);
    }

    return errorInfo.id;
  },

  // 生成错误ID
  generateErrorId: function () {
    return 'err_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
  },

  // 提取错误信息
  extractErrorMessage: function (error) {
    if (typeof error === 'string') return error;
    if (error && error.message) return error.message;
    if (error && error.errMsg) return error.errMsg;
    return JSON.stringify(error) || '未知错误';
  },

  // 提取错误堆栈
  extractErrorStack: function (error) {
    if (error && error.stack) return error.stack;
    if (error && error.errMsg) return error.errMsg;
    return null;
  },

  // 获取用户代理信息
  getUserAgent: function () {
    try {
      const systemInfo = wx.getSystemInfoSync();
      return {
        platform: systemInfo.platform,
        system: systemInfo.system,
        version: systemInfo.version,
        SDKVersion: systemInfo.SDKVersion
      };
    } catch (e) {
      return { error: '获取系统信息失败' };
    }
  },

  // 获取应用版本
  getAppVersion: function () {
    try {
      const app = getApp();
      return app.globalData.version || '1.0.0';
    } catch (e) {
      return 'unknown';
    }
  },

  // 判断是否为严重错误
  isCriticalError: function (error) {
    const criticalKeywords = [
      'network timeout',
      'memory',
      'crash',
      'authorization',
      'payment'
    ];

    const errorMsg = this.extractErrorMessage(error).toLowerCase();
    return criticalKeywords.some(keyword => errorMsg.includes(keyword));
  },

  // 处理严重错误
  handleCriticalError: function (errorInfo) {
    console.error('🚨 严重错误:', errorInfo);

    // 显示用户友好的错误提示
    wx.showModal({
      title: '系统错误',
      content: '应用遇到了一个严重错误，请稍后重试或联系技术支持 (方九日: moqiqingxuan@gmail.com)。',
      showCancel: false,
      confirmText: '确定'
    });
  },

  // 判断是否自动上报
  shouldAutoReport: function () {
    // 在生产环境且用户同意的情况下自动上报
    try {
      const app = getApp();
      return (
        !app.globalData.debug &&
        wx.getStorageSync('auto_report_errors') === true
      );
    } catch (e) {
      return false;
    }
  },

  // 上报错误
  reportError: function (errorInfo) {
    // 这里可以实现错误上报逻辑
    // 例如发送到错误收集服务
    console.log('📤 错误上报:', errorInfo.id);
  },

  // 手动报告错误
  reportManualError: function (message, context = {}) {
    return this.captureError('business', new Error(message), context);
  },

  // 获取错误列表
  getErrors: function (limit = 20) {
    return this.errors.slice(0, limit);
  },

  // 获取错误统计
  getErrorStats: function () {
    const stats = {
      total: this.errors.length,
      byType: {},
      recentErrors: this.errors.slice(0, 5),
      criticalCount: 0
    };

    this.errors.forEach(error => {
      stats.byType[error.type] = (stats.byType[error.type] || 0) + 1;
      if (error.type === 'critical') stats.criticalCount++;
    });

    return stats;
  },

  // 清理错误记录
  clearErrors: function () {
    this.errors = [];
    console.log('🧹 错误记录已清理');
  },

  // 导出错误报告
  exportErrorReport: function () {
    const report = {
      timestamp: new Date().toISOString(),
      appVersion: this.getAppVersion(),
      userAgent: this.getUserAgent(),
      stats: this.getErrorStats(),
      errors: this.errors
    };

    console.log('📊 错误报告:', report);
    return report;
  }
};

module.exports = ErrorReporter;

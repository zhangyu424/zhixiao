// 性能监控工具
const PerformanceMonitor = {
  // 性能数据存储
  performanceData: {},

  // 开始监控
  startTiming: function (name) {
    this.performanceData[name] = {
      startTime: Date.now(),
      endTime: null,
      duration: null
    };
  },

  // 结束监控
  endTiming: function (name) {
    if (this.performanceData[name]) {
      this.performanceData[name].endTime = Date.now();
      this.performanceData[name].duration =
        this.performanceData[name].endTime -
        this.performanceData[name].startTime;

      // 记录性能数据
      console.log(`⏱️ ${name}: ${this.performanceData[name].duration}ms`);

      // 性能告警
      if (this.performanceData[name].duration > 3000) {
        console.warn(
          `🐌 性能告警: ${name} 耗时过长 (${this.performanceData[name].duration}ms)`
        );
      }

      return this.performanceData[name].duration;
    }
    return null;
  },

  // 监控页面加载
  monitorPageLoad: function (pageName) {
    this.startTiming(`page_load_${pageName}`);

    // 监控首屏渲染
    wx.nextTick(() => {
      this.endTiming(`page_load_${pageName}`);
    });
  },

  // 监控API请求
  monitorApiRequest: function (apiName, requestPromise) {
    this.startTiming(`api_${apiName}`);

    return requestPromise.finally(() => {
      this.endTiming(`api_${apiName}`);
    });
  },

  // 内存使用监控
  checkMemoryUsage: function () {
    try {
      const storageInfo = wx.getStorageInfoSync();
      const memoryInfo = {
        storageUsed: storageInfo.currentSize,
        storageLimit: storageInfo.limitSize,
        storageUsagePercent: (
          (storageInfo.currentSize / storageInfo.limitSize) *
          100
        ).toFixed(2)
      };

      console.log('📊 内存使用情况:', memoryInfo);

      // 内存使用告警
      if (memoryInfo.storageUsagePercent > 80) {
        console.warn(
          '🔴 内存使用告警: 存储空间使用率过高',
          memoryInfo.storageUsagePercent + '%'
        );
      }

      return memoryInfo;
    } catch (error) {
      console.error('获取内存信息失败:', error);
      return null;
    }
  },

  // 网络性能监控
  monitorNetworkPerformance: function () {
    return new Promise(resolve => {
      wx.getNetworkType({
        success: res => {
          const networkInfo = {
            networkType: res.networkType,
            isConnected: res.networkType !== 'none',
            timestamp: new Date().toISOString()
          };

          console.log('🌐 网络状态:', networkInfo);
          resolve(networkInfo);
        },
        fail: error => {
          console.error('获取网络信息失败:', error);
          resolve(null);
        }
      });
    });
  },

  // 生成性能报告
  generateReport: function () {
    const report = {
      timestamp: new Date().toISOString(),
      performanceData: this.performanceData,
      summary: {
        totalOperations: Object.keys(this.performanceData).length,
        slowOperations: Object.keys(this.performanceData).filter(
          key => this.performanceData[key].duration > 2000
        ).length
      }
    };

    console.log('📈 性能报告:', report);
    return report;
  },

  // 清理性能数据
  clearData: function () {
    this.performanceData = {};
    console.log('🧹 性能数据已清理');
  }
};

module.exports = PerformanceMonitor;

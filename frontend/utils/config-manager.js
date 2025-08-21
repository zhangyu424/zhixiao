// 配置管理工具
const ConfigManager = {
  // 当前环境
  environment: 'development', // 'development' | 'production'

  // 配置缓存
  configCache: null,

  // 初始化配置
  init: function () {
    // 检测环境
    this.detectEnvironment();

    // 加载配置
    this.loadConfig();

    console.log('🔧 配置管理器已初始化, 环境:', this.environment);
  },

  // 检测环境
  detectEnvironment: function () {
    try {
      // 通过调试状态判断环境
      const app = getApp();
      const isDebugMode = app && app.globalData && app.globalData.debug;

      // 微信开发者工具中的判断
      const isDeveloperTool =
        typeof __wxConfig !== 'undefined' && __wxConfig.debug;

      this.environment =
        isDebugMode || isDeveloperTool ? 'development' : 'production';
    } catch (error) {
      console.warn('环境检测失败，使用默认配置:', error);
      this.environment = 'development';
    }
  },

  // 加载配置
  loadConfig: function () {
    try {
      // 动态加载对应环境的配置
      const configPath =
        this.environment === 'production'
          ? '/config/prod/app.config.js'
          : '/config/dev/app.config.js';

      // 注意：微信小程序不支持动态require，这里使用静态配置
      this.configCache = this.getStaticConfig();
    } catch (error) {
      console.error('配置加载失败:', error);
      this.configCache = this.getDefaultConfig();
    }
  },

  // 获取静态配置（替代动态加载）
  getStaticConfig: function () {
    const configs = {
      development: {
        api: {
          baseUrl: 'http://140.143.143.195/api',
          timeout: 10000,
          retryCount: 3
        },
        debug: {
          enabled: true,
          logLevel: 'debug',
          showApiLogs: true,
          showPerformanceLogs: true
        },
        performance: {
          enabled: true,
          slowApiThreshold: 2000,
          memoryWarningThreshold: 80
        },
        errorReporting: {
          enabled: true,
          autoReport: false,
          maxErrors: 100
        },
        validation: {
          strict: true,
          showValidationErrors: true
        },
        features: {
          mockData: false,
          offlineMode: false,
          experimentalFeatures: true
        }
      },
      production: {
        api: {
          baseUrl: 'https://api.yourdomain.com/api',
          timeout: 8000,
          retryCount: 2
        },
        debug: {
          enabled: false,
          logLevel: 'error',
          showApiLogs: false,
          showPerformanceLogs: false
        },
        performance: {
          enabled: true,
          slowApiThreshold: 1500,
          memoryWarningThreshold: 90
        },
        errorReporting: {
          enabled: true,
          autoReport: true,
          maxErrors: 50
        },
        validation: {
          strict: true,
          showValidationErrors: false
        },
        features: {
          mockData: false,
          offlineMode: false,
          experimentalFeatures: false
        }
      }
    };

    return configs[this.environment];
  },

  // 默认配置
  getDefaultConfig: function () {
    return {
      api: {
        baseUrl: 'http://140.143.143.195/api',
        timeout: 5000,
        retryCount: 1
      },
      debug: {
        enabled: true,
        logLevel: 'info'
      }
    };
  },

  // 获取配置值
  get: function (key, defaultValue = null) {
    if (!this.configCache) {
      this.loadConfig();
    }

    const keys = key.split('.');
    let value = this.configCache;

    for (const k of keys) {
      if (value && typeof value === 'object' && k in value) {
        value = value[k];
      } else {
        return defaultValue;
      }
    }

    return value !== undefined ? value : defaultValue;
  },

  // 设置配置值（运行时）
  set: function (key, value) {
    if (!this.configCache) {
      this.loadConfig();
    }

    const keys = key.split('.');
    let obj = this.configCache;

    for (let i = 0; i < keys.length - 1; i++) {
      const k = keys[i];
      if (!(k in obj) || typeof obj[k] !== 'object') {
        obj[k] = {};
      }
      obj = obj[k];
    }

    obj[keys[keys.length - 1]] = value;

    console.log(`配置已更新: ${key} = ${value}`);
  },

  // 获取当前环境
  getEnvironment: function () {
    return this.environment;
  },

  // 是否为开发环境
  isDevelopment: function () {
    return this.environment === 'development';
  },

  // 是否为生产环境
  isProduction: function () {
    return this.environment === 'production';
  },

  // 获取API配置
  getApiConfig: function () {
    return this.get('api', {});
  },

  // 获取调试配置
  getDebugConfig: function () {
    return this.get('debug', {});
  },

  // 获取性能配置
  getPerformanceConfig: function () {
    return this.get('performance', {});
  },

  // 获取错误报告配置
  getErrorReportingConfig: function () {
    return this.get('errorReporting', {});
  },

  // 检查功能是否启用
  isFeatureEnabled: function (featureName) {
    return this.get(`features.${featureName}`, false);
  },

  // 导出当前配置
  exportConfig: function () {
    return {
      environment: this.environment,
      config: this.configCache,
      timestamp: new Date().toISOString()
    };
  }
};

module.exports = ConfigManager;

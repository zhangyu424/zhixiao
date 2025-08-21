/**
 * 前端通用配置管理
 */
class ConfigManager {
  constructor() {
    this.config = this.loadConfig();
  }

  /**
   * 加载配置
   */
  loadConfig() {
    // 基础配置
    const baseConfig = {
      // API配置
      api: {
        baseURL: 'https://api.zhixiao.com',
        timeout: 10000,
        retryTimes: 3,
        retryDelay: 1000
      },
      
      // 应用配置
      app: {
        name: '学习质效分析',
        version: '1.0.0',
        debug: false,
        theme: 'auto'
      },
      
      // 学习配置
      study: {
        defaultGoal: {
          daily: 3.0,
          weekly: 21.0,
          monthly: 90.0
        },
        timerInterval: 1000,
        autoSave: true,
        autoSaveInterval: 30000
      },
      
      // 数据配置
      data: {
        cacheExpiry: 3600000, // 1小时
        maxCacheSize: 100,
        autoSync: true,
        syncInterval: 300000 // 5分钟
      },
      
      // UI配置
      ui: {
        pageSize: 20,
        animationDuration: 300,
        loadingDelay: 500,
        errorRetryDelay: 2000
      },
      
      // 权限配置
      permissions: {
        camera: false,
        location: false,
        microphone: false,
        storage: true
      }
    };

    // 从本地存储读取用户配置
    const userConfig = this.getUserConfig();
    
    // 合并配置
    return this.mergeConfig(baseConfig, userConfig);
  }

  /**
   * 获取用户配置
   */
  getUserConfig() {
    try {
      if (typeof wx !== 'undefined' && wx.getStorageSync) {
        const userConfig = wx.getStorageSync('user_config');
        return userConfig ? JSON.parse(userConfig) : {};
      }
      return {};
    } catch (error) {
      console.error('获取用户配置失败:', error);
      return {};
    }
  }

  /**
   * 保存用户配置
   */
  saveUserConfig(config) {
    try {
      if (typeof wx !== 'undefined' && wx.setStorageSync) {
        wx.setStorageSync('user_config', JSON.stringify(config));
      }
    } catch (error) {
      console.error('保存用户配置失败:', error);
    }
  }

  /**
   * 合并配置
   */
  mergeConfig(baseConfig, userConfig) {
    const merged = { ...baseConfig };
    
    Object.keys(userConfig).forEach(key => {
      if (typeof merged[key] === 'object' && merged[key] !== null) {
        merged[key] = { ...merged[key], ...userConfig[key] };
      } else {
        merged[key] = userConfig[key];
      }
    });
    
    return merged;
  }

  /**
   * 获取配置值
   */
  get(path, defaultValue = null) {
    const keys = path.split('.');
    let value = this.config;
    
    for (const key of keys) {
      if (value && typeof value === 'object' && key in value) {
        value = value[key];
      } else {
        return defaultValue;
      }
    }
    
    return value;
  }

  /**
   * 设置配置值
   */
  set(path, value) {
    const keys = path.split('.');
    const lastKey = keys.pop();
    let target = this.config;
    
    for (const key of keys) {
      if (!target[key] || typeof target[key] !== 'object') {
        target[key] = {};
      }
      target = target[key];
    }
    
    target[lastKey] = value;
    
    // 保存到本地存储
    this.saveUserConfig(this.extractUserConfig());
  }

  /**
   * 提取用户配置
   */
  extractUserConfig() {
    // 只保存用户可修改的配置
    return {
      app: {
        theme: this.config.app.theme,
        debug: this.config.app.debug
      },
      study: {
        defaultGoal: this.config.study.defaultGoal,
        autoSave: this.config.study.autoSave,
        autoSaveInterval: this.config.study.autoSaveInterval
      },
      ui: {
        pageSize: this.config.ui.pageSize
      },
      data: {
        autoSync: this.config.data.autoSync,
        syncInterval: this.config.data.syncInterval
      }
    };
  }

  /**
   * 重置配置
   */
  reset() {
    if (typeof wx !== 'undefined' && wx.removeStorageSync) {
      wx.removeStorageSync('user_config');
    }
    this.config = this.loadConfig();
  }

  /**
   * 获取环境配置
   */
  getEnvironmentConfig() {
    const isDev = this.get('app.debug', false);
    
    return {
      isDevelopment: isDev,
      isProduction: !isDev,
      apiBaseURL: isDev 
        ? 'http://localhost:3000/api' 
        : this.get('api.baseURL', 'https://api.zhixiao.com'),
      enableLogging: isDev,
      enableMockData: isDev
    };
  }

  /**
   * 导出配置
   */
  export() {
    return JSON.stringify(this.config, null, 2);
  }

  /**
   * 导入配置
   */
  import(configJson) {
    try {
      const importedConfig = JSON.parse(configJson);
      this.config = this.mergeConfig(this.config, importedConfig);
      this.saveUserConfig(this.extractUserConfig());
      return true;
    } catch (error) {
      console.error('导入配置失败:', error);
      return false;
    }
  }
}

// 创建单例实例
const configManager = new ConfigManager();

module.exports = configManager;

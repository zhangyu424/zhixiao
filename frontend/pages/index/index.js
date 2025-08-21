// pages/index/index.js
const { api } = require('../../api/index.js');
const { APISyncManager } = require('../../utils/api/api-sync-manager');

Page({
  data: {
    userInfo: null,
    currentRole: 'student',
    isLogin: false,
    
    // 角色配置
    roleConfig: null,
    
    // 开发模式
    isDevMode: false,
    
    // API同步状态
    apiSyncStatus: null,
    
    // 通知和数据
    notifications: [],
    todayStudyData: {
      studyTime: 0,
      isReported: false
    },
    weekSummary: {
      totalHours: 0,
      completedDays: 0
    }
  },

  onLoad: function(options) {
    console.log('首页加载，选项:', options);
    
    // 初始化API同步管理器
    this.apiSyncManager = new APISyncManager();
    
    // 检查是否指定了角色
    if (options.role) {
      console.log('从选项中获取指定角色:', options.role);
    }
    
    // 检查开发模式
    this.checkDevMode();
    
    // 检查登录状态
    this.checkLoginStatus();
    
    // 检查API同步状态
    this.checkAPISyncStatus();
  },

  onShow: function() {
    // 每次显示时重新检查登录状态
    this.checkLoginStatus();
  },

  // 检查开发模式
  checkDevMode: function() {
    const isDev = typeof __wxConfig !== 'undefined' && __wxConfig.debug;
    this.setData({
      isDevMode: isDev
    });
  },

  // 检查登录状态
  checkLoginStatus: function() {
    const app = getApp();
    let userInfo = app.globalData.userInfo;
    let token = app.globalData.token;
    
    // 如果全局数据为空，尝试从本地存储获取
    if (!userInfo || !token) {
      console.log('全局数据为空，从本地存储获取...');
      userInfo = wx.getStorageSync('userInfo');
      token = wx.getStorageSync('token');
      
      if (userInfo && token) {
        // 更新全局数据
        app.globalData.userInfo = userInfo;
        app.globalData.token = token;
        app.globalData.isLogin = true;
        app.globalData.userRole = userInfo.role || (userInfo.currentRole && userInfo.currentRole.key) || 'student';
      }
    }

    if (!userInfo || !token) {
      console.log('未登录，跳转到登录页');
      // 增加延迟检查，避免登录过程中的竞态条件
      setTimeout(() => {
        const retryUserInfo = wx.getStorageSync('userInfo');
        const retryToken = wx.getStorageSync('token');

        if (!retryUserInfo || !retryToken) {
          wx.reLaunch({
            url: '/pages/unified-login/unified-login'
          });
        } else {
          // 重新设置用户信息
          this.initializeUserData(retryUserInfo);
        }
      }, 500);
      return;
    }

    this.initializeUserData(userInfo);
  },

  // 初始化用户数据
  initializeUserData: function(userInfo) {
    const currentRole = userInfo.role || (userInfo.currentRole && userInfo.currentRole.key) || 'student';
    
    this.setData({
      userInfo: userInfo,
      currentRole: currentRole,
      isLogin: true
    });

    console.log('用户数据初始化完成:', {
      name: userInfo.name,
      role: currentRole,
      roles: userInfo.roles
    });

    // 加载页面数据
    this.loadPageData();
  },

  // 加载页面数据
  loadPageData: function() {
    // 并行加载各种数据
    Promise.all([
      this.loadTodayStudyData(),
      this.loadWeekSummary(),
      this.loadNotifications(),
      this.performAPISync() // 添加API同步
    ]).then(() => {
      console.log('页面数据加载完成');
    }).catch(error => {
      console.error('加载页面数据失败:', error);
    });
  },

  // 加载今日学习数据
  loadTodayStudyData: function() {
    return api.study.getToday()
      .then(result => {
        if (result.success) {
          this.setData({
            todayStudyData: result.data
          });
        }
      })
      .catch(error => {
        console.error('加载今日学习数据失败:', error);
      });
  },

  // 加载本周汇总
  loadWeekSummary: function() {
    return api.study.getWeek()
      .then(result => {
        if (result.success) {
          const completedDays = result.data.records ? result.data.records.length : 0;
          this.setData({
            weekSummary: {
              totalHours: result.data.totalTime || 0,
              completedDays: completedDays
            }
          });
        }
      })
      .catch(error => {
        console.error('加载本周汇总失败:', error);
      });
  },

  // 加载通知
  loadNotifications: function() {
    // 模拟通知数据，实际应该从API获取
    const mockNotifications = [
      {
        id: 1,
        title: '学习提醒',
        content: '今日还未填报学习时间',
        type: 'reminder',
        time: '刚刚'
      }
    ];
    
    this.setData({
      notifications: mockNotifications
    });
    
    return Promise.resolve();
  },

  // 检查API同步状态
  checkAPISyncStatus: function() {
    if (this.apiSyncManager) {
      const status = this.apiSyncManager.getSyncStatus();
      this.setData({
        apiSyncStatus: status
      });
      
      // 如果从未同步过，提示进行首次同步
      if (status.status === 'never_synced') {
        console.log('📋 首次启动，建议进行API同步');
      }
    }
  },

  // 执行API同步
  async performAPISync() {
    if (!this.apiSyncManager) return;
    
    try {
      console.log('🔄 开始后台API同步...');
      const result = await this.apiSyncManager.syncAPIDocumentation();
      
      if (result.success) {
        console.log('✅ API同步完成');
        
        // 更新同步状态
        this.checkAPISyncStatus();
        
        // 如果有需要后端处理的内容，显示通知
        if (result.data && result.data.status === 'pending_backend_implementation') {
          this.addNotification({
            id: Date.now(),
            title: 'API同步提醒',
            content: '检测到新的API需求，需要后端开发配合',
            type: 'api_sync',
            time: '刚刚',
            action: 'view_api_status'
          });
        }
      }
    } catch (error) {
      console.error('❌ API同步失败:', error);
      
      // 添加错误通知
      this.addNotification({
        id: Date.now(),
        title: 'API同步失败',
        content: error.message || '同步过程中发生错误',
        type: 'error',
        time: '刚刚',
        action: 'view_api_status'
      });
    }
  },

  // 添加通知
  addNotification: function(notification) {
    const notifications = this.data.notifications;
    notifications.unshift(notification); // 添加到开头
    
    this.setData({
      notifications: notifications.slice(0, 5) // 只保留最新5条
    });
  },

  // 角色配置变化处理
  onRoleConfigChanged: function(e) {
    const { config } = e.detail;
    this.setData({
      roleConfig: config
    });
    
    // 根据角色更新页面标题
    wx.setNavigationBarTitle({
      title: config.title
    });
  },

  // 功能点击处理
  onFeatureClick: function(e) {
    const { feature, role } = e.detail;
    console.log('功能点击:', feature, '角色:', role);
    
    this.handleFeatureNavigation(feature, role);
  },

  // 处理功能导航
  handleFeatureNavigation: function(feature, role) {
    const navigationMap = {
      // 学员功能
      'study-report': '/pages/study-report/study-report',
      'personal-analysis': '/pages/analysis/analysis?type=personal',
      'study-calendar': '/pages/study-calendar/study-calendar',
      'achievements': '/pages/achievements/achievements',
      
      // 层级长功能
      'team-overview': '/pages/team-overview/team-overview',
      'team-analysis': '/pages/analysis/analysis?type=team',
      'member-management': '/pages/member-management/member-management',
      'progress-tracking': '/pages/progress-tracking/progress-tracking',
      
      // 管理员功能
      'data-overview': '/pages/data-overview/data-overview',
      'user-management': '/pages/management/management?tab=users',
      'data-import-export': '/pages/management/management?tab=import',
      'reports': '/pages/reports/reports',
      
      // 超级管理员功能
      'system-settings': '/pages/management/management?tab=settings',
      'organization-management': '/pages/management/management?tab=organization',
      'permission-management': '/pages/permission-management/permission-management',
      'system-logs': '/pages/system-logs/system-logs',
      'global-overview': '/pages/global-overview/global-overview',
      'performance-monitor': '/pages/performance-monitor/performance-monitor',
      'error-tracking': '/pages/error-tracking/error-tracking',
      'backup-restore': '/pages/backup-restore/backup-restore',
      
      // 新增功能
      'api-sync-status': '/pages/api-sync-status/api-sync-status',
      'backend-test': '/pages/backend-test/backend-test'
    };
    
    const targetUrl = navigationMap[feature];
    
    if (targetUrl) {
      // 检查页面是否存在
      if (this.isPageExists(targetUrl)) {
        wx.navigateTo({
          url: targetUrl,
          fail: (error) => {
            console.error('页面跳转失败:', error);
            // 如果是tabBar页面，使用switchTab
            if (this.isTabBarPage(targetUrl)) {
              wx.switchTab({
                url: targetUrl.split('?')[0] // 移除查询参数
              });
            } else {
              wx.showToast({
                title: '页面暂未开放',
                icon: 'none'
              });
            }
          }
        });
      } else {
        wx.showToast({
          title: '功能开发中',
          icon: 'none'
        });
      }
    } else {
      wx.showToast({
        title: '未知功能',
        icon: 'none'
      });
    }
  },

  // 检查页面是否存在
  isPageExists: function(url) {
    const existingPages = [
      '/pages/study-report/study-report',
      '/pages/analysis/analysis',
      '/pages/management/management',
      '/pages/profile/profile',
      '/pages/role-switch/role-switch',
      '/pages/api-sync-status/api-sync-status',
      '/pages/backend-test/backend-test'
    ];
    
    const pagePath = url.split('?')[0];
    return existingPages.includes(pagePath);
  },

  // 检查是否为tabBar页面
  isTabBarPage: function(url) {
    const tabBarPages = [
      '/pages/index/index',
      '/pages/study-report/study-report',
      '/pages/analysis/analysis',
      '/pages/management/management',
      '/pages/profile/profile'
    ];
    
    const pagePath = url.split('?')[0];
    return tabBarPages.includes(pagePath);
  },

  // 角色切换处理
  onRoleSwitch: function() {
    const userInfo = this.data.userInfo;
    
    if (userInfo.roles && userInfo.roles.length > 1) {
      wx.navigateTo({
        url: '/pages/role-switch/role-switch'
      });
    } else {
      wx.showToast({
        title: '您只有一个角色',
        icon: 'none'
      });
    }
  },

  // 快速学习填报
  quickReport: function() {
    if (this.data.todayStudyData.isReported) {
      wx.showToast({
        title: '今日已填报',
        icon: 'none'
      });
      return;
    }
    
    wx.navigateTo({
      url: '/pages/study-report/study-report'
    });
  },

  // 查看个人统计
  viewPersonalStats: function() {
    wx.navigateTo({
      url: '/pages/analysis/analysis?type=personal'
    });
  },

  // 查看团队数据（层级长）
  viewTeamData: function() {
    wx.navigateTo({
      url: '/pages/analysis/analysis?type=team'
    });
  },

  // 打开测试页面
  openTestPage: function() {
    wx.navigateTo({
      url: '/pages/backend-test/backend-test'
    });
  },

  // 打开状态监控
  openStatusPage: function() {
    wx.navigateTo({
      url: '/pages/backend-test/backend-test'
    });
  },

  // 处理通知点击
  onNotificationClick: function(e) {
    const notification = e.currentTarget.dataset.notification;
    console.log('通知点击:', notification);
    
    // 根据通知类型处理
    switch (notification.type) {
    case 'reminder':
      this.quickReport();
      break;
    case 'api_sync':
    case 'error':
      if (notification.action === 'view_api_status') {
        wx.navigateTo({
          url: '/pages/api-sync-status/api-sync-status'
        });
      } else if (notification.action === 'open_backend_test') {
        wx.navigateTo({
          url: '/pages/backend-test/backend-test'
        });
      }
      break;
    default:
      wx.showToast({
        title: '查看详情',
        icon: 'none'
      });
      break;
    }
  },

  // 打开API同步状态页面
  openAPISyncStatus: function() {
    wx.navigateTo({
      url: '/pages/api-sync-status/api-sync-status'
    });
  },

  // 手动触发API同步
  triggerAPISync: function() {
    wx.showLoading({ title: '同步中...' });
    
    this.performAPISync().finally(() => {
      wx.hideLoading();
    });
  },

  // 打开后端测试页面
  openBackendTest: function() {
    wx.navigateTo({
      url: '/pages/backend-test/backend-test'
    });
  },

  // 快速后端连通性检查
  async quickBackendCheck() {
    wx.showLoading({ title: '检查中...' });
    
    try {
      // 简单的连通性检查
      const app = getApp();
      const baseUrl = app.globalData.baseUrl || 'https://your-api-domain.com/api';
      
      const result = await new Promise((resolve) => {
        wx.request({
          url: `${baseUrl}/auth/validate-token`,
          method: 'GET',
          timeout: 5000,
          success: (res) => {
            resolve({ 
              success: true, 
              status: res.statusCode,
              message: '后端服务响应正常'
            });
          },
          fail: (error) => {
            resolve({ 
              success: false, 
              error: error.errMsg,
              message: '后端服务连接失败'
            });
          }
        });
      });

      wx.hideLoading();
      
      if (result.success) {
        wx.showToast({
          title: '后端可用',
          icon: 'success'
        });
        
        // 添加成功通知
        this.addNotification({
          id: Date.now(),
          title: '后端状态',
          content: '后端服务连接正常',
          type: 'success',
          time: '刚刚'
        });
      } else {
        wx.showModal({
          title: '后端连接失败',
          content: result.message,
          showCancel: true,
          confirmText: '详细测试',
          success: (res) => {
            if (res.confirm) {
              this.openBackendTest();
            }
          }
        });
        
        // 添加失败通知
        this.addNotification({
          id: Date.now(),
          title: '后端状态',
          content: '后端服务连接异常，点击查看详情',
          type: 'error',
          time: '刚刚',
          action: 'open_backend_test'
        });
      }
    } catch (error) {
      wx.hideLoading();
      console.error('后端检查异常:', error);
      
      wx.showToast({
        title: '检查失败',
        icon: 'none'
      });
    }
  },

  // 页面分享
  onShareAppMessage: function() {
    return {
      title: '学习质效分析系统',
      path: '/pages/unified-login/unified-login',
      imageUrl: ''
    };
  }
});

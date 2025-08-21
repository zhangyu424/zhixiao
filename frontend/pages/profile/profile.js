// pages/profile/profile.js
Page({
  data: {
    userInfo: null,
    currentRole: 'student',
    availableRoles: [],
    showRoleSwitch: false,
    settingsItems: [
      {
        icon: '🔔',
        title: '消息提醒',
        desc: '订阅每日填报提醒',
        type: 'notification',
        hasSwitch: true,
        enabled: false
      },
      {
        icon: '🔒',
        title: '修改密码',
        desc: '更改登录密码',
        type: 'password',
        hasArrow: true
      },
      {
        icon: 'ℹ️',
        title: '关于我们',
        desc: '了解应用信息',
        type: 'about',
        hasArrow: true
      }
    ]
  },

  onLoad: function (options) {
    this.loadUserInfo();
    this.checkNotificationStatus();
  },

  onShow: function () {
    this.loadUserInfo();
  },

  // 加载用户信息
  loadUserInfo: function () {
    const userInfo = wx.getStorageSync('userInfo');
    if (!userInfo) {
      wx.redirectTo({
        url: '/pages/unified-login/unified-login'
      });
      return;
    }

    // 检查是否有多个角色
    const availableRoles = userInfo.roles || [userInfo.role];
    const showRoleSwitch = availableRoles.length > 1;

    this.setData({
      userInfo: userInfo,
      currentRole: userInfo.currentRole || userInfo.role,
      availableRoles: availableRoles,
      showRoleSwitch: showRoleSwitch
    });
  },

  // 检查通知状态
  checkNotificationStatus: function () {
    const hasSubscribed = wx.getStorageSync('hasSubscribed');

    this.setData({
      [`settingsItems[0].enabled`]: hasSubscribed
    });
  },

  // 角色切换
  onRoleSwitch: function () {
    wx.navigateTo({
      url: '/pages/role-switch/role-switch'
    });
  },

  // 设置项点击
  onSettingTap: function (e) {
    const item = e.currentTarget.dataset.item;

    switch (item.type) {
      case 'notification':
        this.handleNotification(item);
        break;
      case 'password':
        this.changePassword();
        break;
      case 'about':
        this.showAbout();
        break;
    }
  },

  // 处理通知设置
  handleNotification: function (item) {
    if (item.enabled) {
      // 取消订阅
      wx.showModal({
        title: '确认取消',
        content: '确定要取消每日提醒订阅吗？',
        success: res => {
          if (res.confirm) {
            wx.removeStorageSync('hasSubscribed');
            this.setData({
              [`settingsItems[0].enabled`]: false
            });
            wx.showToast({
              title: '已取消订阅',
              icon: 'success'
            });
          }
        }
      });
    } else {
      // 订阅提醒
      this.subscribeNotification();
    }
  },

  // 订阅通知
  subscribeNotification: function () {
    wx.requestSubscribeMessage({
      tmplIds: ['模板ID'], // 替换为实际的模板ID
      success: res => {
        if (res['模板ID'] === 'accept') {
          wx.setStorageSync('hasSubscribed', true);
          this.setData({
            [`settingsItems[0].enabled`]: true
          });

          wx.showToast({
            title: '订阅成功',
            icon: 'success'
          });
        } else {
          wx.showToast({
            title: '订阅失败',
            icon: 'none'
          });
        }
      },
      fail: () => {
        wx.showToast({
          title: '订阅失败',
          icon: 'none'
        });
      }
    });
  },

  // 修改密码
  changePassword: function () {
    wx.navigateTo({
      url: '/pages/change-password/change-password'
    });
  },

  // 关于我们
  showAbout: function () {
    wx.showModal({
      title: '学习质效分析',
      content:
        '版本：1.0.0\n\n本应用致力于帮助学员分析学习投入与产出的关系，提升学习效率。\n\n如有问题请联系管理员。',
      showCancel: false,
      confirmText: '知道了'
    });
  },

  // 查看个人统计
  viewPersonalStats: function () {
    wx.navigateTo({
      url: '/pages/personal-stats/personal-stats'
    });
  },

  // 编辑个人信息
  editProfile: function () {
    wx.showModal({
      title: '提示',
      content: '个人基本信息由管理员维护，如需修改请联系管理员',
      showCancel: false,
      confirmText: '知道了'
    });
  },

  // 退出登录
  logout: function () {
    wx.showModal({
      title: '确认退出',
      content: '确定要退出登录吗？',
      success: res => {
        if (res.confirm) {
          const app = getApp();
          app.logout();

          wx.reLaunch({
            url: '/pages/unified-login/unified-login'
          });
        }
      }
    });
  },

  // 联系管理员
  contactAdmin: function () {
    wx.showModal({
      title: '联系管理员',
      content:
        '请通过以下方式联系管理员：\n\n电话：010-12345678\n邮箱：admin@example.com\n\n或咨询所属单位负责人。',
      showCancel: false,
      confirmText: '知道了'
    });
  }
});

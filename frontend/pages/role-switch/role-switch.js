// pages/role-switch/role-switch.js
Page({
  data: {
    userInfo: null,
    currentRole: '',
    availableRoles: []
  },

  onLoad: function (options) {
    this.loadUserInfo();
  },

  loadUserInfo: function () {
    const userInfo = wx.getStorageSync('userInfo');
    if (!userInfo) {
      wx.navigateBack();
      return;
    }

    const roleNames = {
      student: '学员',
      instructor: '层级长',
      manager: '信息管理员',
      admin: '超级管理员'
    };

    const availableRoles = (userInfo.roles || [userInfo.role]).map(role => ({
      key: role,
      name: roleNames[role] || role,
      isActive: role === (userInfo.currentRole || userInfo.role)
    }));

    this.setData({
      userInfo: userInfo,
      currentRole: userInfo.currentRole || userInfo.role,
      availableRoles: availableRoles
    });
  },

  onRoleSelect: function (e) {
    const roleKey = e.currentTarget.dataset.role;

    if (roleKey === this.data.currentRole) {
      wx.navigateBack();
      return;
    }

    wx.showModal({
      title: '确认切换',
      content: `确定要切换到${this.data.availableRoles.find(r => r.key === roleKey).name}身份吗？`,
      success: res => {
        if (res.confirm) {
          this.switchRole(roleKey);
        }
      }
    });
  },

  switchRole: function (roleKey) {
    wx.showLoading({
      title: '切换中...'
    });

    const app = getApp();

    app.request({
      url: '/auth/switch-role',
      method: 'POST',
      data: {
        role: roleKey
      },
      success: res => {
        wx.hideLoading();

        if (res.success) {
          // 更新本地存储的用户信息
          const userInfo = wx.getStorageSync('userInfo');
          userInfo.currentRole = roleKey;
          wx.setStorageSync('userInfo', userInfo);

          // 更新全局数据
          app.globalData.userRole = roleKey;

          wx.showToast({
            title: '切换成功',
            icon: 'success'
          });

          setTimeout(() => {
            wx.reLaunch({
              url: '/pages/index/index'
            });
          }, 1500);
        } else {
          wx.showToast({
            title: res.message || '切换失败',
            icon: 'none'
          });
        }
      },
      fail: () => {
        wx.hideLoading();
        wx.showToast({
          title: '网络错误',
          icon: 'none'
        });
      }
    });
  }
});

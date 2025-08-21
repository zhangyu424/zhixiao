// pages/login/login.js
const { api } = require('../../api/index.js');
const storageHelper = require('../../utils/common/storage-helper.js');

Page({
  data: {
    // 登录表单数据
    loginForm: {
      username: '', // 用户名（学号或admin）
      password: ''  // 密码
    },
    
    // 界面状态
    loginLoading: false, // 登录中
    showPassword: false, // 密码可见性
    
    // 应用信息
    appInfo: {
      name: '智效学习平台',
      subtitle: '学习质效分析系统'
    }
  },

  onLoad: function() {
    // 检查是否已登录
    const token = storageHelper.getToken();
    if (token) {
      this.redirectToHome();
    }
  },

  // 用户名输入
  onUsernameInput: function(e) {
    this.setData({
      'loginForm.username': e.detail.value
    });
  },

  // 密码输入
  onPasswordInput: function(e) {
    this.setData({
      'loginForm.password': e.detail.value
    });
  },

  // 切换密码可见性
  togglePasswordVisibility: function() {
    this.setData({
      showPassword: !this.data.showPassword
    });
  },

  // 用户名密码登录
  async onAccountLogin() {
    const { username, password } = this.data.loginForm;
    
    // 表单验证
    if (!username.trim()) {
      wx.showToast({
        title: '请输入用户名',
        icon: 'none'
      });
      return;
    }
    
    if (!password.trim()) {
      wx.showToast({
        title: '请输入密码',
        icon: 'none'
      });
      return;
    }

    this.setData({ loginLoading: true });

    try {
      // 调用登录API
      const response = await api.auth.login({
        username: username.trim(),
        password: password.trim()
      });

      if (response.success) {
        // 存储用户信息和token
        storageHelper.setToken(response.data.accessToken);
        storageHelper.setRefreshToken(response.data.refreshToken);
        storageHelper.setUserInfo(response.data.userInfo);

        wx.showToast({
          title: '登录成功',
          icon: 'success'
        });

        // 检查是否首次登录
        if (response.data.userInfo.isFirstLogin) {
          // 跳转到首次登录修改密码页面
          wx.redirectTo({
            url: '/pages/change-password-first/change-password-first'
          });
        } else {
          // 跳转到主页
          this.redirectToHome();
        }
      } else {
        wx.showToast({
          title: response.message || '登录失败',
          icon: 'none'
        });
      }
    } catch (error) {
      wx.showToast({
        title: '网络错误，请重试',
        icon: 'none'
      });
    } finally {
      this.setData({ loginLoading: false });
    }
  },

  // 微信登录
  async onWechatLogin() {
    this.setData({ loginLoading: true });

    try {
      // 获取微信登录code
      const loginRes = await wx.login();
      
      if (loginRes.code) {
        // 调用微信登录API
        const response = await api.auth.wxlogin({
          code: loginRes.code
        });

        if (response.success) {
          // 存储用户信息和token
          storageHelper.setToken(response.data.accessToken);
          storageHelper.setRefreshToken(response.data.refreshToken);
          storageHelper.setUserInfo(response.data.userInfo);

          wx.showToast({
            title: '登录成功',
            icon: 'success'
          });

          // 检查是否首次登录
          if (response.data.userInfo.isFirstLogin) {
            // 跳转到首次登录修改密码页面
            wx.redirectTo({
              url: '/pages/change-password-first/change-password-first'
            });
          } else {
            // 跳转到主页
            this.redirectToHome();
          }
        } else {
          wx.showToast({
            title: response.message || '微信登录失败',
            icon: 'none'
          });
        }
      } else {
        wx.showToast({
          title: '获取微信授权失败',
          icon: 'none'
        });
      }
    } catch (error) {
      wx.showToast({
        title: '网络错误，请重试',
        icon: 'none'
      });
    } finally {
      this.setData({ loginLoading: false });
    }
  },

  // 忘记密码
  onForgotPassword: function() {
    wx.navigateTo({
      url: '/pages/forgot-password/forgot-password'
    });
  },

  // 根据用户角色跳转到对应主页
  redirectToHome: function() {
    const userInfo = storageHelper.getUserInfo();
    if (userInfo && userInfo.roles && userInfo.roles.length > 0) {
      const primaryRole = userInfo.roles[0].role;
      
      switch (primaryRole) {
      case 'student':
        wx.switchTab({
          url: '/pages/study-report/study-report'
        });
        break;
      case 'leader':
        wx.switchTab({
          url: '/pages/study-report/study-report'
        });
        break;
      case 'manager':
        wx.switchTab({
          url: '/pages/management/system'
        });
        break;
      case 'admin':
        wx.switchTab({
          url: '/pages/management/system'
        });
        break;
      default:
        wx.switchTab({
          url: '/pages/index/index'
        });
      }
    } else {
      wx.switchTab({
        url: '/pages/index/index'
      });
    }
  }
});

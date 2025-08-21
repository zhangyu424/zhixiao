// pages/change-password-first/change-password-first.js
const { api } = require('../../api/index.js');
const storageHelper = require('../../utils/common/storage-helper.js');

Page({
  data: {
    // 表单数据
    form: {
      oldPassword: '',
      newPassword: '',
      confirmPassword: '',
      phone: '',
      verificationCode: ''
    },
    
    // 验证码状态
    codeStatus: {
      loading: false,
      countdown: 0,
      text: '获取验证码'
    },
    
    // 页面状态
    submitLoading: false,
    
    // 用户信息
    userInfo: null
  },

  onLoad: function() {
    // 获取用户信息
    const userInfo = storageHelper.getUserInfo();
    if (!userInfo || !userInfo.isFirstLogin) {
      // 如果不是首次登录，跳转到主页
      wx.switchTab({
        url: '/pages/index/index'
      });
      return;
    }
    
    this.setData({
      userInfo: userInfo
    });
  },

  // 当前密码输入
  onOldPasswordInput: function(e) {
    this.setData({
      'form.oldPassword': e.detail.value
    });
  },

  // 新密码输入
  onNewPasswordInput: function(e) {
    this.setData({
      'form.newPassword': e.detail.value
    });
  },

  // 确认密码输入
  onConfirmPasswordInput: function(e) {
    this.setData({
      'form.confirmPassword': e.detail.value
    });
  },

  // 手机号输入
  onPhoneInput: function(e) {
    this.setData({
      'form.phone': e.detail.value
    });
  },

  // 验证码输入
  onCodeInput: function(e) {
    this.setData({
      'form.verificationCode': e.detail.value
    });
  },

  // 发送验证码
  async sendVerificationCode() {
    const { phone } = this.data.form;
    
    // 验证手机号格式
    const phoneRegex = /^1[3-9]\d{9}$/;
    if (!phoneRegex.test(phone)) {
      wx.showToast({
        title: '请输入正确的手机号',
        icon: 'none'
      });
      return;
    }

    this.setData({
      'codeStatus.loading': true
    });

    try {
      // 这里应该调用发送验证码的API
      // 暂时模拟成功
      wx.showToast({
        title: '验证码已发送',
        icon: 'success'
      });
      
      // 开始倒计时
      this.startCountdown();
    } catch (error) {
      wx.showToast({
        title: '发送失败，请重试',
        icon: 'none'
      });
    } finally {
      this.setData({
        'codeStatus.loading': false
      });
    }
  },

  // 倒计时
  startCountdown() {
    let countdown = 60;
    this.setData({
      'codeStatus.countdown': countdown,
      'codeStatus.text': `${countdown}s后重发`
    });

    const timer = setInterval(() => {
      countdown--;
      if (countdown <= 0) {
        clearInterval(timer);
        this.setData({
          'codeStatus.countdown': 0,
          'codeStatus.text': '获取验证码'
        });
      } else {
        this.setData({
          'codeStatus.countdown': countdown,
          'codeStatus.text': `${countdown}s后重发`
        });
      }
    }, 1000);
  },

  // 提交修改
  async submitChange() {
    const { oldPassword, newPassword, confirmPassword, phone, verificationCode } = this.data.form;
    
    // 表单验证
    if (!oldPassword.trim()) {
      wx.showToast({
        title: '请输入当前密码',
        icon: 'none'
      });
      return;
    }
    
    if (!newPassword.trim()) {
      wx.showToast({
        title: '请输入新密码',
        icon: 'none'
      });
      return;
    }
    
    if (newPassword.length < 6) {
      wx.showToast({
        title: '新密码至少6位字符',
        icon: 'none'
      });
      return;
    }
    
    if (newPassword !== confirmPassword) {
      wx.showToast({
        title: '两次密码输入不一致',
        icon: 'none'
      });
      return;
    }
    
    const phoneRegex = /^1[3-9]\d{9}$/;
    if (!phoneRegex.test(phone)) {
      wx.showToast({
        title: '请输入正确的手机号',
        icon: 'none'
      });
      return;
    }
    
    if (!verificationCode.trim()) {
      wx.showToast({
        title: '请输入验证码',
        icon: 'none'
      });
      return;
    }

    this.setData({ submitLoading: true });

    try {
      const response = await api.auth.changePassword({
        oldPassword: oldPassword.trim(),
        newPassword: newPassword.trim(),
        phone: phone.trim()
      });

      if (response.success) {
        wx.showToast({
          title: '修改成功',
          icon: 'success'
        });
        
        // 清除登录状态，重新登录
        storageHelper.clearAuthData();
        
        setTimeout(() => {
          wx.reLaunch({
            url: '/pages/login/login'
          });
        }, 1500);
      } else {
        wx.showToast({
          title: response.message || '修改失败',
          icon: 'none'
        });
      }
    } catch (error) {
      wx.showToast({
        title: '网络错误，请重试',
        icon: 'none'
      });
    } finally {
      this.setData({ submitLoading: false });
    }
  }
});

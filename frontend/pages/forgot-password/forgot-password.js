// pages/forgot-password/forgot-password.js
const { api } = require('../../api/index.js');

Page({
  data: {
    // 表单数据
    form: {
      student_id: '',
      phone: '',
      verificationCode: '',
      newPassword: '',
      confirmPassword: ''
    },
    
    // 验证码状态
    codeStatus: {
      loading: false,
      countdown: 0,
      text: '获取验证码'
    },
    
    // 页面状态
    resetLoading: false
  },

  onLoad: function() {
    // 页面加载
  },

  // 学号输入
  onStudentIdInput: function(e) {
    this.setData({
      'form.student_id': e.detail.value
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

  // 发送验证码
  async sendVerificationCode() {
    const { student_id, phone } = this.data.form;
    
    // 验证学号
    if (!student_id.trim()) {
      wx.showToast({
        title: '请输入学号',
        icon: 'none'
      });
      return;
    }
    
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

  // 重置密码
  async resetPassword() {
    const { student_id, phone, verificationCode, newPassword, confirmPassword } = this.data.form;
    
    // 表单验证
    if (!student_id.trim()) {
      wx.showToast({
        title: '请输入学号',
        icon: 'none'
      });
      return;
    }
    
    if (!phone.trim()) {
      wx.showToast({
        title: '请输入手机号',
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
    
    if (!newPassword.trim()) {
      wx.showToast({
        title: '请输入新密码',
        icon: 'none'
      });
      return;
    }
    
    if (newPassword.length < 6) {
      wx.showToast({
        title: '密码至少6位字符',
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

    this.setData({ resetLoading: true });

    try {
      const response = await api.auth.forgotPassword({
        student_id: student_id.trim(),
        phone: phone.trim(),
        newPassword: newPassword.trim()
      });

      if (response.success) {
        wx.showToast({
          title: '密码重置成功',
          icon: 'success'
        });
        
        setTimeout(() => {
          wx.navigateBack();
        }, 1500);
      } else {
        wx.showToast({
          title: response.message || '重置失败',
          icon: 'none'
        });
      }
    } catch (error) {
      wx.showToast({
        title: '网络错误，请重试',
        icon: 'none'
      });
    } finally {
      this.setData({ resetLoading: false });
    }
  },

  // 返回登录页
  goBack: function() {
    wx.navigateBack();
  }
});

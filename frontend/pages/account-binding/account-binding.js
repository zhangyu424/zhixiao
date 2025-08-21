// pages/account-binding/account-binding.js
// 账号绑定页面
const { api } = require('../../api/index.js');
const storageHelper = require('../../utils/common/storage-helper.js');

Page({
  data: {
    // 微信数据
    wechatInfo: {
      openid: '',
      unionid: '',
      userProfile: null
    },
    
    // 绑定表单
    bindingForm: {
      account: '', // 账号（学员编号、工号、手机号等）
      password: '', // 密码
      bindingType: 'account' // 绑定类型：account(账号密码) / phone(手机验证码)
    },
    
    // 手机验证码绑定
    phoneBinding: {
      phone: '',
      captcha: '',
      captchaLoading: false,
      captchaText: '获取验证码',
      captchaCountdown: 0
    },
    
    // 界面状态
    bindingLoading: false,
    showPasswordInput: true,
    
    // 账号搜索结果
    searchResults: [],
    showSearchResults: false,
    
    // 步骤指示
    currentStep: 1, // 1: 选择绑定方式, 2: 输入信息, 3: 确认绑定
    totalSteps: 3
  },

  onLoad: function(options) {
    // 获取微信登录传递的参数
    if (options.openid) {
      this.setData({
        'wechatInfo.openid': options.openid,
        'wechatInfo.unionid': options.unionid || ''
      });
    }
    
    // 获取微信用户信息
    this.getWechatUserInfo();
  },

  // 获取微信用户信息
  getWechatUserInfo: function() {
    // 从全局数据或本地存储中获取微信用户信息
    const app = getApp();
    if (app.globalData.tempWechatProfile) {
      this.setData({
        'wechatInfo.userProfile': app.globalData.tempWechatProfile
      });
    }
  },

  // 切换绑定方式
  switchBindingType: function(e) {
    const type = e.currentTarget.dataset.type;
    this.setData({
      'bindingForm.bindingType': type,
      currentStep: 2
    });
    
    if (type === 'phone') {
      this.resetAccountForm();
    } else {
      this.resetPhoneForm();
    }
  },

  resetAccountForm: function() {
    this.setData({
      'bindingForm.account': '',
      'bindingForm.password': '',
      searchResults: [],
      showSearchResults: false
    });
  },

  resetPhoneForm: function() {
    this.setData({
      'phoneBinding.phone': '',
      'phoneBinding.captcha': '',
      'phoneBinding.captchaCountdown': 0,
      'phoneBinding.captchaText': '获取验证码'
    });
  },

  // 返回上一步
  goBack: function() {
    if (this.data.currentStep > 1) {
      this.setData({
        currentStep: this.data.currentStep - 1
      });
    } else {
      wx.navigateBack();
    }
  },

  // 输入事件处理
  onAccountInput: function(e) {
    const account = e.detail.value;
    this.setData({
      'bindingForm.account': account
    });
    
    // 实时搜索账号（防抖）
    clearTimeout(this.searchTimer);
    if (account.length >= 2) {
      this.searchTimer = setTimeout(() => {
        this.searchAccount(account);
      }, 500);
    } else {
      this.setData({
        searchResults: [],
        showSearchResults: false
      });
    }
  },

  onPasswordInput: function(e) {
    this.setData({
      'bindingForm.password': e.detail.value
    });
  },

  onPhoneInput: function(e) {
    this.setData({
      'phoneBinding.phone': e.detail.value
    });
  },

  onCaptchaInput: function(e) {
    this.setData({
      'phoneBinding.captcha': e.detail.value
    });
  },

  // 切换密码显示
  togglePasswordVisibility: function() {
    this.setData({
      showPasswordInput: !this.data.showPasswordInput
    });
  },

  // 搜索账号
  searchAccount: function(keyword) {
    if (!keyword.trim()) return;
    
    api.user.searchAccount({ keyword })
      .then(result => {
        if (result.success && result.data) {
          this.setData({
            searchResults: result.data.slice(0, 5), // 最多显示5个结果
            showSearchResults: result.data.length > 0
          });
        } else {
          this.setData({
            searchResults: [],
            showSearchResults: false
          });
        }
      })
      .catch(error => {
        console.error('搜索账号失败:', error);
        this.setData({
          searchResults: [],
          showSearchResults: false
        });
      });
  },

  // 选择搜索结果
  selectSearchResult: function(e) {
    const account = e.currentTarget.dataset.account;
    this.setData({
      'bindingForm.account': account,
      searchResults: [],
      showSearchResults: false
    });
  },

  // 发送手机验证码
  sendCaptcha: function() {
    const phone = this.data.phoneBinding.phone;
    
    if (!this.validatePhone(phone)) {
      wx.showToast({
        title: '请输入正确的手机号',
        icon: 'none'
      });
      return;
    }

    this.setData({
      'phoneBinding.captchaLoading': true
    });

    api.auth.sendCaptcha({ 
      phone,
      type: 'binding' // 指定为绑定验证码
    })
      .then(result => {
        this.setData({
          'phoneBinding.captchaLoading': false
        });
        
        if (result.success) {
          wx.showToast({
            title: '验证码已发送',
            icon: 'success'
          });
          
          this.startCaptchaCountdown();
        } else {
          wx.showToast({
            title: result.message || '发送失败',
            icon: 'none'
          });
        }
      })
      .catch(error => {
        this.setData({
          'phoneBinding.captchaLoading': false
        });
        
        wx.showToast({
          title: '网络错误',
          icon: 'none'
        });
      });
  },

  startCaptchaCountdown: function() {
    let countdown = 60;
    this.setData({
      'phoneBinding.captchaCountdown': countdown,
      'phoneBinding.captchaText': `${countdown}s后重新发送`
    });

    const timer = setInterval(() => {
      countdown--;
      if (countdown > 0) {
        this.setData({
          'phoneBinding.captchaCountdown': countdown,
          'phoneBinding.captchaText': `${countdown}s后重新发送`
        });
      } else {
        clearInterval(timer);
        this.setData({
          'phoneBinding.captchaCountdown': 0,
          'phoneBinding.captchaText': '获取验证码'
        });
      }
    }, 1000);
  },

  // 执行账号绑定
  performBinding: function() {
    const bindingType = this.data.bindingForm.bindingType;
    
    if (bindingType === 'account') {
      this.bindWithAccount();
    } else if (bindingType === 'phone') {
      this.bindWithPhone();
    }
  },

  // 账号密码绑定
  bindWithAccount: function() {
    const { account, password } = this.data.bindingForm;
    const { openid, unionid } = this.data.wechatInfo;
    
    if (!account.trim()) {
      wx.showToast({
        title: '请输入账号',
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

    this.setData({ 
      bindingLoading: true,
      currentStep: 3
    });

    wx.showLoading({
      title: '绑定中...'
    });

    api.auth.bindAccount({
      openid,
      unionid,
      account: account.trim(),
      password: password.trim()
    })
    .then(result => {
      wx.hideLoading();
      this.setData({ bindingLoading: false });
      
      if (result.success) {
        this.handleBindingSuccess(result.data);
      } else {
        this.handleBindingError(result);
      }
    })
    .catch(error => {
      wx.hideLoading();
      this.setData({ bindingLoading: false });
      
      console.error('账号绑定失败:', error);
      this.handleNetworkError(error);
    });
  },

  // 手机验证码绑定
  bindWithPhone: function() {
    const { phone, captcha } = this.data.phoneBinding;
    const { openid, unionid } = this.data.wechatInfo;
    
    if (!this.validatePhone(phone)) {
      wx.showToast({
        title: '请输入正确的手机号',
        icon: 'none'
      });
      return;
    }
    
    if (!captcha.trim()) {
      wx.showToast({
        title: '请输入验证码',
        icon: 'none'
      });
      return;
    }

    this.setData({ 
      bindingLoading: true,
      currentStep: 3
    });

    wx.showLoading({
      title: '绑定中...'
    });

    api.auth.bindPhone({
      openid,
      unionid,
      phone: phone.trim(),
      captcha: captcha.trim()
    })
    .then(result => {
      wx.hideLoading();
      this.setData({ bindingLoading: false });
      
      if (result.success) {
        this.handleBindingSuccess(result.data);
      } else {
        this.handleBindingError(result);
      }
    })
    .catch(error => {
      wx.hideLoading();
      this.setData({ bindingLoading: false });
      
      console.error('手机绑定失败:', error);
      this.handleNetworkError(error);
    });
  },

  // 绑定成功处理
  handleBindingSuccess: function(bindingData) {
    try {
      // 验证绑定数据
      if (!bindingData.token) {
        throw new Error('绑定数据缺少token');
      }
      
      if (!bindingData.user && !bindingData.userInfo) {
        throw new Error('绑定数据缺少用户信息');
      }

      const userInfo = bindingData.user || bindingData.userInfo;
      
      // 数据清理和标准化
      const cleanUserData = this.cleanUserData(userInfo);
      
      // 保存登录数据
      this.saveLoginData(bindingData.token, cleanUserData);
      
      wx.showToast({
        title: '绑定成功',
        icon: 'success'
      });
      
      // 延迟跳转
      setTimeout(() => {
        this.navigateToMainPage(cleanUserData);
      }, 1500);
      
    } catch (error) {
      console.error('处理绑定成功数据失败:', error);
      wx.showToast({
        title: '绑定数据处理失败',
        icon: 'none'
      });
    }
  },

  // 绑定错误处理
  handleBindingError: function(result) {
    this.setData({
      currentStep: 2 // 返回输入步骤
    });
    
    switch (result.code) {
      case 'ACCOUNT_NOT_FOUND':
        wx.showModal({
          title: '账号不存在',
          content: '未找到该账号，请检查输入是否正确或联系管理员',
          showCancel: false
        });
        break;
        
      case 'PASSWORD_ERROR':
        wx.showModal({
          title: '密码错误',
          content: '账号或密码不正确，请重新输入',
          showCancel: false
        });
        break;
        
      case 'ACCOUNT_ALREADY_BOUND':
        wx.showModal({
          title: '账号已绑定',
          content: '该账号已绑定其他微信，一个账号只能绑定一个微信',
          showCancel: false
        });
        break;
        
      case 'WECHAT_ALREADY_BOUND':
        wx.showModal({
          title: '微信已绑定',
          content: '您的微信已绑定其他账号，请先解绑或使用其他微信',
          showCancel: false
        });
        break;
        
      case 'PHONE_NOT_FOUND':
        wx.showModal({
          title: '手机号未注册',
          content: '该手机号未注册账号，请联系管理员或使用其他绑定方式',
          showCancel: false
        });
        break;
        
      case 'CAPTCHA_ERROR':
        wx.showToast({
          title: '验证码错误',
          icon: 'none'
        });
        break;
        
      case 'CAPTCHA_EXPIRED':
        wx.showToast({
          title: '验证码已过期',
          icon: 'none'
        });
        break;
        
      default:
        wx.showToast({
          title: result.message || '绑定失败',
          icon: 'none'
        });
        break;
    }
  },

  handleNetworkError: function(error) {
    this.setData({
      currentStep: 2 // 返回输入步骤
    });
    
    wx.showModal({
      title: '网络连接失败',
      content: '无法连接到服务器，请检查网络后重试',
      confirmText: '重试',
      cancelText: '取消',
      success: (res) => {
        if (res.confirm) {
          this.performBinding();
        }
      }
    });
  },

  // 数据清理（与登录页面保持一致）
  cleanUserData: function(rawUserData) {
    return {
      id: rawUserData.id || '',
      name: rawUserData.name || rawUserData.nickname || '用户',
      avatar: rawUserData.avatar || rawUserData.avatarUrl || '',
      account: rawUserData.account || rawUserData.studentId || rawUserData.phone || '',
      phone: rawUserData.phone || '',
      email: rawUserData.email || '',
      
      // 角色相关
      role: rawUserData.role || 'student',
      roleName: rawUserData.roleName || '学员',
      roles: Array.isArray(rawUserData.roles) ? rawUserData.roles : [],
      currentRole: rawUserData.currentRole || { key: rawUserData.role || 'student', name: rawUserData.roleName || '学员' },
      
      // 组织相关
      unitId: rawUserData.unitId || '',
      unitName: rawUserData.unitName || '',
      unitPath: rawUserData.unitPath || '',
      
      // 权限相关
      permissions: Array.isArray(rawUserData.permissions) ? rawUserData.permissions : [],
      
      // 其他信息
      lastLoginTime: new Date().toISOString(),
      loginCount: (rawUserData.loginCount || 0) + 1,
      
      // 微信绑定标识
      isWechatBound: true,
      wechatOpenid: this.data.wechatInfo.openid
    };
  },

  // 保存登录数据
  saveLoginData: function(token, userInfo) {
    const app = getApp();
    
    // 设置全局数据
    app.globalData.token = token;
    app.globalData.userInfo = userInfo;
    app.globalData.isLogin = true;
    app.globalData.userRole = userInfo.role;
    
    // 清除临时微信数据
    app.globalData.tempWechatProfile = null;
    
    // 保存到本地存储
    storageHelper.setStorageSafely('token', token);
    storageHelper.setStorageSafely('userInfo', userInfo);
  },

  // 跳转到主页面
  navigateToMainPage: function(userInfo) {
    // 根据用户角色决定首页展示
    const homePage = this.getHomePageByRole(userInfo.role);
    
    wx.reLaunch({
      url: homePage
    });
  },

  // 根据角色获取首页
  getHomePageByRole: function(role) {
    switch (role) {
      case 'admin':
      case 'manager':
        return '/pages/index/index?role=manager';
      case 'instructor':
        return '/pages/index/index?role=instructor';
      case 'student':
      default:
        return '/pages/index/index?role=student';
    }
  },

  // 取消绑定
  cancelBinding: function() {
    wx.showModal({
      title: '确认取消',
      content: '确定要取消账号绑定吗？取消后将返回登录页面',
      success: (res) => {
        if (res.confirm) {
          // 清除临时数据
          const app = getApp();
          app.globalData.tempWechatProfile = null;
          
          // 返回登录页面
          wx.reLaunch({
            url: '/pages/unified-login/unified-login'
          });
        }
      }
    });
  },

  // 获取绑定帮助
  showBindingHelp: function() {
    wx.showModal({
      title: '绑定帮助',
      content: '账号绑定说明：\n\n1. 账号密码绑定：使用现有的学员编号/工号和密码\n2. 手机验证码绑定：使用注册时的手机号\n3. 绑定成功后可使用微信快速登录\n\n如有问题请联系管理员',
      showCancel: false,
      confirmText: '我知道了'
    });
  },

  // 工具函数
  validatePhone: function(phone) {
    const phoneRegex = /^1[3-9]\d{9}$/;
    return phoneRegex.test(phone);
  }
});

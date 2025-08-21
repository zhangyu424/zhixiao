// pages/unified-login/unified-login.js
// 统一登录页面
const { api } = require('../../api/index.js');
const storageHelper = require('../../utils/common/storage-helper.js');

Page({
  data: {
    // 登录表单数据
    loginForm: {
      account: '', // 账号（支持手机号、学员编号、工号等）
      password: '', // 密码
      loginType: 'account' // 登录类型：account(账号密码) / phone(手机验证码) / wechat(微信授权)
    },
    
    // 界面状态
    loginLoading: false, // 登录中
    showPasswordInput: true, // 显示密码输入
    showPhoneLogin: false, // 显示手机登录
    showWechatLogin: true, // 显示微信登录
    
    // 手机验证码相关
    phoneForm: {
      phone: '',
      captcha: '',
      captchaLoading: false,
      captchaText: '获取验证码',
      captchaCountdown: 0
    },
    
    // 微信登录相关
    wechatAuth: {
      userProfile: null,
      openid: null,
      needBind: false
    },
    
    // 忘记密码
    showForgotPassword: false,
    
    // 用户协议
    agreeToTerms: false,
    
    // 开发模式
    isDevMode: false
  },

  onLoad: function(options) {
    // 检查是否已登录
    this.checkExistingLogin();
    
    // 检查开发模式
    this.checkDevMode();
    
    // 从选项中获取登录类型
    if (options.type) {
      this.setData({
        'loginForm.loginType': options.type
      });
    }
  },

  onShow: function() {
    // 重置表单（防止数据残留）
    this.resetForms();
  },

  // 检查已有登录状态
  checkExistingLogin: function() {
    const token = wx.getStorageSync('token');
    const userInfo = wx.getStorageSync('userInfo');
    
    if (token && userInfo) {
      // 验证token有效性
      this.validateExistingToken(token, userInfo);
    }
  },

  // 验证现有token
  validateExistingToken: function(token, userInfo) {
    wx.showLoading({
      title: '验证登录状态...'
    });

    api.auth.validateToken()
      .then(result => {
        wx.hideLoading();
        
        if (result.success) {
          // Token有效，直接跳转到主页
          this.loginSuccess(token, result.data || userInfo);
        } else {
          // Token失效，清除本地数据
          this.clearLoginData();
        }
      })
      .catch(error => {
        wx.hideLoading();
        console.log('Token验证失败:', error);
        // 网络错误，使用本地数据继续
        this.loginSuccess(token, userInfo);
      });
  },

  // 检查开发模式
  checkDevMode: function() {
    const isDev = typeof __wxConfig !== 'undefined' && __wxConfig.debug;
    this.setData({
      isDevMode: isDev
    });
  },

  // 重置表单
  resetForms: function() {
    this.setData({
      'loginForm.account': '',
      'loginForm.password': '',
      'phoneForm.phone': '',
      'phoneForm.captcha': '',
      'phoneForm.captchaCountdown': 0,
      'phoneForm.captchaText': '获取验证码',
      'wechatAuth.userProfile': null,
      'wechatAuth.openid': null,
      'wechatAuth.needBind': false,
      loginLoading: false,
      agreeToTerms: false
    });
  },

  // 输入事件处理
  onAccountInput: function(e) {
    this.setData({
      'loginForm.account': e.detail.value
    });
  },

  onPasswordInput: function(e) {
    this.setData({
      'loginForm.password': e.detail.value
    });
  },

  onPhoneInput: function(e) {
    this.setData({
      'phoneForm.phone': e.detail.value
    });
  },

  onCaptchaInput: function(e) {
    this.setData({
      'phoneForm.captcha': e.detail.value
    });
  },

  // 切换登录方式
  switchLoginType: function(e) {
    const type = e.currentTarget.dataset.type;
    this.setData({
      'loginForm.loginType': type
    });
    
    // 重置相关表单
    if (type !== 'phone') {
      this.resetPhoneForm();
    }
    if (type !== 'wechat') {
      this.resetWechatAuth();
    }
  },

  resetPhoneForm: function() {
    this.setData({
      'phoneForm.phone': '',
      'phoneForm.captcha': '',
      'phoneForm.captchaCountdown': 0,
      'phoneForm.captchaText': '获取验证码'
    });
  },

  resetWechatAuth: function() {
    this.setData({
      'wechatAuth.userProfile': null,
      'wechatAuth.openid': null,
      'wechatAuth.needBind': false
    });
  },

  // 用户协议勾选
  onAgreeChange: function(e) {
    this.setData({
      agreeToTerms: e.detail.value.length > 0
    });
  },

  // ========== 账号密码登录 ==========
  accountLogin: function() {
    const { account, password } = this.data.loginForm;
    
    // 表单验证
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
    
    if (!this.data.agreeToTerms) {
      wx.showToast({
        title: '请先同意用户协议',
        icon: 'none'
      });
      return;
    }

    this.setData({ loginLoading: true });

    wx.showLoading({
      title: '登录中...'
    });

    // 调用账号密码登录API
    api.auth.accountLogin({
      account: account.trim(),
      password: password.trim()
    })
    .then(result => {
      wx.hideLoading();
      this.setData({ loginLoading: false });
      
      if (result.success) {
        // 登录成功，保存用户信息
        this.handleLoginSuccess(result.data);
      } else {
        // 登录失败，显示错误信息
        wx.showToast({
          title: result.message || '登录失败',
          icon: 'none'
        });
        
        // 特殊错误处理
        this.handleLoginError(result);
      }
    })
    .catch(error => {
      wx.hideLoading();
      this.setData({ loginLoading: false });
      
      console.error('账号登录失败:', error);
      
      // 网络错误处理
      this.handleNetworkError(error);
    });
  },

  // ========== 手机验证码登录 ==========
  sendCaptcha: function() {
    const phone = this.data.phoneForm.phone;
    
    if (!this.validatePhone(phone)) {
      wx.showToast({
        title: '请输入正确的手机号',
        icon: 'none'
      });
      return;
    }

    this.setData({
      'phoneForm.captchaLoading': true
    });

    api.auth.sendCaptcha({ phone })
      .then(result => {
        this.setData({
          'phoneForm.captchaLoading': false
        });
        
        if (result.success) {
          wx.showToast({
            title: '验证码已发送',
            icon: 'success'
          });
          
          // 开始倒计时
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
          'phoneForm.captchaLoading': false
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
      'phoneForm.captchaCountdown': countdown,
      'phoneForm.captchaText': `${countdown}s后重新发送`
    });

    const timer = setInterval(() => {
      countdown--;
      if (countdown > 0) {
        this.setData({
          'phoneForm.captchaCountdown': countdown,
          'phoneForm.captchaText': `${countdown}s后重新发送`
        });
      } else {
        clearInterval(timer);
        this.setData({
          'phoneForm.captchaCountdown': 0,
          'phoneForm.captchaText': '获取验证码'
        });
      }
    }, 1000);
  },

  phoneLogin: function() {
    const { phone, captcha } = this.data.phoneForm;
    
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
    
    if (!this.data.agreeToTerms) {
      wx.showToast({
        title: '请先同意用户协议',
        icon: 'none'
      });
      return;
    }

    this.setData({ loginLoading: true });

    wx.showLoading({
      title: '登录中...'
    });

    api.auth.phoneLogin({
      phone: phone.trim(),
      captcha: captcha.trim()
    })
    .then(result => {
      wx.hideLoading();
      this.setData({ loginLoading: false });
      
      if (result.success) {
        this.handleLoginSuccess(result.data);
      } else {
        wx.showToast({
          title: result.message || '登录失败',
          icon: 'none'
        });
        
        this.handleLoginError(result);
      }
    })
    .catch(error => {
      wx.hideLoading();
      this.setData({ loginLoading: false });
      
      console.error('手机登录失败:', error);
      this.handleNetworkError(error);
    });
  },

  // ========== 微信授权登录 ==========
  wechatLogin: function() {
    if (!this.data.agreeToTerms) {
      wx.showToast({
        title: '请先同意用户协议',
        icon: 'none'
      });
      return;
    }

    this.setData({ loginLoading: true });

    // 先获取用户授权
    wx.getUserProfile({
      desc: '用于完善用户资料',
      success: (profileRes) => {
        this.setData({
          'wechatAuth.userProfile': profileRes.userInfo
        });
        
        // 获取微信登录code
        wx.login({
          success: (loginRes) => {
            if (loginRes.code) {
              this.processWechatLogin(loginRes.code, profileRes.userInfo);
            } else {
              this.setData({ loginLoading: false });
              wx.showToast({
                title: '微信登录失败',
                icon: 'none'
              });
            }
          },
          fail: () => {
            this.setData({ loginLoading: false });
            wx.showToast({
              title: '微信登录服务异常',
              icon: 'none'
            });
          }
        });
      },
      fail: () => {
        this.setData({ loginLoading: false });
        wx.showToast({
          title: '需要授权才能登录',
          icon: 'none'
        });
      }
    });
  },

  processWechatLogin: function(code, userProfile) {
    wx.showLoading({
      title: '登录中...'
    });

    api.auth.wechatLogin({
      code: code,
      userInfo: userProfile
    })
    .then(result => {
      wx.hideLoading();
      this.setData({ loginLoading: false });
      
      if (result.success) {
        if (result.data.needBind) {
          // 需要绑定账号
          this.setData({
            'wechatAuth.openid': result.data.openid,
            'wechatAuth.needBind': true
          });
          
          this.showAccountBinding(result.data);
        } else {
          // 已绑定，直接登录
          this.handleLoginSuccess(result.data);
        }
      } else {
        wx.showToast({
          title: result.message || '微信登录失败',
          icon: 'none'
        });
      }
    })
    .catch(error => {
      wx.hideLoading();
      this.setData({ loginLoading: false });
      
      console.error('微信登录失败:', error);
      this.handleNetworkError(error);
    });
  },

  // ========== 账号绑定 ==========
  showAccountBinding: function(wechatData) {
    wx.showModal({
      title: '账号绑定',
      content: '检测到您是首次使用微信登录，需要绑定已有账号。是否前往绑定页面？',
      confirmText: '立即绑定',
      cancelText: '取消登录',
      success: (res) => {
        if (res.confirm) {
          // 跳转到绑定页面，传递微信数据
          wx.navigateTo({
            url: `/pages/account-binding/account-binding?openid=${wechatData.openid}&unionid=${wechatData.unionid || ''}`
          });
        } else {
          // 取消登录，重置状态
          this.resetWechatAuth();
        }
      }
    });
  },

  // ========== 登录成功处理 ==========
  handleLoginSuccess: function(loginData) {
    try {
      // 验证登录数据
      if (!loginData.token) {
        throw new Error('登录数据缺少token');
      }
      
      if (!loginData.user && !loginData.userInfo) {
        throw new Error('登录数据缺少用户信息');
      }

      const userInfo = loginData.user || loginData.userInfo;
      
      // 数据清理和标准化
      const cleanUserData = this.cleanUserData(userInfo);
      
      // 保存到全局和本地存储
      this.saveLoginData(loginData.token, cleanUserData);
      
      // 显示成功提示
      wx.showToast({
        title: '登录成功',
        icon: 'success'
      });
      
      // 延迟跳转，确保数据保存完成
      setTimeout(() => {
        this.navigateToMainPage(cleanUserData);
      }, 1500);
      
    } catch (error) {
      console.error('处理登录成功数据失败:', error);
      wx.showToast({
        title: '登录数据处理失败',
        icon: 'none'
      });
    }
  },

  // 清理用户数据
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
      loginCount: (rawUserData.loginCount || 0) + 1
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
    
    // 保存到本地存储
    storageHelper.setStorageSafely('token', token);
    storageHelper.setStorageSafely('userInfo', userInfo);
    
    console.log('登录数据保存完成:', {
      token: token ? 'exists' : 'missing',
      userInfo: userInfo ? 'exists' : 'missing',
      userRole: userInfo.role
    });
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

  // ========== 错误处理 ==========
  handleLoginError: function(result) {
    switch (result.code) {
      case 'ACCOUNT_NOT_FOUND':
        wx.showModal({
          title: '账号不存在',
          content: '该账号未注册，请联系管理员或使用其他登录方式',
          showCancel: false
        });
        break;
        
      case 'PASSWORD_ERROR':
        wx.showModal({
          title: '密码错误',
          content: '密码不正确，请重新输入或使用忘记密码功能',
          confirmText: '忘记密码',
          cancelText: '重新输入',
          success: (res) => {
            if (res.confirm) {
              this.showForgotPassword();
            }
          }
        });
        break;
        
      case 'ACCOUNT_LOCKED':
        wx.showModal({
          title: '账号被锁定',
          content: '您的账号因多次登录失败被暂时锁定，请联系管理员',
          showCancel: false
        });
        break;
        
      case 'ACCOUNT_DISABLED':
        wx.showModal({
          title: '账号已禁用',
          content: '您的账号已被禁用，请联系管理员',
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
        // 显示通用错误信息
        break;
    }
  },

  handleNetworkError: function(error) {
    console.error('网络错误详情:', error);
    
    wx.showModal({
      title: '网络连接失败',
      content: '无法连接到服务器，请检查网络设置后重试。是否使用离线模式？',
      confirmText: '离线模式',
      cancelText: '重试',
      success: (res) => {
        if (res.confirm && this.data.isDevMode) {
          this.mockLogin();
        }
      }
    });
  },

  // ========== 忘记密码 ==========
  showForgotPassword: function() {
    wx.navigateTo({
      url: '/pages/forgot-password/forgot-password'
    });
  },

  // ========== 用户协议 ==========
  showUserAgreement: function() {
    wx.navigateTo({
      url: '/pages/user-agreement/user-agreement'
    });
  },

  showPrivacyPolicy: function() {
    wx.navigateTo({
      url: '/pages/privacy-policy/privacy-policy'
    });
  },

  // ========== 开发调试 ==========
  mockLogin: function() {
    if (!this.data.isDevMode) return;
    
    const mockUsers = {
      admin: {
        id: 'mock_admin_001',
        name: '系统管理员',
        role: 'admin',
        roleName: '系统管理员',
        account: 'admin',
        unitName: '系统管理部',
        permissions: ['all']
      },
      manager: {
        id: 'mock_manager_001',
        name: '信息管理员',
        role: 'manager',
        roleName: '信息管理员',
        account: 'manager',
        unitName: '信息管理部',
        permissions: ['user_manage', 'import', 'export']
      },
      instructor: {
        id: 'mock_instructor_001',
        name: '张层级长',
        role: 'instructor',
        roleName: '层级长',
        account: 'instructor',
        unitName: '第一层级',
        permissions: ['team_manage']
      },
      student: {
        id: 'mock_student_001',
        name: '李学员',
        role: 'student',
        roleName: '学员',
        account: 'student',
        unitName: '第一班级',
        permissions: ['basic']
      }
    };

    wx.showActionSheet({
      itemList: ['管理员', '信息管理员', '层级长', '学员'],
      success: (res) => {
        const roles = ['admin', 'manager', 'instructor', 'student'];
        const selectedRole = roles[res.tapIndex];
        const mockUser = mockUsers[selectedRole];
        
        // 模拟登录成功
        this.handleLoginSuccess({
          token: `mock_token_${selectedRole}_${Date.now()}`,
          user: mockUser
        });
      }
    });
  },

  // ========== 清理函数 ==========
  clearLoginData: function() {
    const app = getApp();
    
    // 清除全局数据
    app.globalData.token = null;
    app.globalData.userInfo = null;
    app.globalData.isLogin = false;
    app.globalData.userRole = null;
    
    // 清除本地存储
    wx.removeStorageSync('token');
    wx.removeStorageSync('userInfo');
  },

  loginSuccess: function(token, userInfo) {
    this.saveLoginData(token, userInfo);
    this.navigateToMainPage(userInfo);
  },

  // ========== 工具函数 ==========
  validatePhone: function(phone) {
    const phoneRegex = /^1[3-9]\d{9}$/;
    return phoneRegex.test(phone);
  }
});

// utils/data-validator.js
// 统一的数据验证工具 (整合了validation.js的功能)

const DataValidator = {
  // 验证规则
  rules: {
    required: value => value !== null && value !== undefined && value !== '',
    number: value => !isNaN(value) && isFinite(value),
    positiveNumber: value => !isNaN(value) && isFinite(value) && value > 0,
    integer: value => Number.isInteger(Number(value)),
    email: value => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value),
    phone: value => /^1[3-9]\d{9}$/.test(value),
    account: value => /^[A-Za-z0-9_]{4,20}$/.test(value), // 支持账号格式
    studentId: value => /^[A-Za-z0-9]{6,20}$/.test(value),
    password: value => value && value.length >= 6 && value.length <= 20,
    date: value => !isNaN(Date.parse(value)),
    studyTime: value => {
      const num = Number(value);
      return !isNaN(num) && num >= 0 && num <= 24;
    },
    percentage: value => {
      const num = Number(value);
      return !isNaN(num) && num >= 0 && num <= 100;
    },
    captcha: value => /^\d{4,6}$/.test(value), // 验证码格式
    wechatCode: value => value && value.length > 0 // 微信授权码
  },

  // 常用验证方法 (来自validation.js)
  validateStudyTime: function(time) {
    if (isNaN(time)) {
      return {
        valid: false,
        message: '请输入有效的学习时长'
      };
    }

    const numTime = parseFloat(time);
    if (numTime < 0 || numTime > 24) {
      return {
        valid: false,
        message: '学习时长应在0-24小时之间'
      };
    }

    return {
      valid: true,
      value: numTime
    };
  },

  validateAccount: function(account) {
    if (!account || account.trim() === '') {
      return {
        valid: false,
        message: '请输入账号'
      };
    }

    if (!this.rules.account(account)) {
      return {
        valid: false,
        message: '账号格式不正确，支持字母、数字、下划线，4-20位'
      };
    }

    return {
      valid: true,
      value: account.trim()
    };
  },

  validatePassword: function(password) {
    if (!password) {
      return {
        valid: false,
        message: '请输入密码'
      };
    }

    if (!this.rules.password(password)) {
      return {
        valid: false,
        message: '密码长度应为6-20位'
      };
    }

    return {
      valid: true,
      value: password
    };
  },

  validatePhone: function(phone) {
    if (!phone || phone.trim() === '') {
      return {
        valid: false,
        message: '请输入手机号'
      };
    }

    if (!this.rules.phone(phone)) {
      return {
        valid: false,
        message: '请输入正确的手机号'
      };
    }

    return {
      valid: true,
      value: phone.trim()
    };
  },

  validateCaptcha: function(captcha) {
    if (!captcha || captcha.trim() === '') {
      return {
        valid: false,
        message: '请输入验证码'
      };
    }

    if (!this.rules.captcha(captcha)) {
      return {
        valid: false,
        message: '验证码格式不正确'
      };
    }

    return {
      valid: true,
      value: captcha.trim()
    };
  },

  // 验证单个字段
  validateField: function (value, fieldRules, fieldName = '') {
    const errors = [];

    for (const rule of fieldRules) {
      let isValid = false;
      let errorMessage = '';

      if (typeof rule === 'string') {
        // 简单规则
        if (this.rules[rule]) {
          isValid = this.rules[rule](value);
          errorMessage = this.getDefaultErrorMessage(rule, fieldName);
        }
      } else if (typeof rule === 'object') {
        // 复杂规则
        const { type, message, ...params } = rule;

        if (this.rules[type]) {
          isValid = this.rules[type](value, params);
          errorMessage =
            message || this.getDefaultErrorMessage(type, fieldName);
        }
      } else if (typeof rule === 'function') {
        // 自定义规则
        const result = rule(value);
        isValid = result === true;
        errorMessage =
          typeof result === 'string' ? result : `${fieldName}验证失败`;
      }

      if (!isValid) {
        errors.push(errorMessage);
      }
    }

    return {
      isValid: errors.length === 0,
      errors: errors
    };
  },

  // 验证对象
  validateObject: function (data, schema) {
    const result = {
      isValid: true,
      errors: {},
      fieldErrors: []
    };

    for (const [fieldName, fieldRules] of Object.entries(schema)) {
      const fieldValue = data[fieldName];
      const fieldResult = this.validateField(fieldValue, fieldRules, fieldName);

      if (!fieldResult.isValid) {
        result.isValid = false;
        result.errors[fieldName] = fieldResult.errors;
        result.fieldErrors.push(...fieldResult.errors);
      }
    }

    return result;
  },

  // 获取默认错误信息
  getDefaultErrorMessage: function (rule, fieldName) {
    const messages = {
      required: `${fieldName}不能为空`,
      number: `${fieldName}必须是数字`,
      positiveNumber: `${fieldName}必须是正数`,
      integer: `${fieldName}必须是整数`,
      email: `${fieldName}格式不正确`,
      phone: `${fieldName}格式不正确`,
      studentId: `${fieldName}格式不正确（6-20位字母数字）`,
      date: `${fieldName}日期格式不正确`,
      studyTime: `${fieldName}必须在0-24小时之间`,
      percentage: `${fieldName}必须在0-100之间`
    };

    return messages[rule] || `${fieldName}验证失败`;
  },

  // 预定义验证模式
  schemas: {
    // 用户登录
    login: {
      code: ['required'],
      userInfo: ['required']
    },

    // 学习记录
    studyRecord: {
      date: ['required', 'date'],
      studyTime: ['required', 'studyTime'],
      subject: ['required'],
      description: []
    },

    // 用户信息
    userProfile: {
      name: ['required'],
      studentId: ['required', 'studentId'],
      phone: ['phone'],
      email: ['email']
    },

    // 数据导入
    importData: {
      file: ['required'],
      type: ['required']
    }
  },

  // 快速验证方法
  validateLogin: function (data) {
    return this.validateObject(data, this.schemas.login);
  },

  validateStudyRecord: function (data) {
    return this.validateObject(data, this.schemas.studyRecord);
  },

  validateUserProfile: function (data) {
    return this.validateObject(data, this.schemas.userProfile);
  },

  validateImportData: function (data) {
    return this.validateObject(data, this.schemas.importData);
  },

  // 显示验证错误
  showValidationErrors: function (errors, title = '输入错误') {
    if (Array.isArray(errors)) {
      const message = errors.join('\n');
      wx.showModal({
        title: title,
        content: message,
        showCancel: false,
        confirmText: '确定'
      });
    } else if (errors.fieldErrors && errors.fieldErrors.length > 0) {
      const message = errors.fieldErrors.join('\n');
      wx.showModal({
        title: title,
        content: message,
        showCancel: false,
        confirmText: '确定'
      });
    }
  },

  // 数据清理（去除前后空格等）
  sanitizeData: function (data) {
    const sanitized = {};

    for (const [key, value] of Object.entries(data)) {
      if (typeof value === 'string') {
        sanitized[key] = value.trim();
      } else {
        sanitized[key] = value;
      }
    }

    return sanitized;
  },

  // 添加自定义规则
  addRule: function (name, validator, errorMessage) {
    this.rules[name] = validator;

    // 更新默认错误信息
    const originalGetDefaultErrorMessage = this.getDefaultErrorMessage;
    this.getDefaultErrorMessage = function (rule, fieldName) {
      if (rule === name) {
        return errorMessage.replace('{field}', fieldName);
      }
      return originalGetDefaultErrorMessage.call(this, rule, fieldName);
    };
  }
};

module.exports = DataValidator;

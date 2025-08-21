const Joi = require('joi');

/**
 * 用户相关验证器
 */
const userValidators = {
  // 用户登录验证
  login: Joi.object({
    code: Joi.string().required().messages({
      'string.empty': '微信登录code不能为空',
      'any.required': '微信登录code是必填项'
    })
  }),

  // 账号绑定验证
  bind: Joi.object({
    openid: Joi.string().required(),
    studentId: Joi.string().required().min(3).max(20).messages({
      'string.empty': '学员编号不能为空',
      'string.min': '学员编号至少3个字符',
      'string.max': '学员编号不能超过20个字符'
    }),
    password: Joi.string().required().min(6).messages({
      'string.empty': '密码不能为空',
      'string.min': '密码至少6个字符'
    }),
    name: Joi.string().required().min(2).max(20).messages({
      'string.empty': '姓名不能为空',
      'string.min': '姓名至少2个字符',
      'string.max': '姓名不能超过20个字符'
    }),
    unitId: Joi.number().integer().positive().required().messages({
      'number.base': '单位ID必须是数字',
      'number.positive': '单位ID必须是正数',
      'any.required': '单位ID是必填项'
    })
  }),

  // 用户信息更新验证
  update: Joi.object({
    name: Joi.string().min(2).max(20).messages({
      'string.min': '姓名至少2个字符',
      'string.max': '姓名不能超过20个字符'
    }),
    phone: Joi.string().pattern(/^1[3-9]\d{9}$/).messages({
      'string.pattern.base': '手机号格式不正确'
    }),
    email: Joi.string().email().messages({
      'string.email': '邮箱格式不正确'
    }),
    unitId: Joi.number().integer().positive().messages({
      'number.base': '单位ID必须是数字',
      'number.positive': '单位ID必须是正数'
    })
  }).min(1).messages({
    'object.min': '至少需要提供一个字段进行更新'
  })
};

/**
 * 学习记录相关验证器
 */
const studyValidators = {
  // 创建学习记录验证
  create: Joi.object({
    subject: Joi.string().required().max(50).messages({
      'string.empty': '学习科目不能为空',
      'string.max': '学习科目不能超过50个字符',
      'any.required': '学习科目是必填项'
    }),
    duration: Joi.number().integer().min(1).max(86400).required().messages({
      'number.base': '学习时长必须是数字',
      'number.integer': '学习时长必须是整数',
      'number.min': '学习时长至少1秒',
      'number.max': '学习时长不能超过24小时',
      'any.required': '学习时长是必填项'
    }),
    content: Joi.string().max(500).messages({
      'string.max': '学习内容不能超过500个字符'
    }),
    score: Joi.number().min(0).max(100).messages({
      'number.base': '分数必须是数字',
      'number.min': '分数不能小于0',
      'number.max': '分数不能大于100'
    }),
    difficulty: Joi.string().valid('easy', 'medium', 'hard').messages({
      'any.only': '难度等级只能是 easy、medium 或 hard'
    }),
    tags: Joi.array().items(Joi.string().max(20)).max(10).messages({
      'array.max': '标签不能超过10个',
      'string.max': '每个标签不能超过20个字符'
    })
  }),

  // 更新学习记录验证
  update: Joi.object({
    subject: Joi.string().max(50).messages({
      'string.max': '学习科目不能超过50个字符'
    }),
    duration: Joi.number().integer().min(1).max(86400).messages({
      'number.base': '学习时长必须是数字',
      'number.integer': '学习时长必须是整数',
      'number.min': '学习时长至少1秒',
      'number.max': '学习时长不能超过24小时'
    }),
    content: Joi.string().max(500).messages({
      'string.max': '学习内容不能超过500个字符'
    }),
    score: Joi.number().min(0).max(100).messages({
      'number.base': '分数必须是数字',
      'number.min': '分数不能小于0',
      'number.max': '分数不能大于100'
    }),
    difficulty: Joi.string().valid('easy', 'medium', 'hard').messages({
      'any.only': '难度等级只能是 easy、medium 或 hard'
    }),
    tags: Joi.array().items(Joi.string().max(20)).max(10).messages({
      'array.max': '标签不能超过10个',
      'string.max': '每个标签不能超过20个字符'
    })
  }).min(1).messages({
    'object.min': '至少需要提供一个字段进行更新'
  }),

  // 查询参数验证
  query: Joi.object({
    page: Joi.number().integer().min(1).default(1).messages({
      'number.base': '页码必须是数字',
      'number.integer': '页码必须是整数',
      'number.min': '页码至少为1'
    }),
    limit: Joi.number().integer().min(1).max(100).default(20).messages({
      'number.base': '每页数量必须是数字',
      'number.integer': '每页数量必须是整数',
      'number.min': '每页数量至少为1',
      'number.max': '每页数量不能超过100'
    }),
    subject: Joi.string().max(50).messages({
      'string.max': '学习科目不能超过50个字符'
    }),
    startDate: Joi.date().iso().messages({
      'date.format': '开始日期格式不正确'
    }),
    endDate: Joi.date().iso().min(Joi.ref('startDate')).messages({
      'date.format': '结束日期格式不正确',
      'date.min': '结束日期不能早于开始日期'
    }),
    difficulty: Joi.string().valid('easy', 'medium', 'hard').messages({
      'any.only': '难度等级只能是 easy、medium 或 hard'
    })
  })
};

/**
 * 管理员相关验证器
 */
const adminValidators = {
  // 管理员登录验证
  login: Joi.object({
    username: Joi.string().required().min(3).max(20).messages({
      'string.empty': '用户名不能为空',
      'string.min': '用户名至少3个字符',
      'string.max': '用户名不能超过20个字符',
      'any.required': '用户名是必填项'
    }),
    password: Joi.string().required().min(6).messages({
      'string.empty': '密码不能为空',
      'string.min': '密码至少6个字符',
      'any.required': '密码是必填项'
    })
  }),

  // 创建管理员验证
  create: Joi.object({
    username: Joi.string().required().min(3).max(20).messages({
      'string.empty': '用户名不能为空',
      'string.min': '用户名至少3个字符',
      'string.max': '用户名不能超过20个字符',
      'any.required': '用户名是必填项'
    }),
    password: Joi.string().required().min(6).messages({
      'string.empty': '密码不能为空',
      'string.min': '密码至少6个字符',
      'any.required': '密码是必填项'
    }),
    name: Joi.string().required().min(2).max(20).messages({
      'string.empty': '姓名不能为空',
      'string.min': '姓名至少2个字符',
      'string.max': '姓名不能超过20个字符',
      'any.required': '姓名是必填项'
    }),
    role: Joi.string().valid('admin', 'super_admin').default('admin').messages({
      'any.only': '角色只能是 admin 或 super_admin'
    })
  })
};

/**
 * 通用验证器
 */
const commonValidators = {
  // ID参数验证
  id: Joi.object({
    id: Joi.number().integer().positive().required().messages({
      'number.base': 'ID必须是数字',
      'number.integer': 'ID必须是整数',
      'number.positive': 'ID必须是正数',
      'any.required': 'ID是必填项'
    })
  }),

  // 分页参数验证
  pagination: Joi.object({
    page: Joi.number().integer().min(1).default(1),
    limit: Joi.number().integer().min(1).max(100).default(20)
  }),

  // 日期范围验证
  dateRange: Joi.object({
    startDate: Joi.date().iso().required(),
    endDate: Joi.date().iso().min(Joi.ref('startDate')).required()
  })
};

module.exports = {
  userValidators,
  studyValidators,
  adminValidators,
  commonValidators
};

const Joi = require('joi');
const { validationResult } = require('express-validator');

// 通用验证中间件
const validate = (schema, property = 'body') => {
  return (req, res, next) => {
    const { error } = schema.validate(req[property]);
    if (error) {
      return res.status(400).json({
        success: false,
        message: '输入数据验证失败',
        details: error.details.map(detail => detail.message)
      });
    }
    next();
  };
};

// 登录验证
const loginSchema = Joi.object({
  code: Joi.string().required().messages({
    'string.empty': '微信登录code不能为空',
    'any.required': '微信登录code是必填项'
  })
});

// 账号绑定验证
const bindSchema = Joi.object({
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
});

// 学习时间提交验证
const studySubmitSchema = Joi.object({
  date: Joi.string().pattern(/^\d{4}-\d{2}-\d{2}$/).required().messages({
    'string.pattern.base': '日期格式必须为YYYY-MM-DD',
    'any.required': '日期是必填项'
  }),
  studyTime: Joi.number().min(0).max(24).required().messages({
    'number.min': '学习时间不能为负数',
    'number.max': '学习时间不能超过24小时',
    'any.required': '学习时间是必填项'
  }),
  subject: Joi.string().max(50).allow('').messages({
    'string.max': '学科名称不能超过50个字符'
  }),
  remark: Joi.string().max(200).allow('').messages({
    'string.max': '备注不能超过200个字符'
  })
});

// 用户信息更新验证
const profileUpdateSchema = Joi.object({
  name: Joi.string().min(2).max(20).messages({
    'string.min': '姓名至少2个字符',
    'string.max': '姓名不能超过20个字符'
  }),
  avatar: Joi.string().uri().allow('').messages({
    'string.uri': '头像必须是有效的URL'
  }),
  phone: Joi.string().pattern(/^1[3-9]\d{9}$/).allow('').messages({
    'string.pattern.base': '请输入有效的手机号码'
  }),
  email: Joi.string().email().allow('').messages({
    'string.email': '请输入有效的邮箱地址'
  })
});

// 分页参数验证
const paginationSchema = Joi.object({
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(20),
  sortBy: Joi.string().default('created_at'),
  sortOrder: Joi.string().valid('asc', 'desc').default('desc')
});

// Express-validator 验证结果处理中间件
const validateRequest = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: '输入数据验证失败',
      errors: errors.array()
    });
  }
  next();
};

module.exports = {
  validate,
  validateRequest,
  loginSchema,
  bindSchema,
  studySubmitSchema,
  profileUpdateSchema,
  paginationSchema
};

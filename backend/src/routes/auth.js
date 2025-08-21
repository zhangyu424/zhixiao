const express = require('express');
const AuthController = require('../controllers/AuthController');
const { validate, loginSchema, bindSchema } = require('../middleware/validation');
const { loginRateLimit } = require('../middleware/rateLimit');
const { auth } = require('../middleware/auth');
const { body } = require('express-validator');
const { validateRequest } = require('../middleware/validation');

const router = express.Router();

// 微信登录
router.post('/wxlogin', 
  loginRateLimit,
  validate(loginSchema),
  AuthController.wechatLogin
);

// 测试登录 (仅用于开发测试)
router.post('/test-login', (req, res) => {
  if (process.env.NODE_ENV === 'production') {
    return res.status(404).json({ success: false, message: '接口不存在' });
  }
  
  const jwt = require('jsonwebtoken');
  const config = require('../config');
  
  // 生成测试token
  const testUser = {
    id: 1,
    name: '测试用户',
    studentId: 'TEST001',
    email: 'test@example.com',
    role: 'student',
    unitId: 1,
    unitName: '测试单位'
  };
  
  const token = jwt.sign(testUser, config.jwt.secret, { expiresIn: '24h' });
  
  res.json({
    success: true,
    message: '测试登录成功',
    data: {
      token,
      user: testUser
    }
  });
});

// 账号绑定
router.post('/bind',
  validate(bindSchema),
  AuthController.bind
);

// 刷新token
router.post('/refresh',
  auth,
  AuthController.refreshToken
);

// 获取当前用户信息
router.get('/me',
  auth,
  AuthController.getCurrentUser
);

// 登出
router.post('/logout',
  auth,
  AuthController.logout
);

// 统一登录（学号+密码）
router.post('/login',
  loginRateLimit,
  [
    body('student_id').notEmpty().withMessage('学号不能为空'),
    body('password').notEmpty().withMessage('密码不能为空')
  ],
  validateRequest,
  AuthController.login
);

// 强制修改密码
router.post('/change-password',
  auth,
  [
    body('newPassword').isLength({ min: 6 }).withMessage('新密码至少6位字符'),
    body('phone').matches(/^1[3-9]\d{9}$/).withMessage('请输入有效的手机号'),
    body('oldPassword').optional()
  ],
  validateRequest,
  AuthController.changePassword
);

// 忘记密码
router.post('/forgot-password',
  [
    body('student_id').notEmpty().withMessage('学号不能为空'),
    body('phone').matches(/^1[3-9]\d{9}$/).withMessage('请输入有效的手机号'),
    body('newPassword').isLength({ min: 6 }).withMessage('新密码至少6位字符')
  ],
  validateRequest,
  AuthController.forgotPassword
);

module.exports = router;

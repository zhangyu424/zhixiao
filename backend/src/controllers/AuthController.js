const AuthService = require('../services/AuthService');
const jwt = require('jsonwebtoken');
const config = require('../config');
const { asyncHandler } = require('../middleware/errorHandler');

class AuthController {
  // 统一登录接口（学号+密码）
  static login = asyncHandler(async (req, res) => {
    const { student_id, password } = req.body;

    if (!student_id || !password) {
      return res.status(400).json({
        success: false,
        message: '学号和密码不能为空'
      });
    }

    // 获取用户信息
    const user = await AuthService.login(student_id, password);
    if (!user) {
      return res.status(401).json({
        success: false,
        message: '学号或密码错误'
      });
    }

    // 验证密码
    const isValidPassword = await AuthService.verifyPassword(password, user.password);
    if (!isValidPassword) {
      return res.status(401).json({
        success: false,
        message: '学号或密码错误'
      });
    }

    // 生成JWT tokens
    const accessToken = jwt.sign(
      { user_id: user.id, student_id: user.student_id, role: user.role },
      config.jwt.secret,
      { expiresIn: config.jwt.expiresIn }
    );

    const refreshToken = jwt.sign(
      { user_id: user.id, type: 'refresh' },
      config.jwt.refreshSecret || config.jwt.secret,
      { expiresIn: '7d' }
    );

    // 构建用户角色信息
    const roles = [{
      organizationId: user.unit_id,
      role: user.role
    }];

    // 构建用户信息
    const userInfo = {
      id: user.id,
      username: user.student_id,
      name: user.name,
      roles: roles,
      isFirstLogin: user.force_password_change === 1 || !user.last_login_at
    };

    // 移除密码信息
    delete user.password;

    res.json({
      success: true,
      data: {
        accessToken,
        refreshToken,
        userInfo
      },
      message: '登录成功'
    });
  });

  // 用户注册
  static register = asyncHandler(async (req, res) => {
    const result = await AuthService.register(req.body);
    res.status(201).json({
      success: true,
      data: result,
      message: '注册成功'
    });
  });

  // 微信小程序登录
  static wechatLogin = asyncHandler(async (req, res) => {
    const { code } = req.body;
    const result = await AuthService.wechatLogin(code);
    res.json({
      success: true,
      data: result,
      message: '微信登录成功'
    });
  });

  // 刷新令牌
  static refreshToken = asyncHandler(async (req, res) => {
    const authHeader = req.headers.authorization;
    const refreshToken = authHeader && authHeader.startsWith('Bearer ') 
      ? authHeader.slice(7) 
      : req.body.refreshToken;

    if (!refreshToken) {
      return res.status(401).json({
        success: false,
        message: 'Refresh token不能为空'
      });
    }

    try {
      // 验证refresh token
      const decoded = jwt.verify(
        refreshToken, 
        config.jwt.refreshSecret || config.jwt.secret
      );

      if (decoded.type !== 'refresh') {
        return res.status(401).json({
          success: false,
          message: '无效的refresh token'
        });
      }

      // 获取用户信息
      const user = await AuthService.getUserById(decoded.user_id);
      if (!user) {
        return res.status(401).json({
          success: false,
          message: '用户不存在'
        });
      }

      // 生成新的access token
      const newAccessToken = jwt.sign(
        { user_id: user.id, student_id: user.student_id, role: user.role },
        config.jwt.secret,
        { expiresIn: config.jwt.expiresIn }
      );

      res.json({
        success: true,
        data: {
          accessToken: newAccessToken
        },
        message: '令牌刷新成功'
      });
    } catch (error) {
      return res.status(401).json({
        success: false,
        message: 'Refresh token无效或已过期'
      });
    }
  });

  // 用户退出登录
  static logout = asyncHandler(async (req, res) => {
    const token = req.headers.authorization?.replace('Bearer ', '');
    await AuthService.logout(token);
    res.json({
      success: true,
      message: '退出登录成功'
    });
  });

  // 验证当前用户
  static getCurrentUser = asyncHandler(async (req, res) => {
    res.json({
      success: true,
      data: req.user
    });
  });

  // 账号绑定
  static bind = asyncHandler(async (req, res) => {
    const { openId, studentId, password } = req.body;
    
    if (!openId || !studentId || !password) {
      return res.status(400).json({
        success: false,
        message: '参数不完整'
      });
    }

    const result = await AuthService.bindAccount(openId, studentId, password);
    res.json({
      success: true,
      data: result,
      message: '账号绑定成功'
    });
  });

  // 强制修改密码
  static changePassword = asyncHandler(async (req, res) => {
    const { newPassword, phone, oldPassword } = req.body;
    const userId = req.user.id;

    if (!newPassword || !phone) {
      return res.status(400).json({
        success: false,
        message: '新密码和手机号不能为空'
      });
    }

    const result = await AuthService.changePassword(userId, newPassword, phone, oldPassword);
    res.json({
      success: true,
      data: result,
      message: '密码修改成功'
    });
  });

  // 忘记密码
  static forgotPassword = asyncHandler(async (req, res) => {
    const { student_id, phone, newPassword } = req.body;

    if (!student_id || !phone || !newPassword) {
      return res.status(400).json({
        success: false,
        message: '学号、手机号和新密码不能为空'
      });
    }

    const result = await AuthService.resetPassword(student_id, phone, newPassword);
    res.json({
      success: true,
      data: result,
      message: '密码重置成功'
    });
  });
}

module.exports = AuthController;

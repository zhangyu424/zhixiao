const jwt = require('jsonwebtoken');
const { query } = require('../config/database');

// 验证管理员权限
const requireAdmin = async (req, res, next) => {
  try {
    // 首先验证JWT token
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.status(401).json({
        success: false,
        message: '需要管理员权限'
      });
    }

    // 验证token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;

    // 查询用户角色信息
    const userSql = 'SELECT id, role, status FROM users WHERE id = ?';
    const users = await query(userSql, [decoded.userId]);
    
    if (!users.length) {
      return res.status(401).json({
        success: false,
        message: '用户不存在'
      });
    }

    const user = users[0];
    
    // 检查用户状态
    if (user.status !== 'active') {
      return res.status(403).json({
        success: false,
        message: '账户已被禁用'
      });
    }

    // 检查管理员权限
    if (user.role !== 'admin' && user.role !== 'manager') {
      return res.status(403).json({
        success: false,
        message: '需要管理员权限'
      });
    }

    // 将用户信息添加到请求对象
    req.user.role = user.role;
    req.user.isAdmin = true;
    
    next();
  } catch (error) {
    console.error('Admin auth middleware error:', error);
    return res.status(401).json({
      success: false,
      message: 'Token验证失败'
    });
  }
};

// 验证超级管理员权限（只有admin用户）
const requireSuperAdmin = async (req, res, next) => {
  try {
    // 首先验证基本管理员权限
    await new Promise((resolve, reject) => {
      requireAdmin(req, res, (err) => {
        if (err) reject(err);
        else resolve();
      });
    });

    // 检查是否为admin用户
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: '需要admin用户权限'
      });
    }

    next();
  } catch (error) {
    console.error('Super admin auth middleware error:', error);
    return res.status(403).json({
      success: false,
      message: '权限验证失败'
    });
  }
};

module.exports = {
  requireAdmin,
  requireSuperAdmin
};

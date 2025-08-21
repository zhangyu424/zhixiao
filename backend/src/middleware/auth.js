const jwt = require('jsonwebtoken');
const config = require('../config');

// JWT认证中间件
const auth = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({
        success: false,
        message: '访问被拒绝，未提供token'
      });
    }

    const decoded = jwt.verify(token, config.jwt.secret);
    // 标准化用户对象，确保字段一致性
    req.user = {
      id: decoded.userId,
      userId: decoded.userId,
      studentId: decoded.studentId,
      role: decoded.role,
      unitId: decoded.unitId
    };
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'token已过期'
      });
    }
    
    return res.status(401).json({
      success: false,
      message: '无效的token'
    });
  }
};

// 角色权限检查中间件
const checkRole = (allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: '未授权访问'
      });
    }

    const userRole = req.user.role;
    if (!allowedRoles.includes(userRole)) {
      return res.status(403).json({
        success: false,
        message: '权限不足'
      });
    }

    next();
  };
};

// 管理员权限检查
const requireAdmin = checkRole(['admin']);

// 管理员或管理员权限检查
const requireManager = checkRole(['admin', 'manager']);

// 教员及以上权限检查
const requireInstructor = checkRole(['admin', 'manager', 'instructor']);

module.exports = {
  auth,
  checkRole,
  requireAdmin,
  requireManager,
  requireInstructor
};

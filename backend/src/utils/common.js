const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

/**
 * JWT工具类
 */
class TokenUtils {
  /**
   * 生成JWT Token
   */
  static generateToken(payload, options = {}) {
    const defaultOptions = {
      expiresIn: process.env.JWT_EXPIRES_IN || '7d',
      issuer: process.env.JWT_ISSUER || 'zhixiao-platform'
    };
    
    return jwt.sign(payload, process.env.JWT_SECRET, { ...defaultOptions, ...options });
  }

  /**
   * 验证JWT Token
   */
  static verifyToken(token) {
    try {
      return jwt.verify(token, process.env.JWT_SECRET);
    } catch (error) {
      throw new Error('Invalid token');
    }
  }

  /**
   * 解码Token（不验证）
   */
  static decodeToken(token) {
    return jwt.decode(token);
  }
}

/**
 * 密码工具类
 */
class PasswordUtils {
  /**
   * 加密密码
   */
  static async hashPassword(password) {
    const saltRounds = 10;
    return await bcrypt.hash(password, saltRounds);
  }

  /**
   * 验证密码
   */
  static async verifyPassword(password, hashedPassword) {
    return await bcrypt.compare(password, hashedPassword);
  }
}

/**
 * 响应工具类
 */
class ResponseUtils {
  /**
   * 成功响应
   */
  static success(res, data = null, message = '操作成功', code = 200) {
    return res.status(code).json({
      success: true,
      message,
      data,
      timestamp: new Date().toISOString()
    });
  }

  /**
   * 错误响应
   */
  static error(res, message = '操作失败', code = 400, details = null) {
    return res.status(code).json({
      success: false,
      message,
      details,
      timestamp: new Date().toISOString()
    });
  }

  /**
   * 服务器错误响应
   */
  static serverError(res, message = '服务器内部错误', error = null) {
    console.error('Server Error:', error);
    return res.status(500).json({
      success: false,
      message,
      timestamp: new Date().toISOString()
    });
  }

  /**
   * 未授权响应
   */
  static unauthorized(res, message = '未授权访问') {
    return res.status(401).json({
      success: false,
      message,
      timestamp: new Date().toISOString()
    });
  }

  /**
   * 禁止访问响应
   */
  static forbidden(res, message = '禁止访问') {
    return res.status(403).json({
      success: false,
      message,
      timestamp: new Date().toISOString()
    });
  }

  /**
   * 资源未找到响应
   */
  static notFound(res, message = '资源未找到') {
    return res.status(404).json({
      success: false,
      message,
      timestamp: new Date().toISOString()
    });
  }
}

/**
 * 时间工具类
 */
class TimeUtils {
  /**
   * 格式化时间
   */
  static formatTime(date, format = 'YYYY-MM-DD HH:mm:ss') {
    const moment = require('moment');
    return moment(date).format(format);
  }

  /**
   * 获取时间范围
   */
  static getDateRange(type = 'week') {
    const moment = require('moment');
    const now = moment();
    
    switch (type) {
      case 'today':
        return {
          start: now.startOf('day').toDate(),
          end: now.endOf('day').toDate()
        };
      case 'week':
        return {
          start: now.startOf('week').toDate(),
          end: now.endOf('week').toDate()
        };
      case 'month':
        return {
          start: now.startOf('month').toDate(),
          end: now.endOf('month').toDate()
        };
      case 'year':
        return {
          start: now.startOf('year').toDate(),
          end: now.endOf('year').toDate()
        };
      default:
        return {
          start: now.startOf('week').toDate(),
          end: now.endOf('week').toDate()
        };
    }
  }
}

module.exports = {
  TokenUtils,
  PasswordUtils,
  ResponseUtils,
  TimeUtils
};

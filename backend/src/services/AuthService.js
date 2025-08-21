const bcrypt = require('bcrypt');
const { pool } = require('../config/database');

class AuthService {
  /**
   * 用户登录验证
   * @param {string} studentId 学号
   * @param {string} password 密码
   * @returns {Object|null} 用户信息或null
   */
  static async login(studentId, password) {
    try {
      const [rows] = await pool.execute(
        'SELECT * FROM users WHERE student_id = ? AND status = ?',
        [studentId, 'active']
      );
      
      if (rows.length === 0) {
        return null;
      }
      
      const user = rows[0];
      
      // 验证密码
      const isValidPassword = await this.verifyPassword(password, user.password);
      if (!isValidPassword) {
        return null;
      }
      
      return user;
    } catch (error) {
      console.error('登录验证失败:', error);
      throw error;
    }
  }

  /**
   * 验证密码
   * @param {string} inputPassword 输入的密码
   * @param {string} hashedPassword 数据库中的哈希密码
   * @returns {boolean} 密码是否匹配
   */
  static async verifyPassword(inputPassword, hashedPassword) {
    try {
      // 如果密码没有加密（开发阶段），直接比较
      if (!hashedPassword.startsWith('$2b$')) {
        return inputPassword === hashedPassword;
      }
      
      // 使用bcrypt验证加密密码
      return await bcrypt.compare(inputPassword, hashedPassword);
    } catch (error) {
      console.error('密码验证失败:', error);
      return false;
    }
  }

  /**
   * 根据用户ID获取用户信息
   * @param {number} userId 用户ID
   * @returns {Object|null} 用户信息或null
   */
  static async getUserById(userId) {
    try {
      const [rows] = await pool.execute(
        'SELECT * FROM users WHERE id = ? AND status = ?',
        [userId, 'active']
      );
      
      return rows.length > 0 ? rows[0] : null;
    } catch (error) {
      console.error('获取用户信息失败:', error);
      throw error;
    }
  }

  /**
   * 根据学号获取用户信息
   * @param {string} studentId 学号
   * @returns {Object|null} 用户信息或null
   */
  static async getUserByStudentId(studentId) {
    try {
      const [rows] = await pool.execute(
        'SELECT * FROM users WHERE student_id = ? AND status = ?',
        [studentId, 'active']
      );
      
      return rows.length > 0 ? rows[0] : null;
    } catch (error) {
      console.error('获取用户信息失败:', error);
      throw error;
    }
  }

  /**
   * 重置密码
   * @param {string} studentId 学号
   * @param {string} phone 手机号
   * @param {string} newPassword 新密码
   * @returns {boolean} 是否成功
   */
  static async resetPassword(studentId, phone, newPassword) {
    try {
      // 验证用户存在且手机号匹配
      const [rows] = await pool.execute(
        'SELECT id FROM users WHERE student_id = ? AND phone = ? AND status = ?',
        [studentId, phone, 'active']
      );
      
      if (rows.length === 0) {
        return false;
      }
      
      // 加密新密码
      const hashedPassword = await bcrypt.hash(newPassword, 10);
      
      // 更新密码
      await pool.execute(
        'UPDATE users SET password = ?, updated_at = NOW() WHERE student_id = ?',
        [hashedPassword, studentId]
      );
      
      return true;
    } catch (error) {
      console.error('重置密码失败:', error);
      throw error;
    }
  }

  /**
   * 修改密码
   * @param {number} userId 用户ID
   * @param {string} oldPassword 旧密码
   * @param {string} newPassword 新密码
   * @param {string} phone 手机号（可选）
   * @returns {boolean} 是否成功
   */
  static async changePassword(userId, oldPassword, newPassword, phone = null) {
    try {
      // 获取用户当前信息
      const user = await this.getUserById(userId);
      if (!user) {
        return false;
      }
      
      // 如果提供了旧密码，验证旧密码
      if (oldPassword) {
        const isValidOldPassword = await this.verifyPassword(oldPassword, user.password);
        if (!isValidOldPassword) {
          return false;
        }
      }
      
      // 加密新密码
      const hashedPassword = await bcrypt.hash(newPassword, 10);
      
      // 构建更新SQL
      let updateSQL = 'UPDATE users SET password = ?, updated_at = NOW()';
      let params = [hashedPassword];
      
      // 如果提供了手机号，同时更新手机号
      if (phone) {
        updateSQL += ', phone = ?';
        params.push(phone);
      }
      
      updateSQL += ' WHERE id = ?';
      params.push(userId);
      
      await pool.execute(updateSQL, params);
      
      return true;
    } catch (error) {
      console.error('修改密码失败:', error);
      throw error;
    }
  }

  /**
   * 微信登录
   * @param {string} code 微信授权码
   * @returns {Object|null} 用户信息或null
   */
  static async wechatLogin(code) {
    try {
      // TODO: 实现微信登录逻辑
      // 1. 使用code向微信服务器换取openid和session_key
      // 2. 根据openid查找或创建用户
      // 3. 返回用户信息
      
      console.log('微信登录功能待实现:', code);
      return null;
    } catch (error) {
      console.error('微信登录失败:', error);
      throw error;
    }
  }
}

module.exports = AuthService;

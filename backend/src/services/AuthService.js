const { query } = require('../config/database');

class AuthService {
  /**
   * 用户登录
   * @param {string} student_id - 学号
   * @param {string} password - 密码
   * @returns {Promise<Object>} 用户信息
   */
  static async login(student_id, password) {
    const sql = `
      SELECT u.*, r.role_name, ut.unit_name 
      FROM users u
      LEFT JOIN roles r ON u.role_id = r.role_id
      LEFT JOIN units ut ON u.unit_id = ut.unit_id
      WHERE u.student_id = ? AND u.status = 'active'
    `;
    
    const users = await query(sql, [student_id]);
    return users[0] || null;
  }

  /**
   * 微信小程序登录
   * @param {string} code - 微信授权码
   * @returns {Promise<Object>} 用户信息
   */
  static async wechatLogin(code) {
    // 实现微信登录逻辑
    // 这里需要调用微信API获取openid
    throw new Error('微信登录功能待实现');
  }

  /**
   * 用户注册
   * @param {Object} userData - 用户数据
   * @returns {Promise<Object>} 注册结果
   */
  static async register(userData) {
    const { student_id, password, name, unit_id, role_id = 3 } = userData;
    
    // 检查用户是否已存在
    const existingUser = await this.getUserByStudentId(student_id);
    if (existingUser) {
      throw new Error('用户已存在');
    }

    const bcrypt = require('bcrypt');
    const hashedPassword = await bcrypt.hash(password, 10);
    
    const sql = `
      INSERT INTO users (student_id, password, name, unit_id, role_id, status, created_at)
      VALUES (?, ?, ?, ?, ?, 'active', NOW())
    `;
    
    const result = await query(sql, [student_id, hashedPassword, name, unit_id, role_id]);
    return { user_id: result.insertId, student_id, name };
  }

  /**
   * 根据学号获取用户
   * @param {string} student_id - 学号
   * @returns {Promise<Object>} 用户信息
   */
  static async getUserByStudentId(student_id) {
    const sql = 'SELECT * FROM users WHERE student_id = ?';
    const users = await query(sql, [student_id]);
    return users[0] || null;
  }

  /**
   * 验证用户密码
   * @param {string} password - 明文密码
   * @param {string} hashedPassword - 加密密码
   * @returns {Promise<boolean>} 验证结果
   */
  static async verifyPassword(password, hashedPassword) {
    const bcrypt = require('bcrypt');
    return await bcrypt.compare(password, hashedPassword);
  }

  /**
   * 刷新令牌
   * @param {string} refreshToken - 刷新令牌
   * @returns {Promise<Object>} 新的访问令牌
   */
  static async refreshToken(refreshToken) {
    // 实现令牌刷新逻辑
    throw new Error('令牌刷新功能待实现');
  }

  /**
   * 用户退出登录
   * @param {string} token - 访问令牌
   * @returns {Promise<boolean>} 退出结果
   */
  static async logout(token) {
    // 可以将token加入黑名单或进行其他处理
    return true;
  }
}

module.exports = AuthService;

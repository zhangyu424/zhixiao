const { query } = require('../config/database');

class AdminService {
  /**
   * 获取用户列表
   * @param {Object} params - 查询参数
   * @returns {Promise<Object>} 用户列表和分页信息
   */
  static async getUsers(params) {
    const { 
      page = 1, 
      limit = 20, 
      role, 
      status, 
      search,
      unit_id 
    } = params;
    
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const offset = (pageNum - 1) * limitNum;
    
    let conditions = [];
    let values = [];
    
    if (role) {
      conditions.push('u.role_id = ?');
      values.push(role);
    }
    
    if (status) {
      conditions.push('u.status = ?');
      values.push(status);
    }
    
    if (search) {
      conditions.push('(u.student_id LIKE ? OR u.name LIKE ?)');
      values.push(`%${search}%`, `%${search}%`);
    }
    
    if (unit_id) {
      conditions.push('u.unit_id = ?');
      values.push(unit_id);
    }
    
    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';
    
    // 获取总数
    const countSql = `
      SELECT COUNT(*) as total 
      FROM users u
      LEFT JOIN roles r ON u.role_id = r.role_id
      LEFT JOIN units ut ON u.unit_id = ut.unit_id
      ${whereClause}
    `;
    
    const totalResult = await query(countSql, values);
    const total = totalResult[0].total;
    
    // 获取用户列表
    const usersSql = `
      SELECT u.*, r.role_name, ut.unit_name
      FROM users u
      LEFT JOIN roles r ON u.role_id = r.role_id
      LEFT JOIN units ut ON u.unit_id = ut.unit_id
      ${whereClause}
      ORDER BY u.created_at DESC
      LIMIT ? OFFSET ?
    `;
    
    const users = await query(usersSql, [...values, limitNum, offset]);
    
    return {
      users,
      pagination: {
        total,
        page: pageNum,
        limit: limitNum,
        totalPages: Math.ceil(total / limitNum)
      }
    };
  }

  /**
   * 创建用户
   * @param {Object} userData - 用户数据
   * @returns {Promise<Object>} 创建结果
   */
  static async createUser(userData) {
    const { student_id, password, name, unit_id, role_id } = userData;
    
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
   * 更新用户信息
   * @param {number} userId - 用户ID
   * @param {Object} updateData - 更新数据
   * @returns {Promise<Object>} 更新结果
   */
  static async updateUser(userId, updateData) {
    const allowedFields = ['name', 'unit_id', 'role_id', 'status'];
    const updates = [];
    const values = [];
    
    for (const [key, value] of Object.entries(updateData)) {
      if (allowedFields.includes(key)) {
        updates.push(`${key} = ?`);
        values.push(value);
      }
    }
    
    if (updates.length === 0) {
      throw new Error('没有可更新的字段');
    }
    
    values.push(userId);
    
    const sql = `UPDATE users SET ${updates.join(', ')}, updated_at = NOW() WHERE user_id = ?`;
    await query(sql, values);
    
    return { user_id: userId, ...updateData };
  }

  /**
   * 删除用户
   * @param {number} userId - 用户ID
   * @returns {Promise<boolean>} 删除结果
   */
  static async deleteUser(userId) {
    const sql = 'UPDATE users SET status = "deleted", updated_at = NOW() WHERE user_id = ?';
    await query(sql, [userId]);
    return true;
  }

  /**
   * 获取系统统计信息
   * @returns {Promise<Object>} 统计信息
   */
  static async getSystemStats() {
    const stats = {};
    
    // 用户统计
    const userStats = await query(`
      SELECT 
        COUNT(*) as total_users,
        COUNT(CASE WHEN status = 'active' THEN 1 END) as active_users,
        COUNT(CASE WHEN role_id = 1 THEN 1 END) as admin_users,
        COUNT(CASE WHEN role_id = 2 THEN 1 END) as teacher_users,
        COUNT(CASE WHEN role_id = 3 THEN 1 END) as student_users
      FROM users
    `);
    stats.users = userStats[0];
    
    // 学习统计
    const studyStats = await query(`
      SELECT 
        COUNT(*) as total_records,
        COUNT(CASE WHEN DATE(created_at) = CURDATE() THEN 1 END) as today_records
      FROM study_records
    `);
    stats.study = studyStats[0];
    
    return stats;
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
   * 批量操作用户
   * @param {string} action - 操作类型
   * @param {Array} userIds - 用户ID列表
   * @returns {Promise<Object>} 操作结果
   */
  static async batchUserOperation(action, userIds) {
    if (!Array.isArray(userIds) || userIds.length === 0) {
      throw new Error('用户ID列表不能为空');
    }
    
    const placeholders = userIds.map(() => '?').join(',');
    let sql;
    
    switch (action) {
      case 'activate':
        sql = `UPDATE users SET status = 'active', updated_at = NOW() WHERE user_id IN (${placeholders})`;
        break;
      case 'deactivate':
        sql = `UPDATE users SET status = 'inactive', updated_at = NOW() WHERE user_id IN (${placeholders})`;
        break;
      case 'delete':
        sql = `UPDATE users SET status = 'deleted', updated_at = NOW() WHERE user_id IN (${placeholders})`;
        break;
      default:
        throw new Error('不支持的操作类型');
    }
    
    const result = await query(sql, userIds);
    return { affected: result.affectedRows };
  }
}

module.exports = AdminService;

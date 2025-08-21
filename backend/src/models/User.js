const { query } = require('../config/database');
const bcrypt = require('bcryptjs');

class User {
  // 根据openid查找用户
  static async findByOpenid(openid) {
    const sql = `
      SELECT u.*, un.name as unit_name, un.level as unit_level
      FROM users u
      LEFT JOIN units un ON u.unit_id = un.id
      WHERE u.openid = ?
    `;
    const result = await query(sql, [openid]);
    return result[0];
  }

  // 根据学员编号查找用户
  static async findByStudentId(studentId) {
    const sql = `
      SELECT u.*, un.name as unit_name
      FROM users u
      LEFT JOIN units un ON u.unit_id = un.id
      WHERE u.student_id = ?
    `;
    const result = await query(sql, [studentId]);
    return result[0];
  }

  // 根据ID查找用户
  static async findById(id) {
    const sql = `
      SELECT u.*, un.name as unit_name
      FROM users u
      LEFT JOIN units un ON u.unit_id = un.id
      WHERE u.id = ?
    `;
    const result = await query(sql, [id]);
    return result[0];
  }

  // 创建新用户
  static async create(userData) {
    const { openid, studentId, name, password, unitId, role = 'student' } = userData;
    
    const hashedPassword = await bcrypt.hash(password, 10);
    
    const sql = `
      INSERT INTO users (openid, student_id, name, password, unit_id, role, created_at)
      VALUES (?, ?, ?, ?, ?, ?, NOW())
    `;
    
    const result = await query(sql, [openid, studentId, name, hashedPassword, unitId, role]);
    return result.insertId;
  }

  // 验证密码
  static async verifyPassword(plainPassword, hashedPassword) {
    return await bcrypt.compare(plainPassword, hashedPassword);
  }

  // 更新用户信息
  static async update(id, updateData) {
    const fields = [];
    const values = [];
    
    const allowedFields = ['name', 'avatar', 'phone', 'email', 'unit_id', 'role'];
    
    for (const [key, value] of Object.entries(updateData)) {
      if (allowedFields.includes(key) && value !== undefined) {
        fields.push(`${key} = ?`);
        values.push(value);
      }
    }
    
    if (fields.length === 0) {
      throw new Error('没有有效的更新字段');
    }
    
    values.push(id);
    
    const sql = `UPDATE users SET ${fields.join(', ')}, updated_at = NOW() WHERE id = ?`;
    await query(sql, values);
  }

  // 获取用户列表
  static async getList(options = {}) {
    const { page = 1, limit = 20, role, unitId, keyword } = options;
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const offset = (pageNum - 1) * limitNum;

    let whereClause = 'WHERE 1=1';
    const params = [];
    
    if (role) {
      whereClause += ' AND u.role = ?';
      params.push(role);
    }
    
    if (unitId) {
      whereClause += ' AND u.unit_id = ?';
      params.push(unitId);
    }
    
    if (keyword) {
      whereClause += ' AND (u.name LIKE ? OR u.student_id LIKE ?)';
      params.push(`%${keyword}%`, `%${keyword}%`);
    }
    
    const sql = `
      SELECT u.id, u.student_id, u.name, u.role, u.avatar, u.phone, u.email,
             u.created_at, u.updated_at, un.name as unit_name
      FROM users u
      LEFT JOIN units un ON u.unit_id = un.id
      ${whereClause}
      ORDER BY u.created_at DESC
      LIMIT ${limitNum} OFFSET ${offset}
    `;
    
    const users = await query(sql, params);
    
    // 获取总数
    const countSql = `
      SELECT COUNT(*) as total
      FROM users u
      ${whereClause}
    `;
    
    const countResult = await query(countSql, params);
    const total = countResult[0].total;
    
    return {
      users,
      total,
      page: pageNum,
      limit: limitNum,
      totalPages: Math.ceil(total / limitNum)
    };
  }

  // 获取用户角色
  static async getUserRoles(userId) {
    const sql = `
      SELECT ur.role, r.name as role_name, r.permissions
      FROM user_roles ur
      JOIN roles r ON ur.role = r.key
      WHERE ur.user_id = ?
    `;
    return await query(sql, [userId]);
  }

  // 删除用户
  static async delete(id) {
    const sql = 'DELETE FROM users WHERE id = ?';
    await query(sql, [id]);
  }

  // 统计用户数量
  static async getStats() {
    const sql = `
      SELECT 
        COUNT(*) as total,
        SUM(CASE WHEN role = 'student' THEN 1 ELSE 0 END) as students,
        SUM(CASE WHEN role = 'instructor' THEN 1 ELSE 0 END) as instructors,
        SUM(CASE WHEN role = 'manager' THEN 1 ELSE 0 END) as managers,
        SUM(CASE WHEN role = 'admin' THEN 1 ELSE 0 END) as admins
      FROM users
    `;
    const result = await query(sql);
    return result[0];
  }
}

module.exports = User;

const { query } = require('../config/database');

class StudyRecord {
  // 创建学习记录
  static async create(recordData) {
    const { userId, date, studyTime, subject, remark } = recordData;
    
    const sql = `
      INSERT INTO study_records (user_id, date, study_time, subject, remark, created_at)
      VALUES (?, ?, ?, ?, ?, NOW())
      ON DUPLICATE KEY UPDATE
      study_time = VALUES(study_time),
      subject = VALUES(subject),
      remark = VALUES(remark),
      updated_at = NOW()
    `;
    
    const result = await query(sql, [userId, date, studyTime, subject, remark]);
    return result.insertId || result.affectedRows;
  }

  // 获取用户学习历史 - 简化版本用于调试
  static async getUserHistory(userId, options = {}) {
    try {
      // 参数验证
      if (!userId || userId === 'undefined' || userId === null) {
        console.warn('StudyRecord.getUserHistory: userId is invalid', userId);
        return {
          records: [],
          total: 0,
          page: 1,
          limit: 20,
          totalPages: 0
        };
      }

      const { page = 1, limit = 20, startDate, endDate } = options;
      const pageNum = parseInt(page);
      const limitNum = parseInt(limit);
      const offset = (pageNum - 1) * limitNum;
      
      // 构建 WHERE 条件，避免 undefined 参数
      let whereConditions = ['user_id = ?'];
      let queryParams = [userId];
      
      if (startDate && startDate !== 'undefined' && startDate !== null) {
        whereConditions.push('date >= ?');
        queryParams.push(startDate);
      }
      
      if (endDate && endDate !== 'undefined' && endDate !== null) {
        whereConditions.push('date <= ?');
        queryParams.push(endDate);
      }
      
      const whereClause = whereConditions.join(' AND ');
      
      const sql = `
        SELECT id, date, study_time, subject, remark, created_at, updated_at
        FROM study_records
        WHERE ${whereClause}
        ORDER BY date DESC
        LIMIT ${limitNum} OFFSET ${offset}
      `;
      
      const records = await query(sql, queryParams);
      
      // 总数查询
      const countSql = `
        SELECT COUNT(*) as total
        FROM study_records
        WHERE ${whereClause}
      `;
      
      const countResult = await query(countSql, queryParams);
      const total = countResult[0]?.total || 0;
      
      return {
        records: records || [],
        total,
        page: pageNum,
        limit: limitNum,
        totalPages: Math.ceil(total / limitNum)
      };
    } catch (error) {
      console.error('StudyRecord.getUserHistory error:', error);
      // 返回空结果而不是抛出错误
      return {
        records: [],
        total: 0,
        page: 1,
        limit: 20,
        totalPages: 0
      };
    }
  }

  // 获取月度数据
  static async getMonthlyData(userId, month) {
    const sql = `
      SELECT date, study_time, subject
      FROM study_records
      WHERE user_id = ? AND DATE_FORMAT(date, '%Y-%m') = ?
      ORDER BY date ASC
    `;
    
    return await query(sql, [userId, month]);
  }

  // 获取学习统计
  static async getUserStats(userId, options = {}) {
    const { startDate, endDate } = options;
    
    let whereClause = 'WHERE user_id = ?';
    const params = [userId];
    
    if (startDate) {
      whereClause += ' AND date >= ?';
      params.push(startDate);
    }
    
    if (endDate) {
      whereClause += ' AND date <= ?';
      params.push(endDate);
    }
    
    const sql = `
      SELECT 
        COUNT(*) as total_days,
        SUM(study_time) as total_hours,
        AVG(study_time) as avg_daily_hours,
        MAX(study_time) as max_daily_hours,
        MIN(study_time) as min_daily_hours
      FROM study_records
      ${whereClause}
    `;
    
    const result = await query(sql, params);
    return result[0];
  }

  // 获取团队统计
  static async getTeamStats(unitId, options = {}) {
    const { startDate, endDate, limit = 50 } = options;
    const limitNum = parseInt(limit);
    
    let whereClause = 'WHERE u.unit_id = ?';
    const params = [unitId];
    
    if (startDate) {
      whereClause += ' AND sr.date >= ?';
      params.push(startDate);
    }
    
    if (endDate) {
      whereClause += ' AND sr.date <= ?';
      params.push(endDate);
    }
    
    const sql = `
      SELECT 
        u.id as user_id,
        u.name,
        u.student_id,
        COUNT(sr.id) as study_days,
        SUM(sr.study_time) as total_hours,
        AVG(sr.study_time) as avg_daily_hours
      FROM users u
      LEFT JOIN study_records sr ON u.id = sr.user_id
      ${whereClause}
      GROUP BY u.id, u.name, u.student_id
      ORDER BY total_hours DESC
      LIMIT ${limitNum}
    `;
    
    return await query(sql, params);
  }

  // 获取排名
  static async getRanking(userId, scope = 'unit', period = 'month') {
    let dateCondition = '';
    if (period === 'week') {
      dateCondition = 'AND sr.date >= DATE_SUB(NOW(), INTERVAL 7 DAY)';
    } else if (period === 'month') {
      dateCondition = 'AND sr.date >= DATE_SUB(NOW(), INTERVAL 30 DAY)';
    }
    
    // 获取用户单位信息
    const userInfo = await query('SELECT unit_id FROM users WHERE id = ?', [userId]);
    if (!userInfo.length) return null;
    
    const unitId = userInfo[0].unit_id;
    
    let scopeCondition = '';
    if (scope === 'unit') {
      scopeCondition = 'AND u.unit_id = ?';
    }
    
    const sql = `
      SELECT 
        u.id,
        u.name,
        u.student_id,
        SUM(sr.study_time) as total_hours,
        ROW_NUMBER() OVER (ORDER BY SUM(sr.study_time) DESC) as ranking
      FROM users u
      LEFT JOIN study_records sr ON u.id = sr.user_id
      WHERE 1=1 ${dateCondition} ${scopeCondition}
      GROUP BY u.id, u.name, u.student_id
      HAVING total_hours > 0
      ORDER BY total_hours DESC
    `;
    
    const params = scope === 'unit' ? [unitId] : [];
    const rankings = await query(sql, params);
    
    const userRanking = rankings.find(r => r.id === userId);
    
    return {
      userRanking,
      totalParticipants: rankings.length,
      topRankings: rankings.slice(0, 10)
    };
  }

  // 删除学习记录
  static async delete(id, userId) {
    const sql = 'DELETE FROM study_records WHERE id = ? AND user_id = ?';
    const result = await query(sql, [id, userId]);
    return result.affectedRows > 0;
  }

  // 批量导入学习记录
  static async batchImport(records) {
    if (!records.length) return 0;
    
    const sql = `
      INSERT INTO study_records (user_id, date, study_time, subject, remark, created_at)
      VALUES ?
      ON DUPLICATE KEY UPDATE
      study_time = VALUES(study_time),
      subject = VALUES(subject),
      remark = VALUES(remark),
      updated_at = NOW()
    `;
    
    const values = records.map(record => [
      record.userId,
      record.date,
      record.studyTime,
      record.subject || '',
      record.remark || '',
      new Date()
    ]);
    
    const result = await query(sql, [values]);
    return result.affectedRows;
  }
}

module.exports = StudyRecord;

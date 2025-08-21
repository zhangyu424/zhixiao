const { query } = require('../config/database');

class ExamService {
  /**
   * 获取考试列表
   * @param {Object} params - 查询参数
   * @returns {Promise<Object>} 考试列表和分页信息
   */
  static async getExams(params) {
    const { 
      page = 1, 
      limit = 20, 
      status, 
      subject,
      unit_id,
      user_id 
    } = params;
    
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const offset = (pageNum - 1) * limitNum;
    
    let conditions = [];
    let values = [];
    
    if (status) {
      conditions.push('e.status = ?');
      values.push(status);
    }
    
    if (subject) {
      conditions.push('e.subject = ?');
      values.push(subject);
    }
    
    if (unit_id) {
      conditions.push('e.unit_id = ?');
      values.push(unit_id);
    }
    
    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';
    
    // 获取总数
    const countSql = `
      SELECT COUNT(*) as total 
      FROM exams e
      LEFT JOIN units u ON e.unit_id = u.unit_id
      ${whereClause}
    `;
    
    const totalResult = await query(countSql, values);
    const total = totalResult[0].total;
    
    // 获取考试列表
    const examsSql = `
      SELECT e.*, u.unit_name,
        (SELECT COUNT(*) FROM exam_participants ep WHERE ep.exam_id = e.exam_id) as participant_count
      FROM exams e
      LEFT JOIN units u ON e.unit_id = u.unit_id
      ${whereClause}
      ORDER BY e.created_at DESC
      LIMIT ? OFFSET ?
    `;
    
    const exams = await query(examsSql, [...values, limitNum, offset]);
    
    // 如果指定了用户ID，获取用户的参与状态
    if (user_id && exams.length > 0) {
      const examIds = exams.map(exam => exam.exam_id);
      const placeholders = examIds.map(() => '?').join(',');
      
      const participationSql = `
        SELECT exam_id, status, score, completed_at
        FROM exam_participants 
        WHERE exam_id IN (${placeholders}) AND user_id = ?
      `;
      
      const participations = await query(participationSql, [...examIds, user_id]);
      const participationMap = {};
      participations.forEach(p => {
        participationMap[p.exam_id] = p;
      });
      
      exams.forEach(exam => {
        exam.user_participation = participationMap[exam.exam_id] || null;
      });
    }
    
    return {
      exams,
      pagination: {
        total,
        page: pageNum,
        limit: limitNum,
        totalPages: Math.ceil(total / limitNum)
      }
    };
  }

  /**
   * 创建考试
   * @param {Object} examData - 考试数据
   * @returns {Promise<Object>} 创建结果
   */
  static async createExam(examData) {
    const { 
      title, 
      description, 
      subject,
      unit_id,
      start_time,
      end_time,
      duration,
      total_score,
      pass_score,
      question_count,
      created_by 
    } = examData;
    
    const sql = `
      INSERT INTO exams (
        title, description, subject, unit_id, start_time, end_time, 
        duration, total_score, pass_score, question_count, 
        created_by, status, created_at
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'draft', NOW())
    `;
    
    const result = await query(sql, [
      title, description, subject, unit_id, start_time, end_time,
      duration, total_score, pass_score, question_count, created_by
    ]);
    
    return { exam_id: result.insertId, ...examData };
  }

  /**
   * 更新考试信息
   * @param {number} examId - 考试ID
   * @param {Object} updateData - 更新数据
   * @returns {Promise<Object>} 更新结果
   */
  static async updateExam(examId, updateData) {
    const allowedFields = [
      'title', 'description', 'subject', 'start_time', 'end_time',
      'duration', 'total_score', 'pass_score', 'question_count', 'status'
    ];
    
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
    
    values.push(examId);
    
    const sql = `UPDATE exams SET ${updates.join(', ')}, updated_at = NOW() WHERE exam_id = ?`;
    await query(sql, values);
    
    return { exam_id: examId, ...updateData };
  }

  /**
   * 删除考试
   * @param {number} examId - 考试ID
   * @returns {Promise<boolean>} 删除结果
   */
  static async deleteExam(examId) {
    const sql = 'UPDATE exams SET status = "deleted", updated_at = NOW() WHERE exam_id = ?';
    await query(sql, [examId]);
    return true;
  }

  /**
   * 根据ID获取考试详情
   * @param {number} examId - 考试ID
   * @returns {Promise<Object>} 考试详情
   */
  static async getExamById(examId) {
    const sql = `
      SELECT e.*, u.unit_name,
        (SELECT COUNT(*) FROM exam_participants ep WHERE ep.exam_id = e.exam_id) as participant_count,
        (SELECT COUNT(*) FROM exam_participants ep WHERE ep.exam_id = e.exam_id AND ep.status = 'completed') as completed_count
      FROM exams e
      LEFT JOIN units u ON e.unit_id = u.unit_id
      WHERE e.exam_id = ?
    `;
    
    const exams = await query(sql, [examId]);
    return exams[0] || null;
  }

  /**
   * 用户参加考试
   * @param {number} examId - 考试ID
   * @param {number} userId - 用户ID
   * @returns {Promise<Object>} 参与结果
   */
  static async joinExam(examId, userId) {
    // 检查考试是否存在且可参加
    const exam = await this.getExamById(examId);
    if (!exam) {
      throw new Error('考试不存在');
    }
    
    if (exam.status !== 'published') {
      throw new Error('考试未开放');
    }
    
    // 检查是否已经参加
    const existingParticipation = await this.getUserExamParticipation(examId, userId);
    if (existingParticipation) {
      throw new Error('已经参加过此考试');
    }
    
    const sql = `
      INSERT INTO exam_participants (exam_id, user_id, status, started_at, created_at)
      VALUES (?, ?, 'in_progress', NOW(), NOW())
    `;
    
    const result = await query(sql, [examId, userId]);
    return { participation_id: result.insertId, exam_id: examId, user_id: userId };
  }

  /**
   * 提交考试答案
   * @param {number} examId - 考试ID
   * @param {number} userId - 用户ID
   * @param {Array} answers - 答案列表
   * @returns {Promise<Object>} 提交结果
   */
  static async submitExam(examId, userId, answers) {
    // 检查参与状态
    const participation = await this.getUserExamParticipation(examId, userId);
    if (!participation || participation.status !== 'in_progress') {
      throw new Error('考试状态无效');
    }
    
    // 计算分数（这里需要根据实际题目和答案计算）
    const score = this.calculateScore(answers);
    
    // 更新参与记录
    const sql = `
      UPDATE exam_participants 
      SET status = 'completed', score = ?, completed_at = NOW(), answers = ?
      WHERE exam_id = ? AND user_id = ?
    `;
    
    await query(sql, [score, JSON.stringify(answers), examId, userId]);
    
    return { exam_id: examId, user_id: userId, score, status: 'completed' };
  }

  /**
   * 获取用户考试参与记录
   * @param {number} examId - 考试ID
   * @param {number} userId - 用户ID
   * @returns {Promise<Object>} 参与记录
   */
  static async getUserExamParticipation(examId, userId) {
    const sql = `
      SELECT * FROM exam_participants 
      WHERE exam_id = ? AND user_id = ?
    `;
    
    const participations = await query(sql, [examId, userId]);
    return participations[0] || null;
  }

  /**
   * 获取考试统计信息
   * @param {number} examId - 考试ID
   * @returns {Promise<Object>} 统计信息
   */
  static async getExamStats(examId) {
    const sql = `
      SELECT 
        COUNT(*) as total_participants,
        COUNT(CASE WHEN status = 'completed' THEN 1 END) as completed_count,
        COUNT(CASE WHEN status = 'in_progress' THEN 1 END) as in_progress_count,
        AVG(CASE WHEN status = 'completed' THEN score END) as average_score,
        MAX(CASE WHEN status = 'completed' THEN score END) as max_score,
        MIN(CASE WHEN status = 'completed' THEN score END) as min_score
      FROM exam_participants 
      WHERE exam_id = ?
    `;
    
    const stats = await query(sql, [examId]);
    return stats[0];
  }

  /**
   * 计算考试分数（示例实现）
   * @param {Array} answers - 答案列表
   * @returns {number} 分数
   */
  static calculateScore(answers) {
    // 这里应该根据实际的题目和正确答案来计算分数
    // 目前返回一个示例分数
    return Math.floor(Math.random() * 100);
  }
}

module.exports = ExamService;

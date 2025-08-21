const StudyRecord = require('../models/StudyRecord');
const moment = require('moment');

class StudyService {
  /**
   * 创建学习记录
   */
  async createStudyRecord(recordData) {
    try {
      const record = await StudyRecord.create(recordData);
      return { success: true, data: record };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  /**
   * 获取用户学习记录
   */
  async getUserStudyRecords(userId, filters = {}) {
    try {
      const records = await StudyRecord.findByUserId(userId, filters);
      return { success: true, data: records };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  /**
   * 分析用户学习数据
   */
  async analyzeUserStudy(userId, dateRange = {}) {
    try {
      const { startDate, endDate } = dateRange;
      const records = await StudyRecord.findByUserId(userId, { startDate, endDate });
      
      // 计算学习统计
      const totalStudyTime = records.reduce((sum, record) => sum + record.duration, 0);
      const totalSessions = records.length;
      const avgSessionTime = totalSessions > 0 ? totalStudyTime / totalSessions : 0;
      
      // 按日期分组统计
      const dailyStats = this.groupByDate(records);
      
      // 按科目分组统计
      const subjectStats = this.groupBySubject(records);
      
      return {
        success: true,
        data: {
          totalStudyTime,
          totalSessions,
          avgSessionTime,
          dailyStats,
          subjectStats
        }
      };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  /**
   * 按日期分组
   */
  groupByDate(records) {
    const grouped = {};
    records.forEach(record => {
      const date = moment(record.createdAt).format('YYYY-MM-DD');
      if (!grouped[date]) {
        grouped[date] = {
          date,
          totalTime: 0,
          sessions: 0,
          subjects: new Set()
        };
      }
      grouped[date].totalTime += record.duration;
      grouped[date].sessions += 1;
      grouped[date].subjects.add(record.subject);
    });
    
    // 转换Set为数组
    Object.values(grouped).forEach(day => {
      day.subjects = Array.from(day.subjects);
      day.subjectCount = day.subjects.length;
    });
    
    return Object.values(grouped);
  }

  /**
   * 按科目分组
   */
  groupBySubject(records) {
    const grouped = {};
    records.forEach(record => {
      const subject = record.subject || '未分类';
      if (!grouped[subject]) {
        grouped[subject] = {
          subject,
          totalTime: 0,
          sessions: 0,
          avgScore: 0,
          scores: []
        };
      }
      grouped[subject].totalTime += record.duration;
      grouped[subject].sessions += 1;
      if (record.score !== null && record.score !== undefined) {
        grouped[subject].scores.push(record.score);
      }
    });
    
    // 计算平均分
    Object.values(grouped).forEach(subjectData => {
      if (subjectData.scores.length > 0) {
        subjectData.avgScore = subjectData.scores.reduce((sum, score) => sum + score, 0) / subjectData.scores.length;
      }
      delete subjectData.scores; // 删除原始分数数组
    });
    
    return Object.values(grouped);
  }

  /**
   * 更新学习记录
   */
  async updateStudyRecord(recordId, updateData) {
    try {
      const record = await StudyRecord.update(recordId, updateData);
      return { success: true, data: record };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  /**
   * 删除学习记录
   */
  async deleteStudyRecord(recordId) {
    try {
      await StudyRecord.delete(recordId);
      return { success: true, message: '学习记录删除成功' };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }
}

module.exports = new StudyService();

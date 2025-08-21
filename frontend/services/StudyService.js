const http = require('../utils/api/http');

/**
 * 学习记录相关API服务
 * 对应后端 study.js 路由
 */
class StudyService {
  /**
   * 提交学习时间
   */
  static async submitStudyTime(studyData) {
    try {
      const response = await http.post('/study/submit', studyData);
      return response;
    } catch (error) {
      console.error('提交学习时间失败:', error);
      throw error;
    }
  }

  /**
   * 获取学习历史
   */
  static async getHistory(params = {}) {
    try {
      const response = await http.get('/study/history', params);
      return response;
    } catch (error) {
      console.error('获取学习历史失败:', error);
      throw error;
    }
  }

  /**
   * 获取月度日历数据
   */
  static async getCalendar(year, month) {
    try {
      const response = await http.get('/study/calendar', { year, month });
      return response;
    } catch (error) {
      console.error('获取日历数据失败:', error);
      throw error;
    }
  }

  /**
   * 获取学习统计
   */
  static async getStats(timeRange = 'week') {
    try {
      const response = await http.get(`/study/stats?range=${timeRange}`);
      return response;
    } catch (error) {
      console.error('获取学习统计失败:', error);
      throw error;
    }
  }

  /**
   * 获取排名数据
   */
  static async getRanking(type = 'week', unitId = null) {
    try {
      const params = { type };
      if (unitId) params.unitId = unitId;
      
      const response = await http.get('/study/ranking', params);
      return response;
    } catch (error) {
      console.error('获取排名失败:', error);
      throw error;
    }
  }

  /**
   * 获取热力图数据
   */
  static async getHeatmapData(year) {
    try {
      const response = await http.get('/study/heatmap', { year });
      return response;
    } catch (error) {
      console.error('获取热力图数据失败:', error);
      throw error;
    }
  }

  /**
   * 获取今日学习数据 (P0紧急API)
   */
  static async getTodayData() {
    try {
      const response = await http.get('/study/today');
      return response;
    } catch (error) {
      console.error('获取今日学习数据失败:', error);
      throw error;
    }
  }

  /**
   * 开始学习计时
   */
  static async startStudyTimer(subject, content = '') {
    try {
      const response = await http.post('/study/timer/start', {
        subject,
        content,
        startTime: new Date().toISOString()
      });
      return response;
    } catch (error) {
      console.error('开始学习计时失败:', error);
      throw error;
    }
  }

  /**
   * 结束学习计时
   */
  static async stopStudyTimer(timerId, endData = {}) {
    try {
      const response = await http.post(`/study/timer/${timerId}/stop`, {
        ...endData,
        endTime: new Date().toISOString()
      });
      return response;
    } catch (error) {
      console.error('结束学习计时失败:', error);
      throw error;
    }
  }

  /**
   * 暂停学习计时
   */
  static async pauseStudyTimer(timerId) {
    try {
      const response = await http.post(`/study/timer/${timerId}/pause`);
      return response;
    } catch (error) {
      console.error('暂停学习计时失败:', error);
      throw error;
    }
  }

  /**
   * 恢复学习计时
   */
  static async resumeStudyTimer(timerId) {
    try {
      const response = await http.post(`/study/timer/${timerId}/resume`);
      return response;
    } catch (error) {
      console.error('恢复学习计时失败:', error);
      throw error;
    }
  }

  /**
   * 获取学习统计
   */
  static async getStudyStats(timeRange = 'week') {
    try {
      const response = await http.get(`/study/stats?range=${timeRange}`);
      return response;
    } catch (error) {
      console.error('获取学习统计失败:', error);
      throw error;
    }
  }

  /**
   * 获取学习分析报告
   */
  static async getAnalysisReport(startDate, endDate) {
    try {
      const response = await http.get('/study/analysis', {
        startDate,
        endDate
      });
      return response;
    } catch (error) {
      console.error('获取学习分析报告失败:', error);
      throw error;
    }
  }

  /**
   * 获取学习目标
   */
  static async getStudyGoals() {
    try {
      const response = await http.get('/study/goals');
      return response;
    } catch (error) {
      console.error('获取学习目标失败:', error);
      throw error;
    }
  }

  /**
   * 设置学习目标
   */
  static async setStudyGoal(goalData) {
    try {
      const response = await http.post('/study/goals', goalData);
      return response;
    } catch (error) {
      console.error('设置学习目标失败:', error);
      throw error;
    }
  }

  /**
   * 获取学习建议
   */
  static async getStudySuggestions() {
    try {
      const response = await http.get('/study/suggestions');
      return response;
    } catch (error) {
      console.error('获取学习建议失败:', error);
      throw error;
    }
  }

  /**
   * 导出学习数据
   */
  static async exportStudyData(format = 'excel', dateRange = {}) {
    try {
      const response = await http.get('/study/export', {
        format,
        ...dateRange
      });
      return response;
    } catch (error) {
      console.error('导出学习数据失败:', error);
      throw error;
    }
  }
}

module.exports = StudyService;

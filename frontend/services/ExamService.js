const http = require('../utils/api/http');

/**
 * 考试相关API服务
 * 对应后端 exam.js 路由
 */
class ExamService {
  /**
   * 获取最新考试信息
   */
  static async getLatestExam() {
    try {
      const response = await http.get('/exam/latest');
      return response;
    } catch (error) {
      console.error('获取最新考试信息失败:', error);
      throw error;
    }
  }

  /**
   * 获取考试列表
   */
  static async getExamList(params = {}) {
    try {
      const response = await http.get('/exam/list', params);
      return response;
    } catch (error) {
      console.error('获取考试列表失败:', error);
      throw error;
    }
  }

  /**
   * 获取考试详情
   */
  static async getExamDetail(examId) {
    try {
      const response = await http.get(`/exam/${examId}`);
      return response;
    } catch (error) {
      console.error('获取考试详情失败:', error);
      throw error;
    }
  }

  /**
   * 报名考试
   */
  static async registerExam(examId) {
    try {
      const response = await http.post(`/exam/${examId}/register`);
      return response;
    } catch (error) {
      console.error('报名考试失败:', error);
      throw error;
    }
  }

  /**
   * 取消报名
   */
  static async cancelRegistration(examId) {
    try {
      const response = await http.delete(`/exam/${examId}/register`);
      return response;
    } catch (error) {
      console.error('取消报名失败:', error);
      throw error;
    }
  }

  /**
   * 获取我的考试报名
   */
  static async getMyRegistrations() {
    try {
      const response = await http.get('/exam/my-registrations');
      return response;
    } catch (error) {
      console.error('获取我的考试报名失败:', error);
      throw error;
    }
  }

  /**
   * 获取考试结果
   */
  static async getExamResults(examId) {
    try {
      const response = await http.get(`/exam/${examId}/results`);
      return response;
    } catch (error) {
      console.error('获取考试结果失败:', error);
      throw error;
    }
  }

  /**
   * 提交考试答案
   */
  static async submitExamAnswers(examId, answers) {
    try {
      const response = await http.post(`/exam/${examId}/submit`, { answers });
      return response;
    } catch (error) {
      console.error('提交考试答案失败:', error);
      throw error;
    }
  }

  /**
   * 开始考试
   */
  static async startExam(examId) {
    try {
      const response = await http.post(`/exam/${examId}/start`);
      return response;
    } catch (error) {
      console.error('开始考试失败:', error);
      throw error;
    }
  }

  /**
   * 结束考试
   */
  static async finishExam(examId) {
    try {
      const response = await http.post(`/exam/${examId}/finish`);
      return response;
    } catch (error) {
      console.error('结束考试失败:', error);
      throw error;
    }
  }

  /**
   * 获取考试统计
   */
  static async getExamStats() {
    try {
      const response = await http.get('/exam/stats');
      return response;
    } catch (error) {
      console.error('获取考试统计失败:', error);
      throw error;
    }
  }

  /**
   * 获取即将到来的考试
   */
  static async getUpcomingExams() {
    try {
      const response = await http.get('/exam/upcoming');
      return response;
    } catch (error) {
      console.error('获取即将到来的考试失败:', error);
      throw error;
    }
  }
}

module.exports = ExamService;

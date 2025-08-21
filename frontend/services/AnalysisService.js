const http = require('../utils/api/http');

/**
 * 分析相关API服务
 * 对应后端 analysis.js 路由
 */
class AnalysisService {
  /**
   * 获取最近分析数据
   */
  static async getRecentAnalysis(days = 7) {
    try {
      const response = await http.get(`/analysis/recent?days=${days}`);
      return response;
    } catch (error) {
      console.error('获取最近分析数据失败:', error);
      throw error;
    }
  }

  /**
   * 获取学习趋势分析
   */
  static async getStudyTrends(params = {}) {
    try {
      const response = await http.get('/analysis/trends', params);
      return response;
    } catch (error) {
      console.error('获取学习趋势失败:', error);
      throw error;
    }
  }

  /**
   * 获取效率分析
   */
  static async getEfficiencyAnalysis(timeRange = 'week') {
    try {
      const response = await http.get(`/analysis/efficiency?range=${timeRange}`);
      return response;
    } catch (error) {
      console.error('获取效率分析失败:', error);
      throw error;
    }
  }

  /**
   * 获取学习模式分析
   */
  static async getStudyPatterns() {
    try {
      const response = await http.get('/analysis/patterns');
      return response;
    } catch (error) {
      console.error('获取学习模式分析失败:', error);
      throw error;
    }
  }

  /**
   * 获取对比分析
   */
  static async getComparisonAnalysis(compareType = 'peer', timeRange = 'week') {
    try {
      const response = await http.get('/analysis/comparison', {
        type: compareType,
        range: timeRange
      });
      return response;
    } catch (error) {
      console.error('获取对比分析失败:', error);
      throw error;
    }
  }

  /**
   * 获取详细分析报告
   */
  static async getDetailedReport(startDate, endDate) {
    try {
      const response = await http.get('/analysis/report', {
        startDate,
        endDate
      });
      return response;
    } catch (error) {
      console.error('获取详细报告失败:', error);
      throw error;
    }
  }

  /**
   * 获取学习建议
   */
  static async getStudySuggestions() {
    try {
      const response = await http.get('/analysis/suggestions');
      return response;
    } catch (error) {
      console.error('获取学习建议失败:', error);
      throw error;
    }
  }

  /**
   * 获取成就分析
   */
  static async getAchievements() {
    try {
      const response = await http.get('/analysis/achievements');
      return response;
    } catch (error) {
      console.error('获取成就分析失败:', error);
      throw error;
    }
  }

  /**
   * 导出分析数据
   */
  static async exportAnalysis(format = 'excel', dateRange = {}) {
    try {
      const response = await http.get('/analysis/export', {
        format,
        ...dateRange
      });
      return response;
    } catch (error) {
      console.error('导出分析数据失败:', error);
      throw error;
    }
  }
}

module.exports = AnalysisService;

const http = require('../utils/api/http');

/**
 * 文档相关API服务
 * 对应后端 documents.js 路由
 */
class DocumentService {
  /**
   * 获取文档列表
   */
  static async getDocumentList(params = {}) {
    try {
      const response = await http.get('/documents/list', params);
      return response;
    } catch (error) {
      console.error('获取文档列表失败:', error);
      throw error;
    }
  }

  /**
   * 搜索文档
   */
  static async searchDocuments(keyword, filters = {}) {
    try {
      const response = await http.get('/documents/search', {
        keyword,
        ...filters
      });
      return response;
    } catch (error) {
      console.error('搜索文档失败:', error);
      throw error;
    }
  }

  /**
   * 获取具体文档内容
   */
  static async getDocument(docId) {
    try {
      const response = await http.get(`/documents/${docId}`);
      return response;
    } catch (error) {
      console.error('获取文档内容失败:', error);
      throw error;
    }
  }

  /**
   * 提交需求或问题反馈
   */
  static async submitFeedback(feedbackData) {
    try {
      const response = await http.post('/documents/feedback', feedbackData);
      return response;
    } catch (error) {
      console.error('提交反馈失败:', error);
      throw error;
    }
  }

  /**
   * 获取反馈列表（管理员功能）
   */
  static async getFeedbackList(params = {}) {
    try {
      const response = await http.get('/documents/feedback/list', params);
      return response;
    } catch (error) {
      console.error('获取反馈列表失败:', error);
      throw error;
    }
  }

  /**
   * 获取文档分类
   */
  static async getDocumentCategories() {
    try {
      const response = await http.get('/documents/categories');
      return response;
    } catch (error) {
      console.error('获取文档分类失败:', error);
      throw error;
    }
  }

  /**
   * 获取热门文档
   */
  static async getPopularDocuments(limit = 10) {
    try {
      const response = await http.get(`/documents/popular?limit=${limit}`);
      return response;
    } catch (error) {
      console.error('获取热门文档失败:', error);
      throw error;
    }
  }

  /**
   * 获取最近更新的文档
   */
  static async getRecentDocuments(limit = 10) {
    try {
      const response = await http.get(`/documents/recent?limit=${limit}`);
      return response;
    } catch (error) {
      console.error('获取最近文档失败:', error);
      throw error;
    }
  }

  /**
   * 标记文档为已读
   */
  static async markAsRead(docId) {
    try {
      const response = await http.post(`/documents/${docId}/read`);
      return response;
    } catch (error) {
      console.error('标记文档已读失败:', error);
      throw error;
    }
  }

  /**
   * 收藏文档
   */
  static async favoriteDocument(docId) {
    try {
      const response = await http.post(`/documents/${docId}/favorite`);
      return response;
    } catch (error) {
      console.error('收藏文档失败:', error);
      throw error;
    }
  }

  /**
   * 取消收藏文档
   */
  static async unfavoriteDocument(docId) {
    try {
      const response = await http.delete(`/documents/${docId}/favorite`);
      return response;
    } catch (error) {
      console.error('取消收藏失败:', error);
      throw error;
    }
  }

  /**
   * 获取收藏的文档列表
   */
  static async getFavoriteDocuments() {
    try {
      const response = await http.get('/documents/favorites');
      return response;
    } catch (error) {
      console.error('获取收藏文档失败:', error);
      throw error;
    }
  }
}

module.exports = DocumentService;

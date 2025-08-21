const http = require('../utils/api/http');

/**
 * 通知相关API服务
 * 对应后端 notifications.js 路由
 */
class NotificationService {
  /**
   * 获取通知列表
   */
  static async getNotifications(params = {}) {
    try {
      const response = await http.get('/notifications', params);
      return response;
    } catch (error) {
      console.error('获取通知列表失败:', error);
      throw error;
    }
  }

  /**
   * 标记通知为已读
   */
  static async markAsRead(notificationId) {
    try {
      const response = await http.post(`/notifications/${notificationId}/read`);
      return response;
    } catch (error) {
      console.error('标记通知已读失败:', error);
      throw error;
    }
  }

  /**
   * 标记所有通知为已读
   */
  static async markAllAsRead() {
    try {
      const response = await http.post('/notifications/read-all');
      return response;
    } catch (error) {
      console.error('标记所有通知已读失败:', error);
      throw error;
    }
  }

  /**
   * 删除通知
   */
  static async deleteNotification(notificationId) {
    try {
      const response = await http.delete(`/notifications/${notificationId}`);
      return response;
    } catch (error) {
      console.error('删除通知失败:', error);
      throw error;
    }
  }

  /**
   * 获取未读通知数量
   */
  static async getUnreadCount() {
    try {
      const response = await http.get('/notifications/unread-count');
      return response;
    } catch (error) {
      console.error('获取未读通知数量失败:', error);
      throw error;
    }
  }

  /**
   * 获取通知设置
   */
  static async getNotificationSettings() {
    try {
      const response = await http.get('/notifications/settings');
      return response;
    } catch (error) {
      console.error('获取通知设置失败:', error);
      throw error;
    }
  }

  /**
   * 更新通知设置
   */
  static async updateNotificationSettings(settings) {
    try {
      const response = await http.put('/notifications/settings', settings);
      return response;
    } catch (error) {
      console.error('更新通知设置失败:', error);
      throw error;
    }
  }

  /**
   * 订阅通知类型
   */
  static async subscribeNotificationType(type) {
    try {
      const response = await http.post('/notifications/subscribe', { type });
      return response;
    } catch (error) {
      console.error('订阅通知失败:', error);
      throw error;
    }
  }

  /**
   * 取消订阅通知类型
   */
  static async unsubscribeNotificationType(type) {
    try {
      const response = await http.post('/notifications/unsubscribe', { type });
      return response;
    } catch (error) {
      console.error('取消订阅通知失败:', error);
      throw error;
    }
  }

  /**
   * 发送测试通知
   */
  static async sendTestNotification() {
    try {
      const response = await http.post('/notifications/test');
      return response;
    } catch (error) {
      console.error('发送测试通知失败:', error);
      throw error;
    }
  }

  /**
   * 获取通知历史
   */
  static async getNotificationHistory(params = {}) {
    try {
      const response = await http.get('/notifications/history', params);
      return response;
    } catch (error) {
      console.error('获取通知历史失败:', error);
      throw error;
    }
  }
}

module.exports = NotificationService;

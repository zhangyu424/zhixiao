const http = require('../utils/api/http');

/**
 * 用户相关API服务
 * 对应后端 users.js 路由
 */
class UserService {
  /**
   * 获取用户个人信息
   */
  static async getProfile() {
    try {
      const response = await http.get('/users/profile');
      return response;
    } catch (error) {
      console.error('获取用户信息失败:', error);
      throw error;
    }
  }

  /**
   * 更新用户个人信息
   */
  static async updateProfile(updateData) {
    try {
      const response = await http.put('/users/profile', updateData);
      return response;
    } catch (error) {
      console.error('更新用户信息失败:', error);
      throw error;
    }
  }

  /**
   * 修改密码
   */
  static async changePassword(oldPassword, newPassword) {
    try {
      const response = await http.post('/users/change-password', {
        oldPassword,
        newPassword
      });
      return response;
    } catch (error) {
      console.error('修改密码失败:', error);
      throw error;
    }
  }

  /**
   * 获取用户角色信息
   */
  static async getRoles() {
    try {
      const response = await http.get('/users/roles');
      return response;
    } catch (error) {
      console.error('获取用户角色失败:', error);
      throw error;
    }
  }

  /**
   * 获取用户学习统计
   */
  static async getStudyStats(timeRange = 'week') {
    try {
      const response = await http.get(`/users/study-stats?range=${timeRange}`);
      return response;
    } catch (error) {
      console.error('获取用户学习统计失败:', error);
      throw error;
    }
  }

  /**
   * 获取用户通知设置
   */
  static async getNotificationSettings() {
    try {
      const response = await http.get('/users/notification-settings');
      return response;
    } catch (error) {
      console.error('获取通知设置失败:', error);
      throw error;
    }
  }

  /**
   * 更新用户通知设置
   */
  static async updateNotificationSettings(settings) {
    try {
      const response = await http.put('/users/notification-settings', settings);
      return response;
    } catch (error) {
      console.error('更新通知设置失败:', error);
      throw error;
    }
  }

  /**
   * 上传头像
   */
  static async uploadAvatar(filePath) {
    try {
      const response = await http.upload('/users/avatar', filePath);
      return response;
    } catch (error) {
      console.error('上传头像失败:', error);
      throw error;
    }
  }

  /**
   * 修改密码
   */
  static async changePassword(oldPassword, newPassword) {
    try {
      const response = await http.post('/users/change-password', {
        oldPassword,
        newPassword
      });
      return response;
    } catch (error) {
      console.error('修改密码失败:', error);
      throw error;
    }
  }

  /**
   * 注销账号
   */
  static async deleteAccount() {
    try {
      const response = await http.delete('/users/account');
      return response;
    } catch (error) {
      console.error('注销账号失败:', error);
      throw error;
    }
  }

  /**
   * 获取学习排行榜
   */
  static async getLeaderboard(type = 'week', unitId = null) {
    try {
      const params = { type };
      if (unitId) params.unitId = unitId;
      
      const response = await http.get('/users/leaderboard', params);
      return response;
    } catch (error) {
      console.error('获取排行榜失败:', error);
      throw error;
    }
  }
}

module.exports = UserService;

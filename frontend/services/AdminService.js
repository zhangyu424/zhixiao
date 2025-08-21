const http = require('../utils/api/http');

/**
 * 管理员相关API服务
 * 对应后端 admin.js 路由
 */
class AdminService {
  /**
   * 获取用户列表
   */
  static async getUsers(params = {}) {
    try {
      const response = await http.get('/admin/users', params);
      return response;
    } catch (error) {
      console.error('获取用户列表失败:', error);
      throw error;
    }
  }

  /**
   * 创建用户
   */
  static async createUser(userData) {
    try {
      const response = await http.post('/admin/users', userData);
      return response;
    } catch (error) {
      console.error('创建用户失败:', error);
      throw error;
    }
  }

  /**
   * 更新用户信息
   */
  static async updateUser(userId, userData) {
    try {
      const response = await http.put(`/admin/users/${userId}`, userData);
      return response;
    } catch (error) {
      console.error('更新用户信息失败:', error);
      throw error;
    }
  }

  /**
   * 删除用户
   */
  static async deleteUser(userId) {
    try {
      const response = await http.delete(`/admin/users/${userId}`);
      return response;
    } catch (error) {
      console.error('删除用户失败:', error);
      throw error;
    }
  }

  /**
   * 获取用户详情
   */
  static async getUserDetail(userId) {
    try {
      const response = await http.get(`/admin/users/${userId}`);
      return response;
    } catch (error) {
      console.error('获取用户详情失败:', error);
      throw error;
    }
  }

  /**
   * 重置用户密码
   */
  static async resetUserPassword(userId, newPassword) {
    try {
      const response = await http.post(`/admin/users/${userId}/reset-password`, {
        newPassword
      });
      return response;
    } catch (error) {
      console.error('重置用户密码失败:', error);
      throw error;
    }
  }

  /**
   * 激活/停用用户
   */
  static async toggleUserStatus(userId, status) {
    try {
      const response = await http.post(`/admin/users/${userId}/toggle-status`, {
        status
      });
      return response;
    } catch (error) {
      console.error('切换用户状态失败:', error);
      throw error;
    }
  }

  /**
   * 获取学习记录管理列表
   */
  static async getStudyRecords(params = {}) {
    try {
      const response = await http.get('/admin/study-records', params);
      return response;
    } catch (error) {
      console.error('获取学习记录失败:', error);
      throw error;
    }
  }

  /**
   * 删除学习记录
   */
  static async deleteStudyRecord(recordId) {
    try {
      const response = await http.delete(`/admin/study-records/${recordId}`);
      return response;
    } catch (error) {
      console.error('删除学习记录失败:', error);
      throw error;
    }
  }

  /**
   * 获取系统统计信息
   */
  static async getSystemStats() {
    try {
      const response = await http.get('/admin/stats');
      return response;
    } catch (error) {
      console.error('获取系统统计失败:', error);
      throw error;
    }
  }

  /**
   * 获取操作日志
   */
  static async getOperationLogs(params = {}) {
    try {
      const response = await http.get('/admin/logs', params);
      return response;
    } catch (error) {
      console.error('获取操作日志失败:', error);
      throw error;
    }
  }

  /**
   * 导出用户数据
   */
  static async exportUsers(format = 'excel', filters = {}) {
    try {
      const response = await http.get('/admin/export/users', {
        format,
        ...filters
      });
      return response;
    } catch (error) {
      console.error('导出用户数据失败:', error);
      throw error;
    }
  }

  /**
   * 导出学习记录
   */
  static async exportStudyRecords(format = 'excel', filters = {}) {
    try {
      const response = await http.get('/admin/export/study-records', {
        format,
        ...filters
      });
      return response;
    } catch (error) {
      console.error('导出学习记录失败:', error);
      throw error;
    }
  }

  /**
   * 批量操作用户
   */
  static async batchOperateUsers(operation, userIds, params = {}) {
    try {
      const response = await http.post('/admin/users/batch', {
        operation,
        userIds,
        ...params
      });
      return response;
    } catch (error) {
      console.error('批量操作用户失败:', error);
      throw error;
    }
  }

  /**
   * 获取单位管理列表
   */
  static async getUnits(params = {}) {
    try {
      const response = await http.get('/admin/units', params);
      return response;
    } catch (error) {
      console.error('获取单位列表失败:', error);
      throw error;
    }
  }

  /**
   * 创建单位
   */
  static async createUnit(unitData) {
    try {
      const response = await http.post('/admin/units', unitData);
      return response;
    } catch (error) {
      console.error('创建单位失败:', error);
      throw error;
    }
  }

  /**
   * 更新单位信息
   */
  static async updateUnit(unitId, unitData) {
    try {
      const response = await http.put(`/admin/units/${unitId}`, unitData);
      return response;
    } catch (error) {
      console.error('更新单位信息失败:', error);
      throw error;
    }
  }

  /**
   * 删除单位
   */
  static async deleteUnit(unitId) {
    try {
      const response = await http.delete(`/admin/units/${unitId}`);
      return response;
    } catch (error) {
      console.error('删除单位失败:', error);
      throw error;
    }
  }
}

module.exports = AdminService;

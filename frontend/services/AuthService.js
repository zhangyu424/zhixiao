const http = require('../utils/api/http');

/**
 * 认证相关API服务
 * 对应后端 auth.js 路由
 */
class AuthService {
  /**
   * 微信登录
   */
  static async wxLogin(code) {
    try {
      const response = await http.post('/auth/wxlogin', { code });
      return response;
    } catch (error) {
      console.error('微信登录失败:', error);
      throw error;
    }
  }

  /**
   * 测试登录 (仅开发环境)
   */
  static async testLogin() {
    try {
      const response = await http.post('/auth/test-login', {});
      return response;
    } catch (error) {
      console.error('测试登录失败:', error);
      throw error;
    }
  }

  /**
   * 账号绑定
   */
  static async bindAccount(bindData) {
    try {
      const response = await http.post('/auth/bind', bindData);
      return response;
    } catch (error) {
      console.error('账号绑定失败:', error);
      throw error;
    }
  }

  /**
   * 获取绑定状态
   */
  static async getBindStatus() {
    try {
      const response = await http.get('/auth/bind-status');
      return response;
    } catch (error) {
      console.error('获取绑定状态失败:', error);
      throw error;
    }
  }

  /**
   * 解绑账号
   */
  static async unbindAccount() {
    try {
      const response = await http.post('/auth/unbind');
      return response;
    } catch (error) {
      console.error('解绑账号失败:', error);
      throw error;
    }
  }

  /**
   * 刷新Token
   */
  static async refreshToken() {
    try {
      const response = await http.post('/auth/refresh');
      return response;
    } catch (error) {
      console.error('刷新Token失败:', error);
      throw error;
    }
  }

  /**
   * 退出登录
   */
  static async logout() {
    try {
      const response = await http.post('/auth/logout');
      return response;
    } catch (error) {
      console.error('退出登录失败:', error);
      throw error;
    }
  }

  /**
   * 验证Token有效性
   */
  static async validateToken() {
    try {
      const response = await http.get('/auth/validate');
      return response;
    } catch (error) {
      console.error('验证Token失败:', error);
      throw error;
    }
  }

  /**
   * 获取用户权限
   */
  static async getUserPermissions() {
    try {
      const response = await http.get('/auth/permissions');
      return response;
    } catch (error) {
      console.error('获取用户权限失败:', error);
      throw error;
    }
  }

  /**
   * 验证微信授权
   */
  static async verifyWechatAuth(encryptedData, iv, signature) {
    try {
      const response = await http.post('/auth/verify-wechat', {
        encryptedData,
        iv,
        signature
      });
      return response;
    } catch (error) {
      console.error('验证微信授权失败:', error);
      throw error;
    }
  }
}

module.exports = AuthService;

// API服务封装 - 对应后端所有接口
// 使用方法: import { AuthService, StudyService } from './utils/api-services.js'

import request from './request.js'

/**
 * 认证服务 /api/auth
 */
export const AuthService = {
  /**
   * 微信登录
   * @param {string} code 微信登录code
   */
  wxLogin(code) {
    return request.post('/auth/wxlogin', { code }, { skipAuth: true })
  },

  /**
   * 绑定账号
   * @param {Object} data 绑定信息
   */
  bindAccount(data) {
    return request.post('/auth/bind', data)
  },

  /**
   * 刷新Token
   */
  refreshToken() {
    return request.post('/auth/refresh')
  },

  /**
   * 退出登录
   */
  logout() {
    return request.post('/auth/logout')
  }
}

/**
 * 学习记录服务 /api/study
 */
export const StudyService = {
  /**
   * 提交学习时间
   * @param {Object} data 学习记录数据
   */
  submit(data) {
    return request.post('/study/submit', data)
  },

  /**
   * 获取学习历史
   * @param {Object} params 查询参数
   */
  getHistory(params = {}) {
    return request.get('/study/history', params)
  },

  /**
   * 获取月度日历数据
   * @param {string} month 月份 YYYY-MM
   */
  getCalendar(month) {
    return request.get('/study/calendar', { month })
  },

  /**
   * 获取学习统计
   * @param {Object} params 查询参数
   */
  getStats(params = {}) {
    return request.get('/study/stats', params)
  },

  /**
   * 获取排名信息
   * @param {Object} params 查询参数
   */
  getRanking(params = {}) {
    return request.get('/study/ranking', params)
  },

  /**
   * 获取学习热力图数据
   * @param {number} year 年份
   */
  getHeatmap(year = new Date().getFullYear()) {
    return request.get('/study/heatmap', { year })
  },

  /**
   * 获取今日学习数据
   */
  getTodayData() {
    return request.get('/study/today')
  },

  /**
   * 获取本周学习数据
   */
  getWeekData() {
    return request.get('/study/week')
  },

  /**
   * 获取月度数据
   * @param {string} month 月份
   */
  getMonthData(month) {
    return request.get('/study/month', { month })
  },

  /**
   * 删除学习记录
   * @param {number} id 记录ID
   */
  deleteRecord(id) {
    return request.delete(`/study/${id}`)
  },

  /**
   * 获取团队统计
   * @param {Object} params 查询参数
   */
  getTeamStats(params = {}) {
    return request.get('/study/team-stats', params)
  },

  /**
   * 批量导入
   * @param {Array} records 记录数组
   */
  batchImport(records) {
    return request.post('/study/batch-import', { records })
  }
}

/**
 * 用户服务 /api/users
 */
export const UserService = {
  /**
   * 获取个人信息
   */
  getProfile() {
    return request.get('/users/profile')
  },

  /**
   * 更新个人信息
   * @param {Object} data 用户信息
   */
  updateProfile(data) {
    return request.put('/users/profile', data)
  },

  /**
   * 获取用户角色
   */
  getRoles() {
    return request.get('/users/roles')
  },

  /**
   * 获取用户学习统计
   */
  getStudyStats() {
    return request.get('/users/study-stats')
  },

  /**
   * 获取通知设置
   */
  getNotificationSettings() {
    return request.get('/users/notification-settings')
  },

  /**
   * 更新通知设置
   * @param {Object} settings 通知设置
   */
  updateNotificationSettings(settings) {
    return request.put('/users/notification-settings', settings)
  },

  /**
   * 修改密码
   * @param {Object} data 密码信息
   */
  changePassword(data) {
    return request.post('/users/change-password', data)
  }
}

/**
 * 通知服务 /api/notifications
 */
export const NotificationService = {
  /**
   * 获取通知列表
   * @param {Object} params 查询参数
   */
  getList(params = {}) {
    return request.get('/notifications', params)
  },

  /**
   * 获取未读通知数量
   */
  getUnreadCount() {
    return request.get('/notifications/unread-count')
  },

  /**
   * 标记通知为已读
   * @param {number} id 通知ID
   */
  markAsRead(id) {
    return request.put(`/notifications/${id}/read`)
  }
}

/**
 * 考试服务 /api/exam
 */
export const ExamService = {
  /**
   * 获取最新考试信息
   */
  getLatest() {
    return request.get('/exam/latest')
  }
}

/**
 * 分析服务 /api/analysis
 */
export const AnalysisService = {
  /**
   * 获取最近分析数据
   */
  getRecent() {
    return request.get('/analysis/recent')
  }
}

/**
 * 文档服务 /api/docs
 */
export const DocumentService = {
  /**
   * 获取文档列表
   */
  getList() {
    return request.get('/docs/list')
  },

  /**
   * 获取文档内容
   * @param {string} docId 文档ID
   */
  getDocument(docId) {
    return request.get(`/docs/${docId}`)
  },

  /**
   * 搜索文档
   * @param {Object} params 搜索参数
   */
  search(params) {
    return request.get('/docs/search', params)
  },

  /**
   * 提交反馈
   * @param {Object} feedback 反馈信息
   */
  submitFeedback(feedback) {
    return request.post('/docs/feedback', feedback)
  }
}

/**
 * 管理员服务 /api/admin
 */
export const AdminService = {
  /**
   * 获取用户列表
   * @param {Object} params 查询参数
   */
  getUsers(params = {}) {
    return request.get('/admin/users', params)
  },

  /**
   * 创建用户
   * @param {Object} userData 用户数据
   */
  createUser(userData) {
    return request.post('/admin/users', userData)
  },

  /**
   * 更新用户
   * @param {number} id 用户ID
   * @param {Object} userData 用户数据
   */
  updateUser(id, userData) {
    return request.put(`/admin/users/${id}`, userData)
  },

  /**
   * 删除用户
   * @param {number} id 用户ID
   */
  deleteUser(id) {
    return request.delete(`/admin/users/${id}`)
  },

  /**
   * 获取系统统计
   */
  getStatistics() {
    return request.get('/admin/statistics')
  },

  /**
   * 获取系统日志
   * @param {Object} params 查询参数
   */
  getLogs(params = {}) {
    return request.get('/admin/logs', params)
  },

  /**
   * 创建公告
   * @param {Object} announcement 公告数据
   */
  createAnnouncement(announcement) {
    return request.post('/admin/announcements', announcement)
  },

  /**
   * 获取系统设置
   */
  getSettings() {
    return request.get('/admin/settings')
  },

  /**
   * 更新系统设置
   * @param {Object} settings 设置数据
   */
  updateSettings(settings) {
    return request.put('/admin/settings', settings)
  }
}

/**
 * 通用的API调用方法
 * 可以直接调用任何API端点
 */
export const ApiService = {
  /**
   * 直接调用API
   * @param {string} method HTTP方法
   * @param {string} url URL路径
   * @param {Object} data 请求数据
   * @param {Object} options 额外选项
   */
  call(method, url, data, options = {}) {
    return request[method.toLowerCase()](url, data, options)
  },

  /**
   * 获取API健康状态
   */
  getHealth() {
    // 注意：health端点不在/api路径下
    return request.get('/../health', {}, { skipAuth: true })
  },

  /**
   * 获取API版本信息
   */
  getVersion() {
    return request.get('/version', {}, { skipAuth: true })
  }
}

// 导出所有服务
export default {
  AuthService,
  StudyService,
  UserService,
  NotificationService,
  ExamService,
  AnalysisService,
  DocumentService,
  AdminService,
  ApiService
}

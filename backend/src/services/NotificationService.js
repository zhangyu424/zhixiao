const { query } = require('../config/database');

class NotificationService {
  /**
   * 获取通知列表
   * @param {Object} params - 查询参数
   * @returns {Promise<Object>} 通知列表和分页信息
   */
  static async getNotifications(params) {
    const { 
      page = 1, 
      limit = 20, 
      type, 
      status,
      user_id 
    } = params;
    
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const offset = (pageNum - 1) * limitNum;
    
    let conditions = [];
    let values = [];
    
    if (type) {
      conditions.push('type = ?');
      values.push(type);
    }
    
    if (status) {
      conditions.push('status = ?');
      values.push(status);
    }
    
    if (user_id) {
      conditions.push('(target_user_id = ? OR target_user_id IS NULL)');
      values.push(user_id);
    }
    
    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';
    
    // 获取总数
    const countSql = `SELECT COUNT(*) as total FROM notifications ${whereClause}`;
    const totalResult = await query(countSql, values);
    const total = totalResult[0].total;
    
    // 获取通知列表
    const notificationsSql = `
      SELECT * FROM notifications 
      ${whereClause}
      ORDER BY created_at DESC
      LIMIT ? OFFSET ?
    `;
    
    const notifications = await query(notificationsSql, [...values, limitNum, offset]);
    
    return {
      notifications,
      pagination: {
        total,
        page: pageNum,
        limit: limitNum,
        totalPages: Math.ceil(total / limitNum)
      }
    };
  }

  /**
   * 创建通知
   * @param {Object} notificationData - 通知数据
   * @returns {Promise<Object>} 创建结果
   */
  static async createNotification(notificationData) {
    const { 
      title, 
      content, 
      type = 'info', 
      target_user_id, 
      sender_id,
      priority = 'normal',
      expires_at 
    } = notificationData;
    
    const sql = `
      INSERT INTO notifications (
        title, content, type, target_user_id, sender_id, 
        priority, expires_at, status, created_at
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, 'active', NOW())
    `;
    
    const result = await query(sql, [
      title, content, type, target_user_id, sender_id, 
      priority, expires_at
    ]);
    
    return { notification_id: result.insertId, ...notificationData };
  }

  /**
   * 标记通知为已读
   * @param {number} notificationId - 通知ID
   * @param {number} userId - 用户ID
   * @returns {Promise<boolean>} 操作结果
   */
  static async markAsRead(notificationId, userId) {
    // 检查通知是否属于该用户
    const notification = await this.getNotificationById(notificationId);
    if (!notification) {
      throw new Error('通知不存在');
    }
    
    if (notification.target_user_id && notification.target_user_id !== userId) {
      throw new Error('无权限操作此通知');
    }
    
    const sql = 'UPDATE notifications SET read_at = NOW() WHERE notification_id = ?';
    await query(sql, [notificationId]);
    return true;
  }

  /**
   * 删除通知
   * @param {number} notificationId - 通知ID
   * @returns {Promise<boolean>} 删除结果
   */
  static async deleteNotification(notificationId) {
    const sql = 'UPDATE notifications SET status = "deleted", updated_at = NOW() WHERE notification_id = ?';
    await query(sql, [notificationId]);
    return true;
  }

  /**
   * 根据ID获取通知
   * @param {number} notificationId - 通知ID
   * @returns {Promise<Object>} 通知信息
   */
  static async getNotificationById(notificationId) {
    const sql = 'SELECT * FROM notifications WHERE notification_id = ?';
    const notifications = await query(sql, [notificationId]);
    return notifications[0] || null;
  }

  /**
   * 获取用户未读通知数量
   * @param {number} userId - 用户ID
   * @returns {Promise<number>} 未读通知数量
   */
  static async getUnreadCount(userId) {
    const sql = `
      SELECT COUNT(*) as count 
      FROM notifications 
      WHERE (target_user_id = ? OR target_user_id IS NULL) 
        AND read_at IS NULL 
        AND status = 'active'
        AND (expires_at IS NULL OR expires_at > NOW())
    `;
    
    const result = await query(sql, [userId]);
    return result[0].count;
  }

  /**
   * 批量标记通知为已读
   * @param {Array} notificationIds - 通知ID列表
   * @param {number} userId - 用户ID
   * @returns {Promise<Object>} 操作结果
   */
  static async batchMarkAsRead(notificationIds, userId) {
    if (!Array.isArray(notificationIds) || notificationIds.length === 0) {
      throw new Error('通知ID列表不能为空');
    }
    
    const placeholders = notificationIds.map(() => '?').join(',');
    const sql = `
      UPDATE notifications 
      SET read_at = NOW() 
      WHERE notification_id IN (${placeholders}) 
        AND (target_user_id = ? OR target_user_id IS NULL)
    `;
    
    const result = await query(sql, [...notificationIds, userId]);
    return { affected: result.affectedRows };
  }

  /**
   * 发送系统广播通知
   * @param {Object} notificationData - 通知数据
   * @returns {Promise<Object>} 发送结果
   */
  static async broadcast(notificationData) {
    const { title, content, type = 'system', sender_id, priority = 'normal' } = notificationData;
    
    const sql = `
      INSERT INTO notifications (
        title, content, type, target_user_id, sender_id, 
        priority, status, created_at
      )
      VALUES (?, ?, ?, NULL, ?, ?, 'active', NOW())
    `;
    
    const result = await query(sql, [title, content, type, sender_id, priority]);
    return { notification_id: result.insertId, broadcast: true };
  }

  /**
   * 清理过期通知
   * @returns {Promise<Object>} 清理结果
   */
  static async cleanupExpired() {
    const sql = `
      UPDATE notifications 
      SET status = 'expired', updated_at = NOW() 
      WHERE expires_at < NOW() AND status = 'active'
    `;
    
    const result = await query(sql);
    return { cleaned: result.affectedRows };
  }
}

module.exports = NotificationService;

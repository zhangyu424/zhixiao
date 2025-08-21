const NotificationService = require('../services/NotificationService');
const { asyncHandler } = require('../middleware/errorHandler');

class NotificationController {
  // 获取通知列表
  static getNotifications = asyncHandler(async (req, res) => {
    const params = { ...req.query, user_id: req.user.user_id };
    const result = await NotificationService.getNotifications(params);
    res.json({
      success: true,
      data: result
    });
  });

  // 创建通知（管理员功能）
  static createNotification = asyncHandler(async (req, res) => {
    const notificationData = { ...req.body, sender_id: req.user.user_id };
    const result = await NotificationService.createNotification(notificationData);
    res.status(201).json({
      success: true,
      data: result,
      message: '通知创建成功'
    });
  });

  // 标记通知为已读
  static markAsRead = asyncHandler(async (req, res) => {
    const { id } = req.params;
    await NotificationService.markAsRead(id, req.user.user_id);
    res.json({
      success: true,
      message: '标记已读成功'
    });
  });

  // 批量标记为已读
  static batchMarkAsRead = asyncHandler(async (req, res) => {
    const { notificationIds } = req.body;
    const result = await NotificationService.batchMarkAsRead(notificationIds, req.user.user_id);
    res.json({
      success: true,
      data: result,
      message: '批量标记已读成功'
    });
  });

  // 删除通知
  static deleteNotification = asyncHandler(async (req, res) => {
    const { id } = req.params;
    await NotificationService.deleteNotification(id);
    res.json({
      success: true,
      message: '通知删除成功'
    });
  });

  // 获取未读通知数量
  static getUnreadCount = asyncHandler(async (req, res) => {
    const count = await NotificationService.getUnreadCount(req.user.user_id);
    res.json({
      success: true,
      data: { count }
    });
  });

  // 发送系统广播（管理员功能）
  static broadcast = asyncHandler(async (req, res) => {
    const notificationData = { ...req.body, sender_id: req.user.user_id };
    const result = await NotificationService.broadcast(notificationData);
    res.json({
      success: true,
      data: result,
      message: '系统广播发送成功'
    });
  });

  // 清理过期通知（管理员功能）
  static cleanupExpired = asyncHandler(async (req, res) => {
    const result = await NotificationService.cleanupExpired();
    res.json({
      success: true,
      data: result,
      message: '过期通知清理完成'
    });
  });

  // 获取通知详情
  static getNotificationById = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const notification = await NotificationService.getNotificationById(id);
    
    if (!notification) {
      return res.status(404).json({
        success: false,
        message: '通知不存在'
      });
    }
    
    res.json({
      success: true,
      data: notification
    });
  });
}

module.exports = NotificationController;

const express = require('express');
const { auth } = require('../middleware/auth');

const router = express.Router();

// P0紧急API - 获取通知列表
router.get('/', auth, async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    
    // 输入验证：确保分页参数安全
    const safePage = Math.max(parseInt(page) || 1, 1);
    const safeLimit = Math.min(Math.max(parseInt(limit) || 20, 1), 100);
    
    // 临时实现 - 返回空通知列表
    const safeResponse = {
      notifications: [],
      pagination: {
        page: safePage,
        limit: safeLimit,
        total: 0,
        totalPages: 0,
        hasMore: false
      }
    };
    
    res.json({
      success: true,
      data: safeResponse,
      message: '暂无通知'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: '获取通知失败，请稍后重试'
    });
  }
});

// 获取未读通知数量
router.get('/unread-count', auth, async (req, res) => {
  try {
    res.json({
      success: true,
      data: { count: 0 }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: '获取未读数量失败，请稍后重试'
    });
  }
});

// 标记通知为已读
router.put('/:id/read', auth, async (req, res) => {
  try {
    const { id } = req.params;
    const notificationId = parseInt(id);
    
    // 输入验证
    if (!notificationId || notificationId <= 0) {
      return res.status(400).json({
        success: false,
        message: '无效的通知ID'
      });
    }
    
    // 临时实现
    res.json({
      success: true,
      message: '标记已读成功'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: '标记已读失败，请稍后重试'
    });
  }
});

module.exports = router;

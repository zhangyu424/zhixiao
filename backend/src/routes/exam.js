const express = require('express');
const { auth } = require('../middleware/auth');

const router = express.Router();

// P0紧急API - 获取最新考试信息
router.get('/latest', auth, async (req, res) => {
  try {
    // 临时实现 - 返回安全的考试信息结构
    const safeResponse = {
      exam: null,
      upcomingExams: [],
      hasActiveExam: false
    };
    
    res.json({
      success: true,
      data: safeResponse,
      message: '暂无考试安排'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: '获取考试信息失败，请稍后重试'
    });
  }
});

// 获取考试列表
router.get('/list', auth, async (req, res) => {
  try {
    const { page = 1, limit = 20, status = 'all' } = req.query;
    
    // 输入验证：确保分页参数安全
    const safePage = Math.max(parseInt(page) || 1, 1);
    const safeLimit = Math.min(Math.max(parseInt(limit) || 20, 1), 100);
    
    // 状态验证
    const validStatuses = ['all', 'upcoming', 'ongoing', 'completed'];
    const safeStatus = validStatuses.includes(status) ? status : 'all';
    
    const safeResponse = {
      exams: [],
      pagination: {
        page: safePage,
        limit: safeLimit,
        total: 0,
        totalPages: 0,
        hasMore: false
      },
      filter: {
        status: safeStatus
      }
    };
    
    res.json({
      success: true,
      data: safeResponse,
      message: '暂无考试记录'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: '获取考试列表失败，请稍后重试'
    });
  }
});

// 获取考试详情
router.get('/:id', auth, async (req, res) => {
  try {
    const { id } = req.params;
    const examId = parseInt(id);
    
    // 输入验证
    if (!examId || examId <= 0) {
      return res.status(400).json({
        success: false,
        message: '无效的考试ID'
      });
    }
    
    // 临时实现
    res.json({
      success: true,
      data: null,
      message: '考试详情暂不可用'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: '获取考试详情失败，请稍后重试'
    });
  }
});

module.exports = router;

const express = require('express');
const router = express.Router();

// 导入路由模块
const authRoutes = require('./auth');
const studyRoutes = require('./study');
const notificationRoutes = require('./notifications');
const examRoutes = require('./exam');
const analysisRoutes = require('./analysis');
const userRoutes = require('./users');
const documentRoutes = require('./documents');
const adminRoutes = require('./admin');
// 注册路由
router.use('/auth', authRoutes);
router.use('/study', studyRoutes);
router.use('/notifications', notificationRoutes);
router.use('/exam', examRoutes);
router.use('/analysis', analysisRoutes);
router.use('/users', userRoutes);
router.use('/docs', documentRoutes);
router.use('/admin', adminRoutes);
// router.use('/files', fileRoutes);

// API根路径
router.get('/', (req, res) => {
  res.json({
    success: true,
    message: '学习质效分析API服务',
    version: '1.0.0',
    endpoints: {
      auth: '/api/auth',
      study: '/api/study',
      notifications: '/api/notifications',
      exam: '/api/exam',
      analysis: '/api/analysis',
      users: '/api/users',
      admin: '/api/admin',
      files: '/api/files'
    }
  });
});

module.exports = router;

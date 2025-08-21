const express = require('express');
const { auth } = require('../middleware/auth');
const UserController = require('../controllers/UserController');

const router = express.Router();

// 获取用户个人信息
router.get('/profile', auth, UserController.getProfile);

// 更新用户个人信息
router.put('/profile', auth, UserController.updateProfile);

// 修改密码
router.post('/change-password', auth, UserController.changePassword);

// 获取用户角色信息
router.get('/roles', auth, UserController.getRoles);

// 获取用户学习统计
router.get('/study-stats', auth, UserController.getStudyStats);

// 获取用户通知设置
router.get('/notification-settings', auth, UserController.getNotificationSettings);

// 更新用户通知设置
router.put('/notification-settings', auth, UserController.updateNotificationSettings);

module.exports = router;

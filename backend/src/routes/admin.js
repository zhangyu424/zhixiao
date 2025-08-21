const express = require('express');
const router = express.Router();
const AdminController = require('../controllers/AdminController');
const { requireAdmin, requireSuperAdmin } = require('../middleware/adminAuth');
const { body, query, param } = require('express-validator');
const { validateRequest } = require('../middleware/validation');

// 用户管理路由
router.get('/users', 
  requireAdmin,
  [
    query('page').optional().isInt({ min: 1 }).withMessage('页码必须是正整数'),
    query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('每页数量必须在1-100之间'),
    query('role').optional().isIn(['student', 'teacher', 'admin', 'super_admin']).withMessage('角色类型无效'),
    query('status').optional().isIn(['active', 'inactive', 'deleted']).withMessage('状态类型无效')
  ],
  validateRequest,
  AdminController.getUsers
);

router.post('/users',
  requireAdmin,
  [
    body('name').notEmpty().withMessage('姓名不能为空'),
    body('student_id').notEmpty().withMessage('学号不能为空'),
    body('email').isEmail().withMessage('邮箱格式无效'),
    body('password').isLength({ min: 6 }).withMessage('密码至少6位'),
    body('role').optional().isIn(['student', 'teacher', 'admin']).withMessage('角色类型无效'),
    body('unit_id').optional().isInt().withMessage('单位ID必须是整数'),
    body('status').optional().isIn(['active', 'inactive']).withMessage('状态类型无效')
  ],
  validateRequest,
  AdminController.createUser
);

router.put('/users/:id',
  requireAdmin,
  [
    param('id').isInt().withMessage('用户ID必须是整数'),
    body('name').optional().notEmpty().withMessage('姓名不能为空'),
    body('email').optional().isEmail().withMessage('邮箱格式无效'),
    body('role').optional().isIn(['student', 'teacher', 'admin']).withMessage('角色类型无效'),
    body('unit_id').optional().isInt().withMessage('单位ID必须是整数'),
    body('status').optional().isIn(['active', 'inactive']).withMessage('状态类型无效')
  ],
  validateRequest,
  AdminController.updateUser
);

router.delete('/users/:id',
  requireAdmin,
  [
    param('id').isInt().withMessage('用户ID必须是整数')
  ],
  validateRequest,
  AdminController.deleteUser
);

// 用户批量导入（仅admin）
router.post('/users/import',
  requireAdmin,
  [
    body('users').isArray().withMessage('用户数据必须是数组'),
    body('users.*.name').notEmpty().withMessage('姓名不能为空'),
    body('users.*.student_id').notEmpty().withMessage('学号不能为空'),
    body('users.*.role').optional().isIn(['student', 'leader', 'manager']).withMessage('角色类型无效'),
    body('users.*.unit_id').isInt().withMessage('单位ID必须是整数')
  ],
  validateRequest,
  AdminController.importUsers
);

// 重置用户密码
router.post('/users/:id/reset-password',
  requireAdmin,
  [
    param('id').isInt().withMessage('用户ID必须是整数')
  ],
  validateRequest,
  AdminController.resetUserPassword
);

// 系统统计
router.get('/statistics',
  requireAdmin,
  AdminController.getStatistics
);

// 系统日志
router.get('/logs',
  requireAdmin,
  [
    query('page').optional().isInt({ min: 1 }).withMessage('页码必须是正整数'),
    query('limit').optional().isInt({ min: 1, max: 200 }).withMessage('每页数量必须在1-200之间'),
    query('level').optional().isIn(['info', 'warning', 'error', 'debug']).withMessage('日志级别无效'),
    query('startDate').optional().isISO8601().withMessage('开始日期格式无效'),
    query('endDate').optional().isISO8601().withMessage('结束日期格式无效')
  ],
  validateRequest,
  AdminController.getLogs
);

// 公告管理
router.post('/announcements',
  requireAdmin,
  [
    body('title').notEmpty().withMessage('标题不能为空'),
    body('content').notEmpty().withMessage('内容不能为空'),
    body('priority').optional().isIn(['low', 'normal', 'high', 'urgent']).withMessage('优先级无效'),
    body('target_audience').optional().isIn(['all', 'students', 'teachers', 'admins']).withMessage('目标受众无效')
  ],
  validateRequest,
  AdminController.createAnnouncement
);

// 系统设置（仅超级管理员）
router.get('/settings',
  requireSuperAdmin,
  AdminController.getSettings
);

router.put('/settings',
  requireSuperAdmin,
  AdminController.updateSettings
);

// 数据备份（仅超级管理员）
router.post('/backup',
  requireSuperAdmin,
  [
    body('tables').optional().isArray().withMessage('表列表必须是数组')
  ],
  validateRequest,
  AdminController.createBackup
);

module.exports = router;

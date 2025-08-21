const AdminService = require('../services/AdminService');
const { asyncHandler } = require('../middleware/errorHandler');

class AdminController {
  // 获取用户列表
  static getUsers = asyncHandler(async (req, res) => {
    const { page = 1, limit = 10, role, status } = req.query;
    const result = await AdminService.getUsers({ page, limit, role, status });
    res.json({
      success: true,
      data: result
    });
  });

  // 获取单个用户信息
  static getUserById = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const user = await AdminService.getUserById(id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: '用户不存在'
      });
    }
    res.json({
      success: true,
      data: user
    });
  });

  // 创建用户
  static createUser = asyncHandler(async (req, res) => {
    const result = await AdminService.createUser(req.body);
    res.status(201).json({
      success: true,
      data: result,
      message: '用户创建成功'
    });
  });

  // 更新用户信息
  static updateUser = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const result = await AdminService.updateUser(id, req.body);
    res.json({
      success: true,
      data: result,
      message: '用户信息更新成功'
    });
  });

  // 删除用户
  static deleteUser = asyncHandler(async (req, res) => {
    const { id } = req.params;
    await AdminService.deleteUser(id);
    res.json({
      success: true,
      message: '用户删除成功'
    });
  });

  // 重置用户密码
  static resetUserPassword = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { newPassword } = req.body;
    await AdminService.resetUserPassword(id, newPassword);
    res.json({
      success: true,
      message: '密码重置成功'
    });
  });

  // 批量操作用户
  static batchOperateUsers = asyncHandler(async (req, res) => {
    const { operation, userIds } = req.body;
    const result = await AdminService.batchOperateUsers(operation, userIds);
    res.json({
      success: true,
      data: result,
      message: '批量操作成功'
    });
  });

  // 获取系统统计数据
  static getSystemStats = asyncHandler(async (req, res) => {
    const stats = await AdminService.getSystemStats();
    res.json({
      success: true,
      data: stats
    });
  });

  // 系统统计
  static getStatistics = asyncHandler(async (req, res) => {
    const stats = await AdminService.getStatistics();
    res.json({
      success: true,
      data: stats
    });
  });

  // 系统日志
  static getLogs = asyncHandler(async (req, res) => {
    const { page = 1, limit = 20, level, startDate, endDate } = req.query;
    const logs = await AdminService.getLogs({ page, limit, level, startDate, endDate });
    res.json({
      success: true,
      data: logs
    });
  });

  // 用户批量导入
  static importUsers = asyncHandler(async (req, res) => {
    const { users } = req.body;
    if (!Array.isArray(users) || users.length === 0) {
      return res.status(400).json({
        success: false,
        message: '用户数据不能为空'
      });
    }
    const result = await AdminService.importUsers(users);
    res.json({
      success: true,
      data: result,
      message: '用户批量导入成功'
    });
  });

  // 创建公告
  static createAnnouncement = asyncHandler(async (req, res) => {
    const { title, content, priority, target_audience } = req.body;
    const result = await AdminService.createAnnouncement({ title, content, priority, target_audience });
    res.status(201).json({
      success: true,
      data: result,
      message: '公告创建成功'
    });
  });

  // 获取系统设置
  static getSettings = asyncHandler(async (req, res) => {
    const settings = await AdminService.getSettings();
    res.json({
      success: true,
      data: settings
    });
  });

  // 更新系统设置
  static updateSettings = asyncHandler(async (req, res) => {
    const result = await AdminService.updateSettings(req.body);
    res.json({
      success: true,
      data: result,
      message: '系统设置更新成功'
    });
  });

  // 创建数据备份
  static createBackup = asyncHandler(async (req, res) => {
    const { tables } = req.body;
    const result = await AdminService.createBackup(tables);
    res.json({
      success: true,
      data: result,
      message: '数据备份成功'
    });
  });
}

module.exports = AdminController;

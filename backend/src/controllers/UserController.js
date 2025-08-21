const UserService = require('../services/UserService');
const { asyncHandler } = require('../middleware/errorHandler');

class UserController {
  // 获取用户个人信息
  static getProfile = asyncHandler(async (req, res) => {
    const profile = await UserService.getProfile(req.user.user_id);
    
    if (!profile) {
      return res.status(404).json({
        success: false,
        message: '用户不存在'
      });
    }
    
    res.json({
      success: true,
      data: profile
    });
  });

  // 更新用户个人信息
  static updateProfile = asyncHandler(async (req, res) => {
    const result = await UserService.updateProfile(req.user.user_id, req.body);
    res.json({
      success: true,
      data: result,
      message: '个人信息更新成功'
    });
  });

  // 修改密码
  static changePassword = asyncHandler(async (req, res) => {
    const { oldPassword, newPassword } = req.body;
    
    if (!oldPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message: '原密码和新密码不能为空'
      });
    }
    
    await UserService.changePassword(req.user.user_id, oldPassword, newPassword);
    res.json({
      success: true,
      message: '密码修改成功'
    });
  });

  // 绑定学习账号
  static bindAccount = asyncHandler(async (req, res) => {
    const { platform, accountId, credentials } = req.body;
    const result = await UserService.bindAccount(req.user.user_id, platform, accountId, credentials);
    res.json({
      success: true,
      data: result,
      message: '账号绑定成功'
    });
  });

  // 解绑学习账号
  static unbindAccount = asyncHandler(async (req, res) => {
    const { platform } = req.params;
    await UserService.unbindAccount(req.user.user_id, platform);
    res.json({
      success: true,
      message: '账号解绑成功'
    });
  });

  // 获取用户绑定的学习账号
  static getUserBindings = asyncHandler(async (req, res) => {
    const bindings = await UserService.getUserBindings(req.user.user_id);
    res.json({
      success: true,
      data: bindings
    });
  });

  // 获取用户学习统计
  static getUserStats = asyncHandler(async (req, res) => {
    const stats = await UserService.getUserStats(req.user.user_id);
    res.json({
      success: true,
      data: stats
    });
  });

  // 更新用户头像
  static updateAvatar = asyncHandler(async (req, res) => {
    const { avatarUrl } = req.body;
    
    if (!avatarUrl) {
      return res.status(400).json({
        success: false,
        message: '头像URL不能为空'
      });
    }
    
    const result = await UserService.updateAvatar(req.user.user_id, avatarUrl);
    res.json({
      success: true,
      data: result,
      message: '头像更新成功'
    });
  });

  // 获取用户角色信息
  static getRoles = asyncHandler(async (req, res) => {
    const roles = await UserService.getUserRoles(req.user.user_id);
    res.json({
      success: true,
      data: roles
    });
  });

  // 获取用户学习统计
  static getStudyStats = asyncHandler(async (req, res) => {
    const stats = await UserService.getStudyStats(req.user.user_id);
    res.json({
      success: true,
      data: stats
    });
  });

  // 获取用户通知设置
  static getNotificationSettings = asyncHandler(async (req, res) => {
    const settings = await UserService.getNotificationSettings(req.user.user_id);
    res.json({
      success: true,
      data: settings
    });
  });

  // 更新用户通知设置
  static updateNotificationSettings = asyncHandler(async (req, res) => {
    const result = await UserService.updateNotificationSettings(req.user.user_id, req.body);
    res.json({
      success: true,
      data: result,
      message: '通知设置更新成功'
    });
  });
}

module.exports = UserController;

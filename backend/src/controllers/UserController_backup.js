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
}

module.exports = UserController;
  // 获取用户个人信息
  static async getProfile(req, res) {
    try {
      const userId = req.user.id;
      
      const result = await UserService.getUserById(userId);
      
      if (!result.success) {
        return ResponseUtils.error(res, result.error, 404);
      }

      // 返回安全的用户信息（脱敏处理）
      const user = result.data;
      const safeProfile = {
        id: user.id,
        name: user.name,
        studentId: user.studentId,
        email: user.email ? user.email.replace(/(.{2}).*(@.*)/, '$1****$2') : '',
        phone: user.phone ? user.phone.replace(/(\d{3})\d{4}(\d{4})/, '$1****$2') : '',
        avatar: user.avatar || '',
        role: user.role || 'student',
        unitId: user.unitId,
        unitName: user.unitName || '',
        joinDate: user.createdAt,
        lastLoginAt: user.lastLoginAt || new Date(),
        profile: {
          realName: user.realName || '',
          department: user.department || '',
          position: user.position || '',
          workId: user.workId || ''
        },
        settings: user.settings || {
          dailyGoal: 3.0,
          weeklyGoal: 21.0,
          reminderEnabled: true,
          dataPrivacy: 'unit',
          theme: 'auto',
          language: 'zh-CN'
        },
        stats: user.stats || {
          totalStudyHours: 0,
          totalStudyDays: 0,
          currentStreak: 0,
          maxStreak: 0,
          avgDailyHours: 0,
          completionRate: 0
        }
      };
      
      return ResponseUtils.success(res, safeProfile, '获取用户信息成功');
    } catch (error) {
      console.error('获取用户信息失败:', error);
      res.status(500).json({
        success: false,
        message: '获取用户信息失败，请稍后重试'
      });
    }
  }

  // 更新用户个人信息
  static async updateProfile(req, res) {
    try {
      const userId = req.user.id;
      const { name, email, phone, avatar, profile, settings } = req.body;
      
      // 输入验证和清理
      const updateData = {};
      
      // 基本信息验证
      if (name && typeof name === 'string' && name.trim().length > 0) {
        updateData.name = name.trim().substring(0, 50); // 限制长度
      }
      
      if (email && typeof email === 'string') {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (emailRegex.test(email)) {
          updateData.email = email.toLowerCase().trim();
        }
      }
      
      if (phone && typeof phone === 'string') {
        const phoneRegex = /^1[3-9]\d{9}$/;
        const cleanPhone = phone.replace(/\D/g, '');
        if (phoneRegex.test(cleanPhone)) {
          updateData.phone = cleanPhone;
        }
      }
      
      if (avatar && typeof avatar === 'string') {
        // 简单的URL验证
        try {
          new URL(avatar);
          updateData.avatar = avatar.substring(0, 500);
        } catch (e) {
          // 无效URL，忽略
        }
      }

      // 扩展信息验证
      if (profile && typeof profile === 'object') {
        const safeProfile = {};
        
        if (profile.realName && typeof profile.realName === 'string') {
          safeProfile.realName = profile.realName.trim().substring(0, 50);
        }
        
        if (profile.department && typeof profile.department === 'string') {
          safeProfile.department = profile.department.trim().substring(0, 100);
        }
        
        if (profile.position && typeof profile.position === 'string') {
          safeProfile.position = profile.position.trim().substring(0, 100);
        }
        
        if (profile.workId && typeof profile.workId === 'string') {
          safeProfile.workId = profile.workId.trim().substring(0, 50);
        }
        
        if (Object.keys(safeProfile).length > 0) {
          updateData.profile = safeProfile;
        }
      }
      
      // 设置验证
      if (settings && typeof settings === 'object') {
        const safeSettings = {};
        
        if (typeof settings.dailyGoal === 'number' && settings.dailyGoal >= 0 && settings.dailyGoal <= 24) {
          safeSettings.dailyGoal = settings.dailyGoal;
        }
        
        if (typeof settings.weeklyGoal === 'number' && settings.weeklyGoal >= 0 && settings.weeklyGoal <= 168) {
          safeSettings.weeklyGoal = settings.weeklyGoal;
        }
        
        if (typeof settings.reminderEnabled === 'boolean') {
          safeSettings.reminderEnabled = settings.reminderEnabled;
        }
        
        if (['unit', 'public', 'private'].includes(settings.dataPrivacy)) {
          safeSettings.dataPrivacy = settings.dataPrivacy;
        }
        
        if (['light', 'dark', 'auto'].includes(settings.theme)) {
          safeSettings.theme = settings.theme;
        }
        
        if (['zh-CN', 'en-US'].includes(settings.language)) {
          safeSettings.language = settings.language;
        }
        
        if (Object.keys(safeSettings).length > 0) {
          updateData.settings = safeSettings;
        }
      }
      
      // TODO: 实际更新数据库
      // await User.update(updateData, { where: { id: userId } });
      
      // 临时实现 - 假设更新成功
      res.json({
        success: true,
        message: '用户信息更新成功',
        data: {
          updated: Object.keys(updateData),
          timestamp: new Date().toISOString()
        }
      });
    } catch (error) {
      console.error('更新用户信息失败:', error);
      res.status(500).json({
        success: false,
        message: '更新用户信息失败，请稍后重试'
      });
    }
  }

  // 修改密码
  static async changePassword(req, res) {
    try {
      const userId = req.user.id;
      const { currentPassword, newPassword, confirmPassword } = req.body;
      
      // 输入验证
      if (!currentPassword || !newPassword || !confirmPassword) {
        return res.status(400).json({
          success: false,
          message: '请提供完整的密码信息'
        });
      }
      
      if (newPassword !== confirmPassword) {
        return res.status(400).json({
          success: false,
          message: '新密码与确认密码不匹配'
        });
      }
      
      // 密码强度验证
      const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d@$!%*?&]{8,20}$/;
      if (!passwordRegex.test(newPassword)) {
        return res.status(400).json({
          success: false,
          message: '密码必须包含大小写字母和数字，长度8-20位'
        });
      }
      
      // TODO: 验证当前密码和更新新密码
      // const user = await User.findByPk(userId);
      // if (!user || !bcrypt.compareSync(currentPassword, user.password)) {
      //   return res.status(400).json({
      //     success: false,
      //     message: '当前密码错误'
      //   });
      // }
      // 
      // const hashedPassword = bcrypt.hashSync(newPassword, 10);
      // await user.update({ password: hashedPassword });
      
      // 临时实现 - 假设密码修改成功
      res.json({
        success: true,
        message: '密码修改成功，请重新登录'
      });
    } catch (error) {
      console.error('密码修改失败:', error);
      res.status(500).json({
        success: false,
        message: '密码修改失败，请稍后重试'
      });
    }
  }

  // 获取用户角色信息
  static async getRoles(req, res) {
    try {
      const userId = req.user.id;
      const userRole = req.user.role || 'student';
      
      // 基础角色信息
      const safeRoles = {
        current: userRole,
        available: ['student'],
        permissions: [
          'study.submit',
          'study.view',
          'profile.edit',
          'profile.view'
        ],
        restrictions: {
          maxDailyStudyTime: 12,
          canViewTeamData: false,
          canExportData: false,
          canManageUsers: false,
          canViewReports: false
        }
      };
      
      // 根据角色添加额外权限
      switch (userRole) {
        case 'instructor':
          safeRoles.available.push('instructor');
          safeRoles.permissions.push(
            'team.view',
            'team.stats',
            'student.view'
          );
          safeRoles.restrictions.canViewTeamData = true;
          break;
          
        case 'manager':
          safeRoles.available.push('instructor', 'manager');
          safeRoles.permissions.push(
            'team.view',
            'team.stats',
            'student.view',
            'report.view',
            'data.export'
          );
          safeRoles.restrictions.canViewTeamData = true;
          safeRoles.restrictions.canExportData = true;
          safeRoles.restrictions.canViewReports = true;
          break;
          
        case 'admin':
          safeRoles.available.push('instructor', 'manager', 'admin');
          safeRoles.permissions.push(
            'team.view',
            'team.stats',
            'student.view',
            'report.view',
            'data.export',
            'user.manage',
            'system.admin'
          );
          safeRoles.restrictions.canViewTeamData = true;
          safeRoles.restrictions.canExportData = true;
          safeRoles.restrictions.canViewReports = true;
          safeRoles.restrictions.canManageUsers = true;
          break;
      }
      
      res.json({
        success: true,
        data: safeRoles
      });
    } catch (error) {
      console.error('获取角色信息失败:', error);
      res.status(500).json({
        success: false,
        message: '获取角色信息失败，请稍后重试'
      });
    }
  }

  // 获取用户学习统计
  static async getStudyStats(req, res) {
    try {
      const userId = req.user.id;
      const { period = 'all' } = req.query;
      
      // 输入验证
      const validPeriods = ['all', 'today', 'week', 'month', 'year'];
      if (!validPeriods.includes(period)) {
        return res.status(400).json({
          success: false,
          message: '无效的统计周期'
        });
      }
      
      // TODO: 从数据库获取实际统计数据
      const safeStats = {
        period: period,
        userId: parseInt(userId) || 0,
        summary: {
          totalHours: 0,
          totalDays: 0,
          avgDailyHours: 0,
          completionRate: 0,
          currentStreak: 0,
          maxStreak: 0
        },
        breakdown: {
          bySubject: [],
          byWeek: [],
          byHour: []
        },
        achievements: {
          badges: [],
          milestones: [],
          rankings: {
            unit: 0,
            overall: 0
          }
        }
      };
      
      res.json({
        success: true,
        data: safeStats
      });
    } catch (error) {
      console.error('获取学习统计失败:', error);
      res.status(500).json({
        success: false,
        message: '获取学习统计失败，请稍后重试'
      });
    }
  }

  // 获取用户通知设置
  static async getNotificationSettings(req, res) {
    try {
      const userId = req.user.id;
      
      // TODO: 从数据库获取用户通知设置
      const safeSettings = {
        userId: parseInt(userId) || 0,
        email: {
          enabled: true,
          dailyReport: true,
          weeklyReport: true,
          studyReminder: true,
          achievementNotice: true
        },
        push: {
          enabled: true,
          studyReminder: true,
          breakReminder: true,
          achievementNotice: true,
          teamUpdate: false
        },
        schedule: {
          reminderTimes: ['09:00', '14:00', '19:00'],
          quietHours: {
            enabled: true,
            start: '22:00',
            end: '08:00'
          },
          weekends: {
            enabled: false
          }
        }
      };
      
      res.json({
        success: true,
        data: safeSettings
      });
    } catch (error) {
      console.error('获取通知设置失败:', error);
      res.status(500).json({
        success: false,
        message: '获取通知设置失败，请稍后重试'
      });
    }
  }

  // 更新用户通知设置
  static async updateNotificationSettings(req, res) {
    try {
      const userId = req.user.id;
      const { email, push, schedule } = req.body;
      
      const updateData = {};
      
      // 验证email设置
      if (email && typeof email === 'object') {
        const safeEmail = {};
        ['enabled', 'dailyReport', 'weeklyReport', 'studyReminder', 'achievementNotice'].forEach(key => {
          if (typeof email[key] === 'boolean') {
            safeEmail[key] = email[key];
          }
        });
        if (Object.keys(safeEmail).length > 0) {
          updateData.email = safeEmail;
        }
      }
      
      // 验证push设置
      if (push && typeof push === 'object') {
        const safePush = {};
        ['enabled', 'studyReminder', 'breakReminder', 'achievementNotice', 'teamUpdate'].forEach(key => {
          if (typeof push[key] === 'boolean') {
            safePush[key] = push[key];
          }
        });
        if (Object.keys(safePush).length > 0) {
          updateData.push = safePush;
        }
      }
      
      // 验证schedule设置
      if (schedule && typeof schedule === 'object') {
        const safeSchedule = {};
        
        if (Array.isArray(schedule.reminderTimes)) {
          const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;
          const validTimes = schedule.reminderTimes.filter(time => 
            typeof time === 'string' && timeRegex.test(time)
          ).slice(0, 10); // 最多10个提醒时间
          if (validTimes.length > 0) {
            safeSchedule.reminderTimes = validTimes;
          }
        }
        
        if (schedule.quietHours && typeof schedule.quietHours === 'object') {
          const quietHours = {};
          if (typeof schedule.quietHours.enabled === 'boolean') {
            quietHours.enabled = schedule.quietHours.enabled;
          }
          const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;
          if (typeof schedule.quietHours.start === 'string' && timeRegex.test(schedule.quietHours.start)) {
            quietHours.start = schedule.quietHours.start;
          }
          if (typeof schedule.quietHours.end === 'string' && timeRegex.test(schedule.quietHours.end)) {
            quietHours.end = schedule.quietHours.end;
          }
          if (Object.keys(quietHours).length > 0) {
            safeSchedule.quietHours = quietHours;
          }
        }
        
        if (schedule.weekends && typeof schedule.weekends === 'object') {
          if (typeof schedule.weekends.enabled === 'boolean') {
            safeSchedule.weekends = { enabled: schedule.weekends.enabled };
          }
        }
        
        if (Object.keys(safeSchedule).length > 0) {
          updateData.schedule = safeSchedule;
        }
      }
      
      // TODO: 更新数据库中的通知设置
      
      res.json({
        success: true,
        message: '通知设置更新成功',
        data: {
          updated: Object.keys(updateData),
          timestamp: new Date().toISOString()
        }
      });
    } catch (error) {
      console.error('更新通知设置失败:', error);
      res.status(500).json({
        success: false,
        message: '更新通知设置失败，请稍后重试'
      });
    }
  }
}

module.exports = UserController;

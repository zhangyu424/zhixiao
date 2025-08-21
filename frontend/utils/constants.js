// utils/constants.js
// 微信小程序常量配置

// 订阅消息模板ID配置
export const SUBSCRIPTION_TEMPLATES = {
  // 每日学习提醒模板 - 需要在微信公众平台配置后替换
  DAILY_REMINDER:
    process.env.DAILY_REMINDER_TEMPLATE_ID || 'template_daily_reminder',

  // 考试成绩通知模板
  EXAM_RESULT: process.env.EXAM_RESULT_TEMPLATE_ID || 'template_exam_result',

  // 系统通知模板
  SYSTEM_NOTICE:
    process.env.SYSTEM_NOTICE_TEMPLATE_ID || 'template_system_notice'
};

// API接口路径常量
export const API_PATHS = {
  // 认证相关
  AUTH: {
    WX_LOGIN: '/auth/wxlogin',
    BIND: '/auth/bind',
    SWITCH_ROLE: '/auth/switch-role',
    LOGOUT: '/auth/logout'
  },

  // 学习数据相关
  STUDY: {
    TODAY: '/study/today',
    WEEK: '/study/week',
    HISTORY: '/study/history',
    DETAIL: '/study/detail',
    SUBMIT: '/study/submit',
    UPDATE: '/study/update',
    DELETE: '/study/delete'
  },

  // 分析相关
  ANALYSIS: {
    PERSONAL: '/analysis/personal',
    TEAM: '/analysis/team',
    GLOBAL: '/analysis/global',
    DATA: '/analysis/data',
    RECENT: '/analysis/recent',
    EXPORT: '/analysis/export'
  },

  // 考试相关
  EXAM: {
    LIST: '/exam/list',
    LATEST: '/exam/latest',
    DETAIL: '/exam/detail',
    SCORES: '/exam/scores'
  },

  // 管理相关
  MANAGEMENT: {
    IMPORT: '/management/import',
    EXPORT: '/management/export',
    USERS: '/management/users',
    SETTINGS: '/management/settings',
    ORGANIZATION: {
      TREE: '/management/organization/tree',
      ADD: '/management/organization/add',
      UPDATE: '/management/organization/update',
      DELETE: '/management/organization/delete'
    }
  },

  // 通知相关
  NOTIFICATIONS: '/notifications',

  // 组织架构相关
  ORGANIZATION: {
    UNITS: '/organization/units'
  }
};

// 文件上传配置
export const UPLOAD_CONFIG = {
  MAX_FILE_SIZE: 10 * 1024 * 1024, // 10MB
  ALLOWED_EXTENSIONS: ['xlsx', 'xls', 'csv'],
  TEMPLATES: {
    STUDENTS: '/templates/students_template.xlsx',
    SCORES: '/templates/scores_template.xlsx'
  }
};

// 角色权限配置
export const ROLE_PERMISSIONS = {
  student: ['study', 'analysis_personal'],
  instructor: ['study', 'analysis_personal', 'analysis_team', 'export_limited'],
  manager: ['study', 'analysis_all', 'import', 'export', 'user_manage'],
  admin: ['all']
};

// 数据验证规则
export const VALIDATION = {
  STUDY_TIME: {
    MIN: 0,
    MAX: 24
  },
  STUDENT_ID: {
    PATTERN: /^[A-Z0-9]{3,20}$/,
    MESSAGE: '学员编号格式不正确'
  },
  PASSWORD: {
    MIN_LENGTH: 6,
    MAX_LENGTH: 20
  }
};

// utils/permission.js
// 权限管理工具函数

import { ROLE_PERMISSIONS } from './constants.js';

/**
 * 检查用户是否有指定权限
 * @param {string} permission 权限名称
 * @param {string} userRole 用户角色
 * @returns {boolean}
 */
export function hasPermission(permission, userRole = null) {
  if (!userRole) {
    const userInfo = wx.getStorageSync('userInfo');
    if (!userInfo) return false;
    userRole = userInfo.role || userInfo.currentRole?.key;
  }

  if (!userRole) return false;

  const permissions = ROLE_PERMISSIONS[userRole];
  if (!permissions) return false;

  // 管理员拥有所有权限
  if (permissions.includes('all')) return true;

  return permissions.includes(permission);
}

/**
 * 检查页面访问权限
 * @param {string} pagePath 页面路径
 * @returns {boolean}
 */
export function checkPagePermission(pagePath) {
  const userInfo = wx.getStorageSync('userInfo');
  if (!userInfo) return false;

  const userRole = userInfo.role || userInfo.currentRole?.key;

  // 页面权限映射
  const pagePermissions = {
    '/pages/index/index': ['all'],
    '/pages/study-report/study-report': ['study'],
    '/pages/analysis/analysis': [
      'analysis_personal',
      'analysis_team',
      'analysis_all'
    ],
    '/pages/management/management': ['import', 'export', 'user_manage', 'all'],
    '/pages/profile/profile': ['all']
  };

  const requiredPermissions = pagePermissions[pagePath];
  if (!requiredPermissions) return true; // 未定义权限的页面默认允许访问

  // 检查是否有任一所需权限
  return requiredPermissions.some(permission =>
    hasPermission(permission, userRole)
  );
}

/**
 * 获取用户可用的管理功能标签
 * @param {string} userRole 用户角色
 * @returns {Array} 可用标签列表
 */
export function getAvailableManagementTabs(userRole) {
  const allTabs = [
    { key: 'import', title: '数据导入', permissions: ['import', 'all'] },
    { key: 'export', title: '数据导出', permissions: ['export', 'all'] },
    { key: 'organization', title: '组织管理', permissions: ['all'] },
    { key: 'users', title: '用户管理', permissions: ['user_manage', 'all'] },
    { key: 'settings', title: '系统设置', permissions: ['all'] }
  ];

  return allTabs.filter(tab =>
    tab.permissions.some(permission => hasPermission(permission, userRole))
  );
}

/**
 * 权限守卫 - 页面跳转前检查权限
 * @param {string} url 目标页面URL
 * @returns {boolean} 是否允许跳转
 */
export function navigationGuard(url) {
  const pagePath = url.split('?')[0]; // 移除查询参数

  if (!checkPagePermission(pagePath)) {
    wx.showToast({
      title: '权限不足',
      icon: 'none'
    });
    return false;
  }

  return true;
}

/**
 * 角色权限说明
 * @param {string} role 角色
 * @returns {Object} 权限说明
 */
export function getRoleDescription(role) {
  const descriptions = {
    student: {
      name: '学员',
      permissions: ['学习时间填报', '个人分析报告查看', '个人设置管理']
    },
    instructor: {
      name: '层级长',
      permissions: [
        '学习时间填报',
        '个人分析报告查看',
        '团队分析报告查看',
        '有限数据导出功能'
      ]
    },
    manager: {
      name: '信息管理员',
      permissions: ['全部分析功能', '数据导入导出', '用户管理', '学习数据管理']
    },
    admin: {
      name: '超级管理员',
      permissions: ['所有功能权限', '系统设置', '组织架构管理', '用户权限管理']
    }
  };

  return (
    descriptions[role] || {
      name: '未知角色',
      permissions: []
    }
  );
}

/**
 * 检查数据操作权限
 * @param {string} operation 操作类型
 * @param {Object} targetData 目标数据
 * @param {Object} currentUser 当前用户
 * @returns {boolean}
 */
export function checkDataPermission(operation, targetData, currentUser) {
  if (!currentUser) {
    currentUser = wx.getStorageSync('userInfo');
  }

  if (!currentUser) return false;

  const userRole = currentUser.role || currentUser.currentRole?.key;

  // 管理员拥有所有数据权限
  if (hasPermission('all', userRole)) return true;

  switch (operation) {
    case 'edit_study_data':
      // 学员只能编辑自己的数据
      if (userRole === 'student') {
        return targetData.userId === currentUser.id;
      }
      // 层级长可以编辑所属团队的数据
      if (userRole === 'instructor') {
        return targetData.unitId === currentUser.unitId;
      }
      return hasPermission('user_manage', userRole);

    case 'delete_study_data':
      // 只有管理员可以删除数据
      return hasPermission('all', userRole);

    case 'export_data':
      // 检查导出权限
      return (
        hasPermission('export', userRole) || hasPermission('all', userRole)
      );

    case 'import_data':
      // 检查导入权限
      return (
        hasPermission('import', userRole) || hasPermission('all', userRole)
      );

    default:
      return false;
  }
}

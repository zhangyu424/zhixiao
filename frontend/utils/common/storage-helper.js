// utils/storage-helper.js
// 存储辅助工具

/**
 * 安全的存储保存函数
 * @param {string} key 存储键
 * @param {any} data 要存储的数据
 * @returns {boolean} 是否保存成功
 */
function setStorageSafely(key, data) {
  try {
    // 检查数据大小
    const dataStr = JSON.stringify(data);
    if (dataStr.length > 1024 * 1024) {
      // 1MB限制
      console.warn('数据过大:', dataStr.length, 'bytes');
      return false;
    }

    wx.setStorageSync(key, data);

    // 验证保存
    const saved = wx.getStorageSync(key);
    return JSON.stringify(saved) === dataStr;
  } catch (error) {
    console.error('存储失败:', error);
    return false;
  }
}

/**
 * 清理存储空间
 */
function clearStorage() {
  try {
    const storageInfo = wx.getStorageInfoSync();
    console.log('存储信息:', storageInfo);

    // 清理非必要数据
    const keepKeys = ['token', 'userInfo'];
    storageInfo.keys.forEach(key => {
      if (!keepKeys.includes(key)) {
        wx.removeStorageSync(key);
      }
    });

    return true;
  } catch (error) {
    console.error('清理存储失败:', error);
    return false;
  }
}

/**
 * 获取存储使用情况
 */
function getStorageUsage() {
  try {
    const info = wx.getStorageInfoSync();
    return {
      keys: info.keys,
      currentSize: info.currentSize,
      limitSize: info.limitSize,
      usage: info.currentSize / info.limitSize
    };
  } catch (error) {
    console.error('获取存储信息失败:', error);
    return null;
  }
}

/**
 * 清理用户数据，移除可能导致存储问题的字段
 */
function cleanUserData(userData) {
  if (!userData || typeof userData !== 'object') {
    return {
      name: '用户',
      role: 'student'
    };
  }

  return {
    id: userData.id || '',
    name: userData.name || '用户',
    studentId: userData.studentId || '',
    avatar: userData.avatar || '',
    roleName: userData.roleName || '',
    unitName: userData.unitName || '',
    role: userData.role || 'student',
    roles: Array.isArray(userData.roles) ? userData.roles.slice(0, 10) : [], // 限制角色数量
    currentRole: userData.currentRole || { key: 'student', name: '学员' },
    isFirstLogin: userData.isFirstLogin || false
  };
}

/**
 * 设置访问token
 */
function setToken(token) {
  try {
    wx.setStorageSync('access_token', token);
    return true;
  } catch (error) {
    console.error('保存token失败:', error);
    return false;
  }
}

/**
 * 获取访问token
 */
function getToken() {
  try {
    return wx.getStorageSync('access_token') || '';
  } catch (error) {
    console.error('获取token失败:', error);
    return '';
  }
}

/**
 * 设置刷新token
 */
function setRefreshToken(token) {
  try {
    wx.setStorageSync('refresh_token', token);
    return true;
  } catch (error) {
    console.error('保存refresh token失败:', error);
    return false;
  }
}

/**
 * 获取刷新token
 */
function getRefreshToken() {
  try {
    return wx.getStorageSync('refresh_token') || '';
  } catch (error) {
    console.error('获取refresh token失败:', error);
    return '';
  }
}

/**
 * 设置用户信息
 */
function setUserInfo(userInfo) {
  try {
    const cleanedUserInfo = cleanUserData(userInfo);
    return setStorageSafely('userInfo', cleanedUserInfo);
  } catch (error) {
    console.error('保存用户信息失败:', error);
    return false;
  }
}

/**
 * 获取用户信息
 */
function getUserInfo() {
  try {
    return wx.getStorageSync('userInfo') || null;
  } catch (error) {
    console.error('获取用户信息失败:', error);
    return null;
  }
}

/**
 * 清除所有登录相关数据
 */
function clearAuthData() {
  try {
    wx.removeStorageSync('access_token');
    wx.removeStorageSync('refresh_token');
    wx.removeStorageSync('userInfo');
    return true;
  } catch (error) {
    console.error('清除认证数据失败:', error);
    return false;
  }
}

module.exports = {
  setStorageSafely,
  clearStorage,
  getStorageUsage,
  cleanUserData,
  setToken,
  getToken,
  setRefreshToken,
  getRefreshToken,
  setUserInfo,
  getUserInfo,
  clearAuthData
};

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
    currentRole: userData.currentRole || { key: 'student', name: '学员' }
  };
}

module.exports = {
  setStorageSafely,
  clearStorage,
  getStorageUsage,
  cleanUserData
};

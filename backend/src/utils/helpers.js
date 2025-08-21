/**
 * 数据验证工具类
 */
class ValidationUtils {
  /**
   * 验证邮箱格式
   */
  static isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  /**
   * 验证手机号格式
   */
  static isValidPhone(phone) {
    const phoneRegex = /^1[3-9]\d{9}$/;
    return phoneRegex.test(phone);
  }

  /**
   * 验证身份证号格式
   */
  static isValidIdCard(idCard) {
    const idCardRegex = /(^\d{15}$)|(^\d{18}$)|(^\d{17}(\d|X|x)$)/;
    return idCardRegex.test(idCard);
  }

  /**
   * 验证学号格式
   */
  static isValidStudentId(studentId) {
    // 学号通常是数字和字母的组合，长度在3-20之间
    const studentIdRegex = /^[a-zA-Z0-9]{3,20}$/;
    return studentIdRegex.test(studentId);
  }

  /**
   * 验证密码强度
   */
  static isStrongPassword(password) {
    // 至少8位，包含大小写字母、数字和特殊字符
    const strongPasswordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    return strongPasswordRegex.test(password);
  }

  /**
   * 验证URL格式
   */
  static isValidUrl(url) {
    try {
      new URL(url);
      return true;
    } catch (error) {
      return false;
    }
  }

  /**
   * 验证JSON字符串
   */
  static isValidJson(jsonString) {
    try {
      JSON.parse(jsonString);
      return true;
    } catch (error) {
      return false;
    }
  }

  /**
   * 清理HTML标签
   */
  static sanitizeHtml(html) {
    if (!html) return '';
    return html.replace(/<[^>]*>/g, '');
  }

  /**
   * 验证日期格式
   */
  static isValidDate(dateString) {
    const date = new Date(dateString);
    return !isNaN(date.getTime());
  }

  /**
   * 验证时间范围
   */
  static isValidTimeRange(startTime, endTime) {
    const start = new Date(startTime);
    const end = new Date(endTime);
    return start < end;
  }

  /**
   * 验证文件类型
   */
  static isValidFileType(filename, allowedTypes) {
    if (!filename || !allowedTypes) return false;
    const ext = filename.toLowerCase().split('.').pop();
    return allowedTypes.includes(ext);
  }

  /**
   * 验证文件大小
   */
  static isValidFileSize(fileSize, maxSize) {
    return fileSize <= maxSize;
  }
}

/**
 * 字符串工具类
 */
class StringUtils {
  /**
   * 生成随机字符串
   */
  static generateRandomString(length = 8) {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < length; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  }

  /**
   * 驼峰转下划线
   */
  static camelToSnake(str) {
    return str.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`);
  }

  /**
   * 下划线转驼峰
   */
  static snakeToCamel(str) {
    return str.replace(/_([a-z])/g, (match, letter) => letter.toUpperCase());
  }

  /**
   * 首字母大写
   */
  static capitalize(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
  }

  /**
   * 截断字符串
   */
  static truncate(str, length = 100, suffix = '...') {
    if (str.length <= length) return str;
    return str.substring(0, length) + suffix;
  }

  /**
   * 生成UUID
   */
  static generateUUID() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
      const r = Math.random() * 16 | 0;
      const v = c === 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
  }
}

/**
 * 数组工具类
 */
class ArrayUtils {
  /**
   * 数组去重
   */
  static unique(arr) {
    return [...new Set(arr)];
  }

  /**
   * 数组分组
   */
  static groupBy(arr, key) {
    return arr.reduce((groups, item) => {
      const group = item[key];
      groups[group] = groups[group] || [];
      groups[group].push(item);
      return groups;
    }, {});
  }

  /**
   * 数组分页
   */
  static paginate(arr, page = 1, limit = 10) {
    const start = (page - 1) * limit;
    const end = start + limit;
    return {
      data: arr.slice(start, end),
      total: arr.length,
      page,
      limit,
      totalPages: Math.ceil(arr.length / limit)
    };
  }

  /**
   * 数组排序
   */
  static sortBy(arr, key, order = 'asc') {
    return arr.sort((a, b) => {
      const aVal = a[key];
      const bVal = b[key];
      if (order === 'asc') {
        return aVal > bVal ? 1 : -1;
      } else {
        return aVal < bVal ? 1 : -1;
      }
    });
  }
}

module.exports = {
  ValidationUtils,
  StringUtils,
  ArrayUtils
};

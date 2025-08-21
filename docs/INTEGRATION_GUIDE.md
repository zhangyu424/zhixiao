# 🔗 学习质效分析系统 - 完整集成指南

**项目名称**: 学习质效分析系统  
**版本**: v1.2.0  
**更新**: 2025-08-20  

## 📋 集成概述

本文档提供前后端集成的完整指南，包括：
- 🔧 前端配置和接口调用
- 🎯 后端验收标准和检查清单
- 🚀 部署配置和环境管理
- 🧪 测试验证和问题排查

## 🌐 服务器配置信息

### 基础配置
- **服务器IP**: `140.143.143.195`
- **API基础地址**: `http://140.143.143.195/api`
- **健康检查**: `http://140.143.143.195/health`
- **协议**: HTTP (开发阶段)

### 微信小程序配置
- **AppID**: `wx13e6fdf682f6d772`
- **AppSecret**: `2d3f498a4b65a8237579fe8f1811ce83` (后端使用)

## 🔧 前端集成配置

### 1. 小程序全局配置 (app.js)
```javascript
App({
  globalData: {
    // API基础地址
    baseUrl: 'http://140.143.143.195/api',
    
    // 用户信息
    userInfo: null,
    token: '',
    
    // 系统配置
    appName: '学习质效分析系统',
    version: '1.2.0'
  },

  onLaunch() {
    console.log('小程序启动');
    this.checkLoginStatus();
  },

  // 检查登录状态
  checkLoginStatus() {
    const token = wx.getStorageSync('token');
    const userInfo = wx.getStorageSync('userInfo');
    
    if (token && userInfo) {
      this.globalData.token = token;
      this.globalData.userInfo = userInfo;
      
      // 验证token有效性
      this.validateToken();
    }
  },

  // 统一网络请求
  request(options) {
    const {url, method = 'GET', data = {}, needAuth = true} = options;
    
    return new Promise((resolve, reject) => {
      const header = {
        'Content-Type': 'application/json'
      };
      
      if (needAuth && this.globalData.token) {
        header.Authorization = `Bearer ${this.globalData.token}`;
      }
      
      wx.request({
        url: `${this.globalData.baseUrl}${url}`,
        method,
        data,
        header,
        success: (res) => {
          if (res.statusCode === 200) {
            if (res.data.success) {
              resolve(res.data);
            } else {
              this.handleAPIError(res.data);
              reject(res.data);
            }
          } else {
            this.handleHTTPError(res);
            reject(res);
          }
        },
        fail: reject
      });
    });
  },

  // API错误处理
  handleAPIError(data) {
    if (data.code === 401) {
      // Token失效，清除本地数据并跳转登录
      this.clearUserData();
      wx.reLaunch({url: '/pages/unified-login/unified-login'});
    } else {
      wx.showToast({
        title: data.message || '请求失败',
        icon: 'none'
      });
    }
  }
});
```

### 2. API接口封装 (api/index.js)
```javascript
const app = getApp();

class API {
  // 认证相关
  wechatLogin(code) {
    return app.request({
      url: '/auth/wxlogin',
      method: 'POST',
      data: {code},
      needAuth: false
    });
  }

  bindAccount(openid, studentId, password) {
    return app.request({
      url: '/auth/bind-student',
      method: 'POST',
      data: {openid, studentId, password},
      needAuth: false
    });
  }

  validateToken() {
    return app.request({
      url: '/auth/validate-token',
      method: 'GET'
    });
  }

  // 用户管理
  getUserProfile() {
    return app.request({
      url: '/user/profile',
      method: 'GET'
    });
  }

  verifyStudentId(studentId) {
    return app.request({
      url: '/user/verify-student-id',
      method: 'GET',
      data: {studentId},
      needAuth: false
    });
  }

  // 学习记录
  submitStudyTime(studyMinutes, date, remark) {
    return app.request({
      url: '/study/submit',
      method: 'POST',
      data: {studyMinutes, date, remark}
    });
  }

  getStudyHistory(page = 1, limit = 20, startDate, endDate) {
    return app.request({
      url: '/study/history',
      method: 'GET',
      data: {page, limit, startDate, endDate}
    });
  }

  // 数据分析
  getPersonalAnalysis(period = 'month') {
    return app.request({
      url: '/analytics/personal',
      method: 'GET',
      data: {period}
    });
  }

  getTeamAnalysis(period = 'month') {
    return app.request({
      url: '/analytics/team',
      method: 'GET',
      data: {period}
    });
  }

  // 通知消息
  getNotifications(page = 1, limit = 10) {
    return app.request({
      url: '/notifications/list',
      method: 'GET',
      data: {page, limit}
    });
  }

  markNotificationRead(notificationId) {
    return app.request({
      url: '/notifications/mark-read',
      method: 'POST',
      data: {notificationId}
    });
  }
}

module.exports = new API();
```

### 3. 页面使用示例

#### 登录页面 (pages/unified-login/unified-login.js)
```javascript
const api = require('../../api/index');

Page({
  data: {
    loginType: 'wechat', // wechat, account, phone
    studentId: '',
    password: ''
  },

  // 微信登录
  async wechatLogin() {
    try {
      const {code} = await wx.login();
      const result = await api.wechatLogin(code);
      
      if (result.data.needBind) {
        // 需要绑定账号
        this.setData({
          loginType: 'bind',
          openid: result.data.openid
        });
      } else {
        // 登录成功
        this.handleLoginSuccess(result.data);
      }
    } catch (error) {
      wx.showToast({title: '登录失败', icon: 'none'});
    }
  },

  // 账号绑定
  async bindAccount() {
    const {openid, studentId, password} = this.data;
    
    try {
      const result = await api.bindAccount(openid, studentId, password);
      this.handleLoginSuccess(result.data);
    } catch (error) {
      wx.showToast({title: '绑定失败', icon: 'none'});
    }
  },

  // 登录成功处理
  handleLoginSuccess(data) {
    const app = getApp();
    app.globalData.token = data.token;
    app.globalData.userInfo = data.userInfo;
    
    wx.setStorageSync('token', data.token);
    wx.setStorageSync('userInfo', data.userInfo);
    
    wx.reLaunch({url: '/pages/index/index'});
  }
});
```

## ✅ 后端验收标准

### 1. 核心API验收清单

#### 认证模块 (4个接口)
- [ ] `POST /auth/wxlogin` - 微信登录
- [ ] `POST /auth/bind-student` - 学号绑定
- [ ] `GET /auth/validate-token` - Token验证
- [ ] `POST /auth/refresh-token` - Token刷新

#### 用户管理 (2个接口)
- [ ] `GET /user/profile` - 获取用户信息
- [ ] `GET /user/verify-student-id` - 验证学号存在

#### 学习记录 (2个接口)
- [ ] `POST /study/submit` - 提交学习时间
- [ ] `GET /study/history` - 获取学习历史

#### 数据分析 (2个接口)
- [ ] `GET /analytics/personal` - 个人分析数据
- [ ] `GET /analytics/team` - 团队分析数据

#### 通知消息 (2个接口)
- [ ] `GET /notifications/list` - 获取通知列表
- [ ] `POST /notifications/mark-read` - 标记已读

#### 系统功能 (3个接口)
- [ ] `GET /system/status` - 系统状态检查
- [ ] `POST /system/api-sync` - API同步上报
- [ ] `GET /health` - 健康检查

### 2. 技术规范验收

#### 响应格式统一
```json
{
  "success": true,
  "code": 200,
  "message": "操作成功",
  "data": {},
  "timestamp": "2025-08-20T10:30:00.000Z"
}
```

#### 错误处理标准
```json
{
  "success": false,
  "code": 400,
  "message": "请求参数错误",
  "error": "详细错误信息",
  "timestamp": "2025-08-20T10:30:00.000Z"
}
```

#### 分页数据格式
```json
{
  "success": true,
  "data": {
    "list": [],
    "total": 100,
    "page": 1,
    "limit": 20,
    "hasMore": true
  }
}
```

### 3. 安全规范验收

#### JWT Token验证
- [ ] 支持Bearer Token认证
- [ ] Token有效期7天
- [ ] 支持Token刷新机制
- [ ] 无效Token返回401状态

#### 数据验证
- [ ] 所有输入参数验证
- [ ] SQL注入防护
- [ ] XSS攻击防护
- [ ] 请求频率限制

## 🧪 集成测试验证

### 1. 自动化测试工具

#### 使用unified-backend-test.js
```bash
# 完整API测试
node scripts/unified-backend-test.js

# 分类测试
node scripts/unified-backend-test.js --category auth
node scripts/unified-backend-test.js --category user
node scripts/unified-backend-test.js --category study
```

#### 使用小程序内置测试页面
- 访问：`pages/backend-test/backend-test`
- 功能：可视化API调试
- 特性：错误详情显示、历史记录

### 2. 手动验证流程

#### 认证流程验证
1. 微信登录 → 验证openid获取
2. 账号绑定 → 验证学号密码验证
3. Token使用 → 验证API调用授权
4. Token失效 → 验证自动跳转登录

#### 业务功能验证
1. 学习时间提交 → 验证数据保存
2. 历史记录查询 → 验证分页和过滤
3. 数据分析 → 验证统计计算
4. 通知消息 → 验证推送和标记

### 3. 性能验证标准

- API响应时间 < 500ms
- 并发用户 > 100
- 数据库连接池 > 20
- 内存使用 < 512MB

## 🚀 部署配置

### 1. 生产环境配置

#### 域名和HTTPS
- 配置正式域名（替换IP地址）
- 启用HTTPS证书
- 配置微信公众平台域名白名单

#### 小程序配置更新
```javascript
// 生产环境app.js配置
globalData: {
  baseUrl: 'https://api.yourdomain.com/api',
  // ...其他配置
}
```

### 2. 微信公众平台配置

#### 服务器域名配置
- request合法域名：`https://api.yourdomain.com`
- socket合法域名：`wss://api.yourdomain.com`
- uploadFile合法域名：`https://api.yourdomain.com`
- downloadFile合法域名：`https://api.yourdomain.com`

## 📞 支持和联系

### 技术支持
- **集成问题**: 查看工具输出和错误日志
- **API问题**: 参考API_REQUIREMENTS.md文档
- **部署问题**: 检查服务器配置和域名设置

### 验收完成标准
- [ ] 所有15个核心API接口正常工作
- [ ] 前端页面功能完整验证
- [ ] 性能测试达到预期指标
- [ ] 安全检查通过所有项目
- [ ] 生产环境配置完成

---

**文档版本**: 1.2.0  
**最后更新**: 2025-08-20  
**验收状态**: 等待后端实现

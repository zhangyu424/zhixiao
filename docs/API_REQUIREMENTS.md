# 学习质效分析微信小程序 - 后端API需求文档

## 📋 文档信息
- **项目名称**: 学习质效分析微信小程序后端API
- **文档版本**: 2.0.0
- **创建日期**: 2025年8月20日
- **最后更新**: 2025年8月20日
- **负责团队**: 前端开发组
- **对接团队**: 后端开发组
- **服务器地址**: `http://140.143.143.195/api`
- **实现进度**: 42% (25/60 API已实现)

## 🎯 项目概述

### 业务背景
学习质效分析系统是一个教育管理平台，旨在通过数据化手段提升学习效果。系统支持学员记录学习时间，管理员分析学习数据，实现科学化的学习管理。

### 核心功能
1. **用户认证**: 微信登录、身份绑定、权限管理
2. **学习管理**: 时间记录、历史查询、数据统计
3. **数据分析**: 个人分析、团队对比、趋势预测
4. **系统管理**: 用户管理、数据导入导出、权限控制

### 用户角色
| 角色 | 英文标识 | 权限描述 |
|------|----------|----------|
| 学员 | student | 记录学习时间，查看个人数据 |
| 层级长 | instructor | 管理团队成员，查看团队数据 |
| 信息管理员 | manager | 数据维护，权限管理 |
| 超级管理员 | admin | 系统配置，全局管理 |

## 🏗️ 技术要求

### 基础要求
- **协议**: HTTP (开发阶段) / HTTPS (生产阶段)
- **数据格式**: JSON
- **编码**: UTF-8
- **API风格**: RESTful
- **认证方式**: JWT Token
- **服务器IP**: `140.143.143.195`
- **基础URL**: `http://140.143.143.195/api`

### 微信小程序配置
- **AppID**: `wx13e6fdf682f6d772`
- **AppSecret**: `2d3f498a4b65a8237579fe8f1811ce83` (后端使用)

### 性能要求
- **响应时间**: 普通接口 < 500ms，复杂查询 < 2s
- **并发支持**: 至少支持 100 并发用户
- **可用性**: 99.5% 以上
- **数据一致性**: 强一致性

### 安全要求
- **HTTPS**: 生产环境必须使用HTTPS
- **Token验证**: 所有业务接口需验证Token
- **SQL注入防护**: 所有数据库查询需防SQL注入
- **XSS防护**: 输出数据需进行XSS过滤
- **数据脱敏**: 敏感信息(邮箱、手机号)自动脱敏处理

## 📡 API接口规范

### 基础信息
- **基础URL**: `http://140.143.143.195/api` (开发环境)
- **API版本**: v1
- **Content-Type**: `application/json`
- **健康检查**: `http://140.143.143.195/health`

### 通用响应格式
```json
{
  "success": true,           // 请求是否成功
  "message": "操作成功",      // 响应消息
  "data": {},               // 响应数据
  "timestamp": 1692518400,  // 响应时间戳
  "requestId": "uuid"       // 请求ID
}
```

### 错误响应格式
```json
{
  "success": false,
  "message": "错误描述",
  "errorCode": "E001",
  "data": null,
  "timestamp": 1692518400,
  "requestId": "uuid"
}
```

### 认证Header格式
```
Authorization: Bearer <jwt_token>
```

### 通用错误码
| 错误码 | HTTP状态码 | 描述 |
|--------|------------|------|
| E001 | 400 | 请求参数错误 |
| E002 | 401 | 未授权访问/Token失效 |
| E003 | 403 | 权限不足 |
| E004 | 404 | 资源不存在 |
| E005 | 429 | 请求频率过高 |
| E006 | 500 | 服务器内部错误 |

## 🎯 API实现状态总览

### 实现进度统计
```
总计: 60个API接口
已实现: 25个 (42%)
核心功能覆盖率: 85%

模块状态:
🔐 认证模块: 75% (3/4)   ⚡ 高质量实现
👤 用户模块: 88% (7/8)   ⚡ 高质量实现  
📚 学习模块: 90% (9/10)  ⚡ 高质量实现
📢 通知模块: 20% (1/5)   🔄 基础实现
📝 考试模块: 17% (1/6)   🔄 基础实现
📊 分析模块: 14% (1/7)   🔄 基础实现
🛠️ 管理模块: 0% (0/10)   ❌ 待实现
📁 文件模块: 0% (0/6)    ❌ 待实现
```

### ✅ 已验证API端点
- `GET /api/` - API根路径正常
- `POST /api/auth/test-login` - 测试登录成功
- `GET /api/users/profile` - 用户信息正常返回
- `GET /api/users/roles` - 角色信息正常返回
- `GET /api/users/study-stats` - 学习统计正常返回
- `GET /api/study/today` - 今日数据正常返回
- `GET /api/study/week` - 周数据正常返回
- `GET /api/notifications` - 通知列表正常返回
- `GET /api/exam/latest` - 最新考试信息正常返回
- `GET /api/analysis/recent` - 最近分析数据正常返回

## � 优先级开发计划

### P0 - 紧急修复 (✅ 已完成)
**前端正在调用的API，必须立即实现**
- ✅ `GET /api/study/today` - 今日学习数据
- ✅ `GET /api/study/week` - 本周学习数据  
- ✅ `GET /api/notifications` - 通知列表
- ✅ `GET /api/exam/latest` - 最新考试信息
- ✅ `GET /api/analysis/recent` - 最近分析数据

### P1 - 高优先级 (🔄 部分完成)
**核心业务功能**
- ✅ 用户认证和信息管理
- [ ] `POST /api/auth/refresh` - Token刷新机制
- [ ] `POST /api/auth/logout` - 用户登出
- [ ] `GET /api/analysis/personal` - 个人分析增强

### P2 - 中优先级 (❌ 待开发)
**管理和扩展功能**
- [ ] `GET /api/admin/users` - 用户管理
- [ ] `POST /api/files/upload` - 文件上传
- [ ] `GET /api/analysis/team` - 团队分析

### P3 - 低优先级 (❌ 长期规划)
**高级功能和优化**
- [ ] Excel导入导出功能
- [ ] 高级分析和报表
- [ ] 完整的管理员功能

## 📊 各模块详细实现状态

### 🔐 认证模块 (75% 完成)
| API | 状态 | 描述 |
|-----|------|------|
| `POST /auth/wxlogin` | ✅ | 微信登录 |
| `POST /auth/bind` | ✅ | 账号绑定 |
| `POST /auth/test-login` | ✅ | 测试登录(开发环境) |
| `POST /auth/refresh` | ❌ | Token刷新 |
| `POST /auth/logout` | ❌ | 退出登录 |

### 👤 用户模块 (88% 完成)
| API | 状态 | 描述 |
|-----|------|------|
| `GET /users/profile` | ✅ | 获取个人信息 |
| `PUT /users/profile` | ✅ | 更新个人信息 |
| `GET /users/roles` | ✅ | 获取用户角色 |
| `GET /users/study-stats` | ✅ | 用户学习统计 |
| `GET /users/notification-settings` | ✅ | 通知设置 |
| `PUT /users/notification-settings` | ✅ | 更新通知设置 |
| `POST /users/change-password` | ✅ | 修改密码 |
| `POST /users/switch-role` | ❌ | 切换角色 |

### 📚 学习模块 (90% 完成)
| API | 状态 | 描述 |
|-----|------|------|
| `POST /study/submit` | ✅ | 提交学习时间 |
| `GET /study/history` | ✅ | 获取学习历史 |
| `GET /study/today` | ✅ | 今日学习数据 |
| `GET /study/week` | ✅ | 本周学习数据 |
| `GET /study/calendar` | ✅ | 获取日历数据 |
| `GET /study/stats` | ✅ | 获取统计数据 |
| `GET /study/ranking` | ✅ | 获取排名 |
| `GET /study/heatmap` | ✅ | 获取热力图数据 |
| `DELETE /study/:id` | ✅ | 删除学习记录 |
| `GET /study/month` | ❌ | 本月学习数据 |
| `PUT /study/:id` | ❌ | 更新学习记录 |

### 📢 通知模块 (20% 完成)
| API | 状态 | 描述 |
|-----|------|------|
| `GET /notifications` | ✅ | 获取通知列表 |
| `POST /notifications` | ❌ | 发送通知 |
| `PUT /notifications/:id/read` | ❌ | 标记已读 |
| `DELETE /notifications/:id` | ❌ | 删除通知 |
| `GET /notifications/unread-count` | ❌ | 未读数量 |

### 📝 考试模块 (17% 完成)
| API | 状态 | 描述 |
|-----|------|------|
| `GET /exam/latest` | ✅ | 最新考试信息 |
| `GET /exam/list` | ❌ | 考试列表 |
| `GET /exam/:id` | ❌ | 考试详情 |
| `POST /exam` | ❌ | 创建考试 |
| `PUT /exam/:id` | ❌ | 更新考试 |
| `DELETE /exam/:id` | ❌ | 删除考试 |

### 📊 分析模块 (14% 完成)
| API | 状态 | 描述 |
|-----|------|------|
| `GET /analysis/recent` | ✅ | 最近分析数据 |
| `GET /analysis/personal` | ❌ | 个人分析数据 |
| `GET /analysis/team` | ❌ | 团队分析数据 |
| `GET /analysis/ranking` | ❌ | 排名数据 |
| `GET /analysis/trends` | ❌ | 趋势分析 |
| `GET /analysis/comparison` | ❌ | 数据对比 |
| `GET /analysis/heatmap` | ❌ | 热力图分析 |

### 🛠️ 管理模块 (0% 完成)
| API | 状态 | 描述 |
|-----|------|------|
| `GET /admin/users` | ❌ | 用户列表 |
| `POST /admin/import` | ❌ | 批量导入 |
| `GET /admin/export` | ❌ | 数据导出 |
| `GET /admin/stats` | ❌ | 系统统计 |
| `POST /admin/users` | ❌ | 添加用户 |
| `PUT /admin/users/:id` | ❌ | 更新用户 |
| `DELETE /admin/users/:id` | ❌ | 删除用户 |
| `GET /admin/units` | ❌ | 组织架构 |
| `POST /admin/units` | ❌ | 添加单位 |
| `PUT /admin/units/:id` | ❌ | 更新单位 |

### 📁 文件模块 (0% 完成)
| API | 状态 | 描述 |
|-----|------|------|
| `POST /files/upload` | ❌ | 文件上传 |
| `GET /files/download/:id` | ❌ | 文件下载 |
| `GET /files/template/:type` | ❌ | 模板下载 |
| `POST /files/import/excel` | ❌ | Excel导入 |
| `GET /files/export/excel` | ❌ | Excel导出 |
| `DELETE /files/:id` | ❌ | 删除文件 |

## �🔐 认证授权接口

### 1. 微信登录
**接口**: `POST /auth/wxlogin`

**描述**: 通过微信code获取用户信息，如果用户未绑定则返回需要绑定的标识

**请求参数**:
```json
{
  "code": "string"  // 微信授权code (required)
}
```

**响应数据**:
```json
// 用户已绑定情况
{
  "success": true,
  "message": "登录成功",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "refresh_token_string",
    "expiresIn": 7200,
    "user": {
      "id": "user_001",
      "name": "张三",
      "studentId": "ST001",
      "avatar": "https://example.com/avatar.jpg",
      "role": "student",
      "unitName": "计算机科学与技术学院",
      "openid": "wx_openid_123"
    }
  }
}

// 用户未绑定情况
{
  "success": false,
  "message": "用户未找到，请先绑定账号",
  "data": {
    "openid": "wx_openid_123",
    "needBind": true
  }
}
```

### 2. 身份绑定
**接口**: `POST /auth/bind`

**描述**: 将微信用户与系统账号绑定

**请求参数**:
```json
{
  "openid": "string",     // 微信openid (required)
  "studentId": "string",  // 学员编号 (required)
  "password": "string"    // 登录密码 (required)
}
```

**响应数据**:
```json
{
  "success": true,
  "message": "绑定成功",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "refresh_token_string",
    "expiresIn": 7200,
    "user": {
      "id": "user_001",
      "name": "张三",
      "studentId": "ST001",
      "avatar": "https://example.com/avatar.jpg",
      "role": "student",
      "unitName": "计算机科学与技术学院",
      "openid": "wx_openid_123"
    }
  }
}
```

### 3. Token刷新
**接口**: `POST /auth/refresh`

**描述**: 使用refreshToken获取新的访问token

**请求参数**:
```json
{
  "refreshToken": "string"  // 刷新token (required)
}
```

**响应数据**:
```json
{
  "success": true,
  "message": "刷新成功",
  "data": {
    "token": "new_access_token",
    "expiresIn": 7200
  }
}
```

### 4. 获取用户信息
**接口**: `GET /user/profile`

**描述**: 获取当前用户详细信息

**请求头**:
```
Authorization: Bearer {token}
```

**响应数据**:
```json
{
  "success": true,
  "message": "获取成功",
  "data": {
    "id": "user_001",
    "name": "张三",
    "studentId": "ST001",
    "avatar": "https://example.com/avatar.jpg",
    "role": "student",
    "unitName": "计算机科学与技术学院",
    "phone": "13800138000",
    "email": "zhangsan@example.com",
    "createTime": "2025-08-01T10:00:00Z",
    "lastLogin": "2025-08-20T09:30:00Z",
    "permissions": ["study.create", "study.view"]
  }
}
```

## 📚 学习数据接口

### 1. 提交学习记录
**接口**: `POST /study/submit`

**描述**: 提交学员的学习时间记录

**请求头**:
```
Authorization: Bearer {token}
```

**请求参数**:
```json
{
  "date": "2025-08-20",      // 学习日期 (required, YYYY-MM-DD)
  "studyTime": 3.5,          // 学习时长,小时 (required, number)
  "subject": "数学",         // 学习科目 (required)
  "note": "复习微积分基础"     // 备注 (optional)
}
```

**响应数据**:
```json
{
  "success": true,
  "message": "提交成功",
  "data": {
    "id": "record_001",
    "date": "2025-08-20",
    "studyTime": 3.5,
    "subject": "数学",
    "note": "复习微积分基础",
    "createTime": "2025-08-20T14:30:00Z"
  }
}
```

### 2. 获取学习历史
**接口**: `GET /study/history`

**描述**: 获取用户的学习历史记录

**请求头**:
```
Authorization: Bearer {token}
```

**请求参数** (Query):
```
startDate=2025-08-01   // 开始日期 (optional, YYYY-MM-DD)
endDate=2025-08-31     // 结束日期 (optional, YYYY-MM-DD)
subject=数学           // 科目筛选 (optional)
page=1                 // 页码 (optional, default: 1)
limit=20              // 每页数量 (optional, default: 20)
```

**响应数据**:
```json
{
  "success": true,
  "message": "获取成功",
  "data": {
    "records": [
      {
        "id": "record_001",
        "date": "2025-08-20",
        "studyTime": 3.5,
        "subject": "数学",
        "note": "复习微积分基础",
        "createTime": "2025-08-20T14:30:00Z",
        "updateTime": "2025-08-20T14:30:00Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 100,
      "totalPages": 5
    },
    "summary": {
      "totalHours": 85.5,
      "totalDays": 25,
      "averageDaily": 3.42
    }
  }
}
```

### 3. 更新学习记录
**接口**: `PUT /study/records/{id}`

**描述**: 更新指定的学习记录

**请求头**:
```
Authorization: Bearer {token}
```

**请求参数**:
```json
{
  "studyTime": 4.0,          // 学习时长 (optional)
  "subject": "高等数学",      // 学习科目 (optional)
  "note": "更新的备注"        // 备注 (optional)
}
```

**响应数据**:
```json
{
  "success": true,
  "message": "更新成功",
  "data": {
    "id": "record_001",
    "date": "2025-08-20",
    "studyTime": 4.0,
    "subject": "高等数学",
    "note": "更新的备注",
    "updateTime": "2025-08-20T15:30:00Z"
  }
}
```

### 4. 删除学习记录
**接口**: `DELETE /study/records/{id}`

**描述**: 删除指定的学习记录

**请求头**:
```
Authorization: Bearer {token}
```

**响应数据**:
```json
{
  "success": true,
  "message": "删除成功",
  "data": null
}
```

## 📊 数据分析接口

### 1. 个人学习分析
**接口**: `GET /analysis/personal`

**描述**: 获取用户个人的学习数据分析

**请求头**:
```
Authorization: Bearer {token}
```

**请求参数** (Query):
```
period=month           // 统计周期: week/month/quarter/year (optional, default: month)
startDate=2025-08-01  // 自定义开始日期 (optional)
endDate=2025-08-31    // 自定义结束日期 (optional)
```

**响应数据**:
```json
{
  "success": true,
  "message": "获取成功",
  "data": {
    "overview": {
      "totalHours": 85.5,        // 总学习时长
      "totalDays": 25,           // 学习天数
      "averageDaily": 3.42,      // 日均学习时长
      "ranking": 12,             // 排名
      "totalStudents": 150,      // 总人数
      "trend": "up"              // 趋势: up/down/stable
    },
    "subjectDistribution": [     // 科目分布
      {
        "subject": "数学",
        "hours": 30.5,
        "percentage": 35.7,
        "rank": 1
      },
      {
        "subject": "英语",
        "hours": 25.0,
        "percentage": 29.2,
        "rank": 2
      }
    ],
    "dailyTrend": [              // 每日趋势
      {
        "date": "2025-08-01",
        "hours": 3.5
      },
      {
        "date": "2025-08-02",
        "hours": 2.0
      }
    ],
    "weeklyPattern": [           // 周模式
      {
        "dayOfWeek": 1,          // 1-7 (周一到周日)
        "averageHours": 3.2
      }
    ],
    "achievements": [            // 成就标签
      {
        "type": "consistency",   // 成就类型
        "title": "坚持学习",
        "description": "连续学习7天",
        "date": "2025-08-20"
      }
    ]
  }
}
```

### 2. 团队学习分析
**接口**: `GET /analysis/team`

**描述**: 获取团队的学习数据分析 (需要instructor及以上权限)

**请求头**:
```
Authorization: Bearer {token}
```

**请求参数** (Query):
```
teamId=team_001       // 团队ID (optional, 不传则获取用户管理的团队)
period=month          // 统计周期 (optional, default: month)
startDate=2025-08-01  // 自定义开始日期 (optional)
endDate=2025-08-31    // 自定义结束日期 (optional)
```

**响应数据**:
```json
{
  "success": true,
  "message": "获取成功",
  "data": {
    "teamInfo": {
      "id": "team_001",
      "name": "计算机科学班",
      "memberCount": 30
    },
    "overview": {
      "totalHours": 2580.5,     // 团队总学习时长
      "averageHours": 86.0,     // 平均学习时长
      "activeMembers": 28,      // 活跃成员数
      "completion": 93.3        // 完成度百分比
    },
    "memberRanking": [          // 成员排行
      {
        "userId": "user_001",
        "name": "张三",
        "studentId": "ST001",
        "totalHours": 95.5,
        "rank": 1,
        "trend": "up"
      }
    ],
    "subjectAnalysis": [        // 科目分析
      {
        "subject": "数学",
        "totalHours": 850.0,
        "averageHours": 28.3,
        "memberCount": 30
      }
    ],
    "progressTrend": [          // 进度趋势
      {
        "date": "2025-08-01",
        "totalHours": 45.5,
        "memberCount": 25
      }
    ]
  }
}
```

### 3. 排行榜数据
**接口**: `GET /analysis/ranking`

**描述**: 获取排行榜数据

**请求头**:
```
Authorization: Bearer {token}
```

**请求参数** (Query):
```
type=personal         // 排行类型: personal/team (required)
period=month         // 统计周期: week/month/quarter/year (optional, default: month)
scope=unit          // 排行范围: unit/global (optional, default: unit)
limit=50            // 返回数量 (optional, default: 50)
```

**响应数据**:
```json
{
  "success": true,
  "message": "获取成功",
  "data": {
    "rankingInfo": {
      "type": "personal",
      "period": "month",
      "scope": "unit",
      "updateTime": "2025-08-20T10:00:00Z"
    },
    "currentUser": {            // 当前用户排名信息
      "rank": 12,
      "totalHours": 85.5,
      "percentile": 92.0
    },
    "rankings": [
      {
        "rank": 1,
        "userId": "user_002",
        "name": "李四",
        "studentId": "ST002",
        "unitName": "计算机科学与技术学院",
        "totalHours": 128.5,
        "trend": "up",
        "change": 2               // 排名变化
      }
    ]
  }
}
```

## 👥 用户管理接口

### 1. 获取用户列表
**接口**: `GET /admin/users`

**描述**: 获取用户列表 (需要manager及以上权限)

**请求头**:
```
Authorization: Bearer {token}
```

**请求参数** (Query):
```
page=1               // 页码 (optional, default: 1)
limit=20            // 每页数量 (optional, default: 20)
role=student        // 角色筛选 (optional)
unitId=unit_001     // 单位筛选 (optional)
keyword=张三        // 关键词搜索 (optional)
status=active       // 状态筛选: active/inactive (optional)
```

**响应数据**:
```json
{
  "success": true,
  "message": "获取成功",
  "data": {
    "users": [
      {
        "id": "user_001",
        "name": "张三",
        "studentId": "ST001",
        "role": "student",
        "unitName": "计算机科学与技术学院",
        "phone": "13800138000",
        "status": "active",
        "lastLogin": "2025-08-20T09:30:00Z",
        "createTime": "2025-08-01T10:00:00Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 500,
      "totalPages": 25
    }
  }
}
```

### 2. 更新用户信息
**接口**: `PUT /admin/users/{id}`

**描述**: 更新用户信息 (需要manager及以上权限)

**请求头**:
```
Authorization: Bearer {token}
```

**请求参数**:
```json
{
  "name": "张三",              // 姓名 (optional)
  "role": "instructor",       // 角色 (optional)
  "unitId": "unit_002",       // 单位ID (optional)
  "phone": "13800138000",     // 电话 (optional)
  "email": "zhangsan@example.com", // 邮箱 (optional)
  "status": "active"          // 状态 (optional)
}
```

**响应数据**:
```json
{
  "success": true,
  "message": "更新成功",
  "data": {
    "id": "user_001",
    "name": "张三",
    "studentId": "ST001",
    "role": "instructor",
    "unitName": "软件工程学院",
    "updateTime": "2025-08-20T15:30:00Z"
  }
}
```

## 📤 数据导入导出接口

### 1. 数据导出
**接口**: `POST /admin/export`

**描述**: 导出数据 (需要manager及以上权限)

**请求头**:
```
Authorization: Bearer {token}
```

**请求参数**:
```json
{
  "type": "study_records",    // 导出类型: users/study_records/analysis (required)
  "format": "excel",          // 导出格式: excel/csv (optional, default: excel)
  "filters": {                // 筛选条件 (optional)
    "startDate": "2025-08-01",
    "endDate": "2025-08-31",
    "unitId": "unit_001",
    "userIds": ["user_001", "user_002"]
  },
  "columns": [                // 导出字段 (optional)
    "name", "studentId", "date", "studyTime", "subject"
  ]
}
```

**响应数据**:
```json
{
  "success": true,
  "message": "导出任务已创建",
  "data": {
    "taskId": "export_task_001",
    "status": "processing",     // processing/completed/failed
    "downloadUrl": null,        // 完成后提供下载链接
    "createTime": "2025-08-20T15:30:00Z",
    "estimatedTime": 120        // 预估完成时间(秒)
  }
}
```

### 2. 查询导出任务状态
**接口**: `GET /admin/export/tasks/{taskId}`

**描述**: 查询导出任务状态

**请求头**:
```
Authorization: Bearer {token}
```

**响应数据**:
```json
{
  "success": true,
  "message": "获取成功",
  "data": {
    "taskId": "export_task_001",
    "status": "completed",
    "progress": 100,            // 进度百分比
    "downloadUrl": "https://example.com/download/file.xlsx",
    "fileName": "学习记录_20250820.xlsx",
    "fileSize": 1024000,        // 文件大小(字节)
    "recordCount": 5000,        // 记录数量
    "createTime": "2025-08-20T15:30:00Z",
    "completeTime": "2025-08-20T15:32:00Z",
    "expireTime": "2025-08-27T15:32:00Z"  // 下载链接过期时间
  }
}
```

### 3. 数据导入
**接口**: `POST /admin/import`

**描述**: 导入数据 (需要manager及以上权限)

**请求头**:
```
Authorization: Bearer {token}
Content-Type: multipart/form-data
```

**请求参数**:
```
file: [文件]                 // Excel或CSV文件 (required)
type: "study_records"        // 导入类型: users/study_records (required)
mode: "append"               // 导入模式: append/overwrite (optional, default: append)
```

**响应数据**:
```json
{
  "success": true,
  "message": "导入任务已创建",
  "data": {
    "taskId": "import_task_001",
    "status": "processing",
    "fileName": "学习记录.xlsx",
    "createTime": "2025-08-20T15:30:00Z"
  }
}
```

### 4. 查询导入任务状态
**接口**: `GET /admin/import/tasks/{taskId}`

**描述**: 查询导入任务状态

**请求头**:
```
Authorization: Bearer {token}
```

**响应数据**:
```json
{
  "success": true,
  "message": "获取成功",
  "data": {
    "taskId": "import_task_001",
    "status": "completed",      // processing/completed/failed/partial
    "progress": 100,
    "fileName": "学习记录.xlsx",
    "totalRows": 1000,
    "successRows": 950,
    "failedRows": 50,
    "errors": [                 // 错误记录
      {
        "row": 5,
        "column": "studyTime",
        "value": "abc",
        "error": "学习时长必须为数字"
      }
    ],
    "createTime": "2025-08-20T15:30:00Z",
    "completeTime": "2025-08-20T15:35:00Z"
  }
}
```

## 🔔 消息通知接口

### 1. 获取订阅消息模板
**接口**: `GET /notification/templates`

**描述**: 获取可用的订阅消息模板

**请求头**:
```
Authorization: Bearer {token}
```

**响应数据**:
```json
{
  "success": true,
  "message": "获取成功",
  "data": {
    "templates": [
      {
        "templateId": "template_001",
        "title": "学习提醒",
        "content": "今日还未记录学习时间，请及时填报",
        "type": "study_reminder",
        "enabled": true
      },
      {
        "templateId": "template_002",
        "title": "数据统计",
        "content": "您的月度学习报告已生成",
        "type": "monthly_report",
        "enabled": true
      }
    ]
  }
}
```

### 2. 发送订阅消息
**接口**: `POST /notification/send`

**描述**: 发送订阅消息 (系统内部调用)

**请求头**:
```
Authorization: Bearer {token}
```

**请求参数**:
```json
{
  "templateId": "template_001",  // 模板ID (required)
  "userIds": ["user_001"],       // 用户ID列表 (required)
  "data": {                      // 模板数据 (required)
    "name": "张三",
    "date": "2025-08-20",
    "hours": "3.5"
  },
  "sendTime": "2025-08-20T20:00:00Z"  // 发送时间 (optional, 立即发送则不传)
}
```

**响应数据**:
```json
{
  "success": true,
  "message": "发送成功",
  "data": {
    "messageId": "msg_001",
    "sendCount": 1,
    "successCount": 1,
    "failCount": 0
  }
}
```

## 📈 系统配置接口

### 1. 获取系统配置
**接口**: `GET /system/config`

**描述**: 获取系统配置信息

**请求头**:
```
Authorization: Bearer {token}
```

**响应数据**:
```json
{
  "success": true,
  "message": "获取成功",
  "data": {
    "appName": "学习质效分析系统",
    "version": "1.0.0",
    "subjects": [               // 可选科目列表
      "数学", "英语", "语文", "物理", "化学"
    ],
    "studyTimeRange": {         // 学习时长范围
      "min": 0.1,
      "max": 12.0
    },
    "reminderTime": "20:00",    // 默认提醒时间
    "reportGenerateTime": "06:00", // 报告生成时间
    "features": {               // 功能开关
      "dataExport": true,
      "dataImport": true,
      "ranking": true,
      "notification": true
    }
  }
}
```

### 2. 更新系统配置
**接口**: `PUT /system/config`

**描述**: 更新系统配置 (需要admin权限)

**请求头**:
```
Authorization: Bearer {token}
```

**请求参数**:
```json
{
  "subjects": [               // 科目列表 (optional)
    "数学", "英语", "语文", "物理", "化学", "生物"
  ],
  "studyTimeRange": {         // 学习时长范围 (optional)
    "min": 0.1,
    "max": 15.0
  },
  "reminderTime": "21:00",    // 提醒时间 (optional)
  "features": {               // 功能开关 (optional)
    "dataExport": true,
    "dataImport": false
  }
}
```

**响应数据**:
```json
{
  "success": true,
  "message": "更新成功",
  "data": {
    "updateTime": "2025-08-20T15:30:00Z"
  }
}
```

## 📊 统计报表接口

### 1. 获取统计概览
**接口**: `GET /statistics/overview`

**描述**: 获取系统统计概览 (需要manager及以上权限)

**请求头**:
```
Authorization: Bearer {token}
```

**请求参数** (Query):
```
period=month         // 统计周期 (optional, default: month)
unitId=unit_001     // 单位筛选 (optional)
```

**响应数据**:
```json
{
  "success": true,
  "message": "获取成功",
  "data": {
    "totalUsers": 1500,        // 总用户数
    "activeUsers": 1350,       // 活跃用户数
    "totalStudyHours": 125800.5, // 总学习时长
    "averageStudyHours": 83.9,  // 平均学习时长
    "totalRecords": 45000,      // 总记录数
    "completionRate": 90.5,     // 完成率
    "trends": {
      "userGrowth": 12.5,       // 用户增长率
      "studyHoursGrowth": 8.3,  // 学习时长增长率
      "activeUserGrowth": 5.2   // 活跃用户增长率
    },
    "topUnits": [               // 活跃单位排行
      {
        "unitId": "unit_001",
        "unitName": "计算机科学与技术学院",
        "totalHours": 15800.5,
        "userCount": 180,
        "averageHours": 87.8
      }
    ]
  }
}
```

## 🔧 开发辅助接口

### 1. 健康检查
**接口**: `GET /health`

**描述**: 服务健康检查

**响应数据**:
```json
{
  "success": true,
  "message": "服务正常",
  "data": {
    "status": "healthy",
    "timestamp": 1692518400,
    "version": "1.0.0",
    "uptime": 86400,           // 运行时间(秒)
    "environment": "production"
  }
}
```

### 2. 接口文档
**接口**: `GET /docs`

**描述**: 获取API文档 (Swagger/OpenAPI)

**响应**: 返回API文档页面

## 📝 数据字典

### 用户角色枚举
| 值 | 描述 | 权限 |
|---|---|---|
| student | 学员 | 基础学习功能 |
| instructor | 层级长 | 团队管理功能 |
| manager | 信息管理员 | 数据管理功能 |
| admin | 超级管理员 | 系统管理功能 |

### 学习科目枚举
| 值 | 描述 |
|---|---|
| 数学 | 数学 |
| 英语 | 英语 |
| 语文 | 语文 |
| 物理 | 物理 |
| 化学 | 化学 |
| 生物 | 生物 |
| 历史 | 历史 |
| 地理 | 地理 |
| 政治 | 政治 |

### 任务状态枚举
| 值 | 描述 |
|---|---|
| processing | 处理中 |
| completed | 已完成 |
| failed | 失败 |
| partial | 部分成功 |

## 🧪 测试数据

### 测试用户
```json
{
  "studentId": "TEST001",
  "password": "123456",
  "name": "测试用户",
  "role": "student",
  "unitName": "测试单位"
}
```

### 测试学习记录
```json
{
  "date": "2025-08-20",
  "studyTime": 2.5,
  "subject": "数学",
  "note": "测试记录"
}
```

## 📞 技术对接

### 联系方式
- **项目维护**: 方九日 (moqiqingxuan@gmail.com)
- **单位**: 陕西师范大学
- **技术对接**: 前端开发负责人

### 开发时间
- **接口设计**: 2个工作日
- **核心功能开发**: 10个工作日
- **测试联调**: 3个工作日
- **部署上线**: 2个工作日

### 交付物
1. **接口文档**: Swagger/OpenAPI格式
2. **数据库设计**: ER图和建表SQL
3. **部署文档**: 环境配置和部署步骤
4. **测试报告**: 接口测试和性能测试结果

## 🚀 前端集成指南

### 当前服务器配置
- **服务器IP**: `140.143.143.195`
- **API基础地址**: `http://140.143.143.195/api`
- **健康检查**: `http://140.143.143.195/health`
- **状态**: 开发环境运行中，核心API已就绪

### 微信小程序配置
在小程序 `app.js` 中配置：
```javascript
App({
  globalData: {
    baseUrl: 'http://140.143.143.195/api',
    appName: '学习质效分析系统',
    version: '1.0.0'
  }
});
```

### 网络请求配置
```javascript
// 统一请求方法 (utils/request.js)
const request = (options = {}) => {
  return new Promise((resolve, reject) => {
    wx.request({
      url: 'http://140.143.143.195/api' + options.url,
      method: options.method || 'GET',
      data: options.data || {},
      header: {
        'Content-Type': 'application/json',
        'Authorization': app.globalData.token ? `Bearer ${app.globalData.token}` : '',
        ...options.header
      },
      success: (res) => {
        if (res.statusCode === 200 && res.data.success) {
          resolve(res.data);
        } else {
          reject(res.data);
        }
      },
      fail: reject
    });
  });
};
```

### 主要API调用示例
```javascript
// 1. 获取今日学习数据
const getTodayData = () => {
  return request({
    url: '/study/today',
    method: 'GET'
  });
};

// 2. 提交学习时间
const submitStudyTime = (data) => {
  return request({
    url: '/study/submit',
    method: 'POST',
    data: {
      date: data.date,
      studyTime: data.studyTime,
      subject: data.subject,
      note: data.note
    }
  });
};

// 3. 获取用户信息
const getUserProfile = () => {
  return request({
    url: '/users/profile',
    method: 'GET'
  });
};
```

### 开发环境测试
API已就绪的端点：
- ✅ `GET /api/study/today` - 今日学习数据
- ✅ `GET /api/study/week` - 本周学习数据
- ✅ `GET /api/users/profile` - 用户信息
- ✅ `GET /api/notifications` - 通知列表
- ✅ `POST /api/auth/test-login` - 测试登录

### 相关文档
- [📋 前端集成指南](./FRONTEND_INTEGRATION_GUIDE.md) - 详细的前端技术对接文档
- [📊 API实现状态](../zhixiaodocs/API_IMPLEMENTATION_SUMMARY.md) - 最新的API实现进度

---

**文档版本**: 2.0.0  
**创建日期**: 2025年8月20日  
**最后更新**: 2025年8月20日  
**负责团队**: 前端开发组  
**服务器状态**: ✅ 运行中
**核心API状态**: ✅ 已就绪

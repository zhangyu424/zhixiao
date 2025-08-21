# API 接口文档

## 📋 接口概览

智效学习平台提供 RESTful API 服务，支持用户认证、学习记录、数据分析等核心功能。

### 🌐 基础信息

- **基础 URL**: `http://localhost:3000/api` (开发环境)
- **生产 URL**: `http://140.143.143.195/api` (生产环境)
- **API 版本**: v1.0.0
- **认证方式**: JWT Bearer Token
- **数据格式**: JSON

### 📊 接口状态

✅ **健康检查**: `/health` - 服务状态检查  
✅ **认证模块**: `/api/auth` - 用户登录认证  
✅ **学习模块**: `/api/study` - 学习记录管理  
✅ **用户模块**: `/api/users` - 用户信息管理  
✅ **分析模块**: `/api/analysis` - 数据分析统计  
✅ **管理模块**: `/api/admin` - 管理员功能  
✅ **考试模块**: `/api/exam` - 考试相关功能  
✅ **通知模块**: `/api/notifications` - 消息通知  
✅ **文件模块**: `/api/files` - 文件上传下载

## 🔐 认证机制

### JWT Token

所有需要认证的接口都需要在请求头中携带 JWT Token：

```http
Authorization: Bearer <your-jwt-token>
```

### 获取 Token

```http
POST /api/auth/wxlogin
Content-Type: application/json

{
  "code": "微信登录code"
}
```

## 📝 核心接口

### 1. 认证接口 (/api/auth)

#### 微信登录

```http
POST /api/auth/wxlogin
```

**请求参数**:

```json
{
  "code": "string" // 微信登录码
}
```

**响应示例**:

```json
{
  "success": true,
  "message": "登录成功",
  "data": {
    "token": "jwt-token-string",
    "user": {
      "id": 1,
      "openid": "wx_openid",
      "role": "student"
    }
  }
}
```

#### 账号绑定

```http
POST /api/auth/bind
```

### 2. 学习记录接口 (/api/study)

#### 提交学习记录

```http
POST /api/study/submit
Authorization: Bearer <token>
```

**请求参数**:

```json
{
  "subject": "数学",
  "duration": 60,
  "quality": 4,
  "content": "线性代数练习",
  "date": "2025-08-21"
}
```

#### 获取学习历史

```http
GET /api/study/history?page=1&limit=10
Authorization: Bearer <token>
```

#### 获取今日数据

```http
GET /api/study/today
Authorization: Bearer <token>
```

#### 获取本周数据

```http
GET /api/study/week
Authorization: Bearer <token>
```

#### 获取学习统计

```http
GET /api/study/stats?period=week
Authorization: Bearer <token>
```

### 3. 用户管理接口 (/api/users)

#### 获取用户信息

```http
GET /api/users/profile
Authorization: Bearer <token>
```

#### 更新用户信息

```http
PUT /api/users/profile
Authorization: Bearer <token>
```

#### 用户列表 (管理员)

```http
GET /api/users?page=1&limit=10
Authorization: Bearer <admin-token>
```

### 4. 数据分析接口 (/api/analysis)

#### 学习质效分析

```http
GET /api/analysis/efficiency?period=month
Authorization: Bearer <token>
```

#### 学习趋势分析

```http
GET /api/analysis/trends?subject=数学&days=30
Authorization: Bearer <token>
```

#### 班级排行榜

```http
GET /api/analysis/ranking?type=class&period=week
Authorization: Bearer <token>
```

### 5. 管理员接口 (/api/admin)

#### 创建管理员用户

```http
POST /api/admin/create-user
Authorization: Bearer <admin-token>
```

#### 系统统计

```http
GET /api/admin/stats
Authorization: Bearer <admin-token>
```

#### 数据导出

```http
GET /api/admin/export?format=excel&type=study_records
Authorization: Bearer <admin-token>
```

## 📊 响应格式

### 成功响应

```json
{
  "success": true,
  "message": "操作成功",
  "data": {
    // 具体数据
  },
  "timestamp": "2025-08-21T10:30:00.000Z"
}
```

### 错误响应

```json
{
  "success": false,
  "message": "错误描述",
  "error": "ERROR_CODE",
  "details": {
    // 错误详情
  },
  "timestamp": "2025-08-21T10:30:00.000Z"
}
```

## 🔧 状态码说明

| 状态码 | 说明                |
| ------ | ------------------- |
| 200    | 请求成功            |
| 201    | 创建成功            |
| 400    | 请求参数错误        |
| 401    | 未认证或 token 无效 |
| 403    | 权限不足            |
| 404    | 资源不存在          |
| 429    | 请求频率超限        |
| 500    | 服务器内部错误      |

## 🚦 限流规则

- **全局限制**: 100 requests/minute/IP
- **认证接口**: 10 requests/minute/IP
- **上传接口**: 5 requests/minute/user

## 📋 错误码参考

| 错误码              | 描述               |
| ------------------- | ------------------ |
| AUTH_INVALID_TOKEN  | Token 无效或已过期 |
| AUTH_MISSING_TOKEN  | 缺少认证 Token     |
| VALIDATION_ERROR    | 数据验证失败       |
| USER_NOT_FOUND      | 用户不存在         |
| PERMISSION_DENIED   | 权限不足           |
| RATE_LIMIT_EXCEEDED | 请求频率超限       |
| SERVER_ERROR        | 服务器内部错误     |

## 🧪 接口测试

### 使用 curl 测试

```bash
# 健康检查
curl http://localhost:3000/health

# 获取API信息
curl http://localhost:3000/api

# 微信登录
curl -X POST http://localhost:3000/api/auth/wxlogin \
  -H "Content-Type: application/json" \
  -d '{"code":"test-code"}'

# 获取学习记录 (需要token)
curl -X GET http://localhost:3000/api/study/today \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### 自动化测试

项目提供了完整的 API 测试脚本：

```bash
# 运行完整测试
cd backend
npm test

# 快速测试
npm run test:quick

# 管理员功能测试
npm run test:admin
```

## 📖 Swagger 文档

在线 API 文档访问：[http://localhost:3000/api](http://localhost:3000/api)

## 🔄 API 版本更新

当前版本: **v1.0.0**

版本策略：

- 主版本号：不兼容的 API 更改
- 次版本号：向下兼容的功能性新增
- 修订号：向下兼容的 bug 修复

---

> 📅 最后更新: 2025-08-21  
> 🔗 相关文档: [开发指南](./DEVELOPMENT.md) | [部署指南](./DEPLOYMENT.md)  
> 💬 问题反馈: [GitHub Issues](https://github.com/zhangyu424/zhixiao/issues)

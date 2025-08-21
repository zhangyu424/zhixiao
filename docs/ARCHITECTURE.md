# 技术架构设计

## 🏗️ 整体架构

智效学习平台采用前后端分离的架构设计，基于微服务理念构建，确保系统的可扩展性和可维护性。

### 架构概览

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   微信小程序      │    │   后端API服务    │    │   数据库服务     │
│   (Frontend)    │◄──►│   (Backend)     │◄──►│   (MySQL)      │
└─────────────────┘    └─────────────────┘    └─────────────────┘
│                      │                      │
│ • 页面展示           │ • RESTful API       │ • 数据存储
│ • 用户交互           │ • 业务逻辑处理       │ • 事务管理
│ • 状态管理           │ • 认证授权          │ • 数据备份
│ • API调用           │ • 数据验证          │ • 性能优化
└─────────────────────┴─────────────────────┴─────────────────────
```

## 🎯 设计原则

### 1. 分层架构原则

**后端分层**:

```
┌─────────────┐
│ Controller  │ ← 接口层：处理HTTP请求和响应
├─────────────┤
│ Service     │ ← 业务层：核心业务逻辑处理
├─────────────┤
│ Model       │ ← 数据层：数据模型和数据库操作
├─────────────┤
│ Utils       │ ← 工具层：通用工具和辅助函数
└─────────────┘
```

**前端分层**:

```
┌─────────────┐
│ Pages       │ ← 页面层：用户界面和交互
├─────────────┤
│ Components  │ ← 组件层：可复用UI组件
├─────────────┤
│ Services    │ ← 服务层：API调用和数据处理
├─────────────┤
│ Utils       │ ← 工具层：通用工具和业务逻辑
└─────────────┘
```

### 2. 单一职责原则

每个模块和类都有明确的职责：

- **Controller**: 只处理 HTTP 请求路由
- **Service**: 只处理业务逻辑
- **Model**: 只处理数据操作
- **Validator**: 只处理数据验证

### 3. 开闭原则

系统对扩展开放，对修改关闭：

- 通过配置文件管理不同环境
- 使用策略模式处理不同业务场景
- 接口设计支持版本演进

## 🔧 后端架构详解

### 技术栈选择

| 技术       | 版本 | 用途       | 选择理由                    |
| ---------- | ---- | ---------- | --------------------------- |
| Node.js    | 18+  | 运行时环境 | 高并发、JavaScript 生态丰富 |
| Express.js | 5.1+ | Web 框架   | 轻量级、中间件丰富          |
| MySQL      | 5.7+ | 数据库     | 关系型数据、事务支持        |
| JWT        | -    | 认证方案   | 无状态、跨域支持            |
| PM2        | -    | 进程管理   | 生产环境稳定性              |

### 核心模块设计

#### 1. 认证授权模块

```javascript
// 认证流程设计
const authFlow = {
  // 微信登录
  wxLogin: async (code) => {
    // 1. 通过code获取openid
    // 2. 查找或创建用户
    // 3. 生成JWT token
    // 4. 返回用户信息和token
  },

  // Token验证
  verifyToken: (token) => {
    // 1. 验证token格式
    // 2. 解码JWT payload
    // 3. 检查过期时间
    // 4. 返回用户信息
  },

  // 权限检查
  checkPermission: (user, resource, action) => {
    // 1. 获取用户角色
    // 2. 检查角色权限
    // 3. 返回是否有权限
  },
};
```

#### 2. 数据处理模块

```javascript
// 数据流转设计
const dataFlow = {
  // 请求 → 验证 → 处理 → 响应
  process: async (req, res) => {
    try {
      // 1. 数据验证
      const validatedData = await validator.validate(req.body);

      // 2. 业务处理
      const result = await service.process(validatedData);

      // 3. 响应格式化
      return ResponseUtils.success(res, result);
    } catch (error) {
      return ResponseUtils.error(res, error.message);
    }
  },
};
```

#### 3. 缓存策略

```javascript
// 多层缓存设计
const cacheStrategy = {
  // 内存缓存：热点数据
  memory: new Map(),

  // Redis缓存：分布式缓存 (可选)
  redis: redisClient,

  // 数据库缓存：查询优化
  database: {
    // 索引优化
    // 查询缓存
    // 连接池
  },
};
```

### API 设计规范

#### RESTful API 规范

```
GET    /api/users           # 获取用户列表
GET    /api/users/:id       # 获取特定用户
POST   /api/users           # 创建用户
PUT    /api/users/:id       # 更新用户
DELETE /api/users/:id       # 删除用户

GET    /api/study/records   # 获取学习记录
POST   /api/study/submit    # 提交学习记录
GET    /api/study/stats     # 获取统计数据
```

#### 响应格式规范

```javascript
// 成功响应
{
  "success": true,
  "message": "操作成功",
  "data": {
    // 实际数据
  },
  "timestamp": "2025-08-21T10:30:00.000Z"
}

// 错误响应
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

## 📱 前端架构详解

### 技术栈选择

| 技术            | 用途      | 选择理由           |
| --------------- | --------- | ------------------ |
| 微信小程序      | 前端框架  | 微信生态集成度高   |
| JavaScript ES6+ | 开发语言  | 现代语法、可读性强 |
| WXSS            | 样式语言  | 小程序专用样式     |
| WeUI            | UI 组件库 | 微信官方组件       |

### 前端架构模式

#### 1. 页面架构

```javascript
// 页面标准结构
Page({
  // 页面数据
  data: {
    // 初始数据
  },

  // 生命周期
  onLoad() {
    // 页面加载
  },

  onShow() {
    // 页面显示
  },

  // 事件处理
  handleEvent() {
    // 用户交互
  },

  // 业务方法
  async loadData() {
    // 数据加载
  },
});
```

#### 2. 服务层设计

```javascript
// API服务层
class ApiService {
  constructor() {
    this.baseURL = config.apiBaseURL;
    this.timeout = config.timeout;
  }

  async request(options) {
    // 统一请求处理
    // 1. 添加认证头
    // 2. 错误处理
    // 3. 响应拦截
    // 4. 数据转换
  }
}

// 具体业务服务
class UserService extends ApiService {
  async getProfile() {
    return this.request({
      url: '/users/profile',
      method: 'GET',
    });
  }
}
```

#### 3. 状态管理

```javascript
// 全局状态管理
const globalState = {
  // 用户信息
  user: {
    info: null,
    token: null,
    role: null,
  },

  // 应用配置
  config: {
    apiBaseURL: '',
    timeout: 10000,
  },

  // 缓存数据
  cache: new Map(),
};

// 状态更新方法
const updateState = (key, value) => {
  globalState[key] = value;
  // 通知相关页面更新
  broadcast(key, value);
};
```

## 🗄️ 数据库设计

### 数据库架构

#### 核心表结构

```sql
-- 用户表
CREATE TABLE users (
  id INT PRIMARY KEY AUTO_INCREMENT,
  openid VARCHAR(64) UNIQUE NOT NULL,
  nickname VARCHAR(50),
  avatar_url VARCHAR(255),
  role ENUM('student', 'teacher', 'admin') DEFAULT 'student',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- 学习记录表
CREATE TABLE study_records (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT NOT NULL,
  subject VARCHAR(50) NOT NULL,
  duration INT NOT NULL,
  quality TINYINT(1) CHECK (quality BETWEEN 1 AND 5),
  content TEXT,
  study_date DATE NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id)
);

-- 索引优化
CREATE INDEX idx_user_date ON study_records(user_id, study_date);
CREATE INDEX idx_subject_date ON study_records(subject, study_date);
```

#### 数据库优化策略

1. **索引优化**: 基于查询模式创建合适索引
2. **分区策略**: 按时间分区存储历史数据
3. **查询优化**: 使用 EXPLAIN 分析查询性能
4. **连接池**: 控制数据库连接数量

### 数据模型设计

```javascript
// 数据模型基类
class BaseModel {
  constructor(tableName) {
    this.tableName = tableName;
  }

  async findById(id) {
    // 通用查询方法
  }

  async create(data) {
    // 通用创建方法
  }

  async update(id, data) {
    // 通用更新方法
  }

  async delete(id) {
    // 通用删除方法
  }
}

// 具体模型实现
class User extends BaseModel {
  constructor() {
    super('users');
  }

  async findByOpenid(openid) {
    // 用户特定查询
  }
}
```

## 🔒 安全架构

### 安全策略

#### 1. 认证安全

```javascript
// JWT安全配置
const jwtConfig = {
  secret: process.env.JWT_SECRET, // 强密钥
  expiresIn: '7d', // 合理过期时间
  algorithm: 'HS256', // 安全算法
  issuer: 'zhixiao-platform', // 发行者
  audience: 'miniprogram', // 受众
};
```

#### 2. 数据安全

```javascript
// 数据加密
const security = {
  // 密码加密
  hashPassword: (password) => bcrypt.hash(password, 12),

  // 敏感数据加密
  encrypt: (data) => crypto.encrypt(data, process.env.DATA_KEY),

  // 输入清理
  sanitize: (input) => validator.escape(input),
};
```

#### 3. API 安全

```javascript
// 安全中间件
const securityMiddleware = [
  helmet(), // 安全头
  cors(corsOptions), // 跨域控制
  rateLimit(rateLimitOptions), // 频率限制
  validation(), // 输入验证
  authentication(), // 身份认证
  authorization(), // 权限控制
];
```

## 📊 性能优化

### 后端性能优化

#### 1. 数据库优化

```javascript
// 连接池配置
const dbConfig = {
  connectionLimit: 20,
  acquireTimeout: 60000,
  timeout: 60000,
  reconnect: true,
};

// 查询优化
const optimizedQuery = {
  // 使用索引
  useIndex: true,

  // 分页查询
  pagination: {
    page: 1,
    limit: 20,
    maxLimit: 100,
  },

  // 结果缓存
  cache: {
    ttl: 300, // 5分钟
    key: 'query:hash',
  },
};
```

#### 2. 缓存策略

```javascript
// 多级缓存
const cacheStrategy = {
  // L1: 内存缓存
  memory: {
    maxSize: 100,
    ttl: 60,
  },

  // L2: Redis缓存
  redis: {
    host: 'localhost',
    port: 6379,
    ttl: 3600,
  },

  // L3: 数据库缓存
  database: {
    queryCache: true,
    resultCache: true,
  },
};
```

### 前端性能优化

#### 1. 资源优化

```javascript
// 图片优化
const imageOptimization = {
  // 懒加载
  lazyLoad: true,

  // 格式优化
  format: 'webp',

  // 尺寸适配
  responsive: true,

  // CDN加速
  cdn: 'https://cdn.example.com',
};
```

#### 2. 代码优化

```javascript
// 代码分割
const codeSplitting = {
  // 按页面分割
  pageLevel: true,

  // 按功能分割
  featureLevel: true,

  // 按需加载
  lazyLoad: true,
};
```

## 🔄 部署架构

### 生产环境架构

```
                    ┌─────────────┐
                    │   Nginx     │
                    │  (反向代理)  │
                    └─────┬───────┘
                          │
                ┌─────────┴─────────┐
                │                   │
        ┌───────▼─────────┐ ┌───────▼─────────┐
        │   Node.js App   │ │   Node.js App   │
        │    (PM2)        │ │    (PM2)        │
        └─────────────────┘ └─────────────────┘
                          │
                ┌─────────▼─────────┐
                │      MySQL        │
                │   (Master/Slave)  │
                └───────────────────┘
```

### 部署策略

#### 1. 容器化部署

```dockerfile
# Dockerfile
FROM node:18-alpine

WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production

COPY . .
EXPOSE 3000

CMD ["npm", "start"]
```

#### 2. 自动化部署

```yaml
# GitHub Actions
name: Deploy
on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Deploy to server
        run: |
          npm run build
          npm run deploy
```

## 📈 监控和日志

### 应用监控

```javascript
// 性能监控
const monitor = {
  // API响应时间
  responseTime: true,

  // 内存使用率
  memoryUsage: true,

  // CPU使用率
  cpuUsage: true,

  // 数据库连接数
  dbConnections: true,
};
```

### 日志系统

```javascript
// 日志配置
const logConfig = {
  // 日志级别
  level: 'info',

  // 日志格式
  format: 'json',

  // 日志文件
  file: 'logs/app.log',

  // 日志轮转
  rotation: '1d',
};
```

---

> 📅 最后更新: 2025-08-21  
> 🔗 相关文档: [开发指南](./DEVELOPMENT.md) | [部署指南](./DEPLOYMENT.md)  
> 💡 架构演进: 持续优化和改进中

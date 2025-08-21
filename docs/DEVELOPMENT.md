# 开发指南

## 🛠️ 开发环境配置

### 系统要求

- **操作系统**: Linux/macOS/Windows
- **Node.js**: >= 16.0.0
- **npm**: >= 8.0.0
- **MySQL**: >= 5.7
- **微信开发者工具**: 最新版本

### 开发工具推荐

- **IDE**: Visual Studio Code
- **API 测试**: Postman/Insomnia
- **数据库管理**: phpMyAdmin/MySQL Workbench
- **版本控制**: Git

## 🚀 快速启动

### 1. 项目初始化

```bash
# 克隆项目
git clone https://github.com/zhangyu424/zhixiao.git
cd zhixiao-platform

# 安装后端依赖
cd backend
npm install

# 安装前端依赖
cd ../frontend
npm install
```

### 2. 环境配置

#### 后端环境配置

复制环境变量文件：

```bash
cd backend
cp .env.example .env
```

编辑 `.env` 文件：

```env
# 数据库配置
DB_HOST=localhost
DB_PORT=3306
DB_NAME=zhixiao
DB_USER=root
DB_PASSWORD=your_password

# JWT配置
JWT_SECRET=your-super-secret-key
JWT_EXPIRE=7d

# 服务器配置
PORT=3000
NODE_ENV=development

# 微信小程序配置
WX_APP_ID=your_app_id
WX_APP_SECRET=your_app_secret
```

#### 数据库初始化

```bash
# 创建数据库
mysql -u root -p -e "CREATE DATABASE zhixiao CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"

# 导入数据结构
mysql -u root -p zhixiao < database/schema.sql

# 导入测试数据 (可选)
mysql -u root -p zhixiao < database/test_data.sql
```

### 3. 启动服务

#### 后端服务

```bash
# 开发模式
cd backend
npm run dev

# 生产模式
npm start

# 使用PM2
pm2 start ecosystem.config.js
```

#### 前端开发

```bash
# 使用微信开发者工具
# 1. 打开微信开发者工具
# 2. 导入项目: frontend 目录
# 3. 设置AppID和服务器域名

# 或使用命令行预览
cd frontend
npm run preview
```

## 📋 开发规范

### 代码规范

#### JavaScript/ES6 规范

```javascript
// 使用 const/let，避免 var
const apiUrl = 'http://localhost:3000/api';
let userInfo = null;

// 使用箭头函数
const handleClick = () => {
  console.log('clicked');
};

// 使用模板字符串
const message = `Hello, ${username}!`;

// 异步处理使用 async/await
const fetchData = async () => {
  try {
    const response = await api.getData();
    return response.data;
  } catch (error) {
    console.error('Error:', error);
  }
};
```

#### 命名规范

```javascript
// 变量和函数：小驼峰
const userName = 'admin';
const getUserInfo = () => {};

// 常量：大写下划线
const API_BASE_URL = 'http://localhost:3000/api';
const MAX_RETRY_COUNT = 3;

// 类和构造函数：大驼峰
class UserService {
  constructor() {}
}

// 文件名：短横线分隔
// user-service.js
// api-manager.js
```

### 目录结构规范

#### 后端目录规范

```
backend/src/
├── controllers/        # 控制器层
│   ├── BaseController.js
│   └── UserController.js
├── services/          # 业务逻辑层
│   ├── UserService.js
│   └── StudyService.js
├── models/            # 数据模型层
│   └── User.js
├── middleware/        # 中间件
│   ├── auth.js
│   └── validation.js
├── routes/            # 路由定义
│   ├── index.js
│   └── users.js
├── utils/             # 工具类
│   ├── common.js
│   └── helpers.js
├── validators/        # 数据验证器
│   └── index.js
└── config/            # 配置文件
    ├── index.js
    └── database.js
```

#### 前端目录规范

```
frontend/
├── pages/             # 页面文件
│   ├── index/
│   └── profile/
├── components/        # 自定义组件
│   ├── chart/
│   └── data-table/
├── services/          # API服务层
│   ├── UserService.js
│   └── StudyService.js
├── utils/             # 工具类
│   ├── api/
│   ├── common/
│   └── business/
├── config/            # 配置文件
├── images/            # 图片资源
└── app.js             # 应用入口
```

### API 开发规范

#### 控制器设计

```javascript
// controllers/UserController.js
const BaseController = require('./BaseController');
const UserService = require('../services/UserService');
const { userValidators } = require('../validators');

class UserController extends BaseController {
  // 获取用户信息
  static async getProfile(req, res) {
    try {
      const userId = req.user.id;
      const result = await UserService.getUserById(userId);

      if (result.success) {
        return this.success(res, result.data, '获取用户信息成功');
      } else {
        return this.error(res, result.message, 400);
      }
    } catch (error) {
      return this.serverError(res, '获取用户信息失败', error);
    }
  }
}

module.exports = UserController;
```

#### 服务层设计

```javascript
// services/UserService.js
const { ResponseUtils } = require('../utils/common');

class UserService {
  static async getUserById(userId) {
    try {
      // 数据库查询逻辑
      const user = await User.findById(userId);

      if (!user) {
        return ResponseUtils.error('用户不存在');
      }

      return ResponseUtils.success(user);
    } catch (error) {
      return ResponseUtils.error('查询用户失败', error);
    }
  }
}

module.exports = UserService;
```

#### 路由设计

```javascript
// routes/users.js
const express = require('express');
const { validate } = require('../middleware/validation');
const { userValidators } = require('../validators');
const UserController = require('../controllers/UserController');
const { auth } = require('../middleware/auth');

const router = express.Router();

// 获取用户信息
router.get('/profile', auth, UserController.getProfile);

// 更新用户信息
router.put(
  '/profile',
  auth,
  validate(userValidators.updateProfile),
  UserController.updateProfile
);

module.exports = router;
```

### 前端开发规范

#### 页面结构

```javascript
// pages/profile/profile.js
const { UserService } = require('../../services');
const { config, storage } = require('../../utils');

Page({
  data: {
    userInfo: {},
    loading: false,
  },

  onLoad() {
    this.loadUserInfo();
  },

  async loadUserInfo() {
    try {
      this.setData({ loading: true });

      const response = await UserService.getProfile();
      if (response.success) {
        this.setData({ userInfo: response.data });
      } else {
        wx.showToast({
          title: response.message,
          icon: 'none',
        });
      }
    } catch (error) {
      console.error('加载用户信息失败:', error);
      wx.showToast({
        title: '加载失败',
        icon: 'none',
      });
    } finally {
      this.setData({ loading: false });
    }
  },
});
```

#### 服务层封装

```javascript
// services/UserService.js
const { http } = require('../utils/api');

class UserService {
  // 获取用户信息
  static async getProfile() {
    return await http.get('/users/profile');
  }

  // 更新用户信息
  static async updateProfile(data) {
    return await http.put('/users/profile', data);
  }
}

module.exports = UserService;
```

## 🧪 测试开发

### 后端测试

#### 单元测试

```javascript
// tests/unit/services/UserService.test.js
const UserService = require('../../../src/services/UserService');

describe('UserService', () => {
  describe('getUserById', () => {
    test('应该返回用户信息', async () => {
      const result = await UserService.getUserById(1);

      expect(result.success).toBe(true);
      expect(result.data).toHaveProperty('id');
      expect(result.data.id).toBe(1);
    });

    test('用户不存在时应该返回错误', async () => {
      const result = await UserService.getUserById(999);

      expect(result.success).toBe(false);
      expect(result.message).toBe('用户不存在');
    });
  });
});
```

#### 集成测试

```javascript
// tests/integration/auth.test.js
const request = require('supertest');
const app = require('../../server');

describe('Auth API', () => {
  test('POST /api/auth/wxlogin 应该返回token', async () => {
    const response = await request(app)
      .post('/api/auth/wxlogin')
      .send({ code: 'test-code' })
      .expect(200);

    expect(response.body.success).toBe(true);
    expect(response.body.data).toHaveProperty('token');
  });
});
```

### 运行测试

```bash
# 运行所有测试
npm test

# 运行单元测试
npm run test:unit

# 运行集成测试
npm run test:integration

# 生成覆盖率报告
npm run test:coverage
```

## 🔧 调试技巧

### 后端调试

#### 使用 console.log

```javascript
// 调试API请求
app.use((req, res, next) => {
  console.log(`${req.method} ${req.path}`, req.body);
  next();
});

// 调试数据库查询
const result = await User.findById(userId);
console.log('Database result:', result);
```

#### 使用 debugger

```javascript
// 在需要调试的地方设置断点
const getUserInfo = async (userId) => {
  debugger; // 程序会在这里暂停
  const user = await User.findById(userId);
  return user;
};
```

### 前端调试

#### 微信开发者工具调试

1. 打开调试器
2. 在 Console 中查看日志
3. 使用 Network 面板查看 API 请求
4. 使用 Storage 面板查看本地存储

#### 添加调试信息

```javascript
// 在页面中添加调试信息
console.log('Page data:', this.data);
console.log('API response:', response);

// 使用 wx.showModal 显示调试信息
wx.showModal({
  title: '调试信息',
  content: JSON.stringify(data, null, 2),
});
```

## 📦 部署准备

### 生产环境构建

```bash
# 后端生产环境
cd backend
npm run build  # 如果有构建脚本
NODE_ENV=production npm start

# 前端生产环境
cd frontend
npm run build  # 微信小程序发布
```

### 环境变量配置

```bash
# 生产环境变量
NODE_ENV=production
DB_HOST=your-production-db
JWT_SECRET=your-production-secret
WX_APP_ID=your-production-app-id
```

## 🔍 问题排查

### 常见问题

1. **端口占用**: 修改 `.env` 中的 `PORT` 配置
2. **数据库连接失败**: 检查数据库配置和权限
3. **JWT Token 无效**: 检查密钥配置和 token 生成逻辑
4. **微信登录失败**: 检查 AppID 和 AppSecret 配置

### 日志查看

```bash
# 查看应用日志
pm2 logs zhixiao-api

# 查看错误日志
tail -f logs/error.log

# 查看访问日志
tail -f logs/access.log
```

---

> 📅 最后更新: 2025-08-21  
> 🔗 相关文档: [API 文档](./API.md) | [部署指南](./DEPLOYMENT.md)  
> 💬 开发交流: [Discord](your-discord-link) | [微信群](your-wechat-group)

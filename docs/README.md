# 智效学习平台 (ZhiXiao Platform)

> 学习质效分析微信小程序 - 用于学习时间管理和学习效果分析的教育类应用

## 📋 项目概述

智效学习平台是一个基于微信小程序的学习管理系统，专注于学习时间跟踪、质效分析和数据统计。平台采用前后端分离架构，支持多角色权限管理，为用户提供个性化的学习建议和数据分析功能。

### ✨ 核心功能

- **学习时间跟踪**: 记录不同科目的学习时间
- **质效数据分析**: 基于学习时间和效果的智能分析
- **多角色管理**: 学生、老师、管理员多重角色支持
- **统计报表**: 丰富的图表和数据可视化
- **团队协作**: 班级管理和团队学习功能
- **数据导入导出**: 支持 Excel 格式的数据管理

## 🏗️ 技术架构

### 后端技术栈

- **框架**: Express.js 5.1.0
- **数据库**: MySQL
- **认证**: JWT + bcrypt
- **验证**: Joi + express-validator
- **文档**: Swagger/OpenAPI 3.0
- **部署**: PM2 进程管理
- **测试**: Jest + Supertest

### 前端技术栈

- **平台**: 微信小程序
- **架构**: 分层架构 + 服务层模式
- **状态管理**: 本地存储 + 配置管理器
- **API 管理**: 统一的 API 服务层
- **工具**: 性能监控 + 错误报告系统

## 📁 项目结构

```
zhixiao-platform/
├── backend/                 # 后端服务
│   ├── src/                # 源代码
│   │   ├── controllers/    # 控制器层
│   │   ├── services/       # 业务逻辑层
│   │   ├── models/         # 数据模型层
│   │   ├── middleware/     # 中间件
│   │   ├── routes/         # 路由定义
│   │   ├── utils/          # 工具类
│   │   ├── validators/     # 数据验证器
│   │   └── config/         # 配置文件
│   ├── tests/              # 测试文件
│   ├── database/           # 数据库文件
│   ├── uploads/            # 上传文件
│   └── server.js           # 服务入口
│
├── frontend/               # 前端小程序
│   ├── pages/              # 页面文件
│   ├── components/         # 自定义组件
│   ├── services/           # API服务层
│   ├── utils/              # 工具类
│   │   ├── api/            # API相关工具
│   │   ├── common/         # 通用工具
│   │   └── business/       # 业务逻辑工具
│   ├── config/             # 配置文件
│   ├── images/             # 图片资源
│   └── app.js              # 应用入口
│
├── scripts/                # 自动化脚本
├── docs/                   # 项目文档
├── logs/                   # 日志文件
└── config/                 # 环境配置
```

## 🚀 快速开始

### 环境要求

- Node.js >= 16.0.0
- MySQL >= 5.7
- 微信开发者工具
- PM2 (生产环境)

### 安装部署

1. **克隆项目**

   ```bash
   git clone https://github.com/zhangyu424/zhixiao.git
   cd zhixiao-platform
   ```

2. **后端部署**

   ```bash
   cd backend
   npm install
   cp .env.example .env  # 配置环境变量
   npm start
   ```

3. **前端部署**

   ```bash
   # 使用微信开发者工具打开frontend目录
   # 或运行开发工具脚本
   cd frontend
   npm install
   ```

4. **启动完整环境**
   ```bash
   # 一键启动前后端
   npm run start:dev
   ```

### 环境配置

主要配置文件：

- `backend/.env` - 后端环境变量
- `backend/src/config/index.js` - 服务器配置
- `frontend/config/` - 前端环境配置

## 📖 文档导航

- [API 接口文档](./API.md) - 完整的 API 接口说明
- [开发指南](./DEVELOPMENT.md) - 开发环境配置和开发规范
- [部署指南](./DEPLOYMENT.md) - 生产环境部署说明
- [架构设计](./ARCHITECTURE.md) - 技术架构和设计思路
- [用户手册](./USER_GUIDE.md) - 功能使用说明
- [更新日志](./CHANGELOG.md) - 版本更新记录
- [故障排除](./TROUBLESHOOTING.md) - 常见问题解决方案

## 🔗 相关链接

- **在线演示**: [Demo 地址](http://your-demo-url.com)
- **API 文档**: [http://localhost:3000/api](http://localhost:3000/api)
- **项目仓库**: [GitHub](https://github.com/zhangyu424/zhixiao)
- **问题反馈**: [Issues](https://github.com/zhangyu424/zhixiao/issues)

## 👥 团队

- **项目负责人**: 方九日 <moqiqingxuan@gmail.com>
- **开发团队**: 陕西师范大学学习分析团队
- **技术支持**: Learning Analytics Team

## 📄 许可证

本项目采用 MIT 许可证 - 查看 [LICENSE](../LICENSE) 文件了解详情。

---

> 📅 最后更新: 2025-08-21  
> 📧 联系我们: moqiqingxuan@gmail.com  
> 🏫 陕西师范大学

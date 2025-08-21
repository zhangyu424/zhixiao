# 📚 学习质效分析系统

[![Build Status](https://img.shields.io/badge/build-passing-brightgreen.svg)](https://github.com/your-repo/zhixiao)
[![API Progress](https://img.shields.io/badge/API%20Progress-95%25-brightgreen.svg)](./zhixiaodocs/API_TODO_LIST.md)
[![Documentation](https://img.shields.io/badge/zhixiaodocs-available-blue.svg)](./zhixiaodocs/INDEX.md)
[![Production Ready](https://img.shields.io/badge/Production-Ready-success.svg)](./deploy.sh)
[![Version](https://img.shields.io/badge/version-2.0.1-blue.svg)](./package.json)

> 为微信小程序提供学习时间记录、数据分析和用户管理的后端API服务

## 🎯 项目状态 (最新更新: 2025-08-20 08:58)

| 模块 | 进度 | 状态 | 说明 |
|------|------|------|------|
| 🔐 认证系统 | 100% | ✅ 生产就绪 | JWT认证、登录限制、权限控制 |
| 👤 用户管理 | 95% | ✅ 生产就绪 | 个人资料、权限管理 |
| 📖 学习记录 | 100% | ✅ 生产就绪 | 记录提交、历史查询、统计分析 |
| 📊 数据分析 | 90% | ✅ 可用 | 个人/团队统计、热力图、排名 |
| 🛠️ 管理功能 | 85% | ✅ 可用 | 用户管理、批量操作 |
| 📚 文档系统 | 100% | ✅ 完整 | 在线文档、搜索功能 |

**总体进度**: 95% | **版本**: 2.0.1 | **状态**: 🚀 生产就绪

## 🚀 快速开始

```bash
# 克隆项目
git clone <repository-url>
cd zhixiao

# 安装依赖
npm install

# 配置环境变量
cp .env.example .env
# 编辑 .env 文件配置数据库等信息

# 启动开发服务器
npm run dev

# 或使用PM2启动生产环境
npm start
```

## 📚 完整文档

**📋 [查看完整文档索引](./zhixiaodocs/INDEX.md)**

### 核心文档
- 📋 [开发计划](./zhixiaodocs/DEVELOPMENT_PLAN.md) - 项目规划和时间表
- 📝 [API清单](./zhixiaodocs/API_TODO_LIST.md) - 接口实现状态
- 🎯 [实现总结](./zhixiaodocs/API_IMPLEMENTATION_SUMMARY.md) - 最新进度报告
- 🔧 [生产环境评估](./zhixiaodocs/PRODUCTION_READINESS_ASSESSMENT.md) - 部署就绪状态
- 👥 [前端集成指南](./zhixiaodocs/FRONTEND_INTEGRATION_GUIDE.md) - 前端开发文档

## 🔗 快速链接

- **API文档**: `http://localhost:3000/api/` (开发环境)
- **生产环境**: `http://140.143.143.195/api/` 
- **健康检查**: `http://localhost:3000/health` | `http://140.143.143.195/health`
- **完整文档**: [`./zhixiaodocs/INDEX.md`](./zhixiaodocs/INDEX.md)

## 💡 技术支持

- **文档问题**: 查看 [文档索引](./zhixiaodocs/INDEX.md)
- **部署问题**: 参考 [生产环境文档](./zhixiaodocs/PRODUCTION_READINESS_ASSESSMENT.md)
- **前端集成**: 参考 [集成指南](./zhixiaodocs/FRONTEND_INTEGRATION_GUIDE.md)

---

## 🚀 核心功能

### 📊 数据分析
- 个人学习统计
- 团队数据对比
- 全局统计报告
- 热力图数据生成

### 📁 文件处理
- Excel批量导入
- 数据导出功能
- 模板文件下载
- 文件格式验证

### 👥 组织管理
- 用户角色管理
- 组织架构维护
- 权限分配控制
- 单位层级管理

## 技术架构

### 后端技术栈
- **Node.js** - 运行环境
- **Express.js** - Web框架
- **MySQL** - 数据库
- **JWT** - 身份认证
- **multer** - 文件上传
- **xlsx** - Excel处理

### 安全特性
- **helmet** - 安全头设置
- **cors** - 跨域资源共享
- **rate-limiter** - 访问频率限制
- **joi** - 输入验证
- **bcryptjs** - 密码加密

## API文档

### 基础信息
- **基础URL**: `http://localhost:3000/api` (开发) | `http://140.143.143.195/api` (生产)
- **认证方式**: Bearer Token (JWT)
- **数据格式**: JSON

### 接口分类

#### 🔐 认证接口 `/api/auth`
- `POST /login` - 用户登录
- `POST /refresh` - 刷新token
- `POST /logout` - 退出登录
- `POST /change-password` - 修改密码

#### 👤 用户接口 `/api/users`
- `GET /profile` - 获取个人信息
- `PUT /profile` - 更新个人信息
- `GET /roles` - 获取用户角色
- `GET /study-stats` - 用户学习统计

#### 📚 学习接口 `/api/study`
- `POST /submit` - 提交学习时间
- `GET /history` - 获取学习历史
- `GET /today` - 今日学习数据
- `GET /week` - 本周学习数据
- `GET /month` - 月度学习数据
- `GET /stats` - 学习统计
- `GET /heatmap` - 学习热力图

#### 📊 分析接口 `/api/analysis`
- `GET /personal` - 个人分析数据
- `GET /team` - 团队分析数据
- `GET /ranking` - 排名数据
- `GET /trends` - 趋势分析
- `GET /comparison` - 数据对比

#### 🛠️ 管理接口 `/api/admin`
- `GET /users` - 用户列表
- `POST /users` - 创建用户
- `POST /users/import` - 批量导入用户
- `GET /statistics` - 系统统计
- `GET /settings` - 系统设置
- `PUT /settings` - 更新系统设置
- `POST /announcements` - 发布公告

#### 📁 文档接口 `/api/docs`
- `GET /list` - 文档列表
- `GET /search` - 文档搜索

## 部署说明

### 生产环境信息
- **服务器**: 腾讯云轻量应用服务器
- **IP地址**: 140.143.143.195
- **Node.js**: 18.x
- **MySQL**: 8.0+
- **PM2**: 进程管理
- **部署时间**: 2025-08-20 08:58

### 环境变量配置
```bash
NODE_ENV=production
PORT=3000
DB_HOST=localhost
DB_USER=zhixiao_user
DB_PASSWORD=***
DB_NAME=zhixiao_db
JWT_SECRET=***
```

### PM2部署
```bash
npm install -g pm2
pm2 start ecosystem.config.js
pm2 save
pm2 startup
```

## 开发指南

### 目录结构
```
zhixiao/
├── src/
│   ├── controllers/     # 控制器
│   ├── models/         # 数据模型
│   ├── routes/         # 路由定义
│   ├── middleware/     # 中间件
│   ├── utils/          # 工具函数
│   └── config/         # 配置文件
├── uploads/            # 上传文件
├── logs/              # 日志文件
├── zhixiaodocs/       # 文档目录
├── database/          # 数据库脚本
├── test_api.sh        # API测试脚本
├── monitor.sh         # 监控脚本
├── manage.sh          # 管理脚本
├── deploy.sh          # 部署脚本
└── ecosystem.config.js # PM2配置
```

### 开发和运维命令

#### 🚀 基础运行
```bash
npm run dev          # 开发模式启动
npm run start        # 生产模式启动(PM2)
npm run stop         # 停止服务
npm run restart      # 重启服务
npm run logs         # 查看日志
```

#### 🧪 测试命令
```bash
npm run test         # 基础API测试
npm run test:quick   # 快速健康检查
npm run test:admin   # 管理员功能测试
npm run test:prod    # 生产环境测试
```

#### 🔧 运维命令
```bash
npm run monitor      # 系统监控检查
npm run manage       # 交互式服务管理
npm run deploy       # 部署更新
```

#### 📋 脚本文件说明
- `test_api.sh` - 统一API测试脚本，支持多种模式
- `test_admin_apis.sh` - 管理员功能专项测试
- `monitor.sh` - 系统健康监控
- `manage.sh` - 服务管理界面
- `deploy.sh` - 自动化部署
- `release.sh` - 版本发布

## 📚 生产环境快速开始

### 环境信息
- **服务器地址**: 140.143.143.195
- **API基础URL**: http://140.143.143.195/api
- **健康检查**: http://140.143.143.195/health

### 前端对接示例
```javascript
// 小程序配置
const config = {
  baseUrl: 'http://140.143.143.195/api',
  timeout: 10000
}

// API调用示例
wx.request({
  url: config.baseUrl + '/health',
  method: 'GET',
  success: (res) => {
    console.log('API服务正常:', res.data)
  }
})
```

详细对接指南请参考 [`zhixiaodocs/FRONTEND_INTEGRATION_GUIDE.md`](./zhixiaodocs/FRONTEND_INTEGRATION_GUIDE.md)

## 版本信息
- **当前版本**: v2.0.1 (2025-08-20 08:58)
- **脚本整理**: 精简测试脚本，统一运维工具
- **功能状态**: 生产就绪，95%功能完成
- **服务器**: 腾讯云 140.143.143.195
- **数据库**: MySQL 8.0 + Node.js 18

---
**📚 提示**: 完整文档请查看 [`zhixiaodocs/`](./zhixiaodocs/) 文件夹

© 2025 学习质效分析系统 保留所有权利

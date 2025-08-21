# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Planned
- 学习提醒功能
- 更多数据分析图表
- 移动端优化
- 缓存策略优化

# 更新日志

## [2.0.1] - 2025-08-20 08:58

### 🧹 精简优化
- **脚本整理**: 删除重复和冗余的测试脚本
  - 删除: `test_all_apis.sh`, `test_iteration2_apis.sh`, `test_p0_apis.sh`, `test_user_apis.sh`
  - 保留: `test_api.sh` (统一的API测试脚本) 和 `test_admin_apis.sh` (管理员专项测试)
- **功能合并**: 将所有API测试功能整合到一个主脚本中
- **命令行优化**: 支持多种测试模式 (`--quick`, `--admin`, `--help`)
- **脚本精简**: 简化管理员测试脚本，删除冗余代码
- **目录整理**: 移动 `release.sh` 到根目录，删除空的 `scripts` 目录

### 📚 文档更新
- **README重构**: 完全重写README.md，清除重复内容
- **信息同步**: 更新所有时间戳到 2025-08-20 08:58
- **版本统一**: 统一版本号为 2.0.1
- **链接更新**: 添加生产环境URL，更新API文档链接
- **状态更新**: 将项目状态更新为95%完成，生产就绪

### 📋 当前脚本清单
- `test_api.sh`: 统一API测试脚本 (支持基础、管理员、快速检查模式)
- `test_admin_apis.sh`: 管理员功能专项测试
- `monitor.sh`: 系统监控脚本
- `manage.sh`: 服务管理脚本
- `deploy.sh`: 部署脚本
- `release.sh`: 版本发布脚本

### 🚀 npm脚本更新
```bash
npm run test         # 基础API测试
npm run test:quick   # 快速健康检查
npm run test:admin   # 管理员功能测试
npm run test:prod    # 生产环境测试
npm run monitor      # 系统监控
npm run manage       # 服务管理
npm run deploy       # 部署更新
```

## [2.0.0] - 2025-08-20

### 🎉 Major Release - Production Ready

#### Added
- ✨ 完整的管理员用户管理系统
- ✨ 学习数据热力图功能 (`GET /api/study/heatmap`)
- ✨ 团队学习统计功能 (`GET /api/study/team/stats`)
- ✨ 在线文档系统 (`/api/docs/*`)
- ✨ 一键部署脚本 (`deploy.sh`)
- ✨ 全面的API测试脚本 (`test_api.sh`)

#### Fixed
- 🔧 **Critical**: 修复MySQL参数绑定导致的"Incorrect arguments"错误
- 🔧 **Critical**: 修复JWT token中用户ID映射问题 (userId vs id)
- 🔧 补充缺失的bcrypt和express-validator依赖
- 🔧 添加了缺失的validateRequest中间件函数

#### Changed
- 🗄️ 数据库表结构完善：添加status、force_password_change等字段
- 🗄️ 用户角色枚举更新：instructor → leader
- 🚀 PM2配置优化：切换为fork单实例模式
- 📋 API进度从42%提升到95%

#### Performance
- 📊 响应时间优化：0.5ms - 14ms
- 📊 内存使用稳定：~25MB (PM2单实例)
- 📊 数据库连接优化和错误处理

#### Testing
- 🧪 15+ API端点功能测试覆盖
- 🧪 认证和权限控制测试
- 🧪 错误处理和边界条件测试

## [1.2.0] - 2025-08-20

### Added
- 新增个人学习分析API (`GET /api/analysis/personal`)
- 新增学习趋势分析API (`GET /api/analysis/trends`)
- 新增团队分析功能 (`GET /api/analysis/team`)
- 新增排名统计API (`GET /api/analysis/ranking`)
- 新增数据对比分析 (`GET /api/analysis/comparison`)
- 新增学习热力图API (`GET /api/analysis/heatmap`)
- 新增月度学习数据统计 (`GET /api/study/month`)
- 完善的版本管理系统和API版本控制
- 发布流程自动化脚本

### Changed
- 优化Token刷新机制，增强安全性
- 增强用户登出功能，确保会话清理
- 改进错误处理和日志记录
- 更新项目文档结构，统一到`docs/`目录

### Fixed
- 修复分析路由导出问题
- 修复认证中间件的并发访问问题
- 改进数据库连接池管理

### Security
- 增强JWT token验证机制
- 加强API访问控制和权限验证
- 优化敏感数据处理

## [1.1.0] - 2025-08-20

### Added
- Token刷新API (`POST /api/auth/refresh`)
- 用户登出API (`POST /api/auth/logout`)
- 基础分析功能框架
- 用户权限管理优化

### Changed
- 优化用户认证流程
- 改进API响应格式统一性
- 更新错误处理机制

### Fixed
- 修复用户注册验证问题
- 解决学习记录查询性能问题

### Security
- 增强密码安全策略
- 优化会话管理机制

## [1.0.0] - 2025-08-19

### Added
- 用户认证系统 (注册、登录、个人信息)
- 学习记录管理 (CRUD操作)
- 基础统计功能
- 数据库架构和初始化
- API错误处理和验证中间件
- 生产环境配置和部署文档
- 基础的健康检查端点

### Security
- JWT认证机制
- 密码加密存储
- API访问频率限制
- 输入参数验证和清理

---

## 版本说明

### 版本号格式: MAJOR.MINOR.PATCH

- **MAJOR**: 不兼容的API修改
- **MINOR**: 向后兼容的功能新增
- **PATCH**: 向后兼容的问题修复

### 标签说明

- `Added`: 新功能
- `Changed`: 对现有功能的变更
- `Deprecated`: 即将移除的功能
- `Removed`: 已移除的功能
- `Fixed`: 问题修复
- `Security`: 安全相关的修复

### 链接

- [比较版本](../../compare)
- [发布页面](../../releases)
- [问题跟踪](../../issues)

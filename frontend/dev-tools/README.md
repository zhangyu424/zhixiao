# 🛠️ 开发工具集合

本目录包含专门用于开发过程中的工具，**仅供开发人员使用，不集成到前端生产代码中**。

## 📁 工具结构

```
dev-tools/
├── README.md                    # 本文档
├── doc-api-client/             # 文档API客户端工具
│   ├── client.js               # API客户端核心
│   ├── cli.js                  # 命令行工具
│   └── web-interface.html      # Web界面
├── api-tester/                 # API测试工具
│   ├── test-runner.js          # 测试执行器
│   └── test-cases.json         # 测试用例
├── doc-sync/                   # 文档同步工具
│   ├── sync.js                 # 同步脚本
│   └── config.json             # 配置文件
└── feedback-manager/           # 反馈管理工具
    ├── manager.js              # 反馈管理器
    └── dashboard.html          # 管理面板
```

## 🎯 工具功能

### 📚 文档API客户端 (doc-api-client)
- 获取和浏览技术文档
- 搜索文档内容
- 提交开发过程中的问题和需求
- Web界面方便查看

### 🧪 API测试工具 (api-tester)
- 自动测试文档API的各个端点
- 验证API响应格式
- 生成测试报告

### 🔄 文档同步工具 (doc-sync)
- 同步zhixiaodocs和docs目录
- 自动更新文档状态
- 检测文档变更

### 📊 反馈管理工具 (feedback-manager)
- 管理开发过程中的反馈
- 跟踪问题解决状态
- 生成反馈报告

## 🚀 快速开始

### 安装依赖
```bash
# 进入dev-tools目录
cd dev-tools

# 安装Node.js依赖（如果需要）
npm install
```

### 使用文档API客户端
```bash
# 命令行方式
node doc-api-client/cli.js list
node doc-api-client/cli.js get API_REQUIREMENTS
node doc-api-client/cli.js search "API"

# Web界面方式
# 打开 doc-api-client/web-interface.html
```

### 运行API测试
```bash
node api-tester/test-runner.js
```

### 同步文档
```bash
node doc-sync/sync.js
```

## ⚠️ 重要说明

1. **仅供开发使用**: 这些工具仅在开发过程中使用，不要集成到前端生产代码中
2. **API地址配置**: 需要配置正确的后端API地址
3. **认证配置**: 某些功能需要配置开发用的认证token
4. **权限要求**: 反馈管理功能需要管理员权限

## 🔧 配置说明

在使用前，请确保：
- 后端API服务正常运行
- 配置正确的API地址 (`http://140.143.143.195/api`)
- 如需要认证功能，配置开发用token

---

**🔨 开发工具版本**: v1.0.0  
**📅 创建时间**: 2025-08-20  
**👨‍💻 用途**: 仅供开发过程使用

# 开发工具说明

本目录包含学习质效分析微信小程序的开发辅助工具，**仅供开发过程使用**。

## 🔧 工具概览

- **doc-api-client/**: 文档API客户端，提供CLI和Web界面
- **api-tester/**: API自动化测试工具
- **doc-sync/**: 文档同步工具，支持实时监听

## 🚀 快速开始

```bash
# 安装依赖和设置
npm run setup

# 查看使用指南
npm run help
```

## 📖 详细使用说明

请查看 [USAGE_GUIDE.md](./USAGE_GUIDE.md) 了解完整的使用方法和配置说明。

## ⚠️ 重要提醒

这些工具仅供开发阶段使用，**不要集成到生产环境的前端代码中**！

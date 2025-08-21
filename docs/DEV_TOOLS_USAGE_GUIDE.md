# 学习质效分析微信小程序 - Dev Tools 使用说明

## 🛠️ dev-tools/ 完整开发工具集

> ⚠️ **重要提醒**: dev-tools/ 目录下的所有工具仅供开发过程使用，不要集成到生产环境的前端代码中！

---

## 📁 工具目录结构

```
dev-tools/
├── README.md                     # 本文档
├── doc-api-client/               # 文档API客户端
│   ├── client.js                 # Node.js API客户端
│   ├── cli.js                    # 命令行工具
│   └── web-interface.html        # Web界面
├── api-tester/                   # API测试工具
│   ├── test-runner.js            # 测试运行器
│   └── test-cases.json          # 测试用例配置
└── doc-sync/                     # 文档同步工具
    ├── sync.js                   # 同步脚本
    └── config.json              # 同步配置
```

---

## 🚀 快速开始

### 1. 安装依赖

```bash
# 在dev-tools目录下
cd dev-tools
npm init -y
npm install node-fetch chokidar
```

### 2. 配置API客户端

编辑 `doc-api-client/client.js` 和各配置文件，设置正确的API地址和认证信息。

### 3. 运行工具

```bash
# 文档API命令行工具
node doc-api-client/cli.js --help

# API测试
node api-tester/test-runner.js

# 文档同步
node doc-sync/sync.js sync
```

---

## 🔧 详细工具说明

### 📄 文档API客户端 (doc-api-client/)

**功能**: 与后端文档API进行交互，实现文档的增删改查

**文件说明**:
- `client.js`: 核心API客户端类，提供完整的文档API接口
- `cli.js`: 命令行工具，支持各种文档操作
- `web-interface.html`: Web界面，直观的文档管理

**使用示例**:
```bash
# 获取文档列表
node cli.js list

# 创建新文档
node cli.js create --title "API文档" --content "# API说明"

# 更新文档
node cli.js update --id 123 --title "更新的标题"

# 删除文档
node cli.js delete --id 123
```

**Web界面使用**:
1. 双击打开 `web-interface.html`
2. 配置API地址和认证信息
3. 使用图形界面管理文档

### 🧪 API测试工具 (api-tester/)

**功能**: 自动化测试文档API的各种场景

**文件说明**:
- `test-runner.js`: 测试运行器，执行所有测试用例
- `test-cases.json`: 测试用例配置，包含各种测试场景

**使用示例**:
```bash
# 运行所有测试
node test-runner.js

# 运行特定测试组
node test-runner.js --group auth

# 详细输出
node test-runner.js --verbose

# 生成测试报告
node test-runner.js --report
```

**测试用例管理**:
- 编辑 `test-cases.json` 添加新的测试场景
- 支持CRUD操作、权限验证、错误处理等测试
- 自动生成测试报告

### 🔄 文档同步工具 (doc-sync/)

**功能**: 同步zhixiaodocs和本地docs目录，保持文档一致性

**文件说明**:
- `sync.js`: 文档同步脚本，支持单次同步和监听模式
- `config.json`: 同步配置，定义同步规则和映射关系

**使用示例**:
```bash
# 单次同步
node sync.js sync

# 监听模式（自动同步）
node sync.js watch

# 查看帮助
node sync.js help
```

**功能特点**:
- 🔍 智能文件变更检测
- 💾 自动备份机制
- 📊 详细同步报告
- 👀 实时文件监听
- 🔐 文件完整性校验

---

## ⚙️ 配置说明

### API配置
在各工具的配置文件中设置:
- API基础地址
- 认证令牌
- 超时设置
- 重试配置

### 同步配置
在 `doc-sync/config.json` 中配置:
- 源目录和目标目录
- 文件映射关系
- 排除文件规则
- 备份设置

---

## 📊 工作流程建议

### 开发阶段
1. 使用 `doc-sync/` 保持文档同步
2. 使用 `doc-api-client/` 测试API接口
3. 使用 `api-tester/` 验证API功能

### 测试阶段
1. 运行完整的API测试套件
2. 验证文档同步的准确性
3. 检查Web界面的功能完整性

### 发布前
1. 确保所有测试通过
2. 同步最新的文档内容
3. 验证API对接的正确性

---

## 🔒 安全注意事项

1. **不要提交敏感配置**: 配置文件中的API密钥等敏感信息不要提交到版本控制
2. **仅开发使用**: 这些工具仅供开发阶段使用，不要集成到生产代码
3. **网络安全**: 确保API测试在安全的网络环境中进行
4. **数据备份**: 同步工具会自动备份，但建议手动备份重要文档

---

## 🐛 故障排除

### 常见问题

**API连接失败**:
- 检查网络连接
- 验证API地址配置
- 确认认证令牌有效

**文档同步失败**:
- 检查源目录和目标目录权限
- 验证文件路径配置
- 查看同步日志文件

**测试失败**:
- 检查测试配置
- 验证API接口状态
- 查看详细错误信息

### 日志文件
- API客户端日志: `doc-api-client/api.log`
- 测试报告: `api-tester/test-report-*.json`
- 同步日志: `doc-sync/sync.log`

---

## 📞 技术支持

如有问题或需要帮助，请:
1. 查看相关日志文件
2. 检查配置文件设置
3. 联系开发团队获取支持

---

## 🔄 版本更新

定期更新这些开发工具以适应API变更和功能增强:
```bash
# 更新依赖
npm update

# 同步最新配置
node doc-sync/sync.js sync
```

**记住**: 这些工具是你的开发助手，充分利用它们来提高开发效率和代码质量！ 🚀

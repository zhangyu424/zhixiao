# 🔧 Scripts 工具脚本目录

本目录包含项目开发和维护所需的各种自动化脚本。

## 📋 脚本列表

### API相关脚本
- **`api-check.bat/sh`** - API状态检查工具
  ```bash
  # Windows
  scripts\api-check.bat           # 快速检查
  scripts\api-check.bat detailed  # 详细检查
  
  # Linux/Mac
  bash scripts/api-check.sh           # 快速检查
  bash scripts/api-check.sh detailed  # 详细检查
  ```

- **`unified-backend-test.js`** - 统一后端测试工具 (整合了多个测试脚本)
  ```bash
  # 不同测试模式
  node scripts/unified-backend-test.js full    # 完整测试
  node scripts/unified-backend-test.js quick   # 快速测试
  node scripts/unified-backend-test.js status  # 状态总结
  node scripts/unified-backend-test.js sync    # 同步状态检查
  ```

### 代码质量脚本

本目录包含项目开发和维护所需的各种自动化脚本。

## � 脚本列表

### API相关脚本
- **`api-check.bat/sh`** - API状态检查工具
  ```bash
  # Windows
  scripts\api-check.bat           # 快速检查
  scripts\api-check.bat detailed  # 详细检查
  
  # Linux/Mac
  bash scripts/api-check.sh           # 快速检查
  bash scripts/api-check.sh detailed  # 详细检查
  ```

### 代码质量脚本
- **`quality-check.bat/sh`** - 代码质量检查工具
  ```bash
  # Windows
  scripts\quality-check.bat        # 完整检查
  scripts\quality-check.bat lint   # 仅ESLint检查
  scripts\quality-check.bat format # 仅格式检查
  
  # Linux/Mac
  bash scripts/quality-check.sh        # 完整检查
  bash scripts/quality-check.sh lint   # 仅ESLint检查
  bash scripts/quality-check.sh format # 仅格式检查
  ```

### 项目管理脚本
- **`organize-structure.bat`** - 项目结构整理工具
  ```bash
  # Windows
  scripts\organize-structure.bat
  ```

## 🎯 使用场景

### 日常开发
```bash
# 1. 检查API状态
npm run api-check

# 2. 快速后端测试
node scripts/unified-backend-test.js quick

# 3. 代码质量检查
npm run quality-check

# 4. 修复代码格式
npm run lint && npm run format
```

### 后端开发协调
```bash
# 1. 完整后端测试
node scripts/unified-backend-test.js full

# 2. 检查API同步状态
node scripts/unified-backend-test.js sync

# 3. 查看后端状态总结
node scripts/unified-backend-test.js status
```

### 提交前检查
```bash
# 运行完整的质量检查
npm run precommit
```

### 项目维护
```bash
# 整理项目结构
scripts\organize-structure.bat
```

## 📝 脚本功能详解

### API检查 (`api-check.*`)
- ✅ 检查后端服务状态
- ✅ 验证API接口可用性
- ✅ 测试认证机制
- ✅ 生成状态报告

### 统一后端测试 (`unified-backend-test.js`)
- ✅ 完整的后端API测试套件
- ✅ 快速连接性检查
- ✅ API同步状态验证
- ✅ 后端可用性状态总结
- ✅ 模块化测试模式选择

### 质量检查 (`quality-check.*`)
- ✅ ESLint代码规范检查
- ✅ Prettier代码格式检查
- ✅ 必要文件完整性检查
- ✅ 项目结构验证
- ✅ 依赖完整性检查

### 结构整理 (`organize-structure.*`)
- ✅ 创建标准目录结构
- ✅ 生成项目结构文档
- ✅ 确保目录规范性

## 🔄 脚本层次结构

```
快速日常检查: scripts/        (状态验证, 质量检查)
      ↓
开发深度测试: dev-tools/      (完整测试套件)
      ↓
前端集成检查: utils/          (小程序内检查)
```

## ⚡ 快捷命令

| 命令 | 功能 | 适用场景 |
|------|------|----------|
| `npm run api-check` | API快速检查 | 日常开发 |
| `node scripts/unified-backend-test.js quick` | 快速后端测试 | 开发调试 |
| `node scripts/unified-backend-test.js full` | 完整后端测试 | 部署验证 |
| `npm run quality-check` | 代码质量检查 | 提交前 |
| `npm run precommit` | 预提交检查 | Git提交前 |
| `npm run lint` | 修复代码规范 | 开发中 |
| `npm run format` | 格式化代码 | 开发中 |

## � 执行结果

所有脚本都提供清晰的执行结果：
- ✅ **成功**: 绿色提示，检查通过
- ❌ **失败**: 红色提示，需要处理
- ⚠️ **警告**: 黄色提示，建议优化

## 🛠️ 自定义扩展

如需添加新的脚本：

1. 创建对应的 `.bat` (Windows) 和 `.sh` (Linux/Mac) 文件
2. 在 `package.json` 中添加相应的 npm 脚本
3. 更新本 README 文档
4. 确保脚本具有适当的错误处理和用户友好的输出

---

**维护者**: 方九日 (moqiqingxuan@gmail.com) - 陕西师范大学  
**更新时间**: 2025-01-20

## 🔄 脚本整合说明

为提高维护效率，我们已将功能相似的脚本进行整合：

**整合前** → **整合后**
- `test-api-sync.js` → `unified-backend-test.js`
- `quick-backend-test.js` → `unified-backend-test.js` 
- `backend-status-summary.js` → `unified-backend-test.js`
- `check-sync-status.js` → `unified-backend-test.js`

新的 `unified-backend-test.js` 支持多种测试模式，功能更加强大且易于维护。

```
简单快速检查 → scripts/api-check.bat|sh
      ↓
统一后端测试 → scripts/unified-backend-test.js
      ↓
前端集成检查 → pages/backend-test/backend-test.js
```

**使用建议:**
1. **日常检查**: 使用 `scripts/api-check.bat|sh quick`
2. **快速测试**: 使用 `node scripts/unified-backend-test.js quick`
3. **完整验证**: 使用 `node scripts/unified-backend-test.js full`
4. **前端集成**: 使用 `pages/backend-test/backend-test.js`

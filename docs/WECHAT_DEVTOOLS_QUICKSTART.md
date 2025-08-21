# 🚀 微信小程序开发工具快速开始

## 📋 安装步骤

### 1. 运行自动安装脚本

```bash
cd /var/www/zhixiao-platform
bash scripts/setup-wechat-devtools.sh
```

这个脚本将自动：
- 检查系统依赖
- 安装微信开发者工具 Linux 版
- 配置 VS Code 扩展和设置
- 创建项目配置文件
- 生成启动脚本

### 2. 启动开发环境

```bash
# 方式一：使用启动脚本（推荐）
bash scripts/start-miniprogram-dev.sh

# 方式二：手动启动
wechat-devtools --project /var/www/zhixiao-platform/frontend
```

### 3. VS Code 集成使用

1. 打开 VS Code：`code /var/www/zhixiao-platform`
2. 按 `Ctrl+Shift+P` 打开命令面板
3. 输入 "Tasks: Run Task"
4. 选择需要的任务：
   - 启动微信开发者工具
   - CLI预览
   - CLI上传
   - 启动后端服务
   - 启动完整开发环境

## 🔧 配置文件说明

- `.vscode/settings.json` - VS Code 编辑器设置
- `.vscode/tasks.json` - VS Code 任务配置
- `frontend/.eslintrc.js` - ESLint 代码检查配置
- `frontend/.prettierrc` - Prettier 代码格式化配置
- `frontend/project.config.json` - 微信小程序项目配置

## 📱 开发流程

1. **编辑代码** - 在 VS Code 中编辑小程序代码
2. **实时预览** - 在微信开发者工具中查看效果
3. **调试测试** - 使用开发者工具的调试功能
4. **代码提交** - 提交到 Git 仓库
5. **发布上线** - 使用 CLI 工具上传代码

## 🛠️ 常用命令

```bash
# 启动开发环境
bash scripts/start-miniprogram-dev.sh

# CLI 预览
wechat-devtools-cli preview --project frontend

# CLI 上传
wechat-devtools-cli upload --project frontend -v 1.0.0 -d "版本描述"

# 检查更新
bash scripts/check-wechat-devtools-update.sh
```

## 📚 更多文档

详细配置和使用指南请参考：`docs/WECHAT_DEVTOOLS_SETUP.md`

---

如果遇到问题，请检查：
1. 系统是否满足要求（Linux + Docker）
2. 网络连接是否正常
3. 用户权限是否足够
4. 查看安装日志中的错误信息

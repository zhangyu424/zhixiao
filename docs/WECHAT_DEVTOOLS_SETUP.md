# 📱 微信小程序开发工具配置指南

## 🎯 概述

本指南将帮你在Linux环境下配置微信小程序开发工具，并与VS Code集成，提供完整的小程序开发环境。

## 🛠️ 环境要求

### 系统要求
- Linux桌面系统（推荐 GNOME 桌面环境）
- glibc >= 2.23
- libstdc++ >= 3.4.21
- Docker 和 Docker Compose（推荐安装方式）

### 必需工具
- Node.js (>= 14.x)
- npm 或 yarn
- Git
- Docker（推荐）

## 🚀 安装微信开发者工具

### 方法一：使用 Docker 构建（推荐）

```bash
# 1. 克隆项目
git clone --recurse-submodules https://github.com/msojocs/wechat-web-devtools-linux.git ~/wechat-devtools-linux

# 2. 进入项目目录
cd ~/wechat-devtools-linux

# 3. 使用 Docker 构建
./tools/build-with-docker.sh

# 4. 安装桌面图标（可选）
./tools/install-desktop-icon-node
```

### 方法二：直接下载 Release 版本

```bash
# 1. 下载最新版本
wget https://github.com/msojocs/wechat-web-devtools-linux/releases/latest/download/wechat_devtools_linux.tar.gz

# 2. 解压到指定目录
mkdir -p ~/wechat-devtools
tar -xzf wechat_devtools_linux.tar.gz -C ~/wechat-devtools

# 3. 创建启动脚本
echo '#!/bin/bash
cd ~/wechat-devtools
./bin/wechat-devtools' > ~/bin/wechat-devtools
chmod +x ~/bin/wechat-devtools
```

## 🔧 VS Code 集成配置

### 安装必要的 VS Code 扩展

```bash
# 微信小程序开发扩展
code --install-extension wechat-miniprogram.wxmlconfig

# JavaScript/TypeScript 支持
code --install-extension ms-vscode.vscode-typescript-next

# 代码格式化
code --install-extension esbenp.prettier-vscode

# 代码检查
code --install-extension dbaeumer.vscode-eslint

# Git 支持增强
code --install-extension eamodio.gitlens

# 文件图标主题
code --install-extension vscode-icons-team.vscode-icons
```

### VS Code 工作区配置

创建 `.vscode/settings.json`：

```json
{
  "editor.tabSize": 2,
  "editor.insertSpaces": true,
  "editor.detectIndentation": false,
  "editor.formatOnSave": true,
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": true
  },
  "files.associations": {
    "*.wxml": "html",
    "*.wxss": "css",
    "*.wxs": "javascript"
  },
  "emmet.includeLanguages": {
    "wxml": "html"
  },
  "minapp-vscode.disableAutoConfig": true,
  "minapp-vscode.wxmlFormatter": "prettier",
  "minapp-vscode.prettier": {
    "parser": "html",
    "printWidth": 100,
    "tabWidth": 2,
    "useTabs": false,
    "semi": true,
    "singleQuote": true,
    "trailingComma": "none"
  }
}
```

### 任务配置

创建 `.vscode/tasks.json`：

```json
{
  "version": "2.0.0",
  "tasks": [
    {
      "label": "启动微信开发者工具",
      "type": "shell",
      "command": "wechat-devtools",
      "args": ["--project", "${workspaceFolder}/frontend"],
      "group": "build",
      "presentation": {
        "echo": true,
        "reveal": "always",
        "focus": false,
        "panel": "new"
      },
      "problemMatcher": []
    },
    {
      "label": "CLI预览",
      "type": "shell",
      "command": "wechat-devtools-cli",
      "args": ["preview", "--project", "${workspaceFolder}/frontend"],
      "group": "build",
      "presentation": {
        "echo": true,
        "reveal": "always",
        "focus": false,
        "panel": "new"
      },
      "problemMatcher": []
    },
    {
      "label": "CLI上传",
      "type": "shell",
      "command": "wechat-devtools-cli",
      "args": ["upload", "--project", "${workspaceFolder}/frontend", "-v", "1.0.0", "-d", "自动构建上传"],
      "group": "build",
      "presentation": {
        "echo": true,
        "reveal": "always",
        "focus": false,
        "panel": "new"
      },
      "problemMatcher": []
    }
  ]
}
```

## 📝 项目配置优化

### 更新 project.config.json

```json
{
  "setting": {
    "es6": true,
    "postcss": true,
    "minified": true,
    "uglifyFileName": false,
    "enhance": true,
    "packNpmRelationList": [],
    "babelSetting": {
      "ignore": [],
      "disablePlugins": [],
      "outputPath": ""
    },
    "useCompilerPlugins": false,
    "minifyWXML": true,
    "compileWorklet": false,
    "uploadWithSourceMap": true,
    "packNpmManually": false,
    "minifyWXSS": true,
    "localPlugins": false,
    "disableUseStrict": false,
    "condition": false,
    "swc": false,
    "disableSWC": true
  },
  "compileType": "miniprogram",
  "simulatorPluginLibVersion": {},
  "packOptions": {
    "ignore": [
      "*.md",
      "*.txt",
      "node_modules/**/*",
      ".git/**/*",
      ".vscode/**/*",
      "tests/**/*"
    ],
    "include": []
  },
  "appid": "wx13e6fdf682f6d772",
  "projectname": "智效平台",
  "editorSetting": {
    "tabIndent": "insertSpaces",
    "tabSize": 2
  },
  "libVersion": "3.9.1",
  "scripts": {
    "beforeCompile": "",
    "beforePreview": "",
    "beforeUpload": ""
  }
}
```

### ESLint 配置

创建 `frontend/.eslintrc.js`：

```javascript
module.exports = {
  env: {
    browser: true,
    es6: true,
    node: true
  },
  extends: [
    'eslint:recommended'
  ],
  globals: {
    wx: 'readonly',
    App: 'readonly',
    Page: 'readonly',
    Component: 'readonly',
    getApp: 'readonly',
    getCurrentPages: 'readonly'
  },
  parserOptions: {
    ecmaVersion: 2018,
    sourceType: 'module'
  },
  rules: {
    'indent': ['error', 2],
    'linebreak-style': ['error', 'unix'],
    'quotes': ['error', 'single'],
    'semi': ['error', 'always'],
    'no-console': 'warn',
    'no-unused-vars': 'warn'
  }
};
```

### Prettier 配置

创建 `frontend/.prettierrc`：

```json
{
  "printWidth": 100,
  "tabWidth": 2,
  "useTabs": false,
  "semi": true,
  "singleQuote": true,
  "quoteProps": "as-needed",
  "trailingComma": "none",
  "bracketSpacing": true,
  "bracketSameLine": false,
  "arrowParens": "avoid",
  "endOfLine": "lf"
}
```

## 🚀 启动和使用

### 方式一：图形界面启动

```bash
# 直接启动微信开发者工具
wechat-devtools

# 或者从应用菜单启动
```

### 方式二：命令行启动

```bash
# 启动并打开项目
wechat-devtools --project /var/www/zhixiao-platform/frontend

# 使用 CLI 工具
wechat-devtools-cli --help
```

### 方式三：VS Code 集成

1. 在 VS Code 中打开项目
2. 按 `Ctrl+Shift+P` 打开命令面板
3. 输入 "Tasks: Run Task"
4. 选择 "启动微信开发者工具"

## 🔍 开发工作流

### 1. 日常开发

```bash
# 1. 启动后端服务
cd /var/www/zhixiao-platform/backend
npm start

# 2. 启动微信开发者工具
wechat-devtools --project /var/www/zhixiao-platform/frontend

# 3. 在 VS Code 中编辑代码
code /var/www/zhixiao-platform
```

### 2. 预览和调试

```bash
# CLI 预览
wechat-devtools-cli preview --project /var/www/zhixiao-platform/frontend

# CLI 上传
wechat-devtools-cli upload --project /var/www/zhixiao-platform/frontend -v 1.0.0 -d "版本描述"
```

### 3. 自动化脚本

创建 `scripts/start-miniprogram-dev.sh`：

```bash
#!/bin/bash

echo "🚀 启动微信小程序开发环境..."

# 检查微信开发者工具是否安装
if ! command -v wechat-devtools &> /dev/null; then
    echo "❌ 微信开发者工具未安装，请先安装"
    exit 1
fi

# 启动后端服务
echo "📡 启动后端服务..."
cd /var/www/zhixiao-platform/backend
npm start &
BACKEND_PID=$!

# 等待后端启动
sleep 3

# 启动微信开发者工具
echo "📱 启动微信开发者工具..."
wechat-devtools --project /var/www/zhixiao-platform/frontend &
DEVTOOLS_PID=$!

# 打开 VS Code
echo "💻 打开 VS Code..."
code /var/www/zhixiao-platform

echo "✅ 开发环境启动完成!"
echo "后端服务 PID: $BACKEND_PID"
echo "开发者工具 PID: $DEVTOOLS_PID"

# 等待用户输入来停止服务
read -p "按 Enter 键停止所有服务..."

# 清理进程
kill $BACKEND_PID $DEVTOOLS_PID 2>/dev/null
echo "🛑 服务已停止"
```

## 🐛 常见问题解决

### 1. 启动失败

```bash
# 检查依赖
ldd ~/wechat-devtools/bin/wechat-devtools

# 安装缺失的依赖
sudo apt update
sudo apt install libnss3 libatk-bridge2.0-0 libdrm2 libgtk-3-0
```

### 2. 字体显示问题

```bash
# 安装中文字体
sudo apt install fonts-wqy-zenhei fonts-wqy-microhei
```

### 3. CLI 工具不可用

```bash
# 添加到 PATH
echo 'export PATH="$HOME/wechat-devtools/bin:$PATH"' >> ~/.bashrc
source ~/.bashrc
```

## 📚 参考资源

- [微信小程序官方文档](https://developers.weixin.qq.com/miniprogram/dev/framework/)
- [微信开发者工具 CLI](https://developers.weixin.qq.com/miniprogram/dev/devtools/cli.html)
- [项目 GitHub 地址](https://github.com/msojocs/wechat-web-devtools-linux)

## 🔄 更新维护

### 更新开发者工具

```bash
cd ~/wechat-devtools-linux
git pull
./tools/build-with-docker.sh
```

### 配置自动更新检查

```bash
# 创建更新检查脚本
cat > ~/bin/check-wechat-devtools-update.sh << 'EOF'
#!/bin/bash
REPO="msojocs/wechat-web-devtools-linux"
CURRENT_VERSION=$(cat ~/wechat-devtools/version.txt 2>/dev/null || echo "unknown")
LATEST_VERSION=$(curl -s "https://api.github.com/repos/$REPO/releases/latest" | grep '"tag_name"' | cut -d'"' -f4)

if [ "$CURRENT_VERSION" != "$LATEST_VERSION" ]; then
    echo "新版本可用: $LATEST_VERSION (当前: $CURRENT_VERSION)"
    echo "运行以下命令更新:"
    echo "cd ~/wechat-devtools-linux && git pull && ./tools/build-with-docker.sh"
else
    echo "已是最新版本: $CURRENT_VERSION"
fi
EOF

chmod +x ~/bin/check-wechat-devtools-update.sh
```

---

**建立时间**: 2025-08-20  
**适用版本**: 微信开发者工具 v1.06.2504010+  
**维护方式**: 定期更新，跟进官方版本

#!/bin/bash

# 微信小程序开发工具自动安装配置脚本
# 适用于 Linux 系统

set -e

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 输出函数
log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# 检查系统要求
check_system_requirements() {
    log_info "检查系统要求..."
    
    # 检查操作系统
    if [[ "$OSTYPE" != "linux-gnu"* ]]; then
        log_error "此脚本仅支持 Linux 系统"
        exit 1
    fi
    
    # 检查必需命令
    local required_commands=("git" "curl" "tar" "docker")
    for cmd in "${required_commands[@]}"; do
        if ! command -v "$cmd" &> /dev/null; then
            log_error "缺少必需命令: $cmd"
            echo "请先安装: sudo apt install $cmd"
            exit 1
        fi
    done
    
    # 检查 Docker 是否运行
    if ! sudo docker info &> /dev/null; then
        log_error "Docker 服务未运行，请启动 Docker"
        echo "运行: sudo systemctl start docker"
        exit 1
    fi
    
    # 检查用户是否在 docker 组中
    if ! groups | grep -q docker; then
        log_warning "用户未在 docker 组中，将使用 sudo 运行 Docker 命令"
        log_info "建议运行: sudo usermod -aG docker \$USER && newgrp docker"
    fi
    
    log_success "系统要求检查通过"
}

# 安装 VS Code 扩展
install_vscode_extensions() {
    log_info "安装 VS Code 扩展..."
    
    if ! command -v code &> /dev/null; then
        log_warning "VS Code 未安装，跳过扩展安装"
        return
    fi
    
    local extensions=(
        "wechat-miniprogram.wxmlconfig"
        "ms-vscode.vscode-typescript-next"
        "esbenp.prettier-vscode"
        "dbaeumer.vscode-eslint"
        "eamodio.gitlens"
        "vscode-icons-team.vscode-icons"
    )
    
    for ext in "${extensions[@]}"; do
        log_info "安装扩展: $ext"
        code --install-extension "$ext" --force
    done
    
    log_success "VS Code 扩展安装完成"
}

# 下载并安装微信开发者工具
install_wechat_devtools() {
    log_info "安装微信开发者工具..."
    
    local install_dir="$HOME/wechat-devtools-linux"
    local bin_dir="$HOME/bin"
    
    # 创建目录
    mkdir -p "$bin_dir"
    
    # 克隆项目
    if [ -d "$install_dir" ]; then
        log_info "更新现有项目..."
        cd "$install_dir"
        git pull
    else
        log_info "克隆项目（使用 GitHub 镜像加速）..."
        # 尝试使用 GitHub 镜像源
        if git clone --recurse-submodules https://github.com.cnpmjs.org/msojocs/wechat-web-devtools-linux.git "$install_dir" 2>/dev/null; then
            log_success "使用镜像源克隆成功"
        elif git clone --recurse-submodules https://hub.fastgit.xyz/msojocs/wechat-web-devtools-linux.git "$install_dir" 2>/dev/null; then
            log_success "使用 FastGit 镜像克隆成功"
        else
            log_info "镜像源失败，使用原始 GitHub 源..."
            git clone --recurse-submodules https://github.com/msojocs/wechat-web-devtools-linux.git "$install_dir"
        fi
        cd "$install_dir"
    fi
    
    # 使用 Docker 构建
    log_info "开始构建（这可能需要较长时间）..."
    if groups | grep -q docker; then
        ./tools/build-with-docker.sh
    else
        sudo -E ./tools/build-with-docker.sh
    fi
    
    # 安装桌面图标
    if [ -f "./tools/install-desktop-icon-node" ]; then
        log_info "安装桌面图标..."
        ./tools/install-desktop-icon-node
    fi
    
    # 创建命令行快捷方式
    log_info "创建命令行快捷方式..."
    cat > "$bin_dir/wechat-devtools" << EOF
#!/bin/bash
cd "$install_dir"
./bin/wechat-devtools "\$@"
EOF
    chmod +x "$bin_dir/wechat-devtools"
    
    if [ -f "$install_dir/bin/wechat-devtools-cli" ]; then
        cat > "$bin_dir/wechat-devtools-cli" << EOF
#!/bin/bash
cd "$install_dir"
./bin/wechat-devtools-cli "\$@"
EOF
        chmod +x "$bin_dir/wechat-devtools-cli"
    fi
    
    # 添加到 PATH
    if ! echo "$PATH" | grep -q "$bin_dir"; then
        echo "export PATH=\"$bin_dir:\$PATH\"" >> "$HOME/.bashrc"
        log_info "已添加到 PATH，请重启终端或运行: source ~/.bashrc"
    fi
    
    log_success "微信开发者工具安装完成"
}

# 配置项目
configure_project() {
    log_info "配置项目..."
    
    local project_root="/var/www/zhixiao-platform"
    local frontend_dir="$project_root/frontend"
    local vscode_dir="$project_root/.vscode"
    
    # 检查项目目录
    if [ ! -d "$frontend_dir" ]; then
        log_error "前端项目目录不存在: $frontend_dir"
        return 1
    fi
    
    # 创建 .vscode 目录
    mkdir -p "$vscode_dir"
    
    # 创建 VS Code 设置
    cat > "$vscode_dir/settings.json" << 'EOF'
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
EOF
    
    # 创建任务配置
    cat > "$vscode_dir/tasks.json" << 'EOF'
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
    },
    {
      "label": "启动后端服务",
      "type": "shell",
      "command": "npm",
      "args": ["start"],
      "options": {
        "cwd": "${workspaceFolder}/backend"
      },
      "group": "build",
      "isBackground": true,
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
EOF
    
    # 配置前端项目
    configure_frontend_project "$frontend_dir"
    
    log_success "项目配置完成"
}

# 配置前端项目
configure_frontend_project() {
    local frontend_dir="$1"
    
    # 创建 ESLint 配置
    cat > "$frontend_dir/.eslintrc.js" << 'EOF'
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
EOF
    
    # 创建 Prettier 配置
    cat > "$frontend_dir/.prettierrc" << 'EOF'
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
EOF
    
    log_success "前端项目配置完成"
}

# 创建启动脚本
create_startup_scripts() {
    log_info "创建启动脚本..."
    
    local scripts_dir="/var/www/zhixiao-platform/scripts"
    mkdir -p "$scripts_dir"
    
    # 创建开发环境启动脚本
    cat > "$scripts_dir/start-miniprogram-dev.sh" << 'EOF'
#!/bin/bash

echo "🚀 启动微信小程序开发环境..."

PROJECT_ROOT="/var/www/zhixiao-platform"
FRONTEND_DIR="$PROJECT_ROOT/frontend"
BACKEND_DIR="$PROJECT_ROOT/backend"

# 检查微信开发者工具是否安装
if ! command -v wechat-devtools &> /dev/null; then
    echo "❌ 微信开发者工具未安装，请先运行安装脚本"
    exit 1
fi

# 检查项目目录
if [ ! -d "$FRONTEND_DIR" ]; then
    echo "❌ 前端项目目录不存在: $FRONTEND_DIR"
    exit 1
fi

if [ ! -d "$BACKEND_DIR" ]; then
    echo "❌ 后端项目目录不存在: $BACKEND_DIR"
    exit 1
fi

# 启动后端服务
echo "📡 启动后端服务..."
cd "$BACKEND_DIR"
if [ -f "package.json" ]; then
    npm start &
    BACKEND_PID=$!
    echo "后端服务 PID: $BACKEND_PID"
else
    echo "⚠️  未找到后端 package.json，跳过后端启动"
fi

# 等待后端启动
sleep 3

# 启动微信开发者工具
echo "📱 启动微信开发者工具..."
wechat-devtools --project "$FRONTEND_DIR" &
DEVTOOLS_PID=$!

# 打开 VS Code
echo "💻 打开 VS Code..."
code "$PROJECT_ROOT" &

echo "✅ 开发环境启动完成!"
if [ ! -z "$BACKEND_PID" ]; then
    echo "后端服务 PID: $BACKEND_PID"
fi
echo "开发者工具 PID: $DEVTOOLS_PID"

# 等待用户输入来停止服务
read -p "按 Enter 键停止所有服务..."

# 清理进程
if [ ! -z "$BACKEND_PID" ]; then
    kill $BACKEND_PID 2>/dev/null || true
fi
kill $DEVTOOLS_PID 2>/dev/null || true
echo "🛑 服务已停止"
EOF
    chmod +x "$scripts_dir/start-miniprogram-dev.sh"
    
    # 创建更新检查脚本
    cat > "$scripts_dir/check-wechat-devtools-update.sh" << 'EOF'
#!/bin/bash

REPO="msojocs/wechat-web-devtools-linux"
INSTALL_DIR="$HOME/wechat-devtools-linux"

if [ ! -d "$INSTALL_DIR" ]; then
    echo "❌ 微信开发者工具未安装"
    exit 1
fi

CURRENT_VERSION=$(cat "$INSTALL_DIR/version.txt" 2>/dev/null || echo "unknown")
LATEST_VERSION=$(curl -s "https://api.github.com/repos/$REPO/releases/latest" | grep '"tag_name"' | cut -d'"' -f4)

if [ "$CURRENT_VERSION" != "$LATEST_VERSION" ]; then
    echo "🆕 新版本可用: $LATEST_VERSION (当前: $CURRENT_VERSION)"
    echo "运行以下命令更新:"
    echo "cd $INSTALL_DIR && git pull && ./tools/build-with-docker.sh"
else
    echo "✅ 已是最新版本: $CURRENT_VERSION"
fi
EOF
    chmod +x "$scripts_dir/check-wechat-devtools-update.sh"
    
    log_success "启动脚本创建完成"
}

# 测试安装
test_installation() {
    log_info "测试安装..."
    
    # 测试命令是否可用
    if command -v wechat-devtools &> /dev/null; then
        log_success "wechat-devtools 命令可用"
    else
        log_error "wechat-devtools 命令不可用"
        return 1
    fi
    
    if command -v wechat-devtools-cli &> /dev/null; then
        log_success "wechat-devtools-cli 命令可用"
    else
        log_warning "wechat-devtools-cli 命令不可用（可能是构建问题）"
    fi
    
    # 测试项目配置
    local project_root="/var/www/zhixiao-platform"
    if [ -f "$project_root/.vscode/settings.json" ]; then
        log_success "VS Code 配置文件存在"
    else
        log_error "VS Code 配置文件不存在"
        return 1
    fi
    
    if [ -f "$project_root/scripts/start-miniprogram-dev.sh" ]; then
        log_success "启动脚本存在"
    else
        log_error "启动脚本不存在"
        return 1
    fi
    
    log_success "安装测试通过"
}

# 显示使用说明
show_usage_info() {
    log_success "🎉 微信小程序开发工具配置完成！"
    echo
    echo "📋 使用方法："
    echo "1. 启动完整开发环境："
    echo "   bash /var/www/zhixiao-platform/scripts/start-miniprogram-dev.sh"
    echo
    echo "2. 单独启动微信开发者工具："
    echo "   wechat-devtools --project /var/www/zhixiao-platform/frontend"
    echo
    echo "3. 使用 CLI 工具："
    echo "   wechat-devtools-cli preview --project /var/www/zhixiao-platform/frontend"
    echo
    echo "4. 在 VS Code 中："
    echo "   - 打开项目: code /var/www/zhixiao-platform"
    echo "   - 按 Ctrl+Shift+P，输入 'Tasks: Run Task'"
    echo "   - 选择相应的任务"
    echo
    echo "5. 检查更新："
    echo "   bash /var/www/zhixiao-platform/scripts/check-wechat-devtools-update.sh"
    echo
    echo "📚 文档："
    echo "   /var/www/zhixiao-platform/docs/WECHAT_DEVTOOLS_SETUP.md"
    echo
}

# 主函数
main() {
    echo "🚀 微信小程序开发工具自动配置脚本"
    echo "=================================="
    echo
    
    check_system_requirements
    install_vscode_extensions
    install_wechat_devtools
    configure_project
    create_startup_scripts
    test_installation
    show_usage_info
    
    log_success "🎉 所有配置完成！"
}

# 脚本入口
if [[ "${BASH_SOURCE[0]}" == "${0}" ]]; then
    main "$@"
fi

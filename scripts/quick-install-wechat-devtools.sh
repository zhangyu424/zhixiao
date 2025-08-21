#!/bin/bash

# 微信小程序开发工具快速安装脚本（Release 版本）

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

echo "🚀 微信小程序开发工具快速安装（Release版本）"
echo "=============================================="

# 检查必需命令
log_info "检查系统要求..."
if ! command -v curl &> /dev/null; then
    log_error "缺少 curl 命令，请先安装: sudo apt install curl"
    exit 1
fi

if ! command -v tar &> /dev/null; then
    log_error "缺少 tar 命令，请先安装: sudo apt install tar"
    exit 1
fi

# 设置变量
INSTALL_DIR="$HOME/wechat-devtools"
BIN_DIR="$HOME/bin"
REPO="msojocs/wechat-web-devtools-linux"

# 创建目录
mkdir -p "$BIN_DIR" "$INSTALL_DIR"

# 获取最新版本
log_info "获取最新版本信息..."
LATEST_VERSION=$(curl -s "https://api.github.com/repos/$REPO/releases/latest" | grep '"tag_name"' | cut -d'"' -f4)

if [ -z "$LATEST_VERSION" ]; then
    log_error "无法获取最新版本信息"
    exit 1
fi

log_info "最新版本: $LATEST_VERSION"

# 构建下载链接
DOWNLOAD_URL="https://github.com/$REPO/releases/download/$LATEST_VERSION/wechat_devtools_linux.tar.gz"

# 检查文件是否存在（Release 可能没有预编译包）
if ! curl -s --head "$DOWNLOAD_URL" | head -n 1 | grep -q "200 OK"; then
    log_warning "预编译包不存在，将使用源码编译方式"
    log_info "运行完整安装脚本..."
    exec bash /var/www/zhixiao-platform/scripts/setup-wechat-devtools.sh
fi

# 下载文件
log_info "下载微信开发者工具..."
cd "$INSTALL_DIR"
curl -L -o wechat_devtools_linux.tar.gz "$DOWNLOAD_URL"

# 解压文件
log_info "解压文件..."
tar -xzf wechat_devtools_linux.tar.gz
rm wechat_devtools_linux.tar.gz

# 创建启动脚本
log_info "创建启动脚本..."
cat > "$BIN_DIR/wechat-devtools" << EOF
#!/bin/bash
cd "$INSTALL_DIR"
./bin/wechat-devtools "\$@"
EOF
chmod +x "$BIN_DIR/wechat-devtools"

if [ -f "$INSTALL_DIR/bin/wechat-devtools-cli" ]; then
    cat > "$BIN_DIR/wechat-devtools-cli" << EOF
#!/bin/bash
cd "$INSTALL_DIR"
./bin/wechat-devtools-cli "\$@"
EOF
    chmod +x "$BIN_DIR/wechat-devtools-cli"
fi

# 添加到 PATH
if ! echo "$PATH" | grep -q "$BIN_DIR"; then
    echo "export PATH=\"$BIN_DIR:\$PATH\"" >> "$HOME/.bashrc"
    log_info "已添加到 PATH，请重启终端或运行: source ~/.bashrc"
fi

# 安装桌面图标（可选）
log_info "创建桌面快捷方式..."
DESKTOP_FILE="$HOME/.local/share/applications/wechat-devtools.desktop"
mkdir -p "$(dirname "$DESKTOP_FILE")"
cat > "$DESKTOP_FILE" << EOF
[Desktop Entry]
Name=微信开发者工具
Comment=微信小程序开发工具
Exec=$BIN_DIR/wechat-devtools
Icon=$INSTALL_DIR/res/icons/icon.png
Terminal=false
Type=Application
Categories=Development;IDE;
EOF

log_success "✅ 微信开发者工具安装完成！"
echo ""
echo "📋 使用方法："
echo "1. 启动工具: wechat-devtools"
echo "2. 打开项目: wechat-devtools --project /var/www/zhixiao-platform/frontend"
echo "3. CLI 工具: wechat-devtools-cli --help"
echo ""
echo "💡 提示: 如果命令不可用，请运行: source ~/.bashrc"

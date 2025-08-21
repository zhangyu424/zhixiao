#!/bin/bash

# 微信开发者工具更新检查脚本

# 颜色定义
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

REPO="msojocs/wechat-web-devtools-linux"
INSTALL_DIR="$HOME/wechat-devtools-linux"

echo "🔍 检查微信开发者工具更新..."

# 检查安装目录
if [ ! -d "$INSTALL_DIR" ]; then
    echo -e "${RED}❌ 微信开发者工具未安装${NC}"
    echo "请先运行安装脚本: bash /var/www/zhixiao-platform/scripts/setup-wechat-devtools.sh"
    exit 1
fi

# 获取当前版本
CURRENT_VERSION="unknown"
if [ -f "$INSTALL_DIR/version.txt" ]; then
    CURRENT_VERSION=$(cat "$INSTALL_DIR/version.txt")
elif [ -d "$INSTALL_DIR/.git" ]; then
    cd "$INSTALL_DIR"
    CURRENT_VERSION=$(git describe --tags --abbrev=0 2>/dev/null || echo "unknown")
fi

# 获取最新版本
echo "📡 获取最新版本信息..."
LATEST_VERSION=$(curl -s "https://api.github.com/repos/$REPO/releases/latest" | grep '"tag_name"' | cut -d'"' -f4)

if [ -z "$LATEST_VERSION" ]; then
    echo -e "${RED}❌ 无法获取最新版本信息，请检查网络连接${NC}"
    exit 1
fi

echo "📦 当前版本: $CURRENT_VERSION"
echo "🆕 最新版本: $LATEST_VERSION"

# 比较版本
if [ "$CURRENT_VERSION" != "$LATEST_VERSION" ]; then
    echo -e "${YELLOW}🆙 新版本可用!${NC}"
    echo ""
    echo "更新方法："
    echo "1. 手动更新:"
    echo "   cd $INSTALL_DIR"
    echo "   git pull"
    echo "   ./tools/build-with-docker.sh"
    echo ""
    echo "2. 重新运行安装脚本:"
    echo "   bash /var/www/zhixiao-platform/scripts/setup-wechat-devtools.sh"
    echo ""
    
    read -p "是否现在更新? (y/N): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        echo "🔄 开始更新..."
        cd "$INSTALL_DIR"
        git pull
        if [ $? -eq 0 ]; then
            echo "📦 重新构建..."
            ./tools/build-with-docker.sh
            if [ $? -eq 0 ]; then
                echo -e "${GREEN}✅ 更新完成!${NC}"
            else
                echo -e "${RED}❌ 构建失败${NC}"
                exit 1
            fi
        else
            echo -e "${RED}❌ 更新失败${NC}"
            exit 1
        fi
    fi
else
    echo -e "${GREEN}✅ 已是最新版本${NC}"
fi

echo ""
echo "📊 安装信息:"
echo "   安装目录: $INSTALL_DIR"
echo "   当前版本: $CURRENT_VERSION"
echo "   项目地址: https://github.com/$REPO"

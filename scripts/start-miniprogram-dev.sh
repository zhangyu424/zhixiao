#!/bin/bash

echo "🚀 启动微信小程序开发环境..."

PROJECT_ROOT="/var/www/zhixiao-platform"
FRONTEND_DIR="$PROJECT_ROOT/frontend"
BACKEND_DIR="$PROJECT_ROOT/backend"

# 检查微信开发者工具是否安装
if ! command -v wechat-devtools &> /dev/null; then
    echo "❌ 微信开发者工具未安装，请先运行安装脚本"
    echo "运行: bash $PROJECT_ROOT/scripts/setup-wechat-devtools.sh"
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

echo ""
echo "📋 可用的操作："
echo "1. 在微信开发者工具中进行调试"
echo "2. 在 VS Code 中编辑代码"
echo "3. 使用 CLI 工具:"
echo "   - 预览: wechat-devtools-cli preview --project $FRONTEND_DIR"
echo "   - 上传: wechat-devtools-cli upload --project $FRONTEND_DIR -v 1.0.0"
echo ""

# 等待用户输入来停止服务
read -p "按 Enter 键停止所有服务..."

# 清理进程
if [ ! -z "$BACKEND_PID" ]; then
    kill $BACKEND_PID 2>/dev/null || true
    echo "🛑 后端服务已停止"
fi
kill $DEVTOOLS_PID 2>/dev/null || true
echo "🛑 开发者工具已停止"
echo "📱 开发环境已关闭"

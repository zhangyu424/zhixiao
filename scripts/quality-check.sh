#!/bin/bash
# 代码质量检查脚本 (Linux/Mac版)
# 用于检查代码格式、语法和质量

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 检查参数
CHECK_TYPE=${1:-"all"}

echo ""
echo "========================================"
echo "   学习质效分析小程序 - 代码质量检查"
echo "========================================"
echo ""

# 初始化错误标志
HAS_ERROR=0

# 检查Node.js环境
echo -e "${BLUE}[1/6]${NC} 检查Node.js环境..."
if ! command -v node &> /dev/null; then
    echo -e "${RED}❌ Node.js未安装或不在PATH中${NC}"
    echo "   请安装Node.js: https://nodejs.org/"
    exit 1
fi
echo -e "${GREEN}✅ Node.js环境正常${NC}"

# 检查npm依赖
echo ""
echo -e "${BLUE}[2/6]${NC} 检查项目依赖..."
if [ ! -d "node_modules" ]; then
    echo -e "${YELLOW}⚠️  依赖未安装，正在安装...${NC}"
    npm install
    if [ $? -ne 0 ]; then
        echo -e "${RED}❌ 依赖安装失败${NC}"
        exit 1
    fi
fi
echo -e "${GREEN}✅ 项目依赖完整${NC}"

# ESLint代码检查
if [ "$CHECK_TYPE" = "all" ] || [ "$CHECK_TYPE" = "lint" ]; then
    echo ""
    echo -e "${BLUE}[3/6]${NC} 运行ESLint代码检查..."
    npm run lint:check
    if [ $? -ne 0 ]; then
        echo -e "${RED}❌ ESLint检查发现问题${NC}"
        echo "   运行 'npm run lint' 自动修复部分问题"
        HAS_ERROR=1
    else
        echo -e "${GREEN}✅ ESLint检查通过${NC}"
    fi
fi

# Prettier格式检查
if [ "$CHECK_TYPE" = "all" ] || [ "$CHECK_TYPE" = "format" ]; then
    echo ""
    echo -e "${BLUE}[4/6]${NC} 运行Prettier格式检查..."
    npm run format:check
    if [ $? -ne 0 ]; then
        echo -e "${RED}❌ 代码格式不符合规范${NC}"
        echo "   运行 'npm run format' 自动格式化代码"
        HAS_ERROR=1
    else
        echo -e "${GREEN}✅ 代码格式检查通过${NC}"
    fi
fi

# 检查重要文件
echo ""
echo -e "${BLUE}[5/6]${NC} 检查必要文件..."
REQUIRED_FILES=("app.js" "app.json" "package.json" "README.md")
for file in "${REQUIRED_FILES[@]}"; do
    if [ ! -f "$file" ]; then
        echo -e "${RED}❌ 缺少重要文件: $file${NC}"
        HAS_ERROR=1
    fi
done

if [ $HAS_ERROR -eq 0 ]; then
    echo -e "${GREEN}✅ 所有必要文件存在${NC}"
fi

# 项目结构检查
echo ""
echo -e "${BLUE}[6/6]${NC} 检查项目结构..."
REQUIRED_DIRS=("pages" "utils" "docs" "scripts")
for dir in "${REQUIRED_DIRS[@]}"; do
    if [ ! -d "$dir" ]; then
        echo -e "${RED}❌ 缺少重要目录: $dir${NC}"
        HAS_ERROR=1
    fi
done

if [ $HAS_ERROR -eq 0 ]; then
    echo -e "${GREEN}✅ 项目结构正确${NC}"
fi

# 总结
echo ""
echo "========================================"
if [ $HAS_ERROR -ne 0 ]; then
    echo -e "${RED}❌ 质量检查发现问题，请查看上面的错误信息${NC}"
    echo ""
    echo "常用修复命令:"
    echo "  npm run lint          # 自动修复ESLint问题"
    echo "  npm run format        # 自动格式化代码"
    echo "  npm run quality-check # 重新运行检查"
    exit 1
else
    echo -e "${GREEN}✅ 所有质量检查通过！代码质量良好${NC}"
    echo ""
    echo "您可以安心提交代码到版本控制系统"
fi
echo "========================================"
echo ""

echo "质量检查完成"
exit 0

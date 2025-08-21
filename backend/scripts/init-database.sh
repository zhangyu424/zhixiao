#!/bin/bash

# 数据库初始化脚本
set -e

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}🗄️  学习质效分析系统 - 数据库初始化${NC}"
echo "=================================="
echo

# 数据库配置
DB_HOST=${DB_HOST:-"localhost"}
DB_PORT=${DB_PORT:-"3306"}
DB_USER=${DB_USER:-"root"}
DB_PASSWORD=${DB_PASSWORD:-""}
DB_NAME="zhixiao_db"

SCRIPT_DIR="/var/www/zhixiao-platform/backend/database"

echo -e "${YELLOW}[INFO]${NC} 数据库配置:"
echo "  主机: $DB_HOST:$DB_PORT"
echo "  用户: $DB_USER"
echo "  数据库: $DB_NAME"
echo

# 检查MySQL连接
echo -e "${BLUE}[INFO]${NC} 检查MySQL连接..."
if mysql -h "$DB_HOST" -P "$DB_PORT" -u "$DB_USER" ${DB_PASSWORD:+-p"$DB_PASSWORD"} -e "SELECT 1" > /dev/null 2>&1; then
    echo -e "${GREEN}[SUCCESS]${NC} MySQL连接成功"
else
    echo -e "${RED}[ERROR]${NC} MySQL连接失败"
    echo "请检查数据库配置和服务状态"
    exit 1
fi

# 执行数据库结构创建
echo -e "${BLUE}[INFO]${NC} 创建数据库结构..."
if mysql -h "$DB_HOST" -P "$DB_PORT" -u "$DB_USER" ${DB_PASSWORD:+-p"$DB_PASSWORD"} < "$SCRIPT_DIR/schema.sql"; then
    echo -e "${GREEN}[SUCCESS]${NC} 数据库结构创建成功"
else
    echo -e "${RED}[ERROR]${NC} 数据库结构创建失败"
    exit 1
fi

# 执行初始数据导入
echo -e "${BLUE}[INFO]${NC} 导入初始数据..."
if mysql -h "$DB_HOST" -P "$DB_PORT" -u "$DB_USER" ${DB_PASSWORD:+-p"$DB_PASSWORD"} < "$SCRIPT_DIR/init_data.sql"; then
    echo -e "${GREEN}[SUCCESS]${NC} 初始数据导入成功"
else
    echo -e "${RED}[ERROR]${NC} 初始数据导入失败"
    exit 1
fi

# 验证admin用户
echo -e "${BLUE}[INFO]${NC} 验证admin用户..."
ADMIN_COUNT=$(mysql -h "$DB_HOST" -P "$DB_PORT" -u "$DB_USER" ${DB_PASSWORD:+-p"$DB_PASSWORD"} -D "$DB_NAME" -sN -e "SELECT COUNT(*) FROM users WHERE student_id = 'admin' AND role = 'admin'")

if [ "$ADMIN_COUNT" -eq 1 ]; then
    echo -e "${GREEN}[SUCCESS]${NC} admin用户创建成功"
    echo -e "${GREEN}[INFO]${NC} 登录信息:"
    echo "  账号: admin"
    echo "  密码: zxrdsb050602"
    echo "  角色: 系统管理员"
else
    echo -e "${RED}[ERROR]${NC} admin用户创建失败"
    exit 1
fi

echo
echo -e "${GREEN}[SUCCESS]${NC} 🎉 数据库初始化完成！"
echo
echo "📋 系统信息:"
echo "• 数据库名: $DB_NAME"
echo "• 管理员账号: admin"
echo "• 管理员密码: zxrdsb050602"
echo "• 默认单位: 总部"
echo "• 示例用户: 已创建信管员、层级长、学员"
echo
echo "🚀 下一步:"
echo "1. 启动后端服务: npm start"
echo "2. 访问系统进行登录测试"
echo "3. 根据需要创建更多用户和单位"

#!/bin/bash

# admin用户密码重置脚本
set -e

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}🔐 重置admin用户密码${NC}"
echo "=========================="
echo

# 数据库配置
DB_HOST=${DB_HOST:-"localhost"}
DB_PORT=${DB_PORT:-"3306"}
DB_USER=${DB_USER:-"root"}
DB_PASSWORD=${DB_PASSWORD:-""}
DB_NAME="zhixiao_db"

# admin用户信息
ADMIN_USERNAME="admin"
ADMIN_PASSWORD="zxrdsb050602"
ADMIN_HASH='$2b$10$VA00dvuaKEGtn7xXh9/bn.4Jvuo/iBjyAGbvBxJU3pZSIKlj4PXdK'

echo -e "${YELLOW}[INFO]${NC} 目标信息:"
echo "  用户名: $ADMIN_USERNAME"
echo "  新密码: $ADMIN_PASSWORD"
echo "  数据库: $DB_NAME"
echo

# 检查数据库连接
echo -e "${BLUE}[INFO]${NC} 检查数据库连接..."
if mysql -h "$DB_HOST" -P "$DB_PORT" -u "$DB_USER" ${DB_PASSWORD:+-p"$DB_PASSWORD"} -D "$DB_NAME" -e "SELECT 1" > /dev/null 2>&1; then
    echo -e "${GREEN}[SUCCESS]${NC} 数据库连接成功"
else
    echo -e "${RED}[ERROR]${NC} 数据库连接失败"
    echo "请检查数据库配置和服务状态"
    exit 1
fi

# 检查admin用户是否存在
echo -e "${BLUE}[INFO]${NC} 检查admin用户..."
ADMIN_EXISTS=$(mysql -h "$DB_HOST" -P "$DB_PORT" -u "$DB_USER" ${DB_PASSWORD:+-p"$DB_PASSWORD"} -D "$DB_NAME" -sN -e "SELECT COUNT(*) FROM users WHERE student_id = '$ADMIN_USERNAME'")

if [ "$ADMIN_EXISTS" -eq 0 ]; then
    echo -e "${YELLOW}[WARNING]${NC} admin用户不存在，正在创建..."
    
    # 创建admin用户
    mysql -h "$DB_HOST" -P "$DB_PORT" -u "$DB_USER" ${DB_PASSWORD:+-p"$DB_PASSWORD"} -D "$DB_NAME" << EOF
INSERT INTO users (student_id, name, password, unit_id, role, status, force_password_change, created_at) 
VALUES ('$ADMIN_USERNAME', '系统管理员', '$ADMIN_HASH', 1, 'admin', 'active', FALSE, NOW());
EOF
    
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}[SUCCESS]${NC} admin用户创建成功"
    else
        echo -e "${RED}[ERROR]${NC} admin用户创建失败"
        exit 1
    fi
else
    echo -e "${BLUE}[INFO]${NC} admin用户已存在，正在更新密码..."
    
    # 更新admin密码
    mysql -h "$DB_HOST" -P "$DB_PORT" -u "$DB_USER" ${DB_PASSWORD:+-p"$DB_PASSWORD"} -D "$DB_NAME" << EOF
UPDATE users 
SET password = '$ADMIN_HASH', 
    role = 'admin',
    status = 'active',
    force_password_change = FALSE,
    updated_at = NOW()
WHERE student_id = '$ADMIN_USERNAME';
EOF
    
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}[SUCCESS]${NC} admin密码更新成功"
    else
        echo -e "${RED}[ERROR]${NC} admin密码更新失败"
        exit 1
    fi
fi

# 验证更新结果
echo -e "${BLUE}[INFO]${NC} 验证更新结果..."
ADMIN_INFO=$(mysql -h "$DB_HOST" -P "$DB_PORT" -u "$DB_USER" ${DB_PASSWORD:+-p"$DB_PASSWORD"} -D "$DB_NAME" -e "SELECT student_id, name, role, status FROM users WHERE student_id = '$ADMIN_USERNAME'")

echo -e "${GREEN}[SUCCESS]${NC} 当前admin用户信息:"
echo "$ADMIN_INFO"

echo
echo -e "${GREEN}[SUCCESS]${NC} 🎉 admin密码重置完成！"
echo
echo "📋 登录信息:"
echo "• 用户名: $ADMIN_USERNAME"
echo "• 密码: $ADMIN_PASSWORD"
echo "• 角色: 系统管理员"
echo
echo "🚀 现在可以使用新密码登录系统了！"

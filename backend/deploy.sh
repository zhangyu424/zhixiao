#!/bin/bash

# 学习质效分析API服务部署脚本
# 版本: 2.0
# 更新时间: 2025-08-20

set -e  # 遇到错误立即退出

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 项目配置
PROJECT_NAME="zhixiao-api"
PROJECT_DIR="/var/www/zhixiao"
BACKUP_DIR="/var/backups/zhixiao"
LOG_FILE="/var/log/zhixiao-deploy.log"

# 环境配置
ENV=${1:-production}
BRANCH=${2:-main}

echo -e "${BLUE}🚀 开始部署 $PROJECT_NAME${NC}"
echo "环境: $ENV"
echo "分支: $BRANCH"
echo "时间: $(date)"
echo "==================================" | tee -a $LOG_FILE

# 1. 检查系统依赖
check_dependencies() {
    echo -e "${YELLOW}📋 检查系统依赖...${NC}"
    
    # 检查Node.js
    if ! command -v node &> /dev/null; then
        echo -e "${RED}❌ Node.js 未安装${NC}"
        exit 1
    fi
    
    # 检查PM2
    if ! command -v pm2 &> /dev/null; then
        echo -e "${RED}❌ PM2 未安装${NC}"
        exit 1
    fi
    
    # 检查MySQL
    if ! command -v mysql &> /dev/null; then
        echo -e "${RED}❌ MySQL 未安装${NC}"
        exit 1
    fi
    
    echo -e "${GREEN}✅ 系统依赖检查通过${NC}"
}

# 2. 备份当前版本
backup_current() {
    echo -e "${YELLOW}💾 备份当前版本...${NC}"
    
    if [ -d "$PROJECT_DIR" ]; then
        BACKUP_FILE="$BACKUP_DIR/zhixiao-backup-$(date +%Y%m%d-%H%M%S).tar.gz"
        mkdir -p $BACKUP_DIR
        tar -czf $BACKUP_FILE -C $(dirname $PROJECT_DIR) $(basename $PROJECT_DIR) --exclude=node_modules --exclude=logs
        echo -e "${GREEN}✅ 备份完成: $BACKUP_FILE${NC}"
    else
        echo -e "${YELLOW}⚠️  项目目录不存在，跳过备份${NC}"
    fi
}

# 3. 更新代码
update_code() {
    echo -e "${YELLOW}📥 更新代码...${NC}"
    
    cd $PROJECT_DIR
    
    # 停止服务
    pm2 stop $PROJECT_NAME 2>/dev/null || true
    
    # 拉取最新代码 (如果是git仓库)
    if [ -d ".git" ]; then
        git fetch origin
        git checkout $BRANCH
        git pull origin $BRANCH
    fi
    
    echo -e "${GREEN}✅ 代码更新完成${NC}"
}

# 4. 安装依赖
install_dependencies() {
    echo -e "${YELLOW}📦 安装依赖...${NC}"
    
    cd $PROJECT_DIR
    npm install --production
    
    echo -e "${GREEN}✅ 依赖安装完成${NC}"
}

# 5. 检查配置文件
check_config() {
    echo -e "${YELLOW}⚙️  检查配置文件...${NC}"
    
    cd $PROJECT_DIR
    
    # 检查.env文件
    if [ ! -f ".env" ]; then
        echo -e "${RED}❌ .env 文件不存在${NC}"
        exit 1
    fi
    
    # 检查ecosystem.config.js
    if [ ! -f "ecosystem.config.js" ]; then
        echo -e "${RED}❌ ecosystem.config.js 文件不存在${NC}"
        exit 1
    fi
    
    # 设置环境
    if [ "$ENV" = "production" ]; then
        sed -i 's/NODE_ENV=development/NODE_ENV=production/' .env
    fi
    
    echo -e "${GREEN}✅ 配置文件检查通过${NC}"
}

# 6. 数据库检查
check_database() {
    echo -e "${YELLOW}🗄️  检查数据库连接...${NC}"
    
    # 从.env文件读取数据库配置
    source $PROJECT_DIR/.env
    
    # 测试数据库连接
    mysql -h$DB_HOST -u$DB_USER -p$DB_PASSWORD -e "USE $DB_NAME; SELECT 1;" &>/dev/null
    
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✅ 数据库连接正常${NC}"
    else
        echo -e "${RED}❌ 数据库连接失败${NC}"
        exit 1
    fi
}

# 7. 启动服务
start_service() {
    echo -e "${YELLOW}🔄 启动服务...${NC}"
    
    cd $PROJECT_DIR
    
    # 删除旧进程
    pm2 delete $PROJECT_NAME 2>/dev/null || true
    
    # 启动新进程
    pm2 start ecosystem.config.js --env=$ENV
    
    # 保存PM2配置
    pm2 save
    
    echo -e "${GREEN}✅ 服务启动完成${NC}"
}

# 8. 健康检查
health_check() {
    echo -e "${YELLOW}🏥 健康检查...${NC}"
    
    # 等待服务启动
    sleep 5
    
    # 检查服务状态
    pm2 status $PROJECT_NAME | grep online > /dev/null
    
    if [ $? -eq 0 ]; then
        # 检查HTTP响应
        curl -s http://localhost:3000/health > /dev/null
        
        if [ $? -eq 0 ]; then
            echo -e "${GREEN}✅ 健康检查通过${NC}"
        else
            echo -e "${RED}❌ HTTP健康检查失败${NC}"
            exit 1
        fi
    else
        echo -e "${RED}❌ 服务启动失败${NC}"
        exit 1
    fi
}

# 主函数
main() {
    check_dependencies
    backup_current
    update_code
    install_dependencies
    check_config
    check_database
    start_service
    health_check
    
    echo -e "${GREEN}🎉 部署完成！${NC}"
    echo "服务状态:"
    pm2 status $PROJECT_NAME
    echo "==================================" | tee -a $LOG_FILE
}

# 执行主函数
main "$@"

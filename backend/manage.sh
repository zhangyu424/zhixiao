#!/bin/bash

# 学习质效分析API服务管理脚本 - 精简版

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

PROJECT_NAME="zhixiao-api"
PROJECT_DIR="/var/www/zhixiao"

# 执行操作函数
exec_action() {
    local action=$1
    echo -e "${YELLOW}$action...${NC}"
    
    case $action in
        "启动服务")
            cd $PROJECT_DIR && pm2 start ecosystem.config.js && pm2 save
            ;;
        "停止服务")
            pm2 stop $PROJECT_NAME
            ;;
        "重启服务")
            pm2 restart $PROJECT_NAME
            ;;
        "查看状态")
            pm2 status $PROJECT_NAME
            echo "磁盘: $(df -h $PROJECT_DIR | awk 'NR==2 {print $5}')"
            echo "内存: $(free | awk 'FNR==2{printf "%.1f%%", $3/($3+$4)*100}')"
            return 0
            ;;
        "查看日志")
            pm2 logs $PROJECT_NAME --lines 20
            return 0
            ;;
        "运行测试")
            cd $PROJECT_DIR && bash test_api.sh local
            return 0
            ;;
        "监控检查")
            cd $PROJECT_DIR && bash monitor.sh
            return 0
            ;;
        "健康检查")
            curl -s http://localhost:3000/health | jq '.' 2>/dev/null || echo "服务不可用"
            return 0
            ;;
    esac
    
    echo -e "${GREEN}✅ 完成${NC}"
}

# 菜单选项
show_menu() {
    echo -e "${BLUE}� API服务管理${NC}"
    echo "1. 启动  2. 停止  3. 重启  4. 状态"
    echo "5. 日志  6. 测试  7. 监控  8. 健康  0. 退出"
    echo -n "选择: "
}
    echo -e "${YELLOW}🔄 重启服务...${NC}"
    pm2 restart $PROJECT_NAME
    echo -e "${GREEN}✅ 服务重启完成${NC}"
}

# 查看状态
show_status() {
    echo -e "${BLUE}📊 服务状态:${NC}"
    pm2 status $PROJECT_NAME
    echo ""
    echo -e "${BLUE}💾 系统资源:${NC}"
    echo "内存使用: $(free | awk 'FNR==2{printf "%.2f%%", $3/($3+$4)*100}')"
    echo "磁盘使用: $(df -h $PROJECT_DIR | awk 'NR==2 {print $5}')"
    echo "CPU负载: $(uptime | awk -F'load average:' '{print $2}')"
}

# 查看日志
show_logs() {
    echo -e "${BLUE}📋 最近日志:${NC}"
    pm2 logs $PROJECT_NAME --lines 20
}

# 运行测试
run_tests() {
    echo -e "${YELLOW}🧪 运行API测试...${NC}"
    cd $PROJECT_DIR
    bash test_api.sh local
}

# 监控检查
run_monitor() {
    echo -e "${YELLOW}🔍 执行监控检查...${NC}"
    cd $PROJECT_DIR
    bash monitor.sh
}

# 健康检查
health_check() {
    echo -e "${YELLOW}🏥 健康检查...${NC}"
    response=$(curl -s http://localhost:3000/health)
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✅ 服务健康正常${NC}"
        echo "响应: $response"
    else
        echo -e "${RED}❌ 服务健康检查失败${NC}"
    fi
}

# 部署更新
deploy_update() {
    echo -e "${YELLOW}🚀 部署更新...${NC}"
    echo -e "${RED}⚠️  这将重启服务，确认继续吗? (y/N)${NC}"
    read -r confirmation
    if [[ $confirmation =~ ^[Yy]$ ]]; then
        cd $PROJECT_DIR
        bash deploy.sh production
    else
        echo "部署已取消"
    fi
}

# 主循环
main() {
    while true; do
        echo ""
        show_menu
        echo -n "请选择操作 (0-9): "
        read -r choice
        
        case $choice in
            1)
                start_service
                ;;
            2)
                stop_service
                ;;
            3)
                restart_service
                ;;
            4)
                show_status
                ;;
            5)
                show_logs
                ;;
            6)
                run_tests
# 主循环
main() {
    while true; do
        show_menu
        read -r choice
        
        case $choice in
            1) exec_action "启动服务" ;;
            2) exec_action "停止服务" ;;
            3) exec_action "重启服务" ;;
            4) exec_action "查看状态" ;;
            5) exec_action "查看日志" ;;
            6) exec_action "运行测试" ;;
            7) exec_action "监控检查" ;;
            8) exec_action "健康检查" ;;
            0) echo -e "${GREEN}再见！${NC}"; exit 0 ;;
            *) echo -e "${RED}无效选择${NC}" ;;
        esac
        
        echo -e "\n${YELLOW}按回车继续...${NC}"
        read -r
    done
}

# 命令行模式
if [ $# -gt 0 ]; then
    case $1 in
        start) exec_action "启动服务" ;;
        stop) exec_action "停止服务" ;;
        restart) exec_action "重启服务" ;;
        status) exec_action "查看状态" ;;
        logs) exec_action "查看日志" ;;
        test) exec_action "运行测试" ;;
        monitor) exec_action "监控检查" ;;
        health) exec_action "健康检查" ;;
        *) echo "用法: $0 [start|stop|restart|status|logs|test|monitor|health]" ;;
    esac
else
    main
fi

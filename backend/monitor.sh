#!/bin/bash

# 学习质效分析API服务监控脚本 - 精简版
# 用途: 快速监控服务状态和健康状况

set -e

# 颜色和配置
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

PROJECT_NAME="zhixiao-api"
BASE_URL="http://localhost:3000"

# 简化的检查函数
check_status() {
    local name=$1
    local cmd=$2
    local desc=$3
    
    echo -n "• $desc: "
    
    if eval "$cmd" &>/dev/null; then
        echo -e "${GREEN}✅${NC}"
        return 0
    else
        echo -e "${RED}❌${NC}"
        return 1
    fi
}

# 获取简要信息
get_info() {
    local info_type=$1
    
    case $info_type in
        "pm2")
            pm2 jlist 2>/dev/null | jq -r '.[] | select(.name=="'$PROJECT_NAME'") | "\(.pm2_env.status) \(.monit.memory/1024/1024|floor)MB \(.monit.cpu)%"' 2>/dev/null || echo "未运行"
            ;;
        "http")
            local response=$(curl -s "$BASE_URL/health" 2>/dev/null)
            echo "$response" | jq -r '.uptime // "连接失败"' 2>/dev/null | awk '{printf "%.0fs", $1}'
            ;;
        "disk")
            df -h /var/www/zhixiao 2>/dev/null | awk 'NR==2 {print $5}' || echo "N/A"
            ;;
    esac
}
    
    if [ "$HTTP_CODE" = "200" ]; then
        UPTIME=$(cat /tmp/health_response.json | jq -r '.uptime // 0' 2>/dev/null)
        TIMESTAMP=$(cat /tmp/health_response.json | jq -r '.timestamp // "unknown"' 2>/dev/null)
        
        echo -e "${GREEN}✅ HTTP健康检查: 正常${NC}"
        echo "   HTTP状态码: $HTTP_CODE"
        echo "   服务运行时间: $UPTIME 秒"
        echo "   最后响应时间: $TIMESTAMP"
        log "HTTP Health: OK - Uptime: $UPTIME seconds"
        return 0
    else
        echo -e "${RED}❌ HTTP健康检查: 失败${NC}"
        echo "   HTTP状态码: $HTTP_CODE"
        log "HTTP Health: ERROR - HTTP Code: $HTTP_CODE"
        return 1
    fi
}

# 检查数据库连接
check_database() {
    echo -e "${BLUE}🗄️  检查数据库连接...${NC}"
    
    # 从.env文件读取数据库配置
    if [ -f "/var/www/zhixiao/.env" ]; then
        source /var/www/zhixiao/.env
        
        # 测试数据库连接
        mysql -h$DB_HOST -u$DB_USER -p$DB_PASSWORD -e "SELECT 1;" $DB_NAME &>/dev/null
        
        if [ $? -eq 0 ]; then
            echo -e "${GREEN}✅ 数据库连接: 正常${NC}"
            
            # 获取数据库统计信息
            USER_COUNT=$(mysql -h$DB_HOST -u$DB_USER -p$DB_PASSWORD -e "SELECT COUNT(*) FROM users;" $DB_NAME 2>/dev/null | tail -n1)
            RECORD_COUNT=$(mysql -h$DB_HOST -u$DB_USER -p$DB_PASSWORD -e "SELECT COUNT(*) FROM study_records;" $DB_NAME 2>/dev/null | tail -n1)
            
            echo "   用户总数: $USER_COUNT"
            echo "   学习记录总数: $RECORD_COUNT"
            log "Database: OK - Users: $USER_COUNT, Records: $RECORD_COUNT"
            return 0
        else
            echo -e "${RED}❌ 数据库连接: 失败${NC}"
            log "Database: ERROR - Connection failed"
            return 1
        fi
    else
        echo -e "${YELLOW}⚠️  .env文件不存在${NC}"
        log "Database: WARNING - .env file not found"
        return 1
    fi
}

# 检查磁盘空间
check_disk_space() {
    echo -e "${BLUE}💾 检查磁盘空间...${NC}"
    
    DISK_USAGE=$(df -h /var/www/zhixiao | awk 'NR==2 {print $5}' | sed 's/%//')
    
    if [ $DISK_USAGE -lt 80 ]; then
        echo -e "${GREEN}✅ 磁盘空间: 正常 (使用率: $DISK_USAGE%)${NC}"
        log "Disk Space: OK - Usage: $DISK_USAGE%"
        return 0
    elif [ $DISK_USAGE -lt 90 ]; then
        echo -e "${YELLOW}⚠️  磁盘空间: 警告 (使用率: $DISK_USAGE%)${NC}"
        log "Disk Space: WARNING - Usage: $DISK_USAGE%"
        return 1
    else
        echo -e "${RED}❌ 磁盘空间: 严重不足 (使用率: $DISK_USAGE%)${NC}"
        log "Disk Space: CRITICAL - Usage: $DISK_USAGE%"
        return 1
    fi
}

# 检查日志文件大小
check_log_size() {
    echo -e "${BLUE}📄 检查日志文件...${NC}"
    
    LOG_DIR="/var/www/zhixiao/logs"
    
    if [ -d "$LOG_DIR" ]; then
        LOG_SIZE=$(du -sh $LOG_DIR | cut -f1)
        echo -e "${GREEN}✅ 日志目录大小: $LOG_SIZE${NC}"
        
        # 检查错误日志
        ERROR_LOG="$LOG_DIR/error-0.log"
        if [ -f "$ERROR_LOG" ]; then
            ERROR_COUNT=$(tail -n 100 $ERROR_LOG | grep -c "Error\|ERROR" || echo "0")
            if [ $ERROR_COUNT -gt 10 ]; then
                echo -e "${YELLOW}⚠️  最近错误较多: $ERROR_COUNT 个${NC}"
                log "Logs: WARNING - Recent errors: $ERROR_COUNT"
            else
                echo -e "${GREEN}   最近错误数量: $ERROR_COUNT${NC}"
                log "Logs: OK - Recent errors: $ERROR_COUNT"
            fi
        fi
        return 0
    else
        echo -e "${YELLOW}⚠️  日志目录不存在${NC}"
        log "Logs: WARNING - Log directory not found"
        return 1
    fi
}

# 性能基准测试
performance_test() {
    echo -e "${BLUE}⚡ 性能基准测试...${NC}"
    
    # 测试健康检查响应时间
    RESPONSE_TIME=$(curl -s -w "%{time_total}" -o /dev/null "$BASE_URL/health" 2>/dev/null)
    
    if [ ! -z "$RESPONSE_TIME" ]; then
        RESPONSE_MS=$(echo "$RESPONSE_TIME * 1000" | bc | cut -d. -f1)
        
        if [ $RESPONSE_MS -lt 100 ]; then
            echo -e "${GREEN}✅ 响应时间: ${RESPONSE_MS}ms (优秀)${NC}"
        elif [ $RESPONSE_MS -lt 500 ]; then
            echo -e "${YELLOW}⚠️  响应时间: ${RESPONSE_MS}ms (一般)${NC}"
        else
            echo -e "${RED}❌ 响应时间: ${RESPONSE_MS}ms (较慢)${NC}"
        fi
        
        log "Performance: Response time ${RESPONSE_MS}ms"
    else
        echo -e "${RED}❌ 响应时间测试失败${NC}"
        log "Performance: ERROR - Response time test failed"
    fi
}

# 生成监控报告
generate_report() {
    echo -e "\n${BLUE}📋 监控报告生成中...${NC}"
    
    REPORT_FILE="/tmp/zhixiao-monitor-report-$(date +%Y%m%d-%H%M%S).txt"
    
    {
        echo "======================================"
        echo "学习质效分析API服务监控报告"
        echo "生成时间: $(timestamp)"
        echo "======================================"
        echo ""
        
        # PM2状态
        echo "PM2进程状态:"
        pm2 status $PROJECT_NAME 2>/dev/null || echo "PM2状态获取失败"
        echo ""
        
        # 系统资源
        echo "系统资源使用:"
        echo "内存使用率: $(free | awk 'FNR==2{printf "%.2f%%", $3/($3+$4)*100}')"
        echo "CPU负载: $(uptime | awk -F'load average:' '{print $2}')"
        echo "磁盘使用: $(df -h /var/www/zhixiao | awk 'NR==2 {print $5}')"
        echo ""
        
        # 网络连接
        echo "网络连接:"
        netstat -an | grep :3000 | head -5
        echo ""
        
        # 最近错误日志
        echo "最近错误日志 (最近10条):"
        if [ -f "/var/www/zhixiao/logs/error-0.log" ]; then
            tail -n 10 /var/www/zhixiao/logs/error-0.log
        else
            echo "无错误日志"
        fi
        
    } > $REPORT_FILE
    
    echo -e "${GREEN}✅ 监控报告已生成: $REPORT_FILE${NC}"
}

# 主监控函数
main_monitor() {
    echo -e "${GREEN}🔍 开始系统监控检查...${NC}"
    echo "时间: $(timestamp)"
    echo "====================================="
    
    FAILED_CHECKS=0
    
    # 执行各项检查
    check_pm2_status || ((FAILED_CHECKS++))
    echo ""
    
    check_http_health || ((FAILED_CHECKS++))
    echo ""
    
    check_database || ((FAILED_CHECKS++))
    echo ""
    
    check_disk_space || ((FAILED_CHECKS++))
    echo ""
    
    check_log_size || ((FAILED_CHECKS++))
    echo ""
    
    performance_test
    echo ""
    
    # 生成报告
    if [ "${1:-}" = "--report" ]; then
        generate_report
    fi
    
    # 总结
    echo "====================================="
    if [ $FAILED_CHECKS -eq 0 ]; then
        echo -e "${GREEN}🎉 所有检查通过！系统运行正常${NC}"
        log "Monitor: All checks passed"
    else
        echo -e "${YELLOW}⚠️  发现 $FAILED_CHECKS 个问题，请检查上述输出${NC}"
        log "Monitor: $FAILED_CHECKS checks failed"
    fi
    
    echo "监控完成时间: $(timestamp)"
}

# 显示使用说明
show_usage() {
    echo "使用方法:"
    echo "  $0                    # 执行基础监控检查"
    echo "  $0 --report          # 执行监控检查并生成详细报告"
    echo "  $0 --help            # 显示此帮助信息"
}

# 主程序入口
case "${1:-}" in
    --help)
# 主监控函数
main() {
    echo -e "${BLUE}🔍 系统监控检查${NC}"
    echo "时间: $(date '+%Y-%m-%d %H:%M:%S')"
    echo "============================="
    
    local failed=0
    
    # 核心检查
    check_status "pm2" "pm2 status $PROJECT_NAME | grep -q online" "PM2进程" || ((failed++))
    check_status "http" "curl -s $BASE_URL/health | grep -q ok" "HTTP服务" || ((failed++))
    check_status "db" "mysql -u root -p\${DB_PASSWORD:-zhixiao123456} -e 'SELECT 1' zhixiao_db" "数据库" || ((failed++))
    
    # 系统信息
    echo -e "\n${BLUE}📊 系统信息${NC}"
    echo "PM2状态: $(get_info pm2)"
    echo "运行时间: $(get_info http)"
    echo "磁盘使用: $(get_info disk)"
    echo "内存使用: $(free | awk 'FNR==2{printf "%.1f%%", $3/($3+$4)*100}')"
    
    # 结果总结
    echo -e "\n============================="
    if [ $failed -eq 0 ]; then
        echo -e "${GREEN}🎉 所有检查通过${NC}"
        exit 0
    else
        echo -e "${YELLOW}⚠️  发现 $failed 个问题${NC}"
        exit 1
    fi
}

# 快速检查模式
if [ "${1:-}" = "--quick" ]; then
    check_status "服务" "curl -s $BASE_URL/health | grep -q ok" "API服务状态"
    exit $?
fi

# 执行完整检查
main

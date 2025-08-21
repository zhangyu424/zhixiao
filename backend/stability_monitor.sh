#!/bin/bash

# 稳定性监控和自动修复脚本
# 用途: 监控服务状态，自动修复常见问题

set -e

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

PROJECT_NAME="zhixiao-api"
LOG_FILE="./logs/stability_monitor.log"
MAX_RESTART_COUNT=5
CHECK_INTERVAL=30

# 记录日志
log_message() {
    local level=$1
    local message=$2
    local timestamp=$(date '+%Y-%m-%d %H:%M:%S')
    echo "[$timestamp] [$level] $message" | tee -a "$LOG_FILE"
}

# 检查服务状态
check_service_status() {
    local status=$(pm2 jlist 2>/dev/null | jq -r '.[] | select(.name=="'$PROJECT_NAME'") | .pm2_env.status' 2>/dev/null)
    echo "$status"
}

# 检查重启次数
check_restart_count() {
    local restart_count=$(pm2 jlist 2>/dev/null | jq -r '.[] | select(.name=="'$PROJECT_NAME'") | .pm2_env.restart_time' 2>/dev/null)
    echo "${restart_count:-0}"
}

# 检查内存使用
check_memory_usage() {
    local memory=$(pm2 jlist 2>/dev/null | jq -r '.[] | select(.name=="'$PROJECT_NAME'") | (.monit.memory/1024/1024|floor)' 2>/dev/null)
    echo "${memory:-0}"
}

# 检查API健康状态
check_api_health() {
    local response=$(curl -s -w "%{http_code}" -o /dev/null "http://localhost:3000/health" 2>/dev/null)
    echo "$response"
}

# 检查错误日志
check_error_logs() {
    local error_count=$(tail -100 "./logs/error-0.log" 2>/dev/null | grep -c "$(date '+%Y-%m-%d')" 2>/dev/null || echo "0")
    echo "$error_count"
}

# 自动修复函数
auto_fix_issues() {
    local status=$(check_service_status)
    local restart_count=$(check_restart_count)
    local memory=$(check_memory_usage)
    local api_status=$(check_api_health)
    local error_count=$(check_error_logs)
    
    log_message "INFO" "状态检查: 服务=$status, 重启=$restart_count次, 内存=${memory}MB, API=$api_status, 错误=$error_count"
    
    # 如果服务未运行，尝试启动
    if [[ "$status" != "online" ]]; then
        log_message "WARNING" "服务未运行，尝试启动..."
        pm2 start ecosystem.config.js --env production
        sleep 5
        return 0
    fi
    
    # 如果重启次数过多，重置进程
    if [[ "$restart_count" -gt "$MAX_RESTART_COUNT" ]]; then
        log_message "WARNING" "重启次数过多($restart_count)，重置进程..."
        pm2 delete "$PROJECT_NAME" 2>/dev/null || true
        pm2 start ecosystem.config.js --env production
        sleep 10
        return 0
    fi
    
    # 如果内存使用过高，重启服务
    if [[ "$memory" -gt 800 ]]; then
        log_message "WARNING" "内存使用过高(${memory}MB)，重启服务..."
        pm2 restart "$PROJECT_NAME"
        sleep 5
        return 0
    fi
    
    # 如果API不响应，重启服务
    if [[ "$api_status" != "200" ]]; then
        log_message "WARNING" "API健康检查失败($api_status)，重启服务..."
        pm2 restart "$PROJECT_NAME"
        sleep 5
        return 0
    fi
    
    # 如果错误过多，重启服务
    if [[ "$error_count" -gt 50 ]]; then
        log_message "WARNING" "今日错误过多($error_count)，重启服务..."
        pm2 restart "$PROJECT_NAME"
        sleep 5
        return 0
    fi
    
    return 1
}

# 发送告警通知（可以扩展为邮件、微信等）
send_alert() {
    local message=$1
    log_message "ALERT" "$message"
    # 这里可以添加邮件或其他通知方式
    # echo "$message" | mail -s "系统告警" admin@example.com
}

# 生成状态报告
generate_status_report() {
    local status=$(check_service_status)
    local restart_count=$(check_restart_count)
    local memory=$(check_memory_usage)
    local api_status=$(check_api_health)
    local uptime=$(pm2 jlist 2>/dev/null | jq -r '.[] | select(.name=="'$PROJECT_NAME'") | .pm2_env.pm_uptime' 2>/dev/null)
    
    echo -e "\n${BLUE}=== 系统稳定性报告 $(date '+%Y-%m-%d %H:%M:%S') ===${NC}"
    echo -e "服务状态: $([ "$status" = "online" ] && echo -e "${GREEN}正常${NC}" || echo -e "${RED}异常${NC}") ($status)"
    echo -e "重启次数: $([ "$restart_count" -lt 5 ] && echo -e "${GREEN}$restart_count${NC}" || echo -e "${RED}$restart_count${NC}")"
    echo -e "内存使用: $([ "$memory" -lt 500 ] && echo -e "${GREEN}${memory}MB${NC}" || echo -e "${YELLOW}${memory}MB${NC}")"
    echo -e "API状态: $([ "$api_status" = "200" ] && echo -e "${GREEN}正常${NC}" || echo -e "${RED}异常${NC}") ($api_status)"
    echo -e "运行时间: $(date -d @$(($uptime/1000)) '+%H:%M:%S' 2>/dev/null || echo "未知")"
}

# 主监控循环
monitor_loop() {
    log_message "INFO" "稳定性监控启动"
    
    while true; do
        if auto_fix_issues; then
            log_message "INFO" "已执行自动修复"
            generate_status_report
        fi
        
        sleep "$CHECK_INTERVAL"
    done
}

# 脚本参数处理
case "${1:-monitor}" in
    "monitor")
        monitor_loop
        ;;
    "status")
        generate_status_report
        ;;
    "fix")
        if auto_fix_issues; then
            echo "已执行自动修复"
        else
            echo "系统状态正常，无需修复"
        fi
        ;;
    "report")
        generate_status_report
        echo -e "\n最近10条日志:"
        tail -10 "$LOG_FILE" 2>/dev/null || echo "暂无日志"
        ;;
    *)
        echo "用法: $0 {monitor|status|fix|report}"
        echo "  monitor  - 启动持续监控（默认）"
        echo "  status   - 显示当前状态"
        echo "  fix      - 执行一次自动修复检查"
        echo "  report   - 生成详细报告"
        exit 1
        ;;
esac

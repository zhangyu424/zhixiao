#!/bin/bash

# 学习质效分析API测试脚本 - 完整版
# 使用方法: bash test_api.sh [local|production] [--admin|--quick]

set -e

ENV=${1:-local}
MODE=${2:-}
BASE_URL=$([ "$ENV" = "production" ] && echo "http://140.143.143.195" || echo "http://localhost:3000")

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}🧪 API功能测试 ($ENV)${NC}"
echo "服务器: $BASE_URL"
echo "时间: $(date '+%Y-%m-%d %H:%M:%S')"
echo "====================================="

# 统一的测试函数
test_api() {
    local method=$1
    local endpoint=$2
    local data=$3
    local auth=$4
    local desc=$5
    local expected=${6:-200}
    
    echo -e "\n${YELLOW}• $desc${NC}"
    
    local cmd="curl -s -w '\\n%{http_code}' -X $method"
    [ -n "$auth" ] && cmd="$cmd -H 'Authorization: Bearer $auth'"
    [ -n "$data" ] && cmd="$cmd -H 'Content-Type: application/json' -d '$data'"
    cmd="$cmd '$BASE_URL$endpoint'"
    
    local response=$(eval $cmd)
    local http_code=$(echo "$response" | tail -n1)
    local body=$(echo "$response" | head -n -1)
    
    if [[ "$http_code" =~ ^($expected)$ ]]; then
        echo -e "  ${GREEN}✅ $http_code${NC}"
        [ ${#body} -gt 120 ] && echo "  $(echo "$body" | head -c 120)..." || echo "  $body"
        return 0
    else
        echo -e "  ${RED}❌ $http_code (期望: $expected)${NC}"
        echo "  $body"
        return 1
    fi
}

# 获取认证token
get_token() {
    echo -e "${BLUE}🔑 获取认证token...${NC}"
    
    # 尝试管理员登录
    local admin_response=$(curl -s -X POST "$BASE_URL/api/auth/login" \
        -H "Content-Type: application/json" \
        -d '{"student_id":"admin","password":"123456"}')
    
    local admin_token=$(echo "$admin_response" | grep -o '"token":"[^"]*"' | cut -d'"' -f4 2>/dev/null || echo "")
    
    if [ -n "$admin_token" ]; then
        echo "admin_token=$admin_token"
        return 0
    fi
    
    # 尝试测试用户登录
    local user_response=$(curl -s -X POST "$BASE_URL/api/auth/login" \
        -H "Content-Type: application/json" \
        -d '{"student_id":"STU001","password":"001"}')
    
    local user_token=$(echo "$user_response" | grep -o '"token":"[^"]*"' | cut -d'"' -f4 2>/dev/null || echo "")
    
    if [ -n "$user_token" ]; then
        echo "user_token=$user_token"
        return 0
    fi
    
    echo ""
    return 1
}

# 快速检查模式
quick_check() {
    echo -e "${BLUE}⚡ 快速健康检查${NC}"
    
    local failed=0
    test_api "GET" "/health" "" "" "健康检查" || ((failed++))
    test_api "GET" "/" "" "" "服务信息" || ((failed++))
    test_api "GET" "/api" "" "" "API目录" || ((failed++))
    
    echo -e "\n====================================="
    if [ $failed -eq 0 ]; then
        echo -e "${GREEN}🎉 快速检查通过！${NC}"
        exit 0
    else
        echo -e "${RED}❌ 快速检查失败${NC}"
        exit 1
    fi
}

# 基础功能测试
test_basic() {
    echo -e "\n${BLUE}📋 基础功能测试${NC}"
    
    test_api "GET" "/health" "" "" "健康检查" && ((passed++)); ((total++))
    test_api "GET" "/" "" "" "服务信息" && ((passed++)); ((total++))
    test_api "GET" "/api" "" "" "API目录" && ((passed++)); ((total++))
    test_api "GET" "/api/docs/list" "" "" "文档列表" && ((passed++)); ((total++))
    test_api "GET" "/api/docs/search?q=API" "" "" "文档搜索" && ((passed++)); ((total++))
}

# 认证功能测试
test_auth() {
    echo -e "\n${BLUE}🔐 认证功能测试${NC}"
    
    test_api "POST" "/api/auth/login" '{"student_id":"admin","password":"123456"}' "" "管理员登录" && ((passed++)); ((total++))
    test_api "GET" "/api/admin/users" "" "" "无权限访问" "401|403" && ((passed++)); ((total++))
    
    if [ -n "$user_token" ]; then
        test_api "POST" "/api/auth/refresh" "" "$user_token" "Token刷新" && ((passed++)); ((total++))
        test_api "POST" "/api/auth/logout" "" "$user_token" "用户登出" && ((passed++)); ((total++))
    else
        ((total+=2))
    fi
}

# 用户功能测试
test_user() {
    echo -e "\n${BLUE}👤 用户功能测试${NC}"
    
    if [ -n "$user_token" ]; then
        test_api "GET" "/api/users/profile" "" "$user_token" "个人资料" && ((passed++)); ((total++))
        test_api "GET" "/api/users/roles" "" "$user_token" "用户角色" && ((passed++)); ((total++))
        test_api "GET" "/api/users/study-stats" "" "$user_token" "学习统计" && ((passed++)); ((total++))
    else
        echo -e "  ${YELLOW}⚠️  跳过用户功能测试 (无有效token)${NC}"
        ((total+=3))
    fi
}

# 学习模块测试
test_study() {
    echo -e "\n${BLUE}📚 学习模块测试${NC}"
    
    if [ -n "$user_token" ]; then
        test_api "GET" "/api/study/today" "" "$user_token" "今日学习" && ((passed++)); ((total++))
        test_api "GET" "/api/study/week" "" "$user_token" "本周学习" && ((passed++)); ((total++))
        test_api "GET" "/api/study/month" "" "$user_token" "月度学习" && ((passed++)); ((total++))
        test_api "GET" "/api/study/history" "" "$user_token" "学习历史" && ((passed++)); ((total++))
        test_api "GET" "/api/study/stats" "" "$user_token" "学习统计" && ((passed++)); ((total++))
        test_api "GET" "/api/study/heatmap" "" "$user_token" "学习热力图" && ((passed++)); ((total++))
    else
        echo -e "  ${YELLOW}⚠️  跳过学习模块测试 (无有效token)${NC}"
        ((total+=6))
    fi
}

# 分析模块测试
test_analysis() {
    echo -e "\n${BLUE}📊 分析模块测试${NC}"
    
    if [ -n "$user_token" ]; then
        test_api "GET" "/api/analysis/recent" "" "$user_token" "最近分析" && ((passed++)); ((total++))
        test_api "GET" "/api/analysis/personal" "" "$user_token" "个人分析" && ((passed++)); ((total++))
        test_api "GET" "/api/analysis/trends" "" "$user_token" "趋势分析" && ((passed++)); ((total++))
        test_api "GET" "/api/analysis/ranking" "" "$user_token" "排名数据" && ((passed++)); ((total++))
        test_api "GET" "/api/analysis/comparison" "" "$user_token" "数据对比" && ((passed++)); ((total++))
    else
        echo -e "  ${YELLOW}⚠️  跳过分析模块测试 (无有效token)${NC}"
        ((total+=5))
    fi
}

# 管理员功能测试
test_admin() {
    echo -e "\n${BLUE}🔧 管理员功能测试${NC}"
    
    if [ -n "$admin_token" ]; then
        test_api "GET" "/api/admin/users" "" "$admin_token" "用户列表" && ((passed++)); ((total++))
        test_api "GET" "/api/admin/statistics" "" "$admin_token" "系统统计" && ((passed++)); ((total++))
        test_api "GET" "/api/admin/settings" "" "$admin_token" "系统设置" && ((passed++)); ((total++))
        test_api "POST" "/api/admin/users" '{"name":"测试用户","student_id":"TEST999","password":"123456","role":"student","unit_id":5}' "$admin_token" "创建用户" "201" && ((passed++)); ((total++))
        test_api "POST" "/api/admin/announcements" '{"title":"测试公告","content":"这是一个测试公告","priority":"normal","target_audience":"all"}' "$admin_token" "发布公告" "201" && ((passed++)); ((total++))
    else
        echo -e "  ${YELLOW}⚠️  跳过管理员功能测试 (无管理员token)${NC}"
        ((total+=5))
    fi
}

# 其他功能测试
test_others() {
    echo -e "\n${BLUE}📱 其他功能测试${NC}"
    
    if [ -n "$user_token" ]; then
        test_api "GET" "/api/notifications" "" "$user_token" "通知列表" && ((passed++)); ((total++))
        test_api "GET" "/api/exam/latest" "" "$user_token" "最新考试" && ((passed++)); ((total++))
        test_api "GET" "/api/exam/list" "" "$user_token" "考试列表" && ((passed++)); ((total++))
    else
        echo -e "  ${YELLOW}⚠️  跳过其他功能测试 (无有效token)${NC}"
        ((total+=3))
    fi
}

# 主测试流程
main() {
    local passed=0
    local total=0
    
    # 快速检查模式
    if [ "$MODE" = "--quick" ]; then
        quick_check
        return
    fi
    
    # 获取认证令牌
    local tokens=$(get_token)
    if echo "$tokens" | grep -q "admin_token="; then
        admin_token=$(echo "$tokens" | grep "admin_token=" | cut -d'=' -f2)
    fi
    if echo "$tokens" | grep -q "user_token="; then
        user_token=$(echo "$tokens" | grep "user_token=" | cut -d'=' -f2)
    fi
    
    # 执行测试
    test_basic
    test_auth
    test_user
    test_study
    
    # 管理员模式测试
    if [ "$MODE" = "--admin" ]; then
        test_admin
    fi
    
    test_analysis
    test_others
    
    # 测试总结
    echo -e "\n====================================="
    echo -e "${BLUE}📊 测试结果统计${NC}"
    echo "通过: $passed/$total"
    
    if [ $total -gt 0 ]; then
        echo "成功率: $(( passed * 100 / total ))%"
        
        if [ $passed -eq $total ]; then
            echo -e "${GREEN}🎉 所有测试通过！${NC}"
            exit 0
        else
            echo -e "${YELLOW}⚠️  部分测试失败${NC}"
            exit 1
        fi
    else
        echo -e "${RED}❌ 无法执行测试${NC}"
        exit 1
    fi
}

# 显示帮助信息
if [ "${1:-}" = "--help" ]; then
    echo "使用方法:"
    echo "  $0                    # 基础测试 (本地)"
    echo "  $0 production        # 生产环境测试"
    echo "  $0 local --admin     # 包含管理员功能测试"
    echo "  $0 local --quick     # 快速健康检查"
    echo "  $0 --help           # 显示帮助信息"
    exit 0
fi

# 执行主流程
main

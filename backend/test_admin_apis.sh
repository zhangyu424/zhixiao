#!/bin/bash

# 管理员模块专项测试脚本 - 精简版
# 使用方法: bash test_admin_apis.sh [local|production]

set -e

ENV=${1:-local}
BASE_URL=$([ "$ENV" = "production" ] && echo "http://140.143.143.195" || echo "http://localhost:3000")

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}🔧 管理员模块专项测试 ($ENV)${NC}"
echo "====================================="

# 统计变量
passed=0
total=0

# 简化的测试函数
test_admin_api() {
    local desc=$1
    local method=$2
    local endpoint=$3
    local data=$4
    local expected=${5:-200}
    
    ((total++))
    echo -e "\n${YELLOW}• $desc${NC}"
    
    local cmd="curl -s -w '\\n%{http_code}' -X $method"
    cmd="$cmd -H 'Authorization: Bearer $admin_token'"
    [ -n "$data" ] && cmd="$cmd -H 'Content-Type: application/json' -d '$data'"
    cmd="$cmd '$BASE_URL/api$endpoint'"
    
    local response=$(eval $cmd)
    local http_code=$(echo "$response" | tail -n1)
    local body=$(echo "$response" | head -n -1)
    
    if [[ "$http_code" =~ ^($expected)$ ]]; then
        echo -e "  ${GREEN}✅ $http_code${NC}"
        ((passed++))
        return 0
    else
        echo -e "  ${RED}❌ $http_code (期望: $expected)${NC}"
        [ ${#body} -gt 100 ] && echo "  $(echo "$body" | head -c 100)..." || echo "  $body"
        return 1
    fi
}

# 获取管理员token
get_admin_token() {
    echo -e "${BLUE}🔑 管理员登录...${NC}"
    
    local login_response=$(curl -s -X POST "$BASE_URL/api/auth/login" \
        -H "Content-Type: application/json" \
        -d '{"student_id":"admin","password":"123456"}')
    
    local token=$(echo "$login_response" | grep -o '"token":"[^"]*"' | cut -d'"' -f4 2>/dev/null || echo "")
    
    if [ -n "$token" ]; then
        echo "$token"
        return 0
    else
        echo ""
        return 1
    fi
}

# 主测试流程
main() {
    # 获取管理员token
    admin_token=$(get_admin_token)
    
    if [ -z "$admin_token" ]; then
        echo -e "${RED}❌ 管理员登录失败，无法继续测试${NC}"
        exit 1
    fi
    
    echo -e "${GREEN}✅ 管理员登录成功${NC}"
    
    # 用户管理测试
    echo -e "\n${BLUE}👥 用户管理功能${NC}"
    test_admin_api "获取用户列表" "GET" "/admin/users"
    test_admin_api "创建用户" "POST" "/admin/users" \
        '{"name":"测试用户","student_id":"TEST999","password":"123456","role":"student","unit_id":5}' "201"
    test_admin_api "批量导入用户" "POST" "/admin/users/import" \
        '{"users":[{"name":"批量用户","student_id":"BATCH001","role":"student","unit_id":5}]}' "200"
    
    # 系统管理测试
    echo -e "\n${BLUE}⚙️ 系统管理功能${NC}"
    test_admin_api "获取系统统计" "GET" "/admin/statistics"
    test_admin_api "获取系统设置" "GET" "/admin/settings"
    test_admin_api "更新系统设置" "PUT" "/admin/settings" \
        '{"system_name":"学习质效分析系统v2","default_study_goal":"4.0"}'
    
    # 公告管理测试
    echo -e "\n${BLUE}📢 公告管理功能${NC}"
    test_admin_api "发布公告" "POST" "/admin/announcements" \
        '{"title":"测试公告","content":"这是一个测试公告","priority":"normal","target_audience":"all"}' "201"
    
    # 权限控制测试
    echo -e "\n${BLUE}🛡️ 权限控制测试${NC}"
    # 测试普通用户尝试访问管理员接口
    local user_response=$(curl -s -w '\n%{http_code}' -X POST "$BASE_URL/api/auth/login" \
        -H "Content-Type: application/json" \
        -d '{"student_id":"STU001","password":"001"}')
    
    local user_token=$(echo "$user_response" | head -n -1 | grep -o '"token":"[^"]*"' | cut -d'"' -f4 2>/dev/null || echo "")
    
    if [ -n "$user_token" ]; then
        ((total++))
        echo -e "\n${YELLOW}• 普通用户访问管理员接口${NC}"
        local forbidden_response=$(curl -s -w '\n%{http_code}' -X GET "$BASE_URL/api/admin/users" \
            -H "Authorization: Bearer $user_token")
        local forbidden_code=$(echo "$forbidden_response" | tail -n1)
        
        if [[ "$forbidden_code" =~ ^(401|403)$ ]]; then
            echo -e "  ${GREEN}✅ $forbidden_code (正确拒绝)${NC}"
            ((passed++))
        else
            echo -e "  ${RED}❌ $forbidden_code (应该被拒绝)${NC}"
        fi
    fi
    
    # 测试结果统计
    echo -e "\n====================================="
    echo -e "${BLUE}📊 测试结果统计${NC}"
    echo "通过: $passed/$total"
    echo "成功率: $(( passed * 100 / total ))%"
    
    if [ $passed -eq $total ]; then
        echo -e "${GREEN}🎉 所有管理员功能测试通过！${NC}"
        exit 0
    else
        echo -e "${YELLOW}⚠️  部分测试失败${NC}"
        exit 1
    fi
}

# 显示帮助信息
if [ "${1:-}" = "--help" ]; then
    echo "使用方法:"
    echo "  $0                # 本地环境测试"
    echo "  $0 production     # 生产环境测试"
    echo "  $0 --help        # 显示帮助信息"
    exit 0
fi

# 执行测试
main

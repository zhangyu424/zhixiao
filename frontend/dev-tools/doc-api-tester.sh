#!/bin/bash
# 文档API专项测试脚本
# 移植自zhixiaodocs，专门测试文档相关API端点
# 仅供开发过程使用

echo "📄 文档API专项测试"
echo "测试时间: $(date)"
echo "服务器: http://140.143.143.195"
echo "========================================"

# 基础配置
BASE_URL="http://140.143.143.195/api/docs"
TEST_TOKEN=""  # 需要从登录接口获取

# 颜色输出
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 测试计数器
TOTAL_TESTS=0
PASSED_TESTS=0
FAILED_TESTS=0

# 测试函数
test_endpoint() {
    local name="$1"
    local method="$2"
    local endpoint="$3"
    local data="$4"
    local headers="$5"
    local expected_status="${6:-200}"
    
    local url="$BASE_URL$endpoint"
    
    echo -e "${BLUE}🔍 测试: $name${NC}"
    echo "   请求: $method $endpoint"
    
    ((TOTAL_TESTS++))
    
    if [ "$method" = "GET" ]; then
        if [ -n "$headers" ]; then
            response=$(curl -s -w "\n%{http_code}" -H "$headers" "$url")
        else
            response=$(curl -s -w "\n%{http_code}" "$url")
        fi
    else
        if [ -n "$headers" ]; then
            response=$(curl -s -w "\n%{http_code}" -X "$method" -H "Content-Type: application/json" -H "$headers" -d "$data" "$url")
        else
            response=$(curl -s -w "\n%{http_code}" -X "$method" -H "Content-Type: application/json" -d "$data" "$url")
        fi
    fi
    
    http_code=$(echo "$response" | tail -n1)
    body=$(echo "$response" | head -n -1)
    
    if [ "$http_code" -eq "$expected_status" ]; then
        echo -e "   ${GREEN}✅ $http_code - 成功${NC}"
        ((PASSED_TESTS++))
        
        # 如果是成功响应，显示部分内容
        if [ "$http_code" -eq 200 ] && [ -n "$body" ]; then
            echo "   响应内容: $(echo "$body" | head -c 100)..."
        fi
    else
        echo -e "   ${RED}❌ $http_code - 失败 (期望: $expected_status)${NC}"
        ((FAILED_TESTS++))
        
        if [ -n "$body" ]; then
            echo "   错误信息: $(echo "$body" | head -c 200)"
        fi
    fi
    
    echo
}

# 开始测试
echo "📋 开始文档API测试..."
echo

# 1. 基础文档API测试
echo "1️⃣ 基础文档功能测试"
echo "--------------------"

test_endpoint "获取文档列表" "GET" "/list"
test_endpoint "获取API文档" "GET" "/API_DOCUMENTATION.md"
test_endpoint "获取开发计划" "GET" "/DEVELOPMENT_PLAN.md"
test_endpoint "获取版本历史" "GET" "/VERSION_HISTORY.md"

# 2. 搜索功能测试
echo "2️⃣ 文档搜索功能测试"
echo "--------------------"

test_endpoint "搜索API相关文档" "GET" "/search?q=API"
test_endpoint "搜索开发相关文档" "GET" "/search?q=开发&category=development"
test_endpoint "限制搜索结果数量" "GET" "/search?q=文档&limit=5"

# 3. 格式化测试
echo "3️⃣ 文档格式化测试"
echo "--------------------"

test_endpoint "获取HTML格式文档" "GET" "/API_DOCUMENTATION.md?format=html"
test_endpoint "获取纯文本格式" "GET" "/API_DOCUMENTATION.md?format=text"

# 4. 错误处理测试
echo "4️⃣ 错误处理测试"
echo "--------------------"

test_endpoint "获取不存在的文档" "GET" "/NONEXISTENT_DOC.md" "" "" 404
test_endpoint "空搜索查询" "GET" "/search?q=" "" "" 400
test_endpoint "无效格式参数" "GET" "/API_DOCUMENTATION.md?format=invalid" "" "" 400

# 5. 反馈功能测试（如果token可用）
if [ -n "$TEST_TOKEN" ]; then
    echo "5️⃣ 反馈功能测试 (需要认证)"
    echo "--------------------"
    
    auth_header="Authorization: Bearer $TEST_TOKEN"
    
    test_feedback='{
        "type": "suggestion",
        "title": "文档API测试反馈",
        "content": "这是一个自动化测试提交的反馈",
        "priority": "low",
        "category": "api_test"
    }'
    
    test_endpoint "提交文档反馈" "POST" "/feedback" "$test_feedback" "$auth_header"
    test_endpoint "获取反馈列表" "GET" "/feedback/list?limit=3" "" "$auth_header"
else
    echo "5️⃣ 反馈功能测试"
    echo "--------------------"
    echo -e "${YELLOW}⏭️  跳过认证测试 (未设置TEST_TOKEN)${NC}"
    echo
fi

# 6. 性能和限制测试
echo "6️⃣ 性能和限制测试"
echo "--------------------"

test_endpoint "大量搜索结果" "GET" "/search?q=文档&limit=100"
test_endpoint "复杂查询参数" "GET" "/search?q=API开发&category=development&format=json&limit=10"

# 7. 特殊字符处理测试
echo "7️⃣ 特殊字符处理测试"
echo "--------------------"

test_endpoint "中文查询" "GET" "/search?q=学习质效分析"
test_endpoint "特殊字符查询" "GET" "/search?q=API%2BREST"

# 8. 其他文档端点测试
echo "8️⃣ 其他文档端点测试"
echo "--------------------"

test_endpoint "获取文档统计" "GET" "/stats"
test_endpoint "获取文档分类" "GET" "/categories"
test_endpoint "健康检查" "GET" "/health"

# 生成测试报告
echo "========================================"
echo "📊 文档API测试报告"
echo "========================================"
echo -e "总测试数: $TOTAL_TESTS"
echo -e "${GREEN}✅ 通过: $PASSED_TESTS${NC}"
echo -e "${RED}❌ 失败: $FAILED_TESTS${NC}"

if [ $TOTAL_TESTS -gt 0 ]; then
    success_rate=$((PASSED_TESTS * 100 / TOTAL_TESTS))
    echo -e "成功率: $success_rate%"
    
    if [ $success_rate -ge 90 ]; then
        echo -e "${GREEN}🎉 文档API状态优秀！${NC}"
    elif [ $success_rate -ge 70 ]; then
        echo -e "${YELLOW}⚠️  文档API状态良好，部分功能可能需要关注${NC}"
    else
        echo -e "${RED}🚨 文档API状态需要改进${NC}"
    fi
fi

echo
echo "💡 说明:"
echo "  - 此测试专门针对文档API功能"
echo "  - 如需完整API测试，请使用 dev-tools/api-tester/"
echo "  - 如需快速状态检查，请使用 scripts/api-check.sh"
echo "  - 测试时间: $(date)"

# 保存报告
report_file="/tmp/doc_api_test_report_$(date +%Y%m%d_%H%M%S).txt"
{
    echo "文档API测试报告"
    echo "测试时间: $(date)"
    echo "总测试数: $TOTAL_TESTS"
    echo "通过: $PASSED_TESTS"
    echo "失败: $FAILED_TESTS"
    echo "成功率: $((PASSED_TESTS * 100 / TOTAL_TESTS))%"
} > "$report_file"

echo
echo "📄 详细报告已保存到: $report_file"
echo "========================================"

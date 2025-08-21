#!/bin/bash

# 前后端API一致性检查脚本
set -e

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# 项目根目录
PROJECT_ROOT="/var/www/zhixiao-platform"
FRONTEND_SERVICES="$PROJECT_ROOT/frontend/services"
BACKEND_SERVICES="$PROJECT_ROOT/backend/src/services"
BACKEND_ROUTES="$PROJECT_ROOT/backend/src/routes"
BACKEND_CONTROLLERS="$PROJECT_ROOT/backend/src/controllers"

# 输出函数
log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# 检查目录是否存在
check_directories() {
    log_info "检查项目目录结构..."
    
    local dirs=("$FRONTEND_SERVICES" "$BACKEND_SERVICES" "$BACKEND_ROUTES" "$BACKEND_CONTROLLERS")
    for dir in "${dirs[@]}"; do
        if [ ! -d "$dir" ]; then
            log_error "目录不存在: $dir"
            return 1
        fi
    done
    
    log_success "目录结构检查通过"
}

# 获取服务文件列表
get_service_files() {
    local dir="$1"
    local prefix="$2"
    
    if [ -d "$dir" ]; then
        find "$dir" -name "*.js" -not -name "index.js" | while read -r file; do
            basename "$file" .js
        done | sort
    fi
}

# 检查服务文件一致性
check_service_consistency() {
    log_info "检查前后端服务文件一致性..."
    
    # 获取前端服务列表
    local frontend_services=$(get_service_files "$FRONTEND_SERVICES" "Frontend")
    local backend_services=$(get_service_files "$BACKEND_SERVICES" "Backend")
    
    echo "前端服务文件:"
    echo "$frontend_services" | sed 's/^/  - /'
    echo
    
    echo "后端服务文件:"
    echo "$backend_services" | sed 's/^/  - /'
    echo
    
    # 检查缺失的服务
    local missing_in_backend=""
    local missing_in_frontend=""
    
    # 检查后端缺失的服务
    while IFS= read -r service; do
        if [ -n "$service" ] && ! echo "$backend_services" | grep -q "^${service}$"; then
            missing_in_backend="$missing_in_backend $service"
        fi
    done <<< "$frontend_services"
    
    # 检查前端缺失的服务
    while IFS= read -r service; do
        if [ -n "$service" ] && ! echo "$frontend_services" | grep -q "^${service}$"; then
            missing_in_frontend="$missing_in_frontend $service"
        fi
    done <<< "$backend_services"
    
    # 报告结果
    if [ -n "$missing_in_backend" ]; then
        log_warning "后端缺失的服务:$missing_in_backend"
    fi
    
    if [ -n "$missing_in_frontend" ]; then
        log_warning "前端缺失的服务:$missing_in_frontend"
    fi
    
    if [ -z "$missing_in_backend" ] && [ -z "$missing_in_frontend" ]; then
        log_success "前后端服务文件一致"
    fi
}

# 提取JavaScript函数名
extract_js_methods() {
    local file="$1"
    if [ -f "$file" ]; then
        # 提取static方法和普通方法
        grep -n "static async\|async\|static " "$file" | \
        grep -E "(static\s+async\s+\w+|async\s+\w+|static\s+\w+)" | \
        sed -E 's/.*static\s+async\s+([a-zA-Z_][a-zA-Z0-9_]*).*/\1/' | \
        sed -E 's/.*async\s+([a-zA-Z_][a-zA-Z0-9_]*).*/\1/' | \
        sed -E 's/.*static\s+([a-zA-Z_][a-zA-Z0-9_]*).*/\1/' | \
        sort | uniq
    fi
}

# 检查API方法一致性
check_api_method_consistency() {
    log_info "检查API方法一致性..."
    
    # 检查每个服务的方法
    local common_services="AuthService UserService StudyService AnalysisService DocumentService AdminService NotificationService ExamService"
    
    for service in $common_services; do
        local frontend_file="$FRONTEND_SERVICES/${service}.js"
        local backend_file="$BACKEND_SERVICES/${service}.js"
        
        if [ -f "$frontend_file" ] && [ -f "$backend_file" ]; then
            echo "检查 $service 方法一致性:"
            
            local frontend_methods=$(extract_js_methods "$frontend_file")
            local backend_methods=$(extract_js_methods "$backend_file")
            
            echo "  前端方法:"
            echo "$frontend_methods" | sed 's/^/    - /'
            
            echo "  后端方法:"
            echo "$backend_methods" | sed 's/^/    - /'
            
            # 检查方法差异
            local missing_in_backend=""
            local missing_in_frontend=""
            
            while IFS= read -r method; do
                if [ -n "$method" ] && ! echo "$backend_methods" | grep -q "^${method}$"; then
                    missing_in_backend="$missing_in_backend $method"
                fi
            done <<< "$frontend_methods"
            
            while IFS= read -r method; do
                if [ -n "$method" ] && ! echo "$frontend_methods" | grep -q "^${method}$"; then
                    missing_in_frontend="$missing_in_frontend $method"
                fi
            done <<< "$backend_methods"
            
            if [ -n "$missing_in_backend" ]; then
                log_warning "  后端缺失方法:$missing_in_backend"
            fi
            
            if [ -n "$missing_in_frontend" ]; then
                log_warning "  前端缺失方法:$missing_in_frontend"
            fi
            
            if [ -z "$missing_in_backend" ] && [ -z "$missing_in_frontend" ]; then
                log_success "  $service 方法一致"
            fi
            
            echo
        elif [ ! -f "$frontend_file" ]; then
            log_error "前端服务文件不存在: $frontend_file"
        elif [ ! -f "$backend_file" ]; then
            log_error "后端服务文件不存在: $backend_file"
        fi
    done
}

# 检查路由和控制器一致性
check_route_controller_consistency() {
    log_info "检查路由和控制器一致性..."
    
    # 获取路由文件
    local route_files=$(find "$BACKEND_ROUTES" -name "*.js" -not -name "index.js" | sort)
    
    echo "检查路由文件:"
    for route_file in $route_files; do
        local route_name=$(basename "$route_file" .js)
        local controller_file="$BACKEND_CONTROLLERS/${route_name^}Controller.js"
        
        echo "  路由: $route_name"
        
        if [ -f "$controller_file" ]; then
            log_success "    对应控制器存在: ${route_name^}Controller.js"
        else
            log_warning "    对应控制器缺失: ${route_name^}Controller.js"
        fi
    done
    echo
}

# 检查服务是否在控制器中使用
check_service_usage_in_controllers() {
    log_info "检查控制器中的服务使用情况..."
    
    local controller_files=$(find "$BACKEND_CONTROLLERS" -name "*.js" | sort)
    
    for controller_file in $controller_files; do
        local controller_name=$(basename "$controller_file" .js)
        echo "检查控制器: $controller_name"
        
        # 检查是否导入了服务
        local imported_services=$(grep -n "require.*Service" "$controller_file" 2>/dev/null | grep -o "[A-Za-z]*Service" | sort | uniq)
        
        if [ -n "$imported_services" ]; then
            echo "  导入的服务:"
            echo "$imported_services" | sed 's/^/    - /'
        else
            log_warning "  未导入任何服务"
        fi
        echo
    done
}

# 生成一致性报告
generate_consistency_report() {
    local report_file="$PROJECT_ROOT/logs/api_consistency_report_$(date +%Y%m%d_%H%M%S).md"
    
    log_info "生成一致性报告: $report_file"
    
    {
        echo "# API一致性检查报告"
        echo "生成时间: $(date '+%Y-%m-%d %H:%M:%S')"
        echo
        echo "## 检查概述"
        echo "- 前端服务目录: $FRONTEND_SERVICES"
        echo "- 后端服务目录: $BACKEND_SERVICES"
        echo "- 后端路由目录: $BACKEND_ROUTES"
        echo "- 后端控制器目录: $BACKEND_CONTROLLERS"
        echo
        echo "## 服务文件列表"
        echo "### 前端服务"
        get_service_files "$FRONTEND_SERVICES" | sed 's/^/- /'
        echo
        echo "### 后端服务"
        get_service_files "$BACKEND_SERVICES" | sed 's/^/- /'
        echo
        echo "## 路由和控制器"
        find "$BACKEND_ROUTES" -name "*.js" -not -name "index.js" | while read -r route_file; do
            local route_name=$(basename "$route_file" .js)
            local controller_file="$BACKEND_CONTROLLERS/${route_name^}Controller.js"
            echo "- 路由: $route_name"
            if [ -f "$controller_file" ]; then
                echo "  - 控制器: ✅ ${route_name^}Controller.js"
            else
                echo "  - 控制器: ❌ 缺失 ${route_name^}Controller.js"
            fi
        done
        echo
        echo "## 改进建议"
        echo "1. 确保所有前端服务都有对应的后端服务实现"
        echo "2. 控制器应该使用服务层处理业务逻辑"
        echo "3. 保持前后端API接口命名一致"
        echo "4. 定期运行此检查脚本确保一致性"
    } > "$report_file"
    
    log_success "报告已生成: $report_file"
}

# 主函数
main() {
    echo "🔍 前后端API一致性检查工具"
    echo "================================"
    echo
    
    check_directories
    check_service_consistency
    check_api_method_consistency
    check_route_controller_consistency
    check_service_usage_in_controllers
    generate_consistency_report
    
    log_success "✅ API一致性检查完成！"
}

# 脚本入口
if [[ "${BASH_SOURCE[0]}" == "${0}" ]]; then
    main "$@"
fi

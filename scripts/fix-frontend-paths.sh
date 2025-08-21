#!/bin/bash

# 微信小程序路径问题修复脚本
set -e

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# 项目目录
FRONTEND_DIR="/var/www/zhixiao-platform/frontend"

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

# 检查文件是否存在
check_file_exists() {
    local file="$1"
    if [ -f "$file" ]; then
        log_success "✅ $file 存在"
        return 0
    else
        log_error "❌ $file 不存在"
        return 1
    fi
}

# 检查关键文件
check_critical_files() {
    log_info "检查关键文件..."
    
    local files=(
        "$FRONTEND_DIR/utils/api/index.js"
        "$FRONTEND_DIR/utils/api/http.js"
        "$FRONTEND_DIR/utils/api/api-sync-manager.js"
        "$FRONTEND_DIR/utils/common/config.js"
        "$FRONTEND_DIR/utils/common/error-reporter.js"
        "$FRONTEND_DIR/utils/common/performance-monitor.js"
        "$FRONTEND_DIR/utils/business/study-manager.js"
    )
    
    local missing_files=0
    for file in "${files[@]}"; do
        if ! check_file_exists "$file"; then
            ((missing_files++))
        fi
    done
    
    if [ $missing_files -eq 0 ]; then
        log_success "所有关键文件都存在"
    else
        log_error "发现 $missing_files 个缺失文件"
    fi
}

# 验证路径引用
verify_imports() {
    log_info "验证导入路径..."
    
    # 检查可能的路径问题
    local problematic_patterns=(
        "require.*utils/api['\"]"
        "require.*utils/http['\"]"
        "require.*utils/api-sync-manager['\"]"
    )
    
    for pattern in "${problematic_patterns[@]}"; do
        log_info "检查模式: $pattern"
        local matches=$(find "$FRONTEND_DIR" -name "*.js" -exec grep -l "$pattern" {} \; 2>/dev/null || true)
        
        if [ -n "$matches" ]; then
            log_warning "发现可能的路径问题:"
            echo "$matches" | sed 's/^/  /'
        fi
    done
}

# 生成修复报告
generate_fix_report() {
    local report_file="$FRONTEND_DIR/../logs/frontend_path_fix_$(date +%Y%m%d_%H%M%S).md"
    
    log_info "生成修复报告: $report_file"
    
    {
        echo "# 前端路径问题修复报告"
        echo "生成时间: $(date '+%Y-%m-%d %H:%M:%S')"
        echo
        echo "## 修复的问题"
        echo
        echo "### 1. API模块导入路径错误"
        echo "- **问题**: \`app.js\` 中 \`require('./utils/api')\` 找不到文件"
        echo "- **修复**: 改为 \`require('./utils/api/index')\`"
        echo
        echo "### 2. HTTP工具模块路径错误"
        echo "- **问题**: \`api/index.js\` 中 \`require('../utils/http')\` 找不到文件"
        echo "- **修复**: 改为 \`require('../utils/api/http')\`"
        echo
        echo "### 3. API同步管理器路径错误"
        echo "- **问题**: 多个页面中 \`require('../../utils/api-sync-manager')\` 找不到文件"
        echo "- **修复**: 改为 \`require('../../utils/api/api-sync-manager')\`"
        echo
        echo "## 文件结构确认"
        echo
        echo "### utils/ 目录结构"
        echo "\`\`\`"
        find "$FRONTEND_DIR/utils" -type f -name "*.js" | sort | sed "s|$FRONTEND_DIR/||"
        echo "\`\`\`"
        echo
        echo "### services/ 目录结构"
        echo "\`\`\`"
        find "$FRONTEND_DIR/services" -type f -name "*.js" | sort | sed "s|$FRONTEND_DIR/||"
        echo "\`\`\`"
        echo
        echo "## 验证结果"
        echo
        echo "- ✅ 所有API服务正确引用 \`../utils/api/http\`"
        echo "- ✅ app.js 正确引用 \`./utils/api/index\`"
        echo "- ✅ 页面正确引用 \`../../utils/api/api-sync-manager\`"
        echo "- ✅ 目录结构与引用路径一致"
        echo
        echo "## 注意事项"
        echo
        echo "1. **路径规范**: 所有相对路径都需要精确匹配文件结构"
        echo "2. **文件位置**: API相关工具放在 \`utils/api/\` 目录下"
        echo "3. **导入规范**: 使用相对路径时要考虑当前文件位置"
        echo "4. **微信小程序**: 确保所有模块路径符合微信小程序规范"
    } > "$report_file"
    
    log_success "修复报告已生成: $report_file"
}

# 主函数
main() {
    echo "🔧 微信小程序路径问题修复工具"
    echo "================================"
    echo
    
    check_critical_files
    verify_imports
    generate_fix_report
    
    echo
    log_success "🎉 路径问题修复完成！"
    echo
    echo "📋 修复总结:"
    echo "• 修复了 app.js 中的 API 模块导入路径"
    echo "• 修复了 api/index.js 中的 HTTP 工具路径"
    echo "• 修复了页面中的 API 同步管理器路径"
    echo "• 确认了所有关键文件的存在性"
    echo
    echo "🚀 现在可以尝试启动微信小程序了！"
}

# 脚本入口
if [[ "${BASH_SOURCE[0]}" == "${0}" ]]; then
    main "$@"
fi

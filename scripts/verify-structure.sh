#!/bin/bash

# 文件结构验证脚本
echo "验证文件结构整理结果..."

project_root="/var/www/zhixiao-platform"

# 检查后端新增的目录和文件
echo "=== 后端文件结构检查 ==="
backend_items=(
    "backend/src/services/UserService.js"
    "backend/src/services/StudyService.js"
    "backend/src/services/index.js"
    "backend/src/utils/common.js"
    "backend/src/utils/helpers.js"
    "backend/src/utils/index.js"
    "backend/src/validators/index.js"
    "backend/src/controllers/BaseController.js"
    "backend/src/config/swagger.js"
    "backend/src/middleware/index.js"
    "backend/tests/jest.config.js"
    "backend/tests/setup.js"
)

for item in "${backend_items[@]}"; do
    if [ -f "$project_root/$item" ]; then
        echo "✓ $item"
    else
        echo "✗ $item (缺失)"
    fi
done

# 检查前端新增的目录和文件
echo ""
echo "=== 前端文件结构检查 ==="
frontend_items=(
    "frontend/services/UserService.js"
    "frontend/services/StudyService.js"
    "frontend/services/index.js"
    "frontend/utils/api/index.js"
    "frontend/utils/api/http.js"
    "frontend/utils/common/config.js"
    "frontend/utils/common/storage-helper.js"
    "frontend/utils/common/error-reporter.js"
    "frontend/utils/common/performance-monitor.js"
    "frontend/utils/business/study-manager.js"
    "frontend/utils/business/data-validator.js"
    "frontend/utils/index.js"
)

for item in "${frontend_items[@]}"; do
    if [ -f "$project_root/$item" ]; then
        echo "✓ $item"
    else
        echo "✗ $item (缺失)"
    fi
done

# 检查文件移动是否成功
echo ""
echo "=== 文件移动检查 ==="
moved_files=(
    "frontend/utils/api/api-sync-manager.js"
    "frontend/utils/api/backend-check.js"
    "frontend/utils/api/document-api.js"
    "frontend/utils/api/frontend-api-checker.js"
    "frontend/utils/business/document-api-sync.js"
)

for item in "${moved_files[@]}"; do
    if [ -f "$project_root/$item" ]; then
        echo "✓ $item (已移动)"
    else
        echo "✗ $item (移动失败)"
    fi
done

# 检查目录结构
echo ""
echo "=== 目录结构检查 ==="
directories=(
    "backend/src/services"
    "backend/src/utils"
    "backend/src/validators"
    "backend/tests/unit/controllers"
    "backend/tests/unit/services"
    "backend/tests/integration"
    "frontend/services"
    "frontend/utils/api"
    "frontend/utils/common"
    "frontend/utils/business"
)

for dir in "${directories[@]}"; do
    if [ -d "$project_root/$dir" ]; then
        echo "✓ $dir/"
    else
        echo "✗ $dir/ (缺失)"
    fi
done

# 生成文件结构树状图
echo ""
echo "=== 生成文件结构树状图 ==="

# 生成后端结构
echo "后端核心结构:" > "$project_root/docs/backend_structure.txt"
tree "$project_root/backend/src" -I 'node_modules' >> "$project_root/docs/backend_structure.txt" 2>/dev/null || echo "tree命令不可用，跳过结构图生成"

# 生成前端结构
echo "前端核心结构:" > "$project_root/docs/frontend_structure.txt"
tree "$project_root/frontend" -I 'node_modules|dev-tools|temp' -L 3 >> "$project_root/docs/frontend_structure.txt" 2>/dev/null || echo "tree命令不可用，跳过结构图生成"

echo ""
echo "=== 验证完成 ==="
echo "详细结构图保存在 docs/ 目录中"
echo "如有缺失文件，请检查脚本执行日志或手动创建"

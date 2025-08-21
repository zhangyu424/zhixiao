#!/bin/bash

# 前端文件结构整理脚本
# 更新所有引用了移动文件的路径

echo "开始更新前端文件引用路径..."

# 定义文件映射关系
declare -A file_mappings=(
    ["./utils/http.js"]="./utils/api/http.js"
    ["./utils/api-sync-manager.js"]="./utils/api/api-sync-manager.js"
    ["./utils/backend-check.js"]="./utils/api/backend-check.js"
    ["./utils/document-api.js"]="./utils/api/document-api.js"
    ["./utils/frontend-api-checker.js"]="./utils/api/frontend-api-checker.js"
    ["./utils/storage-helper.js"]="./utils/common/storage-helper.js"
    ["./utils/error-reporter.js"]="./utils/common/error-reporter.js"
    ["./utils/performance-monitor.js"]="./utils/common/performance-monitor.js"
    ["./utils/data-validator.js"]="./utils/business/data-validator.js"
    ["./utils/document-api-sync.js"]="./utils/business/document-api-sync.js"
)

# 需要更新的文件类型
file_types="*.js *.json *.wxml"

# 遍历所有需要更新的文件
for file_type in $file_types; do
    find /var/www/zhixiao-platform/frontend -name "$file_type" -type f | while read file; do
        # 跳过 node_modules 目录
        if [[ "$file" == *"/node_modules/"* ]]; then
            continue
        fi
        
        # 为每个映射关系更新文件
        for old_path in "${!file_mappings[@]}"; do
            new_path="${file_mappings[$old_path]}"
            
            # 使用 sed 替换路径引用
            if grep -q "$old_path" "$file" 2>/dev/null; then
                echo "更新文件: $file"
                echo "  $old_path -> $new_path"
                sed -i "s|$old_path|$new_path|g" "$file"
            fi
        done
    done
done

echo "前端文件引用路径更新完成！"

# 创建新的索引文件
echo "创建工具模块索引文件..."

# 创建 utils/index.js
cat > /var/www/zhixiao-platform/frontend/utils/index.js << 'EOF'
// 工具模块统一导出文件
module.exports = {
  // API相关
  api: require('./api'),
  http: require('./api/http'),
  
  // 通用工具
  config: require('./common/config'),
  storage: require('./common/storage-helper'),
  errorReporter: require('./common/error-reporter'),
  performanceMonitor: require('./common/performance-monitor'),
  
  // 业务逻辑
  studyManager: require('./business/study-manager'),
  dataValidator: require('./business/data-validator'),
  
  // 常量
  constants: require('./constants'),
  permission: require('./permission'),
  configManager: require('./config-manager')
};
EOF

# 创建 services/index.js
cat > /var/www/zhixiao-platform/frontend/services/index.js << 'EOF'
// 服务模块统一导出文件
module.exports = {
  UserService: require('./UserService'),
  StudyService: require('./StudyService')
};
EOF

echo "索引文件创建完成！"
echo "文件结构整理完成！"

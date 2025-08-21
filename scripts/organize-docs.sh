#!/bin/bash

# 文档分类和清理脚本
# 用途: 自动将过程性文档移动到logs文件夹，保持docs文件夹的技术文档纯净性

PROJECT_ROOT="/var/www/zhixiao-platform"
DOCS_DIR="$PROJECT_ROOT/docs"
LOGS_DIR="$PROJECT_ROOT/logs"

echo "📁 开始文档分类和清理..."

# 创建logs目录（如果不存在）
mkdir -p "$LOGS_DIR"

# 定义过程性文档关键词模式
PROCESS_PATTERNS=(
    "*REPORT*"
    "*LOG*"  
    "*PLAN*"
    "*MIGRATION*"
    "*ANALYSIS*"
    "*COMPLETION*"
    "*ASSESSMENT*"
    "*HANDOVER*"
    "*CHECKLIST*"
    "*SUMMARY*"
    "*REORGANIZATION*"
    "*CLEANUP*"
    "*FIX*"
    "*IMPLEMENTATION*"
    "*DEPLOYMENT*"
)

# 定义技术文档模式（保留在docs中）
TECH_PATTERNS=(
    "README.md"
    "DEVELOPMENT.md"
    "API*.md"
    "INTEGRATION*.md"
    "CHANGELOG.md"
    "INDEX.md"
    "ARCHITECTURE*.md"
    "SECURITY*.md"
    "PERFORMANCE*.md"
)

# 函数：检查是否为技术文档
is_tech_doc() {
    local file="$1"
    local basename=$(basename "$file")
    
    for pattern in "${TECH_PATTERNS[@]}"; do
        if [[ "$basename" == $pattern ]]; then
            return 0
        fi
    done
    return 1
}

# 函数：检查是否为过程性文档
is_process_doc() {
    local file="$1"
    local basename=$(basename "$file")
    
    for pattern in "${PROCESS_PATTERNS[@]}"; do
        if [[ "$basename" == $pattern ]]; then
            return 0
        fi
    done
    return 1
}

# 移动过程性文档到logs
echo "🔄 移动过程性文档到logs文件夹..."
moved_count=0

if [ -d "$DOCS_DIR" ]; then
    for file in "$DOCS_DIR"/*; do
        if [ -f "$file" ]; then
            basename=$(basename "$file")
            
            # 跳过技术文档
            if is_tech_doc "$file"; then
                echo "✅ 保留技术文档: $basename"
                continue
            fi
            
            # 移动过程性文档
            if is_process_doc "$file"; then
                echo "📋 移动过程性文档: $basename -> logs/"
                mv "$file" "$LOGS_DIR/"
                ((moved_count++))
            else
                echo "❓ 需要手动检查: $basename"
            fi
        fi
    done
fi

# 清理重复文档
echo "🧹 清理重复文档..."
deleted_count=0

# 检查是否有重复的文档在frontend/zhixiaodocs中
FRONTEND_DOCS="$PROJECT_ROOT/frontend/zhixiaodocs"
if [ -d "$FRONTEND_DOCS" ]; then
    for doc in "$FRONTEND_DOCS"/*.md; do
        if [ -f "$doc" ]; then
            doc_name=$(basename "$doc")
            docs_version="$DOCS_DIR/$doc_name"
            
            if [ -f "$docs_version" ]; then
                echo "🗑️ 删除重复文档: docs/$doc_name (frontend/zhixiaodocs中已有)"
                rm "$docs_version"
                ((deleted_count++))
            fi
        fi
    done
fi

# 生成清理报告
echo "📊 生成清理报告..."
cat > "$LOGS_DIR/docs_organization_$(date +%Y%m%d_%H%M%S).md" << EOF
# 文档分类清理报告

**执行时间**: $(date '+%Y-%m-%d %H:%M:%S')

## 📈 统计结果

- **移动的过程性文档**: $moved_count 个
- **删除的重复文档**: $deleted_count 个

## 📁 当前文档分布

### docs/ 目录（技术文档）
$(ls -la "$DOCS_DIR" 2>/dev/null | grep -E '\.md$|\.txt$' | wc -l) 个文件

### logs/ 目录（过程性文档）
$(ls -la "$LOGS_DIR" 2>/dev/null | grep -E '\.md$|\.txt$' | wc -l) 个文件

### frontend/zhixiaodocs/ 目录（专项文档）
$(ls -la "$FRONTEND_DOCS" 2>/dev/null | grep -E '\.md$' | wc -l) 个文件

## 📋 文档分类原则

### ✅ 技术文档 (保留在 docs/)
- README.md - 项目说明
- DEVELOPMENT.md - 开发指南  
- API_REQUIREMENTS.md - API规范
- INTEGRATION_GUIDE.md - 集成指南
- CHANGELOG.md - 版本日志
- INDEX.md - 文档导航

### 📋 过程性文档 (移动到 logs/)
- 各种报告、日志、计划
- 临时性分析文档
- 问题修复记录
- 实施过程文档

### 🎯 专项文档 (frontend/zhixiaodocs/)
- 开发计划和任务清单
- 专门的API指南
- 详细版本历史
- 文档导航索引

---
**维护原则**: 技术文档长期保留，过程性文档及时归档，过时文档定期清理
EOF

echo ""
echo "✅ 文档分类和清理完成！"
echo "📋 移动过程性文档: $moved_count 个"
echo "🗑️ 删除重复文档: $deleted_count 个"
echo "📊 详细报告: logs/docs_organization_$(date +%Y%m%d_%H%M%S).md"
echo ""
echo "📂 当前文档结构:"
echo "├── docs/          # 核心技术文档"
echo "├── logs/          # 过程性文档和日志"
echo "└── frontend/zhixiaodocs/  # 前端专项文档"

#!/bin/bash
# release.sh - 自动版本发布脚本

set -e  # 出错时退出

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 日志函数
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

# 检查参数
if [ -z "$1" ]; then
    log_error "Usage: ./release.sh [patch|minor|major] [--dry-run]"
    echo "  patch:  1.2.0 -> 1.2.1 (bug fixes)"
    echo "  minor:  1.2.0 -> 1.3.0 (new features)"
    echo "  major:  1.2.0 -> 2.0.0 (breaking changes)"
    echo "  --dry-run: 模拟运行，不实际执行"
    exit 1
fi

VERSION_TYPE=$1
DRY_RUN=$2

# 检查版本类型
if [[ ! "$VERSION_TYPE" =~ ^(patch|minor|major)$ ]]; then
    log_error "Invalid version type: $VERSION_TYPE"
    exit 1
fi

log_info "开始 $VERSION_TYPE 版本发布流程..."

# 获取当前版本
CURRENT_VERSION=$(node -p "require('./package.json').version")
log_info "当前版本: $CURRENT_VERSION"

# 检查工作目录是否干净
if [ -n "$(git status --porcelain)" ]; then
    log_error "工作目录不干净，请先提交或暂存所有变更"
    git status
    exit 1
fi

# 检查是否在主分支
CURRENT_BRANCH=$(git branch --show-current)
if [ "$CURRENT_BRANCH" != "main" ] && [ "$CURRENT_BRANCH" != "master" ]; then
    log_warning "当前不在主分支 ($CURRENT_BRANCH)，是否继续? [y/N]"
    read -r response
    if [[ ! "$response" =~ ^[Yy]$ ]]; then
        log_info "发布已取消"
        exit 0
    fi
fi

# 拉取最新代码
log_info "拉取最新代码..."
if [ "$DRY_RUN" != "--dry-run" ]; then
    git pull origin "$CURRENT_BRANCH"
fi

# 运行测试
log_info "运行测试套件..."
if [ "$DRY_RUN" != "--dry-run" ]; then
    npm test || {
        log_error "测试失败，发布已取消"
        exit 1
    }
fi
log_success "测试通过"

# 运行代码质量检查
log_info "运行代码质量检查..."
if [ "$DRY_RUN" != "--dry-run" ]; then
    npm run lint || {
        log_error "代码质量检查失败，发布已取消"
        exit 1
    }
fi
log_success "代码质量检查通过"

# 更新版本号
log_info "更新版本号..."
if [ "$DRY_RUN" != "--dry-run" ]; then
    npm version "$VERSION_TYPE" --no-git-tag-version
fi

NEW_VERSION=$(node -p "require('./package.json').version")
log_success "版本号已更新: $CURRENT_VERSION -> $NEW_VERSION"

# 更新变更日志
log_info "更新变更日志..."
CHANGELOG_ENTRY="## [$NEW_VERSION] - $(date +%Y-%m-%d)

### Added
- 功能新增说明

### Changed
- 功能变更说明

### Fixed
- 问题修复说明

### Security
- 安全相关更新

"

if [ "$DRY_RUN" != "--dry-run" ]; then
    # 在CHANGELOG.md开头插入新条目
    if [ -f "CHANGELOG.md" ]; then
        echo "$CHANGELOG_ENTRY" | cat - CHANGELOG.md > temp && mv temp CHANGELOG.md
    else
        echo "$CHANGELOG_ENTRY" > CHANGELOG.md
    fi
fi

# 更新版本历史文档
log_info "更新版本历史文档..."
if [ "$DRY_RUN" != "--dry-run" ]; then
    # 更新docs/VERSION_HISTORY.md中的版本表格
    # 这里可以添加更复杂的文档更新逻辑
    log_info "请手动更新 docs/VERSION_HISTORY.md"
fi

# 提交版本变更
log_info "提交版本变更..."
if [ "$DRY_RUN" != "--dry-run" ]; then
    git add package.json CHANGELOG.md docs/
    git commit -m "chore: release v$NEW_VERSION

- 更新版本号到 $NEW_VERSION
- 更新变更日志
- 更新文档"
fi

# 创建标签
log_info "创建Git标签..."
if [ "$DRY_RUN" != "--dry-run" ]; then
    git tag -a "v$NEW_VERSION" -m "Release version $NEW_VERSION"
fi

# 推送到远程
log_info "推送到远程仓库..."
if [ "$DRY_RUN" != "--dry-run" ]; then
    git push origin "$CURRENT_BRANCH"
    git push origin "v$NEW_VERSION"
fi

# 部署检查
log_info "检查部署状态..."
if [ "$DRY_RUN" != "--dry-run" ]; then
    # 这里可以添加自动部署或部署检查逻辑
    log_info "请检查CI/CD流水线状态"
fi

# 发布完成
log_success "版本 v$NEW_VERSION 发布完成！"
echo ""
echo "📋 发布摘要:"
echo "  版本类型: $VERSION_TYPE"
echo "  旧版本: $CURRENT_VERSION"
echo "  新版本: $NEW_VERSION"
echo "  Git标签: v$NEW_VERSION"
echo ""
echo "🎯 后续步骤:"
echo "  1. 检查CI/CD流水线状态"
echo "  2. 验证部署环境"
echo "  3. 更新文档（如需要）"
echo "  4. 通知相关团队"
echo ""

if [ "$DRY_RUN" = "--dry-run" ]; then
    log_warning "这是模拟运行，实际未执行任何操作"
fi

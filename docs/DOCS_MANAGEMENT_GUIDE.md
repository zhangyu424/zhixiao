# 📚 文档管理规范

## 🎯 文档分类原则

### ✅ 技术文档 → `docs/` 文件夹
**用途**: 长期维护的核心技术文档  
**特点**: 稳定、权威、长期有效

- `README.md` - 项目说明和快速开始
- `DEVELOPMENT.md` - 完整开发指南  
- `API_REQUIREMENTS.md` - API接口规范
- `INTEGRATION_GUIDE.md` - 系统集成指南
- `CHANGELOG.md` - 版本更新日志
- `WECHAT_DEVTOOLS_SETUP.md` - 微信小程序开发工具配置指南

### 📋 过程性文档 → `logs/` 文件夹  
**用途**: 项目实施过程的记录和日志  
**特点**: 时效性、过程性、存档性

- 各种完成报告 (COMPLETION_REPORT)
- 分析报告 (ANALYSIS_REPORT)  
- 迁移计划 (MIGRATION_PLAN)
- 修复日志 (FIX_LOG)
- 重组记录 (REORGANIZATION)
- 系统日志文件

### 🎯 专项文档 → `frontend/zhixiaodocs/`
**用途**: 前端开发的专门文档  
**特点**: 专业性、实用性、及时性

- `DEVELOPMENT_PLAN.md` - 开发计划和API清单
- `DOCUMENT_API_GUIDE.md` - 文档API使用指南  
- `VERSION_HISTORY.md` - 详细版本历史
- `INDEX.md` - 前端文档导航

## 🔧 自动化工具

### `scripts/organize-docs.sh`
文档分类和清理脚本，功能包括:
- 自动识别文档类型
- 移动过程性文档到正确位置
- 清理重复和过时文档
- 生成分类报告

**使用方法**:
```bash
cd /var/www/zhixiao-platform
bash scripts/organize-docs.sh
```

## 📋 日常维护规范

### 新增文档时
1. **技术规范文档** → 放入 `docs/`
2. **过程记录文档** → 放入 `logs/`  
3. **前端专项文档** → 放入 `frontend/zhixiaodocs/`

### 定期清理
- 每月运行文档整理脚本
- 及时删除过时文档
- 合并重复内容
- 更新技术文档

### 命名规范
- **技术文档**: 使用功能性命名 (如 `API_REQUIREMENTS.md`)
- **过程文档**: 使用描述性命名 + 时间戳 (如 `CLEANUP_20250820.md`)
- **避免**: 含糊不清的名称

## 📊 当前文档统计

- **docs/** - 6个核心技术文档
- **logs/** - 15+个过程性文档和日志  
- **frontend/zhixiaodocs/** - 4个前端专项文档

## 🎯 维护目标

- **清晰分类**: 按功能和用途分类存放
- **及时清理**: 过时文档及时删除或归档
- **避免重复**: 一个功能只有一个权威文档
- **易于维护**: 文档结构简单明了

---

**建立时间**: 2025-08-20  
**维护原则**: 技术文档长期保留，过程文档及时归档，过时文档定期清理  
**自动化**: 使用脚本工具辅助管理

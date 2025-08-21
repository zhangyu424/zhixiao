# 前端API调用检查报告

## 📊 总体统计

- **检查时间**: 2025-08-20T01:05:17.564Z
- **扫描文件**: 29 个
- **API调用**: 1 个
- **唯一API**: 1 个

## 🔍 检查结果

### API配置状态
- ✅ **已配置API**: 15 个
- ❌ **缺失配置**: 1 个
- ⚠️  **冗余配置**: 15 个

### 页面API使用
- **account-binding**: 0 个API调用
- **analysis**: 0 个API调用
- **api-sync-status**: 0 个API调用
- **backend-test**: 0 个API调用
- **docs-viewer**: 0 个API调用
- **index**: 1 个API调用
- **management**: 0 个API调用
- **profile**: 0 个API调用
- **role-switch**: 0 个API调用
- **study-report**: 0 个API调用
- **unified-login**: 0 个API调用
- **unit-select**: 0 个API调用

## 💡 修复建议


### 1. 添加缺失的API配置 (high)
有 1 个API在代码中使用但未在管理器中配置

**操作**: 在 utils/api-sync-manager.js 的 requiredAPIs 中添加这些API配置

### 2. 清理冗余的API配置 (medium)
有 15 个API已配置但代码中未使用

**操作**: 考虑从管理器中移除这些未使用的API配置，或在代码中实现对应功能

### 3. 页面API使用分析 (low)
11 个页面可能需要API集成

**操作**: 检查这些页面是否需要API功能


## 🔧 缺失的API配置


需要在 `utils/api-sync-manager.js` 中添加以下API配置:

```javascript
// ${baseUrl}/auth/validate-token - validate-token操作
```


## 📋 下一步行动

1. **立即修复** (高优先级)
   - 添加缺失的API配置

2. **计划修复** (中优先级)  
   - 清理冗余的API配置

3. **后续优化** (低优先级)
   - 页面API使用分析

---
*报告生成时间: 2025/8/20 09:05:17*

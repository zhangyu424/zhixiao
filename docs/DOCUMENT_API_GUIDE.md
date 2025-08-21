# 📚 文档交互API使用指南

## 🎯 概述

文档交互API为前端提供了完整的文档访问和反馈功能，支持：
- 📋 获取技术文档列表和内容
- 🔍 文档搜索功能
- 💬 提交需求和问题反馈
- 📊 反馈管理（管理员）

## 🔌 API端点

### 📋 1. 获取文档列表
```
GET /api/docs/list
```

**响应示例：**
```json
{
  "success": true,
  "data": {
    "total": 16,
    "categories": {
      "development": [
        {
          "id": "API_TODO_LIST",
          "filename": "API_TODO_LIST.md",
          "title": "API接口实现清单",
          "category": "development",
          "size": 6981,
          "lastModified": "2025-08-20T05:27:00.000Z",
          "description": "API接口实现清单和优先级"
        }
      ],
      "deployment": [...],
      "integration": [...],
      "management": [...]
    },
    "list": [...]
  },
  "message": "文档列表获取成功"
}
```

### 📖 2. 获取具体文档
```
GET /api/docs/:docId?format=markdown|html
```

**参数：**
- `docId`: 文档ID（如：API_TODO_LIST）
- `format`: 返回格式，markdown或html（默认markdown）

**响应示例：**
```json
{
  "success": true,
  "data": {
    "id": "API_TODO_LIST",
    "filename": "API_TODO_LIST.md",
    "title": "API接口实现清单",
    "content": "# API接口实现清单\n\n## P0紧急功能...",
    "format": "markdown",
    "category": "development",
    "size": 6981,
    "lastModified": "2025-08-20T05:27:00.000Z",
    "metadata": {
      "lastUpdated": "2025-08-20",
      "version": "v1.2.0"
    }
  },
  "message": "文档获取成功"
}
```

### 🔍 3. 搜索文档
```
GET /api/docs/search?q=关键词&category=development&limit=10
```

**参数：**
- `q`: 搜索关键词（必需，至少2个字符）
- `category`: 文档类别过滤（可选）
- `limit`: 结果数量限制（默认10）

**响应示例：**
```json
{
  "success": true,
  "data": {
    "query": "API",
    "total": 5,
    "results": [
      {
        "id": "API_TODO_LIST",
        "filename": "API_TODO_LIST.md",
        "title": "API接口实现清单",
        "category": "development",
        "snippet": "...API接口实现清单和优先级管理...",
        "relevance": 15,
        "matches": 8
      }
    ]
  },
  "message": "找到 5 个相关文档"
}
```

### 💬 4. 提交反馈
```
POST /api/docs/feedback
Authorization: Bearer <token>
```

**请求体：**
```json
{
  "type": "requirement",
  "title": "新增用户导出功能",
  "content": "希望能够提供用户数据导出功能，支持Excel和CSV格式...",
  "priority": "high",
  "category": "feature"
}
```

**反馈类型：**
- `requirement`: 需求建议
- `issue`: 问题报告
- `question`: 疑问咨询
- `suggestion`: 改进建议

**优先级：**
- `low`: 低优先级
- `medium`: 中等优先级
- `high`: 高优先级
- `urgent`: 紧急

**响应示例：**
```json
{
  "success": true,
  "data": {
    "id": "feedback_1692547200000_abc123",
    "type": "requirement",
    "title": "新增用户导出功能",
    "status": "open",
    "createdAt": "2025-08-20T10:00:00.000Z"
  },
  "message": "反馈提交成功，感谢您的建议！"
}
```

### 📊 5. 获取反馈列表（管理员）
```
GET /api/docs/feedback/list?type=requirement&status=open&limit=20&offset=0
Authorization: Bearer <admin_token>
```

**参数：**
- `type`: 反馈类型过滤
- `status`: 状态过滤（open/in-progress/resolved/closed）
- `limit`: 每页数量
- `offset`: 偏移量

## 🎨 前端集成示例

### React集成示例

```javascript
// DocumentAPI.js
class DocumentAPI {
  constructor(baseURL = '/api/docs') {
    this.baseURL = baseURL;
  }

  // 获取文档列表
  async getDocumentList() {
    const response = await fetch(`${this.baseURL}/list`);
    return response.json();
  }

  // 获取文档内容
  async getDocument(docId, format = 'markdown') {
    const response = await fetch(`${this.baseURL}/${docId}?format=${format}`);
    return response.json();
  }

  // 搜索文档
  async searchDocuments(query, category = '', limit = 10) {
    const params = new URLSearchParams({
      q: query,
      limit: limit.toString()
    });
    if (category) params.append('category', category);
    
    const response = await fetch(`${this.baseURL}/search?${params}`);
    return response.json();
  }

  // 提交反馈
  async submitFeedback(feedback, token) {
    const response = await fetch(`${this.baseURL}/feedback`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(feedback)
    });
    return response.json();
  }
}

// 使用示例
const docAPI = new DocumentAPI();

// 获取文档列表
const documentList = await docAPI.getDocumentList();
console.log('文档列表:', documentList.data.categories);

// 获取API清单文档
const apiDoc = await docAPI.getDocument('API_TODO_LIST');
console.log('文档内容:', apiDoc.data.content);

// 搜索API相关文档
const searchResults = await docAPI.searchDocuments('API');
console.log('搜索结果:', searchResults.data.results);

// 提交需求反馈
const feedback = {
  type: 'requirement',
  title: '新增批量操作功能',
  content: '希望能够支持批量删除和编辑用户',
  priority: 'medium',
  category: 'feature'
};
const result = await docAPI.submitFeedback(feedback, userToken);
console.log('反馈结果:', result);
```

### Vue.js集成示例

```javascript
// composables/useDocuments.js
import { ref, reactive } from 'vue'

export function useDocuments() {
  const documents = ref([])
  const loading = ref(false)
  const error = ref(null)

  const fetchDocuments = async () => {
    loading.value = true
    try {
      const response = await fetch('/api/docs/list')
      const result = await response.json()
      
      if (result.success) {
        documents.value = result.data.list
      } else {
        error.value = result.message
      }
    } catch (err) {
      error.value = '获取文档失败'
    } finally {
      loading.value = false
    }
  }

  const searchDocuments = async (query) => {
    if (!query || query.length < 2) return []
    
    try {
      const response = await fetch(`/api/docs/search?q=${encodeURIComponent(query)}`)
      const result = await response.json()
      return result.success ? result.data.results : []
    } catch (err) {
      console.error('搜索失败:', err)
      return []
    }
  }

  return {
    documents,
    loading,
    error,
    fetchDocuments,
    searchDocuments
  }
}

// components/DocumentViewer.vue
<template>
  <div class="document-viewer">
    <div class="search-box">
      <input 
        v-model="searchQuery" 
        @input="handleSearch"
        placeholder="搜索文档..."
        class="search-input"
      />
    </div>
    
    <div class="document-list">
      <div 
        v-for="doc in displayDocuments" 
        :key="doc.id"
        @click="selectDocument(doc.id)"
        class="document-item"
      >
        <h3>{{ doc.title }}</h3>
        <p>{{ doc.description }}</p>
        <span class="category">{{ doc.category }}</span>
      </div>
    </div>
    
    <div v-if="selectedDocument" class="document-content">
      <h2>{{ selectedDocument.title }}</h2>
      <div v-html="selectedDocument.content"></div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useDocuments } from '@/composables/useDocuments'

const { documents, loading, fetchDocuments, searchDocuments } = useDocuments()
const searchQuery = ref('')
const searchResults = ref([])
const selectedDocument = ref(null)

const displayDocuments = computed(() => {
  return searchQuery.value ? searchResults.value : documents.value
})

const handleSearch = async () => {
  if (searchQuery.value) {
    searchResults.value = await searchDocuments(searchQuery.value)
  } else {
    searchResults.value = []
  }
}

const selectDocument = async (docId) => {
  try {
    const response = await fetch(`/api/docs/${docId}?format=html`)
    const result = await response.json()
    
    if (result.success) {
      selectedDocument.value = result.data
    }
  } catch (error) {
    console.error('加载文档失败:', error)
  }
}

onMounted(() => {
  fetchDocuments()
})
</script>
```

## 📝 反馈提交组件示例

```javascript
// FeedbackForm.vue
<template>
  <form @submit.prevent="submitFeedback" class="feedback-form">
    <h3>提交反馈</h3>
    
    <div class="form-group">
      <label>反馈类型：</label>
      <select v-model="feedback.type" required>
        <option value="requirement">需求建议</option>
        <option value="issue">问题报告</option>
        <option value="question">疑问咨询</option>
        <option value="suggestion">改进建议</option>
      </select>
    </div>
    
    <div class="form-group">
      <label>优先级：</label>
      <select v-model="feedback.priority">
        <option value="low">低</option>
        <option value="medium">中</option>
        <option value="high">高</option>
        <option value="urgent">紧急</option>
      </select>
    </div>
    
    <div class="form-group">
      <label>标题：</label>
      <input v-model="feedback.title" type="text" required />
    </div>
    
    <div class="form-group">
      <label>详细描述：</label>
      <textarea v-model="feedback.content" rows="5" required></textarea>
    </div>
    
    <button type="submit" :disabled="submitting">
      {{ submitting ? '提交中...' : '提交反馈' }}
    </button>
  </form>
</template>

<script setup>
import { ref, reactive } from 'vue'

const feedback = reactive({
  type: 'suggestion',
  title: '',
  content: '',
  priority: 'medium',
  category: 'general'
})

const submitting = ref(false)

const submitFeedback = async () => {
  submitting.value = true
  
  try {
    const token = localStorage.getItem('authToken')
    const response = await fetch('/api/docs/feedback', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(feedback)
    })
    
    const result = await response.json()
    
    if (result.success) {
      alert('反馈提交成功！')
      // 重置表单
      Object.assign(feedback, {
        type: 'suggestion',
        title: '',
        content: '',
        priority: 'medium',
        category: 'general'
      })
    } else {
      alert('提交失败：' + result.message)
    }
  } catch (error) {
    alert('提交失败，请稍后重试')
  } finally {
    submitting.value = false
  }
}
</script>
```

## 🔒 权限说明

- **📖 文档访问**: 无需认证，公开访问
- **🔍 文档搜索**: 无需认证，公开访问
- **💬 提交反馈**: 需要用户认证
- **📊 反馈管理**: 需要管理员权限

## 📊 使用场景

### 🎨 前端开发场景
1. **API文档查询**: 快速查找接口定义和使用方法
2. **集成指南**: 获取前端集成的详细步骤
3. **问题反馈**: 遇到集成问题时快速提交
4. **需求建议**: 提出新功能需求

### 🛠️ 后端维护场景
1. **文档同步**: 自动获取最新的技术文档
2. **需求收集**: 收集前端团队的需求和建议
3. **问题跟踪**: 跟踪和处理技术问题
4. **协作改进**: 基于反馈持续改进API

## 🎯 最佳实践

### 📋 文档组织
- 保持文档结构清晰
- 及时更新文档内容
- 使用统一的markdown格式

### 💬 反馈管理
- 及时响应用户反馈
- 分类管理不同类型的反馈
- 建立反馈处理流程

### 🔍 搜索优化
- 使用清晰的文档标题
- 在文档中包含关键词
- 保持内容的准确性

---

**📋 最后更新**: 2025-08-20  
**🔌 API版本**: v1.2.0  
**✅ 功能状态**: 🟢 已实现

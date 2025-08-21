/**
 * 文档API客户端 - 核心模块
 * 仅供开发过程使用，不要集成到前端生产代码中
 */

class DocumentAPIClient {
  constructor(baseURL = 'http://140.143.143.195/api/docs') {
    this.baseURL = baseURL;
    this.token = null;
  }

  /**
   * 设置认证token
   */
  setToken(token) {
    this.token = token;
  }

  /**
   * 通用请求方法
   */
  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;
    const headers = {
      'Content-Type': 'application/json',
      ...options.headers
    };

    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }

    try {
      const response = await fetch(url, {
        ...options,
        headers
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          `HTTP ${response.status}: ${data.message || '请求失败'}`
        );
      }

      return data;
    } catch (error) {
      console.error(`API请求失败 [${endpoint}]:`, error.message);
      throw error;
    }
  }

  /**
   * 获取文档列表
   */
  async getDocumentList() {
    console.log('📋 获取文档列表...');
    const result = await this.request('/list');
    console.log(`✅ 获取到 ${result.data.total} 个文档`);
    return result;
  }

  /**
   * 获取具体文档
   */
  async getDocument(docId, format = 'markdown') {
    console.log(`📖 获取文档: ${docId} (格式: ${format})`);
    const result = await this.request(`/${docId}?format=${format}`);
    console.log(`✅ 文档获取成功: ${result.data.title}`);
    return result;
  }

  /**
   * 搜索文档
   */
  async searchDocuments(query, category = '', limit = 10) {
    console.log(
      `🔍 搜索文档: "${query}" ${category ? `(类别: ${category})` : ''}`
    );

    const params = new URLSearchParams({
      q: query,
      limit: limit.toString()
    });

    if (category) {
      params.append('category', category);
    }

    const result = await this.request(`/search?${params}`);
    console.log(`✅ 找到 ${result.data.total} 个相关文档`);
    return result;
  }

  /**
   * 提交反馈
   */
  async submitFeedback(feedback) {
    if (!this.token) {
      throw new Error('提交反馈需要认证token');
    }

    console.log(`💬 提交反馈: ${feedback.title} (类型: ${feedback.type})`);

    const result = await this.request('/feedback', {
      method: 'POST',
      body: JSON.stringify(feedback)
    });

    console.log(`✅ 反馈提交成功: ${result.data.id}`);
    return result;
  }

  /**
   * 获取反馈列表 (管理员功能)
   */
  async getFeedbackList(filters = {}) {
    if (!this.token) {
      throw new Error('获取反馈列表需要认证token');
    }

    console.log('📊 获取反馈列表...');

    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value) params.append(key, value.toString());
    });

    const result = await this.request(`/feedback/list?${params}`);
    console.log(`✅ 获取到 ${result.data.total || 0} 条反馈`);
    return result;
  }

  /**
   * 显示文档列表
   */
  async displayDocumentList() {
    try {
      const result = await this.getDocumentList();
      const { categories, total } = result.data;

      console.log('\n📚 文档列表:');
      console.log('='.repeat(50));
      console.log(`总计: ${total} 个文档\n`);

      Object.entries(categories).forEach(([category, docs]) => {
        console.log(`📁 ${category.toUpperCase()}:`);
        docs.forEach(doc => {
          console.log(`  📄 ${doc.id} - ${doc.title}`);
          console.log(`     ${doc.description || '无描述'}`);
          console.log(
            `     更新时间: ${new Date(doc.lastModified).toLocaleString()}`
          );
          console.log('');
        });
      });

      return result;
    } catch (error) {
      console.error('❌ 获取文档列表失败:', error.message);
      throw error;
    }
  }

  /**
   * 显示文档内容
   */
  async displayDocument(docId, format = 'markdown') {
    try {
      const result = await this.getDocument(docId, format);
      const doc = result.data;

      console.log('\n📖 文档内容:');
      console.log('='.repeat(50));
      console.log(`标题: ${doc.title}`);
      console.log(`ID: ${doc.id}`);
      console.log(`类别: ${doc.category}`);
      console.log(`格式: ${doc.format}`);
      console.log(`大小: ${doc.size} 字节`);
      console.log(`更新时间: ${new Date(doc.lastModified).toLocaleString()}`);
      console.log('-'.repeat(50));
      console.log(doc.content);
      console.log('='.repeat(50));

      return result;
    } catch (error) {
      console.error(`❌ 获取文档失败 [${docId}]:`, error.message);
      throw error;
    }
  }

  /**
   * 显示搜索结果
   */
  async displaySearchResults(query, category = '', limit = 10) {
    try {
      const result = await this.searchDocuments(query, category, limit);
      const { results, total } = result.data;

      console.log('\n🔍 搜索结果:');
      console.log('='.repeat(50));
      console.log(`搜索词: "${query}"`);
      console.log(`找到: ${total} 个相关文档\n`);

      results.forEach((doc, index) => {
        console.log(`${index + 1}. 📄 ${doc.title} (${doc.id})`);
        console.log(`   类别: ${doc.category}`);
        console.log(`   相关度: ${doc.relevance}/20, 匹配: ${doc.matches}处`);
        console.log(`   摘要: ${doc.snippet}`);
        console.log('');
      });

      return result;
    } catch (error) {
      console.error('❌ 搜索失败:', error.message);
      throw error;
    }
  }

  /**
   * 提交开发反馈
   */
  async submitDevFeedback(type, title, content, priority = 'medium') {
    const feedback = {
      type,
      title,
      content,
      priority,
      category: 'development'
    };

    try {
      const result = await this.submitFeedback(feedback);

      console.log('\n💬 反馈提交成功:');
      console.log('='.repeat(30));
      console.log(`ID: ${result.data.id}`);
      console.log(`标题: ${result.data.title}`);
      console.log(`状态: ${result.data.status}`);
      console.log(
        `创建时间: ${new Date(result.data.createdAt).toLocaleString()}`
      );

      return result;
    } catch (error) {
      console.error('❌ 提交反馈失败:', error.message);
      throw error;
    }
  }
}

// Node.js环境导出
if (typeof module !== 'undefined' && module.exports) {
  module.exports = DocumentAPIClient;
}

// 浏览器环境
if (typeof window !== 'undefined') {
  window.DocumentAPIClient = DocumentAPIClient;
}

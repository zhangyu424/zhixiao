const fs = require('fs').promises;
const path = require('path');

class DocumentController {
  // 获取文档列表
  static async getDocumentList(req, res) {
    try {
      const docsPath = path.join(__dirname, '../../zhixiaodocs');
      const files = await fs.readdir(docsPath);
      
      // 过滤markdown文件并获取文件信息
      const documentList = [];
      
      for (const file of files) {
        if (file.endsWith('.md')) {
          const filePath = path.join(docsPath, file);
          const stats = await fs.stat(filePath);
          
          // 读取文件前几行获取标题和描述
          const content = await fs.readFile(filePath, 'utf-8');
          const lines = content.split('\n');
          const title = lines.find(line => line.startsWith('# '))?.replace('# ', '') || file.replace('.md', '');
          
          documentList.push({
            id: file.replace('.md', ''),
            filename: file,
            title: title,
            category: DocumentController.categorizeDocument(file),
            size: stats.size,
            lastModified: stats.mtime,
            description: DocumentController.getDocumentDescription(file)
          });
        }
      }
      
      // 按类别分组
      const categorized = DocumentController.groupByCategory(documentList);
      
      res.json({
        success: true,
        data: {
          total: documentList.length,
          categories: categorized,
          list: documentList.sort((a, b) => b.lastModified - a.lastModified)
        },
        message: '文档列表获取成功'
      });
    } catch (error) {
      console.error('获取文档列表失败:', error);
      res.status(500).json({
        success: false,
        message: '获取文档列表失败，请稍后重试'
      });
    }
  }

  // 获取具体文档内容
  static async getDocument(req, res) {
    try {
      let { docId } = req.params;
      const { format = 'markdown' } = req.query;
      
      // 如果docId包含.md扩展名，去掉它
      if (docId.endsWith('.md')) {
        docId = docId.slice(0, -3);
      }
      
      // 安全检查：防止路径遍历攻击
      if (docId.includes('..') || docId.includes('/') || docId.includes('\\')) {
        return res.status(400).json({
          success: false,
          message: '文档ID无效'
        });
      }
      
      const docsPath = path.join(__dirname, '../../zhixiaodocs');
      const filePath = path.join(docsPath, `${docId}.md`);
      
      // 检查文件是否存在
      try {
        await fs.access(filePath);
      } catch {
        return res.status(404).json({
          success: false,
          message: '文档不存在'
        });
      }
      
      const content = await fs.readFile(filePath, 'utf-8');
      const stats = await fs.stat(filePath);
      
      const response = {
        success: true,
        data: {
          id: docId,
          filename: `${docId}.md`,
          title: DocumentController.extractTitle(content),
          content: format === 'html' ? DocumentController.markdownToHtml(content) : content,
          format: format,
          category: DocumentController.categorizeDocument(`${docId}.md`),
          size: stats.size,
          lastModified: stats.mtime,
          metadata: DocumentController.extractMetadata(content)
        },
        message: '文档获取成功'
      };
      
      res.json(response);
    } catch (error) {
      console.error('获取文档失败:', error);
      res.status(500).json({
        success: false,
        message: '获取文档失败，请稍后重试'
      });
    }
  }

  // 搜索文档
  static async searchDocuments(req, res) {
    try {
      const { q: query, category, limit = 10 } = req.query;
      
      if (!query || query.length < 2) {
        return res.status(400).json({
          success: false,
          message: '搜索关键词至少需要2个字符'
        });
      }
      
      const docsPath = path.join(__dirname, '../../zhixiaodocs');
      const files = await fs.readdir(docsPath);
      const results = [];
      
      for (const file of files) {
        if (!file.endsWith('.md')) continue;
        
        // 如果指定了类别，只搜索该类别的文档
        if (category && DocumentController.categorizeDocument(file) !== category) continue;
        
        const filePath = path.join(docsPath, file);
        const content = await fs.readFile(filePath, 'utf-8');
        
        // 搜索标题和内容
        const title = DocumentController.extractTitle(content);
        const searchText = (title + ' ' + content).toLowerCase();
        const queryLower = query.toLowerCase();
        
        if (searchText.includes(queryLower)) {
          // 计算匹配度
          const titleMatch = title.toLowerCase().includes(queryLower);
          const contentMatches = content.toLowerCase().split(queryLower).length - 1;
          
          // 提取匹配的片段
          const snippet = DocumentController.extractSnippet(content, query);
          
          results.push({
            id: file.replace('.md', ''),
            filename: file,
            title: title,
            category: DocumentController.categorizeDocument(file),
            snippet: snippet,
            relevance: titleMatch ? contentMatches + 10 : contentMatches,
            matches: contentMatches
          });
        }
      }
      
      // 按相关度排序并限制结果数量
      const sortedResults = results
        .sort((a, b) => b.relevance - a.relevance)
        .slice(0, parseInt(limit));
      
      res.json({
        success: true,
        data: {
          query: query,
          total: results.length,
          results: sortedResults
        },
        message: `找到 ${results.length} 个相关文档`
      });
    } catch (error) {
      console.error('搜索文档失败:', error);
      res.status(500).json({
        success: false,
        message: '搜索文档失败，请稍后重试'
      });
    }
  }

  // 提交需求或问题
  static async submitFeedback(req, res) {
    try {
      const userId = req.user?.id || 'anonymous';
      const { type, title, content, priority = 'medium', category = 'general' } = req.body;
      
      // 验证输入
      if (!type || !['requirement', 'issue', 'question', 'suggestion'].includes(type)) {
        return res.status(400).json({
          success: false,
          message: '反馈类型无效，支持: requirement, issue, question, suggestion'
        });
      }
      
      if (!title || !content) {
        return res.status(400).json({
          success: false,
          message: '标题和内容不能为空'
        });
      }
      
      // 创建反馈记录
      const feedback = {
        id: DocumentController.generateFeedbackId(),
        type: type,
        title: title.trim(),
        content: content.trim(),
        priority: priority,
        category: category,
        status: 'open',
        userId: userId,
        userAgent: req.headers['user-agent'] || '',
        ip: req.ip || req.connection.remoteAddress,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      
      // 保存到文件
      await DocumentController.saveFeedback(feedback);
      
      // 记录日志
      console.log(`新的${type}提交:`, {
        id: feedback.id,
        title: feedback.title,
        userId: userId
      });
      
      res.status(201).json({
        success: true,
        data: {
          id: feedback.id,
          type: feedback.type,
          title: feedback.title,
          status: feedback.status,
          createdAt: feedback.createdAt
        },
        message: '反馈提交成功，感谢您的建议！'
      });
    } catch (error) {
      console.error('提交反馈失败:', error);
      res.status(500).json({
        success: false,
        message: '提交反馈失败，请稍后重试'
      });
    }
  }

  // 获取反馈列表（管理员功能）
  static async getFeedbackList(req, res) {
    try {
      // TODO: 添加管理员权限检查
      const { type, status, limit = 20, offset = 0 } = req.query;
      
      const feedbackData = await DocumentController.loadFeedbackData();
      let filtered = feedbackData;
      
      // 过滤条件
      if (type) {
        filtered = filtered.filter(item => item.type === type);
      }
      if (status) {
        filtered = filtered.filter(item => item.status === status);
      }
      
      // 排序和分页
      const sorted = filtered.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      const paginated = sorted.slice(parseInt(offset), parseInt(offset) + parseInt(limit));
      
      res.json({
        success: true,
        data: {
          total: filtered.length,
          items: paginated,
          pagination: {
            limit: parseInt(limit),
            offset: parseInt(offset),
            hasMore: (parseInt(offset) + parseInt(limit)) < filtered.length
          }
        },
        message: '反馈列表获取成功'
      });
    } catch (error) {
      console.error('获取反馈列表失败:', error);
      res.status(500).json({
        success: false,
        message: '获取反馈列表失败，请稍后重试'
      });
    }
  }

  // 辅助方法
  static categorizeDocument(filename) {
    const categories = {
      'development': ['DEVELOPMENT_PLAN', 'API_TODO_LIST', 'API_IMPLEMENTATION', 'VERSION_HISTORY', 'API_VERSION_MANAGEMENT', 'RELEASE_CHECKLIST', 'VERSION_MANAGEMENT', 'P0_COMPLETION', 'DOCS_'],
      'deployment': ['PRODUCTION_READINESS', 'PORT_CONFIGURATION', 'REMOTE-DEPLOY'],
      'integration': ['FRONTEND_INTEGRATION', 'README'],
      'management': ['INDEX']
    };
    
    for (const [category, patterns] of Object.entries(categories)) {
      if (patterns.some(pattern => filename.includes(pattern))) {
        return category;
      }
    }
    return 'other';
  }

  static getDocumentDescription(filename) {
    const descriptions = {
      'INDEX.md': '文档索引和导航中心',
      'DEVELOPMENT_PLAN.md': '完整的开发计划和时间表',
      'API_TODO_LIST.md': 'API接口实现清单和优先级',
      'API_IMPLEMENTATION_SUMMARY.md': 'API实现进度总结',
      'VERSION_HISTORY.md': '版本发布记录和API变更',
      'API_VERSION_MANAGEMENT.md': 'API版本管理规范和策略',
      'RELEASE_CHECKLIST.md': '版本发布检查清单',
      'FRONTEND_INTEGRATION_GUIDE.md': '前端集成指南和API文档',
      'PRODUCTION_READINESS_ASSESSMENT.md': '生产环境就绪评估',
      'PORT_CONFIGURATION_GUIDE.md': '端口配置和安全指南',
      'REMOTE-DEPLOY-HANDOVER.md': '部署交接文档'
    };
    return descriptions[filename] || '项目相关文档';
  }

  static groupByCategory(documents) {
    const grouped = {};
    documents.forEach(doc => {
      const category = doc.category;
      if (!grouped[category]) {
        grouped[category] = [];
      }
      grouped[category].push(doc);
    });
    return grouped;
  }

  static extractTitle(content) {
    const lines = content.split('\n');
    const titleLine = lines.find(line => line.startsWith('# '));
    return titleLine ? titleLine.replace('# ', '').trim() : '无标题';
  }

  static extractMetadata(content) {
    const metadata = {};
    const lines = content.split('\n');
    
    // 提取更新时间、版本等信息
    for (const line of lines.slice(0, 10)) {
      if (line.includes('更新时间') || line.includes('Updated')) {
        metadata.lastUpdated = line.match(/\d{4}-\d{2}-\d{2}/) ? line.match(/\d{4}-\d{2}-\d{2}/)[0] : null;
      }
      if (line.includes('版本') || line.includes('Version')) {
        metadata.version = line.match(/v?\d+\.\d+\.\d+/) ? line.match(/v?\d+\.\d+\.\d+/)[0] : null;
      }
    }
    
    return metadata;
  }

  static extractSnippet(content, query, maxLength = 200) {
    const queryIndex = content.toLowerCase().indexOf(query.toLowerCase());
    if (queryIndex === -1) return content.substring(0, maxLength) + '...';
    
    const start = Math.max(0, queryIndex - 50);
    const end = Math.min(content.length, queryIndex + query.length + 100);
    
    let snippet = content.substring(start, end);
    if (start > 0) snippet = '...' + snippet;
    if (end < content.length) snippet = snippet + '...';
    
    return snippet;
  }

  static markdownToHtml(markdown) {
    // 简单的markdown转HTML（实际项目中建议使用marked或markdown-it库）
    return markdown
      .replace(/^# (.*$)/gim, '<h1>$1</h1>')
      .replace(/^## (.*$)/gim, '<h2>$1</h2>')
      .replace(/^### (.*$)/gim, '<h3>$1</h3>')
      .replace(/\*\*(.*)\*\*/gim, '<strong>$1</strong>')
      .replace(/\*(.*)\*/gim, '<em>$1</em>')
      .replace(/```([\s\S]*?)```/gim, '<pre><code>$1</code></pre>')
      .replace(/`(.*?)`/gim, '<code>$1</code>')
      .replace(/\n/gim, '<br>');
  }

  static generateFeedbackId() {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2, 8);
    return `feedback_${timestamp}_${random}`;
  }

  static async saveFeedback(feedback) {
    const feedbackDir = path.join(__dirname, '../../logs/feedback');
    const feedbackFile = path.join(feedbackDir, 'feedback.json');
    
    // 确保目录存在
    try {
      await fs.mkdir(feedbackDir, { recursive: true });
    } catch (error) {
      // 目录已存在
    }
    
    // 读取现有数据
    let feedbackData = [];
    try {
      const existingData = await fs.readFile(feedbackFile, 'utf-8');
      feedbackData = JSON.parse(existingData);
    } catch (error) {
      // 文件不存在或为空
    }
    
    // 添加新反馈
    feedbackData.push(feedback);
    
    // 保存数据
    await fs.writeFile(feedbackFile, JSON.stringify(feedbackData, null, 2));
  }

  static async loadFeedbackData() {
    const feedbackFile = path.join(__dirname, '../../logs/feedback/feedback.json');
    
    try {
      const data = await fs.readFile(feedbackFile, 'utf-8');
      return JSON.parse(data);
    } catch (error) {
      return [];
    }
  }
}

module.exports = DocumentController;

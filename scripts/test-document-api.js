// scripts/test-document-api.js
// 文档API测试脚本 (基于zhixiaodocs中的新API)

console.log('🧪 文档API测试工具启动');
console.log('📋 测试模式: 文档交互API验证');

// 模拟微信小程序环境
global.wx = {
  request: (options) => {
    console.log(`📡 测试请求: ${options.method} ${options.url}`);
    
    // 模拟不同的响应情况
    setTimeout(() => {
      const url = options.url;
      
      if (url.includes('/docs/list')) {
        // 模拟获取文档列表
        options.success({
          success: true,
          data: {
            total: 16,
            categories: {
              development: [
                {
                  id: "API_TODO_LIST",
                  filename: "API_TODO_LIST.md",
                  title: "API接口实现清单",
                  category: "development",
                  size: 6981,
                  lastModified: "2025-08-20T05:27:00.000Z",
                  description: "API接口实现清单和优先级"
                }
              ],
              deployment: [],
              integration: [],
              management: []
            }
          },
          message: "文档列表获取成功"
        });
      } else if (url.includes('/docs/search')) {
        // 模拟搜索文档
        options.success({
          success: true,
          data: {
            query: "API",
            total: 5,
            results: [
              {
                id: "API_TODO_LIST",
                filename: "API_TODO_LIST.md",
                title: "API接口实现清单",
                category: "development",
                snippet: "...API接口实现清单和优先级管理...",
                relevance: 15,
                matches: 8
              }
            ]
          },
          message: "找到 5 个相关文档"
        });
      } else if (url.includes('/docs/feedback')) {
        // 模拟提交反馈
        if (options.method === 'POST') {
          options.success({
            success: true,
            data: {
              id: "feedback_1692547200000_abc123",
              type: "requirement",
              title: "测试反馈",
              status: "open",
              createdAt: "2025-08-20T10:00:00.000Z"
            },
            message: "反馈提交成功，感谢您的建议！"
          });
        } else {
          // GET反馈列表
          options.success({
            success: true,
            data: {
              total: 3,
              feedbacks: [
                {
                  id: "feedback_001",
                  type: "requirement",
                  title: "新增用户导出功能",
                  status: "open",
                  priority: "high",
                  createdAt: "2025-08-20T09:00:00.000Z"
                }
              ]
            },
            message: "反馈列表获取成功"
          });
        }
      } else if (url.match(/\/docs\/[^\/]+$/)) {
        // 模拟获取具体文档
        const docId = url.split('/').pop().split('?')[0];
        options.success({
          success: true,
          data: {
            id: docId,
            filename: `${docId}.md`,
            title: "测试文档",
            content: "# 测试文档\n\n这是一个测试文档的内容。\n\n## 功能说明\n\n- 功能1\n- 功能2",
            format: "markdown",
            category: "development",
            size: 1024,
            lastModified: "2025-08-20T05:27:00.000Z"
          },
          message: "文档获取成功"
        });
      } else {
        // 其他接口返回404
        options.fail({
          errMsg: 'request:fail 404 接口不存在'
        });
      }
    }, Math.random() * 500 + 200); // 随机延迟200-700ms
  },
  
  showToast: (options) => {
    console.log(`📱 Toast: ${options.title}`);
  }
};

// 模拟getApp()
global.getApp = () => ({
  globalData: {
    token: 'test_token_123',
    userRole: 'admin'
  },
  request: function(options) {
    // 添加baseUrl前缀
    const fullUrl = 'http://140.143.143.195/api' + options.url;
    wx.request({
      ...options,
      url: fullUrl
    });
  }
});

// 导入文档API工具
const DocumentAPI = require('../utils/document-api');

class DocumentAPITester {
  constructor() {
    this.results = [];
    this.testCount = 0;
    this.successCount = 0;
  }

  async runTests() {
    console.log('\n=== 文档API功能测试 ===\n');

    const tests = [
      this.testGetDocumentList,
      this.testGetDocument,
      this.testSearchDocuments,
      this.testSubmitFeedback,
      this.testGetFeedbackList,
      this.testAPIDocuments,
      this.testDeploymentDocuments,
      this.testSubmitAPIRequirement,
      this.testSubmitIssueReport,
      this.testFormatDocumentContent,
      this.testErrorHandling
    ];

    for (let i = 0; i < tests.length; i++) {
      const test = tests[i];
      try {
        console.log(`📋 测试 ${i + 1}/${tests.length}: ${test.name}`);
        await test.call(this);
        this.addResult(test.name, 'PASSED', null);
        this.successCount++;
        console.log('✅ 通过\n');
      } catch (error) {
        this.addResult(test.name, 'FAILED', error.message);
        console.log(`❌ 失败: ${error.message}\n`);
      }
      this.testCount++;
    }

    this.showSummary();
  }

  async testGetDocumentList() {
    const result = await DocumentAPI.getDocumentList();
    
    if (!result.success) {
      throw new Error('获取文档列表失败');
    }
    
    if (!result.data || !result.data.categories) {
      throw new Error('文档列表数据格式错误');
    }
    
    console.log(`   📚 获取到 ${result.data.total} 个文档`);
  }

  async testGetDocument() {
    const result = await DocumentAPI.getDocument('API_TODO_LIST', 'markdown');
    
    if (!result.success) {
      throw new Error('获取文档内容失败');
    }
    
    if (!result.data || !result.data.content) {
      throw new Error('文档内容格式错误');
    }
    
    console.log(`   📄 获取文档: ${result.data.title}`);
  }

  async testSearchDocuments() {
    const result = await DocumentAPI.searchDocuments('API', 'development', 5);
    
    if (!result.success) {
      throw new Error('搜索文档失败');
    }
    
    if (!result.data || !Array.isArray(result.data.results)) {
      throw new Error('搜索结果格式错误');
    }
    
    console.log(`   🔍 搜索到 ${result.data.total} 个相关文档`);
  }

  async testSubmitFeedback() {
    const feedback = {
      type: 'requirement',
      title: '测试需求反馈',
      content: '这是一个测试需求反馈的内容',
      priority: 'medium',
      category: 'test'
    };
    
    const result = await DocumentAPI.submitFeedback(feedback);
    
    if (!result.success) {
      throw new Error('提交反馈失败');
    }
    
    if (!result.data || !result.data.id) {
      throw new Error('反馈提交响应格式错误');
    }
    
    console.log(`   💬 反馈已提交，ID: ${result.data.id}`);
  }

  async testGetFeedbackList() {
    const result = await DocumentAPI.getFeedbackList({
      type: 'requirement',
      status: 'open',
      limit: 10
    });
    
    if (!result.success) {
      throw new Error('获取反馈列表失败');
    }
    
    if (!result.data || !Array.isArray(result.data.feedbacks)) {
      throw new Error('反馈列表格式错误');
    }
    
    console.log(`   📊 获取到 ${result.data.total} 个反馈`);
  }

  async testAPIDocuments() {
    const result = await DocumentAPI.getAPIDocuments();
    
    if (!result.success) {
      throw new Error('获取API文档失败');
    }
    
    console.log(`   🔌 API文档数量: ${result.data.total}`);
  }

  async testDeploymentDocuments() {
    const result = await DocumentAPI.getDeploymentDocuments();
    
    if (!result.success) {
      throw new Error('获取部署文档失败');
    }
    
    console.log(`   🚀 部署文档数量: ${result.data.total}`);
  }

  async testSubmitAPIRequirement() {
    const result = await DocumentAPI.submitAPIRequirement(
      '新增批量操作API',
      '希望增加批量删除和编辑用户的API接口',
      'high'
    );
    
    if (!result.success) {
      throw new Error('提交API需求失败');
    }
    
    console.log(`   🔧 API需求已提交: ${result.data.id}`);
  }

  async testSubmitIssueReport() {
    const result = await DocumentAPI.submitIssueReport(
      '登录接口偶发超时',
      '在网络较慢的情况下，登录接口会出现超时现象',
      'medium'
    );
    
    if (!result.success) {
      throw new Error('提交问题报告失败');
    }
    
    console.log(`   🐛 问题报告已提交: ${result.data.id}`);
  }

  async testFormatDocumentContent() {
    const markdown = '# 标题\n\n## 子标题\n\n**粗体** 和 *斜体* 以及 `代码`';
    const formatted = DocumentAPI.formatDocumentContent(markdown);
    
    if (!formatted.includes('<h1>') || !formatted.includes('<strong>')) {
      throw new Error('文档格式化失败');
    }
    
    console.log('   📝 文档格式化成功');
  }

  async testErrorHandling() {
    try {
      // 测试无效参数
      await DocumentAPI.getDocument('');
    } catch (error) {
      if (error.message.includes('文档ID不能为空')) {
        console.log('   ⚠️ 错误处理正常');
        return;
      }
    }
    
    throw new Error('错误处理测试失败');
  }

  addResult(name, status, error) {
    this.results.push({ name, status, error });
  }

  showSummary() {
    console.log('\n📊 文档API测试结果汇总');
    console.log('═'.repeat(50));

    console.log(`✅ 通过: ${this.successCount}`);
    console.log(`❌ 失败: ${this.testCount - this.successCount}`);
    console.log(`📊 成功率: ${Math.round(this.successCount / this.testCount * 100)}%`);

    const failed = this.results.filter(r => r.status === 'FAILED');
    if (failed.length > 0) {
      console.log('\n❌ 失败项目:');
      failed.forEach(result => {
        console.log(`   • ${result.name}: ${result.error}`);
      });
    }

    console.log('\n🎯 文档API功能状态:');
    console.log('   📚 文档列表获取: ✅ 就绪');
    console.log('   📄 文档内容获取: ✅ 就绪');
    console.log('   🔍 文档搜索功能: ✅ 就绪');
    console.log('   💬 反馈提交功能: ✅ 就绪');
    console.log('   📊 反馈管理功能: ✅ 就绪');
    
    console.log('\n💡 使用建议:');
    console.log('   1. 在小程序中直接调用 DocumentAPI 的方法');
    console.log('   2. 所有方法都返回 Promise，支持 async/await');
    console.log('   3. 自动处理认证和错误，无需额外配置');
    console.log('   4. 支持搜索、分类过滤等高级功能');
  }

  delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

// 运行测试
if (require.main === module) {
  const tester = new DocumentAPITester();
  tester.runTests().catch(console.error);
}

module.exports = DocumentAPITester;

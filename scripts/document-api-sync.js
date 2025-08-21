// scripts/document-api-sync.js
// 文档API同步执行脚本
// 使用方式: node scripts/document-api-sync.js [operation]
// 操作类型: list, search, requirements, sync

const DocumentAPISyncer = require('../utils/document-api-sync');

class DocumentAPISyncRunner {
  constructor() {
    this.operation = process.argv[2] || 'sync';
    this.query = process.argv[3] || '';
    console.log('📚 文档API同步工具启动');
    console.log(`🎯 操作类型: ${this.operation}`);
  }

  async run() {
    console.log('\n=== 开始执行文档API同步 ===\n');

    try {
      switch (this.operation) {
        case 'list':
          await this.runListDocuments();
          break;
        case 'search':
          await this.runSearchDocuments();
          break;
        case 'requirements':
          await this.runGenerateRequirements();
          break;
        case 'submit':
          await this.runSubmitRequirements();
          break;
        case 'sync':
        default:
          await this.runFullSync();
          break;
      }
    } catch (error) {
      console.error('❌ 执行失败:', error.message);
      process.exit(1);
    }
  }

  async runListDocuments() {
    console.log('📋 获取后端文档列表...');
    
    const result = await DocumentAPISyncer.getDocumentList();
    
    if (result.success) {
      const { total, categories } = result.data;
      console.log(`\n✅ 成功获取 ${total} 个文档\n`);
      
      Object.entries(categories).forEach(([category, docs]) => {
        console.log(`📁 ${category.toUpperCase()} (${docs.length} 个文档):`);
        docs.forEach(doc => {
          console.log(`  - ${doc.title} (${doc.filename})`);
        });
        console.log('');
      });
    } else {
      console.error('❌ 获取文档列表失败:', result.error);
    }
  }

  async runSearchDocuments() {
    const query = this.query || 'API';
    console.log(`🔍 搜索文档: "${query}"`);
    
    const result = await DocumentAPISyncer.searchDocuments(query);
    
    if (result.success) {
      const { total, results } = result.data;
      console.log(`\n✅ 搜索到 ${total} 个相关文档\n`);
      
      results.forEach((doc, index) => {
        console.log(`${index + 1}. ${doc.title}`);
        console.log(`   分类: ${doc.category}`);
        console.log(`   相关度: ${doc.relevance}`);
        console.log(`   摘要: ${doc.snippet}`);
        console.log('');
      });
    } else {
      console.error('❌ 搜索失败:', result.error);
    }
  }

  async runGenerateRequirements() {
    console.log('📝 生成API需求清单...');
    
    const result = await DocumentAPISyncer.generateAPIRequirements();
    
    if (result.success) {
      const { requirements, count } = result.data;
      console.log(`\n✅ 生成 ${count} 个API需求\n`);
      
      requirements.forEach((req, index) => {
        console.log(`${index + 1}. ${req.title}`);
        console.log(`   类型: ${req.type}`);
        console.log(`   优先级: ${req.priority}`);
        console.log(`   分类: ${req.category}`);
        console.log(`   描述: ${req.content}`);
        console.log('');
      });
    } else {
      console.error('❌ 生成需求失败:', result.error);
    }
  }

  async runSubmitRequirements() {
    console.log('💬 提交API需求...');
    
    // 首先生成需求
    const reqResult = await DocumentAPISyncer.generateAPIRequirements();
    if (!reqResult.success) {
      console.error('❌ 生成需求失败:', reqResult.error);
      return;
    }

    // 模拟token (实际环境中需要真实的用户token)
    const mockToken = 'mock_development_token_for_testing';
    
    const result = await DocumentAPISyncer.syncAPIRequirements(
      reqResult.data.requirements,
      mockToken
    );
    
    if (result.success) {
      const { successCount, failedCount, results } = result.data;
      console.log(`\n✅ 需求提交完成: ${successCount} 成功, ${failedCount} 失败\n`);
      
      results.forEach((res, index) => {
        const status = res.success ? '✅' : '❌';
        console.log(`${status} ${index + 1}. ${res.title}`);
        if (res.success) {
          console.log(`   ID: ${res.id}`);
        } else {
          console.log(`   错误: ${res.error}`);
        }
      });
    } else {
      console.error('❌ 提交需求失败:', result.error);
    }
  }

  async runFullSync() {
    console.log('🚀 执行完整API同步流程...');
    
    // 模拟token (实际环境中需要真实的用户token)
    const mockToken = 'mock_development_token_for_full_sync';
    
    const result = await DocumentAPISyncer.performFullSync(mockToken);
    
    if (result.success) {
      const { summary, report } = result.data;
      
      console.log('\n✅ 完整同步完成\n');
      console.log('📊 同步摘要:');
      console.log(`  - 发现文档: ${summary.documentsFound} 个`);
      console.log(`  - 搜索结果: ${summary.searchResults} 个`);
      console.log(`  - 生成需求: ${summary.requirementsGenerated} 个`);
      console.log(`  - 提交需求: ${summary.requirementsSubmitted} 个`);
      
      console.log('\n📋 同步状态:');
      Object.entries(report.results).forEach(([key, status]) => {
        const statusIcon = status === 'success' ? '✅' : '❌';
        console.log(`  ${statusIcon} ${key}: ${status}`);
      });
      
      console.log('\n💡 建议:');
      report.recommendations.forEach((rec, index) => {
        console.log(`  ${index + 1}. ${rec}`);
      });
    } else {
      console.error('❌ 完整同步失败:', result.error);
    }
  }
}

// 运行同步工具
if (require.main === module) {
  const runner = new DocumentAPISyncRunner();
  runner.run().catch(console.error);
}

module.exports = DocumentAPISyncRunner;

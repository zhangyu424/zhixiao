#!/usr/bin/env node

/**
 * 文档API命令行工具
 * 仅供开发过程使用
 *
 * 使用方法:
 * node cli.js list                    # 获取文档列表
 * node cli.js get <docId>             # 获取文档内容
 * node cli.js search <query>          # 搜索文档
 * node cli.js feedback <type> <title> <content>  # 提交反馈
 */

const DocumentAPIClient = require('./client.js');

class DocumentCLI {
  constructor() {
    this.client = new DocumentAPIClient();
    this.commands = {
      list: this.listDocuments.bind(this),
      get: this.getDocument.bind(this),
      search: this.searchDocuments.bind(this),
      feedback: this.submitFeedback.bind(this),
      help: this.showHelp.bind(this)
    };
  }

  async run() {
    const args = process.argv.slice(2);

    if (args.length === 0) {
      this.showHelp();
      return;
    }

    const command = args[0];
    const commandArgs = args.slice(1);

    if (!this.commands[command]) {
      console.error(`❌ 未知命令: ${command}`);
      this.showHelp();
      process.exit(1);
    }

    try {
      await this.commands[command](commandArgs);
    } catch (error) {
      console.error(`❌ 执行失败: ${error.message}`);
      process.exit(1);
    }
  }

  async listDocuments(args) {
    console.log('🚀 获取文档列表...\n');
    await this.client.displayDocumentList();
  }

  async getDocument(args) {
    if (args.length === 0) {
      console.error('❌ 请指定文档ID');
      console.log('用法: node cli.js get <docId> [format]');
      return;
    }

    const docId = args[0];
    const format = args[1] || 'markdown';

    console.log(`🚀 获取文档: ${docId}\n`);
    await this.client.displayDocument(docId, format);
  }

  async searchDocuments(args) {
    if (args.length === 0) {
      console.error('❌ 请输入搜索关键词');
      console.log('用法: node cli.js search <query> [category] [limit]');
      return;
    }

    const query = args[0];
    const category = args[1] || '';
    const limit = parseInt(args[2]) || 10;

    console.log(`🚀 搜索文档: "${query}"\n`);
    await this.client.displaySearchResults(query, category, limit);
  }

  async submitFeedback(args) {
    if (args.length < 3) {
      console.error('❌ 参数不足');
      console.log(
        '用法: node cli.js feedback <type> <title> <content> [priority]'
      );
      console.log('类型: requirement, issue, question, suggestion');
      console.log('优先级: low, medium, high, urgent');
      return;
    }

    const [type, title, content] = args;
    const priority = args[3] || 'medium';

    // 检查是否设置了token
    const token = process.env.DEV_API_TOKEN;
    if (!token) {
      console.error('❌ 需要设置环境变量 DEV_API_TOKEN');
      console.log('请联系管理员获取开发用token');
      return;
    }

    this.client.setToken(token);

    console.log(`🚀 提交反馈: ${title}\n`);
    await this.client.submitDevFeedback(type, title, content, priority);
  }

  showHelp() {
    console.log(`
🛠️  文档API命令行工具

📖 可用命令:

  list                        获取所有文档列表
  get <docId> [format]        获取指定文档内容
                              format: markdown (默认) 或 html
  search <query> [category] [limit]  搜索文档
                              category: development, deployment, integration, management
                              limit: 结果数量限制 (默认10)
  feedback <type> <title> <content> [priority]  提交反馈
                              type: requirement, issue, question, suggestion
                              priority: low, medium (默认), high, urgent
  help                        显示此帮助信息

📋 使用示例:

  # 获取文档列表
  node cli.js list

  # 获取API需求文档
  node cli.js get API_REQUIREMENTS

  # 获取HTML格式的文档
  node cli.js get API_REQUIREMENTS html

  # 搜索API相关文档
  node cli.js search "API" development 5

  # 提交需求反馈
  node cli.js feedback requirement "新增导出功能" "希望支持Excel导出" high

⚙️  配置说明:

  # 设置API服务地址 (可选，默认: http://140.143.143.195/api/docs)
  export DOC_API_URL="http://your-api-server/api/docs"

  # 设置认证token (提交反馈时需要)
  export DEV_API_TOKEN="your-dev-token"

📞 如需帮助，请联系开发团队。
`);
  }
}

// 运行CLI
if (require.main === module) {
  const cli = new DocumentCLI();
  cli.run().catch(error => {
    console.error('❌ 程序异常:', error.message);
    process.exit(1);
  });
}

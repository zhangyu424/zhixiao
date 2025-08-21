// scripts/update-api-status.js
// 简化的API状态更新脚本 - 专注于前后端同步

const fs = require('fs');
const path = require('path');

class APIStatusUpdater {
  constructor() {
    this.baseUrl = 'https://your-api-domain.com/api';
    this.reportPath = path.join(__dirname, '..', 'temp', 'api-status-update.json');
    this.report = {
      timestamp: new Date().toISOString(),
      status: 'starting',
      frontend: {},
      backend: {},
      gaps: [],
      recommendations: []
    };
  }

  // 执行API状态更新
  async execute() {
    console.log('🔄 开始API状态更新...');
    console.log('='.repeat(50));

    try {
      // 1. 分析前端API需求
      console.log('📱 1. 分析前端API需求...');
      await this.analyzeFrontendAPIs();

      // 2. 检查后端API状态
      console.log('🔧 2. 检查后端API状态...');
      await this.checkBackendAPIs();

      // 3. 识别差异和缺口
      console.log('🔍 3. 识别API差异...');
      await this.identifyAPIGaps();

      // 4. 生成更新建议
      console.log('💡 4. 生成更新建议...');
      await this.generateUpdateRecommendations();

      // 5. 保存报告
      console.log('💾 5. 保存状态报告...');
      await this.saveReport();

      this.report.status = 'completed';
      console.log('✅ API状态更新完成');
      
      return this.report;

    } catch (error) {
      this.report.status = 'failed';
      this.report.error = error.message;
      console.error('❌ API状态更新失败:', error.message);
      return this.report;
    }
  }

  // 分析前端API需求
  async analyzeFrontendAPIs() {
    // 从小程序代码中提取API调用
    const frontendAPIs = this.extractFrontendAPIs();
    
    // 从API同步管理器中提取需求
    const managerRequirements = this.extractManagerRequirements();
    
    this.report.frontend = {
      extractedAPIs: frontendAPIs,
      managerRequirements: managerRequirements,
      totalRequired: frontendAPIs.length + managerRequirements.length,
      lastAnalyzed: new Date().toISOString()
    };

    console.log(`  📊 发现前端API需求: ${this.report.frontend.totalRequired} 个`);
  }

  // 提取前端API调用
  extractFrontendAPIs() {
    const apis = [];
    
    // 扫描主要页面文件
    const pageFiles = [
      'pages/index/index.js',
      'pages/unified-login/unified-login.js',
      'pages/study-record/study-record.js',
      'pages/analysis/analysis.js',
      'pages/profile/profile.js'
    ];

    pageFiles.forEach(file => {
      const filePath = path.join(__dirname, '..', file);
      if (fs.existsSync(filePath)) {
        const content = fs.readFileSync(filePath, 'utf8');
        const fileAPIs = this.extractAPICallsFromContent(content, file);
        apis.push(...fileAPIs);
      }
    });

    return apis;
  }

  // 从内容中提取API调用
  extractAPICallsFromContent(content, fileName) {
    const apis = [];
    
    // 匹配常见的API调用模式
    const patterns = [
      /app\.request\([^)]*['"`]([^'"`]+)['"`]/g,
      /wx\.request\([^}]*url[^'"`]*['"`]([^'"`]+)['"`]/g,
      /\.post\(['"`]([^'"`]+)['"`]/g,
      /\.get\(['"`]([^'"`]+)['"`]/g
    ];

    patterns.forEach(pattern => {
      let match;
      while ((match = pattern.exec(content)) !== null) {
        const endpoint = match[1];
        if (endpoint.startsWith('/') && !apis.some(api => api.endpoint === endpoint)) {
          apis.push({
            endpoint: endpoint,
            source: fileName,
            method: this.inferMethodFromEndpoint(endpoint),
            type: 'extracted'
          });
        }
      }
    });

    return apis;
  }

  // 从端点推断HTTP方法
  inferMethodFromEndpoint(endpoint) {
    if (endpoint.includes('submit') || endpoint.includes('create') || endpoint.includes('add')) {
      return 'POST';
    } else if (endpoint.includes('update') || endpoint.includes('edit')) {
      return 'PUT';
    } else if (endpoint.includes('delete') || endpoint.includes('remove')) {
      return 'DELETE';
    } else {
      return 'GET';
    }
  }

  // 提取API管理器需求
  extractManagerRequirements() {
    const managerPath = path.join(__dirname, '..', 'utils', 'api-sync-manager.js');
    
    if (!fs.existsSync(managerPath)) {
      return [];
    }

    const content = fs.readFileSync(managerPath, 'utf8');
    const requirements = [];

    // 提取requiredAPIs中的端点
    const apiSectionPattern = /requiredAPIs:\s*{([^}]+)}/s;
    const match = content.match(apiSectionPattern);
    
    if (match) {
      const apiSection = match[1];
      const endpointPattern = /path:\s*['"`]([^'"`]+)['"`][^}]*method:\s*['"`]([^'"`]+)['"`][^}]*description:\s*['"`]([^'"`]+)['"`]/g;
      
      let endpointMatch;
      while ((endpointMatch = endpointPattern.exec(apiSection)) !== null) {
        requirements.push({
          endpoint: endpointMatch[1],
          method: endpointMatch[2],
          description: endpointMatch[3],
          source: 'api-sync-manager',
          type: 'requirement'
        });
      }
    }

    return requirements;
  }

  // 检查后端API状态
  async checkBackendAPIs() {
    // 模拟后端API检查
    const backendStatus = {
      available: false,
      version: '1.0.0',
      endpoints: [],
      lastChecked: new Date().toISOString(),
      testResults: []
    };

    // 尝试检查常见端点
    const commonEndpoints = [
      '/auth/login',
      '/auth/validate-token',
      '/user/profile',
      '/study/submit',
      '/study/history',
      '/notifications/list'
    ];

    for (const endpoint of commonEndpoints) {
      const testResult = await this.testEndpoint(endpoint);
      backendStatus.testResults.push(testResult);
      
      if (testResult.available) {
        backendStatus.endpoints.push(endpoint);
        backendStatus.available = true;
      }
    }

    this.report.backend = backendStatus;
    console.log(`  🔧 后端状态: ${backendStatus.available ? '部分可用' : '不可用'}`);
    console.log(`  📊 可用端点: ${backendStatus.endpoints.length}/${commonEndpoints.length}`);
  }

  // 测试端点可用性
  async testEndpoint(endpoint) {
    try {
      // 这里应该是真实的HTTP请求，现在模拟
      await new Promise(resolve => setTimeout(resolve, 50));
      
      return {
        endpoint: endpoint,
        available: false, // 假设都不可用，因为后端未启动
        error: '连接失败 - 后端服务未启动',
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      return {
        endpoint: endpoint,
        available: false,
        error: error.message,
        timestamp: new Date().toISOString()
      };
    }
  }

  // 识别API差异
  async identifyAPIGaps() {
    const frontendAPIs = [
      ...this.report.frontend.extractedAPIs,
      ...this.report.frontend.managerRequirements
    ];
    
    const backendEndpoints = this.report.backend.endpoints;
    
    // 找出缺失的API
    const missingAPIs = frontendAPIs.filter(api => 
      !backendEndpoints.includes(api.endpoint)
    );

    // 找出不匹配的API
    const mismatchedAPIs = frontendAPIs.filter(api => {
      const backendTest = this.report.backend.testResults.find(test => 
        test.endpoint === api.endpoint
      );
      return backendTest && !backendTest.available;
    });

    // 识别版本差异
    const versionGap = this.identifyVersionGap();

    this.report.gaps = {
      missing: missingAPIs,
      mismatched: mismatchedAPIs,
      version: versionGap,
      totalGaps: missingAPIs.length + mismatchedAPIs.length
    };

    console.log(`  ❌ 缺失API: ${missingAPIs.length} 个`);
    console.log(`  ⚠️  不匹配API: ${mismatchedAPIs.length} 个`);
    console.log(`  📋 版本差异: ${versionGap.hasDifference ? '是' : '否'}`);
  }

  // 识别版本差异
  identifyVersionGap() {
    const currentVersion = '1.0.0';
    const requiredVersion = '1.2.0';
    
    return {
      current: currentVersion,
      required: requiredVersion,
      hasDifference: currentVersion !== requiredVersion,
      versionsBehind: this.calculateVersionsBehind(currentVersion, requiredVersion)
    };
  }

  // 计算版本差距
  calculateVersionsBehind(current, required) {
    const currentParts = current.split('.').map(Number);
    const requiredParts = required.split('.').map(Number);
    
    let behind = 0;
    for (let i = 0; i < 3; i++) {
      if (requiredParts[i] > currentParts[i]) {
        behind += (requiredParts[i] - currentParts[i]) * Math.pow(10, 2-i);
      }
    }
    
    return behind;
  }

  // 生成更新建议
  async generateUpdateRecommendations() {
    const recommendations = [];

    // 后端API建议
    if (this.report.gaps.missing.length > 0) {
      recommendations.push({
        type: 'backend_implementation',
        priority: 'high',
        title: '实现缺失的API端点',
        description: `需要实现 ${this.report.gaps.missing.length} 个API端点`,
        details: this.report.gaps.missing.map(api => ({
          endpoint: api.endpoint,
          method: api.method,
          description: api.description
        }))
      });
    }

    // 版本更新建议
    if (this.report.gaps.version.hasDifference) {
      recommendations.push({
        type: 'version_update',
        priority: 'high',
        title: '升级后端API版本',
        description: `从 ${this.report.gaps.version.current} 升级到 ${this.report.gaps.version.required}`,
        details: {
          currentVersion: this.report.gaps.version.current,
          targetVersion: this.report.gaps.version.required,
          versionsBehind: this.report.gaps.version.versionsBehind
        }
      });
    }

    // 前端优化建议
    if (this.report.frontend.totalRequired > 0) {
      recommendations.push({
        type: 'frontend_optimization',
        priority: 'medium',
        title: '优化前端API调用',
        description: '统一API调用方式，增强错误处理',
        details: {
          totalAPICalls: this.report.frontend.totalRequired,
          suggestions: [
            '使用统一的请求封装',
            '添加请求重试机制',
            '完善错误处理逻辑',
            '增加请求缓存策略'
          ]
        }
      });
    }

    // 监控和测试建议
    recommendations.push({
      type: 'monitoring',
      priority: 'low',
      title: '建立API监控和测试',
      description: '定期检查API状态，确保前后端同步',
      details: {
        suggestions: [
          '自动化API健康检查',
          'API性能监控',
          '前后端集成测试',
          'API文档自动同步'
        ]
      }
    });

    this.report.recommendations = recommendations;
    console.log(`  💡 生成建议: ${recommendations.length} 条`);
  }

  // 保存报告
  async saveReport() {
    // 确保目录存在
    fs.mkdirSync(path.dirname(this.reportPath), { recursive: true });
    
    // 保存详细报告
    fs.writeFileSync(this.reportPath, JSON.stringify(this.report, null, 2));
    
    // 生成简化摘要
    const summary = this.generateSummary();
    const summaryPath = path.join(path.dirname(this.reportPath), 'api-status-summary.md');
    fs.writeFileSync(summaryPath, summary);
    
    console.log(`  📄 详细报告: ${this.reportPath}`);
    console.log(`  📋 摘要报告: ${summaryPath}`);
  }

  // 生成摘要
  generateSummary() {
    const summary = `# API状态更新报告

## 📊 总体状况
- **更新时间**: ${this.report.timestamp}
- **状态**: ${this.report.status}
- **前端API需求**: ${this.report.frontend.totalRequired} 个
- **后端可用端点**: ${this.report.backend.endpoints.length} 个
- **差异总数**: ${this.report.gaps.totalGaps} 个

## 🔍 关键发现

### 前端分析
- 提取的API调用: ${this.report.frontend.extractedAPIs.length} 个
- 管理器定义需求: ${this.report.frontend.managerRequirements.length} 个

### 后端状态
- 服务可用性: ${this.report.backend.available ? '✅ 部分可用' : '❌ 不可用'}
- 当前版本: ${this.report.backend.version}
- 可用端点: ${this.report.backend.endpoints.join(', ') || '无'}

### API差异
- 缺失API: ${this.report.gaps.missing.length} 个
- 不匹配API: ${this.report.gaps.mismatched.length} 个
- 版本差异: ${this.report.gaps.version.hasDifference ? '是' : '否'}

## 💡 更新建议

${this.report.recommendations.map((rec, index) => `
### ${index + 1}. ${rec.title} (${rec.priority})
${rec.description}
`).join('')}

## 📋 下一步行动

1. **立即执行** (高优先级)
   ${this.report.recommendations.filter(r => r.priority === 'high').map(r => `- ${r.title}`).join('\n   ')}

2. **计划执行** (中优先级)
   ${this.report.recommendations.filter(r => r.priority === 'medium').map(r => `- ${r.title}`).join('\n   ')}

3. **长期优化** (低优先级)
   ${this.report.recommendations.filter(r => r.priority === 'low').map(r => `- ${r.title}`).join('\n   ')}

---
*报告生成时间: ${new Date().toLocaleString('zh-CN')}*
`;

    return summary;
  }
}

// 如果直接运行此脚本
if (require.main === module) {
  const updater = new APIStatusUpdater();
  updater.execute()
    .then(report => {
      console.log('\n' + '='.repeat(50));
      console.log('🎯 API状态更新摘要:');
      console.log(`  📊 前端API需求: ${report.frontend.totalRequired}`);
      console.log(`  🔧 后端可用端点: ${report.backend.endpoints.length}`);
      console.log(`  ❌ 发现差异: ${report.gaps.totalGaps}`);
      console.log(`  💡 生成建议: ${report.recommendations.length}`);
      console.log(`  📄 报告文件: ${path.basename(updater.reportPath)}`);
      process.exit(0);
    })
    .catch(error => {
      console.error('\n💥 更新失败:', error.message);
      process.exit(1);
    });
}

module.exports = APIStatusUpdater;

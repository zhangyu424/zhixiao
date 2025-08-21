// scripts/sync-all-apis.js
// 全面API同步脚本 - 统一前后端API状态

const { APISyncManager } = require('../utils/api-sync-manager');
const DocumentAPISyncer = require('../utils/document-api-sync');
const fs = require('fs');
const path = require('path');

class ComprehensiveAPISync {
  constructor() {
    this.syncManager = new APISyncManager();
    this.documentSyncer = DocumentAPISyncer;
    this.syncResults = {
      timestamp: new Date().toISOString(),
      phases: [],
      summary: {},
      recommendations: []
    };
  }

  // 执行完整的API同步流程
  async execute() {
    console.log('🚀 启动全面API同步...');
    console.log('='.repeat(60));

    try {
      // 阶段1: 检查当前API状态
      await this.checkCurrentStatus();
      
      // 阶段2: 同步文档API需求
      await this.syncDocumentRequirements();
      
      // 阶段3: 生成增强版API需求
      await this.generateEnhancedRequirements();
      
      // 阶段4: 执行前后端同步
      await this.performFrontendBackendSync();
      
      // 阶段5: 验证同步结果
      await this.validateSyncResults();
      
      // 阶段6: 生成同步报告
      await this.generateSyncReport();
      
      console.log('✅ 全面API同步完成');
      return this.syncResults;
      
    } catch (error) {
      console.error('❌ API同步失败:', error.message);
      this.syncResults.error = error.message;
      return this.syncResults;
    }
  }

  // 阶段1: 检查当前API状态
  async checkCurrentStatus() {
    console.log('\n📊 阶段1: 检查当前API状态');
    console.log('-'.repeat(40));

    const phase = {
      name: 'status_check',
      startTime: new Date().toISOString(),
      steps: []
    };

    try {
      // 1.1 检查后端API可用性
      console.log('🔍 检查后端API可用性...');
      const backendStatus = await this.checkBackendAvailability();
      phase.steps.push({
        step: 'backend_availability',
        status: backendStatus.available ? 'success' : 'failed',
        data: backendStatus
      });

      // 1.2 检查前端API配置
      console.log('📱 检查前端API配置...');
      const frontendConfig = await this.checkFrontendConfig();
      phase.steps.push({
        step: 'frontend_config',
        status: 'success',
        data: frontendConfig
      });

      // 1.3 检查API版本差异
      console.log('📋 检查API版本差异...');
      const versionDiff = await this.checkVersionDifferences();
      phase.steps.push({
        step: 'version_diff',
        status: 'success',
        data: versionDiff
      });

      phase.status = 'completed';
      console.log('✅ 状态检查完成');

    } catch (error) {
      phase.status = 'failed';
      phase.error = error.message;
      console.error('❌ 状态检查失败:', error.message);
    }

    phase.endTime = new Date().toISOString();
    this.syncResults.phases.push(phase);
  }

  // 检查后端API可用性
  async checkBackendAvailability() {
    try {
      // 尝试访问后端根端点
      const response = await this.makeHttpRequest('');
      
      return {
        available: true,
        version: response.version || 'unknown',
        endpoints: response.endpoints || [],
        lastCheck: new Date().toISOString()
      };
    } catch (error) {
      return {
        available: false,
        error: error.message,
        lastCheck: new Date().toISOString()
      };
    }
  }

  // 检查前端API配置
  async checkFrontendConfig() {
    const configFiles = [
      'app.js',
      'utils/api-sync-manager.js',
      'pages/api-sync-status/api-sync-status.js'
    ];

    const config = {
      files: [],
      baseUrl: 'https://your-api-domain.com/api',
      totalAPIs: 0
    };

    for (const file of configFiles) {
      const filePath = path.join(__dirname, '..', file);
      if (fs.existsSync(filePath)) {
        const content = fs.readFileSync(filePath, 'utf8');
        config.files.push({
          file,
          exists: true,
          size: content.length,
          apis: this.extractAPICount(content)
        });
        config.totalAPIs += this.extractAPICount(content);
      } else {
        config.files.push({
          file,
          exists: false
        });
      }
    }

    return config;
  }

  // 提取API数量
  extractAPICount(content) {
    const apiPatterns = [
      /POST.*\/api\//g,
      /GET.*\/api\//g,
      /PUT.*\/api\//g,
      /DELETE.*\/api\//g
    ];

    let count = 0;
    apiPatterns.forEach(pattern => {
      const matches = content.match(pattern) || [];
      count += matches.length;
    });

    return count;
  }

  // 检查版本差异
  async checkVersionDifferences() {
    try {
      // 读取版本历史文件
      const versionPath = path.join(__dirname, '..', 'zhixiaodocs', 'VERSION_HISTORY.md');
      const versionContent = fs.readFileSync(versionPath, 'utf8');
      
      // 提取版本信息
      const versions = this.extractVersionInfo(versionContent);
      
      // 获取当前后端版本
      const backendVersion = await this.getCurrentBackendVersion();
      
      return {
        documentVersions: versions,
        backendVersion: backendVersion,
        isUpToDate: this.compareVersions(backendVersion, versions.latest),
        needsUpdate: versions.latest !== backendVersion
      };
    } catch (error) {
      return {
        error: error.message,
        isUpToDate: false,
        needsUpdate: true
      };
    }
  }

  // 提取版本信息
  extractVersionInfo(content) {
    const versionPattern = /v(\d+\.\d+\.\d+)/g;
    const versions = [];
    let match;
    
    while ((match = versionPattern.exec(content)) !== null) {
      versions.push(match[1]);
    }
    
    return {
      all: [...new Set(versions)].sort((a, b) => {
        const aParts = a.split('.').map(Number);
        const bParts = b.split('.').map(Number);
        for (let i = 0; i < 3; i++) {
          if (aParts[i] !== bParts[i]) return bParts[i] - aParts[i];
        }
        return 0;
      }),
      latest: versions.length > 0 ? versions[0] : '1.0.0',
      count: versions.length
    };
  }

  // 获取当前后端版本
  async getCurrentBackendVersion() {
    try {
      const response = await this.makeHttpRequest('');
      return response.version || '1.0.0';
    } catch (error) {
      return '1.0.0'; // 默认版本
    }
  }

  // 比较版本
  compareVersions(current, latest) {
    const currentParts = current.split('.').map(Number);
    const latestParts = latest.split('.').map(Number);
    
    for (let i = 0; i < 3; i++) {
      if (currentParts[i] < latestParts[i]) return false;
      if (currentParts[i] > latestParts[i]) return true;
    }
    
    return true; // 相等
  }

  // 阶段2: 同步文档API需求
  async syncDocumentRequirements() {
    console.log('\n📚 阶段2: 同步文档API需求');
    console.log('-'.repeat(40));

    const phase = {
      name: 'document_sync',
      startTime: new Date().toISOString(),
      steps: []
    };

    try {
      // 2.1 获取文档列表
      console.log('📋 获取文档列表...');
      const docs = await this.documentSyncer.getDocuments();
      phase.steps.push({
        step: 'get_documents',
        status: docs.success ? 'success' : 'failed',
        data: { count: docs.success ? docs.data.length : 0 }
      });

      // 2.2 搜索API相关文档
      console.log('🔍 搜索API相关文档...');
      const searchResults = await this.documentSyncer.searchDocuments('API');
      phase.steps.push({
        step: 'search_api_docs',
        status: searchResults.success ? 'success' : 'failed',
        data: { count: searchResults.success ? searchResults.data.length : 0 }
      });

      // 2.3 生成API需求
      console.log('📝 生成API需求...');
      const requirements = await this.documentSyncer.generateAPIRequirements();
      phase.steps.push({
        step: 'generate_requirements',
        status: requirements.success ? 'success' : 'failed',
        data: requirements.success ? requirements.data : { error: requirements.error }
      });

      phase.status = 'completed';
      console.log('✅ 文档API同步完成');

    } catch (error) {
      phase.status = 'failed';
      phase.error = error.message;
      console.error('❌ 文档API同步失败:', error.message);
    }

    phase.endTime = new Date().toISOString();
    this.syncResults.phases.push(phase);
  }

  // 阶段3: 生成增强版API需求
  async generateEnhancedRequirements() {
    console.log('\n🔧 阶段3: 生成增强版API需求');
    console.log('-'.repeat(40));

    const phase = {
      name: 'enhanced_requirements',
      startTime: new Date().toISOString(),
      steps: []
    };

    try {
      // 3.1 生成基础API需求
      console.log('📋 生成基础API需求...');
      const baseRequirements = this.syncManager.generateAPIRequirements();
      phase.steps.push({
        step: 'base_requirements',
        status: 'success',
        data: { count: this.countAPIRequirements(baseRequirements) }
      });

      // 3.2 合并文档API需求
      console.log('🔗 合并文档API需求...');
      const enhancedRequirements = await this.syncManager.generateEnhancedAPIRequirements();
      phase.steps.push({
        step: 'enhanced_requirements',
        status: 'success',
        data: { count: enhancedRequirements.totalRequirements || 0 }
      });

      // 3.3 保存需求到本地
      console.log('💾 保存需求到本地...');
      const requirementsPath = path.join(__dirname, '..', 'temp', 'enhanced-api-requirements.json');
      fs.mkdirSync(path.dirname(requirementsPath), { recursive: true });
      fs.writeFileSync(requirementsPath, JSON.stringify(enhancedRequirements, null, 2));
      phase.steps.push({
        step: 'save_requirements',
        status: 'success',
        data: { filePath: requirementsPath }
      });

      phase.status = 'completed';
      console.log('✅ 增强版API需求生成完成');

    } catch (error) {
      phase.status = 'failed';
      phase.error = error.message;
      console.error('❌ 增强版API需求生成失败:', error.message);
    }

    phase.endTime = new Date().toISOString();
    this.syncResults.phases.push(phase);
  }

  // 计算API需求数量
  countAPIRequirements(requirements) {
    let count = 0;
    
    if (requirements.requiredAPIs) {
      Object.values(requirements.requiredAPIs).forEach(category => {
        if (category.endpoints) {
          count += category.endpoints.length;
        }
      });
    }
    
    return count;
  }

  // 阶段4: 执行前后端同步
  async performFrontendBackendSync() {
    console.log('\n🔄 阶段4: 执行前后端同步');
    console.log('-'.repeat(40));

    const phase = {
      name: 'frontend_backend_sync',
      startTime: new Date().toISOString(),
      steps: []
    };

    try {
      // 4.1 尝试向后端报告API需求
      console.log('📤 向后端报告API需求...');
      const requirementsReport = await this.syncManager.syncAPIDocumentation();
      phase.steps.push({
        step: 'report_requirements',
        status: requirementsReport.success ? 'success' : 'failed',
        data: requirementsReport
      });

      // 4.2 检查API兼容性
      console.log('🔍 检查API兼容性...');
      const compatibility = await this.syncManager.checkAPICompatibility();
      phase.steps.push({
        step: 'check_compatibility',
        status: compatibility.overall === 'compatible' ? 'success' : 'warning',
        data: compatibility
      });

      // 4.3 更新本地同步状态
      console.log('📝 更新本地同步状态...');
      const syncStatus = this.syncManager.getSyncStatus();
      phase.steps.push({
        step: 'update_sync_status',
        status: 'success',
        data: syncStatus
      });

      phase.status = 'completed';
      console.log('✅ 前后端同步完成');

    } catch (error) {
      phase.status = 'failed';
      phase.error = error.message;
      console.error('❌ 前后端同步失败:', error.message);
    }

    phase.endTime = new Date().toISOString();
    this.syncResults.phases.push(phase);
  }

  // 阶段5: 验证同步结果
  async validateSyncResults() {
    console.log('\n✅ 阶段5: 验证同步结果');
    console.log('-'.repeat(40));

    const phase = {
      name: 'validation',
      startTime: new Date().toISOString(),
      steps: []
    };

    try {
      // 5.1 验证关键API端点
      console.log('🧪 验证关键API端点...');
      const endpointTests = await this.testCriticalEndpoints();
      phase.steps.push({
        step: 'test_endpoints',
        status: endpointTests.allPassed ? 'success' : 'warning',
        data: endpointTests
      });

      // 5.2 检查同步完整性
      console.log('📊 检查同步完整性...');
      const integrity = await this.checkSyncIntegrity();
      phase.steps.push({
        step: 'check_integrity',
        status: integrity.isComplete ? 'success' : 'warning',
        data: integrity
      });

      phase.status = 'completed';
      console.log('✅ 同步结果验证完成');

    } catch (error) {
      phase.status = 'failed';
      phase.error = error.message;
      console.error('❌ 同步结果验证失败:', error.message);
    }

    phase.endTime = new Date().toISOString();
    this.syncResults.phases.push(phase);
  }

  // 测试关键API端点
  async testCriticalEndpoints() {
    const criticalEndpoints = [
      { path: '', method: 'GET', description: '根端点' },
      { path: '/auth/validate-token', method: 'GET', description: 'Token验证' },
      { path: '/user/profile', method: 'GET', description: '用户信息' }
    ];

    const results = [];
    let passedCount = 0;

    for (const endpoint of criticalEndpoints) {
      try {
        const response = await this.makeHttpRequest(endpoint.path, endpoint.method);
        results.push({
          endpoint: endpoint.path,
          method: endpoint.method,
          description: endpoint.description,
          status: 'passed',
          response: response
        });
        passedCount++;
      } catch (error) {
        results.push({
          endpoint: endpoint.path,
          method: endpoint.method,
          description: endpoint.description,
          status: 'failed',
          error: error.message
        });
      }
    }

    return {
      total: criticalEndpoints.length,
      passed: passedCount,
      failed: criticalEndpoints.length - passedCount,
      allPassed: passedCount === criticalEndpoints.length,
      results: results
    };
  }

  // 检查同步完整性
  async checkSyncIntegrity() {
    const phases = this.syncResults.phases;
    const completedPhases = phases.filter(p => p.status === 'completed').length;
    const totalPhases = phases.length;

    return {
      totalPhases: totalPhases,
      completedPhases: completedPhases,
      completionRate: totalPhases > 0 ? (completedPhases / totalPhases * 100).toFixed(1) : 0,
      isComplete: completedPhases === totalPhases,
      failedPhases: phases.filter(p => p.status === 'failed').map(p => p.name)
    };
  }

  // 阶段6: 生成同步报告
  async generateSyncReport() {
    console.log('\n📄 阶段6: 生成同步报告');
    console.log('-'.repeat(40));

    // 生成摘要
    this.syncResults.summary = {
      totalPhases: this.syncResults.phases.length,
      completedPhases: this.syncResults.phases.filter(p => p.status === 'completed').length,
      failedPhases: this.syncResults.phases.filter(p => p.status === 'failed').length,
      duration: this.calculateDuration(),
      timestamp: new Date().toISOString()
    };

    // 生成建议
    this.syncResults.recommendations = this.generateRecommendations();

    // 保存报告
    const reportPath = path.join(__dirname, '..', 'temp', 'api-sync-report.json');
    fs.mkdirSync(path.dirname(reportPath), { recursive: true });
    fs.writeFileSync(reportPath, JSON.stringify(this.syncResults, null, 2));

    console.log('📊 同步报告已生成:', reportPath);
    console.log('\n' + '='.repeat(60));
    console.log('📋 同步摘要:');
    console.log(`  ✅ 完成阶段: ${this.syncResults.summary.completedPhases}/${this.syncResults.summary.totalPhases}`);
    console.log(`  ❌ 失败阶段: ${this.syncResults.summary.failedPhases}`);
    console.log(`  ⏱️  总耗时: ${this.syncResults.summary.duration}`);
    
    if (this.syncResults.recommendations.length > 0) {
      console.log('\n💡 建议:');
      this.syncResults.recommendations.forEach((rec, index) => {
        console.log(`  ${index + 1}. ${rec}`);
      });
    }
  }

  // 计算持续时间
  calculateDuration() {
    const start = new Date(this.syncResults.timestamp);
    const end = new Date();
    const duration = Math.round((end - start) / 1000);
    return `${duration}秒`;
  }

  // 生成建议
  generateRecommendations() {
    const recommendations = [];
    const failedPhases = this.syncResults.phases.filter(p => p.status === 'failed');

    if (failedPhases.length > 0) {
      recommendations.push('存在失败的同步阶段，建议检查网络连接和后端服务状态');
    }

    // 检查后端可用性
    const statusPhase = this.syncResults.phases.find(p => p.name === 'status_check');
    if (statusPhase && statusPhase.steps) {
      const backendStep = statusPhase.steps.find(s => s.step === 'backend_availability');
      if (backendStep && backendStep.status === 'failed') {
        recommendations.push('后端服务不可用，建议联系后端开发人员启动服务');
      }
    }

    // 检查版本差异
    if (statusPhase && statusPhase.steps) {
      const versionStep = statusPhase.steps.find(s => s.step === 'version_diff');
      if (versionStep && versionStep.data && versionStep.data.needsUpdate) {
        recommendations.push('检测到版本差异，建议后端团队更新API到最新版本');
      }
    }

    if (recommendations.length === 0) {
      recommendations.push('所有同步检查已完成，系统状态良好');
    }

    return recommendations;
  }

  // HTTP请求工具
  async makeHttpRequest(path, method = 'GET') {
    // 这里暂时模拟HTTP请求
    // 在实际环境中应该使用真实的HTTP客户端
    const baseUrl = 'https://your-api-domain.com/api';
    
    // 模拟响应
    if (path === '') {
      return {
        success: true,
        version: '1.0.0',
        message: '学习质效分析系统API',
        endpoints: ['/auth', '/user', '/study']
      };
    }
    
    throw new Error('网络连接失败 - 后端服务未启动');
  }
}

// 如果直接运行此脚本
if (require.main === module) {
  const syncer = new ComprehensiveAPISync();
  syncer.execute()
    .then(results => {
      console.log('\n🎉 API同步完成');
      process.exit(0);
    })
    .catch(error => {
      console.error('\n💥 API同步失败:', error.message);
      process.exit(1);
    });
}

module.exports = ComprehensiveAPISync;

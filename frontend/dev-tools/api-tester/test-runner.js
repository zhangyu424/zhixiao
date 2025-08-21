/**
 * API测试执行器
 * 仅供开发过程使用
 */

const fs = require('fs');
const path = require('path');

class APITestRunner {
  constructor(configPath = './test-cases.json') {
    this.config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
    this.environment = process.env.NODE_ENV || 'development';
    this.baseUrl = this.config.environment[this.environment].baseUrl;
    this.timeout = this.config.environment[this.environment].timeout;
    this.userToken = process.env.DEV_USER_TOKEN;
    this.adminToken = process.env.DEV_ADMIN_TOKEN;
    this.results = [];
  }

  async runAllTests() {
    console.log('🧪 API测试开始...');
    console.log(`📍 测试环境: ${this.environment}`);
    console.log(`🌐 API地址: ${this.baseUrl}`);
    console.log('='.repeat(60));

    for (const suite of this.config.testSuites) {
      await this.runTestSuite(suite);
    }

    this.generateReport();
  }

  async runTestSuite(suite) {
    console.log(`\n📋 测试套件: ${suite.name}`);
    console.log(`📝 描述: ${suite.description}`);

    if (suite.requiresAuth && !this.userToken) {
      console.log('⚠️  跳过需要认证的测试 (未设置DEV_USER_TOKEN)');
      return;
    }

    console.log('-'.repeat(50));

    const suiteResults = {
      name: suite.name,
      total: suite.tests.length,
      passed: 0,
      failed: 0,
      skipped: 0,
      tests: []
    };

    for (const test of suite.tests) {
      const result = await this.runTest(test, suite);
      suiteResults.tests.push(result);

      if (result.status === 'passed') {
        suiteResults.passed++;
      } else if (result.status === 'failed') {
        suiteResults.failed++;
      } else {
        suiteResults.skipped++;
      }
    }

    this.results.push(suiteResults);

    console.log(
      `\n📊 套件结果: ✅ ${suiteResults.passed} | ❌ ${suiteResults.failed} | ⏭️ ${suiteResults.skipped}`
    );
  }

  async runTest(test, suite) {
    const testResult = {
      name: test.name,
      status: 'running',
      duration: 0,
      error: null,
      response: null
    };

    try {
      console.log(`  🔍 ${test.name}...`);

      // 检查是否需要跳过
      if (test.requiresAdmin && !this.adminToken) {
        testResult.status = 'skipped';
        testResult.error = '需要管理员token';
        console.log(`    ⏭️  跳过 (需要管理员权限)`);
        return testResult;
      }

      const startTime = Date.now();

      // 构建请求
      const url = `${this.baseUrl}${test.endpoint}`;
      const options = {
        method: test.method,
        headers: {
          ...test.headers
        }
      };

      // 添加认证
      if (suite.requiresAuth && !test.skipAuth) {
        const token = test.requiresAdmin ? this.adminToken : this.userToken;
        if (token) {
          options.headers['Authorization'] = `Bearer ${token}`;
        }
      }

      // 添加请求体
      if (test.body) {
        options.body = JSON.stringify(test.body);
      }

      // 发送请求
      const response = await this.makeRequest(url, options);
      const endTime = Date.now();

      testResult.duration = endTime - startTime;
      testResult.response = response;

      // 验证结果
      const validation = this.validateResponse(response, test);

      if (validation.success) {
        testResult.status = 'passed';
        console.log(`    ✅ 通过 (${testResult.duration}ms)`);
      } else {
        testResult.status = 'failed';
        testResult.error = validation.error;
        console.log(`    ❌ 失败: ${validation.error}`);
      }
    } catch (error) {
      testResult.status = 'failed';
      testResult.error = error.message;
      testResult.duration = Date.now() - (testResult.startTime || Date.now());
      console.log(`    ❌ 异常: ${error.message}`);
    }

    return testResult;
  }

  async makeRequest(url, options) {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.timeout);

    try {
      // 使用 node-fetch 或其他HTTP客户端
      if (typeof fetch === 'undefined') {
        // 在Node.js环境中模拟fetch
        return await this.nodeFetch(url, options);
      }

      const response = await fetch(url, {
        ...options,
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      let data;
      try {
        data = await response.json();
      } catch {
        data = await response.text();
      }

      return {
        status: response.status,
        statusText: response.statusText,
        headers: Object.fromEntries(response.headers.entries()),
        data
      };
    } catch (error) {
      clearTimeout(timeoutId);
      throw error;
    }
  }

  async nodeFetch(url, options) {
    // 简化的HTTP请求实现，实际使用时可以用node-fetch或axios
    const https = require('https');
    const http = require('http');
    const urlParsed = new URL(url);

    return new Promise((resolve, reject) => {
      const client = urlParsed.protocol === 'https:' ? https : http;

      const req = client.request(
        {
          hostname: urlParsed.hostname,
          port: urlParsed.port,
          path: urlParsed.pathname + urlParsed.search,
          method: options.method,
          headers: options.headers
        },
        res => {
          let data = '';
          res.on('data', chunk => (data += chunk));
          res.on('end', () => {
            try {
              const parsedData = JSON.parse(data);
              resolve({
                status: res.statusCode,
                statusText: res.statusMessage,
                headers: res.headers,
                data: parsedData
              });
            } catch {
              resolve({
                status: res.statusCode,
                statusText: res.statusMessage,
                headers: res.headers,
                data: data
              });
            }
          });
        }
      );

      req.on('error', reject);

      if (options.body) {
        req.write(options.body);
      }

      req.end();
    });
  }

  validateResponse(response, test) {
    try {
      // 验证状态码
      if (test.expectedStatus && response.status !== test.expectedStatus) {
        return {
          success: false,
          error: `状态码错误: 期望 ${test.expectedStatus}, 实际 ${response.status}`
        };
      }

      // 验证必需字段
      if (test.expectedFields && typeof response.data === 'object') {
        for (const field of test.expectedFields) {
          if (!this.hasNestedProperty(response.data, field)) {
            return {
              success: false,
              error: `缺少字段: ${field}`
            };
          }
        }
      }

      // 验证数据类型
      if (test.dataValidation) {
        for (const [path, expectedType] of Object.entries(
          test.dataValidation
        )) {
          const value = this.getNestedProperty(response.data, path);
          if (!this.validateType(value, expectedType)) {
            return {
              success: false,
              error: `字段类型错误: ${path} 期望 ${expectedType}, 实际 ${typeof value}`
            };
          }
        }
      }

      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: `验证异常: ${error.message}`
      };
    }
  }

  hasNestedProperty(obj, path) {
    return this.getNestedProperty(obj, path) !== undefined;
  }

  getNestedProperty(obj, path) {
    return path.split('.').reduce((current, key) => {
      return current && current[key];
    }, obj);
  }

  validateType(value, expectedType) {
    if (expectedType === 'array') {
      return Array.isArray(value);
    }
    if (expectedType === 'object') {
      return (
        typeof value === 'object' && value !== null && !Array.isArray(value)
      );
    }
    return typeof value === expectedType;
  }

  generateReport() {
    console.log('\n' + '='.repeat(60));
    console.log('📊 测试报告');
    console.log('='.repeat(60));

    let totalTests = 0;
    let totalPassed = 0;
    let totalFailed = 0;
    let totalSkipped = 0;

    this.results.forEach(suite => {
      totalTests += suite.total;
      totalPassed += suite.passed;
      totalFailed += suite.failed;
      totalSkipped += suite.skipped;

      console.log(`\n📋 ${suite.name}:`);
      console.log(`  ✅ 通过: ${suite.passed}`);
      console.log(`  ❌ 失败: ${suite.failed}`);
      console.log(`  ⏭️  跳过: ${suite.skipped}`);
      console.log(
        `  📊 成功率: ${((suite.passed / (suite.total - suite.skipped)) * 100).toFixed(1)}%`
      );
    });

    console.log('\n' + '-'.repeat(30));
    console.log('📈 总体统计:');
    console.log(`  总测试数: ${totalTests}`);
    console.log(`  ✅ 通过: ${totalPassed}`);
    console.log(`  ❌ 失败: ${totalFailed}`);
    console.log(`  ⏭️  跳过: ${totalSkipped}`);
    console.log(
      `  📊 总成功率: ${((totalPassed / (totalTests - totalSkipped)) * 100).toFixed(1)}%`
    );

    // 生成JSON报告
    const reportData = {
      timestamp: new Date().toISOString(),
      environment: this.environment,
      summary: {
        total: totalTests,
        passed: totalPassed,
        failed: totalFailed,
        skipped: totalSkipped,
        successRate: (
          (totalPassed / (totalTests - totalSkipped)) *
          100
        ).toFixed(1)
      },
      suites: this.results
    };

    const reportPath = path.join(__dirname, `test-report-${Date.now()}.json`);
    fs.writeFileSync(reportPath, JSON.stringify(reportData, null, 2));

    console.log(`\n📄 详细报告已保存: ${reportPath}`);
    console.log('='.repeat(60));
  }
}

// 运行测试
if (require.main === module) {
  const runner = new APITestRunner();

  console.log('🧪 文档API测试工具');
  console.log('仅供开发过程使用\n');

  // 检查环境变量
  if (!process.env.DEV_USER_TOKEN) {
    console.log('⚠️  提示: 未设置 DEV_USER_TOKEN，将跳过需要认证的测试');
  }
  if (!process.env.DEV_ADMIN_TOKEN) {
    console.log('⚠️  提示: 未设置 DEV_ADMIN_TOKEN，将跳过需要管理员权限的测试');
  }

  runner.runAllTests().catch(error => {
    console.error('❌ 测试执行失败:', error.message);
    process.exit(1);
  });
}

module.exports = APITestRunner;

// utils/document-api-sync.js
// 文档API同步工具 - 专门处理zhixiaodocs与后端的API交互
// 注意：此工具仅用于需求同步，不提供界面化功能，与生产环境隔离

const DocumentAPISyncer = {
  // 配置
  config: {
    // 使用独立的文档API端点，与生产环境隔离
    baseUrl: 'http://140.143.143.195/api/docs',
    // 开发模式，确保不影响生产数据
    isDevelopment: true,
    // 同步标识
    syncSource: 'frontend-development'
  },

  // 获取后端文档列表
  async getDocumentList() {
    try {
      console.log('📋 获取后端文档列表...');
      
      const response = await this.makeRequest('/list', 'GET');
      
      if (response.success) {
        const { categories, total } = response.data;
        console.log(`✅ 获取到 ${total} 个文档`);
        
        // 按类别整理文档
        return {
          success: true,
          data: {
            total,
            categories,
            developmentDocs: categories.development || [],
            integrationDocs: categories.integration || [],
            deploymentDocs: categories.deployment || [],
            managementDocs: categories.management || []
          }
        };
      } else {
        throw new Error(response.message || '获取文档列表失败');
      }
    } catch (error) {
      console.error('❌ 获取文档列表失败:', error.message);
      return { success: false, error: error.message };
    }
  },

  // 获取具体文档内容
  async getDocument(docId, format = 'markdown') {
    try {
      console.log(`📖 获取文档: ${docId}`);
      
      const response = await this.makeRequest(`/${docId}?format=${format}`, 'GET');
      
      if (response.success) {
        const doc = response.data;
        console.log(`✅ 文档获取成功: ${doc.title}`);
        
        return {
          success: true,
          data: {
            id: doc.id,
            title: doc.title,
            content: doc.content,
            category: doc.category,
            lastModified: doc.lastModified,
            metadata: doc.metadata || {}
          }
        };
      } else {
        throw new Error(response.message || '获取文档失败');
      }
    } catch (error) {
      console.error(`❌ 获取文档失败 (${docId}):`, error.message);
      return { success: false, error: error.message };
    }
  },

  // 搜索文档
  async searchDocuments(query, category = '', limit = 10) {
    try {
      console.log(`🔍 搜索文档: ${query}`);
      
      if (!query || query.length < 2) {
        return { success: false, error: '搜索关键词至少需要2个字符' };
      }

      const params = new URLSearchParams({
        q: query,
        limit: limit.toString()
      });
      
      if (category) {
        params.append('category', category);
      }

      const response = await this.makeRequest(`/search?${params}`, 'GET');
      
      if (response.success) {
        const { results, total } = response.data;
        console.log(`✅ 搜索到 ${total} 个相关文档`);
        
        return {
          success: true,
          data: {
            query,
            total,
            results: results.map(doc => ({
              id: doc.id,
              title: doc.title,
              category: doc.category,
              snippet: doc.snippet,
              relevance: doc.relevance
            }))
          }
        };
      } else {
        throw new Error(response.message || '搜索失败');
      }
    } catch (error) {
      console.error(`❌ 搜索失败 (${query}):`, error.message);
      return { success: false, error: error.message };
    }
  },

  // 提交需求反馈 (需要token)
  async submitRequirement(requirement, token) {
    try {
      console.log(`💬 提交需求反馈: ${requirement.title}`);
      
      // 验证必要字段
      if (!requirement.title || !requirement.content) {
        throw new Error('标题和内容为必填项');
      }

      // 构建反馈数据
      const feedbackData = {
        type: requirement.type || 'requirement',
        title: requirement.title,
        content: requirement.content,
        priority: requirement.priority || 'medium',
        category: requirement.category || 'api',
        source: this.config.syncSource,
        // 添加前端环境信息
        environment: {
          source: 'miniprogram-frontend',
          timestamp: new Date().toISOString(),
          isDevelopment: this.config.isDevelopment
        }
      };

      const response = await this.makeRequest('/feedback', 'POST', feedbackData, token);
      
      if (response.success) {
        console.log(`✅ 需求提交成功 ID: ${response.data.id}`);
        
        return {
          success: true,
          data: {
            id: response.data.id,
            status: response.data.status,
            createdAt: response.data.createdAt,
            message: '需求提交成功，将在后续版本中考虑实现'
          }
        };
      } else {
        throw new Error(response.message || '需求提交失败');
      }
    } catch (error) {
      console.error('❌ 需求提交失败:', error.message);
      return { success: false, error: error.message };
    }
  },

  // 同步API需求 (批量操作)
  async syncAPIRequirements(requirements, token) {
    try {
      console.log(`🔄 批量同步 ${requirements.length} 个API需求...`);
      
      const results = [];
      
      for (const req of requirements) {
        const result = await this.submitRequirement(req, token);
        results.push({
          title: req.title,
          success: result.success,
          id: result.data?.id,
          error: result.error
        });
        
        // 避免请求过快
        await this.delay(500);
      }
      
      const successCount = results.filter(r => r.success).length;
      console.log(`✅ 同步完成: ${successCount}/${requirements.length} 成功`);
      
      return {
        success: true,
        data: {
          total: requirements.length,
          successCount,
          failedCount: requirements.length - successCount,
          results
        }
      };
    } catch (error) {
      console.error('❌ 批量同步失败:', error.message);
      return { success: false, error: error.message };
    }
  },

  // 获取前端API需求清单 (基于现有文档)
  async generateAPIRequirements() {
    try {
      console.log('📋 生成前端API需求清单...');
      
      // 基于现有的API需求文档生成需求
      const requirements = [
        {
          title: '微信登录API优化',
          content: '当前微信登录流程需要优化，建议支持静默登录和多次登录处理',
          type: 'requirement',
          priority: 'high',
          category: 'auth'
        },
        {
          title: '学习记录批量操作API',
          content: '需要支持学习记录的批量添加、编辑和删除功能，提高数据处理效率',
          type: 'requirement',
          priority: 'medium',
          category: 'study'
        },
        {
          title: '数据导出API增强',
          content: '当前数据导出功能较基础，建议支持多种格式(Excel, PDF)和自定义导出字段',
          type: 'requirement',
          priority: 'medium',
          category: 'export'
        },
        {
          title: 'API响应时间优化',
          content: '部分API响应时间较长，建议优化数据库查询和增加缓存机制',
          type: 'issue',
          priority: 'high',
          category: 'performance'
        },
        {
          title: '实时通知推送API',
          content: '需要实现实时通知推送功能，支持学习提醒和系统通知',
          type: 'requirement',
          priority: 'low',
          category: 'notification'
        }
      ];
      
      return {
        success: true,
        data: {
          requirements,
          count: requirements.length,
          generated: new Date().toISOString()
        }
      };
    } catch (error) {
      console.error('❌ 生成需求清单失败:', error.message);
      return { success: false, error: error.message };
    }
  },

  // 执行完整的API同步流程
  async performFullSync(token) {
    try {
      console.log('🚀 开始执行完整的API同步流程...');
      
      const syncResults = {
        documentList: null,
        apiSearch: null,
        requirements: null,
        submission: null,
        timestamp: new Date().toISOString()
      };

      // 1. 获取文档列表
      console.log('\n📋 步骤 1: 获取后端文档列表');
      syncResults.documentList = await this.getDocumentList();
      
      // 2. 搜索API相关文档
      console.log('\n🔍 步骤 2: 搜索API相关文档');
      syncResults.apiSearch = await this.searchDocuments('API');
      
      // 3. 生成API需求
      console.log('\n📝 步骤 3: 生成API需求清单');
      syncResults.requirements = await this.generateAPIRequirements();
      
      // 4. 提交需求 (如果有token)
      if (token && syncResults.requirements.success) {
        console.log('\n💬 步骤 4: 提交API需求');
        syncResults.submission = await this.syncAPIRequirements(
          syncResults.requirements.data.requirements,
          token
        );
      } else {
        console.log('\n⚠️ 步骤 4: 跳过需求提交 (无token或生成失败)');
        syncResults.submission = { success: false, error: 'No token provided or requirements generation failed' };
      }

      // 5. 生成同步报告
      console.log('\n📊 步骤 5: 生成同步报告');
      const report = await this.generateSyncReport(syncResults);
      
      console.log('\n✅ API同步流程完成');
      return {
        success: true,
        data: {
          syncResults,
          report,
          summary: {
            documentsFound: syncResults.documentList.success ? syncResults.documentList.data.total : 0,
            searchResults: syncResults.apiSearch.success ? syncResults.apiSearch.data.total : 0,
            requirementsGenerated: syncResults.requirements.success ? syncResults.requirements.data.count : 0,
            requirementsSubmitted: syncResults.submission.success ? syncResults.submission.data.successCount : 0
          }
        }
      };
    } catch (error) {
      console.error('❌ API同步流程失败:', error.message);
      return { success: false, error: error.message };
    }
  },

  // 生成同步报告
  async generateSyncReport(syncResults) {
    const report = {
      timestamp: syncResults.timestamp,
      status: 'completed',
      results: {
        documentSync: syncResults.documentList.success ? 'success' : 'failed',
        apiSearch: syncResults.apiSearch.success ? 'success' : 'failed',
        requirementGeneration: syncResults.requirements.success ? 'success' : 'failed',
        requirementSubmission: syncResults.submission.success ? 'success' : 'failed'
      },
      summary: {
        totalDocuments: syncResults.documentList.success ? syncResults.documentList.data.total : 0,
        apiSearchResults: syncResults.apiSearch.success ? syncResults.apiSearch.data.total : 0,
        requirementsGenerated: syncResults.requirements.success ? syncResults.requirements.data.count : 0,
        requirementsSubmitted: syncResults.submission.success ? syncResults.submission.data.successCount : 0
      },
      recommendations: [
        '定期执行API同步以保持文档更新',
        '及时处理提交的需求反馈',
        '关注API性能和稳定性指标',
        '确保前后端API接口版本一致性'
      ]
    };

    // 保存报告到本地 (开发环境)
    if (this.config.isDevelopment) {
      await this.saveLocalReport(report);
    }

    return report;
  },

  // 保存本地报告
  async saveLocalReport(report) {
    try {
      // 在实际环境中，这里会保存到本地文件
      console.log('📄 保存同步报告到本地...');
      console.log('报告内容:', JSON.stringify(report, null, 2));
      return true;
    } catch (error) {
      console.error('保存报告失败:', error.message);
      return false;
    }
  },

  // 网络请求工具
  async makeRequest(endpoint, method = 'GET', data = null, token = null) {
    const url = this.config.baseUrl + endpoint;
    
    const options = {
      method,
      headers: {
        'Content-Type': 'application/json'
      }
    };

    if (token) {
      options.headers['Authorization'] = `Bearer ${token}`;
    }

    if (data && method !== 'GET') {
      options.body = JSON.stringify(data);
    }

    try {
      // 在微信小程序中使用wx.request
      if (typeof wx !== 'undefined') {
        return new Promise((resolve, reject) => {
          wx.request({
            url,
            method,
            data: data || {},
            header: options.headers,
            success: (res) => {
              resolve(res.data);
            },
            fail: (err) => {
              reject(new Error(err.errMsg || 'Request failed'));
            }
          });
        });
      } else {
        // Node.js环境中的请求处理
        const response = await fetch(url, options);
        return await response.json();
      }
    } catch (error) {
      throw new Error(`请求失败: ${error.message}`);
    }
  },

  // 延迟工具
  delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
};

module.exports = DocumentAPISyncer;

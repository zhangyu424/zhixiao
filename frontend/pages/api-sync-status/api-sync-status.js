// pages/api-sync-status/api-sync-status.js
// API同步状态页面

const { APISyncManager } = require('../../utils/api/api-sync-manager');

Page({
  data: {
    syncStatus: null,
    syncHistory: [],
    compatibility: null,
    isLoading: false,
    lastUpdate: null
  },

  onLoad: function() {
    this.apiSync = new APISyncManager();
    this.loadSyncStatus();
  },

  onShow: function() {
    this.refreshStatus();
  },

  // 加载同步状态
  loadSyncStatus: function() {
    const status = this.apiSync.getSyncStatus();
    const history = wx.getStorageSync('api_sync_records') || [];
    
    this.setData({
      syncStatus: status,
      syncHistory: history.slice(-10), // 最近10条记录
      lastUpdate: new Date().toLocaleString()
    });
  },

  // 刷新状态
  refreshStatus: function() {
    this.loadSyncStatus();
    this.checkCompatibility();
  },

  // 检查API兼容性
  async checkCompatibility() {
    this.setData({ isLoading: true });
    
    try {
      const compatibility = await this.apiSync.checkAPICompatibility();
      this.setData({ 
        compatibility: compatibility,
        isLoading: false 
      });
    } catch (error) {
      console.error('兼容性检查失败:', error);
      this.setData({ 
        compatibility: { overall: 'error', error: error.message },
        isLoading: false 
      });
    }
  },

  // 执行API同步
  async executeSync() {
    wx.showLoading({ title: '同步中...' });

    try {
      const result = await this.apiSync.syncAPIDocumentation();
      
      wx.hideLoading();
      
      if (result.success) {
        wx.showToast({
          title: '同步成功',
          icon: 'success'
        });
      } else {
        wx.showToast({
          title: result.message || '同步失败',
          icon: 'none'
        });
      }

      // 刷新状态
      this.refreshStatus();
    } catch (error) {
      wx.hideLoading();
      console.error('同步失败:', error);
      
      wx.showModal({
        title: '同步失败',
        content: error.message || '未知错误',
        showCancel: false
      });
    }
  },

  // 查看同步记录详情
  viewSyncDetail: function(e) {
    const index = e.currentTarget.dataset.index;
    const record = this.data.syncHistory[index];

    wx.showModal({
      title: '同步记录',
      content: JSON.stringify(record, null, 2),
      showCancel: false
    });
  },

  // 清除同步历史
  clearHistory: function() {
    wx.showModal({
      title: '确认清除',
      content: '确定要清除所有同步历史记录吗？',
      success: (res) => {
        if (res.confirm) {
          wx.removeStorageSync('api_sync_records');
          this.refreshStatus();
          
          wx.showToast({
            title: '已清除',
            icon: 'success'
          });
        }
      }
    });
  },

  // 导出API文档
  exportAPIDoc: function() {
    const requirements = this.apiSync.generateAPIRequirements();
    
    // 转换为可读格式
    const docContent = this.formatAPIDocumentation(requirements);
    
    // 这里可以实现文档导出功能
    wx.showModal({
      title: 'API文档',
      content: '文档已生成，可通过开发者工具查看控制台输出',
      showCancel: false
    });

    console.log('📋 API文档:', docContent);
  },

  // 格式化API文档
  formatAPIDocumentation: function(requirements) {
    let doc = '# API接口文档\n\n';
    doc += `生成时间: ${requirements.timestamp}\n`;
    doc += `客户端版本: ${requirements.clientVersion}\n\n`;

    // 遍历API分类
    Object.entries(requirements.requiredAPIs).forEach(([category, apis]) => {
      doc += `## ${this.getCategoryName(category)}\n\n`;
      
      if (apis.endpoints) {
        apis.endpoints.forEach(endpoint => {
          doc += `### ${endpoint.description}\n`;
          doc += `- **路径**: ${endpoint.path}\n`;
          doc += `- **方法**: ${endpoint.method}\n`;
          doc += `- **必需**: ${endpoint.required ? '是' : '否'}\n`;
          
          if (endpoint.requestSchema) {
            doc += '- **请求参数**:\n';
            Object.entries(endpoint.requestSchema).forEach(([key, schema]) => {
              doc += `  - ${key}: ${schema.type} ${schema.required ? '(必需)' : '(可选)'} - ${schema.description || ''}\n`;
            });
          }
          
          doc += '\n';
        });
      }
    });

    return doc;
  },

  // 获取分类名称
  getCategoryName: function(category) {
    const names = {
      authentication: '认证相关',
      userManagement: '用户管理',
      studyRecord: '学习记录',
      analytics: '分析统计',
      notifications: '通知消息'
    };
    
    return names[category] || category;
  },

  // 获取状态显示文本
  getStatusText: function(status) {
    const texts = {
      never_synced: '从未同步',
      pending_backend_implementation: '等待后端实现',
      sync_success: '同步成功',
      sync_failed: '同步失败',
      compatible: '兼容',
      incompatible: '不兼容',
      unknown: '未知'
    };
    
    return texts[status] || status;
  },

  // 获取状态颜色
  getStatusColor: function(status) {
    const colors = {
      never_synced: '#999',
      pending_backend_implementation: '#f39c12',
      sync_success: '#27ae60',
      sync_failed: '#e74c3c',
      compatible: '#27ae60',
      incompatible: '#e74c3c',
      unknown: '#999'
    };
    
    return colors[status] || '#999';
  }
});

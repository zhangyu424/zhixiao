// pages/management/management.js
Page({
  data: {
    userRole: 'student',
    currentTab: 'import',
    tabList: [
      { key: 'import', title: '数据导入', roles: ['manager', 'admin'] },
      {
        key: 'export',
        title: '数据导出',
        roles: ['instructor', 'manager', 'admin']
      },
      { key: 'organization', title: '组织管理', roles: ['admin'] },
      { key: 'users', title: '用户管理', roles: ['manager', 'admin'] },
      { key: 'settings', title: '系统设置', roles: ['admin'] }
    ],
    availableTabs: [],

    // 导入相关
    importType: 'students',
    importFile: null,
    importProgress: 0,
    importResult: null,

    // 导出相关
    exportType: 'students',
    exportDateRange: [],
    exportLoading: false,

    // 组织架构
    organizationTree: [],
    selectedUnit: null,

    // 用户管理
    userList: [],
    userSearchKey: '',

    // 系统设置
    systemSettings: {
      reminderTime: '21:00',
      allowDataEdit: true,
      maxEditDays: 30
    }
  },

  onLoad: function (options) {
    this.checkPermission();
    this.setData({
      currentTab: options.tab || 'import'
    });
    this.loadTabData();
  },

  onShow: function () {
    this.loadTabData();
  },

  // 检查权限
  checkPermission: function () {
    const userInfo = wx.getStorageSync('userInfo');
    if (!userInfo) {
      wx.redirectTo({
        url: '/pages/unified-login/unified-login'
      });
      return;
    }

    const userRole = userInfo.role;
    const availableTabs = this.data.tabList.filter(tab =>
      tab.roles.includes(userRole)
    );

    if (availableTabs.length === 0) {
      wx.showToast({
        title: '无管理权限',
        icon: 'none'
      });
      wx.switchTab({
        url: '/pages/index/index'
      });
      return;
    }

    this.setData({
      userRole: userRole,
      availableTabs: availableTabs
    });
  },

  // 加载当前标签页数据
  loadTabData: function () {
    const { currentTab } = this.data;

    switch (currentTab) {
      case 'import':
        this.loadImportData();
        break;
      case 'export':
        this.loadExportData();
        break;
      case 'organization':
        this.loadOrganizationData();
        break;
      case 'users':
        this.loadUserData();
        break;
      case 'settings':
        this.loadSettingsData();
        break;
    }
  },

  // 标签切换
  onTabChange: function (e) {
    const tab = e.currentTarget.dataset.tab;
    this.setData({
      currentTab: tab
    });
    this.loadTabData();
  },

  // === 数据导入相关 ===
  loadImportData: function () {
    // 加载导入相关数据
  },

  onImportTypeChange: function (e) {
    this.setData({
      importType: e.detail.value
    });
  },

  chooseImportFile: function () {
    wx.chooseMessageFile({
      count: 1,
      type: 'file',
      extension: ['xlsx', 'xls'],
      success: res => {
        if (res.tempFiles.length > 0) {
          const file = res.tempFiles[0];
          // 计算文件大小显示文本
          const sizeText = (file.size / 1024).toFixed(1) + ' KB';
          this.setData({
            importFile: {
              ...file,
              sizeText: sizeText
            },
            importResult: null
          });
        }
      },
      fail: () => {
        wx.showToast({
          title: '文件选择失败',
          icon: 'none'
        });
      }
    });
  },

  downloadTemplate: function () {
    const { importType } = this.data;
    const templateUrls = {
      students: '/templates/students_template.xlsx',
      scores: '/templates/scores_template.xlsx'
    };

    const url = templateUrls[importType];
    if (!url) return;

    wx.downloadFile({
      url: url,
      success: res => {
        if (res.statusCode === 200) {
          wx.openDocument({
            filePath: res.tempFilePath,
            showMenu: true,
            success: () => {
              wx.showToast({
                title: '模板已打开',
                icon: 'success'
              });
            }
          });
        }
      },
      fail: () => {
        wx.showToast({
          title: '模板下载失败',
          icon: 'none'
        });
      }
    });
  },

  startImport: function () {
    const { importFile, importType } = this.data;

    if (!importFile) {
      wx.showToast({
        title: '请先选择文件',
        icon: 'none'
      });
      return;
    }

    wx.showLoading({
      title: '导入中...'
    });

    const app = getApp();

    // 上传文件
    wx.uploadFile({
      url: app.globalData.baseUrl + '/management/import',
      filePath: importFile.path,
      name: 'file',
      formData: {
        type: importType
      },
      success: res => {
        wx.hideLoading();

        try {
          const result = JSON.parse(res.data);
          if (result.success) {
            this.setData({
              importResult: result.data,
              importFile: null
            });

            wx.showToast({
              title: '导入完成',
              icon: 'success'
            });
          } else {
            wx.showToast({
              title: result.message || '导入失败',
              icon: 'none'
            });
          }
        } catch (e) {
          wx.showToast({
            title: '导入失败',
            icon: 'none'
          });
        }
      },
      fail: () => {
        wx.hideLoading();
        wx.showToast({
          title: '网络错误',
          icon: 'none'
        });
      }
    });
  },

  // === 数据导出相关 ===
  loadExportData: function () {
    // 加载导出相关数据
  },

  onExportTypeChange: function (e) {
    this.setData({
      exportType: e.detail.value
    });
  },

  onDateRangeChange: function (e) {
    this.setData({
      exportDateRange: e.detail.value
    });
  },

  startExport: function () {
    const { exportType, exportDateRange } = this.data;

    this.setData({
      exportLoading: true
    });

    const app = getApp();

    app.request({
      url: '/management/export',
      method: 'POST',
      data: {
        type: exportType,
        dateRange: exportDateRange
      },
      success: res => {
        this.setData({
          exportLoading: false
        });

        if (res.success) {
          // 下载文件
          wx.downloadFile({
            url: res.data.fileUrl,
            success: downloadRes => {
              if (downloadRes.statusCode === 200) {
                wx.openDocument({
                  filePath: downloadRes.tempFilePath,
                  showMenu: true,
                  success: () => {
                    wx.showToast({
                      title: '导出成功',
                      icon: 'success'
                    });
                  }
                });
              }
            },
            fail: () => {
              wx.showToast({
                title: '文件下载失败',
                icon: 'none'
              });
            }
          });
        } else {
          wx.showToast({
            title: res.message || '导出失败',
            icon: 'none'
          });
        }
      },
      fail: () => {
        this.setData({
          exportLoading: false
        });
        wx.showToast({
          title: '网络错误',
          icon: 'none'
        });
      }
    });
  },

  // === 组织架构管理 ===
  loadOrganizationData: function () {
    const app = getApp();

    app.request({
      url: '/management/organization/tree',
      success: res => {
        if (res.success) {
          this.setData({
            organizationTree: res.data
          });
        }
      }
    });
  },

  onUnitSelect: function (e) {
    const unit = e.currentTarget.dataset.unit;
    this.setData({
      selectedUnit: unit
    });
  },

  addUnit: function () {
    wx.navigateTo({
      url:
        '/pages/unit-edit/unit-edit?mode=add&parent=' +
        (this.data.selectedUnit?.id || '')
    });
  },

  editUnit: function () {
    if (!this.data.selectedUnit) {
      wx.showToast({
        title: '请先选择单位',
        icon: 'none'
      });
      return;
    }

    wx.navigateTo({
      url:
        '/pages/unit-edit/unit-edit?mode=edit&id=' + this.data.selectedUnit.id
    });
  },

  deleteUnit: function () {
    if (!this.data.selectedUnit) {
      wx.showToast({
        title: '请先选择单位',
        icon: 'none'
      });
      return;
    }

    wx.showModal({
      title: '确认删除',
      content: '确定要删除该单位吗？删除后无法恢复。',
      success: res => {
        if (res.confirm) {
          this.performDeleteUnit();
        }
      }
    });
  },

  performDeleteUnit: function () {
    const app = getApp();

    app.request({
      url: '/management/organization/delete',
      method: 'POST',
      data: {
        id: this.data.selectedUnit.id
      },
      success: res => {
        if (res.success) {
          wx.showToast({
            title: '删除成功',
            icon: 'success'
          });

          this.setData({
            selectedUnit: null
          });

          this.loadOrganizationData();
        } else {
          wx.showToast({
            title: res.message || '删除失败',
            icon: 'none'
          });
        }
      }
    });
  },

  // === 用户管理 ===
  loadUserData: function () {
    const app = getApp();

    app.request({
      url: '/management/users',
      data: {
        keyword: this.data.userSearchKey
      },
      success: res => {
        if (res.success) {
          this.setData({
            userList: res.data
          });
        }
      }
    });
  },

  onUserSearch: function (e) {
    this.setData({
      userSearchKey: e.detail.value
    });

    // 防抖搜索
    clearTimeout(this.searchTimer);
    this.searchTimer = setTimeout(() => {
      this.loadUserData();
    }, 500);
  },

  addUser: function () {
    wx.navigateTo({
      url: '/pages/user-edit/user-edit?mode=add'
    });
  },

  editUser: function (e) {
    const userId = e.currentTarget.dataset.id;
    wx.navigateTo({
      url: '/pages/user-edit/user-edit?mode=edit&id=' + userId
    });
  },

  // === 系统设置 ===
  loadSettingsData: function () {
    const app = getApp();

    app.request({
      url: '/management/settings',
      success: res => {
        if (res.success) {
          this.setData({
            systemSettings: res.data
          });
        }
      }
    });
  },

  onReminderTimeChange: function (e) {
    this.setData({
      'systemSettings.reminderTime': e.detail.value
    });
  },

  onAllowDataEditChange: function (e) {
    this.setData({
      'systemSettings.allowDataEdit': e.detail.value
    });
  },

  onMaxEditDaysChange: function (e) {
    this.setData({
      'systemSettings.maxEditDays': parseInt(e.detail.value)
    });
  },

  saveSettings: function () {
    const app = getApp();

    wx.showLoading({
      title: '保存中...'
    });

    app.request({
      url: '/management/settings',
      method: 'POST',
      data: this.data.systemSettings,
      success: res => {
        wx.hideLoading();

        if (res.success) {
          wx.showToast({
            title: '保存成功',
            icon: 'success'
          });
        } else {
          wx.showToast({
            title: res.message || '保存失败',
            icon: 'none'
          });
        }
      },
      fail: () => {
        wx.hideLoading();
        wx.showToast({
          title: '网络错误',
          icon: 'none'
        });
      }
    });
  }
});

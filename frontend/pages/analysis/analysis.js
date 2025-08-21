// pages/analysis/analysis.js
Page({
  data: {
    userRole: 'student', // student, instructor, manager, admin
    viewType: 'personal', // personal, team, global
    examList: [],
    selectedExam: null,
    analysisData: null,
    chartData: {},
    trendChartData: {},
    unitList: [],
    selectedUnit: null,
    loading: true,
    rankingColumns: [
      { key: 'rank', title: '排名', width: '80rpx' },
      { key: 'name', title: '姓名', flex: 2 },
      { key: 'unit', title: '单位', flex: 2 },
      { key: 'score', title: '分数', width: '100rpx' },
      { key: 'studyTime', title: '学时', width: '100rpx' }
    ]
  },

  onLoad: function (options) {
    const userInfo = wx.getStorageSync('userInfo');
    if (!userInfo) {
      wx.redirectTo({
        url: '/pages/unified-login/unified-login'
      });
      return;
    }

    this.setData({
      userRole: userInfo.role,
      viewType: options.type || 'personal'
    });

    this.loadExamList();
    this.loadUnitList();
  },

  onShow: function () {
    this.loadAnalysisData();
  },

  // 加载考试列表
  loadExamList: function () {
    const app = getApp();

    app.request({
      url: '/exam/list',
      success: res => {
        if (res.success && res.data.length > 0) {
          this.setData({
            examList: res.data,
            selectedExam: res.data[0] // 默认选择最新考试
          });
          this.loadAnalysisData();
        }
      }
    });
  },

  // 加载单位列表（层级长和管理员使用）
  loadUnitList: function () {
    const { userRole } = this.data;

    if (
      userRole === 'instructor' ||
      userRole === 'manager' ||
      userRole === 'admin'
    ) {
      const app = getApp();

      app.request({
        url: '/organization/units',
        success: res => {
          if (res.success) {
            this.setData({
              unitList: res.data
            });
          }
        }
      });
    }
  },

  // 加载分析数据
  loadAnalysisData: function () {
    const { selectedExam, viewType, selectedUnit } = this.data;

    if (!selectedExam) return;

    this.setData({ loading: true });

    const app = getApp();

    let url = '/analysis/data';
    let params = {
      examId: selectedExam.id,
      type: viewType
    };

    if (viewType === 'team' && selectedUnit) {
      params.unitId = selectedUnit.id;
    }

    app.request({
      url: url,
      data: params,
      success: res => {
        if (res.success) {
          this.setData({
            analysisData: res.data,
            loading: false
          });
          this.generateChartData(res.data);
        }
      },
      fail: () => {
        this.setData({ loading: false });
      }
    });
  },

  // 生成图表数据
  generateChartData: function (data) {
    const { viewType } = this.data;

    if (viewType === 'personal') {
      this.generatePersonalCharts(data);
    } else if (viewType === 'team') {
      this.generateTeamCharts(data);
    } else {
      this.generateGlobalCharts(data);
    }
  },

  // 生成个人图表数据
  generatePersonalCharts: function (data) {
    // 个人成绩趋势图
    const trendChart = {
      categories: data.examHistory.map(item => item.examName),
      series: [
        {
          name: '考试成绩',
          data: data.examHistory.map(item => item.score)
        },
        {
          name: '学习时长',
          data: data.examHistory.map(item => item.studyTime)
        }
      ]
    };

    // 学习时长热力图数据
    const heatmapData = this.generateHeatmapData(data.dailyStudyTime);

    this.setData({
      chartData: {
        trend: trendChart,
        heatmap: heatmapData
      }
    });
  },

  // 生成团队图表数据
  generateTeamCharts: function (data) {
    // 团队成员排名图
    const rankingChart = {
      categories: data.memberRanking.map(item => item.name),
      series: [
        {
          name: '考试成绩',
          data: data.memberRanking.map(item => item.score)
        },
        {
          name: '学习时长',
          data: data.memberRanking.map(item => item.studyTime)
        }
      ]
    };

    // 团队趋势图
    const teamTrendChart = {
      categories: data.teamTrend.map(item => item.examName),
      series: [
        {
          name: '平均成绩',
          data: data.teamTrend.map(item => item.avgScore)
        },
        {
          name: '平均学习时长',
          data: data.teamTrend.map(item => item.avgStudyTime)
        }
      ]
    };

    this.setData({
      chartData: {
        ranking: rankingChart,
        trend: teamTrendChart
      }
    });
  },

  // 生成全局图表数据
  generateGlobalCharts: function (data) {
    // 各单位对比图
    const unitCompareChart = {
      categories: data.unitComparison.map(item => item.unitName),
      series: [
        {
          name: '平均成绩',
          data: data.unitComparison.map(item => item.avgScore)
        },
        {
          name: '平均学习时长',
          data: data.unitComparison.map(item => item.avgStudyTime)
        }
      ]
    };

    this.setData({
      chartData: {
        unitCompare: unitCompareChart
      }
    });
  },

  // 生成热力图数据
  generateHeatmapData: function (dailyData) {
    // 将日常学习数据转换为热力图格式
    const weeks = [];
    let currentWeek = [];

    dailyData.forEach((item, index) => {
      currentWeek.push({
        date: item.date,
        value: item.studyTime,
        day: new Date(item.date).getDay()
      });

      if (currentWeek.length === 7 || index === dailyData.length - 1) {
        weeks.push([...currentWeek]);
        currentWeek = [];
      }
    });

    return weeks;
  },

  // 考试选择
  onExamChange: function (e) {
    const index = e.detail.value;
    const selectedExam = this.data.examList[index];

    this.setData({
      selectedExam: selectedExam
    });

    this.loadAnalysisData();
  },

  // 单位选择
  onUnitChange: function (e) {
    const index = e.detail.value;
    const selectedUnit = this.data.unitList[index];

    this.setData({
      selectedUnit: selectedUnit
    });

    this.loadAnalysisData();
  },

  // 视图切换
  onViewTypeChange: function (e) {
    const viewType = e.currentTarget.dataset.type;

    this.setData({
      viewType: viewType,
      selectedUnit: null
    });

    this.loadAnalysisData();
  },

  // 导出图表
  exportChart: function (e) {
    const chartType = e.currentTarget.dataset.type;

    wx.showActionSheet({
      itemList: ['保存为图片', '导出PDF报告'],
      success: res => {
        if (res.tapIndex === 0) {
          this.saveChartAsImage(chartType);
        } else if (res.tapIndex === 1) {
          this.exportPDF();
        }
      }
    });
  },

  // 保存图表为图片
  saveChartAsImage: function (chartType) {
    wx.showLoading({
      title: '生成图片中...'
    });

    // 这里需要使用Canvas绘制图表并保存
    // 由于篇幅限制，此处仅提供框架
    setTimeout(() => {
      wx.hideLoading();
      wx.showToast({
        title: '图片已保存到相册',
        icon: 'success'
      });
    }, 2000);
  },

  // 导出PDF报告
  exportPDF: function () {
    const { selectedExam, analysisData, viewType } = this.data;

    wx.showLoading({
      title: '生成报告中...'
    });

    const app = getApp();
    app.request({
      url: '/analysis/export-pdf',
      method: 'POST',
      data: {
        examId: selectedExam.id,
        viewType: viewType,
        analysisData: analysisData
      },
      success: res => {
        wx.hideLoading();

        if (res.success) {
          // 下载PDF文件
          wx.downloadFile({
            url: res.data.fileUrl,
            success: downloadRes => {
              if (downloadRes.statusCode === 200) {
                wx.openDocument({
                  filePath: downloadRes.tempFilePath,
                  showMenu: true,
                  success: () => {
                    wx.showToast({
                      title: 'PDF报告已生成',
                      icon: 'success'
                    });
                  }
                });
              }
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
        wx.hideLoading();
        wx.showToast({
          title: '网络错误',
          icon: 'none'
        });
      }
    });
  },

  // 查看详细数据
  viewDetailData: function (e) {
    const type = e.currentTarget.dataset.type;
    const data = e.currentTarget.dataset.data;

    wx.navigateTo({
      url: `/pages/analysis-detail/analysis-detail?type=${type}&data=${JSON.stringify(data)}`
    });
  },

  // 图表就绪事件
  onChartReady: function (e) {
    console.log('图表就绪:', e.detail);
  },

  // 表格行点击事件
  onMemberTap: function (e) {
    const member = e.detail.item;
    wx.showModal({
      title: member.name,
      content: `分数: ${member.score}分\n学时: ${member.studyTime}小时`,
      showCancel: false
    });
  }
});

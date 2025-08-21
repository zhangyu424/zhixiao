// pages/study-report/study-report.js
Page({
  data: {
    selectedDate: '',
    studyTime: '',
    historyList: [],
    showDatePicker: false,
    currentMonth: '',
    calendarData: [],
    hasSubscribed: false
  },

  onLoad: function (options) {
    const today = new Date();
    const dateStr = this.formatDate(today);

    this.setData({
      selectedDate: dateStr,
      currentMonth: `${today.getFullYear()}-${(today.getMonth() + 1).toString().padStart(2, '0')}`
    });

    this.loadTodayData();
    this.loadHistoryData();
    this.generateCalendar();
  },

  onShow: function () {
    this.checkSubscribeStatus();
  },

  // 格式化日期
  formatDate: function (date) {
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    return `${year}-${month}-${day}`;
  },

  // 加载当天数据
  loadTodayData: function () {
    const app = getApp();

    app.request({
      url: `/study/detail?date=${this.data.selectedDate}`,
      success: res => {
        if (res.success && res.data) {
          this.setData({
            studyTime: res.data.studyTime.toString()
          });
        }
      }
    });
  },

  // 加载历史数据
  loadHistoryData: function () {
    const app = getApp();

    app.request({
      url: '/study/history',
      data: {
        month: this.data.currentMonth
      },
      success: res => {
        if (res.success) {
          const historyList = res.data || [];
          // 计算统计数据
          const totalStudyTime = historyList.reduce(
            (sum, item) => sum + item.studyTime,
            0
          );
          const averageStudyTime =
            historyList.length > 0
              ? (totalStudyTime / historyList.length).toFixed(1)
              : '0';

          this.setData({
            historyList: historyList,
            totalStudyTime: totalStudyTime,
            averageStudyTime: averageStudyTime
          });
          this.generateCalendar();
        }
      }
    });
  },

  // 生成日历数据
  generateCalendar: function () {
    const [year, month] = this.data.currentMonth.split('-').map(Number);
    const firstDay = new Date(year, month - 1, 1);
    const lastDay = new Date(year, month, 0);
    const startDate = new Date(firstDay);
    startDate.setDate(firstDay.getDate() - firstDay.getDay());

    const calendar = [];
    const today = new Date();
    const todayStr = this.formatDate(today);

    for (let i = 0; i < 42; i++) {
      const date = new Date(startDate);
      date.setDate(startDate.getDate() + i);

      const dateStr = this.formatDate(date);
      const historyData = this.data.historyList.find(
        item => item.date === dateStr
      );

      calendar.push({
        date: dateStr,
        day: date.getDate(),
        isCurrentMonth: date.getMonth() === month - 1,
        isToday: dateStr === todayStr,
        isSelected: dateStr === this.data.selectedDate,
        hasData: !!historyData,
        studyTime: historyData ? historyData.studyTime : 0
      });
    }

    this.setData({
      calendarData: calendar
    });
  },

  // 学习时长输入
  onStudyTimeInput: function (e) {
    this.setData({
      studyTime: e.detail.value
    });
  },

  // 日期选择
  onDateTap: function (e) {
    const date = e.currentTarget.dataset.date;
    const today = new Date();
    const selectedDate = new Date(date);

    // 不能选择未来日期
    if (selectedDate > today) {
      wx.showToast({
        title: '不能选择未来日期',
        icon: 'none'
      });
      return;
    }

    this.setData({
      selectedDate: date
    });

    this.generateCalendar();
    this.loadTodayData();
  },

  // 月份切换
  onMonthChange: function (e) {
    const direction = e.currentTarget.dataset.direction;
    const [year, month] = this.data.currentMonth.split('-').map(Number);

    let newYear = year;
    let newMonth = month;

    if (direction === 'prev') {
      newMonth--;
      if (newMonth < 1) {
        newMonth = 12;
        newYear--;
      }
    } else {
      newMonth++;
      if (newMonth > 12) {
        newMonth = 1;
        newYear++;
      }
    }

    const newMonthStr = `${newYear}-${newMonth.toString().padStart(2, '0')}`;

    this.setData({
      currentMonth: newMonthStr
    });

    this.loadHistoryData();
  },

  // 提交学习时间
  submitStudyTime: function () {
    const { selectedDate, studyTime } = this.data;

    if (!studyTime || isNaN(parseFloat(studyTime))) {
      wx.showToast({
        title: '请输入有效的学习时长',
        icon: 'none'
      });
      return;
    }

    const time = parseFloat(studyTime);
    if (time < 0 || time > 24) {
      wx.showToast({
        title: '学习时长应在0-24小时之间',
        icon: 'none'
      });
      return;
    }

    // 使用真实API提交
    const api = require('../../api/index');

    api.study
      .submit({
        date: selectedDate,
        studyTime: time
      })
      .then(result => {
        if (result.success) {
          wx.showToast({
            title: '提交成功',
            icon: 'success'
          });

          this.loadHistoryData();
          this.requestSubscribeMessage();
        } else {
          wx.showToast({
            title: result.message || '提交失败',
            icon: 'none'
          });
        }
      })
      .catch(error => {
        console.error('提交失败:', error);
        wx.showToast({
          title: '网络错误，请重试',
          icon: 'none'
        });
      });
  },

  // 编辑历史记录
  editHistoryItem: function (e) {
    const item = e.currentTarget.dataset.item;

    wx.showModal({
      title: '编辑学习时间',
      editable: true,
      placeholderText: item.studyTime.toString(),
      success: res => {
        if (res.confirm && res.content) {
          const newTime = parseFloat(res.content);
          if (isNaN(newTime) || newTime < 0 || newTime > 24) {
            wx.showToast({
              title: '请输入有效时间(0-24)',
              icon: 'none'
            });
            return;
          }

          this.updateStudyTime(item.date, newTime);
        }
      }
    });
  },

  // 更新学习时间
  updateStudyTime: function (date, time) {
    const app = getApp();

    wx.showLoading({
      title: '更新中...'
    });

    app.request({
      url: '/study/update',
      method: 'POST',
      data: {
        date: date,
        studyTime: time
      },
      success: res => {
        wx.hideLoading();

        if (res.success) {
          wx.showToast({
            title: '更新成功',
            icon: 'success'
          });

          this.loadHistoryData();

          if (date === this.data.selectedDate) {
            this.setData({
              studyTime: time.toString()
            });
          }
        } else {
          wx.showToast({
            title: res.message || '更新失败',
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

  // 检查订阅状态
  checkSubscribeStatus: function () {
    // 检查用户是否已订阅每日提醒
    const hasSubscribed = wx.getStorageSync('hasSubscribed');
    this.setData({
      hasSubscribed: hasSubscribed
    });
  },

  // 请求订阅消息
  requestSubscribeMessage: function () {
    if (this.data.hasSubscribed) return;

    wx.requestSubscribeMessage({
      tmplIds: ['YOUR_DAILY_REMINDER_TEMPLATE_ID'], // 替换为实际的模板ID
      success: res => {
        if (res['YOUR_DAILY_REMINDER_TEMPLATE_ID'] === 'accept') {
          wx.setStorageSync('hasSubscribed', true);
          this.setData({
            hasSubscribed: true
          });

          wx.showToast({
            title: '订阅成功，将在每日21点提醒您填报',
            icon: 'none',
            duration: 3000
          });
        }
      },
      fail: () => {
        console.log('用户拒绝订阅');
      }
    });
  },

  // 手动订阅提醒
  subscribeReminder: function () {
    this.requestSubscribeMessage();
  }
});

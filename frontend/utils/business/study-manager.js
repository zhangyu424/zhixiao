const apiManager = require('../../api/index');
const configManager = require('../common/config');

/**
 * 学习业务逻辑管理
 */
class StudyManager {
  constructor() {
    this.currentTimer = null;
    this.studyGoals = null;
    this.studyStats = null;
  }

  /**
   * 开始学习
   */
  async startStudy(subject, content = '') {
    try {
      // 检查是否已有进行中的学习
      if (this.currentTimer) {
        throw new Error('已有进行中的学习，请先结束当前学习');
      }

      // 开始计时
      const response = await apiManager.study.startStudyTimer(subject, content);
      
      if (response.success) {
        this.currentTimer = {
          id: response.data.id,
          subject,
          content,
          startTime: new Date(),
          isRunning: true,
          duration: 0
        };

        // 开始本地计时器
        this.startLocalTimer();
        
        return {
          success: true,
          data: this.currentTimer
        };
      }
      
      throw new Error(response.message || '开始学习失败');
    } catch (error) {
      console.error('开始学习失败:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * 暂停学习
   */
  async pauseStudy() {
    try {
      if (!this.currentTimer || !this.currentTimer.isRunning) {
        throw new Error('没有进行中的学习');
      }

      const response = await apiManager.study.pauseStudyTimer(this.currentTimer.id);
      
      if (response.success) {
        this.currentTimer.isRunning = false;
        this.stopLocalTimer();
        
        return {
          success: true,
          data: this.currentTimer
        };
      }
      
      throw new Error(response.message || '暂停学习失败');
    } catch (error) {
      console.error('暂停学习失败:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * 恢复学习
   */
  async resumeStudy() {
    try {
      if (!this.currentTimer || this.currentTimer.isRunning) {
        throw new Error('学习状态异常');
      }

      const response = await apiManager.study.resumeStudyTimer(this.currentTimer.id);
      
      if (response.success) {
        this.currentTimer.isRunning = true;
        this.startLocalTimer();
        
        return {
          success: true,
          data: this.currentTimer
        };
      }
      
      throw new Error(response.message || '恢复学习失败');
    } catch (error) {
      console.error('恢复学习失败:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * 结束学习
   */
  async stopStudy(endData = {}) {
    try {
      if (!this.currentTimer) {
        throw new Error('没有进行中的学习');
      }

      const response = await apiManager.study.stopStudyTimer(this.currentTimer.id, endData);
      
      if (response.success) {
        this.stopLocalTimer();
        const completedStudy = { ...this.currentTimer };
        this.currentTimer = null;
        
        // 更新统计数据
        await this.refreshStats();
        
        return {
          success: true,
          data: completedStudy
        };
      }
      
      throw new Error(response.message || '结束学习失败');
    } catch (error) {
      console.error('结束学习失败:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * 开始本地计时器
   */
  startLocalTimer() {
    const interval = configManager.get('study.timerInterval', 1000);
    
    this.timerInterval = setInterval(() => {
      if (this.currentTimer && this.currentTimer.isRunning) {
        this.currentTimer.duration = Math.floor(
          (new Date() - this.currentTimer.startTime) / 1000
        );
        
        // 触发更新事件
        this.emitTimerUpdate();
      }
    }, interval);
  }

  /**
   * 停止本地计时器
   */
  stopLocalTimer() {
    if (this.timerInterval) {
      clearInterval(this.timerInterval);
      this.timerInterval = null;
    }
  }

  /**
   * 触发计时器更新事件
   */
  emitTimerUpdate() {
    // 可以在这里触发页面更新事件
    if (typeof getApp === 'function') {
      const app = getApp();
      if (app.globalData && app.globalData.onStudyTimerUpdate) {
        app.globalData.onStudyTimerUpdate(this.currentTimer);
      }
    }
  }

  /**
   * 获取当前学习状态
   */
  getCurrentStudy() {
    return this.currentTimer;
  }

  /**
   * 获取学习目标
   */
  async getStudyGoals() {
    try {
      if (!this.studyGoals) {
        const response = await apiManager.study.getStudyGoals();
        if (response.success) {
          this.studyGoals = response.data;
        }
      }
      return this.studyGoals;
    } catch (error) {
      console.error('获取学习目标失败:', error);
      return null;
    }
  }

  /**
   * 设置学习目标
   */
  async setStudyGoal(goalData) {
    try {
      const response = await apiManager.study.setStudyGoal(goalData);
      if (response.success) {
        this.studyGoals = response.data;
        return response;
      }
      throw new Error(response.message || '设置学习目标失败');
    } catch (error) {
      console.error('设置学习目标失败:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * 获取学习统计
   */
  async getStudyStats(refresh = false) {
    try {
      if (!this.studyStats || refresh) {
        const response = await apiManager.study.getStudyStats();
        if (response.success) {
          this.studyStats = response.data;
        }
      }
      return this.studyStats;
    } catch (error) {
      console.error('获取学习统计失败:', error);
      return null;
    }
  }

  /**
   * 刷新统计数据
   */
  async refreshStats() {
    return await this.getStudyStats(true);
  }

  /**
   * 检查学习目标完成情况
   */
  async checkGoalProgress() {
    try {
      const goals = await this.getStudyGoals();
      const stats = await this.getStudyStats();
      
      if (!goals || !stats) {
        return null;
      }

      const today = new Date().toDateString();
      const todayStats = stats.dailyStats.find(day => 
        new Date(day.date).toDateString() === today
      );

      const progress = {
        daily: {
          goal: goals.daily || 3.0,
          current: todayStats ? todayStats.totalTime / 3600 : 0,
          percentage: 0
        },
        weekly: {
          goal: goals.weekly || 21.0,
          current: stats.weeklyTotal / 3600,
          percentage: 0
        }
      };

      progress.daily.percentage = Math.min(
        (progress.daily.current / progress.daily.goal) * 100, 
        100
      );
      
      progress.weekly.percentage = Math.min(
        (progress.weekly.current / progress.weekly.goal) * 100, 
        100
      );

      return progress;
    } catch (error) {
      console.error('检查目标进度失败:', error);
      return null;
    }
  }

  /**
   * 获取学习建议
   */
  async getStudySuggestions() {
    try {
      const response = await apiManager.study.getStudySuggestions();
      return response.success ? response.data : null;
    } catch (error) {
      console.error('获取学习建议失败:', error);
      return null;
    }
  }

  /**
   * 清理资源
   */
  cleanup() {
    this.stopLocalTimer();
    this.currentTimer = null;
    this.studyGoals = null;
    this.studyStats = null;
  }
}

// 创建单例实例
const studyManager = new StudyManager();

module.exports = studyManager;

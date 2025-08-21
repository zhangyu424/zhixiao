const StudyRecord = require('../models/StudyRecord');
const { asyncHandler } = require('../middleware/errorHandler');

class StudyController {
  // 提交学习时间
  static submit = asyncHandler(async (req, res) => {
    const { date, studyTime, subject, remark } = req.body;
    const userId = req.user.id;

    try {
      const recordId = await StudyRecord.create({
        userId,
        date,
        studyTime: parseFloat(studyTime),
        subject: subject || '',
        remark: remark || ''
      });

      res.status(201).json({
        success: true,
        message: '学习时间提交成功',
        data: { recordId }
      });
    } catch (error) {
      console.error('StudyController.submit error:', error);
      res.status(500).json({
        success: false,
        message: '提交失败，请稍后重试'
      });
    }
  });

  // 获取学习历史
  static getHistory = asyncHandler(async (req, res) => {
    const userId = req.user.id;
    const { startDate, endDate, page, limit } = req.query;

    try {
      const result = await StudyRecord.getUserHistory(userId, {
        startDate: startDate && startDate !== 'undefined' ? startDate : null,
        endDate: endDate && endDate !== 'undefined' ? endDate : null,
        page: parseInt(page) || 1,
        limit: parseInt(limit) || 20
      });

      res.json({
        success: true,
        data: result
      });
    } catch (error) {
      console.error('StudyController.getHistory error:', error);
      res.status(500).json({
        success: false,
        message: '获取历史记录失败'
      });
    }
  });

  // 获取月度日历数据
  static getCalendar = asyncHandler(async (req, res) => {
    const userId = req.user.id;
    const { month } = req.query;

    try {
      const records = await StudyRecord.getMonthlyData(userId, month);
      res.json({
        success: true,
        data: records
      });
    } catch (error) {
      console.error('StudyController.getCalendar error:', error);
      res.status(500).json({
        success: false,
        message: '获取月度数据失败'
      });
    }
  });

  // 获取学习统计
  static getStats = asyncHandler(async (req, res) => {
    const userId = req.user.id;
    const { startDate, endDate } = req.query;

    try {
      const stats = await StudyRecord.getUserStats(userId, {
        startDate: startDate && startDate !== 'undefined' ? startDate : null,
        endDate: endDate && endDate !== 'undefined' ? endDate : null
      });

      res.json({
        success: true,
        data: {
          totalDays: parseInt(stats?.total_days) || 0,
          totalHours: parseFloat(stats?.total_hours) || 0,
          avgDailyHours: parseFloat(stats?.avg_daily_hours) || 0,
          maxDailyHours: parseFloat(stats?.max_daily_hours) || 0,
          minDailyHours: parseFloat(stats?.min_daily_hours) || 0
        }
      });
    } catch (error) {
      console.error('StudyController.getStats error:', error);
      res.json({
        success: true,
        data: {
          totalDays: 0,
          totalHours: 0,
          avgDailyHours: 0,
          maxDailyHours: 0,
          minDailyHours: 0
        }
      });
    }
  });

  // 获取排名
  static getRanking = asyncHandler(async (req, res) => {
    const userId = req.user.id;
    const { scope = 'unit', period = 'month' } = req.query;

    try {
      const ranking = await StudyRecord.getRanking(userId, scope, period);
      res.json({
        success: true,
        data: ranking || {
          userRanking: null,
          totalParticipants: 0,
          topRankings: []
        }
      });
    } catch (error) {
      console.error('StudyController.getRanking error:', error);
      res.json({
        success: true,
        data: {
          userRanking: null,
          totalParticipants: 0,
          topRankings: []
        }
      });
    }
  });

  // 获取学习热力图数据
  static getHeatmapData = asyncHandler(async (req, res) => {
    const userId = req.user.id;
    const { year = new Date().getFullYear() } = req.query;

    const startDate = `${year}-01-01`;
    const endDate = `${year}-12-31`;

    try {
      const records = await StudyRecord.getUserHistory(userId, {
        startDate,
        endDate,
        limit: 365
      });

      const heatmapData = records.records ? records.records.map(record => ({
        date: record.date,
        value: parseFloat(record.study_time) || 0
      })) : [];

      res.json({
        success: true,
        data: heatmapData
      });
    } catch (error) {
      console.error('StudyController.getHeatmapData error:', error);
      res.json({
        success: true,
        data: []
      });
    }
  });

  // 获取今日学习数据
  static getTodayData = asyncHandler(async (req, res) => {
    const userId = req.user.id;
    const today = new Date().toISOString().split('T')[0];

    try {
      const todayRecords = await StudyRecord.getUserHistory(userId, {
        startDate: today,
        endDate: today,
        limit: 10
      });

      const todayStudyTime = todayRecords.records ? todayRecords.records.reduce((total, record) => {
        return total + parseFloat(record.study_time || 0);
      }, 0) : 0;

      res.json({
        success: true,
        data: {
          date: today,
          studyTime: todayStudyTime,
          todayGoal: 3.0,
          progress: Math.min((todayStudyTime / 3.0) * 100, 100),
          recordCount: todayRecords.records ? todayRecords.records.length : 0,
          records: todayRecords.records || []
        }
      });
    } catch (error) {
      console.error('StudyController.getTodayData error:', error);
      res.json({
        success: true,
        data: {
          date: today,
          studyTime: 0,
          todayGoal: 3.0,
          progress: 0,
          recordCount: 0,
          records: []
        }
      });
    }
  });

  // 获取本周学习数据
  static getWeekData = asyncHandler(async (req, res) => {
    const userId = req.user.id;
    const today = new Date();
    const weekStart = new Date(today);
    weekStart.setDate(today.getDate() - today.getDay() + 1);
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekStart.getDate() + 6);

    const startDate = weekStart.toISOString().split('T')[0];
    const endDate = weekEnd.toISOString().split('T')[0];

    try {
      const weekRecords = await StudyRecord.getUserHistory(userId, {
        startDate,
        endDate,
        limit: 50
      });

      const totalTime = weekRecords.records ? weekRecords.records.reduce((sum, record) => {
        return sum + parseFloat(record.study_time || 0);
      }, 0) : 0;

      res.json({
        success: true,
        data: {
          weekStart: startDate,
          weekEnd: endDate,
          totalStudyTime: totalTime,
          averageDailyTime: totalTime / 7,
          records: weekRecords.records || [],
          weekGoal: 21.0
        }
      });
    } catch (error) {
      console.error('StudyController.getWeekData error:', error);
      res.json({
        success: true,
        data: {
          weekStart: startDate,
          weekEnd: endDate,
          totalStudyTime: 0,
          averageDailyTime: 0,
          records: [],
          weekGoal: 21.0
        }
      });
    }
  });

  // 获取月度数据
  static getMonthData = asyncHandler(async (req, res) => {
    const userId = req.user.id;
    const { month } = req.query;
    
    const targetDate = month ? new Date(month + '-01') : new Date();
    const monthStart = new Date(targetDate.getFullYear(), targetDate.getMonth(), 1);
    const monthEnd = new Date(targetDate.getFullYear(), targetDate.getMonth() + 1, 0);

    const startDate = monthStart.toISOString().split('T')[0];
    const endDate = monthEnd.toISOString().split('T')[0];

    try {
      const monthRecords = await StudyRecord.getUserHistory(userId, {
        startDate,
        endDate,
        limit: 200
      });

      const totalTime = monthRecords.records ? monthRecords.records.reduce((sum, record) => {
        return sum + parseFloat(record.study_time || 0);
      }, 0) : 0;

      res.json({
        success: true,
        data: {
          month: targetDate.toISOString().split('T')[0].substring(0, 7),
          monthStart: startDate,
          monthEnd: endDate,
          totalStudyTime: totalTime,
          records: monthRecords.records || [],
          monthGoal: 90.0
        }
      });
    } catch (error) {
      console.error('StudyController.getMonthData error:', error);
      res.json({
        success: true,
        data: {
          month: targetDate.toISOString().split('T')[0].substring(0, 7),
          monthStart: startDate,
          monthEnd: endDate,
          totalStudyTime: 0,
          records: [],
          monthGoal: 90.0
        }
      });
    }
  });

  // 删除学习记录
  static deleteRecord = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const userId = req.user.id;

    try {
      const deleted = await StudyRecord.delete(parseInt(id), userId);
      if (!deleted) {
        return res.status(404).json({
          success: false,
          message: '记录不存在或无权删除'
        });
      }

      res.json({
        success: true,
        message: '删除成功'
      });
    } catch (error) {
      console.error('StudyController.deleteRecord error:', error);
      res.status(500).json({
        success: false,
        message: '删除失败，请稍后重试'
      });
    }
  });

  // 获取团队统计
  static getTeamStats = asyncHandler(async (req, res) => {
    const { unitId } = req.user;
    const { startDate, endDate, limit } = req.query;

    if (!unitId) {
      return res.status(403).json({
        success: false,
        message: '无权访问团队统计'
      });
    }

    try {
      const stats = await StudyRecord.getTeamStats(unitId, {
        startDate,
        endDate,
        limit: parseInt(limit) || 50
      });

      res.json({
        success: true,
        data: stats || []
      });
    } catch (error) {
      console.error('StudyController.getTeamStats error:', error);
      res.json({
        success: true,
        data: []
      });
    }
  });

  // 批量导入
  static batchImport = asyncHandler(async (req, res) => {
    const { records } = req.body;

    if (!Array.isArray(records) || records.length === 0) {
      return res.status(400).json({
        success: false,
        message: '导入数据不能为空'
      });
    }

    try {
      const importedCount = await StudyRecord.batchImport(records);
      res.json({
        success: true,
        message: `成功导入 ${importedCount} 条记录`,
        data: { importedCount }
      });
    } catch (error) {
      console.error('StudyController.batchImport error:', error);
      res.status(500).json({
        success: false,
        message: '导入失败，请检查数据格式'
      });
    }
  });
}

module.exports = StudyController;

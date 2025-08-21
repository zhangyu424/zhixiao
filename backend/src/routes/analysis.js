const express = require('express');
const { auth } = require('../middleware/auth');
const AnalysisController = require('../controllers/AnalysisController');

const router = express.Router();

// 获取最近分析数据 - 简化版本
router.get('/recent', auth, (req, res) => {
  const userId = req.user.id;
  const { days = 7 } = req.query;
  
  const validDays = Math.min(Math.max(parseInt(days) || 7, 1), 90);
  
  const recentData = {
    userId: parseInt(userId) || 0,
    period: `最近${validDays}天`,
    dateRange: {
      start: new Date(Date.now() - validDays * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      end: new Date().toISOString().split('T')[0]
    },
    summary: {
      totalStudyTime: 0,
      averageDailyTime: 0,
      studyDays: 0,
      completion: 0,
      improvement: 0
    },
    trends: {
      timeSpent: [],
      efficiency: [],
      focus: []
    },
    insights: [
      "暂无足够数据进行分析",
      "建议保持每日学习记录"
    ]
  };
  
  res.json({
    success: true,
    data: recentData,
    message: validDays <= 7 ? "最近学习数据" : "较长期学习分析"
  });
});

// 个人分析
router.get('/personal', auth, AnalysisController.getPersonalAnalysis);

// 学习趋势分析
router.get('/trends', auth, AnalysisController.getTrendsAnalysis);

// 团队分析 (需要特定权限)
router.get('/team', auth, AnalysisController.getTeamAnalysis);

// 排名数据
router.get('/ranking', auth, AnalysisController.getRanking);

// 数据对比分析
router.get('/comparison', auth, AnalysisController.getComparison);

// 热力图数据
router.get('/heatmap', auth, AnalysisController.getHeatmap);

module.exports = router;

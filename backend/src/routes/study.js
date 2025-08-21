const express = require('express');
const StudyController = require('../controllers/StudyController');
const { validate, studySubmitSchema } = require('../middleware/validation');
const { auth, requireInstructor, requireManager } = require('../middleware/auth');

const router = express.Router();

// 提交学习时间
router.post('/submit',
  auth,
  validate(studySubmitSchema),
  StudyController.submit
);

// 获取学习历史
router.get('/history',
  auth,
  StudyController.getHistory
);

// 获取月度日历数据
router.get('/calendar',
  auth,
  StudyController.getCalendar
);

// 获取学习统计
router.get('/stats',
  auth,
  StudyController.getStats
);

// 获取排名
router.get('/ranking',
  auth,
  StudyController.getRanking
);

// 获取热力图数据
router.get('/heatmap',
  auth,
  StudyController.getHeatmapData
);

// P0紧急API - 今日学习数据
router.get('/today',
  auth,
  StudyController.getTodayData
);

// P0紧急API - 本周学习数据
router.get('/week',
  auth,
  StudyController.getWeekData
);

// 本月学习数据
router.get('/month',
  auth,
  StudyController.getMonthData
);

// 删除学习记录
router.delete('/:id',
  auth,
  StudyController.deleteRecord
);

// 获取团队统计（层级长及以上权限）
router.get('/team/stats',
  auth,
  requireInstructor,
  StudyController.getTeamStats
);

// 批量导入学习记录（管理员权限）
router.post('/batch-import',
  auth,
  requireManager,
  StudyController.batchImport
);

module.exports = router;

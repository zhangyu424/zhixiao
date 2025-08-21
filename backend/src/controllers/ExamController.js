const ExamService = require('../services/ExamService');
const { asyncHandler } = require('../middleware/errorHandler');

class ExamController {
  // 获取考试列表
  static getExams = asyncHandler(async (req, res) => {
    const result = await ExamService.getExams(req.query);
    res.json({
      success: true,
      data: result
    });
  });

  // 创建考试
  static createExam = asyncHandler(async (req, res) => {
    const examData = { ...req.body, created_by: req.user.user_id };
    const result = await ExamService.createExam(examData);
    res.status(201).json({
      success: true,
      data: result,
      message: '考试创建成功'
    });
  });

  // 获取考试详情
  static getExamById = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const exam = await ExamService.getExamById(id);
    
    if (!exam) {
      return res.status(404).json({
        success: false,
        message: '考试不存在'
      });
    }
    
    res.json({
      success: true,
      data: exam
    });
  });

  // 更新考试
  static updateExam = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const result = await ExamService.updateExam(id, req.body);
    res.json({
      success: true,
      data: result,
      message: '考试更新成功'
    });
  });

  // 删除考试
  static deleteExam = asyncHandler(async (req, res) => {
    const { id } = req.params;
    await ExamService.deleteExam(id);
    res.json({
      success: true,
      message: '考试删除成功'
    });
  });

  // 参加考试
  static joinExam = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const result = await ExamService.joinExam(id, req.user.user_id);
    res.json({
      success: true,
      data: result,
      message: '成功参加考试'
    });
  });

  // 提交考试答案
  static submitExam = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { answers } = req.body;
    const result = await ExamService.submitExam(id, req.user.user_id, answers);
    res.json({
      success: true,
      data: result,
      message: '考试提交成功'
    });
  });

  // 获取考试统计
  static getExamStats = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const stats = await ExamService.getExamStats(id);
    res.json({
      success: true,
      data: stats
    });
  });

  // 获取用户考试参与记录
  static getUserParticipation = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const participation = await ExamService.getUserExamParticipation(id, req.user.user_id);
    res.json({
      success: true,
      data: participation
    });
  });
}

module.exports = ExamController;

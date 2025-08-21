const express = require('express');
const { auth } = require('../middleware/auth');
const DocumentController = require('../controllers/DocumentController');

const router = express.Router();

// 获取文档列表
router.get('/list', DocumentController.getDocumentList);

// 搜索文档
router.get('/search', DocumentController.searchDocuments);

// 获取具体文档内容
router.get('/:docId', DocumentController.getDocument);

// 提交需求或问题反馈
router.post('/feedback', auth, DocumentController.submitFeedback);

// 获取反馈列表（管理员功能）
router.get('/feedback/list', auth, DocumentController.getFeedbackList);

module.exports = router;

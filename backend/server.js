const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const compression = require('compression');
const path = require('path');
require('dotenv').config();

const config = require('./src/config');
const { testConnection } = require('./src/config/database');
const { errorHandler, notFound } = require('./src/middleware/errorHandler');
const { apiRateLimit } = require('./src/middleware/rateLimit');
const { apiVersion } = require('./src/middleware/versionControl');
const routes = require('./src/routes');

const app = express();
const packageInfo = require('./package.json');

// 测试数据库连接
testConnection();

// 安全中间件
app.use(helmet());

// CORS配置
app.use(cors({
  origin: process.env.NODE_ENV === 'production' 
    ? ['https://your-domain.com'] 
    : true,
  credentials: true
}));

// API版本控制
app.use('/api', apiVersion);

// 请求日志
app.use(morgan(config.env === 'development' ? 'dev' : 'combined'));

// 请求体解析
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// 压缩响应
app.use(compression());

// 静态文件服务
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// API限流
app.use('/api', apiRateLimit);

// 路由
app.use('/api', routes);

// 版本信息端点
app.get('/api/version', (req, res) => {
  res.json({
    name: packageInfo.name,
    version: packageInfo.version,
    apiVersion: req.apiVersion || 'v1',
    description: packageInfo.description,
    environment: process.env.NODE_ENV || 'development',
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
    supportedVersions: ['v1'],
    latestVersion: 'v1'
  });
});

// 健康检查
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: config.env
  });
});

// 根路径
app.get('/', (req, res) => {
  res.json({
    name: '学习质效分析API服务',
    version: '1.0.0',
    description: '为学习质效分析微信小程序提供后端API服务',
    zhixiaodocs: '/api',
    health: '/health'
  });
});

// 404处理
app.use(notFound);

// 错误处理
app.use(errorHandler);

// 启动服务器
const PORT = config.port;
app.listen(PORT, () => {
  console.log(`🚀 服务器启动成功！`);
  console.log(`📍 端口: ${PORT}`);
  console.log(`🌍 环境: ${config.env}`);
  console.log(`📖 API文档: http://localhost:${PORT}/api`);
  console.log(`💊 健康检查: http://localhost:${PORT}/health`);
});

// 优雅关闭
process.on('SIGTERM', () => {
  console.log('📴 收到SIGTERM信号，正在关闭服务器...');
  gracefulShutdown();
});

process.on('SIGINT', () => {
  console.log('📴 收到SIGINT信号，正在关闭服务器...');
  gracefulShutdown();
});

// 未捕获异常处理
process.on('uncaughtException', (error) => {
  console.error('❌ 未捕获的异常:', error);
  console.error('堆栈信息:', error.stack);
  gracefulShutdown(1);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('❌ 未处理的Promise拒绝:', reason);
  console.error('Promise:', promise);
  gracefulShutdown(1);
});

// 优雅关闭函数
function gracefulShutdown(exitCode = 0) {
  console.log('🔄 正在执行优雅关闭...');
  
  // 这里可以添加清理逻辑
  // 例如：关闭数据库连接、清理缓存等
  
  setTimeout(() => {
    console.log('✅ 服务器已关闭');
    process.exit(exitCode);
  }, 5000); // 5秒超时
}

module.exports = app;

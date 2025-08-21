// 全局错误处理中间件
const errorHandler = (error, req, res, next) => {
  console.error('错误详情:', {
    message: error.message,
    stack: error.stack,
    url: req.originalUrl,
    method: req.method,
    body: req.body,
    query: req.query,
    user: req.user?.id || 'anonymous',
    timestamp: new Date().toISOString()
  });

  // 默认错误响应
  let status = 500;
  let message = '服务器内部错误';
  let details = null;

  // 数据库错误
  if (error.code) {
    switch (error.code) {
      case 'ER_DUP_ENTRY':
        status = 409;
        message = '数据已存在，请检查唯一性约束';
        break;
      case 'ER_NO_REFERENCED_ROW_2':
        status = 400;
        message = '引用的数据不存在';
        break;
      case 'ECONNREFUSED':
        status = 503;
        message = '数据库连接失败';
        break;
      case 'PROTOCOL_CONNECTION_LOST':
        status = 503;
        message = '数据库连接丢失，正在重试';
        break;
    }
  }

  // JWT错误
  if (error.name === 'JsonWebTokenError') {
    status = 401;
    message = '无效的认证token';
  } else if (error.name === 'TokenExpiredError') {
    status = 401;
    message = '认证token已过期';
  }

  // 文件上传错误
  if (error.code === 'LIMIT_FILE_SIZE') {
    status = 413;
    message = '文件大小超出限制';
  } else if (error.code === 'LIMIT_FILE_COUNT') {
    status = 413;
    message = '文件数量超出限制';
  }

  // Joi验证错误
  if (error.isJoi) {
    status = 400;
    message = '输入数据验证失败';
    details = error.details.map(detail => detail.message);
  }

  // 自定义业务错误
  if (error.status) {
    status = error.status;
    message = error.message;
  }

  res.status(status).json({
    success: false,
    message,
    ...(details && { details }),
    ...(process.env.NODE_ENV === 'development' && { 
      stack: error.stack,
      originalError: error.message 
    })
  });
};

// 404处理中间件
const notFound = (req, res) => {
  res.status(404).json({
    success: false,
    message: `接口 ${req.method} ${req.originalUrl} 不存在`
  });
};

// 异步错误包装器
const asyncHandler = (fn) => {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

module.exports = {
  errorHandler,
  notFound,
  asyncHandler
};

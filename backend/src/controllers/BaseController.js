const { ResponseUtils } = require('../utils/common');

/**
 * 控制器基类
 * 提供通用的响应方法和错误处理
 */
class BaseController {
  /**
   * 成功响应
   */
  static success(res, data = null, message = '操作成功', code = 200) {
    return ResponseUtils.success(res, data, message, code);
  }

  /**
   * 错误响应
   */
  static error(res, message = '操作失败', code = 400, details = null) {
    return ResponseUtils.error(res, message, code, details);
  }

  /**
   * 服务器错误响应
   */
  static serverError(res, message = '服务器内部错误', error = null) {
    return ResponseUtils.serverError(res, message, error);
  }

  /**
   * 未授权响应
   */
  static unauthorized(res, message = '未授权访问') {
    return ResponseUtils.unauthorized(res, message);
  }

  /**
   * 禁止访问响应
   */
  static forbidden(res, message = '禁止访问') {
    return ResponseUtils.forbidden(res, message);
  }

  /**
   * 资源未找到响应
   */
  static notFound(res, message = '资源未找到') {
    return ResponseUtils.notFound(res, message);
  }

  /**
   * 统一异常处理
   */
  static async handleAsync(handler) {
    return async (req, res, next) => {
      try {
        await handler(req, res, next);
      } catch (error) {
        console.error('Controller Error:', error);
        this.serverError(res, '服务器内部错误', error);
      }
    };
  }

  /**
   * 验证请求数据
   */
  static validateRequest(schema, property = 'body') {
    return (req, res, next) => {
      const { error } = schema.validate(req[property]);
      if (error) {
        return this.error(res, '数据验证失败', 400, 
          error.details.map(detail => detail.message));
      }
      next();
    };
  }
}

module.exports = BaseController;

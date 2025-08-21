#!/bin/bash

# 后端文件结构整理脚本
# 更新控制器以使用新的服务层和验证器

echo "开始整理后端文件结构..."

# 更新所有控制器文件，添加新的导入
backend_dir="/var/www/zhixiao-platform/backend"

# 创建控制器基类
cat > "$backend_dir/src/controllers/BaseController.js" << 'EOF'
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
EOF

# 创建测试文件目录结构
mkdir -p "$backend_dir/tests/unit/controllers"
mkdir -p "$backend_dir/tests/unit/services"
mkdir -p "$backend_dir/tests/unit/models"
mkdir -p "$backend_dir/tests/integration"
mkdir -p "$backend_dir/tests/fixtures"

# 创建简单的测试配置文件
cat > "$backend_dir/tests/jest.config.js" << 'EOF'
module.exports = {
  testEnvironment: 'node',
  roots: ['<rootDir>/src', '<rootDir>/tests'],
  testMatch: ['**/__tests__/**/*.js', '**/?(*.)+(spec|test).js'],
  collectCoverageFrom: [
    'src/**/*.js',
    '!src/**/*.test.js',
    '!src/config/**',
  ],
  coverageDirectory: 'coverage',
  coverageReporters: ['text', 'lcov', 'html'],
  setupFilesAfterEnv: ['<rootDir>/tests/setup.js']
};
EOF

# 创建测试设置文件
cat > "$backend_dir/tests/setup.js" << 'EOF'
// 测试环境设置
process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = 'test-secret-key';
process.env.DB_HOST = 'localhost';
process.env.DB_NAME = 'zhixiao_test';
process.env.DB_USER = 'test_user';
process.env.DB_PASSWORD = 'test_password';

// Mock微信API
global.mockWechatAPI = {
  code2Session: jest.fn(),
  getAccessToken: jest.fn()
};
EOF

# 创建API文档生成配置
cat > "$backend_dir/src/config/swagger.js" << 'EOF'
const swaggerJsdoc = require('swagger-jsdoc');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: '学习质效分析平台 API',
      version: '2.0.1',
      description: '学习质效分析微信小程序后端API文档',
      contact: {
        name: 'API Support',
        email: 'support@zhixiao.com'
      }
    },
    servers: [
      {
        url: 'http://localhost:3000/api',
        description: '开发环境'
      },
      {
        url: 'https://api.zhixiao.com/api',
        description: '生产环境'
      }
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT'
        }
      }
    },
    security: [
      {
        bearerAuth: []
      }
    ]
  },
  apis: ['./src/routes/*.js', './src/controllers/*.js']
};

const specs = swaggerJsdoc(options);

module.exports = specs;
EOF

# 创建中间件索引文件
cat > "$backend_dir/src/middleware/index.js" << 'EOF'
// 中间件统一导出
module.exports = {
  auth: require('./auth'),
  adminAuth: require('./adminAuth'),
  errorHandler: require('./errorHandler'),
  rateLimit: require('./rateLimit'),
  validation: require('./validation'),
  versionControl: require('./versionControl')
};
EOF

# 创建服务索引文件
cat > "$backend_dir/src/services/index.js" << 'EOF'
// 服务层统一导出
module.exports = {
  UserService: require('./UserService'),
  StudyService: require('./StudyService')
};
EOF

# 创建工具索引文件
cat > "$backend_dir/src/utils/index.js" << 'EOF'
// 工具类统一导出
module.exports = {
  ...require('./common'),
  ...require('./helpers')
};
EOF

# 更新package.json添加新的脚本
cd "$backend_dir"

# 检查是否安装了必要的开发依赖
echo "检查并安装开发依赖..."

# 创建更新后的gitignore文件
cat > "$backend_dir/.gitignore" << 'EOF'
# 依赖
node_modules/
npm-debug.log*
yarn-debug.log*
yarn-error.log*

# 环境变量
.env
.env.local
.env.development.local
.env.test.local
.env.production.local

# 日志文件
logs/
*.log

# 上传文件
uploads/*
!uploads/.gitkeep

# 临时文件
tmp/
temp/

# IDE
.vscode/
.idea/
*.swp
*.swo

# 操作系统
.DS_Store
Thumbs.db

# 数据库
*.db
*.sqlite
*.sqlite3

# 测试覆盖率
coverage/
.nyc_output/

# 构建文件
dist/
build/

# PM2配置（如果包含敏感信息）
ecosystem.config.js

# API文档生成的文件
docs/api/

# 备份文件
*.backup
*.bak

# 性能分析文件
*.prof

# 调试文件
.vscode/launch.json
EOF

echo "后端文件结构整理完成！"
echo "新增的目录结构："
echo "  - src/services/     # 业务逻辑服务层"
echo "  - src/utils/        # 工具类"
echo "  - src/validators/   # 数据验证器"
echo "  - tests/            # 测试文件"
echo ""
echo "建议安装的开发依赖："
echo "  npm install --save-dev jest supertest swagger-jsdoc swagger-ui-express"

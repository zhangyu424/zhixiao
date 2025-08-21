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

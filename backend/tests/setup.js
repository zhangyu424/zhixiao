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

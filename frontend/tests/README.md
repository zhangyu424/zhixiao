# 测试目录说明

本目录包含项目的测试文件和测试配置。

## 📁 目录结构

```
tests/
├── unit/                 # 单元测试
│   ├── utils/           # 工具函数测试
│   ├── components/      # 组件测试
│   └── pages/           # 页面逻辑测试
│
└── integration/         # 集成测试
    ├── api/             # API集成测试
    ├── flow/            # 业务流程测试
    └── e2e/             # 端到端测试
```

## 🧪 测试类型

### 单元测试 (Unit Tests)
- **目标**: 测试单个函数、方法或组件
- **范围**: 工具函数、数据验证、组件逻辑
- **工具**: 微信小程序测试框架

### 集成测试 (Integration Tests)
- **目标**: 测试模块间的交互
- **范围**: API调用、数据流、页面交互
- **工具**: API测试工具、模拟器测试

### 端到端测试 (E2E Tests)
- **目标**: 测试完整的用户流程
- **范围**: 登录到分析的完整流程
- **工具**: 自动化测试脚本

## 📝 测试规范

### 文件命名
- 单元测试: `*.test.js`
- 集成测试: `*.integration.js`
- 端到端测试: `*.e2e.js`

### 测试结构
```javascript
describe('功能模块名', () => {
  beforeEach(() => {
    // 测试前准备
  });
  
  test('应该能够...', () => {
    // 测试逻辑
  });
  
  afterEach(() => {
    // 测试后清理
  });
});
```

## 🔧 运行测试

### 本地测试
```bash
# 运行所有测试
npm run test

# 运行单元测试
npm run test:unit

# 运行集成测试
npm run test:integration

# 测试覆盖率
npm run test:coverage
```

### CI/CD中的测试
- 每次提交自动运行单元测试
- 每次合并运行完整测试套件
- 部署前运行端到端测试

## 📊 测试覆盖率目标

- **整体覆盖率**: ≥ 80%
- **关键业务逻辑**: ≥ 90%
- **工具函数**: ≥ 95%
- **API集成**: ≥ 70%

## 🎯 测试最佳实践

1. **测试驱动开发** (TDD)
   - 先写测试，再写实现
   - 保持测试简单明确

2. **测试隔离**
   - 每个测试独立运行
   - 不依赖其他测试的结果

3. **Mock和Stub**
   - 模拟外部依赖
   - 专注测试目标逻辑

4. **清晰的断言**
   - 使用描述性的断言消息
   - 一个测试一个断言点

## 🚀 快速开始

1. **创建新的测试文件**
   ```bash
   # 单元测试
   touch tests/unit/utils/new-util.test.js
   
   # 集成测试
   touch tests/integration/api/new-api.integration.js
   ```

2. **编写测试用例**
   ```javascript
   // tests/unit/utils/data-validator.test.js
   const DataValidator = require('../../../utils/data-validator');
   
   describe('DataValidator', () => {
     test('应该验证必填字段', () => {
       const result = DataValidator.validateField('', ['required'], '测试字段');
       expect(result.isValid).toBe(false);
       expect(result.errors).toContain('测试字段不能为空');
     });
   });
   ```

3. **运行测试**
   ```bash
   npm run test
   ```

---

**维护者**: 方九日 (moqiqingxuan@gmail.com) - 陕西师范大学  
**创建时间**: 2025-08-20

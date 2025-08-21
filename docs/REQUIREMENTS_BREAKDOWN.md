# 智效学习平台 - 需求分解文档

## 📋 需求概述

基于微信小程序的学习质效分析系统，支持 4 类用户（超级管理员、信管员、层级长、学员）通过填报学习数据，实现个人和团队学习质效分析。

---

## 🎯 用户角色定义

### 用户类型

- **超级管理员 (admin)**: 系统最高权限，独立于组织架构
- **信管员**: 负责考试管理和系统维护
- **层级长**: 树状组织结构中的中间节点管理者
- **学员**: 树状组织结构中的叶子节点用户

**注意**: 采用基于组织节点的角色授予模型(scope-based RBAC)，一个用户可在不同组织节点具有不同角色。例如：用户在 A 班是 leader，在 B 班仅是 student。

### 组织架构

```
队 (一级层级)
├── 区队 (二级层级)
│   ├── 班级 (三级层级)
│   │   ├── 学员1
│   │   ├── 学员2
│   │   └── 学员N
│   └── 班级...
└── 区队...
```

---

## 📱 页面需求分解

### 1. 认证相关页面

#### 1.1 登录页面 (`/pages/login`)

**功能描述**: 统一登录界面，支持用户名密码登录和忘记密码功能

**页面要素**:

- 用户名输入框 (学号或 admin)
- 密码输入框
- 登录按钮
- 忘记密码链接
- 小程序 logo 和标题

**交互逻辑**:

- 根据用户名自动识别用户类型
- 支持微信登录(wx.login)和账号密码登录双通道
- 首次登录强制跳转密码修改页面并绑定手机号
- 采用静默刷新和滑动过期机制(access + refresh token)
- 登录失败显示错误提示

**数据交互**:

```javascript
// 微信登录
POST /api/auth/wxlogin
{
  "code": "wx_login_code"
}

// 账号密码登录(admin/信管员)
POST /api/auth/login
{
  "username": "string",
  "password": "string"
}

// 登录响应
{
  "success": true,
  "data": {
    "accessToken": "jwt_access_token",
    "refreshToken": "jwt_refresh_token",
    "userInfo": {
      "id": "user_id",
      "username": "username",
      "roles": [
        {
          "organizationId": "org_id",
          "role": "student|leader|admin|manager"
        }
      ],
      "name": "姓名",
      "isFirstLogin": boolean
    }
  }
}
```

#### 1.2 忘记密码页面 (`/pages/forgot-password`)

**功能描述**: 通过手机号找回密码

**页面要素**:

- 手机号输入框
- 验证码输入框
- 发送验证码按钮
- 新密码输入框
- 确认密码输入框
- 重置密码按钮

**交互逻辑**:

- 发送验证码倒计时
- 密码强度验证
- 重置成功后跳转登录页

#### 1.3 首次登录修改密码页面 (`/pages/change-password-first`)

**功能描述**: 首次登录强制修改密码并绑定手机号

**页面要素**:

- 当前密码输入框
- 新密码输入框
- 确认新密码输入框
- 手机号输入框
- 验证码输入框
- 发送验证码按钮
- 确认修改按钮

**交互逻辑**:

- 密码强度校验
- 手机号格式验证
- 修改成功后重新登录

### 2. 主界面页面

#### 2.1 填报页面 (`/pages/study-report`)

**功能描述**: 学员和层级长填报学习时间数据

**适用角色**: 学员、层级长

**页面要素**:

- 日期选择器 (支持补报)
- 学习科目 × 学习时间类别 的表格
- 时长输入框 (支持一位小数)
- 保存按钮
- 历史记录查看按钮

**表格结构**:

```
        | 课堂学习 | 自主学习 | 复习巩固 | 预习准备 |
--------|----------|----------|----------|----------|
数学    |   2.5    |   1.0    |   0.5    |   0.0    |
英语    |   1.5    |   2.0    |   1.0    |   0.5    |
...     |   ...    |   ...    |   ...    |   ...    |
```

**交互逻辑**:

- 表格动态生成（科目和时间类别可配置）
- 输入验证（数字格式，最多一位小数）
- 自动保存草稿
- 提交前确认

**数据交互**:

```javascript
// 获取配置
GET /api/config/subjects-and-categories

// 提交填报数据
POST /api/study/submit
{
  "date": "2025-08-21",
  "records": [
    {
      "subjectId": 1,
      "categoryId": 1,
      "duration": 2.5
    }
  ]
}
```

#### 2.2 个人分析页面 (`/pages/analysis/personal`)

**功能描述**: 显示个人学习质效分析信息

**适用角色**: 学员、层级长

**页面要素**:

- 身份切换按钮 (层级长专用，左上角)
- 考试选择按钮 (右上角)
- 学习时间统计图表
- 学习质效分析报告
- 学习建议卡片
- 排名信息显示

**图表类型**:

- 柱状图: 各科目学习时间分布
- 折线图: 学习时间趋势
- 雷达图: 学习质效评估
- 排行榜: 个人排名变化

**交互逻辑**:

- 层级长可切换查看下属人员数据
- 可选择不同考试周期的数据
- 图表支持交互操作
- 数据支持导出

#### 2.3 团队分析页面 (`/pages/analysis/team`)

**功能描述**: 显示团队学习质效分析信息

**适用角色**: 层级长

**页面要素**:

- 组织切换按钮 (左上角)
- 考试选择按钮 (右上角)
- 团队整体统计图表
- 成员排行榜
- 团队学习质效报告
- 异常数据提醒

**图表类型**:

- 饼图: 团队学习时间分布
- 堆积柱状图: 各层级学习情况对比
- 散点图: 学习时间与成绩关系
- 热力图: 团队活跃度分析

**交互逻辑**:

- 可切换查看不同层级的团队数据
- 支持钻取到个人详情
- 异常数据高亮显示
- 支持导出团队报告

#### 2.4 我的页面 (`/pages/profile`)

**功能描述**: 个人信息管理和系统设置

**适用角色**: 所有用户

**页面要素**:

- 用户头像 (微信头像)
- 用户基本信息卡片
  - 姓名
  - 学号
  - 所在层级单位信息
- 功能菜单
  - 修改密码
  - 绑定/更换手机号
  - 关于我们
  - 隐私政策
- 登出按钮

**交互逻辑**:

- 修改密码需验证当前密码
- 修改后自动登出
- 登出后清除本地存储
- 支持微信授权获取头像昵称

### 3. 管理功能页面

#### 3.1 系统管理页面 (`/pages/management/system`)

**功能描述**: 系统层级设置和用户管理

**适用角色**: 超级管理员、信管员

**页面要素**:

- 层级设置模块
  - 层级数量配置
  - 各层级名称设置
  - 层级关系树形显示
- 用户管理模块
  - 用户列表 (支持筛选、搜索)
  - 批量操作工具栏
  - Excel 导入/导出按钮
- 科目和时间类别配置
  - 学习科目管理
  - 学习时间类别管理

**交互逻辑**:

- 树形控件管理组织架构
- 表格组件展示用户列表
- 弹窗组件进行用户编辑
- 文件直传服务端，服务端解析 Excel 并返回处理结果

#### 3.2 人员调配页面 (`/pages/management/personnel`)

**功能描述**: 用户信息管理和组织调配

**适用角色**: 超级管理员、信管员

**页面要素**:

- 组织架构树 (左侧)
- 人员列表 (右侧)
- 调配操作区域
  - 拖拽调配
  - 批量调配
  - 职务变更
- 操作记录日志

**交互逻辑**:

- 支持拖拽方式调配人员
- 批量选择和操作
- 操作前确认对话框
- 记录所有调配操作

#### 3.3 考试管理页面 (`/pages/management/exam`)

**功能描述**: 考试成绩导入和分析

**适用角色**: 信管员

**页面要素**:

- 考试批次管理
  - 新增考试批次
  - 考试信息编辑
- 成绩导入模块
  - Excel 模板下载
  - 批量成绩导入
  - 导入结果验证
- 成绩分析展示
  - 各科目成绩分布
  - 排名变化分析
  - 异常成绩标记

**交互逻辑**:

- 文件直传服务端进行 Excel 解析和验证
- 服务端异步处理并返回任务进度
- 实时显示导入进度和错误报告
- 成绩数据可视化

#### 3.4 系统设置页面 (`/pages/management/settings`)

**功能描述**: 系统参数配置和用户信息管理

**适用角色**: 超级管理员

**页面要素**:

- 系统参数配置
  - 通知推送设置
  - 数据保留策略
  - 系统维护模式
- 用户信息管理（管理员专用）
  - 查看用户手机号
  - 重置用户密码
  - 修改用户手机号
  - 批量用户操作
  - 解绑手机号

**交互逻辑**:

- 敏感操作需要二次确认
- 批量操作进度显示
- 操作日志记录
- 权限严格控制

---

## 🧩 组件需求分解

### 1. 基础组件

#### 1.1 用户身份切换组件 (`components/role-switch`)

**功能描述**: 层级长用户切换查看身份的下拉树形菜单

**组件属性**:

```javascript
{
  userRole: 'leader',           // 用户角色
  currentUserId: 'user_id',     // 当前用户ID
  organizationTree: {},         // 组织架构树数据
  selectedUserId: 'user_id',    // 当前选中的用户ID
  onUserChange: function        // 用户切换回调
}
```

**组件功能**:

- 展示用户可访问的组织架构树
- 支持搜索和筛选
- 显示用户头像和基本信息
- 记住上次选择状态

#### 1.2 考试周期选择组件 (`components/exam-selector`)

**功能描述**: 选择考试周期的下拉选择器

**组件属性**:

```javascript
{
  examList: [],                 // 考试列表
  selectedExamId: 'exam_id',    // 当前选中的考试ID
  onExamChange: function        // 考试切换回调
}
```

**组件功能**:

- 显示可选择的考试批次
- 支持按时间排序
- 显示考试时间和状态
- 默认选择最近的考试

#### 1.3 学习数据表格组件 (`components/study-table`)

**功能描述**: 动态生成的学习时间填报表格

**组件属性**:

```javascript
{
  subjects: [],                 // 科目列表
  categories: [],               // 时间类别列表
  data: {},                     // 填报数据
  readonly: false,              // 是否只读
  onDataChange: function        // 数据变更回调
}
```

**组件功能**:

- 动态生成表格结构
- 输入数据验证
- 支持批量清空和恢复
- 数据自动保存

#### 1.4 图表组件 (`components/chart`)

**功能描述**: 封装的图表显示组件

**组件属性**:

```javascript
{
  type: 'bar|line|pie|radar',   // 图表类型
  data: {},                     // 图表数据
  options: {},                  // 图表配置
  title: 'string',              // 图表标题
  onInteraction: function       // 交互回调
}
```

**组件功能**:

- 支持多种图表类型
- 响应式适配
- 支持数据交互
- 导出图片功能

### 2. 业务组件

#### 2.1 组织架构树组件 (`components/org-tree`)

**功能描述**: 组织架构的树形展示和操作

**组件属性**:

```javascript
{
  treeData: {},                 // 树形数据
  editable: false,              // 是否可编辑
  draggable: false,             // 是否支持拖拽
  onNodeClick: function,        // 节点点击回调
  onNodeDrag: function          // 节点拖拽回调
}
```

**组件功能**:

- 树形结构展示
- 节点编辑和删除
- 拖拽调整层级
- 搜索和筛选

#### 2.2 用户信息卡片组件 (`components/user-card`)

**功能描述**: 用户信息的卡片展示

**组件属性**:

```javascript
{
  userInfo: {},                 // 用户信息
  showActions: false,           // 是否显示操作按钮
  actions: [],                  // 操作按钮列表
  onAction: function            // 操作回调
}
```

**组件功能**:

- 用户头像和基本信息
- 层级信息展示
- 操作按钮菜单
- 状态标识显示

#### 2.3 数据统计卡片组件 (`components/stats-card`)

**功能描述**: 数据统计信息的卡片展示

**组件属性**:

```javascript
{
  title: 'string',              // 卡片标题
  value: 'number|string',       // 主要数值
  unit: 'string',               // 数值单位
  trend: 'up|down|stable',      // 趋势标识
  description: 'string'         // 描述信息
}
```

**组件功能**:

- 数值突出显示
- 趋势图标和颜色
- 环比和同比信息
- 点击查看详情

#### 2.4 文件上传组件 (`components/file-upload`)

**功能描述**: Excel 文件上传和处理

**组件属性**:

```javascript
{
  accept: '.xlsx,.xls',         // 接受的文件类型
  maxSize: 10,                  // 最大文件大小(MB)
  templateUrl: 'string',        // 模板下载地址
  onSuccess: function,          // 上传成功回调
  onError: function             // 上传失败回调
}
```

**组件功能**:

- 文件选择和预览
- 上传进度显示
- 模板下载链接
- 错误信息提示

---

## 🔧 服务需求分解

### 1. 认证服务 (`services/AuthService`)

#### 1.1 用户登录服务

```javascript
class AuthService {
  // 用户登录
  async login(username, password) {
    // 调用后端登录API
    // 存储用户token和信息
    // 判断是否首次登录
  }

  // 忘记密码
  async resetPassword(phone, code, newPassword) {
    // 验证验证码
    // 重置密码
  }

  // 发送验证码
  async sendVerificationCode(phone) {
    // 发送短信验证码
  }

  // 修改密码
  async changePassword(oldPassword, newPassword) {
    // 验证旧密码
    // 更新新密码
  }

  // 绑定手机号
  async bindPhone(phone, code) {
    // 验证码验证
    // 绑定手机号
  }

  // 退出登录
  async logout() {
    // 清除本地存储
    // 调用退出API
  }

  // 检查登录状态
  checkLoginStatus() {
    // 检查token有效性
    // 返回登录状态
  }
}
```

#### 1.2 权限验证服务

```javascript
class PermissionService {
  // 检查页面访问权限
  checkPagePermission(page, userRole) {
    // 根据用户角色检查页面权限
  }

  // 检查功能操作权限
  checkActionPermission(action, userRole) {
    // 检查具体功能权限
  }

  // 获取用户可访问的菜单
  getAccessibleMenus(userRole) {
    // 返回用户可访问的菜单列表
  }
}
```

### 2. 数据服务 (`services/DataService`)

#### 2.1 学习数据服务

```javascript
class StudyService {
  // 提交学习数据
  async submitStudyData(date, records) {
    // 数据验证
    // 提交到后端
    // 返回提交结果
  }

  // 获取学习记录
  async getStudyRecords(userId, startDate, endDate) {
    // 获取指定时间范围的学习记录
  }

  // 获取学习统计
  async getStudyStats(userId, examId) {
    // 获取学习统计数据
  }

  // 获取个人分析报告
  async getPersonalAnalysis(userId, examId) {
    // 获取个人学习质效分析
  }

  // 获取团队分析报告
  async getTeamAnalysis(organizationId, examId) {
    // 获取团队学习质效分析
  }
}
```

#### 2.2 用户管理服务

```javascript
class UserService {
  // 获取用户信息
  async getUserInfo(userId) {
    // 获取用户详细信息
  }

  // 更新用户信息
  async updateUserInfo(userId, userInfo) {
    // 更新用户信息
  }

  // 获取组织架构
  async getOrganizationTree(userId) {
    // 根据用户权限获取可访问的组织架构
  }

  // 批量导入用户
  async importUsers(fileData) {
    // 解析Excel文件
    // 批量创建用户
    // 返回导入结果
  }

  // 导出用户数据
  async exportUsers(organizationId) {
    // 导出用户数据为Excel
  }

  // 人员调配
  async transferUser(userId, newOrganizationId, newRole) {
    // 调配用户到新组织
  }
}
```

#### 2.3 考试管理服务

```javascript
class ExamService {
  // 创建考试批次
  async createExam(examInfo) {
    // 创建新的考试批次
  }

  // 导入考试成绩
  async importScores(examId, scoresData) {
    // 批量导入考试成绩
  }

  // 获取考试列表
  async getExamList() {
    // 获取所有考试批次
  }

  // 获取成绩分析
  async getScoreAnalysis(examId, organizationId) {
    // 获取成绩分析数据
  }
}
```

### 3. 配置服务 (`services/ConfigService`)

#### 3.1 系统配置服务

```javascript
class ConfigService {
  // 获取学习科目配置
  async getSubjects() {
    // 获取所有学习科目
  }

  // 获取时间类别配置
  async getTimeCategories() {
    // 获取学习时间类别
  }

  // 更新系统配置
  async updateConfig(configType, configData) {
    // 更新系统配置项
  }

  // 获取层级配置
  async getLevelConfig() {
    // 获取组织层级配置
  }

  // 更新层级配置
  async updateLevelConfig(levelConfig) {
    // 更新组织层级设置
  }
}
```

### 4. 通知服务 (`services/NotificationService`)

#### 4.1 消息推送服务

```javascript
class NotificationService {
  // 发送填报提醒
  async sendReportReminder(userIds, date) {
    // 发送学习数据填报提醒
  }

  // 发送分析摘要
  async sendAnalysisSummary(userId, summaryData) {
    // 发送个人学习质效分析摘要
  }

  // 发送未填报提醒
  async sendMissingReportAlert(managerId, missingUsers) {
    // 发送下属未填报提醒
  }

  // 获取通知列表
  async getNotifications(userId) {
    // 获取用户通知列表
  }

  // 标记通知已读
  async markAsRead(notificationId) {
    // 标记通知为已读
  }
}
```

---

## ⚙️ 配置需求分解

### 1. 应用配置 (`config/app.config.js`)

#### 1.1 基础配置

```javascript
export default {
  // 应用基本信息
  app: {
    name: '智效学习平台',
    version: '2.0.0',
    description: '学习质效分析系统',
  },

  // API配置
  api: {
    baseUrl: 'https://api.zhixiao.com',
    timeout: 10000,
    retryTimes: 3,
  },

  // 默认用户配置
  defaultUser: {
    admin: {
      username: 'admin',
      password: 'zxrdsb050602',
    },
    passwordRule: {
      minLength: 6,
      requireSpecialChar: false,
    },
  },
};
```

#### 1.2 路由配置

```javascript
export const routeConfig = {
  // 页面路由映射
  pages: {
    student: [
      '/pages/study-report/study-report',
      '/pages/analysis/personal',
      '/pages/profile/profile',
    ],
    leader: [
      '/pages/study-report/study-report',
      '/pages/analysis/personal',
      '/pages/analysis/team',
      '/pages/profile/profile',
    ],
    manager: [
      '/pages/management/system',
      '/pages/management/exam',
      '/pages/profile/profile',
    ],
    admin: [
      '/pages/management/system',
      '/pages/management/settings',
      '/pages/profile/profile',
    ],
  },

  // 底部导航配置
  tabBar: {
    student: ['填报', '个人', '我的'],
    leader: ['填报', '个人', '团队', '我的'],
    manager: ['管理', '考试', '我的'],
    admin: ['管理', '设置', '我的'],
  },
};
```

### 2. 业务配置 (`config/business.config.js`)

#### 2.1 组织层级配置

```javascript
export const organizationConfig = {
  // 默认层级设置
  defaultLevels: [
    { id: 1, name: '队', level: 1 },
    { id: 2, name: '区队', level: 2 },
    { id: 3, name: '班级', level: 3 },
  ],

  // 层级设置约束
  constraints: {
    maxLevels: 5,
    minLevels: 2,
    maxUsersPerNode: 50,
  },
};
```

#### 2.2 学习配置

```javascript
export const studyConfig = {
  // 默认学习科目
  defaultSubjects: [
    { id: 1, name: '数学', order: 1 },
    { id: 2, name: '英语', order: 2 },
    { id: 3, name: '物理', order: 3 },
    { id: 4, name: '化学', order: 4 },
  ],

  // 默认时间类别
  defaultCategories: [
    { id: 1, name: '课堂学习', order: 1 },
    { id: 2, name: '自主学习', order: 2 },
    { id: 3, name: '复习巩固', order: 3 },
    { id: 4, name: '预习准备', order: 4 },
  ],

  // 填报规则
  reportRules: {
    maxHoursPerDay: 24,
    decimalPlaces: 1,
    allowFutureDate: false,
    maxBackfillDays: 7,
  },
};
```

### 3. UI 配置 (`config/ui.config.js`)

#### 3.1 主题配置

```javascript
export const themeConfig = {
  // 主色调
  primaryColor: '#007AFF',
  successColor: '#34C759',
  warningColor: '#FF9500',
  errorColor: '#FF3B30',

  // 字体配置
  fonts: {
    primary: 'PingFang SC',
    size: {
      small: '12px',
      normal: '14px',
      large: '16px',
      title: '18px',
    },
  },

  // 组件样式
  components: {
    borderRadius: '8px',
    shadowColor: 'rgba(0, 0, 0, 0.1)',
    animationDuration: '300ms',
  },
};
```

#### 3.2 图表配置

```javascript
export const chartConfig = {
  // 默认颜色方案
  colors: ['#007AFF', '#34C759', '#FF9500', '#FF3B30', '#5856D6'],

  // 图表类型配置
  types: {
    bar: {
      borderRadius: 4,
      categoryGap: '20%',
    },
    line: {
      smooth: true,
      lineWidth: 2,
    },
    pie: {
      radius: ['30%', '70%'],
      labelLine: false,
    },
  },
};
```

### 4. 通知配置 (`config/notification.config.js`)

#### 4.1 推送时间配置

```javascript
export const notificationConfig = {
  // 推送时间设置
  schedule: {
    reportReminder: '20:00', // 填报提醒时间
    analysisSummary: '08:00', // 分析摘要推送时间
    missingAlert: '21:00', // 未填报提醒时间
  },

  // 消息模板
  templates: {
    reportReminder: '亲爱的{name}，今日学习数据还未填报，请及时完成！',
    analysisSummary: '您好{name}，这是您的学习质效分析摘要...',
    missingAlert: '提醒：{count}名学员昨日未完成数据填报',
  },

  // 推送策略
  strategy: {
    maxRetryTimes: 3,
    retryInterval: 3600000, // 1小时后重试
    enableWeekend: true,
  },
};
```

---

## 📋 开发优先级和交付计划

### Phase 1: 基础架构 (1-2 周)

1. **认证系统**

   - 登录页面
   - 忘记密码页面
   - 首次登录修改密码页面
   - AuthService 认证服务

2. **基础组件**
   - 用户身份切换组件
   - 基础配置文件

### Phase 2: 核心功能 (2-3 周)

1. **学习数据模块**

   - 填报页面
   - 学习数据表格组件
   - StudyService 学习服务

2. **个人分析模块**
   - 个人分析页面
   - 图表组件
   - 考试周期选择组件

### Phase 3: 管理功能 (2-3 周)

1. **用户管理**

   - 系统管理页面
   - 组织架构树组件
   - UserService 用户服务

2. **考试管理**
   - 考试管理页面
   - 文件上传组件
   - ExamService 考试服务

### Phase 4: 高级功能 (1-2 周)

1. **团队分析**

   - 团队分析页面
   - 高级图表组件

2. **通知系统**
   - 通知服务
   - 推送配置

### Phase 5: 优化完善 (1 周)

1. **性能优化**
2. **UI 优化**
3. **测试完善**

---

## 📊 技术实现要点

### 1. 数据存储设计

- **本地存储**: 用户 token、用户信息、草稿数据
- **云端存储**: 所有业务数据、配置数据
- **缓存策略**: 组织架构、配置信息缓存

### 2. 权限控制策略

- **页面级权限**: 根据用户角色控制页面访问
- **功能级权限**: 细粒度的功能操作权限
- **数据级权限**: 用户只能访问权限范围内的数据

### 3. 性能优化策略

- **数据懒加载**: 大数据量分页加载
- **图片优化**: 图片压缩和 CDN 加速
- **组件复用**: 抽象通用组件减少重复开发

### 4. 错误处理策略

- **网络错误**: 自动重试和离线提醒
- **数据错误**: 验证提示和修正建议
- **系统错误**: 错误上报和用户友好提示

---

> 📅 文档生成时间: 2025-08-21  
> 📧 需求联系人: 方九日 <moqiqingxuan@gmail.com>  
> 🔄 文档版本: v1.0.0

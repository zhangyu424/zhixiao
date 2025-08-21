<!-- 使用此文件为 Copilot 提供工作区特定的自定义指令。更多详情请访问 https://code.visualstudio.com/docs/copilot/copilot-customization#_use-a-githubcopilotinstructionsmd-file -->

# 学习质效分析微信小程序开发指令

## 项目概述
这是一个学习质效分析微信小程序项目，用于帮助学员管理学习时间并分析学习效果。

## 开发规范

### 代码风格
- 使用微信小程序原生语法
- 变量命名采用驼峰式命名法
- 文件名使用小写字母和连字符
- 注释使用中文，说明功能和业务逻辑

### 项目结构
- `app.js` - 全局应用逻辑
- `pages/` - 页面目录，每个页面包含 .js、.wxml、.wxss 文件
- `images/` - 图片资源目录
- 遵循微信小程序官方目录结构规范

### 功能特点
- 支持多角色用户系统（学员、层级长、管理员等）
- 学习时间填报和历史记录管理
- 多维度数据分析和可视化
- 微信授权登录和订阅消息提醒
- 数据导入导出功能

### 技术要点
- 使用 wx.request 进行网络请求
- 使用 wx.getStorageSync/wx.setStorageSync 进行本地存储
- 使用 wx.login 和 wx.getUserProfile 实现微信登录
- 使用 wx.requestSubscribeMessage 实现消息订阅
- 页面间数据传递使用 options 参数

### API 集成
- 所有 API 请求通过 app.js 中的 request 方法统一处理
- 需要配置正确的 baseUrl 指向后端服务
- 错误处理包括网络错误、权限错误等情况

### 注意事项
- 开发时需要配置微信开发者工具
- 订阅消息功能需要在微信公众平台配置模板
- 文件上传下载需要配置服务器域名白名单
- 角色权限控制需要前后端配合实现

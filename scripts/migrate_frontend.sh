#!/bin/bash
# 前端迁移实施脚本
# 执行命令: bash scripts/migrate_frontend.sh

echo "🎯 开始前端代码迁移到云端统一管理..."

# 第一阶段：创建新的项目结构
echo "📁 第一阶段：创建项目结构..."

# 备份当前项目
echo "💾 备份当前项目..."
cp -r /var/www/zhixiao /var/www/zhixiao_backup_$(date +%Y%m%d_%H%M%S)

# 创建新的目录结构
echo "📂 创建新目录结构..."
mkdir -p /var/www/zhixiao-platform/{backend,frontend,docs,scripts,config}
mkdir -p /var/www/zhixiao-platform/frontend/{miniprogram,admin-web,shared}
mkdir -p /var/www/zhixiao-platform/frontend/miniprogram/{pages,components,utils,config}
mkdir -p /var/www/zhixiao-platform/frontend/shared/{utils,constants,types,config}

# 迁移后端代码
echo "🔄 迁移后端代码到新结构..."
cp -r /var/www/zhixiao/* /var/www/zhixiao-platform/backend/

# 创建前端配置文件
echo "⚙️ 创建前端配置文件..."

# API配置
cat > /var/www/zhixiao-platform/frontend/shared/config/api.js << 'EOF'
// API配置文件
const API_CONFIG = {
  development: {
    baseURL: 'http://localhost:3000/api',
    timeout: 10000,
    retryTimes: 3
  },
  production: {
    baseURL: 'http://140.143.143.195/api',  // 您的生产环境
    timeout: 10000,
    retryTimes: 3
  }
}

const ENV = wx.getSystemInfoSync ? 'production' : 'development'
export default API_CONFIG[ENV]
EOF

# 请求封装
cat > /var/www/zhixiao-platform/frontend/shared/utils/request.js << 'EOF'
// 统一请求封装
import API_CONFIG from '../config/api.js'

class ApiRequest {
  constructor() {
    this.baseURL = API_CONFIG.baseURL
    this.timeout = API_CONFIG.timeout
    this.retryTimes = API_CONFIG.retryTimes
  }

  // 通用请求方法
  request(options) {
    const { url, method = 'GET', data, header = {} } = options
    
    // 添加认证头
    const token = wx.getStorageSync('token')
    if (token) {
      header.Authorization = `Bearer ${token}`
    }

    // 添加版本控制
    header['API-Version'] = 'v1'
    header['Content-Type'] = 'application/json'

    return new Promise((resolve, reject) => {
      wx.request({
        url: `${this.baseURL}${url}`,
        method,
        data,
        header,
        timeout: this.timeout,
        success: (res) => {
          if (res.statusCode === 200) {
            resolve(res.data)
          } else if (res.statusCode === 401) {
            // Token过期，跳转登录
            wx.removeStorageSync('token')
            wx.navigateTo({ url: '/pages/login/login' })
            reject(new Error('登录已过期'))
          } else {
            reject(new Error(`HTTP ${res.statusCode}: ${res.data?.message || '请求失败'}`))
          }
        },
        fail: (error) => {
          console.error('请求失败:', error)
          reject(error)
        }
      })
    })
  }

  // 便捷方法
  get(url, data) {
    return this.request({ url, method: 'GET', data })
  }

  post(url, data) {
    return this.request({ url, method: 'POST', data })
  }

  put(url, data) {
    return this.request({ url, method: 'PUT', data })
  }

  delete(url, data) {
    return this.request({ url, method: 'DELETE', data })
  }
}

// 导出单例
export default new ApiRequest()
EOF

# API服务封装
cat > /var/www/zhixiao-platform/frontend/shared/utils/api-services.js << 'EOF'
// API服务封装
import request from './request.js'

// 认证服务
export const AuthService = {
  // 微信登录
  wxLogin(code) {
    return request.post('/auth/wxlogin', { code })
  },
  
  // 绑定账号
  bindAccount(data) {
    return request.post('/auth/bind', data)
  },
  
  // 刷新Token
  refreshToken() {
    return request.post('/auth/refresh')
  }
}

// 学习记录服务
export const StudyService = {
  // 提交学习时间
  submit(data) {
    return request.post('/study/submit', data)
  },
  
  // 获取学习历史
  getHistory(params) {
    return request.get('/study/history', params)
  },
  
  // 获取学习统计
  getStats(params) {
    return request.get('/study/stats', params)
  },
  
  // 获取今日数据
  getTodayData() {
    return request.get('/study/today')
  },
  
  // 获取本周数据
  getWeekData() {
    return request.get('/study/week')
  },
  
  // 获取月度数据
  getMonthData(month) {
    return request.get('/study/month', { month })
  },
  
  // 获取排名
  getRanking(params) {
    return request.get('/study/ranking', params)
  },
  
  // 获取热力图
  getHeatmap(year) {
    return request.get('/study/heatmap', { year })
  },
  
  // 删除记录
  deleteRecord(id) {
    return request.delete(`/study/${id}`)
  }
}

// 用户服务
export const UserService = {
  // 获取个人信息
  getProfile() {
    return request.get('/users/profile')
  },
  
  // 更新个人信息
  updateProfile(data) {
    return request.put('/users/profile', data)
  },
  
  // 获取学习统计
  getStudyStats() {
    return request.get('/users/study-stats')
  },
  
  // 获取通知设置
  getNotificationSettings() {
    return request.get('/users/notification-settings')
  },
  
  // 更新通知设置
  updateNotificationSettings(data) {
    return request.put('/users/notification-settings', data)
  }
}

// 通知服务
export const NotificationService = {
  // 获取通知列表
  getList(params) {
    return request.get('/notifications', params)
  },
  
  // 获取未读数量
  getUnreadCount() {
    return request.get('/notifications/unread-count')
  },
  
  // 标记已读
  markAsRead(id) {
    return request.put(`/notifications/${id}/read`)
  }
}

// 分析服务
export const AnalysisService = {
  // 获取最近分析
  getRecent() {
    return request.get('/analysis/recent')
  }
}
EOF

# 小程序app.js配置
cat > /var/www/zhixiao-platform/frontend/miniprogram/app.js << 'EOF'
// 小程序入口文件
import { AuthService } from './shared/utils/api-services.js'

App({
  globalData: {
    userInfo: null,
    token: null,
    systemInfo: null
  },

  onLaunch() {
    console.log('小程序启动')
    this.initApp()
  },

  async initApp() {
    // 获取系统信息
    try {
      this.globalData.systemInfo = wx.getSystemInfoSync()
    } catch (e) {
      console.error('获取系统信息失败:', e)
    }

    // 检查登录状态
    this.checkLoginStatus()
  },

  async checkLoginStatus() {
    const token = wx.getStorageSync('token')
    if (token) {
      this.globalData.token = token
      
      // 验证token有效性
      try {
        const userInfo = await UserService.getProfile()
        if (userInfo.success) {
          this.globalData.userInfo = userInfo.data
        } else {
          this.clearLoginInfo()
        }
      } catch (error) {
        console.error('验证登录状态失败:', error)
        this.clearLoginInfo()
      }
    }
  },

  clearLoginInfo() {
    this.globalData.token = null
    this.globalData.userInfo = null
    wx.removeStorageSync('token')
    wx.removeStorageSync('userInfo')
  },

  // 微信登录
  async wxLogin() {
    try {
      const { code } = await this.getWxCode()
      const result = await AuthService.wxLogin(code)
      
      if (result.success) {
        this.globalData.token = result.data.token
        this.globalData.userInfo = result.data.userInfo
        
        wx.setStorageSync('token', result.data.token)
        wx.setStorageSync('userInfo', result.data.userInfo)
        
        return result
      } else {
        throw new Error(result.message)
      }
    } catch (error) {
      console.error('登录失败:', error)
      throw error
    }
  },

  getWxCode() {
    return new Promise((resolve, reject) => {
      wx.login({
        success: resolve,
        fail: reject
      })
    })
  }
})
EOF

# 小程序项目配置
cat > /var/www/zhixiao-platform/frontend/miniprogram/project.config.json << 'EOF'
{
  "description": "学习质效分析小程序",
  "packOptions": {
    "ignore": []
  },
  "setting": {
    "urlCheck": false,
    "es6": true,
    "enhance": true,
    "postcss": true,
    "preloadBackgroundData": false,
    "minified": true,
    "newFeature": false,
    "coverView": true,
    "nodeModules": false,
    "autoAudits": false,
    "showShadowRootInWxmlPanel": true,
    "scopeDataCheck": false,
    "uglifyFileName": false,
    "checkInvalidKey": true,
    "checkSiteMap": true,
    "uploadWithSourceMap": true,
    "compileHotReLoad": false,
    "lazyloadPlaceholderEnable": false,
    "useMultiFrameRuntime": true,
    "useApiHook": true,
    "useApiHostProcess": true,
    "babelSetting": {
      "ignore": [],
      "disablePlugins": [],
      "outputPath": ""
    },
    "enableEngineNative": false,
    "useIsolateContext": true,
    "userConfirmedBundleSwitch": false,
    "packNpmManually": false,
    "packNpmRelationList": [],
    "minifyWXSS": true,
    "disableUseStrict": false,
    "minifyWXML": true,
    "showES6CompileOption": false,
    "useCompilerPlugins": false
  },
  "compileType": "miniprogram",
  "libVersion": "2.19.4",
  "appid": "wx13e6fdf682f6d772",
  "projectname": "zhixiao-miniprogram",
  "debugOptions": {
    "hidedInDevtools": []
  },
  "scripts": {},
  "staticServerOptions": {
    "baseURL": "",
    "servePath": ""
  },
  "isGameTourist": false,
  "condition": {
    "search": {
      "list": []
    },
    "conversation": {
      "list": []
    },
    "game": {
      "list": []
    },
    "plugin": {
      "list": []
    },
    "gamePlugin": {
      "list": []
    },
    "miniprogram": {
      "list": []
    }
  }
}
EOF

# 根级package.json（统一管理）
cat > /var/www/zhixiao-platform/package.json << 'EOF'
{
  "name": "zhixiao-platform",
  "version": "1.0.0",
  "description": "学习质效分析全栈平台 - 统一管理版本",
  "scripts": {
    "dev": "concurrently \"npm run backend:dev\" \"npm run frontend:dev\"",
    "backend:dev": "cd backend && npm run dev",
    "backend:start": "cd backend && npm start",
    "backend:stop": "cd backend && npm run stop",
    "backend:restart": "cd backend && npm run restart",
    "backend:logs": "cd backend && npm run logs",
    "backend:test": "cd backend && npm run test",
    "frontend:dev": "echo '前端开发服务器启动中...' && cd frontend/miniprogram",
    "build": "npm run backend:build && npm run frontend:build",
    "backend:build": "cd backend && echo '后端构建完成'",
    "frontend:build": "cd frontend && echo '前端构建完成'",
    "deploy": "bash scripts/deploy.sh",
    "test": "npm run backend:test",
    "health-check": "curl -f http://localhost:3000/health || exit 1",
    "monitor": "cd backend && npm run monitor"
  },
  "devDependencies": {
    "concurrently": "^7.6.0"
  },
  "keywords": ["wechat", "miniprogram", "learning", "analytics", "fullstack"],
  "author": "Learning Analytics Team",
  "license": "MIT"
}
EOF

# 部署脚本
cat > /var/www/zhixiao-platform/scripts/deploy.sh << 'EOF'
#!/bin/bash
# 全栈统一部署脚本

echo "🚀 开始全栈统一部署..."

# 检查当前目录
if [ ! -f "package.json" ]; then
    echo "❌ 请在项目根目录执行此脚本"
    exit 1
fi

# 构建后端
echo "📦 构建后端..."
cd backend
npm install --production
echo "✅ 后端依赖安装完成"

# 重启后端服务
echo "🔄 重启后端服务..."
npm run restart
sleep 3

# 健康检查
echo "🏥 健康检查..."
if curl -f http://localhost:3000/health > /dev/null 2>&1; then
    echo "✅ 后端服务启动成功"
else
    echo "❌ 后端服务启动失败"
    exit 1
fi

# 前端部署 (小程序上传部署需要开发者工具)
echo "📱 前端部署提示..."
echo "📋 小程序部署步骤:"
echo "   1. 使用微信开发者工具打开: $(pwd)/../frontend/miniprogram"
echo "   2. 检查 project.config.json 中的 appid"
echo "   3. 预览或上传小程序"

cd ..
echo "✅ 全栈平台部署完成！"
echo "🌐 后端API: http://140.143.143.195/api"
echo "📚 API文档: http://140.143.143.195/api"
EOF

chmod +x /var/www/zhixiao-platform/scripts/deploy.sh

# 开发环境配置
cat > /var/www/zhixiao-platform/scripts/dev-setup.sh << 'EOF'
#!/bin/bash
# 开发环境快速设置

echo "🛠️ 设置开发环境..."

# 安装根级依赖
npm install

# 安装后端依赖
cd backend && npm install && cd ..

echo "✅ 开发环境设置完成！"
echo ""
echo "🚀 快速开始:"
echo "   npm run dev                    # 启动开发环境"
echo "   npm run backend:test           # 测试后端API"
echo "   npm run deploy                 # 部署到生产环境"
echo ""
echo "📁 项目结构:"
echo "   backend/                       # 后端代码"
echo "   frontend/miniprogram/          # 小程序代码"
echo "   frontend/shared/               # 前端共享代码"
echo "   docs/                          # 项目文档"
EOF

chmod +x /var/www/zhixiao-platform/scripts/dev-setup.sh

# 创建README
cat > /var/www/zhixiao-platform/README.md << 'EOF'
# 🎯 学习质效分析全栈平台

> 微信小程序 + Node.js API 统一管理版本

## 🏗️ 项目架构

```
zhixiao-platform/
├── 📁 backend/                    # Node.js API服务
├── 📁 frontend/                   # 前端代码
│   ├── 📁 miniprogram/            # 微信小程序
│   └── 📁 shared/                 # 共享代码和配置
├── 📁 docs/                       # 项目文档
└── 📁 scripts/                    # 自动化脚本
```

## 🚀 快速开始

### 环境设置
```bash
# 克隆并进入项目
cd /var/www/zhixiao-platform

# 安装依赖并设置开发环境
bash scripts/dev-setup.sh

# 启动开发环境 (前后端同时)
npm run dev
```

### 单独操作
```bash
# 后端操作
npm run backend:dev          # 开发模式
npm run backend:start        # 生产模式
npm run backend:test         # API测试
npm run backend:logs         # 查看日志

# 前端操作
cd frontend/miniprogram      # 进入小程序目录
# 用微信开发者工具打开此目录
```

## 🌐 服务地址

- **API服务**: http://140.143.143.195/api
- **健康检查**: http://140.143.143.195/health
- **API文档**: http://140.143.143.195/api

## 📚 文档

- [API接口文档](./backend/zhixiaodocs/INDEX.md)
- [前端集成指南](./backend/zhixiaodocs/DOCUMENT_API_GUIDE.md)
- [部署指南](./scripts/deploy.sh)

## 🔧 开发工具

- **后端**: Node.js + Express + MySQL + PM2
- **前端**: 微信小程序原生开发
- **部署**: PM2 + Shell脚本自动化

EOF

echo "✅ 第一阶段完成！新项目结构已创建在: /var/www/zhixiao-platform"
echo ""
echo "📋 下一步操作:"
echo "   1. 检查新创建的项目结构"
echo "   2. 将现有小程序代码迁移到 frontend/miniprogram/"
echo "   3. 测试API配置和请求封装"
echo "   4. 使用微信开发者工具打开新的小程序目录"
echo ""
echo "🎯 迁移完成后的优势:"
echo "   ✅ 前后端代码统一管理"
echo "   ✅ 标准化的API调用封装"
echo "   ✅ 环境配置集中管理"
echo "   ✅ 一键部署全栈服务"

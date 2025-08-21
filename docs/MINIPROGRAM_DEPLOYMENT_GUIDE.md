# 微信小程序登录功能部署配置指南

## 🚀 快速启动指南 (开发环境)

### 1. 启动后端服务

```bash
cd /var/www/zhixiao-platform/backend
node server.js
```

### 2. 配置微信开发者工具

1. 打开微信开发者工具
2. 导入项目: `/var/www/zhixiao-platform/frontend`
3. **重要**: 关闭域名校验
   - 详情 → 本地设置 → 不校验合法域名
4. 编译运行

### 3. 测试登录功能

- 用户名: `admin`
- 密码: `123456`

## ⚙️ 网络配置解决方案

### 开发环境配置

#### 方案 1: 关闭域名校验 (推荐开发使用)

在微信开发者工具中:

```
详情 → 本地设置 → ✅ 不校验合法域名、web-view、TLS版本
```

#### 方案 2: 修改后端服务器地址

如果需要外网访问，修改 `/frontend/utils/api/http.js`:

```javascript
// 当前配置
const BASE_URL = 'http://140.143.143.195:3000/api';

// 本地开发配置
const BASE_URL = 'http://localhost:3000/api';

// 或使用环境变量
const BASE_URL =
  process.env.NODE_ENV === 'development'
    ? 'http://localhost:3000/api'
    : 'https://your-domain.com/api';
```

### 生产环境配置

#### 1. HTTPS 证书配置

```nginx
server {
    listen 443 ssl;
    server_name your-domain.com;

    ssl_certificate /path/to/certificate.crt;
    ssl_certificate_key /path/to/private.key;

    location /api {
        proxy_pass http://localhost:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

#### 2. 微信小程序域名配置

在微信公众平台 → 开发管理 → 开发设置 → 服务器域名:

```
request合法域名: https://your-domain.com
```

#### 3. 修改前端配置

```javascript
// /frontend/utils/api/http.js
const BASE_URL = 'https://your-domain.com/api';
```

## 🔧 常见问题解决

### 1. 网络请求失败

**问题**: `request:fail url not in domain list`
**解决**:

- 开发环境: 关闭域名校验
- 生产环境: 配置合法域名

### 2. CORS 错误

**问题**: 跨域请求被阻止
**解决**: 后端已配置 CORS，确保域名匹配

```javascript
// backend/server.js (已配置)
app.use(
  cors({
    origin:
      process.env.NODE_ENV === 'production'
        ? ['https://your-domain.com']
        : true,
    credentials: true,
  })
);
```

### 3. JWT Token 失效

**问题**: Token 验证失败
**解决**: 检查 token 存储和传递

```javascript
// 前端会自动添加认证头
if (app && app.globalData && app.globalData.token) {
  requestConfig.header.Authorization = 'Bearer ' + app.globalData.token;
}
```

## 🧪 测试验证清单

### 后端 API 测试

```bash
# 1. 健康检查
curl http://localhost:3000/health

# 2. 登录测试
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"student_id":"admin","password":"123456"}'

# 3. API根路径
curl http://localhost:3000/api
```

### 前端功能测试

- [ ] 页面正常加载
- [ ] 表单输入正常
- [ ] 登录请求发送
- [ ] 成功响应处理
- [ ] 错误信息显示
- [ ] Token 存储
- [ ] 页面跳转

## 📱 微信开发者工具配置

### 项目配置检查

```json
// project.private.config.json
{
  "setting": {
    "urlCheck": false, // 开发环境建议关闭
    "compileHotReLoad": true
  }
}
```

### AppID 配置

```json
// project.config.json
{
  "appid": "wx13e6fdf682f6d772", // 已配置
  "setting": {
    "es6": true,
    "postcss": true,
    "minified": true
  }
}
```

## 🚀 部署步骤总结

### 开发环境 (立即可用)

1. ✅ 启动后端: `node server.js`
2. ✅ 打开微信开发者工具
3. ✅ 导入前端项目
4. ✅ 关闭域名校验
5. ✅ 测试登录功能

### 生产环境

1. 申请 HTTPS 证书
2. 配置 Nginx/Apache
3. 配置微信合法域名
4. 修改前端 API 地址
5. 部署上线

## 📞 技术支持

如遇到问题，检查：

1. 后端服务是否正常运行
2. 网络配置是否正确
3. 微信开发者工具设置
4. 控制台错误信息

---

**状态**: 开发环境已就绪 ✅  
**可用性**: 100% 可在微信开发者工具中直接使用  
**下一步**: 生产环境 HTTPS 配置

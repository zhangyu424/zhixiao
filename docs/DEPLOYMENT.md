# 部署指南

## 🚀 部署概览

本指南详细说明了智效学习平台在不同环境下的部署方法，包括开发环境、测试环境和生产环境的配置。

## 🔧 环境要求

### 系统要求

| 组件     | 最低要求        | 推荐配置      |
| -------- | --------------- | ------------- |
| 操作系统 | Linux/CentOS 7+ | Ubuntu 20.04+ |
| CPU      | 2 核            | 4 核+         |
| 内存     | 4GB             | 8GB+          |
| 存储     | 20GB            | 50GB+         |
| 网络     | 10Mbps          | 100Mbps+      |

### 软件依赖

```bash
# 必需软件
Node.js >= 16.0.0
npm >= 8.0.0
MySQL >= 5.7
Git >= 2.0

# 生产环境额外需要
PM2 >= 5.0.0
Nginx >= 1.18
```

## 📦 快速部署

### 一键部署脚本

```bash
#!/bin/bash
# 快速部署脚本

echo "🚀 开始部署智效学习平台..."

# 1. 克隆项目
git clone https://github.com/zhangyu424/zhixiao.git zhixiao-platform
cd zhixiao-platform

# 2. 安装后端依赖
echo "📦 安装后端依赖..."
cd backend
npm install

# 3. 配置环境变量
echo "⚙️ 配置环境变量..."
cp .env.example .env
echo "请编辑 .env 文件配置数据库等信息"

# 4. 启动服务
echo "🌟 启动服务..."
npm start

echo "✅ 部署完成！"
echo "🌐 服务地址: http://localhost:3000"
echo "📖 API文档: http://localhost:3000/api"
```

## 🛠️ 开发环境部署

### 步骤 1: 环境准备

```bash
# 安装Node.js (使用nvm推荐)
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash
nvm install 18
nvm use 18

# 安装MySQL
sudo apt update
sudo apt install mysql-server mysql-client

# 启动MySQL服务
sudo systemctl start mysql
sudo systemctl enable mysql
```

### 步骤 2: 项目配置

```bash
# 克隆项目
git clone https://github.com/zhangyu424/zhixiao.git
cd zhixiao-platform

# 后端配置
cd backend
npm install

# 复制配置文件
cp .env.example .env
```

### 步骤 3: 数据库配置

```sql
-- 创建数据库
CREATE DATABASE zhixiao CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- 创建用户 (可选)
CREATE USER 'zhixiao'@'localhost' IDENTIFIED BY 'your_password';
GRANT ALL PRIVILEGES ON zhixiao.* TO 'zhixiao'@'localhost';
FLUSH PRIVILEGES;
```

### 步骤 4: 环境变量配置

编辑 `backend/.env` 文件：

```env
# 数据库配置
DB_HOST=localhost
DB_PORT=3306
DB_NAME=zhixiao
DB_USER=root
DB_PASSWORD=your_mysql_password

# JWT配置
JWT_SECRET=your-super-secret-jwt-key-here
JWT_EXPIRE=7d

# 服务器配置
PORT=3000
NODE_ENV=development

# 微信小程序配置
WX_APP_ID=your_wechat_app_id
WX_APP_SECRET=your_wechat_app_secret

# 安全配置
BCRYPT_ROUNDS=12
API_RATE_LIMIT=100

# 日志配置
LOG_LEVEL=info
LOG_FILE=logs/app.log
```

### 步骤 5: 启动服务

```bash
# 开发模式启动
cd backend
npm run dev

# 或使用普通模式
npm start
```

### 步骤 6: 前端配置

```bash
# 前端开发
cd frontend
npm install

# 使用微信开发者工具打开frontend目录
# 配置AppID和服务器域名
```

## 🌐 生产环境部署

### 服务器配置

#### 1. 系统优化

```bash
# 更新系统
sudo apt update && sudo apt upgrade -y

# 配置防火墙
sudo ufw allow 22    # SSH
sudo ufw allow 80    # HTTP
sudo ufw allow 443   # HTTPS
sudo ufw allow 3000  # API服务
sudo ufw enable

# 配置时区
sudo timedatectl set-timezone Asia/Shanghai
```

#### 2. 安装依赖

```bash
# 安装Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# 安装PM2
sudo npm install -g pm2

# 安装MySQL
sudo apt install mysql-server

# 安装Nginx
sudo apt install nginx
```

#### 3. 数据库配置

```bash
# 安全配置MySQL
sudo mysql_secure_installation

# 创建数据库和用户
sudo mysql -u root -p << EOF
CREATE DATABASE zhixiao CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER 'zhixiao'@'localhost' IDENTIFIED BY 'strong_password_here';
GRANT ALL PRIVILEGES ON zhixiao.* TO 'zhixiao'@'localhost';
FLUSH PRIVILEGES;
EXIT;
EOF
```

### 应用部署

#### 1. 部署代码

```bash
# 克隆代码到生产目录
sudo mkdir -p /var/www
sudo chown -R $USER:$USER /var/www
cd /var/www

git clone https://github.com/zhangyu424/zhixiao.git zhixiao-platform
cd zhixiao-platform

# 安装依赖
cd backend
npm ci --only=production
```

#### 2. 配置生产环境变量

```bash
# 复制配置文件
cp .env.example .env

# 编辑生产配置
nano .env
```

生产环境配置示例：

```env
# 生产数据库配置
DB_HOST=localhost
DB_PORT=3306
DB_NAME=zhixiao
DB_USER=zhixiao
DB_PASSWORD=your_strong_password

# 生产JWT配置
JWT_SECRET=your-super-strong-production-jwt-secret
JWT_EXPIRE=7d

# 生产服务器配置
PORT=3000
NODE_ENV=production

# 微信生产配置
WX_APP_ID=your_production_wechat_app_id
WX_APP_SECRET=your_production_wechat_app_secret

# 安全配置
BCRYPT_ROUNDS=12
API_RATE_LIMIT=200

# 日志配置
LOG_LEVEL=warn
LOG_FILE=/var/log/zhixiao/app.log
```

#### 3. PM2 部署配置

编辑 `ecosystem.config.js`：

```javascript
module.exports = {
  apps: [
    {
      name: 'zhixiao-api',
      script: './server.js',
      cwd: '/var/www/zhixiao-platform/backend',
      instances: 'max',
      exec_mode: 'cluster',
      env: {
        NODE_ENV: 'production',
        PORT: 3000,
      },
      error_file: '/var/log/zhixiao/err.log',
      out_file: '/var/log/zhixiao/out.log',
      log_file: '/var/log/zhixiao/combined.log',
      time: true,
      watch: false,
      max_memory_restart: '1G',
      node_args: '--max-old-space-size=1024',
    },
  ],
};
```

#### 4. 启动应用

```bash
# 创建日志目录
sudo mkdir -p /var/log/zhixiao
sudo chown -R $USER:$USER /var/log/zhixiao

# 启动应用
pm2 start ecosystem.config.js

# 设置开机自启
pm2 startup
pm2 save
```

### Nginx 反向代理配置

#### 1. 创建 Nginx 配置

```bash
sudo nano /etc/nginx/sites-available/zhixiao
```

配置内容：

```nginx
server {
    listen 80;
    server_name your-domain.com;

    # API代理
    location /api {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;

        # 超时配置
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }

    # 健康检查
    location /health {
        proxy_pass http://localhost:3000;
        access_log off;
    }

    # 静态文件 (如果有)
    location /static {
        alias /var/www/zhixiao-platform/frontend/static;
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    # 日志配置
    access_log /var/log/nginx/zhixiao.access.log;
    error_log /var/log/nginx/zhixiao.error.log;
}
```

#### 2. 启用配置

```bash
# 启用站点
sudo ln -s /etc/nginx/sites-available/zhixiao /etc/nginx/sites-enabled/

# 测试配置
sudo nginx -t

# 重启Nginx
sudo systemctl restart nginx
```

### SSL 证书配置 (可选)

```bash
# 安装Certbot
sudo apt install certbot python3-certbot-nginx

# 获取SSL证书
sudo certbot --nginx -d your-domain.com

# 自动续期
sudo crontab -e
# 添加: 0 12 * * * /usr/bin/certbot renew --quiet
```

## 🐳 Docker 部署

### Dockerfile

```dockerfile
# 后端Dockerfile
FROM node:18-alpine

# 安装依赖
RUN apk add --no-cache python3 make g++

# 设置工作目录
WORKDIR /app

# 复制依赖文件
COPY backend/package*.json ./
RUN npm ci --only=production

# 复制源代码
COPY backend/ .

# 创建非root用户
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nodejs -u 1001

# 设置权限
RUN chown -R nodejs:nodejs /app
USER nodejs

# 暴露端口
EXPOSE 3000

# 健康检查
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:3000/health || exit 1

# 启动命令
CMD ["npm", "start"]
```

### docker-compose.yml

```yaml
version: '3.8'

services:
  # 后端API服务
  api:
    build:
      context: .
      dockerfile: Dockerfile
    ports:
      - '3000:3000'
    environment:
      - NODE_ENV=production
      - DB_HOST=mysql
      - DB_NAME=zhixiao
      - DB_USER=zhixiao
      - DB_PASSWORD=password
    depends_on:
      - mysql
    volumes:
      - ./logs:/app/logs
    restart: unless-stopped
    networks:
      - zhixiao-network

  # MySQL数据库
  mysql:
    image: mysql:8.0
    environment:
      - MYSQL_ROOT_PASSWORD=rootpassword
      - MYSQL_DATABASE=zhixiao
      - MYSQL_USER=zhixiao
      - MYSQL_PASSWORD=password
    volumes:
      - mysql_data:/var/lib/mysql
      - ./database/schema.sql:/docker-entrypoint-initdb.d/schema.sql
    restart: unless-stopped
    networks:
      - zhixiao-network

  # Nginx反向代理
  nginx:
    image: nginx:alpine
    ports:
      - '80:80'
      - '443:443'
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf
      - ./ssl:/etc/nginx/ssl
    depends_on:
      - api
    restart: unless-stopped
    networks:
      - zhixiao-network

volumes:
  mysql_data:

networks:
  zhixiao-network:
    driver: bridge
```

### Docker 部署命令

```bash
# 构建和启动
docker-compose up -d

# 查看状态
docker-compose ps

# 查看日志
docker-compose logs -f api

# 更新部署
docker-compose pull
docker-compose up -d
```

## 📊 监控和维护

### 系统监控

```bash
# PM2监控
pm2 monit

# 系统资源监控
htop
iostat -x 1
free -h

# 日志监控
tail -f /var/log/zhixiao/app.log
tail -f /var/log/nginx/zhixiao.access.log
```

### 备份策略

```bash
#!/bin/bash
# 数据库备份脚本

DATE=$(date +"%Y%m%d_%H%M%S")
BACKUP_DIR="/backup/zhixiao"
DB_NAME="zhixiao"

# 创建备份目录
mkdir -p $BACKUP_DIR

# 数据库备份
mysqldump -u zhixiao -p$DB_PASSWORD $DB_NAME > $BACKUP_DIR/db_backup_$DATE.sql

# 代码备份
tar -czf $BACKUP_DIR/code_backup_$DATE.tar.gz /var/www/zhixiao-platform

# 清理旧备份 (保留7天)
find $BACKUP_DIR -name "*.sql" -mtime +7 -delete
find $BACKUP_DIR -name "*.tar.gz" -mtime +7 -delete
```

### 更新部署

```bash
#!/bin/bash
# 更新部署脚本

echo "🔄 开始更新部署..."

# 1. 备份当前版本
cp -r /var/www/zhixiao-platform /backup/zhixiao-platform-$(date +%Y%m%d)

# 2. 拉取最新代码
cd /var/www/zhixiao-platform
git pull origin main

# 3. 安装依赖
cd backend
npm ci --only=production

# 4. 重启服务
pm2 restart zhixiao-api

echo "✅ 更新完成！"
```

## 🔧 故障排除

### 常见问题

1. **端口占用**

   ```bash
   # 查看端口占用
   lsof -i :3000

   # 杀死占用进程
   kill -9 <PID>
   ```

2. **数据库连接失败**

   ```bash
   # 检查MySQL状态
   sudo systemctl status mysql

   # 重启MySQL
   sudo systemctl restart mysql
   ```

3. **PM2 服务异常**

   ```bash
   # 查看PM2状态
   pm2 status

   # 重启服务
   pm2 restart zhixiao-api

   # 查看日志
   pm2 logs zhixiao-api
   ```

### 性能优化

```bash
# 系统优化
echo 'net.core.somaxconn = 65535' >> /etc/sysctl.conf
echo 'fs.file-max = 100000' >> /etc/sysctl.conf
sysctl -p

# MySQL优化
# 编辑 /etc/mysql/mysql.conf.d/mysqld.cnf
[mysqld]
innodb_buffer_pool_size = 1G
max_connections = 200
query_cache_size = 64M
```

---

> 📅 最后更新: 2025-08-21  
> 🔗 相关文档: [开发指南](./DEVELOPMENT.md) | [架构设计](./ARCHITECTURE.md)  
> 💬 部署支持: [GitHub Issues](https://github.com/zhangyu424/zhixiao/issues)

# 管理员用户创建说明

## 📋 admin 用户信息

- **用户名**: `admin`
- **密码**: `zxrdsb050602`
- **角色**: 系统管理员
- **所属单位**: 总部

## 🚀 数据库初始化方法

### 方法一：使用 SQL 文件（推荐）

```bash
# 1. 进入项目目录
cd /var/www/zhixiao-platform/backend

# 2. 执行SQL文件创建admin用户
mysql -u root -p < database/create-admin-user.sql
```

### 方法二：手动执行 SQL

```sql
-- 1. 登录MySQL
mysql -u root -p

-- 2. 创建数据库
CREATE DATABASE IF NOT EXISTS zhixiao_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE zhixiao_db;

-- 3. 创建必要的表（省略详细SQL，请参考 create-admin-user.sql）

-- 4. 插入admin用户
INSERT INTO users (student_id, name, password, unit_id, role, status, force_password_change, created_at) VALUES
('admin', '系统管理员', '$2b$10$VA00dvuaKEGtn7xXh9/bn.4Jvuo/iBjyAGbvBxJU3pZSIKlj4PXdK', 1, 'admin', 'active', FALSE, NOW());
```

### 方法三：使用自动化脚本

```bash
# 设置数据库密码环境变量（如果有密码）
export DB_PASSWORD="your_mysql_password"

# 运行初始化脚本
cd /var/www/zhixiao-platform/backend
bash scripts/init-database.sh
```

## 🔐 密码哈希信息

- **原始密码**: `zxrdsb050602`
- **bcrypt 哈希**: `$2b$10$VA00dvuaKEGtn7xXh9/bn.4Jvuo/iBjyAGbvBxJU3pZSIKlj4PXdK`
- **盐值轮数**: 10

## ✅ 验证方法

登录系统后，使用以下信息：

- 在登录页面输入用户名：`admin`
- 输入密码：`zxrdsb050602`
- 应该能够成功登录并看到管理员界面

## 📁 相关文件

- `database/create-admin-user.sql` - 创建 admin 用户的 SQL 文件
- `database/init_data.sql` - 完整初始化数据
- `database/schema.sql` - 数据库结构
- `scripts/reset-admin-password.sh` - 密码重置脚本
- `scripts/generate-password-hash.js` - 密码哈希生成工具

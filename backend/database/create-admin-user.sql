-- 创建学习质效分析系统数据库和admin用户
-- 使用方法: mysql -u root -p < create-admin-user.sql

-- 创建数据库（如果不存在）
CREATE DATABASE IF NOT EXISTS zhixiao_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE zhixiao_db;

-- 创建单位表（如果不存在）
CREATE TABLE IF NOT EXISTS units (
  id INT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(100) NOT NULL COMMENT '单位名称',
  parent_id INT DEFAULT NULL COMMENT '上级单位ID',
  level TINYINT DEFAULT 0 COMMENT '层级 0-总部 1-分部 2-科室',
  sort_order INT DEFAULT 0 COMMENT '排序',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_parent_id (parent_id),
  FOREIGN KEY (parent_id) REFERENCES units(id) ON DELETE SET NULL
) COMMENT '组织单位表';

-- 创建用户表（如果不存在）
CREATE TABLE IF NOT EXISTS users (
  id INT PRIMARY KEY AUTO_INCREMENT,
  openid VARCHAR(128) UNIQUE COMMENT '微信OpenID',
  student_id VARCHAR(50) UNIQUE NOT NULL COMMENT '学员编号',
  name VARCHAR(50) NOT NULL COMMENT '姓名',
  password VARCHAR(255) NOT NULL COMMENT '密码',
  unit_id INT NOT NULL COMMENT '所属单位ID',
  role ENUM('student', 'leader', 'manager', 'admin') DEFAULT 'student' COMMENT '角色：学员、层级长、信管员、admin',
  status ENUM('active', 'inactive', 'deleted') DEFAULT 'active' COMMENT '状态',
  force_password_change BOOLEAN DEFAULT FALSE COMMENT '是否强制修改密码',
  password_changed_at TIMESTAMP NULL COMMENT '密码修改时间',
  avatar VARCHAR(255) DEFAULT NULL COMMENT '头像URL',
  phone VARCHAR(20) DEFAULT NULL COMMENT '手机号',
  email VARCHAR(100) DEFAULT NULL COMMENT '邮箱',
  last_login TIMESTAMP NULL COMMENT '最后登录时间',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_openid (openid),
  INDEX idx_student_id (student_id),
  INDEX idx_unit_id (unit_id),
  INDEX idx_role (role),
  INDEX idx_status (status),
  FOREIGN KEY (unit_id) REFERENCES units(id) ON DELETE RESTRICT
) COMMENT '用户表';

-- 插入总部单位（如果不存在）
INSERT IGNORE INTO units (id, name, parent_id, level, sort_order) VALUES 
(1, '总部', NULL, 0, 1);

-- 删除现有的admin用户（如果存在）
DELETE FROM users WHERE student_id = 'admin';

-- 创建admin用户
-- 用户名: admin
-- 密码: zxrdsb050602 (哈希值: $2b$10$VA00dvuaKEGtn7xXh9/bn.4Jvuo/iBjyAGbvBxJU3pZSIKlj4PXdK)
INSERT INTO users (student_id, name, password, unit_id, role, status, force_password_change, created_at) VALUES 
('admin', '系统管理员', '$2b$10$VA00dvuaKEGtn7xXh9/bn.4Jvuo/iBjyAGbvBxJU3pZSIKlj4PXdK', 1, 'admin', 'active', FALSE, NOW());

-- 验证创建结果
SELECT '=== Admin用户创建完成 ===' as message;
SELECT student_id as '用户名', name as '姓名', role as '角色', status as '状态', created_at as '创建时间'
FROM users WHERE student_id = 'admin';

SELECT '=== 登录信息 ===' as message;
SELECT 'admin' as '用户名', 'zxrdsb050602' as '密码', '系统管理员' as '角色';

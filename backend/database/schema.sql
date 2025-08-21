-- 学习质效分析系统数据库结构

-- 创建数据库
CREATE DATABASE IF NOT EXISTS zhixiao_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE zhixiao_db;

-- 1. 单位表
CREATE TABLE units (
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

-- 2. 用户表
CREATE TABLE users (
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

-- 3. 学习记录表
CREATE TABLE study_records (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT NOT NULL COMMENT '用户ID',
  date DATE NOT NULL COMMENT '学习日期',
  study_time DECIMAL(4,2) NOT NULL DEFAULT 0.00 COMMENT '学习时长(小时)',
  subject VARCHAR(100) DEFAULT NULL COMMENT '学习科目',
  remark TEXT DEFAULT NULL COMMENT '备注',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY uk_user_date (user_id, date),
  INDEX idx_date (date),
  INDEX idx_study_time (study_time),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) COMMENT '学习记录表';

-- 4. 考试表
CREATE TABLE exams (
  id INT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(100) NOT NULL COMMENT '考试名称',
  exam_date DATE NOT NULL COMMENT '考试日期',
  type ENUM('monthly', 'quarterly', 'annual', 'special') DEFAULT 'monthly' COMMENT '考试类型',
  total_score INT DEFAULT 100 COMMENT '总分',
  description TEXT DEFAULT NULL COMMENT '考试描述',
  status ENUM('pending', 'ongoing', 'completed') DEFAULT 'pending' COMMENT '状态',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_exam_date (exam_date),
  INDEX idx_type (type),
  INDEX idx_status (status)
) COMMENT '考试表';

-- 5. 考试成绩表
CREATE TABLE exam_scores (
  id INT PRIMARY KEY AUTO_INCREMENT,
  exam_id INT NOT NULL COMMENT '考试ID',
  user_id INT NOT NULL COMMENT '用户ID',
  score DECIMAL(5,2) NOT NULL COMMENT '成绩',
  ranking INT DEFAULT NULL COMMENT '排名',
  submitted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY uk_exam_user (exam_id, user_id),
  INDEX idx_score (score),
  INDEX idx_ranking (ranking),
  FOREIGN KEY (exam_id) REFERENCES exams(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) COMMENT '考试成绩表';

-- 6. 文件表
CREATE TABLE files (
  id INT PRIMARY KEY AUTO_INCREMENT,
  original_name VARCHAR(255) NOT NULL COMMENT '原始文件名',
  filename VARCHAR(255) NOT NULL COMMENT '存储文件名',
  path VARCHAR(500) NOT NULL COMMENT '文件路径',
  size BIGINT NOT NULL COMMENT '文件大小(字节)',
  mime_type VARCHAR(100) NOT NULL COMMENT 'MIME类型',
  uploaded_by INT NOT NULL COMMENT '上传者ID',
  type ENUM('import', 'export', 'template', 'other') DEFAULT 'other' COMMENT '文件类型',
  status ENUM('uploading', 'completed', 'failed') DEFAULT 'completed' COMMENT '状态',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_uploaded_by (uploaded_by),
  INDEX idx_type (type),
  FOREIGN KEY (uploaded_by) REFERENCES users(id) ON DELETE CASCADE
) COMMENT '文件表';

-- 7. 系统配置表
CREATE TABLE system_configs (
  id INT PRIMARY KEY AUTO_INCREMENT,
  key_name VARCHAR(100) UNIQUE NOT NULL COMMENT '配置键',
  value TEXT COMMENT '配置值',
  description VARCHAR(255) COMMENT '描述',
  type ENUM('string', 'number', 'boolean', 'json') DEFAULT 'string' COMMENT '值类型',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) COMMENT '系统配置表';

-- 8. 公告表
CREATE TABLE announcements (
  id INT PRIMARY KEY AUTO_INCREMENT,
  title VARCHAR(200) NOT NULL COMMENT '公告标题',
  content TEXT NOT NULL COMMENT '公告内容',
  priority ENUM('low', 'normal', 'high', 'urgent') DEFAULT 'normal' COMMENT '优先级',
  target_audience ENUM('all', 'students', 'teachers', 'admins') DEFAULT 'all' COMMENT '目标受众',
  author_id INT NOT NULL COMMENT '发布者ID',
  status ENUM('draft', 'published', 'archived') DEFAULT 'draft' COMMENT '状态',
  publish_at TIMESTAMP NULL COMMENT '发布时间',
  expire_at TIMESTAMP NULL COMMENT '过期时间',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_author_id (author_id),
  INDEX idx_status (status),
  INDEX idx_target_audience (target_audience),
  INDEX idx_publish_at (publish_at),
  FOREIGN KEY (author_id) REFERENCES users(id) ON DELETE CASCADE
) COMMENT '公告表';

-- 9. 系统设置表（用于动态配置）
CREATE TABLE system_settings (
  id INT PRIMARY KEY AUTO_INCREMENT,
  setting_key VARCHAR(100) UNIQUE NOT NULL COMMENT '设置键',
  setting_value TEXT COMMENT '设置值',
  description VARCHAR(255) COMMENT '描述',
  category VARCHAR(50) DEFAULT 'general' COMMENT '分类',
  is_system BOOLEAN DEFAULT FALSE COMMENT '是否为系统设置',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_category (category),
  INDEX idx_is_system (is_system)
) COMMENT '系统设置表';

-- 插入初始数据

-- 插入默认单位
INSERT INTO units (name, parent_id, level) VALUES 
('总部', NULL, 0),
('第一分部', 1, 1),
('第二分部', 1, 1),
('教务科', 2, 2),
('学员科', 2, 2),
('后勤科', 3, 2);

-- 插入管理员用户
INSERT INTO users (student_id, name, password, unit_id, role) VALUES 
('admin', '系统管理员', '$2b$10$YourHashedPasswordHere', 1, 'admin'),
('manager001', '教务管理员', '$2b$10$YourHashedPasswordHere', 4, 'manager');

-- 插入系统配置
INSERT INTO system_configs (key_name, value, description, type) VALUES 
('system_name', '学习质效分析系统', '系统名称', 'string'),
('default_study_reminder_time', '20:00', '默认学习提醒时间', 'string'),
('max_daily_study_hours', '12', '每日最大学习时长', 'number'),
('enable_notifications', 'true', '是否启用通知', 'boolean');

-- 创建视图

-- 用户学习统计视图
CREATE VIEW v_user_study_stats AS
SELECT 
  u.id AS user_id,
  u.name,
  u.student_id,
  u.role,
  un.name AS unit_name,
  COUNT(sr.id) AS total_records,
  COALESCE(SUM(sr.study_time), 0) AS total_hours,
  COALESCE(AVG(sr.study_time), 0) AS avg_daily_hours,
  COALESCE(MAX(sr.study_time), 0) AS max_daily_hours,
  MAX(sr.date) AS last_study_date
FROM users u
LEFT JOIN units un ON u.unit_id = un.id
LEFT JOIN study_records sr ON u.id = sr.user_id
GROUP BY u.id, u.name, u.student_id, u.role, un.name;

-- 月度学习统计视图
CREATE VIEW v_monthly_study_stats AS
SELECT 
  DATE_FORMAT(sr.date, '%Y-%m') AS month,
  sr.user_id,
  u.name,
  u.student_id,
  COUNT(*) AS study_days,
  SUM(sr.study_time) AS total_hours,
  AVG(sr.study_time) AS avg_daily_hours
FROM study_records sr
JOIN users u ON sr.user_id = u.id
GROUP BY DATE_FORMAT(sr.date, '%Y-%m'), sr.user_id, u.name, u.student_id;

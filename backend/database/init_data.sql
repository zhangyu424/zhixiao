-- 学习质效分析系统初始化数据

USE zhixiao_db;

-- 初始化单位数据
INSERT INTO units (id, name, parent_id, level, sort_order) VALUES 
(1, '总部', NULL, 0, 1),
(2, '第一分部', 1, 1, 1),
(3, '第二分部', 1, 1, 2),
(4, '教务科', 1, 2, 1),
(5, '技术科', 2, 2, 1),
(6, '管理科', 3, 2, 1);

-- 创建admin用户
-- 密码：zxrdsb050602
INSERT INTO users (student_id, name, password, unit_id, role, status, force_password_change, created_at) VALUES 
('admin', '系统管理员', '$2b$10$VA00dvuaKEGtn7xXh9/bn.4Jvuo/iBjyAGbvBxJU3pZSIKlj4PXdK', 1, 'admin', 'active', FALSE, NOW());

-- 创建示例信管员
-- 密码：默认为学号后3位（001）
INSERT INTO users (student_id, name, password, unit_id, role, status, force_password_change, created_at) VALUES 
('MGR001', '信管员001', '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 4, 'manager', 'active', TRUE, NOW());

-- 创建示例层级长
-- 密码：默认为学号后3位（001, 002）
INSERT INTO users (student_id, name, password, unit_id, role, status, force_password_change, created_at) VALUES 
('LDR001', '层级长001', '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 5, 'leader', 'active', TRUE, NOW()),
('LDR002', '层级长002', '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 6, 'leader', 'active', TRUE, NOW());

-- 创建示例学员
-- 密码：默认为学号后3位
INSERT INTO users (student_id, name, password, unit_id, role, status, force_password_change, created_at) VALUES 
('STU001', '学员001', '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 5, 'student', 'active', TRUE, NOW()),
('STU002', '学员002', '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 5, 'student', 'active', TRUE, NOW()),
('STU003', '学员003', '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 6, 'student', 'active', TRUE, NOW());

-- 初始化系统设置
INSERT INTO system_settings (setting_key, setting_value, description, category) VALUES 
('system_name', '学习质效分析系统', '系统名称', 'general'),
('default_study_goal', '3.0', '默认每日学习目标（小时）', 'study'),
('password_min_length', '6', '密码最小长度', 'security'),
('login_attempts_limit', '5', '登录尝试次数限制', 'security'),
('session_timeout', '7', '会话超时时间（天）', 'security'),
('enable_sms_verification', 'false', '是否启用短信验证', 'security');

-- 插入示例学习记录
INSERT INTO study_records (user_id, date, study_time, subject, remark, created_at) VALUES 
(5, '2025-08-19', 2.5, '数学', '完成第一章练习', NOW()),
(5, '2025-08-18', 3.0, '英语', '背诵单词50个', NOW()),
(6, '2025-08-19', 1.5, '物理', '复习力学知识', NOW()),
(6, '2025-08-18', 2.0, '化学', '实验报告', NOW()),
(7, '2025-08-19', 4.0, '计算机', '编程练习', NOW());

-- 插入示例公告
INSERT INTO announcements (title, content, priority, target_audience, author_id, status, publish_at, created_at) VALUES 
('系统上线通知', '学习质效分析系统正式上线，请各位用户及时登录使用。', 'high', 'all', 1, 'published', NOW(), NOW()),
('学习目标调整', '本月学习目标调整为每日3小时，请大家合理安排时间。', 'normal', 'students', 2, 'published', NOW(), NOW());

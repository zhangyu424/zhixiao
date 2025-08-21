const bcrypt = require('bcryptjs');

// 生成admin密码哈希
const adminPassword = 'zxrdsb050602';
const adminHash = bcrypt.hashSync(adminPassword, 10);

console.log('=== 密码哈希生成结果 ===');
console.log('用户: admin');
console.log('密码:', adminPassword);
console.log('哈希:', adminHash);

console.log('\n=== SQL更新语句 ===');
console.log(`UPDATE users SET password = '${adminHash}' WHERE student_id = 'admin';`);

// 验证哈希是否正确
const isValid = bcrypt.compareSync(adminPassword, adminHash);
console.log('\n验证结果:', isValid ? '✅ 哈希生成正确' : '❌ 哈希生成错误');

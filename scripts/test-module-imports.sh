#!/bin/bash

# 微信小程序模块导入测试脚本
echo "📱 测试微信小程序模块导入..."

cd /var/www/zhixiao-platform/frontend

echo "1. 检查关键文件是否存在..."
files=(
  "api/index.js"
  "utils/api/http.js"
  "utils/business/study-manager.js"
  "app.js"
  "pages/index/index.js"
)

for file in "${files[@]}"; do
  if [[ -f "$file" ]]; then
    echo "✅ $file 存在"
  else
    echo "❌ $file 缺失"
  fi
done

echo ""
echo "2. 检查语法错误..."
echo "检查 api/index.js:"
node -c api/index.js && echo "✅ 语法正确" || echo "❌ 语法错误"

echo "检查 utils/api/http.js:"
node -c utils/api/http.js && echo "✅ 语法正确" || echo "❌ 语法错误"

echo ""
echo "3. 检查模块导入路径..."
echo "检查 app.js 中的导入:"
grep "require.*api" app.js || echo "未找到api导入"

echo "检查 utils/business/study-manager.js 中的导入:"
grep "require.*api" utils/business/study-manager.js || echo "未找到api导入"

echo ""
echo "✅ 测试完成！"

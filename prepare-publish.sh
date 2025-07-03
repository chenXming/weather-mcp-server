#!/bin/bash

# 🚀 NPM 发布准备脚本

echo "🔍 准备发布到 npm..."

# 检查必要文件
echo "📋 检查必要文件..."

required_files=("package.json" "README.md" "LICENSE" "src/index.ts")
for file in "${required_files[@]}"; do
    if [[ ! -f "$file" ]]; then
        echo "❌ 缺少必要文件: $file"
        exit 1
    fi
done
echo "✅ 所有必要文件存在"

# 检查 package.json 配置
echo "📦 检查 package.json 配置..."

# 检查是否设置了正确的字段
if ! grep -q '"name".*@.*/' package.json; then
    echo "⚠️  建议使用 scoped package name (@username/package-name)"
fi

if ! grep -q '"repository"' package.json; then
    echo "⚠️  建议添加 repository 字段"
fi

if ! grep -q '"homepage"' package.json; then
    echo "⚠️  建议添加 homepage 字段"
fi

# 清理并构建
echo "🧹 清理构建目录..."
npm run clean

echo "🔨 构建项目..."
npm run build

if [[ $? -ne 0 ]]; then
    echo "❌ 构建失败"
    exit 1
fi

echo "✅ 构建成功"

# 检查构建输出
echo "📁 检查构建输出..."
if [[ ! -f "build/index.js" ]]; then
    echo "❌ 构建输出文件不存在"
    exit 1
fi

# 检查shebang
if ! head -1 build/index.js | grep -q "#!/usr/bin/env node"; then
    echo "❌ 构建文件缺少 shebang 行"
    exit 1
fi

echo "✅ 构建输出检查通过"

# 测试包内容
echo "📦 预览包内容..."
npm pack --dry-run

echo ""
echo "🎉 发布准备完成！"
echo ""
echo "📋 发布步骤："
echo "1. 确保已登录 npm: npm login"
echo "2. 发布包: npm publish"
echo "3. (如果是 scoped package) 发布公开包: npm publish --access public"
echo ""
echo "⚠️  发布前请确认："
echo "- ✅ package.json 中的版本号正确"
echo "- ✅ README.md 中的用户名和仓库地址已更新"
echo "- ✅ 已经测试过包的功能"
echo "- ✅ OpenWeatherMap API 密钥有效"

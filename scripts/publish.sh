#!/bin/bash

set -e

echo "🚀 准备发布 API Types CLI"

# 检查是否在 main 分支
BRANCH=$(git rev-parse --abbrev-ref HEAD)
if [ "$BRANCH" != "main" ]; then
    echo "❌ 请在 main 分支发布"
    exit 1
fi

# 检查工作目录是否干净
if [ -n "$(git status --porcelain)" ]; then
    echo "❌ 工作目录不干净，请先提交所有更改"
    exit 1
fi

# 运行测试
echo "🧪 运行测试..."
npm test

# 构建项目
echo "🏗️  构建项目..."
npm run build

# 更新版本
echo "📝 更新版本..."
npm version patch

# 发布到 npm
echo "📦 发布到 npm..."
npm publish

# 推送标签
echo "🏷️  推送标签..."
git push origin main --tags

echo "✅ 发布完成！"
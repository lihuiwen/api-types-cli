#!/bin/bash

echo "🧪 运行 API Types CLI 测试套件"

# 检查依赖
if ! command -v node &> /dev/null; then
    echo "❌ Node.js 未安装"
    exit 1
fi

if ! command -v npm &> /dev/null; then
    echo "❌ npm 未安装"
    exit 1
fi

# 安装依赖
echo "📦 安装测试依赖..."
npm install

# 构建项目
echo "🏗️ 构建项目..."
npm run build

# 检查网络连接
echo "🌐 检查网络连接..."
if curl -s --max-time 5 https://api.github.com > /dev/null; then
    echo "✅ 网络连接正常"
    NETWORK_AVAILABLE=true
else
    echo "⚠️ 网络连接不可用，将跳过需要网络的测试"
    NETWORK_AVAILABLE=false
fi

# 运行不同类型的测试
echo "🧪 运行单元测试..."
npm run test:unit

if [ "$NETWORK_AVAILABLE" = true ]; then
    echo "🌐 运行集成测试..."
    npm run test:integration
    
    echo "🎯 运行 GitHub API 测试..."
    npm run test:github
    
    echo "🔄 运行端到端测试..."
    npm test -- --testPathPattern=e2e.test.ts
else
    echo "⏭️ 跳过网络相关测试"
fi

echo "📊 生成测试覆盖率报告..."
npm run test:coverage

echo "✅ 测试完成！"
echo "📁 查看覆盖率报告: open coverage/lcov-report/index.html"

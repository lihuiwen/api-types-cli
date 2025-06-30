#!/usr/bin/env node

// 基础使用示例

import { execSync } from 'child_process';
import path from 'path';

const examples = [
  {
    name: '单个接口生成',
    command: 'echo \'{"name": "John", "age": 30}\' | api-types generate --output ./demo-types'
  },
  {
    name: 'GitHub API 示例',
    command: 'api-types generate --config examples/github-api.json --output ./github-types --runtime'
  },
  {
    name: 'JSONPlaceholder 示例',
    command: 'api-types generate --config examples/jsonplaceholder.yaml --output ./jsonplaceholder-types --runtime'
  }
];

console.log('🎯 API Types CLI 使用示例\n');

examples.forEach((example, index) => {
  console.log(`${index + 1}. ${example.name}`);
  console.log(`   命令: ${example.command}`);
  console.log('');
});

console.log('选择一个示例运行，或查看 examples/ 目录了解更多示例');
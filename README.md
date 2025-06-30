# API Types CLI 使用说明

## 📦 安装

```bash
# 全局安装
npm install -g api-types-cli

# 或本地安装
npm install api-types-cli
npx api-types --help
```

## 🚀 快速开始

### 1. 单个接口生成
```bash
# 交互式生成单个接口类型
api-types generate

# 直接指定参数
api-types generate --output ./types --runtime
```

### 2. 批量生成（推荐）

**步骤 1：生成配置文件**
```bash
# 交互式生成配置
api-types config

# 或创建示例配置
api-types init --format json
```

**步骤 2：编辑配置文件**
```json
[
  {
    "name": "User",
    "url": "https://jsonplaceholder.typicode.com/users/1",
    "method": "GET",
    "sampleOnly": false
  },
  {
    "name": "Users", 
    "url": "https://jsonplaceholder.typicode.com/users",
    "method": "GET",
    "sampleOnly": true
  },
  {
    "name": "Post",
    "url": "https://api.example.com/posts/1",
    "method": "GET",
    "headers": {
      "Authorization": "Bearer your-token"
    }
  }
]
```

**步骤 3：生成类型**
```bash
api-types generate --config api-config.json --runtime --output ./src/types
```

## 🛠️ 命令参考

### `api-types generate`
生成 API 类型文件

**选项：**
- `-o, --output <dir>` 输出目录 (默认: ./types)
- `-c, --config <file>` 配置文件路径
- `-r, --runtime` 生成运行时类型检查
- `-f, --format <format>` 输出格式 (typescript/typescript-zod/typescript-effect-schema)
- `-p, --parallel <num>` 并行处理数量 (默认: 3)
- `-t, --timeout <seconds>` 请求超时时间 (默认: 30)
- `--retries <num>` 重试次数 (默认: 2)
- `-q, --quiet` 静默模式
- `-w, --watch` 监听模式 (开发中)

### `api-types config`
交互式生成配置文件

### `api-types init`
初始化示例配置文件

**选项：**
- `-f, --format <format>` 配置格式 (json|yaml)

## 📝 配置文件格式

### JSON 格式
```json
[
  {
    "name": "User",
    "url": "https://api.example.com/users/1",
    "method": "GET",
    "headers": {
      "Authorization": "Bearer token",
      "Content-Type": "application/json"
    },
    "body": null,
    "sampleOnly": false
  }
]
```

### YAML 格式
```yaml
- name: User
  url: https://api.example.com/users/1
  method: GET
  headers:
    Authorization: Bearer token
    Content-Type: application/json
  sampleOnly: false

- name: Users
  url: https://api.example.com/users
  method: GET
  sampleOnly: true
```

## 🎯 使用示例

### 1. GitHub API
```bash
# 创建配置
cat > github-config.json << 'EOF'
[
  {
    "name": "GitHubUser",
    "url": "https://api.github.com/users/octocat",
    "method": "GET"
  },
  {
    "name": "GitHubRepos",
    "url": "https://api.github.com/users/octocat/repos",
    "method": "GET",
    "sampleOnly": true
  }
]
EOF

# 生成类型
api-types generate --config github-config.json --runtime --output ./src/types/github
```

### 2. REST API 完整示例
```bash
# 创建 REST API 配置
cat > rest-api-config.json << 'EOF'
[
  {
    "name": "User",
    "url": "https://jsonplaceholder.typicode.com/users/1"
  },
  {
    "name": "Users",
    "url": "https://jsonplaceholder.typicode.com/users",
    "sampleOnly": true
  },
  {
    "name": "Post",
    "url": "https://jsonplaceholder.typicode.com/posts/1"
  },
  {
    "name": "Posts",
    "url": "https://jsonplaceholder.typicode.com/posts",
    "sampleOnly": true
  }
]
EOF

# 生成类型（带运行时验证）
api-types generate --config rest-api-config.json --runtime --parallel 4 --output ./types
```

### 3. 需要认证的 API
```bash
cat > auth-api-config.json << 'EOF'
[
  {
    "name": "Profile",
    "url": "https://api.example.com/me",
    "method": "GET",
    "headers": {
      "Authorization": "Bearer your-jwt-token",
      "X-API-Key": "your-api-key"
    }
  },
  {
    "name": "Orders",
    "url": "https://api.example.com/orders",
    "method": "GET",
    "headers": {
      "Authorization": "Bearer your-jwt-token"
    },
    "sampleOnly": true
  }
]
EOF
```

## 📊 生成的文件结构

```
types/
├── index.ts              # 索引文件，导出所有类型
├── User.ts               # User 类型定义和转换器
├── Posts.ts              # Posts 类型定义和转换器
├── ...                   # 其他类型文件
└── usage-example.ts      # 使用示例代码
```

## 🔧 在项目中使用

### 1. 导入类型
```typescript
import { User, Post, UserConvert, PostConvert } from './types';

// 或者分别导入
import { User } from './types/User';
import { Convert as UserConvert } from './types/User';
```

### 2. 使用转换器（带运行时验证）
```typescript
async function fetchUser(id: number): Promise<User | null> {
  try {
    const response = await fetch(`/api/users/${id}`);
    const jsonText = await response.text();
    
    // 使用生成的转换器，包含运行时验证
    return UserConvert.toUser(jsonText);
  } catch (error) {
    console.error('用户数据解析失败:', error);
    return null;
  }
}
```

### 3. 集成到构建流程
```json
{
  "scripts": {
    "generate-types": "api-types generate --config api-config.json --runtime --output ./src/types",
    "prebuild": "npm run generate-types",
    "build": "tsc"
  }
}
```

## 🎛️ 高级配置

### 环境变量支持
在配置文件中使用环境变量：

```json
[
  {
    "name": "Profile",
    "url": "${API_BASE_URL}/me",
    "headers": {
      "Authorization": "Bearer ${API_TOKEN}"
    }
  }
]
```

### 条件配置
```json
[
  {
    "name": "User",
    "url": "https://api.example.com/users/1",
    "enabled": true
  },
  {
    "name": "AdminUser", 
    "url": "https://api.example.com/admin/users/1",
    "enabled": false
  }
]
```

### 复杂请求体
```json
[
  {
    "name": "CreateUser",
    "url": "https://api.example.com/users",
    "method": "POST",
    "headers": {
      "Content-Type": "application/json"
    },
    "body": {
      "name": "Test User",
      "email": "test@example.com",
      "role": "user"
    }
  }
]
```

## 🔄 CI/CD 集成

### GitHub Actions
```yaml
name: Generate API Types

on:
  schedule:
    - cron: '0 2 * * *'  # 每天凌晨2点运行
  workflow_dispatch:

jobs:
  generate-types:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
          
      - name: Install dependencies
        run: npm ci
        
      - name: Generate API types
        run: |
          npx api-types generate \
            --config api-config.json \
            --runtime \
            --output ./src/types
        env:
          API_TOKEN: ${{ secrets.API_TOKEN }}
          API_BASE_URL: ${{ vars.API_BASE_URL }}
          
      - name: Create Pull Request
        uses: peter-evans/create-pull-request@v5
        with:
          token: ${{ secrets.GITHUB_TOKEN }}
          commit-message: 'chore: update API types'
          title: 'Update API Types'
          branch: update-api-types
```

### GitLab CI
```yaml
generate-types:
  stage: build
  image: node:18
  script:
    - npm ci
    - npx api-types generate --config api-config.json --runtime --output ./src/types
  artifacts:
    paths:
      - src/types/
    expire_in: 1 week
  only:
    - schedules
    - web
```

## 🛡️ 错误处理和最佳实践

### 1. 网络错误处理
```bash
# 设置重试和超时
api-types generate \
  --config api-config.json \
  --timeout 60 \
  --retries 3 \
  --parallel 2
```

### 2. 大型 API 响应处理
```json
[
  {
    "name": "LargeDataset",
    "url": "https://api.example.com/large-dataset",
    "sampleOnly": true,
    "timeout": 120
  }
]
```

### 3. 版本化类型管理
```bash
# 为不同版本的 API 生成类型
api-types generate --config api-v1-config.json --output ./src/types/v1
api-types generate --config api-v2-config.json --output ./src/types/v2
```

## 🧪 测试生成的类型

### 创建测试文件
```typescript
// types.test.ts
import { UserConvert, User } from './types/User';

describe('User Types', () => {
  test('should parse valid user data', () => {
    const validJson = '{"id": 1, "name": "John", "email": "john@example.com"}';
    const user: User = UserConvert.toUser(validJson);
    
    expect(user.id).toBe(1);
    expect(user.name).toBe('John');
    expect(user.email).toBe('john@example.com');
  });

  test('should throw error for invalid data', () => {
    const invalidJson = '{"id": "not-a-number", "name": "John"}';
    
    expect(() => UserConvert.toUser(invalidJson)).toThrow();
  });
});
```

## 📚 常见使用模式

### 1. React Hook 集成
```typescript
// hooks/useApiData.ts
import { useState, useEffect } from 'react';
import { UserConvert, User } from '../types/User';

export function useUser(id: number) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchUser() {
      try {
        setLoading(true);
        const response = await fetch(`/api/users/${id}`);
        const jsonText = await response.text();
        const userData = UserConvert.toUser(jsonText);
        setUser(userData);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
        setUser(null);
      } finally {
        setLoading(false);
      }
    }

    fetchUser();
  }, [id]);

  return { user, loading, error };
}
```

### 2. Express.js 中间件
```typescript
// middleware/validateResponse.ts
import { PostConvert } from '../types/Post';

export function validateApiResponse(req: Request, res: Response, next: NextFunction) {
  const originalSend = res.send;
  
  res.send = function(data: any) {
    try {
      // 验证响应数据格式
      if (req.path.includes('/posts/')) {
        PostConvert.toPost(JSON.stringify(data));
      }
      return originalSend.call(this, data);
    } catch (error) {
      console.error('Response validation failed:', error);
      return originalSend.call(this, data); // 或者返回错误
    }
  };
  
  next();
}
```

### 3. 数据转换管道
```typescript
// utils/dataTransformer.ts
import { UserConvert, PostConvert } from '../types';

type DataConverter = {
  [key: string]: (json: string) => any;
};

const converters: DataConverter = {
  user: UserConvert.toUser,
  post: PostConvert.toPost,
  // 添加更多转换器...
};

export function transformApiData(type: string, jsonData: string) {
  const converter = converters[type];
  if (!converter) {
    throw new Error(`No converter found for type: ${type}`);
  }
  
  return converter(jsonData);
}

// 批量转换
export function batchTransform(items: Array<{type: string, data: string}>) {
  return items.map(item => ({
    type: item.type,
    data: transformApiData(item.type, item.data)
  }));
}
```

## 🔧 故障排除

### 常见问题

**1. 网络连接问题**
```bash
# 检查网络连接
curl -I https://api.example.com/users/1

# 使用代理
export HTTP_PROXY=http://proxy.example.com:8080
api-types generate --config api-config.json
```

**2. 认证问题**
```bash
# 测试 API 访问
curl -H "Authorization: Bearer your-token" https://api.example.com/users/1

# 在配置中添加正确的认证头
```

**3. JSON 格式问题**
```bash
# 验证 API 返回的 JSON
curl -s https://api.example.com/users/1 | jq '.'

# 检查是否有额外的字符或格式问题
```

**4. 类型生成失败**
```bash
# 启用详细输出
api-types generate --config api-config.json --verbose
```

### 调试技巧

**1. 保存中间文件**
```bash
# 保存下载的 JSON 数据以供调试
mkdir -p debug-data
api-types generate --config api-config.json --save-temp --temp-dir debug-data
```

**2. 分步执行**
```bash
# 只下载数据，不生成类型
api-types download --config api-config.json --output debug-data

# 从已下载的数据生成类型
api-types generate --from-files debug-data --output types
```

## 🤝 贡献指南

欢迎提交 Issue 和 Pull Request！

### 开发环境设置
```bash
# 克隆仓库
git clone https://github.com/your-username/api-types-cli.git
cd api-types-cli

# 安装依赖
npm install

# 开发模式运行
npm run dev

# 构建
npm run build

# 测试
npm test
```

### 添加新功能
1. Fork 项目
2. 创建功能分支 (`git checkout -b feature/amazing-feature`)
3. 提交更改 (`git commit -m 'Add amazing feature'`)
4. 推送到分支 (`git push origin feature/amazing-feature`)
5. 创建 Pull Request

## 📄 许可证

MIT License - 详见 [LICENSE](LICENSE) 文件

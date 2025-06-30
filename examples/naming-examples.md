# 接口命名规范示例

本文档展示了 API Types CLI 的接口命名规范和验证功能。

## 🎯 命名规则

### ✅ 有效的接口名称

```bash
# 基础单词
User → User
order → Order 
product → Product

# 下划线连接
user_profile → UserProfile
github_user → GithubUser
api_response → ApiResponse

# 混合大小写（会自动规范化）
userProfile → Userprofile
GitHubAPI → Githubapi
XMLData → Xmldata

# 以下划线开头
_private → Private
_internal_data → InternalData
```

### ❌ 无效的接口名称

```bash
# 包含特殊字符
user-name ❌ (包含连字符)
user@email ❌ (包含@符号)
user.name ❌ (包含点号)
user name ❌ (包含空格)

# 以数字开头
1user ❌
123data ❌

# TypeScript 关键字
interface ❌
type ❌
class ❌
function ❌
export ❌

# 过长名称
very_very_very_very_long_interface_name_that_exceeds_fifty_characters ❌
```

## 🚀 交互式验证演示

当您运行 `api-types generate` 或 `api-types config` 时，系统会自动验证您的输入：

### 示例 1：有效输入
```bash
$ api-types generate
? 接口名称: github_user
# ✅ 自动转换为: GithubUser
```

### 示例 2：无效输入
```bash
$ api-types generate
? 接口名称: user-name
# ❌ 错误提示: 接口名称只能包含字母、数字和下划线，且必须以字母或下划线开头

? 接口名称: interface
# ❌ 错误提示: 接口名称不能使用 TypeScript 关键字

? 接口名称: user_profile
# ✅ 自动转换为: UserProfile
```

## 📝 配置文件示例

当使用配置文件时，系统也会自动验证和转换名称：

```json
[
  {
    "name": "github_user",  // 将转换为 GithubUser
    "url": "https://api.github.com/users/octocat"
  },
  {
    "name": "repo_data",    // 将转换为 RepoData  
    "url": "https://api.github.com/users/octocat/repos"
  }
]
```

## 🏗️ 生成的文件结构

使用规范的命名后，生成的文件将具有一致的结构：

```
types/
├── index.ts
├── GithubUser.ts        // 从 github_user 转换而来
├── RepoData.ts          // 从 repo_data 转换而来
└── usage-example.ts
```

## 💡 最佳实践建议

1. **使用描述性名称**：`UserProfile` 比 `UP` 更好
2. **保持名称简洁**：避免超过 3-4 个单词
3. **使用下划线分隔**：系统会自动转换为 PascalCase
4. **避免缩写**：除非是广泛认知的（如 `API`、`URL`）
5. **保持一致性**：在整个项目中使用相同的命名风格

## 🔧 技术实现

命名验证包含以下检查：

- **非空验证**：确保输入不为空
- **长度验证**：限制在 50 个字符以内  
- **字符验证**：只允许字母、数字、下划线
- **开头验证**：必须以字母或下划线开头
- **关键字验证**：避免 TypeScript 保留关键字
- **自动转换**：将输入转换为标准的 PascalCase 格式

这些验证确保生成的 TypeScript 类型文件符合最佳实践，并避免潜在的编译错误。 
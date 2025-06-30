export class TemplateManager {
  generateIndexFile(names: string[]): string {
    let content = '// 自动生成的类型索引文件\n';
    content += `// 生成时间: ${new Date().toISOString()}\n\n`;

    content += '\n// 便捷导入\n';
    names.forEach(name => {
      content += `export { Convert as ${name}Convert } from './${name}';\n`;
    });

    return content;
  }

  generateUsageExample(names: string[]): string {
    let content = '// API 类型使用示例\n\n';

    // 导入示例
    names.slice(0, 2).forEach(name => {
      content += `import { Convert as ${name}Convert, ${name} } from './${name}';\n`;
    });

    content += '\n// 基础使用示例\n';
    if (names.length > 0) {
      const firstType = names[0];
      content += `async function fetch${firstType}(id: number): Promise<${firstType} | null> {\n`;
      content += `  try {\n`;
      content += `    const response = await fetch(\`/api/${firstType.toLowerCase()}s/\${id}\`);\n`;
      content += `    const jsonText = await response.text();\n`;
      content += `    return ${firstType}Convert.to${firstType}(jsonText);\n`;
      content += `  } catch (error) {\n`;
      content += `    console.error('数据解析失败:', error);\n`;
      content += `    return null;\n`;
      content += `  }\n`;
      content += `}\n\n`;
    }

    content += this.generateBatchProcessingExample();
    content += this.generateErrorHandlingExample();
    content += this.generateValidationExample();

    return content;
  }

  private generateBatchProcessingExample(): string {
    return `// 批量处理示例
async function safeBatchParse<T>(jsonList: string[], converter: (json: string) => T): Promise<T[]> {
  const results: T[] = [];
  const errors: string[] = [];

  jsonList.forEach((json, index) => {
    try {
      results.push(converter(json));
    } catch (error) {
      errors.push(\`第 \${index + 1} 条数据错误: \${error.message}\`);
    }
  });

  if (errors.length > 0) {
    console.warn("解析警告:", errors);
  }

  return results;
}

`;
  }

  private generateErrorHandlingExample(): string {
    return `// 错误处理示例
function safeParseWithFallback<T>(json: string, converter: (json: string) => T, fallback: T): T {
  try {
    return converter(json);
  } catch (error) {
    console.warn('解析失败，使用默认值:', error.message);
    return fallback;
  }
}

`;
  }

  private generateValidationExample(): string {
    return `// 类型验证示例
function validateAndParse<T>(
  data: unknown, 
  validator: (data: unknown) => data is T,
  converter: (json: string) => T
): T | null {
  if (validator(data)) {
    try {
      return converter(JSON.stringify(data));
    } catch (error) {
      console.error('转换失败:', error);
      return null;
    }
  }
  console.error('数据验证失败');
  return null;
}
`;
  }
}
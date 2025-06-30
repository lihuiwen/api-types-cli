#!/usr/bin/env node

import { Command } from 'commander';
import chalk from 'chalk';
import ora from 'ora';
import fs from 'fs-extra';
import path from 'path';
import { quicktype, InputData, jsonInputForTargetLanguage } from 'quicktype-core';
import axios from 'axios';
import inquirer from 'inquirer';
import yaml from 'js-yaml';

// 配置类型
interface APIConfig {
  name: string;
  url: string;
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE';
  headers?: Record<string, string>;
  body?: any;
  sampleOnly?: boolean; // 是否只取数组的样本
  timeout?: number;
}

interface GenerateOptions {
  output: string;
  runtime: boolean;
  format: 'typescript' | 'typescript-zod' | 'typescript-effect-schema';
  config?: string;
  parallel: number;
  timeout: number;
  retries: number;
  quiet: boolean;
  watch: boolean;
}

class ApiTypesGenerator {
  private options: GenerateOptions;
  private spinner: any;

  constructor(options: GenerateOptions) {
    this.options = options;
    this.spinner = ora();
  }

  private log(message: string, type: 'info' | 'success' | 'warning' | 'error' = 'info') {
    if (this.options.quiet) return;

    const colors = {
      info: chalk.blue,
      success: chalk.green,
      warning: chalk.yellow,
      error: chalk.red
    };

    const icons = {
      info: 'ℹ️',
      success: '✅',
      warning: '⚠️',
      error: '❌'
    };

    console.log(`${icons[type]} ${colors[type](message)}`);
  }

  private async fetchApiData(config: APIConfig): Promise<string> {
    const { name, url, method = 'GET', headers = {}, body, timeout } = config;
    
    this.spinner.start(`获取 ${name} 数据...`);
    
    try {
      const response = await axios({
        method,
        url,
        headers: {
          'User-Agent': 'api-types-cli/1.0.0',
          ...headers
        },
        data: body,
        timeout: this.options.timeout * 1000,
        validateStatus: () => true // 接受所有状态码
      });

      if (response.status >= 400) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      this.spinner.succeed(`${name} 数据获取成功`);
      
      // 如果是数组且设置了 sampleOnly，只取前几个元素
      let data = response.data;
      if (config.sampleOnly && Array.isArray(data) && data.length > 3) {
        data = data.slice(0, 3);
        this.log(`${name} 为数组类型，已取前 3 个元素作为样本`, 'info');
      }

      return JSON.stringify(data, null, 2);
    } catch (error) {
      this.spinner.fail(`${name} 数据获取失败`);
      throw error;
    }
  }

  private async generateTypeScript(name: string, jsonData: string): Promise<string> {
    const jsonInput = jsonInputForTargetLanguage(this.options.format);
    await jsonInput.addSource({ name, samples: [jsonData] });

    const inputData = new InputData();
    inputData.addInput(jsonInput);

    const rendererOptions: Record<string, any> = {};
    
    if (this.options.runtime) {
      rendererOptions['runtime-typecheck'] = 'true';
    }

    const result = await quicktype({
      inputData,
      lang: this.options.format,
      rendererOptions
    });

    return result.lines.join('\n');
  }

  private async saveTypeFile(name: string, content: string): Promise<void> {
    const outputDir = path.resolve(this.options.output);
    await fs.ensureDir(outputDir);

    const filename = `${name}.ts`;
    const filepath = path.join(outputDir, filename);

    await fs.writeFile(filepath, content, 'utf8');
    this.log(`类型文件已生成: ${filepath}`, 'success');
  }

  private async generateIndexFile(names: string[]): Promise<void> {
    const outputDir = path.resolve(this.options.output);
    const indexPath = path.join(outputDir, 'index.ts');

    let content = '// 自动生成的类型索引文件\n';
    content += `// 生成时间: ${new Date().toISOString()}\n\n`;

    names.forEach(name => {
      content += `export * from './${name}';\n`;
    });

    content += '\n// 便捷导入\n';
    names.forEach(name => {
      content += `export { Convert as ${name}Convert } from './${name}';\n`;
    });

    await fs.writeFile(indexPath, content, 'utf8');
    this.log(`索引文件已生成: ${indexPath}`, 'success');
  }

  private async generateUsageExample(names: string[]): Promise<void> {
    const outputDir = path.resolve(this.options.output);
    const examplePath = path.join(outputDir, 'usage-example.ts');

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

    content += '// 批量处理示例\n';
    content += 'async function safeBatchParse<T>(jsonList: string[], converter: (json: string) => T): Promise<T[]> {\n';
    content += '  const results: T[] = [];\n';
    content += '  const errors: string[] = [];\n\n';
    content += '  jsonList.forEach((json, index) => {\n';
    content += '    try {\n';
    content += '      results.push(converter(json));\n';
    content += '    } catch (error) {\n';
    content += '      errors.push(`第 ${index + 1} 条数据错误: ${error.message}`);\n';
    content += '    }\n';
    content += '  });\n\n';
    content += '  if (errors.length > 0) {\n';
    content += '    console.warn("解析警告:", errors);\n';
    content += '  }\n\n';
    content += '  return results;\n';
    content += '}\n';

    await fs.writeFile(examplePath, content, 'utf8');
    this.log(`使用示例已生成: ${examplePath}`, 'success');
  }

  async generateFromConfig(configPath: string): Promise<void> {
    const configFile = path.resolve(configPath);
    if (!await fs.pathExists(configFile)) {
      throw new Error(`配置文件不存在: ${configFile}`);
    }

    const configContent = await fs.readFile(configFile, 'utf8');
    let config: APIConfig[];

    try {
      if (configPath.endsWith('.yaml') || configPath.endsWith('.yml')) {
        config = yaml.load(configContent) as APIConfig[];
      } else {
        config = JSON.parse(configContent);
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      throw new Error(`配置文件解析失败: ${message}`);
    }

    await this.generateFromApis(config);
  }

  async generateFromApis(apis: APIConfig[]): Promise<void> {
    const successNames: string[] = [];
    const errors: string[] = [];

    this.log(`开始生成 ${apis.length} 个接口的类型文件`, 'info');

    // 并行处理（控制并发数）
    const chunks = this.chunkArray(apis, this.options.parallel);
    
    for (const chunk of chunks) {
      await Promise.allSettled(
        chunk.map(async (api) => {
          let retries = this.options.retries;
          
          while (retries >= 0) {
            try {
              const jsonData = await this.fetchApiData(api);
              const tsContent = await this.generateTypeScript(api.name, jsonData);
              await this.saveTypeFile(api.name, tsContent);
              successNames.push(api.name);
              break;
            } catch (error) {
              if (retries === 0) {
                const message = error instanceof Error ? error.message : String(error);
                const errorMsg = `${api.name}: ${message}`;
                errors.push(errorMsg);
                this.log(errorMsg, 'error');
              } else {
                this.log(`${api.name} 失败，重试中... (剩余 ${retries} 次)`, 'warning');
                retries--;
                // 等待一段时间再重试
                await new Promise(resolve => setTimeout(resolve, 1000));
              }
            }
          }
        })
      );
    }

    // 生成索引文件和使用示例
    if (successNames.length > 0) {
      await this.generateIndexFile(successNames);
      await this.generateUsageExample(successNames);
    }

    // 显示统计信息
    this.showStatistics(successNames.length, errors.length, errors);
  }

  private chunkArray<T>(array: T[], size: number): T[][] {
    const chunks: T[][] = [];
    for (let i = 0; i < array.length; i += size) {
      chunks.push(array.slice(i, i + size));
    }
    return chunks;
  }

  private showStatistics(successCount: number, errorCount: number, errors: string[]): void {
    console.log('\n' + chalk.cyan('📊 生成统计'));
    console.log(chalk.cyan('==============================================='));
    console.log(`✅ 成功: ${chalk.green(successCount)}`);
    console.log(`❌ 失败: ${chalk.red(errorCount)}`);
    
    if (errors.length > 0) {
      console.log('\n❌ 失败详情:');
      errors.forEach(error => console.log(`  • ${error}`));
    }

    if (successCount > 0) {
      const outputDir = path.resolve(this.options.output);
      console.log(`\n📁 输出目录: ${outputDir}`);
      console.log('\n🎯 下一步:');
      console.log(`  1. 查看生成的文件: ls -la ${outputDir}`);
      console.log(`  2. 导入类型: import { YourType } from '${outputDir}'`);
      console.log(`  3. 查看使用示例: cat ${outputDir}/usage-example.ts`);
    }
  }
}

// 交互式配置生成器
class ConfigGenerator {
  async generate(): Promise<void> {
    console.log(chalk.blue('🛠️  API 类型生成配置向导'));
    console.log(chalk.gray('按照提示输入信息，生成配置文件\n'));

    const { configType } = await inquirer.prompt([
      {
        type: 'list',
        name: 'configType',
        message: '选择配置文件格式:',
        choices: [
          { name: 'JSON', value: 'json' },
          { name: 'YAML', value: 'yaml' }
        ]
      }
    ]);

    const apis: APIConfig[] = [];
    let addMore = true;

    while (addMore) {
      const apiConfig = await inquirer.prompt([
        {
          type: 'input',
          name: 'name',
          message: '接口名称 (用作类型名):',
          validate: (input) => input.trim() ? true : '请输入接口名称'
        },
        {
          type: 'input',
          name: 'url',
          message: 'API URL:',
          validate: (input) => {
            try {
              new URL(input);
              return true;
            } catch {
              return '请输入有效的 URL';
            }
          }
        },
        {
          type: 'list',
          name: 'method',
          message: 'HTTP 方法:',
          choices: ['GET', 'POST', 'PUT', 'DELETE'],
          default: 'GET'
        },
        {
          type: 'confirm',
          name: 'sampleOnly',
          message: '如果返回数组，是否只取样本 (前3个元素)?',
          default: true
        }
      ]);

      apis.push(apiConfig);

      const { continueAdding } = await inquirer.prompt([
        {
          type: 'confirm',
          name: 'continueAdding',
          message: '继续添加接口?',
          default: false
        }
      ]);

      addMore = continueAdding;
    }

    const { outputPath } = await inquirer.prompt([
      {
        type: 'input',
        name: 'outputPath',
        message: '配置文件保存路径:',
        default: `api-config.${configType}`
      }
    ]);

    // 保存配置文件
    const configContent = configType === 'yaml' 
      ? yaml.dump(apis)
      : JSON.stringify(apis, null, 2);

    await fs.writeFile(outputPath, configContent, 'utf8');
    console.log(chalk.green(`\n✅ 配置文件已保存: ${outputPath}`));
    console.log(chalk.blue(`\n使用配置文件生成类型:`));
    console.log(chalk.gray(`  api-types generate --config ${outputPath}`));
  }
}

// CLI 程序
const program = new Command();

program
  .name('api-types')
  .description('🚀 API 接口 TypeScript 类型生成器')
  .version('1.0.0');

program
  .command('generate')
  .alias('gen')
  .description('生成 API 类型文件')
  .option('-o, --output <dir>', '输出目录', './types')
  .option('-c, --config <file>', '配置文件路径')
  .option('-r, --runtime', '生成运行时类型检查', false)
  .option('-f, --format <format>', '输出格式', 'typescript')
  .option('-p, --parallel <num>', '并行处理数量', '3')
  .option('-t, --timeout <seconds>', '请求超时时间(秒)', '30')
  .option('--retries <num>', '重试次数', '2')
  .option('-q, --quiet', '静默模式', false)
  .option('-w, --watch', '监听模式', false)
  .action(async (options: GenerateOptions) => {
    try {
      const generator = new ApiTypesGenerator({
        ...options,
        parallel: parseInt(options.parallel as any),
        timeout: parseInt(options.timeout as any),
        retries: parseInt((options as any).retries)
      });

      if (options.config) {
        await generator.generateFromConfig(options.config);
      } else {
        // 交互式单个接口生成
        const { name, url } = await inquirer.prompt([
          {
            type: 'input',
            name: 'name',
            message: '接口名称:',
            validate: (input) => input.trim() ? true : '请输入接口名称'
          },
          {
            type: 'input',
            name: 'url',
            message: 'API URL:',
            validate: (input) => {
              try {
                new URL(input);
                return true;
              } catch {
                return '请输入有效的 URL';
              }
            }
          }
        ]);

        await generator.generateFromApis([{ name, url }]);
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      console.error(chalk.red(`❌ 生成失败: ${message}`));
      process.exit(1);
    }
  });

program
  .command('config')
  .description('交互式生成配置文件')
  .action(async () => {
    try {
      const configGenerator = new ConfigGenerator();
      await configGenerator.generate();
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      console.error(chalk.red(`❌ 配置生成失败: ${message}`));
      process.exit(1);
    }
  });

program
  .command('init')
  .description('初始化示例配置文件')
  .option('-f, --format <format>', '配置格式 (json|yaml)', 'json')
  .action(async (options) => {
    const exampleConfig: APIConfig[] = [
      {
        name: 'User',
        url: 'https://jsonplaceholder.typicode.com/users/1',
        method: 'GET',
        sampleOnly: false
      },
      {
        name: 'Users',
        url: 'https://jsonplaceholder.typicode.com/users',
        method: 'GET',
        sampleOnly: true
      },
      {
        name: 'Post',
        url: 'https://jsonplaceholder.typicode.com/posts/1',
        method: 'GET'
      }
    ];

    const filename = `api-config.${options.format}`;
    const content = options.format === 'yaml'
      ? yaml.dump(exampleConfig)
      : JSON.stringify(exampleConfig, null, 2);

    await fs.writeFile(filename, content, 'utf8');
    console.log(chalk.green(`✅ 示例配置文件已创建: ${filename}`));
    console.log(chalk.blue('编辑配置文件后运行:'));
    console.log(chalk.gray(`  api-types generate --config ${filename}`));
  });

// 错误处理
process.on('uncaughtException', (error) => {
  console.error(chalk.red('💥 未捕获的异常:', error.message));
  process.exit(1);
});

process.on('unhandledRejection', (reason) => {
  console.error(chalk.red('💥 未处理的 Promise 拒绝:', reason));
  process.exit(1);
});

// 启动 CLI
function isMainModule(): boolean {
  if (process.env.NODE_ENV === 'test') return false;
  
  const arg1 = process.argv[1];
  if (!arg1) return false;
  
  return arg1.includes('index') || arg1.endsWith('index.js') || arg1.endsWith('index.ts');
}

if (isMainModule()) {
  program.parse();
}

export { ApiTypesGenerator, ConfigGenerator };

import inquirer from 'inquirer';
import { APIConfig, ConfigGeneratorOptions } from '../types/config.js';
import { FileUtils } from '../utils/file-utils.js';
import { Formatter } from '../utils/formatter.js';
import { EnhancedLogger } from '../utils/logger.js';
import { Validator } from '../utils/validator.js';

export class ConfigGenerator {
  private options: ConfigGeneratorOptions;

  constructor(options: ConfigGeneratorOptions = { format: 'json' }) {
    this.options = options;
  }

  async generate(): Promise<void> {
    EnhancedLogger.section('API 类型生成配置向导');
    EnhancedLogger.info('按照提示输入信息，生成配置文件\n');

    const { configType } = await inquirer.prompt([
      {
        type: 'list',
        name: 'configType',
        message: '选择配置文件格式:',
        choices: [
          { name: '📄 JSON', value: 'json' },
          { name: '📝 YAML', value: 'yaml' }
        ]
      }
    ]);

    const apis: APIConfig[] = [];
    let addMore = true;

    while (addMore) {
      const apiConfig = await this.promptForApiConfig();
      apis.push(apiConfig);

      const { continueAdding } = await inquirer.prompt([
        {
          type: 'confirm',
          name: 'continueAdding',
          message: '➕ 继续添加接口?',
          default: false
        }
      ]);

      addMore = continueAdding;
    }

    const outputPath = this.options.outputPath || await this.promptForOutputPath(configType);

    await FileUtils.saveConfig(apis, outputPath);
    EnhancedLogger.success(`配置文件已保存: ${outputPath}`);

    console.log('\n🚀 使用配置文件生成类型:');
    EnhancedLogger.info(`api-types generate --config ${outputPath}`);
  }

  private async promptForApiConfig(): Promise<APIConfig> {
    return await inquirer.prompt([
      {
        type: 'input',
        name: 'name',
        message: '🏷️  接口名称 (用作类型名):',
        validate: (input) => {
          const result = Validator.validateInterfaceName(input);
          return result.isValid ? true : result.message!;
        },
        filter: (input) => Formatter.toPascalCase(input)
      },
      {
        type: 'input',
        name: 'url',
        message: '🌐 API URL:',
        validate: (input) => {
          const result = Validator.validateUrl(input);
          return result.isValid ? true : result.message!;
        }
      },
      {
        type: 'list',
        name: 'method',
        message: '📡 HTTP 方法:',
        choices: ['GET', 'POST', 'PUT', 'DELETE'],
        default: 'GET'
      },
      {
        type: 'confirm',
        name: 'sampleOnly',
        message: '🔢 如果返回数组，是否只取样本 (前3个元素)?',
        default: true
      }
    ]);
  }

  private async promptForOutputPath(configType: string): Promise<string> {
    const { outputPath } = await inquirer.prompt([
      {
        type: 'input',
        name: 'outputPath',
        message: '💾 配置文件保存路径:',
        default: `api-config.${configType}`
      }
    ]);
    return outputPath;
  }

  async generateExample(format: 'json' | 'yaml' = 'json'): Promise<string> {
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

    const filename = `api-config.${format}`;
    await FileUtils.saveConfig(exampleConfig, filename);

    return filename;
  }
}
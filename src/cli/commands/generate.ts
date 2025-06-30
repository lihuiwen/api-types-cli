import inquirer from 'inquirer';
import { ApiTypesGenerator } from '../../core/generator.js';
import { GenerateOptions } from '../../types/config.js';
import { SUPPORTED_FORMATS } from '../../utils/constants.js';
import { EnhancedLogger } from '../../utils/logger.js';

export async function handleGenerateCommand(options: GenerateOptions): Promise<void> {
  try {
    // 验证格式参数
    if (!SUPPORTED_FORMATS.includes(options.format as any)) {
      throw new Error(`不支持的格式: ${options.format}。支持的格式: ${SUPPORTED_FORMATS.join(', ')}`);
    }

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
      EnhancedLogger.section('交互式接口配置');

      const { name, url } = await inquirer.prompt([
        {
          type: 'input',
          name: 'name',
          message: '🏷️  接口名称:',
          validate: (input) => generator.validateInterfaceName(input),
          filter: (input) => generator.toPascalCase(input)
        },
        {
          type: 'input',
          name: 'url',
          message: '🌐 API URL:',
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
    EnhancedLogger.error(`生成失败: ${message}`);
    process.exit(1);
  }
}
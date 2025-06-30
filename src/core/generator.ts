import ora from 'ora';
import { TemplateManager } from '../templates/template-manager.js';
import { APIConfig, GenerateOptions } from '../types/config.js';
import { GenerationResult, GenerationStatistics } from '../types/generator.js';
import { FileUtils } from '../utils/file-utils.js';
import { Formatter } from '../utils/formatter.js';
import { EnhancedLogger } from '../utils/logger.js';
import { Validator } from '../utils/validator.js';
import { ApiClient } from './api-client.js';
import { TypeGenerator } from './type-generator.js';

export class ApiTypesGenerator {
  private options: GenerateOptions;
  private spinner: any;
  private apiClient: ApiClient;
  private typeGenerator: TypeGenerator;
  private templateManager: TemplateManager;

  constructor(options: GenerateOptions) {
    this.options = options;
    this.spinner = ora({
      spinner: 'dots12',
      color: 'cyan'
    });
    this.apiClient = new ApiClient(this.options.timeout);
    this.typeGenerator = new TypeGenerator();
    this.templateManager = new TemplateManager();

    // 配置日志器
    EnhancedLogger.configure({ quiet: this.options.quiet });
  }

  async generateFromConfig(configPath: string): Promise<GenerationStatistics> {
    const config = await FileUtils.loadConfig(configPath);
    return this.generateFromApis(config);
  }

  async generateFromApis(apis: APIConfig[]): Promise<GenerationStatistics> {
    const startTime = Date.now();
    const results: GenerationResult[] = [];

    EnhancedLogger.section(`开始生成 ${apis.length} 个接口的类型文件`);

    // 预处理：转换名称并验证
    const processedApis = this.preprocessApis(apis);

    // 并行获取数据
    this.spinner.start('🌐 批量获取 API 数据...');
    const fetchResults = await this.apiClient.batchFetch(processedApis, this.options.parallel);
    this.spinner.stop();

    // 处理成功的数据
    const successfulData = new Map<string, string>();
    const failedApis: string[] = [];

    fetchResults.forEach(({ config, data, error }) => {
      if (data) {
        successfulData.set(config.name, data);
        results.push({
          success: true,
          name: config.name
        });
      } else {
        failedApis.push(`${config.name}: ${error}`);
        results.push({
          success: false,
          name: config.name,
          error: error || 'Unknown error'
        });
      }
    });

    // 生成 TypeScript 类型
    if (successfulData.size > 0) {
      this.spinner.start('🔧 生成 TypeScript 类型...');

      try {
        const typeResults = await this.typeGenerator.batchGenerate(successfulData, {
          format: this.options.format,
          runtime: this.options.runtime
        });

        // 保存类型文件
        await this.saveTypeFiles(typeResults);

        // 生成辅助文件
        const names = Array.from(successfulData.keys());
        await this.generateAuxiliaryFiles(names);

        this.spinner.succeed('✅ 类型文件生成完成');

        // 更新结果中的文件路径
        results.forEach(result => {
          if (result.success) {
            result.filePath = FileUtils.joinPath(this.options.output, `${result.name}.ts`);
          }
        });

      } catch (error) {
        this.spinner.fail('❌ 类型生成失败');
        throw error;
      }
    }

    const statistics = this.generateStatistics(results, failedApis, Date.now() - startTime);
    this.displayStatistics(statistics);

    return statistics;
  }

  private preprocessApis(apis: APIConfig[]): APIConfig[] {
    return apis.map(api => {
      // 验证并转换名称
      const nameValidation = Validator.validateInterfaceName(api.name);
      if (!nameValidation.isValid) {
        throw new Error(`接口名称验证失败 "${api.name}": ${nameValidation.message}`);
      }

      // 验证 URL
      const urlValidation = Validator.validateUrl(api.url);
      if (!urlValidation.isValid) {
        throw new Error(`URL 验证失败 "${api.url}": ${urlValidation.message}`);
      }

      return {
        ...api,
        name: Formatter.toPascalCase(api.name)
      };
    });
  }

  private async saveTypeFiles(typeResults: Map<string, string>): Promise<void> {
    await FileUtils.ensureDir(this.options.output);

    const savePromises = Array.from(typeResults.entries()).map(async ([name, content]) => {
      const filePath = FileUtils.joinPath(this.options.output, `${name}.ts`);
      await FileUtils.writeFile(filePath, content);
      EnhancedLogger.success(`类型文件已生成: ${filePath}`, '📄');
    });

    await Promise.all(savePromises);
  }

  private async generateAuxiliaryFiles(names: string[]): Promise<void> {
    const outputDir = this.options.output;

    // 生成索引文件
    const indexContent = this.templateManager.generateIndexFile(names);
    await FileUtils.writeFile(FileUtils.joinPath(outputDir, 'index.ts'), indexContent);
    EnhancedLogger.success('索引文件已生成', '📇');

    // 生成使用示例
    const usageContent = this.templateManager.generateUsageExample(names);
    await FileUtils.writeFile(FileUtils.joinPath(outputDir, 'usage-example.ts'), usageContent);
    EnhancedLogger.success('使用示例已生成', '📖');
  }

  private generateStatistics(
    results: GenerationResult[],
    errors: string[],
    duration: number
  ): GenerationStatistics {
    const successful = results.filter(r => r.success).length;
    const failed = results.length - successful;

    return {
      total: results.length,
      successful,
      failed,
      errors,
      outputDir: FileUtils.resolvePath(this.options.output)
    };
  }

  private displayStatistics(stats: GenerationStatistics): void {
    console.log('\n');
    EnhancedLogger.section('生成统计');

    if (stats.successful > 0) {
      EnhancedLogger.success(`成功生成: ${stats.successful} 个类型文件`, '🎉');
    }

    if (stats.failed > 0) {
      EnhancedLogger.error(`生成失败: ${stats.failed} 个接口`, '💥');

      if (stats.errors.length > 0) {
        console.log('\n失败详情:');
        stats.errors.forEach(error => EnhancedLogger.error(`  • ${error}`));
      }
    }

    if (stats.successful > 0) {
      console.log('\n🎯 下一步操作:');
      EnhancedLogger.info(`1. 查看生成的文件: ls -la ${stats.outputDir}`);
      EnhancedLogger.info(`2. 导入类型: import { YourType } from '${stats.outputDir}'`);
      EnhancedLogger.info(`3. 查看使用示例: cat ${stats.outputDir}/usage-example.ts`);

      console.log('\n✨ 类型生成完成！');
    }
  }

  // 公共方法供 CLI 使用
  validateInterfaceName(input: string): boolean | string {
    const result = Validator.validateInterfaceName(input);
    return result.isValid ? true : result.message!;
  }

  toPascalCase(input: string): string {
    return Formatter.toPascalCase(input);
  }
}

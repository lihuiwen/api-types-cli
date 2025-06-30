import { ConfigGenerator } from '../../core/config-generator.js';
import { FileUtils } from '../../utils/file-utils.js';
import { EnhancedLogger } from '../../utils/logger.js';

export async function handleInitCommand(options: { format: 'json' | 'yaml' }): Promise<void> {
  try {
    const configGenerator = new ConfigGenerator({ format: options.format });
    const filename = await configGenerator.generateExample(options.format);

    EnhancedLogger.success(`示例配置文件已创建: ${filename}`);
    console.log('\n🚀 编辑配置文件后运行:');
    EnhancedLogger.info(`api-types generate --config ${filename}`);

    // 显示配置文件内容预览
    const content = await FileUtils.readFile(filename);
    console.log('\n📄 配置文件预览:');
    EnhancedLogger.info('─'.repeat(40));
    console.log(content.split('\n').slice(0, 10).join('\n') + '...');
    EnhancedLogger.info('─'.repeat(40));

  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    EnhancedLogger.error(`初始化失败: ${message}`);
    process.exit(1);
  }
}
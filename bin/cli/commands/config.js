import { ConfigGenerator } from '../../core/config-generator.js';
import { EnhancedLogger } from '../../utils/logger.js';
export async function handleConfigCommand() {
    try {
        const configGenerator = new ConfigGenerator();
        await configGenerator.generate();
    }
    catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        EnhancedLogger.error(`配置生成失败: ${message}`);
        process.exit(1);
    }
}

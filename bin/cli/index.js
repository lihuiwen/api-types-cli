import { Command } from 'commander';
import { DEFAULT_OPTIONS, SUPPORTED_FORMATS } from '../utils/constants.js';
import { EnhancedLogger } from '../utils/logger.js';
import { handleConfigCommand } from './commands/config.js';
import { handleGenerateCommand } from './commands/generate.js';
import { handleInitCommand } from './commands/init.js';
import { createHelpHeader, customHelpFormatter } from './utils/help-formatter.js';
// CLI 程序
const program = new Command();
// 设置自定义帮助
program.configureHelp({
    formatHelp: customHelpFormatter
});
program
    .name('api-types')
    .description('🚀 API 接口 TypeScript 类型生成器')
    .version('1.0.0')
    .hook('preAction', (thisCommand) => {
    // 在任何命令执行前显示 banner（除了 help 命令）
    if (!process.argv.includes('--help') && !process.argv.includes('-h')) {
        EnhancedLogger.banner();
    }
});
// generate 命令
program
    .command('generate')
    .alias('gen')
    .description('生成 API 类型文件')
    .option('-o, --output <dir>', '输出目录', DEFAULT_OPTIONS.output)
    .option('-c, --config <file>', '配置文件路径')
    .option('-r, --runtime', '生成运行时类型检查', DEFAULT_OPTIONS.runtime)
    .option('-f, --format <format>', `输出格式 (${SUPPORTED_FORMATS.join('|')})`, DEFAULT_OPTIONS.format)
    .option('-p, --parallel <num>', '并行处理数量', DEFAULT_OPTIONS.parallel.toString())
    .option('-t, --timeout <seconds>', '请求超时时间(秒)', DEFAULT_OPTIONS.timeout.toString())
    .option('--retries <num>', '重试次数', DEFAULT_OPTIONS.retries.toString())
    .option('-q, --quiet', '静默模式', DEFAULT_OPTIONS.quiet)
    .option('-w, --watch', '监听模式', DEFAULT_OPTIONS.watch)
    .configureHelp({
    formatHelp: () => {
        createHelpHeader();
        const lines = [];
        lines.push('\n🔧 generate 命令选项:');
        lines.push('');
        lines.push('  -o, --output <dir>       输出目录 (默认: ./types)');
        lines.push('  -c, --config <file>      配置文件路径');
        lines.push('  -r, --runtime            生成运行时类型检查');
        lines.push(`  -f, --format <format>    输出格式 (${SUPPORTED_FORMATS.join('|')}, 默认: typescript)`);
        lines.push('  -p, --parallel <num>     并行处理数量 (默认: 3)');
        lines.push('  -t, --timeout <seconds>  请求超时时间 (默认: 30秒)');
        lines.push('  --retries <num>          重试次数 (默认: 2)');
        lines.push('  -q, --quiet              静默模式');
        lines.push('  -w, --watch              监听模式');
        lines.push('\n🎯 支持的格式:');
        lines.push('  • typescript             标准 TypeScript 接口');
        lines.push('  • typescript-zod         TypeScript + Zod 验证');
        lines.push('  • typescript-effect-schema TypeScript + Effect Schema');
        return lines.join('\n');
    }
})
    .action(handleGenerateCommand);
// config 命令
program
    .command('config')
    .description('交互式生成配置文件')
    .action(handleConfigCommand);
// init 命令
program
    .command('init')
    .description('初始化示例配置文件')
    .option('-f, --format <format>', '配置格式 (json|yaml)', 'json')
    .action(handleInitCommand);
// 错误处理
process.on('uncaughtException', (error) => {
    EnhancedLogger.error(`未捕获的异常: ${error.message}`, '💥');
    process.exit(1);
});
process.on('unhandledRejection', (reason) => {
    EnhancedLogger.error(`未处理的 Promise 拒绝: ${reason}`, '💥');
    process.exit(1);
});
// 启动 CLI
function isMainModule() {
    if (process.env.NODE_ENV === 'test')
        return false;
    const arg1 = process.argv[1];
    if (!arg1)
        return false;
    return arg1.includes('index') || arg1.endsWith('index.js') || arg1.endsWith('index.ts');
}
if (isMainModule()) {
    program.parse();
}
export { program };

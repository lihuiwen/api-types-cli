import chalk from 'chalk';
import { Command } from 'commander';
import figlet from 'figlet';
import gradient from 'gradient-string';

const gradientThemes = {
  primary: gradient(['#FF6B6B', '#4ECDC4', '#45B7D1']),
  success: gradient(['#11998e', '#38ef7d']),
  warning: gradient(['#f093fb', '#f5576c']),
  error: gradient(['#ff9a9e', '#fecfef']),
  info: gradient(['#667eea', '#764ba2']),
  comment: chalk.gray
};

export function createHelpHeader(): void {
  const helpBanner = figlet.textSync('HELP', {
    font: 'Small',
    horizontalLayout: 'fitted'
  });

  console.log('\n' + gradientThemes.primary(helpBanner));
  console.log(gradientThemes.info('✨ 命令使用指南 ✨'));
  console.log(gradientThemes.info('━'.repeat(40)));
}

export function customHelpFormatter(cmd: Command): string {
  createHelpHeader();

  const lines = [];

  // 基本用法
  lines.push(gradientThemes.primary('\n💡 基本用法:'));
  lines.push(`  ${gradientThemes.info('api-types <command> [options]')}`);

  // 可用命令
  lines.push(gradientThemes.primary('\n📋 可用命令:'));
  lines.push(`  ${gradientThemes.success('generate, gen')}   生成 API 类型文件`);
  lines.push(`  ${gradientThemes.success('config')}          交互式生成配置文件`);
  lines.push(`  ${gradientThemes.success('init')}            初始化示例配置文件`);
  lines.push(`  ${gradientThemes.success('help [command]')}  显示命令帮助`);

  // 选项
  lines.push(gradientThemes.primary('\n⚙️  选项:'));
  lines.push(`  ${gradientThemes.info('-V, --version')}      显示版本号`);
  lines.push(`  ${gradientThemes.info('-h, --help')}         显示帮助信息`);

  // 示例
  lines.push(gradientThemes.primary('\n🌟 使用示例:'));
  lines.push(`  ${gradientThemes.primary('# 生成单个接口类型')}`);
  lines.push(`  ${gradientThemes.info('api-types generate')}`);
  lines.push('');
  lines.push(`  ${gradientThemes.primary('# 使用配置文件批量生成')}`);
  lines.push(`  ${gradientThemes.info('api-types generate --config api-config.json')}`);
  lines.push('');
  lines.push(`  ${gradientThemes.primary('# 创建配置文件')}`);
  lines.push(`  ${gradientThemes.info('api-types config')}`);
  lines.push('');
  lines.push(`  ${gradientThemes.primary('# 初始化示例配置')}`);
  lines.push(`  ${gradientThemes.info('api-types init --format yaml')}`);

  // 更多信息
  lines.push(gradientThemes.primary('\n📚 更多信息:'));
  lines.push(`  ${gradientThemes.info('使用')} ${gradientThemes.warning('api-types <command> --help')} ${gradientThemes.info('查看具体命令的帮助')}`);

  lines.push('\n' + gradientThemes.primary('━'.repeat(60)));

  return lines.join('\n');
}
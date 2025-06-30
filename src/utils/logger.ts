import chalk from 'chalk';
import figlet from 'figlet';
import gradient from 'gradient-string';
import { LogLevel, LoggerOptions } from '../types/common.js';

export class EnhancedLogger {
  private static options: LoggerOptions = {
    quiet: false,
    useColors: true
  };

  private static gradientThemes = {
    primary: gradient(['#FF6B6B', '#4ECDC4', '#45B7D1']),
    success: gradient(['#11998e', '#38ef7d']),
    warning: gradient(['#f093fb', '#f5576c']),
    error: gradient(['#ff9a9e', '#fecfef']),
    info: gradient(['#667eea', '#764ba2']),
    comment: chalk.gray
  };

  static configure(options: LoggerOptions): void {
    this.options = { ...this.options, ...options };
  }

  static banner(): void {
    if (this.options.quiet) return;

    const banner = figlet.textSync('API-TYPES', {
      font: 'ANSI Shadow',
      horizontalLayout: 'fitted',
      verticalLayout: 'fitted'
    });

    console.log('\n' + this.gradientThemes.primary(banner));
    console.log(this.gradientThemes.info('🚀 API接口TypeScript类型生成器 v1.0.0'));
    console.log(this.gradientThemes.info('━'.repeat(60)));
    console.log();
  }

  static helpHeader(): void {
    if (this.options.quiet) return;

    const helpBanner = figlet.textSync('HELP', {
      font: 'Small',
      horizontalLayout: 'fitted'
    });

    console.log('\n' + this.gradientThemes.primary(helpBanner));
    console.log(this.gradientThemes.info('✨ 命令使用指南 ✨'));
    console.log(this.gradientThemes.info('━'.repeat(40)));
  }

  static log(level: LogLevel, message: string, icon?: string): void {
    if (this.options.quiet) return;

    const logMethod = {
      info: () => console.log(`${icon || 'ℹ️'} ${this.gradientThemes.info(message)}`),
      success: () => console.log(`${icon || '✅'} ${this.gradientThemes.success(message)}`),
      warning: () => console.log(`${icon || '⚠️'} ${this.gradientThemes.warning(message)}`),
      error: () => console.log(`${icon || '❌'} ${this.gradientThemes.error(message)}`)
    };

    logMethod[level]();
  }

  static success(message: string, icon = '✅'): void {
    this.log('success', message, icon);
  }

  static error(message: string, icon = '❌'): void {
    this.log('error', message, icon);
  }

  static warning(message: string, icon = '⚠️'): void {
    this.log('warning', message, icon);
  }

  static info(message: string, icon = 'ℹ️'): void {
    this.log('info', message, icon);
  }

  static comment(message: string): void {
    if (!this.options.quiet) {
      console.log(this.gradientThemes.comment(message));
    }
  }

  static section(title: string): void {
    if (!this.options.quiet) {
      console.log('\n' + this.gradientThemes.primary(`📋 ${title}`));
      console.log(this.gradientThemes.primary('─'.repeat(title.length + 4)));
    }
  }

  static step(step: number, total: number, message: string): void {
    if (!this.options.quiet) {
      const progress = `[${step}/${total}]`;
      console.log(`${this.gradientThemes.info(progress)} ${message}`);
    }
  }
}
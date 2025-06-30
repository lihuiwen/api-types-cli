import fs from 'fs-extra';
import yaml from 'js-yaml';
import path from 'path';
import { APIConfig } from '../types/config.js';

export class FileUtils {
  static async ensureDir(dirPath: string): Promise<void> {
    await fs.ensureDir(path.resolve(dirPath));
  }

  static async writeFile(filePath: string, content: string): Promise<void> {
    await fs.writeFile(path.resolve(filePath), content, 'utf8');
  }

  static async readFile(filePath: string): Promise<string> {
    return await fs.readFile(path.resolve(filePath), 'utf8');
  }

  static async pathExists(filePath: string): Promise<boolean> {
    return await fs.pathExists(path.resolve(filePath));
  }

  static async loadConfig(configPath: string): Promise<APIConfig[]> {
    const resolvedPath = path.resolve(configPath);

    if (!await this.pathExists(resolvedPath)) {
      throw new Error(`配置文件不存在: ${resolvedPath}`);
    }

    const content = await this.readFile(resolvedPath);

    try {
      if (configPath.endsWith('.yaml') || configPath.endsWith('.yml')) {
        return yaml.load(content) as APIConfig[];
      } else {
        return JSON.parse(content);
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      throw new Error(`配置文件解析失败: ${message}`);
    }
  }

  static async saveConfig(config: APIConfig[], filePath: string): Promise<void> {
    const content = filePath.endsWith('.yaml') || filePath.endsWith('.yml')
      ? yaml.dump(config)
      : JSON.stringify(config, null, 2);

    await this.writeFile(filePath, content);
  }

  static getFileExtension(filePath: string): string {
    return path.extname(filePath).toLowerCase();
  }

  static joinPath(...paths: string[]): string {
    return path.join(...paths);
  }

  static resolvePath(filePath: string): string {
    return path.resolve(filePath);
  }
}
import fs from 'fs-extra';
import yaml from 'js-yaml';
import path from 'path';
export class FileUtils {
    static async ensureDir(dirPath) {
        await fs.ensureDir(path.resolve(dirPath));
    }
    static async writeFile(filePath, content) {
        await fs.writeFile(path.resolve(filePath), content, 'utf8');
    }
    static async readFile(filePath) {
        return await fs.readFile(path.resolve(filePath), 'utf8');
    }
    static async pathExists(filePath) {
        return await fs.pathExists(path.resolve(filePath));
    }
    static async loadConfig(configPath) {
        const resolvedPath = path.resolve(configPath);
        if (!await this.pathExists(resolvedPath)) {
            throw new Error(`配置文件不存在: ${resolvedPath}`);
        }
        const content = await this.readFile(resolvedPath);
        try {
            if (configPath.endsWith('.yaml') || configPath.endsWith('.yml')) {
                return yaml.load(content);
            }
            else {
                return JSON.parse(content);
            }
        }
        catch (error) {
            const message = error instanceof Error ? error.message : String(error);
            throw new Error(`配置文件解析失败: ${message}`);
        }
    }
    static async saveConfig(config, filePath) {
        const content = filePath.endsWith('.yaml') || filePath.endsWith('.yml')
            ? yaml.dump(config)
            : JSON.stringify(config, null, 2);
        await this.writeFile(filePath, content);
    }
    static getFileExtension(filePath) {
        return path.extname(filePath).toLowerCase();
    }
    static joinPath(...paths) {
        return path.join(...paths);
    }
    static resolvePath(filePath) {
        return path.resolve(filePath);
    }
}

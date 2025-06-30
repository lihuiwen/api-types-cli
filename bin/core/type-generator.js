import { InputData, jsonInputForTargetLanguage, quicktype } from 'quicktype-core';
export class TypeGenerator {
    async generateTypeScript(name, jsonData, options) {
        // 确保格式是 QuickType 支持的类型
        const format = this.validateAndNormalizeFormat(options.format);
        const jsonInput = jsonInputForTargetLanguage(format);
        await jsonInput.addSource({ name, samples: [jsonData] });
        const inputData = new InputData();
        inputData.addInput(jsonInput);
        const rendererOptions = {};
        if (options.runtime) {
            rendererOptions['runtime-typecheck'] = 'true';
        }
        const result = await quicktype({
            inputData,
            lang: format,
            rendererOptions
        });
        return result.lines.join('\n');
    }
    validateAndNormalizeFormat(format) {
        // 支持的格式映射
        const formatMap = {
            'typescript': 'typescript',
            'ts': 'typescript',
            'typescript-zod': 'typescript-zod',
            'zod': 'typescript-zod',
            'typescript-effect-schema': 'typescript-effect-schema',
            'effect': 'typescript-effect-schema',
            'effect-schema': 'typescript-effect-schema'
        };
        const normalizedFormat = formatMap[format.toLowerCase()];
        if (!normalizedFormat) {
            throw new Error(`不支持的格式: ${format}。支持的格式: ${Object.keys(formatMap).join(', ')}`);
        }
        return normalizedFormat;
    }
    async batchGenerate(dataMap, options) {
        const results = new Map();
        for (const [name, jsonData] of dataMap) {
            try {
                const tsContent = await this.generateTypeScript(name, jsonData, options);
                results.set(name, tsContent);
            }
            catch (error) {
                const message = error instanceof Error ? error.message : String(error);
                throw new Error(`生成 ${name} 类型失败: ${message}`);
            }
        }
        return results;
    }
}

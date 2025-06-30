import { COMMON_ABBREVIATIONS } from './constants.js';
export class Formatter {
    static toPascalCase(input) {
        return input
            .trim()
            .replace(/[-\s.]+/g, '_')
            .replace(/[^a-zA-Z0-9_]/g, '')
            .split('_')
            .filter(part => part.length > 0)
            .map(part => {
            const lowerPart = part.toLowerCase();
            if (COMMON_ABBREVIATIONS[lowerPart]) {
                return COMMON_ABBREVIATIONS[lowerPart];
            }
            return part.charAt(0).toUpperCase() + part.slice(1).toLowerCase();
        })
            .join('');
    }
    static chunkArray(array, size) {
        const chunks = [];
        for (let i = 0; i < array.length; i += size) {
            chunks.push(array.slice(i, i + size));
        }
        return chunks;
    }
    static formatDuration(ms) {
        if (ms < 1000)
            return `${ms}ms`;
        if (ms < 60000)
            return `${(ms / 1000).toFixed(1)}s`;
        return `${(ms / 60000).toFixed(1)}m`;
    }
    static formatFileSize(bytes) {
        const units = ['B', 'KB', 'MB', 'GB'];
        let size = bytes;
        let unitIndex = 0;
        while (size >= 1024 && unitIndex < units.length - 1) {
            size /= 1024;
            unitIndex++;
        }
        return `${size.toFixed(1)}${units[unitIndex]}`;
    }
}

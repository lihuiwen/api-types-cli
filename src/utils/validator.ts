import { ValidationResult } from '../types/common.js';
import { TYPESCRIPT_KEYWORDS } from './constants.js';

export class Validator {
  static validateInterfaceName(input: string): ValidationResult {
    const trimmed = input.trim();

    if (!trimmed) {
      return { isValid: false, message: '请输入接口名称' };
    }

    if (trimmed.length > 100) {
      return { isValid: false, message: '接口名称不能超过100个字符' };
    }

    if (!/^[a-zA-Z_][a-zA-Z0-9_\-]*$/.test(trimmed)) {
      return {
        isValid: false,
        message: '接口名称只能包含字母、数字、下划线和连字符，且必须以字母或下划线开头'
      };
    }

    if (TYPESCRIPT_KEYWORDS.includes(trimmed.toLowerCase() as any)) {
      return { isValid: false, message: '接口名称不能使用 TypeScript 关键字' };
    }

    return { isValid: true };
  }

  static validateUrl(input: string): ValidationResult {
    try {
      new URL(input);
      return { isValid: true };
    } catch {
      return { isValid: false, message: '请输入有效的 URL' };
    }
  }

  static validateTimeout(timeout: number): ValidationResult {
    if (timeout < 1 || timeout > 300) {
      return { isValid: false, message: '超时时间必须在 1-300 秒之间' };
    }
    return { isValid: true };
  }

  static validateParallel(parallel: number): ValidationResult {
    if (parallel < 1 || parallel > 10) {
      return { isValid: false, message: '并行数量必须在 1-10 之间' };
    }
    return { isValid: true };
  }
}
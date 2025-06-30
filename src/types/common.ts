export type LogLevel = 'info' | 'success' | 'warning' | 'error';

export interface LoggerOptions {
  quiet?: boolean;
  useColors?: boolean;
}

export interface ValidationResult {
  isValid: boolean;
  message?: string;
}

export interface FileTemplate {
  filename: string;
  content: string;
}
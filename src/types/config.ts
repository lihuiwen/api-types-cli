export interface APIConfig {
  name: string;
  url: string;
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE';
  headers?: Record<string, string>;
  body?: any;
  sampleOnly?: boolean;
  timeout?: number;
}

export interface GenerateOptions {
  output: string;
  runtime: boolean;
  format: SupportedFormat;
  config?: string;
  parallel: number;
  timeout: number;
  retries: number;
  quiet: boolean;
  watch: boolean;
}

export interface ConfigGeneratorOptions {
  format: 'json' | 'yaml';
  outputPath?: string;
}

// 支持的输出格式
export type SupportedFormat = 'typescript' | 'typescript-zod' | 'typescript-effect-schema';

// src/types/generator.ts
export interface GenerationResult {
  success: boolean;
  name: string;
  error?: string;
  filePath?: string;
}

export interface GenerationStatistics {
  total: number;
  successful: number;
  failed: number;
  errors: string[];
  outputDir: string;
}

export interface TypeGenerationOptions {
  format: string;
  runtime: boolean;
}
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
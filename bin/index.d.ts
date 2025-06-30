#!/usr/bin/env node
interface APIConfig {
    name: string;
    url: string;
    method?: 'GET' | 'POST' | 'PUT' | 'DELETE';
    headers?: Record<string, string>;
    body?: any;
    sampleOnly?: boolean;
    timeout?: number;
}
interface GenerateOptions {
    output: string;
    runtime: boolean;
    format: 'typescript' | 'typescript-zod' | 'typescript-effect-schema';
    config?: string;
    parallel: number;
    timeout: number;
    retries: number;
    quiet: boolean;
    watch: boolean;
}
declare class ApiTypesGenerator {
    private options;
    private spinner;
    constructor(options: GenerateOptions);
    private log;
    private fetchApiData;
    private generateTypeScript;
    private saveTypeFile;
    private generateIndexFile;
    private generateUsageExample;
    generateFromConfig(configPath: string): Promise<void>;
    generateFromApis(apis: APIConfig[]): Promise<void>;
    private chunkArray;
    private showStatistics;
}
declare class ConfigGenerator {
    generate(): Promise<void>;
}
export { ApiTypesGenerator, ConfigGenerator };
//# sourceMappingURL=index.d.ts.map
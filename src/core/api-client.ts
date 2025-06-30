import axios, { AxiosResponse } from 'axios';
import { APIConfig } from '../types/config.js';

export class ApiClient {
  private timeout: number;

  constructor(timeout: number = 30000) {
    this.timeout = timeout;
  }

  async fetchApiData(config: APIConfig): Promise<string> {
    const { name, url, method = 'GET', headers = {}, body, timeout } = config;

    try {
      const response: AxiosResponse = await axios({
        method,
        url,
        headers: {
          'User-Agent': 'api-types-cli/1.0.0',
          ...headers
        },
        data: body,
        timeout: (timeout || this.timeout) * 1000,
        validateStatus: () => true
      });

      if (response.status >= 400) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      let data = response.data;

      // 处理数组采样
      if (config.sampleOnly && Array.isArray(data) && data.length > 3) {
        data = data.slice(0, 3);
      }

      return JSON.stringify(data, null, 2);
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`${name} 数据获取失败: ${error.message}`);
      }
      throw error;
    }
  }

  async batchFetch(configs: APIConfig[], concurrency: number = 3): Promise<Array<{
    config: APIConfig;
    data?: string;
    error?: string;
  }>> {
    const results: Array<{
      config: APIConfig;
      data?: string;
      error?: string;
    }> = [];

    // 分批处理
    for (let i = 0; i < configs.length; i += concurrency) {
      const batch = configs.slice(i, i + concurrency);

      const batchPromises = batch.map(async (config) => {
        try {
          const data = await this.fetchApiData(config);
          return { config, data };
        } catch (error) {
          const message = error instanceof Error ? error.message : String(error);
          return { config, error: message };
        }
      });

      const batchResults = await Promise.allSettled(batchPromises);

      batchResults.forEach((result) => {
        if (result.status === 'fulfilled') {
          results.push(result.value);
        } else {
          results.push({
            config: batch[results.length % batch.length],
            error: result.reason.message || 'Unknown error'
          });
        }
      });
    }

    return results;
  }
}
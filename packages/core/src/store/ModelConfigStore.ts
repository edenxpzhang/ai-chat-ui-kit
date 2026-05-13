/**
 * @generated-by AI: edenxpzhang
 * @generated-date 2026-05-13
 */

import { BaseStore } from './base.js';
import { ModelConfig } from '../types/index.js';

// 初始状态
const initialConfig: ModelConfig = {
  provider: 'openai',
  model: 'gpt-3.5-turbo',
  params: {
    temperature: 0.7,
    topP: 1,
    maxTokens: 2048
  }
};

export class ModelConfigStore extends BaseStore<ModelConfig> {
  constructor() {
    super({ ...initialConfig });
  }

  // 设置提供商
  setProvider(provider: ModelConfig['provider']): void {
    this.setState({ provider });
    // 根据提供商自动设置默认端点
    this.setDefaultEndpoint(provider);
  }

  // 设置模型
  setModel(model: string): void {
    this.setState({ model });
  }

  // 设置 API 端点
  setApiEndpoint(endpoint: string): void {
    this.setState({ apiEndpoint: endpoint });
  }

  // 设置 API Key
  setApiKey(apiKey: string): void {
    this.setState({ apiKey });
  }

  // 设置请求头
  setHeaders(headers: Record<string, string>): void {
    this.setState({ headers: { ...this.state.headers, ...headers } });
  }

  // 设置参数
  setParams(params: ModelConfig['params']): void {
    this.setState({ 
      params: { ...this.state.params, ...params } 
    });
  }

  // 根据提供商设置默认端点
  private setDefaultEndpoint(provider: ModelConfig['provider']): void {
    const endpoints: Record<string, string> = {
      openai: 'https://api.openai.com/v1/chat/completions',
      ernie: 'https://aip.baidubce.com/rpc/2.0/ai_custom/v1/wenxinworkshop/chat',
      qwen: 'https://dashscope.aliyuncs.com/api/v1/services/aigc/text-generation/generation',
      spark: 'https://spark-api.xf-yun.com/v1/chat/completions',
      hunyuan: 'https://hunyuan.tencentcloudapi.com/'
    };

    if (provider !== 'custom' && endpoints[provider]) {
      this.setState({ apiEndpoint: endpoints[provider] });
    }
  }

  // 获取请求头（根据提供商）
  getRequestHeaders(): Record<string, string> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...this.state.headers
    };

    // 根据提供商添加认证头
    switch (this.state.provider) {
      case 'openai':
        if (this.state.apiKey) {
          headers['Authorization'] = `Bearer ${this.state.apiKey}`;
        }
        break;
      case 'qwen':
        if (this.state.apiKey) {
          headers['Authorization'] = `Bearer ${this.state.apiKey}`;
        }
        break;
      // 其他提供商的认证方式
    }

    return headers;
  }

  // 验证配置
  validate(): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!this.state.model) {
      errors.push('Model is required');
    }

    if (this.state.provider !== 'custom' && !this.state.apiEndpoint) {
      errors.push('API endpoint is required');
    }

    return {
      valid: errors.length === 0,
      errors
    };
  }

  // 重置
  reset(): void {
    this.setState({ ...initialConfig });
  }

  // 导出配置
  exportConfig(): string {
    return JSON.stringify(this.state);
  }

  // 导入配置
  importConfig(data: string): void {
    try {
      const config = JSON.parse(data);
      this.setState(config);
    } catch (error) {
      console.error('Failed to import config:', error);
    }
  }
}

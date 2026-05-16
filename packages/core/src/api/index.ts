
import { APIAdapter, ModelConfig } from '../types/index.js';
import { OpenAIAdapter } from './adapters.js';
import { ERNIEAdapter } from './adapters.js';
import { QwenAdapter } from './adapters.js';
import { SparkAdapter } from './adapters.js';
import { HunyuanAdapter } from './adapters.js';

/**
 * 创建 API 适配器
 * @param provider 模型提供商
 * @returns 对应的 API 适配器实例
 */
export function createAPIAdapter(provider: ModelConfig['provider']): APIAdapter {
  switch (provider) {
    case 'openai':
      return new OpenAIAdapter();
    
    case 'ernie':
      return new ERNIEAdapter();
    
    case 'qwen':
      return new QwenAdapter();
    
    case 'spark':
      return new SparkAdapter();
    
    case 'hunyuan':
      return new HunyuanAdapter();
    
    case 'custom':
      // 自定义提供商默认使用 OpenAI 兼容格式
      console.warn('Custom provider using OpenAI-compatible format by default');
      return new OpenAIAdapter();
    
    default:
      throw new Error(`Unsupported provider: ${provider}`);
  }
}

/**
 * 适配器类导出（供需要直接实例化的场景使用）
 */
export {
  OpenAIAdapter,
  ERNIEAdapter,
  QwenAdapter,
  SparkAdapter,
  HunyuanAdapter
};

# API 适配器

API 适配器允许您将 AI Chat UI Kit 连接到不同的后端 API，无论它们使用何种数据格式。

## 为什么需要 API 适配器？

不同的 AI 服务有不同的 API 格式：

- **OpenAI API**: `{ messages: [{ role: 'user', content: '...' }] }`
- **Claude API**: `{ messages: [{ role: 'user', content: '...' }], model: '...' }`
- **自定义 API**: 可能有完全不同的格式

API 适配器的作用是将您的后端 API 格式转换为 AI Chat UI Kit 期望的格式。

## 适配器接口

### 基本结构

```typescript
interface APIAdapter {
  // 发送消息
  sendMessage(request: ChatRequest): Promise<ChatResponse>;

  // 流式发送消息（可选）
  sendMessageStream?(request: ChatRequest, onChunk: (chunk: string) => void): Promise<void>;

  // 获取消息历史（可选）
  getHistory?(): Promise<Message[]>;

  // 清除历史（可选）
  clearHistory?(): Promise<void>;
}

interface ChatRequest {
  message: string;
  history?: Message[];
  model?: string;
  temperature?: number;
  maxTokens?: number;
  [key: string]: any; // 其他自定义参数
}

interface ChatResponse {
  content: string;
  role: 'assistant';
  usage?: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
  [key: string]: any; // 其他自定义字段
}
```

## 创建适配器

### 示例 1：OpenAI API 适配器

```typescript
// adapters/openai.ts
import { APIAdapter, ChatRequest, ChatResponse } from '@ai-chat/core';

export class OpenAIAdapter implements APIAdapter {
  private apiKey: string;
  private model: string;
  private baseURL: string;

  constructor(config: { apiKey: string; model?: string; baseURL?: string }) {
    this.apiKey = config.apiKey;
    this.model = config.model || 'gpt-3.5-turbo';
    this.baseURL = config.baseURL || 'https://api.openai.com/v1';
  }

  async sendMessage(request: ChatRequest): Promise<ChatResponse> {
    const response = await fetch(`${this.baseURL}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.apiKey}`,
      },
      body: JSON.stringify({
        model: request.model || this.model,
        messages: [
          ...(request.history || []).map(msg => ({
            role: msg.role,
            content: msg.content,
          })),
          { role: 'user', content: request.message },
        ],
        temperature: request.temperature,
        max_tokens: request.maxTokens,
      }),
    });

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.statusText}`);
    }

    const data = await response.json();

    return {
      content: data.choices[0].message.content,
      role: 'assistant',
      usage: {
        promptTokens: data.usage.prompt_tokens,
        completionTokens: data.usage.completion_tokens,
        totalTokens: data.usage.total_tokens,
      },
    };
  }

  async sendMessageStream(
    request: ChatRequest,
    onChunk: (chunk: string) => void
  ): Promise<void> {
    const response = await fetch(`${this.baseURL}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.apiKey}`,
      },
      body: JSON.stringify({
        model: request.model || this.model,
        messages: [
          ...(request.history || []).map(msg => ({
            role: msg.role,
            content: msg.content,
          })),
          { role: 'user', content: request.message },
        ],
        stream: true,
      }),
    });

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.statusText}`);
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder();

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      const chunk = decoder.decode(value);
      const lines = chunk.split('\n').filter(line => line.trim() !== '');

      for (const line of lines) {
        if (line.startsWith('data: ')) {
          const data = JSON.parse(line.slice(6));
          if (data.choices && data.choices[0].delta.content) {
            onChunk(data.choices[0].delta.content);
          }
        }
      }
    }
  }
}
```

### 示例 2：Claude API 适配器

```typescript
// adapters/claude.ts
import { APIAdapter, ChatRequest, ChatResponse } from '@ai-chat/core';

export class ClaudeAdapter implements APIAdapter {
  private apiKey: string;
  private model: string;
  private baseURL: string;

  constructor(config: { apiKey: string; model?: string; baseURL?: string }) {
    this.apiKey = config.apiKey;
    this.model = config.model || 'claude-3-opus-20240229';
    this.baseURL = config.baseURL || 'https://api.anthropic.com/v1';
  }

  async sendMessage(request: ChatRequest): Promise<ChatResponse> {
    const response = await fetch(`${this.baseURL}/messages`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': this.apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: this.model,
        messages: [
          ...(request.history || []).map(msg => ({
            role: msg.role === 'assistant' ? 'assistant' : 'user',
            content: msg.content,
          })),
          { role: 'user', content: request.message },
        ],
        max_tokens: request.maxTokens || 4096,
      }),
    });

    if (!response.ok) {
      throw new Error(`Claude API error: ${response.statusText}`);
    }

    const data = await response.json();

    return {
      content: data.content[0].text,
      role: 'assistant',
      usage: {
        promptTokens: data.usage.input_tokens,
        completionTokens: data.usage.output_tokens,
        totalTokens: data.usage.input_tokens + data.usage.output_tokens,
      },
    };
  }
}
```

### 示例 3：自定义 API 适配器

```typescript
// adapters/custom.ts
import { APIAdapter, ChatRequest, ChatResponse } from '@ai-chat/core';

export class CustomAPIAdapter implements APIAdapter {
  private baseURL: string;
  private token: string;

  constructor(config: { baseURL: string; token: string }) {
    this.baseURL = config.baseURL;
    this.token = config.token;
  }

  async sendMessage(request: ChatRequest): Promise<ChatResponse> {
    const response = await fetch(`${this.baseURL}/api/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.token}`,
      },
      body: JSON.stringify({
        prompt: request.message, // 自定义字段名
        // 转换格式
      }),
    });

    if (!response.ok) {
      throw new Error(`Custom API error: ${response.statusText}`);
    }

    const data = await response.json();

    // 转换为标准格式
    return {
      content: data.reply, // 自定义字段名
      role: 'assistant',
    };
  }
}
```

## 使用适配器

### 在 Core 中使用

```typescript
// store.ts
import { createChatStore } from '@ai-chat/core';
import { OpenAIAdapter } from './adapters/openai';

// 创建适配器实例
const adapter = new OpenAIAdapter({
  apiKey: process.env.OPENAI_API_KEY,
  model: 'gpt-4',
});

// 创建 store
export const chatStore = createChatStore({
  async onMessage(message: string) {
    const response = await adapter.sendMessage({
      message,
      history: chatStore.getMessages(),
    });
    return response.content;
  },
});
```

### 在 Components 中使用

```typescript
// main.ts
import '@ai-chat/components';
import '@ai-chat/themes/default';
import { OpenAIAdapter } from './adapters/openai';

const adapter = new OpenAIAdapter({
  apiKey: process.env.OPENAI_API_KEY,
});

const chat = document.querySelector('ai-chat');

chat.setMessageHandler(async (message) => {
  const response = await adapter.sendMessage({
    message,
    history: chat.getMessages(),
  });
  return response.content;
});
```

### 使用流式响应

```typescript
const chat = document.querySelector('ai-chat');

chat.setMessageHandler(async (message) => {
  let fullResponse = '';

  await adapter.sendMessageStream(
    {
      message,
      history: chat.getMessages(),
    },
    (chunk) => {
      fullResponse += chunk;
      // 实时更新 UI
      chat.updateLastMessage(fullResponse);
    }
  );

  return fullResponse;
});
```

## 多模型支持

### 动态切换模型

```typescript
class MultiModelAdapter implements APIAdapter {
  private adapters: Map<string, APIAdapter> = new Map();

  registerModel(name: string, adapter: APIAdapter) {
    this.adapters.set(name, adapter);
  }

  async sendMessage(request: ChatRequest): Promise<ChatResponse> {
    const model = request.model || 'default';
    const adapter = this.adapters.get(model);

    if (!adapter) {
      throw new Error(`Model ${model} not found`);
    }

    return adapter.sendMessage(request);
  }
}

// 使用
const multiAdapter = new MultiModelAdapter();
multiAdapter.registerModel('gpt-4', new OpenAIAdapter({ model: 'gpt-4', /* ... */ }));
multiAdapter.registerModel('claude', new ClaudeAdapter({ /* ... */ }));

// 切换模型
chatStore.sendMessage('Hello', { model: 'gpt-4' });
chatStore.sendMessage('Hello', { model: 'claude' });
```

## 错误处理

```typescript
class ResilientAdapter implements APIAdapter {
  private adapters: APIAdapter[];
  private currentIndex: number = 0;

  constructor(adapters: APIAdapter[]) {
    this.adapters = adapters;
  }

  async sendMessage(request: ChatRequest): Promise<ChatResponse> {
    let lastError: Error | null = null;

    // 尝试所有适配器
    for (let i = 0; i < this.adapters.length; i++) {
      try {
        const adapter = this.adapters[(this.currentIndex + i) % this.adapters.length];
        const response = await adapter.sendMessage(request);
        return response;
      } catch (error) {
        lastError = error as Error;
        console.warn(`Adapter ${i} failed, trying next...`, error);
      }
    }

    throw lastError || new Error('All adapters failed');
  }
}
```

## 缓存适配器

```typescript
class CachedAdapter implements APIAdapter {
  private adapter: APIAdapter;
  private cache: Map<string, ChatResponse> = new Map();

  constructor(adapter: APIAdapter) {
    this.adapter = adapter;
  }

  async sendMessage(request: ChatRequest): Promise<ChatResponse> {
    const cacheKey = JSON.stringify(request);

    if (this.cache.has(cacheKey)) {
      return this.cache.get(cacheKey)!;
    }

    const response = await this.adapter.sendMessage(request);
    this.cache.set(cacheKey, response);

    return response;
  }
}
```

## 下一步

- [插件开发](./plugins.md) - 学习如何扩展功能
- [主题定制](./themes.md) - 学习如何自定义主题
- [API 参考](../../api/) - 查看完整 API 文档

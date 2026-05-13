# 多模型支持示例

本示例将指导您如何切换不同的 AI 模型（如 GPT-4、Claude、本地模型等）。

## 基本思路

通过 API 适配器，您可以轻松切换不同的 AI 模型。

## 示例 1：切换 OpenAI 模型

### 创建多模型适配器

```typescript
// adapters/multi-model.ts
import { APIAdapter, ChatRequest, ChatResponse } from '@ai-chat/core';

export class MultiModelAdapter implements APIAdapter {
  private apiKey: string;
  private baseURL: string;
  private currentModel: string;
  private availableModels: string[];

  constructor(config: { apiKey: string; baseURL?: string }) {
    this.apiKey = config.apiKey;
    this.baseURL = config.baseURL || 'https://api.openai.com/v1';
    this.currentModel = 'gpt-3.5-turbo';
    this.availableModels = [
      'gpt-3.5-turbo',
      'gpt-4',
      'gpt-4-turbo',
      'gpt-4o',
    ];
  }

  // 切换模型
  setModel(model: string): void {
    if (!this.availableModels.includes(model)) {
      throw new Error(`Model ${model} not available`);
    }
    this.currentModel = model;
    console.log(`Switched to model: ${model}`);
  }

  // 获取当前模型
  getModel(): string {
    return this.currentModel;
  }

  // 获取可用模型列表
  getAvailableModels(): string[] {
    return [...this.availableModels];
  }

  async sendMessage(request: ChatRequest): Promise<ChatResponse> {
    const model = request.model || this.currentModel;

    const response = await fetch(`${this.baseURL}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.apiKey}`,
      },
      body: JSON.stringify({
        model,
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
}
```

### 使用多模型适配器

```typescript
// main.ts
import { createChatStore } from '@ai-chat/core';
import { MultiModelAdapter } from './adapters/multi-model';

// 创建适配器实例
const adapter = new MultiModelAdapter({
  apiKey: process.env.OPENAI_API_KEY,
});

// 创建 store
const chatStore = createChatStore({
  async onMessage(message: string) {
    const response = await adapter.sendMessage({
      message,
      history: chatStore.getMessages(),
    });
    return response.content;
  },
});

// 切换模型
adapter.setModel('gpt-4'); // 切换到 GPT-4
adapter.setModel('gpt-3.5-turbo'); // 切换回 GPT-3.5
```

### React 中切换模型

```tsx
// ModelSelector.tsx
import React, { useState } from 'react';
import { MultiModelAdapter } from './adapters/multi-model';

interface ModelSelectorProps {
  adapter: MultiModelAdapter;
}

const ModelSelector: React.FC<ModelSelectorProps> = ({ adapter }) => {
  const [currentModel, setCurrentModel] = useState(adapter.getModel());
  const models = adapter.getAvailableModels();

  const handleModelChange = (model: string) => {
    adapter.setModel(model);
    setCurrentModel(model);
  };

  return (
    <div style={styles.container}>
      <label style={styles.label}>选择模型：</label>
      <select
        style={styles.select}
        value={currentModel}
        onChange={(e) => handleModelChange(e.target.value)}
      >
        {models.map((model) => (
          <option key={model} value={model}>
            {model}
          </option>
        ))}
      </select>
    </div>
  );
};

const styles = {
  container: {
    padding: '8px 16px',
    backgroundColor: '#f5f5f5',
    borderBottom: '1px solid #e8e8e8',
  },
  label: {
    marginRight: '8px',
    fontSize: '14px',
  },
  select: {
    padding: '4px 8px',
    borderRadius: '4px',
    border: '1px solid #d9d9d9',
    fontSize: '14px',
  },
};

export default ModelSelector;
```

```tsx
// ChatApp.tsx
import React, { useEffect, useRef } from 'react';
import '@ai-chat/components';
import '@ai-chat/themes/default';
import { createChatStore } from '@ai-chat/core';
import { MultiModelAdapter } from './adapters/multi-model';
import ModelSelector from './ModelSelector';

const ChatApp: React.FC = () => {
  const chatRef = useRef<HTMLElement>(null);
  const adapterRef = useRef<MultiModelAdapter>();

  useEffect(() => {
    // 创建适配器
    adapterRef.current = new MultiModelAdapter({
      apiKey: process.env.OPENAI_API_KEY,
    });

    if (chatRef.current) {
      (chatRef.current as any).setMessageHandler(async (message: string) => {
        const response = await adapterRef.current!.sendMessage({
          message,
          history: (chatRef.current as any).getMessages(),
        });
        return response.content;
      });
    }
  }, []);

  return (
    <div style={{ height: '100vh' }}>
      <ModelSelector adapter={adapterRef.current!} />
      <ai-chat ref={chatRef}></ai-chat>
    </div>
  );
};

export default ChatApp;
```

## 示例 2：混合使用多个 AI 服务

您可以在不同场景下使用不同的 AI 模型。

### 创建路由适配器

```typescript
// adapters/router.ts
import { APIAdapter, ChatRequest, ChatResponse } from '@ai-chat/core';

export class ModelRouterAdapter implements APIAdapter {
  private adapters: Map<string, APIAdapter> = new Map();
  private rules: Array<{ pattern: RegExp; model: string }> = [];

  // 注册适配器
  register(model: string, adapter: APIAdapter): void {
    this.adapters.set(model, adapter);
  }

  // 添加路由规则
  addRule(pattern: RegExp, model: string): void {
    this.rules.push({ pattern, model });
  }

  // 根据消息内容路由到合适的模型
  private route(message: string): string {
    for (const rule of this.rules) {
      if (rule.pattern.test(message)) {
        return rule.model;
      }
    }
    return 'default'; // 默认模型
  }

  async sendMessage(request: ChatRequest): Promise<ChatResponse> {
    // 1. 如果 request 指定了模型，使用指定模型
    if (request.model) {
      const adapter = this.adapters.get(request.model);
      if (!adapter) {
        throw new Error(`Model ${request.model} not found`);
      }
      return adapter.sendMessage(request);
    }

    // 2. 否则根据路由规则选择模型
    const model = this.route(request.message);
    const adapter = this.adapters.get(model);
    if (!adapter) {
      throw new Error(`Model ${model} not found`);
    }

    return adapter.sendMessage({ ...request, model });
  }
}
```

### 使用路由适配器

```typescript
import { ModelRouterAdapter } from './adapters/router';
import { OpenAIAdapter } from './adapters/openai';
import { ClaudeAdapter } from './adapters/claude';

// 创建路由适配器
const router = new ModelRouterAdapter();

// 注册适配器
router.register('gpt-4', new OpenAIAdapter({
  apiKey: process.env.OPENAI_API_KEY,
  model: 'gpt-4',
}));

router.register('claude', new ClaudeAdapter({
  apiKey: process.env.CLAUDE_API_KEY,
  model: 'claude-3-opus-20240229',
}));

router.register('default', new OpenAIAdapter({
  apiKey: process.env.OPENAI_API_KEY,
  model: 'gpt-3.5-turbo',
}));

// 添加路由规则
router.addRule(/代码|编程|algorithm/i, 'gpt-4'); // 编程问题用 GPT-4
router.addRule(/写作|文章|总结/i, 'claude'); // 写作问题用 Claude

// 使用
const chatStore = createChatStore({
  async onMessage(message: string) {
    const response = await router.sendMessage({ message });
    return response.content;
  },
});
```

## 示例 3：本地模型支持

使用 OAI模型 或 LM Studio 运行本地模型。

### 创建本地模型适配器

```typescript
// adapters/local-model.ts
import { APIAdapter, ChatRequest, ChatResponse } from '@ai-chat/core';

export class LocalModelAdapter implements APIAdapter {
  private baseURL: string;
  private model: string;

  constructor(config: { baseURL?: string; model?: string }) {
    this.baseURL = config.baseURL || 'http://localhost:11434'; // OAI模型 默认端口
    this.model = config.model || 'llama3';
  }

  async sendMessage(request: ChatRequest): Promise<ChatResponse> {
    // OAI模型 API 格式
    const response = await fetch(`${this.baseURL}/api/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: this.model,
        messages: [
          ...(request.history || []).map(msg => ({
            role: msg.role,
            content: msg.content,
          })),
          { role: 'user', content: request.message },
        ],
        stream: false,
      }),
    });

    if (!response.ok) {
      throw new Error(`Local model API error: ${response.statusText}`);
    }

    const data = await response.json();

    return {
      content: data.message.content,
      role: 'assistant',
    };
  }
}
```

### 使用本地模型

```typescript
import { LocalModelAdapter } from './adapters/local-model';

// 使用 OAI模型
const localAdapter = new LocalModelAdapter({
  baseURL: 'http://localhost:11434',
  model: 'llama3',
});

// 使用 LM Studio
const lmStudioAdapter = new LocalModelAdapter({
  baseURL: 'http://localhost:1234/v1', // LM Studio 默认端口
  model: 'local-model',
});

const chatStore = createChatStore({
  async onMessage(message: string) {
    const response = await localAdapter.sendMessage({ message });
    return response.content;
  },
});
```

## 示例 4：fallback 机制

当主模型不可用时，自动 fallback 到备用模型。

### 创建 Fallback 适配器

```typescript
// adapters/fallback.ts
import { APIAdapter, ChatRequest, ChatResponse } from '@ai-chat/core';

export class FallbackAdapter implements APIAdapter {
  private adapters: APIAdapter[];
  private errors: Map<number, number> = new Map(); // 适配器索引 -> 错误计数
  private maxErrors: number;

  constructor(adapters: APIAdapter[], maxErrors: number = 3) {
    this.adapters = adapters;
    this.maxErrors = maxErrors;
  }

  async sendMessage(request: ChatRequest): Promise<ChatResponse> {
    // 按优先级尝试所有适配器
    for (let i = 0; i < this.adapters.length; i++) {
      // 检查错误计数
      if ((this.errors.get(i) || 0) >= this.maxErrors) {
        console.warn(`Adapter ${i} has too many errors, skipping...`);
        continue;
      }

      try {
        const response = await this.adapters[i].sendMessage(request);
        // 成功，重置错误计数
        this.errors.set(i, 0);
        return response;
      } catch (error) {
        console.error(`Adapter ${i} failed:`, error);
        // 增加错误计数
        this.errors.set(i, (this.errors.get(i) || 0) + 1);
        // 继续尝试下一个适配器
      }
    }

    throw new Error('All adapters failed');
  }
}
```

### 使用 Fallback 适配器

```typescript
import { FallbackAdapter } from './adapters/fallback';
import { OpenAIAdapter } from './adapters/openai';
import { LocalModelAdapter } from './adapters/local-model';

const fallbackAdapter = new FallbackAdapter([
  new OpenAIAdapter({ apiKey: process.env.OPENAI_API_KEY }), // 优先使用 OpenAI
  new LocalModelAdapter(), // OpenAI 失败时，使用本地模型
]);

const chatStore = createChatStore({
  async onMessage(message: string) {
    const response = await fallbackAdapter.sendMessage({ message });
    return response.content;
  },
});
```

## 下一步

- [自定义插件](../guide/plugins.md)
- [基本聊天](./basic-chat.md)
- [API 适配器指南](../guide/api-adapters.md)

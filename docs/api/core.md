# Core 包 API 参考

Core 包提供了 AI Chat UI Kit 的核心逻辑层，包括状态管理、API 适配器和插件系统。

## 安装

```bash
pnpm add @ai-chat/core
```

## 导出

```typescript
// 主要导出
export { createChatStore } from './store';
export { createAPIAdapter } from './api';
export { createPluginSystem } from './plugins';
export { ChatStore } from './store';
export { APIAdapter } from './api';
export { Plugin } from './plugins';
```

## `createChatStore(config)`

创建一个聊天状态管理实例。

### 参数

```typescript
interface ChatStoreConfig {
  // 初始状态（可选）
  initialState?: {
    messages?: Message[];
    isLoading?: boolean;
    error?: string | null;
  };

  // 消息处理回调（必填）
  onMessage: (
    message: string,
    options?: { onChunk?: (chunk: string) => void }
  ) => Promise<string>;

  // 插件列表（可选）
  plugins?: ChatPlugin[];

  // 全局配置（可选）
  config?: Record<string, any>;
}
```

### 返回值

```typescript
interface ChatStore {
  // 获取当前消息列表
  getMessages(): Message[];

  // 获取当前状态
  getState(): ChatState;

  // 发送消息
  sendMessage(message: string): Promise<void>;

  // 添加消息（不触发 AI 回复）
  addMessage(message: Message): void;

  // 更新最后一条消息（用于流式响应）
  updateLastMessage(content: string): void;

  // 清除所有消息
  clearMessages(): void;

  // 订阅状态变化
  subscribe(listener: (state: ChatState) => void): () => void;

  // 注册插件
  registerPlugin(plugin: ChatPlugin): void;

  // 启用插件
  enablePlugin(name: string): void;

  // 禁用插件
  disablePlugin(name: string): void;
}
```

### 示例

```typescript
import { createChatStore } from '@ai-chat/core';

const chatStore = createChatStore({
  initialState: {
    messages: [
      { role: 'assistant', content: '你好！我是 AI 助手。' }
    ],
    isLoading: false,
    error: null,
  },

  onMessage: async (message, { onChunk }) => {
    // 调用您的 AI API
    const response = await fetch('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message })
    });

    const data = await response.json();
    return data.reply;
  },

  plugins: [
    // 插件列表
  ],

  config: {
    // 全局配置
  },
});

// 使用 store
chatStore.sendMessage('Hello');
const messages = chatStore.getMessages();
```

## `createAPIAdapter(config)`

创建一个 API 适配器实例（工厂函数）。

### 参数

```typescript
type createAPIAdapter = (
  config: {
    type: 'openai' | 'claude' | 'custom';
    apiKey?: string;
    model?: string;
    baseURL?: string;
    [key: string]: any;
  }
) => APIAdapter;
```

### 返回值

```typescript
interface APIAdapter {
  sendMessage(request: ChatRequest): Promise<ChatResponse>;
  sendMessageStream?(request: ChatRequest, onChunk: (chunk: string) => void): Promise<void>;
  getHistory?(): Promise<Message[]>;
  clearHistory?(): Promise<void>;
}
```

### 示例

```typescript
import { createAPIAdapter } from '@ai-chat/core';

// OpenAI
const openaiAdapter = createAPIAdapter({
  type: 'openai',
  apiKey: process.env.OPENAI_API_KEY,
  model: 'gpt-4',
});

// Claude
const claudeAdapter = createAPIAdapter({
  type: 'claude',
  apiKey: process.env.CLAUDE_API_KEY,
  model: 'claude-3-opus-20240229',
});

// 自定义
const customAdapter = createAPIAdapter({
  type: 'custom',
  baseURL: 'https://your-api.com',
  token: 'your-token',
});
```

## `createPluginSystem()`

创建一个插件系统实例。

### 返回值

```typescript
interface PluginSystem {
  register(plugin: ChatPlugin): void;
  unregister(name: string): void;
  enable(name: string): void;
  disable(name: string): void;
  getPlugin(name: string): ChatPlugin | undefined;
  getAllPlugins(): ChatPlugin[];
}
```

### 示例

```typescript
import { createPluginSystem, ChatPlugin } from '@ai-chat/core';

const pluginSystem = createPluginSystem();

// 自定义插件
class MyPlugin implements ChatPlugin {
  name = 'my-plugin';

  beforeSend(message: string): string {
    console.log('Sending:', message);
    return message;
  }
}

// 注册插件
pluginSystem.register(new MyPlugin());

// 使用插件系统
const chatStore = createChatStore({
  // ...
  plugins: pluginSystem.getAllPlugins(),
});
```

## 类型定义

### `Message`

```typescript
interface Message {
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp?: number;
  metadata?: Record<string, any>;
}
```

### `ChatState`

```typescript
interface ChatState {
  messages: Message[];
  isLoading: boolean;
  error: string | null;
}
```

### `ChatRequest`

```typescript
interface ChatRequest {
  message: string;
  history?: Message[];
  model?: string;
  temperature?: number;
  maxTokens?: number;
  [key: string]: any;
}
```

### `ChatResponse`

```typescript
interface ChatResponse {
  content: string;
  role: 'assistant';
  usage?: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
  [key: string]: any;
}
```

### `ChatPlugin`

```typescript
interface ChatPlugin {
  name: string;
  init?: (context: PluginContext) => void | Promise<void>;
  beforeSend?: (message: string, context: PluginContext) => string | Promise<string>;
  afterSend?: (message: string, context: PluginContext) => void | Promise<void>;
  afterReceive?: (message: string, context: PluginContext) => string | Promise<string>;
  renderUI?: (container: HTMLElement, context: PluginContext) => void;
  destroy?: () => void | Promise<void>;
}
```

### `PluginContext`

```typescript
interface PluginContext {
  getMessages(): Message[];
  addMessage(message: Message): void;
  getConfig(): Record<string, any>;
  setConfig(config: Record<string, any>): void;
  emit(event: string, data?: any): void;
  on(event: string, handler: (data: any) => void): void;
}
```

## 使用示例

### 完整示例

```typescript
import { createChatStore, createAPIAdapter } from '@ai-chat/core';

// 1. 创建 API 适配器
const adapter = createAPIAdapter({
  type: 'openai',
  apiKey: process.env.OPENAI_API_KEY,
  model: 'gpt-3.5-turbo',
});

// 2. 创建 store
const chatStore = createChatStore({
  onMessage: async (message) => {
    const response = await adapter.sendMessage({
      message,
      history: chatStore.getMessages(),
    });
    return response.content;
  },
});

// 3. 订阅状态变化
const unsubscribe = chatStore.subscribe((state) => {
  console.log('Messages:', state.messages);
  console.log('Loading:', state.isLoading);
  console.log('Error:', state.error);
});

// 4. 发送消息
await chatStore.sendMessage('Hello!');

// 5. 清理
unsubscribe();
```

## 下一步

- [Components 包 API](./components.md)
- [插件开发](../guide/plugins.md)
- [API 适配器](../guide/api-adapters.md)

# 插件开发

插件系统允许您扩展 AI Chat UI Kit 的功能，如消息预处理、消息后处理、UI 扩展等。

## 插件接口

### 插件基本结构

```typescript
interface ChatPlugin {
  // 插件名称（必填）
  name: string;

  // 插件初始化（可选）
  init?: (context: PluginContext) => void | Promise<void>;

  // 消息发送前（可选）
  beforeSend?: (message: string, context: PluginContext) => string | Promise<string>;

  // 消息发送后（可选）
  afterSend?: (message: string, context: PluginContext) => void | Promise<void>;

  // 接收到 AI 回复后（可选）
  afterReceive?: (message: string, context: PluginContext) => string | Promise<string>;

  // UI 扩展（可选）
  renderUI?: (container: HTMLElement, context: PluginContext) => void;

  // 销毁插件（可选）
  destroy?: () => void | Promise<void>;
}

interface PluginContext {
  // 获取当前消息列表
  getMessages(): Message[];

  // 添加消息
  addMessage(message: Message): void;

  // 获取配置
  getConfig(): Record<string, any>;

  // 更新配置
  setConfig(config: Record<string, any>): void;

  // 触发事件
  emit(event: string, data?: any): void;

  // 监听事件
  on(event: string, handler: (data: any) => void): void;
}
```

## 创建插件

### 示例 1：消息日志插件

记录所有发送和接收的消息。

```typescript
// plugins/message-logger.ts
import { ChatPlugin, PluginContext, Message } from '@ai-chat/core';

export class MessageLoggerPlugin implements ChatPlugin {
  name = 'message-logger';

  private context!: PluginContext;
  private logs: Array<{ type: string; message: string; timestamp: number }> = [];

  init(context: PluginContext) {
    this.context = context;
    console.log('[MessageLogger] 插件已初始化');
  }

  beforeSend(message: string, context: PluginContext): string {
    this.logs.push({
      type: 'send',
      message,
      timestamp: Date.now(),
    });
    console.log(`[MessageLogger] 发送消息: ${message}`);
    return message; // 返回（可能修改后的）消息
  }

  afterReceive(message: string, context: PluginContext): string {
    this.logs.push({
      type: 'receive',
      message,
      timestamp: Date.now(),
    });
    console.log(`[MessageLogger] 接收消息: ${message}`);
    return message; // 返回（可能修改后的）消息
  }

  // 获取日志
  getLogs() {
    return [...this.logs];
  }

  // 导出日志
  exportLogs() {
    const text = this.logs
      .map(log => `${new Date(log.timestamp).toISOString()} [${log.type}] ${log.message}`)
      .join('\n');
    const blob = new Blob([text], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'chat-logs.txt';
    a.click();
    URL.revokeObjectURL(url);
  }

  destroy() {
    console.log('[MessageLogger] 插件已销毁');
    this.logs = [];
  }
}
```

### 示例 2：敏感词过滤插件

过滤消息中的敏感词。

```typescript
// plugins/sensitive-word-filter.ts
import { ChatPlugin } from '@ai-chat/core';

interface SensitiveWordFilterOptions {
  words: string[]; // 敏感词列表
  replacement?: string; // 替换字符，默认 ***
}

export class SensitiveWordFilterPlugin implements ChatPlugin {
  name = 'sensitive-word-filter';

  private words: string[];
  private replacement: string;

  constructor(options: SensitiveWordFilterOptions) {
    this.words = options.words;
    this.replacement = options.replacement || '***';
  }

  beforeSend(message: string): string {
    let filtered = message;
    for (const word of this.words) {
      const regex = new RegExp(word, 'gi');
      filtered = filtered.replace(regex, this.replacement);
    }
    return filtered;
  }
}
```

### 示例 3：Markdown 渲染插件

将 AI 回复中的 Markdown 语法渲染为 HTML。

```typescript
// plugins/markdown-renderer.ts
import { ChatPlugin } from '@ai-chat/core';
import { marked } from 'marked';
import DOMPurify from 'dompurify';

export class MarkdownRendererPlugin implements ChatPlugin {
  name = 'markdown-renderer';

  init(context) {
    // 配置 marked
    marked.setOptions({
      breaks: true,
      gfm: true,
    });
  }

  afterReceive(message: string): string {
    // 将 Markdown 转换为 HTML
    const html = marked(message);
    //  sanitize HTML
    const cleanHtml = DOMPurify.sanitize(html);
    return cleanHtml;
  }

  // 自定义消息渲染
  renderUI(container: HTMLElement, context: PluginContext) {
    const messages = context.getMessages();
    const lastMessage = messages[messages.length - 1];

    if (lastMessage && lastMessage.role === 'assistant') {
      const messageEl = container.querySelector('.ai-message__content');
      if (messageEl) {
        messageEl.innerHTML = lastMessage.content; // 已经包含 HTML
      }
    }
  }
}
```

### 示例 4：打字机效果插件

让 AI 回复逐字显示，产生打字机效果。

```typescript
// plugins/typewriter-effect.ts
import { ChatPlugin, PluginContext } from '@ai-chat/core';

interface TypewriterEffectOptions {
  speed?: number; // 打字速度（毫秒/字符），默认 30ms
}

export class TypewriterEffectPlugin implements ChatPlugin {
  name = 'typewriter-effect';

  private speed: number;
  private typingInterval: number | null = null;

  constructor(options: TypewriterEffectOptions = {}) {
    this.speed = options.speed || 30;
  }

  afterReceive(message: string, context: PluginContext): Promise<string> {
    return new Promise((resolve) => {
      let index = 0;
      let displayedText = '';

      // 先添加一个空消息
      const tempMessage = { role: 'assistant' as const, content: '' };
      context.addMessage(tempMessage);

      // 逐字显示
      this.typingInterval = window.setInterval(() => {
        if (index < message.length) {
          displayedText += message[index];
          index++;

          // 更新最后一条消息
          const messages = context.getMessages();
          messages[messages.length - 1] = {
            ...messages[messages.length - 1],
            content: displayedText,
          };
          // 触发更新
          context.emit('message-updated', messages);
        } else {
          // 打字完成
          if (this.typingInterval) {
            clearInterval(this.typingInterval);
            this.typingInterval = null;
          }
          resolve(message);
        }
      }, this.speed);
    });
  }

  destroy() {
    if (this.typingInterval) {
      clearInterval(this.typingInterval);
    }
  }
}
```

## 使用插件

### 注册插件

```typescript
// main.ts / App.tsx
import { createChatStore } from '@ai-chat/core';
import { MessageLoggerPlugin } from './plugins/message-logger';
import { SensitiveWordFilterPlugin } from './plugins/sensitive-word-filter';

// 创建插件实例
const loggerPlugin = new MessageLoggerPlugin();
const filterPlugin = new SensitiveWordFilterPlugin({
  words: ['敏感词1', '敏感词2'],
  replacement: '***',
});

// 创建 store 时注册插件
const chatStore = createChatStore({
  plugins: [loggerPlugin, filterPlugin],
  // ...其他配置
});

// 或者在创建后注册
chatStore.registerPlugin(loggerPlugin);
```

### 插件执行顺序

插件按照注册顺序依次执行：

```typescript
const chatStore = createChatStore({
  plugins: [
    plugin1, // 先执行
    plugin2, // 后执行
    plugin3, // 最后执行
  ],
});
```

### 禁用/启用插件

```typescript
// 禁用插件
chatStore.disablePlugin('message-logger');

// 启用插件
chatStore.enablePlugin('message-logger');
```

## 高级用法

### 插件间通信

```typescript
// 插件 A
export class PluginA implements ChatPlugin {
  name = 'plugin-a';

  init(context: PluginContext) {
    // 监听来自插件 B 的事件
    context.on('plugin-b-event', (data) => {
      console.log('收到插件 B 的消息:', data);
    });
  }
}

// 插件 B
export class PluginB implements ChatPlugin {
  name = 'plugin-b';

  afterSend(message: string, context: PluginContext): string {
    // 向插件 A 发送事件
    context.emit('plugin-b-event', { message });
    return message;
  }
}
```

### 插件配置

```typescript
interface PluginWithConfig extends ChatPlugin {
  init(context: PluginContext) {
    const config = context.getConfig();

    // 读取配置
    const enabled = config['plugin-a']?.enabled ?? true;
    const options = config['plugin-a']?.options ?? {};

    if (enabled) {
      // 应用配置
    }
  }
}

// 使用
const chatStore = createChatStore({
  plugins: [new PluginWithConfig()],
  config: {
    'plugin-a': {
      enabled: true,
      options: {
        // 插件特定配置
      },
    },
  },
});
```

## 内置插件

AI Chat UI Kit 提供了一些常用内置插件：

### 1. 时间戳插件

```typescript
import { TimestampPlugin } from '@ai-chat/plugins';

const timestampPlugin = new TimestampPlugin({
  format: 'HH:mm', // 时间格式
  position: 'right', // 显示位置：'left' | 'right' | 'center'
});
```

### 2. 消息去重插件

```typescript
import { DeduplicationPlugin } from '@ai-chat/plugins';

const deduplicationPlugin = new DeduplicationPlugin({
  timeWindow: 1000, // 去重时间窗口（毫秒）
});
```

### 3. 离线支持插件

```typescript
import { OfflineSupportPlugin } from '@ai-chat/plugins';

const offlinePlugin = new OfflineSupportPlugin({
  storageKey: 'chat-messages-offline',
  syncOnReconnect: true,
});
```

## 下一步

- [API 适配器](./api-adapters.md) - 学习如何兼容不同后端 API
- [主题定制](./themes.md) - 学习如何自定义主题
- [API 参考](../../api/) - 查看完整 API 文档

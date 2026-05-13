# 自定义插件示例

本示例将指导您创建和使用自定义插件。

## 插件 1：消息前缀插件

为所有用户消息添加前缀（如时间戳、用户名等）。

### 创建插件

```typescript
// plugins/message-prefix.ts
import { ChatPlugin, PluginContext, Message } from '@ai-chat/core';

interface MessagePrefixPluginOptions {
  prefix: string; // 前缀模板
  position: 'before' | 'after'; // 前缀位置
}

export class MessagePrefixPlugin implements ChatPlugin {
  name = 'message-prefix';

  private prefix: string;
  private position: 'before' | 'after';

  constructor(options: MessagePrefixPluginOptions) {
    this.prefix = options.prefix;
    this.position = options.position || 'before';
  }

  beforeSend(message: string, context: PluginContext): string {
    const processedMessage =
      this.position === 'before'
        ? `${this.prefix}${message}`
        : `${message}${this.prefix}`;

    return processedMessage;
  }
}
```

### 使用插件

```typescript
// main.ts
import { createChatStore } from '@ai-chat/core';
import { MessagePrefixPlugin } from './plugins/message-prefix';

// 创建插件实例
const prefixPlugin = new MessagePrefixPlugin({
  prefix: '[User] ',
  position: 'before',
});

// 注册插件
const chatStore = createChatStore({
  plugins: [prefixPlugin],
  onMessage: async (message) => {
    // message 已经包含前缀
    console.log('Message with prefix:', message);
    return `AI 回复：${message}`;
  },
});
```

## 插件 2：消息翻译插件

在发送前将消息翻译成英文，或将 AI 回复翻译成中文。

### 创建插件

```typescript
// plugins/translator.ts
import { ChatPlugin } from '@ai-chat/core';

interface TranslatorPluginOptions {
  translateInput?: boolean; // 是否翻译输入
  translateOutput?: boolean; // 是否翻译输出
  targetLang?: string; // 目标语言
}

export class TranslatorPlugin implements ChatPlugin {
  name = 'translator';

  private options: TranslatorPluginOptions;

  constructor(options: TranslatorPluginOptions = {}) {
    this.options = {
      translateInput: true,
      translateOutput: false,
      targetLang: 'en',
      ...options,
    };
  }

  async beforeSend(message: string): Promise<string> {
    if (!this.options.translateInput) return message;

    // 调用翻译 API
    const translated = await this.translate(message, this.options.targetLang!);
    return translated;
  }

  async afterReceive(message: string): Promise<string> {
    if (!this.options.translateOutput) return message;

    // 调用翻译 API
    const translated = await this.translate(message, 'zh');
    return translated;
  }

  private async translate(text: string, targetLang: string): Promise<string> {
    // 使用 Google Translate API 或其他翻译服务
    const response = await fetch('https://translation.googleapis.com/language/translate/v2', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        q: text,
        target: targetLang,
      }),
    });

    const data = await response.json();
    return data.data.translations[0].translatedText;
  }
}
```

### 使用插件

```typescript
import { TranslatorPlugin } from './plugins/translator';

const translatorPlugin = new TranslatorPlugin({
  translateInput: true, // 将用户输入翻译成英文
  translateOutput: true, // 将 AI 回复翻译成中文
  targetLang: 'en',
});

const chatStore = createChatStore({
  plugins: [translatorPlugin],
  onMessage: async (message) => {
    // message 已经是英文
    const response = await callOpenAI(message);
    return response; // 将被插件翻译成中文
  },
});
```

## 插件 3：消息持久化插件

将聊天记录保存到 localStorage 或 IndexedDB。

### 创建插件

```typescript
// plugins/persistence.ts
import { ChatPlugin, PluginContext, Message } from '@ai-chat/core';

interface PersistencePluginOptions {
  storage?: 'localStorage' | 'sessionStorage' | 'indexedDB';
  key?: string;
  maxMessages?: number;
}

export class PersistencePlugin implements ChatPlugin {
  name = 'persistence';

  private storage: Storage;
  private key: string;
  private maxMessages: number;

  constructor(options: PersistencePluginOptions = {}) {
    this.storage =
      options.storage === 'sessionStorage'
        ? sessionStorage
        : localStorage;
    this.key = options.key || 'chat-messages';
    this.maxMessages = options.maxMessages || 100;
  }

  init(context: PluginContext) {
    // 加载已保存的消息
    const savedMessages = this.loadMessages();
    if (savedMessages.length > 0) {
      savedMessages.forEach(msg => {
        context.addMessage(msg);
      });
    }

    // 监听消息变化，自动保存
    context.on('message-updated', () => {
      const messages = context.getMessages();
      this.saveMessages(messages);
    });
  }

  private saveMessages(messages: Message[]): void {
    const toSave = messages.slice(-this.maxMessages); // 只保存最近 N 条
    this.storage.setItem(this.key, JSON.stringify(toSave));
  }

  private loadMessages(): Message[] {
    const saved = this.storage.getItem(this.key);
    if (!saved) return [];
    try {
      return JSON.parse(saved);
    } catch {
      return [];
    }
  }

  // 导出聊天记录
  exportMessages(): string {
    const messages = this.loadMessages();
    return JSON.stringify(messages, null, 2);
  }

  // 清除聊天记录
  clearMessages(): void {
    this.storage.removeItem(this.key);
  }
}
```

### 使用插件

```typescript
import { PersistencePlugin } from './plugins/persistence';

const persistencePlugin = new PersistencePlugin({
  storage: 'localStorage',
  key: 'my-chat-history',
  maxMessages: 50,
});

const chatStore = createChatStore({
  plugins: [persistencePlugin],
  onMessage: async (message) => {
    return `AI 回复：${message}`;
  },
});

// 导出聊天记录
const exported = persistencePlugin.exportMessages();
console.log(exported);

// 清除聊天记录
persistencePlugin.clearMessages();
```

## 插件 4：字数统计插件

统计消息字数、字符数等。

### 创建插件

```typescript
// plugins/word-counter.ts
import { ChatPlugin, PluginContext } from '@ai-chat/core';

interface WordCountStats {
  totalMessages: number;
  totalWords: number;
  totalCharacters: number;
  averageWordsPerMessage: number;
}

export class WordCounterPlugin implements ChatPlugin {
  name = 'word-counter';

  private context!: PluginContext;
  private stats: WordCountStats = {
    totalMessages: 0,
    totalWords: 0,
    totalCharacters: 0,
    averageWordsPerMessage: 0,
  };

  init(context: PluginContext) {
    this.context = context;
  }

  afterReceive(message: string): string {
    // 更新统计
    this.stats.totalMessages++;
    this.stats.totalCharacters += message.length;
    this.stats.totalWords += message.trim().split(/\s+/).length;
    this.stats.averageWordsPerMessage =
      this.stats.totalWords / this.stats.totalMessages;

    // 触发统计更新事件
    this.context.emit('stats-updated', { ...this.stats });

    return message;
  }

  // 获取统计信息
  getStats(): WordStats {
    return { ...this.stats };
  }

  // 重置统计
  resetStats(): void {
    this.stats = {
      totalMessages: 0,
      totalWords: 0,
      totalCharacters: 0,
      averageWordsPerMessage: 0,
    };
    this.context.emit('stats-updated', { ...this.stats });
  }
}
```

### 使用插件

```typescript
import { WordCounterPlugin } from './plugins/word-counter';

const wordCounterPlugin = new WordCounterPlugin();

const chatStore = createChatStore({
  plugins: [wordCounterPlugin],
  onMessage: async (message) => {
    return `AI 回复：${message}`;
  },
});

// 监听统计更新
wordCounterPlugin.context.on('stats-updated', (stats) => {
  console.log('Stats updated:', stats);
});

// 获取统计信息
const stats = wordCounterPlugin.getStats();
console.log(stats);
```

## 插件 5：敏感信息脱敏插件

检测并脱敏敏感信息（如手机号、邮箱、身份证号等）。

### 创建插件

```typescript
// plugins/sensitive-info-mask.ts
import { ChatPlugin } from '@ai-chat/core';

interface SensitiveInfoMaskOptions {
  maskPhone?: boolean;
  maskEmail?: boolean;
  maskIDCard?: boolean;
  maskBankCard?: boolean;
  maskCustom?: Array<{ regex: RegExp; replacement: string }>;
}

export class SensitiveInfoMaskPlugin implements ChatPlugin {
  name = 'sensitive-info-mask';

  private rules: Array<{ regex: RegExp; replacement: string }> = [];

  constructor(options: SensitiveInfoMaskOptions = {}) {
    if (options.maskPhone) {
      this.rules.push({
        regex: /(\+?86\s?)?1[3-9]\d{9}/g,
        replacement: '*** *** ****',
      });
    }

    if (options.maskEmail) {
      this.rules.push({
        regex: /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g,
        replacement: '***@***.***',
      });
    }

    if (options.maskIDCard) {
      this.rules.push({
        regex: /(\d{6})(\d{8})(\d{4})/g,
        replacement: '$1********$3',
      });
    }

    if (options.maskBankCard) {
      this.rules.push({
        regex: /\d{16,19}/g,
        replacement: '**** **** **** ****',
      });
    }

    if (options.maskCustom) {
      this.rules.push(...options.maskCustom);
    }
  }

  beforeSend(message: string): string {
    let masked = message;
    for (const rule of this.rules) {
      masked = masked.replace(rule.regex, rule.replacement);
    }
    return masked;
  }
}
```

### 使用插件

```typescript
import { SensitiveInfoMaskPlugin } from './plugins/sensitive-info-mask';

const maskPlugin = new SensitiveInfoMaskPlugin({
  maskPhone: true,
  maskEmail: true,
  maskIDCard: true,
});

const chatStore = createChatStore({
  plugins: [maskPlugin],
  onMessage: async (message) => {
    // message 已经脱敏
    return `AI 回复：${message}`;
  },
});
```

## 下一步

- [多模型支持](./multi-model.md)
- [基本聊天](./basic-chat.md)
- [插件开发指南](../guide/plugins.md)

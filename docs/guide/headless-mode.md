# Headless 模式

Headless 模式允许您只使用 AI Chat UI Kit 的逻辑层，完全自定义 UI 层。

## 什么是 Headless 模式？

Headless 模式是指只使用 `@ai-chat/core` 包提供的状态和逻辑，不使用 `@ai-chat/components` 提供的默认 UI 组件。这样您可以：

- 完全控制 UI 的外观和交互
- 使用任何 UI 框架（React、Vue、Angular 等）
- 自定义消息气泡、输入框、工具调用等所有 UI 元素
- 与现有设计系统无缝集成

## 基本用法

### 1. 安装核心包

```bash
pnpm add @ai-chat/core
```

### 2. 创建 Chat Store

```typescript
// store.ts
import { createChatStore } from '@ai-chat/core';

export const chatStore = createChatStore({
  initialState: {
    messages: [],
    isLoading: false,
    error: null,
  },

  // 消息处理回调
  onMessage: async (message) => {
    // 调用您的 AI API
    const response = await fetch('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message })
    });
    const data = await response.json();
    return data.reply;
  },
});
```

### 3. 在 React 中使用

```tsx
// ChatApp.tsx
import React, { useState, useEffect, useRef } from 'react';
import { chatStore } from './store';

const ChatApp: React.FC = () => {
  const [messages, setMessages] = useState(chatStore.getMessages());
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // 订阅状态变化
  useEffect(() => {
    const unsubscribe = chatStore.subscribe((state) => {
      setMessages([...state.messages]);
      setIsLoading(state.isLoading);
    });

    return unsubscribe;
  }, []);

  // 滚动到最新消息
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // 发送消息
  const handleSend = async () => {
    if (!inputValue.trim() || isLoading) return;

    const message = inputValue.trim();
    setInputValue('');

    await chatStore.sendMessage(message);
  };

  return (
    <div style={styles.container}>
      <div style={styles.messagesContainer}>
        {messages.map((msg, index) => (
          <div
            key={index}
            style={{
              ...styles.message,
              ...(msg.role === 'user' ? styles.messageUser : styles.messageAI),
            }}
          >
            <div style={styles.avatar}>
              {msg.role === 'user' ? '我' : 'AI'}
            </div>
            <div style={styles.messageContent}>
              {msg.content}
            </div>
          </div>
        ))}
        {isLoading && (
          <div style={styles.loading}>AI 正在思考...</div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <div style={styles.inputContainer}>
        <input
          style={styles.input}
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && handleSend()}
          placeholder="输入消息..."
          disabled={isLoading}
        />
        <button
          style={styles.sendButton}
          onClick={handleSend}
          disabled={isLoading || !inputValue.trim()}
        >
          发送
        </button>
      </div>
    </div>
  );
};

const styles = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    height: '100vh',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
  },
  messagesContainer: {
    flex: 1,
    overflowY: 'auto',
    padding: '16px',
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
  },
  message: {
    display: 'flex',
    gap: '8px',
    maxWidth: '80%',
  },
  messageUser: {
    flexDirection: 'row-reverse',
    marginLeft: 'auto',
  },
  messageAI: {
    marginRight: 'auto',
  },
  avatar: {
    width: '36px',
    height: '36px',
    borderRadius: '50%',
    backgroundColor: '#1677ff',
    color: 'white',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  messageContent: {
    padding: '12px 16px',
    borderRadius: '12px',
    lineHeight: 1.6,
    wordBreak: 'break-word',
  },
  loading: {
    textAlign: 'center',
    color: '#999',
    padding: '8px',
  },
  inputContainer: {
    padding: '16px',
    borderTop: '1px solid #e8e8e8',
    display: 'flex',
    gap: '8px',
  },
  input: {
    flex: 1,
    padding: '8px 12px',
    border: '1px solid #d9d9d9',
    borderRadius: '8px',
    fontSize: '14px',
  },
  sendButton: {
    padding: '8px 20px',
    backgroundColor: '#1677ff',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '14px',
  },
};

export default ChatApp;
```

### 4. 在 Vue 中使用

```vue
<!-- ChatApp.vue -->
<template>
  <div class="container">
    <div class="messages-container">
      <div
        v-for="(msg, index) in messages"
        :key="index"
        :class="['message', msg.role === 'user' ? 'message-user' : 'message-ai']"
      >
        <div class="avatar">
          {{ msg.role === 'user' ? '我' : 'AI' }}
        </div>
        <div class="message-content">
          {{ msg.content }}
        </div>
      </div>
      <div v-if="isLoading" class="loading">AI 正在思考...</div>
      <div ref="messagesEnd"></div>
    </div>

    <div class="input-container">
      <input
        v-model="inputValue"
        class="input"
        type="text"
        @keypress="handleKeyPress"
        placeholder="输入消息..."
        :disabled="isLoading"
      />
      <button
        class="send-button"
        @click="handleSend"
        :disabled="isLoading || !inputValue.trim()"
      >
        发送
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, nextTick } from 'vue';
import { chatStore } from './store';

const messages = ref(chatStore.getMessages());
const inputValue = ref('');
const isLoading = ref(false);
const messagesEnd = ref<HTMLDivElement>();

let unsubscribe: () => void;

// 订阅状态变化
onMounted(() => {
  unsubscribe = chatStore.subscribe((state) => {
    messages.value = [...state.messages];
    isLoading.value = state.isLoading;
    nextTick(() => {
      messagesEnd.value?.scrollIntoView({ behavior: 'smooth' });
    });
  });
});

onUnmounted(() => {
  unsubscribe?.();
});

// 发送消息
const handleSend = async () => {
  if (!inputValue.value.trim() || isLoading.value) return;

  const message = inputValue.value.trim();
  inputValue.value = '';

  await chatStore.sendMessage(message);
};

// 处理回车键
const handleKeyPress = (e: KeyboardEvent) => {
  if (e.key === 'Enter') {
    handleSend();
  }
};
</script>

<style scoped>
.container {
  display: flex;
  flex-direction: column;
  height: 100vh;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
}

.messages-container {
  flex: 1;
  overflow-y: auto;
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.message {
  display: flex;
  gap: 8px;
  max-width: 80%;
}

.message-user {
  flex-direction: row-reverse;
  margin-left: auto;
}

.message-ai {
  margin-right: auto;
}

.avatar {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background-color: #1677ff;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.message-content {
  padding: 12px 16px;
  border-radius: 12px;
  line-height: 1.6;
  word-break: break-word;
  background-color: #f5f5f5;
}

.message-user .message-content {
  background-color: #1677ff;
  color: white;
}

.loading {
  text-align: center;
  color: #999;
  padding: 8px;
}

.input-container {
  padding: 16px;
  border-top: 1px solid #e8e8e8;
  display: flex;
  gap: 8px;
}

.input {
  flex: 1;
  padding: 8px 12px;
  border: 1px solid #d9d9d9;
  border-radius: 8px;
  font-size: 14px;
}

.send-button {
  padding: 8px 20px;
  background-color: #1677ff;
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-size: 14px;
}

.send-button:disabled {
  background-color: #d9d9d9;
  cursor: not-allowed;
}
</style>
```

## Chat Store API

### `createChatStore(config)`

创建一个聊天状态管理实例。

**参数：**

```typescript
interface ChatStoreConfig {
  initialState?: {
    messages?: Message[];
    isLoading?: boolean;
    error?: string | null;
  };
  onMessage: (message: string) => Promise<string>;
}
```

**返回：**

```typescript
interface ChatStore {
  // 获取当前消息列表
  getMessages(): Message[];

  // 发送消息
  sendMessage(message: string): Promise<void>;

  // 添加消息
  addMessage(message: Message): void;

  // 清除消息
  clearMessages(): void;

  // 订阅状态变化
  subscribe(listener: (state: ChatState) => void): () => void;

  // 获取当前状态
  getState(): ChatState;
}
```

## 进阶用法

### 自定义消息类型

```typescript
interface Message {
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp?: number;
  metadata?: Record<string, any>; // 自定义元数据
}
```

### 错误处理

```typescript
const chatStore = createChatStore({
  onMessage: async (message) => {
    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data.reply;
    } catch (error) {
      console.error('Failed to send message:', error);
      throw error; // 让 store 处理错误状态
    }
  },
});
```

### 流式响应（Streaming）

```typescript
const chatStore = createChatStore({
  onMessage: async (message, { onChunk }) => {
    const response = await fetch('/api/chat/stream', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message })
    });

    const reader = response.body.getReader();
    const decoder = new TextDecoder();

    let fullText = '';

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      const chunk = decoder.decode(value);
      fullText += chunk;
      onChunk(fullText); // 实时更新 UI
    }

    return fullText;
  },
});
```

## 下一步

- [主题定制](./themes.md) - 学习如何自定义主题
- [插件开发](./plugins.md) - 学习如何扩展功能
- [API 参考](../../api/) - 查看完整 API 文档

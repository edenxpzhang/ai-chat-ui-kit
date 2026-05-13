# 基本聊天示例

本示例将指导您创建一个最基本的聊天功能。

## 原生 HTML 示例

### 1. 创建 HTML 文件

```html
<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>AI Chat - 基本示例</title>
  <style>
    * {
      margin:0;
      padding:0;
      box-sizing: border-box;
    }

    html, body {
      height: 100%;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    }

    #app {
      height: 100vh;
    }
  </style>
</head>
<body>
  <div id="app">
    <ai-chat id="chat"></ai-chat>
  </div>

  <script type="module">
    // 导入组件和主题
    import '@ai-chat/components';
    import '@ai-chat/themes/default';

    // 获取组件实例
    const chat = document.getElementById('chat');

    // 设置消息处理回调
    chat.setMessageHandler(async (message) => {
      // 模拟 AI 回复延迟
      await new Promise(resolve => setTimeout(resolve, 1000));

      // 返回 AI 回复
      return `您说的是："${message}"。这是 AI 的回复。`;
    });

    // 添加欢迎消息
    chat.addMessage({
      role: 'assistant',
      content: '你好！我是 AI 助手，有什么可以帮助你的吗？'
    });
  </script>
</body>
</html>
```

### 2. 运行

在浏览器中打开 HTML 文件即可使用。

## React 示例

### 1. 安装依赖

```bash
pnpm add @ai-chat/core @ai-chat/components @ai-chat/themes
```

### 2. 创建聊天组件

```tsx
// ChatApp.tsx
import React, { useEffect, useRef, useState } from 'react';
import '@ai-chat/components';
import '@ai-chat/themes/default';

const ChatApp: React.FC = () => {
  const chatRef = useRef<HTMLElement>(null);
  const [messages, setMessages] = useState<Message[]>([]);

  useEffect(() => {
    if (chatRef.current) {
      // 设置消息处理回调
      (chatRef.current as any).setMessageHandler(async (message: string) => {
        // 模拟 AI 回复延迟
        await new Promise(resolve => setTimeout(resolve, 1000));

        // 返回 AI 回复
        return `您说的是："${message}"。这是 AI 的回复。`;
      });

      // 添加欢迎消息
      (chatRef.current as any).addMessage({
        role: 'assistant',
        content: '你好！我是 AI 助手，有什么可以帮助你的吗？'
      });
    }
  }, []);

  return (
    <div style={{ height: '100vh' }}>
      <ai-chat ref={chatRef}></ai-chat>
    </div>
  );
};

export default ChatApp;
```

### 3. 在 App 中使用

```tsx
// App.tsx
import React from 'react';
import ChatApp from './ChatApp';

function App() {
  return <ChatApp />;
}

export default App;
```

### 4. 运行

```bash
npm start
# 或
pnpm dev
```

## Vue 3 示例

### 1. 安装依赖

```bash
pnpm add @ai-chat/core @ai-chat/components @ai-chat/themes
```

### 2. 创建聊天组件

```vue
<!-- ChatApp.vue -->
<template>
  <div style="height: 100vh">
    <ai-chat ref="chatRef"></ai-chat>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import '@ai-chat/components';
import '@ai-chat/themes/default';

const chatRef = ref<HTMLElement>();

onMounted(() => {
  if (chatRef.value) {
    // 设置消息处理回调
    (chatRef.value as any).setMessageHandler(async (message: string) => {
      // 模拟 AI 回复延迟
      await new Promise(resolve => setTimeout(resolve, 1000));

      // 返回 AI 回复
      return `您说的是："${message}"。这是 AI 的回复。`;
    });

    // 添加欢迎消息
    (chatRef.value as any).addMessage({
      role: 'assistant',
      content: '你好！我是 AI 助手，有什么可以帮助你的吗？'
    });
  }
});
</script>
```

### 3. 在 App 中使用

```vue
<!-- App.vue -->
<template>
  <ChatApp />
</template>

<script setup lang="ts">
import ChatApp from './components/ChatApp.vue';
</script>
```

### 4. 运行

```bash
npm run dev
# 或
pnpm dev
```

## 连接真实 API

### 使用 fetch

```typescript
chat.setMessageHandler(async (message) => {
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
});
```

### 使用 axios

```typescript
import axios from 'axios';

chat.setMessageHandler(async (message) => {
  const response = await axios.post('/api/chat', { message });
  return response.data.reply;
});
```

### 使用 OpenAI API

```typescript
chat.setMessageHandler(async (message) => {
  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`
    },
    body: JSON.stringify({
      model: 'gpt-3.5-turbo',
      messages: [
        { role: 'user', content: message }
      ]
    })
  });

  const data = await response.json();
  return data.choices[0].message.content;
});
```

## 自定义样式

### 覆盖 CSS 变量

```css
:root {
  --ai-primary: #your-primary-color;
  --ai-message-user-bg: #your-user-msg-bg;
  --ai-message-ai-bg: #your-ai-msg-bg;
}
```

### 使用不同主题

```typescript
// 默认主题
import '@ai-chat/themes/default';

// 气泡主题
import '@ai-chat/themes/bubble';

// 扁平主题
import '@ai-chat/themes/flat';
```

## 下一步

- [自定义插件](../guide/plugins.md)
- [多模型支持](./multi-model.md)
- [主题定制](../guide/themes.md)

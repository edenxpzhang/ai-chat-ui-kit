# 快速开始

本指南将帮助您在 5 分钟内上手 AI Chat UI Kit。

## 前置要求

- Node.js >= 16.0.0
- 包管理器：PNPM（推荐）、NPM 或 Yarn

## 安装

### 使用 PNPM（推荐）

```bash
pnpm add @ai-chat/core @ai-chat/components @ai-chat/themes
```

### 使用 NPM

```bash
npm install @ai-chat/core @ai-chat/components @ai-chat/themes
```

### 使用 Yarn

```bash
yarn add @ai-chat/core @ai-chat/components @ai-chat/themes
```

## 基本用法

### 原生 HTML 项目

1. 在 HTML 文件中引入组件和主题：

```html
<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>AI Chat Demo</title>
  <script type="module">
    import '@ai-chat/components';
    import '@ai-chat/themes/default';
  </script>
  <style>
    html, body {
      margin: 0;
      padding: 0;
      height: 100%;
    }
    #app {
      height: 100vh;
    }
  </style>
</head>
<body>
  <div id="app">
    <ai-chat></ai-chat>
  </div>

  <script>
    // 获取组件实例
    const chat = document.querySelector('ai-chat');

    // 设置消息处理回调
    chat.setMessageHandler(async (message) => {
      // 这里调用您的 AI API
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message })
      });
      const data = await response.json();
      return data.reply;
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

### React 项目

1. 安装依赖（同上）

2. 创建聊天组件：

```tsx
// ChatApp.tsx
import React, { useEffect, useRef } from 'react';
import '@ai-chat/components';
import '@ai-chat/themes/default';

const ChatApp: React.FC = () => {
  const chatRef = useRef<HTMLElement>(null);

  useEffect(() => {
    if (chatRef.current) {
      // 设置消息处理回调
      (chatRef.current as any).setMessageHandler(async (message: string) => {
        // 调用您的 AI API
        const response = await fetch('/api/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ message })
        });
        const data = await response.json();
        return data.reply;
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

3. 在 App.tsx 中使用：

```tsx
import React from 'react';
import ChatApp from './ChatApp';

function App() {
  return <ChatApp />;
}

export default App;
```

### Vue 3 项目

1. 安装依赖（同上）

2. 创建聊天组件：

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
      // 调用您的 AI API
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message })
      });
      const data = await response.json();
      return data.reply;
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

3. 在 App.vue 中使用：

```vue
<template>
  <ChatApp />
</template>

<script setup lang="ts">
import ChatApp from './components/ChatApp.vue';
</script>
```

## 下一步

- [Headless 模式](./headless-mode.md) - 学习如何只使用逻辑层，自定义 UI
- [主题定制](./themes.md) - 学习如何自定义主题
- [插件开发](./plugins.md) - 学习如何扩展功能
- [API 参考](../../api/) - 查看完整 API 文档

## 常见问题

### Q: 如何切换主题？

A: 只需导入不同的主题包：

```typescript
// 默认主题
import '@ai-chat/themes/default';

// 气泡主题（仿微信/QQ 风格）
import '@ai-chat/themes/bubble';

// 扁平主题
import '@ai-chat/themes/flat';
```

### Q: 如何自定义样式？

A: 所有主题都使用 CSS 变量，您可以在自己的 CSS 中覆盖这些变量：

```css
:root {
  --ai-primary: #your-color;
  --ai-message-user-bg: #your-color;
  /* ... */
}
```

### Q: 如何兼容不同的 AI API？

A: 使用 API 适配器，详见 [API 适配器](./api-adapters.md)。

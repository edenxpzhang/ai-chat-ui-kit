# Components 包 API 参考

Components 包提供了基于 Lit 的 Web Components 封装，可直接在 HTML 中使用，也可在 React、Vue 等框架中使用。

## 安装

```bash
pnpm add @ai-chat/components @ai-chat/themes
```

## 组件列表

- [`<ai-chat>`](#ai-chat) - 聊天容器组件
- [`<ai-message>`](#ai-message) - 消息组件
- [`<ai-input>`](#ai-input) - 输入框组件
- [`<ai-tool-call>`](#ai-tool-call) - 工具调用组件

## `<ai-chat>`

聊天容器组件，包含所有子组件。

### 属性 (Properties)

| 属性 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `theme` | `string` | `'default'` | 主题名称 (`'default'`, `'bubble'`, `'flat'`) |
| `loading` | `boolean` | `false` | 是否显示加载状态 |
| `placeholder` | `string` | `'输入消息...'` | 输入框占位符 |
| `welcomeMessage` | `string` | `''` | 欢迎消息（AI 发送） |

### 方法 (Methods)

| 方法 | 参数 | 返回值 | 说明 |
|------|------|--------|------|
| `setMessageHandler` | `(handler: (message: string) => Promise<string>)` | `void` | 设置消息处理回调 |
| `addMessage` | `(message: Message)` | `void` | 添加一条消息 |
| `clearMessages` | - | `void` | 清除所有消息 |
| `getMessages` | - | `Message[]` | 获取所有消息 |
| `updateLastMessage` | `(content: string)` | `void` | 更新最后一条消息（用于流式响应） |
| `applyTheme` | `(theme: ThemeConfig)` | `void` | 应用主题 |

### 事件 (Events)

| 事件名 | 事件对象 | 说明 |
|--------|----------|------|
| `message-sent` | `{ detail: { message: string } }` | 用户发送消息时触发 |
| `message-received` | `{ detail: { message: string } }` | 收到 AI 回复时触发 |
| `loading-start` | - | 开始加载时触发 |
| `loading-end` | - | 结束加载时触发 |
| `error` | `{ detail: { error: string } }` | 发生错误时触发 |

### 插槽 (Slots)

| 插槽名 | 说明 |
|--------|------|
| (默认) | 消息列表区域 |
| `input` | 自定义输入框区域 |
| `header` | 自定义头部区域 |

### 使用示例

```html
<!-- 基本用法 -->
<ai-chat></ai-chat>

<!-- 设置主题 -->
<ai-chat theme="bubble"></ai-chat>

<!-- 设置欢迎消息 -->
<ai-chat welcome-message="你好！我是 AI 助手。"></ai-chat>
```

```javascript
// JavaScript 交互
const chat = document.querySelector('ai-chat');

// 设置消息处理回调
chat.setMessageHandler(async (message) => {
  // 调用您的 AI API
  const response = await fetch('/api/chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ message })
  });
  const data = await response.json();
  return data.reply;
});

// 添加消息
chat.addMessage({
  role: 'assistant',
  content: '你好！我是 AI 助手。'
});

// 监听事件
chat.addEventListener('message-sent', (e) => {
  console.log('Message sent:', e.detail.message);
});

chat.addEventListener('message-received', (e) => {
  console.log('Message received:', e.detail.message);
});
```

### React 中使用

```tsx
import React, { useEffect, useRef } from 'react';
import '@ai-chat/components';
import '@ai-chat/themes/default';

const ChatApp: React.FC = () => {
  const chatRef = useRef<HTMLElement>(null);

  useEffect(() => {
    if (chatRef.current) {
      (chatRef.current as any).setMessageHandler(async (message: string) => {
        const response = await fetch('/api/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ message })
        });
        const data = await response.json();
        return data.reply;
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

### Vue 3 中使用

```vue
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
    (chatRef.value as any).setMessageHandler(async (message: string) => {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message })
      });
      const data = await response.json();
      return data.reply;
    });
  }
});
</script>
```

## `<ai-message>`

消息组件，用于显示单条消息（通常不需要直接使用，由 `<ai-chat>` 内部管理）。

### 属性

| 属性 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `role` | `string` | `''` | 消息角色 (`'user'`, `'assistant'`, `'system'`) |
| `content` | `string` | `''` | 消息内容 |
| `timestamp` | `number` | `0` | 消息时间戳 |
| `avatar` | `string` | `''` | 自定义头像 URL 或 emoji |

### 插槽

| 插槽名 | 说明 |
|--------|------|
| (默认) | 消息内容 |
| `avatar` | 自定义头像 |

### 使用示例

```html
<ai-message
  role="user"
  content="Hello!"
  timestamp="1715600000000"
></ai-message>

<ai-message
  role="assistant"
  content="Hi there!"
></ai-message>
```

## `<ai-input>`

输入框组件（通常不需要直接使用，由 `<ai-chat>` 内部管理）。

### 属性

| 属性 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `placeholder` | `string` | `'输入消息...'` | 占位符 |
| `value` | `string` | `''` | 输入框值 |
| `disabled` | `boolean` | `false` | 是否禁用 |
| `loading` | `boolean` | `false` | 是否显示加载状态 |

### 事件

| 事件名 | 说明 |
|--------|------|
| `send` | 发送消息时触发 |
| `input` | 输入内容变化时触发 |
| `keydown` | 按键时触发 |

### 插槽

| 插槽名 | 说明 |
|--------|------|
| `prefix` | 输入框前缀 |
| `suffix` | 输入框后缀（默认包含发送按钮） |

### 使用示例

```html
<ai-input
  placeholder="输入消息..."
  (send)="onSend($event.detail)"
></ai-input>
```

## `<ai-tool-call>`

工具调用组件，用于显示 AI 调用的工具（如函数调用）。

### 属性

| 属性 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `name` | `string` | `''` | 工具名称 |
| `status` | `string` | `'running'` | 状态 (`'running'`, `'success'`, `'error'`) |
| `params` | `string` | `''` | 调用参数（JSON 字符串） |
| `result` | `string` | `''` | 调用结果 |

### 插槽

| 插槽名 | 说明 |
|--------|------|
| `icon` | 自定义图标 |
| `content` | 自定义内容 |

### 使用示例

```html
<ai-tool-call
  name="get_weather"
  status="running"
  params='{"location": "Beijing"}'
></ai-tool-call>

<ai-tool-call
  name="get_weather"
  status="success"
  params='{"location": "Beijing"}'
  result='{"temperature": 25, "condition": "Sunny"}'
></ai-tool-call>
```

## CSS 变量

所有组件都使用 CSS 变量，可在全局或组件级别覆盖。

### 完整 CSS 变量列表

```css
:root {
  /* 主色 */
  --ai-primary: #1677ff;
  --ai-primary-hover: #4096ff;
  --ai-primary-active: #0958d9;

  /* 背景色 */
  --ai-bg-primary: #ffffff;
  --ai-bg-secondary: #f5f5f5;
  --ai-bg-chat: #f0f2f5;

  /* 文本色 */
  --ai-text-primary: rgba(0, 0, 0, 0.88);
  --ai-text-secondary: rgba(0, 0, 0, 0.65);

  /* 消息气泡 */
  --ai-message-user-bg: #1677ff;
  --ai-message-user-text: #ffffff;
  --ai-message-ai-bg: #ffffff;
  --ai-message-ai-text: rgba(0, 0, 0, 0.88);

  /* 输入框 */
  --ai-input-bg: #ffffff;
  --ai-input-border: #d9d9d9;
  --ai-input-focus-border: #1677ff;

  /* 圆角 */
  --ai-radius-sm: 4px;
  --ai-radius-md: 8px;
  --ai-radius-lg: 12px;

  /* 间距 */
  --ai-spacing-xs: 4px;
  --ai-spacing-sm: 8px;
  --ai-spacing-md: 12px;
  --ai-spacing-lg: 16px;
}
```

### 覆盖示例

```css
/* 全局覆盖 */
:root {
  --ai-primary: #your-color;
}

/* 组件级别覆盖 */
ai-chat {
  --ai-primary: #your-color;
}
```

## 下一步

- [Core 包 API](./core.md)
- [主题定制](../guide/themes.md)
- [插件开发](../guide/plugins.md)

# @ai-chat-ui-kit/components

Web Components for AI Chat UI Kit - Built with Lit, framework-agnostic.

![Version](https://img.shields.io/npm/v/@ai-chat-ui-kit/components.svg)
![License](https://img.shields.io/npm/l/@ai-chat-ui-kit/components.svg)
![Lit](https://img.shields.io/badge/Lit-3.0-orange.svg)

## ✨ Features

- 🚀 **Web Components** - 原生组件，跨框架兼容（React / Vue / 原生 HTML）
- 🎛 **受控模式（v0.2+）** - `controlled` + `ai-chat-send` 事件，React 无缝集成
- 🪟 **富交互 Slot（v0.2+）** - `<ai-message>` 支持 `actions` / `footer` / `content-extra` slot，HITL 场景刚需
- 🌊 **流式 Markdown（v0.2+）** - `<ai-markdown>` 提供 `appendContent(chunk)` 增量追加 API
- ⚛️ **React TS 友好（v0.2+）** - 提供 `@ai-chat-ui-kit/components/react` JSX 类型声明
- 🎨 **6 Built-in Themes** - 配合 `@ai-chat-ui-kit/themes` 使用

## 📦 Installation

```bash
pnpm add @ai-chat-ui-kit/components @ai-chat-ui-kit/themes
```

## 🚀 Quick Start

### React + 受控模式（推荐）

```tsx
import React, { useState } from 'react';
import '@ai-chat-ui-kit/components';
import '@ai-chat-ui-kit/components/react'; // JSX 类型声明
import { applyTheme } from '@ai-chat-ui-kit/themes';

applyTheme('minimal');

function ChatApp() {
  const [messages, setMessages] = useState<Message[]>([]);

  const handleSend = (e: CustomEvent<{ content: string; id: string }>) => {
    // 1. 追加用户消息
    setMessages(prev => [...prev, {
      id: e.detail.id,
      role: 'user',
      content: e.detail.content,
      timestamp: Date.now(),
    }]);

    // 2. 调用后端，把回复贴回去
    fetch('/api/chat', { method: 'POST', body: JSON.stringify({ msg: e.detail.content }) })
      .then(r => r.json())
      .then(data => {
        setMessages(prev => [...prev, {
          id: data.id,
          role: 'assistant',
          content: data.content,
          timestamp: Date.now(),
        }]);
      });
  };

  return (
    <ai-chat
      controlled
      messages={messages}
      onAiChatSend={handleSend}
    />
  );
}
```

### HITL 富交互（按钮组 / 选项卡）

```tsx
function HITLMessage({ message }) {
  return (
    <ai-message message={message}>
      <div slot="actions">
        <button data-action="continue">继续</button>
        <button data-action="modify" data-step="2">修改</button>
        <button data-action="abort">终止</button>
      </div>
      <div slot="footer">
        由 PlannerAgent · {new Date().toLocaleTimeString()} 提供
      </div>
    </ai-message>
  );
}

// 监听按钮点击（事件冒泡到 <ai-chat>）
<ai-chat
  controlled
  messages={messages}
  onAiChatAction={(e) => {
    // e.detail = { actionId, messageId, payload: { step?: '2' } }
    if (e.detail.actionId === 'continue') resumeAgent();
    if (e.detail.actionId === 'abort') stopAgent();
  }}
/>
```

### 流式 Markdown（chunk 增量追加）

```ts
const md = document.querySelector('ai-markdown')!;
md.streaming = true;

const stream = await fetch('/api/chat/stream').then(r => r.body!.getReader());
const decoder = new TextDecoder();

while (true) {
  const { done, value } = await stream.read();
  if (done) break;
  md.appendContent(decoder.decode(value));
}

md.streaming = false;
```

### 原生 HTML（Vanilla）

```html
<!DOCTYPE html>
<html>
<head>
  <script type="module">
    import '@ai-chat-ui-kit/components';
    import { applyTheme } from '@ai-chat-ui-kit/themes';
    applyTheme('minimal');
  </script>
</head>
<body>
  <ai-chat></ai-chat>
</body>
</html>
```

### Vue 3

```vue
<template>
  <ai-chat
    :controlled="true"
    :messages.prop="messages"
    @ai-chat-send="handleSend"
  />
</template>

<script setup lang="ts">
import { ref } from 'vue';
import '@ai-chat-ui-kit/components';
const messages = ref([]);
function handleSend(e: CustomEvent) { /* ... */ }
</script>
```

## 📖 Components API

### `<ai-chat>` — 聊天容器

**Properties:**

| 属性 | 类型 | 默认 | 说明 |
| --- | --- | --- | --- |
| `controlled` | `boolean` | `false` | 受控模式：组件不维护内部状态，由 `messages` 决定渲染 |
| `messages` | `Message[]` | `[]` | 受控模式下的消息数组 |
| `theme` | `string` | `'default'` | 主题名 |
| `headless` | `boolean` | `true` | 是否使用 light DOM（默认 true，让主题 CSS 能命中） |
| `header-title` | `string` | `'AI Assistant'` | 标题 |
| `header-subtitle` | `string` | `'在线 · 随时为您服务'` | 副标题 |
| `header-avatar` | `string` | `'🤖'` | 头像 emoji / 字符 |
| `hide-header` | `boolean` | `false` | 是否隐藏 header |

**Events:**

| 事件名 | detail | 说明 |
| --- | --- | --- |
| `ai-chat-send` | `{ content, id }` | 用户提交输入时派发（始终触发） |
| `ai-chat-action` | `{ actionId, messageId, payload }` | 子消息中带 `data-action` 的元素被点击时派发 |
| `message-sent` | `{ message }` | 非受控模式：用户消息追加后派发 |
| `message-received` | `{ message }` | 非受控模式：模拟 AI 回复后派发 |
| `input-change` | `{ value }` | 输入框内容变化 |

**Methods（仅非受控模式生效）:**

| 方法 | 签名 | 说明 |
| --- | --- | --- |
| `addMessage` | `(msg: Partial<Message>) => void` | 追加预设消息 |
| `setLoading` | `(loading: boolean) => void` | 切换 loading 状态（打字指示器） |
| `clearMessages` | `() => void` | 清空消息 |
| `exportSession` | `() => string` | 导出 JSON |
| `importSession` | `(data: string) => void` | 导入 JSON |

**Slots:**

- `header` 整体替换 header
- `header-actions` header 右侧操作区
- `empty` 空态自定义内容
- `footer` 输入框下方追加内容

### `<ai-message>` — 消息组件

**Properties:**

| 属性 | 类型 | 说明 |
| --- | --- | --- |
| `message` | `Message` | 消息对象 |
| `theme` | `string` | 主题名 |
| `headless` | `boolean` | 是否 light DOM（默认 true） |

**Slots（v0.2 新增）:**

- `content-extra` 内容下方插入扩展元素（如代码块卡片）
- `actions` 操作按钮区，按钮加 `data-action="xxx"` 会触发 `ai-message-action` 事件
- `footer` 底部签名 / 元信息

**Events:**

| 事件名 | detail | 说明 |
| --- | --- | --- |
| `ai-message-action` | `{ actionId, messageId, payload }` | slot 内带 `data-action` 的元素被点击时派发；会冒泡到 `<ai-chat>` 转化为 `ai-chat-action` |

### `<ai-input>` — 输入组件

| 属性 | 类型 | 默认 | 说明 |
| --- | --- | --- | --- |
| `disabled` | `boolean` | `false` | 禁用 |
| `placeholder` | `string` | `'输入消息...'` | 占位符 |
| `send-text` | `string` | `'发送'` | 发送按钮文案 |

**Events:**
- `send: { content }`
- `input-change: { value }`

### `<ai-markdown>` — Markdown 渲染（v0.2 增强）

**Properties:**

| 属性 | 类型 | 默认 | 说明 |
| --- | --- | --- | --- |
| `content` | `string` | `''` | Markdown 字符串 |
| `plugins` | `string[]` | `[]` | 启用的插件（`mermaid` / `latex`） |
| `streaming` | `boolean` | `false` | 流式模式标记 |

**Methods（v0.2 新增）:**

| 方法 | 签名 | 说明 |
| --- | --- | --- |
| `appendContent` | `(chunk: string) => void` | 流式追加 chunk |
| `resetContent` | `() => void` | 重置内容 |

**Events:**

| 事件名 | detail | 说明 |
| --- | --- | --- |
| `ai-markdown-rendered` | `{ contentLength, streaming }` | 每次渲染完成时派发（可用于自动滚动到底） |

### `<ai-tool-call>` — 工具调用展示

```html
<ai-tool-call .toolCall=${{
  id: 't1', name: 'get_weather', status: 'running',
  parameters: { location: 'Beijing' }
}}></ai-tool-call>
```

## ⚛️ React TypeScript 类型

通过 `@ai-chat-ui-kit/components/react` 引入 JSX 类型扩展：

### 方式 1：tsconfig（推荐）

```json
{
  "compilerOptions": {
    "types": ["@ai-chat-ui-kit/components/react"]
  }
}
```

### 方式 2：triple-slash directive

```ts
/// <reference types="@ai-chat-ui-kit/components/react" />
```

### 方式 3：副作用 import

```ts
import '@ai-chat-ui-kit/components/react';
```

任意一种方式后，`<ai-chat>` `<ai-message>` 等标签即可直接在 JSX 中使用，类型完整。

## 🎨 配合 Themes 使用

```ts
import { applyTheme } from '@ai-chat-ui-kit/themes';

// 全局换肤
applyTheme('glass');

// 局部换肤（弹窗内独立主题）
applyTheme('glass', modalContainer);
```

详细 API 见 [`@ai-chat-ui-kit/themes`](../themes/README.md)。

## 📜 Changelog

### 0.2.0 (2026-05-15)

- 🎉 `<ai-chat>` 新增 `controlled` 属性 + `ai-chat-send` / `ai-chat-action` 事件
- 🎉 `<ai-chat>` 新增 `setLoading()` 方法
- 🎉 `<ai-message>` 新增 `actions` / `footer` / `content-extra` 三个 slot
- 🎉 `<ai-message>` 新增 `ai-message-action` 事件（自动派发带 `data-action` 元素的点击）
- 🎉 `<ai-markdown>` 新增 `appendContent()` / `resetContent()` 方法 + `streaming` 属性
- 🎉 `<ai-markdown>` 新增 `ai-markdown-rendered` 事件
- 🎉 新增 `./react` 子路径导出（React JSX 类型声明）
- ✅ 完全向后兼容：旧的 `addMessage` / `message-sent` / `message-received` 保留

### 0.1.1

- 5 个 Web Components 首版：`<ai-chat>` `<ai-message>` `<ai-input>` `<ai-tool-call>` `<ai-markdown>`

## 📦 Dependencies

- `lit ^3.0.0`

## 📄 License

[MIT License](https://github.com/edenxpzhang/ai-chat-ui-kit/blob/master/LICENSE)

## 🔗 Links

- [GitHub Repository](https://github.com/edenxpzhang/ai-chat-ui-kit)
- [Documentation](https://edenxpzhang.github.io/ai-chat-ui-kit/)
- [Issues](https://github.com/edenxpzhang/ai-chat-ui-kit/issues)

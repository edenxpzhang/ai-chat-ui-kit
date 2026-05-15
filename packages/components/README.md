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

## 🎨 引入样式（必读）

`<ai-chat>` 等组件默认走 light DOM（`headless = true`），因此**需要把组件的 light DOM 兜底样式注入到页面**。任选一种方式：

```ts
// 推荐：通过 ./style.css 子路径（与 antd / element-plus 风格一致）
import '@ai-chat-ui-kit/components/style.css';

// 或：直接指定 dist 路径（向后兼容）
import '@ai-chat-ui-kit/components/dist/index.css';
```

> **v0.2.1+**：包 `sideEffects` 已声明 `**/*.css`，构建工具会自动保留 css 副作用。
> **headless 模式**：若你完全自己写样式，可设 `<ai-chat headless>` 但不引入 style.css（详见下方）。

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
| `input-placeholder` | `string` | `'输入消息...'` | 透传给内部 `<ai-input>` 的占位符（v0.2.3+） |
| `send-text` | `string` | `'发送'` | 透传给内部 `<ai-input>` 的发送按钮文案（v0.2.3+） |

**Events:**

| 事件名 | detail | 说明 |
| --- | --- | --- |
| `ai-chat-send` | `{ content, id }` | 用户提交输入时派发（始终触发） |
| `ai-chat-action` | `{ actionId, messageId, payload }` | 子消息中带 `data-action` 的元素被点击时派发 |
| `ai-chat-ready` | `void` | 组件首次渲染完成时派发（v0.2.3+），可在该事件后再写入 `.messages` 以避免 SSR / 懒挂载场景的赋值竞态 |
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
- `input` 替换内部输入区（v0.2.3+），用于宿主接入上传 / 录音 / @提及等扩展输入控件
- `footer` 输入框下方追加内容

> **布局约束**：`<ai-chat>` 的父容器必须具有确定的高度（`height` 或 `display:flex; min-height:0` 的 flex 基线），否则 `.ai-chat__messages` 的 `flex:1` 拿不到剩余空间，输入框将无法沉底。在受限宽度的 flex 容器（如 antd `Drawer` / 侧边栏）内，输入区 / 输入框已内置 `flex-shrink:0` + `min-width:0` 兜底（v0.2.3+）。

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

**CSS 变量（v0.2.3+，禁用态主题化）:**

| 变量 | 默认值 | 说明 |
| --- | --- | --- |
| `--ai-input-send-bg` | `#1677ff` | 发送按钮启用态背景色 |
| `--ai-input-send-color` | `#fff` | 发送按钮启用态文字色 |
| `--ai-input-send-bg-disabled` | `#d9d9d9` | 发送按钮禁用态背景色 |
| `--ai-input-send-color-disabled` | `rgba(0, 0, 0, 0.25)` | 发送按钮禁用态文字色 |

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

### React 集成常见坑（必读）

`<ai-chat>` 是 LitElement Web Component，与 React 集成时有几个一定要避开的细节：

1. **布尔属性**（`controlled` / `hide-header`）必须裸名书写或写 `=""`，**不能驼峰**：

   ```tsx
   // ✅ OK
   <ai-chat controlled hide-header />
   <ai-chat controlled="" hide-header="" />

   // ❌ NO（不会被识别为 attribute）
   <ai-chat hideHeader />
   ```

2. **复杂属性 `messages` 必须通过 `ref` 用 property 赋值**，因为它是 Lit `@property({ attribute: false })`：

   ```tsx
   const chatRef = useRef<HTMLElement>(null);

   useEffect(() => {
     if (chatRef.current) {
       (chatRef.current as any).messages = messages;
     }
   }, [messages]);

   return <ai-chat ref={chatRef} controlled />;
   ```

   或者使用 `@ai-chat-ui-kit/components/react` 提供的 JSX 类型后直接用 `messages={messages}`，由内部统一处理为 property。

3. **自定义事件需要 `addEventListener`**（React 不支持 kebab-case 事件 prop）：

   ```tsx
   useEffect(() => {
     const el = chatRef.current;
     if (!el) return;
     const onSend = (e: Event) => handleSend(e as CustomEvent);
     const onAction = (e: Event) => handleAction(e as CustomEvent);
     el.addEventListener('ai-chat-send', onSend);
     el.addEventListener('ai-chat-action', onAction);
     return () => {
       el.removeEventListener('ai-chat-send', onSend);
       el.removeEventListener('ai-chat-action', onAction);
     };
   }, []);
   ```

   引入 `@ai-chat-ui-kit/components/react` 后亦支持 `onAiChatSend` / `onAiChatAction` 形式（已在 JSX 类型中声明）。

4. **`React.StrictMode` 双触发去重**：开发期 `useEffect` 会执行两次，若你在 effect 中向 `<ai-chat>` 推消息，应使用消息 `id` 做幂等检查，避免重复追加：

   ```tsx
   const seenIds = useRef(new Set<string>());
   const append = (msg: Message) => {
     if (seenIds.current.has(msg.id)) return;
     seenIds.current.add(msg.id);
     setMessages(prev => [...prev, msg]);
   };
   ```

5. **首屏赋值时机**（v0.2.3+）：在 `Drawer destroyOnClose=false` / 懒挂载 / HMR 等场景下，建议监听 `ai-chat-ready` 后再做首次 `messages` 赋值：

   ```tsx
   useEffect(() => {
     const el = chatRef.current;
     if (!el) return;
     const onReady = () => {
       (el as any).messages = initialMessages;
     };
     el.addEventListener('ai-chat-ready', onReady);
     return () => el.removeEventListener('ai-chat-ready', onReady);
   }, []);
   ```

6. **`messages` 始终传新引用**：受控模式下请使用 `[...messages, newOne]` 或 `messages.concat(newOne)`，**不要原地 `arr.push()`**。组件内部已在 `hasChanged` 中加了长度比对兜底，但仍建议遵循"新引用"惯例以兼容更深的引用相等比较场景。



## 🎨 配合 Themes 使用

```ts
import { applyTheme } from '@ai-chat-ui-kit/themes';

// 全局换肤
applyTheme('glass');

// 局部换肤（弹窗内独立主题）
applyTheme('glass', modalContainer);
```

详细 API 见 [`@ai-chat-ui-kit/themes`](../themes/README.md)。

## 🧱 Headless 模式

所有组件都暴露了 `headless` 属性，**默认 `true`**。其含义如下：

| `headless` | 渲染策略 | 适用场景 |
| --- | --- | --- |
| `true`（默认） | 走 **light DOM**：组件 DOM 出现在外部树中，可被全局 CSS / 主题包样式命中 | 99% 的业务场景，配合 `@ai-chat-ui-kit/themes` 使用 |
| `false` | 走 **Shadow DOM**：组件样式与外部完全隔离 | 嵌入到样式复杂的第三方页面、需要 100% 样式隔离时 |

```html
<!-- 默认：light DOM + 引入 style.css + 主题 -->
<ai-chat></ai-chat>

<!-- Shadow DOM：完全样式隔离，外部 CSS 进不去，需自带样式 -->
<ai-chat headless="false"></ai-chat>
```

⚠️ **headless=false 时不要引入 `./style.css`**：light DOM 样式无法穿透 Shadow DOM；同时 `applyTheme(theme, target)` 的局部模式对 Shadow DOM 内部不生效（因为 CSS Variables 不会自动透传到 closed shadow root）。如需 Shadow DOM 内换肤，可在 `headless=false` 模式下：

```ts
// 拿到 shadowRoot 后手动注入
const chatEl = document.querySelector('ai-chat')!;
const shadow = (chatEl as any).renderRoot as ShadowRoot;
applyTheme('glass', shadow.host as HTMLElement); // 仍走 light DOM API
```



## 📜 Changelog

### 0.2.3 (2026-05-15)

集中修复在受控（HITL）模式 + 受限宽/高容器场景下的若干问题：

- 🔴 **P0** 修复 `<ai-input>` 在受限宽度 flex 容器（antd `Drawer` / 侧边栏 / 网格分栏）中被压扁、按钮飞出
  - `ai-input` 增加 `width:100%` / `flex-shrink:0` / `box-sizing:border-box`
  - `.ai-input__wrapper` / `.ai-input` 显式 `width:100%`
  - `.ai-input__textarea` 增加 `min-width:0`，修掉 flex 经典坑（默认 `min-width:auto` 撑爆父容器）
- 🔴 **P0** 修复 `<ai-chat>` 输入区不沉底
  - 对内部 `<ai-input>` 与 `slot[name="footer"]` 增加 `flex:0 0 auto` 兜底，避免父高度紧张时被压缩到 0
  - README 增加宿主"父容器需有确定高度"的布局约束说明
- 🟡 **P1** 修复发送按钮禁用态视觉对比度过弱
  - 禁用态改用 `#d9d9d9` 背景 + `rgba(0,0,0,0.25)` 文字，`opacity:1`
  - 暴露 `--ai-input-send-bg(-disabled)` / `--ai-input-send-color(-disabled)` 四个 CSS 变量供主题覆盖
- 🟡 **P1** `<ai-chat>` 新增 `input-placeholder` / `send-text` 属性，透传给内部 `<ai-input>`
- 🟡 **P1** `<ai-chat>` 新增 `ai-chat-ready` 生命周期事件（`firstUpdated` 派发），便于宿主在懒挂载 / SSR / StrictMode 场景规避 `.messages` 赋值竞态
- 🟢 **P2** `<ai-chat>` 新增 `<slot name="input">`，宿主可整体替换输入区（上传 / 录音 / @提及 / 富文本输入等）
- 🟢 **P2** `messages` 属性增加 `hasChanged`：除引用变更外，长度变化也视为变更，原地 `push` 也能触发重渲染（仍推荐"新引用"写法）
- 📝 README 新增"React 集成常见坑（必读）"章节，覆盖布尔属性命名、property 赋值、自定义事件监听、StrictMode 去重、`ai-chat-ready` 用法、`messages` 引用规范

### 0.2.2 (2026-05-15)

- 🔴 **关键修复**：`tsconfig.json` 中 `useDefineForClassFields: true` 与 Lit `@property` 装饰器冲突，导致编译后 class fields 用 `Object.defineProperty` 覆盖了装饰器注册的 getter/setter；受控模式下 `el.messages = [...]` 不触发重渲染
- ✅ 修复：将 `packages/components/tsconfig.json` 的 `useDefineForClassFields` 改为 `false`，一行修复 11 个属性
- 影响范围：所有使用受控模式 / property binding 的场景；浏览器控制台不再抛 `class-field-shadowing` 错误
- 参考：https://lit.dev/msg/class-field-shadowing

### 0.2.1 (2026-05-15)

- 🔴 修复 `package.json#exports` 缺少 css 导出（导致 Vite/Node 严格模式下 `import '@ai-chat-ui-kit/components/dist/index.css'` 失败）
- 🎉 新增 `./style.css` / `./style` 子路径导出（与 antd / element-plus 风格一致）
- 🎉 保留 `./dist/index.css` 路径以向后兼容已有用法
- 🎉 新增顶层 `style` 字段（兼容 webpack mainFields）
- 🎉 声明 `sideEffects: ["**/*.css", "./dist/index.js", "./dist/index.cjs"]`，确保构建工具保留 CSS 副作用
- 📝 README 增加「引入样式（必读）」一节
- 📝 README 增加「Headless 模式」一节文档

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

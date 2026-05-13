# AI Chat UI Kit - API Documentation

Complete API reference for @ai-chat/core, @ai-chat/components, and @ai-chat/themes.

## Table of Contents

1. [Installation](#installation)
2. [Components API](#components-api)
3. [Core API](#core-api)
4. [Themes API](#themes-api)
5. [TypeScript Types](#typescript-types)
6. [Examples](#examples)

## Installation

```bash
pnpm add @ai-chat/core @ai-chat/components @ai-chat/themes
```

## Components API

### `<ai-chat>`

Main chat container web component.

**Tag:** `<ai-chat>`

**Properties:**

| Property | Type | Default | Description |
|----------|------|---------|-------------|
| `placeholder` | `string` | `'Type a message...'` | Input placeholder text |
| `disabled` | `boolean` | `false` | Disable user input |
| `loading` | `boolean` | `false` | Show loading state |

**Methods:**

```typescript
setMessageHandler(handler: (message: string) => Promise<string>): void
```
Set the AI response handler. The handler receives user message and should return AI response.

```typescript
addMessage(role: 'user' | 'assistant', content: string): void
```
Add a message programmatically.

```typescript
clearMessages(): void
```
Clear all messages.

```typescript
setTheme(theme: Theme): void
```
Apply a theme programmatically.

**Events:**

| Event | Payload | Description |
|-------|---------|-------------|
| `message-sent` | `{ message: string }` | Fired when user sends a message |
| `message-received` | `{ message: string }` | Fired when AI response is received |
| `theme-changed` | `{ theme: string }` | Fired when theme is changed |

**CSS Custom Properties:**

```css
ai-chat {
  --ai-chat-bg: #ffffff;
  --ai-chat-border: 1px solid #e0e0e0;
  --ai-chat-border-radius: 12px;
  --ai-chat-height: 600px;
  --ai-chat-width: 400px;
  --ai-chat-font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  
  /* User bubble */
  --ai-chat-user-bubble-bg: #007aff;
  --ai-chat-user-bubble-color: #ffffff;
  --ai-chat-user-bubble-radius: 18px 18px 4px 18px;
  
  /* Assistant bubble */
  --ai-chat-assistant-bubble-bg: #f0f0f0;
  --ai-chat-assistant-bubble-color: #333333;
  --ai-chat-assistant-bubble-radius: 18px 18px 18px 4px;
  
  /* Input area */
  --ai-chat-input-bg: #ffffff;
  --ai-chat-input-border: 1px solid #e0e0e0;
  --ai-chat-input-radius: 20px;
  --ai-chat-input-padding: 10px 16px;
  
  /* Typing indicator */
  --ai-chat-typing-dot-color: #999999;
}
```

**Example:**

```html
<ai-chat placeholder="Ask me anything..."></ai-chat>

<script>
  const chat = document.querySelector('ai-chat');
  chat.setMessageHandler(async (message) => {
    const response = await fetch('/api/chat', {
      method: 'POST',
      body: JSON.stringify({ message })
    });
    const data = await response.json();
    return data.reply;
  });
</script>
```

---

### `<ai-message>`

Individual message web component.

**Tag:** `<ai-message>`

**Properties:**

| Property | Type | Default | Description |
|----------|------|---------|-------------|
| `role` | `'user' \| 'assistant'` | required | Message sender role |
| `content` | `string` | `''` | Message content (supports markdown) |
| `loading` | `boolean` | `false` | Show typing indicator |
| `avatar` | `string` | `''` | Avatar image URL |
| `name` | `string` | `''` | Sender name |

**CSS Custom Properties:**

```css
ai-message {
  --ai-message-margin: 8px 0;
  --ai-message-max-width: 70%;
  
  /* User message */
  --ai-message-user-bg: #007aff;
  --ai-message-user-color: #ffffff;
  
  /* Assistant message */
  --ai-message-assistant-bg: #f0f0f0;
  --ai-message-assistant-color: #333333;
}
```

**Example:**

```html
<ai-message 
  role="assistant" 
  content="Hello! How can I help you?" 
  name="AI Assistant">
</ai-message>
```

---

### `<ai-input>`

Input web component with auto-resize.

**Tag:** `<ai-input>`

**Properties:**

| Property | Type | Default | Description |
|----------|------|---------|-------------|
| `placeholder` | `string` | `'Type a message...'` | Placeholder text |
| `disabled` | `boolean` | `false` | Disable input |
| `value` | `string` | `''` | Input value |
| `rows` | `number` | `1` | Minimum rows |
| `max-rows` | `number` | `5` | Maximum rows before scroll |

**Methods:**

```typescript
focus(): void
```
Focus the input.

```typescript
clear(): void
```
Clear the input value.

**Events:**

| Event | Payload | Description |
|-------|---------|-------------|
| `send` | `{ value: string }` | Fired when user sends message (Enter) |
| `input` | `{ value: string }` | Fired on input change |
| `focus` | - | Fired when input is focused |
| `blur` | - | Fired when input loses focus |

**CSS Custom Properties:**

```css
ai-input {
  --ai-input-bg: #ffffff;
  --ai-input-border: 1px solid #e0e0e0;
  --ai-input-radius: 20px;
  --ai-input-padding: 10px 16px;
  --ai-input-font-size: 14px;
  --ai-input-line-height: 1.5;
}
```

---

### `<ai-tool-call>`

Tool call visualization web component.

**Tag:** `<ai-tool-call>`

**Properties:**

| Property | Type | Default | Description |
|----------|------|---------|-------------|
| `name` | `string` | `''` | Tool name |
| `status` | `'pending' \| 'running' \| 'success' \| 'error'` | `'pending'` | Call status |
| `result` | `any` | `null` | Tool execution result |
| `args` | `object` | `{}` | Tool arguments |

**CSS Custom Properties:**

```css
ai-tool-call {
  --ai-tool-call-bg: #f5f5f5;
  --ai-tool-call-border: 1px solid #e0e0e0;
  --ai-tool-call-radius: 8px;
  --ai-tool-call-pending-color: #999999;
  --ai-tool-call-running-color: #007aff;
  --ai-tool-call-success-color: #34c759;
  --ai-tool-call-error-color: #ff3b30;
}
```

**Example:**

```html
<ai-tool-call 
  name="get_weather" 
  status="running"
  args='{"location": "Beijing"}'>
</ai-tool-call>
```

---

## Core API

### `createChatStore()`

Create chat state management store.

**Signature:**

```typescript
function createChatStore(config?: ChatStoreConfig): ChatStore;
```

**Config:**

```typescript
interface ChatStoreConfig {
  initialState?: Partial<ChatState>;
  middleware?: Middleware[];
}
```

**ChatState:**

```typescript
interface ChatState {
  messages: Message[];
  loading: boolean;
  error: string | null;
  theme: string;
}
```

**ChatStore:**

```typescript
interface ChatStore {
  getState(): ChatState;
  dispatch(action: Action): void;
  subscribe(listener: (state: ChatState) => void): () => void;
}
```

**Actions:**

```typescript
type Action =
  | { type: 'ADD_MESSAGE'; payload: Message }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'CLEAR_MESSAGES' }
  | { type: 'SET_THEME'; payload: string };
```

**Example:**

```typescript
import { createChatStore } from '@ai-chat/core';

const store = createChatStore({
  initialState: {
    messages: [],
    loading: false
  }
});

store.subscribe((state) => {
  console.log('Messages:', state.messages);
  console.log('Loading:', state.loading);
});

store.dispatch({
  type: 'ADD_MESSAGE',
  payload: { role: 'user', content: 'Hello' }
});
```

---

### `createAPIAdapter()`

Create API adapter for different AI backends.

**Signature:**

```typescript
function createAPIAdapter(config: APIAdapterConfig): APIAdapter;
```

**APIAdapterConfig:**

```typescript
interface APIAdapterConfig {
  type: 'openai' | 'anthropic' | 'custom';
  apiKey?: string;
  model?: string;
  endpoint?: string;
  headers?: Record<string, string>;
}
```

**APIAdapter:**

```typescript
interface APIAdapter {
  sendMessage(message: string, history?: Message[]): Promise<string>;
  streamMessage?(message: string, history?: Message[]): AsyncIterable<string>;
}
```

**OpenAI Example:**

```typescript
import { createAPIAdapter } from '@ai-chat/core';

const adapter = createAPIAdapter({
  type: 'openai',
  apiKey: process.env.OPENAI_API_KEY,
  model: 'gpt-4'
});

const response = await adapter.sendMessage('Hello!');
console.log(response);
```

**Anthropic Example:**

```typescript
const adapter = createAPIAdapter({
  type: 'anthropic',
  apiKey: process.env.ANTHROPIC_API_KEY,
  model: 'claude-3-opus'
});
```

**Custom API Example:**

```typescript
const adapter = createAPIAdapter({
  type: 'custom',
  endpoint: 'https://your-api.com/chat',
  headers: {
    'Authorization': `Bearer ${token}`
  }
});
```

---

### `createPluginSystem()`

Create plugin system for extending functionality.

**Signature:**

```typescript
function createPluginSystem(): PluginSystem;
```

**Plugin Interface:**

```typescript
interface Plugin {
  name: string;
  install(context: PluginContext): void;
  uninstall?(context: PluginContext): void;
}
```

**PluginContext:**

```typescript
interface PluginContext {
  getStore(): ChatStore;
  getAdapter(): APIAdapter;
  registerHook(name: string, handler: Function): void;
  emitHook(name: string, ...args: any[]): void;
}
```

**PluginSystem:**

```typescript
interface PluginSystem {
  register(plugin: Plugin): void;
  unregister(name: string): void;
  getPlugin(name: string): Plugin | undefined;
}
```

**Example:**

```typescript
import { createPluginSystem, Plugin } from '@ai-chat/core';

const loggerPlugin: Plugin = {
  name: 'logger',
  install: (context) => {
    const store = context.getStore();
    store.subscribe((state) => {
      console.log('[Logger Plugin] State changed:', state);
    });
  }
};

const pluginSystem = createPluginSystem();
pluginSystem.register(loggerPlugin);
```

---

## Themes API

### Available Themes

| Theme | Export Name | Description |
|-------|-------------|-------------|
| Minimal | `minimalTheme` | Minimalist Apple-style, rounded bubbles |
| Neon | `neonTheme` | Cyberpunk dark with neon glow |
| Glass | `glassTheme` | Glassmorphism with blur effect |
| Terminal | `terminalTheme` | Retro terminal, green text + scanlines |
| Gradient | `gradientTheme` | Colorful gradient bubbles |
| Corporate | `corporateTheme` | Professional blue theme |

### `applyTheme()`

Apply a theme to the chat component.

**Signature:**

```typescript
function applyTheme(theme: Theme): void;
```

**Example:**

```typescript
import { applyTheme } from '@ai-chat/themes';
import { minimalTheme } from '@ai-chat/themes/minimal';
import { neonTheme } from '@ai-chat/themes/neon';

// Apply minimal theme
applyTheme(minimalTheme);

// Switch to neon theme
applyTheme(neonTheme);
```

### Import Themes

```typescript
// Import all themes
import '@ai-chat/themes/minimal';
import '@ai-chat/themes/neon';
import '@ai-chat/themes/glass';
import '@ai-chat/themes/terminal';
import '@ai-chat/themes/gradient';
import '@ai-chat/themes/corporate';

// Import theme objects for runtime switching
import { minimalTheme } from '@ai-chat/themes/minimal';
import { neonTheme } from '@ai-chat/themes/neon';
import { glassTheme } from '@ai-chat/themes/glass';
import { terminalTheme } from '@ai-chat/themes/terminal';
import { gradientTheme } from '@ai-chat/themes/gradient';
import { corporateTheme } from '@ai-chat/themes/corporate';
```

### Theme Type

```typescript
interface Theme {
  name: string;
  colors: {
    primary: string;
    secondary: string;
    background: string;
    surface: string;
    text: string;
    textSecondary: string;
  };
  typography: {
    fontFamily: string;
    fontSize: number;
    lineHeight: number;
  };
  spacing: {
    small: number;
    medium: number;
    large: number;
  };
  borderRadius: number;
}
```

---

## TypeScript Types

### Message

```typescript
interface Message {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: number;
  loading?: boolean;
}
```

### ChatState

```typescript
interface ChatState {
  messages: Message[];
  loading: boolean;
  error: string | null;
  theme: string;
}
```

### Theme

```typescript
interface Theme {
  name: string;
  colors: ThemeColors;
  typography: ThemeTypography;
  spacing: ThemeSpacing;
  borderRadius: number;
}
```

### Plugin

```typescript
interface Plugin {
  name: string;
  install(context: PluginContext): void;
  uninstall?(context: PluginContext): void;
}
```

---

## Examples

### Basic Chat

```typescript
import '@ai-chat/components';
import '@ai-chat/themes/minimal';

const chat = document.querySelector('ai-chat');

chat.setMessageHandler(async (message) => {
  // Simulate API call
  await new Promise(resolve => setTimeout(resolve, 1000));
  return `You said: ${message}`;
});
```

### Headless Mode

```typescript
import { createChatStore } from '@ai-chat/core';

const store = createChatStore();

// Render UI based on store state
store.subscribe((state) => {
  renderMessages(state.messages);
  setLoading(state.loading);
});

// Dispatch actions
store.dispatch({
  type: 'ADD_MESSAGE',
  payload: { role: 'user', content: 'Hello' }
});
```

### With React

```tsx
import React, { useEffect, useRef } from 'react';
import '@ai-chat/components';
import '@ai-chat/themes/minimal';

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

### With Vue 3

```vue
<template>
  <div style="height: 100vh">
    <ai-chat ref="chatRef"></ai-chat>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import '@ai-chat/components';
import '@ai-chat/themes/minimal';

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

### Custom Plugin

```typescript
import { createPluginSystem, Plugin } from '@ai-chat/core';

const persistencePlugin: Plugin = {
  name: 'persistence',
  install: (context) => {
    const store = context.getStore();
    
    // Load saved messages
    const saved = localStorage.getItem('chat-messages');
    if (saved) {
      const messages = JSON.parse(saved);
      messages.forEach((msg: Message) => {
        store.dispatch({ type: 'ADD_MESSAGE', payload: msg });
      });
    }
    
    // Save messages on change
    store.subscribe((state) => {
      localStorage.setItem('chat-messages', JSON.stringify(state.messages));
    });
  }
};

const pluginSystem = createPluginSystem();
pluginSystem.register(persistencePlugin);
```

---

## FAQ

### How to customize bubble styles?

Use CSS custom properties:

```css
ai-chat {
  --ai-chat-user-bubble-bg: #ff6b6b;
  --ai-chat-user-bubble-color: #ffffff;
  --ai-chat-assistant-bubble-bg: #f8f9fa;
  --ai-chat-assistant-bubble-color: #212529;
}
```

### How to add custom markdown rendering?

The core package uses `marked` for markdown parsing. You can extend it:

```typescript
import { marked } from 'marked';

marked.use({
  renderer: {
    code(code, language) {
      return `<pre class="custom-code"><code>${code}</code></pre>`;
    }
  }
});
```

### How to support streaming responses?

Use the streaming API adapter:

```typescript
const adapter = createAPIAdapter({
  type: 'openai',
  apiKey: 'your-key',
  model: 'gpt-4',
  stream: true
});

const chat = document.querySelector('ai-chat');
chat.setStreamingHandler(async (message) => {
  const stream = await adapter.streamMessage(message);
  for await (const chunk of stream) {
    // Update UI with chunk
    chat.appendStreamingChunk(chunk);
  }
});
```

### How to handle multiple chat sessions?

Create multiple store instances:

```typescript
const chat1 = createChatStore();
const chat2 = createChatStore();

// Each store manages its own state
```

---

## Support

- GitHub Issues: https://github.com/edenxpzhang/ai-chat-ui-kit/issues
- Documentation: https://github.com/edenxpzhang/ai-chat-ui-kit/tree/master/docs
- NPM Packages:
  - `@ai-chat/core`
  - `@ai-chat/components`
  - `@ai-chat/themes`

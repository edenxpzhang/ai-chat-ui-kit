# @ai-chat-ui-kit/components

Web Components for AI Chat UI Kit - Built with Lit, framework-agnostic.

![Version](https://img.shields.io/npm/v/@ai-chat-ui-kit/components.svg)
![License](https://img.shields.io/npm/l/@ai-chat-ui-kit/components.svg)
![Lit](https://img.shields.io/badge/Lit-3.0-orange.svg)

## ✨ Features

- 🚀 **Web Components** - Native components, cross-framework compatible (React, Vue, vanilla HTML)
- 🎨 **6 Built-in Themes** - Minimal, Neon, Glass, Terminal, Gradient, Corporate
- 📱 **Responsive** - Works on desktop and mobile
- ♿ **Accessible** - ARIA compliant
- 🎯 **TypeScript Support** - Complete type definitions
- 📦 **Lightweight** - No heavy dependencies

## 📦 Installation

```bash
pnpm add @ai-chat-ui-kit/components @ai-chat-ui-kit/themes
# or
npm install @ai-chat-ui-kit/components @ai-chat-ui-kit/themes
# or
yarn add @ai-chat-ui-kit/components @ai-chat-ui-kit/themes
```

## 🚀 Quick Start

### Vanilla HTML

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>AI Chat Demo</title>
  <script type="module">
    import '@ai-chat-ui-kit/components';
    import '@ai-chat-ui-kit/themes/minimal';
  </script>
  <style>
    html, body { margin: 0; padding: 0; height: 100%; }
    #app { height: 100vh; }
  </style>
</head>
<body>
  <div id="app">
    <ai-chat></ai-chat>
  </div>

  <script>
    const chat = document.querySelector('ai-chat');
    chat.setMessageHandler(async (message) => {
      await new Promise(resolve => setTimeout(resolve, 1000));
      return `You said: ${message}`;
    });
  </script>
</body>
</html>
```

### React

```tsx
import React, { useEffect, useRef } from 'react';
import '@ai-chat-ui-kit/components';
import '@ai-chat-ui-kit/themes/minimal';

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

### Vue 3

```vue
<template>
  <div style="height: 100vh">
    <ai-chat ref="chatRef"></ai-chat>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import '@ai-chat-ui-kit/components';
import '@ai-chat-ui-kit/themes/minimal';

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

## 📖 Components API

### `<ai-chat>` - Main Chat Container

**Methods:**

| Method | Signature | Description |
|--------|-----------|-------------|
| `setMessageHandler` | `(handler: (msg: string) => Promise<string>) => void` | Set AI response handler |
| `addMessage` | `(role: 'user' \| 'assistant', content: string) => void` | Add message programmatically |
| `clearMessages` | `() => void` | Clear all messages |

**Properties:**

| Property | Type | Default | Description |
|----------|------|---------|-------------|
| `placeholder` | `string` | `'Type a message...'` | Input placeholder |
| `disabled` | `boolean` | `false` | Disable input |
| `loading` | `boolean` | `false` | Show loading state |

**CSS Custom Properties:**

```css
ai-chat {
  --ai-chat-bg: #ffffff;
  --ai-chat-user-bubble-bg: #007aff;
  --ai-chat-user-bubble-color: #ffffff;
  --ai-chat-assistant-bubble-bg: #f0f0f0;
  --ai-chat-assistant-bubble-color: #333333;
  --ai-chat-font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
}
```

### `<ai-message>` - Message Component

```html
<ai-message 
  role="assistant" 
  content="Hello! How can I help you?" 
  name="AI Assistant">
</ai-message>
```

### `<ai-input>` - Input Component

```html
<ai-input 
  placeholder="Type a message..." 
  @send="handleSend">
</ai-input>
```

### `<ai-tool-call>` - Tool Call Component

```html
<ai-tool-call 
  name="get_weather" 
  status="running"
  args='{"location": "Beijing"}'>
</ai-tool-call>
```

## 🎨 Themes

Import themes from `@ai-chat-ui-kit/themes`:

```typescript
import '@ai-chat-ui-kit/themes/minimal';    // Minimalist Apple-style
import '@ai-chat-ui-kit/themes/neon';       // Cyberpunk dark
import '@ai-chat-ui-kit/themes/glass';      // Glassmorphism
import '@ai-chat-ui-kit/themes/terminal';  // Retro terminal
import '@ai-chat-ui-kit/themes/gradient';   // Colorful gradient
import '@ai-chat-ui-kit/themes/corporate';  // Corporate professional
```

**Runtime theme switching:**

```typescript
import { applyTheme } from '@ai-chat-ui-kit/themes';
import { minimalTheme } from '@ai-chat-ui-kit/themes/minimal';
import { neonTheme } from '@ai-chat-ui-kit/themes/neon';

applyTheme(minimalTheme);
applyTheme(neonTheme);  // Switch to neon theme
```

## 📦 Dependencies

- `lit` - Web Components base

## 🤝 Contributing

Contributions welcome! Please read our [contributing guidelines](https://github.com/edenxpzhang/ai-chat-ui-kit/blob/master/CONTRIBUTING.md).

## 📄 License

[MIT License](https://github.com/edenxpzhang/ai-chat-ui-kit/blob/master/LICENSE)

## 👤 Author

edenxpzhang

## 🔗 Links

- [GitHub Repository](https://github.com/edenxpzhang/ai-chat-ui-kit)
- [Documentation](https://edenxpzhang.github.io/ai-chat-ui-kit/)
- [Issues](https://github.com/edenxpzhang/ai-chat-ui-kit/issues)

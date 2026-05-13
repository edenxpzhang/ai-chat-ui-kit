# @ai-chat-ui-kit/core

Core logic layer for AI Chat UI Kit - Headless mode state management, API adapters, and plugin system.

![Version](https://img.shields.io/npm/v/@ai-chat-ui-kit/core.svg)
![License](https://img.shields.io/npm/l/@ai-chat-ui-kit/core.svg)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue.svg)

## ✨ Features

- 🎯 **Headless Mode** - Use only the logic layer, build your own UI
- 📦 **State Management** - Predictable state container with `createChatStore()`
- 🌐 **API Adapters** - Built-in adapters for OpenAI, Anthropic, and custom APIs
- 🔌 **Plugin System** - Extend functionality with custom plugins
- 🎯 **TypeScript Support** - Complete type definitions included

## 📦 Installation

```bash
pnpm add @ai-chat-ui-kit/core
# or
npm install @ai-chat-ui-kit/core
# or
yarn add @ai-chat-ui-kit/core
```

## 🚀 Quick Start

### Headless Mode (No UI)

```typescript
import { createChatStore, createAPIAdapter } from '@ai-chat-ui-kit/core';

// Create state store
const store = createChatStore({
  initialState: {
    messages: [],
    loading: false
  }
});

// Subscribe to state changes
store.subscribe((state) => {
  console.log('Messages:', state.messages);
  console.log('Loading:', state.loading);
  // Update your custom UI here
});

// Create API adapter
const adapter = createAPIAdapter({
  type: 'openai',
  apiKey: process.env.OPENAI_API_KEY,
  model: 'gpt-4'
});

// Handle user input
async function handleUserMessage(message: string) {
  // Add user message
  store.dispatch({
    type: 'ADD_MESSAGE',
    payload: { role: 'user', content: message }
  });

  // Set loading
  store.dispatch({ type: 'SET_LOADING', payload: true });

  // Get AI response
  const response = await adapter.sendMessage(message);

  // Add AI response
  store.dispatch({
    type: 'ADD_MESSAGE',
    payload: { role: 'assistant', content: response }
  });

  // Clear loading
  store.dispatch({ type: 'SET_LOADING', payload: false });
}
```

## 📖 API Reference

### `createChatStore(config?)`

Create a chat state management store.

```typescript
const store = createChatStore({
  initialState?: Partial<ChatState>,
  middleware?: Middleware[]
});

interface ChatState {
  messages: Message[];
  loading: boolean;
  error: string | null;
  theme: string;
}

interface ChatStore {
  getState(): ChatState;
  dispatch(action: Action): void;
  subscribe(listener: (state: ChatState) => void): () => void;
}
```

### `createAPIAdapter(config)`

Create an API adapter for different AI backends.

```typescript
// OpenAI
const openai = createAPIAdapter({
  type: 'openai',
  apiKey: 'your-api-key',
  model: 'gpt-4'
});

// Anthropic (Claude)
const anthropic = createAPIAdapter({
  type: 'anthropic',
  apiKey: 'your-api-key',
  model: 'claude-3-opus'
});

// Custom API
const custom = createAPIAdapter({
  type: 'custom',
  endpoint: 'https://your-api.com/chat',
  headers: { 'Authorization': 'Bearer token' }
});

interface APIAdapter {
  sendMessage(message: string, history?: Message[]): Promise<string>;
  streamMessage?(message: string, history?: Message[]): AsyncIterable<string>;
}
```

### `createPluginSystem()`

Create a plugin system to extend functionality.

```typescript
import { createPluginSystem, Plugin } from '@ai-chat-ui-kit/core';

const myPlugin: Plugin = {
  name: 'my-plugin',
  install: (context) => {
    const store = context.getStore();
    store.subscribe((state) => {
      console.log('State changed:', state);
    });
  }
};

const pluginSystem = createPluginSystem();
pluginSystem.register(myPlugin);
```

## 📖 Examples

### Custom UI with React

```tsx
import React, { useState, useEffect } from 'react';
import { createChatStore } from '@ai-chat-ui-kit/core';

const ChatApp: React.FC = () => {
  const [store] = useState(() => createChatStore());
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const unsubscribe = store.subscribe((state) => {
      setMessages([...state.messages]);
      setLoading(state.loading);
    });
    return unsubscribe;
  }, [store]);

  const sendMessage = async (content: string) => {
    await handleUserMessage(content);
  };

  return (
    <div>
      {messages.map((msg, i) => (
        <div key={i} className={msg.role}>
          {msg.content}
        </div>
      ))}
      {loading && <div>Loading...</div>}
    </div>
  );
};
```

### Persistence Plugin

```typescript
const persistencePlugin: Plugin = {
  name: 'persistence',
  install: (context) => {
    const store = context.getStore();
    
    // Load saved messages
    const saved = localStorage.getItem('chat-messages');
    if (saved) {
      JSON.parse(saved).forEach((msg: Message) => {
        store.dispatch({ type: 'ADD_MESSAGE', payload: msg });
      });
    }
    
    // Save messages on change
    store.subscribe((state) => {
      localStorage.setItem('chat-messages', JSON.stringify(state.messages));
    });
  }
};
```

## 📦 Dependencies

- `marked` - Markdown parsing
- `marked-highlight` - Code highlighting
- `highlight.js` - Syntax highlighting
- `mermaid` - Mermaid diagram support
- `katex` - LaTeX math rendering

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

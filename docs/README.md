# AI Chat UI Kit 文档

![Version](https://img.shields.io/badge/version-0.1.0-blue.svg)
![License](https://img.shields.io/badge/license-MIT-green.svg)

欢迎使用 AI Chat UI Kit 官方文档！

## 📖 文档导航

### 🚀 快速开始
- [快速开始指南](./guide/getting-started.md) - 5分钟上手教程
- [安装指南](./guide/getting-started.md#安装) - 详细安装步骤

### 📚 使用指南
- [Headless 模式](./guide/headless-mode.md) - 只使用逻辑层，自定义 UI
- [主题定制](./guide/themes.md) - 自定义主题和样式
- [插件开发](./guide/plugins.md) - 扩展功能
- [API 适配器](./guide/api-adapters.md) - 兼容多种后端 API

### 🔧 API 参考
- [Core 包 API](./api/core.md) - 核心逻辑层 API
- [Components 包 API](./api/components.md) - Web Components API

### 💡 示例
- [基本聊天](./examples/basic-chat.md) - 最简单的聊天功能
- [自定义插件](./examples/custom-plugins.md) - 创建自定义插件
- [多模型支持](./examples/multi-model.md) - 切换不同 AI 模型

## 🎯 项目简介

AI Chat UI Kit 是一套基于 Web Components 的 AI 聊天 UI 组件库，具有以下特点：

- ✨ **跨框架兼容** - 原生 Web Components，支持 React、Vue、Angular 等
- 🎨 **Headless 模式** - 可只使用逻辑层，完全自定义 UI
- 🎭 **多主题支持** - 内置默认、气泡、扁平三种主题
- 🔌 **插件系统** - 易于扩展功能
- 📡 **API 适配器** - 兼容多种后端 API 格式
- 📦 **轻量级** - 无 heavy dependencies

## 📦 安装

```bash
# PNPM（推荐）
pnpm add @ai-chat/core @ai-chat/components @ai-chat/themes

# NPM
npm install @ai-chat/core @ai-chat/components @ai-chat/themes

# Yarn
yarn add @ai-chat/core @ai-chat/components @ai-chat/themes
```

## 🚀 快速开始

### 原生 HTML

```html
<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <title>AI Chat Demo</title>
  <script type="module">
    import '@ai-chat/components';
    import '@ai-chat/themes/default';
  </script>
</head>
<body>
  <div style="height: 100vh">
    <ai-chat></ai-chat>
  </div>

  <script>
    const chat = document.querySelector('ai-chat');
    chat.setMessageHandler(async (message) => {
      await new Promise(resolve => setTimeout(resolve, 1000));
      return `您说的是：${message}`;
    });
  </script>
</body>
</html>
```

### React

```tsx
import React, { useEffect, useRef } from 'react';
import '@ai-chat/components';
import '@ai-chat/themes/default';

const ChatApp: React.FC = () => {
  const chatRef = useRef<HTMLElement>(null);

  useEffect(() => {
    if (chatRef.current) {
      (chatRef.current as any).setMessageHandler(async (message: string) => {
        await new Promise(resolve => setTimeout(resolve, 1000));
        return `AI 回复：${message}`;
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
import '@ai-chat/components';
import '@ai-chat/themes/default';

const chatRef = ref<HTMLElement>();

onMounted(() => {
  if (chatRef.value) {
    (chatRef.value as any).setMessageHandler(async (message: string) => {
      await new Promise(resolve => setTimeout(resolve, 1000));
      return `AI 回复：${message}`;
    });
  }
});
</script>
```

## 🎨 主题切换

```typescript
// 使用默认主题
import '@ai-chat/themes/default';

// 使用气泡主题（仿微信/QQ 风格）
import '@ai-chat/themes/bubble';

// 使用扁平主题
import '@ai-chat/themes/flat';
```

## 🏗️ 项目结构

```
ai-chat-ui-kit/
├── packages/
│   ├── core/          # 核心逻辑层（状态管理、API 适配）
│   ├── components/    # Web Components 封装（Lit）
│   └── themes/        # 主题包（CSS + 配置）
├── docs/              # 文档
├── examples/          # 使用示例
└── README.md          # 项目说明
```

## 🤝 贡献

欢迎提交 Issue 和 Pull Request！

## 📄 许可证

[MIT License](./LICENSE)

---

Built with ❤️ using [Lit](https://lit.dev/)

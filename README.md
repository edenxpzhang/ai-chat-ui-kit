/**
 * @generated-by AI: edenxpzhang
 * @generated-date 2026-05-13
 */
# AI Chat UI Kit

![Version](https://img.shields.io/badge/version-0.1.0-blue.svg)
![License](https://img.shields.io/badge/license-MIT-green.svg)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue.svg)
![Lit](https://img.shields.io/badge/Lit-3.0-orange.svg)
![Live Demo](https://img.shields.io/badge/Live%20Demo-GitHub%20Pages-blue?logo=github)

一套基于 Web Components 的 AI 聊天 UI 组件库，支持 Headless 模式，可跨框架使用（React、Vue、原生 HTML）。

## ✨ 在线预览

🎉 **[点击这里查看在线 Demo](https://edenxpzhang.github.io/ai-chat-ui-kit/)**（部署后自动生效）

## 🎨 6 套主题预览

| 序号 | 主题 | 风格 | 预览 |
|------|------|------|------|
| 01 | **Minimal Clean** | 极简苹果风，圆角气泡、蓝白配色 | [在线预览](docs/chat-style-1-minimal.html) |
| 02 | **Dark Neon** | 赛博朋克深色，霓虹发光效果 | [在线预览](docs/chat-style-2-neon.html) |
| 03 | **Glassmorphism** | 毛玻璃拟态，半透明模糊 | [在线预览](docs/chat-style-3-glass.html) |
| 04 | **Retro Terminal** | 复古终端，绿绿配色 + 扫描线 | [在线预览](docs/chat-style-4-terminal.html) |
| 05 | **Gradient Bubbles** | 多彩渐变气泡，弹出动画 | [在线预览](docs/chat-style-5-gradient.html) |
| 06 | **Corporate Professional** | 企业商务风，蓝色主题 | [在线预览](docs/chat-style-6-corporate.html) |

> 💡 也可访问 [主题总览页](docs/index.html) 一次性查看所有主题。

## ✨ 特性

- 🚀 **基于 Web Components** - 原生组件，跨框架兼容
- 🎨 **Headless 模式** - 可只使用逻辑层，自定义 UI
- 🎭 **6 套主题** - Minimal / Neon / Glass / Terminal / Gradient / Corporate
- 🔌 **插件系统** - 易于扩展功能
- 🌐 **API 适配器** - 兼容多种后端 API 格式
- 🎯 **TypeScript 支持** - 完整的类型定义
- 📦 **轻量级** - 无 heavy dependencies

## 📦 安装

### 使用 PNPM（推荐）
```bash
pnpm add @ai-chat-ui-kit/core @ai-chat-ui-kit/components @ai-chat-ui-kit/themes
```

### 使用 NPM
```bash
npm install @ai-chat-ui-kit/core @ai-chat-ui-kit/components @ai-chat-ui-kit/themes
```

### 使用 Yarn
```bash
yarn add @ai-chat-ui-kit/core @ai-chat-ui-kit/components @ai-chat-ui-kit/themes
```

## 🚀 快速开始

### 原生 HTML 使用

```html
<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <title>AI Chat Demo</title>
  <script type="module">
    import '@ai-chat/components';
    import '@ai-chat/themes';
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
    const chat = document.querySelector('ai-chat');

    // 设置 AI 回复回调
    chat.setMessageHandler(async (message) => {
      // 模拟 AI 回复
      await new Promise(resolve => setTimeout(resolve, 1000));
      return `您说的是：${message}`;
    });
  </script>
</body>
</html>
```

### React 使用

```tsx
import React, { useEffect, useRef } from 'react';
import '@ai-chat/components';
import '@ai-chat/themes';

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

### Vue 3 使用

```vue
<template>
  <div style="height: 100vh">
    <ai-chat ref="chatRef"></ai-chat>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import '@ai-chat/components';
import '@ai-chat/themes';

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

```tsx
// 导入主题样式
import '@ai-chat/themes/minimal';  // 极简苹果风
import '@ai-chat/themes/neon';     // 赛博朋克深色
import '@ai-chat/themes/glass';    // 毛玻璃拟态
import '@ai-chat/themes/terminal'; // 复古终端
import '@ai-chat/themes/gradient'; // 多彩渐变
import '@ai-chat/themes/corporate'; // 企业商务

// 运行时动态切换主题
import { applyTheme } from '@ai-chat/themes';
import { minimalTheme } from '@ai-chat/themes/minimal';
import { neonTheme } from '@ai-chat/themes/neon';

// 应用极简主题
applyTheme(minimalTheme);

// 切换到赛博朋克主题
applyTheme(neonTheme);
```

## 📖 文档

完整文档请访问：[文档链接]

- [快速开始](./docs/guide/getting-started.md)
- [Headless 模式](./docs/guide/headless-mode.md)
- [主题定制](./docs/guide/themes.md)
- [插件开发](./docs/guide/plugins.md)
- [API 适配器](./docs/guide/api-adapters.md)

## 📚 示例

查看 [examples](./examples/) 目录获取更多示例：

- [原生 HTML 示例](./examples/index.html)
- [React 示例](./examples/react-app/)
- [Vue 示例](./examples/vue-app/)

## 🏗️ 项目结构

```
ai-chat-ui-kit/
├── packages/
│   ├── core/          # 核心逻辑层（状态管理、API 适配）
│   ├── components/    # Web Components 封装（Lit）
│   └── themes/        # 主题包（CSS + 配置）
├── docs/              # 文档 & 主题预览页（GitHub Pages）
│   ├── index.html                  # 主题总览页
│   ├── chat-style-1-minimal.html  # 主题1：极简
│   ├── chat-style-2-neon.html     # 主题2：赛博朋克
│   ├── chat-style-3-glass.html    # 主题3：毛玻璃
│   ├── chat-style-4-terminal.html  # 主题4：终端
│   ├── chat-style-5-gradient.html  # 主题5：渐变
│   └── chat-style-6-corporate.html # 主题6：企业
├── examples/          # 使用示例
├── README.md          # 本文件
└── package.json       # 根 package.json
```

## 🛠️ 开发

### 安装依赖
```bash
pnpm install
```

### 开发模式
```bash
pnpm dev
```

### 构建
```bash
pnpm build
```

### 测试
```bash
pnpm test
```

### Lint
```bash
pnpm lint
```

## 🚀 GitHub Pages 部署

本项目的 `docs/` 目录已配置为 GitHub Pages 源目录，推送到 `master` 分支后会自动部署。

**查看在线预览：** `https://<your-username>.github.io/ai-chat-ui-kit/`

## 📝 API 参考

### Core 包
- `createChatStore()` - 创建聊天状态管理
- `createAPIAdapter()` - 创建 API 适配器
- `createPluginSystem()` - 创建插件系统

详见：[Core API 文档](./docs/api/core.md)

### Components 包
- `<ai-chat>` - 聊天容器组件
- `<ai-message>` - 消息组件
- `<ai-input>` - 输入框组件
- `<ai-tool-call>` - 工具调用组件

详见：[Components API 文档](./docs/api/components.md)

## 🤝 贡献

欢迎提交 Issue 和 Pull Request！

## 📄 许可证

[MIT License](./LICENSE)

## 👤 作者

edenxpzhang

---

Built with ❤️ using [Lit](https://lit.dev/)

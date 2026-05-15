# @ai-chat-ui-kit/themes

Theme packages for AI Chat UI Kit - 6 beautiful pre-built themes + runtime apply API.

![Version](https://img.shields.io/npm/v/@ai-chat-ui-kit/themes.svg)
![License](https://img.shields.io/npm/l/@ai-chat-ui-kit/themes.svg)

## ✨ Features

- 🎨 **6 Built-in Themes** - Minimal, Neon, Glass, Terminal, Gradient, Corporate
- 🎯 **Runtime apply API** - `applyTheme(theme, target?)`，支持局部/全局换肤
- 🪟 **局部换肤（v0.2+）** - 弹窗内独立主题，不污染全站
- 🔄 **Runtime Switching** - 动态切换、移除、查询主题
- 🎯 **TypeScript Support** - 完整类型定义
- 📦 **Lightweight** - 纯数据 + 少量运行时 API

## 📦 Installation

```bash
pnpm add @ai-chat-ui-kit/themes
# or
npm install @ai-chat-ui-kit/themes
```

## 🚀 Quick Start

### 全局换肤（最常见）

```ts
import { applyTheme } from '@ai-chat-ui-kit/themes';

// 用主题名（推荐，最简洁）
applyTheme('glass');

// 或传 ThemeConfig 对象
import { glassTheme } from '@ai-chat-ui-kit/themes';
applyTheme(glassTheme);
```

### 局部换肤（弹窗 / 子页面独立主题，不污染全站）

```tsx
import { useEffect, useRef } from 'react';
import { applyTheme, removeTheme } from '@ai-chat-ui-kit/themes';

function ChatModal() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;
    // 第二个参数传入 target 元素，主题只作用于该元素的子树
    applyTheme('glass', containerRef.current);
    return () => removeTheme(containerRef.current!);
  }, []);

  return (
    <div ref={containerRef}>
      <ai-chat />
    </div>
  );
}
```

实现细节：
- CSS Variables 写入 `target.style`（局部 scope）
- `theme.styles` 的选择器自动加上 `[data-aikit-scope="aikit-xxx"]` 前缀
- `:root` 选择器被重写为 scope 选择器自身
- 通过 `data-aikit-theme="<name>"` 标记当前主题，可用 `getCurrentTheme(target)` 查询

### 切换 / 移除主题

```ts
import { applyTheme, removeTheme, getCurrentTheme } from '@ai-chat-ui-kit/themes';

applyTheme('minimal');
console.log(getCurrentTheme()); // 'minimal'

applyTheme('neon');             // 自动覆盖旧主题
console.log(getCurrentTheme()); // 'neon'

removeTheme();                  // 完全移除（清空 variables + 删除注入的 <style>）
console.log(getCurrentTheme()); // null
```

### 通过字典按名查询主题

```ts
import { themes } from '@ai-chat-ui-kit/themes';

console.log(Object.keys(themes));
// ['minimal', 'neon', 'glass', 'terminal', 'gradient', 'corporate']

applyTheme(themes['glass']);
```

## 📖 API Reference

### `applyTheme(theme, target?)`

| 参数 | 类型 | 说明 |
| --- | --- | --- |
| `theme` | `ThemeConfig \| string` | 主题对象或主题名 |
| `target` | `HTMLElement \| null` | 应用目标，省略 → `document.documentElement` 全局换肤 |

### `removeTheme(target?)`

| 参数 | 类型 | 说明 |
| --- | --- | --- |
| `target` | `HTMLElement \| null` | 目标元素，省略 → 移除全局主题 |

### `getCurrentTheme(target?)`

返回当前主题名 string，未应用则返回 `null`。

### `themes`

`Record<string, ThemeConfig>` 类型字典，包含所有内置主题。

## 🎨 Available Themes

| 主题名 | 描述 | 适用场景 |
| --- | --- | --- |
| `minimal` | 极简苹果风，蓝白配色 | 通用 / 移动端 |
| `neon` | 赛博朋克霓虹深色 | 开发者工具 / AI 产品 |
| `glass` | 毛玻璃拟态 | 现代 SaaS / 弹窗 |
| `terminal` | 复古终端 + 扫描线 | CLI / 终端类产品 |
| `gradient` | 多彩渐变气泡 | 社交 / 年轻化 |
| `corporate` | 企业蓝商务风 | B 端 / 企业应用 |

## 📖 Type Definition

```ts
interface ThemeConfig {
  name: string;
  variables: Record<string, string>;  // CSS Variables
  styles: string;                      // 主题 CSS（字符串）
}
```

## 🎨 Custom Theme

可以实现 `ThemeConfig` 接口自定义主题：

```ts
import { applyTheme, type ThemeConfig } from '@ai-chat-ui-kit/themes';

const myTheme: ThemeConfig = {
  name: 'my-theme',
  variables: {
    '--ai-primary': '#ff6b6b',
    '--ai-bg-primary': '#ffffff',
    // ...
  },
  styles: `
    .ai-chat__header { background: var(--ai-primary); }
    .ai-message--user .ai-message__content { background: var(--ai-primary); }
  `,
};

applyTheme(myTheme);
```

## 📜 Changelog

### 0.2.0 (2026-05-15)

- 🎉 新增 `applyTheme(theme, target?)`、`removeTheme(target?)`、`getCurrentTheme(target?)` 运行时 API
- 🎉 支持**局部换肤**：传入 `target` 元素，主题只作用于该元素子树，不污染全站
- 🎉 新增 `themes` 字典导出（`Record<string, ThemeConfig>`）
- 🐛 修复 `tsup` entry 中的历史遗留 `default/bubble/flat` 路径

### 0.1.1

- 6 套内置主题数据对象首版

## 📄 License

[MIT License](https://github.com/edenxpzhang/ai-chat-ui-kit/blob/master/LICENSE)

## 🔗 Links

- [GitHub Repository](https://github.com/edenxpzhang/ai-chat-ui-kit)
- [Documentation](https://edenxpzhang.github.io/ai-chat-ui-kit/)
- [Issues](https://github.com/edenxpzhang/ai-chat-ui-kit/issues)

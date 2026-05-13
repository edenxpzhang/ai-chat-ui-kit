# 主题定制

AI Chat UI Kit 提供了灵活的主题定制功能，支持多种方式来定制聊天界面的外观。

## 内置主题

AI Chat UI Kit 内置了三种主题：

### 1. 默认主题（Default）

蓝色主题，简洁现代。

```typescript
import '@ai-chat/themes/default';
```

**特点：**
- 主色调：蓝色（#1677ff）
- 用户消息：蓝色背景
- AI 消息：白色背景，灰色边框

### 2. 气泡主题（Bubble）

仿微信/QQ 气泡风格。

```typescript
import '@ai-chat/themes/bubble';
```

**特点：**
- 主色调：绿色（#07c160）
- 用户消息：绿色气泡（#95ec69）
- AI 消息：白色气泡
- 带气泡箭头

### 3. 扁平主题（Flat）

扁平化设计，无阴影。

```typescript
import '@ai-chat/themes/flat';
```

**特点：**
- 主色调：深蓝色（#2b6cb0）
- 无阴影
- 纯色背景
- 简洁边框

## 使用主题

### 方式一：静态导入（推荐）

在应用入口文件导入主题：

```typescript
// main.ts / App.tsx / main.tsx
import '@ai-chat/themes/default'; // 默认主题
// 或
import '@ai-chat/themes/bubble'; // 气泡主题
// 或
import '@ai-chat/themes/flat'; // 扁平主题
```

### 方式二：动态切换

```typescript
import { applyTheme } from '@ai-chat/themes';
import { defaultTheme } from '@ai-chat/themes/default';
import { bubbleTheme } from '@ai-chat/themes/bubble';
import { flatTheme } from '@ai-chat/themes/flat';

// 应用默认主题
applyTheme(defaultTheme);

// 切换到气泡主题
applyTheme(bubbleTheme);

// 切换到扁平主题
applyTheme(flatTheme);
```

### 方式三：通过 CSS 变量覆盖

所有主题都使用 CSS 变量，您可以在自己的 CSS 中覆盖这些变量：

```css
/* 全局覆盖 */
:root {
  --ai-primary: #your-primary-color;
  --ai-message-user-bg: #your-user-msg-bg;
  --ai-message-ai-bg: #your-ai-msg-bg;
}

/* 针对特定组件覆盖 */
.ai-chat {
  --ai-primary: #your-primary-color;
}
```

## 自定义主题

### 创建自定义主题

1. 创建主题 CSS 文件：

```css
/* themes/my-theme/theme.css */

:root {
  /* 主色 */
  --ai-primary: #your-primary-color;
  --ai-primary-hover: #your-primary-hover;
  --ai-primary-active: #your-primary-active;

  /* 背景色 */
  --ai-bg-primary: #your-bg-primary;
  --ai-bg-secondary: #your-bg-secondary;
  --ai-bg-chat: #your-bg-chat;

  /* 文本色 */
  --ai-text-primary: #your-text-primary;
  --ai-text-secondary: #your-text-secondary;

  /* 消息气泡 */
  --ai-message-user-bg: #your-user-msg-bg;
  --ai-message-user-text: #your-user-msg-text;
  --ai-message-ai-bg: #your-ai-msg-bg;
  --ai-message-ai-text: #your-ai-msg-text;

  /* 输入框 */
  --ai-input-bg: #your-input-bg;
  --ai-input-border: #your-input-border;

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

/* 自定义组件样式 */
.ai-chat {
  /* 您的自定义样式 */
}

.ai-message--user .ai-message__content {
  /* 自定义用户消息样式 */
}

.ai-message--assistant .ai-message__content {
  /* 自定义 AI 消息样式 */
}
```

2. 创建主题配置：

```typescript
// themes/my-theme/index.ts
import themeStyles from './theme.css?raw';

export const myTheme = {
  name: 'my-theme',
  variables: {
    '--ai-primary': '#your-primary-color',
    '--ai-primary-hover': '#your-primary-hover',
    '--ai-primary-active': '#your-primary-active',
    // ... 其他变量
  },
  styles: themeStyles,
};
```

3. 使用自定义主题：

```typescript
import { applyTheme } from '@ai-chat/themes';
import { myTheme } from './themes/my-theme';

applyTheme(myTheme);
```

## 主题配置详解

### ThemeConfig 接口

```typescript
interface ThemeConfig {
  name: string;
  variables: Record<string, string>;
  styles: string;
}
```

**字段说明：**

- `name`: 主题名称
- `variables`: CSS 变量键值对
- `styles`: 主题 CSS 字符串

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
  --ai-bg-tertiary: #fafafa;
  --ai-bg-chat: #f0f2f5;

  /* 文本色 */
  --ai-text-primary: rgba(0, 0, 0, 0.88);
  --ai-text-secondary: rgba(0, 0, 0, 0.65);
  --ai-text-tertiary: rgba(0, 0, 0, 0.45);
  --ai-text-inverse: #ffffff;

  /* 消息气泡 */
  --ai-message-user-bg: #1677ff;
  --ai-message-user-text: #ffffff;
  --ai-message-ai-bg: #ffffff;
  --ai-message-ai-text: rgba(0, 0, 0, 0.88);
  --ai-message-border: #e8e8e8;

  /* 输入框 */
  --ai-input-bg: #ffffff;
  --ai-input-border: #d9d9d9;
  --ai-input-focus-border: #1677ff;
  --ai-input-text: rgba(0, 0, 0, 0.88);
  --ai-input-placeholder: rgba(0, 0, 0, 0.35);

  /* 工具调用 */
  --ai-tool-call-bg: #f6f8fa;
  --ai-tool-call-border: #d1d9e0;
  --ai-tool-call-success: #52c41a;
  --ai-tool-call-error: #ff4d4f;
  --ai-tool-call-running: #1677ff;

  /* 阴影 */
  --ai-shadow-sm: 0 1px 2px rgba(0, 0, 0, 0.06);
  --ai-shadow-md: 0 2px 8px rgba(0, 0, 0, 0.1);
  --ai-shadow-lg: 0 4px 16px rgba(0, 0, 0, 0.12);

  /* 圆角 */
  --ai-radius-sm: 4px;
  --ai-radius-md: 8px;
  --ai-radius-lg: 12px;
  --ai-radius-xl: 16px;

  /* 间距 */
  --ai-spacing-xs: 4px;
  --ai-spacing-sm: 8px;
  --ai-spacing-md: 12px;
  --ai-spacing-lg: 16px;
  --ai-spacing-xl: 24px;
}
```

## 暗黑模式

### 方式一：使用媒体查询

```css
/* 默认亮色主题 */
:root {
  --ai-bg-chat: #f0f2f5;
  --ai-text-primary: rgba(0, 0, 0, 0.88);
}

/* 暗黑模式 */
@media (prefers-color-scheme: dark) {
  :root {
    --ai-bg-chat: #141414;
    --ai-text-primary: rgba(255, 255, 255, 0.88);
    --ai-message-ai-bg: #1f1f1f;
    --ai-message-border: #303030;
  }
}
```

### 方式二：手动切换

```typescript
// 监听暗黑模式切换
const darkModeMediaQuery = window.matchMedia('(prefers-color-scheme: dark)');

darkModeMediaQuery.addEventListener('change', (e) => {
  if (e.matches) {
    applyDarkTheme();
  } else {
    applyLightTheme();
  }
});

// 或手动切换
function toggleDarkMode() {
  document.documentElement.classList.toggle('dark');
}

// CSS
.dark {
  --ai-bg-chat: #141414;
  --ai-text-primary: rgba(255, 255, 255, 0.88);
}
```

## 最佳实践

1. **优先使用 CSS 变量覆盖** - 不需要创建完整主题，只需覆盖需要修改的变量
2. **保持一致性** - 确保主题色彩与您的品牌色一致
3. **测试可读性** - 确保文本与背景的对比度足够
4. **支持暗黑模式** - 为用户提供亮色和暗色两种主题

## 下一步

- [插件开发](./plugins.md) - 学习如何扩展功能
- [API 适配器](./api-adapters.md) - 学习如何兼容不同后端 API
- [API 参考](../../api/) - 查看完整 API 文档

# @ai-chat-ui-kit/themes

Theme packages for AI Chat UI Kit - 6 beautiful pre-built themes.

![Version](https://img.shields.io/npm/v/@ai-chat-ui-kit/themes.svg)
![License](https://img.shields.io/npm/l/@ai-chat-ui-kit/themes.svg)

## ✨ Features

- 🎨 **6 Built-in Themes** - Minimal, Neon, Glass, Terminal, Gradient, Corporate
- 🎭 **Easy to Use** - Just import and apply
- 🔄 **Runtime Switching** - Switch themes dynamically
- 🎯 **TypeScript Support** - Complete theme type definitions
- 📦 **Lightweight** - CSS only, no JavaScript overhead

## 📦 Installation

```bash
pnpm add @ai-chat-ui-kit/themes
# or
npm install @ai-chat-ui-kit/themes
# or
yarn add @ai-chat-ui-kit/themes
```

## 🚀 Quick Start

### Import Themes

```typescript
// Import all themes
import '@ai-chat-ui-kit/themes/minimal';
import '@ai-chat-ui-kit/themes/neon';
import '@ai-chat-ui-kit/themes/glass';
import '@ai-chat-ui-kit/themes/terminal';
import '@ai-chat-ui-kit/themes/gradient';
import '@ai-chat-ui-kit/themes/corporate';
```

### Apply Theme at Runtime

```typescript
import { applyTheme } from '@ai-chat-ui-kit/themes';
import { minimalTheme } from '@ai-chat-ui-kit/themes/minimal';
import { neonTheme } from '@ai-chat-ui-kit/themes/neon';
import { glassTheme } from '@ai-chat-ui-kit/themes/glass';
import { terminalTheme } from '@ai-chat-ui-kit/themes/terminal';
import { gradientTheme } from '@ai-chat-ui-kit/themes/gradient';
import { corporateTheme } from '@ai-chat-ui-kit/themes/corporate';

// Apply minimal theme
applyTheme(minimalTheme);

// Switch to neon theme
applyTheme(neonTheme);
```

## 🎨 Available Themes

### 1. Minimal (Default)

Clean Apple-style design with rounded bubbles and blue-white color scheme.

```typescript
import { minimalTheme } from '@ai-chat-ui-kit/themes/minimal';
applyTheme(minimalTheme);
```

**Features:**
- Rounded bubbles (18px border-radius)
- Blue user bubbles, light gray assistant bubbles
- Clean sans-serif font
- Subtle shadows

---

### 2. Neon (Cyberpunk Dark)

Dark theme with neon glow effects, perfect for developer tools.

```typescript
import { neonTheme } from '@ai-chat-ui-kit/themes/neon';
applyTheme(neonTheme);
```

**Features:**
- Dark background (#0a0a0a)
- Neon blue/pink glow effects
- Monospace font
- Animated glow on hover

---

### 3. Glass (Glassmorphism)

Modern glassmorphism design with translucent blur effects.

```typescript
import { glassTheme } from '@ai-chat-ui-kit/themes/glass';
applyTheme(glassTheme);
```

**Features:**
- Translucent backgrounds with backdrop blur
- Semi-transparent bubbles
- Light, airy feel
- Subtle border highlights

---

### 4. Terminal (Retro)

Retro terminal style with green text and scanlines.

```typescript
import { terminalTheme } from '@ai-chat-ui-kit/themes/terminal';
applyTheme(terminalTheme);
```

**Features:**
- Dark background with green text
- Monospace font (Courier New)
- Scanline animation
- Blinking cursor effect

---

### 5. Gradient (Colorful)

Vibrant gradient bubbles with pop animations.

```typescript
import { gradientTheme } from '@ai-chat-ui-kit/themes/gradient';
applyTheme(gradientTheme);
```

**Features:**
- Gradient backgrounds (blue-purple-pink)
- Pop-in animation for new messages
- Playful, modern feel
- Rounded corners

---

### 6. Corporate (Professional)

Clean, professional design suitable for enterprise applications.

```typescript
import { corporateTheme } from '@ai-chat-ui-kit/themes/corporate';
applyTheme(corporateTheme);
```

**Features:**
- Professional blue theme
- Clean, structured layout
- Business-appropriate styling
- Clear typography

---

## 📖 Theme Type Definition

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

## 🎨 Custom Theme

You can create your own theme by implementing the `Theme` interface:

```typescript
import { applyTheme, Theme } from '@ai-chat-ui-kit/themes';

const myCustomTheme: Theme = {
  name: 'my-theme',
  colors: {
    primary: '#ff6b6b',
    secondary: '#4ecdc4',
    background: '#ffffff',
    surface: '#f8f9fa',
    text: '#212529',
    textSecondary: '#6c757d'
  },
  typography: {
    fontFamily: '-apple-system, BlinkMacSystemFont, sans-serif',
    fontSize: 14,
    lineHeight: 1.5
  },
  spacing: {
    small: 8,
    medium: 16,
    large: 24
  },
  borderRadius: 12
};

applyTheme(myCustomTheme);
```

## 📦 Dependencies

None! This package is CSS-only.

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

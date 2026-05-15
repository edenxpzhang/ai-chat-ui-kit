/**
 * @generated-by AI: edenxpzhang
 * @generated-date 2026-05-15
 *
 * React JSX type augmentation for AI Chat UI Kit Web Components.
 *
 * 使用方式（任选其一）：
 *
 *  1. 全局引入（推荐，放在项目入口/tsconfig 的 types 里）
 *     ```ts
 *     /// <reference types="@ai-chat-ui-kit/components/react" />
 *     ```
 *
 *  2. 通过 tsconfig.compilerOptions.types
 *     ```json
 *     { "compilerOptions": { "types": ["@ai-chat-ui-kit/components/react"] } }
 *     ```
 *
 *  3. 直接 import（任意一处即可，副作用：仅扩充 JSX 命名空间）
 *     ```ts
 *     import '@ai-chat-ui-kit/components/react';
 *     ```
 */
import type * as React from 'react';
import type { Message, ToolCall, ModelConfig } from './types.js';

type ReactRef<T> = React.Ref<T>;

type CommonHTMLProps<T extends HTMLElement> = React.DetailedHTMLProps<
  React.HTMLAttributes<T>,
  T
> & {
  ref?: ReactRef<T>;
  // 允许传 class / className
  class?: string;
};

interface AiChatAttrs extends CommonHTMLProps<HTMLElement> {
  headless?: boolean;
  controlled?: boolean;
  theme?: string;
  'header-title'?: string;
  'header-subtitle'?: string;
  'header-avatar'?: string;
  'hide-header'?: boolean;
  /** 受控模式下的消息数组（仅通过 ref 或框架的 property binding 设置，非 attribute） */
  messages?: Message[];
  config?: ModelConfig;
  // 自定义事件（React 19+ 支持 onCustomEvent 形式；旧版本需要用 addEventListener / ref）
  onAiChatSend?: (e: CustomEvent<{ content: string; id: string }>) => void;
  onAiChatAction?: (
    e: CustomEvent<{ actionId: string; messageId?: string; payload?: Record<string, string> }>
  ) => void;
  onMessageSent?: (e: CustomEvent<{ message: Message }>) => void;
  onMessageReceived?: (e: CustomEvent<{ message: Message }>) => void;
  onInputChange?: (e: CustomEvent<{ value: string }>) => void;
}

interface AiMessageAttrs extends CommonHTMLProps<HTMLElement> {
  headless?: boolean;
  theme?: string;
  message?: Message;
  onAiMessageAction?: (
    e: CustomEvent<{ actionId: string; messageId?: string; payload?: Record<string, string> }>
  ) => void;
}

interface AiInputAttrs extends CommonHTMLProps<HTMLElement> {
  headless?: boolean;
  disabled?: boolean;
  placeholder?: string;
  'send-text'?: string;
  onSend?: (e: CustomEvent<{ content: string }>) => void;
  onInputChange?: (e: CustomEvent<{ value: string }>) => void;
}

interface AiMarkdownAttrs extends CommonHTMLProps<HTMLElement> {
  content?: string;
  plugins?: string[];
  streaming?: boolean;
  onAiMarkdownRendered?: (
    e: CustomEvent<{ contentLength: number; streaming: boolean }>
  ) => void;
}

interface AiToolCallAttrs extends CommonHTMLProps<HTMLElement> {
  toolCall?: ToolCall;
}

declare global {
  namespace JSX {
    interface IntrinsicElements {
      'ai-chat': AiChatAttrs;
      'ai-message': AiMessageAttrs;
      'ai-input': AiInputAttrs;
      'ai-markdown': AiMarkdownAttrs;
      'ai-tool-call': AiToolCallAttrs;
    }
  }
}

export {};

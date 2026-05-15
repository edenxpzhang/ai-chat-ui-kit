# 受控模式（Controlled Mode）

> 适用 v0.2+，将 `<ai-chat>` 与外部状态完全双向绑定

## 为什么需要受控模式

默认情况下 `<ai-chat>` 维护自己的消息数组，并通过命令式 API `addMessage()` 接收外部追加。这对纯展示场景够用，但在以下场景受限：

- **React/Vue 数据驱动**：希望消息源是外部 store（Redux/Pinia/Zustand）
- **流式回复**：需要在外部一边收 chunk 一边更新最后一条消息的 content
- **后端真实对接**：用户输入要先发给后端，再把 AI 回复贴回来

受控模式让 `<ai-chat>` 退化为纯渲染层，由宿主完全控制数据流。

## 启用方式

设置 `controlled` 属性 + 提供 `messages`：

```tsx
<ai-chat
  controlled
  messages={messages}
  onAiChatSend={handleSend}
/>
```

## React 完整示例

```tsx
import React, { useState, useRef, useEffect } from 'react';
import '@ai-chat-ui-kit/components';
import '@ai-chat-ui-kit/components/react';
import { applyTheme } from '@ai-chat-ui-kit/themes';
import type { Message } from '@ai-chat-ui-kit/components';

applyTheme('minimal');

export default function ChatApp() {
  const [messages, setMessages] = useState<Message[]>([]);
  const chatRef = useRef<HTMLElement>(null);

  // 监听受控发送事件
  const handleSend = (e: CustomEvent<{ content: string; id: string }>) => {
    const { content, id } = e.detail;

    // 1) 立即追加用户消息
    const userMsg: Message = {
      id,
      role: 'user',
      content,
      timestamp: Date.now(),
    };
    setMessages(prev => [...prev, userMsg]);

    // 2) 设置 loading
    (chatRef.current as any)?.setLoading(true);

    // 3) 调用后端
    fetch('/api/chat', {
      method: 'POST',
      body: JSON.stringify({ message: content }),
    })
      .then(r => r.json())
      .then(data => {
        setMessages(prev => [
          ...prev,
          {
            id: `assistant-${Date.now()}`,
            role: 'assistant',
            content: data.reply,
            timestamp: Date.now(),
          },
        ]);
      })
      .finally(() => {
        (chatRef.current as any)?.setLoading(false);
      });
  };

  return (
    <ai-chat
      ref={chatRef}
      controlled
      messages={messages}
      onAiChatSend={handleSend}
    />
  );
}
```

## 流式回复

```tsx
const handleSend = async (e: CustomEvent) => {
  const { content, id } = e.detail;
  setMessages(prev => [...prev, { id, role: 'user', content, timestamp: Date.now() }]);

  // 占位 AI 消息
  const aiId = `ai-${Date.now()}`;
  setMessages(prev => [...prev, { id: aiId, role: 'assistant', content: '', timestamp: Date.now() }]);

  const reader = (await fetch('/api/stream', { method: 'POST', body: content }))
    .body!.getReader();
  const decoder = new TextDecoder();

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    const chunk = decoder.decode(value);
    // 追加 chunk 到最后一条消息
    setMessages(prev => {
      const next = [...prev];
      next[next.length - 1] = { ...next[next.length - 1], content: next[next.length - 1].content + chunk };
      return next;
    });
  }
};
```

## 注意事项

- 受控模式下 `addMessage()` / `clearMessages()` / `importSession()` 会变成 no-op 并在控制台告警
- `setLoading(true/false)` 仍可用于控制打字指示器显示
- `messages` 数组的 **引用变化** 才会触发重渲染（不可在原数组上 `.push()`）

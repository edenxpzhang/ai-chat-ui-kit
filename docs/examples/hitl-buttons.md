# HITL 富交互按钮（Human-in-the-Loop）

> 适用 v0.2+，演示 `<ai-message>` 的 `actions` slot + `ai-chat-action` 事件

## 场景

Agent 在执行计划中遇到分支点，需要让用户做出选择：

- **继续 / 修改 / 终止**
- **多选一选项卡**（Plan A / Plan B / Plan C）
- **二次确认**（确定执行该工具吗？）

这些场景下 AI 消息需要内嵌可点击的按钮组，点击后把决定回传给 Agent。

## 基础用法

`<ai-message>` 提供了 `actions` slot，slot 内任意带 `data-action="<id>"` 属性的元素被点击都会自动派发事件。

```tsx
<ai-message message={planMsg}>
  <div slot="actions">
    <button data-action="continue">继续执行</button>
    <button data-action="modify" data-step="2">修改第 2 步</button>
    <button data-action="abort" data-reason="user-cancel">终止</button>
  </div>
  <div slot="footer">
    PlannerAgent · 2026-05-15 09:00
  </div>
</ai-message>
```

事件冒泡到 `<ai-chat>` 后转化为 `ai-chat-action` 事件：

```tsx
<ai-chat
  controlled
  messages={messages}
  onAiChatAction={(e) => {
    const { actionId, messageId, payload } = e.detail;
    // actionId: 'continue' | 'modify' | 'abort'
    // payload: { step?: '2', reason?: 'user-cancel' }
    handleHITL(actionId, messageId, payload);
  }}
/>
```

## 完整 React 示例

```tsx
import React, { useState } from 'react';
import '@ai-chat-ui-kit/components';
import '@ai-chat-ui-kit/components/react';
import { applyTheme } from '@ai-chat-ui-kit/themes';
import type { Message } from '@ai-chat-ui-kit/components';

applyTheme('glass');

interface HITLPayload {
  step?: string;
  reason?: string;
}

export default function HITLChat() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'assistant',
      content: '我已生成执行计划，请选择如何继续：',
      timestamp: Date.now(),
    },
  ]);

  const handleAction = (
    e: CustomEvent<{ actionId: string; messageId?: string; payload?: HITLPayload }>
  ) => {
    const { actionId, payload } = e.detail;
    if (actionId === 'continue') {
      sendToAgent({ type: 'resume' });
    } else if (actionId === 'modify') {
      sendToAgent({ type: 'modify_step', step: payload?.step });
    } else if (actionId === 'abort') {
      sendToAgent({ type: 'abort', reason: payload?.reason });
    }
  };

  return (
    <ai-chat controlled messages={messages} onAiChatAction={handleAction}>
      {messages.map((msg) =>
        msg.id === '1' ? (
          <ai-message key={msg.id} message={msg} slot={undefined as any}>
            <div slot="actions">
              <button data-action="continue" className="btn-primary">继续执行</button>
              <button data-action="modify" data-step="2">修改第 2 步</button>
              <button data-action="abort" data-reason="user-cancel">终止</button>
            </div>
            <div slot="footer">PlannerAgent · {new Date().toLocaleTimeString()}</div>
          </ai-message>
        ) : null
      )}
    </ai-chat>
  );
}

function sendToAgent(_msg: any) { /* websocket / fetch */ }
```

## 事件 detail 结构

```ts
interface ActionDetail {
  /** data-action 属性值 */
  actionId: string;
  /** 父级 ai-message 的 message.id */
  messageId?: string;
  /** 该元素上所有 data-* 属性（剥掉 'data-' 前缀）；用于传额外参数 */
  payload?: Record<string, string>;
}
```

示例：

```html
<button data-action="approve" data-tool="get_weather" data-confirm="true">同意</button>
```

会派发：

```js
{
  actionId: 'approve',
  messageId: 'msg-xxx',
  payload: { tool: 'get_weather', confirm: 'true' }
}
```

## 注意事项

- 按钮**不必**自己 stopPropagation，组件用事件冒泡 + composedPath 自动识别
- `data-action` 属性可以放在任意层级（包括按钮的父 `<div>`），事件会向上查找最近的带 `data-action` 的元素
- 处理完操作后建议把按钮组从消息上移除（设 `disabled` 或更新 messages 删除该 slot 内容），避免用户重复点击

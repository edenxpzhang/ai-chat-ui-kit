
// 导入所有组件
import { AiChat } from './chat/chat.js';
import { AiMessage } from './message/message.js';
import { AiInput } from './input/input.js';
import { AiToolCall } from './tool-call/tool-call.js';
import { AiMarkdown } from './markdown/markdown.js';

// 导出组件类
export { AiChat, AiMessage, AiInput, AiToolCall, AiMarkdown };

// 批量注册组件
export function registerComponents(): void {
  if (!customElements.get('ai-chat')) {
    customElements.define('ai-chat', AiChat);
  }
  if (!customElements.get('ai-message')) {
    customElements.define('ai-message', AiMessage);
  }
  if (!customElements.get('ai-input')) {
    customElements.define('ai-input', AiInput);
  }
  if (!customElements.get('ai-tool-call')) {
    customElements.define('ai-tool-call', AiToolCall);
  }
  if (!customElements.get('ai-markdown')) {
    customElements.define('ai-markdown', AiMarkdown);
  }
}

// 自动注册（如果直接导入此模块）
registerComponents();

/**
 * @generated-by AI: edenxpzhang
 * @generated-date 2026-05-13
 */

import { LitElement, html } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import './message.css';

// 导入共享类型
import { Message } from '../types.js';

@customElement('ai-message')
export class AiMessage extends LitElement {
  @property({ type: Boolean })
  headless = true;

  @property({ type: Object })
  message?: Message;

  @property({ type: String })
  theme = 'default';

  // 默认 light DOM，让外部主题 CSS 能命中
  createRenderRoot() {
    if (this.headless) {
      return this;
    }
    return super.createRenderRoot();
  }

  render() {
    if (!this.message) {
      return html``;
    }

    const isUser = this.message.role === 'user';
    const roleModifier = isUser ? 'ai-message--user' : 'ai-message--assistant';
    const avatarText = isUser ? '我' : 'AI';
    const time = new Date(this.message.timestamp).toLocaleTimeString('zh-CN', {
      hour: '2-digit',
      minute: '2-digit',
    });

    return html`
      <div class="ai-message ${roleModifier}">
        <div class="ai-message__avatar">${avatarText}</div>
        <div class="ai-message__body">
          <div class="ai-message__content">${this.message.content}</div>
          ${this.message.toolCalls && this.message.toolCalls.length > 0
            ? html`
                <div class="ai-message__tool-calls">
                  ${this.message.toolCalls.map(
                    (toolCall) => html`
                      <ai-tool-call .toolCall=${toolCall}></ai-tool-call>
                    `
                  )}
                </div>
              `
            : ''}
          <div class="ai-message__time">${time}</div>
        </div>
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'ai-message': AiMessage;
  }
}

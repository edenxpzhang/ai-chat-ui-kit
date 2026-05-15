/**
 * @generated-by AI: edenxpzhang
 * @generated-date 2026-05-13
 * @updated 2026-05-15  增加 actions / footer / content-extra 三个 slot 与 ai-message-action 事件
 */

import { LitElement, html } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import messageCss from './message.css';
import { injectStyle } from '../utils/style-injector.js';

// 导入共享类型
import { Message } from '../types.js';

// light DOM 样式注入
injectStyle('ai-message', messageCss as unknown as string);

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
      <div class="ai-message ${roleModifier}" @click=${this.handleClick}>
        <div class="ai-message__avatar">${avatarText}</div>
        <div class="ai-message__body">
          <div class="ai-message__content">${this.message.content}</div>
          <slot name="content-extra"></slot>
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
          <div class="ai-message__actions">
            <slot name="actions"></slot>
          </div>
          <div class="ai-message__time">${time}</div>
          <div class="ai-message__footer">
            <slot name="footer"></slot>
          </div>
        </div>
      </div>
    `;
  }

  /**
   * 监听 slot 内带 data-action 属性的元素点击，
   * 自动派发 ai-message-action 事件给上层（最终会被 ai-chat 转化为 ai-chat-action）
   *
   * 使用方式：
   * ```html
   * <ai-message ...>
   *   <div slot="actions">
   *     <button data-action="continue">继续</button>
   *     <button data-action="abort" data-reason="user-cancel">终止</button>
   *   </div>
   * </ai-message>
   * ```
   */
  private handleClick(e: Event) {
    const path = (e.composedPath ? e.composedPath() : []) as Array<EventTarget>;
    let actionEl: HTMLElement | null = null;
    for (const node of path) {
      if (node === this) break;
      if (node instanceof HTMLElement && node.hasAttribute('data-action')) {
        actionEl = node;
        break;
      }
    }
    if (!actionEl) return;

    const actionId = actionEl.getAttribute('data-action') || '';
    // 把 data-* 全部收集为 payload，便于宿主拿到额外信息
    const payload: Record<string, string> = {};
    Array.from(actionEl.attributes).forEach((attr) => {
      if (attr.name.startsWith('data-') && attr.name !== 'data-action') {
        payload[attr.name.slice(5)] = attr.value;
      }
    });

    this.dispatchEvent(
      new CustomEvent('ai-message-action', {
        detail: {
          actionId,
          messageId: this.message?.id,
          payload,
        },
        bubbles: true,
        composed: true,
      })
    );
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'ai-message': AiMessage;
  }
}

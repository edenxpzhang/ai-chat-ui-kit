/**
 * @generated-by AI: edenxpzhang
 * @generated-date 2026-05-13
 */

import { LitElement, html, PropertyValues } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import './chat.css';

// 导入共享类型
import { Message, ModelConfig } from '../types.js';

@customElement('ai-chat')
export class AiChat extends LitElement {
  // 默认 light DOM，让外部主题 CSS 能命中
  @property({ type: Boolean })
  headless = true;

  @property({ type: String })
  theme = 'default';

  @property({ type: String, attribute: 'header-title' })
  headerTitle = 'AI Assistant';

  @property({ type: String, attribute: 'header-subtitle' })
  headerSubtitle = '在线 · 随时为您服务';

  @property({ type: String, attribute: 'header-avatar' })
  headerAvatar = '🤖';

  @property({ type: Boolean, attribute: 'hide-header' })
  hideHeader = false;

  @property({ type: Object })
  config?: ModelConfig;

  @state()
  private messages: Message[] = [];

  @state()
  private isLoading = false;

  // 默认禁用 Shadow DOM（让全局主题 CSS 能命中所有内部元素）
  createRenderRoot() {
    if (this.headless) {
      return this;
    }
    return super.createRenderRoot();
  }

  updated(changedProperties: PropertyValues) {
    if (changedProperties.has('theme')) {
      this.applyTheme();
    }
  }

  private applyTheme() {
    document.documentElement.setAttribute('data-theme', this.theme);
  }

  render() {
    return html`
      <div class="ai-chat" data-theme=${this.theme}>
        <slot name="header">
          ${this.hideHeader
            ? ''
            : html`
                <header class="ai-chat__header">
                  <div class="ai-chat__avatar">${this.headerAvatar}</div>
                  <div class="ai-chat__title-group">
                    <h3 class="ai-chat__title">${this.headerTitle}</h3>
                    <p class="ai-chat__subtitle">${this.headerSubtitle}</p>
                  </div>
                  <slot name="header-actions"></slot>
                </header>
              `}
        </slot>

        <div class="ai-chat__messages">
          ${this.messages.length === 0
            ? html`<div class="ai-chat__empty">开始对话吧</div>`
            : this.messages.map(
                (message) => html`
                  <ai-message
                    .message=${message}
                    .theme=${this.theme}
                    ?headless=${this.headless}
                  ></ai-message>
                `
              )}
          ${this.isLoading
            ? html`
                <div class="ai-typing-indicator">
                  <span class="ai-typing-indicator__dot"></span>
                  <span class="ai-typing-indicator__dot"></span>
                  <span class="ai-typing-indicator__dot"></span>
                </div>
              `
            : ''}
        </div>

        <ai-input
          .disabled=${this.isLoading}
          ?headless=${this.headless}
          @send=${this.handleSend}
          @input-change=${this.handleInputChange}
        ></ai-input>

        <slot name="footer"></slot>
      </div>
    `;
  }

  private handleSend(event: CustomEvent) {
    const content = event.detail.content;
    this.sendMessage(content);
  }

  private handleInputChange(event: CustomEvent) {
    this.dispatchEvent(
      new CustomEvent('input-change', {
        detail: event.detail,
        bubbles: true,
        composed: true,
      })
    );
  }

  private messageIdCounter = 0;

  /**
   * 生成唯一的消息 ID
   */
  private generateMessageId(): string {
    this.messageIdCounter++;
    return `msg-${Date.now()}-${this.messageIdCounter}-${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * 发送消息
   */
  sendMessage(content: string): void {
    if (!content.trim()) return;

    const userMessage: Message = {
      id: this.generateMessageId(),
      role: 'user',
      content,
      timestamp: Date.now(),
    };

    this.messages = [...this.messages, userMessage];
    this.isLoading = true;

    this.dispatchEvent(
      new CustomEvent('message-sent', {
        detail: { message: userMessage },
        bubbles: true,
        composed: true,
      })
    );

    // 模拟 AI 回复（实际应调用 API）
    setTimeout(() => {
      const aiMessage: Message = {
        id: this.generateMessageId(),
        role: 'assistant',
        content: `回复：${content}`,
        timestamp: Date.now(),
      };

      this.messages = [...this.messages, aiMessage];
      this.isLoading = false;

      this.dispatchEvent(
        new CustomEvent('message-received', {
          detail: { message: aiMessage },
          bubbles: true,
          composed: true,
        })
      );
    }, 1000);
  }

  /**
   * 添加预设消息（用于演示/初始化）
   */
  addMessage(message: Partial<Message> & { role: Message['role']; content: string }): void {
    const full: Message = {
      id: message.id ?? this.generateMessageId(),
      role: message.role,
      content: message.content,
      timestamp: message.timestamp ?? Date.now(),
      toolCalls: message.toolCalls,
    };
    this.messages = [...this.messages, full];
  }

  /**
   * 清空消息
   */
  clearMessages(): void {
    this.messages = [];
  }

  /**
   * 导出会话
   */
  exportSession(): string {
    return JSON.stringify(this.messages, null, 2);
  }

  /**
   * 导入会话
   */
  importSession(data: string): void {
    try {
      const messages = JSON.parse(data) as Message[];
      this.messages = messages;
    } catch (error) {
      this.dispatchEvent(
        new CustomEvent('error', {
          detail: { error: 'Failed to import session' },
          bubbles: true,
          composed: true,
        })
      );
    }
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'ai-chat': AiChat;
  }
}

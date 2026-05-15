/**
 * @generated-by AI: edenxpzhang
 * @generated-date 2026-05-13
 * @updated 2026-05-15  新增 controlled 模式 + ai-chat-send / ai-chat-action 事件
 */

import { LitElement, html, PropertyValues } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import chatCss from './chat.css';
import { injectStyle } from '../utils/style-injector.js';

// 导入共享类型
import { Message, ModelConfig } from '../types.js';

// light DOM 组件无法使用 Lit static styles，
// 这里在模块加载时将样式幂等注入 <head>，免去宿主项目手动 import dist/index.css 的麻烦。
injectStyle('ai-chat', chatCss as unknown as string);

@customElement('ai-chat')
export class AiChat extends LitElement {
  // 默认 light DOM，让外部主题 CSS 能命中
  @property({ type: Boolean })
  headless = true;

  /**
   * 受控模式
   *
   * - false（默认）：组件内部维护 messages 数组，sendMessage 自动追加并触发模拟回复（向后兼容）
   * - true：组件不维护内部状态，完全由外部 `.messages=${[...]}` 渲染；
   *         用户输入后只派发 `ai-chat-send` 事件，宿主自行决定如何追加 AI 回复
   */
  @property({ type: Boolean })
  controlled = false;

  /**
   * 外部传入的消息数组
   *
   * - controlled = true 时：作为唯一数据源
   * - controlled = false 时：作为初始值（仅 attributeChangedCallback 首次同步）
   *
   * 自定义 hasChanged：除引用变更外，长度变化也视为变更，
   * 避免宿主在原地 push 后忘记换引用导致不重渲染的低级错误。
   * 推荐宿主仍以"传入新引用"的方式更新（[...arr, newOne]）。
   */
  @property({
    attribute: false,
    hasChanged: (n: Message[] | undefined, o: Message[] | undefined) =>
      n !== o || (n?.length ?? 0) !== (o?.length ?? 0),
  })
  messages: Message[] = [];

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

  /**
   * 透传给内部 `<ai-input>` 的 placeholder 文案
   * （便于宿主本地化 / 替换提示语而无需 hack DOM）
   */
  @property({ type: String, attribute: 'input-placeholder' })
  inputPlaceholder = '输入消息...';

  /**
   * 透传给内部 `<ai-input>` 的发送按钮文案
   */
  @property({ type: String, attribute: 'send-text' })
  sendText = '发送';

  @property({ type: Object })
  config?: ModelConfig;

  /** 仅 controlled = false 时使用 */
  @state()
  private internalMessages: Message[] = [];

  @state()
  private isLoading = false;

  /** 实际渲染用的消息数组：controlled → messages，非 controlled → internalMessages */
  private get displayMessages(): Message[] {
    return this.controlled ? this.messages : this.internalMessages;
  }

  // 默认禁用 Shadow DOM（让全局主题 CSS 能命中所有内部元素）
  createRenderRoot() {
    if (this.headless) {
      return this;
    }
    return super.createRenderRoot();
  }

  updated(changedProperties: PropertyValues) {
    if (changedProperties.has('theme')) {
      this.applyThemeAttr();
    }
  }

  /**
   * Lit 首次渲染完成后派发 `ai-chat-ready`，
   * 宿主可在该事件后再写入 `.messages`，避免 SSR / 懒挂载场景的赋值竞态。
   */
  firstUpdated() {
    this.dispatchEvent(
      new CustomEvent('ai-chat-ready', {
        bubbles: true,
        composed: true,
      })
    );
  }

  private applyThemeAttr() {
    // 仅打 data-theme 属性到自身，不再污染 document.documentElement
    this.setAttribute('data-theme', this.theme);
  }

  render() {
    const list = this.displayMessages;
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

        <div class="ai-chat__messages" @ai-message-action=${this.handleMessageAction}>
          ${list.length === 0
            ? html`<div class="ai-chat__empty">
                <slot name="empty">开始对话吧</slot>
              </div>`
            : list.map(
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

        <slot name="input">
          <ai-input
            .disabled=${this.isLoading}
            ?headless=${this.headless}
            .placeholder=${this.inputPlaceholder}
            .sendText=${this.sendText}
            @send=${this.handleSend}
            @input-change=${this.handleInputChange}
          ></ai-input>
        </slot>

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

  /**
   * 监听子 ai-message 派发的 ai-message-action 事件，
   * 统一聚合为 ai-chat-action 事件抛给宿主
   */
  private handleMessageAction(event: CustomEvent) {
    const { actionId, messageId, payload } = event.detail || {};
    this.dispatchEvent(
      new CustomEvent('ai-chat-action', {
        detail: { actionId, messageId, payload },
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
   * 发送消息（用户输入）
   *
   * controlled 模式下：只派发 ai-chat-send 事件，不维护内部状态
   * 非 controlled 模式下：追加到 internalMessages，并触发模拟回复（向后兼容）
   */
  sendMessage(content: string): void {
    if (!content.trim()) return;

    const id = this.generateMessageId();

    // 始终派发 ai-chat-send 事件（新协议）
    this.dispatchEvent(
      new CustomEvent('ai-chat-send', {
        detail: { content, id },
        bubbles: true,
        composed: true,
      })
    );

    if (this.controlled) {
      // 受控模式：宿主负责追加消息和 AI 回复
      return;
    }

    // 非受控模式（向后兼容旧行为）
    const userMessage: Message = {
      id,
      role: 'user',
      content,
      timestamp: Date.now(),
    };

    this.internalMessages = [...this.internalMessages, userMessage];
    this.isLoading = true;

    // 兼容旧事件名
    this.dispatchEvent(
      new CustomEvent('message-sent', {
        detail: { message: userMessage },
        bubbles: true,
        composed: true,
      })
    );

    // 模拟 AI 回复（仅非受控模式下保留 demo 行为）
    setTimeout(() => {
      const aiMessage: Message = {
        id: this.generateMessageId(),
        role: 'assistant',
        content: `回复：${content}`,
        timestamp: Date.now(),
      };

      this.internalMessages = [...this.internalMessages, aiMessage];
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
   *
   * controlled 模式下此方法不生效（请通过 .messages 属性更新）
   */
  addMessage(message: Partial<Message> & { role: Message['role']; content: string }): void {
    if (this.controlled) {
      console.warn('[ai-chat] addMessage() is a no-op in controlled mode. Update `messages` prop instead.');
      return;
    }
    const full: Message = {
      id: message.id ?? this.generateMessageId(),
      role: message.role,
      content: message.content,
      timestamp: message.timestamp ?? Date.now(),
      toolCalls: message.toolCalls,
    };
    this.internalMessages = [...this.internalMessages, full];
  }

  /**
   * 设置加载状态（流式回复中可显示打字指示器）
   */
  setLoading(loading: boolean): void {
    this.isLoading = loading;
  }

  /**
   * 清空消息
   */
  clearMessages(): void {
    if (this.controlled) {
      console.warn('[ai-chat] clearMessages() is a no-op in controlled mode. Update `messages` prop instead.');
      return;
    }
    this.internalMessages = [];
  }

  /**
   * 导出会话
   */
  exportSession(): string {
    return JSON.stringify(this.displayMessages, null, 2);
  }

  /**
   * 导入会话（仅非受控模式生效）
   */
  importSession(data: string): void {
    if (this.controlled) {
      console.warn('[ai-chat] importSession() is a no-op in controlled mode.');
      return;
    }
    try {
      const messages = JSON.parse(data) as Message[];
      this.internalMessages = messages;
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

/**
 * @generated-by AI: edenxpzhang
 * @generated-date 2026-05-13
 */

import { LitElement, html } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import inputCss from './input.css';
import { injectStyle } from '../utils/style-injector.js';

// light DOM 样式注入
injectStyle('ai-input', inputCss as unknown as string);

@customElement('ai-input')
export class AiInput extends LitElement {
  @property({ type: Boolean })
  headless = true;

  @property({ type: Boolean })
  disabled = false;

  @property({ type: String })
  placeholder = '输入消息...';

  @property({ type: String, attribute: 'send-text' })
  sendText = '发送';

  @state()
  private value = '';

  private textarea?: HTMLTextAreaElement;

  // 默认 light DOM
  createRenderRoot() {
    if (this.headless) {
      return this;
    }
    return super.createRenderRoot();
  }

  firstUpdated() {
    this.textarea = this.renderRoot.querySelector('textarea') as HTMLTextAreaElement;
  }

  render() {
    return html`
      <div class="ai-input">
        <div class="ai-input__wrapper">
          <textarea
            class="ai-input__textarea"
            .value=${this.value}
            placeholder=${this.placeholder}
            ?disabled=${this.disabled}
            @input=${this.handleInput}
            @keydown=${this.handleKeyDown}
            rows="1"
          ></textarea>
          <button
            class="ai-input__send"
            ?disabled=${this.disabled || !this.value.trim()}
            @click=${this.handleSend}
          >
            ${this.sendText}
          </button>
        </div>
      </div>
    `;
  }

  private handleInput(e: Event) {
    const target = e.target as HTMLTextAreaElement;
    this.value = target.value;
    this.adjustHeight(target);

    this.dispatchEvent(
      new CustomEvent('input-change', {
        detail: { value: this.value },
        bubbles: true,
        composed: true,
      })
    );
  }

  private handleKeyDown(e: KeyboardEvent) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      this.handleSend();
    }
  }

  private handleSend() {
    if (!this.value.trim() || this.disabled) return;

    this.dispatchEvent(
      new CustomEvent('send', {
        detail: { content: this.value },
        bubbles: true,
        composed: true,
      })
    );

    this.value = '';
    if (this.textarea) {
      this.textarea.style.height = 'auto';
    }
  }

  private adjustHeight(textarea: HTMLTextAreaElement) {
    textarea.style.height = 'auto';
    const maxHeight = 120;
    const newHeight = Math.min(textarea.scrollHeight, maxHeight);
    textarea.style.height = `${newHeight}px`;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'ai-input': AiInput;
  }
}

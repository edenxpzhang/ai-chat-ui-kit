
import { LitElement, html, css } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import toolCallCss from './tool-call.css';
import { injectStyle } from '../utils/style-injector.js';

// 导入共享类型
import { ToolCall } from '../types.js';

// light DOM 样式注入
injectStyle('ai-tool-call', toolCallCss as unknown as string);

@customElement('ai-tool-call')
export class AiToolCall extends LitElement {
  static styles = css`
    :host {
      display: block;
    }

    .tool-call {
      border: 1px solid var(--ai-border, #e8e8e8);
      border-radius: var(--ai-border-radius, 8px);
      overflow: hidden;
      font-size: 12px;
    }

    .tool-call-header {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 8px 12px;
      background-color: var(--ai-bg-secondary, #f5f5f5);
      cursor: pointer;
      user-select: none;
    }

    .tool-call-header:hover {
      background-color: var(--ai-border, #e8e8e8);
    }

    .tool-call-status {
      width: 8px;
      height: 8px;
      border-radius: 50%;
    }

    .tool-call-status-pending {
      background-color: #faad14;
    }

    .tool-call-status-running {
      background-color: #1677ff;
      animation: pulse 1.5s infinite;
    }

    .tool-call-status-completed {
      background-color: #52c41a;
    }

    .tool-call-status-failed {
      background-color: #ff4d4f;
    }

    @keyframes pulse {
      0%, 100% { opacity: 1; }
      50% { opacity: 0.5; }
    }

    .tool-call-name {
      flex: 1;
      font-weight: 500;
      color: var(--ai-text, #333333);
    }

    .tool-call-toggle {
      color: var(--ai-text-secondary, #666666);
      font-size: 10px;
    }

    .tool-call-details {
      padding: 12px;
      border-top: 1px solid var(--ai-border, #e8e8e8);
      background-color: var(--ai-bg, #ffffff);
    }

    .tool-call-section {
      margin-bottom: 8px;
    }

    .tool-call-section:last-child {
      margin-bottom: 0;
    }

    .tool-call-label {
      font-weight: 500;
      color: var(--ai-text-secondary, #666666);
      margin-bottom: 4px;
    }

    .tool-call-content {
      background-color: var(--ai-bg-secondary, #f5f5f5);
      padding: 8px;
      border-radius: 4px;
      overflow-x: auto;
      font-family: 'Courier New', monospace;
      font-size: 11px;
      white-space: pre-wrap;
      word-break: break-all;
    }
  `;

  @property({ type: Object })
  toolCall?: ToolCall;

  @state()
  private expanded = false;

  render() {
    if (!this.toolCall) {
      return html``;
    }

    const statusClass = `tool-call-status-${this.toolCall.status}`;

    return html`
      <div class="tool-call">
        <div class="tool-call-header" @click=${this.toggleExpand}>
          <div class="tool-call-status ${statusClass}"></div>
          <div class="tool-call-name">${this.toolCall.name}</div>
          <div class="tool-call-toggle">
            ${this.expanded ? '▼' : '▶'}
          </div>
        </div>
        ${this.expanded
          ? html`
              <div class="tool-call-details">
                <div class="tool-call-section">
                  <div class="tool-call-label">参数</div>
                  <div class="tool-call-content">
                    ${JSON.stringify(this.toolCall.parameters, null, 2)}
                  </div>
                </div>
                ${this.toolCall.result
                  ? html`
                      <div class="tool-call-section">
                        <div class="tool-call-label">结果</div>
                        <div class="tool-call-content">
                          ${typeof this.toolCall.result === 'string'
                            ? this.toolCall.result
                            : JSON.stringify(this.toolCall.result, null, 2)}
                        </div>
                      </div>
                    `
                  : ''}
              </div>
            `
          : ''}
      </div>
    `;
  }

  private toggleExpand() {
    this.expanded = !this.expanded;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'ai-tool-call': AiToolCall;
  }
}

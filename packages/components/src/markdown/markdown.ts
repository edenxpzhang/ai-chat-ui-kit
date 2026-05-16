
import { LitElement, html, css } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import './markdown.css';

// 简单的 Markdown 解析器（等待 core 包完成后替换为实际导入）
function parseMarkdown(content: string): string {
  let html = content;
  
  // 代码块
  html = html.replace(/```(\w+)?\n([\s\S]*?)```/g, '<pre><code>$2</code></pre>');
  
  // 行内代码
  html = html.replace(/`([^`]+)`/g, '<code>$1</code>');
  
  // 标题
  html = html.replace(/^### (.*$)/gm, '<h3>$1</h3>');
  html = html.replace(/^## (.*$)/gm, '<h2>$1</h2>');
  html = html.replace(/^# (.*$)/gm, '<h1>$1</h1>');
  
  // 粗体
  html = html.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
  
  // 斜体
  html = html.replace(/\*(.*?)\*/g, '<em>$1</em>');
  
  // 链接
  html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank">$1</a>');
  
  // 列表
  html = html.replace(/^- (.*$)/gm, '<li>$1</li>');
  html = html.replace(/(<li>.*<\/li>)/s, '<ul>$1</ul>');
  
  // 段落
  html = html.replace(/^(?!<[a-z]).*$/gm, '<p>$&</p>');
  html = html.replace(/<p><(h[1-6]|pre|ul|ol|blockquote|table)/g, '<$1');
  html = html.replace(/<\/(h[1-6]|pre|ul|ol|blockquote|table)><\/p>/g, '</$1>');
  
  return html;
}

// 检测是否包含 Mermaid 图表
function hasMermaid(content: string): boolean {
  return /```mermaid/.test(content);
}

// 检测是否包含 Latex 公式
function hasLatex(content: string): boolean {
  return /\$.*?\$|\\\(.*?\\\)|\\\[.*?\\\]/.test(content);
}

@customElement('ai-markdown')
export class AiMarkdown extends LitElement {
  static styles = css`
    :host {
      display: block;
    }

    .markdown-content {
      line-height: 1.6;
    }

    .markdown-content h1 {
      font-size: 2em;
      margin: 0.67em 0;
      font-weight: 600;
    }

    .markdown-content h2 {
      font-size: 1.5em;
      margin: 0.83em 0;
      font-weight: 600;
    }

    .markdown-content h3 {
      font-size: 1.17em;
      margin: 1em 0;
      font-weight: 600;
    }

    .markdown-content p {
      margin: 0.5em 0;
    }

    .markdown-content code {
      background-color: var(--ai-bg-secondary, #f5f5f5);
      padding: 2px 6px;
      border-radius: 4px;
      font-family: 'Courier New', monospace;
      font-size: 0.9em;
    }

    .markdown-content pre {
      background-color: var(--ai-bg-secondary, #f5f5f5);
      padding: 12px;
      border-radius: var(--ai-border-radius, 8px);
      overflow-x: auto;
      margin: 0.5em 0;
    }

    .markdown-content pre code {
      background-color: transparent;
      padding: 0;
    }

    .markdown-content blockquote {
      border-left: 4px solid var(--ai-border, #e8e8e8);
      padding-left: 12px;
      margin: 0.5em 0;
      color: var(--ai-text-secondary, #666666);
    }

    .markdown-content ul,
    .markdown-content ol {
      padding-left: 2em;
      margin: 0.5em 0;
    }

    .markdown-content a {
      color: var(--ai-primary, #1677ff);
      text-decoration: none;
    }

    .markdown-content a:hover {
      text-decoration: underline;
    }

    .markdown-content table {
      border-collapse: collapse;
      width: 100%;
      margin: 0.5em 0;
    }

    .markdown-content th,
    .markdown-content td {
      border: 1px solid var(--ai-border, #e8e8e8);
      padding: 8px 12px;
      text-align: left;
    }

    .markdown-content th {
      background-color: var(--ai-bg-secondary, #f5f5f5);
      font-weight: 600;
    }

    .mermaid-container {
      margin: 1em 0;
      padding: 12px;
      background-color: var(--ai-bg, #ffffff);
      border: 1px solid var(--ai-border, #e8e8e8);
      border-radius: var(--ai-border-radius, 8px);
      overflow-x: auto;
      text-align: center;
    }

    .latex-formula {
      font-style: italic;
      padding: 0 4px;
    }

    .latex-block {
      display: block;
      text-align: center;
      margin: 1em 0;
      font-size: 1.2em;
    }
  `;

  @property({ type: String })
  content = '';

  @property({ type: Array })
  plugins: string[] = [];

  /**
   * 流式模式
   *
   * 为 true 时表示当前正在接收流式 chunk；目前与默认行为一致（都走全量 reparse），
   * 后续可在此基础上接入 DOM diff 实现真正的增量渲染。
   * 该属性主要用于宿主标识 + 触发 ai-markdown-rendered 事件时附带 streaming 状态。
   */
  @property({ type: Boolean })
  streaming = false;

  /**
   * 追加内容（流式场景）
   *
   * 等价于 `this.content += chunk`，但语义更明确，便于后续优化为
   * 「不重新解析整段、只追加渲染新增 chunk」。
   *
   * @example
   * ```ts
   * const md = document.querySelector('ai-markdown')!;
   * md.streaming = true;
   * stream.on('data', chunk => md.appendContent(chunk));
   * stream.on('end', () => { md.streaming = false; });
   * ```
   */
  appendContent(chunk: string): void {
    if (!chunk) return;
    this.content = (this.content || '') + chunk;
  }

  /**
   * 重置内容（用于重新开始流式接收）
   */
  resetContent(): void {
    this.content = '';
  }

  updated() {
    // 渲染完成事件，宿主可用于自动滚动到底
    this.dispatchEvent(
      new CustomEvent('ai-markdown-rendered', {
        detail: {
          contentLength: this.content.length,
          streaming: this.streaming,
        },
        bubbles: true,
        composed: true,
      })
    );
  }

  render() {
    const hasMermaidContent = hasMermaid(this.content);
    const hasLatexContent = hasLatex(this.content);

    return html`
      <div class="markdown-content">
        ${hasMermaidContent && this.plugins.includes('mermaid')
          ? html`<div class="mermaid-container">Mermaid 图表（需要集成 Mermaid.js）</div>`
          : ''}
        ${hasLatexContent && this.plugins.includes('latex')
          ? html`<div class="latex-block">Latex 公式（需要集成 KaTeX 或 MathJax）</div>`
          : ''}
        <div>${this.renderMarkdown()}</div>
      </div>
    `;
  }

  private renderMarkdown() {
    const htmlContent = parseMarkdown(this.content);
    return html`<div .innerHTML=${this.sanitizeHtml(htmlContent)}></div>`;
  }

  private sanitizeHtml(html: string): string {
    // 简单的 HTML 清理，防止 XSS
    // 在生产环境中应使用 DOMPurify 等库
    const temp = document.createElement('div');
    temp.innerHTML = html;
    
    // 移除 script 标签
    const scripts = temp.querySelectorAll('script');
    scripts.forEach(script => script.remove());
    
    // 移除危险的 on* 属性
    const allElements = temp.querySelectorAll('*');
    allElements.forEach(el => {
      Array.from(el.attributes).forEach(attr => {
        if (attr.name.startsWith('on')) {
          el.removeAttribute(attr.name);
        }
      });
    });
    
    return temp.innerHTML;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'ai-markdown': AiMarkdown;
  }
}

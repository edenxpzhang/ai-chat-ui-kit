
import { MessagePlugin, Message, RenderContext, ToolCall } from '../types/index.js';
import { detectMermaid } from '../parser/mermaid.js';
import { detectLatex, renderLatex } from '../parser/latex.js';
import { parseMarkdown } from '../parser/markdown.js';

/**
 * 代码块插件
 * 支持代码高亮、复制按钮、语言标签
 */
export class CodeBlockPlugin implements MessagePlugin {
  type = 'code-block';
  priority = 10;

  /**
   * 判断是否匹配代码块
   */
  match(content: string): boolean {
    if (!content || typeof content !== 'string') {
      return false;
    }

    // 检测 ``` 代码块
    const codeBlockRegex = /```[\s\S]*?```/;
    return codeBlockRegex.test(content);
  }

  /**
   * 渲染代码块
   */
  render(content: string, context: RenderContext): HTMLElement | string {
    if (!content) {
      return '';
    }

    // 使用 marked 解析 Markdown（它会自动处理代码块高亮）
    const html = parseMarkdown(content);

    // 创建容器
    const container = document.createElement('div');
    container.className = 'plugin-code-block';
    container.innerHTML = html;

    // 为代码块添加复制按钮和语言标签
    this.enhanceCodeBlocks(container);

    return container;
  }

  /**
   * 增强代码块（添加复制按钮等）
   */
  private enhanceCodeBlocks(container: HTMLElement): void {
    const codeBlocks = container.querySelectorAll('pre code');

    codeBlocks.forEach((codeEl) => {
      const pre = codeEl.closest('pre');
      if (!pre) return;

      // 创建包装器
      const wrapper = document.createElement('div');
      wrapper.className = 'code-block-wrapper';

      // 获取语言
      const classes = codeEl.className;
      const langMatch = classes.match(/language-(\S+)/);
      const language = langMatch ? langMatch[1] : 'plaintext';

      // 创建头部
      const header = document.createElement('div');
      header.className = 'code-block-header';

      const langLabel = document.createElement('span');
      langLabel.className = 'code-block-lang';
      langLabel.textContent = language;

      const copyBtn = document.createElement('button');
      copyBtn.className = 'code-block-copy-btn';
      copyBtn.textContent = '复制';
      copyBtn.addEventListener('click', () => {
        const code = codeEl.textContent || '';
        navigator.clipboard.writeText(code).then(() => {
          copyBtn.textContent = '已复制';
          setTimeout(() => {
            copyBtn.textContent = '复制';
          }, 2000);
        });
      });

      header.appendChild(langLabel);
      header.appendChild(copyBtn);

      // 重新组织 DOM
      pre.parentNode?.insertBefore(wrapper, pre);
      wrapper.appendChild(header);
      wrapper.appendChild(pre);
    });
  }
}

/**
 * Mermaid 图表插件
 * 检测并渲染 Mermaid 图表
 */
export class MermaidPlugin implements MessagePlugin {
  type = 'mermaid';
  priority = 20;

  /**
   * 判断是否包含 Mermaid 图表
   */
  match(content: string): boolean {
    if (!content || typeof content !== 'string') {
      return false;
    }

    // 检测 ```mermaid 代码块
    const mermaidBlockRegex = /```mermaid[\s\S]*?```/i;
    if (mermaidBlockRegex.test(content)) {
      return true;
    }

    // 或使用专门的 mermaid 检测函数
    return detectMermaid(content);
  }

  /**
   * 渲染 Mermaid 图表
   */
  render(content: string, context: RenderContext): HTMLElement | string {
    if (!content) {
      return '';
    }

    const container = document.createElement('div');
    container.className = 'plugin-mermaid';

    // 提取所有 mermaid 代码块
    const mermaidRegex = /```mermaid\s*([\s\S]*?)```/gi;
    let match: RegExpExecArray | null;
    let remainingContent = content;

    const parts: Array<{ type: 'text' | 'mermaid'; content: string }> = [];

    while ((match = mermaidRegex.exec(content)) !== null) {
      const mermaidCode = match[1]?.trim() || '';

      // 添加 mermaid 之前的文本
      const textBefore = content.substring(0, match.index);
      if (textBefore) {
        parts.push({ type: 'text', content: textBefore });
      }

      // 添加 mermaid 代码
      parts.push({ type: 'mermaid', content: mermaidCode });

      // 更新剩余内容
      remainingContent = content.substring(match.index + match[0].length);
    }

    // 添加剩余文本
    if (remainingContent) {
      parts.push({ type: 'text', content: remainingContent });
    }

    // 渲染各部分
    parts.forEach(part => {
      if (part.type === 'text') {
        const textHtml = parseMarkdown(part.content);
        const textDiv = document.createElement('div');
        textDiv.innerHTML = textHtml;
        container.appendChild(textDiv);
      } else if (part.type === 'mermaid') {
        const mermaidContainer = document.createElement('div');
        mermaidContainer.className = 'mermaid-render-area';
        container.appendChild(mermaidContainer);

        // 动态导入并渲染 mermaid
        this.renderMermaidDiagram(part.content, mermaidContainer);
      }
    });

    return container;
  }

  /**
   * 渲染 Mermaid 图表
   */
  private renderMermaidDiagram(code: string, container: HTMLElement): void {
    import('mermaid')
      .then((mermaid) => {
        mermaid.default.initialize({
          startOnLoad: false,
          theme: 'default',
          securityLevel: 'loose'
        });

        const id = `mermaid-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
        container.id = id;
        container.textContent = code;

        mermaid.default.run({ querySelector: `#${id}` });
      })
      .catch((err) => {
        console.error('Failed to load mermaid:', err);
        container.innerHTML = `<pre style="color:red;">Mermaid 渲染失败</pre>`;
      });
  }
}

/**
 * Latex 公式插件
 * 检测并渲染 Latex 公式
 */
export class LatexPlugin implements MessagePlugin {
  type = 'latex';
  priority = 15;

  /**
   * 判断是否包含 Latex 公式
   */
  match(content: string): boolean {
    if (!content || typeof content !== 'string') {
      return false;
    }

    return detectLatex(content).inline.length > 0 || detectLatex(content).block.length > 0;
  }

  /**
   * 渲染 Latex 公式
   */
  render(content: string, context: RenderContext): HTMLElement | string {
    if (!content) {
      return '';
    }

    // 使用 KaTeX 或 MathJax 渲染
    const container = document.createElement('div');
    container.className = 'plugin-latex';

    // 先解析 Markdown
    let html = parseMarkdown(content);

    // 替换 Latex 占位符为渲染后的公式
    // 这里需要外部库（KaTeX/MathJax）支持
    // 返回带有 class 标记的 HTML，供外部渲染
    container.innerHTML = renderLatex(html);

    // 尝试使用 KaTeX 渲染
    this.renderWithKaTeX(container);

    return container;
  }

  /**
   * 使用 KaTeX 渲染
   */
  private renderWithKaTeX(container: HTMLElement): void {
    import('katex')
      .then((katex) => {
        // 渲染块级公式
        const blockFormulas = container.querySelectorAll('.latex-block');
        blockFormulas.forEach(el => {
          if (!(el instanceof HTMLElement)) return;
          const formula = el.textContent || '';
          try {
            katex.default.render(formula.replace(/^\$|\$$/g, ''), el, {
              displayMode: true,
              throwOnError: false
            });
          } catch (err) {
            console.error('KaTeX block render error:', err);
          }
        });

        // 渲染行内公式
        const inlineFormulas = container.querySelectorAll('.latex-inline');
        inlineFormulas.forEach(el => {
          if (!(el instanceof HTMLElement)) return;
          const formula = el.textContent || '';
          try {
            katex.default.render(formula.replace(/^\$|\$$/g, ''), el, {
              displayMode: false,
              throwOnError: false
            });
          } catch (err) {
            console.error('KaTeX inline render error:', err);
          }
        });
      })
      .catch((err) => {
        console.warn('KaTeX not loaded:', err);
      });
  }
}

/**
 * 工具调用插件
 * 渲染工具调用状态和结果
 */
export class ToolCallPlugin implements MessagePlugin {
  type = 'tool-call';
  priority = 5;

  /**
   * 判断是否包含工具调用
   */
  match(content: string): boolean {
    // 这个插件主要通过 ToolCall 数据触发，而非内容匹配
    return false;
  }

  /**
   * 渲染工具调用
   */
  render(content: string, context: RenderContext): HTMLElement | string {
    const container = document.createElement('div');
    container.className = 'plugin-tool-call';

    const message = context.message;
    if (!message || !message.toolCalls || message.toolCalls.length === 0) {
      return '';
    }

    // 渲染每个工具调用
    message.toolCalls.forEach(toolCall => {
      const toolElement = this.renderToolCall(toolCall);
      container.appendChild(toolElement);
    });

    return container;
  }

  /**
   * 渲染单个工具调用
   */
  private renderToolCall(toolCall: ToolCall): HTMLElement {
    const wrapper = document.createElement('div');
    wrapper.className = `tool-call tool-call--${toolCall.status}`;

    // 头部：工具名称和状态
    const header = document.createElement('div');
    header.className = 'tool-call__header';

    const name = document.createElement('span');
    name.className = 'tool-call__name';
    name.textContent = toolCall.name;

    const status = document.createElement('span');
    status.className = 'tool-call__status';
    status.textContent = this.getStatusText(toolCall.status);

    header.appendChild(name);
    header.appendChild(status);

    // 参数
    const args = document.createElement('pre');
    args.className = 'tool-call__args';
    args.textContent = JSON.stringify(toolCall.arguments, null, 2);

    wrapper.appendChild(header);
    wrapper.appendChild(args);

    // 结果（如果有）
    if (toolCall.result !== undefined) {
      const result = document.createElement('pre');
      result.className = 'tool-call__result';
      result.textContent = typeof toolCall.result === 'string' 
        ? toolCall.result 
        : JSON.stringify(toolCall.result, null, 2);
      wrapper.appendChild(result);
    }

    return wrapper;
  }

  /**
   * 获取状态文本
   */
  private getStatusText(status: ToolCall['status']): string {
    const statusMap: Record<ToolCall['status'], string> = {
      pending: '等待中',
      executing: '执行中',
      completed: '已完成',
      failed: '失败'
    };

    return statusMap[status] || status;
  }
}

/**
 * 注册所有内置插件到插件管理器
 * @param manager 插件管理器实例
 */
export function registerBuiltinPlugins(manager: import('./PluginManager.js').PluginManager): void {
  manager.register(new CodeBlockPlugin());
  manager.register(new MermaidPlugin());
  manager.register(new LatexPlugin());
  manager.register(new ToolCallPlugin());
}

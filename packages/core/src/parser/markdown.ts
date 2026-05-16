
import { Marked } from 'marked';
import { markedHighlight } from 'marked-highlight';
import hljs from 'highlight.js';

// 声明全局 __copyCode 方法
declare global {
  interface Window {
    __copyCode(button: HTMLElement): void;
  }
}

// 创建 marked 实例
const marked = new Marked(
  markedHighlight({
    langPrefix: 'hljs language-',
    highlight(code, lang) {
      if (lang && hljs.getLanguage(lang)) {
        return hljs.highlight(code, { language: lang }).value;
      }
      return hljs.highlightAuto(code).value;
    }
  })
);

// 配置 marked
marked.setOptions({
  breaks: true,
  gfm: true
});

/**
 * 自定义 renderer，扩展代码块渲染
 */
function createRenderer() {
  const renderer = new marked.Renderer();

  // 自定义代码块渲染
  renderer.code = function(code: string, infostring: string | undefined, escaped: boolean) {
    const language = infostring || '';
    const highlighted = language && hljs.getLanguage(language)
      ? hljs.highlight(code, { language }).value
      : hljs.highlightAuto(code).value;

    return `
      <div class="markdown-code-block" data-language="${language}">
        <div class="code-block-header">
          <span class="code-language">${language || 'plaintext'}</span>
          <button class="code-copy-btn" onclick="window.__copyCode(this)">复制</button>
        </div>
        <pre><code class="hljs language-${language}">${highlighted}</code></pre>
      </div>
    `;
  };

  // 自定义表格渲染
  renderer.table = function(header: string, body: string) {
    return `
      <div class="markdown-table-wrapper">
        <table>
          <thead>${header}</thead>
          <tbody>${body}</tbody>
        </table>
      </div>
    `;
  };

  return renderer;
}

// 设置自定义 renderer
marked.use({ renderer: createRenderer() });

/**
 * 解析 Markdown 为 HTML
 * @param content Markdown 字符串
 * @returns 解析后的 HTML 字符串
 */
export function parseMarkdown(content: string): string {
  if (!content) {
    return '';
  }

  try {
    return marked.parse(content) as string;
  } catch (error) {
    console.error('Markdown parse error:', error);
    // 降级：转义 HTML 并返回纯文本
    return escapeHtml(content);
  }
}

/**
 * 检测内容是否包含 Markdown 语法
 * @param content 待检测内容
 * @returns 是否包含 Markdown
 */
export function detectMarkdown(content: string): boolean {
  if (!content) {
    return false;
  }

  // 常见的 Markdown 语法正则
  const markdownPatterns = [
    /^#{1,6}\s+.+/m,           // 标题
    /`{3}[\s\S]*?`{3}/,        // 代码块
    /`[^`]+`/,                  // 行内代码
    /\*\*[^*]+\*\*/,            // 粗体
    /\*[^*]+\*/,                 // 斜体
    /\[.+?\]\(.+?\)/,           // 链接
    /!\[.+?\]\(.+?\)/,          // 图片
    /^\s*[-*+]\s+.+/m,          // 无序列表
    /^\s*\d+\.\s+.+/m,          // 有序列表
    /^\s*>.+/m,                 // 引用
    /\|(.+)\|/,                 // 表格
    /^---$/m                     // 分隔线
  ];

  return markdownPatterns.some(pattern => pattern.test(content));
}

/**
 * 转义 HTML 特殊字符
 */
function escapeHtml(text: string): string {
  const map: Record<string, string> = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;'
  };

  return text.replace(/[&<>"']/g, char => map[char]);
}

/**
 * 注册全局代码复制函数
 * 需要在浏览器环境中调用
 */
export function registerCodeCopyHandler(): void {
  if (typeof window !== 'undefined') {
    window.__copyCode = function(button: HTMLElement) {
      const codeBlock = button.closest('.markdown-code-block');
      if (!codeBlock) return;

      const code = codeBlock.querySelector('code');
      if (!code) return;

      const text = code.textContent || '';

      navigator.clipboard.writeText(text).then(() => {
        const originalText = button.textContent;
        button.textContent = '已复制';
        button.classList.add('copied');

        setTimeout(() => {
          button.textContent = originalText;
          button.classList.remove('copied');
        }, 2000);
      }).catch(err => {
        console.error('Copy failed:', err);
      });
    };
  }
}

/**
 * 渲染 Markdown 到指定容器
 * @param content Markdown 内容
 * @param container 目标容器元素
 * @returns 渲染后的 HTML 字符串
 */
export function renderMarkdownToContainer(content: string, container: HTMLElement): string {
  const html = parseMarkdown(content);
  container.innerHTML = html;

  // 为代码块添加复制功能
  container.querySelectorAll('.code-copy-btn').forEach(btn => {
    btn.addEventListener('click', function(this: HTMLButtonElement) {
      const codeBlock = this.closest('.markdown-code-block');
      if (!codeBlock) return;

      const code = codeBlock.querySelector('code');
      if (!code) return;

      const text = code.textContent || '';
      navigator.clipboard.writeText(text).then(() => {
        const originalText = this.textContent;
        this.textContent = '已复制';
        this.classList.add('copied');

        setTimeout(() => {
          this.textContent = originalText;
          this.classList.remove('copied');
        }, 2000);
      });
    });
  });

  return html;
}

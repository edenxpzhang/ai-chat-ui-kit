/**
 * @generated-by AI: edenxpzhang
 * @generated-date 2026-05-13
 */

/**
 * Latex 检测结果的接口
 */
export interface LatexDetectionResult {
  // 行内公式
  inline: string[];
  // 块级公式
  block: string[];
}

/**
 * 检测内容中的 Latex 公式
 * @param content 待检测的内容
 * @returns 包含行内和块级公式的对象
 */
export function detectLatex(content: string): LatexDetectionResult {
  if (!content || typeof content !== 'string') {
    return { inline: [], block: [] };
  }

  const result: LatexDetectionResult = {
    inline: [],
    block: []
  };

  // 块级公式模式：
  // 1. $$...$$  (双美元符号)
  // 2. \[...\]  (方括号)
  // 3. \begin{equation}...\end{equation}
  // 4. \begin{align}...\end{align}
  // 5. \begin{gather}...\end{gather}

  const blockPatterns = [
    /\$\$([\s\S]*?)\$\$/g,                           // $$...$$
    /\\\[([\s\S]*?)\\\]/g,                           // \[...\]
    /\\begin\{(equation|align|gather|multline)\}([\s\S]*?)\\end\{\1\}/g  // \begin{...}...\end{...}
  ];

  for (const pattern of blockPatterns) {
    let match: RegExpExecArray | null;
    const regex = new RegExp(pattern.source, pattern.flags);
    
    while ((match = regex.exec(content)) !== null) {
      const formula = match[1] || match[0];
      if (formula.trim()) {
        result.block.push(formula.trim());
      }
    }
  }

  // 行内公式模式：
  // 1. $...$  (单美元符号，但不能是 $$)
  // 2. \(...\)  (括号)

  const inlinePatterns = [
    /(?<!\$)\$(?!\$)(.*?)(?<!\$)\$(?!\$)/g,  // $...$  (不匹配 $$)
    /\\\((.*?)\\\)/g                            // \(...\)
  ];

  for (const pattern of inlinePatterns) {
    let match: RegExpExecArray | null;
    const regex = new RegExp(pattern.source, pattern.flags);
    
    while ((match = regex.exec(content)) !== null) {
      const formula = match[1] || match[0];
      if (formula.trim()) {
        result.inline.push(formula.trim());
      }
    }
  }

  // 去重
  result.inline = [...new Set(result.inline)];
  result.block = [...new Set(result.block)];

  return result;
}

/**
 * 检测内容是否包含 Latex 公式
 * @param content 待检测的内容
 * @returns 是否包含 Latex
 */
export function hasLatex(content: string): boolean {
  if (!content) {
    return false;
  }

  // 快速检测：查找常见的 Latex 标记
  const quickChecks = [
    '$$',           // 块级公式
    '\\(',          // 行内公式开始
    '\\)',          // 行内公式结束
    '\\[',          // 块级公式开始
    '\\]',          // 块级公式结束
    '\\begin{',     // 环境开始
    '\\end{',       // 环境结束
    '\\frac',       // 分数
    '\\sum',        // 求和
    '\\int',        // 积分
    '\\alpha',      // 希腊字母
    '\\beta',
    '\\gamma',
    '\\delta',
    '\\pi',
    '\\infty',      // 无穷符号
    '\\overrightarrow',  // 向量
    '\\begin{matrix}',    // 矩阵
    '\\begin{pmatrix}'    // 括号矩阵
  ];

  return quickChecks.some(check => content.includes(check));
}

/**
 * 将 Latex 公式替换为占位符
 * @param content 原始内容
 * @returns 替换后的内容和占位符映射
 */
export function replaceLatexWithPlaceholders(content: string): {
  processed: string;
  placeholders: Array<{ id: string; formula: string; display: boolean }>;
} {
  if (!content) {
    return { processed: '', placeholders: [] };
  }

  const placeholders: Array<{ id: string; formula: string; display: boolean }> = [];
  let processed = content;
  let counter = 0;

  // 先替换块级公式
  const blockReplacements = [
    { regex: /\$\$([\s\S]*?)\$\$/g, display: true },
    { regex: /\\\[([\s\S]*?)\\\]/g, display: true },
    { regex: /\\begin\{(equation|align|gather|multline)\}([\s\S]*?)\\end\{\1\}/g, display: true }
  ];

  for (const { regex, display } of blockReplacements) {
    processed = processed.replace(regex, (match, ...args) => {
      const formula = args[0] || match;
      const id = `__LATEX_PLACEHOLDER_${counter++}__`;
      placeholders.push({ id, formula: formula.trim(), display });
      return id;
    });
  }

  // 再替换行内公式
  const inlineReplacements = [
    { regex: /(?<!\$)\$(?!\$)(.*?)(?<!\$)\$(?!\$)/g, display: false },
    { regex: /\\\((.*?)\\\)/g, display: false }
  ];

  for (const { regex, display } of inlineReplacements) {
    processed = processed.replace(regex, (match, ...args) => {
      const formula = args[0] || match;
      const id = `__LATEX_PLACEHOLDER_${counter++}__`;
      placeholders.push({ id, formula: formula.trim(), display });
      return id;
    });
  }

  return { processed, placeholders };
}

/**
 * 渲染 Latex 公式（返回 HTML 字符串，供外部如 KaTeX 渲染）
 * @param content 包含 Latex 的内容
 * @returns 处理后的 HTML 字符串
 */
export function renderLatex(content: string): string {
  if (!content) {
    return '';
  }

  let processed = content;

  // 替换块级公式
  processed = processed.replace(/\$\$([\s\S]*?)\$\$/g, (_, formula) => {
    return `<div class="latex-block">$$${formula}$$</div>`;
  });

  processed = processed.replace(/\\\[([\s\S]*?)\\\]/g, (_, formula) => {
    return `<div class="latex-block">\\[${formula}\\]</div>`;
  });

  // 替换行内公式
  processed = processed.replace(/(?<!\$)\$(?!\$)(.*?)(?<!\$)\$(?!\$)/g, (_, formula) => {
    return `<span class="latex-inline">$${formula}$</span>`;
  });

  processed = processed.replace(/\\\((.*?)\\\)/g, (_, formula) => {
    return `<span class="latex-inline">\\(${formula}\\)</span>`;
  });

  return processed;
}

/**
 * 使用 KaTeX 渲染 Latex 公式
 * @param content 包含 Latex 的内容
 * @param container 目标容器元素
 * @returns 渲染后的 HTML 字符串
 */
export function renderLatexWithKaTeX(content: string, container: HTMLElement): string {
  if (!content || !container) {
    return '';
  }

  if (typeof window === 'undefined') {
    console.error('renderLatexWithKaTeX: only works in browser environment');
    return '';
  }

  // 动态导入 KaTeX
  import('katex')
    .then((katex) => {
      // 渲染块级公式
      const blockRegex = /\$\$([\s\S]*?)\$\$/g;
      let match: RegExpExecArray | null;

      // 先处理块级公式
      container.innerHTML = container.innerHTML.replace(blockRegex, (_, formula) => {
        try {
          const tempDiv = document.createElement('div');
          katex.default.render(formula, tempDiv, {
            displayMode: true,
            throwOnError: false
          });
          return tempDiv.innerHTML;
        } catch (err) {
          console.error('KaTeX block render error:', err);
          return `$$${formula}$$`;
        }
      });

      // 处理行内公式
      const inlineRegex = /(?<!\$)\$(?!\$)(.*?)(?<!\$)\$(?!\$)/g;
      container.innerHTML = container.innerHTML.replace(inlineRegex, (_, formula) => {
        try {
          const tempDiv = document.createElement('span');
          katex.default.render(formula, tempDiv, {
            displayMode: false,
            throwOnError: false
          });
          return tempDiv.innerHTML;
        } catch (err) {
          console.error('KaTeX inline render error:', err);
          return `$${formula}$`;
        }
      });
    })
    .catch((err) => {
      console.error('Failed to load KaTeX:', err);
      container.innerHTML = `<pre style="color:red;">无法加载 KaTeX 库</pre>`;
    });

  return container.innerHTML;
}

/**
 * 提取所有 Latex 公式（用于预处理）
 * @param content 原始内容
 * @returns 所有公式的数组
 */
export function extractAllLatex(content: string): string[] {
  const result = detectLatex(content);
  return [...result.block, ...result.inline];
}

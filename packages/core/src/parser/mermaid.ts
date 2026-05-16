
/**
 * Mermaid 图表类型
 */
export type MermaidChartType = 
  | 'graph'      // 流程图
  | 'flowchart'  // 流图（新语法）
  | 'sequence'   // 时序图
  | 'class'      // 类图
  | 'state'      // 状态图
  | 'er'         // ER 图
  | 'journey'    // 用户旅程图
  | 'gantt'      // 甘特图
  | 'pie'        // 饼图
  | 'gitgraph'   // Git 图
  | 'mindmap'    // 思维导图
  | 'timeline'   // 时间线
  | 'unknown';   // 未知类型

/**
 * Mermaid 检测结果的接口
 */
export interface MermaidDetectionResult {
  isMermaid: boolean;
  chartType: MermaidChartType;
  code: string;
}

/**
 * 检测代码块是否为 Mermaid 图表
 * @param code 待检测的代码字符串
 * @returns 是否为 Mermaid 图表
 */
export function detectMermaid(code: string): boolean {
  if (!code || typeof code !== 'string') {
    return false;
  }

  const trimmed = code.trim();
  
  // Mermaid 代码块通常以这些关键字开头
  const mermaidKeywords = [
    'graph',      // 流程图（LR, RL, TB, BT 方向）
    'flowchart',  // 新流程图语法
    'sequenceDiagram',  // 时序图
    'classDiagram',     // 类图
    'stateDiagram',     // 状态图
    'erDiagram',        // ER 图
    'journey',          // 用户旅程图
    'gantt',            // 甘特图
    'pie',              // 饼图
    'gitGraph',         // Git 图
    'mindmap',          // 思维导图
    'timeline',         // 时间线
    'quadrantChart'     // 象限图
  ];

  // 检查是否以 Mermaid 关键字开头
  for (const keyword of mermaidKeywords) {
    if (trimmed.startsWith(keyword)) {
      return true;
    }
  }

  // 检查 graph 方向简写（如 graph TD, graph LR）
  const graphDirectionRegex = /^(graph|flowchart)\s+(TB|TD|BT|RL|LR)/i;
  if (graphDirectionRegex.test(trimmed)) {
    return true;
  }

  return false;
}

/**
 * 检测 Mermaid 图表类型
 * @param code Mermaid 代码
 * @returns 图表类型
 */
export function detectMermaidChartType(code: string): MermaidChartType {
  if (!code || typeof code !== 'string') {
    return 'unknown';
  }

  const trimmed = code.trim();

  if (/^(graph|flowchart)/i.test(trimmed)) {
    return 'flowchart';
  }

  if (/^sequenceDiagram/i.test(trimmed)) {
    return 'sequence';
  }

  if (/^classDiagram/i.test(trimmed)) {
    return 'class';
  }

  if (/^stateDiagram/i.test(trimmed)) {
    return 'state';
  }

  if (/^erDiagram/i.test(trimmed)) {
    return 'er';
  }

  if (/^journey/i.test(trimmed)) {
    return 'journey';
  }

  if (/^gantt/i.test(trimmed)) {
    return 'gantt';
  }

  if (/^pie/i.test(trimmed)) {
    return 'pie';
  }

  if (/^gitGraph/i.test(trimmed)) {
    return 'gitgraph';
  }

  if (/^mindmap/i.test(trimmed)) {
    return 'mindmap';
  }

  if (/^timeline/i.test(trimmed)) {
    return 'timeline';
  }

  return 'unknown';
}

/**
 * 从 Markdown 内容中提取 Mermaid 代码块
 * @param content Markdown 内容
 * @returns 提取的 Mermaid 代码数组
 */
export function extractMermaidFromMarkdown(content: string): string[] {
  if (!content) {
    return [];
  }

  const mermaidBlocks: string[] = [];
  
  // 匹配 ```mermaid ... ``` 代码块
  const mermaidRegex = /```mermaid\s*([\s\S]*?)```/gi;
  let match: RegExpExecArray | null;

  while ((match = mermaidRegex.exec(content)) !== null) {
    if (match[1]) {
      mermaidBlocks.push(match[1].trim());
    }
  }

  return mermaidBlocks;
}

/**
 * 渲染 Mermaid 图表到指定容器
 * @param code Mermaid 代码
 * @param container 目标容器元素
 * @param options 可选配置
 */
export function renderMermaid(
  code: string,
  container: HTMLElement,
  options?: {
    theme?: 'default' | 'dark' | 'forest' | 'neutral';
    backgroundColor?: string;
    scale?: number;
  }
): void {
  if (!code || !container) {
    console.error('renderMermaid: code or container is missing');
    return;
  }

  // 检查 mermaid 是否可用
  if (typeof window === 'undefined') {
    console.error('renderMermaid: only works in browser environment');
    return;
  }

  // 动态导入 mermaid（避免 SSR 问题）
  import('mermaid')
    .then((mermaid) => {
      // 初始化 mermaid
      mermaid.default.initialize({
        startOnLoad: false,
        theme: options?.theme || 'default',
        securityLevel: 'loose',
        flowchart: { useMaxWidth: true, htmlLabels: true },
        ...options
      });

      // 生成唯一 ID
      const id = `mermaid-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

      // 创建渲染容器
      const wrapper = document.createElement('div');
      wrapper.className = 'mermaid-chart-wrapper';
      wrapper.style.overflow = 'auto';

      const diagramDiv = document.createElement('div');
      diagramDiv.className = 'mermaid-chart';
      diagramDiv.id = id;

      // 设置 mermaid 代码
      diagramDiv.textContent = code;

      wrapper.appendChild(diagramDiv);
      container.appendChild(wrapper);

      // 渲染
      mermaid.default.run({
        querySelector: `#${id}`
      }).catch((err: Error) => {
        console.error('Mermaid render error:', err);
        diagramDiv.innerHTML = `<pre style="color:red;">Mermaid 渲染失败: ${err.message}</pre>`;
      });
    })
    .catch((err) => {
      console.error('Failed to load mermaid:', err);
      container.innerHTML = `<pre style="color:red;">无法加载 Mermaid 库</pre>`;
    });
}

/**
 * 批量渲染容器中的所有 Mermaid 代码块
 * @param container 容器元素
 */
export function renderAllMermaidInContainer(container: HTMLElement): void {
  if (!container) {
    return;
  }

  // 查找所有 class 包含 language-mermaid 的 code 元素
  const mermaidElements = container.querySelectorAll('code.language-mermaid, code.language-flow');
  
  mermaidElements.forEach((el) => {
    const code = el.textContent || '';
    const parent = el.closest('pre');
    
    if (parent) {
      const wrapper = document.createElement('div');
      wrapper.className = 'mermaid-chart-wrapper';
      
      parent.parentNode?.replaceChild(wrapper, parent);
      renderMermaid(code, wrapper);
    }
  });
}

/**
 * 验证 Mermaid 代码语法
 * @param code Mermaid 代码
 * @returns 是否有效
 */
export async function validateMermaid(code: string): Promise<boolean> {
  if (!code) {
    return false;
  }

  try {
    const mermaid = await import('mermaid');
    await mermaid.default.parse(code);
    return true;
  } catch (error) {
    console.error('Mermaid validation error:', error);
    return false;
  }
}

/**
 * @generated-by AI: edenxpzhang
 * @generated-date 2026-05-15
 *
 * Runtime Theme Application API
 *
 * - applyTheme(theme, target?)    把主题应用到 target（默认 document.documentElement）
 * - removeTheme(target?)          移除 target 上的主题
 * - getCurrentTheme(target?)      查询 target 当前主题名
 * - themes                        所有内置主题字典，可通过 name 索引
 *
 * 关键设计：
 *  target 不传时为全局换肤（写到 :root / document.head）
 *  target 传入元素时为局部换肤（CSS 变量写在该元素 style 上、styles 用 data-aikit-scope 属性
 *  做选择器前缀重写，注入到 target 内部，避免污染全站）
 */
import type { ThemeConfig } from './types.js';
import { minimalTheme } from './minimal/index.js';
import { neonTheme } from './neon/index.js';
import { glassTheme } from './glass/index.js';
import { terminalTheme } from './terminal/index.js';
import { gradientTheme } from './gradient/index.js';
import { corporateTheme } from './corporate/index.js';

/** 所有内置主题字典：themes['glass'] === glassTheme */
export const themes: Record<string, ThemeConfig> = {
  minimal: minimalTheme,
  neon: neonTheme,
  glass: glassTheme,
  terminal: terminalTheme,
  gradient: gradientTheme,
  corporate: corporateTheme,
};

const DATA_ATTR_THEME = 'data-aikit-theme';
const DATA_ATTR_SCOPE = 'data-aikit-scope';
const STYLE_ID_PREFIX = 'aikit-theme-style';

let scopeCounter = 0;

/** 将 theme.styles 中的选择器加上 scope 前缀，避免污染全局 */
function scopeStyles(rawStyles: string, scopeAttr: string): string {
  // 简单的选择器前缀重写：把每条 CSS 规则的选择器前缀为 [data-aikit-scope="xxx"]
  // 跳过 @keyframes / @media / @font-face / :root 等特殊 at-rule
  const scopePrefix = `[${DATA_ATTR_SCOPE}="${scopeAttr}"]`;

  return rawStyles.replace(
    /(^|\})\s*([^{}@][^{]*?)\s*\{/g,
    (_match, brace, selectors) => {
      const scoped = selectors
        .split(',')
        .map((s: string) => {
          const trimmed = s.trim();
          if (!trimmed) return trimmed;
          // :root / html / body 这种全局选择器，替换为 scope 本身
          if (/^:root\b/.test(trimmed)) {
            return scopePrefix;
          }
          if (/^(html|body)\b/.test(trimmed)) {
            return `${scopePrefix}${trimmed.replace(/^(html|body)/, '')}`;
          }
          return `${scopePrefix} ${trimmed}`;
        })
        .join(', ');
      return `${brace}\n${scoped} {`;
    }
  );
}

/** 找到 / 创建 target 对应的 <style> 节点 */
function ensureStyleNode(target: HTMLElement, scopeAttr: string | null): HTMLStyleElement {
  const id = scopeAttr ? `${STYLE_ID_PREFIX}-${scopeAttr}` : STYLE_ID_PREFIX;
  // 全局模式 → head；局部模式 → 紧跟 target 之前插入（保证作用域）
  const container =
    scopeAttr === null
      ? document.head
      : target.ownerDocument?.head ?? document.head;

  let style = container.querySelector<HTMLStyleElement>(`style#${id}`);
  if (!style) {
    style = document.createElement('style');
    style.id = id;
    container.appendChild(style);
  }
  return style;
}

/** 把 variables 写到 target.style（局部）或 :root（全局） */
function writeVariables(target: HTMLElement, vars: Record<string, string>): void {
  Object.entries(vars).forEach(([key, value]) => {
    target.style.setProperty(key, value);
  });
}

/** 清空 variables（按 key 列表逐个 removeProperty） */
function clearVariables(target: HTMLElement, vars: Record<string, string>): void {
  Object.keys(vars).forEach((key) => {
    target.style.removeProperty(key);
  });
}

/**
 * 应用主题
 *
 * @param theme  主题配置对象或主题名（'minimal' | 'neon' | ...）
 * @param target 应用目标，不传 → document.documentElement（全局换肤）
 *
 * @example 全局换肤
 * ```ts
 * applyTheme('glass');
 * applyTheme(glassTheme);
 * ```
 *
 * @example 局部换肤（弹窗内独立主题，不污染全站）
 * ```tsx
 * <div ref={containerRef}>...</div>
 * useEffect(() => {
 *   applyTheme('glass', containerRef.current);
 *   return () => removeTheme(containerRef.current);
 * }, []);
 * ```
 */
export function applyTheme(
  theme: ThemeConfig | string,
  target?: HTMLElement | null
): void {
  if (typeof document === 'undefined') return; // SSR 兜底

  const config = typeof theme === 'string' ? themes[theme] : theme;
  if (!config) {
    console.warn(`[ai-chat-ui-kit] Theme not found: ${String(theme)}`);
    return;
  }

  const isGlobal = !target;
  const targetEl = (target ?? document.documentElement) as HTMLElement;

  // 先移除旧主题，再应用新主题
  removeTheme(target ?? undefined);

  // 1) 注入 variables
  writeVariables(targetEl, config.variables);

  // 2) 注入 styles
  if (config.styles) {
    if (isGlobal) {
      const style = ensureStyleNode(targetEl, null);
      style.setAttribute(DATA_ATTR_THEME, config.name);
      style.textContent = config.styles;
    } else {
      // 局部模式：为 target 打 scope 属性，重写 styles 选择器前缀
      let scopeAttr = targetEl.getAttribute(DATA_ATTR_SCOPE);
      if (!scopeAttr) {
        scopeAttr = `aikit-${++scopeCounter}-${Date.now().toString(36)}`;
        targetEl.setAttribute(DATA_ATTR_SCOPE, scopeAttr);
      }
      const style = ensureStyleNode(targetEl, scopeAttr);
      style.setAttribute(DATA_ATTR_THEME, config.name);
      style.textContent = scopeStyles(config.styles, scopeAttr);
    }
  }

  // 3) target 上打 data-aikit-theme 标记，便于 getCurrentTheme 查询 + CSS 选择器命中
  targetEl.setAttribute(DATA_ATTR_THEME, config.name);
}

/**
 * 移除主题
 *
 * @param target 目标元素，不传 → document.documentElement（移除全局主题）
 */
export function removeTheme(target?: HTMLElement | null): void {
  if (typeof document === 'undefined') return;

  const isGlobal = !target;
  const targetEl = (target ?? document.documentElement) as HTMLElement;
  const currentName = targetEl.getAttribute(DATA_ATTR_THEME);
  if (!currentName) return;

  // 清 variables（按当前主题字典 key 反查）
  const currentConfig = themes[currentName];
  if (currentConfig) {
    clearVariables(targetEl, currentConfig.variables);
  }

  // 移除 <style> 节点
  if (isGlobal) {
    const style = document.head.querySelector(`style#${STYLE_ID_PREFIX}`);
    if (style) style.remove();
  } else {
    const scopeAttr = targetEl.getAttribute(DATA_ATTR_SCOPE);
    if (scopeAttr) {
      const style = document.head.querySelector(`style#${STYLE_ID_PREFIX}-${scopeAttr}`);
      if (style) style.remove();
      targetEl.removeAttribute(DATA_ATTR_SCOPE);
    }
  }

  // 移除 data-aikit-theme 标记
  targetEl.removeAttribute(DATA_ATTR_THEME);
}

/**
 * 查询当前主题名
 *
 * @param target 目标元素，不传 → document.documentElement
 * @returns 主题名 string，未应用则返回 null
 */
export function getCurrentTheme(target?: HTMLElement | null): string | null {
  if (typeof document === 'undefined') return null;
  const targetEl = (target ?? document.documentElement) as HTMLElement;
  return targetEl.getAttribute(DATA_ATTR_THEME);
}

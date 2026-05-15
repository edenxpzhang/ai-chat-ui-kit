/**
 * @generated-by AI: edenxpzhang
 * @generated-date 2026-05-15
 *
 * 把 css 字符串幂等地注入到 document.head。
 * 用于解决 light DOM 组件无法用 Lit 的 static styles 注入样式的问题，
 * 同时让宿主项目无需手动 import 'dist/index.css'。
 */

const INJECTED = new Set<string>();

/**
 * 把指定 css 文本注入到 <head>，每个 id 仅注入一次（幂等）。
 *
 * @param id   唯一标识（建议用组件名，如 'ai-chat'）。
 * @param css  css 文本。
 */
export function injectStyle(id: string, css: string): void {
  // 非浏览器环境（SSR）安全降级
  if (typeof document === 'undefined' || !document.head) {
    return;
  }

  if (INJECTED.has(id)) {
    return;
  }

  // 二次保险：如果别的实例（如 multi-bundle）已经写过同 id 的 style，跳过
  const existing = document.querySelector(
    `style[data-ai-chat-ui-kit="${id}"]`,
  );
  if (existing) {
    INJECTED.add(id);
    return;
  }

  const style = document.createElement('style');
  style.setAttribute('data-ai-chat-ui-kit', id);
  style.textContent = css;
  document.head.appendChild(style);
  INJECTED.add(id);
}

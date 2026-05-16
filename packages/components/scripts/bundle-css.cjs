/* eslint-disable */
/**
 * @generated-by AI: edenxpzhang
 * @generated-date 2026-05-15
 *
 * 把 src/**\/*.css（包括 styles/global.css、各组件 css）按固定顺序拼接，
 * 输出到 dist/index.css，作为向后兼容入口（exports './style.css'）。
 *
 * 注意：tsup 已通过 loader: { '.css': 'text' } 把 css 内联进 JS 并由 injectStyle 主动注入 <head>，
 * 因此 dist/index.css 仅作可选导入（如 SSR、CSP 严格场景）。
 */
const fs = require('node:fs');
const path = require('node:path');

const ROOT = path.resolve(__dirname, '..');
const SRC = path.join(ROOT, 'src');
const OUT = path.join(ROOT, 'dist', 'index.css');

const ORDERED = [
  'styles/global.css',
  'chat/chat.css',
  'message/message.css',
  'input/input.css',
  'tool-call/tool-call.css',
  'markdown/markdown.css',
];

function readIfExists(rel) {
  const p = path.join(SRC, rel);
  if (!fs.existsSync(p)) return '';
  return fs.readFileSync(p, 'utf8');
}

const banner = '/* AI Chat UI Kit - aggregated styles (auto-generated) */\n';
const parts = ORDERED.map((rel) => {
  const txt = readIfExists(rel);
  if (!txt) return '';
  return `/* === ${rel} === */\n${txt.trimEnd()}\n`;
});

const content = banner + parts.filter(Boolean).join('\n');

fs.mkdirSync(path.dirname(OUT), { recursive: true });
fs.writeFileSync(OUT, content, 'utf8');

console.log(`[bundle-css] wrote ${OUT} (${content.length} bytes)`);

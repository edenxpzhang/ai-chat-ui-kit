/**
 * @generated-by AI: edenxpzhang
 * @generated-date 2026-05-15
 *
 * 让 TS 能识别 `import xxx from './xxx.css'` 形式的 css 文本导入。
 * 实际由 tsup/esbuild 的 loader: { '.css': 'text' } 在打包阶段把 css 文件内容
 * 转成默认导出的字符串。
 */
declare module '*.css' {
  const content: string;
  export default content;
}

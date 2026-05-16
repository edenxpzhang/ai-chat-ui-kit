
// ============================================================================
// 类型导出
// ============================================================================
export {
  MessageRole,
  type Message,
  type ToolCall,
  type ModelConfig,
  type ChatConfig,
  type APIAdapter,
  type MessagePlugin,
  type RenderContext,
  type ThemeConfig,
  type ChatState
} from './types/index.js';

// ============================================================================
// Store 导出
// ============================================================================
export { BaseStore } from './store/base.js';
export { ChatStore } from './store/ChatStore.js';
export { ModelConfigStore } from './store/ModelConfigStore.js';
export { ToolCallStore } from './store/ToolCallStore.js';

// ============================================================================
// API 适配器导出
// ============================================================================
export { BaseAPIAdapter } from './api/base.js';
export {
  OpenAIAdapter,
  ERNIEAdapter,
  QwenAdapter,
  SparkAdapter,
  HunyuanAdapter,
  createAPIAdapter
} from './api/index.js';

// ============================================================================
// Parser 导出
// ============================================================================
// Markdown 解析器
export {
  parseMarkdown,
  detectMarkdown,
  registerCodeCopyHandler,
  renderMarkdownToContainer
} from './parser/markdown.js';

// Mermaid 检测器
export {
  type MermaidChartType,
  type MermaidDetectionResult,
  detectMermaid,
  detectMermaidChartType,
  extractMermaidFromMarkdown,
  renderMermaid,
  renderAllMermaidInContainer,
  validateMermaid
} from './parser/mermaid.js';

// Latex 检测器
export {
  type LatexDetectionResult,
  detectLatex,
  hasLatex,
  replaceLatexWithPlaceholders,
  renderLatex,
  renderLatexWithKaTeX,
  extractAllLatex
} from './parser/latex.js';

// ============================================================================
// Plugin 导出
// ============================================================================
export { PluginManager, getDefaultPluginManager } from './plugins/PluginManager.js';
export {
  CodeBlockPlugin,
  MermaidPlugin,
  LatexPlugin,
  ToolCallPlugin,
  registerBuiltinPlugins
} from './plugins/builtin.js';

// ============================================================================
// 版本信息
// ============================================================================
export const VERSION = '0.1.0';
export const PACKAGE_NAME = '@ai-chat-ui-kit/core';

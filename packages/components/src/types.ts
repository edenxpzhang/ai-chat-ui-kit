/**
 * @generated-by AI: edenxpzhang
 * @generated-date 2026-05-13
 */

/**
 * 消息角色
 */
export type MessageRole = 'user' | 'assistant' | 'system';

/**
 * 消息对象
 */
export interface Message {
  id: string;
  role: MessageRole;
  content: string;
  timestamp: number;
  toolCalls?: ToolCall[];
}

/**
 * 工具调用状态
 */
export type ToolCallStatus = 'pending' | 'running' | 'completed' | 'failed';

/**
 * 工具调用对象
 */
export interface ToolCall {
  id: string;
  name: string;
  parameters: Record<string, any>;
  status: ToolCallStatus;
  result?: any;
}

/**
 * 模型配置
 */
export interface ModelConfig {
  model: string;
  temperature?: number;
  maxTokens?: number;
  topP?: number;
}

/**
 * 会话数据（用于导入/导出）
 */
export interface SessionData {
  messages: Message[];
  config?: ModelConfig;
  exportDate: string;
}


// 消息角色枚举
export enum MessageRole {
  User = 'user',
  Assistant = 'assistant',
  System = 'system',
  Tool = 'tool'
}

// 消息类型
export interface Message {
  id: string;
  role: MessageRole;
  content: string;
  timestamp: number;
  // 工具调用相关
  toolCalls?: ToolCall[];
  // 元数据（用于插件扩展）
  metadata?: Record<string, unknown>;
}

// 工具调用
export interface ToolCall {
  id: string;
  name: string;
  arguments: Record<string, unknown>;
  result?: unknown;
  status: 'pending' | 'executing' | 'completed' | 'failed';
}

// 模型配置
export interface ModelConfig {
  // 模型提供商
  provider: 'openai' | 'ernie' | 'qwen' | 'spark' | 'hunyuan' | 'custom';
  // 模型名称
  model: string;
  // API 端点
  apiEndpoint?: string;
  // API Key
  apiKey?: string;
  // 自定义请求头
  headers?: Record<string, string>;
  // 请求参数
  params?: {
    temperature?: number;
    topP?: number;
    maxTokens?: number;
    [key: string]: unknown;
  };
}

// 聊天配置
export interface ChatConfig {
  // 是否启用流式输出
  stream?: boolean;
  // 系统提示词
  systemPrompt?: string;
  // 历史消息数量限制
  maxHistory?: number;
  // 是否启用工具调用
  enableTools?: boolean;
}

// API 适配器接口
export interface APIAdapter {
  // 发送消息
  sendMessage(params: {
    messages: Message[];
    modelConfig: ModelConfig;
    chatConfig: ChatConfig;
    onChunk?: (chunk: string) => void;
    onToolCall?: (toolCall: ToolCall) => void;
    onComplete?: (message: Message) => void;
    onError?: (error: Error) => void;
  }): Promise<void>;
  
  // 取消请求
  abort(): void;
}

// 消息插件接口
export interface MessagePlugin {
  // 插件类型标识
  type: string;
  // 判断是否匹配该插件
  match: (content: string) => boolean;
  // 渲染函数
  render: (content: string, context: RenderContext) => HTMLElement | string;
  // 优先级（数字越大优先级越高）
  priority?: number;
}

// 渲染上下文
export interface RenderContext {
  // 消息对象
  message: Message;
  // 是否流式输出中
  isStreaming: boolean;
  // 主题
  theme: string;
  // 自定义配置
  [key: string]: unknown;
}

// 主题配置
export interface ThemeConfig {
  // 主题名称
  name: string;
  // CSS 变量
  variables: Record<string, string>;
  // 自定义样式
  styles?: string;
}

// 聊天状态
export interface ChatState {
  // 消息列表
  messages: Message[];
  // 是否加载中
  isLoading: boolean;
  // 是否流式输出中
  isStreaming: boolean;
  // 错误
  error: Error | null;
  // 当前会话 ID
  sessionId: string;
}



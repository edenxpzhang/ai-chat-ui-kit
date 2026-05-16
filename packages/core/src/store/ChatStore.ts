
import { BaseStore } from './base.js';
import { ChatState, Message, MessageRole, ChatConfig } from '../types/index.js';

// 生成唯一 ID
function generateId(): string {
  return `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

// 初始状态
const initialState: ChatState = {
  messages: [],
  isLoading: false,
  isStreaming: false,
  error: null,
  sessionId: generateId()
};

export class ChatStore extends BaseStore<ChatState> {
  private config: ChatConfig = {};

  constructor() {
    super(initialState);
  }

  // 设置配置
  setConfig(config: ChatConfig): void {
    this.config = { ...this.config, ...config };
  }

  // 获取配置
  getConfig(): ChatConfig {
    return this.config;
  }

  // 添加消息
  addMessage(role: MessageRole, content: string, metadata?: Record<string, unknown>): Message {
    const message: Message = {
      id: generateId(),
      role,
      content,
      timestamp: Date.now(),
      metadata
    };

    const messages = [...this.state.messages, message];
    
    // 限制历史消息数量
    const maxHistory = this.config.maxHistory || 50;
    const trimmedMessages = messages.length > maxHistory 
      ? messages.slice(-maxHistory) 
      : messages;

    this.setState({
      messages: trimmedMessages,
      error: null
    });

    return message;
  }

  // 更新消息（用于流式输出）
  updateMessage(id: string, content: string): void {
    const messages = this.state.messages.map(msg => 
      msg.id === id ? { ...msg, content } : msg
    );
    this.setState({ messages });
  }

  // 设置工具调用
  setToolCalls(messageId: string, toolCalls: Message['toolCalls']): void {
    const messages = this.state.messages.map(msg => 
      msg.id === messageId ? { ...msg, toolCalls } : msg
    );
    this.setState({ messages });
  }

  // 更新工具调用结果
  updateToolCallResult(messageId: string, toolCallId: string, result: unknown): void {
    const messages = this.state.messages.map(msg => {
      if (msg.id === messageId && msg.toolCalls) {
        const toolCalls = msg.toolCalls.map(tc => 
          tc.id === toolCallId ? { ...tc, result, status: 'completed' as const } : tc
        );
        return { ...msg, toolCalls };
      }
      return msg;
    });
    this.setState({ messages });
  }

  // 设置加载状态
  setLoading(isLoading: boolean): void {
    this.setState({ isLoading });
  }

  // 设置流式输出状态
  setStreaming(isStreaming: boolean): void {
    this.setState({ isStreaming });
  }

  // 设置错误
  setError(error: Error | null): void {
    this.setState({ error, isLoading: false, isStreaming: false });
  }

  // 清空消息
  clearMessages(): void {
    this.setState({ messages: [], error: null });
  }

  // 删除消息
  deleteMessage(id: string): void {
    const messages = this.state.messages.filter(msg => msg.id !== id);
    this.setState({ messages });
  }

  // 获取消息历史（用于 API 调用）
  getMessageHistory(): Array<{ role: string; content: string }> {
    return this.state.messages.map(msg => ({
      role: msg.role,
      content: msg.content
    }));
  }

  // 重置
  reset(): void {
    this.setState(initialState);
    this.config = {};
  }

  // 导出会话
  exportSession(): string {
    return JSON.stringify({
      sessionId: this.state.sessionId,
      messages: this.state.messages,
      config: this.config,
      exportTime: Date.now()
    });
  }

  // 导入会话
  importSession(data: string): void {
    try {
      const session = JSON.parse(data);
      this.setState({
        sessionId: session.sessionId || generateId(),
        messages: session.messages || [],
        error: null
      });
      if (session.config) {
        this.config = session.config;
      }
    } catch (error) {
      console.error('Failed to import session:', error);
      this.setError(error as Error);
    }
  }
}

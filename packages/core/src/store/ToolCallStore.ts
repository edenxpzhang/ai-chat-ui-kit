/**
 * @generated-by AI: edenxpzhang
 * @generated-date 2026-05-13
 */

import { BaseStore } from './base.js';
import { ToolCall } from '../types/index.js';

// 工具调用状态
interface ToolCallState {
  // 所有工具调用
  toolCalls: Map<string, ToolCall>;
  // 按消息 ID 索引
  messageToolCalls: Map<string, string[]>;
  // 正在执行的工具调用 ID
  executingIds: Set<string>;
}

// 初始状态
const initialState: ToolCallState = {
  toolCalls: new Map(),
  messageToolCalls: new Map(),
  executingIds: new Set()
};

export class ToolCallStore extends BaseStore<ToolCallState> {
  constructor() {
    super(initialState);
  }

  // 添加工具调用
  addToolCall(messageId: string, toolCall: ToolCall): void {
    const toolCalls = new Map(this.state.toolCalls);
    toolCalls.set(toolCall.id, toolCall);

    const messageToolCalls = new Map(this.state.messageToolCalls);
    const ids = messageToolCalls.get(messageId) || [];
    messageToolCalls.set(messageId, [...ids, toolCall.id]);

    this.setState({ toolCalls, messageToolCalls });
  }

  // 批量添加工具调用
  addToolCalls(messageId: string, toolCalls: ToolCall[]): void {
    const newToolCalls = new Map(this.state.toolCalls);
    const newMessageToolCalls = new Map(this.state.messageToolCalls);
    
    const ids = newMessageToolCalls.get(messageId) || [];
    const newIds: string[] = [];

    toolCalls.forEach(tc => {
      newToolCalls.set(tc.id, tc);
      newIds.push(tc.id);
    });

    newMessageToolCalls.set(messageId, [...ids, ...newIds]);

    this.setState({
      toolCalls: newToolCalls,
      messageToolCalls: newMessageToolCalls
    });
  }

  // 更新工具调用状态
  updateToolCallStatus(id: string, status: ToolCall['status']): void {
    const toolCalls = new Map(this.state.toolCalls);
    const toolCall = toolCalls.get(id);
    
    if (toolCall) {
      toolCalls.set(id, { ...toolCall, status });
      
      const executingIds = new Set(this.state.executingIds);
      if (status === 'executing') {
        executingIds.add(id);
      } else {
        executingIds.delete(id);
      }

      this.setState({ toolCalls, executingIds });
    }
  }

  // 设置工具调用结果
  setToolCallResult(id: string, result: unknown): void {
    const toolCalls = new Map(this.state.toolCalls);
    const toolCall = toolCalls.get(id);
    
    if (toolCall) {
      toolCalls.set(id, { ...toolCall, result, status: 'completed' });
      
      const executingIds = new Set(this.state.executingIds);
      executingIds.delete(id);

      this.setState({ toolCalls, executingIds });
    }
  }

  // 设置工具调用错误
  setToolCallError(id: string, error: unknown): void {
    const toolCalls = new Map(this.state.toolCalls);
    const toolCall = toolCalls.get(id);
    
    if (toolCall) {
      toolCalls.set(id, { 
        ...toolCall, 
        result: error, 
        status: 'failed' 
      });
      
      const executingIds = new Set(this.state.executingIds);
      executingIds.delete(id);

      this.setState({ toolCalls, executingIds });
    }
  }

  // 获取消息的工具调用
  getToolCallsForMessage(messageId: string): ToolCall[] {
    const ids = this.state.messageToolCalls.get(messageId) || [];
    return ids
      .map(id => this.state.toolCalls.get(id))
      .filter(Boolean) as ToolCall[];
  }

  // 获取正在执行的工具调用
  getExecutingToolCalls(): ToolCall[] {
    return Array.from(this.state.executingIds)
      .map(id => this.state.toolCalls.get(id))
      .filter(Boolean) as ToolCall[];
  }

  // 是否有正在执行的工具调用
  hasExecuting(): boolean {
    return this.state.executingIds.size > 0;
  }

  // 清除消息的工具调用
  clearToolCallsForMessage(messageId: string): void {
    const messageToolCalls = new Map(this.state.messageToolCalls);
    const ids = messageToolCalls.get(messageId) || [];
    
    const toolCalls = new Map(this.state.toolCalls);
    const executingIds = new Set(this.state.executingIds);
    
    ids.forEach(id => {
      toolCalls.delete(id);
      executingIds.delete(id);
    });

    messageToolCalls.delete(messageId);

    this.setState({ toolCalls, messageToolCalls, executingIds });
  }

  // 清除所有工具调用
  clearAll(): void {
    this.setState(initialState);
  }

  // 重置
  reset(): void {
    this.setState(initialState);
  }
}

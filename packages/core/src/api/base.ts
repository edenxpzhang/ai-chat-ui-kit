/**
 * @generated-by AI: edenxpzhang
 * @generated-date 2026-05-13
 */

import { APIAdapter, Message, ModelConfig, ChatConfig, ToolCall } from '../types/index.js';

/**
 * API 适配器基类
 * 提供通用的 SSE 流式处理、AbortController 管理等
 */
export abstract class BaseAPIAdapter implements APIAdapter {
  protected abortController: AbortController | null = null;

  /**
   * 发送消息（由子类实现）
   */
  abstract sendMessage(params: {
    messages: Message[];
    modelConfig: ModelConfig;
    chatConfig: ChatConfig;
    onChunk?: (chunk: string) => void;
    onToolCall?: (toolCall: ToolCall) => void;
    onComplete?: (message: Message) => void;
    onError?: (error: Error) => void;
  }): Promise<void>;

  /**
   * 中止请求
   */
  abort(): void {
    if (this.abortController) {
      this.abortController.abort();
      this.abortController = null;
    }
  }

  /**
   * 创建 AbortController
   */
  protected createAbortController(): AbortController {
    this.abort(); // 取消之前的请求
    this.abortController = new AbortController();
    return this.abortController;
  }

  /**
   * 转换为 OpenAI 格式的消息
   */
  protected convertToOpenAIFormat(messages: Message[]): Array<{ role: string; content: string }> {
    return messages.map(msg => ({
      role: msg.role,
      content: msg.content
    }));
  }

  /**
   * 处理 SSE 流式响应
   * @param response Fetch Response 对象
   * @param onChunk 接收文本块的回调
   * @returns 完整的响应文本
   */
  protected async handleStreamResponse(
    response: Response,
    onChunk: (chunk: string) => void
  ): Promise<string> {
    if (!response.body) {
      throw new Error('Response body is null, cannot read stream');
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder('utf-8');
    let fullContent = '';
    let buffer = '';

    try {
      while (true) {
        const { done, value } = await reader.read();
        
        if (done) {
          break;
        }

        // 解码并添加到缓冲区
        buffer += decoder.decode(value, { stream: true });
        
        // 按行处理 SSE 数据
        const lines = buffer.split('\n');
        // 保留最后一行（可能不完整）
        buffer = lines.pop() || '';

        for (const line of lines) {
          const trimmedLine = line.trim();
          
          if (!trimmedLine || trimmedLine === 'data: [DONE]') {
            continue;
          }

          if (trimmedLine.startsWith('data: ')) {
            const data = trimmedLine.slice(6);
            
            try {
              const parsed = JSON.parse(data);
              const content = this.extractContentFromChunk(parsed);
              
              if (content) {
                fullContent += content;
                onChunk(content);
              }
            } catch (e) {
              // 忽略解析错误，继续处理下一行
              console.warn('Failed to parse SSE chunk:', data);
            }
          }
        }
      }

      // 处理缓冲区剩余内容
      if (buffer.trim()) {
        const trimmedLine = buffer.trim();
        if (trimmedLine.startsWith('data: ')) {
          const data = trimmedLine.slice(6);
          try {
            const parsed = JSON.parse(data);
            const content = this.extractContentFromChunk(parsed);
            if (content) {
              fullContent += content;
              onChunk(content);
            }
          } catch (e) {
            // 忽略
          }
        }
      }
    } finally {
      reader.releaseLock();
    }

    return fullContent;
  }

  /**
   * 从 SSE chunk 中提取文本内容（由子类重写）
   */
  protected extractContentFromChunk(chunk: unknown): string {
    // OpenAI 格式
    if (typeof chunk === 'object' && chunk !== null) {
      const data = chunk as Record<string, unknown>;
      
      // OpenAI 格式: choices[0].delta.content
      if (data.choices && Array.isArray(data.choices) && data.choices.length > 0) {
        const choice = data.choices[0] as Record<string, unknown>;
        const delta = choice.delta as Record<string, unknown> | undefined;
        if (delta && typeof delta.content === 'string') {
          return delta.content;
        }
      }
    }

    return '';
  }

  /**
   * 处理工具调用（由子类重写）
   */
  protected extractToolCallsFromChunk(chunk: unknown): ToolCall[] {
    return [];
  }

  /**
   * 构建请求头
   */
  protected buildHeaders(modelConfig: ModelConfig): Record<string, string> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...modelConfig.headers
    };

    return headers;
  }

  /**
   * 构建请求体（基础实现，子类可重写）
   */
  protected buildRequestBody(
    messages: Message[],
    modelConfig: ModelConfig,
    chatConfig: ChatConfig
  ): Record<string, unknown> {
    return {
      model: modelConfig.model,
      messages: this.convertToOpenAIFormat(messages),
      stream: chatConfig.stream !== false,
      ...modelConfig.params
    };
  }

  /**
   * 处理错误
   */
  protected handleError(error: unknown, onError?: (error: Error) => void): void {
    const err = error instanceof Error ? error : new Error(String(error));
    
    if (onError) {
      onError(err);
    } else {
      console.error('API Adapter Error:', err);
    }
  }
}


import { BaseAPIAdapter } from './base.js';
import { MessageRole, Message, ModelConfig, ChatConfig, ToolCall } from '../types/index.js';

/**
 * OpenAI 兼容适配器
 * 支持 OpenAI 格式（包括文心、通义等兼容接口）
 */
export class OpenAIAdapter extends BaseAPIAdapter {
  async sendMessage(params: {
    messages: Message[];
    modelConfig: ModelConfig;
    chatConfig: ChatConfig;
    onChunk?: (chunk: string) => void;
    onToolCall?: (toolCall: ToolCall) => void;
    onComplete?: (message: Message) => void;
    onError?: (error: Error) => void;
  }): Promise<void> {
    const { messages, modelConfig, chatConfig, onChunk, onComplete, onError } = params;
    const controller = this.createAbortController();

    try {
      const headers = this.buildHeaders(modelConfig);
      const body = this.buildRequestBody(messages, modelConfig, chatConfig);

      const response = await fetch(modelConfig.apiEndpoint || 'https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers,
        body: JSON.stringify(body),
        signal: controller.signal
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`API request failed: ${response.status} ${errorText}`);
      }

      if (chatConfig.stream !== false) {
        // 流式响应
        const fullContent = await this.handleStreamResponse(response, (chunk) => {
          if (onChunk) {
            onChunk(chunk);
          }
        });

        if (onComplete) {
          onComplete({
            id: `msg_${Date.now()}`,
            role: MessageRole.Assistant,
            content: fullContent,
            timestamp: Date.now()
          });
        }
      } else {
        // 非流式响应
        const data = await response.json();
        const content = this.extractContentFromNonStreamResponse(data);

        if (onComplete) {
          onComplete({
            id: `msg_${Date.now()}`,
            role: MessageRole.Assistant,
            content,
            timestamp: Date.now()
          });
        }
      }
    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') {
        return; // 正常中止
      }
      this.handleError(error, onError);
    }
  }

  protected buildHeaders(modelConfig: ModelConfig): Record<string, string> {
    const headers = super.buildHeaders(modelConfig);
    
    if (modelConfig.apiKey) {
      headers['Authorization'] = `Bearer ${modelConfig.apiKey}`;
    }

    return headers;
  }

  protected extractContentFromChunk(chunk: unknown): string {
    if (typeof chunk === 'object' && chunk !== null) {
      const data = chunk as Record<string, unknown>;
      
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

  private extractContentFromNonStreamResponse(data: unknown): string {
    if (typeof data === 'object' && data !== null) {
      const response = data as Record<string, unknown>;
      
      if (response.choices && Array.isArray(response.choices) && response.choices.length > 0) {
        const choice = response.choices[0] as Record<string, unknown>;
        const message = choice.message as Record<string, unknown> | undefined;
        
        if (message && typeof message.content === 'string') {
          return message.content;
        }
      }
    }

    return '';
  }
}

/**
 * 百度文心一言适配器
 * 需要特殊处理 access_token
 */
export class ERNIEAdapter extends BaseAPIAdapter {
  private accessToken: string | null = null;
  private tokenExpiry: number = 0;

  async sendMessage(params: {
    messages: Message[];
    modelConfig: ModelConfig;
    chatConfig: ChatConfig;
    onChunk?: (chunk: string) => void;
    onToolCall?: (toolCall: ToolCall) => void;
    onComplete?: (message: Message) => void;
    onError?: (error: Error) => void;
  }): Promise<void> {
    const { messages, modelConfig, chatConfig, onChunk, onComplete, onError } = params;
    const controller = this.createAbortController();

    try {
      // 获取 access_token
      const accessToken = await this.getAccessToken(modelConfig);
      
      // 构建文心专用的请求格式
      const ernieMessages = this.convertToERNIEFormat(messages);
      const body = {
        messages: ernieMessages,
        stream: chatConfig.stream !== false,
        temperature: modelConfig.params?.temperature || 0.7,
        top_p: modelConfig.params?.topP || 1,
        penalty_score: 1
      };

      const endpoint = `${modelConfig.apiEndpoint}?access_token=${accessToken}`;

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(body),
        signal: controller.signal
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`ERNIE API request failed: ${response.status} ${errorText}`);
      }

      if (chatConfig.stream !== false) {
        const fullContent = await this.handleERNIEStreamResponse(response, (chunk) => {
          if (onChunk) {
            onChunk(chunk);
          }
        });

        if (onComplete) {
          onComplete({
            id: `msg_${Date.now()}`,
            role: MessageRole.Assistant,
            content: fullContent,
            timestamp: Date.now()
          });
        }
      } else {
        const data = await response.json();
        const content = data.result || '';

        if (onComplete) {
          onComplete({
            id: `msg_${Date.now()}`,
            role: MessageRole.Assistant,
            content,
            timestamp: Date.now()
          });
        }
      }
    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') {
        return;
      }
      this.handleError(error, onError);
    }
  }

  /**
   * 获取百度 access_token
   */
  private async getAccessToken(modelConfig: ModelConfig): Promise<string> {
    // 检查缓存的 token 是否过期
    if (this.accessToken && Date.now() < this.tokenExpiry) {
      return this.accessToken;
    }

    const apiKey = modelConfig.apiKey;
    const secretKey = modelConfig.headers?.['X-Secret-Key'] as string | undefined;

    if (!apiKey || !secretKey) {
      throw new Error('ERNIE adapter requires both apiKey (API Key) and X-Secret-Key (Secret Key)');
    }

    const tokenUrl = `https://aip.baidubce.com/oauth/2.0/token?grant_type=client_credentials&client_id=${apiKey}&client_secret=${secretKey}`;

    const response = await fetch(tokenUrl);
    if (!response.ok) {
      throw new Error(`Failed to get ERNIE access token: ${response.status}`);
    }

    const data = await response.json();
    this.accessToken = data.access_token;
    this.tokenExpiry = Date.now() + (data.expires_in - 300) * 1000; // 提前 5 分钟过期

    if (!this.accessToken) {
      throw new Error('Failed to retrieve access token');
    }
    return this.accessToken;
  }

  /**
   * 转换为文心格式
   */
  private convertToERNIEFormat(messages: Message[]): Array<{ role: string; content: string }> {
    return messages.map(msg => ({
      role: msg.role === MessageRole.Tool ? MessageRole.Assistant : msg.role,
      content: msg.content
    }));
  }

  /**
   * 处理文心流式响应（格式与 OpenAI 不同）
   */
  private async handleERNIEStreamResponse(
    response: Response,
    onChunk: (chunk: string) => void
  ): Promise<string> {
    const reader = response.body!.getReader();
    const decoder = new TextDecoder('utf-8');
    let fullContent = '';
    let buffer = '';

    try {
      while (true) {
        const { done, value } = await reader.read();
        
        if (done) {
          break;
        }

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
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
              const content = parsed.result || parsed.data || '';
              
              if (content) {
                fullContent += content;
                onChunk(content);
              }
            } catch (e) {
              console.warn('Failed to parse ERNIE SSE chunk:', data);
            }
          }
        }
      }
    } finally {
      reader.releaseLock();
    }

    return fullContent;
  }
}

/**
 * 阿里通义千问适配器
 * 使用 DashScope 格式
 */
export class QwenAdapter extends BaseAPIAdapter {
  async sendMessage(params: {
    messages: Message[];
    modelConfig: ModelConfig;
    chatConfig: ChatConfig;
    onChunk?: (chunk: string) => void;
    onToolCall?: (toolCall: ToolCall) => void;
    onComplete?: (message: Message) => void;
    onError?: (error: Error) => void;
  }): Promise<void> {
    const { messages, modelConfig, chatConfig, onChunk, onComplete, onError } = params;
    const controller = this.createAbortController();

    try {
      const headers = this.buildHeaders(modelConfig);
      
      // 转换为 DashScope 格式
      const dashScopeMessages = this.convertToDashScopeFormat(messages);
      
      const body = {
        model: modelConfig.model,
        input: {
          messages: dashScopeMessages
        },
        parameters: {
          temperature: modelConfig.params?.temperature || 0.7,
          top_p: modelConfig.params?.topP || 1,
          max_tokens: modelConfig.params?.maxTokens || 2048,
          result_format: 'message'
        }
      };

      const response = await fetch(modelConfig.apiEndpoint || 'https://dashscope.aliyuncs.com/api/v1/services/aigc/text-generation/generation', {
        method: 'POST',
        headers,
        body: JSON.stringify(body),
        signal: controller.signal
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Qwen API request failed: ${response.status} ${errorText}`);
      }

      if (chatConfig.stream !== false) {
        const fullContent = await this.handleQwenStreamResponse(response, (chunk) => {
          if (onChunk) {
            onChunk(chunk);
          }
        });

        if (onComplete) {
          onComplete({
            id: `msg_${Date.now()}`,
            role: MessageRole.Assistant,
            content: fullContent,
            timestamp: Date.now()
          });
        }
      } else {
        const data = await response.json();
        const content = this.extractContentFromDashScopeResponse(data);

        if (onComplete) {
          onComplete({
            id: `msg_${Date.now()}`,
            role: MessageRole.Assistant,
            content,
            timestamp: Date.now()
          });
        }
      }
    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') {
        return;
      }
      this.handleError(error, onError);
    }
  }

  protected buildHeaders(modelConfig: ModelConfig): Record<string, string> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json'
    };

    if (modelConfig.apiKey) {
      headers['Authorization'] = `Bearer ${modelConfig.apiKey}`;
      headers['X-DashScope-SLO'] = 'your-slo';
    }

    return headers;
  }

  /**
   * 转换为 DashScope 格式
   */
  private convertToDashScopeFormat(messages: Message[]): Array<{ role: string; content: string }> {
    return messages.map(msg => ({
      role: msg.role === MessageRole.Tool ? 'function' : msg.role,
      content: msg.content
    }));
  }

  /**
   * 处理通义千问流式响应
   */
  private async handleQwenStreamResponse(
    response: Response,
    onChunk: (chunk: string) => void
  ): Promise<string> {
    const reader = response.body!.getReader();
    const decoder = new TextDecoder('utf-8');
    let fullContent = '';
    let buffer = '';

    try {
      while (true) {
        const { done, value } = await reader.read();
        
        if (done) {
          break;
        }

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          const trimmedLine = line.trim();
          
          if (!trimmedLine) {
            continue;
          }

          try {
            const parsed = JSON.parse(trimmedLine);
            
            if (parsed.output && parsed.output.choices) {
              const choice = parsed.output.choices[0];
              if (choice.message && choice.message.content) {
                const content = choice.message.content;
                fullContent += content;
                onChunk(content);
              }
            }
          } catch (e) {
            console.warn('Failed to parse Qwen SSE chunk:', trimmedLine);
          }
        }
      }
    } finally {
      reader.releaseLock();
    }

    return fullContent;
  }

  /**
   * 从 DashScope 非流式响应中提取内容
   */
  private extractContentFromDashScopeResponse(data: unknown): string {
    if (typeof data === 'object' && data !== null) {
      const response = data as Record<string, unknown>;
      
      if (response.output && typeof response.output === 'object') {
        const output = response.output as Record<string, unknown>;
        
        if (output.choices && Array.isArray(output.choices) && output.choices.length > 0) {
          const choice = output.choices[0] as Record<string, unknown>;
          
          if (choice.message && typeof choice.message === 'object') {
            const message = choice.message as Record<string, unknown>;
            return typeof message.content === 'string' ? message.content : '';
          }
        }
      }
    }

    return '';
  }
}

/**
 * 讯飞星火适配器
 */
export class SparkAdapter extends BaseAPIAdapter {
  async sendMessage(params: {
    messages: Message[];
    modelConfig: ModelConfig;
    chatConfig: ChatConfig;
    onChunk?: (chunk: string) => void;
    onToolCall?: (toolCall: ToolCall) => void;
    onComplete?: (message: Message) => void;
    onError?: (error: Error) => void;
  }): Promise<void> {
    const { messages, modelConfig, chatConfig, onChunk, onComplete, onError } = params;
    const controller = this.createAbortController();

    try {
      // 星火需要使用 WebSocket 或特定的 HTTP 接口
      // 这里使用 HTTP 接口示例
      const headers = {
        'Content-Type': 'application/json'
      };

      const sparkMessages = messages.map(msg => ({
        role: msg.role,
        content: msg.content
      }));

      const body = {
        header: {
          app_id: modelConfig.apiKey,
          uid: `user_${Date.now()}`
        },
        parameter: {
          chat: {
            domain: modelConfig.model || 'general',
            temperature: modelConfig.params?.temperature || 0.7,
            max_tokens: modelConfig.params?.maxTokens || 2048
          }
        },
        payload: {
          message: {
            text: sparkMessages
          }
        }
      };

      const response = await fetch(modelConfig.apiEndpoint || 'https://spark-api.xf-yun.com/v1/chat/completions', {
        method: 'POST',
        headers,
        body: JSON.stringify(body),
        signal: controller.signal
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Spark API request failed: ${response.status} ${errorText}`);
      }

      // 处理星火响应（简化版本，实际需要按星火格式解析）
      const data = await response.json();
      const content = this.extractContentFromSparkResponse(data);

      if (onComplete) {
        onComplete({
          id: `msg_${Date.now()}`,
          role: MessageRole.Assistant,
          content,
          timestamp: Date.now()
        });
      }
    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') {
        return;
      }
      this.handleError(error, onError);
    }
  }

  /**
   * 从星火响应中提取内容
   */
  private extractContentFromSparkResponse(data: unknown): string {
    if (typeof data === 'object' && data !== null) {
      const response = data as Record<string, unknown>;
      
      if (response.payload && typeof response.payload === 'object') {
        const payload = response.payload as Record<string, unknown>;
        
        if (payload.choices && typeof payload.choices === 'object') {
          const choices = payload.choices as Record<string, unknown>;
          
          if (choices.text && Array.isArray(choices.text) && choices.text.length > 0) {
            const firstChoice = choices.text[0] as Record<string, unknown>;
            return typeof firstChoice.content === 'string' ? firstChoice.content : '';
          }
        }
      }
    }

    return '';
  }
}

/**
 * 腾讯混元适配器
 */
export class HunyuanAdapter extends BaseAPIAdapter {
  async sendMessage(params: {
    messages: Message[];
    modelConfig: ModelConfig;
    chatConfig: ChatConfig;
    onChunk?: (chunk: string) => void;
    onToolCall?: (toolCall: ToolCall) => void;
    onComplete?: (message: Message) => void;
    onError?: (error: Error) => void;
  }): Promise<void> {
    const { messages, modelConfig, chatConfig, onChunk, onComplete, onError } = params;
    const controller = this.createAbortController();

    try {
      const headers = this.buildHeaders(modelConfig);
      
      const body = {
        model: modelConfig.model || 'hunyuan-lite',
        messages: this.convertToOpenAIFormat(messages),
        stream: chatConfig.stream !== false,
        temperature: modelConfig.params?.temperature || 0.7,
        top_p: modelConfig.params?.topP || 1,
        max_tokens: modelConfig.params?.maxTokens || 2048
      };

      const response = await fetch(modelConfig.apiEndpoint || 'https://hunyuan.tencentcloudapi.com/', {
        method: 'POST',
        headers,
        body: JSON.stringify(body),
        signal: controller.signal
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Hunyuan API request failed: ${response.status} ${errorText}`);
      }

      if (chatConfig.stream !== false) {
        // 混元支持 SSE 格式
        const fullContent = await this.handleStreamResponse(response, (chunk) => {
          if (onChunk) {
            onChunk(chunk);
          }
        });

        if (onComplete) {
          onComplete({
            id: `msg_${Date.now()}`,
            role: MessageRole.Assistant,
            content: fullContent,
            timestamp: Date.now()
          });
        }
      } else {
        const data = await response.json();
        const content = this.extractContentFromHunyuanResponse(data);

        if (onComplete) {
          onComplete({
            id: `msg_${Date.now()}`,
            role: MessageRole.Assistant,
            content,
            timestamp: Date.now()
          });
        }
      }
    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') {
        return;
      }
      this.handleError(error, onError);
    }
  }

  protected buildHeaders(modelConfig: ModelConfig): Record<string, string> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json'
    };

    // 混元需要使用腾讯云的签名认证
    // 这里简化处理，实际应使用腾讯云 SDK 签名
    if (modelConfig.apiKey) {
      headers['Authorization'] = `Bearer ${modelConfig.apiKey}`;
      headers['X-TC-Action'] = 'ChatCompletions';
      headers['X-TC-Version'] = '2023-09-01';
      headers['X-TC-Region'] = 'ap-guangzhou';
    }

    return headers;
  }

  /**
   * 从混元响应中提取内容
   */
  private extractContentFromHunyuanResponse(data: unknown): string {
    if (typeof data === 'object' && data !== null) {
      const response = data as Record<string, unknown>;
      
      if (response.Response && typeof response.Response === 'object') {
        const resp = response.Response as Record<string, unknown>;
        
        if (resp.Choices && Array.isArray(resp.Choices) && resp.Choices.length > 0) {
          const choice = resp.Choices[0] as Record<string, unknown>;
          const message = choice.Message as Record<string, unknown> | undefined;
          
          if (message && typeof message.Content === 'string') {
            return message.Content;
          }
        }
      }
    }

    return '';
  }
}

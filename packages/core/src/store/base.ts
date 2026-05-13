/**
 * @generated-by AI: edenxpzhang
 * @generated-date 2026-05-13
 */

// 简单的事件发射器（用于状态管理）
export class EventEmitter {
  private events: Map<string, Set<Function>> = new Map();

  // 订阅事件
  on(event: string, callback: Function): void {
    if (!this.events.has(event)) {
      this.events.set(event, new Set());
    }
    this.events.get(event)?.add(callback);
  }

  // 取消订阅
  off(event: string, callback: Function): void {
    const callbacks = this.events.get(event);
    if (callbacks) {
      callbacks.delete(callback);
    }
  }

  // 触发事件
  emit(event: string, ...args: unknown[]): void {
    const callbacks = this.events.get(event);
    if (callbacks) {
      callbacks.forEach((callback) => {
        try {
          callback(...args);
        } catch (error) {
          console.error(`Error in event listener for "${event}":`, error);
        }
      });
    }
  }

  // 清空所有事件
  clear(): void {
    this.events.clear();
  }
}

// Store 基类
export abstract class BaseStore<T> {
  protected state: T;
  protected emitter: EventEmitter;

  constructor(initialState: T) {
    this.state = initialState;
    this.emitter = new EventEmitter();
  }

  // 获取状态
  getState(): T {
    return this.state;
  }

  // 更新状态
  protected setState(partial: Partial<T>): void {
    this.state = { ...this.state, ...partial };
    this.emitter.emit('change', this.state);
  }

  // 订阅状态变化
  subscribe(callback: (state: T) => void): () => void {
    this.emitter.on('change', callback);
    return () => this.emitter.off('change', callback);
  }

  // 重置状态
  abstract reset(): void;
}

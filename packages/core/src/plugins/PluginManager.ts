/**
 * @generated-by AI: edenxpzhang
 * @generated-date 2026-05-13
 */

import { MessagePlugin, Message, RenderContext } from '../types/index.js';

/**
 * 插件管理器
 * 负责管理所有消息插件，包括注册、注销、匹配和渲染
 */
export class PluginManager {
  private plugins: Map<string, MessagePlugin> = new Map();
  private renderOrder: string[] = [];  // 渲染顺序（按优先级）

  /**
   * 注册插件
   * @param plugin 插件实例
   */
  register(plugin: MessagePlugin): void {
    if (!plugin || !plugin.type) {
      console.error('PluginManager: Cannot register invalid plugin', plugin);
      return;
    }

    if (this.plugins.has(plugin.type)) {
      console.warn(`PluginManager: Plugin "${plugin.type}" is already registered, overwriting`);
    }

    this.plugins.set(plugin.type, plugin);
    this.updateRenderOrder();
  }

  /**
   * 注销插件
   * @param type 插件类型标识
   */
  unregister(type: string): void {
    if (this.plugins.has(type)) {
      this.plugins.delete(type);
      this.updateRenderOrder();
    }
  }

  /**
   * 获取指定类型的插件
   * @param type 插件类型标识
   * @returns 插件实例或 undefined
   */
  getPlugin(type: string): MessagePlugin | undefined {
    return this.plugins.get(type);
  }

  /**
   * 获取所有已注册的插件
   * @returns 插件数组
   */
  getAllPlugins(): MessagePlugin[] {
    return Array.from(this.plugins.values());
  }

  /**
   * 根据内容匹配最合适的插件（按优先级排序）
   * @param content 消息内容
   * @returns 匹配的插件或 null
   */
  matchPlugin(content: string): MessagePlugin | null {
    if (!content || typeof content !== 'string') {
      return null;
    }

    const matchedPlugins: Array<{ plugin: MessagePlugin; priority: number }> = [];

    for (const plugin of this.plugins.values()) {
      if (plugin.match && typeof plugin.match === 'function') {
        try {
          const isMatch = plugin.match(content);
          if (isMatch) {
            matchedPlugins.push({
              plugin,
              priority: plugin.priority || 0
            });
          }
        } catch (error) {
          console.error(`PluginManager: Error in plugin "${plugin.type}" match function:`, error);
        }
      }
    }

    // 按优先级排序（数字越大优先级越高）
    matchedPlugins.sort((a, b) => b.priority - a.priority);

    return matchedPlugins.length > 0 ? matchedPlugins[0].plugin : null;
  }

  /**
   * 匹配所有符合条件的插件（按优先级排序）
   * @param content 消息内容
   * @returns 所有匹配的插件数组
   */
  matchAllPlugins(content: string): MessagePlugin[] {
    if (!content || typeof content !== 'string') {
      return [];
    }

    const matchedPlugins: Array<{ plugin: MessagePlugin; priority: number }> = [];

    for (const plugin of this.plugins.values()) {
      if (plugin.match && typeof plugin.match === 'function') {
        try {
          const isMatch = plugin.match(content);
          if (isMatch) {
            matchedPlugins.push({
              plugin,
              priority: plugin.priority || 0
            });
          }
        } catch (error) {
          console.error(`PluginManager: Error in plugin "${plugin.type}" match function:`, error);
        }
      }
    }

    // 按优先级排序
    matchedPlugins.sort((a, b) => b.priority - a.priority);

    return matchedPlugins.map(item => item.plugin);
  }

  /**
   * 使用匹配的插件渲染内容
   * @param content 消息内容
   * @param context 渲染上下文
   * @returns 渲染结果（HTMLElement 或 HTML 字符串）
   */
  renderWithPlugin(content: string, context: RenderContext): HTMLElement | string {
    const plugin = this.matchPlugin(content);

    if (plugin && plugin.render) {
      try {
        return plugin.render(content, context);
      } catch (error) {
        console.error(`PluginManager: Error in plugin "${plugin.type}" render function:`, error);
        return content; // 降级返回原始内容
      }
    }

    // 没有匹配的插件，返回原始内容
    return content;
  }

  /**
   * 渲染所有匹配的插件（用于一个消息需要多个插件处理的情况）
   * @param content 消息内容
   * @param context 渲染上下文
   * @returns 渲染结果数组
   */
  renderWithAllPlugins(content: string, context: RenderContext): Array<{ plugin: MessagePlugin; result: HTMLElement | string }> {
    const plugins = this.matchAllPlugins(content);
    const results: Array<{ plugin: MessagePlugin; result: HTMLElement | string }> = [];

    for (const plugin of plugins) {
      if (plugin.render) {
        try {
          const result = plugin.render(content, context);
          results.push({ plugin, result });
        } catch (error) {
          console.error(`PluginManager: Error in plugin "${plugin.type}" render function:`, error);
        }
      }
    }

    return results;
  }

  /**
   * 清除所有插件
   */
  clear(): void {
    this.plugins.clear();
    this.renderOrder = [];
  }

  /**
   * 获取已注册插件的数量
   */
  get size(): number {
    return this.plugins.size;
  }

  /**
   * 检查是否注册了指定类型的插件
   * @param type 插件类型标识
   */
  hasPlugin(type: string): boolean {
    return this.plugins.has(type);
  }

  /**
   * 更新渲染顺序（按优先级排序）
   */
  private updateRenderOrder(): void {
    const sorted = Array.from(this.plugins.entries())
      .sort((a, b) => {
        const priorityA = a[1].priority || 0;
        const priorityB = b[1].priority || 0;
        return priorityB - priorityA; // 降序
      })
      .map(([type]) => type);

    this.renderOrder = sorted;
  }
}

/**
 * 创建插件管理器的单例
 */
let defaultPluginManager: PluginManager | null = null;

export function getDefaultPluginManager(): PluginManager {
  if (!defaultPluginManager) {
    defaultPluginManager = new PluginManager();
  }
  return defaultPluginManager;
}

export function resetDefaultPluginManager(): void {
  if (defaultPluginManager) {
    defaultPluginManager.clear();
  }
  defaultPluginManager = new PluginManager();
}

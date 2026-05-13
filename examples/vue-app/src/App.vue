<!--
  @generated-by AI: edenxpzhang
  @generated-date 2026-05-13
-->
<template>
  <div class="container">
    <header class="header">
      <h1 class="title">🤖 AI Chat - Vue 示例</h1>
      <div class="theme-buttons">
        <button
          :class="['theme-btn', { active: theme === 'default' }]"
          @click="handleThemeChange('default')"
        >
          默认主题
        </button>
        <button
          :class="['theme-btn', { active: theme === 'bubble' }]"
          @click="handleThemeChange('bubble')"
        >
          气泡主题
        </button>
        <button
          :class="['theme-btn', { active: theme === 'flat' }]"
          @click="handleThemeChange('flat')"
        >
          扁平主题
        </button>
      </div>
    </header>
    <main class="chat-container">
      <ai-chat ref="chatRef" class="chat"></ai-chat>
    </main>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import '@ai-chat/components';
import '@ai-chat/themes/default';

const chatRef = ref<HTMLElement>();
const theme = ref<'default' | 'bubble' | 'flat'>('default');

onMounted(() => {
  if (chatRef.value) {
    // 设置消息处理回调
    (chatRef.value as any).setMessageHandler(async (message: string) => {
      // 模拟 AI 回复延迟
      await new Promise(resolve => setTimeout(resolve, 1000));
      return `AI 回复：${message}`;
    });

    // 添加欢迎消息
    (chatRef.value as any).addMessage({
      role: 'assistant',
      content: '你好！我是 AI 助手。有什么可以帮助你的吗？'
    });
  }
});

// 切换主题
const handleThemeChange = (newTheme: 'default' | 'bubble' | 'flat') => {
  theme.value = newTheme;
  console.log(`切换到 ${newTheme} 主题`);
  // 在实际使用中，这里应该动态加载对应的主题 CSS
  // 可以通过动态导入实现：
  // import(`@ai-chat/themes/${newTheme}`);
};
</script>

<style>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

html, body {
  height: 100%;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
}

#app {
  height: 100%;
}
</style>

<style scoped>
.container {
  height: 100vh;
  display: flex;
  flex-direction: column;
}

.header {
  padding: 16px 24px;
  background: #1677ff;
  color: white;
  display: flex;
  align-items: center;
  justify-content: space-between;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.title {
  font-size: 20px;
  font-weight: 600;
}

.theme-buttons {
  display: flex;
  gap: 8px;
}

.theme-btn {
  padding: 6px 16px;
  border: 1px solid rgba(255, 255, 255, 0.5);
  background: transparent;
  color: white;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  transition: all 0.3s;
}

.theme-btn:hover {
  background: rgba(255, 255, 255, 0.15);
}

.theme-btn.active {
  background: rgba(255, 255, 255, 0.25);
  border-color: white;
}

.chat-container {
  flex: 1;
  height: 0;
  overflow: hidden;
}

.chat {
  height: 100%;
  display: block;
}
</style>

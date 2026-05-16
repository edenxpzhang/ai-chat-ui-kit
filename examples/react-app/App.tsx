
import React, { useEffect, useRef, useState } from 'react';
import '@ai-chat/components';
import '@ai-chat/themes/default';

const ChatApp: React.FC = () => {
  const chatRef = useRef<HTMLElement>(null);
  const [theme, setTheme] = useState<'default' | 'bubble' | 'flat'>('default');

  useEffect(() => {
    if (chatRef.current) {
      // 设置消息处理回调
      (chatRef.current as any).setMessageHandler(async (message: string) => {
        // 模拟 AI 回复延迟
        await new Promise(resolve => setTimeout(resolve, 1000));
        return `AI 回复：${message}`;
      });

      // 添加欢迎消息
      (chatRef.current as any).addMessage({
        role: 'assistant',
        content: '你好！我是 AI 助手。有什么可以帮助你的吗？'
      });
    }
  }, []);

  // 切换主题
  const handleThemeChange = (newTheme: 'default' | 'bubble' | 'flat') => {
    setTheme(newTheme);
    // 在实际使用中，这里应该动态加载对应的主题 CSS
    console.log(`切换到 ${newTheme} 主题`);
    // 可以通过动态导入实现：
    // import(`@ai-chat/themes/${newTheme}`);
  };

  return (
    <div style={styles.container}>
      <header style={styles.header}>
        <h1 style={styles.title}>🤖 AI Chat - React 示例</h1>
        <div style={styles.themeButtons}>
          <button
            style={{
              ...styles.themeBtn,
              ...(theme === 'default' ? styles.themeBtnActive : {}),
            }}
            onClick={() => handleThemeChange('default')}
          >
            默认主题
          </button>
          <button
            style={{
              ...styles.themeBtn,
              ...(theme === 'bubble' ? styles.themeBtnActive : {}),
            }}
            onClick={() => handleThemeChange('bubble')}
          >
            气泡主题
          </button>
          <button
            style={{
              ...styles.themeBtn,
              ...(theme === 'flat' ? styles.themeBtnActive : {}),
            }}
            onClick={() => handleThemeChange('flat')}
          >
            扁平主题
          </button>
        </div>
      </header>
      <main style={styles.chatContainer}>
        <ai-chat ref={chatRef} style={styles.chat}></ai-chat>
      </main>
    </div>
  );
};

const styles: Record<string, React.CSSProperties> = {
  container: {
    height: '100vh',
    display: 'flex',
    flexDirection: 'column',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
  },
  header: {
    padding: '16px 24px',
    background: '#1677ff',
    color: 'white',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
  },
  title: {
    fontSize: '20px',
    fontWeight: 600,
    margin: 0,
  },
  themeButtons: {
    display: 'flex',
    gap: '8px',
  },
  themeBtn: {
    padding: '6px 16px',
    border: '1px solid rgba(255, 255, 255, 0.5)',
    background: 'transparent',
    color: 'white',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '14px',
    transition: 'all 0.3s',
  },
  themeBtnActive: {
    background: 'rgba(255, 255, 255, 0.25)',
    borderColor: 'white',
  },
  chatContainer: {
    flex: 1,
    height: 0,
    overflow: 'hidden',
  },
  chat: {
    height: '100%',
    display: 'block',
  },
};

export default ChatApp;

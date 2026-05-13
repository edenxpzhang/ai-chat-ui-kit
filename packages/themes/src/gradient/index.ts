/**
 * @generated-by AI: edenxpzhang
 * @generated-date 2026-05-13
 */

import type { ThemeConfig } from '../types.js';
import themeStyles from './theme.css?raw';

export const gradientTheme: ThemeConfig = {
  name: 'gradient',
  variables: {
    '--ai-primary': 'linear-gradient(135deg, #f093fb, #f5576c)',
    '--ai-primary-hover': 'linear-gradient(135deg, #f5576c, #f093fb)',
    '--ai-primary-active': 'linear-gradient(135deg, #d63384, #e91e63)',
    '--ai-bg-primary': '#ffffff',
    '--ai-bg-secondary': '#fafafa',
    '--ai-bg-tertiary': '#f5f5f5',
    '--ai-bg-chat': 'linear-gradient(135deg, #f093fb 0%, #f5576c 25%, #4facfe 50%, #00f2fe 75%, #43e97b 100%)',
    '--ai-bg-chat-size': '400% 400%',
    '--ai-text-primary': '#333333',
    '--ai-text-secondary': '#666666',
    '--ai-text-tertiary': '#999999',
    '--ai-text-inverse': '#ffffff',
    '--ai-message-user-bg': 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    '--ai-message-user-text': '#ffffff',
    '--ai-message-ai-bg': '#ffffff',
    '--ai-message-ai-text': '#333333',
    '--ai-message-border': '#f0f0f0',
    '--ai-input-bg': '#f5f5f5',
    '--ai-input-border': '#e0e0e0',
    '--ai-input-focus-border': '#667eea',
    '--ai-input-text': '#333333',
    '--ai-input-placeholder': '#999999',
    '--ai-tool-call-bg': '#fafafa',
    '--ai-tool-call-border': '#e0e0e0',
    '--ai-tool-call-success': '#52c41a',
    '--ai-tool-call-error': '#ff4d4f',
    '--ai-tool-call-running': '#667eea',
    '--ai-shadow-sm': '0 2px 8px rgba(0, 0, 0, 0.08)',
    '--ai-shadow-md': '0 4px 15px rgba(102, 126, 234, 0.4)',
    '--ai-shadow-lg': '0 20px 60px rgba(0, 0, 0, 0.2)',
    '--ai-radius-sm': '6px',
    '--ai-radius-md': '20px',
    '--ai-radius-lg': '20px',
    '--ai-radius-xl': '30px',
    '--ai-spacing-xs': '4px',
    '--ai-spacing-sm': '8px',
    '--ai-spacing-md': '16px',
    '--ai-spacing-lg': '20px',
    '--ai-spacing-xl': '24px',
  },
  styles: themeStyles,
};

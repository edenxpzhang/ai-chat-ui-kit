
import { describe, it, expect } from 'vitest';
import { parseMarkdown, detectMarkdown } from './markdown';

describe('Markdown Parser', () => {
  describe('parseMarkdown', () => {
    it('should parse basic markdown', () => {
      const result = parseMarkdown('# Hello World');
      expect(result).toContain('Hello World');
      expect(result).toContain('<h1>');
    });

    it('should handle empty input', () => {
      const result = parseMarkdown('');
      expect(result).toBe('');
    });

    it('should parse code blocks with highlight.js', () => {
      const code = '```javascript\nconst a = 1;\n```';
      const result = parseMarkdown(code);
      expect(result).toContain('code-block');
      expect(result).toContain('javascript');
    });

    it('should parse tables', () => {
      const table = '| Header |\n| ------ |\n| Cell   |';
      const result = parseMarkdown(table);
      expect(result).toContain('<table>');
    });

    it('should parse bold and italic text', () => {
      expect(parseMarkdown('**bold**')).toContain('<strong>bold</strong>');
      expect(parseMarkdown('*italic*')).toContain('<em>italic</em>');
    });
  });

  describe('detectMarkdown', () => {
    it('should detect headings', () => {
      expect(detectMarkdown('# Heading')).toBe(true);
      expect(detectMarkdown('## H2')).toBe(true);
    });

    it('should detect code blocks', () => {
      expect(detectMarkdown('```code```')).toBe(true);
    });

    it('should detect bold text', () => {
      expect(detectMarkdown('**bold**')).toBe(true);
    });

    it('should return false for plain text', () => {
      expect(detectMarkdown('plain text without markdown')).toBe(false);
    });
  });
});

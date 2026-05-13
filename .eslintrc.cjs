/**
 * @generated-by AI: edenxpzhang
 * @generated-date 2026-05-13
 */

module.exports = {
  root: true,
  env: {
    browser: true,
    es2020: true,
    node: true,
  },
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaVersion: 2020,
    sourceType: 'module',
    ecmaFeatures: {
      jsx: true,
      tsx: true,
    },
  },
  plugins: ['@typescript-eslint'],
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
  ],
  rules: {
    // TypeScript specific rules
    '@typescript-eslint/no-explicit-any': 'warn',
    '@typescript-eslint/no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],
    '@typescript-eslint/explicit-function-return-type': 'off',
    '@typescript-eslint/explicit-module-boundary-types': 'off',
    '@typescript-eslint/no-non-null-assertion': 'warn',
    '@typescript-eslint/consistent-type-imports': 'error',

    // General rules
    'no-console': ['warn', { allow: ['warn', 'error', 'info'] }],
    'no-debugger': 'error',
    'no-alert': 'warn',
    'no-restricted-syntax': 'off',

    // Import rules
    'no-unused-vars': 'off', // Handled by @typescript-eslint
  },
  overrides: [
    // Lit component rules
    {
      files: ['*.ts'],
      excludedFiles: ['*.test.ts', '*.spec.ts'],
      rules: {
        'class-methods-use-this': 'off',
      },
    },
    // Test files
    {
      files: ['*.test.ts', '*.spec.ts', '**/tests/**/*.ts'],
      env: {
        jest: true,
      },
      rules: {
        '@typescript-eslint/no-explicit-any': 'off',
      },
    },
  ],
  ignorePatterns: [
    'dist/',
    'node_modules/',
    '*.config.js',
    '*.config.cjs',
    'build/',
    'coverage/',
    '.turbo/',
  ],
};

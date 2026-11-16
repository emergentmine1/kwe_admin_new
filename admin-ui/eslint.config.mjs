import { defineConfig, globalIgnores } from 'eslint/config';
import nextVitals from 'eslint-config-next/core-web-vitals';
import nextTs from 'eslint-config-next/typescript';
import sonarjs from 'eslint-plugin-sonarjs';

export default defineConfig([
  ...nextVitals,
  ...nextTs,
  sonarjs.configs.recommended,
  {
    rules: {
      'react/forbid-dom-props': ['error', { forbid: ['style'] }],
      'react/no-danger': 'error',
      // next/image adds inline style attributes, which our strict CSP blocks.
      '@next/next/no-img-element': 'off',
      'no-restricted-imports': ['error', { paths: [{ name: 'next/image', message: 'Use <img>: next/image emits inline styles (CSP).' }] }],
      'no-console': ['error', { allow: ['warn', 'error'] }],
    },
  },
  globalIgnores(['.next/**', 'node_modules/**', 'next-env.d.ts']),
]);

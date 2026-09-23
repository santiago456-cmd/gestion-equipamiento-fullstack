/// <reference types="vitest/config" />
// vite.config.ts
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

// vite.config.ts
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
  },
  test: {
    environment: 'jsdom',
    globals: true,
    css: true,
    setupFiles: ['./src/test/setup.ts'],
    include: ['src/**/*.{test,spec}.{ts,tsx}'], 
    exclude: ['e2e/**', 'node_modules/**'],  
    coverage: {
      provider: 'v8',
      include: ['src/**/*.{ts,tsx}'], // ya cumple el rol de "all: true"
      reporter: ['text', 'html', 'lcov'],
      exclude: [
        'node_modules/',
        'src/test/',
        '**/*.d.ts',
        '**/*.config.*',
        'src/main.tsx',
        'src/types/',
      ],
    },
  },
});
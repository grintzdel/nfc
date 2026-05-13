import path from 'path'

import vue from '@vitejs/plugin-vue'
import { defineConfig } from 'vitest/config'

export default defineConfig({
  plugins: [vue()],
  resolve: { alias: { '@': path.resolve(__dirname, './src') } },
  test: {
    environment: 'jsdom',
    setupFiles: ['src/__tests__/vitest-setup.ts'],
    globals: true,
    include: ['src/**/*.test.ts', 'src/**/*.vue.test.ts'],
    exclude: ['src/**/*.test.e2e.ts', 'node_modules/**'],
    passWithNoTests: true,
  },
})

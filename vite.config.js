import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import path from 'path'

export default defineConfig({
  plugins: [vue()],
  esbuild: {
    // 生产环境自动移除 console 和 debugger，提升运行性能
    drop: process.env.NODE_ENV === 'production' ? ['console', 'debugger'] : [],
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@styles': path.resolve(__dirname, './src/styles'),
      '@schema': path.resolve(__dirname, './src/schemas'),
      '@data': path.resolve(__dirname, './src/data'),
      '@world2d': path.resolve(__dirname, './src/game/world2d'),
      '@components': path.resolve(__dirname, './src/game/world2d/definitions/components'),
      '@entities': path.resolve(__dirname, './src/game/world2d/definitions/entities'),
      '@definitions': path.resolve(__dirname, './src/game/world2d/definitions'),
      '@systems': path.resolve(__dirname, './src/game/world2d/systems')
    }
  }
})
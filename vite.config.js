import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import path from 'path'

const validTargets = new Set(['web', 'ios', 'android', 'steam'])

export default defineConfig(({ mode }) => {
  const requestedTarget = process.env.TARGET ?? 'web'
  const target = validTargets.has(requestedTarget) ? requestedTarget : 'web'
  const outDir = target === 'steam' ? 'dist/steam' : (target === 'ios' || target === 'android' ? 'dist/mobile' : 'dist/web')

  return {
    plugins: [vue()],
    define: {
      __TARGET__: JSON.stringify(target),
    },
    build: {
      outDir,
      emptyOutDir: false,
    },
    esbuild: {
      // 生产环境自动移除 console 和 debugger，提升运行性能
      drop: mode === 'production' ? ['console', 'debugger'] : [],
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
  }
})
import { defineConfig } from 'vite'

export default defineConfig({
  // 开发服务器配置
  server: {
    host: true, // 允许外部访问
    port: 3000,
    open: true, // 自动打开浏览器
    cors: true
  },
  
  // 构建配置
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    sourcemap: true,
    minify: 'terser',
    rollupOptions: {
      output: {
        manualChunks: {
          phaser: ['phaser']
        }
      }
    }
  },
  
  // 资源处理
  assetsInclude: ['**/*.png', '**/*.jpg', '**/*.gif', '**/*.svg', '**/*.mp3', '**/*.wav', '**/*.ogg'],
  
  // 别名配置
  resolve: {
    alias: {
      '@': '/src',
      '@assets': '/public/assets',
      '@scenes': '/src/scenes',
      '@sprites': '/src/sprites',
      '@utils': '/src/utils'
    }
  },
  
  // 环境变量
  define: {
    __DEV__: JSON.stringify(process.env.NODE_ENV === 'development')
  }
})
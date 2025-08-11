import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig(({ mode }) => {
  const isProduction = mode === 'production';
  const isAnalyze = mode === 'analyze';
  
  return {
    // 基础配置
    base: './',
    
    // 构建优化
    build: {
      // 输出目录
      outDir: 'dist',
      
      // 资源内联阈值 (4KB)
      assetsInlineLimit: 4096,
      
      // 代码分割
      rollupOptions: {
        input: {
          main: resolve(__dirname, 'index.html')
        },
        output: {
          // 分包策略
          manualChunks: {
            // 将Phaser单独打包
            phaser: ['phaser'],
            
            // 将工具类单独打包
            utils: [
              './src/utils/PerformanceMonitor.js',
              './src/utils/ErrorHandler.js',
              './src/utils/ResponsiveManager.js',
              './src/utils/ObjectPool.js'
            ],
            
            // 将场景单独打包
            scenes: [
              './src/scenes/GameScene.js',
              './src/scenes/MenuScene.js',
              './src/scenes/SettingsScene.js'
            ]
          },
          
          // 文件命名
          chunkFileNames: 'js/[name]-[hash].js',
          entryFileNames: 'js/[name]-[hash].js',
          assetFileNames: (assetInfo) => {
            const info = assetInfo.name.split('.');
            const ext = info[info.length - 1];
            
            if (/\.(mp3|ogg|wav)$/.test(assetInfo.name)) {
              return `audio/[name]-[hash].${ext}`;
            }
            if (/\.(png|jpe?g|gif|svg|webp)$/.test(assetInfo.name)) {
              return `images/[name]-[hash].${ext}`;
            }
            return `assets/[name]-[hash].${ext}`;
          }
        },
        
        // 分析插件
        plugins: isAnalyze ? [
          {
            name: 'analyzer',
            generateBundle() {
              import('rollup-plugin-analyzer').then(({ default: analyzer }) => {
                analyzer({
                  summaryOnly: true,
                  limit: 10
                });
              });
            }
          }
        ] : []
      },
      
      // 压缩配置
      minify: isProduction ? 'terser' : false,
      terserOptions: isProduction ? {
        compress: {
          drop_console: true,  // 移除console
          drop_debugger: true, // 移除debugger
          pure_funcs: ['console.log', 'console.info', 'console.debug']
        },
        mangle: {
          // 保留类名用于调试
          keep_classnames: !isProduction
        }
      } : {},
      
      // 生成source map
      sourcemap: !isProduction,
      
      // 报告压缩详情
      reportCompressedSize: true
    },
    
    // 开发服务器配置
    server: {
      port: 3000,
      open: true,
      cors: true,
      host: true // 允许外部访问
    },
    
    // 预览服务器配置
    preview: {
      port: 4173,
      open: true,
      host: true
    },
    
    // 依赖优化
    optimizeDeps: {
      include: ['phaser'],
      // 强制预构建
      force: false
    },
    
    // 定义全局变量
    define: {
      __DEV__: !isProduction,
      __VERSION__: JSON.stringify(process.env.npm_package_version || '1.0.0'),
      __BUILD_TIME__: JSON.stringify(new Date().toISOString())
    },
    
    // CSS 配置
    css: {
      // CSS 代码分割
      codeSplit: true,
      // PostCSS 配置
      postcss: {
        plugins: isProduction ? [
          // 生产环境CSS优化插件可以在这里添加
        ] : []
      }
    }
  };
});
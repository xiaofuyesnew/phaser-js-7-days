import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    // 测试环境
    environment: 'jsdom',
    
    // 全局设置
    globals: true,
    
    // 测试文件匹配模式
    include: ['tests/**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}'],
    
    // 排除文件
    exclude: [
      'node_modules',
      'dist',
      '.git',
      'tests/browser.spec.js' // Playwright 测试文件
    ],
    
    // 超时设置
    testTimeout: 10000,
    hookTimeout: 10000,
    
    // 报告配置
    reporter: [
      'verbose',
      'json',
      'html'
    ],
    
    // 输出配置
    outputFile: {
      json: 'reports/vitest-results.json',
      html: 'reports/vitest-report.html'
    },
    
    // 覆盖率配置
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      reportsDirectory: 'reports/coverage',
      exclude: [
        'node_modules/',
        'tests/',
        'reports/',
        '**/*.config.js'
      ]
    },
    
    // 设置文件
    setupFiles: ['./tests/setup.js']
  }
});
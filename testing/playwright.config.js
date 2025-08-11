import { defineConfig, devices } from '@playwright/test';

/**
 * Playwright 配置文件
 * 用于多浏览器兼容性测试
 */
export default defineConfig({
  testDir: './tests',
  
  // 全局超时设置
  timeout: 30 * 1000,
  expect: {
    timeout: 5000,
  },
  
  // 失败重试次数
  retries: process.env.CI ? 2 : 0,
  
  // 并行执行的 worker 数量
  workers: process.env.CI ? 1 : undefined,
  
  // 报告配置
  reporter: [
    ['html', { outputFolder: 'reports/playwright-report' }],
    ['json', { outputFile: 'reports/playwright-results.json' }],
    ['list']
  ],
  
  // 全局设置
  use: {
    // 基础 URL
    baseURL: 'http://localhost:5173',
    
    // 截图设置
    screenshot: 'only-on-failure',
    
    // 视频录制
    video: 'retain-on-failure',
    
    // 追踪设置
    trace: 'on-first-retry',
    
    // 浏览器上下文设置
    viewport: { width: 1280, height: 720 },
    ignoreHTTPSErrors: true,
  },

  // 项目配置 - 不同浏览器和设备
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },
    
    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
    },
    
    // 移动设备测试
    {
      name: 'Mobile Chrome',
      use: { ...devices['Pixel 5'] },
    },
    
    {
      name: 'Mobile Safari',
      use: { ...devices['iPhone 12'] },
    },
    
    // 平板设备测试
    {
      name: 'iPad',
      use: { ...devices['iPad Pro'] },
    },
    
    // 不同分辨率测试
    {
      name: '1920x1080',
      use: {
        ...devices['Desktop Chrome'],
        viewport: { width: 1920, height: 1080 },
      },
    },
    
    {
      name: '1366x768',
      use: {
        ...devices['Desktop Chrome'],
        viewport: { width: 1366, height: 768 },
      },
    },
  ],

  // 开发服务器配置
  webServer: {
    command: 'npm run dev',
    port: 5173,
    reuseExistingServer: !process.env.CI,
    timeout: 120 * 1000,
  },
});
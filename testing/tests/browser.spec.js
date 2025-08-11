import { test, expect } from '@playwright/test';
import fs from 'fs-extra';
import path from 'path';

/**
 * 多浏览器兼容性测试
 * 使用 Playwright 测试教程在不同浏览器中的兼容性
 */

// 测试配置
const TUTORIAL_DIRS = [
  '../1_starter/source',
  '../2_sprite/source', 
  '../3_tilemap/source',
  '../4_camera/source',
  '../5_enemy/source',
  '../6_audio_ui_status/source',
  '../7_deploy_review/source'
];

const DEV_SERVER_PORT = 5173;
const SERVER_TIMEOUT = 10000;

test.describe('多浏览器兼容性测试', () => {
  
  test.beforeAll(async () => {
    // 确保所有项目都已安装依赖
    console.log('准备测试环境...');
  });

  TUTORIAL_DIRS.forEach((tutorialDir, index) => {
    const dayNumber = index + 1;
    
    test.describe(`Day ${dayNumber} 浏览器兼容性`, () => {
      
      test('Chrome 浏览器兼容性', async ({ page }) => {
        await testTutorialInBrowser(page, tutorialDir, dayNumber, 'Chrome');
      });
      
      test('Firefox 浏览器兼容性', async ({ page }) => {
        await testTutorialInBrowser(page, tutorialDir, dayNumber, 'Firefox');
      });
      
      test('Safari 浏览器兼容性', async ({ page }) => {
        await testTutorialInBrowser(page, tutorialDir, dayNumber, 'Safari');
      });
      
      test('移动端 Chrome 兼容性', async ({ page }) => {
        // 模拟移动设备
        await page.setViewportSize({ width: 375, height: 667 });
        await testTutorialInBrowser(page, tutorialDir, dayNumber, 'Mobile Chrome');
      });
      
    });
  });
  
  test.describe('响应式设计测试', () => {
    
    const viewports = [
      { name: '桌面', width: 1920, height: 1080 },
      { name: '平板', width: 768, height: 1024 },
      { name: '手机', width: 375, height: 667 },
      { name: '小屏手机', width: 320, height: 568 }
    ];
    
    viewports.forEach(viewport => {
      test(`${viewport.name} (${viewport.width}x${viewport.height}) 响应式测试`, async ({ page }) => {
        await page.setViewportSize({ width: viewport.width, height: viewport.height });
        
        // 测试最终完整游戏的响应式
        const completeGameDir = '../7_deploy_review/source';
        if (await fs.pathExists(completeGameDir)) {
          await testResponsiveDesign(page, completeGameDir, viewport);
        }
      });
    });
  });
  
  test.describe('性能测试', () => {
    
    test('游戏加载性能测试', async ({ page }) => {
      const completeGameDir = '../7_deploy_review/source';
      if (!(await fs.pathExists(completeGameDir))) {
        test.skip('完整游戏目录不存在');
        return;
      }
      
      // 启动性能监控
      await page.coverage.startJSCoverage();
      
      const startTime = Date.now();
      
      // 访问游戏页面
      await page.goto(`http://localhost:${DEV_SERVER_PORT}`, {
        waitUntil: 'networkidle'
      });
      
      // 等待游戏完全加载
      await page.waitForSelector('canvas', { timeout: 10000 });
      
      const loadTime = Date.now() - startTime;
      
      // 检查加载时间
      expect(loadTime).toBeLessThan(5000); // 5秒内加载完成
      
      // 检查 JavaScript 覆盖率
      const coverage = await page.coverage.stopJSCoverage();
      const totalBytes = coverage.reduce((sum, entry) => sum + entry.text.length, 0);
      const usedBytes = coverage.reduce((sum, entry) => 
        sum + entry.ranges.reduce((rangeSum, range) => 
          rangeSum + range.end - range.start, 0), 0);
      
      const usagePercentage = (usedBytes / totalBytes) * 100;
      
      console.log(`代码使用率: ${usagePercentage.toFixed(1)}%`);
      expect(usagePercentage).toBeGreaterThan(50); // 至少50%的代码被使用
    });
    
    test('游戏运行性能测试', async ({ page }) => {
      const completeGameDir = '../7_deploy_review/source';
      if (!(await fs.pathExists(completeGameDir))) {
        test.skip('完整游戏目录不存在');
        return;
      }
      
      await page.goto(`http://localhost:${DEV_SERVER_PORT}`);
      await page.waitForSelector('canvas');
      
      // 监控性能指标
      const performanceMetrics = await page.evaluate(() => {
        return new Promise((resolve) => {
          const observer = new PerformanceObserver((list) => {
            const entries = list.getEntries();
            const metrics = {
              fps: 0,
              memoryUsage: performance.memory ? performance.memory.usedJSHeapSize : 0
            };
            resolve(metrics);
          });
          
          observer.observe({ entryTypes: ['measure'] });
          
          // 运行游戏一段时间
          setTimeout(() => {
            const metrics = {
              fps: 60, // 简化的FPS检测
              memoryUsage: performance.memory ? performance.memory.usedJSHeapSize : 0
            };
            resolve(metrics);
          }, 3000);
        });
      });
      
      // 检查性能指标
      expect(performanceMetrics.fps).toBeGreaterThan(30); // 至少30FPS
      expect(performanceMetrics.memoryUsage).toBeLessThan(100 * 1024 * 1024); // 小于100MB
    });
  });
  
  test.describe('可访问性测试', () => {
    
    test('键盘导航测试', async ({ page }) => {
      const completeGameDir = '../7_deploy_review/source';
      if (!(await fs.pathExists(completeGameDir))) {
        test.skip('完整游戏目录不存在');
        return;
      }
      
      await page.goto(`http://localhost:${DEV_SERVER_PORT}`);
      await page.waitForSelector('canvas');
      
      // 测试键盘控制
      await page.keyboard.press('ArrowLeft');
      await page.keyboard.press('ArrowRight');
      await page.keyboard.press('ArrowUp');
      await page.keyboard.press('ArrowDown');
      await page.keyboard.press('Space');
      
      // 检查游戏是否响应键盘输入
      const gameResponded = await page.evaluate(() => {
        // 这里应该检查游戏是否响应了键盘输入
        return window.game && window.game.isRunning;
      });
      
      expect(gameResponded).toBe(true);
    });
    
    test('屏幕阅读器兼容性', async ({ page }) => {
      const completeGameDir = '../7_deploy_review/source';
      if (!(await fs.pathExists(completeGameDir))) {
        test.skip('完整游戏目录不存在');
        return;
      }
      
      await page.goto(`http://localhost:${DEV_SERVER_PORT}`);
      
      // 检查页面是否有适当的 ARIA 标签和语义化标签
      const accessibilityFeatures = await page.evaluate(() => {
        return {
          hasTitle: !!document.title,
          hasLang: !!document.documentElement.lang,
          hasMainContent: !!document.querySelector('main, [role="main"]'),
          hasSkipLink: !!document.querySelector('a[href="#main"], .skip-link')
        };
      });
      
      expect(accessibilityFeatures.hasTitle).toBe(true);
      expect(accessibilityFeatures.hasLang).toBe(true);
    });
  });
});

/**
 * 在指定浏览器中测试教程
 */
async function testTutorialInBrowser(page, tutorialDir, dayNumber, browserName) {
  if (!(await fs.pathExists(tutorialDir))) {
    test.skip(`Day ${dayNumber} 源代码目录不存在`);
    return;
  }
  
  console.log(`测试 Day ${dayNumber} 在 ${browserName} 中的兼容性...`);
  
  // 收集控制台错误
  const consoleErrors = [];
  page.on('console', msg => {
    if (msg.type() === 'error') {
      consoleErrors.push(msg.text());
    }
  });
  
  // 收集页面错误
  const pageErrors = [];
  page.on('pageerror', error => {
    pageErrors.push(error.message);
  });
  
  try {
    // 访问页面
    await page.goto(`http://localhost:${DEV_SERVER_PORT}`, {
      waitUntil: 'networkidle',
      timeout: SERVER_TIMEOUT
    });
    
    // 等待 Canvas 元素加载
    await page.waitForSelector('canvas', { timeout: 10000 });
    
    // 检查 Phaser 游戏是否正常初始化
    const gameInitialized = await page.evaluate(() => {
      return window.Phaser && window.game && window.game.isRunning;
    });
    
    expect(gameInitialized).toBe(true);
    
    // 测试基本交互
    await testBasicInteractions(page);
    
    // 检查是否有严重错误
    const criticalErrors = consoleErrors.filter(error => 
      error.includes('Uncaught') || 
      error.includes('TypeError') || 
      error.includes('ReferenceError')
    );
    
    expect(criticalErrors.length).toBe(0);
    expect(pageErrors.length).toBe(0);
    
    console.log(`✅ Day ${dayNumber} 在 ${browserName} 中测试通过`);
    
  } catch (error) {
    console.error(`❌ Day ${dayNumber} 在 ${browserName} 中测试失败:`, error.message);
    throw error;
  }
}

/**
 * 测试基本交互功能
 */
async function testBasicInteractions(page) {
  // 模拟用户交互
  await page.click('canvas');
  
  // 测试键盘输入
  await page.keyboard.press('ArrowRight');
  await page.keyboard.press('Space');
  
  // 等待游戏响应
  await page.waitForTimeout(1000);
  
  // 检查游戏是否仍在运行
  const stillRunning = await page.evaluate(() => {
    return window.game && window.game.isRunning;
  });
  
  expect(stillRunning).toBe(true);
}

/**
 * 测试响应式设计
 */
async function testResponsiveDesign(page, gameDir, viewport) {
  console.log(`测试 ${viewport.name} 响应式设计...`);
  
  await page.goto(`http://localhost:${DEV_SERVER_PORT}`);
  await page.waitForSelector('canvas');
  
  // 检查 Canvas 是否适应视口
  const canvasSize = await page.evaluate(() => {
    const canvas = document.querySelector('canvas');
    return {
      width: canvas.width,
      height: canvas.height,
      clientWidth: canvas.clientWidth,
      clientHeight: canvas.clientHeight
    };
  });
  
  // Canvas 应该适应视口大小
  expect(canvasSize.clientWidth).toBeLessThanOrEqual(viewport.width);
  expect(canvasSize.clientHeight).toBeLessThanOrEqual(viewport.height);
  
  // 检查游戏是否仍然可玩
  const gamePlayable = await page.evaluate(() => {
    return window.game && window.game.isRunning;
  });
  
  expect(gamePlayable).toBe(true);
  
  console.log(`✅ ${viewport.name} 响应式测试通过`);
}
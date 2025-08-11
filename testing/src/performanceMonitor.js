#!/usr/bin/env node

import fs from 'fs-extra';
import path from 'path';
import puppeteer from 'puppeteer';
import chalk from 'chalk';
import { spawn } from 'child_process';

/**
 * 游戏性能监控和分析工具
 * 监控 Phaser.js 游戏的性能指标
 */
class PerformanceMonitor {
  constructor() {
    this.browser = null;
    this.metrics = {
      loadTime: {},
      runtime: {},
      memory: {},
      fps: {},
      resources: {}
    };
    this.thresholds = {
      loadTime: 5000, // 5秒
      fps: 30, // 30 FPS
      memory: 100 * 1024 * 1024, // 100MB
      jsHeapSize: 50 * 1024 * 1024 // 50MB
    };
  }

  /**
   * 监控所有教程的性能
   */
  async monitorAll() {
    console.log(chalk.blue('🔍 开始性能监控...'));
    
    try {
      // 启动浏览器
      this.browser = await puppeteer.launch({
        headless: 'new',
        args: [
          '--no-sandbox',
          '--disable-setuid-sandbox',
          '--disable-dev-shm-usage',
          '--disable-gpu',
          '--enable-precise-memory-info'
        ]
      });
      
      // 监控每日教程
      await this.monitorDailyTutorials();
      
      // 监控完整游戏
      await this.monitorCompleteGame();
      
      // 生成性能报告
      this.generatePerformanceReport();
      
    } finally {
      if (this.browser) {
        await this.browser.close();
      }
    }
  }

  /**
   * 监控每日教程性能
   */
  async monitorDailyTutorials() {
    const tutorialDirs = [
      '../1_starter/source',
      '../2_sprite/source',
      '../3_tilemap/source',
      '../4_camera/source',
      '../5_enemy/source',
      '../6_audio_ui_status/source',
      '../7_deploy_review/source'
    ];
    
    for (let i = 0; i < tutorialDirs.length; i++) {
      const dir = tutorialDirs[i];
      const dayNumber = i + 1;
      
      if (await fs.pathExists(dir)) {
        await this.monitorTutorial(dir, dayNumber);
      }
    }
  }

  /**
   * 监控单个教程性能
   */
  async monitorTutorial(tutorialDir, dayNumber) {
    console.log(chalk.yellow(`📊 监控 Day ${dayNumber} 性能...`));
    
    try {
      // 启动开发服务器
      const server = await this.startDevServer(tutorialDir);
      
      try {
        // 等待服务器启动
        await new Promise(resolve => setTimeout(resolve, 3000));
        
        // 创建新页面
        const page = await this.browser.newPage();
        
        // 启用性能监控
        await page.setCacheEnabled(false);
        await page.coverage.startJSCoverage();
        await page.coverage.startCSSCoverage();
        
        // 监控加载性能
        const loadMetrics = await this.measureLoadPerformance(page, dayNumber);
        this.metrics.loadTime[`day${dayNumber}`] = loadMetrics;
        
        // 监控运行时性能
        const runtimeMetrics = await this.measureRuntimePerformance(page, dayNumber);
        this.metrics.runtime[`day${dayNumber}`] = runtimeMetrics;
        
        // 监控内存使用
        const memoryMetrics = await this.measureMemoryUsage(page, dayNumber);
        this.metrics.memory[`day${dayNumber}`] = memoryMetrics;
        
        // 监控 FPS
        const fpsMetrics = await this.measureFPS(page, dayNumber);
        this.metrics.fps[`day${dayNumber}`] = fpsMetrics;
        
        // 监控资源使用
        const resourceMetrics = await this.measureResourceUsage(page, dayNumber);
        this.metrics.resources[`day${dayNumber}`] = resourceMetrics;
        
        await page.close();
        
      } finally {
        if (server) {
          server.kill();
        }
      }
      
    } catch (error) {
      console.error(chalk.red(`❌ Day ${dayNumber} 性能监控失败: ${error.message}`));
      this.metrics.loadTime[`day${dayNumber}`] = { error: error.message };
    }
  }

  /**
   * 测量加载性能
   */
  async measureLoadPerformance(page, dayNumber) {
    console.log(chalk.gray(`  ⏱️  测量 Day ${dayNumber} 加载性能...`));
    
    const startTime = Date.now();
    
    // 监听网络请求
    const requests = [];
    page.on('request', request => {
      requests.push({
        url: request.url(),
        method: request.method(),
        resourceType: request.resourceType(),
        timestamp: Date.now()
      });
    });
    
    // 访问页面
    const response = await page.goto('http://localhost:5173', {
      waitUntil: 'networkidle0',
      timeout: 30000
    });
    
    // 等待 Canvas 加载
    await page.waitForSelector('canvas', { timeout: 10000 });
    
    const loadTime = Date.now() - startTime;
    
    // 获取性能指标
    const performanceMetrics = await page.evaluate(() => {
      const navigation = performance.getEntriesByType('navigation')[0];
      return {
        domContentLoaded: navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart,
        loadComplete: navigation.loadEventEnd - navigation.loadEventStart,
        firstPaint: performance.getEntriesByName('first-paint')[0]?.startTime || 0,
        firstContentfulPaint: performance.getEntriesByName('first-contentful-paint')[0]?.startTime || 0
      };
    });
    
    return {
      totalLoadTime: loadTime,
      domContentLoaded: performanceMetrics.domContentLoaded,
      loadComplete: performanceMetrics.loadComplete,
      firstPaint: performanceMetrics.firstPaint,
      firstContentfulPaint: performanceMetrics.firstContentfulPaint,
      requestCount: requests.length,
      status: response.status(),
      passed: loadTime < this.thresholds.loadTime
    };
  }

  /**
   * 测量运行时性能
   */
  async measureRuntimePerformance(page, dayNumber) {
    console.log(chalk.gray(`  🏃 测量 Day ${dayNumber} 运行时性能...`));
    
    // 等待游戏初始化
    await page.waitForFunction(() => {
      return window.game && window.game.isRunning;
    }, { timeout: 10000 });
    
    // 模拟用户交互
    await this.simulateUserInteraction(page);
    
    // 测量性能指标
    const metrics = await page.evaluate(() => {
      return new Promise((resolve) => {
        const startTime = performance.now();
        let frameCount = 0;
        let totalFrameTime = 0;
        
        function measureFrame() {
          const frameTime = performance.now();
          frameCount++;
          totalFrameTime += frameTime - startTime;
          
          if (frameCount >= 60) { // 测量60帧
            resolve({
              averageFrameTime: totalFrameTime / frameCount,
              frameCount: frameCount,
              gameRunning: window.game && window.game.isRunning,
              sceneActive: window.game && window.game.scene && window.game.scene.isActive()
            });
          } else {
            requestAnimationFrame(measureFrame);
          }
        }
        
        requestAnimationFrame(measureFrame);
      });
    });
    
    return {
      averageFrameTime: metrics.averageFrameTime,
      estimatedFPS: 1000 / metrics.averageFrameTime,
      frameCount: metrics.frameCount,
      gameRunning: metrics.gameRunning,
      sceneActive: metrics.sceneActive,
      passed: (1000 / metrics.averageFrameTime) >= this.thresholds.fps
    };
  }

  /**
   * 测量内存使用
   */
  async measureMemoryUsage(page, dayNumber) {
    console.log(chalk.gray(`  💾 测量 Day ${dayNumber} 内存使用...`));
    
    // 运行游戏一段时间
    await new Promise(resolve => setTimeout(resolve, 5000));
    
    const memoryMetrics = await page.evaluate(() => {
      if (performance.memory) {
        return {
          usedJSHeapSize: performance.memory.usedJSHeapSize,
          totalJSHeapSize: performance.memory.totalJSHeapSize,
          jsHeapSizeLimit: performance.memory.jsHeapSizeLimit
        };
      }
      return null;
    });
    
    // 强制垃圾回收（如果可能）
    await page.evaluate(() => {
      if (window.gc) {
        window.gc();
      }
    });
    
    const memoryAfterGC = await page.evaluate(() => {
      if (performance.memory) {
        return {
          usedJSHeapSize: performance.memory.usedJSHeapSize,
          totalJSHeapSize: performance.memory.totalJSHeapSize
        };
      }
      return null;
    });
    
    return {
      beforeGC: memoryMetrics,
      afterGC: memoryAfterGC,
      memoryLeakSuspected: memoryAfterGC && memoryMetrics && 
        (memoryAfterGC.usedJSHeapSize > memoryMetrics.usedJSHeapSize * 0.9),
      passed: memoryMetrics && memoryMetrics.usedJSHeapSize < this.thresholds.jsHeapSize
    };
  }

  /**
   * 测量 FPS
   */
  async measureFPS(page, dayNumber) {
    console.log(chalk.gray(`  🎮 测量 Day ${dayNumber} FPS...`));
    
    const fpsData = await page.evaluate(() => {
      return new Promise((resolve) => {
        const samples = [];
        let lastTime = performance.now();
        let sampleCount = 0;
        const maxSamples = 120; // 2秒的样本（60fps）
        
        function measureFPS() {
          const currentTime = performance.now();
          const delta = currentTime - lastTime;
          const fps = 1000 / delta;
          
          samples.push(fps);
          lastTime = currentTime;
          sampleCount++;
          
          if (sampleCount >= maxSamples) {
            const avgFPS = samples.reduce((a, b) => a + b, 0) / samples.length;
            const minFPS = Math.min(...samples);
            const maxFPS = Math.max(...samples);
            const stableFPS = samples.filter(fps => fps >= avgFPS * 0.9).length / samples.length;
            
            resolve({
              averageFPS: avgFPS,
              minFPS: minFPS,
              maxFPS: maxFPS,
              stability: stableFPS,
              samples: samples.length
            });
          } else {
            requestAnimationFrame(measureFPS);
          }
        }
        
        requestAnimationFrame(measureFPS);
      });
    });
    
    return {
      ...fpsData,
      passed: fpsData.averageFPS >= this.thresholds.fps,
      stable: fpsData.stability > 0.8 // 80% 的帧数应该稳定
    };
  }

  /**
   * 测量资源使用
   */
  async measureResourceUsage(page, dayNumber) {
    console.log(chalk.gray(`  📦 测量 Day ${dayNumber} 资源使用...`));
    
    // 停止覆盖率收集
    const jsCoverage = await page.coverage.stopJSCoverage();
    const cssCoverage = await page.coverage.stopCSSCoverage();
    
    // 计算代码覆盖率
    const jsStats = this.calculateCoverageStats(jsCoverage);
    const cssStats = this.calculateCoverageStats(cssCoverage);
    
    // 获取网络资源信息
    const resourceTiming = await page.evaluate(() => {
      const resources = performance.getEntriesByType('resource');
      return resources.map(resource => ({
        name: resource.name,
        size: resource.transferSize || resource.encodedBodySize,
        duration: resource.duration,
        type: resource.initiatorType
      }));
    });
    
    const totalResourceSize = resourceTiming.reduce((sum, resource) => sum + (resource.size || 0), 0);
    
    return {
      javascript: jsStats,
      css: cssStats,
      resources: {
        count: resourceTiming.length,
        totalSize: totalResourceSize,
        averageLoadTime: resourceTiming.reduce((sum, r) => sum + r.duration, 0) / resourceTiming.length,
        byType: this.groupResourcesByType(resourceTiming)
      },
      passed: totalResourceSize < this.thresholds.memory
    };
  }

  /**
   * 计算覆盖率统计
   */
  calculateCoverageStats(coverage) {
    let totalBytes = 0;
    let usedBytes = 0;
    
    for (const entry of coverage) {
      totalBytes += entry.text.length;
      for (const range of entry.ranges) {
        usedBytes += range.end - range.start;
      }
    }
    
    return {
      totalBytes,
      usedBytes,
      unusedBytes: totalBytes - usedBytes,
      usagePercentage: totalBytes > 0 ? (usedBytes / totalBytes) * 100 : 0
    };
  }

  /**
   * 按类型分组资源
   */
  groupResourcesByType(resources) {
    const grouped = {};
    
    for (const resource of resources) {
      const type = resource.type || 'other';
      if (!grouped[type]) {
        grouped[type] = {
          count: 0,
          totalSize: 0,
          totalDuration: 0
        };
      }
      
      grouped[type].count++;
      grouped[type].totalSize += resource.size || 0;
      grouped[type].totalDuration += resource.duration || 0;
    }
    
    return grouped;
  }

  /**
   * 模拟用户交互
   */
  async simulateUserInteraction(page) {
    // 点击 Canvas
    await page.click('canvas');
    
    // 模拟键盘输入
    const keys = ['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', 'Space'];
    
    for (const key of keys) {
      await page.keyboard.press(key);
      await new Promise(resolve => setTimeout(resolve, 100));
    }
    
    // 模拟鼠标移动
    await page.mouse.move(100, 100);
    await page.mouse.move(200, 200);
    await page.mouse.click(150, 150);
  }

  /**
   * 监控完整游戏
   */
  async monitorCompleteGame() {
    console.log(chalk.yellow('🎮 监控完整游戏性能...'));
    
    const completeGameDir = '../7_deploy_review/source';
    if (await fs.pathExists(completeGameDir)) {
      await this.monitorTutorial(completeGameDir, 'complete');
    }
  }

  /**
   * 启动开发服务器
   */
  async startDevServer(sourcePath) {
    return new Promise((resolve, reject) => {
      const server = spawn('npm', ['run', 'dev'], {
        cwd: sourcePath,
        stdio: 'pipe',
        shell: true
      });
      
      let started = false;
      
      server.stdout.on('data', (data) => {
        const output = data.toString();
        if ((output.includes('Local:') || output.includes('localhost')) && !started) {
          started = true;
          resolve(server);
        }
      });
      
      server.stderr.on('data', (data) => {
        const error = data.toString();
        if (!started && error.includes('EADDRINUSE')) {
          // 端口已被占用，尝试使用现有服务器
          started = true;
          resolve(null);
        }
      });
      
      server.on('error', reject);
      
      // 超时处理
      setTimeout(() => {
        if (!started) {
          server.kill();
          reject(new Error('开发服务器启动超时'));
        }
      }, 15000);
    });
  }

  /**
   * 生成性能报告
   */
  generatePerformanceReport() {
    console.log(chalk.blue('\n📊 性能监控报告'));
    console.log('='.repeat(60));
    
    // 加载时间报告
    console.log(chalk.green('\n⏱️  加载性能:'));
    Object.entries(this.metrics.loadTime).forEach(([day, metrics]) => {
      if (metrics.error) {
        console.log(chalk.red(`  ${day}: 错误 - ${metrics.error}`));
      } else {
        const status = metrics.passed ? '✅' : '❌';
        console.log(`  ${status} ${day}: ${metrics.totalLoadTime}ms (阈值: ${this.thresholds.loadTime}ms)`);
        console.log(`    - DOM加载: ${metrics.domContentLoaded.toFixed(1)}ms`);
        console.log(`    - 首次绘制: ${metrics.firstPaint.toFixed(1)}ms`);
        console.log(`    - 请求数量: ${metrics.requestCount}`);
      }
    });
    
    // FPS 报告
    console.log(chalk.green('\n🎮 FPS 性能:'));
    Object.entries(this.metrics.fps).forEach(([day, metrics]) => {
      if (metrics) {
        const status = metrics.passed ? '✅' : '❌';
        const stability = metrics.stable ? '🟢' : '🟡';
        console.log(`  ${status} ${day}: ${metrics.averageFPS.toFixed(1)} FPS (阈值: ${this.thresholds.fps} FPS)`);
        console.log(`    ${stability} 稳定性: ${(metrics.stability * 100).toFixed(1)}%`);
        console.log(`    - 最小FPS: ${metrics.minFPS.toFixed(1)}`);
        console.log(`    - 最大FPS: ${metrics.maxFPS.toFixed(1)}`);
      }
    });
    
    // 内存使用报告
    console.log(chalk.green('\n💾 内存使用:'));
    Object.entries(this.metrics.memory).forEach(([day, metrics]) => {
      if (metrics && metrics.beforeGC) {
        const status = metrics.passed ? '✅' : '❌';
        const leakStatus = metrics.memoryLeakSuspected ? '⚠️' : '✅';
        const usedMB = (metrics.beforeGC.usedJSHeapSize / 1024 / 1024).toFixed(1);
        console.log(`  ${status} ${day}: ${usedMB}MB (阈值: ${this.thresholds.jsHeapSize / 1024 / 1024}MB)`);
        console.log(`    ${leakStatus} 内存泄漏检测: ${metrics.memoryLeakSuspected ? '可能存在' : '正常'}`);
      }
    });
    
    // 资源使用报告
    console.log(chalk.green('\n📦 资源使用:'));
    Object.entries(this.metrics.resources).forEach(([day, metrics]) => {
      if (metrics) {
        const status = metrics.passed ? '✅' : '❌';
        const totalSizeMB = (metrics.resources.totalSize / 1024 / 1024).toFixed(1);
        console.log(`  ${status} ${day}: ${totalSizeMB}MB, ${metrics.resources.count} 个资源`);
        console.log(`    - JS 代码使用率: ${metrics.javascript.usagePercentage.toFixed(1)}%`);
        console.log(`    - CSS 代码使用率: ${metrics.css.usagePercentage.toFixed(1)}%`);
      }
    });
    
    // 总体评分
    const overallScore = this.calculateOverallPerformanceScore();
    console.log(chalk.blue(`\n🎯 总体性能评分: ${overallScore}/100`));
    
    // 保存报告
    this.savePerformanceReport();
  }

  /**
   * 计算总体性能评分
   */
  calculateOverallPerformanceScore() {
    let totalScore = 0;
    let testCount = 0;
    
    // 加载时间评分
    Object.values(this.metrics.loadTime).forEach(metrics => {
      if (!metrics.error) {
        totalScore += metrics.passed ? 25 : 0;
        testCount++;
      }
    });
    
    // FPS 评分
    Object.values(this.metrics.fps).forEach(metrics => {
      if (metrics) {
        totalScore += metrics.passed ? 25 : 0;
        totalScore += metrics.stable ? 10 : 0;
        testCount++;
      }
    });
    
    // 内存评分
    Object.values(this.metrics.memory).forEach(metrics => {
      if (metrics && metrics.beforeGC) {
        totalScore += metrics.passed ? 20 : 0;
        totalScore += !metrics.memoryLeakSuspected ? 10 : 0;
        testCount++;
      }
    });
    
    // 资源评分
    Object.values(this.metrics.resources).forEach(metrics => {
      if (metrics) {
        totalScore += metrics.passed ? 10 : 0;
        testCount++;
      }
    });
    
    return testCount > 0 ? Math.round(totalScore / testCount) : 0;
  }

  /**
   * 保存性能报告
   */
  async savePerformanceReport() {
    const report = {
      timestamp: new Date().toISOString(),
      metrics: this.metrics,
      thresholds: this.thresholds,
      overallScore: this.calculateOverallPerformanceScore()
    };
    
    await fs.ensureDir('reports');
    await fs.writeJson('reports/performance-monitoring.json', report, { spaces: 2 });
    
    console.log(chalk.blue('\n💾 性能报告已保存到 reports/performance-monitoring.json'));
  }
}

// 运行性能监控
if (import.meta.url === `file://${process.argv[1]}`) {
  const monitor = new PerformanceMonitor();
  monitor.monitorAll().catch(console.error);
}

export default PerformanceMonitor;
#!/usr/bin/env node

import fs from 'fs-extra';
import path from 'path';
import chalk from 'chalk';
import puppeteer from 'puppeteer';
import { spawn } from 'child_process';

/**
 * 自动化性能测试和报告系统
 * 自动化测试教程项目的性能并生成详细报告
 */
class PerformanceTester {
  constructor() {
    this.browser = null;
    this.testResults = [];
    this.benchmarks = {
      loadTime: 3000, // 3秒
      fps: 45, // 45 FPS
      memoryUsage: 50 * 1024 * 1024, // 50MB
      bundleSize: 2 * 1024 * 1024, // 2MB
      firstContentfulPaint: 1500, // 1.5秒
      largestContentfulPaint: 2500, // 2.5秒
      cumulativeLayoutShift: 0.1,
      firstInputDelay: 100 // 100ms
    };
  }

  /**
   * 运行所有性能测试
   */
  async runAllTests() {
    console.log(chalk.blue('🚀 开始自动化性能测试...'));
    
    try {
      // 启动浏览器
      this.browser = await puppeteer.launch({
        headless: 'new',
        args: [
          '--no-sandbox',
          '--disable-setuid-sandbox',
          '--disable-dev-shm-usage',
          '--enable-precise-memory-info'
        ]
      });
      
      // 测试每日教程
      await this.testDailyTutorials();
      
      // 运行压力测试
      await this.runStressTests();
      
      // 运行长时间运行测试
      await this.runLongRunningTests();
      
      // 生成性能报告
      this.generatePerformanceReport();
      
    } finally {
      if (this.browser) {
        await this.browser.close();
      }
    }
  }

  /**
   * 测试每日教程性能
   */
  async testDailyTutorials() {
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
        await this.testTutorialPerformance(dir, dayNumber);
      }
    }
  }

  /**
   * 测试单个教程性能
   */
  async testTutorialPerformance(tutorialDir, dayNumber) {
    console.log(chalk.yellow(`📊 测试 Day ${dayNumber} 性能...`));
    
    const testResult = {
      day: dayNumber,
      timestamp: new Date().toISOString(),
      tests: {},
      overall: {
        score: 0,
        grade: 'F',
        passed: false
      }
    };
    
    try {
      // 启动开发服务器
      const server = await this.startDevServer(tutorialDir);
      
      try {
        // 等待服务器启动
        await new Promise(resolve => setTimeout(resolve, 3000));
        
        // 运行各项性能测试
        testResult.tests.loadPerformance = await this.testLoadPerformance(dayNumber);
        testResult.tests.runtimePerformance = await this.testRuntimePerformance(dayNumber);
        testResult.tests.memoryPerformance = await this.testMemoryPerformance(dayNumber);
        testResult.tests.webVitals = await this.testWebVitals(dayNumber);
        testResult.tests.bundleAnalysis = await this.analyzeBundleSize(tutorialDir, dayNumber);
        
        // 计算总体评分
        this.calculateOverallScore(testResult);
        
      } finally {
        if (server) {
          server.kill();
        }
      }
      
    } catch (error) {
      testResult.error = error.message;
      console.error(chalk.red(`❌ Day ${dayNumber} 性能测试失败: ${error.message}`));
    }
    
    this.testResults.push(testResult);
  }

  /**
   * 测试加载性能
   */
  async testLoadPerformance(dayNumber) {
    console.log(chalk.gray(`  ⏱️  测试 Day ${dayNumber} 加载性能...`));
    
    const page = await this.browser.newPage();
    
    try {
      // 清除缓存
      await page.setCacheEnabled(false);
      
      const startTime = Date.now();
      
      // 监听网络请求
      const requests = [];
      page.on('request', request => {
        requests.push({
          url: request.url(),
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
      
      // 获取详细的性能指标
      const performanceMetrics = await page.evaluate(() => {
        const navigation = performance.getEntriesByType('navigation')[0];
        const paint = performance.getEntriesByType('paint');
        
        return {
          domContentLoaded: navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart,
          loadComplete: navigation.loadEventEnd - navigation.loadEventStart,
          firstPaint: paint.find(p => p.name === 'first-paint')?.startTime || 0,
          firstContentfulPaint: paint.find(p => p.name === 'first-contentful-paint')?.startTime || 0,
          domInteractive: navigation.domInteractive - navigation.navigationStart,
          domComplete: navigation.domComplete - navigation.navigationStart
        };
      });
      
      return {
        totalLoadTime: loadTime,
        ...performanceMetrics,
        requestCount: requests.length,
        resourceBreakdown: this.analyzeResourceTypes(requests),
        passed: loadTime < this.benchmarks.loadTime,
        score: this.calculateLoadScore(loadTime, performanceMetrics)
      };
      
    } finally {
      await page.close();
    }
  }

  /**
   * 分析资源类型
   */
  analyzeResourceTypes(requests) {
    const breakdown = {};
    
    requests.forEach(request => {
      const type = request.resourceType;
      if (!breakdown[type]) {
        breakdown[type] = 0;
      }
      breakdown[type]++;
    });
    
    return breakdown;
  }

  /**
   * 计算加载评分
   */
  calculateLoadScore(loadTime, metrics) {
    let score = 100;
    
    // 总加载时间评分
    if (loadTime > this.benchmarks.loadTime) {
      score -= Math.min(50, (loadTime - this.benchmarks.loadTime) / 100);
    }
    
    // 首次内容绘制评分
    if (metrics.firstContentfulPaint > this.benchmarks.firstContentfulPaint) {
      score -= Math.min(20, (metrics.firstContentfulPaint - this.benchmarks.firstContentfulPaint) / 50);
    }
    
    // DOM 交互时间评分
    if (metrics.domInteractive > 2000) {
      score -= Math.min(15, (metrics.domInteractive - 2000) / 100);
    }
    
    return Math.max(0, Math.round(score));
  }

  /**
   * 测试运行时性能
   */
  async testRuntimePerformance(dayNumber) {
    console.log(chalk.gray(`  🏃 测试 Day ${dayNumber} 运行时性能...`));
    
    const page = await this.browser.newPage();
    
    try {
      await page.goto('http://localhost:5173', { waitUntil: 'networkidle0' });
      await page.waitForSelector('canvas', { timeout: 10000 });
      
      // 等待游戏初始化
      await page.waitForFunction(() => {
        return window.game && window.game.isRunning;
      }, { timeout: 10000 });
      
      // 模拟用户交互
      await this.simulateGameplay(page);
      
      // 测量 FPS
      const fpsMetrics = await this.measureFPS(page);
      
      // 测量帧时间稳定性
      const frameStability = await this.measureFrameStability(page);
      
      // 测量输入延迟
      const inputLatency = await this.measureInputLatency(page);
      
      return {
        fps: fpsMetrics,
        frameStability: frameStability,
        inputLatency: inputLatency,
        passed: fpsMetrics.average >= this.benchmarks.fps,
        score: this.calculateRuntimeScore(fpsMetrics, frameStability, inputLatency)
      };
      
    } finally {
      await page.close();
    }
  }

  /**
   * 模拟游戏玩法
   */
  async simulateGameplay(page) {
    // 模拟各种用户输入
    const actions = [
      () => page.keyboard.press('ArrowLeft'),
      () => page.keyboard.press('ArrowRight'),
      () => page.keyboard.press('ArrowUp'),
      () => page.keyboard.press('ArrowDown'),
      () => page.keyboard.press('Space'),
      () => page.mouse.click(200, 200),
      () => page.mouse.move(100, 100),
      () => page.mouse.move(300, 300)
    ];
    
    // 随机执行动作
    for (let i = 0; i < 20; i++) {
      const action = actions[Math.floor(Math.random() * actions.length)];
      await action();
      await new Promise(resolve => setTimeout(resolve, 100));
    }
  }

  /**
   * 测量 FPS
   */
  async measureFPS(page) {
    return await page.evaluate(() => {
      return new Promise((resolve) => {
        const samples = [];
        let lastTime = performance.now();
        let sampleCount = 0;
        const maxSamples = 180; // 3秒的样本
        
        function measureFrame() {
          const currentTime = performance.now();
          const delta = currentTime - lastTime;
          const fps = 1000 / delta;
          
          samples.push(fps);
          lastTime = currentTime;
          sampleCount++;
          
          if (sampleCount >= maxSamples) {
            const average = samples.reduce((a, b) => a + b, 0) / samples.length;
            const min = Math.min(...samples);
            const max = Math.max(...samples);
            const p95 = samples.sort((a, b) => a - b)[Math.floor(samples.length * 0.95)];
            
            resolve({
              average: average,
              min: min,
              max: max,
              p95: p95,
              samples: samples.length,
              stability: samples.filter(fps => fps >= average * 0.9).length / samples.length
            });
          } else {
            requestAnimationFrame(measureFrame);
          }
        }
        
        requestAnimationFrame(measureFrame);
      });
    });
  }

  /**
   * 测量帧时间稳定性
   */
  async measureFrameStability(page) {
    return await page.evaluate(() => {
      return new Promise((resolve) => {
        const frameTimes = [];
        let lastTime = performance.now();
        let frameCount = 0;
        const maxFrames = 120;
        
        function measureFrameTime() {
          const currentTime = performance.now();
          const frameTime = currentTime - lastTime;
          frameTimes.push(frameTime);
          lastTime = currentTime;
          frameCount++;
          
          if (frameCount >= maxFrames) {
            const average = frameTimes.reduce((a, b) => a + b, 0) / frameTimes.length;
            const variance = frameTimes.reduce((sum, time) => 
              sum + Math.pow(time - average, 2), 0) / frameTimes.length;
            const stdDev = Math.sqrt(variance);
            
            resolve({
              averageFrameTime: average,
              variance: variance,
              standardDeviation: stdDev,
              stability: stdDev < 5 // 标准差小于5ms认为稳定
            });
          } else {
            requestAnimationFrame(measureFrameTime);
          }
        }
        
        requestAnimationFrame(measureFrameTime);
      });
    });
  }

  /**
   * 测量输入延迟
   */
  async measureInputLatency(page) {
    const latencies = [];
    
    for (let i = 0; i < 10; i++) {
      const startTime = Date.now();
      
      await page.keyboard.press('Space');
      
      // 等待游戏响应（简化实现）
      await new Promise(resolve => setTimeout(resolve, 16)); // 一帧时间
      
      const endTime = Date.now();
      latencies.push(endTime - startTime);
    }
    
    const average = latencies.reduce((a, b) => a + b, 0) / latencies.length;
    
    return {
      average: average,
      min: Math.min(...latencies),
      max: Math.max(...latencies),
      samples: latencies,
      passed: average < this.benchmarks.firstInputDelay
    };
  }

  /**
   * 计算运行时评分
   */
  calculateRuntimeScore(fpsMetrics, frameStability, inputLatency) {
    let score = 100;
    
    // FPS 评分
    if (fpsMetrics.average < this.benchmarks.fps) {
      score -= Math.min(40, (this.benchmarks.fps - fpsMetrics.average) * 2);
    }
    
    // 帧稳定性评分
    if (!frameStability.stability) {
      score -= 20;
    }
    
    // 输入延迟评分
    if (!inputLatency.passed) {
      score -= Math.min(20, (inputLatency.average - this.benchmarks.firstInputDelay) / 5);
    }
    
    return Math.max(0, Math.round(score));
  }

  /**
   * 测试内存性能
   */
  async testMemoryPerformance(dayNumber) {
    console.log(chalk.gray(`  💾 测试 Day ${dayNumber} 内存性能...`));
    
    const page = await this.browser.newPage();
    
    try {
      await page.goto('http://localhost:5173', { waitUntil: 'networkidle0' });
      await page.waitForSelector('canvas', { timeout: 10000 });
      
      // 运行游戏一段时间
      await new Promise(resolve => setTimeout(resolve, 5000));
      
      // 测量初始内存
      const initialMemory = await this.getMemoryUsage(page);
      
      // 模拟游戏活动
      await this.simulateGameplay(page);
      
      // 再次测量内存
      const afterGameplayMemory = await this.getMemoryUsage(page);
      
      // 强制垃圾回收
      await page.evaluate(() => {
        if (window.gc) {
          window.gc();
        }
      });
      
      // 测量垃圾回收后的内存
      const afterGCMemory = await this.getMemoryUsage(page);
      
      const memoryLeak = afterGCMemory.usedJSHeapSize > initialMemory.usedJSHeapSize * 1.2;
      
      return {
        initial: initialMemory,
        afterGameplay: afterGameplayMemory,
        afterGC: afterGCMemory,
        memoryLeak: memoryLeak,
        passed: afterGameplayMemory.usedJSHeapSize < this.benchmarks.memoryUsage,
        score: this.calculateMemoryScore(initialMemory, afterGameplayMemory, memoryLeak)
      };
      
    } finally {
      await page.close();
    }
  }

  /**
   * 获取内存使用情况
   */
  async getMemoryUsage(page) {
    return await page.evaluate(() => {
      if (performance.memory) {
        return {
          usedJSHeapSize: performance.memory.usedJSHeapSize,
          totalJSHeapSize: performance.memory.totalJSHeapSize,
          jsHeapSizeLimit: performance.memory.jsHeapSizeLimit
        };
      }
      return null;
    });
  }

  /**
   * 计算内存评分
   */
  calculateMemoryScore(initial, afterGameplay, memoryLeak) {
    let score = 100;
    
    // 内存使用量评分
    if (afterGameplay && afterGameplay.usedJSHeapSize > this.benchmarks.memoryUsage) {
      const excess = afterGameplay.usedJSHeapSize - this.benchmarks.memoryUsage;
      score -= Math.min(50, excess / (1024 * 1024)); // 每MB扣1分
    }
    
    // 内存泄漏评分
    if (memoryLeak) {
      score -= 30;
    }
    
    return Math.max(0, Math.round(score));
  }

  /**
   * 测试 Web Vitals
   */
  async testWebVitals(dayNumber) {
    console.log(chalk.gray(`  📈 测试 Day ${dayNumber} Web Vitals...`));
    
    const page = await this.browser.newPage();
    
    try {
      // 启用性能监控
      await page.coverage.startJSCoverage();
      
      const startTime = Date.now();
      
      await page.goto('http://localhost:5173', { waitUntil: 'networkidle0' });
      await page.waitForSelector('canvas', { timeout: 10000 });
      
      // 获取 Web Vitals 指标
      const vitals = await page.evaluate(() => {
        return new Promise((resolve) => {
          const vitals = {};
          
          // LCP (Largest Contentful Paint)
          new PerformanceObserver((entryList) => {
            const entries = entryList.getEntries();
            const lastEntry = entries[entries.length - 1];
            vitals.lcp = lastEntry.startTime;
          }).observe({ entryTypes: ['largest-contentful-paint'] });
          
          // FID (First Input Delay) - 模拟
          vitals.fid = 0; // 需要真实用户交互才能测量
          
          // CLS (Cumulative Layout Shift)
          let clsValue = 0;
          new PerformanceObserver((entryList) => {
            for (const entry of entryList.getEntries()) {
              if (!entry.hadRecentInput) {
                clsValue += entry.value;
              }
            }
            vitals.cls = clsValue;
          }).observe({ entryTypes: ['layout-shift'] });
          
          // 等待一段时间收集指标
          setTimeout(() => {
            resolve(vitals);
          }, 3000);
        });
      });
      
      const jsCoverage = await page.coverage.stopJSCoverage();
      const codeUsage = this.calculateCodeUsage(jsCoverage);
      
      return {
        lcp: vitals.lcp || 0,
        fid: vitals.fid || 0,
        cls: vitals.cls || 0,
        codeUsage: codeUsage,
        passed: this.checkWebVitalsPassed(vitals),
        score: this.calculateWebVitalsScore(vitals, codeUsage)
      };
      
    } finally {
      await page.close();
    }
  }

  /**
   * 计算代码使用率
   */
  calculateCodeUsage(coverage) {
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
      usagePercentage: totalBytes > 0 ? (usedBytes / totalBytes) * 100 : 0
    };
  }

  /**
   * 检查 Web Vitals 是否通过
   */
  checkWebVitalsPassed(vitals) {
    return (
      (vitals.lcp || 0) < this.benchmarks.largestContentfulPaint &&
      (vitals.fid || 0) < this.benchmarks.firstInputDelay &&
      (vitals.cls || 0) < this.benchmarks.cumulativeLayoutShift
    );
  }

  /**
   * 计算 Web Vitals 评分
   */
  calculateWebVitalsScore(vitals, codeUsage) {
    let score = 100;
    
    // LCP 评分
    if (vitals.lcp > this.benchmarks.largestContentfulPaint) {
      score -= Math.min(30, (vitals.lcp - this.benchmarks.largestContentfulPaint) / 100);
    }
    
    // CLS 评分
    if (vitals.cls > this.benchmarks.cumulativeLayoutShift) {
      score -= Math.min(25, (vitals.cls - this.benchmarks.cumulativeLayoutShift) * 100);
    }
    
    // 代码使用率评分
    if (codeUsage.usagePercentage < 50) {
      score -= Math.min(20, (50 - codeUsage.usagePercentage) / 2);
    }
    
    return Math.max(0, Math.round(score));
  }

  /**
   * 分析包大小
   */
  async analyzeBundleSize(tutorialDir, dayNumber) {
    console.log(chalk.gray(`  📦 分析 Day ${dayNumber} 包大小...`));
    
    try {
      // 运行构建
      await this.runCommand('npm', ['run', 'build'], tutorialDir);
      
      // 分析构建输出
      const distPath = path.join(tutorialDir, 'dist');
      if (await fs.pathExists(distPath)) {
        const bundleAnalysis = await this.analyzeBundleFiles(distPath);
        
        return {
          ...bundleAnalysis,
          passed: bundleAnalysis.totalSize < this.benchmarks.bundleSize,
          score: this.calculateBundleScore(bundleAnalysis)
        };
      }
      
      return {
        error: '构建输出目录不存在',
        passed: false,
        score: 0
      };
      
    } catch (error) {
      return {
        error: error.message,
        passed: false,
        score: 0
      };
    }
  }

  /**
   * 分析包文件
   */
  async analyzeBundleFiles(distPath) {
    const files = await fs.glob('**/*', { cwd: distPath });
    const analysis = {
      totalSize: 0,
      fileCount: 0,
      breakdown: {
        js: { size: 0, count: 0 },
        css: { size: 0, count: 0 },
        images: { size: 0, count: 0 },
        other: { size: 0, count: 0 }
      }
    };
    
    for (const file of files) {
      const filePath = path.join(distPath, file);
      const stats = await fs.stat(filePath);
      
      if (stats.isFile()) {
        const ext = path.extname(file).toLowerCase();
        const size = stats.size;
        
        analysis.totalSize += size;
        analysis.fileCount++;
        
        if (['.js', '.mjs'].includes(ext)) {
          analysis.breakdown.js.size += size;
          analysis.breakdown.js.count++;
        } else if (['.css'].includes(ext)) {
          analysis.breakdown.css.size += size;
          analysis.breakdown.css.count++;
        } else if (['.png', '.jpg', '.jpeg', '.gif', '.svg', '.webp'].includes(ext)) {
          analysis.breakdown.images.size += size;
          analysis.breakdown.images.count++;
        } else {
          analysis.breakdown.other.size += size;
          analysis.breakdown.other.count++;
        }
      }
    }
    
    return analysis;
  }

  /**
   * 计算包大小评分
   */
  calculateBundleScore(analysis) {
    let score = 100;
    
    // 总大小评分
    if (analysis.totalSize > this.benchmarks.bundleSize) {
      const excess = analysis.totalSize - this.benchmarks.bundleSize;
      score -= Math.min(50, excess / (100 * 1024)); // 每100KB扣1分
    }
    
    // 文件数量评分（太多文件会影响加载）
    if (analysis.fileCount > 20) {
      score -= Math.min(20, (analysis.fileCount - 20) * 2);
    }
    
    return Math.max(0, Math.round(score));
  }

  /**
   * 运行压力测试
   */
  async runStressTests() {
    console.log(chalk.yellow('💪 运行压力测试...'));
    
    // 这里可以实现更复杂的压力测试
    // 例如：多标签页同时运行、大量用户输入等
  }

  /**
   * 运行长时间运行测试
   */
  async runLongRunningTests() {
    console.log(chalk.yellow('⏰ 运行长时间运行测试...'));
    
    // 这里可以实现长时间运行测试
    // 例如：运行游戏30分钟，检查内存泄漏和性能衰减
  }

  /**
   * 计算总体评分
   */
  calculateOverallScore(testResult) {
    const tests = testResult.tests;
    let totalScore = 0;
    let testCount = 0;
    
    // 加权计算各项测试评分
    const weights = {
      loadPerformance: 0.25,
      runtimePerformance: 0.3,
      memoryPerformance: 0.2,
      webVitals: 0.15,
      bundleAnalysis: 0.1
    };
    
    Object.entries(weights).forEach(([testName, weight]) => {
      if (tests[testName] && tests[testName].score !== undefined) {
        totalScore += tests[testName].score * weight;
        testCount++;
      }
    });
    
    const finalScore = testCount > 0 ? totalScore : 0;
    
    // 确定等级
    let grade = 'F';
    if (finalScore >= 90) grade = 'A';
    else if (finalScore >= 80) grade = 'B';
    else if (finalScore >= 70) grade = 'C';
    else if (finalScore >= 60) grade = 'D';
    
    testResult.overall = {
      score: Math.round(finalScore),
      grade: grade,
      passed: finalScore >= 70
    };
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
          started = true;
          resolve(null);
        }
      });
      
      server.on('error', reject);
      
      setTimeout(() => {
        if (!started) {
          server.kill();
          reject(new Error('服务器启动超时'));
        }
      }, 15000);
    });
  }

  /**
   * 运行命令
   */
  async runCommand(command, args, cwd) {
    return new Promise((resolve, reject) => {
      const process = spawn(command, args, { 
        cwd, 
        stdio: 'pipe',
        shell: true 
      });
      
      let output = '';
      let error = '';
      
      process.stdout.on('data', (data) => {
        output += data.toString();
      });
      
      process.stderr.on('data', (data) => {
        error += data.toString();
      });
      
      process.on('close', (code) => {
        if (code === 0) {
          resolve(output);
        } else {
          reject(new Error(`命令失败 (${code}): ${error}`));
        }
      });
      
      process.on('error', reject);
    });
  }

  /**
   * 生成性能报告
   */
  generatePerformanceReport() {
    console.log(chalk.blue('\n📊 自动化性能测试报告'));
    console.log('='.repeat(60));
    
    // 总体统计
    const totalTests = this.testResults.length;
    const passedTests = this.testResults.filter(result => result.overall.passed).length;
    const averageScore = this.testResults.reduce((sum, result) => sum + result.overall.score, 0) / totalTests;
    
    console.log(chalk.green(`\n📈 测试概览:`));
    console.log(`  总测试数: ${totalTests}`);
    console.log(`  通过测试: ${passedTests}`);
    console.log(`  通过率: ${((passedTests / totalTests) * 100).toFixed(1)}%`);
    console.log(`  平均评分: ${averageScore.toFixed(1)}/100`);
    
    // 详细结果
    console.log(chalk.green('\n📊 详细测试结果:'));
    this.testResults.forEach(result => {
      const status = result.overall.passed ? '✅' : '❌';
      console.log(`  ${status} Day ${result.day}: ${result.overall.score}/100 (${result.overall.grade})`);
      
      if (result.tests) {
        Object.entries(result.tests).forEach(([testName, testResult]) => {
          if (testResult.score !== undefined) {
            const testStatus = testResult.passed ? '✅' : '❌';
            console.log(`    ${testStatus} ${testName}: ${testResult.score}/100`);
          }
        });
      }
      
      if (result.error) {
        console.log(chalk.red(`    ❌ 错误: ${result.error}`));
      }
    });
    
    // 性能趋势分析
    this.analyzePerformanceTrends();
    
    // 保存报告
    this.savePerformanceReport();
  }

  /**
   * 分析性能趋势
   */
  analyzePerformanceTrends() {
    console.log(chalk.blue('\n📈 性能趋势分析:'));
    
    const scores = this.testResults.map(result => result.overall.score);
    
    // 显示评分趋势
    console.log('  评分趋势:');
    scores.forEach((score, index) => {
      const bar = '█'.repeat(Math.floor(score / 5));
      console.log(`    Day ${index + 1}: ${bar} ${score}/100`);
    });
    
    // 识别性能瓶颈
    console.log('\n  常见性能问题:');
    const issues = [];
    
    this.testResults.forEach(result => {
      if (result.tests) {
        Object.entries(result.tests).forEach(([testName, testResult]) => {
          if (testResult.score < 70) {
            issues.push(`Day ${result.day}: ${testName} 性能不佳 (${testResult.score}/100)`);
          }
        });
      }
    });
    
    if (issues.length > 0) {
      issues.forEach(issue => console.log(`    🔴 ${issue}`));
    } else {
      console.log('    🟢 未发现严重性能问题');
    }
  }

  /**
   * 保存性能报告
   */
  async savePerformanceReport() {
    const report = {
      timestamp: new Date().toISOString(),
      summary: {
        totalTests: this.testResults.length,
        passedTests: this.testResults.filter(result => result.overall.passed).length,
        averageScore: this.testResults.reduce((sum, result) => sum + result.overall.score, 0) / this.testResults.length
      },
      benchmarks: this.benchmarks,
      results: this.testResults
    };
    
    await fs.ensureDir('reports');
    await fs.writeJson('reports/performance-testing.json', report, { spaces: 2 });
    
    console.log(chalk.blue('\n💾 性能测试报告已保存到 reports/performance-testing.json'));
  }
}

// 运行性能测试
if (import.meta.url === `file://${process.argv[1]}`) {
  const tester = new PerformanceTester();
  tester.runAllTests().catch(console.error);
}

export default PerformanceTester;
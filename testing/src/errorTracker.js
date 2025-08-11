#!/usr/bin/env node

import fs from 'fs-extra';
import path from 'path';
import chalk from 'chalk';
import puppeteer from 'puppeteer';
import { spawn } from 'child_process';

/**
 * 错误追踪和日志收集系统
 * 监控和收集教程运行过程中的错误
 */
class ErrorTracker {
  constructor() {
    this.browser = null;
    this.errors = {
      javascript: [],
      console: [],
      network: [],
      runtime: [],
      build: []
    };
    this.logs = [];
    this.errorPatterns = [
      /Uncaught \w*Error/,
      /TypeError/,
      /ReferenceError/,
      /SyntaxError/,
      /RangeError/,
      /Phaser\.\w+.*error/i,
      /Failed to load/i,
      /404.*not found/i,
      /500.*internal server error/i
    ];
  }

  /**
   * 开始错误追踪
   */
  async startTracking() {
    console.log(chalk.blue('🔍 开始错误追踪...'));
    
    try {
      // 启动浏览器
      this.browser = await puppeteer.launch({
        headless: 'new',
        args: [
          '--no-sandbox',
          '--disable-setuid-sandbox',
          '--disable-dev-shm-usage'
        ]
      });
      
      // 追踪每日教程
      await this.trackDailyTutorials();
      
      // 追踪构建过程
      await this.trackBuildProcesses();
      
      // 生成错误报告
      this.generateErrorReport();
      
    } finally {
      if (this.browser) {
        await this.browser.close();
      }
    }
  }

  /**
   * 追踪每日教程错误
   */
  async trackDailyTutorials() {
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
        await this.trackTutorialErrors(dir, dayNumber);
      }
    }
  }

  /**
   * 追踪单个教程的错误
   */
  async trackTutorialErrors(tutorialDir, dayNumber) {
    console.log(chalk.yellow(`🔍 追踪 Day ${dayNumber} 错误...`));
    
    try {
      // 启动开发服务器
      const server = await this.startDevServer(tutorialDir);
      
      try {
        // 等待服务器启动
        await new Promise(resolve => setTimeout(resolve, 3000));
        
        // 创建新页面
        const page = await this.browser.newPage();
        
        // 设置错误监听
        this.setupErrorListeners(page, dayNumber);
        
        // 访问页面并收集错误
        await this.collectPageErrors(page, dayNumber);
        
        // 测试用户交互错误
        await this.testInteractionErrors(page, dayNumber);
        
        await page.close();
        
      } finally {
        if (server) {
          server.kill();
        }
      }
      
    } catch (error) {
      this.addError('runtime', {
        day: dayNumber,
        type: 'server_startup',
        message: error.message,
        timestamp: new Date().toISOString()
      });
    }
  }

  /**
   * 设置错误监听器
   */
  setupErrorListeners(page, dayNumber) {
    // JavaScript 错误监听
    page.on('pageerror', error => {
      this.addError('javascript', {
        day: dayNumber,
        type: 'page_error',
        message: error.message,
        stack: error.stack,
        timestamp: new Date().toISOString()
      });
    });
    
    // 控制台错误监听
    page.on('console', msg => {
      if (msg.type() === 'error') {
        this.addError('console', {
          day: dayNumber,
          type: 'console_error',
          message: msg.text(),
          location: msg.location(),
          timestamp: new Date().toISOString()
        });
      } else if (msg.type() === 'warning') {
        this.addLog({
          day: dayNumber,
          level: 'warning',
          message: msg.text(),
          timestamp: new Date().toISOString()
        });
      }
    });
    
    // 网络错误监听
    page.on('requestfailed', request => {
      this.addError('network', {
        day: dayNumber,
        type: 'request_failed',
        url: request.url(),
        method: request.method(),
        failure: request.failure()?.errorText,
        timestamp: new Date().toISOString()
      });
    });
    
    // 响应错误监听
    page.on('response', response => {
      if (response.status() >= 400) {
        this.addError('network', {
          day: dayNumber,
          type: 'http_error',
          url: response.url(),
          status: response.status(),
          statusText: response.statusText(),
          timestamp: new Date().toISOString()
        });
      }
    });
  }

  /**
   * 收集页面错误
   */
  async collectPageErrors(page, dayNumber) {
    try {
      // 访问页面
      await page.goto('http://localhost:5173', {
        waitUntil: 'networkidle0',
        timeout: 30000
      });
      
      // 等待 Phaser 游戏加载
      await page.waitForSelector('canvas', { timeout: 10000 });
      
      // 检查 Phaser 初始化错误
      const phaserErrors = await page.evaluate(() => {
        const errors = [];
        
        // 检查 Phaser 是否正确加载
        if (typeof Phaser === 'undefined') {
          errors.push('Phaser 库未加载');
        }
        
        // 检查游戏是否正确初始化
        if (!window.game) {
          errors.push('游戏对象未创建');
        } else if (!window.game.isRunning) {
          errors.push('游戏未正常运行');
        }
        
        // 检查场景是否正确加载
        if (window.game && window.game.scene) {
          const activeScenes = window.game.scene.getScenes(true);
          if (activeScenes.length === 0) {
            errors.push('没有活动的游戏场景');
          }
        }
        
        return errors;
      });
      
      // 记录 Phaser 相关错误
      phaserErrors.forEach(error => {
        this.addError('runtime', {
          day: dayNumber,
          type: 'phaser_error',
          message: error,
          timestamp: new Date().toISOString()
        });
      });
      
    } catch (error) {
      this.addError('runtime', {
        day: dayNumber,
        type: 'page_load',
        message: error.message,
        timestamp: new Date().toISOString()
      });
    }
  }

  /**
   * 测试用户交互错误
   */
  async testInteractionErrors(page, dayNumber) {
    try {
      // 测试键盘输入
      const keyboardErrors = await this.testKeyboardInteraction(page);
      keyboardErrors.forEach(error => {
        this.addError('runtime', {
          day: dayNumber,
          type: 'keyboard_error',
          message: error,
          timestamp: new Date().toISOString()
        });
      });
      
      // 测试鼠标交互
      const mouseErrors = await this.testMouseInteraction(page);
      mouseErrors.forEach(error => {
        this.addError('runtime', {
          day: dayNumber,
          type: 'mouse_error',
          message: error,
          timestamp: new Date().toISOString()
        });
      });
      
    } catch (error) {
      this.addError('runtime', {
        day: dayNumber,
        type: 'interaction_test',
        message: error.message,
        timestamp: new Date().toISOString()
      });
    }
  }

  /**
   * 测试键盘交互
   */
  async testKeyboardInteraction(page) {
    const errors = [];
    
    try {
      const keys = ['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', 'Space'];
      
      for (const key of keys) {
        await page.keyboard.press(key);
        await new Promise(resolve => setTimeout(resolve, 100));
        
        // 检查是否有错误发生
        const hasError = await page.evaluate(() => {
          return window.lastError !== undefined;
        });
        
        if (hasError) {
          const errorMsg = await page.evaluate(() => window.lastError);
          errors.push(`键盘输入 ${key} 导致错误: ${errorMsg}`);
        }
      }
    } catch (error) {
      errors.push(`键盘测试失败: ${error.message}`);
    }
    
    return errors;
  }

  /**
   * 测试鼠标交互
   */
  async testMouseInteraction(page) {
    const errors = [];
    
    try {
      // 点击 Canvas
      await page.click('canvas');
      
      // 鼠标移动
      await page.mouse.move(100, 100);
      await page.mouse.move(200, 200);
      
      // 鼠标点击
      await page.mouse.click(150, 150);
      
      // 检查交互是否正常
      const interactionWorking = await page.evaluate(() => {
        return window.game && window.game.input && window.game.input.activePointer;
      });
      
      if (!interactionWorking) {
        errors.push('鼠标交互未正常工作');
      }
      
    } catch (error) {
      errors.push(`鼠标测试失败: ${error.message}`);
    }
    
    return errors;
  }

  /**
   * 追踪构建过程错误
   */
  async trackBuildProcesses() {
    console.log(chalk.yellow('🔨 追踪构建过程错误...'));
    
    const tutorialDirs = await fs.glob('../[1-7]_*/source', { cwd: import.meta.url });
    
    for (const dir of tutorialDirs) {
      const dayNumber = dir.match(/(\d+)_/)?.[1];
      await this.trackBuildErrors(dir, dayNumber);
    }
  }

  /**
   * 追踪单个项目的构建错误
   */
  async trackBuildErrors(projectDir, dayNumber) {
    console.log(chalk.gray(`  🔧 追踪 Day ${dayNumber} 构建错误...`));
    
    try {
      // 检查 package.json
      const packagePath = path.join(projectDir, 'package.json');
      if (!(await fs.pathExists(packagePath))) {
        this.addError('build', {
          day: dayNumber,
          type: 'missing_package_json',
          message: 'package.json 文件不存在',
          timestamp: new Date().toISOString()
        });
        return;
      }
      
      // 尝试安装依赖
      try {
        await this.runCommand('npm', ['install'], projectDir);
      } catch (error) {
        this.addError('build', {
          day: dayNumber,
          type: 'npm_install',
          message: error.message,
          timestamp: new Date().toISOString()
        });
      }
      
      // 尝试构建项目
      const packageJson = await fs.readJson(packagePath);
      if (packageJson.scripts?.build) {
        try {
          await this.runCommand('npm', ['run', 'build'], projectDir);
        } catch (error) {
          this.addError('build', {
            day: dayNumber,
            type: 'build_failed',
            message: error.message,
            timestamp: new Date().toISOString()
          });
        }
      }
      
      // 检查语法错误
      await this.checkSyntaxErrors(projectDir, dayNumber);
      
    } catch (error) {
      this.addError('build', {
        day: dayNumber,
        type: 'build_process',
        message: error.message,
        timestamp: new Date().toISOString()
      });
    }
  }

  /**
   * 检查语法错误
   */
  async checkSyntaxErrors(projectDir, dayNumber) {
    const jsFiles = await fs.glob('**/*.js', { 
      cwd: projectDir,
      ignore: ['node_modules/**']
    });
    
    for (const file of jsFiles) {
      const filePath = path.join(projectDir, file);
      
      try {
        const code = await fs.readFile(filePath, 'utf-8');
        
        // 基本语法检查
        try {
          new Function(code);
        } catch (syntaxError) {
          this.addError('build', {
            day: dayNumber,
            type: 'syntax_error',
            file: file,
            message: syntaxError.message,
            timestamp: new Date().toISOString()
          });
        }
        
        // 检查常见错误模式
        this.checkCodePatterns(code, file, dayNumber);
        
      } catch (error) {
        this.addError('build', {
          day: dayNumber,
          type: 'file_read',
          file: file,
          message: error.message,
          timestamp: new Date().toISOString()
        });
      }
    }
  }

  /**
   * 检查代码模式错误
   */
  checkCodePatterns(code, file, dayNumber) {
    const lines = code.split('\n');
    
    lines.forEach((line, index) => {
      // 检查常见错误模式
      this.errorPatterns.forEach(pattern => {
        if (pattern.test(line)) {
          this.addError('build', {
            day: dayNumber,
            type: 'pattern_error',
            file: file,
            line: index + 1,
            message: `可能的错误模式: ${line.trim()}`,
            timestamp: new Date().toISOString()
          });
        }
      });
      
      // 检查未定义的变量
      const undefinedVars = line.match(/\b(\w+)\s*is\s*not\s*defined/g);
      if (undefinedVars) {
        undefinedVars.forEach(match => {
          this.addError('build', {
            day: dayNumber,
            type: 'undefined_variable',
            file: file,
            line: index + 1,
            message: match,
            timestamp: new Date().toISOString()
          });
        });
      }
    });
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
      let errorOutput = '';
      
      server.stdout.on('data', (data) => {
        const output = data.toString();
        if ((output.includes('Local:') || output.includes('localhost')) && !started) {
          started = true;
          resolve(server);
        }
      });
      
      server.stderr.on('data', (data) => {
        errorOutput += data.toString();
      });
      
      server.on('error', (error) => {
        if (!started) {
          reject(error);
        }
      });
      
      server.on('close', (code) => {
        if (!started && code !== 0) {
          reject(new Error(`服务器启动失败: ${errorOutput}`));
        }
      });
      
      // 超时处理
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
   * 添加错误
   */
  addError(category, error) {
    this.errors[category].push(error);
    console.log(chalk.red(`❌ [${category.toUpperCase()}] Day ${error.day}: ${error.message}`));
  }

  /**
   * 添加日志
   */
  addLog(log) {
    this.logs.push(log);
    if (log.level === 'warning') {
      console.log(chalk.yellow(`⚠️  Day ${log.day}: ${log.message}`));
    }
  }

  /**
   * 生成错误报告
   */
  generateErrorReport() {
    console.log(chalk.blue('\n📊 错误追踪报告'));
    console.log('='.repeat(60));
    
    // 统计错误数量
    const totalErrors = Object.values(this.errors).reduce((sum, errors) => sum + errors.length, 0);
    
    console.log(chalk.green(`\n📈 错误统计:`));
    console.log(`  总错误数: ${totalErrors}`);
    console.log(`  JavaScript 错误: ${this.errors.javascript.length}`);
    console.log(`  控制台错误: ${this.errors.console.length}`);
    console.log(`  网络错误: ${this.errors.network.length}`);
    console.log(`  运行时错误: ${this.errors.runtime.length}`);
    console.log(`  构建错误: ${this.errors.build.length}`);
    console.log(`  警告数量: ${this.logs.filter(log => log.level === 'warning').length}`);
    
    // 按类型显示错误详情
    Object.entries(this.errors).forEach(([category, errors]) => {
      if (errors.length > 0) {
        console.log(chalk.red(`\n❌ ${category.toUpperCase()} 错误 (${errors.length}):`));
        
        // 按天分组显示
        const errorsByDay = {};
        errors.forEach(error => {
          const day = error.day || 'unknown';
          if (!errorsByDay[day]) {
            errorsByDay[day] = [];
          }
          errorsByDay[day].push(error);
        });
        
        Object.entries(errorsByDay).forEach(([day, dayErrors]) => {
          console.log(`  Day ${day}:`);
          dayErrors.forEach(error => {
            console.log(`    - ${error.type}: ${error.message}`);
            if (error.file) {
              console.log(`      文件: ${error.file}${error.line ? `:${error.line}` : ''}`);
            }
          });
        });
      }
    });
    
    // 错误趋势分析
    this.analyzeErrorTrends();
    
    // 保存报告
    this.saveErrorReport();
  }

  /**
   * 分析错误趋势
   */
  analyzeErrorTrends() {
    console.log(chalk.blue('\n📈 错误趋势分析:'));
    
    // 按天统计错误
    const errorsByDay = {};
    
    Object.values(this.errors).forEach(categoryErrors => {
      categoryErrors.forEach(error => {
        const day = error.day || 'unknown';
        if (!errorsByDay[day]) {
          errorsByDay[day] = 0;
        }
        errorsByDay[day]++;
      });
    });
    
    // 显示趋势
    Object.entries(errorsByDay)
      .sort(([a], [b]) => a.localeCompare(b))
      .forEach(([day, count]) => {
        const bar = '█'.repeat(Math.min(count, 20));
        console.log(`  Day ${day}: ${bar} (${count})`);
      });
    
    // 最常见的错误类型
    const errorTypes = {};
    Object.values(this.errors).forEach(categoryErrors => {
      categoryErrors.forEach(error => {
        const type = error.type || 'unknown';
        errorTypes[type] = (errorTypes[type] || 0) + 1;
      });
    });
    
    const topErrors = Object.entries(errorTypes)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5);
    
    if (topErrors.length > 0) {
      console.log(chalk.blue('\n🔝 最常见错误类型:'));
      topErrors.forEach(([type, count]) => {
        console.log(`  ${type}: ${count} 次`);
      });
    }
  }

  /**
   * 保存错误报告
   */
  async saveErrorReport() {
    const report = {
      timestamp: new Date().toISOString(),
      summary: {
        totalErrors: Object.values(this.errors).reduce((sum, errors) => sum + errors.length, 0),
        errorsByCategory: Object.fromEntries(
          Object.entries(this.errors).map(([category, errors]) => [category, errors.length])
        ),
        totalWarnings: this.logs.filter(log => log.level === 'warning').length
      },
      errors: this.errors,
      logs: this.logs,
      analysis: {
        errorsByDay: this.getErrorsByDay(),
        commonErrorTypes: this.getCommonErrorTypes(),
        recommendations: this.generateErrorRecommendations()
      }
    };
    
    await fs.ensureDir('reports');
    await fs.writeJson('reports/error-tracking.json', report, { spaces: 2 });
    
    console.log(chalk.blue('\n💾 错误报告已保存到 reports/error-tracking.json'));
  }

  /**
   * 获取按天分组的错误
   */
  getErrorsByDay() {
    const errorsByDay = {};
    
    Object.values(this.errors).forEach(categoryErrors => {
      categoryErrors.forEach(error => {
        const day = error.day || 'unknown';
        if (!errorsByDay[day]) {
          errorsByDay[day] = 0;
        }
        errorsByDay[day]++;
      });
    });
    
    return errorsByDay;
  }

  /**
   * 获取常见错误类型
   */
  getCommonErrorTypes() {
    const errorTypes = {};
    
    Object.values(this.errors).forEach(categoryErrors => {
      categoryErrors.forEach(error => {
        const type = error.type || 'unknown';
        errorTypes[type] = (errorTypes[type] || 0) + 1;
      });
    });
    
    return Object.entries(errorTypes)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 10);
  }

  /**
   * 生成错误修复建议
   */
  generateErrorRecommendations() {
    const recommendations = [];
    
    // 基于错误类型生成建议
    if (this.errors.javascript.length > 0) {
      recommendations.push({
        category: 'javascript',
        priority: 'high',
        suggestion: '发现 JavaScript 错误，建议检查代码语法和逻辑'
      });
    }
    
    if (this.errors.network.length > 0) {
      recommendations.push({
        category: 'network',
        priority: 'medium',
        suggestion: '发现网络错误，检查资源路径和服务器配置'
      });
    }
    
    if (this.errors.build.length > 0) {
      recommendations.push({
        category: 'build',
        priority: 'high',
        suggestion: '发现构建错误，检查依赖和构建配置'
      });
    }
    
    return recommendations;
  }
}

// 运行错误追踪
if (import.meta.url === `file://${process.argv[1]}`) {
  const tracker = new ErrorTracker();
  tracker.startTracking().catch(console.error);
}

export default ErrorTracker;
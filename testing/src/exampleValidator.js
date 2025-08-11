#!/usr/bin/env node

import fs from 'fs-extra';
import path from 'path';
import { spawn } from 'child_process';
import puppeteer from 'puppeteer';
import chalk from 'chalk';
import { glob } from 'glob';

/**
 * 代码示例验证器
 * 自动化测试和验证所有代码示例的正确性
 */
class ExampleValidator {
  constructor() {
    this.results = [];
    this.browser = null;
    this.stats = {
      totalExamples: 0,
      passedExamples: 0,
      failedExamples: 0,
      skippedExamples: 0
    };
  }

  /**
   * 验证所有代码示例
   */
  async validateAll() {
    console.log(chalk.blue('🧪 开始验证代码示例...'));
    
    try {
      // 启动浏览器
      this.browser = await puppeteer.launch({
        headless: 'new',
        args: ['--no-sandbox', '--disable-setuid-sandbox']
      });
      
      // 验证每日教程的代码示例
      await this.validateDailyExamples();
      
      // 验证完整项目
      await this.validateCompleteProjects();
      
      // 生成报告
      this.generateReport();
      
    } finally {
      if (this.browser) {
        await this.browser.close();
      }
    }
  }

  /**
   * 验证每日教程代码示例
   */
  async validateDailyExamples() {
    const tutorialDirs = await glob('../[1-7]_*', { cwd: import.meta.url });
    
    for (const dir of tutorialDirs) {
      await this.validateTutorialExamples(dir);
    }
  }

  /**
   * 验证单个教程的代码示例
   */
  async validateTutorialExamples(tutorialDir) {
    const dayNumber = tutorialDir.match(/(\d+)_/)?.[1];
    console.log(chalk.yellow(`🔍 验证 Day ${dayNumber} 代码示例...`));

    const sourcePath = path.join(tutorialDir, 'source');
    if (!(await fs.pathExists(sourcePath))) {
      this.addResult(tutorialDir, 'SKIP', '源代码目录不存在');
      return;
    }

    // 检查项目结构
    await this.validateProjectStructure(sourcePath, dayNumber);
    
    // 验证 package.json
    await this.validatePackageJson(sourcePath, dayNumber);
    
    // 运行构建测试
    await this.validateBuild(sourcePath, dayNumber);
    
    // 运行浏览器测试
    await this.validateInBrowser(sourcePath, dayNumber);
  }

  /**
   * 验证项目结构
   */
  async validateProjectStructure(sourcePath, dayNumber) {
    const requiredFiles = [
      'package.json',
      'index.html',
      'src/main.js'
    ];

    for (const file of requiredFiles) {
      const filePath = path.join(sourcePath, file);
      if (!(await fs.pathExists(filePath))) {
        this.addResult(`Day ${dayNumber}`, 'FAIL', `缺少必需文件: ${file}`);
        return false;
      }
    }

    this.addResult(`Day ${dayNumber}`, 'PASS', '项目结构验证通过');
    return true;
  }

  /**
   * 验证 package.json
   */
  async validatePackageJson(sourcePath, dayNumber) {
    try {
      const packagePath = path.join(sourcePath, 'package.json');
      const packageJson = await fs.readJson(packagePath);
      
      // 检查必需的依赖
      const requiredDeps = ['phaser'];
      const missingDeps = requiredDeps.filter(dep => 
        !packageJson.dependencies?.[dep] && !packageJson.devDependencies?.[dep]
      );
      
      if (missingDeps.length > 0) {
        this.addResult(`Day ${dayNumber}`, 'FAIL', `缺少依赖: ${missingDeps.join(', ')}`);
        return false;
      }
      
      // 检查脚本
      if (!packageJson.scripts?.dev && !packageJson.scripts?.start) {
        this.addResult(`Day ${dayNumber}`, 'WARN', '缺少开发脚本');
      }
      
      this.addResult(`Day ${dayNumber}`, 'PASS', 'package.json 验证通过');
      return true;
      
    } catch (error) {
      this.addResult(`Day ${dayNumber}`, 'FAIL', `package.json 解析失败: ${error.message}`);
      return false;
    }
  }

  /**
   * 验证构建过程
   */
  async validateBuild(sourcePath, dayNumber) {
    try {
      console.log(chalk.gray(`  📦 构建 Day ${dayNumber} 项目...`));
      
      // 安装依赖
      await this.runCommand('npm', ['install'], sourcePath);
      
      // 运行构建（如果有构建脚本）
      const packageJson = await fs.readJson(path.join(sourcePath, 'package.json'));
      if (packageJson.scripts?.build) {
        await this.runCommand('npm', ['run', 'build'], sourcePath);
      }
      
      this.addResult(`Day ${dayNumber}`, 'PASS', '构建验证通过');
      return true;
      
    } catch (error) {
      this.addResult(`Day ${dayNumber}`, 'FAIL', `构建失败: ${error.message}`);
      return false;
    }
  }

  /**
   * 在浏览器中验证
   */
  async validateInBrowser(sourcePath, dayNumber) {
    try {
      console.log(chalk.gray(`  🌐 浏览器测试 Day ${dayNumber}...`));
      
      const page = await this.browser.newPage();
      
      // 设置错误监听
      const errors = [];
      page.on('console', msg => {
        if (msg.type() === 'error') {
          errors.push(msg.text());
        }
      });
      
      page.on('pageerror', error => {
        errors.push(error.message);
      });
      
      // 启动开发服务器
      const server = await this.startDevServer(sourcePath);
      
      try {
        // 等待服务器启动
        await new Promise(resolve => setTimeout(resolve, 3000));
        
        // 访问页面
        await page.goto('http://localhost:5173', { 
          waitUntil: 'networkidle0',
          timeout: 10000 
        });
        
        // 等待 Phaser 游戏加载
        await page.waitForSelector('canvas', { timeout: 5000 });
        
        // 检查 Phaser 游戏是否正常运行
        const gameRunning = await page.evaluate(() => {
          return window.game && window.game.isRunning;
        });
        
        if (!gameRunning) {
          errors.push('Phaser 游戏未正常运行');
        }
        
        // 检查控制台错误
        if (errors.length > 0) {
          this.addResult(`Day ${dayNumber}`, 'FAIL', `浏览器错误: ${errors.join(', ')}`);
        } else {
          this.addResult(`Day ${dayNumber}`, 'PASS', '浏览器测试通过');
        }
        
      } finally {
        await page.close();
        if (server) {
          server.kill();
        }
      }
      
    } catch (error) {
      this.addResult(`Day ${dayNumber}`, 'FAIL', `浏览器测试失败: ${error.message}`);
    }
  }

  /**
   * 启动开发服务器
   */
  async startDevServer(sourcePath) {
    return new Promise((resolve, reject) => {
      const server = spawn('npm', ['run', 'dev'], {
        cwd: sourcePath,
        stdio: 'pipe'
      });
      
      let started = false;
      
      server.stdout.on('data', (data) => {
        const output = data.toString();
        if (output.includes('Local:') && !started) {
          started = true;
          resolve(server);
        }
      });
      
      server.stderr.on('data', (data) => {
        console.error(chalk.red(data.toString()));
      });
      
      server.on('error', reject);
      
      // 超时处理
      setTimeout(() => {
        if (!started) {
          server.kill();
          reject(new Error('开发服务器启动超时'));
        }
      }, 10000);
    });
  }

  /**
   * 验证完整项目
   */
  async validateCompleteProjects() {
    console.log(chalk.yellow('🎮 验证完整游戏项目...'));
    
    // 验证最终的完整游戏
    const completeGamePath = '../7_deploy_review/source';
    if (await fs.pathExists(completeGamePath)) {
      await this.validateCompleteGame(completeGamePath);
    }
  }

  /**
   * 验证完整游戏
   */
  async validateCompleteGame(gamePath) {
    try {
      console.log(chalk.gray('  🎯 测试完整游戏功能...'));
      
      const page = await this.browser.newPage();
      
      // 启动游戏服务器
      const server = await this.startDevServer(gamePath);
      
      try {
        await new Promise(resolve => setTimeout(resolve, 3000));
        await page.goto('http://localhost:5173', { waitUntil: 'networkidle0' });
        
        // 测试游戏基本功能
        await this.testGameFeatures(page);
        
        this.addResult('完整游戏', 'PASS', '完整游戏测试通过');
        
      } finally {
        await page.close();
        if (server) {
          server.kill();
        }
      }
      
    } catch (error) {
      this.addResult('完整游戏', 'FAIL', `完整游戏测试失败: ${error.message}`);
    }
  }

  /**
   * 测试游戏功能
   */
  async testGameFeatures(page) {
    // 等待游戏加载
    await page.waitForSelector('canvas', { timeout: 10000 });
    
    // 测试键盘输入
    await page.keyboard.press('ArrowRight');
    await page.keyboard.press('Space');
    
    // 等待一段时间让游戏运行
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // 检查游戏状态
    const gameState = await page.evaluate(() => {
      if (window.game && window.game.scene) {
        const scene = window.game.scene.getScene('GameScene');
        return {
          running: window.game.isRunning,
          sceneActive: scene && scene.scene.isActive()
        };
      }
      return { running: false, sceneActive: false };
    });
    
    if (!gameState.running || !gameState.sceneActive) {
      throw new Error('游戏未正常运行或场景未激活');
    }
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
   * 添加测试结果
   */
  addResult(example, status, message) {
    this.results.push({
      example,
      status,
      message,
      timestamp: new Date().toISOString()
    });
    
    this.stats.totalExamples++;
    
    switch (status) {
      case 'PASS':
        this.stats.passedExamples++;
        console.log(chalk.green(`  ✅ ${example}: ${message}`));
        break;
      case 'FAIL':
        this.stats.failedExamples++;
        console.log(chalk.red(`  ❌ ${example}: ${message}`));
        break;
      case 'SKIP':
        this.stats.skippedExamples++;
        console.log(chalk.yellow(`  ⏭️  ${example}: ${message}`));
        break;
      case 'WARN':
        console.log(chalk.yellow(`  ⚠️  ${example}: ${message}`));
        break;
    }
  }

  /**
   * 生成测试报告
   */
  generateReport() {
    console.log(chalk.blue('\n📊 代码示例验证报告'));
    console.log('='.repeat(50));
    
    console.log(chalk.green(`✅ 通过: ${this.stats.passedExamples}`));
    console.log(chalk.red(`❌ 失败: ${this.stats.failedExamples}`));
    console.log(chalk.yellow(`⏭️  跳过: ${this.stats.skippedExamples}`));
    console.log(chalk.blue(`📊 总计: ${this.stats.totalExamples}`));
    
    const successRate = this.stats.totalExamples > 0 
      ? (this.stats.passedExamples / this.stats.totalExamples * 100).toFixed(1)
      : 0;
    
    console.log(chalk.blue(`📈 成功率: ${successRate}%`));
    
    // 保存详细报告
    this.saveReport();
  }

  /**
   * 保存报告
   */
  async saveReport() {
    const report = {
      timestamp: new Date().toISOString(),
      stats: this.stats,
      results: this.results
    };
    
    await fs.ensureDir('reports');
    await fs.writeJson('reports/example-validation.json', report, { spaces: 2 });
    
    console.log(chalk.blue('\n💾 报告已保存到 reports/example-validation.json'));
  }
}

// 运行验证
if (import.meta.url === `file://${process.argv[1]}`) {
  const validator = new ExampleValidator();
  validator.validateAll().catch(console.error);
}

export default ExampleValidator;
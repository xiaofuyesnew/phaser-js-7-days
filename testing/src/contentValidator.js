#!/usr/bin/env node

import fs from 'fs-extra';
import path from 'path';
import { marked } from 'marked';
import hljs from 'highlight.js';
import chalk from 'chalk';
import { glob } from 'glob';

/**
 * 教程内容验证器
 * 验证教程内容的准确性、完整性和一致性
 */
class ContentValidator {
  constructor() {
    this.errors = [];
    this.warnings = [];
    this.stats = {
      totalFiles: 0,
      validFiles: 0,
      codeBlocks: 0,
      validCodeBlocks: 0,
      concepts: 0,
      exercises: 0
    };
  }

  /**
   * 验证所有教程内容
   */
  async validateAll() {
    console.log(chalk.blue('🔍 开始验证教程内容...'));
    
    // 验证每日教程
    await this.validateDailyTutorials();
    
    // 验证附加资源
    await this.validateAdditionalResources();
    
    // 验证交叉引用
    await this.validateCrossReferences();
    
    // 生成报告
    this.generateReport();
  }

  /**
   * 验证每日教程内容
   */
  async validateDailyTutorials() {
    const tutorialDirs = await glob('../[1-7]_*', { cwd: import.meta.url });
    
    for (const dir of tutorialDirs) {
      await this.validateTutorialDay(dir);
    }
  }

  /**
   * 验证单个教程日的内容
   */
  async validateTutorialDay(tutorialDir) {
    const dayNumber = tutorialDir.match(/(\d+)_/)?.[1];
    console.log(chalk.yellow(`📚 验证 Day ${dayNumber} 教程...`));

    // 验证 README.md
    const readmePath = path.join(tutorialDir, 'README.md');
    if (await fs.pathExists(readmePath)) {
      await this.validateMarkdownFile(readmePath, `Day ${dayNumber}`);
    } else {
      this.addError(`缺少 ${tutorialDir}/README.md 文件`);
    }

    // 验证源代码目录
    const sourcePath = path.join(tutorialDir, 'source');
    if (await fs.pathExists(sourcePath)) {
      await this.validateSourceCode(sourcePath, dayNumber);
    } else {
      this.addError(`缺少 ${tutorialDir}/source 目录`);
    }

    this.stats.totalFiles++;
  }

  /**
   * 验证 Markdown 文件内容
   */
  async validateMarkdownFile(filePath, context) {
    try {
      const content = await fs.readFile(filePath, 'utf-8');
      const tokens = marked.lexer(content);
      
      // 验证文档结构
      this.validateDocumentStructure(tokens, context);
      
      // 验证代码块
      this.validateCodeBlocks(tokens, context);
      
      // 验证概念解释
      this.validateConcepts(tokens, context);
      
      // 验证练习内容
      this.validateExercises(tokens, context);
      
      this.stats.validFiles++;
    } catch (error) {
      this.addError(`读取文件失败 ${filePath}: ${error.message}`);
    }
  }

  /**
   * 验证文档结构
   */
  validateDocumentStructure(tokens, context) {
    const headings = tokens.filter(token => token.type === 'heading');
    
    // 检查必需的章节
    const requiredSections = [
      '学习目标',
      '核心概念',
      '代码实现',
      '实践练习'
    ];
    
    const sectionTitles = headings.map(h => h.text);
    
    for (const required of requiredSections) {
      if (!sectionTitles.some(title => title.includes(required))) {
        this.addWarning(`${context}: 缺少推荐章节 "${required}"`);
      }
    }
  }

  /**
   * 验证代码块
   */
  validateCodeBlocks(tokens, context) {
    const codeBlocks = tokens.filter(token => token.type === 'code');
    
    for (const block of codeBlocks) {
      this.stats.codeBlocks++;
      
      // 验证语言标识
      if (!block.lang) {
        this.addWarning(`${context}: 代码块缺少语言标识`);
        continue;
      }
      
      // 验证 JavaScript 代码语法
      if (block.lang === 'javascript' || block.lang === 'js') {
        this.validateJavaScriptCode(block.text, context);
      }
      
      // 验证代码注释
      if (!this.hasAdequateComments(block.text)) {
        this.addWarning(`${context}: 代码块缺少足够的注释`);
      }
      
      this.stats.validCodeBlocks++;
    }
  }

  /**
   * 验证 JavaScript 代码语法
   */
  validateJavaScriptCode(code, context) {
    try {
      // 基本语法检查
      new Function(code);
      
      // 检查 Phaser.js 相关代码
      if (code.includes('Phaser')) {
        this.validatePhaserCode(code, context);
      }
    } catch (error) {
      this.addError(`${context}: JavaScript 语法错误 - ${error.message}`);
    }
  }

  /**
   * 验证 Phaser.js 代码
   */
  validatePhaserCode(code, context) {
    // 检查常见的 Phaser.js 模式
    const patterns = [
      { pattern: /new Phaser\.Game/, name: 'Game 初始化' },
      { pattern: /extends Phaser\.Scene/, name: 'Scene 继承' },
      { pattern: /preload\(\)/, name: 'preload 方法' },
      { pattern: /create\(\)/, name: 'create 方法' },
      { pattern: /update\(\)/, name: 'update 方法' }
    ];

    for (const { pattern, name } of patterns) {
      if (code.includes('Phaser') && !pattern.test(code) && code.length > 100) {
        this.addWarning(`${context}: 可能缺少 ${name} 的实现`);
      }
    }
  }

  /**
   * 检查代码注释充分性
   */
  hasAdequateComments(code) {
    const lines = code.split('\n');
    const commentLines = lines.filter(line => 
      line.trim().startsWith('//') || 
      line.trim().startsWith('/*') || 
      line.trim().startsWith('*')
    );
    
    // 至少 20% 的行应该是注释
    return commentLines.length / lines.length >= 0.2;
  }

  /**
   * 验证概念解释
   */
  validateConcepts(tokens, context) {
    const textTokens = tokens.filter(token => token.type === 'paragraph');
    
    // 检查概念解释的质量
    for (const token of textTokens) {
      if (this.containsTechnicalTerms(token.text)) {
        this.stats.concepts++;
        
        if (!this.hasGoodExplanation(token.text)) {
          this.addWarning(`${context}: 技术概念可能需要更详细的解释`);
        }
      }
    }
  }

  /**
   * 检查是否包含技术术语
   */
  containsTechnicalTerms(text) {
    const technicalTerms = [
      'Phaser', 'Scene', 'Sprite', 'Physics', 'Camera',
      'Tilemap', 'Animation', 'Audio', 'Input', 'Game Loop'
    ];
    
    return technicalTerms.some(term => text.includes(term));
  }

  /**
   * 检查解释质量
   */
  hasGoodExplanation(text) {
    // 简单的启发式检查
    return text.length > 100 && 
           (text.includes('是') || text.includes('用于') || text.includes('可以'));
  }

  /**
   * 验证练习内容
   */
  validateExercises(tokens, context) {
    const listTokens = tokens.filter(token => token.type === 'list');
    
    for (const list of listTokens) {
      if (this.isExerciseList(list)) {
        this.stats.exercises++;
        this.validateExerciseQuality(list, context);
      }
    }
  }

  /**
   * 检查是否为练习列表
   */
  isExerciseList(list) {
    const text = JSON.stringify(list);
    return text.includes('练习') || text.includes('任务') || text.includes('实现');
  }

  /**
   * 验证练习质量
   */
  validateExerciseQuality(list, context) {
    // 检查练习是否有明确的目标和步骤
    const items = list.items || [];
    
    if (items.length < 3) {
      this.addWarning(`${context}: 练习项目可能过少，建议增加更多练习`);
    }
  }

  /**
   * 验证源代码
   */
  async validateSourceCode(sourcePath, dayNumber) {
    const jsFiles = await glob('**/*.js', { cwd: sourcePath });
    
    for (const file of jsFiles) {
      const filePath = path.join(sourcePath, file);
      await this.validateJavaScriptFile(filePath, `Day ${dayNumber}`);
    }
  }

  /**
   * 验证 JavaScript 文件
   */
  async validateJavaScriptFile(filePath, context) {
    try {
      const code = await fs.readFile(filePath, 'utf-8');
      
      // 语法验证
      this.validateJavaScriptCode(code, `${context} - ${path.basename(filePath)}`);
      
      // 代码质量检查
      this.validateCodeQuality(code, context);
      
    } catch (error) {
      this.addError(`验证文件失败 ${filePath}: ${error.message}`);
    }
  }

  /**
   * 验证代码质量
   */
  validateCodeQuality(code, context) {
    // 检查代码风格
    if (!code.includes('const ') && !code.includes('let ')) {
      this.addWarning(`${context}: 建议使用现代 JavaScript 语法 (const/let)`);
    }
    
    // 检查错误处理
    if (code.includes('try') && !code.includes('catch')) {
      this.addWarning(`${context}: try 语句缺少对应的 catch`);
    }
  }

  /**
   * 验证附加资源
   */
  async validateAdditionalResources() {
    console.log(chalk.yellow('📋 验证附加资源...'));
    
    // 验证环境搭建指南
    await this.validateEnvironmentGuide();
    
    // 验证资源推荐
    await this.validateResourceRecommendations();
  }

  /**
   * 验证环境搭建指南
   */
  async validateEnvironmentGuide() {
    const guidePath = '../for_frontend_beginner/README.md';
    if (await fs.pathExists(guidePath)) {
      await this.validateMarkdownFile(guidePath, '环境搭建指南');
    }
  }

  /**
   * 验证资源推荐
   */
  async validateResourceRecommendations() {
    const resourcePath = '../recommend_resource/README.md';
    if (await fs.pathExists(resourcePath)) {
      await this.validateMarkdownFile(resourcePath, '资源推荐');
    }
  }

  /**
   * 验证交叉引用
   */
  async validateCrossReferences() {
    console.log(chalk.yellow('🔗 验证交叉引用...'));
    
    // 这里可以添加检查文档间链接的逻辑
    // 例如检查相对路径链接是否有效
  }

  /**
   * 添加错误
   */
  addError(message) {
    this.errors.push(message);
    console.log(chalk.red(`❌ ${message}`));
  }

  /**
   * 添加警告
   */
  addWarning(message) {
    this.warnings.push(message);
    console.log(chalk.yellow(`⚠️  ${message}`));
  }

  /**
   * 生成验证报告
   */
  generateReport() {
    console.log(chalk.blue('\n📊 内容验证报告'));
    console.log('='.repeat(50));
    
    console.log(chalk.green(`✅ 验证文件数: ${this.stats.validFiles}/${this.stats.totalFiles}`));
    console.log(chalk.green(`✅ 代码块数: ${this.stats.validCodeBlocks}/${this.stats.codeBlocks}`));
    console.log(chalk.green(`✅ 概念解释: ${this.stats.concepts}`));
    console.log(chalk.green(`✅ 练习项目: ${this.stats.exercises}`));
    
    if (this.errors.length > 0) {
      console.log(chalk.red(`\n❌ 错误 (${this.errors.length}):`));
      this.errors.forEach(error => console.log(chalk.red(`  • ${error}`)));
    }
    
    if (this.warnings.length > 0) {
      console.log(chalk.yellow(`\n⚠️  警告 (${this.warnings.length}):`));
      this.warnings.forEach(warning => console.log(chalk.yellow(`  • ${warning}`)));
    }
    
    const score = this.calculateQualityScore();
    console.log(chalk.blue(`\n📈 内容质量评分: ${score}/100`));
    
    // 保存报告到文件
    this.saveReport();
  }

  /**
   * 计算质量评分
   */
  calculateQualityScore() {
    let score = 100;
    
    // 错误扣分
    score -= this.errors.length * 10;
    
    // 警告扣分
    score -= this.warnings.length * 2;
    
    // 内容完整性加分
    if (this.stats.concepts > 20) score += 5;
    if (this.stats.exercises > 15) score += 5;
    if (this.stats.codeBlocks > 30) score += 5;
    
    return Math.max(0, Math.min(100, score));
  }

  /**
   * 保存报告到文件
   */
  async saveReport() {
    const report = {
      timestamp: new Date().toISOString(),
      stats: this.stats,
      errors: this.errors,
      warnings: this.warnings,
      score: this.calculateQualityScore()
    };
    
    await fs.ensureDir('reports');
    await fs.writeJson('reports/content-validation.json', report, { spaces: 2 });
    
    console.log(chalk.blue('\n💾 报告已保存到 reports/content-validation.json'));
  }
}

// 运行验证
if (import.meta.url === `file://${process.argv[1]}`) {
  const validator = new ContentValidator();
  validator.validateAll().catch(console.error);
}

export default ContentValidator;
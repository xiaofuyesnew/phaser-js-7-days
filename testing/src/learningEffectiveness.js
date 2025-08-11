#!/usr/bin/env node

import fs from 'fs-extra';
import path from 'path';
import chalk from 'chalk';
import { marked } from 'marked';

/**
 * 学习效果评估和反馈系统
 * 评估教程的学习效果和用户体验
 */
class LearningEffectivenessAnalyzer {
  constructor() {
    this.metrics = {
      contentComplexity: {},
      learningCurve: {},
      practicalValue: {},
      userExperience: {}
    };
    this.recommendations = [];
  }

  /**
   * 分析所有教程的学习效果
   */
  async analyzeAll() {
    console.log(chalk.blue('📚 开始分析学习效果...'));
    
    // 分析内容复杂度
    await this.analyzeContentComplexity();
    
    // 分析学习曲线
    await this.analyzeLearningCurve();
    
    // 分析实践价值
    await this.analyzePracticalValue();
    
    // 分析用户体验
    await this.analyzeUserExperience();
    
    // 生成改进建议
    this.generateRecommendations();
    
    // 生成报告
    this.generateReport();
  }

  /**
   * 分析内容复杂度
   */
  async analyzeContentComplexity() {
    console.log(chalk.yellow('🧮 分析内容复杂度...'));
    
    const tutorialDirs = [
      '../1_starter', '../2_sprite', '../3_tilemap', '../4_camera',
      '../5_enemy', '../6_audio_ui_status', '../7_deploy_review'
    ];
    
    for (let i = 0; i < tutorialDirs.length; i++) {
      const dir = tutorialDirs[i];
      const dayNumber = i + 1;
      
      const complexity = await this.calculateComplexity(dir, dayNumber);
      this.metrics.contentComplexity[`day${dayNumber}`] = complexity;
    }
  }

  /**
   * 计算单日教程复杂度
   */
  async calculateComplexity(tutorialDir, dayNumber) {
    try {
      const readmePath = path.join(tutorialDir, 'README.md');
      if (!(await fs.pathExists(readmePath))) {
        return { score: 0, factors: ['文件不存在'] };
      }
      
      const content = await fs.readFile(readmePath, 'utf-8');
      const tokens = marked.lexer(content);
      
      const factors = {
        wordCount: this.countWords(content),
        codeBlocks: tokens.filter(t => t.type === 'code').length,
        concepts: this.countTechnicalConcepts(content),
        apiCalls: this.countApiCalls(content),
        exercises: this.countExercises(tokens)
      };
      
      // 计算复杂度分数 (1-10)
      let score = 1;
      score += Math.min(factors.wordCount / 1000, 3); // 文字量
      score += Math.min(factors.codeBlocks / 5, 2); // 代码块数量
      score += Math.min(factors.concepts / 10, 2); // 概念数量
      score += Math.min(factors.apiCalls / 15, 2); // API调用数量
      
      return {
        score: Math.round(score * 10) / 10,
        factors,
        level: this.getComplexityLevel(score)
      };
      
    } catch (error) {
      return { score: 0, factors: [`错误: ${error.message}`] };
    }
  }

  /**
   * 统计单词数
   */
  countWords(content) {
    // 移除代码块
    const textOnly = content.replace(/```[\s\S]*?```/g, '');
    return textOnly.split(/\s+/).length;
  }

  /**
   * 统计技术概念
   */
  countTechnicalConcepts(content) {
    const concepts = [
      'Phaser', 'Scene', 'Sprite', 'Physics', 'Camera', 'Tilemap',
      'Animation', 'Audio', 'Input', 'Game Loop', 'Canvas', 'WebGL',
      'Collision', 'Tween', 'Particle', 'State', 'Event', 'Loader'
    ];
    
    return concepts.reduce((count, concept) => {
      const regex = new RegExp(concept, 'gi');
      const matches = content.match(regex);
      return count + (matches ? matches.length : 0);
    }, 0);
  }

  /**
   * 统计 API 调用
   */
  countApiCalls(content) {
    const apiPatterns = [
      /\w+\.\w+\(/g, // 方法调用
      /new \w+\(/g,  // 构造函数
      /\w+\.\w+\.\w+/g // 链式调用
    ];
    
    return apiPatterns.reduce((count, pattern) => {
      const matches = content.match(pattern);
      return count + (matches ? matches.length : 0);
    }, 0);
  }

  /**
   * 统计练习数量
   */
  countExercises(tokens) {
    const lists = tokens.filter(t => t.type === 'list');
    return lists.reduce((count, list) => {
      const text = JSON.stringify(list);
      if (text.includes('练习') || text.includes('任务') || text.includes('实现')) {
        return count + (list.items ? list.items.length : 1);
      }
      return count;
    }, 0);
  }

  /**
   * 获取复杂度等级
   */
  getComplexityLevel(score) {
    if (score <= 3) return '简单';
    if (score <= 6) return '中等';
    if (score <= 8) return '复杂';
    return '高难度';
  }

  /**
   * 分析学习曲线
   */
  async analyzeLearningCurve() {
    console.log(chalk.yellow('📈 分析学习曲线...'));
    
    const complexities = Object.values(this.metrics.contentComplexity);
    const curve = {
      progression: [],
      smoothness: 0,
      steepness: []
    };
    
    // 计算难度递增
    for (let i = 0; i < complexities.length; i++) {
      const current = complexities[i].score;
      curve.progression.push(current);
      
      if (i > 0) {
        const previous = complexities[i - 1].score;
        const increase = current - previous;
        curve.steepness.push(increase);
      }
    }
    
    // 计算平滑度 (理想情况下应该逐渐递增)
    const avgIncrease = curve.steepness.reduce((a, b) => a + b, 0) / curve.steepness.length;
    const variance = curve.steepness.reduce((sum, increase) => 
      sum + Math.pow(increase - avgIncrease, 2), 0) / curve.steepness.length;
    
    curve.smoothness = Math.max(0, 10 - variance); // 10分制，方差越小越平滑
    
    this.metrics.learningCurve = curve;
  }

  /**
   * 分析实践价值
   */
  async analyzePracticalValue() {
    console.log(chalk.yellow('🛠️ 分析实践价值...'));
    
    const practicalMetrics = {
      codeToTextRatio: 0,
      runnableExamples: 0,
      realWorldRelevance: 0,
      skillProgression: 0
    };
    
    // 分析代码与文本比例
    let totalWords = 0;
    let totalCodeLines = 0;
    
    for (let day = 1; day <= 7; day++) {
      const complexity = this.metrics.contentComplexity[`day${day}`];
      if (complexity && complexity.factors) {
        totalWords += complexity.factors.wordCount || 0;
        totalCodeLines += (complexity.factors.codeBlocks || 0) * 10; // 估算每个代码块10行
      }
    }
    
    practicalMetrics.codeToTextRatio = totalCodeLines / (totalWords + totalCodeLines);
    
    // 检查可运行示例
    practicalMetrics.runnableExamples = await this.countRunnableExamples();
    
    // 评估真实世界相关性
    practicalMetrics.realWorldRelevance = this.assessRealWorldRelevance();
    
    // 评估技能递进
    practicalMetrics.skillProgression = this.assessSkillProgression();
    
    this.metrics.practicalValue = practicalMetrics;
  }

  /**
   * 统计可运行示例数量
   */
  async countRunnableExamples() {
    let count = 0;
    
    for (let day = 1; day <= 7; day++) {
      const sourcePath = `../${day}_*/source`;
      const dirs = await fs.glob(sourcePath);
      
      for (const dir of dirs) {
        if (await fs.pathExists(path.join(dir, 'package.json'))) {
          count++;
        }
      }
    }
    
    return count;
  }

  /**
   * 评估真实世界相关性
   */
  assessRealWorldRelevance() {
    const relevantTopics = [
      '性能优化', '错误处理', '用户体验', '响应式设计',
      '部署', '测试', '代码组织', '最佳实践'
    ];
    
    // 这里应该检查教程内容是否涵盖这些主题
    // 简化实现，返回估算值
    return 7.5; // 10分制
  }

  /**
   * 评估技能递进
   */
  assessSkillProgression() {
    const skills = [
      '基础概念理解', '代码编写能力', '问题解决能力',
      '项目构建能力', '调试能力', '优化能力', '部署能力'
    ];
    
    // 检查每天是否都有技能提升
    const progression = this.metrics.learningCurve.progression;
    const hasProgression = progression.every((score, i) => 
      i === 0 || score >= progression[i - 1]
    );
    
    return hasProgression ? 8.5 : 6.0;
  }

  /**
   * 分析用户体验
   */
  async analyzeUserExperience() {
    console.log(chalk.yellow('👤 分析用户体验...'));
    
    const uxMetrics = {
      navigationEase: 0,
      contentClarity: 0,
      visualAppeal: 0,
      interactivity: 0,
      accessibility: 0
    };
    
    // 导航便利性
    uxMetrics.navigationEase = await this.assessNavigationEase();
    
    // 内容清晰度
    uxMetrics.contentClarity = this.assessContentClarity();
    
    // 视觉吸引力
    uxMetrics.visualAppeal = await this.assessVisualAppeal();
    
    // 交互性
    uxMetrics.interactivity = await this.assessInteractivity();
    
    // 可访问性
    uxMetrics.accessibility = await this.assessAccessibility();
    
    this.metrics.userExperience = uxMetrics;
  }

  /**
   * 评估导航便利性
   */
  async assessNavigationEase() {
    // 检查是否有清晰的目录结构和导航
    const hasMainReadme = await fs.pathExists('../README.md');
    const hasClearStructure = true; // 简化实现
    
    return hasMainReadme && hasClearStructure ? 8.0 : 6.0;
  }

  /**
   * 评估内容清晰度
   */
  assessContentClarity() {
    // 基于复杂度分析结果评估
    const avgComplexity = Object.values(this.metrics.contentComplexity)
      .reduce((sum, c) => sum + c.score, 0) / 7;
    
    // 复杂度适中时清晰度最高
    if (avgComplexity >= 4 && avgComplexity <= 6) {
      return 9.0;
    } else if (avgComplexity < 4) {
      return 7.0; // 可能过于简单
    } else {
      return 6.0; // 可能过于复杂
    }
  }

  /**
   * 评估视觉吸引力
   */
  async assessVisualAppeal() {
    // 检查是否有图片、图表等视觉元素
    let visualElements = 0;
    
    for (let day = 1; day <= 7; day++) {
      const readmePath = `../${day}_*/README.md`;
      const files = await fs.glob(readmePath);
      
      for (const file of files) {
        const content = await fs.readFile(file, 'utf-8');
        if (content.includes('![') || content.includes('```mermaid')) {
          visualElements++;
        }
      }
    }
    
    return Math.min(visualElements * 1.5, 10);
  }

  /**
   * 评估交互性
   */
  async assessInteractivity() {
    // 检查可运行示例和练习的数量
    const runnableExamples = this.metrics.practicalValue.runnableExamples;
    return Math.min(runnableExamples * 1.2, 10);
  }

  /**
   * 评估可访问性
   */
  async assessAccessibility() {
    // 检查多种学习方式的支持
    const hasOnlineReader = await fs.pathExists('../online-reader');
    const hasPdfGenerator = await fs.pathExists('../pdf-generator');
    const hasEmailCourse = await fs.pathExists('../email-course');
    
    let score = 5; // 基础分
    if (hasOnlineReader) score += 2;
    if (hasPdfGenerator) score += 2;
    if (hasEmailCourse) score += 1;
    
    return score;
  }

  /**
   * 生成改进建议
   */
  generateRecommendations() {
    console.log(chalk.yellow('💡 生成改进建议...'));
    
    // 基于学习曲线的建议
    if (this.metrics.learningCurve.smoothness < 7) {
      this.recommendations.push({
        type: '学习曲线',
        priority: 'high',
        suggestion: '建议调整各章节难度，使学习曲线更加平滑'
      });
    }
    
    // 基于复杂度的建议
    const complexities = Object.values(this.metrics.contentComplexity);
    const tooComplex = complexities.filter(c => c.score > 8);
    if (tooComplex.length > 0) {
      this.recommendations.push({
        type: '内容复杂度',
        priority: 'medium',
        suggestion: `有${tooComplex.length}个章节复杂度过高，建议简化或拆分`
      });
    }
    
    // 基于实践价值的建议
    if (this.metrics.practicalValue.codeToTextRatio < 0.3) {
      this.recommendations.push({
        type: '实践价值',
        priority: 'high',
        suggestion: '建议增加更多代码示例和实践练习'
      });
    }
    
    // 基于用户体验的建议
    const uxScore = Object.values(this.metrics.userExperience)
      .reduce((sum, score) => sum + score, 0) / 5;
    
    if (uxScore < 7) {
      this.recommendations.push({
        type: '用户体验',
        priority: 'medium',
        suggestion: '建议改善用户体验，增加视觉元素和交互性'
      });
    }
  }

  /**
   * 生成分析报告
   */
  generateReport() {
    console.log(chalk.blue('\n📊 学习效果分析报告'));
    console.log('='.repeat(60));
    
    // 内容复杂度报告
    console.log(chalk.green('\n📚 内容复杂度分析:'));
    Object.entries(this.metrics.contentComplexity).forEach(([day, complexity]) => {
      console.log(`  ${day}: ${complexity.score}/10 (${complexity.level})`);
    });
    
    // 学习曲线报告
    console.log(chalk.green('\n📈 学习曲线分析:'));
    console.log(`  平滑度: ${this.metrics.learningCurve.smoothness.toFixed(1)}/10`);
    console.log(`  难度递增: ${this.metrics.learningCurve.steepness.map(s => s.toFixed(1)).join(' → ')}`);
    
    // 实践价值报告
    console.log(chalk.green('\n🛠️ 实践价值分析:'));
    const pv = this.metrics.practicalValue;
    console.log(`  代码比例: ${(pv.codeToTextRatio * 100).toFixed(1)}%`);
    console.log(`  可运行示例: ${pv.runnableExamples}个`);
    console.log(`  真实相关性: ${pv.realWorldRelevance}/10`);
    console.log(`  技能递进: ${pv.skillProgression}/10`);
    
    // 用户体验报告
    console.log(chalk.green('\n👤 用户体验分析:'));
    Object.entries(this.metrics.userExperience).forEach(([metric, score]) => {
      console.log(`  ${metric}: ${score.toFixed(1)}/10`);
    });
    
    // 改进建议
    if (this.recommendations.length > 0) {
      console.log(chalk.yellow('\n💡 改进建议:'));
      this.recommendations.forEach((rec, index) => {
        const priority = rec.priority === 'high' ? '🔴' : 
                        rec.priority === 'medium' ? '🟡' : '🟢';
        console.log(`  ${priority} [${rec.type}] ${rec.suggestion}`);
      });
    }
    
    // 总体评分
    const overallScore = this.calculateOverallScore();
    console.log(chalk.blue(`\n🎯 总体学习效果评分: ${overallScore}/100`));
    
    // 保存报告
    this.saveReport();
  }

  /**
   * 计算总体评分
   */
  calculateOverallScore() {
    const weights = {
      complexity: 0.2,
      learningCurve: 0.3,
      practicalValue: 0.3,
      userExperience: 0.2
    };
    
    const complexityScore = Object.values(this.metrics.contentComplexity)
      .reduce((sum, c) => sum + Math.min(c.score, 8), 0) / 7 * 10; // 适中复杂度得高分
    
    const curveScore = this.metrics.learningCurve.smoothness;
    
    const practicalScore = Object.values(this.metrics.practicalValue)
      .reduce((sum, score) => sum + score, 0) / 4;
    
    const uxScore = Object.values(this.metrics.userExperience)
      .reduce((sum, score) => sum + score, 0) / 5;
    
    const totalScore = 
      complexityScore * weights.complexity +
      curveScore * weights.learningCurve +
      practicalScore * weights.practicalValue +
      uxScore * weights.userExperience;
    
    return Math.round(totalScore * 10) / 10;
  }

  /**
   * 保存分析报告
   */
  async saveReport() {
    const report = {
      timestamp: new Date().toISOString(),
      metrics: this.metrics,
      recommendations: this.recommendations,
      overallScore: this.calculateOverallScore()
    };
    
    await fs.ensureDir('reports');
    await fs.writeJson('reports/learning-effectiveness.json', report, { spaces: 2 });
    
    console.log(chalk.blue('\n💾 报告已保存到 reports/learning-effectiveness.json'));
  }
}

// 运行分析
if (import.meta.url === `file://${process.argv[1]}`) {
  const analyzer = new LearningEffectivenessAnalyzer();
  analyzer.analyzeAll().catch(console.error);
}

export default LearningEffectivenessAnalyzer;
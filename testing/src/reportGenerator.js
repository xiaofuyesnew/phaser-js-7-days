#!/usr/bin/env node

import fs from 'fs-extra';
import path from 'path';
import chalk from 'chalk';

/**
 * 测试报告生成器
 * 汇总所有测试结果并生成综合报告
 */
class ReportGenerator {
  constructor() {
    this.reports = {};
    this.summary = {
      totalTests: 0,
      passedTests: 0,
      failedTests: 0,
      warnings: 0,
      overallScore: 0
    };
  }

  /**
   * 生成综合报告
   */
  async generateComprehensiveReport() {
    console.log(chalk.blue('📋 生成综合测试报告...'));
    
    // 加载所有测试报告
    await this.loadAllReports();
    
    // 计算汇总统计
    this.calculateSummary();
    
    // 生成 HTML 报告
    await this.generateHtmlReport();
    
    // 生成 Markdown 报告
    await this.generateMarkdownReport();
    
    // 生成 JSON 报告
    await this.generateJsonReport();
    
    // 显示控制台报告
    this.displayConsoleReport();
  }

  /**
   * 加载所有测试报告
   */
  async loadAllReports() {
    const reportFiles = [
      'content-validation.json',
      'example-validation.json',
      'learning-effectiveness.json'
    ];
    
    for (const file of reportFiles) {
      const filePath = path.join('reports', file);
      if (await fs.pathExists(filePath)) {
        try {
          this.reports[file.replace('.json', '')] = await fs.readJson(filePath);
        } catch (error) {
          console.warn(chalk.yellow(`⚠️  无法加载报告 ${file}: ${error.message}`));
        }
      }
    }
  }

  /**
   * 计算汇总统计
   */
  calculateSummary() {
    // 内容验证统计
    if (this.reports['content-validation']) {
      const cv = this.reports['content-validation'];
      this.summary.totalTests += cv.stats.totalFiles || 0;
      this.summary.passedTests += cv.stats.validFiles || 0;
      this.summary.failedTests += cv.errors?.length || 0;
      this.summary.warnings += cv.warnings?.length || 0;
    }
    
    // 示例验证统计
    if (this.reports['example-validation']) {
      const ev = this.reports['example-validation'];
      this.summary.totalTests += ev.stats.totalExamples || 0;
      this.summary.passedTests += ev.stats.passedExamples || 0;
      this.summary.failedTests += ev.stats.failedExamples || 0;
    }
    
    // 计算总体评分
    this.calculateOverallScore();
  }

  /**
   * 计算总体评分
   */
  calculateOverallScore() {
    let totalScore = 0;
    let scoreCount = 0;
    
    // 内容验证评分
    if (this.reports['content-validation']?.score) {
      totalScore += this.reports['content-validation'].score;
      scoreCount++;
    }
    
    // 示例验证评分
    if (this.reports['example-validation']?.stats) {
      const ev = this.reports['example-validation'].stats;
      const successRate = ev.totalExamples > 0 
        ? (ev.passedExamples / ev.totalExamples) * 100 
        : 0;
      totalScore += successRate;
      scoreCount++;
    }
    
    // 学习效果评分
    if (this.reports['learning-effectiveness']?.overallScore) {
      totalScore += this.reports['learning-effectiveness'].overallScore;
      scoreCount++;
    }
    
    this.summary.overallScore = scoreCount > 0 ? totalScore / scoreCount : 0;
  }

  /**
   * 生成 HTML 报告
   */
  async generateHtmlReport() {
    const html = `
<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Phaser.js 教程测试报告</title>
    <style>
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 1200px;
            margin: 0 auto;
            padding: 20px;
            background-color: #f5f5f5;
        }
        .header {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 30px;
            border-radius: 10px;
            text-align: center;
            margin-bottom: 30px;
        }
        .summary {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 20px;
            margin-bottom: 30px;
        }
        .metric-card {
            background: white;
            padding: 20px;
            border-radius: 8px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
            text-align: center;
        }
        .metric-value {
            font-size: 2em;
            font-weight: bold;
            color: #667eea;
        }
        .metric-label {
            color: #666;
            margin-top: 5px;
        }
        .section {
            background: white;
            margin-bottom: 20px;
            border-radius: 8px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
            overflow: hidden;
        }
        .section-header {
            background: #667eea;
            color: white;
            padding: 15px 20px;
            font-weight: bold;
        }
        .section-content {
            padding: 20px;
        }
        .progress-bar {
            background: #e0e0e0;
            border-radius: 10px;
            height: 20px;
            overflow: hidden;
            margin: 10px 0;
        }
        .progress-fill {
            height: 100%;
            background: linear-gradient(90deg, #4CAF50, #45a049);
            transition: width 0.3s ease;
        }
        .test-result {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 10px 0;
            border-bottom: 1px solid #eee;
        }
        .test-result:last-child {
            border-bottom: none;
        }
        .status-pass { color: #4CAF50; font-weight: bold; }
        .status-fail { color: #f44336; font-weight: bold; }
        .status-warn { color: #ff9800; font-weight: bold; }
        .recommendations {
            background: #fff3cd;
            border: 1px solid #ffeaa7;
            border-radius: 5px;
            padding: 15px;
            margin: 10px 0;
        }
        .chart-container {
            height: 300px;
            margin: 20px 0;
        }
        table {
            width: 100%;
            border-collapse: collapse;
            margin: 15px 0;
        }
        th, td {
            padding: 12px;
            text-align: left;
            border-bottom: 1px solid #ddd;
        }
        th {
            background-color: #f8f9fa;
            font-weight: bold;
        }
        .footer {
            text-align: center;
            color: #666;
            margin-top: 40px;
            padding: 20px;
            border-top: 1px solid #eee;
        }
    </style>
</head>
<body>
    <div class="header">
        <h1>🎮 Phaser.js 教程测试报告</h1>
        <p>生成时间: ${new Date().toLocaleString('zh-CN')}</p>
    </div>

    <div class="summary">
        <div class="metric-card">
            <div class="metric-value">${this.summary.overallScore.toFixed(1)}</div>
            <div class="metric-label">总体评分</div>
        </div>
        <div class="metric-card">
            <div class="metric-value">${this.summary.totalTests}</div>
            <div class="metric-label">总测试数</div>
        </div>
        <div class="metric-card">
            <div class="metric-value">${this.summary.passedTests}</div>
            <div class="metric-label">通过测试</div>
        </div>
        <div class="metric-card">
            <div class="metric-value">${this.summary.failedTests}</div>
            <div class="metric-label">失败测试</div>
        </div>
        <div class="metric-card">
            <div class="metric-value">${this.summary.warnings}</div>
            <div class="metric-label">警告数量</div>
        </div>
    </div>

    ${this.generateContentValidationSection()}
    ${this.generateExampleValidationSection()}
    ${this.generateLearningEffectivenessSection()}
    ${this.generateRecommendationsSection()}

    <div class="footer">
        <p>📊 报告由 Phaser.js 教程测试系统自动生成</p>
    </div>
</body>
</html>`;

    await fs.writeFile('reports/comprehensive-report.html', html);
    console.log(chalk.green('✅ HTML 报告已生成: reports/comprehensive-report.html'));
  }

  /**
   * 生成内容验证部分
   */
  generateContentValidationSection() {
    if (!this.reports['content-validation']) return '';
    
    const cv = this.reports['content-validation'];
    const successRate = cv.stats.totalFiles > 0 
      ? (cv.stats.validFiles / cv.stats.totalFiles * 100).toFixed(1)
      : 0;
    
    return `
    <div class="section">
        <div class="section-header">📚 内容验证结果</div>
        <div class="section-content">
            <div class="progress-bar">
                <div class="progress-fill" style="width: ${successRate}%"></div>
            </div>
            <p>验证成功率: ${successRate}%</p>
            
            <table>
                <tr><th>指标</th><th>数值</th></tr>
                <tr><td>验证文件数</td><td>${cv.stats.validFiles}/${cv.stats.totalFiles}</td></tr>
                <tr><td>代码块数</td><td>${cv.stats.validCodeBlocks}/${cv.stats.codeBlocks}</td></tr>
                <tr><td>概念解释</td><td>${cv.stats.concepts}</td></tr>
                <tr><td>练习项目</td><td>${cv.stats.exercises}</td></tr>
            </table>
            
            ${cv.errors && cv.errors.length > 0 ? `
            <h4>❌ 错误 (${cv.errors.length})</h4>
            <ul>
                ${cv.errors.map(error => `<li class="status-fail">${error}</li>`).join('')}
            </ul>
            ` : ''}
            
            ${cv.warnings && cv.warnings.length > 0 ? `
            <h4>⚠️ 警告 (${cv.warnings.length})</h4>
            <ul>
                ${cv.warnings.map(warning => `<li class="status-warn">${warning}</li>`).join('')}
            </ul>
            ` : ''}
        </div>
    </div>`;
  }

  /**
   * 生成示例验证部分
   */
  generateExampleValidationSection() {
    if (!this.reports['example-validation']) return '';
    
    const ev = this.reports['example-validation'];
    const successRate = ev.stats.totalExamples > 0 
      ? (ev.stats.passedExamples / ev.stats.totalExamples * 100).toFixed(1)
      : 0;
    
    return `
    <div class="section">
        <div class="section-header">🧪 代码示例验证结果</div>
        <div class="section-content">
            <div class="progress-bar">
                <div class="progress-fill" style="width: ${successRate}%"></div>
            </div>
            <p>验证成功率: ${successRate}%</p>
            
            <table>
                <tr><th>状态</th><th>数量</th></tr>
                <tr><td class="status-pass">通过</td><td>${ev.stats.passedExamples}</td></tr>
                <tr><td class="status-fail">失败</td><td>${ev.stats.failedExamples}</td></tr>
                <tr><td class="status-warn">跳过</td><td>${ev.stats.skippedExamples}</td></tr>
            </table>
            
            ${ev.results && ev.results.length > 0 ? `
            <h4>详细结果</h4>
            ${ev.results.map(result => `
                <div class="test-result">
                    <span>${result.example}</span>
                    <span class="status-${result.status.toLowerCase()}">${result.status}: ${result.message}</span>
                </div>
            `).join('')}
            ` : ''}
        </div>
    </div>`;
  }

  /**
   * 生成学习效果部分
   */
  generateLearningEffectivenessSection() {
    if (!this.reports['learning-effectiveness']) return '';
    
    const le = this.reports['learning-effectiveness'];
    
    return `
    <div class="section">
        <div class="section-header">📈 学习效果分析</div>
        <div class="section-content">
            <p>总体评分: <strong>${le.overallScore}/100</strong></p>
            
            <h4>内容复杂度分析</h4>
            <table>
                <tr><th>章节</th><th>复杂度评分</th><th>难度等级</th></tr>
                ${Object.entries(le.metrics.contentComplexity).map(([day, complexity]) => `
                    <tr>
                        <td>${day}</td>
                        <td>${complexity.score}/10</td>
                        <td>${complexity.level}</td>
                    </tr>
                `).join('')}
            </table>
            
            <h4>用户体验指标</h4>
            <table>
                <tr><th>指标</th><th>评分</th></tr>
                ${Object.entries(le.metrics.userExperience).map(([metric, score]) => `
                    <tr>
                        <td>${metric}</td>
                        <td>${score.toFixed(1)}/10</td>
                    </tr>
                `).join('')}
            </table>
        </div>
    </div>`;
  }

  /**
   * 生成建议部分
   */
  generateRecommendationsSection() {
    const allRecommendations = [];
    
    // 收集所有建议
    if (this.reports['learning-effectiveness']?.recommendations) {
      allRecommendations.push(...this.reports['learning-effectiveness'].recommendations);
    }
    
    if (allRecommendations.length === 0) return '';
    
    return `
    <div class="section">
        <div class="section-header">💡 改进建议</div>
        <div class="section-content">
            ${allRecommendations.map(rec => `
                <div class="recommendations">
                    <strong>[${rec.type}]</strong> ${rec.suggestion}
                    <br><small>优先级: ${rec.priority}</small>
                </div>
            `).join('')}
        </div>
    </div>`;
  }

  /**
   * 生成 Markdown 报告
   */
  async generateMarkdownReport() {
    const markdown = `# Phaser.js 教程测试报告

生成时间: ${new Date().toLocaleString('zh-CN')}

## 📊 测试概览

| 指标 | 数值 |
|------|------|
| 总体评分 | ${this.summary.overallScore.toFixed(1)}/100 |
| 总测试数 | ${this.summary.totalTests} |
| 通过测试 | ${this.summary.passedTests} |
| 失败测试 | ${this.summary.failedTests} |
| 警告数量 | ${this.summary.warnings} |

## 📚 内容验证结果

${this.generateMarkdownContentValidation()}

## 🧪 代码示例验证结果

${this.generateMarkdownExampleValidation()}

## 📈 学习效果分析

${this.generateMarkdownLearningEffectiveness()}

## 💡 改进建议

${this.generateMarkdownRecommendations()}

---

*报告由 Phaser.js 教程测试系统自动生成*
`;

    await fs.writeFile('reports/comprehensive-report.md', markdown);
    console.log(chalk.green('✅ Markdown 报告已生成: reports/comprehensive-report.md'));
  }

  generateMarkdownContentValidation() {
    if (!this.reports['content-validation']) return '暂无数据';
    
    const cv = this.reports['content-validation'];
    return `
- 验证文件: ${cv.stats.validFiles}/${cv.stats.totalFiles}
- 代码块: ${cv.stats.validCodeBlocks}/${cv.stats.codeBlocks}
- 概念解释: ${cv.stats.concepts}
- 练习项目: ${cv.stats.exercises}
- 质量评分: ${cv.score}/100
`;
  }

  generateMarkdownExampleValidation() {
    if (!this.reports['example-validation']) return '暂无数据';
    
    const ev = this.reports['example-validation'];
    const successRate = ev.stats.totalExamples > 0 
      ? (ev.stats.passedExamples / ev.stats.totalExamples * 100).toFixed(1)
      : 0;
    
    return `
- 成功率: ${successRate}%
- 通过: ${ev.stats.passedExamples}
- 失败: ${ev.stats.failedExamples}
- 跳过: ${ev.stats.skippedExamples}
`;
  }

  generateMarkdownLearningEffectiveness() {
    if (!this.reports['learning-effectiveness']) return '暂无数据';
    
    const le = this.reports['learning-effectiveness'];
    return `
- 总体评分: ${le.overallScore}/100
- 学习曲线平滑度: ${le.metrics.learningCurve.smoothness.toFixed(1)}/10
- 实践价值评分: ${Object.values(le.metrics.practicalValue).reduce((a, b) => a + b, 0) / 4}/10
- 用户体验评分: ${Object.values(le.metrics.userExperience).reduce((a, b) => a + b, 0) / 5}/10
`;
  }

  generateMarkdownRecommendations() {
    const allRecommendations = [];
    
    if (this.reports['learning-effectiveness']?.recommendations) {
      allRecommendations.push(...this.reports['learning-effectiveness'].recommendations);
    }
    
    if (allRecommendations.length === 0) return '暂无建议';
    
    return allRecommendations.map(rec => 
      `- **[${rec.type}]** ${rec.suggestion} (优先级: ${rec.priority})`
    ).join('\n');
  }

  /**
   * 生成 JSON 报告
   */
  async generateJsonReport() {
    const jsonReport = {
      timestamp: new Date().toISOString(),
      summary: this.summary,
      reports: this.reports,
      metadata: {
        version: '1.0.0',
        generator: 'Phaser.js Tutorial Testing System'
      }
    };
    
    await fs.writeJson('reports/comprehensive-report.json', jsonReport, { spaces: 2 });
    console.log(chalk.green('✅ JSON 报告已生成: reports/comprehensive-report.json'));
  }

  /**
   * 显示控制台报告
   */
  displayConsoleReport() {
    console.log(chalk.blue('\n📋 综合测试报告'));
    console.log('='.repeat(60));
    
    console.log(chalk.green(`\n📊 测试概览:`));
    console.log(`  总体评分: ${this.summary.overallScore.toFixed(1)}/100`);
    console.log(`  总测试数: ${this.summary.totalTests}`);
    console.log(`  通过测试: ${this.summary.passedTests}`);
    console.log(`  失败测试: ${this.summary.failedTests}`);
    console.log(`  警告数量: ${this.summary.warnings}`);
    
    const successRate = this.summary.totalTests > 0 
      ? (this.summary.passedTests / this.summary.totalTests * 100).toFixed(1)
      : 0;
    console.log(`  成功率: ${successRate}%`);
    
    // 评分等级
    let grade = 'F';
    if (this.summary.overallScore >= 90) grade = 'A';
    else if (this.summary.overallScore >= 80) grade = 'B';
    else if (this.summary.overallScore >= 70) grade = 'C';
    else if (this.summary.overallScore >= 60) grade = 'D';
    
    console.log(chalk.blue(`\n🎯 教程质量等级: ${grade}`));
    
    console.log(chalk.blue('\n📁 报告文件:'));
    console.log('  - reports/comprehensive-report.html (详细HTML报告)');
    console.log('  - reports/comprehensive-report.md (Markdown报告)');
    console.log('  - reports/comprehensive-report.json (JSON数据)');
  }
}

// 运行报告生成
if (import.meta.url === `file://${process.argv[1]}`) {
  const generator = new ReportGenerator();
  generator.generateComprehensiveReport().catch(console.error);
}

export default ReportGenerator;
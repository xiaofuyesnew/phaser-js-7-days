import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * 完整游戏测试工具
 * 自动化测试游戏的各个方面
 */
class GameTester {
    constructor() {
        this.projectRoot = path.resolve(__dirname, '..');
        this.testResults = {
            timestamp: new Date().toISOString(),
            tests: [],
            summary: {
                total: 0,
                passed: 0,
                failed: 0,
                warnings: 0
            }
        };
    }
    
    async runAllTests() {
        console.log('🧪 开始完整游戏测试...');
        
        try {
            // 1. 文件结构测试
            await this.testFileStructure();
            
            // 2. 构建测试
            await this.testBuild();
            
            // 3. 性能测试
            await this.testPerformance();
            
            // 4. 功能测试
            await this.testGameFunctionality();
            
            // 5. 兼容性测试
            await this.testCompatibility();
            
            // 6. PWA测试
            await this.testPWA();
            
            // 7. 部署准备测试
            await this.testDeploymentReadiness();
            
            // 生成测试报告
            await this.generateTestReport();
            
            console.log('✅ 所有测试完成');
            
        } catch (error) {
            console.error('❌ 测试过程中发生错误:', error.message);
            process.exit(1);
        }
    }
    
    async testFileStructure() {
        console.log('📁 测试文件结构...');
        
        const requiredFiles = [
            'package.json',
            'vite.config.js',
            'index.html',
            'src/main.js',
            'src/examples/CompleteGameDemo.js',
            'src/utils/PerformanceMonitor.js',
            'src/utils/ResponsiveManager.js',
            'src/utils/ErrorHandler.js',
            'src/utils/Logger.js',
            'src/controls/TouchControls.js',
            'public/manifest.json',
            'public/sw.js',
            'scripts/deploy.js',
            'scripts/performance-test.js',
            'scripts/build-optimize.js'
        ];
        
        const requiredDirectories = [
            'src',
            'src/examples',
            'src/utils',
            'src/controls',
            'src/scenes',
            'public',
            'scripts'
        ];
        
        let passed = 0;
        let failed = 0;
        
        // 检查文件
        for (const file of requiredFiles) {
            const filePath = path.join(this.projectRoot, file);
            if (fs.existsSync(filePath)) {
                passed++;
                this.addTestResult('file-structure', `文件存在: ${file}`, 'pass');
            } else {
                failed++;
                this.addTestResult('file-structure', `文件缺失: ${file}`, 'fail');
            }
        }
        
        // 检查目录
        for (const dir of requiredDirectories) {
            const dirPath = path.join(this.projectRoot, dir);
            if (fs.existsSync(dirPath) && fs.statSync(dirPath).isDirectory()) {
                passed++;
                this.addTestResult('file-structure', `目录存在: ${dir}`, 'pass');
            } else {
                failed++;
                this.addTestResult('file-structure', `目录缺失: ${dir}`, 'fail');
            }
        }
        
        console.log(`  文件结构测试: ${passed} 通过, ${failed} 失败`);
    }
    
    async testBuild() {
        console.log('🔨 测试构建过程...');
        
        try {
            // 检查package.json
            const packagePath = path.join(this.projectRoot, 'package.json');
            const packageJson = JSON.parse(fs.readFileSync(packagePath, 'utf8'));
            
            // 检查必要的脚本
            const requiredScripts = ['dev', 'build', 'build:optimize', 'preview'];
            for (const script of requiredScripts) {
                if (packageJson.scripts && packageJson.scripts[script]) {
                    this.addTestResult('build', `脚本存在: ${script}`, 'pass');
                } else {
                    this.addTestResult('build', `脚本缺失: ${script}`, 'fail');
                }
            }
            
            // 检查依赖
            const requiredDeps = ['phaser'];
            for (const dep of requiredDeps) {
                if (packageJson.dependencies && packageJson.dependencies[dep]) {
                    this.addTestResult('build', `依赖存在: ${dep}`, 'pass');
                } else {
                    this.addTestResult('build', `依赖缺失: ${dep}`, 'fail');
                }
            }
            
            // 检查Vite配置
            const viteConfigPath = path.join(this.projectRoot, 'vite.config.js');
            if (fs.existsSync(viteConfigPath)) {
                const viteConfig = fs.readFileSync(viteConfigPath, 'utf8');
                if (viteConfig.includes('build') && viteConfig.includes('rollupOptions')) {
                    this.addTestResult('build', 'Vite配置正确', 'pass');
                } else {
                    this.addTestResult('build', 'Vite配置可能不完整', 'warning');
                }
            }
            
        } catch (error) {
            this.addTestResult('build', `构建测试失败: ${error.message}`, 'fail');
        }
    }
    
    async testPerformance() {
        console.log('⚡ 测试性能配置...');
        
        try {
            // 检查性能监控器
            const perfMonitorPath = path.join(this.projectRoot, 'src/utils/PerformanceMonitor.js');
            if (fs.existsSync(perfMonitorPath)) {
                const perfMonitor = fs.readFileSync(perfMonitorPath, 'utf8');
                if (perfMonitor.includes('fps') && perfMonitor.includes('memory')) {
                    this.addTestResult('performance', '性能监控器配置正确', 'pass');
                } else {
                    this.addTestResult('performance', '性能监控器配置不完整', 'warning');
                }
            } else {
                this.addTestResult('performance', '性能监控器文件缺失', 'fail');
            }
            
            // 检查对象池
            const objectPoolPath = path.join(this.projectRoot, 'src/utils/ObjectPool.js');
            if (fs.existsSync(objectPoolPath)) {
                this.addTestResult('performance', '对象池实现存在', 'pass');
            } else {
                this.addTestResult('performance', '对象池实现缺失', 'warning');
            }
            
            // 检查性能测试脚本
            const perfTestPath = path.join(this.projectRoot, 'scripts/performance-test.js');
            if (fs.existsSync(perfTestPath)) {
                this.addTestResult('performance', '性能测试脚本存在', 'pass');
            } else {
                this.addTestResult('performance', '性能测试脚本缺失', 'fail');
            }
            
        } catch (error) {
            this.addTestResult('performance', `性能测试失败: ${error.message}`, 'fail');
        }
    }
    
    async testGameFunctionality() {
        console.log('🎮 测试游戏功能...');
        
        try {
            // 检查主游戏文件
            const mainGamePath = path.join(this.projectRoot, 'src/examples/CompleteGameDemo.js');
            if (fs.existsSync(mainGamePath)) {
                const gameCode = fs.readFileSync(mainGamePath, 'utf8');
                
                // 检查核心游戏功能
                const features = [
                    { name: '玩家控制', pattern: /updatePlayer|player.*velocity/i },
                    { name: '敌人系统', pattern: /enemy|spawnEnemy/i },
                    { name: '碰撞检测', pattern: /collision|overlap/i },
                    { name: '分数系统', pattern: /score|addScore/i },
                    { name: '音效系统', pattern: /sound|audio|playSound/i },
                    { name: 'UI系统', pattern: /ui|text.*score/i },
                    { name: '游戏状态', pattern: /gameState|gameOver/i },
                    { name: '输入处理', pattern: /input|keyboard|touch/i }
                ];
                
                for (const feature of features) {
                    if (feature.pattern.test(gameCode)) {
                        this.addTestResult('functionality', `${feature.name}功能存在`, 'pass');
                    } else {
                        this.addTestResult('functionality', `${feature.name}功能缺失`, 'fail');
                    }
                }
                
                // 检查错误处理
                if (gameCode.includes('try') && gameCode.includes('catch')) {
                    this.addTestResult('functionality', '包含错误处理', 'pass');
                } else {
                    this.addTestResult('functionality', '缺少错误处理', 'warning');
                }
                
            } else {
                this.addTestResult('functionality', '主游戏文件缺失', 'fail');
            }
            
        } catch (error) {
            this.addTestResult('functionality', `功能测试失败: ${error.message}`, 'fail');
        }
    }
    
    async testCompatibility() {
        console.log('🌐 测试兼容性配置...');
        
        try {
            // 检查响应式管理器
            const responsivePath = path.join(this.projectRoot, 'src/utils/ResponsiveManager.js');
            if (fs.existsSync(responsivePath)) {
                this.addTestResult('compatibility', '响应式管理器存在', 'pass');
            } else {
                this.addTestResult('compatibility', '响应式管理器缺失', 'warning');
            }
            
            // 检查触摸控制
            const touchPath = path.join(this.projectRoot, 'src/controls/TouchControls.js');
            if (fs.existsSync(touchPath)) {
                this.addTestResult('compatibility', '触摸控制存在', 'pass');
            } else {
                this.addTestResult('compatibility', '触摸控制缺失', 'warning');
            }
            
            // 检查CSS媒体查询
            const stylePath = path.join(this.projectRoot, 'src/style/index.css');
            if (fs.existsSync(stylePath)) {
                const css = fs.readFileSync(stylePath, 'utf8');
                if (css.includes('@media')) {
                    this.addTestResult('compatibility', 'CSS媒体查询存在', 'pass');
                } else {
                    this.addTestResult('compatibility', 'CSS媒体查询缺失', 'warning');
                }
            }
            
        } catch (error) {
            this.addTestResult('compatibility', `兼容性测试失败: ${error.message}`, 'fail');
        }
    }
    
    async testPWA() {
        console.log('📱 测试PWA配置...');
        
        try {
            // 检查manifest.json
            const manifestPath = path.join(this.projectRoot, 'public/manifest.json');
            if (fs.existsSync(manifestPath)) {
                const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
                
                const requiredFields = ['name', 'short_name', 'start_url', 'display', 'theme_color'];
                for (const field of requiredFields) {
                    if (manifest[field]) {
                        this.addTestResult('pwa', `Manifest字段存在: ${field}`, 'pass');
                    } else {
                        this.addTestResult('pwa', `Manifest字段缺失: ${field}`, 'fail');
                    }
                }
                
                if (manifest.icons && manifest.icons.length > 0) {
                    this.addTestResult('pwa', 'Manifest图标配置存在', 'pass');
                } else {
                    this.addTestResult('pwa', 'Manifest图标配置缺失', 'warning');
                }
                
            } else {
                this.addTestResult('pwa', 'manifest.json文件缺失', 'fail');
            }
            
            // 检查Service Worker
            const swPath = path.join(this.projectRoot, 'public/sw.js');
            if (fs.existsSync(swPath)) {
                const sw = fs.readFileSync(swPath, 'utf8');
                if (sw.includes('install') && sw.includes('fetch')) {
                    this.addTestResult('pwa', 'Service Worker配置正确', 'pass');
                } else {
                    this.addTestResult('pwa', 'Service Worker配置不完整', 'warning');
                }
            } else {
                this.addTestResult('pwa', 'Service Worker文件缺失', 'fail');
            }
            
        } catch (error) {
            this.addTestResult('pwa', `PWA测试失败: ${error.message}`, 'fail');
        }
    }
    
    async testDeploymentReadiness() {
        console.log('🚀 测试部署准备...');
        
        try {
            // 检查部署脚本
            const deployScriptPath = path.join(this.projectRoot, 'scripts/deploy.js');
            if (fs.existsSync(deployScriptPath)) {
                const deployScript = fs.readFileSync(deployScriptPath, 'utf8');
                
                const platforms = ['github', 'vercel', 'netlify'];
                for (const platform of platforms) {
                    if (deployScript.includes(platform)) {
                        this.addTestResult('deployment', `${platform}部署支持存在`, 'pass');
                    } else {
                        this.addTestResult('deployment', `${platform}部署支持缺失`, 'warning');
                    }
                }
            } else {
                this.addTestResult('deployment', '部署脚本缺失', 'fail');
            }
            
            // 检查GitHub Actions
            const actionsPath = path.join(this.projectRoot, '.github/workflows/deploy.yml');
            if (fs.existsSync(actionsPath)) {
                this.addTestResult('deployment', 'GitHub Actions配置存在', 'pass');
            } else {
                this.addTestResult('deployment', 'GitHub Actions配置缺失', 'warning');
            }
            
            // 检查构建优化脚本
            const optimizePath = path.join(this.projectRoot, 'scripts/build-optimize.js');
            if (fs.existsSync(optimizePath)) {
                this.addTestResult('deployment', '构建优化脚本存在', 'pass');
            } else {
                this.addTestResult('deployment', '构建优化脚本缺失', 'warning');
            }
            
        } catch (error) {
            this.addTestResult('deployment', `部署测试失败: ${error.message}`, 'fail');
        }
    }
    
    addTestResult(category, message, status) {
        this.testResults.tests.push({
            category,
            message,
            status,
            timestamp: new Date().toISOString()
        });
        
        this.testResults.summary.total++;
        
        switch (status) {
            case 'pass':
                this.testResults.summary.passed++;
                break;
            case 'fail':
                this.testResults.summary.failed++;
                break;
            case 'warning':
                this.testResults.summary.warnings++;
                break;
        }
    }
    
    async generateTestReport() {
        console.log('📋 生成测试报告...');
        
        // 控制台输出
        this.printConsoleReport();
        
        // 生成JSON报告
        const reportPath = path.join(this.projectRoot, 'test-report.json');
        fs.writeFileSync(reportPath, JSON.stringify(this.testResults, null, 2));
        
        // 生成HTML报告
        await this.generateHTMLReport();
        
        console.log(`  测试报告已保存到: test-report.json 和 test-report.html`);
    }
    
    printConsoleReport() {
        console.log('\n🧪 游戏测试报告');
        console.log('='.repeat(50));
        
        // 总体统计
        console.log('\n📊 测试统计:');
        console.log(`  总测试数: ${this.testResults.summary.total}`);
        console.log(`  通过: ${this.testResults.summary.passed} ✅`);
        console.log(`  失败: ${this.testResults.summary.failed} ❌`);
        console.log(`  警告: ${this.testResults.summary.warnings} ⚠️`);
        
        const successRate = ((this.testResults.summary.passed / this.testResults.summary.total) * 100).toFixed(1);
        console.log(`  成功率: ${successRate}%`);
        
        // 按类别分组显示结果
        const categories = [...new Set(this.testResults.tests.map(t => t.category))];
        
        categories.forEach(category => {
            console.log(`\n📋 ${category.toUpperCase()}:`);
            const categoryTests = this.testResults.tests.filter(t => t.category === category);
            
            categoryTests.forEach(test => {
                const icon = test.status === 'pass' ? '✅' : test.status === 'fail' ? '❌' : '⚠️';
                console.log(`  ${icon} ${test.message}`);
            });
        });
        
        // 建议
        console.log('\n💡 建议:');
        if (this.testResults.summary.failed > 0) {
            console.log('  - 修复所有失败的测试项');
        }
        if (this.testResults.summary.warnings > 0) {
            console.log('  - 考虑解决警告项以提高游戏质量');
        }
        if (this.testResults.summary.failed === 0 && this.testResults.summary.warnings === 0) {
            console.log('  - 🎉 所有测试通过！游戏已准备好部署');
        }
        
        console.log('='.repeat(50));
    }
    
    async generateHTMLReport() {
        const htmlReport = `
<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>游戏测试报告</title>
    <style>
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 1200px;
            margin: 0 auto;
            padding: 20px;
            background: #f5f5f5;
        }
        .container {
            background: white;
            border-radius: 8px;
            padding: 30px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        }
        h1, h2 { color: #2c3e50; }
        .summary {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 20px;
            margin: 20px 0;
        }
        .stat-card {
            background: #f8f9fa;
            padding: 20px;
            border-radius: 6px;
            text-align: center;
        }
        .stat-value {
            font-size: 32px;
            font-weight: bold;
            margin-bottom: 5px;
        }
        .stat-label { color: #7f8c8d; }
        .pass { color: #27ae60; }
        .fail { color: #e74c3c; }
        .warning { color: #f39c12; }
        .test-category {
            margin: 30px 0;
            border: 1px solid #ddd;
            border-radius: 6px;
            overflow: hidden;
        }
        .category-header {
            background: #3498db;
            color: white;
            padding: 15px 20px;
            font-weight: bold;
            text-transform: uppercase;
        }
        .test-item {
            padding: 10px 20px;
            border-bottom: 1px solid #eee;
            display: flex;
            align-items: center;
        }
        .test-item:last-child { border-bottom: none; }
        .test-icon {
            margin-right: 10px;
            font-size: 18px;
        }
        .success-rate {
            font-size: 24px;
            font-weight: bold;
            text-align: center;
            margin: 20px 0;
            padding: 20px;
            border-radius: 6px;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
        }
    </style>
</head>
<body>
    <div class="container">
        <h1>🧪 游戏测试报告</h1>
        <p><strong>生成时间:</strong> ${new Date(this.testResults.timestamp).toLocaleString('zh-CN')}</p>
        
        <div class="summary">
            <div class="stat-card">
                <div class="stat-value">${this.testResults.summary.total}</div>
                <div class="stat-label">总测试数</div>
            </div>
            <div class="stat-card">
                <div class="stat-value pass">${this.testResults.summary.passed}</div>
                <div class="stat-label">通过</div>
            </div>
            <div class="stat-card">
                <div class="stat-value fail">${this.testResults.summary.failed}</div>
                <div class="stat-label">失败</div>
            </div>
            <div class="stat-card">
                <div class="stat-value warning">${this.testResults.summary.warnings}</div>
                <div class="stat-label">警告</div>
            </div>
        </div>
        
        <div class="success-rate">
            成功率: ${((this.testResults.summary.passed / this.testResults.summary.total) * 100).toFixed(1)}%
        </div>
        
        ${[...new Set(this.testResults.tests.map(t => t.category))].map(category => {
            const categoryTests = this.testResults.tests.filter(t => t.category === category);
            return `
                <div class="test-category">
                    <div class="category-header">${category}</div>
                    ${categoryTests.map(test => `
                        <div class="test-item">
                            <span class="test-icon">
                                ${test.status === 'pass' ? '✅' : test.status === 'fail' ? '❌' : '⚠️'}
                            </span>
                            <span class="${test.status}">${test.message}</span>
                        </div>
                    `).join('')}
                </div>
            `;
        }).join('')}
        
        <h2>💡 建议</h2>
        <ul>
            ${this.testResults.summary.failed > 0 ? '<li>修复所有失败的测试项</li>' : ''}
            ${this.testResults.summary.warnings > 0 ? '<li>考虑解决警告项以提高游戏质量</li>' : ''}
            ${this.testResults.summary.failed === 0 && this.testResults.summary.warnings === 0 ? 
                '<li>🎉 所有测试通过！游戏已准备好部署</li>' : ''}
        </ul>
        
        <footer style="margin-top: 40px; padding-top: 20px; border-top: 1px solid #ddd; color: #666; text-align: center;">
            <p>游戏测试报告 - 生成于 ${new Date().toLocaleString('zh-CN')}</p>
        </footer>
    </div>
</body>
</html>
        `.trim();
        
        const htmlPath = path.join(this.projectRoot, 'test-report.html');
        fs.writeFileSync(htmlPath, htmlReport);
    }
}

// 主执行逻辑
async function main() {
    const tester = new GameTester();
    
    try {
        await tester.runAllTests();
        
        // 根据测试结果设置退出码
        if (tester.testResults.summary.failed > 0) {
            console.log('\n❌ 测试失败，请修复问题后重试');
            process.exit(1);
        } else {
            console.log('\n✅ 所有测试通过！');
            process.exit(0);
        }
        
    } catch (error) {
        console.error('测试过程中发生错误:', error.message);
        process.exit(1);
    }
}

// 如果直接运行此脚本
if (import.meta.url === `file://${process.argv[1]}`) {
    main();
}
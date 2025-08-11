import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * 性能测试工具
 * 分析构建产物的大小、加载性能等指标
 */
class PerformanceTester {
    constructor() {
        this.projectRoot = path.resolve(__dirname, '..');
        this.distDir = path.join(this.projectRoot, 'dist');
        this.results = {
            timestamp: new Date().toISOString(),
            files: [],
            summary: {},
            recommendations: []
        };
    }
    
    async runTests() {
        console.log('🔍 开始性能测试...');
        
        if (!fs.existsSync(this.distDir)) {
            throw new Error('dist目录不存在，请先运行构建');
        }
        
        // 1. 分析文件大小
        await this.analyzeFileSize();
        
        // 2. 分析资源类型
        await this.analyzeResourceTypes();
        
        // 3. 检查压缩效果
        await this.checkCompression();
        
        // 4. 分析依赖关系
        await this.analyzeDependencies();
        
        // 5. 生成建议
        await this.generateRecommendations();
        
        // 6. 输出报告
        await this.generateReport();
        
        console.log('✅ 性能测试完成');
    }
    
    async analyzeFileSize() {
        console.log('📊 分析文件大小...');
        
        const files = this.getAllFiles(this.distDir);
        
        files.forEach(filePath => {
            const relativePath = path.relative(this.distDir, filePath);
            const stat = fs.statSync(filePath);
            const ext = path.extname(filePath).toLowerCase();
            
            this.results.files.push({
                path: relativePath,
                size: stat.size,
                sizeFormatted: this.formatBytes(stat.size),
                type: this.getFileType(ext),
                extension: ext
            });
        });
        
        // 按大小排序
        this.results.files.sort((a, b) => b.size - a.size);
        
        console.log(`  分析了 ${files.length} 个文件`);
    }
    
    async analyzeResourceTypes() {
        console.log('📈 分析资源类型...');
        
        const typeStats = {};
        let totalSize = 0;
        
        this.results.files.forEach(file => {
            const type = file.type;
            if (!typeStats[type]) {
                typeStats[type] = {
                    count: 0,
                    size: 0,
                    files: []
                };
            }
            
            typeStats[type].count++;
            typeStats[type].size += file.size;
            typeStats[type].files.push(file.path);
            totalSize += file.size;
        });
        
        // 计算百分比
        Object.keys(typeStats).forEach(type => {
            typeStats[type].percentage = ((typeStats[type].size / totalSize) * 100).toFixed(1);
            typeStats[type].sizeFormatted = this.formatBytes(typeStats[type].size);
        });
        
        this.results.summary.resourceTypes = typeStats;
        this.results.summary.totalSize = totalSize;
        this.results.summary.totalSizeFormatted = this.formatBytes(totalSize);
        
        console.log(`  总大小: ${this.formatBytes(totalSize)}`);
    }
    
    async checkCompression() {
        console.log('🗜️ 检查压缩效果...');
        
        const compressionStats = {
            compressible: 0,
            nonCompressible: 0,
            potentialSavings: 0
        };
        
        this.results.files.forEach(file => {
            if (this.isCompressible(file.extension)) {
                compressionStats.compressible += file.size;
                
                // 估算压缩后大小（简化计算）
                const estimatedCompressed = file.size * this.getCompressionRatio(file.type);
                compressionStats.potentialSavings += file.size - estimatedCompressed;
            } else {
                compressionStats.nonCompressible += file.size;
            }
        });
        
        this.results.summary.compression = {
            compressibleSize: this.formatBytes(compressionStats.compressible),
            nonCompressibleSize: this.formatBytes(compressionStats.nonCompressible),
            potentialSavings: this.formatBytes(compressionStats.potentialSavings),
            compressionRatio: ((compressionStats.potentialSavings / compressionStats.compressible) * 100).toFixed(1) + '%'
        };
        
        console.log(`  可压缩文件: ${this.formatBytes(compressionStats.compressible)}`);
        console.log(`  预计节省: ${this.formatBytes(compressionStats.potentialSavings)}`);
    }
    
    async analyzeDependencies() {
        console.log('🔗 分析依赖关系...');
        
        // 查找JavaScript文件
        const jsFiles = this.results.files.filter(file => 
            file.extension === '.js' && !file.path.includes('node_modules')
        );
        
        const dependencies = {
            vendor: [],
            app: [],
            chunks: []
        };
        
        jsFiles.forEach(file => {
            if (file.path.includes('vendor') || file.path.includes('phaser')) {
                dependencies.vendor.push(file);
            } else if (file.path.includes('chunk')) {
                dependencies.chunks.push(file);
            } else {
                dependencies.app.push(file);
            }
        });
        
        this.results.summary.dependencies = {
            vendorSize: this.formatBytes(dependencies.vendor.reduce((sum, f) => sum + f.size, 0)),
            appSize: this.formatBytes(dependencies.app.reduce((sum, f) => sum + f.size, 0)),
            chunksSize: this.formatBytes(dependencies.chunks.reduce((sum, f) => sum + f.size, 0)),
            vendorCount: dependencies.vendor.length,
            appCount: dependencies.app.length,
            chunksCount: dependencies.chunks.length
        };
        
        console.log(`  第三方库: ${dependencies.vendor.length} 个文件`);
        console.log(`  应用代码: ${dependencies.app.length} 个文件`);
        console.log(`  代码分块: ${dependencies.chunks.length} 个文件`);
    }
    
    async generateRecommendations() {
        console.log('💡 生成优化建议...');
        
        const recommendations = [];
        
        // 检查大文件
        const largeFiles = this.results.files.filter(file => file.size > 500 * 1024); // 500KB
        if (largeFiles.length > 0) {
            recommendations.push({
                type: 'warning',
                category: '文件大小',
                message: `发现 ${largeFiles.length} 个大文件 (>500KB)`,
                details: largeFiles.map(f => `${f.path}: ${f.sizeFormatted}`),
                suggestion: '考虑代码分割、懒加载或资源压缩'
            });
        }
        
        // 检查图片优化
        const imageFiles = this.results.files.filter(file => 
            ['.png', '.jpg', '.jpeg', '.gif'].includes(file.extension)
        );
        const largeImages = imageFiles.filter(file => file.size > 100 * 1024); // 100KB
        if (largeImages.length > 0) {
            recommendations.push({
                type: 'info',
                category: '图片优化',
                message: `发现 ${largeImages.length} 个大图片文件 (>100KB)`,
                details: largeImages.map(f => `${f.path}: ${f.sizeFormatted}`),
                suggestion: '考虑使用WebP格式、压缩图片或使用精灵图'
            });
        }
        
        // 检查音频文件
        const audioFiles = this.results.files.filter(file => 
            ['.mp3', '.ogg', '.wav', '.m4a'].includes(file.extension)
        );
        if (audioFiles.length > 0) {
            const totalAudioSize = audioFiles.reduce((sum, f) => sum + f.size, 0);
            if (totalAudioSize > 1024 * 1024) { // 1MB
                recommendations.push({
                    type: 'info',
                    category: '音频优化',
                    message: `音频文件总大小: ${this.formatBytes(totalAudioSize)}`,
                    details: audioFiles.map(f => `${f.path}: ${f.sizeFormatted}`),
                    suggestion: '考虑降低音频比特率或使用更高效的音频格式'
                });
            }
        }
        
        // 检查JavaScript分包
        const jsSize = this.results.files
            .filter(f => f.extension === '.js')
            .reduce((sum, f) => sum + f.size, 0);
        
        if (jsSize > 1024 * 1024) { // 1MB
            recommendations.push({
                type: 'warning',
                category: 'JavaScript优化',
                message: `JavaScript文件总大小: ${this.formatBytes(jsSize)}`,
                suggestion: '考虑更细粒度的代码分割和按需加载'
            });
        }
        
        // 检查CSS
        const cssFiles = this.results.files.filter(file => file.extension === '.css');
        const largeCss = cssFiles.filter(file => file.size > 50 * 1024); // 50KB
        if (largeCss.length > 0) {
            recommendations.push({
                type: 'info',
                category: 'CSS优化',
                message: `发现大CSS文件`,
                details: largeCss.map(f => `${f.path}: ${f.sizeFormatted}`),
                suggestion: '考虑CSS代码分割和未使用样式清理'
            });
        }
        
        // 总体建议
        if (this.results.summary.totalSize > 5 * 1024 * 1024) { // 5MB
            recommendations.push({
                type: 'error',
                category: '总体大小',
                message: `应用总大小过大: ${this.results.summary.totalSizeFormatted}`,
                suggestion: '建议将应用大小控制在5MB以内以获得更好的加载性能'
            });
        }
        
        this.results.recommendations = recommendations;
        
        console.log(`  生成了 ${recommendations.length} 条建议`);
    }
    
    async generateReport() {
        console.log('📋 生成性能报告...');
        
        // 控制台输出
        this.printConsoleReport();
        
        // 生成JSON报告
        const reportPath = path.join(this.projectRoot, 'performance-report.json');
        fs.writeFileSync(reportPath, JSON.stringify(this.results, null, 2));
        
        // 生成HTML报告
        await this.generateHTMLReport();
        
        console.log(`  报告已保存到: performance-report.json`);
    }
    
    printConsoleReport() {
        console.log('\n📊 性能测试报告');
        console.log('='.repeat(50));
        
        // 总体统计
        console.log('\n📈 总体统计:');
        console.log(`  总文件数: ${this.results.files.length}`);
        console.log(`  总大小: ${this.results.summary.totalSizeFormatted}`);
        
        // 资源类型分布
        console.log('\n📊 资源类型分布:');
        Object.entries(this.results.summary.resourceTypes).forEach(([type, stats]) => {
            console.log(`  ${type}: ${stats.count} 个文件, ${stats.sizeFormatted} (${stats.percentage}%)`);
        });
        
        // 最大的文件
        console.log('\n📦 最大的文件 (前10个):');
        this.results.files.slice(0, 10).forEach((file, index) => {
            console.log(`  ${index + 1}. ${file.path}: ${file.sizeFormatted}`);
        });
        
        // 压缩统计
        if (this.results.summary.compression) {
            console.log('\n🗜️ 压缩统计:');
            console.log(`  可压缩文件大小: ${this.results.summary.compression.compressibleSize}`);
            console.log(`  预计节省空间: ${this.results.summary.compression.potentialSavings}`);
            console.log(`  压缩比: ${this.results.summary.compression.compressionRatio}`);
        }
        
        // 优化建议
        if (this.results.recommendations.length > 0) {
            console.log('\n💡 优化建议:');
            this.results.recommendations.forEach((rec, index) => {
                const icon = rec.type === 'error' ? '❌' : rec.type === 'warning' ? '⚠️' : 'ℹ️';
                console.log(`  ${icon} [${rec.category}] ${rec.message}`);
                console.log(`     建议: ${rec.suggestion}`);
                if (rec.details && rec.details.length <= 3) {
                    rec.details.forEach(detail => {
                        console.log(`     - ${detail}`);
                    });
                }
                console.log('');
            });
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
    <title>性能测试报告</title>
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
        h1, h2, h3 { color: #2c3e50; }
        .summary { display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 20px; margin: 20px 0; }
        .stat-card {
            background: #f8f9fa;
            padding: 20px;
            border-radius: 6px;
            border-left: 4px solid #3498db;
        }
        .stat-value { font-size: 24px; font-weight: bold; color: #2c3e50; }
        .stat-label { color: #7f8c8d; font-size: 14px; }
        table { width: 100%; border-collapse: collapse; margin: 20px 0; }
        th, td { padding: 12px; text-align: left; border-bottom: 1px solid #ddd; }
        th { background: #f8f9fa; font-weight: 600; }
        .recommendation {
            margin: 10px 0;
            padding: 15px;
            border-radius: 6px;
            border-left: 4px solid;
        }
        .recommendation.error { background: #fdf2f2; border-color: #e53e3e; }
        .recommendation.warning { background: #fffbf0; border-color: #dd6b20; }
        .recommendation.info { background: #f0f9ff; border-color: #3182ce; }
        .chart { height: 300px; margin: 20px 0; }
        .progress-bar {
            background: #e2e8f0;
            border-radius: 10px;
            overflow: hidden;
            height: 20px;
            margin: 5px 0;
        }
        .progress-fill {
            height: 100%;
            background: linear-gradient(90deg, #4CAF50, #45a049);
            transition: width 0.3s ease;
        }
    </style>
</head>
<body>
    <div class="container">
        <h1>🚀 性能测试报告</h1>
        <p><strong>生成时间:</strong> ${new Date(this.results.timestamp).toLocaleString('zh-CN')}</p>
        
        <div class="summary">
            <div class="stat-card">
                <div class="stat-value">${this.results.files.length}</div>
                <div class="stat-label">总文件数</div>
            </div>
            <div class="stat-card">
                <div class="stat-value">${this.results.summary.totalSizeFormatted}</div>
                <div class="stat-label">总大小</div>
            </div>
            <div class="stat-card">
                <div class="stat-value">${Object.keys(this.results.summary.resourceTypes).length}</div>
                <div class="stat-label">资源类型</div>
            </div>
            <div class="stat-card">
                <div class="stat-value">${this.results.recommendations.length}</div>
                <div class="stat-label">优化建议</div>
            </div>
        </div>
        
        <h2>📊 资源类型分布</h2>
        ${Object.entries(this.results.summary.resourceTypes).map(([type, stats]) => `
            <div style="margin: 10px 0;">
                <div style="display: flex; justify-content: space-between; align-items: center;">
                    <span><strong>${type}</strong> (${stats.count} 个文件)</span>
                    <span>${stats.sizeFormatted} (${stats.percentage}%)</span>
                </div>
                <div class="progress-bar">
                    <div class="progress-fill" style="width: ${stats.percentage}%"></div>
                </div>
            </div>
        `).join('')}
        
        <h2>📦 最大的文件</h2>
        <table>
            <thead>
                <tr>
                    <th>文件路径</th>
                    <th>大小</th>
                    <th>类型</th>
                </tr>
            </thead>
            <tbody>
                ${this.results.files.slice(0, 20).map(file => `
                    <tr>
                        <td>${file.path}</td>
                        <td>${file.sizeFormatted}</td>
                        <td>${file.type}</td>
                    </tr>
                `).join('')}
            </tbody>
        </table>
        
        ${this.results.recommendations.length > 0 ? `
            <h2>💡 优化建议</h2>
            ${this.results.recommendations.map(rec => `
                <div class="recommendation ${rec.type}">
                    <h3>${rec.category}</h3>
                    <p><strong>${rec.message}</strong></p>
                    <p><em>建议: ${rec.suggestion}</em></p>
                    ${rec.details ? `
                        <ul>
                            ${rec.details.slice(0, 5).map(detail => `<li>${detail}</li>`).join('')}
                        </ul>
                    ` : ''}
                </div>
            `).join('')}
        ` : ''}
        
        <footer style="margin-top: 40px; padding-top: 20px; border-top: 1px solid #ddd; color: #666; text-align: center;">
            <p>性能测试报告 - 生成于 ${new Date().toLocaleString('zh-CN')}</p>
        </footer>
    </div>
</body>
</html>
        `.trim();
        
        const htmlPath = path.join(this.projectRoot, 'performance-report.html');
        fs.writeFileSync(htmlPath, htmlReport);
        
        console.log(`  HTML报告已保存到: performance-report.html`);
    }
    
    // 辅助方法
    getAllFiles(dir) {
        const files = [];
        const items = fs.readdirSync(dir);
        
        items.forEach(item => {
            const fullPath = path.join(dir, item);
            const stat = fs.statSync(fullPath);
            
            if (stat.isDirectory()) {
                files.push(...this.getAllFiles(fullPath));
            } else {
                files.push(fullPath);
            }
        });
        
        return files;
    }
    
    getFileType(extension) {
        const typeMap = {
            '.js': 'JavaScript',
            '.css': 'CSS',
            '.html': 'HTML',
            '.png': 'Image',
            '.jpg': 'Image',
            '.jpeg': 'Image',
            '.gif': 'Image',
            '.svg': 'Image',
            '.webp': 'Image',
            '.mp3': 'Audio',
            '.ogg': 'Audio',
            '.wav': 'Audio',
            '.m4a': 'Audio',
            '.json': 'Data',
            '.xml': 'Data',
            '.txt': 'Text',
            '.md': 'Text',
            '.woff': 'Font',
            '.woff2': 'Font',
            '.ttf': 'Font',
            '.eot': 'Font'
        };
        
        return typeMap[extension] || 'Other';
    }
    
    isCompressible(extension) {
        const compressibleTypes = ['.js', '.css', '.html', '.json', '.xml', '.txt', '.md', '.svg'];
        return compressibleTypes.includes(extension);
    }
    
    getCompressionRatio(type) {
        const ratios = {
            'JavaScript': 0.3,
            'CSS': 0.25,
            'HTML': 0.2,
            'Data': 0.15,
            'Text': 0.2
        };
        
        return ratios[type] || 0.5;
    }
    
    formatBytes(bytes) {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }
}

// 主执行逻辑
async function main() {
    const tester = new PerformanceTester();
    
    try {
        await tester.runTests();
    } catch (error) {
        console.error('性能测试失败:', error.message);
        process.exit(1);
    }
}

// 如果直接运行此脚本
if (import.meta.url === `file://${process.argv[1]}`) {
    main();
}
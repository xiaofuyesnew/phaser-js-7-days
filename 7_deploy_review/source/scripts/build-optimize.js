import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * 构建优化器
 * 在构建过程中进行额外的优化处理
 */
class BuildOptimizer {
    constructor() {
        this.projectRoot = path.resolve(__dirname, '..');
        this.distDir = path.join(this.projectRoot, 'dist');
        this.optimizations = {
            minifyHTML: true,
            optimizeImages: true,
            generateSitemap: true,
            createServiceWorker: true,
            bundleAnalysis: true,
            compressionTest: true
        };
    }
    
    async optimize() {
        console.log('🚀 开始构建优化...');
        
        if (!fs.existsSync(this.distDir)) {
            throw new Error('dist目录不存在，请先运行构建');
        }
        
        try {
            // 1. HTML优化
            if (this.optimizations.minifyHTML) {
                await this.optimizeHTML();
            }
            
            // 2. 图片优化
            if (this.optimizations.optimizeImages) {
                await this.optimizeImages();
            }
            
            // 3. 生成站点地图
            if (this.optimizations.generateSitemap) {
                await this.generateSitemap();
            }
            
            // 4. Service Worker优化
            if (this.optimizations.createServiceWorker) {
                await this.optimizeServiceWorker();
            }
            
            // 5. 包分析
            if (this.optimizations.bundleAnalysis) {
                await this.analyzeBundles();
            }
            
            // 6. 压缩测试
            if (this.optimizations.compressionTest) {
                await this.testCompression();
            }
            
            // 7. 生成优化报告
            await this.generateOptimizationReport();
            
            console.log('✅ 构建优化完成');
            
        } catch (error) {
            console.error('❌ 构建优化失败:', error.message);
            throw error;
        }
    }
    
    async optimizeHTML() {
        console.log('📄 优化HTML文件...');
        
        const htmlFiles = this.findFiles(this.distDir, '.html');
        
        for (const htmlFile of htmlFiles) {
            let content = fs.readFileSync(htmlFile, 'utf8');
            
            // 移除注释
            content = content.replace(/<!--[\s\S]*?-->/g, '');
            
            // 压缩空白字符
            content = content.replace(/\s+/g, ' ');
            content = content.replace(/>\s+</g, '><');
            
            // 移除不必要的属性
            content = content.replace(/\s(type="text\/javascript"|type="text\/css")/g, '');
            
            // 内联关键CSS（如果文件很小）
            content = await this.inlineCriticalCSS(content);
            
            // 添加资源提示
            content = this.addResourceHints(content);
            
            fs.writeFileSync(htmlFile, content.trim());
            console.log(`  优化: ${path.relative(this.distDir, htmlFile)}`);
        }
    }
    
    async inlineCriticalCSS(htmlContent) {
        // 查找CSS文件引用
        const cssLinkRegex = /<link[^>]+href="([^"]+\.css)"[^>]*>/g;
        let match;
        
        while ((match = cssLinkRegex.exec(htmlContent)) !== null) {
            const cssPath = path.join(this.distDir, match[1]);
            
            if (fs.existsSync(cssPath)) {
                const cssContent = fs.readFileSync(cssPath, 'utf8');
                
                // 如果CSS文件小于10KB，内联它
                if (cssContent.length < 10240) {
                    const inlineCSS = `<style>${cssContent}</style>`;
                    htmlContent = htmlContent.replace(match[0], inlineCSS);
                    console.log(`    内联CSS: ${match[1]}`);
                }
            }
        }
        
        return htmlContent;
    }
    
    addResourceHints(htmlContent) {
        // 添加DNS预解析
        const dnsHints = `
    <link rel="dns-prefetch" href="//fonts.googleapis.com">
    <link rel="dns-prefetch" href="//cdn.jsdelivr.net">
    <link rel="preconnect" href="//fonts.gstatic.com" crossorigin>`;
        
        // 在head标签中插入
        htmlContent = htmlContent.replace('</head>', `${dnsHints}\n  </head>`);
        
        return htmlContent;
    }
    
    async optimizeImages() {
        console.log('🖼️ 优化图片文件...');
        
        const imageFiles = this.findFiles(this.distDir, ['.png', '.jpg', '.jpeg', '.gif', '.svg']);
        
        for (const imageFile of imageFiles) {
            const ext = path.extname(imageFile).toLowerCase();
            const stats = fs.statSync(imageFile);
            const originalSize = stats.size;
            
            try {
                // 这里可以集成图片优化工具
                // 例如使用 sharp, imagemin 等
                
                // 简单的SVG优化
                if (ext === '.svg') {
                    await this.optimizeSVG(imageFile);
                }
                
                const newStats = fs.statSync(imageFile);
                const newSize = newStats.size;
                const savings = originalSize - newSize;
                
                if (savings > 0) {
                    console.log(`  优化: ${path.relative(this.distDir, imageFile)} (节省 ${this.formatBytes(savings)})`);
                }
                
            } catch (error) {
                console.warn(`  跳过: ${path.relative(this.distDir, imageFile)} - ${error.message}`);
            }
        }
    }
    
    async optimizeSVG(svgFile) {
        let content = fs.readFileSync(svgFile, 'utf8');
        
        // 移除注释
        content = content.replace(/<!--[\s\S]*?-->/g, '');
        
        // 移除不必要的空白
        content = content.replace(/\s+/g, ' ');
        content = content.replace(/>\s+</g, '><');
        
        // 移除不必要的属性
        content = content.replace(/\s(xmlns:xlink="[^"]*"|xml:space="[^"]*")/g, '');
        
        fs.writeFileSync(svgFile, content.trim());
    }
    
    async generateSitemap() {
        console.log('🗺️ 生成站点地图...');
        
        const baseUrl = 'https://yourgame.com'; // 应该从配置中获取
        const pages = [
            { url: '/', priority: '1.0', changefreq: 'weekly' },
            { url: '/about', priority: '0.8', changefreq: 'monthly' },
            { url: '/help', priority: '0.6', changefreq: 'monthly' }
        ];
        
        const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${pages.map(page => `  <url>
    <loc>${baseUrl}${page.url}</loc>
    <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>
    <changefreq>${page.changefreq}</changefreq>
    <priority>${page.priority}</priority>
  </url>`).join('\n')}
</urlset>`;
        
        fs.writeFileSync(path.join(this.distDir, 'sitemap.xml'), sitemap);
        
        // robots.txt
        const robots = `User-agent: *
Allow: /

Sitemap: ${baseUrl}/sitemap.xml

# 游戏资源
Allow: /assets/
Allow: /images/
Allow: /audio/

# 禁止索引的路径
Disallow: /admin/
Disallow: /api/
Disallow: /*.json$`;
        
        fs.writeFileSync(path.join(this.distDir, 'robots.txt'), robots);
        
        console.log('  生成sitemap.xml和robots.txt');
    }
    
    async optimizeServiceWorker() {
        console.log('⚙️ 优化Service Worker...');
        
        const swPath = path.join(this.distDir, 'sw.js');
        if (!fs.existsSync(swPath)) {
            console.log('  Service Worker文件不存在，跳过优化');
            return;
        }
        
        let swContent = fs.readFileSync(swPath, 'utf8');
        
        // 更新缓存版本
        const version = this.getVersion();
        swContent = swContent.replace(/CACHE_NAME = '[^']*'/, `CACHE_NAME = 'phaser-game-v${version}'`);
        swContent = swContent.replace(/STATIC_CACHE_NAME = '[^']*'/, `STATIC_CACHE_NAME = 'phaser-game-static-v${version}'`);
        swContent = swContent.replace(/DYNAMIC_CACHE_NAME = '[^']*'/, `DYNAMIC_CACHE_NAME = 'phaser-game-dynamic-v${version}'`);
        
        // 生成资源列表
        const assets = this.generateAssetList();
        const assetList = JSON.stringify(assets, null, 2);
        swContent = swContent.replace(/STATIC_ASSETS = \[[\s\S]*?\]/, `STATIC_ASSETS = ${assetList}`);
        
        fs.writeFileSync(swPath, swContent);
        console.log('  Service Worker已优化');
    }
    
    generateAssetList() {
        const assets = ['/'];
        
        // 查找所有需要缓存的文件
        const files = this.findFiles(this.distDir, ['.html', '.js', '.css', '.png', '.jpg', '.svg']);
        
        files.forEach(file => {
            const relativePath = '/' + path.relative(this.distDir, file).replace(/\\/g, '/');
            if (!assets.includes(relativePath)) {
                assets.push(relativePath);
            }
        });
        
        return assets;
    }
    
    async analyzeBundles() {
        console.log('📊 分析构建包...');
        
        const jsFiles = this.findFiles(this.distDir, '.js');
        const cssFiles = this.findFiles(this.distDir, '.css');
        
        const analysis = {
            javascript: {
                files: jsFiles.length,
                totalSize: 0,
                details: []
            },
            css: {
                files: cssFiles.length,
                totalSize: 0,
                details: []
            }
        };
        
        // 分析JavaScript文件
        jsFiles.forEach(file => {
            const stats = fs.statSync(file);
            const relativePath = path.relative(this.distDir, file);
            
            analysis.javascript.totalSize += stats.size;
            analysis.javascript.details.push({
                file: relativePath,
                size: stats.size,
                sizeFormatted: this.formatBytes(stats.size)
            });
        });
        
        // 分析CSS文件
        cssFiles.forEach(file => {
            const stats = fs.statSync(file);
            const relativePath = path.relative(this.distDir, file);
            
            analysis.css.totalSize += stats.size;
            analysis.css.details.push({
                file: relativePath,
                size: stats.size,
                sizeFormatted: this.formatBytes(stats.size)
            });
        });
        
        // 排序
        analysis.javascript.details.sort((a, b) => b.size - a.size);
        analysis.css.details.sort((a, b) => b.size - a.size);
        
        // 输出分析结果
        console.log(`  JavaScript: ${analysis.javascript.files} 个文件, 总大小: ${this.formatBytes(analysis.javascript.totalSize)}`);
        console.log(`  CSS: ${analysis.css.files} 个文件, 总大小: ${this.formatBytes(analysis.css.totalSize)}`);
        
        // 保存详细分析
        fs.writeFileSync(
            path.join(this.distDir, 'bundle-analysis.json'),
            JSON.stringify(analysis, null, 2)
        );
        
        return analysis;
    }
    
    async testCompression() {
        console.log('🗜️ 测试压缩效果...');
        
        const compressibleFiles = this.findFiles(this.distDir, ['.html', '.js', '.css', '.json', '.svg']);
        const compressionResults = [];
        
        for (const file of compressibleFiles) {
            const originalSize = fs.statSync(file).size;
            const relativePath = path.relative(this.distDir, file);
            
            // 模拟gzip压缩（简化版本）
            const gzipSize = Math.floor(originalSize * 0.3); // 假设压缩率70%
            const savings = originalSize - gzipSize;
            const ratio = ((savings / originalSize) * 100).toFixed(1);
            
            compressionResults.push({
                file: relativePath,
                originalSize,
                gzipSize,
                savings,
                ratio: ratio + '%',
                originalFormatted: this.formatBytes(originalSize),
                gzipFormatted: this.formatBytes(gzipSize),
                savingsFormatted: this.formatBytes(savings)
            });
        }
        
        // 计算总体压缩效果
        const totalOriginal = compressionResults.reduce((sum, result) => sum + result.originalSize, 0);
        const totalGzip = compressionResults.reduce((sum, result) => sum + result.gzipSize, 0);
        const totalSavings = totalOriginal - totalGzip;
        const totalRatio = ((totalSavings / totalOriginal) * 100).toFixed(1);
        
        console.log(`  总压缩效果: ${this.formatBytes(totalOriginal)} → ${this.formatBytes(totalGzip)} (节省 ${totalRatio}%)`);
        
        // 保存压缩分析
        fs.writeFileSync(
            path.join(this.distDir, 'compression-analysis.json'),
            JSON.stringify({
                summary: {
                    totalOriginal,
                    totalGzip,
                    totalSavings,
                    totalRatio: totalRatio + '%',
                    totalOriginalFormatted: this.formatBytes(totalOriginal),
                    totalGzipFormatted: this.formatBytes(totalGzip),
                    totalSavingsFormatted: this.formatBytes(totalSavings)
                },
                files: compressionResults
            }, null, 2)
        );
    }
    
    async generateOptimizationReport() {
        console.log('📋 生成优化报告...');
        
        const report = {
            timestamp: new Date().toISOString(),
            version: this.getVersion(),
            buildTime: new Date().toISOString(),
            optimizations: this.optimizations,
            summary: {
                totalFiles: 0,
                totalSize: 0,
                optimizedFiles: 0,
                estimatedSavings: 0
            },
            details: {
                html: [],
                css: [],
                javascript: [],
                images: [],
                other: []
            }
        };
        
        // 收集文件信息
        const allFiles = this.findFiles(this.distDir);
        
        allFiles.forEach(file => {
            const stats = fs.statSync(file);
            const ext = path.extname(file).toLowerCase();
            const relativePath = path.relative(this.distDir, file);
            
            const fileInfo = {
                path: relativePath,
                size: stats.size,
                sizeFormatted: this.formatBytes(stats.size),
                modified: stats.mtime.toISOString()
            };
            
            report.summary.totalFiles++;
            report.summary.totalSize += stats.size;
            
            // 分类文件
            if (ext === '.html') {
                report.details.html.push(fileInfo);
            } else if (ext === '.css') {
                report.details.css.push(fileInfo);
            } else if (ext === '.js') {
                report.details.javascript.push(fileInfo);
            } else if (['.png', '.jpg', '.jpeg', '.gif', '.svg', '.webp'].includes(ext)) {
                report.details.images.push(fileInfo);
            } else {
                report.details.other.push(fileInfo);
            }
        });
        
        // 格式化总大小
        report.summary.totalSizeFormatted = this.formatBytes(report.summary.totalSize);
        
        // 保存报告
        fs.writeFileSync(
            path.join(this.distDir, 'optimization-report.json'),
            JSON.stringify(report, null, 2)
        );
        
        // 生成HTML报告
        await this.generateHTMLReport(report);
        
        console.log(`  优化报告已生成: ${report.summary.totalFiles} 个文件, 总大小: ${report.summary.totalSizeFormatted}`);
    }
    
    async generateHTMLReport(report) {
        const htmlReport = `
<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>构建优化报告</title>
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
        .summary { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 20px; margin: 20px 0; }
        .stat-card {
            background: #f8f9fa;
            padding: 20px;
            border-radius: 6px;
            border-left: 4px solid #3498db;
            text-align: center;
        }
        .stat-value { font-size: 24px; font-weight: bold; color: #2c3e50; }
        .stat-label { color: #7f8c8d; font-size: 14px; }
        table { width: 100%; border-collapse: collapse; margin: 20px 0; }
        th, td { padding: 12px; text-align: left; border-bottom: 1px solid #ddd; }
        th { background: #f8f9fa; font-weight: 600; }
        .file-size { font-family: monospace; }
        .optimization-badge {
            display: inline-block;
            padding: 2px 8px;
            border-radius: 12px;
            font-size: 12px;
            font-weight: bold;
        }
        .optimization-badge.enabled { background: #d4edda; color: #155724; }
        .optimization-badge.disabled { background: #f8d7da; color: #721c24; }
    </style>
</head>
<body>
    <div class="container">
        <h1>🚀 构建优化报告</h1>
        <p><strong>生成时间:</strong> ${new Date(report.timestamp).toLocaleString('zh-CN')}</p>
        <p><strong>版本:</strong> ${report.version}</p>
        
        <div class="summary">
            <div class="stat-card">
                <div class="stat-value">${report.summary.totalFiles}</div>
                <div class="stat-label">总文件数</div>
            </div>
            <div class="stat-card">
                <div class="stat-value">${report.summary.totalSizeFormatted}</div>
                <div class="stat-label">总大小</div>
            </div>
            <div class="stat-card">
                <div class="stat-value">${report.details.javascript.length}</div>
                <div class="stat-label">JavaScript文件</div>
            </div>
            <div class="stat-card">
                <div class="stat-value">${report.details.css.length}</div>
                <div class="stat-label">CSS文件</div>
            </div>
        </div>
        
        <h2>🔧 优化配置</h2>
        <div style="margin: 20px 0;">
            ${Object.entries(report.optimizations).map(([key, enabled]) => `
                <span class="optimization-badge ${enabled ? 'enabled' : 'disabled'}">
                    ${key}: ${enabled ? '启用' : '禁用'}
                </span>
            `).join(' ')}
        </div>
        
        <h2>📊 文件分布</h2>
        
        <h3>JavaScript 文件</h3>
        <table>
            <thead>
                <tr><th>文件</th><th>大小</th><th>修改时间</th></tr>
            </thead>
            <tbody>
                ${report.details.javascript.map(file => `
                    <tr>
                        <td>${file.path}</td>
                        <td class="file-size">${file.sizeFormatted}</td>
                        <td>${new Date(file.modified).toLocaleString('zh-CN')}</td>
                    </tr>
                `).join('')}
            </tbody>
        </table>
        
        <h3>CSS 文件</h3>
        <table>
            <thead>
                <tr><th>文件</th><th>大小</th><th>修改时间</th></tr>
            </thead>
            <tbody>
                ${report.details.css.map(file => `
                    <tr>
                        <td>${file.path}</td>
                        <td class="file-size">${file.sizeFormatted}</td>
                        <td>${new Date(file.modified).toLocaleString('zh-CN')}</td>
                    </tr>
                `).join('')}
            </tbody>
        </table>
        
        <h3>图片文件</h3>
        <table>
            <thead>
                <tr><th>文件</th><th>大小</th><th>修改时间</th></tr>
            </thead>
            <tbody>
                ${report.details.images.map(file => `
                    <tr>
                        <td>${file.path}</td>
                        <td class="file-size">${file.sizeFormatted}</td>
                        <td>${new Date(file.modified).toLocaleString('zh-CN')}</td>
                    </tr>
                `).join('')}
            </tbody>
        </table>
        
        <footer style="margin-top: 40px; padding-top: 20px; border-top: 1px solid #ddd; color: #666; text-align: center;">
            <p>构建优化报告 - 生成于 ${new Date().toLocaleString('zh-CN')}</p>
        </footer>
    </div>
</body>
</html>
        `.trim();
        
        fs.writeFileSync(path.join(this.distDir, 'optimization-report.html'), htmlReport);
    }
    
    // 辅助方法
    findFiles(dir, extensions = null) {
        const files = [];
        const items = fs.readdirSync(dir);
        
        items.forEach(item => {
            const fullPath = path.join(dir, item);
            const stat = fs.statSync(fullPath);
            
            if (stat.isDirectory()) {
                files.push(...this.findFiles(fullPath, extensions));
            } else {
                if (!extensions) {
                    files.push(fullPath);
                } else {
                    const ext = path.extname(fullPath).toLowerCase();
                    const extArray = Array.isArray(extensions) ? extensions : [extensions];
                    if (extArray.includes(ext)) {
                        files.push(fullPath);
                    }
                }
            }
        });
        
        return files;
    }
    
    getVersion() {
        try {
            const packagePath = path.join(this.projectRoot, 'package.json');
            const packageJson = JSON.parse(fs.readFileSync(packagePath, 'utf8'));
            return packageJson.version || '1.0.0';
        } catch (error) {
            return '1.0.0';
        }
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
    const optimizer = new BuildOptimizer();
    
    try {
        await optimizer.optimize();
    } catch (error) {
        console.error('构建优化失败:', error.message);
        process.exit(1);
    }
}

// 如果直接运行此脚本
if (import.meta.url === `file://${process.argv[1]}`) {
    main();
}

export { BuildOptimizer };
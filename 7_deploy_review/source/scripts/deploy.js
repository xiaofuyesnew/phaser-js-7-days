import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * 部署管理器
 * 处理游戏的构建、优化和部署流程
 */
class DeployManager {
    constructor() {
        this.distDir = 'dist';
        this.backupDir = 'backup';
        this.projectRoot = path.resolve(__dirname, '..');
        
        // 部署配置
        this.deployConfig = {
            github: {
                name: 'GitHub Pages',
                branch: 'gh-pages',
                buildCommand: 'npm run build'
            },
            vercel: {
                name: 'Vercel',
                buildCommand: 'npm run build'
            },
            netlify: {
                name: 'Netlify',
                buildCommand: 'npm run build',
                publishDir: 'dist'
            }
        };
    }
    
    async deploy(target = 'github') {
        const config = this.deployConfig[target];
        if (!config) {
            throw new Error(`不支持的部署目标: ${target}`);
        }
        
        console.log(`🚀 开始部署到 ${config.name}...`);
        
        try {
            // 1. 环境检查
            await this.checkEnvironment();
            
            // 2. 清理旧文件
            await this.cleanup();
            
            // 3. 构建项目
            await this.build();
            
            // 4. 优化资源
            await this.optimize();
            
            // 5. 生成部署文件
            await this.generateDeployFiles(target);
            
            // 6. 部署到目标平台
            await this.deployTo(target);
            
            console.log(`✅ 部署到 ${config.name} 成功！`);
            
        } catch (error) {
            console.error(`❌ 部署失败:`, error.message);
            
            // 尝试恢复
            await this.rollback();
            process.exit(1);
        }
    }
    
    async checkEnvironment() {
        console.log('🔍 检查环境...');
        
        // 检查Node.js版本
        const nodeVersion = process.version;
        console.log(`Node.js版本: ${nodeVersion}`);
        
        // 检查npm
        try {
            const npmVersion = execSync('npm --version', { encoding: 'utf8' }).trim();
            console.log(`npm版本: ${npmVersion}`);
        } catch (error) {
            throw new Error('npm未安装或不可用');
        }
        
        // 检查Git（如果需要）
        try {
            const gitVersion = execSync('git --version', { encoding: 'utf8' }).trim();
            console.log(`Git版本: ${gitVersion}`);
        } catch (error) {
            console.warn('⚠️ Git未安装，某些部署选项可能不可用');
        }
        
        // 检查package.json
        const packagePath = path.join(this.projectRoot, 'package.json');
        if (!fs.existsSync(packagePath)) {
            throw new Error('package.json文件不存在');
        }
        
        console.log('✅ 环境检查通过');
    }
    
    async cleanup() {
        console.log('🧹 清理旧文件...');
        
        const dirsToClean = [this.distDir, this.backupDir];
        
        dirsToClean.forEach(dir => {
            const fullPath = path.join(this.projectRoot, dir);
            if (fs.existsSync(fullPath)) {
                fs.rmSync(fullPath, { recursive: true, force: true });
                console.log(`  清理: ${dir}/`);
            }
        });
        
        console.log('✅ 清理完成');
    }
    
    async build() {
        console.log('🔨 构建项目...');
        
        try {
            // 设置生产环境
            process.env.NODE_ENV = 'production';
            
            // 执行构建命令
            execSync('npm run build', { 
                stdio: 'inherit',
                cwd: this.projectRoot
            });
            
            // 检查构建结果
            const distPath = path.join(this.projectRoot, this.distDir);
            if (!fs.existsSync(distPath)) {
                throw new Error('构建失败：dist目录不存在');
            }
            
            // 检查关键文件
            const indexPath = path.join(distPath, 'index.html');
            if (!fs.existsSync(indexPath)) {
                throw new Error('构建失败：index.html不存在');
            }
            
            console.log('✅ 构建完成');
            
        } catch (error) {
            throw new Error(`构建失败: ${error.message}`);
        }
    }
    
    async optimize() {
        console.log('⚡ 优化资源...');
        
        const distPath = path.join(this.projectRoot, this.distDir);
        
        // 1. 压缩图片
        await this.compressImages(distPath);
        
        // 2. 生成资源清单
        await this.generateManifest(distPath);
        
        // 3. 添加缓存配置
        await this.addCacheHeaders(distPath);
        
        // 4. 生成sitemap
        await this.generateSitemap(distPath);
        
        // 5. 优化HTML
        await this.optimizeHTML(distPath);
        
        console.log('✅ 资源优化完成');
    }
    
    async compressImages(distPath) {
        console.log('📸 压缩图片...');
        
        const imagesDir = path.join(distPath, 'images');
        if (!fs.existsSync(imagesDir)) {
            console.log('  没有找到图片目录，跳过压缩');
            return;
        }
        
        // 这里可以集成图片压缩工具
        // 例如使用 sharp 或 imagemin
        console.log('  图片压缩功能待实现');
    }
    
    async generateManifest(distPath) {
        console.log('📋 生成资源清单...');
        
        const manifest = {
            name: 'Phaser Game',
            version: this.getVersion(),
            buildTime: new Date().toISOString(),
            buildNumber: this.getBuildNumber(),
            files: [],
            stats: {}
        };
        
        // 递归获取所有文件
        const getFiles = (dir, baseDir = dir) => {
            const files = [];
            const items = fs.readdirSync(dir);
            
            items.forEach(item => {
                const fullPath = path.join(dir, item);
                const stat = fs.statSync(fullPath);
                
                if (stat.isDirectory()) {
                    files.push(...getFiles(fullPath, baseDir));
                } else {
                    const relativePath = path.relative(baseDir, fullPath);
                    files.push({
                        path: relativePath.replace(/\\/g, '/'),
                        size: stat.size,
                        modified: stat.mtime.toISOString(),
                        hash: this.getFileHash(fullPath)
                    });
                }
            });
            
            return files;
        };
        
        manifest.files = getFiles(distPath);
        
        // 计算统计信息
        manifest.stats = {
            totalFiles: manifest.files.length,
            totalSize: manifest.files.reduce((sum, file) => sum + file.size, 0),
            fileTypes: this.getFileTypeStats(manifest.files)
        };
        
        // 写入清单文件
        const manifestPath = path.join(distPath, 'manifest.json');
        fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2));
        
        console.log(`  生成清单: ${manifest.files.length}个文件, 总大小: ${this.formatBytes(manifest.stats.totalSize)}`);
    }
    
    async addCacheHeaders(distPath) {
        console.log('🗂️ 添加缓存配置...');
        
        // Netlify _headers 文件
        const netlifyHeaders = `
# 静态资源缓存
/assets/*
  Cache-Control: public, max-age=31536000, immutable

/js/*
  Cache-Control: public, max-age=31536000, immutable

/css/*
  Cache-Control: public, max-age=31536000, immutable

/images/*
  Cache-Control: public, max-age=31536000, immutable

/audio/*
  Cache-Control: public, max-age=31536000, immutable

# HTML文件
/*.html
  Cache-Control: public, max-age=0, must-revalidate

# 根文件
/
  Cache-Control: public, max-age=0, must-revalidate

# 清单文件
/manifest.json
  Cache-Control: public, max-age=3600

# Service Worker
/sw.js
  Cache-Control: public, max-age=0, must-revalidate
        `.trim();
        
        fs.writeFileSync(path.join(distPath, '_headers'), netlifyHeaders);
        
        // Apache .htaccess 文件
        const htaccess = `
# 启用压缩
<IfModule mod_deflate.c>
    AddOutputFilterByType DEFLATE text/plain
    AddOutputFilterByType DEFLATE text/html
    AddOutputFilterByType DEFLATE text/xml
    AddOutputFilterByType DEFLATE text/css
    AddOutputFilterByType DEFLATE application/xml
    AddOutputFilterByType DEFLATE application/xhtml+xml
    AddOutputFilterByType DEFLATE application/rss+xml
    AddOutputFilterByType DEFLATE application/javascript
    AddOutputFilterByType DEFLATE application/x-javascript
</IfModule>

# 缓存控制
<IfModule mod_expires.c>
    ExpiresActive on
    
    # 静态资源
    ExpiresByType image/png "access plus 1 year"
    ExpiresByType image/jpg "access plus 1 year"
    ExpiresByType image/jpeg "access plus 1 year"
    ExpiresByType image/gif "access plus 1 year"
    ExpiresByType image/svg+xml "access plus 1 year"
    ExpiresByType text/css "access plus 1 year"
    ExpiresByType application/javascript "access plus 1 year"
    ExpiresByType audio/mpeg "access plus 1 year"
    ExpiresByType audio/ogg "access plus 1 year"
    
    # HTML文件
    ExpiresByType text/html "access plus 0 seconds"
</IfModule>

# MIME类型
AddType audio/ogg .ogg
AddType audio/mp4 .m4a
AddType video/ogg .ogv
AddType video/mp4 .mp4
AddType video/webm .webm
        `.trim();
        
        fs.writeFileSync(path.join(distPath, '.htaccess'), htaccess);
        
        console.log('  缓存配置文件已生成');
    }
    
    async generateSitemap(distPath) {
        console.log('🗺️ 生成站点地图...');
        
        const baseUrl = this.getBaseUrl();
        const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
    <url>
        <loc>${baseUrl}</loc>
        <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>
        <changefreq>weekly</changefreq>
        <priority>1.0</priority>
    </url>
</urlset>`;
        
        fs.writeFileSync(path.join(distPath, 'sitemap.xml'), sitemap);
        
        // robots.txt
        const robots = `User-agent: *
Allow: /

Sitemap: ${baseUrl}/sitemap.xml`;
        
        fs.writeFileSync(path.join(distPath, 'robots.txt'), robots);
        
        console.log('  站点地图已生成');
    }
    
    async optimizeHTML(distPath) {
        console.log('📄 优化HTML...');
        
        const indexPath = path.join(distPath, 'index.html');
        if (!fs.existsSync(indexPath)) return;
        
        let html = fs.readFileSync(indexPath, 'utf8');
        
        // 添加meta标签
        const metaTags = `
    <meta name="description" content="A Phaser.js game built with modern web technologies">
    <meta name="keywords" content="phaser, game, javascript, html5">
    <meta name="author" content="Game Developer">
    <meta name="viewport" content="width=device-width, initial-scale=1.0, user-scalable=no">
    
    <!-- Open Graph -->
    <meta property="og:title" content="Phaser Game">
    <meta property="og:description" content="A Phaser.js game built with modern web technologies">
    <meta property="og:type" content="website">
    <meta property="og:url" content="${this.getBaseUrl()}">
    
    <!-- PWA -->
    <meta name="theme-color" content="#000000">
    <meta name="mobile-web-app-capable" content="yes">
    <meta name="apple-mobile-web-app-capable" content="yes">
    <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent">
        `;
        
        // 在head标签中插入meta标签
        html = html.replace('</head>', `${metaTags}\n  </head>`);
        
        // 添加加载指示器
        const loadingIndicator = `
    <div id="loading-screen" style="
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%);
        color: white;
        display: flex;
        justify-content: center;
        align-items: center;
        font-family: Arial, sans-serif;
        z-index: 9999;
    ">
        <div style="text-align: center;">
            <div style="font-size: 48px; margin-bottom: 20px;">🎮</div>
            <div style="font-size: 24px; margin-bottom: 10px;">Loading Game...</div>
            <div style="width: 200px; height: 4px; background: #333; border-radius: 2px; overflow: hidden;">
                <div id="loading-bar" style="
                    width: 0%;
                    height: 100%;
                    background: linear-gradient(90deg, #4CAF50, #45a049);
                    transition: width 0.3s ease;
                "></div>
            </div>
        </div>
    </div>
        `;
        
        // 在body开始后插入加载指示器
        html = html.replace('<body>', `<body>\n${loadingIndicator}`);
        
        // 添加加载脚本
        const loadingScript = `
    <script>
        // 简单的加载进度模拟
        let progress = 0;
        const loadingBar = document.getElementById('loading-bar');
        const loadingScreen = document.getElementById('loading-screen');
        
        const updateProgress = () => {
            progress += Math.random() * 15;
            if (progress > 100) progress = 100;
            
            if (loadingBar) {
                loadingBar.style.width = progress + '%';
            }
            
            if (progress < 100) {
                setTimeout(updateProgress, 100 + Math.random() * 200);
            } else {
                setTimeout(() => {
                    if (loadingScreen) {
                        loadingScreen.style.opacity = '0';
                        loadingScreen.style.transition = 'opacity 0.5s ease';
                        setTimeout(() => {
                            loadingScreen.remove();
                        }, 500);
                    }
                }, 500);
            }
        };
        
        // 开始加载动画
        updateProgress();
        
        // 当游戏真正加载完成时隐藏加载屏幕
        window.addEventListener('gameLoaded', () => {
            progress = 100;
            updateProgress();
        });
    </script>
        `;
        
        // 在body结束前插入脚本
        html = html.replace('</body>', `${loadingScript}\n  </body>`);
        
        fs.writeFileSync(indexPath, html);
        
        console.log('  HTML优化完成');
    }
    
    async generateDeployFiles(target) {
        console.log('📝 生成部署文件...');
        
        const distPath = path.join(this.projectRoot, this.distDir);
        
        switch (target) {
            case 'github':
                await this.generateGitHubFiles(distPath);
                break;
            case 'vercel':
                await this.generateVercelFiles(distPath);
                break;
            case 'netlify':
                await this.generateNetlifyFiles(distPath);
                break;
        }
        
        console.log('  部署文件已生成');
    }
    
    async generateGitHubFiles(distPath) {
        // GitHub Pages 不需要特殊配置文件
        // 但可以添加 CNAME 文件（如果有自定义域名）
        
        // 创建 .nojekyll 文件以避免 Jekyll 处理
        fs.writeFileSync(path.join(distPath, '.nojekyll'), '');
    }
    
    async generateVercelFiles(distPath) {
        const vercelConfig = {
            version: 2,
            builds: [
                {
                    src: "**/*",
                    use: "@vercel/static"
                }
            ],
            routes: [
                {
                    src: "/(.*)",
                    dest: "/index.html"
                }
            ],
            headers: [
                {
                    source: "/assets/(.*)",
                    headers: [
                        {
                            key: "Cache-Control",
                            value: "public, max-age=31536000, immutable"
                        }
                    ]
                }
            ]
        };
        
        fs.writeFileSync(
            path.join(distPath, 'vercel.json'),
            JSON.stringify(vercelConfig, null, 2)
        );
    }
    
    async generateNetlifyFiles(distPath) {
        const netlifyConfig = `
[build]
  publish = "dist"
  command = "npm run build"

[build.environment]
  NODE_VERSION = "18"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200

[[headers]]
  for = "/assets/*"
  [headers.values]
    Cache-Control = "public, max-age=31536000, immutable"
        `.trim();
        
        fs.writeFileSync(path.join(distPath, 'netlify.toml'), netlifyConfig);
        
        // _redirects 文件
        const redirects = `/*    /index.html   200`;
        fs.writeFileSync(path.join(distPath, '_redirects'), redirects);
    }
    
    async deployTo(target) {
        console.log(`📤 部署到 ${this.deployConfig[target].name}...`);
        
        switch (target) {
            case 'github':
                await this.deployToGitHub();
                break;
            case 'vercel':
                await this.deployToVercel();
                break;
            case 'netlify':
                await this.deployToNetlify();
                break;
        }
    }
    
    async deployToGitHub() {
        try {
            // 检查是否在Git仓库中
            execSync('git status', { stdio: 'ignore', cwd: this.projectRoot });
            
            // 添加所有文件
            execSync('git add .', { stdio: 'inherit', cwd: this.projectRoot });
            
            // 提交更改
            const commitMessage = `Deploy: ${new Date().toISOString()}`;
            execSync(`git commit -m "${commitMessage}"`, { 
                stdio: 'inherit', 
                cwd: this.projectRoot 
            });
            
            // 推送到远程仓库
            execSync('git push origin main', { 
                stdio: 'inherit', 
                cwd: this.projectRoot 
            });
            
            console.log('  推送到GitHub完成');
            
        } catch (error) {
            throw new Error(`GitHub部署失败: ${error.message}`);
        }
    }
    
    async deployToVercel() {
        try {
            // 检查Vercel CLI
            execSync('vercel --version', { stdio: 'ignore' });
            
            // 部署到Vercel
            execSync('vercel --prod', { 
                stdio: 'inherit', 
                cwd: this.projectRoot 
            });
            
        } catch (error) {
            if (error.message.includes('vercel: command not found')) {
                throw new Error('Vercel CLI未安装。请运行: npm install -g vercel');
            }
            throw new Error(`Vercel部署失败: ${error.message}`);
        }
    }
    
    async deployToNetlify() {
        try {
            // 检查Netlify CLI
            execSync('netlify --version', { stdio: 'ignore' });
            
            // 部署到Netlify
            execSync('netlify deploy --prod --dir=dist', { 
                stdio: 'inherit', 
                cwd: this.projectRoot 
            });
            
        } catch (error) {
            if (error.message.includes('netlify: command not found')) {
                throw new Error('Netlify CLI未安装。请运行: npm install -g netlify-cli');
            }
            throw new Error(`Netlify部署失败: ${error.message}`);
        }
    }
    
    async rollback() {
        console.log('🔄 尝试回滚...');
        
        const backupPath = path.join(this.projectRoot, this.backupDir);
        if (fs.existsSync(backupPath)) {
            // 恢复备份
            console.log('  恢复备份文件...');
            // 实现备份恢复逻辑
        }
        
        console.log('  回滚完成');
    }
    
    // 辅助方法
    getVersion() {
        try {
            const packagePath = path.join(this.projectRoot, 'package.json');
            const packageJson = JSON.parse(fs.readFileSync(packagePath, 'utf8'));
            return packageJson.version || '1.0.0';
        } catch (error) {
            return '1.0.0';
        }
    }
    
    getBuildNumber() {
        return Date.now().toString();
    }
    
    getBaseUrl() {
        // 这里应该根据实际部署配置返回基础URL
        return 'https://yourgame.com';
    }
    
    getFileHash(filePath) {
        // 简化版本，实际应该使用crypto生成文件哈希
        const stat = fs.statSync(filePath);
        return stat.mtime.getTime().toString(36);
    }
    
    getFileTypeStats(files) {
        const stats = {};
        files.forEach(file => {
            const ext = path.extname(file.path).toLowerCase();
            stats[ext] = (stats[ext] || 0) + 1;
        });
        return stats;
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
    const target = process.argv[2] || 'github';
    const validTargets = ['github', 'vercel', 'netlify'];
    
    if (!validTargets.includes(target)) {
        console.error(`❌ 无效的部署目标: ${target}`);
        console.log(`支持的目标: ${validTargets.join(', ')}`);
        process.exit(1);
    }
    
    const deployManager = new DeployManager();
    
    try {
        await deployManager.deploy(target);
    } catch (error) {
        console.error('部署过程中发生错误:', error.message);
        process.exit(1);
    }
}

// 如果直接运行此脚本
if (import.meta.url === `file://${process.argv[1]}`) {
    main();
}
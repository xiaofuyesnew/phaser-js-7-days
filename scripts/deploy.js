#!/usr/bin/env node

import { execSync } from 'child_process';
import { existsSync, rmSync, mkdirSync, cpSync, writeFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const rootDir = join(__dirname, '..');

class DeployManager {
    constructor() {
        this.distDir = join(rootDir, 'dist');
        this.deployConfig = {
            githubPages: true,
            vercel: false,
            netlify: false,
            customDomain: null
        };
    }

    log(message, type = 'info') {
        const colors = {
            info: '\x1b[36m',
            success: '\x1b[32m',
            warning: '\x1b[33m',
            error: '\x1b[31m',
            reset: '\x1b[0m'
        };
        
        const timestamp = new Date().toLocaleTimeString();
        console.log(`${colors[type]}[${timestamp}] ${message}${colors.reset}`);
    }

    async checkEnvironment() {
        this.log('🔍 检查部署环境...');
        
        try {
            // 检查 Node.js 版本
            const nodeVersion = execSync('node --version', { encoding: 'utf8' }).trim();
            this.log(`Node.js 版本: ${nodeVersion}`);
            
            // 检查 pnpm
            const pnpmVersion = execSync('pnpm --version', { encoding: 'utf8' }).trim();
            this.log(`pnpm 版本: ${pnpmVersion}`);
            
            // 检查 Git
            const gitVersion = execSync('git --version', { encoding: 'utf8' }).trim();
            this.log(`Git 版本: ${gitVersion}`);
            
            this.log('✅ 环境检查通过', 'success');
        } catch (error) {
            this.log(`❌ 环境检查失败: ${error.message}`, 'error');
            process.exit(1);
        }
    }

    async runTests() {
        this.log('🧪 运行测试...');
        
        try {
            process.chdir(join(rootDir, 'testing'));
            execSync('pnpm install', { stdio: 'inherit' });
            execSync('pnpm test', { stdio: 'inherit' });
            execSync('pnpm test:content', { stdio: 'inherit' });
            
            this.log('✅ 所有测试通过', 'success');
        } catch (error) {
            this.log(`❌ 测试失败: ${error.message}`, 'error');
            process.exit(1);
        } finally {
            process.chdir(rootDir);
        }
    }

    async buildProjects() {
        this.log('📦 构建所有项目...');
        
        // 清理旧的构建文件
        if (existsSync(this.distDir)) {
            rmSync(this.distDir, { recursive: true });
        }
        mkdirSync(this.distDir, { recursive: true });

        try {
            // 构建在线阅读器
            this.log('构建在线阅读器...');
            process.chdir(join(rootDir, 'online-reader'));
            execSync('pnpm install', { stdio: 'inherit' });
            execSync('pnpm build', { stdio: 'inherit' });
            
            // 复制在线阅读器构建结果
            cpSync('dist', join(this.distDir), { recursive: true });
            
            // 生成 PDF 文档
            this.log('生成 PDF 文档...');
            process.chdir(join(rootDir, 'pdf-generator'));
            execSync('pnpm install', { stdio: 'inherit' });
            execSync('node src/cli.js --all', { stdio: 'inherit' });
            
            // 复制 PDF 文件
            const pdfDistDir = join(this.distDir, 'downloads');
            mkdirSync(pdfDistDir, { recursive: true });
            cpSync('dist', pdfDistDir, { recursive: true });
            
            // 构建教程项目
            this.log('构建教程项目...');
            const tutorialDirs = [
                '1_starter', '2_sprite', '3_tilemap', '4_camera',
                '5_enemy', '6_audio_ui_status', '7_deploy_review'
            ];
            
            for (const dir of tutorialDirs) {
                const sourceDir = join(rootDir, dir, 'source');
                if (existsSync(join(sourceDir, 'package.json'))) {
                    this.log(`构建 ${dir}...`);
                    process.chdir(sourceDir);
                    execSync('pnpm install', { stdio: 'inherit' });
                    execSync('pnpm build', { stdio: 'inherit' });
                    
                    // 复制构建结果
                    const demoDir = join(this.distDir, 'demos', dir);
                    mkdirSync(demoDir, { recursive: true });
                    cpSync('dist', demoDir, { recursive: true });
                }
            }
            
            this.log('✅ 所有项目构建完成', 'success');
        } catch (error) {
            this.log(`❌ 构建失败: ${error.message}`, 'error');
            process.exit(1);
        } finally {
            process.chdir(rootDir);
        }
    }

    async createDeploymentFiles() {
        this.log('📄 创建部署文件...');
        
        // 创建 CNAME 文件（如果有自定义域名）
        if (this.deployConfig.customDomain) {
            writeFileSync(
                join(this.distDir, 'CNAME'),
                this.deployConfig.customDomain
            );
            this.log(`创建 CNAME: ${this.deployConfig.customDomain}`);
        }
        
        // 创建 .nojekyll 文件（GitHub Pages）
        if (this.deployConfig.githubPages) {
            writeFileSync(join(this.distDir, '.nojekyll'), '');
            this.log('创建 .nojekyll 文件');
        }
        
        // 创建 404 页面
        const notFoundHtml = `<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>页面未找到 - 七天速通 Phaser.js 游戏开发</title>
    <style>
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            display: flex;
            justify-content: center;
            align-items: center;
            min-height: 100vh;
            margin: 0;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
        }
        .container {
            text-align: center;
            padding: 2rem;
        }
        h1 { font-size: 4rem; margin: 0; }
        p { font-size: 1.2rem; margin: 1rem 0; }
        a {
            color: #fff;
            text-decoration: none;
            padding: 0.8rem 1.5rem;
            border: 2px solid #fff;
            border-radius: 5px;
            transition: all 0.3s;
        }
        a:hover {
            background: #fff;
            color: #667eea;
        }
    </style>
</head>
<body>
    <div class="container">
        <h1>404</h1>
        <p>抱歉，您访问的页面不存在</p>
        <a href="/">返回首页</a>
    </div>
</body>
</html>`;
        
        writeFileSync(join(this.distDir, '404.html'), notFoundHtml);
        this.log('创建 404 页面');
        
        // 创建 robots.txt
        const robotsTxt = `User-agent: *
Allow: /

Sitemap: ${this.deployConfig.customDomain ? `https://${this.deployConfig.customDomain}` : 'https://your-username.github.io/phaser-tutorial-handbook'}/sitemap.xml`;
        
        writeFileSync(join(this.distDir, 'robots.txt'), robotsTxt);
        this.log('创建 robots.txt');
    }

    async deployToGitHubPages() {
        this.log('🚀 部署到 GitHub Pages...');
        
        try {
            // 检查是否有 gh-pages 分支
            try {
                execSync('git show-ref --verify --quiet refs/heads/gh-pages');
            } catch {
                // 创建 gh-pages 分支
                execSync('git checkout --orphan gh-pages');
                execSync('git rm -rf .');
                execSync('git commit --allow-empty -m "Initial gh-pages commit"');
                execSync('git checkout main || git checkout master');
            }
            
            // 使用 gh-pages 包部署
            execSync(`npx gh-pages -d ${this.distDir} -m "Deploy: $(date)"`, {
                stdio: 'inherit'
            });
            
            this.log('✅ GitHub Pages 部署完成', 'success');
        } catch (error) {
            this.log(`❌ GitHub Pages 部署失败: ${error.message}`, 'error');
            throw error;
        }
    }

    async deployToVercel() {
        this.log('🚀 部署到 Vercel...');
        
        try {
            // 创建 vercel.json 配置
            const vercelConfig = {
                version: 2,
                builds: [
                    {
                        src: "dist/**/*",
                        use: "@vercel/static"
                    }
                ],
                routes: [
                    {
                        src: "/(.*)",
                        dest: "/dist/$1"
                    }
                ]
            };
            
            writeFileSync(
                join(rootDir, 'vercel.json'),
                JSON.stringify(vercelConfig, null, 2)
            );
            
            execSync('npx vercel --prod', { stdio: 'inherit' });
            
            this.log('✅ Vercel 部署完成', 'success');
        } catch (error) {
            this.log(`❌ Vercel 部署失败: ${error.message}`, 'error');
            throw error;
        }
    }

    async deployToNetlify() {
        this.log('🚀 部署到 Netlify...');
        
        try {
            // 创建 _redirects 文件
            const redirects = `/*    /index.html   200`;
            writeFileSync(join(this.distDir, '_redirects'), redirects);
            
            execSync(`npx netlify deploy --prod --dir=${this.distDir}`, {
                stdio: 'inherit'
            });
            
            this.log('✅ Netlify 部署完成', 'success');
        } catch (error) {
            this.log(`❌ Netlify 部署失败: ${error.message}`, 'error');
            throw error;
        }
    }

    async optimizeForCDN() {
        this.log('⚡ 优化 CDN 配置...');
        
        // 创建缓存配置
        const cacheHeaders = `/*
  Cache-Control: public, max-age=31536000, immutable

/*.html
  Cache-Control: public, max-age=0, must-revalidate

/sw.js
  Cache-Control: public, max-age=0, must-revalidate

/api/*
  Cache-Control: public, max-age=300`;
        
        writeFileSync(join(this.distDir, '_headers'), cacheHeaders);
        this.log('创建缓存配置');
        
        // 压缩静态资源
        try {
            execSync(`npx gzip-size-cli ${this.distDir}/**/*.{js,css,html}`, {
                stdio: 'inherit'
            });
        } catch (error) {
            this.log('压缩工具未安装，跳过压缩优化', 'warning');
        }
    }

    async generateSitemap() {
        this.log('🗺️ 生成站点地图...');
        
        const baseUrl = this.deployConfig.customDomain 
            ? `https://${this.deployConfig.customDomain}`
            : 'https://your-username.github.io/phaser-tutorial-handbook';
            
        const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
    <url>
        <loc>${baseUrl}/</loc>
        <lastmod>${new Date().toISOString()}</lastmod>
        <changefreq>weekly</changefreq>
        <priority>1.0</priority>
    </url>
    <url>
        <loc>${baseUrl}/downloads/</loc>
        <lastmod>${new Date().toISOString()}</lastmod>
        <changefreq>monthly</changefreq>
        <priority>0.8</priority>
    </url>
    <url>
        <loc>${baseUrl}/demos/</loc>
        <lastmod>${new Date().toISOString()}</lastmod>
        <changefreq>monthly</changefreq>
        <priority>0.8</priority>
    </url>
</urlset>`;
        
        writeFileSync(join(this.distDir, 'sitemap.xml'), sitemap);
        this.log('站点地图生成完成');
    }

    async deploy(options = {}) {
        const startTime = Date.now();
        
        try {
            this.log('🚀 开始部署流程...', 'info');
            
            // 更新配置
            Object.assign(this.deployConfig, options);
            
            // 执行部署步骤
            await this.checkEnvironment();
            
            if (!options.skipTests) {
                await this.runTests();
            }
            
            await this.buildProjects();
            await this.createDeploymentFiles();
            await this.generateSitemap();
            await this.optimizeForCDN();
            
            // 根据配置部署到不同平台
            if (this.deployConfig.githubPages) {
                await this.deployToGitHubPages();
            }
            
            if (this.deployConfig.vercel) {
                await this.deployToVercel();
            }
            
            if (this.deployConfig.netlify) {
                await this.deployToNetlify();
            }
            
            const duration = ((Date.now() - startTime) / 1000).toFixed(2);
            this.log(`🎉 部署完成！耗时 ${duration} 秒`, 'success');
            
        } catch (error) {
            this.log(`💥 部署失败: ${error.message}`, 'error');
            process.exit(1);
        }
    }
}

// 命令行参数处理
const args = process.argv.slice(2);
const options = {};

for (let i = 0; i < args.length; i++) {
    switch (args[i]) {
        case '--skip-tests':
            options.skipTests = true;
            break;
        case '--vercel':
            options.vercel = true;
            options.githubPages = false;
            break;
        case '--netlify':
            options.netlify = true;
            options.githubPages = false;
            break;
        case '--domain':
            options.customDomain = args[++i];
            break;
        case '--help':
            console.log(`
部署脚本使用说明:

node scripts/deploy.js [选项]

选项:
  --skip-tests    跳过测试步骤
  --vercel        部署到 Vercel
  --netlify       部署到 Netlify
  --domain <url>  设置自定义域名
  --help          显示帮助信息

示例:
  node scripts/deploy.js                    # 部署到 GitHub Pages
  node scripts/deploy.js --vercel          # 部署到 Vercel
  node scripts/deploy.js --skip-tests      # 跳过测试直接部署
  node scripts/deploy.js --domain example.com  # 使用自定义域名
            `);
            process.exit(0);
    }
}

// 执行部署
const deployer = new DeployManager();
deployer.deploy(options);
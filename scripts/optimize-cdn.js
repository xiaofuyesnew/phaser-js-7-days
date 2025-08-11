#!/usr/bin/env node

import { readFileSync, writeFileSync, readdirSync, statSync } from 'fs';
import { join, extname, dirname } from 'path';
import { fileURLToPath } from 'url';
import { createHash } from 'crypto';
import { gzipSync, brotliCompressSync } from 'zlib';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const rootDir = join(__dirname, '..');

class CDNOptimizer {
    constructor(distDir) {
        this.distDir = distDir;
        this.stats = {
            totalFiles: 0,
            compressedFiles: 0,
            originalSize: 0,
            compressedSize: 0,
            hashedFiles: 0
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
        
        console.log(`${colors[type]}${message}${colors.reset}`);
    }

    // 生成文件哈希
    generateFileHash(filePath) {
        const content = readFileSync(filePath);
        return createHash('md5').update(content).digest('hex').substring(0, 8);
    }

    // 压缩文件
    compressFile(filePath) {
        const content = readFileSync(filePath);
        const originalSize = content.length;
        
        // Gzip 压缩
        const gzipContent = gzipSync(content, { level: 9 });
        writeFileSync(`${filePath}.gz`, gzipContent);
        
        // Brotli 压缩
        const brotliContent = brotliCompressSync(content, {
            params: {
                [require('zlib').constants.BROTLI_PARAM_QUALITY]: 11
            }
        });
        writeFileSync(`${filePath}.br`, brotliContent);
        
        this.stats.originalSize += originalSize;
        this.stats.compressedSize += Math.min(gzipContent.length, brotliContent.length);
        this.stats.compressedFiles++;
        
        return {
            original: originalSize,
            gzip: gzipContent.length,
            brotli: brotliContent.length
        };
    }

    // 添加文件哈希到文件名
    addHashToFilename(filePath) {
        const hash = this.generateFileHash(filePath);
        const ext = extname(filePath);
        const nameWithoutExt = filePath.replace(ext, '');
        const hashedPath = `${nameWithoutExt}.${hash}${ext}`;
        
        // 重命名文件
        require('fs').renameSync(filePath, hashedPath);
        this.stats.hashedFiles++;
        
        return {
            original: filePath,
            hashed: hashedPath,
            hash
        };
    }

    // 更新文件引用
    updateFileReferences(filePath, oldName, newName) {
        let content = readFileSync(filePath, 'utf8');
        const updated = content.replace(new RegExp(oldName, 'g'), newName);
        
        if (content !== updated) {
            writeFileSync(filePath, updated);
            return true;
        }
        return false;
    }

    // 递归处理目录
    processDirectory(dirPath) {
        const items = readdirSync(dirPath);
        const fileMap = new Map();
        
        for (const item of items) {
            const itemPath = join(dirPath, item);
            const stat = statSync(itemPath);
            
            if (stat.isDirectory()) {
                this.processDirectory(itemPath);
            } else if (stat.isFile()) {
                this.stats.totalFiles++;
                const ext = extname(item).toLowerCase();
                
                // 压缩静态资源
                if (['.js', '.css', '.html', '.json', '.xml', '.txt'].includes(ext)) {
                    const compressionResult = this.compressFile(itemPath);
                    this.log(`压缩 ${item}: ${compressionResult.original}B → ${compressionResult.gzip}B (gzip) / ${compressionResult.brotli}B (brotli)`);
                }
                
                // 为静态资源添加哈希
                if (['.js', '.css', '.png', '.jpg', '.jpeg', '.gif', '.svg', '.woff', '.woff2'].includes(ext)) {
                    const hashResult = this.addHashToFilename(itemPath);
                    fileMap.set(hashResult.original, hashResult.hashed);
                    this.log(`添加哈希 ${item} → ${hashResult.hashed.split('/').pop()}`);
                }
            }
        }
        
        // 更新文件引用
        this.updateReferences(dirPath, fileMap);
    }

    // 更新所有文件中的引用
    updateReferences(dirPath, fileMap) {
        const items = readdirSync(dirPath);
        
        for (const item of items) {
            const itemPath = join(dirPath, item);
            const stat = statSync(itemPath);
            
            if (stat.isDirectory()) {
                this.updateReferences(itemPath, fileMap);
            } else if (stat.isFile()) {
                const ext = extname(item).toLowerCase();
                
                if (['.html', '.css', '.js'].includes(ext)) {
                    let updated = false;
                    
                    for (const [oldPath, newPath] of fileMap) {
                        const oldName = oldPath.split('/').pop();
                        const newName = newPath.split('/').pop();
                        
                        if (this.updateFileReferences(itemPath, oldName, newName)) {
                            updated = true;
                        }
                    }
                    
                    if (updated) {
                        this.log(`更新引用 ${item}`);
                    }
                }
            }
        }
    }

    // 生成资源清单
    generateManifest() {
        const manifestPath = join(this.distDir, 'asset-manifest.json');
        const manifest = {
            version: Date.now(),
            files: {},
            entrypoints: []
        };
        
        const collectFiles = (dirPath, relativePath = '') => {
            const items = readdirSync(dirPath);
            
            for (const item of items) {
                const itemPath = join(dirPath, item);
                const stat = statSync(itemPath);
                const relativeItemPath = join(relativePath, item);
                
                if (stat.isDirectory()) {
                    collectFiles(itemPath, relativeItemPath);
                } else if (stat.isFile()) {
                    const ext = extname(item).toLowerCase();
                    
                    if (['.js', '.css', '.html'].includes(ext)) {
                        manifest.files[relativeItemPath] = {
                            size: stat.size,
                            hash: this.generateFileHash(itemPath),
                            type: ext.substring(1)
                        };
                        
                        if (item === 'index.html' || item.includes('main.')) {
                            manifest.entrypoints.push(relativeItemPath);
                        }
                    }
                }
            }
        };
        
        collectFiles(this.distDir);
        writeFileSync(manifestPath, JSON.stringify(manifest, null, 2));
        this.log(`生成资源清单: ${manifestPath}`);
    }

    // 生成 Service Worker
    generateServiceWorker() {
        const swPath = join(this.distDir, 'sw.js');
        const manifestPath = join(this.distDir, 'asset-manifest.json');
        
        let cacheFiles = [];
        
        if (require('fs').existsSync(manifestPath)) {
            const manifest = JSON.parse(readFileSync(manifestPath, 'utf8'));
            cacheFiles = Object.keys(manifest.files);
        }
        
        const swContent = `
const CACHE_NAME = 'phaser-tutorial-v${Date.now()}';
const urlsToCache = ${JSON.stringify(cacheFiles, null, 2)};

self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then((cache) => {
                console.log('Opened cache');
                return cache.addAll(urlsToCache);
            })
    );
});

self.addEventListener('fetch', (event) => {
    event.respondWith(
        caches.match(event.request)
            .then((response) => {
                // 缓存命中，返回缓存的资源
                if (response) {
                    return response;
                }
                
                // 网络请求
                return fetch(event.request).then((response) => {
                    // 检查是否是有效响应
                    if (!response || response.status !== 200 || response.type !== 'basic') {
                        return response;
                    }
                    
                    // 克隆响应
                    const responseToCache = response.clone();
                    
                    caches.open(CACHE_NAME)
                        .then((cache) => {
                            cache.put(event.request, responseToCache);
                        });
                    
                    return response;
                });
            })
    );
});

self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames.map((cacheName) => {
                    if (cacheName !== CACHE_NAME) {
                        console.log('Deleting old cache:', cacheName);
                        return caches.delete(cacheName);
                    }
                })
            );
        })
    );
});
        `.trim();
        
        writeFileSync(swPath, swContent);
        this.log(`生成 Service Worker: ${swPath}`);
    }

    // 优化图片
    async optimizeImages() {
        this.log('🖼️ 优化图片资源...');
        
        try {
            // 使用 sharp 优化图片（如果可用）
            const sharp = await import('sharp').catch(() => null);
            
            if (!sharp) {
                this.log('Sharp 未安装，跳过图片优化', 'warning');
                return;
            }
            
            const optimizeImage = async (imagePath) => {
                const ext = extname(imagePath).toLowerCase();
                const outputPath = imagePath.replace(ext, `.optimized${ext}`);
                
                try {
                    await sharp.default(imagePath)
                        .jpeg({ quality: 85, progressive: true })
                        .png({ compressionLevel: 9, progressive: true })
                        .webp({ quality: 85 })
                        .toFile(outputPath);
                    
                    // 替换原文件
                    require('fs').renameSync(outputPath, imagePath);
                    this.log(`优化图片: ${imagePath.split('/').pop()}`);
                } catch (error) {
                    this.log(`图片优化失败: ${imagePath} - ${error.message}`, 'warning');
                }
            };
            
            const processImagesInDir = async (dirPath) => {
                const items = readdirSync(dirPath);
                
                for (const item of items) {
                    const itemPath = join(dirPath, item);
                    const stat = statSync(itemPath);
                    
                    if (stat.isDirectory()) {
                        await processImagesInDir(itemPath);
                    } else if (stat.isFile()) {
                        const ext = extname(item).toLowerCase();
                        
                        if (['.jpg', '.jpeg', '.png', '.webp'].includes(ext)) {
                            await optimizeImage(itemPath);
                        }
                    }
                }
            };
            
            await processImagesInDir(this.distDir);
            
        } catch (error) {
            this.log(`图片优化失败: ${error.message}`, 'error');
        }
    }

    // 执行优化
    async optimize() {
        const startTime = Date.now();
        
        this.log('⚡ 开始 CDN 优化...');
        
        try {
            // 优化图片
            await this.optimizeImages();
            
            // 处理文件
            this.processDirectory(this.distDir);
            
            // 生成清单和 Service Worker
            this.generateManifest();
            this.generateServiceWorker();
            
            // 输出统计信息
            const duration = ((Date.now() - startTime) / 1000).toFixed(2);
            const compressionRatio = ((1 - this.stats.compressedSize / this.stats.originalSize) * 100).toFixed(1);
            
            this.log('✅ CDN 优化完成！', 'success');
            this.log(`📊 统计信息:`, 'info');
            this.log(`   总文件数: ${this.stats.totalFiles}`);
            this.log(`   压缩文件数: ${this.stats.compressedFiles}`);
            this.log(`   哈希文件数: ${this.stats.hashedFiles}`);
            this.log(`   原始大小: ${(this.stats.originalSize / 1024).toFixed(2)} KB`);
            this.log(`   压缩后大小: ${(this.stats.compressedSize / 1024).toFixed(2)} KB`);
            this.log(`   压缩率: ${compressionRatio}%`);
            this.log(`   耗时: ${duration} 秒`);
            
        } catch (error) {
            this.log(`❌ CDN 优化失败: ${error.message}`, 'error');
            throw error;
        }
    }
}

// 命令行使用
if (import.meta.url === `file://${process.argv[1]}`) {
    const distDir = process.argv[2] || join(rootDir, 'dist');
    
    if (!require('fs').existsSync(distDir)) {
        console.error(`错误: 目录不存在 ${distDir}`);
        process.exit(1);
    }
    
    const optimizer = new CDNOptimizer(distDir);
    optimizer.optimize().catch((error) => {
        console.error('优化失败:', error);
        process.exit(1);
    });
}

export { CDNOptimizer };
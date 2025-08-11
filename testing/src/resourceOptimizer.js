#!/usr/bin/env node

import fs from 'fs-extra';
import path from 'path';
import chalk from 'chalk';
import { glob } from 'glob';

/**
 * 资源加载优化和缓存策略实现
 * 优化教程项目的资源加载性能
 */
class ResourceOptimizer {
  constructor() {
    this.optimizations = [];
    this.cacheStrategies = [];
    this.compressionResults = [];
  }

  /**
   * 优化所有教程资源
   */
  async optimizeAll() {
    console.log(chalk.blue('🚀 开始资源优化...'));
    
    // 分析资源使用情况
    await this.analyzeResourceUsage();
    
    // 实现缓存策略
    await this.implementCacheStrategies();
    
    // 优化图片资源
    await this.optimizeImages();
    
    // 优化音频资源
    await this.optimizeAudio();
    
    // 优化代码资源
    await this.optimizeCode();
    
    // 生成优化建议
    this.generateOptimizationRecommendations();
    
    // 生成报告
    this.generateOptimizationReport();
  }

  /**
   * 分析资源使用情况
   */
  async analyzeResourceUsage() {
    console.log(chalk.yellow('📊 分析资源使用情况...'));
    
    const tutorialDirs = await glob('../[1-7]_*/source', { cwd: import.meta.url });
    
    for (const dir of tutorialDirs) {
      await this.analyzeProjectResources(dir);
    }
  }

  /**
   * 分析单个项目的资源
   */
  async analyzeProjectResources(projectDir) {
    const dayNumber = projectDir.match(/(\d+)_/)?.[1];
    console.log(chalk.gray(`  🔍 分析 Day ${dayNumber} 资源...`));
    
    const analysis = {
      day: dayNumber,
      images: [],
      audio: [],
      scripts: [],
      styles: [],
      totalSize: 0,
      recommendations: []
    };
    
    // 分析图片资源
    const imageFiles = await glob('**/*.{png,jpg,jpeg,gif,svg,webp}', { cwd: projectDir });
    for (const file of imageFiles) {
      const filePath = path.join(projectDir, file);
      const stats = await fs.stat(filePath);
      analysis.images.push({
        path: file,
        size: stats.size,
        extension: path.extname(file)
      });
      analysis.totalSize += stats.size;
    }
    
    // 分析音频资源
    const audioFiles = await glob('**/*.{mp3,wav,ogg,m4a}', { cwd: projectDir });
    for (const file of audioFiles) {
      const filePath = path.join(projectDir, file);
      const stats = await fs.stat(filePath);
      analysis.audio.push({
        path: file,
        size: stats.size,
        extension: path.extname(file)
      });
      analysis.totalSize += stats.size;
    }
    
    // 分析脚本文件
    const scriptFiles = await glob('**/*.js', { cwd: projectDir });
    for (const file of scriptFiles) {
      if (!file.includes('node_modules')) {
        const filePath = path.join(projectDir, file);
        const stats = await fs.stat(filePath);
        const content = await fs.readFile(filePath, 'utf-8');
        analysis.scripts.push({
          path: file,
          size: stats.size,
          lines: content.split('\n').length,
          minifiable: this.isMinifiable(content)
        });
        analysis.totalSize += stats.size;
      }
    }
    
    // 分析样式文件
    const styleFiles = await glob('**/*.{css,scss,sass}', { cwd: projectDir });
    for (const file of styleFiles) {
      const filePath = path.join(projectDir, file);
      const stats = await fs.stat(filePath);
      analysis.styles.push({
        path: file,
        size: stats.size
      });
      analysis.totalSize += stats.size;
    }
    
    // 生成优化建议
    this.generateResourceRecommendations(analysis);
    
    this.optimizations.push(analysis);
  }

  /**
   * 检查代码是否可以压缩
   */
  isMinifiable(code) {
    // 简单检查是否已经压缩
    const lines = code.split('\n');
    const avgLineLength = code.length / lines.length;
    const hasComments = code.includes('//') || code.includes('/*');
    const hasWhitespace = /\s{2,}/.test(code);
    
    return avgLineLength < 100 && (hasComments || hasWhitespace);
  }

  /**
   * 生成资源优化建议
   */
  generateResourceRecommendations(analysis) {
    // 图片优化建议
    const largeImages = analysis.images.filter(img => img.size > 500 * 1024); // 500KB
    if (largeImages.length > 0) {
      analysis.recommendations.push({
        type: 'image',
        priority: 'high',
        message: `发现 ${largeImages.length} 个大图片文件，建议压缩或转换格式`
      });
    }
    
    // 音频优化建议
    const largeAudio = analysis.audio.filter(audio => audio.size > 1024 * 1024); // 1MB
    if (largeAudio.length > 0) {
      analysis.recommendations.push({
        type: 'audio',
        priority: 'medium',
        message: `发现 ${largeAudio.length} 个大音频文件，建议压缩或使用更高效的格式`
      });
    }
    
    // 代码优化建议
    const minifiableScripts = analysis.scripts.filter(script => script.minifiable);
    if (minifiableScripts.length > 0) {
      analysis.recommendations.push({
        type: 'script',
        priority: 'medium',
        message: `发现 ${minifiableScripts.length} 个可压缩的脚本文件`
      });
    }
    
    // 总体大小建议
    if (analysis.totalSize > 10 * 1024 * 1024) { // 10MB
      analysis.recommendations.push({
        type: 'overall',
        priority: 'high',
        message: `项目总大小 ${(analysis.totalSize / 1024 / 1024).toFixed(1)}MB，建议进行资源优化`
      });
    }
  }

  /**
   * 实现缓存策略
   */
  async implementCacheStrategies() {
    console.log(chalk.yellow('💾 实现缓存策略...'));
    
    // 为每个项目生成缓存配置
    const tutorialDirs = await glob('../[1-7]_*/source', { cwd: import.meta.url });
    
    for (const dir of tutorialDirs) {
      await this.generateCacheConfig(dir);
    }
  }

  /**
   * 生成缓存配置
   */
  async generateCacheConfig(projectDir) {
    const dayNumber = projectDir.match(/(\d+)_/)?.[1];
    console.log(chalk.gray(`  ⚙️  生成 Day ${dayNumber} 缓存配置...`));
    
    const cacheConfig = {
      day: dayNumber,
      strategies: {
        images: {
          maxAge: '1y',
          cacheControl: 'public, max-age=31536000, immutable',
          etag: true
        },
        audio: {
          maxAge: '1y',
          cacheControl: 'public, max-age=31536000, immutable',
          etag: true
        },
        scripts: {
          maxAge: '1d',
          cacheControl: 'public, max-age=86400',
          etag: true,
          compression: 'gzip'
        },
        styles: {
          maxAge: '1d',
          cacheControl: 'public, max-age=86400',
          etag: true,
          compression: 'gzip'
        }
      },
      serviceWorker: this.generateServiceWorkerConfig(projectDir),
      manifestCache: this.generateManifestCache(projectDir)
    };
    
    // 生成 Service Worker 文件
    await this.createServiceWorker(projectDir, cacheConfig);
    
    // 生成缓存清单
    await this.createCacheManifest(projectDir, cacheConfig);
    
    this.cacheStrategies.push(cacheConfig);
  }

  /**
   * 生成 Service Worker 配置
   */
  generateServiceWorkerConfig(projectDir) {
    return {
      cacheName: `phaser-tutorial-v1`,
      precacheFiles: [
        '/',
        '/index.html',
        '/src/main.js',
        '/style.css'
      ],
      runtimeCaching: [
        {
          urlPattern: /\.(?:png|jpg|jpeg|svg|gif)$/,
          handler: 'CacheFirst',
          options: {
            cacheName: 'images',
            expiration: {
              maxEntries: 50,
              maxAgeSeconds: 30 * 24 * 60 * 60 // 30 days
            }
          }
        },
        {
          urlPattern: /\.(?:mp3|wav|ogg)$/,
          handler: 'CacheFirst',
          options: {
            cacheName: 'audio',
            expiration: {
              maxEntries: 20,
              maxAgeSeconds: 30 * 24 * 60 * 60 // 30 days
            }
          }
        }
      ]
    };
  }

  /**
   * 生成清单缓存
   */
  generateManifestCache(projectDir) {
    return {
      version: '1.0.0',
      files: [
        'index.html',
        'src/main.js',
        'style.css'
      ],
      hash: this.generateCacheHash()
    };
  }

  /**
   * 生成缓存哈希
   */
  generateCacheHash() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }

  /**
   * 创建 Service Worker 文件
   */
  async createServiceWorker(projectDir, cacheConfig) {
    const swContent = `
// Service Worker for Phaser.js Tutorial
// Generated by Resource Optimizer

const CACHE_NAME = '${cacheConfig.serviceWorker.cacheName}';
const PRECACHE_FILES = ${JSON.stringify(cacheConfig.serviceWorker.precacheFiles, null, 2)};

// Install event - precache files
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('Precaching files');
        return cache.addAll(PRECACHE_FILES);
      })
      .then(() => self.skipWaiting())
  );
});

// Activate event - clean up old caches
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
    }).then(() => self.clients.claim())
  );
});

// Fetch event - serve from cache, fallback to network
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        // Return cached version or fetch from network
        return response || fetch(event.request).then((fetchResponse) => {
          // Cache successful responses
          if (fetchResponse.status === 200) {
            const responseClone = fetchResponse.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(event.request, responseClone);
            });
          }
          return fetchResponse;
        });
      })
      .catch(() => {
        // Fallback for offline
        if (event.request.destination === 'document') {
          return caches.match('/index.html');
        }
      })
  );
});
`;
    
    const swPath = path.join(projectDir, 'public/sw.js');
    await fs.ensureDir(path.dirname(swPath));
    await fs.writeFile(swPath, swContent);
  }

  /**
   * 创建缓存清单
   */
  async createCacheManifest(projectDir, cacheConfig) {
    const manifestPath = path.join(projectDir, 'public/cache.manifest');
    const manifestContent = `CACHE MANIFEST
# Version ${cacheConfig.manifestCache.version}
# Hash: ${cacheConfig.manifestCache.hash}

CACHE:
${cacheConfig.manifestCache.files.join('\n')}

NETWORK:
*

FALLBACK:
/ /index.html
`;
    
    await fs.ensureDir(path.dirname(manifestPath));
    await fs.writeFile(manifestPath, manifestContent);
  }

  /**
   * 优化图片资源
   */
  async optimizeImages() {
    console.log(chalk.yellow('🖼️  优化图片资源...'));
    
    for (const optimization of this.optimizations) {
      for (const image of optimization.images) {
        const optimizationResult = await this.optimizeImage(image, optimization.day);
        if (optimizationResult) {
          this.compressionResults.push(optimizationResult);
        }
      }
    }
  }

  /**
   * 优化单个图片
   */
  async optimizeImage(image, day) {
    // 这里应该实现实际的图片优化逻辑
    // 由于需要外部工具，这里只是模拟
    
    const originalSize = image.size;
    let optimizedSize = originalSize;
    const recommendations = [];
    
    // 检查文件格式
    if (image.extension === '.png' && originalSize > 100 * 1024) {
      recommendations.push('考虑转换为 WebP 格式以减小文件大小');
      optimizedSize *= 0.7; // 估算 WebP 压缩率
    }
    
    if (image.extension === '.jpg' && originalSize > 200 * 1024) {
      recommendations.push('考虑降低 JPEG 质量或使用渐进式 JPEG');
      optimizedSize *= 0.8; // 估算压缩率
    }
    
    if (originalSize > 1024 * 1024) {
      recommendations.push('图片过大，建议调整尺寸或进一步压缩');
      optimizedSize *= 0.6;
    }
    
    return {
      day,
      file: image.path,
      originalSize,
      optimizedSize,
      savings: originalSize - optimizedSize,
      savingsPercent: ((originalSize - optimizedSize) / originalSize) * 100,
      recommendations
    };
  }

  /**
   * 优化音频资源
   */
  async optimizeAudio() {
    console.log(chalk.yellow('🔊 优化音频资源...'));
    
    for (const optimization of this.optimizations) {
      for (const audio of optimization.audio) {
        const optimizationResult = await this.optimizeAudioFile(audio, optimization.day);
        if (optimizationResult) {
          this.compressionResults.push(optimizationResult);
        }
      }
    }
  }

  /**
   * 优化单个音频文件
   */
  async optimizeAudioFile(audio, day) {
    const originalSize = audio.size;
    let optimizedSize = originalSize;
    const recommendations = [];
    
    // 检查音频格式
    if (audio.extension === '.wav') {
      recommendations.push('WAV 文件未压缩，建议转换为 MP3 或 OGG');
      optimizedSize *= 0.1; // WAV 到 MP3 的压缩率
    }
    
    if (audio.extension === '.mp3' && originalSize > 500 * 1024) {
      recommendations.push('考虑降低 MP3 比特率或使用 OGG 格式');
      optimizedSize *= 0.8;
    }
    
    if (originalSize > 2 * 1024 * 1024) {
      recommendations.push('音频文件过大，考虑分段加载或流式播放');
      optimizedSize *= 0.7;
    }
    
    return {
      day,
      file: audio.path,
      originalSize,
      optimizedSize,
      savings: originalSize - optimizedSize,
      savingsPercent: ((originalSize - optimizedSize) / originalSize) * 100,
      recommendations
    };
  }

  /**
   * 优化代码资源
   */
  async optimizeCode() {
    console.log(chalk.yellow('📝 优化代码资源...'));
    
    for (const optimization of this.optimizations) {
      // 生成代码优化建议
      await this.generateCodeOptimizations(optimization);
    }
  }

  /**
   * 生成代码优化建议
   */
  async generateCodeOptimizations(optimization) {
    const codeOptimizations = {
      day: optimization.day,
      minification: {
        enabled: false,
        estimatedSavings: 0
      },
      bundling: {
        recommended: optimization.scripts.length > 3,
        estimatedSavings: 0
      },
      treeshaking: {
        recommended: true,
        estimatedSavings: 0
      },
      compression: {
        gzip: true,
        brotli: true,
        estimatedSavings: 0
      }
    };
    
    // 计算压缩节省
    const totalScriptSize = optimization.scripts.reduce((sum, script) => sum + script.size, 0);
    
    if (totalScriptSize > 50 * 1024) { // 50KB
      codeOptimizations.minification.enabled = true;
      codeOptimizations.minification.estimatedSavings = totalScriptSize * 0.3; // 30% 压缩
    }
    
    if (optimization.scripts.length > 3) {
      codeOptimizations.bundling.estimatedSavings = totalScriptSize * 0.1; // 10% 减少请求开销
    }
    
    codeOptimizations.compression.estimatedSavings = totalScriptSize * 0.7; // 70% gzip 压缩
    
    this.compressionResults.push({
      type: 'code',
      day: optimization.day,
      optimizations: codeOptimizations
    });
  }

  /**
   * 生成优化建议
   */
  generateOptimizationRecommendations() {
    console.log(chalk.yellow('💡 生成优化建议...'));
    
    // 这里可以基于分析结果生成具体的优化建议
    // 已经在各个优化方法中实现
  }

  /**
   * 生成优化报告
   */
  generateOptimizationReport() {
    console.log(chalk.blue('\n📊 资源优化报告'));
    console.log('='.repeat(60));
    
    // 总体统计
    const totalOriginalSize = this.optimizations.reduce((sum, opt) => sum + opt.totalSize, 0);
    const totalSavings = this.compressionResults.reduce((sum, result) => 
      sum + (result.savings || 0), 0);
    
    console.log(chalk.green(`\n📦 资源统计:`));
    console.log(`  原始总大小: ${(totalOriginalSize / 1024 / 1024).toFixed(1)}MB`);
    console.log(`  预计节省: ${(totalSavings / 1024 / 1024).toFixed(1)}MB`);
    console.log(`  压缩率: ${((totalSavings / totalOriginalSize) * 100).toFixed(1)}%`);
    
    // 按天显示优化结果
    console.log(chalk.green('\n📈 各天优化结果:'));
    this.optimizations.forEach(opt => {
      console.log(`  Day ${opt.day}:`);
      console.log(`    - 图片: ${opt.images.length} 个文件`);
      console.log(`    - 音频: ${opt.audio.length} 个文件`);
      console.log(`    - 脚本: ${opt.scripts.length} 个文件`);
      console.log(`    - 总大小: ${(opt.totalSize / 1024 / 1024).toFixed(1)}MB`);
      
      if (opt.recommendations.length > 0) {
        console.log(`    - 建议:`);
        opt.recommendations.forEach(rec => {
          const priority = rec.priority === 'high' ? '🔴' : 
                          rec.priority === 'medium' ? '🟡' : '🟢';
          console.log(`      ${priority} ${rec.message}`);
        });
      }
    });
    
    // 缓存策略报告
    console.log(chalk.green('\n💾 缓存策略:'));
    this.cacheStrategies.forEach(strategy => {
      console.log(`  Day ${strategy.day}:`);
      console.log(`    - Service Worker: 已配置`);
      console.log(`    - 缓存清单: 已生成`);
      console.log(`    - 图片缓存: ${strategy.strategies.images.maxAge}`);
      console.log(`    - 脚本缓存: ${strategy.strategies.scripts.maxAge}`);
    });
    
    // 保存报告
    this.saveOptimizationReport();
  }

  /**
   * 保存优化报告
   */
  async saveOptimizationReport() {
    const report = {
      timestamp: new Date().toISOString(),
      optimizations: this.optimizations,
      cacheStrategies: this.cacheStrategies,
      compressionResults: this.compressionResults,
      summary: {
        totalProjects: this.optimizations.length,
        totalOriginalSize: this.optimizations.reduce((sum, opt) => sum + opt.totalSize, 0),
        totalSavings: this.compressionResults.reduce((sum, result) => sum + (result.savings || 0), 0)
      }
    };
    
    await fs.ensureDir('reports');
    await fs.writeJson('reports/resource-optimization.json', report, { spaces: 2 });
    
    console.log(chalk.blue('\n💾 优化报告已保存到 reports/resource-optimization.json'));
  }
}

// 运行资源优化
if (import.meta.url === `file://${process.argv[1]}`) {
  const optimizer = new ResourceOptimizer();
  optimizer.optimizeAll().catch(console.error);
}

export default ResourceOptimizer;
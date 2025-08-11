# 开发者文档

本文档为《七天速通 Phaser.js 游戏开发》项目的开发者提供详细的技术指南和最佳实践。

## 📋 目录

- [项目架构](#项目架构)
- [开发环境](#开发环境)
- [代码结构](#代码结构)
- [构建系统](#构建系统)
- [测试策略](#测试策略)
- [部署流程](#部署流程)
- [API设计](#api设计)
- [性能优化](#性能优化)
- [调试指南](#调试指南)
- [故障排除](#故障排除)

## 🏗️ 项目架构

### 整体架构

```
phaser-tutorial-handbook/
├── 教程内容模块/
│   ├── 1_starter/           # Day 1: 基础教程
│   ├── 2_sprite/            # Day 2: 精灵系统
│   ├── 3_tilemap/           # Day 3: 地图物理
│   ├── 4_camera/            # Day 4: 摄像机系统
│   ├── 5_enemy/             # Day 5: 敌人AI
│   ├── 6_audio_ui_status/   # Day 6: 音效UI
│   └── 7_deploy_review/     # Day 7: 部署优化
├── 工具和系统/
│   ├── online-reader/       # 在线阅读系统
│   ├── pdf-generator/       # PDF生成系统
│   ├── email-course/        # 邮件课程系统
│   └── testing/             # 测试系统
├── 辅助资源/
│   ├── for_frontend_beginner/ # 环境搭建
│   ├── recommend_resource/    # 资源推荐
│   └── project-template/      # 项目模板
└── 配置文件/
    ├── .github/             # GitHub Actions
    ├── .vscode/             # VS Code 配置
    └── 各种配置文件
```

### 技术栈

#### 前端技术
- **Phaser.js 3.90+**: HTML5游戏引擎
- **Vite 5.0+**: 现代构建工具
- **Vue.js 3.0+**: 在线阅读器UI框架
- **ES6+**: 现代JavaScript语法

#### 后端技术
- **Node.js 18+**: 服务器运行环境
- **Express.js**: Web框架
- **SQLite**: 轻量级数据库
- **Nodemailer**: 邮件发送服务

#### 构建和部署
- **GitHub Actions**: CI/CD自动化
- **Puppeteer**: PDF生成
- **Playwright**: 浏览器测试
- **Vitest**: 单元测试框架## 🛠️ 开发环境


### 系统要求

- **Node.js**: 18.0+ (推荐使用 LTS 版本)
- **pnpm**: 8.0+ (推荐的包管理器)
- **Git**: 2.30+ (版本控制)
- **VS Code**: 最新版本 (推荐编辑器)

### 环境搭建

```bash
# 1. 克隆项目
git clone https://github.com/your-repo/phaser-tutorial-handbook.git
cd phaser-tutorial-handbook

# 2. 安装全局依赖
npm install -g pnpm

# 3. 安装项目依赖
pnpm install

# 4. 初始化所有子项目
node project-template/setup-project.js

# 5. 验证环境
node for_frontend_beginner/scripts/check-environment.js
```

### VS Code 配置

推荐安装的扩展：
```json
{
  "recommendations": [
    "esbenp.prettier-vscode",
    "dbaeumer.vscode-eslint",
    "bradlc.vscode-tailwindcss",
    "ms-vscode.vscode-json",
    "yzhang.markdown-all-in-one",
    "ms-playwright.playwright"
  ]
}
```

工作区设置：
```json
{
  "editor.formatOnSave": true,
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": true
  },
  "files.associations": {
    "*.md": "markdown"
  }
}
```

## 📁 代码结构

### 教程项目结构

每个教程项目都遵循统一的结构：

```
day_project/
├── README.md              # 教程文档
├── source/                # 源代码
│   ├── src/
│   │   ├── main.js       # 入口文件
│   │   ├── scenes/       # 游戏场景
│   │   ├── sprites/      # 精灵类
│   │   ├── systems/      # 游戏系统
│   │   └── utils/        # 工具函数
│   ├── public/           # 静态资源
│   ├── package.json      # 项目配置
│   └── vite.config.js    # 构建配置
└── EXERCISES.md          # 练习题
```

### 核心类设计

#### 场景基类
```javascript
// src/scenes/BaseScene.js
export class BaseScene extends Phaser.Scene {
    constructor(config) {
        super(config);
        this.gameObjects = new Map();
        this.systems = new Map();
    }
    
    init(data) {
        this.sceneData = data;
    }
    
    preload() {
        this.createLoadingBar();
        this.loadAssets();
    }
    
    create() {
        this.createSystems();
        this.createGameObjects();
        this.setupEvents();
    }
    
    update(time, delta) {
        this.updateSystems(time, delta);
        this.updateGameObjects(time, delta);
    }
}
```

#### 精灵基类
```javascript
// src/sprites/BaseSprite.js
export class BaseSprite extends Phaser.Physics.Arcade.Sprite {
    constructor(scene, x, y, texture) {
        super(scene, x, y, texture);
        
        scene.add.existing(this);
        scene.physics.add.existing(this);
        
        this.setupProperties();
        this.setupPhysics();
        this.setupAnimations();
    }
    
    setupProperties() {
        // 子类实现
    }
    
    setupPhysics() {
        // 子类实现
    }
    
    setupAnimations() {
        // 子类实现
    }
    
    update(time, delta) {
        // 子类实现
    }
}
```

## 🔧 构建系统

### Vite 配置

```javascript
// vite.config.js
import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
    base: './',
    build: {
        outDir: 'dist',
        assetsDir: 'assets',
        rollupOptions: {
            input: {
                main: resolve(__dirname, 'index.html')
            },
            output: {
                manualChunks: {
                    phaser: ['phaser'],
                    vendor: ['lodash', 'axios']
                }
            }
        },
        minify: 'terser',
        terserOptions: {
            compress: {
                drop_console: true,
                drop_debugger: true
            }
        }
    },
    server: {
        port: 3000,
        open: true,
        cors: true
    },
    resolve: {
        alias: {
            '@': resolve(__dirname, 'src'),
            '@assets': resolve(__dirname, 'public/assets')
        }
    }
});
```

### 构建脚本

```json
{
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview",
    "build:analyze": "vite build --mode analyze",
    "build:production": "NODE_ENV=production vite build",
    "clean": "rimraf dist"
  }
}
```

## 🧪 测试策略

### 测试分类

1. **单元测试**: 测试独立的函数和类
2. **集成测试**: 测试组件间的交互
3. **端到端测试**: 测试完整的用户流程
4. **性能测试**: 测试游戏性能指标
5. **兼容性测试**: 测试浏览器兼容性

### 测试配置

```javascript
// vitest.config.js
import { defineConfig } from 'vitest/config';

export default defineConfig({
    test: {
        environment: 'jsdom',
        globals: true,
        setupFiles: ['./tests/setup.js'],
        coverage: {
            reporter: ['text', 'json', 'html'],
            exclude: [
                'node_modules/',
                'tests/',
                '**/*.config.js'
            ]
        }
    }
});
```

### 测试示例

```javascript
// tests/sprites/Player.test.js
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { Player } from '@/sprites/Player.js';

describe('Player', () => {
    let mockScene;
    let player;
    
    beforeEach(() => {
        mockScene = {
            add: { existing: vi.fn() },
            physics: { add: { existing: vi.fn() } },
            anims: { create: vi.fn() }
        };
        
        player = new Player(mockScene, 100, 100);
    });
    
    it('should initialize with correct properties', () => {
        expect(player.health).toBe(100);
        expect(player.speed).toBe(160);
    });
    
    it('should handle damage correctly', () => {
        player.takeDamage(30);
        expect(player.health).toBe(70);
    });
});
```

## 🚀 部署流程

### GitHub Actions 配置

```yaml
# .github/workflows/deploy.yml
name: Deploy to GitHub Pages

on:
  push:
    branches: [ main ]
  pull_request:
    branches: [ main ]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
          cache: 'pnpm'
      
      - name: Install dependencies
        run: pnpm install
      
      - name: Run tests
        run: pnpm test
      
      - name: Run build
        run: pnpm build

  deploy:
    needs: test
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'
    
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
          cache: 'pnpm'
      
      - name: Install and Build
        run: |
          pnpm install
          pnpm build
      
      - name: Deploy to GitHub Pages
        uses: peaceiris/actions-gh-pages@v3
        with:
          github_token: ${{ secrets.GITHUB_TOKEN }}
          publish_dir: ./dist
```

### 部署脚本

```javascript
// scripts/deploy.js
import { execSync } from 'child_process';
import { existsSync, rmSync } from 'fs';

const deployToGitHubPages = () => {
    console.log('🚀 开始部署到 GitHub Pages...');
    
    // 清理旧的构建文件
    if (existsSync('dist')) {
        rmSync('dist', { recursive: true });
    }
    
    // 构建项目
    console.log('📦 构建项目...');
    execSync('pnpm build', { stdio: 'inherit' });
    
    // 部署到 gh-pages 分支
    console.log('🌐 部署到 GitHub Pages...');
    execSync('gh-pages -d dist', { stdio: 'inherit' });
    
    console.log('✅ 部署完成！');
};

deployToGitHubPages();
```

## 📊 API设计

### RESTful API 规范

```javascript
// 邮件课程 API
GET    /api/courses              # 获取课程列表
POST   /api/courses              # 创建新课程
GET    /api/courses/:id          # 获取特定课程
PUT    /api/courses/:id          # 更新课程
DELETE /api/courses/:id          # 删除课程

GET    /api/subscriptions        # 获取订阅列表
POST   /api/subscriptions        # 创建订阅
DELETE /api/subscriptions/:id    # 取消订阅

POST   /api/emails/send          # 发送邮件
GET    /api/emails/status/:id    # 获取邮件状态
```

### 响应格式

```javascript
// 成功响应
{
    "success": true,
    "data": {
        // 响应数据
    },
    "message": "操作成功"
}

// 错误响应
{
    "success": false,
    "error": {
        "code": "ERROR_CODE",
        "message": "错误描述",
        "details": {}
    }
}
```

## ⚡ 性能优化

### 游戏性能优化

```javascript
// 对象池模式
class ObjectPool {
    constructor(createFn, resetFn, initialSize = 10) {
        this.createFn = createFn;
        this.resetFn = resetFn;
        this.pool = [];
        
        // 预创建对象
        for (let i = 0; i < initialSize; i++) {
            this.pool.push(this.createFn());
        }
    }
    
    get() {
        if (this.pool.length > 0) {
            return this.pool.pop();
        }
        return this.createFn();
    }
    
    release(obj) {
        this.resetFn(obj);
        this.pool.push(obj);
    }
}

// 使用示例
const bulletPool = new ObjectPool(
    () => new Bullet(scene, 0, 0),
    (bullet) => {
        bullet.setActive(false);
        bullet.setVisible(false);
    },
    20
);
```

### 资源优化

```javascript
// 资源预加载策略
class AssetManager {
    constructor(scene) {
        this.scene = scene;
        this.loadedAssets = new Set();
        this.loadingPromises = new Map();
    }
    
    async loadAsset(key, url) {
        if (this.loadedAssets.has(key)) {
            return Promise.resolve();
        }
        
        if (this.loadingPromises.has(key)) {
            return this.loadingPromises.get(key);
        }
        
        const promise = new Promise((resolve, reject) => {
            this.scene.load.image(key, url);
            this.scene.load.once('complete', () => {
                this.loadedAssets.add(key);
                resolve();
            });
            this.scene.load.once('loaderror', reject);
            this.scene.load.start();
        });
        
        this.loadingPromises.set(key, promise);
        return promise;
    }
}
```

## 🐛 调试指南

### 调试工具

```javascript
// 调试信息显示
class DebugManager {
    constructor(scene) {
        this.scene = scene;
        this.debugText = null;
        this.isEnabled = false;
    }
    
    enable() {
        this.isEnabled = true;
        this.debugText = this.scene.add.text(10, 10, '', {
            fontSize: '14px',
            fill: '#00ff00',
            backgroundColor: '#000000'
        });
        this.debugText.setScrollFactor(0);
        this.debugText.setDepth(1000);
    }
    
    update(debugInfo) {
        if (!this.isEnabled) return;
        
        const info = [
            `FPS: ${Math.round(this.scene.game.loop.actualFps)}`,
            `Objects: ${this.scene.children.length}`,
            `Memory: ${this.getMemoryUsage()}MB`,
            ...Object.entries(debugInfo).map(([key, value]) => `${key}: ${value}`)
        ];
        
        this.debugText.setText(info.join('\n'));
    }
    
    getMemoryUsage() {
        return performance.memory ? 
            Math.round(performance.memory.usedJSHeapSize / 1048576) : 0;
    }
}
```

### 常用调试命令

```javascript
// 浏览器控制台调试
window.game = game;  // 暴露游戏实例到全局

// 调试物理边界
game.scene.scenes[0].physics.world.drawDebug = true;

// 暂停/恢复游戏
game.scene.pause('GameScene');
game.scene.resume('GameScene');

// 切换场景
game.scene.start('MenuScene');
```

## 🔧 故障排除

### 常见问题

#### 1. 游戏无法启动
```bash
# 检查 Node.js 版本
node --version  # 应该 >= 18.0

# 清理缓存
rm -rf node_modules
rm pnpm-lock.yaml
pnpm install

# 检查端口占用
lsof -i :3000
```

#### 2. 资源加载失败
```javascript
// 检查资源路径
this.load.on('loaderror', (file) => {
    console.error('Failed to load:', file.src);
});

// 使用相对路径
this.load.image('player', './assets/player.png');
```

#### 3. 性能问题
```javascript
// 监控性能
const stats = new Stats();
document.body.appendChild(stats.dom);

function animate() {
    stats.begin();
    // 游戏逻辑
    stats.end();
    requestAnimationFrame(animate);
}
```

### 日志系统

```javascript
// 统一日志管理
class Logger {
    static levels = {
        ERROR: 0,
        WARN: 1,
        INFO: 2,
        DEBUG: 3
    };
    
    static currentLevel = Logger.levels.INFO;
    
    static log(level, message, ...args) {
        if (level <= this.currentLevel) {
            const timestamp = new Date().toISOString();
            const levelName = Object.keys(this.levels)[level];
            console.log(`[${timestamp}] ${levelName}: ${message}`, ...args);
        }
    }
    
    static error(message, ...args) {
        this.log(this.levels.ERROR, message, ...args);
    }
    
    static warn(message, ...args) {
        this.log(this.levels.WARN, message, ...args);
    }
    
    static info(message, ...args) {
        this.log(this.levels.INFO, message, ...args);
    }
    
    static debug(message, ...args) {
        this.log(this.levels.DEBUG, message, ...args);
    }
}
```

## 📚 参考资源

### 官方文档
- [Phaser.js 官方文档](https://phaser.io/learn)
- [Vite 官方文档](https://vitejs.dev/)
- [Vitest 测试框架](https://vitest.dev/)

### 社区资源
- [Phaser 社区论坛](https://phaser.io/community)
- [GitHub Discussions](https://github.com/your-repo/discussions)
- [Stack Overflow](https://stackoverflow.com/questions/tagged/phaser-framework)

### 开发工具
- [Phaser Editor 2D](https://phasereditor2d.com/)
- [Tiled Map Editor](https://www.mapeditor.org/)
- [Chrome DevTools](https://developers.google.com/web/tools/chrome-devtools)

---

如有其他技术问题，请查看 [FAQ](FAQ.md) 或在 [GitHub Issues](https://github.com/your-repo/issues) 中提问。
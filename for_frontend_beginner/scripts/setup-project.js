#!/usr/bin/env node

/**
 * 项目快速搭建脚本
 * 自动创建 Phaser.js 项目模板
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const readline = require('readline');

// 颜色输出
const colors = {
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  reset: '\x1b[0m',
  bold: '\x1b[1m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

// 创建 readline 接口
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function question(prompt) {
  return new Promise(resolve => {
    rl.question(prompt, resolve);
  });
}

// 项目模板
const templates = {
  'package.json': (projectName, description) => ({
    name: projectName,
    version: '1.0.0',
    description: description || 'A Phaser.js game project',
    main: 'src/main.js',
    scripts: {
      dev: 'vite',
      build: 'vite build',
      preview: 'vite preview',
      lint: 'eslint src --ext .js',
      'lint:fix': 'eslint src --ext .js --fix'
    },
    keywords: ['phaser', 'game', 'javascript', 'html5'],
    author: '',
    license: 'MIT',
    dependencies: {
      phaser: '^3.90.0'
    },
    devDependencies: {
      vite: '^5.0.0',
      eslint: '^8.0.0',
      '@eslint/js': '^9.0.0'
    }
  }),

  'vite.config.js': () => `import { defineConfig } from 'vite';

export default defineConfig({
  server: {
    port: 3000,
    open: true
  },
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    sourcemap: true,
    rollupOptions: {
      output: {
        manualChunks: {
          phaser: ['phaser']
        }
      }
    }
  },
  optimizeDeps: {
    include: ['phaser']
  }
});`,

  'index.html': (projectName) => `<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${projectName}</title>
    <style>
        body {
            margin: 0;
            padding: 0;
            display: flex;
            justify-content: center;
            align-items: center;
            min-height: 100vh;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            font-family: Arial, sans-serif;
        }
        #game-container {
            border-radius: 10px;
            box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
            overflow: hidden;
        }
        #loading {
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            color: white;
            font-size: 18px;
            z-index: 1000;
        }
    </style>
</head>
<body>
    <div id="loading">加载中...</div>
    <div id="game-container"></div>
    <script type="module" src="./src/main.js"></script>
</body>
</html>`,

  'src/main.js': () => `import Phaser from 'phaser';
import GameScene from './scenes/GameScene.js';
import MenuScene from './scenes/MenuScene.js';

// 游戏配置
const config = {
    type: Phaser.AUTO,
    width: 800,
    height: 600,
    parent: 'game-container',
    backgroundColor: '#2c3e50',
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { y: 300 },
            debug: false
        }
    },
    scene: [MenuScene, GameScene]
};

// 隐藏加载提示
document.getElementById('loading').style.display = 'none';

// 创建游戏实例
const game = new Phaser.Game(config);

// 导出游戏实例（用于调试）
window.game = game;`,

  'src/scenes/MenuScene.js': () => `export default class MenuScene extends Phaser.Scene {
    constructor() {
        super({ key: 'MenuScene' });
    }

    preload() {
        // 这里可以加载菜单所需的资源
    }

    create() {
        // 添加标题
        this.add.text(400, 200, '我的 Phaser 游戏', {
            fontSize: '48px',
            fill: '#ffffff',
            fontFamily: 'Arial'
        }).setOrigin(0.5);

        // 添加开始按钮
        const startButton = this.add.text(400, 350, '开始游戏', {
            fontSize: '32px',
            fill: '#00ff00',
            fontFamily: 'Arial'
        }).setOrigin(0.5);

        // 设置按钮交互
        startButton.setInteractive({ useHandCursor: true });
        
        startButton.on('pointerover', () => {
            startButton.setStyle({ fill: '#ffff00' });
        });
        
        startButton.on('pointerout', () => {
            startButton.setStyle({ fill: '#00ff00' });
        });
        
        startButton.on('pointerdown', () => {
            this.scene.start('GameScene');
        });

        // 添加说明文字
        this.add.text(400, 450, '点击开始按钮进入游戏', {
            fontSize: '16px',
            fill: '#cccccc',
            fontFamily: 'Arial'
        }).setOrigin(0.5);
    }
}`,

  'src/scenes/GameScene.js': () => `export default class GameScene extends Phaser.Scene {
    constructor() {
        super({ key: 'GameScene' });
    }

    preload() {
        // 创建简单的彩色方块作为精灵
        this.load.image('player', 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==');
    }

    create() {
        // 添加游戏标题
        this.add.text(400, 50, '游戏场景', {
            fontSize: '32px',
            fill: '#ffffff',
            fontFamily: 'Arial'
        }).setOrigin(0.5);

        // 创建玩家精灵
        this.player = this.physics.add.sprite(400, 300, 'player');
        this.player.setDisplaySize(32, 32);
        this.player.setTint(0x00ff00);
        this.player.setBounce(0.2);
        this.player.setCollideWorldBounds(true);

        // 创建地面
        const ground = this.physics.add.staticGroup();
        for (let i = 0; i < 800; i += 32) {
            const tile = ground.create(i + 16, 580, 'player');
            tile.setDisplaySize(32, 32);
            tile.setTint(0x8B4513);
        }

        // 设置碰撞
        this.physics.add.collider(this.player, ground);

        // 创建键盘控制
        this.cursors = this.input.keyboard.createCursorKeys();

        // 添加返回菜单按钮
        const menuButton = this.add.text(50, 50, '返回菜单', {
            fontSize: '16px',
            fill: '#ffffff',
            backgroundColor: '#000000',
            padding: { x: 10, y: 5 }
        });

        menuButton.setInteractive({ useHandCursor: true });
        menuButton.on('pointerdown', () => {
            this.scene.start('MenuScene');
        });

        // 添加操作说明
        this.add.text(400, 100, '使用方向键移动角色', {
            fontSize: '16px',
            fill: '#cccccc',
            fontFamily: 'Arial'
        }).setOrigin(0.5);
    }

    update() {
        // 玩家移动控制
        if (this.cursors.left.isDown) {
            this.player.setVelocityX(-160);
        } else if (this.cursors.right.isDown) {
            this.player.setVelocityX(160);
        } else {
            this.player.setVelocityX(0);
        }

        // 跳跃控制
        if (this.cursors.up.isDown && this.player.body.touching.down) {
            this.player.setVelocityY(-330);
        }
    }
}`,

  'eslint.config.js': () => `import js from '@eslint/js';

export default [
    js.configs.recommended,
    {
        languageOptions: {
            ecmaVersion: 2022,
            sourceType: 'module',
            globals: {
                window: 'readonly',
                document: 'readonly',
                console: 'readonly',
                Phaser: 'readonly'
            }
        },
        rules: {
            'no-unused-vars': 'warn',
            'no-console': 'off',
            'indent': ['error', 2],
            'quotes': ['error', 'single'],
            'semi': ['error', 'always']
        }
    }
];`,

  '.gitignore': () => `# Dependencies
node_modules/
npm-debug.log*
yarn-debug.log*
yarn-error.log*
pnpm-debug.log*

# Build outputs
dist/
build/
.vite/

# Environment variables
.env
.env.local
.env.development.local
.env.test.local
.env.production.local

# IDE
.vscode/
.idea/
*.swp
*.swo

# OS
.DS_Store
Thumbs.db

# Logs
logs
*.log

# Coverage
coverage/
.nyc_output/

# Temporary files
*.tmp
*.temp`,

  'README.md': (projectName, description) => `# ${projectName}

${description || 'A Phaser.js game project'}

## 项目简介

这是一个使用 Phaser.js 3.90+ 开发的 HTML5 游戏项目。

## 功能特性

- 🎮 基于 Phaser.js 3.90+ 游戏引擎
- ⚡ 使用 Vite 构建工具，开发体验极佳
- 🎯 ES6+ 现代 JavaScript 语法
- 📱 响应式设计，支持多种屏幕尺寸
- 🔧 ESLint 代码检查
- 🚀 一键部署到静态网站托管平台

## 快速开始

### 环境要求

- Node.js 16.0.0 或更高版本
- pnpm（推荐）或 npm

### 安装依赖

\`\`\`bash
pnpm install
\`\`\`

### 开发模式

\`\`\`bash
pnpm dev
\`\`\`

游戏将在 http://localhost:3000 启动

### 构建生产版本

\`\`\`bash
pnpm build
\`\`\`

### 预览生产版本

\`\`\`bash
pnpm preview
\`\`\`

## 项目结构

\`\`\`
${projectName}/
├── public/              # 静态资源
├── src/                 # 源代码
│   ├── scenes/         # 游戏场景
│   │   ├── MenuScene.js    # 菜单场景
│   │   └── GameScene.js    # 游戏场景
│   └── main.js         # 入口文件
├── index.html          # HTML 模板
├── package.json        # 项目配置
├── vite.config.js      # Vite 配置
├── eslint.config.js    # ESLint 配置
└── README.md          # 项目说明
\`\`\`

## 开发指南

### 添加新场景

1. 在 \`src/scenes/\` 目录下创建新的场景文件
2. 继承 \`Phaser.Scene\` 类
3. 在 \`src/main.js\` 中注册场景

### 添加游戏资源

1. 将资源文件放在 \`public/\` 目录下
2. 在场景的 \`preload()\` 方法中加载资源
3. 在 \`create()\` 方法中使用资源

### 代码规范

项目使用 ESLint 进行代码检查，运行以下命令：

\`\`\`bash
# 检查代码
pnpm lint

# 自动修复
pnpm lint:fix
\`\`\`

## 部署

### GitHub Pages

1. 构建项目：\`pnpm build\`
2. 将 \`dist/\` 目录内容推送到 \`gh-pages\` 分支

### Vercel

1. 连接 GitHub 仓库
2. 设置构建命令：\`pnpm build\`
3. 设置输出目录：\`dist\`

### Netlify

1. 拖拽 \`dist/\` 目录到 Netlify
2. 或连接 GitHub 仓库自动部署

## 学习资源

- [Phaser.js 官方文档](https://phaser.io/learn)
- [Phaser.js 示例](https://phaser.io/examples)
- [Vite 文档](https://vitejs.dev/)

## 许可证

MIT License
`
};

async function createProject() {
  try {
    log('🚀 Phaser.js 项目快速搭建工具', 'bold');
    log('');

    // 获取项目信息
    const projectName = await question('请输入项目名称 (默认: my-phaser-game): ') || 'my-phaser-game';
    const description = await question('请输入项目描述 (可选): ');
    const useTypeScript = (await question('是否使用 TypeScript? (y/N): ')).toLowerCase() === 'y';
    
    log('');
    log(`📁 创建项目: ${projectName}`, 'blue');
    
    // 创建项目目录
    if (!fs.existsSync(projectName)) {
      fs.mkdirSync(projectName, { recursive: true });
    }
    
    process.chdir(projectName);
    
    // 创建目录结构
    const dirs = ['src', 'src/scenes', 'public'];
    dirs.forEach(dir => {
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
        log(`✅ 创建目录: ${dir}`, 'green');
      }
    });
    
    // 创建文件
    for (const [filename, template] of Object.entries(templates)) {
      const content = typeof template === 'function' 
        ? (filename === 'package.json' 
          ? JSON.stringify(template(projectName, description), null, 2)
          : template(projectName, description))
        : template;
      
      fs.writeFileSync(filename, content);
      log(`✅ 创建文件: ${filename}`, 'green');
    }
    
    // 创建 VS Code 配置
    if (!fs.existsSync('.vscode')) {
      fs.mkdirSync('.vscode');
    }
    
    // 复制 VS Code 配置文件
    const vscodeSettings = fs.readFileSync(
      path.join(__dirname, '../templates/vscode-settings.json'), 
      'utf8'
    );
    const vscodeExtensions = fs.readFileSync(
      path.join(__dirname, '../templates/vscode-extensions.json'), 
      'utf8'
    );
    
    fs.writeFileSync('.vscode/settings.json', vscodeSettings);
    fs.writeFileSync('.vscode/extensions.json', vscodeExtensions);
    log('✅ 创建 VS Code 配置', 'green');
    
    log('');
    log('📦 安装依赖...', 'blue');
    
    // 安装依赖
    try {
      execSync('pnpm install', { stdio: 'inherit' });
      log('✅ 依赖安装完成', 'green');
    } catch (error) {
      log('⚠️  pnpm 安装失败，尝试使用 npm...', 'yellow');
      try {
        execSync('npm install', { stdio: 'inherit' });
        log('✅ 依赖安装完成', 'green');
      } catch (npmError) {
        log('❌ 依赖安装失败，请手动运行 pnpm install 或 npm install', 'red');
      }
    }
    
    log('');
    log('🎉 项目创建成功！', 'green');
    log('');
    log('下一步操作:', 'bold');
    log(`  cd ${projectName}`, 'blue');
    log('  pnpm dev', 'blue');
    log('');
    log('或者在 VS Code 中打开项目:', 'bold');
    log(`  code ${projectName}`, 'blue');
    
  } catch (error) {
    log(`❌ 创建项目失败: ${error.message}`, 'red');
  } finally {
    rl.close();
  }
}

if (require.main === module) {
  createProject();
}

module.exports = { createProject };
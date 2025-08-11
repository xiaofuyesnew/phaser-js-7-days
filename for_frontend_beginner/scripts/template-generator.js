#!/usr/bin/env node

/**
 * 项目模板生成器
 * 根据模板配置生成不同类型的 Phaser.js 项目
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

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function question(prompt) {
  return new Promise(resolve => {
    rl.question(prompt, resolve);
  });
}

// 加载模板配置
function loadTemplateConfig() {
  const configPath = path.join(__dirname, '../templates/project-template.json');
  try {
    const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
    return config;
  } catch (error) {
    log(`❌ 无法加载模板配置: ${error.message}`, 'red');
    return null;
  }
}

// 显示可用模板
function displayTemplates(templates) {
  log('📋 可用的项目模板:', 'bold');
  log('');
  
  Object.entries(templates).forEach(([key, template], index) => {
    log(`${index + 1}. ${template.name}`, 'blue');
    log(`   ${template.description}`, 'reset');
    log(`   特性: ${template.features.join(', ')}`, 'yellow');
    log('');
  });
}

// 创建基础项目结构
function createProjectStructure(projectName, templateKey, config) {
  const template = config.templates[templateKey];
  
  // 创建项目目录
  if (!fs.existsSync(projectName)) {
    fs.mkdirSync(projectName, { recursive: true });
  }
  
  process.chdir(projectName);
  
  // 创建目录结构
  const dirs = [
    'src',
    'src/scenes',
    'src/sprites',
    'src/utils',
    'public',
    'public/assets',
    'public/assets/sprites',
    'public/assets/audio',
    'public/assets/maps'
  ];
  
  dirs.forEach(dir => {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
      log(`✅ 创建目录: ${dir}`, 'green');
    }
  });
  
  return template;
}

// 生成 package.json
function generatePackageJson(projectName, template, config) {
  const packageJson = {
    name: projectName,
    version: '1.0.0',
    description: template.description,
    main: 'src/main.js',
    scripts: {
      ...config.scripts.common,
      ...config.scripts.development
    },
    keywords: ['phaser', 'game', 'javascript', 'html5'],
    author: '',
    license: 'MIT',
    dependencies: template.files['package.json'].dependencies,
    devDependencies: template.files['package.json'].devDependencies
  };
  
  fs.writeFileSync('package.json', JSON.stringify(packageJson, null, 2));
  log('✅ 创建 package.json', 'green');
}

// 生成 Vite 配置
function generateViteConfig(config) {
  const viteConfig = `import { defineConfig } from 'vite';

export default defineConfig({
  server: {
    port: ${config.configurations.development.vite.server.port},
    open: ${config.configurations.development.vite.server.open},
    host: ${config.configurations.development.vite.server.host}
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
});`;

  fs.writeFileSync('vite.config.js', viteConfig);
  log('✅ 创建 vite.config.js', 'green');
}

// 生成基础游戏文件
function generateGameFiles(templateKey, config) {
  const gameConfig = `import Phaser from 'phaser';
import MenuScene from './scenes/MenuScene.js';
import GameScene from './scenes/GameScene.js';

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
            debug: ${config.configurations.development.phaser.physics.arcade.debug}
        }
    },
    scene: [MenuScene, GameScene]
};

// 隐藏加载提示
const loadingElement = document.getElementById('loading');
if (loadingElement) {
    loadingElement.style.display = 'none';
}

// 创建游戏实例
const game = new Phaser.Game(config);

// 导出游戏实例（用于调试）
window.game = game;`;

  fs.writeFileSync('src/main.js', gameConfig);
  log('✅ 创建 src/main.js', 'green');
  
  // 根据模板类型生成不同的场景文件
  generateSceneFiles(templateKey);
}

// 生成场景文件
function generateSceneFiles(templateKey) {
  const menuScene = `export default class MenuScene extends Phaser.Scene {
    constructor() {
        super({ key: 'MenuScene' });
    }

    preload() {
        // 加载菜单资源
    }

    create() {
        // 添加标题
        this.add.text(400, 200, '${getGameTitle(templateKey)}', {
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
}`;

  fs.writeFileSync('src/scenes/MenuScene.js', menuScene);
  log('✅ 创建 src/scenes/MenuScene.js', 'green');
  
  // 根据模板类型生成不同的游戏场景
  const gameScene = generateGameScene(templateKey);
  fs.writeFileSync('src/scenes/GameScene.js', gameScene);
  log('✅ 创建 src/scenes/GameScene.js', 'green');
}

// 根据模板类型获取游戏标题
function getGameTitle(templateKey) {
  const titles = {
    basic: '我的 Phaser 游戏',
    platformer: '平台跳跃游戏',
    shooter: '射击游戏',
    puzzle: '益智游戏'
  };
  return titles[templateKey] || '我的 Phaser 游戏';
}

// 生成游戏场景
function generateGameScene(templateKey) {
  const baseScene = `export default class GameScene extends Phaser.Scene {
    constructor() {
        super({ key: 'GameScene' });
    }

    preload() {
        // 创建简单的彩色方块作为精灵
        this.load.image('player', 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==');
        ${getPreloadContent(templateKey)}
    }

    create() {
        // 添加游戏标题
        this.add.text(400, 50, '${getGameTitle(templateKey)}', {
            fontSize: '32px',
            fill: '#ffffff',
            fontFamily: 'Arial'
        }).setOrigin(0.5);

        ${getCreateContent(templateKey)}

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

        ${getControlsSetup(templateKey)}
    }

    update() {
        ${getUpdateContent(templateKey)}
    }
}`;

  return baseScene;
}

// 获取预加载内容
function getPreloadContent(templateKey) {
  const content = {
    basic: '// 基础游戏资源',
    platformer: `// 平台游戏资源
        // this.load.image('tiles', 'assets/sprites/tiles.png');
        // this.load.spritesheet('player', 'assets/sprites/player.png', { frameWidth: 32, frameHeight: 32 });`,
    shooter: `// 射击游戏资源
        // this.load.image('bullet', 'assets/sprites/bullet.png');
        // this.load.image('enemy', 'assets/sprites/enemy.png');`,
    puzzle: `// 益智游戏资源
        // this.load.image('gem', 'assets/sprites/gem.png');
        // this.load.image('board', 'assets/sprites/board.png');`
  };
  return content[templateKey] || content.basic;
}

// 获取创建内容
function getCreateContent(templateKey) {
  const content = {
    basic: `// 创建玩家精灵
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
        this.physics.add.collider(this.player, ground);`,
    
    platformer: `// 创建玩家
        this.player = this.physics.add.sprite(100, 450, 'player');
        this.player.setDisplaySize(32, 32);
        this.player.setTint(0x00ff00);
        this.player.setBounce(0.2);
        this.player.setCollideWorldBounds(true);

        // 创建平台
        this.platforms = this.physics.add.staticGroup();
        
        // 地面
        for (let i = 0; i < 800; i += 32) {
            const tile = this.platforms.create(i + 16, 580, 'player');
            tile.setDisplaySize(32, 32);
            tile.setTint(0x8B4513);
        }
        
        // 平台
        this.platforms.create(400, 400, 'player').setDisplaySize(200, 32).setTint(0x8B4513);
        this.platforms.create(50, 250, 'player').setDisplaySize(200, 32).setTint(0x8B4513);
        this.platforms.create(750, 220, 'player').setDisplaySize(200, 32).setTint(0x8B4513);

        // 设置碰撞
        this.physics.add.collider(this.player, this.platforms);`,
    
    shooter: `// 创建玩家飞船
        this.player = this.physics.add.sprite(400, 500, 'player');
        this.player.setDisplaySize(32, 32);
        this.player.setTint(0x00ff00);
        this.player.setCollideWorldBounds(true);

        // 创建子弹组
        this.bullets = this.physics.add.group();
        
        // 创建敌人组
        this.enemies = this.physics.add.group();
        
        // 分数
        this.score = 0;
        this.scoreText = this.add.text(16, 16, 'Score: 0', {
            fontSize: '32px',
            fill: '#000'
        });`,
    
    puzzle: `// 创建游戏网格
        this.gridSize = 8;
        this.tileSize = 64;
        this.grid = [];
        
        // 初始化网格
        for (let row = 0; row < this.gridSize; row++) {
            this.grid[row] = [];
            for (let col = 0; col < this.gridSize; col++) {
                const x = 100 + col * this.tileSize;
                const y = 100 + row * this.tileSize;
                const tile = this.add.rectangle(x, y, this.tileSize - 2, this.tileSize - 2, 0x666666);
                tile.setInteractive();
                this.grid[row][col] = tile;
            }
        }`
  };
  return content[templateKey] || content.basic;
}

// 获取控制设置
function getControlsSetup(templateKey) {
  const content = {
    basic: `// 创建键盘控制
        this.cursors = this.input.keyboard.createCursorKeys();

        // 添加操作说明
        this.add.text(400, 100, '使用方向键移动角色', {
            fontSize: '16px',
            fill: '#cccccc',
            fontFamily: 'Arial'
        }).setOrigin(0.5);`,
    
    platformer: `// 创建键盘控制
        this.cursors = this.input.keyboard.createCursorKeys();
        this.wasd = this.input.keyboard.addKeys('W,S,A,D');

        // 添加操作说明
        this.add.text(400, 100, '使用方向键或WASD移动，空格跳跃', {
            fontSize: '16px',
            fill: '#cccccc',
            fontFamily: 'Arial'
        }).setOrigin(0.5);`,
    
    shooter: `// 创建键盘控制
        this.cursors = this.input.keyboard.createCursorKeys();
        this.spaceKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);

        // 添加操作说明
        this.add.text(400, 100, '方向键移动，空格射击', {
            fontSize: '16px',
            fill: '#cccccc',
            fontFamily: 'Arial'
        }).setOrigin(0.5);`,
    
    puzzle: `// 添加操作说明
        this.add.text(400, 50, '点击方块进行游戏', {
            fontSize: '16px',
            fill: '#cccccc',
            fontFamily: 'Arial'
        }).setOrigin(0.5);`
  };
  return content[templateKey] || content.basic;
}

// 获取更新内容
function getUpdateContent(templateKey) {
  const content = {
    basic: `// 玩家移动控制
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
        }`,
    
    platformer: `// 玩家移动控制
        if (this.cursors.left.isDown || this.wasd.A.isDown) {
            this.player.setVelocityX(-160);
        } else if (this.cursors.right.isDown || this.wasd.D.isDown) {
            this.player.setVelocityX(160);
        } else {
            this.player.setVelocityX(0);
        }

        // 跳跃控制
        if ((this.cursors.up.isDown || this.wasd.W.isDown) && this.player.body.touching.down) {
            this.player.setVelocityY(-330);
        }`,
    
    shooter: `// 玩家移动控制
        if (this.cursors.left.isDown) {
            this.player.setVelocityX(-200);
        } else if (this.cursors.right.isDown) {
            this.player.setVelocityX(200);
        } else {
            this.player.setVelocityX(0);
        }

        if (this.cursors.up.isDown) {
            this.player.setVelocityY(-200);
        } else if (this.cursors.down.isDown) {
            this.player.setVelocityY(200);
        } else {
            this.player.setVelocityY(0);
        }

        // 射击控制
        if (Phaser.Input.Keyboard.JustDown(this.spaceKey)) {
            this.fireBullet();
        }`,
    
    puzzle: `// 益智游戏逻辑更新
        // 这里可以添加游戏逻辑更新代码`
  };
  return content[templateKey] || content.basic;
}

// 生成 HTML 文件
function generateHTML(projectName) {
  const html = `<!DOCTYPE html>
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
</html>`;

  fs.writeFileSync('index.html', html);
  log('✅ 创建 index.html', 'green');
}

// 生成其他配置文件
function generateConfigFiles() {
  // .gitignore
  const gitignore = `# Dependencies
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
*.temp`;

  fs.writeFileSync('.gitignore', gitignore);
  log('✅ 创建 .gitignore', 'green');

  // ESLint 配置
  const eslintConfig = `import js from '@eslint/js';

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
];`;

  fs.writeFileSync('eslint.config.js', eslintConfig);
  log('✅ 创建 eslint.config.js', 'green');
}

// 生成 README
function generateReadme(projectName, template) {
  const readme = `# ${projectName}

${template.description}

## 功能特性

${template.features.map(feature => `- 🎮 ${feature}`).join('\n')}

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
│   └── assets/         # 游戏资源
├── src/                 # 源代码
│   ├── scenes/         # 游戏场景
│   ├── sprites/        # 精灵类
│   ├── utils/          # 工具函数
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

1. 将资源文件放在 \`public/assets/\` 目录下
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

## 学习资源

- [Phaser.js 官方文档](https://phaser.io/learn)
- [Phaser.js 示例](https://phaser.io/examples)
- [Vite 文档](https://vitejs.dev/)

## 许可证

MIT License
`;

  fs.writeFileSync('README.md', readme);
  log('✅ 创建 README.md', 'green');
}

// 主函数
async function main() {
  try {
    log('🎮 Phaser.js 项目模板生成器', 'bold');
    log('');

    // 加载模板配置
    const config = loadTemplateConfig();
    if (!config) {
      return;
    }

    // 显示可用模板
    displayTemplates(config.templates);

    // 获取用户选择
    const templateChoice = await question('请选择模板类型 (1-4): ');
    const templateKeys = Object.keys(config.templates);
    const templateIndex = parseInt(templateChoice) - 1;

    if (templateIndex < 0 || templateIndex >= templateKeys.length) {
      log('❌ 无效的模板选择', 'red');
      return;
    }

    const templateKey = templateKeys[templateIndex];
    const template = config.templates[templateKey];

    log(`✅ 选择模板: ${template.name}`, 'green');
    log('');

    // 获取项目信息
    const projectName = await question('请输入项目名称: ');
    if (!projectName) {
      log('❌ 项目名称不能为空', 'red');
      return;
    }

    log('');
    log(`📁 创建项目: ${projectName}`, 'blue');

    // 创建项目结构
    createProjectStructure(projectName, templateKey, config);

    // 生成项目文件
    generatePackageJson(projectName, template, config);
    generateViteConfig(config);
    generateGameFiles(templateKey, config);
    generateHTML(projectName);
    generateConfigFiles();
    generateReadme(projectName, template);

    // 复制 VS Code 配置
    const vscodeDir = '.vscode';
    if (!fs.existsSync(vscodeDir)) {
      fs.mkdirSync(vscodeDir);
    }

    try {
      const templatesDir = path.join(__dirname, '../templates');
      const settingsPath = path.join(templatesDir, 'vscode-settings.json');
      const extensionsPath = path.join(templatesDir, 'vscode-extensions.json');

      if (fs.existsSync(settingsPath)) {
        fs.copyFileSync(settingsPath, path.join(vscodeDir, 'settings.json'));
        log('✅ 创建 VS Code 设置', 'green');
      }

      if (fs.existsSync(extensionsPath)) {
        fs.copyFileSync(extensionsPath, path.join(vscodeDir, 'extensions.json'));
        log('✅ 创建 VS Code 扩展推荐', 'green');
      }
    } catch (error) {
      log('⚠️  VS Code 配置创建失败', 'yellow');
    }

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
  main();
}

module.exports = { main };
# 代码规范和项目结构标准

## 📁 项目结构

```
project/
├── public/                 # 静态资源目录
│   ├── assets/            # 游戏资源
│   │   ├── images/        # 图片资源
│   │   ├── audio/         # 音频资源
│   │   └── data/          # 数据文件 (JSON, XML等)
│   ├── favicon.ico        # 网站图标
│   └── favicon.svg        # SVG图标
├── src/                   # 源代码目录
│   ├── scenes/            # 游戏场景
│   │   ├── GameScene.js   # 主游戏场景
│   │   ├── MenuScene.js   # 菜单场景
│   │   └── LoadScene.js   # 加载场景
│   ├── sprites/           # 游戏精灵类
│   │   ├── Player.js      # 玩家角色
│   │   ├── Enemy.js       # 敌人类
│   │   └── Collectible.js # 收集品类
│   ├── utils/             # 工具函数
│   │   ├── constants.js   # 常量定义
│   │   ├── helpers.js     # 辅助函数
│   │   └── config.js      # 配置文件
│   ├── styles/            # 样式文件
│   │   └── main.css       # 主样式
│   └── main.js            # 入口文件
├── package.json           # 项目配置
├── vite.config.js         # Vite配置
├── .gitignore            # Git忽略文件
├── index.html            # HTML模板
└── README.md             # 项目说明
```

## 🎯 命名规范

### 文件命名
- **场景文件**: PascalCase，如 `GameScene.js`, `MenuScene.js`
- **精灵类文件**: PascalCase，如 `Player.js`, `Enemy.js`
- **工具文件**: camelCase，如 `helpers.js`, `constants.js`
- **资源文件**: kebab-case，如 `player-sprite.png`, `background-music.mp3`

### 变量命名
- **常量**: UPPER_SNAKE_CASE，如 `GAME_WIDTH`, `PLAYER_SPEED`
- **变量和函数**: camelCase，如 `playerSpeed`, `updatePosition()`
- **类名**: PascalCase，如 `Player`, `GameScene`
- **私有属性**: 下划线前缀，如 `_velocity`, `_isJumping`

### 场景和精灵键名
- **场景键**: kebab-case，如 `'game-scene'`, `'menu-scene'`
- **资源键**: kebab-case，如 `'player-sprite'`, `'enemy-walk'`

## 💻 代码风格

### JavaScript 代码规范

```javascript
// ✅ 推荐的类定义方式
class Player extends Phaser.Physics.Arcade.Sprite {
    constructor(scene, x, y) {
        super(scene, x, y, 'player-sprite');
        
        // 初始化属性
        this.scene = scene;
        this.speed = 200;
        this._health = 100;
        
        // 添加到场景
        scene.add.existing(this);
        scene.physics.add.existing(this);
        
        // 设置物理属性
        this.setCollideWorldBounds(true);
        this.setBounce(0.2);
    }
    
    /**
     * 更新玩家状态
     * @param {Object} cursors - 键盘输入对象
     */
    update(cursors) {
        // 处理移动
        if (cursors.left.isDown) {
            this.setVelocityX(-this.speed);
            this.setFlipX(true);
        } else if (cursors.right.isDown) {
            this.setVelocityX(this.speed);
            this.setFlipX(false);
        } else {
            this.setVelocityX(0);
        }
        
        // 处理跳跃
        if (cursors.up.isDown && this.body.touching.down) {
            this.setVelocityY(-500);
        }
    }
    
    /**
     * 受到伤害
     * @param {number} damage - 伤害值
     */
    takeDamage(damage) {
        this._health -= damage;
        if (this._health <= 0) {
            this.destroy();
        }
    }
}
```

### 场景结构规范

```javascript
class GameScene extends Phaser.Scene {
    constructor() {
        super({ key: 'game-scene' });
    }
    
    preload() {
        // 资源加载
        this.load.image('player-sprite', 'assets/images/player.png');
        this.load.audio('jump-sound', 'assets/audio/jump.mp3');
    }
    
    create() {
        // 创建游戏对象
        this.createPlayer();
        this.createEnemies();
        this.createUI();
        
        // 设置输入
        this.cursors = this.input.keyboard.createCursorKeys();
        
        // 设置碰撞
        this.setupCollisions();
    }
    
    update() {
        // 更新游戏逻辑
        if (this.player) {
            this.player.update(this.cursors);
        }
    }
    
    createPlayer() {
        this.player = new Player(this, 100, 300);
    }
    
    createEnemies() {
        this.enemies = this.physics.add.group();
        // 创建敌人逻辑
    }
    
    createUI() {
        // 创建UI元素
        this.scoreText = this.add.text(16, 16, 'Score: 0', {
            fontSize: '32px',
            fill: '#000'
        });
    }
    
    setupCollisions() {
        // 设置碰撞检测
        this.physics.add.collider(this.player, this.enemies, this.handlePlayerEnemyCollision, null, this);
    }
    
    handlePlayerEnemyCollision(player, enemy) {
        // 处理碰撞逻辑
        player.takeDamage(10);
    }
}
```

## 📝 注释规范

### JSDoc 注释
```javascript
/**
 * 创建新的敌人
 * @param {number} x - X坐标
 * @param {number} y - Y坐标
 * @param {string} type - 敌人类型
 * @returns {Enemy} 创建的敌人实例
 */
createEnemy(x, y, type) {
    return new Enemy(this, x, y, type);
}
```

### 行内注释
```javascript
// 设置玩家初始位置
this.player.setPosition(100, 300);

// TODO: 添加敌人AI逻辑
// FIXME: 修复跳跃动画问题
// NOTE: 这里使用了临时解决方案
```

## 🎮 游戏开发最佳实践

### 资源管理
- 使用统一的资源键名管理
- 图片资源优化（压缩、格式选择）
- 音频资源预加载和格式兼容性

### 性能优化
- 对象池管理（敌人、子弹等）
- 及时销毁不需要的对象
- 合理使用物理引擎的碰撞检测

### 代码组织
- 单一职责原则：每个类只负责一个功能
- 依赖注入：通过构造函数传递依赖
- 事件驱动：使用事件系统解耦代码

### 调试和测试
- 使用浏览器开发者工具
- 添加调试信息显示
- 分步测试功能模块

## 🔧 开发工具配置

### VS Code 推荐扩展
- ES6 String HTML
- JavaScript (ES6) code snippets
- Prettier - Code formatter
- ESLint
- Live Server

### 推荐的 VS Code 设置
```json
{
    "editor.formatOnSave": true,
    "editor.codeActionsOnSave": {
        "source.fixAll.eslint": true
    },
    "emmet.includeLanguages": {
        "javascript": "javascriptreact"
    }
}
```

## 📋 代码检查清单

在提交代码前，请确保：

- [ ] 代码遵循命名规范
- [ ] 添加了必要的注释
- [ ] 没有console.log等调试代码
- [ ] 资源文件路径正确
- [ ] 代码格式化完成
- [ ] 功能测试通过
- [ ] 没有明显的性能问题
- [ ] 错误处理完善
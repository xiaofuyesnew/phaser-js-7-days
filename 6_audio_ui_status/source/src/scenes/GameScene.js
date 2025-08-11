import { AudioManager } from '../managers/AudioManager.js';
import { GameStateManager } from '../managers/GameStateManager.js';
import { GameHUD } from '../ui/GameHUD.js';
import { Player } from '../sprites/Player.js';

/**
 * 主游戏场景
 */
export class GameScene extends Phaser.Scene {
    constructor() {
        super({ key: 'GameScene' });
    }
    
    init(data) {
        // 初始化游戏状态
        this.gameState = new GameStateManager();
        this.gameState.setState('playing');
        
        // 游戏对象
        this.player = null;
        this.enemies = null;
        this.collectibles = null;
        
        // 输入控制
        this.cursors = null;
        this.wasd = null;
        
        // 游戏计时器
        this.gameTimer = 0;
        this.spawnTimer = 0;
    }
    
    preload() {
        // 加载游戏资源
        this.loadGameAssets();
    }
    
    create() {
        // 初始化管理器
        this.audioManager = new AudioManager(this);
        this.setupAudio();
        
        // 创建游戏世界
        this.createWorld();
        
        // 创建玩家
        this.createPlayer();
        
        // 创建敌人和收集品
        this.createGameObjects();
        
        // 创建HUD界面
        this.hud = new GameHUD(this, this.gameState);
        
        // 设置物理碰撞
        this.setupPhysics();
        
        // 设置输入控制
        this.setupInput();
        
        // 设置事件监听
        this.setupEventListeners();
        
        // 开始背景音乐
        this.audioManager.playMusic('gameMusic');
        
        // 场景淡入效果
        this.cameras.main.fadeIn(500, 0, 0, 0);
    }
    
    /**
     * 加载游戏资源
     */
    loadGameAssets() {
        // 创建简单的几何图形作为游戏对象
        this.load.image('player', 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==');
        this.load.image('enemy', 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==');
        this.load.image('collectible', 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==');
        
        // 加载音频资源（示例）
        // this.load.audio('gameMusic', ['assets/audio/game-music.mp3']);
        // this.load.audio('jump', ['assets/audio/jump.wav']);
        // this.load.audio('collect', ['assets/audio/collect.wav']);
        // this.load.audio('hurt', ['assets/audio/hurt.wav']);
        // this.load.audio('enemyHit', ['assets/audio/enemy-hit.wav']);
    }
    
    /**
     * 设置音频
     */
    setupAudio() {
        // 添加音效到管理器
        // this.audioManager.addSound('gameMusic', { loop: true, volume: 0.4 });
        // this.audioManager.addSound('jump', { volume: 0.6 });
        // this.audioManager.addSound('collect', { volume: 0.7 });
        // this.audioManager.addSound('hurt', { volume: 0.8 });
        // this.audioManager.addSound('enemyHit', { volume: 0.5 });
        
        console.log('Audio setup complete');
    }
    
    /**
     * 创建游戏世界
     */
    createWorld() {
        const { width, height } = this.cameras.main;
        
        // 创建背景
        const graphics = this.add.graphics();
        graphics.fillGradientStyle(0x87CEEB, 0x87CEEB, 0x98FB98, 0x98FB98, 1);
        graphics.fillRect(0, 0, width, height);
        
        // 创建地面
        this.ground = this.add.rectangle(width/2, height - 50, width, 100, 0x8B4513);
        this.physics.add.existing(this.ground, true); // 静态物体
        
        // 创建平台
        this.platforms = this.physics.add.staticGroup();
        
        // 添加几个平台
        const platform1 = this.add.rectangle(200, height - 200, 150, 20, 0x654321);
        const platform2 = this.add.rectangle(500, height - 300, 150, 20, 0x654321);
        const platform3 = this.add.rectangle(300, height - 400, 150, 20, 0x654321);
        
        this.platforms.add([platform1, platform2, platform3]);
        
        // 设置世界边界
        this.physics.world.setBounds(0, 0, width, height);
    }
    
    /**
     * 创建玩家
     */
    createPlayer() {
        const { width, height } = this.cameras.main;
        
        // 创建玩家精灵
        this.player = new Player(this, 100, height - 150);
        
        // 设置玩家物理属性
        this.player.setBounce(0.2);
        this.player.setCollideWorldBounds(true);
        
        // 玩家与地面和平台的碰撞
        this.physics.add.collider(this.player, this.ground);
        this.physics.add.collider(this.player, this.platforms);
    }
    
    /**
     * 创建游戏对象
     */
    createGameObjects() {
        // 创建敌人组
        this.enemies = this.physics.add.group();
        
        // 创建收集品组
        this.collectibles = this.physics.add.group();
        
        // 初始生成一些对象
        this.spawnEnemies();
        this.spawnCollectibles();
    }
    
    /**
     * 生成敌人
     */
    spawnEnemies() {
        const { width, height } = this.cameras.main;
        
        for (let i = 0; i < 3; i++) {
            const x = Phaser.Math.Between(200, width - 100);
            const y = height - 200;
            
            const enemy = this.physics.add.sprite(x, y, 'enemy');
            enemy.setTint(0xff0000);
            enemy.setScale(20, 20);
            enemy.setBounce(0.5);
            enemy.setCollideWorldBounds(true);
            enemy.setVelocityX(Phaser.Math.Between(-100, 100));
            
            this.enemies.add(enemy);
            
            // 敌人与地面和平台的碰撞
            this.physics.add.collider(enemy, this.ground);
            this.physics.add.collider(enemy, this.platforms);
        }
    }
    
    /**
     * 生成收集品
     */
    spawnCollectibles() {
        const { width, height } = this.cameras.main;
        
        for (let i = 0; i < 5; i++) {
            const x = Phaser.Math.Between(50, width - 50);
            const y = Phaser.Math.Between(100, height - 200);
            
            const collectible = this.physics.add.sprite(x, y, 'collectible');
            collectible.setTint(0xffd700);
            collectible.setScale(15, 15);
            collectible.setBounce(0.3);
            collectible.setCollideWorldBounds(true);
            
            // 添加旋转动画
            this.tweens.add({
                targets: collectible,
                rotation: Math.PI * 2,
                duration: 2000,
                repeat: -1,
                ease: 'Linear'
            });
            
            // 添加上下浮动动画
            this.tweens.add({
                targets: collectible,
                y: collectible.y - 20,
                duration: 1000,
                yoyo: true,
                repeat: -1,
                ease: 'Sine.easeInOut'
            });
            
            this.collectibles.add(collectible);
            
            // 收集品与地面和平台的碰撞
            this.physics.add.collider(collectible, this.ground);
            this.physics.add.collider(collectible, this.platforms);
        }
    }
    
    /**
     * 设置物理碰撞
     */
    setupPhysics() {
        // 玩家与敌人的碰撞
        this.physics.add.overlap(this.player, this.enemies, this.playerHitEnemy, null, this);
        
        // 玩家与收集品的碰撞
        this.physics.add.overlap(this.player, this.collectibles, this.collectItem, null, this);
    }
    
    /**
     * 设置输入控制
     */
    setupInput() {
        // 方向键
        this.cursors = this.input.keyboard.createCursorKeys();
        
        // WASD键
        this.wasd = this.input.keyboard.addKeys('W,S,A,D');
        
        // 其他按键
        this.spaceKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
        this.escKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ESC);
        
        // 按键事件
        this.escKey.on('down', () => {
            this.pauseGame();
        });
    }
    
    /**
     * 设置事件监听
     */
    setupEventListeners() {
        // 监听游戏状态变化
        this.gameState.on('stateChange', (data) => {
            console.log('Game state changed:', data);
        });
        
        // 监听玩家事件
        this.events.on('playerJump', () => {
            this.audioManager.playSound('jump');
        });
        
        this.events.on('playerHurt', (damage) => {
            this.gameState.takeDamage(damage);
            this.audioManager.playSound('hurt');
            this.cameras.main.shake(200, 0.02);
        });
        
        this.events.on('itemCollected', (points) => {
            this.gameState.addScore(points);
            this.gameState.gameData.coins += 1;
            this.audioManager.playSound('collect');
        });
        
        this.events.on('enemyDefeated', (points) => {
            this.gameState.addScore(points);
            this.audioManager.playSound('enemyHit');
        });
    }
    
    update(time, delta) {
        if (this.gameState.currentState !== 'playing') {
            return;
        }
        
        // 更新游戏计时器
        this.gameTimer += delta;
        this.spawnTimer += delta;
        
        // 更新玩家
        if (this.player) {
            this.updatePlayer();
        }
        
        // 更新敌人
        this.updateEnemies();
        
        // 定期生成新的游戏对象
        if (this.spawnTimer > 10000) { // 每10秒
            this.spawnCollectibles();
            this.spawnTimer = 0;
        }
        
        // 更新HUD
        if (this.hud) {
            this.hud.updateCoins(this.gameState.gameData.coins);
        }
    }
    
    /**
     * 更新玩家
     */
    updatePlayer() {
        // 左右移动
        if (this.cursors.left.isDown || this.wasd.A.isDown) {
            this.player.setVelocityX(-200);
        } else if (this.cursors.right.isDown || this.wasd.D.isDown) {
            this.player.setVelocityX(200);
        } else {
            this.player.setVelocityX(0);
        }
        
        // 跳跃
        if ((this.cursors.up.isDown || this.wasd.W.isDown || this.spaceKey.isDown) && this.player.body.touching.down) {
            this.player.setVelocityY(-400);
            this.events.emit('playerJump');
        }
    }
    
    /**
     * 更新敌人
     */
    updateEnemies() {
        this.enemies.children.entries.forEach(enemy => {
            // 简单的AI：碰到边界就转向
            if (enemy.body.touching.left || enemy.body.touching.right) {
                enemy.setVelocityX(-enemy.body.velocity.x);
            }
            
            // 随机改变方向
            if (Math.random() < 0.001) {
                enemy.setVelocityX(Phaser.Math.Between(-100, 100));
            }
        });
    }
    
    /**
     * 玩家与敌人碰撞
     */
    playerHitEnemy(player, enemy) {
        // 检查玩家是否从上方踩到敌人
        if (player.body.touching.down && enemy.body.touching.up) {
            // 踩死敌人
            enemy.destroy();
            player.setVelocityY(-200); // 弹跳效果
            this.events.emit('enemyDefeated', 100);
        } else {
            // 玩家受伤
            this.events.emit('playerHurt', 20);
            
            // 击退效果
            const knockback = player.x < enemy.x ? -200 : 200;
            player.setVelocityX(knockback);
        }
    }
    
    /**
     * 收集物品
     */
    collectItem(player, collectible) {
        collectible.destroy();
        this.events.emit('itemCollected', 50);
        
        // 收集特效
        this.createCollectEffect(collectible.x, collectible.y);
    }
    
    /**
     * 创建收集特效
     */
    createCollectEffect(x, y) {
        const particles = [];
        
        for (let i = 0; i < 8; i++) {
            const particle = this.add.circle(x, y, 3, 0xffd700);
            particles.push(particle);
            
            const angle = (i / 8) * Math.PI * 2;
            const speed = 100;
            
            this.tweens.add({
                targets: particle,
                x: x + Math.cos(angle) * 50,
                y: y + Math.sin(angle) * 50,
                alpha: 0,
                duration: 500,
                ease: 'Power2',
                onComplete: () => {
                    particle.destroy();
                }
            });
        }
    }
    
    /**
     * 暂停游戏
     */
    pauseGame() {
        this.gameState.setState('paused');
        this.scene.pause();
        this.scene.launch('PauseScene');
    }
    
    /**
     * 游戏结束
     */
    gameOver() {
        this.gameState.setState('gameOver');
        
        // 停止音乐
        this.audioManager.stopMusic();
        
        // 切换到游戏结束场景
        this.scene.start('GameOverScene', {
            score: this.gameState.gameData.score,
            level: this.gameState.gameData.level,
            coins: this.gameState.gameData.coins
        });
    }
    
    /**
     * 场景恢复
     */
    resume() {
        this.gameState.setState('playing');
    }
    
    /**
     * 销毁场景
     */
    destroy() {
        if (this.audioManager) {
            this.audioManager.destroy();
        }
        
        if (this.gameState) {
            this.gameState.destroy();
        }
        
        if (this.hud) {
            this.hud.destroy();
        }
    }
}
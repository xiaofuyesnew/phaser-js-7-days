import { AudioManager } from '../managers/AudioManager.js';
import { GameStateManager } from '../managers/GameStateManager.js';
import { GameHUD } from '../ui/GameHUD.js';
import { Player } from '../sprites/Player.js';
import { UIManager } from '../managers/UIManager.js';

/**
 * 完整游戏体验演示
 * 
 * 这是一个完整的游戏演示，整合了：
 * - 音频系统
 * - UI界面
 * - 状态管理
 * - 玩家控制
 * - 游戏逻辑
 * - 数据持久化
 */
export class CompleteGameDemo extends Phaser.Scene {
    constructor() {
        super({ key: 'CompleteGameDemo' });
    }
    
    init() {
        // 初始化游戏状态
        this.gameState = new GameStateManager();
        this.gameState.setState('playing');
        
        // 游戏对象
        this.player = null;
        this.enemies = null;
        this.collectibles = null;
        this.platforms = null;
        
        // 输入控制
        this.cursors = null;
        this.wasd = null;
        
        // 游戏计时器
        this.gameTimer = 0;
        this.spawnTimer = 0;
        this.difficultyTimer = 0;
        
        // 游戏设置
        this.difficulty = 1;
        this.enemySpawnRate = 5000; // 5秒
        this.collectibleSpawnRate = 3000; // 3秒
        
        // 特效
        this.backgroundParticles = null;
    }
    
    preload() {
        // 加载游戏资源
        this.loadGameAssets();
    }
    
    create() {
        // 初始化管理器
        this.audioManager = new AudioManager(this);
        this.ui = new UIManager(this);
        this.setupAudio();
        
        // 创建游戏世界
        this.createWorld();
        this.createBackgroundEffects();
        
        // 创建游戏对象
        this.createPlayer();
        this.createGameObjects();
        
        // 创建HUD界面
        this.hud = new GameHUD(this, this.gameState);
        
        // 设置物理系统
        this.setupPhysics();
        
        // 设置输入控制
        this.setupInput();
        
        // 设置事件监听
        this.setupEventListeners();
        
        // 创建游戏介绍
        this.createGameIntro();
        
        // 开始背景音乐
        this.playBackgroundMusic();
        
        // 场景淡入
        this.cameras.main.fadeIn(1000, 0, 0, 0);
        
        console.log('🎮 Complete Game Demo Started!');
    }
    
    /**
     * 加载游戏资源
     */
    loadGameAssets() {
        // 在实际项目中，这里会加载真实的资源文件
        console.log('Loading game assets...');
        
        // 创建简单的纹理用于演示
        this.load.image('pixel', 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==');
    }
    
    /**
     * 设置音频
     */
    setupAudio() {
        // 在实际项目中，这里会设置真实的音频
        console.log('Setting up audio system...');
        
        // 模拟音频配置
        this.audioConfig = {
            bgMusic: { loop: true, volume: 0.3 },
            jump: { volume: 0.6 },
            collect: { volume: 0.7 },
            hurt: { volume: 0.8 },
            enemyHit: { volume: 0.5 },
            levelUp: { volume: 0.9 },
            gameOver: { volume: 0.8 }
        };
    }
    
    /**
     * 创建游戏世界
     */
    createWorld() {
        const { width, height } = this.cameras.main;
        
        // 创建渐变背景
        const graphics = this.add.graphics();
        graphics.fillGradientStyle(0x1a1a2e, 0x16213e, 0x0f3460, 0x533483, 1);
        graphics.fillRect(0, 0, width, height);
        
        // 创建地面
        this.ground = this.add.rectangle(width/2, height - 30, width, 60, 0x4a4a4a);
        this.physics.add.existing(this.ground, true);
        
        // 创建平台
        this.platforms = this.physics.add.staticGroup();
        
        const platformData = [
            { x: 150, y: height - 150, width: 120, height: 20 },
            { x: 400, y: height - 250, width: 120, height: 20 },
            { x: 650, y: height - 180, width: 120, height: 20 },
            { x: 300, y: height - 350, width: 120, height: 20 },
            { x: 550, y: height - 320, width: 120, height: 20 }
        ];
        
        platformData.forEach(platform => {
            const plat = this.add.rectangle(platform.x, platform.y, platform.width, platform.height, 0x666666);
            plat.setStrokeStyle(2, 0x888888);
            this.platforms.add(plat);
        });
        
        // 设置世界边界
        this.physics.world.setBounds(0, 0, width, height);
        
        // 创建边界装饰
        this.createWorldDecorations();
    }
    
    /**
     * 创建世界装饰
     */
    createWorldDecorations() {
        const { width, height } = this.cameras.main;
        
        // 创建星星背景
        for (let i = 0; i < 30; i++) {
            const star = this.add.circle(
                Phaser.Math.Between(0, width),
                Phaser.Math.Between(0, height - 100),
                Phaser.Math.Between(1, 2),
                0xffffff,
                Phaser.Math.FloatBetween(0.3, 0.8)
            );
            
            this.tweens.add({
                targets: star,
                alpha: 0.1,
                duration: Phaser.Math.Between(2000, 4000),
                yoyo: true,
                repeat: -1,
                ease: 'Sine.easeInOut'
            });
        }
        
        // 创建云朵
        for (let i = 0; i < 5; i++) {
            const cloud = this.add.ellipse(
                Phaser.Math.Between(0, width),
                Phaser.Math.Between(50, 200),
                Phaser.Math.Between(60, 100),
                Phaser.Math.Between(30, 50),
                0xffffff,
                0.1
            );
            
            this.tweens.add({
                targets: cloud,
                x: cloud.x + width,
                duration: Phaser.Math.Between(20000, 40000),
                repeat: -1,
                ease: 'Linear'
            });
        }
    }
    
    /**
     * 创建背景特效
     */
    createBackgroundEffects() {
        const { width, height } = this.cameras.main;
        
        // 创建粒子系统
        this.backgroundParticles = this.add.particles(width/2, height/2, 'pixel', {
            scale: { start: 0.5, end: 0 },
            alpha: { start: 0.3, end: 0 },
            tint: [0x4a90e2, 0x7b68ee, 0x50c878, 0xffd700],
            lifespan: 3000,
            speed: { min: 10, max: 30 },
            angle: { min: 0, max: 360 },
            frequency: 200,
            emitZone: { type: 'edge', source: new Phaser.Geom.Rectangle(0, 0, width, height), quantity: 1 }
        });
    }
    
    /**
     * 创建玩家
     */
    createPlayer() {
        const { width, height } = this.cameras.main;
        
        this.player = new Player(this, 100, height - 100);
        
        // 玩家与地面和平台的碰撞
        this.physics.add.collider(this.player, this.ground);
        this.physics.add.collider(this.player, this.platforms);
        
        // 摄像机跟随玩家
        this.cameras.main.startFollow(this.player, true, 0.1, 0.1);
        this.cameras.main.setDeadzone(200, 100);
    }
    
    /**
     * 创建游戏对象
     */
    createGameObjects() {
        // 创建敌人组
        this.enemies = this.physics.add.group();
        
        // 创建收集品组
        this.collectibles = this.physics.add.group();
        
        // 创建特效组
        this.effects = this.add.group();
        
        // 初始生成
        this.spawnInitialObjects();
    }
    
    /**
     * 生成初始对象
     */
    spawnInitialObjects() {
        // 生成一些初始收集品
        for (let i = 0; i < 3; i++) {
            this.spawnCollectible();
        }
        
        // 生成一个初始敌人
        this.spawnEnemy();
    }
    
    /**
     * 生成敌人
     */
    spawnEnemy() {
        const { width, height } = this.cameras.main;
        
        const x = Phaser.Math.Between(200, width - 100);
        const y = height - 200;
        
        const enemy = this.physics.add.sprite(x, y, 'pixel');
        enemy.setTint(0xff4444);
        enemy.setScale(15, 15);
        enemy.setBounce(0.3);
        enemy.setCollideWorldBounds(true);
        enemy.setVelocityX(Phaser.Math.Between(-80, 80));
        
        // 敌人属性
        enemy.health = 1;
        enemy.points = 100;
        enemy.aiTimer = 0;
        
        this.enemies.add(enemy);
        
        // 敌人与地面和平台的碰撞
        this.physics.add.collider(enemy, this.ground);
        this.physics.add.collider(enemy, this.platforms);
        
        console.log('Enemy spawned');
    }
    
    /**
     * 生成收集品
     */
    spawnCollectible() {
        const { width, height } = this.cameras.main;
        
        const x = Phaser.Math.Between(50, width - 50);
        const y = Phaser.Math.Between(100, height - 200);
        
        const collectible = this.physics.add.sprite(x, y, 'pixel');
        collectible.setTint(0xffd700);
        collectible.setScale(10, 10);
        collectible.setBounce(0.2);
        collectible.setCollideWorldBounds(true);
        
        // 收集品属性
        collectible.points = 50;
        collectible.coins = 1;
        
        // 旋转动画
        this.tweens.add({
            targets: collectible,
            rotation: Math.PI * 2,
            duration: 2000,
            repeat: -1,
            ease: 'Linear'
        });
        
        // 浮动动画
        this.tweens.add({
            targets: collectible,
            y: collectible.y - 15,
            duration: 1500,
            yoyo: true,
            repeat: -1,
            ease: 'Sine.easeInOut'
        });
        
        this.collectibles.add(collectible);
        
        // 收集品与地面和平台的碰撞
        this.physics.add.collider(collectible, this.ground);
        this.physics.add.collider(collectible, this.platforms);
        
        console.log('Collectible spawned');
    }
    
    /**
     * 设置物理系统
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
        
        // 鼠标/触摸控制
        this.input.on('pointerdown', (pointer) => {
            if (pointer.y > this.cameras.main.height - 100) {
                // 底部区域点击跳跃
                this.player.jump();
            }
        });
    }
    
    /**
     * 设置事件监听
     */
    setupEventListeners() {
        // 监听游戏状态变化
        this.gameState.on('stateChange', (data) => {
            console.log('Game state changed:', data);
            this.handleStateChange(data);
        });
        
        // 监听玩家事件
        this.events.on('playerJump', () => {
            console.log('🔊 Player jump sound');
            // this.audioManager.playSound('jump');
        });
        
        this.events.on('playerHurt', (damage) => {
            this.gameState.takeDamage(damage);
            console.log('🔊 Player hurt sound');
            // this.audioManager.playSound('hurt');
            this.createHurtEffect();
        });
        
        this.events.on('itemCollected', (points) => {
            this.gameState.addScore(points);
            this.gameState.gameData.coins += 1;
            console.log('🔊 Item collect sound');
            // this.audioManager.playSound('collect');
        });
        
        this.events.on('enemyDefeated', (points) => {
            this.gameState.addScore(points);
            console.log('🔊 Enemy hit sound');
            // this.audioManager.playSound('enemyHit');
        });
        
        // 监听升级
        this.gameState.on('levelUp', (level) => {
            console.log('🔊 Level up sound');
            // this.audioManager.playSound('levelUp');
            this.handleLevelUp(level);
        });
        
        // 监听游戏结束
        this.gameState.on('stateChange', (data) => {
            if (data.newState === 'gameOver') {
                this.handleGameOver();
            }
        });
    }
    
    /**
     * 创建游戏介绍
     */
    createGameIntro() {
        const { width, height } = this.cameras.main;
        
        const introContainer = this.add.container(width/2, height/2);
        
        const introBg = this.add.rectangle(0, 0, 400, 200, 0x000000, 0.8);
        introBg.setStrokeStyle(3, 0x666666);
        
        const title = this.add.text(0, -60, 'Complete Game Demo', {
            fontSize: '24px',
            color: '#ffffff',
            fontStyle: 'bold'
        }).setOrigin(0.5);
        
        const instructions = this.add.text(0, -20, 
            'Arrow Keys / WASD: Move\nSpace: Jump\nESC: Pause\n\nCollect coins and avoid enemies!', {
            fontSize: '14px',
            color: '#cccccc',
            align: 'center',
            lineSpacing: 5
        }).setOrigin(0.5);
        
        const startBtn = this.add.text(0, 50, 'Click to Start!', {
            fontSize: '18px',
            color: '#00ff00',
            backgroundColor: '#333333',
            padding: { x: 20, y: 10 }
        }).setOrigin(0.5)
        .setInteractive({ useHandCursor: true })
        .on('pointerdown', () => {
            this.tweens.add({
                targets: introContainer,
                alpha: 0,
                duration: 500,
                onComplete: () => {
                    introContainer.destroy();
                    this.startGameplay();
                }
            });
        });
        
        introContainer.add([introBg, title, instructions, startBtn]);
        
        // 暂停游戏直到开始
        this.physics.pause();
    }
    
    /**
     * 开始游戏玩法
     */
    startGameplay() {
        this.physics.resume();
        this.gameState.setState('playing');
        console.log('Gameplay started!');
    }
    
    /**
     * 播放背景音乐
     */
    playBackgroundMusic() {
        console.log('🎵 Playing background music...');
        // this.audioManager.playMusic('bgMusic');
    }
    
    update(time, delta) {
        if (this.gameState.currentState !== 'playing') {
            return;
        }
        
        // 更新计时器
        this.gameTimer += delta;
        this.spawnTimer += delta;
        this.difficultyTimer += delta;
        
        // 更新玩家
        if (this.player) {
            this.updatePlayer();
        }
        
        // 更新敌人
        this.updateEnemies();
        
        // 生成新对象
        this.handleSpawning();
        
        // 更新难度
        this.updateDifficulty();
        
        // 检查游戏结束条件
        this.checkGameOver();
    }
    
    /**
     * 更新玩家
     */
    updatePlayer() {
        // 左右移动
        if (this.cursors.left.isDown || this.wasd.A.isDown) {
            this.player.moveLeft();
        } else if (this.cursors.right.isDown || this.wasd.D.isDown) {
            this.player.moveRight();
        } else {
            this.player.stopMoving();
        }
        
        // 跳跃
        if ((this.cursors.up.isDown || this.wasd.W.isDown || this.spaceKey.isDown)) {
            this.player.jump();
        }
        
        // 更新玩家状态
        this.player.update();
    }
    
    /**
     * 更新敌人
     */
    updateEnemies() {
        this.enemies.children.entries.forEach(enemy => {
            // 简单AI：碰到边界就转向
            if (enemy.body.touching.left || enemy.body.touching.right) {
                enemy.setVelocityX(-enemy.body.velocity.x);
            }
            
            // 随机改变方向
            enemy.aiTimer += this.game.loop.delta;
            if (enemy.aiTimer > 2000) {
                enemy.setVelocityX(Phaser.Math.Between(-100, 100));
                enemy.aiTimer = 0;
            }
            
            // 朝向玩家移动（简单AI）
            if (Math.random() < 0.001) {
                const direction = this.player.x > enemy.x ? 1 : -1;
                enemy.setVelocityX(direction * 60);
            }
        });
    }
    
    /**
     * 处理生成
     */
    handleSpawning() {
        // 生成敌人
        if (this.spawnTimer > this.enemySpawnRate) {
            if (this.enemies.children.size < 5) { // 最多5个敌人
                this.spawnEnemy();
            }
            this.spawnTimer = 0;
        }
        
        // 生成收集品
        if (this.spawnTimer > this.collectibleSpawnRate) {
            if (this.collectibles.children.size < 8) { // 最多8个收集品
                this.spawnCollectible();
            }
        }
    }
    
    /**
     * 更新难度
     */
    updateDifficulty() {
        if (this.difficultyTimer > 30000) { // 每30秒增加难度
            this.difficulty++;
            this.enemySpawnRate = Math.max(2000, this.enemySpawnRate - 500);
            this.collectibleSpawnRate = Math.max(1500, this.collectibleSpawnRate - 200);
            this.difficultyTimer = 0;
            
            this.showDifficultyIncrease();
            console.log(`Difficulty increased to ${this.difficulty}`);
        }
    }
    
    /**
     * 玩家与敌人碰撞
     */
    playerHitEnemy(player, enemy) {
        // 检查玩家是否从上方踩到敌人
        if (player.body.touching.down && enemy.body.touching.up) {
            // 踩死敌人
            this.createEnemyDeathEffect(enemy.x, enemy.y);
            enemy.destroy();
            player.setVelocityY(-200); // 弹跳效果
            this.events.emit('enemyDefeated', enemy.points);
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
        this.createCollectEffect(collectible.x, collectible.y);
        collectible.destroy();
        this.events.emit('itemCollected', collectible.points);
    }
    
    /**
     * 创建收集特效
     */
    createCollectEffect(x, y) {
        const particles = [];
        
        for (let i = 0; i < 6; i++) {
            const particle = this.add.circle(x, y, 3, 0xffd700);
            particles.push(particle);
            
            const angle = (i / 6) * Math.PI * 2;
            const speed = 80;
            
            this.tweens.add({
                targets: particle,
                x: x + Math.cos(angle) * 40,
                y: y + Math.sin(angle) * 40,
                alpha: 0,
                duration: 400,
                ease: 'Power2',
                onComplete: () => {
                    particle.destroy();
                }
            });
        }
    }
    
    /**
     * 创建敌人死亡特效
     */
    createEnemyDeathEffect(x, y) {
        const explosion = this.add.circle(x, y, 5, 0xff4444);
        
        this.tweens.add({
            targets: explosion,
            scaleX: 4,
            scaleY: 4,
            alpha: 0,
            duration: 300,
            ease: 'Power2',
            onComplete: () => {
                explosion.destroy();
            }
        });
    }
    
    /**
     * 创建受伤特效
     */
    createHurtEffect() {
        this.cameras.main.shake(200, 0.02);
        
        // 屏幕红色闪光
        const flash = this.add.rectangle(
            this.cameras.main.centerX, 
            this.cameras.main.centerY, 
            this.cameras.main.width, 
            this.cameras.main.height, 
            0xff0000, 
            0.3
        );
        flash.setScrollFactor(0);
        
        this.tweens.add({
            targets: flash,
            alpha: 0,
            duration: 200,
            onComplete: () => {
                flash.destroy();
            }
        });
    }
    
    /**
     * 处理状态变化
     */
    handleStateChange(data) {
        switch (data.newState) {
            case 'paused':
                this.physics.pause();
                break;
            case 'playing':
                this.physics.resume();
                break;
            case 'gameOver':
                this.physics.pause();
                break;
        }
    }
    
    /**
     * 处理升级
     */
    handleLevelUp(level) {
        const { width, height } = this.cameras.main;
        
        const levelUpText = this.add.text(width/2, height/2, `LEVEL ${level}!`, {
            fontSize: '32px',
            color: '#ffff00',
            fontStyle: 'bold',
            stroke: '#000000',
            strokeThickness: 3
        }).setOrigin(0.5).setScrollFactor(0);
        
        this.tweens.add({
            targets: levelUpText,
            scaleX: 1.5,
            scaleY: 1.5,
            alpha: 0,
            duration: 2000,
            ease: 'Power2',
            onComplete: () => {
                levelUpText.destroy();
            }
        });
        
        // 增加难度
        this.difficulty = level;
        this.enemySpawnRate = Math.max(1000, 5000 - (level * 300));
    }
    
    /**
     * 显示难度增加
     */
    showDifficultyIncrease() {
        const { width } = this.cameras.main;
        
        const difficultyText = this.add.text(width/2, 150, `Difficulty: ${this.difficulty}`, {
            fontSize: '20px',
            color: '#ff6666',
            fontStyle: 'bold'
        }).setOrigin(0.5).setScrollFactor(0);
        
        this.tweens.add({
            targets: difficultyText,
            alpha: 0,
            y: 120,
            duration: 2000,
            ease: 'Power2',
            onComplete: () => {
                difficultyText.destroy();
            }
        });
    }
    
    /**
     * 检查游戏结束
     */
    checkGameOver() {
        if (this.gameState.gameData.lives <= 0) {
            this.gameState.setState('gameOver');
        }
    }
    
    /**
     * 处理游戏结束
     */
    handleGameOver() {
        console.log('🔊 Game over sound');
        // this.audioManager.playSound('gameOver');
        
        // 停止背景音乐
        // this.audioManager.stopMusic();
        
        // 显示游戏结束界面
        this.time.delayedCall(1000, () => {
            this.showGameOverScreen();
        });
    }
    
    /**
     * 显示游戏结束界面
     */
    showGameOverScreen() {
        const { width, height } = this.cameras.main;
        
        const gameOverContainer = this.add.container(width/2, height/2);
        gameOverContainer.setScrollFactor(0);
        
        const bg = this.add.rectangle(0, 0, 400, 300, 0x000000, 0.9);
        bg.setStrokeStyle(3, 0xff0000);
        
        const title = this.add.text(0, -100, 'GAME OVER', {
            fontSize: '32px',
            color: '#ff0000',
            fontStyle: 'bold'
        }).setOrigin(0.5);
        
        const stats = this.add.text(0, -40, 
            `Final Score: ${this.gameState.gameData.score}\n` +
            `Level Reached: ${this.gameState.gameData.level}\n` +
            `Coins Collected: ${this.gameState.gameData.coins}\n` +
            `High Score: ${this.gameState.progress.highScore}`, {
            fontSize: '16px',
            color: '#ffffff',
            align: 'center',
            lineSpacing: 5
        }).setOrigin(0.5);
        
        const restartBtn = this.add.text(0, 60, 'Restart Game', {
            fontSize: '18px',
            color: '#ffffff',
            backgroundColor: '#4CAF50',
            padding: { x: 20, y: 10 }
        }).setOrigin(0.5)
        .setInteractive({ useHandCursor: true })
        .on('pointerdown', () => {
            this.restartGame();
        });
        
        const menuBtn = this.add.text(0, 100, 'Main Menu', {
            fontSize: '16px',
            color: '#ffffff',
            backgroundColor: '#666666',
            padding: { x: 15, y: 8 }
        }).setOrigin(0.5)
        .setInteractive({ useHandCursor: true })
        .on('pointerdown', () => {
            this.scene.start('MenuScene');
        });
        
        gameOverContainer.add([bg, title, stats, restartBtn, menuBtn]);
        
        // 入场动画
        gameOverContainer.setScale(0.8);
        gameOverContainer.setAlpha(0);
        
        this.tweens.add({
            targets: gameOverContainer,
            scaleX: 1,
            scaleY: 1,
            alpha: 1,
            duration: 500,
            ease: 'Back.easeOut'
        });
    }
    
    /**
     * 重启游戏
     */
    restartGame() {
        this.scene.restart();
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
        
        if (this.ui) {
            this.ui.destroy();
        }
        
        if (this.backgroundParticles) {
            this.backgroundParticles.destroy();
        }
    }
}
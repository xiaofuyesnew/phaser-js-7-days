/**
 * ExampleScene - 完整示例场景
 * 
 * 这个场景展示了Day 1学到的所有概念的综合应用：
 * - 场景生命周期管理
 * - 多种游戏对象创建
 * - 用户输入处理
 * - 动画和视觉效果
 * - 游戏逻辑实现
 * 
 * 这是一个完整的小游戏示例，可以作为学习参考
 */

import { GAME_CONFIG, SCENE_KEYS, UI_CONFIG } from '../utils/constants.js';
import { Logger, MathUtils, AnimationUtils } from '../utils/helpers.js';

export class ExampleScene extends Phaser.Scene {
    constructor() {
        super({ key: 'example-scene' });
        
        // 游戏状态
        this.gameState = {
            score: 0,
            level: 1,
            lives: 3,
            isGameOver: false,
            isPaused: false
        };
        
        // 游戏对象容器
        this.gameObjects = {
            player: null,
            collectibles: null,
            obstacles: null,
            particles: null,
            ui: {}
        };
        
        // 游戏配置
        this.config = {
            playerSpeed: 250,
            collectibleCount: 8,
            obstacleCount: 3,
            spawnDelay: 2000
        };
    }
    
    preload() {
        Logger.info('🎮 ExampleScene: 开始加载资源...');
        
        // 创建程序化纹理
        this.createTextures();
        
        Logger.info('✅ ExampleScene: 资源加载完成');
    }
    
    create() {
        Logger.info('🏗️ ExampleScene: 开始创建示例场景...');
        
        // 创建背景
        this.createBackground();
        
        // 创建玩家
        this.createPlayer();
        
        // 创建收集品
        this.createCollectibles();
        
        // 创建障碍物
        this.createObstacles();
        
        // 创建粒子系统
        this.createParticles();
        
        // 创建UI
        this.createUI();
        
        // 设置输入
        this.setupInput();
        
        // 设置定时器
        this.setupTimers();
        
        // 显示开始信息
        this.showStartMessage();
        
        Logger.info('✅ ExampleScene: 示例场景创建完成');
    }
    
    update() {
        if (this.gameState.isGameOver || this.gameState.isPaused) {
            return;
        }
        
        // 更新玩家
        this.updatePlayer();
        
        // 更新收集品
        this.updateCollectibles();
        
        // 更新障碍物
        this.updateObstacles();
        
        // 检查碰撞
        this.checkCollisions();
        
        // 更新UI
        this.updateUI();
    }
    
    /**
     * 创建程序化纹理
     */
    createTextures() {
        // 玩家纹理 (蓝色圆形)
        this.add.graphics()
            .fillStyle(0x4ecdc4)
            .fillCircle(20, 20, 18)
            .lineStyle(3, 0xffffff)
            .strokeCircle(20, 20, 18)
            .generateTexture('example-player', 40, 40);
        
        // 收集品纹理 (金色星星)
        const starGraphics = this.add.graphics();
        starGraphics.fillStyle(0xffd700);
        starGraphics.lineStyle(2, 0xffffff);
        
        // 绘制星星
        const centerX = 15;
        const centerY = 15;
        const outerRadius = 12;
        const innerRadius = 6;
        const points = 5;
        
        starGraphics.beginPath();
        for (let i = 0; i < points * 2; i++) {
            const angle = (i * Math.PI) / points;
            const radius = i % 2 === 0 ? outerRadius : innerRadius;
            const x = centerX + Math.cos(angle) * radius;
            const y = centerY + Math.sin(angle) * radius;
            
            if (i === 0) {
                starGraphics.moveTo(x, y);
            } else {
                starGraphics.lineTo(x, y);
            }
        }
        starGraphics.closePath();
        starGraphics.fillPath();
        starGraphics.strokePath();
        starGraphics.generateTexture('example-star', 30, 30);
        
        // 障碍物纹理 (红色方块)
        this.add.graphics()
            .fillStyle(0xff6b6b)
            .fillRect(0, 0, 30, 30)
            .lineStyle(2, 0x000000)
            .strokeRect(0, 0, 30, 30)
            .generateTexture('example-obstacle', 30, 30);
        
        // 粒子纹理 (小圆点)
        this.add.graphics()
            .fillStyle(0xffffff)
            .fillCircle(4, 4, 3)
            .generateTexture('example-particle', 8, 8);
    }
    
    /**
     * 创建背景
     */
    createBackground() {
        // 渐变背景
        const graphics = this.add.graphics();
        graphics.fillGradientStyle(0x1e3c72, 0x1e3c72, 0x2a5298, 0x2a5298, 1);
        graphics.fillRect(0, 0, GAME_CONFIG.WIDTH, GAME_CONFIG.HEIGHT);
        
        // 添加装饰性元素
        for (let i = 0; i < 20; i++) {
            const x = MathUtils.randomInt(0, GAME_CONFIG.WIDTH);
            const y = MathUtils.randomInt(0, GAME_CONFIG.HEIGHT);
            const size = MathUtils.randomInt(1, 3);
            
            const star = this.add.circle(x, y, size, 0xffffff, 0.3);
            
            // 添加闪烁动画
            this.tweens.add({
                targets: star,
                alpha: 0.8,
                duration: MathUtils.randomInt(1000, 3000),
                yoyo: true,
                repeat: -1,
                ease: 'Sine.easeInOut'
            });
        }
        
        // 标题
        this.add.text(GAME_CONFIG.WIDTH / 2, 40, 'Phaser.js 示例游戏', {
            fontSize: '28px',
            fontFamily: UI_CONFIG.FONT_FAMILY,
            fill: '#ffffff',
            fontStyle: 'bold'
        }).setOrigin(0.5);
    }
    
    /**
     * 创建玩家
     */
    createPlayer() {
        this.gameObjects.player = this.add.sprite(100, GAME_CONFIG.HEIGHT / 2, 'example-player');
        this.gameObjects.player.setScale(1.2);
        
        // 添加发光效果
        this.gameObjects.player.setTint(0x4ecdc4);
        
        // 添加浮动动画
        this.tweens.add({
            targets: this.gameObjects.player,
            y: this.gameObjects.player.y - 10,
            duration: 1500,
            yoyo: true,
            repeat: -1,
            ease: 'Sine.easeInOut'
        });
        
        Logger.info('👤 示例玩家创建完成');
    }
    
    /**
     * 创建收集品
     */
    createCollectibles() {
        this.gameObjects.collectibles = this.add.group();
        
        for (let i = 0; i < this.config.collectibleCount; i++) {
            this.spawnCollectible();
        }
        
        Logger.info(`⭐ 创建了 ${this.config.collectibleCount} 个收集品`);
    }
    
    /**
     * 生成收集品
     */
    spawnCollectible() {
        const x = MathUtils.randomInt(200, GAME_CONFIG.WIDTH - 50);
        const y = MathUtils.randomInt(100, GAME_CONFIG.HEIGHT - 100);
        
        const collectible = this.add.sprite(x, y, 'example-star');
        collectible.setScale(0.8);
        
        // 添加到组
        this.gameObjects.collectibles.add(collectible);
        
        // 添加旋转动画
        this.tweens.add({
            targets: collectible,
            angle: 360,
            duration: 3000,
            repeat: -1,
            ease: 'Linear'
        });
        
        // 添加缩放动画
        this.tweens.add({
            targets: collectible,
            scaleX: 1.0,
            scaleY: 1.0,
            duration: 1000,
            yoyo: true,
            repeat: -1,
            ease: 'Sine.easeInOut'
        });
        
        // 添加发光效果
        collectible.setTint(0xffd700);
    }
    
    /**
     * 创建障碍物
     */
    createObstacles() {
        this.gameObjects.obstacles = this.add.group();
        
        for (let i = 0; i < this.config.obstacleCount; i++) {
            this.spawnObstacle();
        }
        
        Logger.info(`🚧 创建了 ${this.config.obstacleCount} 个障碍物`);
    }
    
    /**
     * 生成障碍物
     */
    spawnObstacle() {
        const x = MathUtils.randomInt(250, GAME_CONFIG.WIDTH - 100);
        const y = MathUtils.randomInt(150, GAME_CONFIG.HEIGHT - 150);
        
        const obstacle = this.add.sprite(x, y, 'example-obstacle');
        obstacle.setScale(1.5);
        obstacle.moveSpeed = MathUtils.randomInt(50, 150);
        obstacle.direction = MathUtils.randomFloat(0, Math.PI * 2);
        
        // 添加到组
        this.gameObjects.obstacles.add(obstacle);
        
        // 添加脉冲动画
        this.tweens.add({
            targets: obstacle,
            scaleX: 1.8,
            scaleY: 1.8,
            duration: 800,
            yoyo: true,
            repeat: -1,
            ease: 'Sine.easeInOut'
        });
    }
    
    /**
     * 创建粒子系统
     */
    createParticles() {
        // 收集效果粒子
        this.gameObjects.collectParticles = this.add.particles(0, 0, 'example-particle', {
            speed: { min: 50, max: 150 },
            scale: { start: 0.5, end: 0 },
            lifespan: 600,
            quantity: 8
        });
        
        // 背景粒子
        this.gameObjects.backgroundParticles = this.add.particles(0, 0, 'example-particle', {
            x: { min: 0, max: GAME_CONFIG.WIDTH },
            y: { min: 0, max: GAME_CONFIG.HEIGHT },
            speed: { min: 10, max: 30 },
            scale: { min: 0.1, max: 0.3 },
            alpha: { min: 0.1, max: 0.4 },
            lifespan: 5000,
            frequency: 200,
            quantity: 1
        });
        
        Logger.info('✨ 粒子系统创建完成');
    }
    
    /**
     * 创建UI
     */
    createUI() {
        // 分数显示
        this.gameObjects.ui.scoreText = this.add.text(20, 20, '分数: 0', {
            fontSize: '24px',
            fontFamily: UI_CONFIG.FONT_FAMILY,
            fill: '#ffffff',
            fontStyle: 'bold'
        });
        
        // 生命值显示
        this.gameObjects.ui.livesText = this.add.text(20, 50, '生命: 3', {
            fontSize: '20px',
            fontFamily: UI_CONFIG.FONT_FAMILY,
            fill: '#ff6b6b'
        });
        
        // 等级显示
        this.gameObjects.ui.levelText = this.add.text(20, 80, '等级: 1', {
            fontSize: '20px',
            fontFamily: UI_CONFIG.FONT_FAMILY,
            fill: '#4ecdc4'
        });
        
        // 控制说明
        this.gameObjects.ui.controlsText = this.add.text(
            GAME_CONFIG.WIDTH - 20, 
            GAME_CONFIG.HEIGHT - 60,
            '方向键: 移动 | 空格: 暂停 | R: 重置',
            {
                fontSize: '14px',
                fontFamily: UI_CONFIG.FONT_FAMILY,
                fill: '#cccccc'
            }
        ).setOrigin(1, 0);
        
        // 进度条背景
        this.gameObjects.ui.progressBg = this.add.rectangle(
            GAME_CONFIG.WIDTH / 2, 
            GAME_CONFIG.HEIGHT - 30, 
            300, 10, 
            0x333333
        );
        
        // 进度条
        this.gameObjects.ui.progressBar = this.add.rectangle(
            GAME_CONFIG.WIDTH / 2 - 150, 
            GAME_CONFIG.HEIGHT - 30, 
            0, 10, 
            0x4ecdc4
        ).setOrigin(0, 0.5);
        
        Logger.info('🎨 UI界面创建完成');
    }
    
    /**
     * 设置输入
     */
    setupInput() {
        // 方向键
        this.cursors = this.input.keyboard.createCursorKeys();
        
        // WASD键
        this.wasd = this.input.keyboard.addKeys('W,S,A,D');
        
        // 功能键
        this.spaceKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
        this.rKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.R);
        
        // 暂停功能
        this.spaceKey.on('down', () => {
            this.togglePause();
        });
        
        // 重置功能
        this.rKey.on('down', () => {
            this.resetGame();
        });
        
        Logger.info('⌨️ 输入系统设置完成');
    }
    
    /**
     * 设置定时器
     */
    setupTimers() {
        // 定期生成新的收集品
        this.time.addEvent({
            delay: this.config.spawnDelay,
            callback: () => {
                if (this.gameObjects.collectibles.children.entries.length < this.config.collectibleCount) {
                    this.spawnCollectible();
                }
            },
            loop: true
        });
        
        // 定期增加难度
        this.time.addEvent({
            delay: 30000, // 30秒
            callback: () => {
                this.increaseDifficulty();
            },
            loop: true
        });
    }
    
    /**
     * 更新玩家
     */
    updatePlayer() {
        const player = this.gameObjects.player;
        if (!player) return;
        
        const deltaTime = this.game.loop.delta / 1000;
        let velocityX = 0;
        let velocityY = 0;
        
        // 检查输入
        if (this.cursors.left.isDown || this.wasd.A.isDown) {
            velocityX = -this.config.playerSpeed;
        } else if (this.cursors.right.isDown || this.wasd.D.isDown) {
            velocityX = this.config.playerSpeed;
        }
        
        if (this.cursors.up.isDown || this.wasd.W.isDown) {
            velocityY = -this.config.playerSpeed;
        } else if (this.cursors.down.isDown || this.wasd.S.isDown) {
            velocityY = this.config.playerSpeed;
        }
        
        // 应用移动
        player.x += velocityX * deltaTime;
        player.y += velocityY * deltaTime;
        
        // 边界限制
        player.x = Phaser.Math.Clamp(player.x, 30, GAME_CONFIG.WIDTH - 30);
        player.y = Phaser.Math.Clamp(player.y, 100, GAME_CONFIG.HEIGHT - 100);
    }
    
    /**
     * 更新收集品
     */
    updateCollectibles() {
        // 收集品已经通过Tween系统自动更新动画
    }
    
    /**
     * 更新障碍物
     */
    updateObstacles() {
        const deltaTime = this.game.loop.delta / 1000;
        
        this.gameObjects.obstacles.children.entries.forEach(obstacle => {
            // 移动障碍物
            obstacle.x += Math.cos(obstacle.direction) * obstacle.moveSpeed * deltaTime;
            obstacle.y += Math.sin(obstacle.direction) * obstacle.moveSpeed * deltaTime;
            
            // 边界反弹
            if (obstacle.x <= 30 || obstacle.x >= GAME_CONFIG.WIDTH - 30) {
                obstacle.direction = Math.PI - obstacle.direction;
            }
            if (obstacle.y <= 100 || obstacle.y >= GAME_CONFIG.HEIGHT - 100) {
                obstacle.direction = -obstacle.direction;
            }
            
            // 确保在边界内
            obstacle.x = Phaser.Math.Clamp(obstacle.x, 30, GAME_CONFIG.WIDTH - 30);
            obstacle.y = Phaser.Math.Clamp(obstacle.y, 100, GAME_CONFIG.HEIGHT - 100);
        });
    }
    
    /**
     * 检查碰撞
     */
    checkCollisions() {
        const player = this.gameObjects.player;
        if (!player) return;
        
        // 检查收集品碰撞
        this.gameObjects.collectibles.children.entries.forEach(collectible => {
            if (!collectible.active) return;
            
            const distance = Phaser.Math.Distance.Between(
                player.x, player.y,
                collectible.x, collectible.y
            );
            
            if (distance < 40) {
                this.collectItem(collectible);
            }
        });
        
        // 检查障碍物碰撞
        this.gameObjects.obstacles.children.entries.forEach(obstacle => {
            if (!obstacle.active) return;
            
            const distance = Phaser.Math.Distance.Between(
                player.x, player.y,
                obstacle.x, obstacle.y
            );
            
            if (distance < 45) {
                this.hitObstacle();
            }
        });
    }
    
    /**
     * 收集物品
     */
    collectItem(collectible) {
        // 增加分数
        this.gameState.score += 100;
        
        // 播放收集效果
        this.gameObjects.collectParticles.emitParticleAt(collectible.x, collectible.y);
        
        // 收集动画
        this.tweens.add({
            targets: collectible,
            scaleX: 2,
            scaleY: 2,
            alpha: 0,
            duration: 300,
            ease: 'Power2',
            onComplete: () => {
                collectible.destroy();
            }
        });
        
        // 分数提示
        const scoreText = this.add.text(collectible.x, collectible.y, '+100', {
            fontSize: '20px',
            fill: '#ffd700',
            fontStyle: 'bold'
        }).setOrigin(0.5);
        
        this.tweens.add({
            targets: scoreText,
            y: scoreText.y - 50,
            alpha: 0,
            duration: 1000,
            ease: 'Power2',
            onComplete: () => {
                scoreText.destroy();
            }
        });
        
        Logger.info(`⭐ 收集物品! 当前分数: ${this.gameState.score}`);
        
        // 检查是否升级
        this.checkLevelUp();
    }
    
    /**
     * 撞到障碍物
     */
    hitObstacle() {
        this.gameState.lives--;
        
        // 玩家闪烁效果
        this.tweens.add({
            targets: this.gameObjects.player,
            alpha: 0.3,
            duration: 100,
            yoyo: true,
            repeat: 5
        });
        
        // 屏幕震动效果
        this.cameras.main.shake(200, 0.01);
        
        Logger.warn(`💥 撞到障碍物! 剩余生命: ${this.gameState.lives}`);
        
        // 检查游戏结束
        if (this.gameState.lives <= 0) {
            this.gameOver();
        }
    }
    
    /**
     * 检查升级
     */
    checkLevelUp() {
        const newLevel = Math.floor(this.gameState.score / 500) + 1;
        if (newLevel > this.gameState.level) {
            this.gameState.level = newLevel;
            this.increaseDifficulty();
            this.showLevelUpMessage();
        }
    }
    
    /**
     * 增加难度
     */
    increaseDifficulty() {
        this.config.playerSpeed += 25;
        this.config.obstacleCount = Math.min(this.config.obstacleCount + 1, 8);
        
        // 生成新的障碍物
        this.spawnObstacle();
        
        Logger.info(`🔥 难度提升! 等级: ${this.gameState.level}`);
    }
    
    /**
     * 更新UI
     */
    updateUI() {
        // 更新文本
        this.gameObjects.ui.scoreText.setText(`分数: ${this.gameState.score}`);
        this.gameObjects.ui.livesText.setText(`生命: ${this.gameState.lives}`);
        this.gameObjects.ui.levelText.setText(`等级: ${this.gameState.level}`);
        
        // 更新进度条
        const progress = (this.gameState.score % 500) / 500;
        this.gameObjects.ui.progressBar.width = progress * 300;
    }
    
    /**
     * 显示开始信息
     */
    showStartMessage() {
        const startText = this.add.text(
            GAME_CONFIG.WIDTH / 2, 
            GAME_CONFIG.HEIGHT / 2,
            '收集星星，避开障碍物！\n\n使用方向键移动\n按空格键暂停\n\n3秒后开始...',
            {
                fontSize: '24px',
                fontFamily: UI_CONFIG.FONT_FAMILY,
                fill: '#ffffff',
                align: 'center',
                fontStyle: 'bold'
            }
        ).setOrigin(0.5);
        
        // 倒计时
        let countdown = 3;
        const countdownTimer = this.time.addEvent({
            delay: 1000,
            callback: () => {
                countdown--;
                if (countdown > 0) {
                    startText.setText(`收集星星，避开障碍物！\n\n使用方向键移动\n按空格键暂停\n\n${countdown}秒后开始...`);
                } else {
                    startText.setText('开始游戏！');
                    this.tweens.add({
                        targets: startText,
                        alpha: 0,
                        duration: 500,
                        onComplete: () => {
                            startText.destroy();
                        }
                    });
                }
            },
            repeat: 3
        });
    }
    
    /**
     * 显示升级信息
     */
    showLevelUpMessage() {
        const levelUpText = this.add.text(
            GAME_CONFIG.WIDTH / 2,
            GAME_CONFIG.HEIGHT / 2,
            `等级提升!\n\n等级 ${this.gameState.level}`,
            {
                fontSize: '32px',
                fontFamily: UI_CONFIG.FONT_FAMILY,
                fill: '#4ecdc4',
                align: 'center',
                fontStyle: 'bold'
            }
        ).setOrigin(0.5);
        
        // 升级动画
        levelUpText.setScale(0);
        this.tweens.add({
            targets: levelUpText,
            scaleX: 1,
            scaleY: 1,
            duration: 500,
            ease: 'Back.easeOut',
            onComplete: () => {
                this.time.delayedCall(2000, () => {
                    this.tweens.add({
                        targets: levelUpText,
                        alpha: 0,
                        duration: 500,
                        onComplete: () => {
                            levelUpText.destroy();
                        }
                    });
                });
            }
        });
    }
    
    /**
     * 切换暂停状态
     */
    togglePause() {
        this.gameState.isPaused = !this.gameState.isPaused;
        
        if (this.gameState.isPaused) {
            this.scene.pause();
            Logger.info('⏸️ 游戏已暂停');
        } else {
            this.scene.resume();
            Logger.info('▶️ 游戏已恢复');
        }
    }
    
    /**
     * 游戏结束
     */
    gameOver() {
        this.gameState.isGameOver = true;
        
        const gameOverText = this.add.text(
            GAME_CONFIG.WIDTH / 2,
            GAME_CONFIG.HEIGHT / 2,
            `游戏结束!\n\n最终分数: ${this.gameState.score}\n等级: ${this.gameState.level}\n\n按 R 键重新开始`,
            {
                fontSize: '28px',
                fontFamily: UI_CONFIG.FONT_FAMILY,
                fill: '#ff6b6b',
                align: 'center',
                fontStyle: 'bold'
            }
        ).setOrigin(0.5);
        
        // 游戏结束动画
        this.tweens.add({
            targets: gameOverText,
            alpha: 0.7,
            duration: 1000,
            yoyo: true,
            repeat: -1
        });
        
        Logger.info(`💀 游戏结束! 最终分数: ${this.gameState.score}`);
    }
    
    /**
     * 重置游戏
     */
    resetGame() {
        Logger.info('🔄 重置游戏...');
        this.scene.restart();
    }
}
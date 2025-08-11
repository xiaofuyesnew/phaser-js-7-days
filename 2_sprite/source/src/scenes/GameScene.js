/**
 * GameScene - Day 2 主游戏场景
 * 
 * 这个场景展示了精灵系统和动画的核心功能：
 * - 精灵图的加载和使用
 * - 复杂动画系统的实现
 * - 高级用户输入处理
 * - 粒子系统和视觉效果
 * - 性能优化技巧
 * 
 * 学习重点:
 * - 掌握精灵图的创建和管理
 * - 理解动画状态机的实现
 * - 学会粒子系统的使用
 * - 了解输入缓冲和响应优化
 */

import { Player } from '../sprites/Player.js';
import { GAME_CONFIG, SCENE_KEYS, PLAYER_CONFIG } from '../utils/constants.js';
import { Logger, MathUtils, AnimationUtils } from '../utils/helpers.js';

export class GameScene extends Phaser.Scene {
    constructor() {
        super({ key: SCENE_KEYS.GAME });
        
        // 游戏对象
        this.player = null;
        this.platforms = null;
        this.collectibles = null;
        
        // 粒子系统
        this.jumpParticles = null;
        this.doubleJumpParticles = null;
        this.landingParticles = null;
        this.collectParticles = null;
        
        // UI元素
        this.ui = {};
        
        // 游戏状态
        this.gameState = {
            score: 0,
            collectiblesRemaining: 0,
            gameTime: 0
        };
        
        // 输入系统
        this.inputKeys = {};
    }
    
    preload() {
        Logger.info('🎮 GameScene: 开始加载Day 2资源...');
        
        // 创建精灵图纹理
        this.createSpriteSheets();
        
        // 创建粒子纹理
        this.createParticleTextures();
        
        // 创建平台纹理
        this.createPlatformTextures();
        
        Logger.info('✅ GameScene: Day 2资源加载完成');
    }
    
    create() {
        Logger.info('🏗️ GameScene: 开始创建Day 2场景...');
        
        // 创建背景
        this.createBackground();
        
        // 创建平台
        this.createPlatforms();
        
        // 创建粒子系统
        this.createParticleSystems();
        
        // 创建玩家
        this.createPlayer();
        
        // 创建收集品
        this.createCollectibles();
        
        // 创建UI
        this.createUI();
        
        // 设置输入
        this.setupInput();
        
        // 设置碰撞
        this.setupCollisions();
        
        // 显示教学信息
        this.showTutorialMessage();
        
        Logger.info('✅ GameScene: Day 2场景创建完成');
    }
    
    update(time, delta) {
        const deltaTime = delta / 1000; // 转换为秒
        
        // 更新游戏时间
        this.gameState.gameTime += deltaTime;
        
        // 更新玩家
        if (this.player) {
            this.player.update(this.inputKeys, deltaTime);
        }
        
        // 更新收集品动画
        this.updateCollectibles();
        
        // 更新UI
        this.updateUI();
        
        // 检查游戏状态
        this.checkGameState();
    }
    
    /**
     * 创建精灵图纹理
     */
    createSpriteSheets() {
        // 创建玩家精灵图
        this.createPlayerSpriteSheet();
        
        // 创建收集品精灵图
        this.createCollectibleSpriteSheet();
    }
    
    /**
     * 创建玩家精灵图
     */
    createPlayerSpriteSheet() {
        const frameWidth = 32;
        const frameHeight = 32;
        const cols = 8;
        const rows = 5;
        
        // 创建画布
        const canvas = this.add.graphics();
        
        // 定义动画帧的颜色和样式
        const animations = [
            // 待机动画 (0-3)
            { color: 0x4ecdc4, style: 'circle', frames: 4 },
            // 行走动画 (4-11)
            { color: 0x45b7d1, style: 'square', frames: 8 },
            // 跑步动画 (12-19)
            { color: 0x96ceb4, style: 'diamond', frames: 8 },
            // 跳跃动画 (20-23)
            { color: 0x6c5ce7, style: 'triangle', frames: 4 },
            // 下落动画 (24-27)
            { color: 0xa29bfe, style: 'oval', frames: 4 },
            // 着陆动画 (28-31)
            { color: 0xfd79a8, style: 'star', frames: 4 },
            // 冲刺动画 (32-35)
            { color: 0xfdcb6e, style: 'lightning', frames: 4 }
        ];
        
        let frameIndex = 0;
        
        animations.forEach(anim => {
            for (let i = 0; i < anim.frames; i++) {
                const col = frameIndex % cols;
                const row = Math.floor(frameIndex / cols);
                const x = col * frameWidth;
                const y = row * frameHeight;
                
                // 清除当前帧区域
                canvas.clear();
                
                // 绘制帧内容
                this.drawPlayerFrame(canvas, x, y, frameWidth, frameHeight, anim, i);
                
                // 生成纹理
                canvas.generateTexture(`player-frame-${frameIndex}`, frameWidth, frameHeight);
                
                frameIndex++;
            }
        });
        
        // 创建精灵图纹理
        const spriteSheetCanvas = this.add.renderTexture(0, 0, cols * frameWidth, rows * frameHeight);
        
        for (let i = 0; i < frameIndex; i++) {
            const col = i % cols;
            const row = Math.floor(i / cols);
            const x = col * frameWidth;
            const y = row * frameHeight;
            
            spriteSheetCanvas.draw(`player-frame-${i}`, x, y);
        }
        
        spriteSheetCanvas.saveTexture('player-spritesheet');
        spriteSheetCanvas.destroy();
        canvas.destroy();
        
        Logger.info('🎭 玩家精灵图创建完成');
    }
    
    /**
     * 绘制玩家帧
     */
    drawPlayerFrame(graphics, x, y, width, height, anim, frameIndex) {
        const centerX = x + width / 2;
        const centerY = y + height / 2;
        const size = Math.min(width, height) * 0.6;
        
        // 设置颜色
        graphics.fillStyle(anim.color);
        graphics.lineStyle(2, 0xffffff);
        
        // 根据样式绘制不同形状
        switch (anim.style) {
            case 'circle':
                const radius = size / 2 + Math.sin(frameIndex * 0.5) * 2;
                graphics.fillCircle(centerX, centerY, radius);
                graphics.strokeCircle(centerX, centerY, radius);
                break;
                
            case 'square':
                const offset = Math.sin(frameIndex * 0.8) * 2;
                graphics.fillRect(centerX - size/2, centerY - size/2 + offset, size, size);
                graphics.strokeRect(centerX - size/2, centerY - size/2 + offset, size, size);
                break;
                
            case 'diamond':
                graphics.beginPath();
                graphics.moveTo(centerX, centerY - size/2);
                graphics.lineTo(centerX + size/2, centerY);
                graphics.lineTo(centerX, centerY + size/2);
                graphics.lineTo(centerX - size/2, centerY);
                graphics.closePath();
                graphics.fillPath();
                graphics.strokePath();
                break;
                
            case 'triangle':
                graphics.beginPath();
                graphics.moveTo(centerX, centerY - size/2);
                graphics.lineTo(centerX + size/2, centerY + size/2);
                graphics.lineTo(centerX - size/2, centerY + size/2);
                graphics.closePath();
                graphics.fillPath();
                graphics.strokePath();
                break;
                
            case 'oval':
                const scaleY = 0.7 + Math.sin(frameIndex * 0.6) * 0.2;
                graphics.fillEllipse(centerX, centerY, size, size * scaleY);
                graphics.strokeEllipse(centerX, centerY, size, size * scaleY);
                break;
                
            case 'star':
                this.drawStar(graphics, centerX, centerY, 5, size/2, size/4);
                break;
                
            case 'lightning':
                this.drawLightning(graphics, centerX, centerY, size);
                break;
        }
        
        // 添加眼睛
        graphics.fillStyle(0x000000);
        graphics.fillCircle(centerX - size/4, centerY - size/6, 2);
        graphics.fillCircle(centerX + size/4, centerY - size/6, 2);
    }
    
    /**
     * 绘制星形
     */
    drawStar(graphics, centerX, centerY, points, outerRadius, innerRadius) {
        graphics.beginPath();
        
        for (let i = 0; i < points * 2; i++) {
            const angle = (i * Math.PI) / points;
            const radius = i % 2 === 0 ? outerRadius : innerRadius;
            const x = centerX + Math.cos(angle) * radius;
            const y = centerY + Math.sin(angle) * radius;
            
            if (i === 0) {
                graphics.moveTo(x, y);
            } else {
                graphics.lineTo(x, y);
            }
        }
        
        graphics.closePath();
        graphics.fillPath();
        graphics.strokePath();
    }
    
    /**
     * 绘制闪电
     */
    drawLightning(graphics, centerX, centerY, size) {
        graphics.beginPath();
        graphics.moveTo(centerX - size/4, centerY - size/2);
        graphics.lineTo(centerX + size/6, centerY - size/6);
        graphics.lineTo(centerX - size/6, centerY);
        graphics.lineTo(centerX + size/4, centerY + size/2);
        graphics.lineTo(centerX - size/8, centerY + size/6);
        graphics.lineTo(centerX + size/8, centerY - size/4);
        graphics.closePath();
        graphics.fillPath();
        graphics.strokePath();
    }
    
    /**
     * 创建收集品精灵图
     */
    createCollectibleSpriteSheet() {
        const frameSize = 24;
        const frames = 8;
        
        const canvas = this.add.graphics();
        
        for (let i = 0; i < frames; i++) {
            canvas.clear();
            
            // 绘制旋转的宝石
            const centerX = frameSize / 2;
            const centerY = frameSize / 2;
            const angle = (i / frames) * Math.PI * 2;
            const scale = 0.8 + Math.sin(i * 0.5) * 0.2;
            
            // 外圈
            canvas.fillStyle(0xffd700);
            canvas.fillCircle(centerX, centerY, 8 * scale);
            
            // 内圈
            canvas.fillStyle(0xffff00);
            canvas.fillCircle(centerX, centerY, 5 * scale);
            
            // 闪光点
            const sparkX = centerX + Math.cos(angle) * 6;
            const sparkY = centerY + Math.sin(angle) * 6;
            canvas.fillStyle(0xffffff);
            canvas.fillCircle(sparkX, sparkY, 2);
            
            canvas.generateTexture(`collectible-frame-${i}`, frameSize, frameSize);
        }
        
        // 创建精灵图
        const spriteSheet = this.add.renderTexture(0, 0, frameSize * frames, frameSize);
        
        for (let i = 0; i < frames; i++) {
            spriteSheet.draw(`collectible-frame-${i}`, i * frameSize, 0);
        }
        
        spriteSheet.saveTexture('collectible-spritesheet');
        spriteSheet.destroy();
        canvas.destroy();
        
        Logger.info('💎 收集品精灵图创建完成');
    }
    
    /**
     * 创建粒子纹理
     */
    createParticleTextures() {
        // 跳跃粒子
        this.add.graphics()
            .fillStyle(0x4ecdc4)
            .fillCircle(4, 4, 3)
            .generateTexture('jump-particle', 8, 8);
        
        // 二段跳粒子
        this.add.graphics()
            .fillStyle(0x00ffff)
            .fillCircle(6, 6, 4)
            .lineStyle(1, 0xffffff)
            .strokeCircle(6, 6, 4)
            .generateTexture('double-jump-particle', 12, 12);
        
        // 着陆粒子
        this.add.graphics()
            .fillStyle(0x8b4513)
            .fillRect(0, 0, 6, 6)
            .generateTexture('landing-particle', 6, 6);
        
        // 收集粒子
        this.add.graphics()
            .fillStyle(0xffd700)
            .fillCircle(3, 3, 2)
            .generateTexture('collect-particle', 6, 6);
        
        Logger.info('✨ 粒子纹理创建完成');
    }
    
    /**
     * 创建平台纹理
     */
    createPlatformTextures() {
        // 普通平台
        this.add.graphics()
            .fillStyle(0x8b4513)
            .fillRect(0, 0, 64, 16)
            .lineStyle(2, 0x654321)
            .strokeRect(0, 0, 64, 16)
            .generateTexture('platform', 64, 16);
        
        // 小平台
        this.add.graphics()
            .fillStyle(0x228b22)
            .fillRect(0, 0, 32, 12)
            .lineStyle(1, 0x006400)
            .strokeRect(0, 0, 32, 12)
            .generateTexture('small-platform', 32, 12);
        
        Logger.info('🏗️ 平台纹理创建完成');
    }
    
    /**
     * 创建背景
     */
    createBackground() {
        // 渐变背景
        const graphics = this.add.graphics();
        graphics.fillGradientStyle(0x87ceeb, 0x87ceeb, 0x98fb98, 0x98fb98, 1);
        graphics.fillRect(0, 0, GAME_CONFIG.WIDTH, GAME_CONFIG.HEIGHT);
        
        // 添加云朵
        this.createClouds();
        
        // 添加远山
        this.createMountains();
        
        // 标题
        this.add.text(GAME_CONFIG.WIDTH / 2, 40, 'Day 2: 精灵与动画', {
            fontSize: '28px',
            fontFamily: 'Arial, sans-serif',
            fill: '#2c3e50',
            fontStyle: 'bold'
        }).setOrigin(0.5);
    }
    
    /**
     * 创建云朵
     */
    createClouds() {
        for (let i = 0; i < 5; i++) {
            const x = MathUtils.randomInt(100, GAME_CONFIG.WIDTH - 100);
            const y = MathUtils.randomInt(80, 200);
            const scale = MathUtils.randomFloat(0.5, 1.2);
            
            const cloud = this.add.graphics();
            cloud.fillStyle(0xffffff, 0.8);
            
            // 绘制云朵
            cloud.fillCircle(0, 0, 20);
            cloud.fillCircle(-15, 5, 15);
            cloud.fillCircle(15, 5, 15);
            cloud.fillCircle(-10, -10, 12);
            cloud.fillCircle(10, -10, 12);
            
            cloud.setPosition(x, y);
            cloud.setScale(scale);
            
            // 添加飘动动画
            this.tweens.add({
                targets: cloud,
                x: x + MathUtils.randomInt(-50, 50),
                duration: MathUtils.randomInt(8000, 12000),
                yoyo: true,
                repeat: -1,
                ease: 'Sine.easeInOut'
            });
        }
    }
    
    /**
     * 创建远山
     */
    createMountains() {
        const graphics = this.add.graphics();
        graphics.fillStyle(0x696969, 0.6);
        
        // 绘制山脉轮廓
        graphics.beginPath();
        graphics.moveTo(0, GAME_CONFIG.HEIGHT);
        
        for (let x = 0; x <= GAME_CONFIG.WIDTH; x += 50) {
            const height = 200 + Math.sin(x * 0.01) * 100 + Math.sin(x * 0.03) * 50;
            graphics.lineTo(x, GAME_CONFIG.HEIGHT - height);
        }
        
        graphics.lineTo(GAME_CONFIG.WIDTH, GAME_CONFIG.HEIGHT);
        graphics.closePath();
        graphics.fillPath();
        
        graphics.setDepth(-1);
    }
    
    /**
     * 创建平台
     */
    createPlatforms() {
        this.platforms = this.physics.add.staticGroup();
        
        // 地面平台
        const ground = this.platforms.create(GAME_CONFIG.WIDTH / 2, GAME_CONFIG.HEIGHT - 32, 'platform');
        ground.setScale(GAME_CONFIG.WIDTH / 64, 2).refreshBody();
        
        // 跳跃平台
        const platformData = [
            { x: 200, y: 450, scale: 1 },
            { x: 400, y: 350, scale: 1 },
            { x: 600, y: 250, scale: 1 },
            { x: 150, y: 300, scale: 0.5 },
            { x: 650, y: 400, scale: 0.5 },
            { x: 300, y: 200, scale: 0.8 },
            { x: 500, y: 150, scale: 0.8 }
        ];
        
        platformData.forEach(data => {
            const platform = this.platforms.create(data.x, data.y, 
                data.scale < 1 ? 'small-platform' : 'platform');
            platform.setScale(data.scale).refreshBody();
        });
        
        Logger.info('🏗️ 平台创建完成');
    }
    
    /**
     * 创建粒子系统
     */
    createParticleSystems() {
        // 跳跃粒子
        this.jumpParticles = this.add.particles(0, 0, 'jump-particle', {
            speed: { min: 50, max: 100 },
            scale: { start: 0.8, end: 0 },
            lifespan: 400,
            quantity: 5,
            emitting: false
        });
        
        // 二段跳粒子
        this.doubleJumpParticles = this.add.particles(0, 0, 'double-jump-particle', {
            speed: { min: 80, max: 150 },
            scale: { start: 1, end: 0 },
            lifespan: 600,
            quantity: 8,
            emitting: false
        });
        
        // 着陆粒子
        this.landingParticles = this.add.particles(0, 0, 'landing-particle', {
            speed: { min: 30, max: 80 },
            gravityY: 200,
            scale: { start: 0.6, end: 0.2 },
            lifespan: 800,
            quantity: 6,
            emitting: false
        });
        
        // 收集粒子
        this.collectParticles = this.add.particles(0, 0, 'collect-particle', {
            speed: { min: 100, max: 200 },
            scale: { start: 1, end: 0 },
            lifespan: 500,
            quantity: 10,
            emitting: false
        });
        
        Logger.info('✨ 粒子系统创建完成');
    }
    
    /**
     * 创建玩家
     */
    createPlayer() {
        this.player = new Player(this, 100, GAME_CONFIG.HEIGHT - 100);
        
        // 设置摄像机跟随
        this.cameras.main.startFollow(this.player);
        this.cameras.main.setFollowOffset(0, 50);
        this.cameras.main.setDeadzone(100, 100);
        
        Logger.info('👤 玩家创建完成');
    }
    
    /**
     * 创建收集品
     */
    createCollectibles() {
        this.collectibles = this.physics.add.group();
        
        // 创建收集品动画
        this.anims.create({
            key: 'collectible-spin',
            frames: this.anims.generateFrameNumbers('collectible-spritesheet', { 
                start: 0, end: 7 
            }),
            frameRate: 12,
            repeat: -1
        });
        
        // 收集品位置
        const collectiblePositions = [
            { x: 200, y: 400 },
            { x: 400, y: 300 },
            { x: 600, y: 200 },
            { x: 150, y: 250 },
            { x: 650, y: 350 },
            { x: 300, y: 150 },
            { x: 500, y: 100 },
            { x: 750, y: 450 }
        ];
        
        collectiblePositions.forEach(pos => {
            const collectible = this.collectibles.create(pos.x, pos.y, 'collectible-spritesheet');
            collectible.play('collectible-spin');
            collectible.setScale(1.2);
            
            // 添加浮动动画
            this.tweens.add({
                targets: collectible,
                y: pos.y - 10,
                duration: 1500,
                yoyo: true,
                repeat: -1,
                ease: 'Sine.easeInOut'
            });
        });
        
        this.gameState.collectiblesRemaining = collectiblePositions.length;
        
        Logger.info(`💎 创建了 ${collectiblePositions.length} 个收集品`);
    }
    
    /**
     * 创建UI
     */
    createUI() {
        // 分数显示
        this.ui.scoreText = this.add.text(20, 20, '分数: 0', {
            fontSize: '24px',
            fontFamily: 'Arial, sans-serif',
            fill: '#2c3e50',
            fontStyle: 'bold'
        }).setScrollFactor(0);
        
        // 收集品计数
        this.ui.collectibleText = this.add.text(20, 50, `收集品: 0/${this.gameState.collectiblesRemaining}`, {
            fontSize: '20px',
            fontFamily: 'Arial, sans-serif',
            fill: '#e67e22'
        }).setScrollFactor(0);
        
        // 玩家状态显示
        this.ui.statusText = this.add.text(20, 80, '', {
            fontSize: '16px',
            fontFamily: 'Arial, sans-serif',
            fill: '#7f8c8d'
        }).setScrollFactor(0);
        
        // 控制说明
        this.ui.controlsText = this.add.text(
            GAME_CONFIG.WIDTH - 20, 
            GAME_CONFIG.HEIGHT - 80,
            '方向键: 移动\n上键: 跳跃/二段跳\nShift: 冲刺\nR: 重置',
            {
                fontSize: '14px',
                fontFamily: 'Arial, sans-serif',
                fill: '#95a5a6',
                align: 'right'
            }
        ).setOrigin(1, 1).setScrollFactor(0);
        
        Logger.info('🎨 UI界面创建完成');
    }
    
    /**
     * 设置输入
     */
    setupInput() {
        // 方向键
        this.inputKeys = this.input.keyboard.createCursorKeys();
        
        // 添加额外按键
        this.inputKeys.shift = this.input.keyboard.addKey('SHIFT');
        this.inputKeys.r = this.input.keyboard.addKey('R');
        
        // 重置功能
        this.inputKeys.r.on('down', () => {
            this.resetGame();
        });
        
        Logger.info('⌨️ 输入系统设置完成');
    }
    
    /**
     * 设置碰撞
     */
    setupCollisions() {
        // 玩家与平台碰撞
        this.physics.add.collider(this.player, this.platforms);
        
        // 玩家与收集品碰撞
        this.physics.add.overlap(this.player, this.collectibles, this.collectItem, null, this);
        
        Logger.info('💥 碰撞系统设置完成');
    }
    
    /**
     * 更新收集品
     */
    updateCollectibles() {
        // 收集品已经通过动画和Tween自动更新
    }
    
    /**
     * 更新UI
     */
    updateUI() {
        // 更新玩家状态显示
        if (this.player) {
            const status = this.player.getStatusInfo();
            this.ui.statusText.setText([
                `状态: ${status.state}`,
                `位置: (${status.position.x}, ${status.position.y})`,
                `速度: (${status.velocity.x}, ${status.velocity.y})`,
                `在地面: ${status.isGrounded ? '是' : '否'}`,
                `可二段跳: ${status.canDoubleJump ? '是' : '否'}`,
                `冲刺冷却: ${status.dashCooldown}ms`
            ]);
        }
        
        // 更新收集品计数
        const collected = this.gameState.collectiblesRemaining - this.collectibles.children.entries.length;
        this.ui.collectibleText.setText(`收集品: ${collected}/${this.gameState.collectiblesRemaining}`);
    }
    
    /**
     * 收集物品
     */
    collectItem(player, collectible) {
        // 增加分数
        this.gameState.score += 100;
        this.ui.scoreText.setText(`分数: ${this.gameState.score}`);
        
        // 播放收集效果
        this.collectParticles.emitParticleAt(collectible.x, collectible.y);
        
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
        
        Logger.info(`💎 收集物品! 当前分数: ${this.gameState.score}`);
    }
    
    /**
     * 检查游戏状态
     */
    checkGameState() {
        // 检查是否收集完所有物品
        if (this.collectibles.children.entries.length === 0) {
            this.showVictoryMessage();
        }
    }
    
    /**
     * 显示教学信息
     */
    showTutorialMessage() {
        const tutorialText = this.add.text(
            GAME_CONFIG.WIDTH / 2, 
            GAME_CONFIG.HEIGHT / 2,
            '欢迎来到精灵与动画世界！\n\n🎮 使用方向键移动角色\n🦘 上键跳跃，空中可二段跳\n💨 Shift键冲刺\n💎 收集所有金币\n\n观察角色的不同动画状态！\n\n3秒后开始...',
            {
                fontSize: '20px',
                fontFamily: 'Arial, sans-serif',
                fill: '#2c3e50',
                align: 'center',
                fontStyle: 'bold',
                backgroundColor: 'rgba(255, 255, 255, 0.9)',
                padding: { x: 20, y: 15 }
            }
        ).setOrigin(0.5).setScrollFactor(0);
        
        // 3秒后淡出
        this.time.delayedCall(3000, () => {
            this.tweens.add({
                targets: tutorialText,
                alpha: 0,
                duration: 1000,
                onComplete: () => {
                    tutorialText.destroy();
                }
            });
        });
    }
    
    /**
     * 显示胜利信息
     */
    showVictoryMessage() {
        const victoryText = this.add.text(
            GAME_CONFIG.WIDTH / 2,
            GAME_CONFIG.HEIGHT / 2,
            `🎉 恭喜完成Day 2！\n\n最终分数: ${this.gameState.score}\n游戏时间: ${Math.round(this.gameState.gameTime)}秒\n\n你已经掌握了：\n✅ 精灵系统的使用\n✅ 动画状态的切换\n✅ 高级输入处理\n✅ 粒子效果制作\n\n按 R 键重新开始`,
            {
                fontSize: '24px',
                fontFamily: 'Arial, sans-serif',
                fill: '#27ae60',
                align: 'center',
                fontStyle: 'bold',
                backgroundColor: 'rgba(255, 255, 255, 0.95)',
                padding: { x: 30, y: 20 }
            }
        ).setOrigin(0.5).setScrollFactor(0);
        
        // 添加闪烁效果
        this.tweens.add({
            targets: victoryText,
            alpha: 0.7,
            duration: 800,
            yoyo: true,
            repeat: -1
        });
    }
    
    /**
     * 重置游戏
     */
    resetGame() {
        Logger.info('🔄 重置Day 2游戏...');
        this.scene.restart();
    }
}
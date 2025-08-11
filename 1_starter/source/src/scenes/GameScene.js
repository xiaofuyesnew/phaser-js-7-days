/**
 * GameScene - 主游戏场景
 * 
 * 这是我们的第一个游戏场景，展示Phaser.js的基础功能：
 * - 场景生命周期 (preload, create, update)
 * - 基本游戏对象创建
 * - 用户输入处理
 * - 简单的游戏逻辑
 */

import { GAME_CONFIG, SCENE_KEYS } from '../utils/constants.js';

export class GameScene extends Phaser.Scene {
    constructor() {
        super({ key: SCENE_KEYS.GAME });
        
        // 初始化场景属性
        this.score = 0;
        this.gameObjects = {};
    }
    
    /**
     * preload - 资源加载阶段
     * 在这里加载游戏所需的所有资源
     */
    preload() {
        console.log('🎮 GameScene: 开始加载资源...');
        
        // 创建简单的彩色方块作为临时精灵
        // 这样我们就不需要外部图片资源了
        this.createColoredSquares();
        
        console.log('✅ GameScene: 资源加载完成');
    }
    
    /**
     * create - 场景创建阶段
     * 在这里创建游戏对象和设置初始状态
     */
    create() {
        console.log('🏗️ GameScene: 开始创建场景...');
        
        // 设置背景
        this.createBackground();
        
        // 创建玩家
        this.createPlayer();
        
        // 创建收集品
        this.createCollectibles();
        
        // 创建UI
        this.createUI();
        
        // 设置输入控制
        this.setupInput();
        
        // 设置碰撞检测
        this.setupCollisions();
        
        // 显示欢迎信息
        this.showWelcomeMessage();
        
        console.log('✅ GameScene: 场景创建完成');
    }
    
    /**
     * update - 游戏循环更新
     * 每帧都会调用，处理游戏逻辑
     */
    update() {
        // 更新玩家
        this.updatePlayer();
        
        // 更新收集品动画
        this.updateCollectibles();
    }
    
    /**
     * 创建彩色方块纹理
     */
    createColoredSquares() {
        // 创建玩家纹理 (蓝色方块)
        this.add.graphics()
            .fillStyle(0x3498db)
            .fillRect(0, 0, 32, 32)
            .generateTexture('player', 32, 32);
        
        // 创建收集品纹理 (金色圆形)
        this.add.graphics()
            .fillStyle(0xf1c40f)
            .fillCircle(16, 16, 12)
            .generateTexture('coin', 32, 32);
        
        // 创建障碍物纹理 (红色方块)
        this.add.graphics()
            .fillStyle(0xe74c3c)
            .fillRect(0, 0, 32, 32)
            .generateTexture('obstacle', 32, 32);
    }
    
    /**
     * 创建背景
     */
    createBackground() {
        // 设置背景渐变色
        const graphics = this.add.graphics();
        graphics.fillGradientStyle(0x87CEEB, 0x87CEEB, 0x98FB98, 0x98FB98, 1);
        graphics.fillRect(0, 0, GAME_CONFIG.WIDTH, GAME_CONFIG.HEIGHT);
        
        // 添加标题
        this.add.text(GAME_CONFIG.WIDTH / 2, 50, 'Phaser.js 第一天', {
            fontSize: '28px',
            fontFamily: 'Arial, sans-serif',
            fill: '#2c3e50',
            fontStyle: 'bold'
        }).setOrigin(0.5);
        
        // 添加副标题
        this.add.text(GAME_CONFIG.WIDTH / 2, 80, '使用方向键移动蓝色方块收集金币', {
            fontSize: '16px',
            fontFamily: 'Arial, sans-serif',
            fill: '#34495e'
        }).setOrigin(0.5);
    }
    
    /**
     * 创建玩家
     */
    createPlayer() {
        // 创建玩家精灵
        this.gameObjects.player = this.add.sprite(100, GAME_CONFIG.HEIGHT / 2, 'player');
        
        // 设置玩家属性
        this.gameObjects.player.setDisplaySize(40, 40);
        this.gameObjects.player.speed = 200;
        
        // 添加一些视觉效果
        this.gameObjects.player.setTint(0x3498db);
        
        console.log('👤 玩家创建完成');
    }
    
    /**
     * 创建收集品
     */
    createCollectibles() {
        this.gameObjects.coins = this.add.group();
        
        // 创建多个金币
        for (let i = 0; i < 5; i++) {
            const x = 200 + i * 120;
            const y = 150 + Math.sin(i) * 100;
            
            const coin = this.add.sprite(x, y, 'coin');
            coin.setDisplaySize(30, 30);
            coin.setTint(0xf1c40f);
            
            // 添加到组中
            this.gameObjects.coins.add(coin);
            
            // 添加浮动动画
            this.tweens.add({
                targets: coin,
                y: y - 20,
                duration: 1000 + i * 200,
                yoyo: true,
                repeat: -1,
                ease: 'Sine.easeInOut'
            });
            
            // 添加旋转动画
            this.tweens.add({
                targets: coin,
                angle: 360,
                duration: 2000,
                repeat: -1,
                ease: 'Linear'
            });
        }
        
        console.log('🪙 收集品创建完成');
    }
    
    /**
     * 创建UI界面
     */
    createUI() {
        // 分数显示
        this.gameObjects.scoreText = this.add.text(20, 20, '分数: 0', {
            fontSize: '24px',
            fontFamily: 'Arial, sans-serif',
            fill: '#2c3e50',
            fontStyle: 'bold'
        });
        
        // 控制说明
        this.gameObjects.controlsText = this.add.text(20, GAME_CONFIG.HEIGHT - 60, 
            '控制: ↑↓←→ 移动  |  空格键: 重置游戏', {
            fontSize: '14px',
            fontFamily: 'Arial, sans-serif',
            fill: '#7f8c8d'
        });
        
        console.log('🎨 UI界面创建完成');
    }
    
    /**
     * 设置输入控制
     */
    setupInput() {
        // 创建方向键
        this.cursors = this.input.keyboard.createCursorKeys();
        
        // 创建WASD键
        this.wasd = this.input.keyboard.addKeys('W,S,A,D');
        
        // 创建空格键
        this.spaceKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
        
        // 空格键重置游戏
        this.spaceKey.on('down', () => {
            this.resetGame();
        });
        
        console.log('⌨️ 输入控制设置完成');
    }
    
    /**
     * 设置碰撞检测
     */
    setupCollisions() {
        // 这里我们使用简单的距离检测
        // 在后续章节中会学习更高级的物理碰撞
        console.log('💥 碰撞检测设置完成');
    }
    
    /**
     * 更新玩家
     */
    updatePlayer() {
        const player = this.gameObjects.player;
        if (!player) return;
        
        // 重置速度
        let velocityX = 0;
        let velocityY = 0;
        
        // 检查输入
        if (this.cursors.left.isDown || this.wasd.A.isDown) {
            velocityX = -player.speed;
        } else if (this.cursors.right.isDown || this.wasd.D.isDown) {
            velocityX = player.speed;
        }
        
        if (this.cursors.up.isDown || this.wasd.W.isDown) {
            velocityY = -player.speed;
        } else if (this.cursors.down.isDown || this.wasd.S.isDown) {
            velocityY = player.speed;
        }
        
        // 应用移动
        const deltaTime = this.game.loop.delta / 1000; // 转换为秒
        player.x += velocityX * deltaTime;
        player.y += velocityY * deltaTime;
        
        // 边界检测
        player.x = Phaser.Math.Clamp(player.x, 20, GAME_CONFIG.WIDTH - 20);
        player.y = Phaser.Math.Clamp(player.y, 100, GAME_CONFIG.HEIGHT - 100);
        
        // 检查与金币的碰撞
        this.checkCoinCollisions();
    }
    
    /**
     * 更新收集品
     */
    updateCollectibles() {
        // 收集品的动画已经通过Tween系统处理
        // 这里可以添加其他逻辑
    }
    
    /**
     * 检查金币碰撞
     */
    checkCoinCollisions() {
        const player = this.gameObjects.player;
        const coins = this.gameObjects.coins.children.entries;
        
        coins.forEach(coin => {
            if (!coin.active) return;
            
            // 计算距离
            const distance = Phaser.Math.Distance.Between(
                player.x, player.y,
                coin.x, coin.y
            );
            
            // 如果距离小于阈值，收集金币
            if (distance < 35) {
                this.collectCoin(coin);
            }
        });
    }
    
    /**
     * 收集金币
     */
    collectCoin(coin) {
        // 增加分数
        this.score += 10;
        this.gameObjects.scoreText.setText(`分数: ${this.score}`);
        
        // 播放收集效果
        this.tweens.add({
            targets: coin,
            scaleX: 1.5,
            scaleY: 1.5,
            alpha: 0,
            duration: 200,
            ease: 'Power2',
            onComplete: () => {
                coin.destroy();
            }
        });
        
        // 创建分数提示
        const scorePopup = this.add.text(coin.x, coin.y, '+10', {
            fontSize: '20px',
            fill: '#f1c40f',
            fontStyle: 'bold'
        }).setOrigin(0.5);
        
        this.tweens.add({
            targets: scorePopup,
            y: scorePopup.y - 50,
            alpha: 0,
            duration: 1000,
            ease: 'Power2',
            onComplete: () => {
                scorePopup.destroy();
            }
        });
        
        console.log(`🪙 收集金币! 当前分数: ${this.score}`);
        
        // 检查是否收集完所有金币
        if (this.gameObjects.coins.children.entries.filter(c => c.active).length === 0) {
            this.showVictoryMessage();
        }
    }
    
    /**
     * 显示欢迎信息
     */
    showWelcomeMessage() {
        const welcomeText = this.add.text(GAME_CONFIG.WIDTH / 2, GAME_CONFIG.HEIGHT / 2, 
            '欢迎来到 Phaser.js 世界!\n\n使用方向键开始探索吧!', {
            fontSize: '24px',
            fontFamily: 'Arial, sans-serif',
            fill: '#2c3e50',
            align: 'center',
            fontStyle: 'bold'
        }).setOrigin(0.5);
        
        // 3秒后淡出
        this.time.delayedCall(3000, () => {
            this.tweens.add({
                targets: welcomeText,
                alpha: 0,
                duration: 1000,
                onComplete: () => {
                    welcomeText.destroy();
                }
            });
        });
    }
    
    /**
     * 显示胜利信息
     */
    showVictoryMessage() {
        const victoryText = this.add.text(GAME_CONFIG.WIDTH / 2, GAME_CONFIG.HEIGHT / 2, 
            `🎉 恭喜完成!\n\n最终分数: ${this.score}\n\n按空格键重新开始`, {
            fontSize: '28px',
            fontFamily: 'Arial, sans-serif',
            fill: '#27ae60',
            align: 'center',
            fontStyle: 'bold'
        }).setOrigin(0.5);
        
        // 添加闪烁效果
        this.tweens.add({
            targets: victoryText,
            alpha: 0.5,
            duration: 500,
            yoyo: true,
            repeat: -1
        });
    }
    
    /**
     * 重置游戏
     */
    resetGame() {
        console.log('🔄 重置游戏...');
        
        // 重启场景
        this.scene.restart();
    }
}
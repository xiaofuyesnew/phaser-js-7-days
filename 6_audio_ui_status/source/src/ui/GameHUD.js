import { UIManager } from '../managers/UIManager.js';

/**
 * 游戏HUD界面
 * 显示游戏中的重要信息
 */
export class GameHUD {
    constructor(scene, gameState) {
        this.scene = scene;
        this.gameState = gameState;
        this.ui = new UIManager(scene);
        
        this.livesContainer = null;
        this.livesIcons = [];
        this.healthBar = null;
        this.isVisible = true;
        
        this.createHUD();
        this.setupEventListeners();
    }
    
    /**
     * 创建HUD界面
     */
    createHUD() {
        const { width, height } = this.scene.cameras.main;
        
        // 创建HUD容器
        this.hudContainer = this.ui.createContainer('hudContainer', 0, 0);
        this.hudContainer.setScrollFactor(0); // 固定在屏幕上
        
        // 分数显示
        this.ui.createText('scoreLabel', 20, 20, 'Score:', {
            fontSize: '20px',
            color: '#ffffff'
        }).setScrollFactor(0);
        
        this.ui.createText('scoreValue', 100, 20, '0', {
            fontSize: '20px',
            color: '#ffff00',
            fontStyle: 'bold'
        }).setScrollFactor(0);
        
        // 等级显示
        this.ui.createText('levelLabel', 20, 50, 'Level:', {
            fontSize: '18px',
            color: '#ffffff'
        }).setScrollFactor(0);
        
        this.ui.createText('levelValue', 80, 50, '1', {
            fontSize: '18px',
            color: '#00ff00',
            fontStyle: 'bold'
        }).setScrollFactor(0);
        
        // 生命值显示
        this.ui.createText('livesLabel', 20, 80, 'Lives:', {
            fontSize: '18px',
            color: '#ffffff'
        }).setScrollFactor(0);
        
        this.createLivesDisplay();
        
        // 血条
        this.createHealthBar();
        
        // 金币显示
        this.ui.createText('coinsLabel', width - 150, 20, 'Coins:', {
            fontSize: '18px',
            color: '#ffffff'
        }).setScrollFactor(0);
        
        this.ui.createText('coinsValue', width - 80, 20, '0', {
            fontSize: '18px',
            color: '#ffd700',
            fontStyle: 'bold'
        }).setScrollFactor(0);
        
        // 暂停按钮
        this.ui.createButton('pauseBtn', width - 50, 60, 'PAUSE', 
            this.pauseGame, this, {
                fontSize: '14px',
                backgroundColor: '#666666',
                padding: { x: 10, y: 5 }
            }).setScrollFactor(0);
        
        // 迷你地图（可选）
        this.createMiniMap();
        
        // 能量条（可选）
        this.createEnergyBar();
    }
    
    /**
     * 创建生命值显示
     */
    createLivesDisplay() {
        this.livesContainer = this.scene.add.container(80, 80);
        this.livesContainer.setScrollFactor(0);
        this.livesIcons = [];
        
        for (let i = 0; i < 5; i++) {
            // 使用简单的圆形代替心形图标
            const heart = this.scene.add.circle(i * 25, 0, 8, 0xff0000);
            heart.setStrokeStyle(2, 0x990000);
            this.livesIcons.push(heart);
            this.livesContainer.add(heart);
        }
        
        this.updateLives(this.gameState.gameData.lives);
    }
    
    /**
     * 创建血条
     */
    createHealthBar() {
        const barY = 110;
        
        this.ui.createText('healthLabel', 20, barY, 'Health:', {
            fontSize: '16px',
            color: '#ffffff'
        }).setScrollFactor(0);
        
        this.healthBar = this.ui.createProgressBar('healthBar', 120, barY + 8, 150, 16, 0x00ff00, 0x333333);
        this.healthBar.setScrollFactor(0);
        
        this.updateHealth(this.gameState.gameData.health, this.gameState.gameData.maxHealth);
    }
    
    /**
     * 创建能量条
     */
    createEnergyBar() {
        const barY = 135;
        
        this.ui.createText('energyLabel', 20, barY, 'Energy:', {
            fontSize: '16px',
            color: '#ffffff'
        }).setScrollFactor(0);
        
        this.energyBar = this.ui.createProgressBar('energyBar', 120, barY + 8, 150, 12, 0x0099ff, 0x333333);
        this.energyBar.setScrollFactor(0);
        this.energyBar.updateProgress(1); // 初始满能量
    }
    
    /**
     * 创建迷你地图
     */
    createMiniMap() {
        const { width } = this.scene.cameras.main;
        const mapSize = 100;
        
        // 迷你地图背景
        const mapBg = this.scene.add.rectangle(width - mapSize/2 - 10, 120, mapSize, mapSize, 0x000000, 0.5);
        mapBg.setStrokeStyle(2, 0x666666);
        mapBg.setScrollFactor(0);
        
        // 玩家位置指示器
        this.playerDot = this.scene.add.circle(width - mapSize/2 - 10, 120, 3, 0x00ff00);
        this.playerDot.setScrollFactor(0);
        
        this.miniMapContainer = this.scene.add.container(0, 0);
        this.miniMapContainer.add([mapBg, this.playerDot]);
        this.miniMapContainer.setScrollFactor(0);
    }
    
    /**
     * 设置事件监听器
     */
    setupEventListeners() {
        // 监听游戏状态变化
        this.gameState.on('scoreChanged', (score) => {
            this.updateScore(score);
        });
        
        this.gameState.on('healthChanged', (health) => {
            this.updateHealth(health, this.gameState.gameData.maxHealth);
        });
        
        this.gameState.on('livesChanged', (lives) => {
            this.updateLives(lives);
        });
        
        this.gameState.on('levelUp', (level) => {
            this.updateLevel(level);
            this.showLevelUpEffect();
        });
        
        // 监听成就解锁
        this.gameState.on('achievementUnlocked', (achievement) => {
            this.showAchievementNotification(achievement);
        });
    }
    
    /**
     * 更新分数显示
     * @param {number} score - 分数
     */
    updateScore(score) {
        this.ui.updateText('scoreValue', score.toString());
        
        // 分数增加动画
        const scoreElement = this.ui.elements['scoreValue'];
        if (scoreElement) {
            this.scene.tweens.add({
                targets: scoreElement,
                scaleX: 1.2,
                scaleY: 1.2,
                duration: 100,
                yoyo: true,
                ease: 'Power2'
            });
        }
    }
    
    /**
     * 更新等级显示
     * @param {number} level - 等级
     */
    updateLevel(level) {
        this.ui.updateText('levelValue', level.toString());
    }
    
    /**
     * 更新生命值显示
     * @param {number} lives - 生命数
     */
    updateLives(lives) {
        this.livesIcons.forEach((heart, index) => {
            if (index < lives) {
                heart.setVisible(true);
                heart.setAlpha(1);
            } else {
                heart.setVisible(false);
            }
        });
        
        // 生命值减少时的闪烁效果
        if (lives < this.gameState.gameData.lives) {
            this.scene.cameras.main.flash(200, 255, 0, 0, false);
        }
    }
    
    /**
     * 更新血条
     * @param {number} health - 当前血量
     * @param {number} maxHealth - 最大血量
     */
    updateHealth(health, maxHealth) {
        const progress = health / maxHealth;
        this.healthBar.updateProgress(progress);
        
        // 根据血量改变颜色
        let color;
        if (progress > 0.6) {
            color = 0x00ff00; // 绿色
        } else if (progress > 0.3) {
            color = 0xffff00; // 黄色
        } else {
            color = 0xff0000; // 红色
        }
        
        this.healthBar.setFillColor(color);
        
        // 血量低时的警告效果
        if (progress <= 0.2) {
            this.scene.tweens.add({
                targets: this.healthBar,
                alpha: 0.5,
                duration: 300,
                yoyo: true,
                repeat: -1
            });
        } else {
            this.scene.tweens.killTweensOf(this.healthBar);
            this.healthBar.setAlpha(1);
        }
    }
    
    /**
     * 更新金币显示
     * @param {number} coins - 金币数量
     */
    updateCoins(coins) {
        this.ui.updateText('coinsValue', coins.toString());
    }
    
    /**
     * 更新能量条
     * @param {number} energy - 能量值 (0-1)
     */
    updateEnergy(energy) {
        if (this.energyBar) {
            this.energyBar.updateProgress(energy);
        }
    }
    
    /**
     * 显示升级效果
     */
    showLevelUpEffect() {
        const { width, height } = this.scene.cameras.main;
        
        // 创建升级文本
        const levelUpText = this.scene.add.text(width/2, height/2, 'LEVEL UP!', {
            fontSize: '48px',
            fontFamily: 'Arial',
            color: '#ffff00',
            stroke: '#000000',
            strokeThickness: 4
        }).setOrigin(0.5).setScrollFactor(0);
        
        // 升级动画
        this.scene.tweens.add({
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
        
        // 屏幕闪光效果
        this.scene.cameras.main.flash(500, 255, 255, 0, false);
    }
    
    /**
     * 显示成就通知
     * @param {object} achievement - 成就对象
     */
    showAchievementNotification(achievement) {
        const { width } = this.scene.cameras.main;
        
        // 创建通知面板
        const notification = this.scene.add.container(width + 200, 100);
        notification.setScrollFactor(0);
        
        const bg = this.scene.add.rectangle(0, 0, 250, 80, 0x333333, 0.9);
        bg.setStrokeStyle(2, 0xffff00);
        
        const title = this.scene.add.text(0, -15, 'Achievement Unlocked!', {
            fontSize: '14px',
            color: '#ffff00',
            fontStyle: 'bold'
        }).setOrigin(0.5);
        
        const name = this.scene.add.text(0, 5, achievement.name, {
            fontSize: '16px',
            color: '#ffffff',
            fontStyle: 'bold'
        }).setOrigin(0.5);
        
        const desc = this.scene.add.text(0, 25, achievement.description, {
            fontSize: '12px',
            color: '#cccccc'
        }).setOrigin(0.5);
        
        notification.add([bg, title, name, desc]);
        
        // 滑入动画
        this.scene.tweens.add({
            targets: notification,
            x: width - 150,
            duration: 500,
            ease: 'Back.easeOut'
        });
        
        // 自动消失
        this.scene.time.delayedCall(3000, () => {
            this.scene.tweens.add({
                targets: notification,
                x: width + 200,
                duration: 500,
                ease: 'Back.easeIn',
                onComplete: () => {
                    notification.destroy();
                }
            });
        });
    }
    
    /**
     * 暂停游戏
     */
    pauseGame() {
        this.gameState.setState('paused');
        this.scene.scene.pause();
        this.scene.scene.launch('PauseScene');
    }
    
    /**
     * 设置HUD可见性
     * @param {boolean} visible - 是否可见
     */
    setVisible(visible) {
        this.isVisible = visible;
        
        Object.values(this.ui.elements).forEach(element => {
            element.setVisible(visible);
        });
        
        if (this.livesContainer) {
            this.livesContainer.setVisible(visible);
        }
        
        if (this.miniMapContainer) {
            this.miniMapContainer.setVisible(visible);
        }
    }
    
    /**
     * 销毁HUD
     */
    destroy() {
        if (this.livesContainer) {
            this.livesContainer.destroy();
        }
        
        if (this.miniMapContainer) {
            this.miniMapContainer.destroy();
        }
        
        this.ui.destroy();
    }
}
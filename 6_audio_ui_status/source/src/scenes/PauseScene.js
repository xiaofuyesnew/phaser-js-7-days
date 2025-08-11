import { UIManager } from '../managers/UIManager.js';

/**
 * 暂停场景
 */
export class PauseScene extends Phaser.Scene {
    constructor() {
        super({ key: 'PauseScene' });
    }
    
    create() {
        // 初始化UI管理器
        this.ui = new UIManager(this);
        
        // 创建暂停界面
        this.createPauseMenu();
        
        // 设置输入监听
        this.setupInput();
        
        // 入场动画
        this.showPauseMenu();
    }
    
    /**
     * 创建暂停菜单
     */
    createPauseMenu() {
        const { width, height } = this.cameras.main;
        
        // 创建半透明遮罩
        this.overlay = this.add.rectangle(width/2, height/2, width, height, 0x000000, 0.7);
        this.overlay.setInteractive();
        
        // 创建菜单容器
        this.menuContainer = this.ui.createContainer('pauseMenu', width/2, height/2);
        
        // 菜单背景
        const menuBg = this.add.rectangle(0, 0, 400, 500, 0x333333, 0.95);
        menuBg.setStrokeStyle(3, 0x666666);
        this.menuContainer.add(menuBg);
        
        // 暂停标题
        const title = this.ui.createText('pauseTitle', 0, -180, 'GAME PAUSED', {
            fontSize: '32px',
            fontFamily: 'Arial',
            color: '#ffffff',
            fontStyle: 'bold'
        }).setOrigin(0.5);
        this.menuContainer.add(title);
        
        // 菜单按钮
        const buttonSpacing = 60;
        let buttonY = -80;
        
        // 继续游戏按钮
        const resumeBtn = this.ui.createButton('resumeBtn', 0, buttonY, 'Resume Game', 
            this.resumeGame, this, {
                fontSize: '20px',
                backgroundColor: '#4CAF50',
                padding: { x: 25, y: 12 }
            });
        this.menuContainer.add(resumeBtn);
        
        // 设置按钮
        buttonY += buttonSpacing;
        const settingsBtn = this.ui.createButton('settingsBtn', 0, buttonY, 'Settings', 
            this.openSettings, this, {
                fontSize: '20px',
                backgroundColor: '#2196F3',
                padding: { x: 25, y: 12 }
            });
        this.menuContainer.add(settingsBtn);
        
        // 重新开始按钮
        buttonY += buttonSpacing;
        const restartBtn = this.ui.createButton('restartBtn', 0, buttonY, 'Restart Game', 
            this.restartGame, this, {
                fontSize: '20px',
                backgroundColor: '#FF9800',
                padding: { x: 25, y: 12 }
            });
        this.menuContainer.add(restartBtn);
        
        // 返回主菜单按钮
        buttonY += buttonSpacing;
        const menuBtn = this.ui.createButton('menuBtn', 0, buttonY, 'Main Menu', 
            this.returnToMenu, this, {
                fontSize: '20px',
                backgroundColor: '#9C27B0',
                padding: { x: 25, y: 12 }
            });
        this.menuContainer.add(menuBtn);
        
        // 退出游戏按钮
        buttonY += buttonSpacing;
        const exitBtn = this.ui.createButton('exitBtn', 0, buttonY, 'Exit Game', 
            this.exitGame, this, {
                fontSize: '20px',
                backgroundColor: '#f44336',
                padding: { x: 25, y: 12 }
            });
        this.menuContainer.add(exitBtn);
        
        // 添加游戏统计信息
        this.addGameStats();
        
        // 添加控制提示
        this.addControlHints();
    }
    
    /**
     * 添加游戏统计信息
     */
    addGameStats() {
        const gameScene = this.scene.get('GameScene');
        if (gameScene && gameScene.gameState) {
            const gameData = gameScene.gameState.gameData;
            
            const statsY = 120;
            const statsSpacing = 25;
            
            // 当前分数
            const scoreText = this.ui.createText('scoreText', 0, statsY, 
                `Score: ${gameData.score}`, {
                    fontSize: '16px',
                    color: '#ffff00'
                }).setOrigin(0.5);
            this.menuContainer.add(scoreText);
            
            // 当前等级
            const levelText = this.ui.createText('levelText', 0, statsY + statsSpacing, 
                `Level: ${gameData.level}`, {
                    fontSize: '16px',
                    color: '#00ff00'
                }).setOrigin(0.5);
            this.menuContainer.add(levelText);
            
            // 生命值
            const livesText = this.ui.createText('livesText', 0, statsY + statsSpacing * 2, 
                `Lives: ${gameData.lives}`, {
                    fontSize: '16px',
                    color: '#ff6666'
                }).setOrigin(0.5);
            this.menuContainer.add(livesText);
            
            // 金币
            const coinsText = this.ui.createText('coinsText', 0, statsY + statsSpacing * 3, 
                `Coins: ${gameData.coins}`, {
                    fontSize: '16px',
                    color: '#ffd700'
                }).setOrigin(0.5);
            this.menuContainer.add(coinsText);
        }
    }
    
    /**
     * 添加控制提示
     */
    addControlHints() {
        const hintsY = 200;
        
        const hintsText = this.ui.createText('hintsText', 0, hintsY, 
            'Press ESC to resume\nArrow Keys or WASD to move\nSpace to jump', {
                fontSize: '14px',
                color: '#cccccc',
                align: 'center',
                lineSpacing: 5
            }).setOrigin(0.5);
        this.menuContainer.add(hintsText);
    }
    
    /**
     * 显示暂停菜单动画
     */
    showPauseMenu() {
        // 遮罩淡入
        this.overlay.setAlpha(0);
        this.tweens.add({
            targets: this.overlay,
            alpha: 0.7,
            duration: 300,
            ease: 'Power2'
        });
        
        // 菜单容器缩放入场
        this.menuContainer.setScale(0.8);
        this.menuContainer.setAlpha(0);
        
        this.tweens.add({
            targets: this.menuContainer,
            scaleX: 1,
            scaleY: 1,
            alpha: 1,
            duration: 400,
            ease: 'Back.easeOut'
        });
    }
    
    /**
     * 隐藏暂停菜单动画
     */
    hidePauseMenu(callback) {
        // 菜单容器缩放退场
        this.tweens.add({
            targets: this.menuContainer,
            scaleX: 0.8,
            scaleY: 0.8,
            alpha: 0,
            duration: 300,
            ease: 'Back.easeIn'
        });
        
        // 遮罩淡出
        this.tweens.add({
            targets: this.overlay,
            alpha: 0,
            duration: 300,
            ease: 'Power2',
            onComplete: callback
        });
    }
    
    /**
     * 设置输入监听
     */
    setupInput() {
        // ESC键继续游戏
        this.input.keyboard.on('keydown-ESC', () => {
            this.resumeGame();
        });
        
        // 回车键继续游戏
        this.input.keyboard.on('keydown-ENTER', () => {
            this.resumeGame();
        });
        
        // 点击遮罩继续游戏
        this.overlay.on('pointerdown', () => {
            this.resumeGame();
        });
        
        // 数字键快捷操作
        this.input.keyboard.on('keydown-ONE', () => {
            this.resumeGame();
        });
        
        this.input.keyboard.on('keydown-TWO', () => {
            this.openSettings();
        });
        
        this.input.keyboard.on('keydown-THREE', () => {
            this.restartGame();
        });
        
        this.input.keyboard.on('keydown-FOUR', () => {
            this.returnToMenu();
        });
    }
    
    /**
     * 继续游戏
     */
    resumeGame() {
        this.playButtonSound();
        
        this.hidePauseMenu(() => {
            this.scene.resume('GameScene');
            this.scene.stop();
        });
    }
    
    /**
     * 打开设置
     */
    openSettings() {
        this.playButtonSound();
        this.scene.launch('SettingsScene');
        this.scene.pause();
    }
    
    /**
     * 重新开始游戏
     */
    restartGame() {
        this.playButtonSound();
        
        // 创建确认对话框
        this.createConfirmDialog(
            'Restart Game?',
            'All progress will be lost. Are you sure?',
            () => {
                this.hidePauseMenu(() => {
                    this.scene.stop('GameScene');
                    this.scene.start('GameScene');
                    this.scene.stop();
                });
            }
        );
    }
    
    /**
     * 返回主菜单
     */
    returnToMenu() {
        this.playButtonSound();
        
        // 创建确认对话框
        this.createConfirmDialog(
            'Return to Menu?',
            'All progress will be lost. Are you sure?',
            () => {
                this.hidePauseMenu(() => {
                    this.scene.stop('GameScene');
                    this.scene.start('MenuScene');
                    this.scene.stop();
                });
            }
        );
    }
    
    /**
     * 退出游戏
     */
    exitGame() {
        this.playButtonSound();
        
        // 创建确认对话框
        this.createConfirmDialog(
            'Exit Game?',
            'All progress will be lost. Are you sure?',
            () => {
                // 在实际应用中，这里可能会关闭窗口
                console.log('Game would exit here');
            }
        );
    }
    
    /**
     * 创建确认对话框
     */
    createConfirmDialog(title, message, onConfirm) {
        const { width, height } = this.cameras.main;
        
        // 创建对话框遮罩
        const dialogOverlay = this.add.rectangle(width/2, height/2, width, height, 0x000000, 0.8);
        dialogOverlay.setInteractive();
        
        // 创建对话框容器
        const dialog = this.add.container(width/2, height/2);
        
        const dialogBg = this.add.rectangle(0, 0, 350, 180, 0x444444, 0.95);
        dialogBg.setStrokeStyle(3, 0x888888);
        
        const titleText = this.add.text(0, -50, title, {
            fontSize: '20px',
            color: '#ffffff',
            fontStyle: 'bold'
        }).setOrigin(0.5);
        
        const messageText = this.add.text(0, -10, message, {
            fontSize: '14px',
            color: '#cccccc',
            align: 'center',
            wordWrap: { width: 300 }
        }).setOrigin(0.5);
        
        const yesBtn = this.add.text(-70, 40, 'Yes', {
            fontSize: '16px',
            color: '#ffffff',
            backgroundColor: '#f44336',
            padding: { x: 20, y: 8 }
        }).setOrigin(0.5).setInteractive({ useHandCursor: true });
        
        const noBtn = this.add.text(70, 40, 'No', {
            fontSize: '16px',
            color: '#ffffff',
            backgroundColor: '#4CAF50',
            padding: { x: 20, y: 8 }
        }).setOrigin(0.5).setInteractive({ useHandCursor: true });
        
        dialog.add([dialogBg, titleText, messageText, yesBtn, noBtn]);
        
        // 按钮事件
        yesBtn.on('pointerdown', () => {
            dialogOverlay.destroy();
            dialog.destroy();
            onConfirm();
        });
        
        noBtn.on('pointerdown', () => {
            dialogOverlay.destroy();
            dialog.destroy();
        });
        
        // 点击遮罩关闭对话框
        dialogOverlay.on('pointerdown', () => {
            dialogOverlay.destroy();
            dialog.destroy();
        });
        
        // 入场动画
        dialog.setScale(0.8);
        dialog.setAlpha(0);
        
        this.tweens.add({
            targets: dialog,
            scaleX: 1,
            scaleY: 1,
            alpha: 1,
            duration: 300,
            ease: 'Back.easeOut'
        });
    }
    
    /**
     * 播放按钮音效
     */
    playButtonSound() {
        // 获取游戏场景的音频管理器
        const gameScene = this.scene.get('GameScene');
        if (gameScene && gameScene.audioManager) {
            // gameScene.audioManager.playSound('buttonClick');
        }
        console.log('Button click sound would play here');
    }
    
    /**
     * 场景恢复时调用
     */
    resume() {
        // 从设置场景返回时的处理
        console.log('Pause scene resumed');
    }
    
    /**
     * 销毁场景
     */
    destroy() {
        if (this.ui) {
            this.ui.destroy();
        }
    }
}
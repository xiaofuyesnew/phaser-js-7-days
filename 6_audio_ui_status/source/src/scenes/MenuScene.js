import { UIManager } from '../managers/UIManager.js';
import { AudioManager } from '../managers/AudioManager.js';

/**
 * 主菜单场景
 */
export class MenuScene extends Phaser.Scene {
    constructor() {
        super({ key: 'MenuScene' });
    }
    
    preload() {
        // 加载菜单资源
        this.loadMenuAssets();
    }
    
    create() {
        // 初始化管理器
        this.ui = new UIManager(this);
        this.audioManager = new AudioManager(this);
        
        // 创建背景
        this.createBackground();
        
        // 创建菜单界面
        this.createMenu();
        
        // 播放菜单音乐
        this.playMenuMusic();
        
        // 设置输入监听
        this.setupInput();
    }
    
    /**
     * 加载菜单资源
     */
    loadMenuAssets() {
        // 创建简单的颜色纹理作为按钮背景
        this.load.image('menuBg', 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==');
        
        // 加载音频（如果有的话）
        // this.load.audio('menuMusic', ['assets/audio/menu.mp3']);
        // this.load.audio('buttonClick', ['assets/audio/click.wav']);
    }
    
    /**
     * 创建背景
     */
    createBackground() {
        const { width, height } = this.cameras.main;
        
        // 创建渐变背景
        const graphics = this.add.graphics();
        graphics.fillGradientStyle(0x1a1a2e, 0x16213e, 0x0f3460, 0x533483, 1);
        graphics.fillRect(0, 0, width, height);
        
        // 添加装饰性粒子效果
        this.createParticleEffect();
        
        // 添加标题背景光效
        this.createTitleGlow();
    }
    
    /**
     * 创建粒子效果
     */
    createParticleEffect() {
        const { width, height } = this.cameras.main;
        
        // 创建星星粒子
        for (let i = 0; i < 50; i++) {
            const star = this.add.circle(
                Phaser.Math.Between(0, width),
                Phaser.Math.Between(0, height),
                Phaser.Math.Between(1, 3),
                0xffffff,
                Phaser.Math.FloatBetween(0.3, 0.8)
            );
            
            // 添加闪烁动画
            this.tweens.add({
                targets: star,
                alpha: 0.1,
                duration: Phaser.Math.Between(1000, 3000),
                yoyo: true,
                repeat: -1,
                ease: 'Sine.easeInOut'
            });
        }
    }
    
    /**
     * 创建标题光效
     */
    createTitleGlow() {
        const { width } = this.cameras.main;
        
        const glow = this.add.circle(width/2, 150, 100, 0xffffff, 0.1);
        
        this.tweens.add({
            targets: glow,
            scaleX: 1.5,
            scaleY: 1.5,
            alpha: 0.05,
            duration: 2000,
            yoyo: true,
            repeat: -1,
            ease: 'Sine.easeInOut'
        });
    }
    
    /**
     * 创建菜单界面
     */
    createMenu() {
        const { width, height } = this.cameras.main;
        
        // 游戏标题
        this.ui.createText('title', width/2, 150, 'PHASER GAME', {
            fontSize: '48px',
            fontFamily: 'Arial',
            color: '#ffffff',
            stroke: '#333333',
            strokeThickness: 4,
            shadow: {
                offsetX: 2,
                offsetY: 2,
                color: '#000000',
                blur: 5,
                fill: true
            }
        }).setOrigin(0.5);
        
        // 副标题
        this.ui.createText('subtitle', width/2, 200, 'Audio, UI & State Management Demo', {
            fontSize: '18px',
            fontFamily: 'Arial',
            color: '#cccccc',
            fontStyle: 'italic'
        }).setOrigin(0.5);
        
        // 主菜单按钮
        const buttonY = 260;
        const buttonSpacing = 55;
        
        this.ui.createButton('startBtn', width/2, buttonY, 'Complete Game Demo', 
            this.startCompleteDemo, this, {
                fontSize: '20px',
                backgroundColor: '#4CAF50',
                padding: { x: 25, y: 12 }
            });
        
        this.ui.createButton('exercisesBtn', width/2, buttonY + buttonSpacing, 'Practice Exercises', 
            this.openExercises, this, {
                fontSize: '20px',
                backgroundColor: '#9C27B0',
                padding: { x: 25, y: 12 }
            });
        
        this.ui.createButton('settingsBtn', width/2, buttonY + buttonSpacing * 2, 'Settings', 
            this.openSettings, this, {
                fontSize: '20px',
                backgroundColor: '#2196F3',
                padding: { x: 25, y: 12 }
            });
        
        this.ui.createButton('creditsBtn', width/2, buttonY + buttonSpacing * 3, 'Credits', 
            this.openCredits, this, {
                fontSize: '20px',
                backgroundColor: '#FF9800',
                padding: { x: 25, y: 12 }
            });
        
        this.ui.createButton('exitBtn', width/2, buttonY + buttonSpacing * 4, 'Exit', 
            this.exitGame, this, {
                fontSize: '18px',
                backgroundColor: '#f44336',
                padding: { x: 20, y: 10 }
            });
        
        // 版本信息
        this.ui.createText('version', width - 20, height - 20, 'v1.0.0', {
            fontSize: '14px',
            color: '#666666'
        }).setOrigin(1);
        
        // 添加按钮入场动画
        this.animateMenuButtons();
    }
    
    /**
     * 菜单按钮入场动画
     */
    animateMenuButtons() {
        const buttons = ['startBtn', 'settingsBtn', 'creditsBtn', 'exitBtn'];
        
        buttons.forEach((buttonKey, index) => {
            const button = this.ui.elements[buttonKey];
            if (button) {
                // 初始状态
                button.setAlpha(0);
                button.setScale(0.8);
                
                // 入场动画
                this.tweens.add({
                    targets: button,
                    alpha: 1,
                    scaleX: 1,
                    scaleY: 1,
                    duration: 500,
                    delay: index * 100,
                    ease: 'Back.easeOut'
                });
            }
        });
    }
    
    /**
     * 播放菜单音乐
     */
    playMenuMusic() {
        // 如果有菜单音乐资源，在这里播放
        // this.audioManager.addSound('menuMusic', { loop: true, volume: 0.3 });
        // this.audioManager.playMusic('menuMusic');
        
        console.log('Menu music would play here');
    }
    
    /**
     * 设置输入监听
     */
    setupInput() {
        // 键盘快捷键
        this.input.keyboard.on('keydown-ENTER', () => {
            this.startGame();
        });
        
        this.input.keyboard.on('keydown-ESC', () => {
            this.exitGame();
        });
        
        // 鼠标悬停效果
        this.input.on('pointermove', (pointer) => {
            // 可以添加鼠标跟随效果
        });
    }
    
    /**
     * 开始完整游戏演示
     */
    startCompleteDemo() {
        this.playButtonSound();
        
        // 添加场景切换动画
        this.cameras.main.fadeOut(500, 0, 0, 0);
        
        this.cameras.main.once('camerafadeoutcomplete', () => {
            this.scene.start('CompleteGameDemo');
        });
    }
    
    /**
     * 打开练习菜单
     */
    openExercises() {
        this.playButtonSound();
        this.createExerciseMenu();
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
     * 打开制作人员名单
     */
    openCredits() {
        this.playButtonSound();
        this.scene.launch('CreditsScene');
        this.scene.pause();
    }
    
    /**
     * 退出游戏
     */
    exitGame() {
        this.playButtonSound();
        
        // 创建确认对话框
        this.createExitConfirmDialog();
    }
    
    /**
     * 创建退出确认对话框
     */
    createExitConfirmDialog() {
        const { width, height } = this.cameras.main;
        
        // 创建遮罩
        const overlay = this.add.rectangle(width/2, height/2, width, height, 0x000000, 0.7);
        overlay.setInteractive();
        
        // 创建对话框
        const dialog = this.add.container(width/2, height/2);
        
        const dialogBg = this.add.rectangle(0, 0, 400, 200, 0x333333, 0.95);
        dialogBg.setStrokeStyle(3, 0x666666);
        
        const title = this.add.text(0, -50, 'Exit Game?', {
            fontSize: '24px',
            color: '#ffffff',
            fontStyle: 'bold'
        }).setOrigin(0.5);
        
        const message = this.add.text(0, -10, 'Are you sure you want to exit?', {
            fontSize: '16px',
            color: '#cccccc'
        }).setOrigin(0.5);
        
        const yesBtn = this.add.text(-80, 40, 'Yes', {
            fontSize: '18px',
            color: '#ffffff',
            backgroundColor: '#f44336',
            padding: { x: 20, y: 10 }
        }).setOrigin(0.5).setInteractive({ useHandCursor: true });
        
        const noBtn = this.add.text(80, 40, 'No', {
            fontSize: '18px',
            color: '#ffffff',
            backgroundColor: '#4CAF50',
            padding: { x: 20, y: 10 }
        }).setOrigin(0.5).setInteractive({ useHandCursor: true });
        
        dialog.add([dialogBg, title, message, yesBtn, noBtn]);
        
        // 按钮事件
        yesBtn.on('pointerdown', () => {
            // 在实际应用中，这里可能会关闭窗口或返回到启动器
            console.log('Game would exit here');
            overlay.destroy();
            dialog.destroy();
        });
        
        noBtn.on('pointerdown', () => {
            overlay.destroy();
            dialog.destroy();
        });
        
        // 点击遮罩关闭对话框
        overlay.on('pointerdown', () => {
            overlay.destroy();
            dialog.destroy();
        });
    }
    
    /**
     * 创建练习菜单
     */
    createExerciseMenu() {
        const { width, height } = this.cameras.main;
        
        // 创建遮罩
        const overlay = this.add.rectangle(width/2, height/2, width, height, 0x000000, 0.8);
        overlay.setInteractive();
        
        // 创建练习菜单容器
        const exerciseMenu = this.add.container(width/2, height/2);
        
        const menuBg = this.add.rectangle(0, 0, 500, 400, 0x333333, 0.95);
        menuBg.setStrokeStyle(3, 0x666666);
        
        const title = this.add.text(0, -160, 'Practice Exercises', {
            fontSize: '24px',
            color: '#ffffff',
            fontStyle: 'bold'
        }).setOrigin(0.5);
        
        // 练习按钮
        const exercises = [
            { name: 'Exercise 1: Audio System', scene: 'AudioSystemExercise', color: '#4CAF50' },
            { name: 'Exercise 2: UI Design', scene: 'UIDesignExercise', color: '#2196F3' },
            { name: 'Exercise 3: State Management', scene: 'StateManagementExercise', color: '#FF9800' }
        ];
        
        exercises.forEach((exercise, index) => {
            const y = -80 + index * 60;
            
            const exerciseBtn = this.add.text(0, y, exercise.name, {
                fontSize: '16px',
                color: '#ffffff',
                backgroundColor: exercise.color,
                padding: { x: 20, y: 10 }
            }).setOrigin(0.5)
            .setInteractive({ useHandCursor: true })
            .on('pointerdown', () => {
                this.playButtonSound();
                overlay.destroy();
                exerciseMenu.destroy();
                
                this.cameras.main.fadeOut(500, 0, 0, 0);
                this.cameras.main.once('camerafadeoutcomplete', () => {
                    this.scene.start(exercise.scene);
                });
            })
            .on('pointerover', () => {
                exerciseBtn.setStyle({ backgroundColor: '#555555' });
            })
            .on('pointerout', () => {
                exerciseBtn.setStyle({ backgroundColor: exercise.color });
            });
            
            exerciseMenu.add(exerciseBtn);
        });
        
        // 关闭按钮
        const closeBtn = this.add.text(0, 120, 'Close', {
            fontSize: '16px',
            color: '#ffffff',
            backgroundColor: '#666666',
            padding: { x: 15, y: 8 }
        }).setOrigin(0.5)
        .setInteractive({ useHandCursor: true })
        .on('pointerdown', () => {
            overlay.destroy();
            exerciseMenu.destroy();
        });
        
        exerciseMenu.add([menuBg, title, closeBtn]);
        
        // 点击遮罩关闭
        overlay.on('pointerdown', () => {
            overlay.destroy();
            exerciseMenu.destroy();
        });
        
        // 入场动画
        exerciseMenu.setScale(0.8);
        exerciseMenu.setAlpha(0);
        
        this.tweens.add({
            targets: exerciseMenu,
            scaleX: 1,
            scaleY: 1,
            alpha: 1,
            duration: 400,
            ease: 'Back.easeOut'
        });
    }
    
    /**
     * 播放按钮音效
     */
    playButtonSound() {
        // this.audioManager.playSound('buttonClick');
        console.log('Button click sound would play here');
    }
    
    /**
     * 场景恢复时调用
     */
    resume() {
        // 从设置或其他场景返回时的处理
        console.log('Menu scene resumed');
    }
    
    /**
     * 销毁场景
     */
    destroy() {
        if (this.audioManager) {
            this.audioManager.destroy();
        }
        
        if (this.ui) {
            this.ui.destroy();
        }
    }
}
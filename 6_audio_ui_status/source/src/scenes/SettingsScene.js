import { UIManager } from '../managers/UIManager.js';

/**
 * 设置场景
 */
export class SettingsScene extends Phaser.Scene {
    constructor() {
        super({ key: 'SettingsScene' });
    }
    
    init() {
        // 获取游戏状态管理器
        const gameScene = this.scene.get('GameScene');
        this.gameState = gameScene ? gameScene.gameState : null;
        this.audioManager = gameScene ? gameScene.audioManager : null;
        
        // 临时设置（用于预览）
        this.tempSettings = this.gameState ? { ...this.gameState.settings } : {
            musicVolume: 0.5,
            sfxVolume: 0.7,
            isMuted: false,
            difficulty: 'normal',
            controls: 'keyboard',
            language: 'zh'
        };
    }
    
    create() {
        // 初始化UI管理器
        this.ui = new UIManager(this);
        
        // 创建设置界面
        this.createSettingsMenu();
        
        // 设置输入监听
        this.setupInput();
        
        // 入场动画
        this.showSettingsMenu();
    }
    
    /**
     * 创建设置菜单
     */
    createSettingsMenu() {
        const { width, height } = this.cameras.main;
        
        // 创建半透明遮罩
        this.overlay = this.add.rectangle(width/2, height/2, width, height, 0x000000, 0.8);
        this.overlay.setInteractive();
        
        // 创建菜单容器
        this.menuContainer = this.ui.createContainer('settingsMenu', width/2, height/2);
        
        // 菜单背景
        const menuBg = this.add.rectangle(0, 0, 500, 600, 0x333333, 0.95);
        menuBg.setStrokeStyle(3, 0x666666);
        this.menuContainer.add(menuBg);
        
        // 设置标题
        const title = this.ui.createText('settingsTitle', 0, -260, 'SETTINGS', {
            fontSize: '32px',
            fontFamily: 'Arial',
            color: '#ffffff',
            fontStyle: 'bold'
        }).setOrigin(0.5);
        this.menuContainer.add(title);
        
        // 创建设置选项
        this.createAudioSettings();
        this.createGameplaySettings();
        this.createControlSettings();
        this.createLanguageSettings();
        
        // 创建底部按钮
        this.createBottomButtons();
    }
    
    /**
     * 创建音频设置
     */
    createAudioSettings() {
        let yPos = -200;
        const spacing = 50;
        
        // 音频设置标题
        const audioTitle = this.ui.createText('audioTitle', 0, yPos, 'Audio Settings', {
            fontSize: '20px',
            color: '#ffff00',
            fontStyle: 'bold'
        }).setOrigin(0.5);
        this.menuContainer.add(audioTitle);
        
        yPos += spacing;
        
        // 音乐音量
        const musicLabel = this.ui.createText('musicLabel', -150, yPos, 'Music Volume:', {
            fontSize: '16px',
            color: '#ffffff'
        }).setOrigin(0, 0.5);
        this.menuContainer.add(musicLabel);
        
        this.musicSlider = this.ui.createSlider('musicSlider', 50, yPos, 150, 
            this.tempSettings.musicVolume, (value) => {
                this.tempSettings.musicVolume = value;
                this.updateMusicVolumeDisplay(value);
                this.previewMusicVolume(value);
            });
        this.menuContainer.add(this.musicSlider);
        
        this.musicVolumeText = this.ui.createText('musicVolumeText', 150, yPos, 
            Math.round(this.tempSettings.musicVolume * 100) + '%', {
                fontSize: '14px',
                color: '#cccccc'
            }).setOrigin(0, 0.5);
        this.menuContainer.add(this.musicVolumeText);
        
        yPos += spacing;
        
        // 音效音量
        const sfxLabel = this.ui.createText('sfxLabel', -150, yPos, 'SFX Volume:', {
            fontSize: '16px',
            color: '#ffffff'
        }).setOrigin(0, 0.5);
        this.menuContainer.add(sfxLabel);
        
        this.sfxSlider = this.ui.createSlider('sfxSlider', 50, yPos, 150, 
            this.tempSettings.sfxVolume, (value) => {
                this.tempSettings.sfxVolume = value;
                this.updateSFXVolumeDisplay(value);
                this.previewSFXVolume(value);
            });
        this.menuContainer.add(this.sfxSlider);
        
        this.sfxVolumeText = this.ui.createText('sfxVolumeText', 150, yPos, 
            Math.round(this.tempSettings.sfxVolume * 100) + '%', {
                fontSize: '14px',
                color: '#cccccc'
            }).setOrigin(0, 0.5);
        this.menuContainer.add(this.sfxVolumeText);
        
        yPos += spacing;
        
        // 静音开关
        const muteLabel = this.ui.createText('muteLabel', -150, yPos, 'Mute All:', {
            fontSize: '16px',
            color: '#ffffff'
        }).setOrigin(0, 0.5);
        this.menuContainer.add(muteLabel);
        
        this.muteButton = this.ui.createButton('muteButton', 50, yPos, 
            this.tempSettings.isMuted ? 'ON' : 'OFF',
            this.toggleMute, this, {
                fontSize: '14px',
                backgroundColor: this.tempSettings.isMuted ? '#f44336' : '#4CAF50',
                padding: { x: 15, y: 8 }
            });
        this.menuContainer.add(this.muteButton);
    }
    
    /**
     * 创建游戏设置
     */
    createGameplaySettings() {
        let yPos = -50;
        const spacing = 50;
        
        // 游戏设置标题
        const gameplayTitle = this.ui.createText('gameplayTitle', 0, yPos, 'Gameplay Settings', {
            fontSize: '20px',
            color: '#ffff00',
            fontStyle: 'bold'
        }).setOrigin(0.5);
        this.menuContainer.add(gameplayTitle);
        
        yPos += spacing;
        
        // 难度设置
        const difficultyLabel = this.ui.createText('difficultyLabel', -150, yPos, 'Difficulty:', {
            fontSize: '16px',
            color: '#ffffff'
        }).setOrigin(0, 0.5);
        this.menuContainer.add(difficultyLabel);
        
        const difficulties = ['easy', 'normal', 'hard'];
        const difficultyNames = ['Easy', 'Normal', 'Hard'];
        
        difficulties.forEach((difficulty, index) => {
            const isSelected = this.tempSettings.difficulty === difficulty;
            const button = this.ui.createButton(`difficulty_${difficulty}`, 
                -50 + index * 70, yPos, difficultyNames[index],
                () => this.setDifficulty(difficulty), this, {
                    fontSize: '14px',
                    backgroundColor: isSelected ? '#2196F3' : '#666666',
                    padding: { x: 12, y: 6 }
                });
            this.menuContainer.add(button);
        });
    }
    
    /**
     * 创建控制设置
     */
    createControlSettings() {
        let yPos = 50;
        const spacing = 50;
        
        // 控制设置标题
        const controlTitle = this.ui.createText('controlTitle', 0, yPos, 'Control Settings', {
            fontSize: '20px',
            color: '#ffff00',
            fontStyle: 'bold'
        }).setOrigin(0.5);
        this.menuContainer.add(controlTitle);
        
        yPos += spacing;
        
        // 控制方式
        const controlLabel = this.ui.createText('controlLabel', -150, yPos, 'Controls:', {
            fontSize: '16px',
            color: '#ffffff'
        }).setOrigin(0, 0.5);
        this.menuContainer.add(controlLabel);
        
        const controls = ['keyboard', 'gamepad'];
        const controlNames = ['Keyboard', 'Gamepad'];
        
        controls.forEach((control, index) => {
            const isSelected = this.tempSettings.controls === control;
            const button = this.ui.createButton(`control_${control}`, 
                -25 + index * 100, yPos, controlNames[index],
                () => this.setControls(control), this, {
                    fontSize: '14px',
                    backgroundColor: isSelected ? '#2196F3' : '#666666',
                    padding: { x: 15, y: 8 }
                });
            this.menuContainer.add(button);
        });
        
        yPos += spacing;
        
        // 控制说明
        const controlHints = this.ui.createText('controlHints', 0, yPos, 
            'Arrow Keys / WASD: Move\nSpace: Jump\nESC: Pause', {
                fontSize: '12px',
                color: '#cccccc',
                align: 'center',
                lineSpacing: 3
            }).setOrigin(0.5);
        this.menuContainer.add(controlHints);
    }
    
    /**
     * 创建语言设置
     */
    createLanguageSettings() {
        let yPos = 180;
        
        // 语言设置标题
        const languageTitle = this.ui.createText('languageTitle', 0, yPos, 'Language Settings', {
            fontSize: '20px',
            color: '#ffff00',
            fontStyle: 'bold'
        }).setOrigin(0.5);
        this.menuContainer.add(languageTitle);
        
        yPos += 50;
        
        // 语言选择
        const languageLabel = this.ui.createText('languageLabel', -150, yPos, 'Language:', {
            fontSize: '16px',
            color: '#ffffff'
        }).setOrigin(0, 0.5);
        this.menuContainer.add(languageLabel);
        
        const languages = ['zh', 'en'];
        const languageNames = ['中文', 'English'];
        
        languages.forEach((lang, index) => {
            const isSelected = this.tempSettings.language === lang;
            const button = this.ui.createButton(`language_${lang}`, 
                -25 + index * 100, yPos, languageNames[index],
                () => this.setLanguage(lang), this, {
                    fontSize: '14px',
                    backgroundColor: isSelected ? '#2196F3' : '#666666',
                    padding: { x: 15, y: 8 }
                });
            this.menuContainer.add(button);
        });
    }
    
    /**
     * 创建底部按钮
     */
    createBottomButtons() {
        const yPos = 250;
        
        // 应用按钮
        const applyBtn = this.ui.createButton('applyBtn', -80, yPos, 'Apply', 
            this.applySettings, this, {
                fontSize: '18px',
                backgroundColor: '#4CAF50',
                padding: { x: 20, y: 10 }
            });
        this.menuContainer.add(applyBtn);
        
        // 取消按钮
        const cancelBtn = this.ui.createButton('cancelBtn', 0, yPos, 'Cancel', 
            this.cancelSettings, this, {
                fontSize: '18px',
                backgroundColor: '#f44336',
                padding: { x: 20, y: 10 }
            });
        this.menuContainer.add(cancelBtn);
        
        // 重置按钮
        const resetBtn = this.ui.createButton('resetBtn', 80, yPos, 'Reset', 
            this.resetSettings, this, {
                fontSize: '18px',
                backgroundColor: '#FF9800',
                padding: { x: 20, y: 10 }
            });
        this.menuContainer.add(resetBtn);
    }
    
    /**
     * 显示设置菜单动画
     */
    showSettingsMenu() {
        // 遮罩淡入
        this.overlay.setAlpha(0);
        this.tweens.add({
            targets: this.overlay,
            alpha: 0.8,
            duration: 300,
            ease: 'Power2'
        });
        
        // 菜单容器滑入
        this.menuContainer.setX(this.cameras.main.width + 250);
        
        this.tweens.add({
            targets: this.menuContainer,
            x: this.cameras.main.width / 2,
            duration: 400,
            ease: 'Back.easeOut'
        });
    }
    
    /**
     * 隐藏设置菜单动画
     */
    hideSettingsMenu(callback) {
        // 菜单容器滑出
        this.tweens.add({
            targets: this.menuContainer,
            x: this.cameras.main.width + 250,
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
        // ESC键关闭设置
        this.input.keyboard.on('keydown-ESC', () => {
            this.cancelSettings();
        });
        
        // 回车键应用设置
        this.input.keyboard.on('keydown-ENTER', () => {
            this.applySettings();
        });
    }
    
    /**
     * 更新音乐音量显示
     */
    updateMusicVolumeDisplay(value) {
        this.musicVolumeText.setText(Math.round(value * 100) + '%');
    }
    
    /**
     * 更新音效音量显示
     */
    updateSFXVolumeDisplay(value) {
        this.sfxVolumeText.setText(Math.round(value * 100) + '%');
    }
    
    /**
     * 预览音乐音量
     */
    previewMusicVolume(value) {
        if (this.audioManager) {
            this.audioManager.setMusicVolume(value);
        }
    }
    
    /**
     * 预览音效音量
     */
    previewSFXVolume(value) {
        if (this.audioManager) {
            this.audioManager.setSFXVolume(value);
            // 播放测试音效
            // this.audioManager.playSound('buttonClick');
        }
    }
    
    /**
     * 切换静音
     */
    toggleMute() {
        this.tempSettings.isMuted = !this.tempSettings.isMuted;
        
        // 更新按钮显示
        const button = this.ui.elements['muteButton'];
        if (button) {
            button.setText(this.tempSettings.isMuted ? 'ON' : 'OFF');
            button.setStyle({
                backgroundColor: this.tempSettings.isMuted ? '#f44336' : '#4CAF50'
            });
        }
        
        // 预览静音效果
        if (this.audioManager) {
            if (this.tempSettings.isMuted) {
                this.audioManager.toggleMute();
            }
        }
    }
    
    /**
     * 设置难度
     */
    setDifficulty(difficulty) {
        this.tempSettings.difficulty = difficulty;
        
        // 更新按钮显示
        const difficulties = ['easy', 'normal', 'hard'];
        difficulties.forEach(diff => {
            const button = this.ui.elements[`difficulty_${diff}`];
            if (button) {
                button.setStyle({
                    backgroundColor: diff === difficulty ? '#2196F3' : '#666666'
                });
            }
        });
    }
    
    /**
     * 设置控制方式
     */
    setControls(controls) {
        this.tempSettings.controls = controls;
        
        // 更新按钮显示
        const controlTypes = ['keyboard', 'gamepad'];
        controlTypes.forEach(control => {
            const button = this.ui.elements[`control_${control}`];
            if (button) {
                button.setStyle({
                    backgroundColor: control === controls ? '#2196F3' : '#666666'
                });
            }
        });
    }
    
    /**
     * 设置语言
     */
    setLanguage(language) {
        this.tempSettings.language = language;
        
        // 更新按钮显示
        const languages = ['zh', 'en'];
        languages.forEach(lang => {
            const button = this.ui.elements[`language_${lang}`];
            if (button) {
                button.setStyle({
                    backgroundColor: lang === language ? '#2196F3' : '#666666'
                });
            }
        });
    }
    
    /**
     * 应用设置
     */
    applySettings() {
        if (this.gameState) {
            // 保存设置到游戏状态
            this.gameState.settings = { ...this.tempSettings };
            this.gameState.saveData();
            
            // 应用音频设置
            if (this.audioManager) {
                this.audioManager.setMusicVolume(this.tempSettings.musicVolume);
                this.audioManager.setSFXVolume(this.tempSettings.sfxVolume);
                
                if (this.tempSettings.isMuted !== this.audioManager.isMuted) {
                    this.audioManager.toggleMute();
                }
            }
        }
        
        console.log('Settings applied:', this.tempSettings);
        this.closeSettings();
    }
    
    /**
     * 取消设置
     */
    cancelSettings() {
        // 恢复原始设置
        if (this.gameState && this.audioManager) {
            this.audioManager.setMusicVolume(this.gameState.settings.musicVolume);
            this.audioManager.setSFXVolume(this.gameState.settings.sfxVolume);
            
            if (this.gameState.settings.isMuted !== this.audioManager.isMuted) {
                this.audioManager.toggleMute();
            }
        }
        
        this.closeSettings();
    }
    
    /**
     * 重置设置
     */
    resetSettings() {
        // 创建确认对话框
        this.createConfirmDialog(
            'Reset Settings?',
            'This will reset all settings to default values.',
            () => {
                this.tempSettings = {
                    musicVolume: 0.5,
                    sfxVolume: 0.7,
                    isMuted: false,
                    difficulty: 'normal',
                    controls: 'keyboard',
                    language: 'zh'
                };
                
                // 重新创建设置界面
                this.menuContainer.destroy();
                this.createSettingsMenu();
            }
        );
    }
    
    /**
     * 创建确认对话框
     */
    createConfirmDialog(title, message, onConfirm) {
        const { width, height } = this.cameras.main;
        
        const dialogOverlay = this.add.rectangle(width/2, height/2, width, height, 0x000000, 0.5);
        dialogOverlay.setInteractive();
        
        const dialog = this.add.container(width/2, height/2);
        
        const dialogBg = this.add.rectangle(0, 0, 350, 150, 0x444444, 0.95);
        dialogBg.setStrokeStyle(2, 0x888888);
        
        const titleText = this.add.text(0, -40, title, {
            fontSize: '18px',
            color: '#ffffff',
            fontStyle: 'bold'
        }).setOrigin(0.5);
        
        const messageText = this.add.text(0, -5, message, {
            fontSize: '14px',
            color: '#cccccc',
            align: 'center',
            wordWrap: { width: 300 }
        }).setOrigin(0.5);
        
        const yesBtn = this.add.text(-60, 35, 'Yes', {
            fontSize: '14px',
            color: '#ffffff',
            backgroundColor: '#f44336',
            padding: { x: 15, y: 6 }
        }).setOrigin(0.5).setInteractive({ useHandCursor: true });
        
        const noBtn = this.add.text(60, 35, 'No', {
            fontSize: '14px',
            color: '#ffffff',
            backgroundColor: '#4CAF50',
            padding: { x: 15, y: 6 }
        }).setOrigin(0.5).setInteractive({ useHandCursor: true });
        
        dialog.add([dialogBg, titleText, messageText, yesBtn, noBtn]);
        
        yesBtn.on('pointerdown', () => {
            dialogOverlay.destroy();
            dialog.destroy();
            onConfirm();
        });
        
        noBtn.on('pointerdown', () => {
            dialogOverlay.destroy();
            dialog.destroy();
        });
    }
    
    /**
     * 关闭设置
     */
    closeSettings() {
        this.hideSettingsMenu(() => {
            // 恢复父场景
            const parentScene = this.scene.get('GameScene') || this.scene.get('MenuScene') || this.scene.get('PauseScene');
            if (parentScene) {
                this.scene.resume(parentScene.scene.key);
            }
            this.scene.stop();
        });
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
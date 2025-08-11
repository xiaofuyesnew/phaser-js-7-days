import { AudioManager } from '../managers/AudioManager.js';

/**
 * 练习1：音频系统实现
 * 
 * 学习目标：
 * - 理解音频加载和播放机制
 * - 实现音量控制和静音功能
 * - 创建音效池和管理系统
 * - 实现音频淡入淡出效果
 */
export class AudioSystemExercise extends Phaser.Scene {
    constructor() {
        super({ key: 'AudioSystemExercise' });
    }
    
    preload() {
        // 创建简单的音频数据（用于演示）
        this.createAudioData();
        
        // 在实际项目中，你会这样加载音频：
        // this.load.audio('bgMusic', ['assets/audio/background.mp3', 'assets/audio/background.ogg']);
        // this.load.audio('jump', 'assets/audio/jump.wav');
        // this.load.audio('collect', 'assets/audio/collect.wav');
        // this.load.audio('hurt', 'assets/audio/hurt.wav');
    }
    
    create() {
        this.audioManager = new AudioManager(this);
        
        // 创建练习界面
        this.createExerciseUI();
        
        // 设置音频（模拟）
        this.setupAudio();
        
        // 创建音频测试按钮
        this.createAudioTestButtons();
        
        // 创建音量控制
        this.createVolumeControls();
        
        // 创建高级音频功能演示
        this.createAdvancedAudioDemo();
    }
    
    /**
     * 创建音频数据（用于演示）
     */
    createAudioData() {
        // 在实际项目中，这些会是真实的音频文件
        console.log('在实际项目中，这里会加载真实的音频文件');
        console.log('例如：this.load.audio("bgMusic", ["assets/audio/bg.mp3"]);');
    }
    
    /**
     * 创建练习界面
     */
    createExerciseUI() {
        const { width, height } = this.cameras.main;
        
        // 标题
        this.add.text(width/2, 30, 'Exercise 1: Audio System', {
            fontSize: '24px',
            color: '#ffffff',
            fontStyle: 'bold'
        }).setOrigin(0.5);
        
        // 说明文本
        this.add.text(width/2, 70, 'Learn audio loading, playback, and management', {
            fontSize: '16px',
            color: '#cccccc'
        }).setOrigin(0.5);
        
        // 返回按钮
        this.add.text(50, height - 50, '← Back to Menu', {
            fontSize: '16px',
            color: '#00ff00',
            backgroundColor: '#333333',
            padding: { x: 10, y: 5 }
        }).setOrigin(0.5)
        .setInteractive({ useHandCursor: true })
        .on('pointerdown', () => {
            this.scene.start('MenuScene');
        });
    }
    
    /**
     * 设置音频
     */
    setupAudio() {
        // 模拟添加音频到管理器
        // 在实际项目中，这些音频会在preload中加载
        console.log('Setting up audio manager...');
        
        // 模拟音频配置
        this.audioConfig = {
            bgMusic: { loop: true, volume: 0.4 },
            jump: { volume: 0.6 },
            collect: { volume: 0.7 },
            hurt: { volume: 0.8 },
            explosion: { volume: 0.9 }
        };
        
        console.log('Audio configuration:', this.audioConfig);
    }
    
    /**
     * 创建音频测试按钮
     */
    createAudioTestButtons() {
        const { width } = this.cameras.main;
        let yPos = 120;
        const spacing = 60;
        
        // 音频测试区域标题
        this.add.text(width/2, yPos, 'Audio Playback Tests', {
            fontSize: '20px',
            color: '#ffff00',
            fontStyle: 'bold'
        }).setOrigin(0.5);
        
        yPos += 40;
        
        // 背景音乐控制
        this.createButton(width/2 - 150, yPos, 'Play Music', () => {
            console.log('🎵 Playing background music...');
            this.showAudioFeedback('Background music started');
            // this.audioManager.playMusic('bgMusic');
        });
        
        this.createButton(width/2, yPos, 'Stop Music', () => {
            console.log('🔇 Stopping background music...');
            this.showAudioFeedback('Background music stopped');
            // this.audioManager.stopMusic();
        });
        
        this.createButton(width/2 + 150, yPos, 'Fade Music', () => {
            console.log('🎶 Fading background music...');
            this.showAudioFeedback('Background music fading out');
            // this.audioManager.fadeOut('bgMusic', 2000);
        });
        
        yPos += spacing;
        
        // 音效测试
        const soundEffects = [
            { name: 'Jump', key: 'jump', color: '#00ff00' },
            { name: 'Collect', key: 'collect', color: '#ffd700' },
            { name: 'Hurt', key: 'hurt', color: '#ff6666' },
            { name: 'Explosion', key: 'explosion', color: '#ff4444' }
        ];
        
        soundEffects.forEach((sfx, index) => {
            const x = width/2 - 225 + (index * 150);
            this.createButton(x, yPos, sfx.name, () => {
                console.log(`🔊 Playing ${sfx.name} sound effect...`);
                this.showAudioFeedback(`${sfx.name} sound played`);
                this.createSoundVisualization(x, yPos, sfx.color);
                // this.audioManager.playSound(sfx.key);
            }, sfx.color);
        });
    }
    
    /**
     * 创建音量控制
     */
    createVolumeControls() {
        const { width } = this.cameras.main;
        let yPos = 280;
        
        // 音量控制标题
        this.add.text(width/2, yPos, 'Volume Controls', {
            fontSize: '20px',
            color: '#ffff00',
            fontStyle: 'bold'
        }).setOrigin(0.5);
        
        yPos += 40;
        
        // 音乐音量控制
        this.add.text(width/2 - 200, yPos, 'Music Volume:', {
            fontSize: '16px',
            color: '#ffffff'
        }).setOrigin(0, 0.5);
        
        this.musicVolumeSlider = this.createSlider(width/2 - 50, yPos, 150, 0.5, (value) => {
            console.log(`🎵 Music volume set to: ${Math.round(value * 100)}%`);
            this.musicVolumeText.setText(Math.round(value * 100) + '%');
            // this.audioManager.setMusicVolume(value);
        });
        
        this.musicVolumeText = this.add.text(width/2 + 120, yPos, '50%', {
            fontSize: '14px',
            color: '#cccccc'
        }).setOrigin(0, 0.5);
        
        yPos += 40;
        
        // 音效音量控制
        this.add.text(width/2 - 200, yPos, 'SFX Volume:', {
            fontSize: '16px',
            color: '#ffffff'
        }).setOrigin(0, 0.5);
        
        this.sfxVolumeSlider = this.createSlider(width/2 - 50, yPos, 150, 0.7, (value) => {
            console.log(`🔊 SFX volume set to: ${Math.round(value * 100)}%`);
            this.sfxVolumeText.setText(Math.round(value * 100) + '%');
            // this.audioManager.setSFXVolume(value);
        });
        
        this.sfxVolumeText = this.add.text(width/2 + 120, yPos, '70%', {
            fontSize: '14px',
            color: '#cccccc'
        }).setOrigin(0, 0.5);
        
        yPos += 50;
        
        // 静音按钮
        this.muteButton = this.createButton(width/2, yPos, 'Toggle Mute', () => {
            const isMuted = this.audioManager ? this.audioManager.toggleMute() : !this.isMuted;
            this.isMuted = isMuted;
            
            console.log(`🔇 Audio ${isMuted ? 'muted' : 'unmuted'}`);
            this.showAudioFeedback(`Audio ${isMuted ? 'muted' : 'unmuted'}`);
            
            this.muteButton.setStyle({
                backgroundColor: isMuted ? '#f44336' : '#4CAF50'
            });
        });
        
        this.isMuted = false;
    }
    
    /**
     * 创建高级音频功能演示
     */
    createAdvancedAudioDemo() {
        const { width, height } = this.cameras.main;
        let yPos = height - 200;
        
        // 高级功能标题
        this.add.text(width/2, yPos, 'Advanced Audio Features', {
            fontSize: '20px',
            color: '#ffff00',
            fontStyle: 'bold'
        }).setOrigin(0.5);
        
        yPos += 40;
        
        // 音频池演示
        this.createButton(width/2 - 200, yPos, 'Audio Pool Test', () => {
            console.log('🎯 Testing audio pool (multiple sounds)...');
            this.showAudioFeedback('Playing multiple sounds simultaneously');
            
            // 模拟同时播放多个音效
            for (let i = 0; i < 5; i++) {
                setTimeout(() => {
                    this.createSoundVisualization(
                        width/2 - 100 + (i * 50), 
                        yPos - 20, 
                        Phaser.Display.Color.HSVToRGB(i * 0.2, 1, 1).color
                    );
                    console.log(`🔊 Playing sound ${i + 1}/5`);
                }, i * 200);
            }
        });
        
        // 3D音效演示
        this.createButton(width/2, yPos, '3D Audio Demo', () => {
            console.log('🎧 Demonstrating 3D positional audio...');
            this.showAudioFeedback('3D positional audio effect');
            this.demonstrate3DAudio();
        });
        
        // 音频分析演示
        this.createButton(width/2 + 200, yPos, 'Audio Analysis', () => {
            console.log('📊 Demonstrating audio analysis...');
            this.showAudioFeedback('Audio frequency analysis');
            this.demonstrateAudioAnalysis();
        });
    }
    
    /**
     * 演示3D音效
     */
    demonstrate3DAudio() {
        const { width, height } = this.cameras.main;
        
        // 创建移动的音源可视化
        const soundSource = this.add.circle(100, height/2, 10, 0x00ff00);
        
        // 创建听者位置
        const listener = this.add.circle(width/2, height/2, 15, 0xff0000);
        this.add.text(width/2, height/2 + 30, 'Listener', {
            fontSize: '12px',
            color: '#ffffff'
        }).setOrigin(0.5);
        
        // 移动音源
        this.tweens.add({
            targets: soundSource,
            x: width - 100,
            duration: 3000,
            ease: 'Power2',
            onUpdate: () => {
                // 计算距离和方向
                const distance = Phaser.Math.Distance.Between(
                    soundSource.x, soundSource.y,
                    listener.x, listener.y
                );
                
                const maxDistance = width;
                const volume = Math.max(0, 1 - (distance / maxDistance));
                
                console.log(`3D Audio: Distance=${Math.round(distance)}, Volume=${volume.toFixed(2)}`);
            },
            onComplete: () => {
                soundSource.destroy();
                listener.destroy();
            }
        });
    }
    
    /**
     * 演示音频分析
     */
    demonstrateAudioAnalysis() {
        const { width } = this.cameras.main;
        
        // 创建频谱可视化
        const bars = [];
        const barCount = 32;
        const barWidth = (width - 200) / barCount;
        
        for (let i = 0; i < barCount; i++) {
            const bar = this.add.rectangle(
                100 + i * barWidth, 
                450, 
                barWidth - 2, 
                0, 
                Phaser.Display.Color.HSVToRGB(i / barCount, 1, 1).color
            );
            bar.setOrigin(0.5, 1);
            bars.push(bar);
        }
        
        // 模拟频谱数据
        const updateSpectrum = () => {
            bars.forEach((bar, index) => {
                const height = Math.random() * 100 + 10;
                bar.setSize(barWidth - 2, height);
            });
        };
        
        // 更新频谱显示
        const spectrumTimer = this.time.addEvent({
            delay: 50,
            callback: updateSpectrum,
            repeat: 60 // 3秒
        });
        
        // 清理
        this.time.delayedCall(3000, () => {
            bars.forEach(bar => bar.destroy());
        });
    }
    
    /**
     * 创建按钮
     */
    createButton(x, y, text, callback, color = '#2196F3') {
        const button = this.add.text(x, y, text, {
            fontSize: '14px',
            color: '#ffffff',
            backgroundColor: color,
            padding: { x: 15, y: 8 }
        }).setOrigin(0.5)
        .setInteractive({ useHandCursor: true })
        .on('pointerdown', callback)
        .on('pointerover', () => {
            button.setStyle({ backgroundColor: '#555555' });
        })
        .on('pointerout', () => {
            button.setStyle({ backgroundColor: color });
        });
        
        return button;
    }
    
    /**
     * 创建滑块
     */
    createSlider(x, y, width, initialValue, onChange) {
        const container = this.add.container(x, y);
        
        // 滑轨
        const track = this.add.rectangle(0, 0, width, 6, 0x666666);
        
        // 滑块
        const handle = this.add.circle(0, 0, 12, 0xffffff);
        handle.setStrokeStyle(2, 0x333333);
        handle.setInteractive({ draggable: true });
        
        // 设置初始位置
        const initialX = (initialValue - 0.5) * width;
        handle.x = Math.max(-width/2, Math.min(width/2, initialX));
        
        // 拖拽事件
        handle.on('drag', (pointer, dragX) => {
            const clampedX = Math.max(-width/2, Math.min(width/2, dragX));
            handle.x = clampedX;
            
            const value = (clampedX + width/2) / width;
            if (onChange) {
                onChange(value);
            }
        });
        
        container.add([track, handle]);
        return container;
    }
    
    /**
     * 显示音频反馈
     */
    showAudioFeedback(message) {
        const { width } = this.cameras.main;
        
        const feedback = this.add.text(width/2, 100, message, {
            fontSize: '16px',
            color: '#00ff00',
            backgroundColor: '#333333',
            padding: { x: 10, y: 5 }
        }).setOrigin(0.5);
        
        this.tweens.add({
            targets: feedback,
            alpha: 0,
            y: 80,
            duration: 2000,
            ease: 'Power2',
            onComplete: () => {
                feedback.destroy();
            }
        });
    }
    
    /**
     * 创建音效可视化
     */
    createSoundVisualization(x, y, color) {
        const rings = [];
        
        for (let i = 0; i < 3; i++) {
            const ring = this.add.circle(x, y, 5, color, 0);
            ring.setStrokeStyle(2, color);
            rings.push(ring);
            
            this.tweens.add({
                targets: ring,
                scaleX: 3 + i,
                scaleY: 3 + i,
                alpha: 0,
                duration: 800,
                delay: i * 100,
                ease: 'Power2',
                onComplete: () => {
                    ring.destroy();
                }
            });
        }
    }
}
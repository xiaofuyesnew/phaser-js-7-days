/**
 * 音频管理器
 * 统一管理游戏中的所有音频资源和播放控制
 */
export class AudioManager {
    constructor(scene) {
        this.scene = scene;
        this.sounds = {};
        this.musicVolume = 0.5;
        this.sfxVolume = 0.7;
        this.isMuted = false;
        this.currentMusic = null;
    }
    
    /**
     * 添加音频到管理器
     * @param {string} key - 音频键名
     * @param {object} config - 音频配置
     */
    addSound(key, config = {}) {
        this.sounds[key] = this.scene.sound.add(key, {
            volume: config.volume || (config.loop ? this.musicVolume : this.sfxVolume),
            loop: config.loop || false,
            ...config
        });
        return this.sounds[key];
    }
    
    /**
     * 播放音效
     * @param {string} key - 音效键名
     * @param {object} config - 播放配置
     */
    playSound(key, config = {}) {
        if (this.isMuted) return;
        
        const sound = this.sounds[key];
        if (sound && !sound.isPlaying) {
            sound.play({
                volume: this.sfxVolume,
                ...config
            });
        }
    }
    
    /**
     * 播放背景音乐
     * @param {string} key - 音乐键名
     * @param {object} config - 播放配置
     */
    playMusic(key, config = {}) {
        if (this.isMuted) return;
        
        // 停止当前音乐
        this.stopMusic();
        
        const music = this.sounds[key];
        if (music) {
            this.currentMusic = music;
            music.play({
                loop: true,
                volume: this.musicVolume,
                ...config
            });
        }
    }
    
    /**
     * 停止当前音乐
     */
    stopMusic() {
        if (this.currentMusic && this.currentMusic.isPlaying) {
            this.currentMusic.stop();
        }
        this.currentMusic = null;
    }
    
    /**
     * 停止所有音频
     */
    stopAll() {
        Object.values(this.sounds).forEach(sound => {
            if (sound.isPlaying) {
                sound.stop();
            }
        });
        this.currentMusic = null;
    }
    
    /**
     * 设置音乐音量
     * @param {number} volume - 音量值 (0-1)
     */
    setMusicVolume(volume) {
        this.musicVolume = Math.max(0, Math.min(1, volume));
        
        // 更新当前播放的音乐音量
        if (this.currentMusic && this.currentMusic.isPlaying) {
            this.currentMusic.setVolume(this.musicVolume);
        }
        
        // 更新所有循环音频的音量
        Object.values(this.sounds).forEach(sound => {
            if (sound.loop) {
                sound.setVolume(this.musicVolume);
            }
        });
    }
    
    /**
     * 设置音效音量
     * @param {number} volume - 音量值 (0-1)
     */
    setSFXVolume(volume) {
        this.sfxVolume = Math.max(0, Math.min(1, volume));
        
        // 更新所有非循环音频的音量
        Object.values(this.sounds).forEach(sound => {
            if (!sound.loop) {
                sound.setVolume(this.sfxVolume);
            }
        });
    }
    
    /**
     * 切换静音状态
     */
    toggleMute() {
        this.isMuted = !this.isMuted;
        
        if (this.isMuted) {
            this.scene.sound.pauseAll();
        } else {
            this.scene.sound.resumeAll();
        }
        
        return this.isMuted;
    }
    
    /**
     * 淡入音频
     * @param {string} key - 音频键名
     * @param {number} duration - 淡入时长(毫秒)
     */
    fadeIn(key, duration = 1000) {
        const sound = this.sounds[key];
        if (sound) {
            sound.setVolume(0);
            sound.play();
            
            this.scene.tweens.add({
                targets: sound,
                volume: sound.loop ? this.musicVolume : this.sfxVolume,
                duration: duration,
                ease: 'Power2'
            });
        }
    }
    
    /**
     * 淡出音频
     * @param {string} key - 音频键名
     * @param {number} duration - 淡出时长(毫秒)
     */
    fadeOut(key, duration = 1000) {
        const sound = this.sounds[key];
        if (sound && sound.isPlaying) {
            this.scene.tweens.add({
                targets: sound,
                volume: 0,
                duration: duration,
                ease: 'Power2',
                onComplete: () => {
                    sound.stop();
                    sound.setVolume(sound.loop ? this.musicVolume : this.sfxVolume);
                }
            });
        }
    }
    
    /**
     * 销毁音频管理器
     */
    destroy() {
        this.stopAll();
        Object.values(this.sounds).forEach(sound => {
            sound.destroy();
        });
        this.sounds = {};
        this.currentMusic = null;
    }
}
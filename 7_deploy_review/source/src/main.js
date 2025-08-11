import './style/index.css';
import { GameScene } from './scenes/GameScene.js';
import { CompleteGameDemo } from './examples/CompleteGameDemo.js';
import { errorHandler } from './utils/ErrorHandler.js';
import { logger, log } from './utils/Logger.js';

/**
 * 游戏主入口
 * 集成所有优化功能的完整示例
 */
class GameApplication {
    constructor() {
        this.game = null;
        this.config = null;
        
        this.init();
    }
    
    init() {
        log.info('Initializing Phaser Game with Optimizations', {
            version: __VERSION__,
            buildTime: __BUILD_TIME__,
            debugMode: __DEV__,
            type: 'initialization'
        });
        
        // 创建游戏配置
        this.createGameConfig();
        
        // 初始化游戏
        this.createGame();
        
        // 设置全局事件监听
        this.setupGlobalEvents();
        
        log.info('Game initialized successfully', { type: 'initialization' });
    }
    
    createGameConfig() {
        this.config = {
            type: Phaser.AUTO,
            width: 800,
            height: 600,
            parent: 'game',
            backgroundColor: '#2c3e50',
            
            // 物理引擎配置
            physics: {
                default: 'arcade',
                arcade: {
                    gravity: { y: 0 },
                    debug: __DEV__
                }
            },
            
            // 缩放配置
            scale: {
                mode: Phaser.Scale.RESIZE,
                autoCenter: Phaser.Scale.CENTER_BOTH,
                min: {
                    width: 400,
                    height: 300
                },
                max: {
                    width: 1600,
                    height: 1200
                }
            },
            
            // 渲染配置
            render: {
                antialias: true,
                pixelArt: false,
                roundPixels: false,
                transparent: false,
                clearBeforeRender: true,
                preserveDrawingBuffer: false,
                premultipliedAlpha: true,
                failIfMajorPerformanceCaveat: false,
                powerPreference: 'high-performance',
                batchSize: 4096,
                maxLights: 10
            },
            
            // 音频配置
            audio: {
                disableWebAudio: false,
                context: false,
                noAudio: false
            },
            
            // 输入配置
            input: {
                keyboard: true,
                mouse: true,
                touch: true,
                gamepad: false
            },
            
            // 场景配置
            scene: [CompleteGameDemo],
            
            // 回调函数
            callbacks: {
                preBoot: this.preBoot.bind(this),
                postBoot: this.postBoot.bind(this)
            }
        };
    }
    
    createGame() {
        try {
            this.game = new Phaser.Game(this.config);
            
            // 将游戏实例设为全局变量（用于调试）
            if (__DEV__) {
                window.game = this.game;
            }
            
        } catch (error) {
            console.error('Failed to create game:', error);
            this.showFallbackContent();
        }
    }
    
    preBoot(game) {
        log.debug('Game pre-boot starting', { type: 'lifecycle' });
        
        // 设置游戏属性
        game.registry.set('version', __VERSION__);
        game.registry.set('buildTime', __BUILD_TIME__);
        game.registry.set('debug', __DEV__);
        
        log.gameEvent('pre-boot-complete');
    }
    
    postBoot(game) {
        log.debug('Game post-boot starting', { type: 'lifecycle' });
        
        // 游戏启动完成后的初始化
        this.setupPerformanceMonitoring(game);
        this.setupErrorRecovery(game);
        
        // 隐藏加载屏幕
        this.hideLoadingScreen();
        
        log.gameEvent('post-boot-complete');
    }
    
    setupPerformanceMonitoring(game) {
        if (!__DEV__) return;
        
        // 监控游戏性能
        let lastTime = performance.now();
        let frameCount = 0;
        
        game.events.on('step', () => {
            frameCount++;
            
            if (frameCount % 60 === 0) { // 每60帧检查一次
                const currentTime = performance.now();
                const deltaTime = currentTime - lastTime;
                const fps = Math.round(60000 / deltaTime);
                
                if (fps < 30) {
                    console.warn(`⚠️ Low FPS detected: ${fps}`);
                }
                
                lastTime = currentTime;
            }
        });
    }
    
    setupErrorRecovery(game) {
        // 监听游戏错误
        game.events.on('error', (error) => {
            console.error('Game error:', error);
            
            // 尝试恢复
            this.attemptGameRecovery();
        });
        
        // 监听WebGL上下文丢失
        game.canvas.addEventListener('webglcontextlost', (event) => {
            console.warn('WebGL context lost');
            event.preventDefault();
            
            // 显示上下文丢失提示
            this.showContextLostMessage();
        });
        
        game.canvas.addEventListener('webglcontextrestored', () => {
            console.log('WebGL context restored');
            
            // 隐藏提示并重启游戏
            this.hideContextLostMessage();
            this.restartGame();
        });
    }
    
    setupGlobalEvents() {
        // 监听页面可见性变化
        document.addEventListener('visibilitychange', () => {
            if (this.game) {
                if (document.hidden) {
                    this.game.sound.pauseAll();
                    this.pauseGame();
                } else {
                    this.game.sound.resumeAll();
                    this.resumeGame();
                }
            }
        });
        
        // 监听窗口焦点变化
        window.addEventListener('blur', () => {
            if (this.game) {
                this.pauseGame();
            }
        });
        
        window.addEventListener('focus', () => {
            if (this.game) {
                this.resumeGame();
            }
        });
        
        // 监听内存警告（移动设备）
        if ('memory' in performance) {
            setInterval(() => {
                const memoryInfo = performance.memory;
                const usedMemory = memoryInfo.usedJSHeapSize / 1024 / 1024;
                
                if (usedMemory > 100) { // 100MB
                    console.warn(`⚠️ High memory usage: ${usedMemory.toFixed(2)}MB`);
                    this.optimizeMemoryUsage();
                }
            }, 10000); // 每10秒检查一次
        }
        
        // 监听网络状态变化
        if ('onLine' in navigator) {
            window.addEventListener('online', () => {
                console.log('🌐 Network connection restored');
            });
            
            window.addEventListener('offline', () => {
                console.warn('📡 Network connection lost');
            });
        }
    }
    
    pauseGame() {
        if (this.game && this.game.scene.isActive('GameScene')) {
            const gameScene = this.game.scene.getScene('GameScene');
            if (gameScene && gameScene.physics) {
                gameScene.physics.pause();
                gameScene.anims.pauseAll();
            }
        }
    }
    
    resumeGame() {
        if (this.game && this.game.scene.isActive('GameScene')) {
            const gameScene = this.game.scene.getScene('GameScene');
            if (gameScene && gameScene.physics) {
                gameScene.physics.resume();
                gameScene.anims.resumeAll();
            }
        }
    }
    
    optimizeMemoryUsage() {
        if (!this.game) return;
        
        // 清理纹理缓存
        this.game.textures.each((texture) => {
            if (!texture.key.startsWith('__')) {
                // 保留系统纹理，清理其他纹理
                // texture.destroy(); // 谨慎使用
            }
        });
        
        // 清理音频缓存
        this.game.cache.audio.entries.clear();
        
        // 强制垃圾回收（如果可用）
        if (window.gc) {
            window.gc();
        }
        
        console.log('🧹 Memory optimization performed');
    }
    
    attemptGameRecovery() {
        console.log('🔄 Attempting game recovery...');
        
        try {
            // 重启当前场景
            if (this.game && this.game.scene.isActive('GameScene')) {
                const gameScene = this.game.scene.getScene('GameScene');
                gameScene.scene.restart();
            }
        } catch (error) {
            console.error('Game recovery failed:', error);
            this.showFallbackContent();
        }
    }
    
    restartGame() {
        console.log('🔄 Restarting game...');
        
        if (this.game) {
            this.game.destroy(true);
        }
        
        // 延迟重新创建游戏
        setTimeout(() => {
            this.createGame();
        }, 1000);
    }
    
    showFallbackContent() {
        const gameContainer = document.getElementById('game');
        if (gameContainer) {
            gameContainer.innerHTML = `
                <div style="
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    height: 100vh;
                    background: linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%);
                    color: white;
                    font-family: Arial, sans-serif;
                    text-align: center;
                ">
                    <div>
                        <div style="font-size: 64px; margin-bottom: 20px;">😞</div>
                        <h1 style="margin-bottom: 16px;">游戏无法启动</h1>
                        <p style="margin-bottom: 24px; color: #cccccc;">
                            您的浏览器可能不支持WebGL或遇到了其他问题。
                        </p>
                        <button onclick="location.reload()" style="
                            padding: 12px 24px;
                            background: #4CAF50;
                            color: white;
                            border: none;
                            border-radius: 6px;
                            cursor: pointer;
                            font-size: 16px;
                        ">
                            重新加载
                        </button>
                    </div>
                </div>
            `;
        }
    }
    
    showContextLostMessage() {
        const message = document.createElement('div');
        message.id = 'context-lost-message';
        message.innerHTML = `
            <div style="
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: rgba(0, 0, 0, 0.8);
                color: white;
                display: flex;
                justify-content: center;
                align-items: center;
                font-family: Arial, sans-serif;
                z-index: 10000;
            ">
                <div style="text-align: center;">
                    <div style="font-size: 48px; margin-bottom: 20px;">⚠️</div>
                    <h2>图形上下文丢失</h2>
                    <p>正在尝试恢复...</p>
                </div>
            </div>
        `;
        document.body.appendChild(message);
    }
    
    hideContextLostMessage() {
        const message = document.getElementById('context-lost-message');
        if (message) {
            message.remove();
        }
    }
    
    hideLoadingScreen() {
        const loadingScreen = document.getElementById('loading-screen');
        if (loadingScreen) {
            loadingScreen.style.opacity = '0';
            loadingScreen.style.transition = 'opacity 0.5s ease';
            setTimeout(() => {
                loadingScreen.remove();
            }, 500);
        }
    }
    
    // 公共API
    getGame() {
        return this.game;
    }
    
    getVersion() {
        return __VERSION__;
    }
    
    getBuildTime() {
        return __BUILD_TIME__;
    }
    
    isDebugMode() {
        return __DEV__;
    }
}

// 等待DOM加载完成后初始化游戏
document.addEventListener('DOMContentLoaded', () => {
    const app = new GameApplication();
    
    // 将应用实例设为全局变量（用于调试）
    if (__DEV__) {
        window.gameApp = app;
    }
});

// 导出应用类（用于模块化）
export { GameApplication };

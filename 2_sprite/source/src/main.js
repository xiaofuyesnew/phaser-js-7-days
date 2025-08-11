/**
 * Phaser.js 7天教程 - Day 2: 精灵与动画
 * 
 * 今天我们将深入学习精灵系统和动画：
 * 
 * 功能特性:
 * - 复杂的精灵图系统
 * - 多状态动画切换
 * - 高级用户输入处理
 * - 粒子系统和视觉效果
 * - 性能优化技巧
 * 
 * 学习目标:
 * - 掌握精灵图的创建和使用
 * - 理解动画状态机的实现
 * - 学会粒子系统的使用
 * - 了解输入缓冲和响应优化
 * - 掌握性能监控和优化
 */

import './style/index.css';
import Phaser from 'phaser';
import { GameScene } from './scenes/GameScene.js';
import { GAME_CONFIG, DEBUG_CONFIG, PERFORMANCE_CONFIG } from './utils/constants.js';
import { Logger, PerformanceUtils } from './utils/helpers.js';

// 开始性能监控
PerformanceUtils.startTimer('Day 2 游戏初始化');

// 游戏配置对象
const config = {
    // 渲染器配置
    type: Phaser.AUTO,
    width: GAME_CONFIG.WIDTH,
    height: GAME_CONFIG.HEIGHT,
    parent: 'game',
    
    // 背景和样式
    backgroundColor: GAME_CONFIG.BACKGROUND_COLOR,
    
    // 物理引擎配置
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { y: GAME_CONFIG.PHYSICS_GRAVITY },
            debug: DEBUG_CONFIG.SHOW_PHYSICS,
            debugShowBody: DEBUG_CONFIG.SHOW_COLLISION_BOXES,
            debugShowStaticBody: DEBUG_CONFIG.SHOW_COLLISION_BOXES,
            debugShowVelocity: DEBUG_CONFIG.SHOW_PHYSICS,
            debugVelocityColor: 0x00ff00,
            debugBodyColor: 0xff0000,
            debugStaticBodyColor: 0x0000ff
        }
    },
    
    // 场景配置
    scene: [
        GameScene
    ],
    
    // 渲染配置
    render: {
        antialias: true,
        pixelArt: false,
        roundPixels: true,
        transparent: false,
        clearBeforeRender: true,
        preserveDrawingBuffer: false,
        premultipliedAlpha: true,
        failIfMajorPerformanceCaveat: false,
        powerPreference: 'default'
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
        gamepad: false,
        smoothFactor: 0,
        windowEvents: true
    },
    
    // 缩放配置
    scale: {
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH,
        min: {
            width: 400,
            height: 300
        },
        max: {
            width: 1600,
            height: 1200
        },
        zoom: 1
    },
    
    // 性能配置
    fps: {
        target: PERFORMANCE_CONFIG.TARGET_FPS,
        forceSetTimeOut: false,
        deltaHistory: 10,
        panicMax: 120,
        smoothStep: true
    },
    
    // 调试配置
    banner: {
        hidePhaser: !DEBUG_CONFIG.ENABLE_CONSOLE,
        text: '#ffffff',
        background: ['#4ecdc4', '#45b7d1', '#96ceb4', '#6c5ce7']
    },
    
    // DOM配置
    dom: {
        createContainer: false
    },
    
    // 加载器配置
    loader: {
        baseURL: '',
        path: '',
        maxParallelDownloads: 4,
        crossOrigin: 'anonymous',
        timeout: 0
    }
};

// 创建游戏实例
Logger.info('🎮 正在创建Day 2 Phaser游戏实例...');

const game = new Phaser.Game(config);

// 游戏事件监听
game.events.on('ready', () => {
    Logger.info('✅ Day 2 游戏初始化完成!');
    PerformanceUtils.endTimer('Day 2 游戏初始化');
    
    // 显示内存使用情况
    const memoryInfo = PerformanceUtils.getMemoryInfo();
    if (memoryInfo) {
        Logger.info(`💾 内存使用: ${memoryInfo.used}MB / ${memoryInfo.total}MB`);
    }
    
    // 显示游戏配置信息
    Logger.info(`🎯 游戏配置: ${GAME_CONFIG.WIDTH}x${GAME_CONFIG.HEIGHT}, 目标FPS: ${PERFORMANCE_CONFIG.TARGET_FPS}`);
});

game.events.on('step', (time, delta) => {
    // 性能监控
    PerformanceUtils.updateFPS(time);
    PerformanceUtils.checkPerformance(delta);
    
    // 显示FPS (如果启用)
    if (DEBUG_CONFIG.SHOW_FPS && Math.floor(time / 1000) % 5 === 0) {
        Logger.debug(`📊 当前FPS: ${PerformanceUtils.getFPS()}`);
    }
});

game.events.on('pause', () => {
    Logger.info('⏸️ Day 2 游戏已暂停');
});

game.events.on('resume', () => {
    Logger.info('▶️ Day 2 游戏已恢复');
});

game.events.on('blur', () => {
    Logger.info('👁️ 游戏失去焦点');
});

game.events.on('focus', () => {
    Logger.info('👁️ 游戏获得焦点');
});

// 窗口事件监听
window.addEventListener('beforeunload', () => {
    Logger.info('👋 Day 2 游戏即将关闭');
    
    // 清理资源
    if (game) {
        game.destroy(true);
    }
});

// 页面可见性变化监听
document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
        if (game && game.scene) {
            game.scene.pause();
        }
        Logger.info('👁️ 页面隐藏，游戏已暂停');
    } else {
        if (game && game.scene) {
            game.scene.resume();
        }
        Logger.info('👁️ 页面显示，游戏已恢复');
    }
});

// 错误处理
window.addEventListener('error', (event) => {
    Logger.error('💥 Day 2 游戏运行错误:', event.error);
    
    // 尝试恢复游戏
    if (game && game.scene && game.scene.scenes.length > 0) {
        const currentScene = game.scene.scenes[0];
        if (currentScene && currentScene.scene) {
            Logger.info('🔄 尝试重启当前场景...');
            currentScene.scene.restart();
        }
    }
});

// 未捕获的Promise错误
window.addEventListener('unhandledrejection', (event) => {
    Logger.error('💥 未处理的Promise错误:', event.reason);
    event.preventDefault();
});

// 导出游戏实例供调试使用
window.game = game;
window.Phaser = Phaser;

// 开发者工具提示
if (DEBUG_CONFIG.ENABLE_CONSOLE) {
    console.log(`
🎮 Phaser.js 7天教程 - Day 2: 精灵与动画
=====================================

欢迎来到精灵与动画的世界！

🔧 调试工具:
- window.game: 游戏实例
- window.Phaser: Phaser库

📖 今日学习内容:
- 精灵图系统的使用
- 复杂动画状态机
- 高级输入处理技巧
- 粒子系统和视觉效果
- 性能监控和优化

🎯 操作说明:
- 方向键: 移动角色 (观察不同的动画状态)
- 上键: 跳跃 (空中可二段跳)
- Shift键: 冲刺 (观察特殊效果)
- R键: 重置游戏
- 目标: 收集所有金币，体验流畅的动画

🎨 特色功能:
- 多状态动画切换 (待机/行走/跑步/跳跃/下落/着陆/冲刺)
- 粒子特效系统 (跳跃/二段跳/着陆/收集)
- 输入缓冲优化
- 性能监控显示

祝你学习愉快！🚀
    `);
}

// 性能监控定时器 (仅在调试模式下)
if (DEBUG_CONFIG.SHOW_FPS) {
    setInterval(() => {
        const memoryInfo = PerformanceUtils.getMemoryInfo();
        if (memoryInfo) {
            Logger.debug(`📊 性能状态 - FPS: ${PerformanceUtils.getFPS()}, 内存: ${memoryInfo.used}MB`);
        }
    }, 5000);
}

Logger.info('🎉 Day 2 游戏启动完成！开始探索精灵与动画的奇妙世界吧！');

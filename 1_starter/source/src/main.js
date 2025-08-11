/**
 * Phaser.js 7天教程 - Day 1: 基础入门
 * 
 * 这是我们的第一个Phaser.js游戏！
 * 
 * 功能特性:
 * - 基础的游戏场景和生命周期
 * - 简单的玩家控制 (方向键/WASD)
 * - 收集品系统和分数统计
 * - 基础的动画和视觉效果
 * - 碰撞检测和游戏逻辑
 * 
 * 学习目标:
 * - 理解Phaser.js的基本架构
 * - 掌握场景系统的使用
 * - 学会处理用户输入
 * - 了解游戏循环的概念
 */

import './style/index.css';
import Phaser from 'phaser';
import { GameScene } from './scenes/GameScene.js';
import { GAME_CONFIG, DEBUG_CONFIG } from './utils/constants.js';
import { Logger, PerformanceUtils } from './utils/helpers.js';

// 开始性能监控
PerformanceUtils.startTimer('游戏初始化');

// 游戏配置对象
const config = {
    // 渲染器配置
    type: Phaser.AUTO,                    // 自动选择最佳渲染器 (WebGL > Canvas)
    width: GAME_CONFIG.WIDTH,             // 游戏画布宽度
    height: GAME_CONFIG.HEIGHT,           // 游戏画布高度
    parent: 'game',                       // DOM容器元素ID
    
    // 背景和样式
    backgroundColor: GAME_CONFIG.BACKGROUND_COLOR,
    
    // 物理引擎配置 (暂时不启用，后续章节会详细介绍)
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { y: GAME_CONFIG.PHYSICS_GRAVITY },
            debug: DEBUG_CONFIG.SHOW_PHYSICS
        }
    },
    
    // 场景配置
    scene: [
        GameScene  // 主游戏场景
    ],
    
    // 渲染配置
    render: {
        antialias: true,                  // 抗锯齿
        pixelArt: false,                  // 像素艺术模式
        roundPixels: true                 // 像素对齐
    },
    
    // 音频配置
    audio: {
        disableWebAudio: false
    },
    
    // 输入配置
    input: {
        keyboard: true,
        mouse: true,
        touch: true,
        gamepad: false
    },
    
    // 缩放配置
    scale: {
        mode: Phaser.Scale.FIT,           // 自适应缩放模式
        autoCenter: Phaser.Scale.CENTER_BOTH,  // 居中显示
        min: {
            width: 400,
            height: 300
        },
        max: {
            width: 1600,
            height: 1200
        }
    },
    
    // 性能配置
    fps: {
        target: 60,                       // 目标帧率
        forceSetTimeOut: false,           // 强制使用setTimeout
        deltaHistory: 10,                 // 帧时间历史记录数量
        panicMax: 120                     // 最大恐慌值
    },
    
    // 调试配置
    banner: {
        hidePhaser: !DEBUG_CONFIG.ENABLE_CONSOLE,
        text: '#ffffff',
        background: ['#ff6b6b', '#4ecdc4', '#45b7d1', '#96ceb4']
    }
};

// 创建游戏实例
Logger.info('🎮 正在创建Phaser游戏实例...');

const game = new Phaser.Game(config);

// 游戏事件监听
game.events.on('ready', () => {
    Logger.info('✅ 游戏初始化完成!');
    PerformanceUtils.endTimer('游戏初始化');
    
    // 显示内存使用情况
    const memoryInfo = PerformanceUtils.getMemoryInfo();
    if (memoryInfo) {
        Logger.info(`💾 内存使用: ${memoryInfo.used}MB / ${memoryInfo.total}MB`);
    }
});

game.events.on('step', (time, delta) => {
    // 性能监控 - 检测帧率问题
    if (delta > 50 && DEBUG_CONFIG.LOG_LEVEL === 'debug') {
        Logger.warn(`⚠️ 帧率警告: ${Math.round(1000/delta)}fps (${delta}ms)`);
    }
});

game.events.on('pause', () => {
    Logger.info('⏸️ 游戏已暂停');
});

game.events.on('resume', () => {
    Logger.info('▶️ 游戏已恢复');
});

// 窗口事件监听
window.addEventListener('beforeunload', () => {
    Logger.info('👋 游戏即将关闭');
    game.destroy(true);
});

// 页面可见性变化监听
document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
        game.scene.pause();
        Logger.info('👁️ 页面隐藏，游戏已暂停');
    } else {
        game.scene.resume();
        Logger.info('👁️ 页面显示，游戏已恢复');
    }
});

// 错误处理
window.addEventListener('error', (event) => {
    Logger.error('💥 游戏运行错误:', event.error);
});

// 导出游戏实例供调试使用
window.game = game;
window.Phaser = Phaser;

// 开发者工具提示
if (DEBUG_CONFIG.ENABLE_CONSOLE) {
    console.log(`
🎮 Phaser.js 7天教程 - Day 1
========================

欢迎来到Phaser.js的世界！

🔧 调试工具:
- window.game: 游戏实例
- window.Phaser: Phaser库

📖 今日学习内容:
- Phaser.js基础架构
- 场景系统和生命周期
- 游戏循环和更新机制
- 用户输入处理
- 基础动画和效果

🎯 操作说明:
- 方向键或WASD: 移动蓝色方块
- 空格键: 重置游戏
- 目标: 收集所有金币

祝你学习愉快！🚀
    `);
}

Logger.info('🎉 Day 1 游戏启动完成！开始你的Phaser.js之旅吧！');

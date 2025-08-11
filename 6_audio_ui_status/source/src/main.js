import './style/index.css';
import { MenuScene } from './scenes/MenuScene.js';
import { GameScene } from './scenes/GameScene.js';
import { PauseScene } from './scenes/PauseScene.js';
import { SettingsScene } from './scenes/SettingsScene.js';
import { 
    AudioSystemExercise, 
    UIDesignExercise, 
    StateManagementExercise, 
    CompleteGameDemo 
} from './exercises/index.js';

/**
 * Day 6: 音效、UI与状态管理演示
 * 
 * 本演示展示了：
 * - 音频管理系统
 * - UI界面创建和管理
 * - 游戏状态管理
 * - 本地存储和设置保存
 * - 完整的游戏体验整合
 */

// Phaser游戏配置
const config = {
    type: Phaser.AUTO,
    width: 800,
    height: 600,
    backgroundColor: '#2c3e50',
    parent: 'game-container',
    
    // 物理引擎配置
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { y: 500 },
            debug: false // 设置为true可以看到物理边界
        }
    },
    
    // 场景配置
    scene: [
        MenuScene,              // 主菜单场景
        GameScene,              // 游戏场景
        PauseScene,             // 暂停场景
        SettingsScene,          // 设置场景
        AudioSystemExercise,    // 练习1：音频系统
        UIDesignExercise,       // 练习2：UI设计
        StateManagementExercise,// 练习3：状态管理
        CompleteGameDemo        // 完整游戏演示
    ],
    
    // 缩放配置
    scale: {
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH,
        min: {
            width: 400,
            height: 300
        },
        max: {
            width: 1200,
            height: 900
        }
    },
    
    // 输入配置
    input: {
        keyboard: true,
        mouse: true,
        touch: true,
        gamepad: false
    },
    
    // 渲染配置
    render: {
        antialias: true,
        pixelArt: false,
        roundPixels: false
    },
    
    // 音频配置
    audio: {
        disableWebAudio: false
    }
};

// 创建游戏实例
const game = new Phaser.Game(config);

// 全局游戏引用（用于调试）
window.game = game;

// 游戏加载完成后的处理
game.events.once('ready', () => {
    console.log('🎮 Day 6 Demo: Audio, UI & State Management');
    console.log('📖 Features:');
    console.log('  • Audio Management System');
    console.log('  • UI Creation and Management');
    console.log('  • Game State Management');
    console.log('  • Local Storage & Settings');
    console.log('  • Complete Game Experience');
    console.log('');
    console.log('🎯 Controls:');
    console.log('  • Arrow Keys / WASD: Move');
    console.log('  • Space: Jump');
    console.log('  • ESC: Pause/Menu');
    console.log('  • Mouse: UI Interaction');
    console.log('');
    console.log('🔧 Try the settings menu to adjust audio and gameplay options!');
});

// 错误处理
game.events.on('error', (error) => {
    console.error('Game Error:', error);
});

// 窗口失焦时暂停游戏
window.addEventListener('blur', () => {
    if (game.scene.isActive('GameScene')) {
        game.scene.pause('GameScene');
        game.scene.launch('PauseScene');
    }
});

// 窗口获得焦点时恢复游戏
window.addEventListener('focus', () => {
    // 游戏会在用户手动恢复时继续
});

// 页面卸载时保存数据
window.addEventListener('beforeunload', () => {
    // 保存游戏数据
    const gameScene = game.scene.getScene('GameScene');
    if (gameScene && gameScene.gameState) {
        gameScene.gameState.saveData();
    }
});

export default game;

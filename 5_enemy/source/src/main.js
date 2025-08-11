import './style/index.css'
import Phaser from 'phaser'

// 导入场景
import GameScene from './scenes/GameScene.js'
import MenuScene from './scenes/MenuScene.js'

// 游戏配置
const config = {
    type: Phaser.AUTO,
    width: 800,
    height: 600,
    backgroundColor: '#2c3e50',
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { y: 300 },
            debug: false
        }
    },
    scene: [MenuScene, GameScene]
}

// 启动游戏
const game = new Phaser.Game(config)

// 导出游戏实例供调试使用
window.game = game
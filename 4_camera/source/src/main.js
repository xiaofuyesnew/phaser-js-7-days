import './style/index.css'
import Phaser from 'phaser'

// 导入场景和控制器
import MenuScene from './scenes/MenuScene.js'
import GameScene from './scenes/GameScene.js'
import Exercise1_BasicFollow from './exercises/Exercise1_BasicFollow.js'
import Exercise2_ParallaxScrolling from './exercises/Exercise2_ParallaxScrolling.js'
import Exercise3_CameraEffects from './exercises/Exercise3_CameraEffects.js'
import AdvancedCameraDemo from './exercises/AdvancedCameraDemo.js'
import { CameraController } from './controllers/CameraController.js'
import { ParallaxBackground } from './effects/ParallaxBackground.js'

// 游戏配置
const config = {
    type: Phaser.AUTO,
    width: 800,
    height: 600,
    parent: 'game',
    backgroundColor: '#2c3e50',
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { y: 300 },
            debug: false
        }
    },
    scene: [
        MenuScene,
        GameScene,
        AdvancedCameraDemo,
        Exercise1_BasicFollow,
        Exercise2_ParallaxScrolling,
        Exercise3_CameraEffects
    ],
    scale: {
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH
    }
}

// 启动游戏
const game = new Phaser.Game(config)

// 导出游戏实例供调试使用
window.game = game

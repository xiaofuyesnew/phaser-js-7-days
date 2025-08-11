import './style.css'
import { AUTO, Game, Scene } from 'phaser'

// 定义一个场景类，继承自 Phaser.Scene
class MyScene extends Scene {
  constructor() {
    super('MyScene')
    this.direction = 1
  }

  // 场景预加载：预加载如图片、音视频的游戏资源
  preload() {
    this.load.image('vite', '/vite.svg')
  }

  // 场景创建：创建游戏场景，如背景、角色、敌人、道具等
  create() {
    this.add.image(400, 300, 'vite').setOrigin(0.5, 0.5)
  }

  // 场景更新：游戏循环执行，如角色移动、敌人攻击、道具收集等
  update() {
    if (this.cameras.main.scrollX === 100) {
      this.direction = -1
    } else if (this.cameras.main.scrollX === -100) {
      this.direction = 1
    }
    this.cameras.main.scrollX += this.direction
  }
}

// 实例化游戏
export default new Game({
  type: AUTO,  // 选择渲染模式，AUTO 自动选择，WEBGL 强制使用 WebGL，CANVAS 强制使用 Canvas
  width: 800,  // 游戏宽度，单位像素
  height: 600,  // 游戏高度，单位像素
  parent: 'game',  // 游戏容器的 DOM 元素 id
  // 单场景：只包含一个场景，直接定义 preload\create\update 生命周期函数
  scene: [MyScene]
})

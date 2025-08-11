import './style.css'
import { AUTO, Game } from 'phaser'

// 场景预加载：预加载如图片、音视频的游戏资源
function preload() {
  this.preload.image('vite', '/vite.svg')
}

// 场景创建：创建游戏场景，如背景、角色、敌人、道具等
function create() {
  this.add.image(400, 300, 'vite').setOrigin(0.5, 0.5)
}

// 场景更新：游戏循环执行，如角色移动、敌人攻击、道具收集等
function update() {
  this.camera.scrollX += 1
}

// 实例化游戏
new Game({
  type: AUTO,  // 选择渲染模式，AUTO 自动选择，WEBGL 强制使用 WebGL，CANVAS 强制使用 Canvas
  width: 800,  // 游戏宽度，单位像素
  height: 600,  // 游戏高度，单位像素
  parent: 'game',  // 游戏容器的 DOM 元素 id
  // 单场景：只包含一个场景，直接定义 preload\create\update 生命周期函数
  scene: {
    preload,
    create,
    update
  }
})

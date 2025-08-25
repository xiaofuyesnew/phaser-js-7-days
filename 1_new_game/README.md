# 第 1 天：游戏工程创建与基础设置

> 如果你对本章节中的一些描述和操作感到陌生，请先参考[附录：前端开发基础环境搭建](../for_frontend_beginner/README.md)
>
> 本教程撰写时，Phaser.js 最新版本为 3.90.0。

Phaser.js 是一个开源的 JavaScript 游戏框架，它提供了丰富的功能和工具，帮助开发者快速创建跨平台的游戏。

## 🎯 章节目标

- [ ] 创建 Phaser 3 项目基础结构
- [ ] 编写基础配置并创建 Game 实例
- [ ] 理解场景及场景的生命周期函数：preload、create、update
- [ ] 运行游戏，并尝试在开发环境中更改代码

## 🏹 章节内容

首先，打开命令行，我们使用 `vite` 在本项目下创建一个最基本的 Javascript 前端项目。

```bash
pnpm create vite@latest my_phaser_game --template vanilla
```

接着，为项目添加 Phaser.js 依赖。

```bash
pnpm add phaser
```

然后，我们将项目中的代码文件整理一下，让项目文件结构更符合我们开发的需求：

```bash
example
 |- public
 |   |- javascript.svg
 |   |- vite.svg
 |- src
 |   |- main.js
 |   |- style.css
 |- .gitignore
 |- index.html
 |- package.json
```

其中最核心的就是 `src/main.js` 文件，它是整个游戏逻辑的核心，现在，我们编辑它：

```javascript
import './style.css'
import { AUTO, Game, Scene } from 'phaser'

// 定义一个场景类，继承自 Phaser.Scene
class MyScene extends Scene {
  constructor() {
    super('MyScene')
    // 摄像机移动方向
    this.direction = 1
  }

  // 场景预加载：预加载如图片、音视频的游戏资源
  preload() {
    // 加载一个图片资源，键名为 'vite'，路径为 '/vite.svg'
    this.load.image('vite', '/vite.svg')
  }

  // 场景创建：创建游戏场景，如背景、角色、敌人、道具等
  create() {
    // 将 'vite' 图片资源添加到场景中，位置为 (400, 300)
    this.add.image(400, 300, 'vite').setOrigin(0.5, 0.5)
  }

  // 场景更新：游戏循环执行，如角色移动、敌人攻击、道具收集等
  update() {
    // 摄像机水平移动，当到达 100 边界时反向
    if (Math.abs(this.cameras.main.scrollX) === 100) {
      this.direction *= -1
    }
    this.cameras.main.scrollX += this.direction
  }
}

// 实例化游戏
new Game({
  type: AUTO,  // 选择渲染模式，AUTO 自动选择，WEBGL 强制使用 WebGL，CANVAS 强制使用 Canvas
  width: 800,  // 游戏宽度，单位像素
  height: 600,  // 游戏高度，单位像素
  parent: 'game',  // 游戏容器的 DOM 元素 id
  // 单场景：只包含一个场景
  scene: [MyScene]
})
```

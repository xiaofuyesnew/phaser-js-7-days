# Day 1 项目指南

> 🎯 这个指南将帮助你理解和使用Day 1的所有代码示例

---

## 📁 项目结构

```bash
1_starter/source/
├── src/
│   ├── scenes/
│   │   ├── GameScene.js      # 主游戏场景 (默认运行)
│   │   └── ExampleScene.js   # 完整示例场景
│   ├── utils/
│   │   ├── constants.js      # 游戏常量定义
│   │   └── helpers.js        # 工具函数库
│   ├── style/
│   │   └── index.css         # 样式文件
│   └── main.js               # 游戏入口文件
├── public/                   # 静态资源目录
├── EXERCISES.md              # 练习题集合
├── PROJECT_GUIDE.md          # 项目指南 (本文件)
├── package.json              # 项目配置
├── vite.config.js            # 构建配置
└── index.html                # HTML模板
```

---

## 🚀 快速开始

### 1. 安装依赖

```bash
cd 1_starter/source
pnpm install
```

### 2. 启动开发服务器

```bash
pnpm dev
```

### 3. 在浏览器中访问

打开 http://localhost:3000 查看游戏

---

## 🎮 游戏场景说明

### GameScene.js - 基础教学场景

这是默认运行的场景，包含了Day 1的核心学习内容：

**功能特性:**

- ✅ 基础的场景生命周期演示
- ✅ 简单的玩家控制系统
- ✅ 收集品系统和分数统计
- ✅ 基础动画和视觉效果
- ✅ 碰撞检测实现

**操作方式:**

- 方向键或WASD: 移动蓝色方块
- 空格键: 重置游戏
- 目标: 收集所有金币

**学习重点:**

- 理解场景的preload、create、update生命周期
- 掌握基础的用户输入处理
- 学会创建简单的游戏对象和动画

### ExampleScene.js - 完整示例场景

这是一个更复杂的示例，展示了进阶的游戏开发技巧：

**功能特性:**

- ✅ 完整的游戏循环和状态管理
- ✅ 多种游戏对象类型
- ✅ 粒子系统和视觉效果
- ✅ 动态难度调整
- ✅ 完整的UI系统

**操作方式:**

- 方向键或WASD: 移动角色
- 空格键: 暂停/恢复游戏
- R键: 重置游戏
- 目标: 收集星星，避开红色障碍物

**学习重点:**

- 了解更复杂的游戏架构设计
- 学习粒子系统的使用
- 掌握游戏状态管理
- 理解性能优化的基本概念

---

## 🔧 如何切换场景

### 方法1: 修改main.js

在 `src/main.js` 文件中，找到场景配置部分：

```javascript
// 当前配置 (默认)
scene: [
    GameScene  // 基础教学场景
],

// 切换到完整示例
scene: [
    ExampleScene  // 完整示例场景
],

// 或者同时加载两个场景
scene: [
    GameScene,
    ExampleScene
],
```

### 方法2: 在游戏中切换

你也可以在代码中动态切换场景：

```javascript
// 在任意场景中切换到其他场景
this.scene.start('example-scene');
```

---

## 📚 代码学习指南

### 1. 从简单开始

建议按以下顺序学习代码：

1. **main.js** - 理解游戏初始化过程
2. **constants.js** - 了解常量管理方式
3. **GameScene.js** - 学习基础场景结构
4. **helpers.js** - 掌握工具函数的使用
5. **ExampleScene.js** - 学习进阶开发技巧

### 2. 重点关注的概念

#### 场景生命周期

```javascript
class MyScene extends Phaser.Scene {
    preload() {
        // 资源加载阶段
        // 在这里加载图片、音频等资源
    }

    create() {
        // 场景创建阶段
        // 在这里创建游戏对象、设置初始状态
    }

    update() {
        // 游戏循环更新
        // 每帧都会调用，处理游戏逻辑
    }
}
```

#### 游戏对象创建

```javascript
// 创建精灵
const sprite = this.add.sprite(x, y, 'texture-key');

// 创建文本
const text = this.add.text(x, y, 'Hello World', style);

// 创建图形
const graphics = this.add.graphics();
graphics.fillStyle(0xff0000);
graphics.fillCircle(x, y, radius);
```

#### 用户输入处理

```javascript
// 创建输入对象
this.cursors = this.input.keyboard.createCursorKeys();

// 在update中检查输入
if (this.cursors.left.isDown) {
    // 处理左键按下
}
```

#### 动画系统

```javascript
// 创建补间动画
this.tweens.add({
    targets: sprite,
    x: 400,
    y: 300,
    duration: 1000,
    ease: 'Power2'
});
```

### 3. 调试技巧

#### 使用浏览器开发者工具

- 按F12打开开发者工具
- 在Console面板中查看日志输出
- 使用`console.log()`输出调试信息

#### 游戏对象检查

```javascript
// 在浏览器控制台中访问游戏实例
window.game

// 访问当前场景
window.game.scene.scenes[0]

// 查看场景中的所有对象
window.game.scene.scenes[0].children.list
```

#### 性能监控

```javascript
// 查看帧率
window.game.loop.actualFps

// 查看内存使用 (如果支持)
performance.memory
```

---

## 🎯 练习建议

### 初学者练习

1. 修改玩家的移动速度
2. 改变收集品的颜色和大小
3. 添加新的文本显示
4. 尝试不同的动画效果

### 进阶练习

1. 添加新的游戏对象类型
2. 实现更复杂的碰撞检测
3. 创建自定义的动画序列
4. 添加音效支持 (为明天的学习做准备)

### 挑战练习

1. 实现多关卡系统
2. 添加存档功能
3. 创建自定义的粒子效果
4. 实现游戏暂停和恢复功能

---

## 🐛 常见问题解决

### Q: 游戏无法启动

**A:** 检查以下几点：

1. 确保已安装Node.js 18+
2. 运行`pnpm install`安装依赖
3. 检查控制台是否有错误信息
4. 确保端口3000未被占用

### Q: 代码修改后没有效果

**A:** 可能的原因：
1. 浏览器缓存问题 - 按Ctrl+F5强制刷新
2. 语法错误 - 检查浏览器控制台的错误信息
3. 文件保存问题 - 确保文件已保存

### Q: 游戏运行卡顿

**A:** 优化建议：

1. 减少同时显示的游戏对象数量
2. 避免在update()中创建新对象
3. 使用对象池管理频繁创建的对象
4. 检查是否有无限循环的动画

### Q: 如何添加自己的图片资源

**A:** 步骤：

1. 将图片文件放到`public/assets/images/`目录
2. 在preload()中加载：`this.load.image('key', 'assets/images/filename.png')`
3. 在create()中使用：`this.add.sprite(x, y, 'key')`

---

## 📖 扩展学习资源

### 官方文档

- [Phaser 3 API文档](https://photonstorm.github.io/phaser3-docs/)
- [Phaser 3 示例](https://phaser.io/examples)

### 社区资源

- [Phaser Discord](https://discord.gg/phaser)
- [HTML5 Game Devs论坛](https://www.html5gamedevs.com/forum/14-phaser/)

### 推荐教程

- [Phaser 3官方教程](https://phaser.io/tutorials)
- [MDN游戏开发指南](https://developer.mozilla.org/en-US/docs/Games)

---

## 🎉 下一步

完成Day 1的学习后，你应该：

1. ✅ 理解Phaser.js的基本架构
2. ✅ 掌握场景系统的使用
3. ✅ 会创建基本的游戏对象
4. ✅ 能处理用户输入
5. ✅ 了解动画系统的基础用法

**明天我们将学习：**

- 🖼️ 图片资源的加载和管理
- 🎭 精灵动画系统
- 🎨 更丰富的视觉效果
- 🎮 更复杂的游戏机制

继续保持学习的热情，你已经迈出了游戏开发的重要一步！🚀

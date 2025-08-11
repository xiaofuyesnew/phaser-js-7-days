# Day 1 练习题 - Phaser.js 基础

> 🎯 通过这些练习，你将巩固今天学到的Phaser.js基础知识

---

## 📋 练习说明

每个练习都有不同的难度等级：

- ⭐ 基础练习 - 适合初学者
- ⭐⭐ 进阶练习 - 需要一些思考
- ⭐⭐⭐ 挑战练习 - 考验综合能力

完成练习后，可以对照提供的解决方案检查你的实现。

---

## 练习 1: Hello Phaser 文本显示 ⭐

### 目标

创建一个显示"Hello Phaser!"文本的场景，文本应该在屏幕中央显示。

### 要求

1. 在屏幕中央显示"Hello Phaser!"文本
2. 设置字体大小为32px
3. 设置文本颜色为白色
4. 文本应该居中对齐

### 提示

```javascript
// 在GameScene的create()方法中添加
this.add.text(x, y, 'Hello Phaser!', {
    fontSize: '32px',
    fill: '#ffffff'
}).setOrigin(0.5);
```

### 扩展挑战

- 尝试添加文本阴影效果
- 让文本有淡入动画效果
- 添加不同颜色的文本

<details>
<summary>💡 查看解决方案</summary>

```javascript
// 在GameScene的create()方法中
create() {
    // 基础文本
    const helloText = this.add.text(400, 300, 'Hello Phaser!', {
        fontSize: '32px',
        fill: '#ffffff',
        fontFamily: 'Arial, sans-serif',
        stroke: '#000000',
        strokeThickness: 2
    }).setOrigin(0.5);

    // 淡入动画
    helloText.setAlpha(0);
    this.tweens.add({
        targets: helloText,
        alpha: 1,
        duration: 2000,
        ease: 'Power2'
    });
}
```
</details>

---

## 练习 2: 几何图形绘制 ⭐⭐

### 目标

使用Phaser的Graphics对象绘制基本几何图形。

### 要求

1. 绘制一个红色的圆形（半径50px）
2. 绘制一个蓝色的矩形（100x80px）
3. 绘制一个绿色的三角形
4. 所有图形都应该有边框

### 提示

```javascript
// 创建Graphics对象
const graphics = this.add.graphics();

// 绘制填充圆形
graphics.fillStyle(0xff0000);
graphics.fillCircle(x, y, radius);

// 绘制边框
graphics.lineStyle(2, 0x000000);
graphics.strokeCircle(x, y, radius);
```

### 扩展挑战

- 让图形有旋转动画
- 添加鼠标悬停变色效果
- 创建更复杂的图形组合

<details>
<summary>💡 查看解决方案</summary>

```javascript
create() {
    const graphics = this.add.graphics();

    // 红色圆形
    graphics.fillStyle(0xff0000);
    graphics.lineStyle(3, 0x000000);
    graphics.fillCircle(200, 200, 50);
    graphics.strokeCircle(200, 200, 50);

    // 蓝色矩形
    graphics.fillStyle(0x0000ff);
    graphics.fillRect(350, 160, 100, 80);
    graphics.strokeRect(350, 160, 100, 80);

    // 绿色三角形
    graphics.fillStyle(0x00ff00);
    graphics.beginPath();
    graphics.moveTo(600, 160);
    graphics.lineTo(550, 240);
    graphics.lineTo(650, 240);
    graphics.closePath();
    graphics.fillPath();
    graphics.strokePath();
}
```

</details>

---

## 练习 3: 鼠标交互 ⭐⭐⭐

### 目标

创建可以响应鼠标点击的交互对象。

### 要求

1. 创建一个可点击的圆形按钮
2. 点击时改变按钮颜色
3. 添加鼠标悬停效果
4. 显示点击次数

### 提示

```javascript
// 创建交互对象
const button = this.add.circle(x, y, radius, color);
button.setInteractive();

// 添加点击事件
button.on('pointerdown', () => {
    // 点击处理逻辑
});

// 添加悬停事件
button.on('pointerover', () => {
    // 悬停处理逻辑
});
```

### 扩展挑战

- 添加点击音效
- 创建多个不同功能的按钮
- 实现拖拽功能

<details>
<summary>💡 查看解决方案</summary>

```javascript
create() {
    let clickCount = 0;
    const colors = [0xff6b6b, 0x4ecdc4, 0x45b7d1, 0x96ceb4, 0xfeca57];
    let currentColorIndex = 0;

    // 创建按钮
    const button = this.add.circle(400, 300, 60, colors[0]);
    button.setInteractive();
    button.setStroke(0xffffff, 3);

    // 点击计数文本
    const countText = this.add.text(400, 400, '点击次数: 0', {
        fontSize: '24px',
        fill: '#ffffff'
    }).setOrigin(0.5);

    // 点击事件
    button.on('pointerdown', () => {
        clickCount++;
        currentColorIndex = (currentColorIndex + 1) % colors.length;
        button.setFillStyle(colors[currentColorIndex]);
        countText.setText(`点击次数: ${clickCount}`);

        // 点击动画
        this.tweens.add({
            targets: button,
            scaleX: 1.2,
            scaleY: 1.2,
            duration: 100,
            yoyo: true
        });
    });

    // 悬停事件
    button.on('pointerover', () => {
        button.setScale(1.1);
    });

    button.on('pointerout', () => {
        button.setScale(1.0);
    });
}
```

</details>

---

## 练习 4: 简单动画系统 ⭐⭐

### 目标

创建一个会移动的精灵对象，实现基础动画效果。

### 要求

1. 创建一个彩色方块精灵
2. 让它在屏幕上水平移动
3. 到达边界时反弹
4. 添加缩放动画效果

### 提示

```javascript
// 在update()方法中更新位置
update() {
    sprite.x += speed;

    // 边界检测
    if (sprite.x > boundary) {
        speed = -speed;
    }
}
```

### 扩展挑战

- 添加垂直移动
- 实现弹球效果
- 添加轨迹特效

<details>
<summary>💡 查看解决方案</summary>

```javascript
create() {
    // 创建移动的方块
    this.movingSquare = this.add.rectangle(50, 300, 40, 40, 0xff6b6b);
    this.squareSpeed = 200;

    // 添加缩放动画
    this.tweens.add({
        targets: this.movingSquare,
        scaleX: 1.2,
        scaleY: 1.2,
        duration: 1000,
        yoyo: true,
        repeat: -1,
        ease: 'Sine.easeInOut'
    });
}

update() {
    // 移动方块
    const deltaTime = this.game.loop.delta / 1000;
    this.movingSquare.x += this.squareSpeed * deltaTime;

    // 边界反弹
    if (this.movingSquare.x > 750 || this.movingSquare.x < 50) {
        this.squareSpeed = -this.squareSpeed;

        // 反弹时改变颜色
        const colors = [0xff6b6b, 0x4ecdc4, 0x45b7d1, 0x96ceb4];
        const randomColor = colors[Math.floor(Math.random() * colors.length)];
        this.movingSquare.setFillStyle(randomColor);
    }
}
```

</details>

---

## 练习 5: 键盘控制系统 ⭐⭐⭐

### 目标

创建一个完整的键盘控制系统，支持多种输入方式。

### 要求

1. 创建一个可控制的角色
2. 支持方向键和WASD控制
3. 添加加速和减速效果
4. 实现边界限制
5. 显示当前速度和位置信息

### 提示

```javascript
// 创建多种输入方式
this.cursors = this.input.keyboard.createCursorKeys();
this.wasd = this.input.keyboard.addKeys('W,S,A,D');

// 在update中处理输入
if (this.cursors.left.isDown) {
    // 向左移动
}
```

### 扩展挑战

- 添加冲刺功能（Shift键）
- 实现惯性移动
- 添加移动轨迹显示

<details>
<summary>💡 查看解决方案</summary>

```javascript
create() {
    // 创建玩家
    this.player = this.add.rectangle(400, 300, 30, 30, 0x4ecdc4);
    this.playerVelocity = { x: 0, y: 0 };
    this.playerSpeed = 300;
    this.acceleration = 1000;
    this.friction = 500;

    // 输入设置
    this.cursors = this.input.keyboard.createCursorKeys();
    this.wasd = this.input.keyboard.addKeys('W,S,A,D');
    this.shiftKey = this.input.keyboard.addKey('SHIFT');

    // 信息显示
    this.infoText = this.add.text(20, 20, '', {
        fontSize: '16px',
        fill: '#ffffff'
    });
}

update() {
    const deltaTime = this.game.loop.delta / 1000;
    let inputX = 0;
    let inputY = 0;

    // 检测输入
    if (this.cursors.left.isDown || this.wasd.A.isDown) inputX = -1;
    if (this.cursors.right.isDown || this.wasd.D.isDown) inputX = 1;
    if (this.cursors.up.isDown || this.wasd.W.isDown) inputY = -1;
    if (this.cursors.down.isDown || this.wasd.S.isDown) inputY = 1;

    // 冲刺功能
    const currentSpeed = this.shiftKey.isDown ? this.playerSpeed * 2 : this.playerSpeed;

    // 加速度处理
    if (inputX !== 0) {
        this.playerVelocity.x += inputX * this.acceleration * deltaTime;
        this.playerVelocity.x = Phaser.Math.Clamp(this.playerVelocity.x, -currentSpeed, currentSpeed);
    } else {
        // 摩擦力
        if (Math.abs(this.playerVelocity.x) > 0) {
            const friction = this.friction * deltaTime;
            if (this.playerVelocity.x > 0) {
                this.playerVelocity.x = Math.max(0, this.playerVelocity.x - friction);
            } else {
                this.playerVelocity.x = Math.min(0, this.playerVelocity.x + friction);
            }
        }
    }

    if (inputY !== 0) {
        this.playerVelocity.y += inputY * this.acceleration * deltaTime;
        this.playerVelocity.y = Phaser.Math.Clamp(this.playerVelocity.y, -currentSpeed, currentSpeed);
    } else {
        if (Math.abs(this.playerVelocity.y) > 0) {
            const friction = this.friction * deltaTime;
            if (this.playerVelocity.y > 0) {
                this.playerVelocity.y = Math.max(0, this.playerVelocity.y - friction);
            } else {
                this.playerVelocity.y = Math.min(0, this.playerVelocity.y + friction);
            }
        }
    }

    // 应用移动
    this.player.x += this.playerVelocity.x * deltaTime;
    this.player.y += this.playerVelocity.y * deltaTime;

    // 边界限制
    this.player.x = Phaser.Math.Clamp(this.player.x, 15, 785);
    this.player.y = Phaser.Math.Clamp(this.player.y, 15, 585);

    // 更新信息显示
    const speed = Math.sqrt(this.playerVelocity.x ** 2 + this.playerVelocity.y ** 2);
    this.infoText.setText([
        `位置: (${Math.round(this.player.x)}, ${Math.round(this.player.y)})`,
        `速度: ${Math.round(speed)}`,
        `冲刺: ${this.shiftKey.isDown ? '开启' : '关闭'}`
    ]);
}
```

</details>

---

## 🎯 综合项目: 简单收集游戏

### 项目描述

创建一个完整的小游戏，结合今天学到的所有知识点。

### 游戏要求

1. **玩家控制**: 使用键盘控制角色移动
2. **收集系统**: 在场景中放置可收集的物品
3. **计分系统**: 收集物品获得分数
4. **动画效果**: 收集时的视觉反馈
5. **游戏结束**: 收集完所有物品显示胜利信息
6. **重置功能**: 按键重新开始游戏

### 技术要点

- 场景管理和生命周期
- 用户输入处理
- 碰撞检测
- 动画系统
- UI界面

### 扩展功能（可选）

- 添加时间限制
- 实现不同类型的收集品
- 添加障碍物
- 实现多关卡系统
- 添加音效

---

## 📝 学习检查清单

完成练习后，请检查你是否掌握了以下知识点：

### 基础概念

- [ ] 理解Phaser.js的基本架构
- [ ] 掌握游戏配置对象的使用
- [ ] 了解场景系统的工作原理
- [ ] 理解游戏循环的概念

### 场景生命周期

- [ ] 掌握preload()方法的作用
- [ ] 理解create()方法的用途
- [ ] 会使用update()方法处理游戏逻辑

### 游戏对象

- [ ] 会创建和管理文本对象
- [ ] 掌握Graphics对象的使用
- [ ] 理解精灵对象的概念
- [ ] 会设置对象的属性和样式

### 用户交互

- [ ] 掌握键盘输入处理
- [ ] 会处理鼠标点击事件
- [ ] 理解事件系统的工作原理

### 动画系统

- [ ] 会使用Tween动画
- [ ] 掌握基本的动画效果
- [ ] 理解动画的生命周期

### 调试技巧

- [ ] 会使用浏览器开发者工具
- [ ] 掌握console.log的使用
- [ ] 了解基本的错误排查方法

---

## 🚀 下一步学习

恭喜你完成了Day 1的所有练习！明天我们将学习：

- **精灵系统**: 加载和管理图片资源
- **动画序列**: 创建复杂的角色动画
- **资源管理**: 优化游戏资源加载
- **用户体验**: 提升游戏的交互感受

继续保持学习的热情，你已经迈出了游戏开发的第一步！🎉

# Day 2 练习题 - 精灵与动画系统

> 🎯 通过这些练习，你将深入掌握Phaser.js的精灵系统和动画技术

---

## 📋 练习说明

每个练习都有不同的难度等级：
- ⭐ 基础练习 - 掌握基本概念
- ⭐⭐ 进阶练习 - 需要综合运用
- ⭐⭐⭐ 挑战练习 - 考验创新能力

完成练习后，可以对照提供的解决方案检查你的实现。

---

## 练习 1: 基础精灵创建 ⭐

### 目标
创建一个简单的精灵对象，并为其添加基本的属性和行为。

### 要求
1. 创建一个彩色圆形精灵
2. 设置精灵的位置、缩放和透明度
3. 添加鼠标点击交互
4. 点击时改变精灵的颜色

### 提示
```javascript
// 创建程序化纹理
this.add.graphics()
    .fillStyle(0x4ecdc4)
    .fillCircle(16, 16, 14)
    .generateTexture('my-sprite', 32, 32);

// 创建精灵
const sprite = this.add.sprite(x, y, 'my-sprite');
sprite.setInteractive();
sprite.on('pointerdown', () => {
    sprite.setTint(Phaser.Math.Between(0x000000, 0xffffff));
});
```

### 扩展挑战
- 添加鼠标悬停效果
- 实现精灵的拖拽功能
- 添加双击事件处理

<details>
<summary>💡 查看解决方案</summary>

```javascript
create() {
    // 创建多个颜色的纹理
    const colors = [0x4ecdc4, 0xff6b6b, 0x45b7d1, 0x96ceb4, 0x6c5ce7];
    
    colors.forEach((color, index) => {
        this.add.graphics()
            .fillStyle(color)
            .fillCircle(16, 16, 14)
            .lineStyle(2, 0xffffff)
            .strokeCircle(16, 16, 14)
            .generateTexture(`sprite-${index}`, 32, 32);
    });
    
    // 创建精灵
    this.sprite = this.add.sprite(400, 300, 'sprite-0');
    this.sprite.setScale(2);
    this.sprite.setInteractive();
    
    let currentColorIndex = 0;
    
    // 点击事件
    this.sprite.on('pointerdown', () => {
        currentColorIndex = (currentColorIndex + 1) % colors.length;
        this.sprite.setTexture(`sprite-${currentColorIndex}`);
        
        // 点击动画
        this.tweens.add({
            targets: this.sprite,
            scaleX: 2.5,
            scaleY: 2.5,
            duration: 100,
            yoyo: true
        });
    });
    
    // 悬停效果
    this.sprite.on('pointerover', () => {
        this.sprite.setScale(2.2);
    });
    
    this.sprite.on('pointerout', () => {
        this.sprite.setScale(2);
    });
}
```
</details>

---

## 练习 2: 精灵图动画 ⭐⭐

### 目标
创建一个精灵图，并为其制作流畅的动画序列。

### 要求
1. 创建一个4帧的旋转动画精灵图
2. 配置动画播放参数
3. 实现动画的播放、暂停、重启控制
4. 添加动画完成事件处理

### 提示
```javascript
// 创建精灵图帧
for (let i = 0; i < 4; i++) {
    const graphics = this.add.graphics();
    const angle = (i / 4) * Math.PI * 2;
    
    // 绘制旋转的形状
    graphics.fillStyle(0x4ecdc4);
    graphics.fillRect(-8, -16, 16, 32);
    graphics.setRotation(angle);
    
    graphics.generateTexture(`rotation-${i}`, 32, 32);
}

// 创建动画
this.anims.create({
    key: 'rotate',
    frames: [
        { key: 'rotation-0' },
        { key: 'rotation-1' },
        { key: 'rotation-2' },
        { key: 'rotation-3' }
    ],
    frameRate: 8,
    repeat: -1
});
```

### 扩展挑战
- 创建多个不同的动画状态
- 实现动画之间的平滑切换
- 添加动画速度控制

<details>
<summary>💡 查看解决方案</summary>

```javascript
create() {
    // 创建旋转动画帧
    this.createRotationFrames();
    
    // 创建缩放动画帧
    this.createScaleFrames();
    
    // 创建动画配置
    this.anims.create({
        key: 'rotate',
        frames: this.anims.generateFrameNames('rotation', { 
            prefix: 'frame-', start: 0, end: 7 
        }),
        frameRate: 12,
        repeat: -1
    });
    
    this.anims.create({
        key: 'scale',
        frames: this.anims.generateFrameNames('scale', { 
            prefix: 'frame-', start: 0, end: 5 
        }),
        frameRate: 8,
        repeat: -1
    });
    
    // 创建精灵
    this.animatedSprite = this.add.sprite(400, 300, 'rotation-frame-0');
    this.animatedSprite.setScale(2);
    this.animatedSprite.play('rotate');
    
    // 控制按钮
    this.createControlButtons();
}

createRotationFrames() {
    const canvas = this.add.renderTexture(0, 0, 256, 32);
    
    for (let i = 0; i < 8; i++) {
        const graphics = this.add.graphics();
        const angle = (i / 8) * Math.PI * 2;
        
        graphics.fillStyle(0x4ecdc4);
        graphics.fillRect(0, 0, 24, 24);
        graphics.setRotation(angle);
        graphics.setPosition(16, 16);
        
        canvas.draw(graphics, i * 32, 0);
        graphics.destroy();
    }
    
    canvas.saveTexture('rotation');
    canvas.destroy();
}

createScaleFrames() {
    const canvas = this.add.renderTexture(0, 0, 192, 32);
    
    for (let i = 0; i < 6; i++) {
        const graphics = this.add.graphics();
        const scale = 0.5 + (Math.sin(i * Math.PI / 3) * 0.5);
        
        graphics.fillStyle(0xff6b6b);
        graphics.fillCircle(16, 16, 12 * scale);
        
        canvas.draw(graphics, i * 32, 0);
        graphics.destroy();
    }
    
    canvas.saveTexture('scale');
    canvas.destroy();
}

createControlButtons() {
    // 播放按钮
    const playBtn = this.add.text(100, 500, '播放', { 
        fontSize: '20px', fill: '#4ecdc4' 
    }).setInteractive();
    
    playBtn.on('pointerdown', () => {
        this.animatedSprite.play('rotate');
    });
    
    // 暂停按钮
    const pauseBtn = this.add.text(200, 500, '暂停', { 
        fontSize: '20px', fill: '#ff6b6b' 
    }).setInteractive();
    
    pauseBtn.on('pointerdown', () => {
        this.animatedSprite.anims.pause();
    });
    
    // 切换动画按钮
    const switchBtn = this.add.text(300, 500, '切换', { 
        fontSize: '20px', fill: '#45b7d1' 
    }).setInteractive();
    
    switchBtn.on('pointerdown', () => {
        const currentAnim = this.animatedSprite.anims.currentAnim;
        if (currentAnim && currentAnim.key === 'rotate') {
            this.animatedSprite.play('scale');
        } else {
            this.animatedSprite.play('rotate');
        }
    });
}
```
</details>

---

## 练习 3: 角色控制系统 ⭐⭐

### 目标
创建一个完整的角色控制系统，包含多种移动状态和动画。

### 要求
1. 创建一个可控制的角色精灵
2. 实现待机、行走、跑步三种状态
3. 根据输入速度自动切换状态
4. 添加方向翻转和平滑移动

### 提示
```javascript
// 在update方法中处理状态切换
update() {
    let speed = 0;
    
    if (this.cursors.left.isDown) {
        this.player.setVelocityX(-200);
        this.player.setFlipX(true);
        speed = 200;
    } else if (this.cursors.right.isDown) {
        this.player.setVelocityX(200);
        this.player.setFlipX(false);
        speed = 200;
    } else {
        this.player.setVelocityX(0);
        speed = 0;
    }
    
    // 状态切换逻辑
    if (speed === 0) {
        this.player.play('idle', true);
    } else if (speed < 150) {
        this.player.play('walk', true);
    } else {
        this.player.play('run', true);
    }
}
```

### 扩展挑战
- 添加跳跃状态和动画
- 实现输入缓冲系统
- 添加角色技能动画

<details>
<summary>💡 查看解决方案</summary>

```javascript
class CharacterController {
    constructor(scene, x, y) {
        this.scene = scene;
        this.createCharacterSprites();
        this.createAnimations();
        
        this.player = scene.add.sprite(x, y, 'character-idle');
        this.player.setScale(2);
        
        this.state = 'idle';
        this.speed = 250;
        this.isGrounded = true;
        
        // 输入缓冲
        this.inputBuffer = {
            jump: 0,
            attack: 0
        };
    }
    
    createCharacterSprites() {
        // 待机动画帧
        for (let i = 0; i < 4; i++) {
            const graphics = this.scene.add.graphics();
            const breathe = 1 + Math.sin(i * Math.PI / 2) * 0.1;
            
            graphics.fillStyle(0x4ecdc4);
            graphics.fillEllipse(16, 16, 20, 24 * breathe);
            graphics.fillStyle(0xffffff);
            graphics.fillCircle(12, 12, 2);
            graphics.fillCircle(20, 12, 2);
            
            graphics.generateTexture(`character-idle-${i}`, 32, 32);
        }
        
        // 行走动画帧
        for (let i = 0; i < 6; i++) {
            const graphics = this.scene.add.graphics();
            const bob = Math.sin(i * Math.PI / 3) * 2;
            
            graphics.fillStyle(0x45b7d1);
            graphics.fillEllipse(16, 16 + bob, 20, 24);
            graphics.fillStyle(0xffffff);
            graphics.fillCircle(12, 12 + bob, 2);
            graphics.fillCircle(20, 12 + bob, 2);
            
            graphics.generateTexture(`character-walk-${i}`, 32, 32);
        }
        
        // 跑步动画帧
        for (let i = 0; i < 8; i++) {
            const graphics = this.scene.add.graphics();
            const lean = Math.sin(i * Math.PI / 4) * 3;
            
            graphics.fillStyle(0x96ceb4);
            graphics.fillEllipse(16 + lean, 16, 20, 24);
            graphics.fillStyle(0xffffff);
            graphics.fillCircle(12 + lean, 12, 2);
            graphics.fillCircle(20 + lean, 12, 2);
            
            graphics.generateTexture(`character-run-${i}`, 32, 32);
        }
    }
    
    createAnimations() {
        // 待机动画
        this.scene.anims.create({
            key: 'character-idle',
            frames: this.scene.anims.generateFrameNumbers('character-idle', { 
                start: 0, end: 3 
            }),
            frameRate: 4,
            repeat: -1
        });
        
        // 行走动画
        this.scene.anims.create({
            key: 'character-walk',
            frames: this.scene.anims.generateFrameNumbers('character-walk', { 
                start: 0, end: 5 
            }),
            frameRate: 10,
            repeat: -1
        });
        
        // 跑步动画
        this.scene.anims.create({
            key: 'character-run',
            frames: this.scene.anims.generateFrameNumbers('character-run', { 
                start: 0, end: 7 
            }),
            frameRate: 15,
            repeat: -1
        });
    }
    
    update(cursors, deltaTime) {
        // 更新输入缓冲
        this.updateInputBuffer(deltaTime);
        
        // 处理水平移动
        this.handleMovement(cursors);
        
        // 处理跳跃
        this.handleJump(cursors);
        
        // 更新状态和动画
        this.updateState();
    }
    
    updateInputBuffer(deltaTime) {
        this.inputBuffer.jump = Math.max(0, this.inputBuffer.jump - deltaTime);
        this.inputBuffer.attack = Math.max(0, this.inputBuffer.attack - deltaTime);
    }
    
    handleMovement(cursors) {
        let velocityX = 0;
        
        if (cursors.left.isDown) {
            velocityX = -this.speed;
            this.player.setFlipX(true);
        } else if (cursors.right.isDown) {
            velocityX = this.speed;
            this.player.setFlipX(false);
        }
        
        // 平滑移动
        const currentVelocity = this.player.body ? this.player.body.velocity.x : 0;
        const targetVelocity = velocityX;
        const smoothedVelocity = Phaser.Math.Linear(currentVelocity, targetVelocity, 0.1);
        
        if (this.player.body) {
            this.player.body.setVelocityX(smoothedVelocity);
        }
    }
    
    handleJump(cursors) {
        if (cursors.up.isDown && !cursors.up.wasDown) {
            this.inputBuffer.jump = 150; // 150ms缓冲
        }
        
        if (this.inputBuffer.jump > 0 && this.isGrounded) {
            if (this.player.body) {
                this.player.body.setVelocityY(-400);
            }
            this.isGrounded = false;
            this.inputBuffer.jump = 0;
        }
    }
    
    updateState() {
        const velocityX = this.player.body ? Math.abs(this.player.body.velocity.x) : 0;
        let newState = 'idle';
        
        if (!this.isGrounded) {
            newState = 'jump';
        } else if (velocityX > 150) {
            newState = 'run';
        } else if (velocityX > 10) {
            newState = 'walk';
        }
        
        if (newState !== this.state) {
            this.state = newState;
            this.player.play(`character-${this.state}`);
        }
    }
}
```
</details>

---

## 练习 4: 粒子系统特效 ⭐⭐⭐

### 目标
创建一个完整的粒子系统，为游戏添加丰富的视觉效果。

### 要求
1. 创建跳跃、着陆、收集等不同类型的粒子效果
2. 实现粒子的生命周期管理
3. 添加粒子的物理属性（重力、速度、阻力）
4. 创建可重用的粒子效果管理器

### 提示
```javascript
// 创建粒子发射器
const particles = this.add.particles(0, 0, 'particle-texture', {
    speed: { min: 50, max: 150 },
    scale: { start: 1, end: 0 },
    lifespan: 600,
    gravityY: 200,
    emitting: false
});

// 在需要时发射粒子
particles.emitParticleAt(x, y, quantity);
```

### 扩展挑战
- 实现粒子的颜色渐变
- 添加粒子碰撞检测
- 创建复杂的粒子动画序列

<details>
<summary>💡 查看解决方案</summary>

```javascript
class ParticleEffectManager {
    constructor(scene) {
        this.scene = scene;
        this.effects = new Map();
        this.createParticleTextures();
        this.setupEffects();
    }
    
    createParticleTextures() {
        // 圆形粒子
        this.scene.add.graphics()
            .fillStyle(0xffffff)
            .fillCircle(4, 4, 3)
            .generateTexture('particle-circle', 8, 8);
        
        // 方形粒子
        this.scene.add.graphics()
            .fillStyle(0xffffff)
            .fillRect(0, 0, 6, 6)
            .generateTexture('particle-square', 6, 6);
        
        // 星形粒子
        const starGraphics = this.scene.add.graphics();
        this.drawStar(starGraphics, 6, 6, 5, 5, 2);
        starGraphics.generateTexture('particle-star', 12, 12);
    }
    
    drawStar(graphics, x, y, points, outerRadius, innerRadius) {
        graphics.fillStyle(0xffffff);
        graphics.beginPath();
        
        for (let i = 0; i < points * 2; i++) {
            const angle = (i * Math.PI) / points;
            const radius = i % 2 === 0 ? outerRadius : innerRadius;
            const px = x + Math.cos(angle) * radius;
            const py = y + Math.sin(angle) * radius;
            
            if (i === 0) {
                graphics.moveTo(px, py);
            } else {
                graphics.lineTo(px, py);
            }
        }
        
        graphics.closePath();
        graphics.fillPath();
    }
    
    setupEffects() {
        // 跳跃效果
        this.effects.set('jump', this.scene.add.particles(0, 0, 'particle-circle', {
            speed: { min: 50, max: 100 },
            scale: { start: 0.8, end: 0 },
            alpha: { start: 1, end: 0 },
            lifespan: 400,
            quantity: 5,
            angle: { min: 200, max: 340 },
            emitting: false,
            tint: 0x4ecdc4
        }));
        
        // 着陆效果
        this.effects.set('landing', this.scene.add.particles(0, 0, 'particle-square', {
            speed: { min: 30, max: 80 },
            scale: { start: 0.6, end: 0.2 },
            alpha: { start: 0.8, end: 0 },
            lifespan: 800,
            quantity: 8,
            gravityY: 200,
            angle: { min: 250, max: 290 },
            emitting: false,
            tint: 0x8b4513
        }));
        
        // 收集效果
        this.effects.set('collect', this.scene.add.particles(0, 0, 'particle-star', {
            speed: { min: 100, max: 200 },
            scale: { start: 1, end: 0 },
            alpha: { start: 1, end: 0 },
            lifespan: 500,
            quantity: 12,
            angle: { min: 0, max: 360 },
            emitting: false,
            tint: 0xffd700
        }));
        
        // 爆炸效果
        this.effects.set('explosion', this.scene.add.particles(0, 0, 'particle-circle', {
            speed: { min: 150, max: 300 },
            scale: { start: 1.5, end: 0 },
            alpha: { start: 1, end: 0 },
            lifespan: 600,
            quantity: 20,
            angle: { min: 0, max: 360 },
            emitting: false,
            tint: [0xff6b6b, 0xff9f43, 0xffd93d]
        }));
        
        // 拖尾效果
        this.effects.set('trail', this.scene.add.particles(0, 0, 'particle-circle', {
            speed: { min: 20, max: 50 },
            scale: { start: 0.5, end: 0 },
            alpha: { start: 0.6, end: 0 },
            lifespan: 300,
            frequency: 50,
            emitting: false,
            tint: 0x45b7d1
        }));
    }
    
    // 播放效果
    playEffect(effectName, x, y, config = {}) {
        const effect = this.effects.get(effectName);
        if (!effect) {
            console.warn(`粒子效果 '${effectName}' 不存在`);
            return;
        }
        
        // 应用自定义配置
        if (config.tint) {
            effect.setTint(config.tint);
        }
        
        if (config.scale) {
            effect.setScale(config.scale);
        }
        
        // 发射粒子
        effect.emitParticleAt(x, y, config.quantity || effect.quantity.propertyValue);
        
        return effect;
    }
    
    // 开始拖尾效果
    startTrail(target, effectName = 'trail') {
        const effect = this.effects.get(effectName);
        if (effect) {
            effect.startFollow(target);
            effect.start();
        }
    }
    
    // 停止拖尾效果
    stopTrail(effectName = 'trail') {
        const effect = this.effects.get(effectName);
        if (effect) {
            effect.stop();
            effect.stopFollow();
        }
    }
    
    // 创建自定义效果
    createCustomEffect(name, texture, config) {
        const effect = this.scene.add.particles(0, 0, texture, {
            emitting: false,
            ...config
        });
        
        this.effects.set(name, effect);
        return effect;
    }
    
    // 清理所有效果
    destroy() {
        this.effects.forEach(effect => {
            effect.destroy();
        });
        this.effects.clear();
    }
}

// 使用示例
create() {
    this.particleManager = new ParticleEffectManager(this);
    
    // 创建测试按钮
    this.createTestButtons();
}

createTestButtons() {
    const effects = ['jump', 'landing', 'collect', 'explosion'];
    
    effects.forEach((effect, index) => {
        const button = this.add.text(50, 100 + index * 40, effect, {
            fontSize: '20px',
            fill: '#4ecdc4',
            backgroundColor: '#2c3e50',
            padding: { x: 10, y: 5 }
        }).setInteractive();
        
        button.on('pointerdown', () => {
            this.particleManager.playEffect(effect, 400, 300);
        });
    });
}
```
</details>

---

## 练习 5: 高级动画状态机 ⭐⭐⭐

### 目标
创建一个完整的动画状态机系统，支持复杂的状态转换和条件判断。

### 要求
1. 设计一个状态机架构
2. 实现状态之间的转换条件
3. 添加状态进入和退出事件
4. 支持状态优先级和中断机制

### 提示
```javascript
class AnimationStateMachine {
    constructor(sprite) {
        this.sprite = sprite;
        this.states = new Map();
        this.currentState = null;
        this.previousState = null;
    }
    
    addState(name, config) {
        this.states.set(name, {
            animation: config.animation,
            canTransitionTo: config.canTransitionTo || [],
            onEnter: config.onEnter || (() => {}),
            onExit: config.onExit || (() => {}),
            priority: config.priority || 0
        });
    }
    
    changeState(newStateName) {
        const newState = this.states.get(newStateName);
        if (!newState) return false;
        
        // 检查是否可以转换
        if (this.currentState && 
            !this.currentState.canTransitionTo.includes(newStateName)) {
            return false;
        }
        
        // 执行状态转换
        if (this.currentState) {
            this.currentState.onExit();
        }
        
        this.previousState = this.currentState;
        this.currentState = newState;
        
        this.sprite.play(newState.animation);
        newState.onEnter();
        
        return true;
    }
}
```

### 扩展挑战
- 添加状态转换动画
- 实现状态历史记录
- 支持并行状态执行

<details>
<summary>💡 查看解决方案</summary>

```javascript
class AdvancedAnimationStateMachine {
    constructor(sprite, scene) {
        this.sprite = sprite;
        this.scene = scene;
        this.states = new Map();
        this.transitions = new Map();
        this.currentState = null;
        this.previousState = null;
        this.stateHistory = [];
        this.globalConditions = new Map();
        this.isTransitioning = false;
        this.transitionDuration = 200;
    }
    
    // 添加状态
    addState(name, config) {
        const state = {
            name: name,
            animation: config.animation,
            priority: config.priority || 0,
            canInterrupt: config.canInterrupt !== false,
            loop: config.loop !== false,
            onEnter: config.onEnter || (() => {}),
            onUpdate: config.onUpdate || (() => {}),
            onExit: config.onExit || (() => {}),
            conditions: config.conditions || {},
            minDuration: config.minDuration || 0,
            maxDuration: config.maxDuration || Infinity,
            entryTime: 0
        };
        
        this.states.set(name, state);
        return this;
    }
    
    // 添加状态转换
    addTransition(fromState, toState, condition) {
        const key = `${fromState}->${toState}`;
        this.transitions.set(key, {
            from: fromState,
            to: toState,
            condition: condition,
            onTransition: null
        });
        return this;
    }
    
    // 添加全局条件
    addGlobalCondition(name, conditionFn) {
        this.globalConditions.set(name, conditionFn);
        return this;
    }
    
    // 设置初始状态
    start(initialState) {
        const state = this.states.get(initialState);
        if (state) {
            this.currentState = state;
            this.currentState.entryTime = this.scene.time.now;
            this.sprite.play(state.animation);
            state.onEnter();
            this.addToHistory(initialState);
        }
        return this;
    }
    
    // 更新状态机
    update(deltaTime) {
        if (!this.currentState || this.isTransitioning) return;
        
        // 更新当前状态
        this.currentState.onUpdate(deltaTime);
        
        // 检查状态持续时间
        const stateTime = this.scene.time.now - this.currentState.entryTime;
        
        // 检查最大持续时间
        if (stateTime >= this.currentState.maxDuration) {
            this.tryTransition('timeout');
            return;
        }
        
        // 检查最小持续时间
        if (stateTime < this.currentState.minDuration) {
            return;
        }
        
        // 检查转换条件
        this.checkTransitions();
    }
    
    // 检查转换条件
    checkTransitions() {
        // 按优先级排序可能的转换
        const possibleTransitions = [];
        
        this.transitions.forEach((transition, key) => {
            if (transition.from === this.currentState.name) {
                const toState = this.states.get(transition.to);
                if (toState && this.evaluateCondition(transition.condition)) {
                    possibleTransitions.push({
                        ...transition,
                        priority: toState.priority
                    });
                }
            }
        });
        
        // 按优先级排序
        possibleTransitions.sort((a, b) => b.priority - a.priority);
        
        // 执行最高优先级的转换
        if (possibleTransitions.length > 0) {
            this.executeTransition(possibleTransitions[0]);
        }
    }
    
    // 评估条件
    evaluateCondition(condition) {
        if (typeof condition === 'function') {
            return condition();
        }
        
        if (typeof condition === 'string') {
            const globalCondition = this.globalConditions.get(condition);
            return globalCondition ? globalCondition() : false;
        }
        
        if (typeof condition === 'object') {
            // 支持复合条件
            if (condition.and) {
                return condition.and.every(c => this.evaluateCondition(c));
            }
            
            if (condition.or) {
                return condition.or.some(c => this.evaluateCondition(c));
            }
            
            if (condition.not) {
                return !this.evaluateCondition(condition.not);
            }
        }
        
        return false;
    }
    
    // 执行转换
    executeTransition(transition) {
        if (!this.currentState.canInterrupt && this.sprite.anims.isPlaying) {
            return;
        }
        
        const newState = this.states.get(transition.to);
        if (!newState) return;
        
        this.isTransitioning = true;
        
        // 执行转换动画
        this.performTransitionAnimation(transition, () => {
            // 退出当前状态
            if (this.currentState) {
                this.currentState.onExit();
            }
            
            // 进入新状态
            this.previousState = this.currentState;
            this.currentState = newState;
            this.currentState.entryTime = this.scene.time.now;
            
            this.sprite.play(newState.animation);
            newState.onEnter();
            
            this.addToHistory(newState.name);
            this.isTransitioning = false;
            
            // 执行转换回调
            if (transition.onTransition) {
                transition.onTransition();
            }
        });
    }
    
    // 执行转换动画
    performTransitionAnimation(transition, onComplete) {
        // 简单的淡入淡出效果
        this.scene.tweens.add({
            targets: this.sprite,
            alpha: 0,
            duration: this.transitionDuration / 2,
            onComplete: () => {
                this.scene.tweens.add({
                    targets: this.sprite,
                    alpha: 1,
                    duration: this.transitionDuration / 2,
                    onComplete: onComplete
                });
            }
        });
    }
    
    // 强制转换状态
    forceState(stateName) {
        const state = this.states.get(stateName);
        if (!state) return false;
        
        if (this.currentState) {
            this.currentState.onExit();
        }
        
        this.previousState = this.currentState;
        this.currentState = state;
        this.currentState.entryTime = this.scene.time.now;
        
        this.sprite.play(state.animation);
        state.onEnter();
        
        this.addToHistory(stateName);
        return true;
    }
    
    // 添加到历史记录
    addToHistory(stateName) {
        this.stateHistory.push({
            state: stateName,
            timestamp: this.scene.time.now
        });
        
        // 限制历史记录长度
        if (this.stateHistory.length > 10) {
            this.stateHistory.shift();
        }
    }
    
    // 获取当前状态信息
    getCurrentState() {
        return this.currentState ? this.currentState.name : null;
    }
    
    // 获取状态历史
    getStateHistory() {
        return [...this.stateHistory];
    }
    
    // 检查是否在指定状态
    isInState(stateName) {
        return this.currentState && this.currentState.name === stateName;
    }
    
    // 检查是否可以转换到指定状态
    canTransitionTo(stateName) {
        if (!this.currentState) return false;
        
        const key = `${this.currentState.name}->${stateName}`;
        const transition = this.transitions.get(key);
        
        return transition && this.evaluateCondition(transition.condition);
    }
    
    // 销毁状态机
    destroy() {
        this.states.clear();
        this.transitions.clear();
        this.globalConditions.clear();
        this.stateHistory = [];
        this.currentState = null;
        this.previousState = null;
    }
}

// 使用示例
create() {
    // 创建角色精灵
    this.player = this.add.sprite(400, 300, 'player');
    
    // 创建状态机
    this.stateMachine = new AdvancedAnimationStateMachine(this.player, this);
    
    // 添加状态
    this.stateMachine
        .addState('idle', {
            animation: 'player-idle',
            priority: 0,
            onEnter: () => console.log('进入待机状态'),
            onExit: () => console.log('退出待机状态')
        })
        .addState('walk', {
            animation: 'player-walk',
            priority: 1,
            onEnter: () => console.log('进入行走状态')
        })
        .addState('run', {
            animation: 'player-run',
            priority: 2,
            onEnter: () => console.log('进入跑步状态')
        })
        .addState('jump', {
            animation: 'player-jump',
            priority: 3,
            canInterrupt: false,
            minDuration: 300,
            onEnter: () => console.log('进入跳跃状态')
        });
    
    // 添加全局条件
    this.stateMachine
        .addGlobalCondition('isMoving', () => {
            return this.cursors.left.isDown || this.cursors.right.isDown;
        })
        .addGlobalCondition('isRunning', () => {
            return (this.cursors.left.isDown || this.cursors.right.isDown) && 
                   this.cursors.shift.isDown;
        })
        .addGlobalCondition('isJumping', () => {
            return this.cursors.up.isDown && !this.cursors.up.wasDown;
        });
    
    // 添加转换
    this.stateMachine
        .addTransition('idle', 'walk', 'isMoving')
        .addTransition('idle', 'jump', 'isJumping')
        .addTransition('walk', 'idle', () => !this.stateMachine.globalConditions.get('isMoving')())
        .addTransition('walk', 'run', 'isRunning')
        .addTransition('walk', 'jump', 'isJumping')
        .addTransition('run', 'walk', () => !this.stateMachine.globalConditions.get('isRunning')())
        .addTransition('run', 'jump', 'isJumping')
        .addTransition('jump', 'idle', 'timeout');
    
    // 启动状态机
    this.stateMachine.start('idle');
    
    // 设置输入
    this.cursors = this.input.keyboard.createCursorKeys();
    this.cursors.shift = this.input.keyboard.addKey('SHIFT');
}

update(time, delta) {
    this.stateMachine.update(delta);
}
```
</details>

---

## 🎯 综合项目: 平台跳跃角色

### 项目描述
创建一个完整的平台跳跃游戏角色，集成今天学到的所有技术。

### 游戏要求
1. **角色系统**: 完整的角色控制和动画状态机
2. **物理系统**: 重力、跳跃、碰撞检测
3. **视觉效果**: 粒子系统、动画过渡、视觉反馈
4. **交互系统**: 收集品、平台、特殊道具
5. **性能优化**: 对象池、视口剔除、资源管理

### 技术要点
- 高级精灵图动画
- 复杂状态机实现
- 粒子系统集成
- 输入缓冲优化
- 性能监控

### 扩展功能（可选）
- 多种角色能力
- 环境交互元素
- 动态难度调整
- 成就系统

---

## 📝 学习检查清单

完成练习后，请检查你是否掌握了以下知识点：

### 精灵系统
- [ ] 理解精灵的创建和管理
- [ ] 掌握精灵图的制作和使用
- [ ] 会设置精灵的各种属性
- [ ] 了解精灵的生命周期

### 动画系统
- [ ] 掌握动画配置的创建
- [ ] 理解帧动画的原理
- [ ] 会实现动画状态切换
- [ ] 了解动画事件处理

### 高级技术
- [ ] 掌握状态机的设计和实现
- [ ] 理解粒子系统的使用
- [ ] 会优化动画性能
- [ ] 了解输入缓冲技术

### 视觉效果
- [ ] 会创建各种粒子效果
- [ ] 掌握动画过渡技巧
- [ ] 理解视觉反馈的重要性
- [ ] 会设计吸引人的特效

### 性能优化
- [ ] 了解对象池的概念
- [ ] 掌握资源管理技巧
- [ ] 会监控和分析性能
- [ ] 理解优化的最佳实践

---

## 🚀 下一步学习

恭喜你完成了Day 2的所有练习！明天我们将学习：

- **Tilemap系统**: 创建复杂的游戏世界
- **物理引擎**: 深入理解碰撞和物理模拟
- **关卡设计**: 设计有趣的游戏关卡
- **实践项目**: 制作一个完整的平台跳跃游戏

你已经掌握了精灵和动画的核心技术，继续加油！🎨

---

> 💡 **学习提示**: 精灵和动画是游戏视觉表现的核心，多尝试不同的动画效果和状态切换，培养良好的视觉设计感觉。
> 
> 🎨 **创意建议**: 可以尝试制作不同风格的角色动画，如机械风、魔法风或科幻风格，体验不同的视觉风格。
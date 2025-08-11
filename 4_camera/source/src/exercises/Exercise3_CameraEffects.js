import Phaser from 'phaser'

/**
 * 练习3: 摄像机特效系统
 * 目标: 实现丰富的摄像机特效
 */
export default class Exercise3_CameraEffects extends Phaser.Scene {
    constructor() {
        super({ key: 'Exercise3_CameraEffects' })
        
        this.worldWidth = 1600
        this.worldHeight = 1200
        this.player = null
        this.cursors = null
        this.keys = null
        this.effectButtons = []
    }
    
    preload() {
        this.createTextures()
    }
    
    create() {
        // 设置世界边界
        this.physics.world.setBounds(0, 0, this.worldWidth, this.worldHeight)
        
        // 创建背景
        this.createBackground()
        
        // 创建玩家
        this.createPlayer()
        
        // 设置摄像机
        this.setupCamera()
        
        // 创建控制
        this.setupControls()
        
        // 创建特效按钮
        this.createEffectButtons()
        
        // 创建UI
        this.createUI()
    }
    
    createTextures() {
        // 玩家纹理
        const playerGraphics = this.add.graphics()
        playerGraphics.fillStyle(0xe74c3c)
        playerGraphics.fillRect(0, 0, 32, 32)
        playerGraphics.generateTexture('player_effect', 32, 32)
        playerGraphics.destroy()
        
        // 目标点纹理
        const targetGraphics = this.add.graphics()
        targetGraphics.fillStyle(0xf39c12)
        targetGraphics.fillCircle(16, 16, 16)
        targetGraphics.generateTexture('target', 32, 32)
        targetGraphics.destroy()
        
        // 按钮纹理
        const buttonGraphics = this.add.graphics()
        buttonGraphics.fillStyle(0x3498db)
        buttonGraphics.fillRoundedRect(0, 0, 120, 30, 5)
        buttonGraphics.generateTexture('button', 120, 30)
        buttonGraphics.destroy()
    }
    
    createBackground() {
        // 创建彩色网格背景
        const graphics = this.add.graphics()
        
        // 绘制彩色方块
        for (let x = 0; x < this.worldWidth; x += 100) {
            for (let y = 0; y < this.worldHeight; y += 100) {
                const hue = ((x + y) / 200) % 360
                const color = Phaser.Display.Color.HSVToRGB(hue / 360, 0.3, 0.8)
                graphics.fillStyle(color.color)
                graphics.fillRect(x, y, 100, 100)
                
                // 添加边框
                graphics.lineStyle(2, 0x333333)
                graphics.strokeRect(x, y, 100, 100)
            }
        }
        
        // 添加一些目标点
        this.targets = []
        const targetPositions = [
            { x: 300, y: 300 },
            { x: 800, y: 200 },
            { x: 1200, y: 600 },
            { x: 600, y: 900 },
            { x: 1400, y: 400 }
        ]
        
        targetPositions.forEach(pos => {
            const target = this.add.sprite(pos.x, pos.y, 'target')
            target.setInteractive()
            target.on('pointerdown', () => {
                this.focusOnTarget(target)
            })
            this.targets.push(target)
            
            // 添加脉冲动画
            this.tweens.add({
                targets: target,
                scaleX: { from: 1, to: 1.2 },
                scaleY: { from: 1, to: 1.2 },
                duration: 1000,
                yoyo: true,
                repeat: -1,
                ease: 'Sine.easeInOut'
            })
        })
    }
    
    createPlayer() {
        this.player = this.physics.add.sprite(100, 100, 'player_effect')
        this.player.setCollideWorldBounds(true)
        this.player.setDrag(300)
    }
    
    setupCamera() {
        const camera = this.cameras.main
        camera.setBounds(0, 0, this.worldWidth, this.worldHeight)
        camera.startFollow(this.player, true, 0.1, 0.1)
    }
    
    setupControls() {
        this.cursors = this.input.keyboard.createCursorKeys()
        this.keys = this.input.keyboard.addKeys({
            'W': Phaser.Input.Keyboard.KeyCodes.W,
            'A': Phaser.Input.Keyboard.KeyCodes.A,
            'S': Phaser.Input.Keyboard.KeyCodes.S,
            'D': Phaser.Input.Keyboard.KeyCodes.D,
            'Q': Phaser.Input.Keyboard.KeyCodes.Q,
            'E': Phaser.Input.Keyboard.KeyCodes.E,
            'R': Phaser.Input.Keyboard.KeyCodes.R,
            'T': Phaser.Input.Keyboard.KeyCodes.T,
            'Y': Phaser.Input.Keyboard.KeyCodes.Y,
            'U': Phaser.Input.Keyboard.KeyCodes.U,
            'I': Phaser.Input.Keyboard.KeyCodes.I,
            'O': Phaser.Input.Keyboard.KeyCodes.O,
            'P': Phaser.Input.Keyboard.KeyCodes.P,
            'SPACE': Phaser.Input.Keyboard.KeyCodes.SPACE
        })
    }
    
    createEffectButtons() {
        const buttonConfigs = [
            { text: '震动 (T)', key: 'T', effect: () => this.shakeEffect() },
            { text: '闪光 (Y)', key: 'Y', effect: () => this.flashEffect() },
            { text: '淡出 (U)', key: 'U', effect: () => this.fadeEffect() },
            { text: '缩放 (I)', key: 'I', effect: () => this.zoomEffect() },
            { text: '旋转 (O)', key: 'O', effect: () => this.rotateEffect() },
            { text: '重置 (P)', key: 'P', effect: () => this.resetCamera() }
        ]
        
        buttonConfigs.forEach((config, index) => {
            const button = this.add.sprite(130, 120 + index * 40, 'button')
            button.setScrollFactor(0)
            button.setDepth(100)
            button.setInteractive()
            button.on('pointerdown', config.effect)
            
            const buttonText = this.add.text(button.x, button.y, config.text, {
                fontSize: '12px',
                fill: '#ffffff'
            })
            buttonText.setOrigin(0.5)
            buttonText.setScrollFactor(0)
            buttonText.setDepth(101)
            
            this.effectButtons.push({ button, text: buttonText })
        })
    }
    
    createUI() {
        const instructions = this.add.text(10, 10, 
            '练习3: 摄像机特效系统\n' +
            '方向键/WASD移动玩家\n' +
            'Q/E缩放摄像机\n' +
            '点击橙色目标或使用右侧按钮测试特效\n' +
            '按ESC返回主菜单', {
            fontSize: '14px',
            fill: '#ffffff',
            backgroundColor: '#000000',
            padding: { x: 10, y: 5 }
        })
        instructions.setScrollFactor(0)
        instructions.setDepth(100)
        
        // 摄像机状态信息
        this.cameraStatus = this.add.text(10, this.cameras.main.height - 100, '', {
            fontSize: '12px',
            fill: '#ffffff',
            backgroundColor: '#000000',
            padding: { x: 10, y: 5 }
        })
        this.cameraStatus.setScrollFactor(0)
        this.cameraStatus.setDepth(100)
        
        // ESC键返回
        this.input.keyboard.on('keydown-ESC', () => {
            this.scene.start('GameScene')
        })
    }
    
    // 特效方法
    shakeEffect() {
        this.cameras.main.shake(500, 0.02)
    }
    
    flashEffect() {
        this.cameras.main.flash(300, 255, 255, 255)
    }
    
    fadeEffect() {
        this.cameras.main.fade(1000, 0, 0, 0, false, (camera, progress) => {
            if (progress === 1) {
                // 淡出完成后淡入
                camera.fadeIn(1000)
            }
        })
    }
    
    zoomEffect() {
        const camera = this.cameras.main
        const originalZoom = camera.zoom
        
        this.tweens.add({
            targets: camera,
            zoom: originalZoom * 2,
            duration: 1000,
            yoyo: true,
            ease: 'Power2'
        })
    }
    
    rotateEffect() {
        const camera = this.cameras.main
        
        this.tweens.add({
            targets: camera,
            rotation: camera.rotation + Math.PI * 2,
            duration: 2000,
            ease: 'Power2'
        })
    }
    
    focusOnTarget(target) {
        const camera = this.cameras.main
        
        // 停止跟随玩家
        camera.stopFollow()
        
        // 聚焦到目标
        this.tweens.add({
            targets: camera,
            scrollX: target.x - camera.width / 2,
            scrollY: target.y - camera.height / 2,
            zoom: 2,
            duration: 1500,
            ease: 'Power2',
            onComplete: () => {
                // 2秒后返回跟随玩家
                this.time.delayedCall(2000, () => {
                    this.tweens.add({
                        targets: camera,
                        zoom: 1,
                        duration: 1000,
                        ease: 'Power2',
                        onComplete: () => {
                            camera.startFollow(this.player, true, 0.1, 0.1)
                        }
                    })
                })
            }
        })
    }
    
    resetCamera() {
        const camera = this.cameras.main
        
        // 重置所有摄像机属性
        this.tweens.add({
            targets: camera,
            zoom: 1,
            rotation: 0,
            duration: 1000,
            ease: 'Power2',
            onComplete: () => {
                camera.startFollow(this.player, true, 0.1, 0.1)
            }
        })
    }
    
    update() {
        // 玩家移动
        const speed = 200
        
        if (this.cursors.left.isDown || this.keys.A.isDown) {
            this.player.setVelocityX(-speed)
        } else if (this.cursors.right.isDown || this.keys.D.isDown) {
            this.player.setVelocityX(speed)
        } else {
            this.player.setVelocityX(0)
        }
        
        if (this.cursors.up.isDown || this.keys.W.isDown) {
            this.player.setVelocityY(-speed)
        } else if (this.cursors.down.isDown || this.keys.S.isDown) {
            this.player.setVelocityY(speed)
        } else {
            this.player.setVelocityY(0)
        }
        
        // 手动缩放控制
        const camera = this.cameras.main
        if (this.keys.Q.isDown) {
            camera.zoom = Math.min(3, camera.zoom + 0.02)
        }
        if (this.keys.E.isDown) {
            camera.zoom = Math.max(0.3, camera.zoom - 0.02)
        }
        
        // 快捷键特效
        if (Phaser.Input.Keyboard.JustDown(this.keys.T)) {
            this.shakeEffect()
        }
        if (Phaser.Input.Keyboard.JustDown(this.keys.Y)) {
            this.flashEffect()
        }
        if (Phaser.Input.Keyboard.JustDown(this.keys.U)) {
            this.fadeEffect()
        }
        if (Phaser.Input.Keyboard.JustDown(this.keys.I)) {
            this.zoomEffect()
        }
        if (Phaser.Input.Keyboard.JustDown(this.keys.O)) {
            this.rotateEffect()
        }
        if (Phaser.Input.Keyboard.JustDown(this.keys.P)) {
            this.resetCamera()
        }
        
        // 更新摄像机状态信息
        this.updateCameraStatus()
    }
    
    updateCameraStatus() {
        const camera = this.cameras.main
        this.cameraStatus.setText(
            `摄像机状态:\n` +
            `位置: (${Math.round(camera.scrollX)}, ${Math.round(camera.scrollY)})\n` +
            `缩放: ${camera.zoom.toFixed(2)}\n` +
            `旋转: ${(camera.rotation * 180 / Math.PI).toFixed(1)}°\n` +
            `跟随: ${camera.followTarget ? '玩家' : '无'}`
        )
    }
}
import Phaser from 'phaser'
import { CameraController } from '../controllers/CameraController.js'
import { ParallaxBackground } from '../effects/ParallaxBackground.js'
import { Player } from '../sprites/Player.js'

export default class GameScene extends Phaser.Scene {
    constructor() {
        super({ key: 'GameScene' })
        
        // 游戏世界尺寸
        this.worldWidth = 2400
        this.worldHeight = 1600
        
        // 控制器
        this.cameraController = null
        this.parallaxBg = null
        
        // 游戏对象
        this.player = null
        this.platforms = null
        this.cursors = null
        
        // UI元素
        this.cameraInfo = null
        this.instructions = null
    }
    
    preload() {
        // 创建程序化纹理
        this.createTextures()
        
        // 加载音效（如果需要）
        // this.load.audio('jump', 'assets/sounds/jump.wav')
    }
    
    create() {
        // 设置世界边界
        this.physics.world.setBounds(0, 0, this.worldWidth, this.worldHeight)
        
        // 创建视差背景
        this.createParallaxBackground()
        
        // 创建游戏世界
        this.createWorld()
        
        // 创建玩家
        this.createPlayer()
        
        // 设置摄像机系统
        this.setupCamera()
        
        // 创建控制器
        this.setupControls()
        
        // 创建UI
        this.createUI()
        
        // 设置碰撞检测
        this.setupCollisions()
    }
    
    createTextures() {
        // 创建玩家纹理
        const playerGraphics = this.add.graphics()
        playerGraphics.fillStyle(0x3498db)
        playerGraphics.fillRect(0, 0, 32, 48)
        playerGraphics.generateTexture('player', 32, 48)
        playerGraphics.destroy()
        
        // 创建平台纹理
        const platformGraphics = this.add.graphics()
        platformGraphics.fillStyle(0x2ecc71)
        platformGraphics.fillRect(0, 0, 200, 32)
        platformGraphics.generateTexture('platform', 200, 32)
        platformGraphics.destroy()
        
        // 创建背景纹理
        this.createBackgroundTextures()
    }
    
    createBackgroundTextures() {
        // 天空纹理
        const skyGraphics = this.add.graphics()
        skyGraphics.fillGradientStyle(0x87CEEB, 0x87CEEB, 0xFFFFFF, 0xFFFFFF, 1)
        skyGraphics.fillRect(0, 0, 800, 600)
        skyGraphics.generateTexture('sky', 800, 600)
        skyGraphics.destroy()
        
        // 远山纹理
        const mountainGraphics = this.add.graphics()
        mountainGraphics.fillStyle(0x8B7355)
        mountainGraphics.beginPath()
        mountainGraphics.moveTo(0, 400)
        for (let x = 0; x <= 800; x += 50) {
            const height = 300 + Math.sin(x * 0.01) * 100
            mountainGraphics.lineTo(x, height)
        }
        mountainGraphics.lineTo(800, 600)
        mountainGraphics.lineTo(0, 600)
        mountainGraphics.closePath()
        mountainGraphics.fillPath()
        mountainGraphics.generateTexture('mountains', 800, 600)
        mountainGraphics.destroy()
        
        // 树林纹理
        const treesGraphics = this.add.graphics()
        treesGraphics.fillStyle(0x27ae60)
        for (let x = 0; x < 800; x += 60) {
            const treeHeight = 100 + Math.random() * 50
            treesGraphics.fillRect(x, 600 - treeHeight, 40, treeHeight)
        }
        treesGraphics.generateTexture('trees', 800, 600)
        treesGraphics.destroy()
        
        // 草地纹理
        const grassGraphics = this.add.graphics()
        grassGraphics.fillStyle(0x2ecc71)
        grassGraphics.fillRect(0, 550, 800, 50)
        grassGraphics.generateTexture('grass', 800, 50)
        grassGraphics.destroy()
    }
    
    createParallaxBackground() {
        this.parallaxBg = new ParallaxBackground(this)
        
        // 添加不同层级的背景
        this.parallaxBg.addLayer('sky', 0, -100)      // 天空层，不移动
        this.parallaxBg.addLayer('mountains', 0.1, -90) // 远山，慢速移动
        this.parallaxBg.addLayer('trees', 0.3, -80)     // 树林，中速移动
        this.parallaxBg.addLayer('grass', 0.7, -70)     // 草地，快速移动
    }
    
    createWorld() {
        // 创建平台组
        this.platforms = this.physics.add.staticGroup()
        
        // 创建地面平台
        for (let x = 0; x < this.worldWidth; x += 200) {
            const platform = this.platforms.create(x + 100, this.worldHeight - 50, 'platform')
            platform.setScale(1, 1).refreshBody()
        }
        
        // 创建一些悬浮平台
        const platformPositions = [
            { x: 300, y: 1200 },
            { x: 600, y: 1000 },
            { x: 900, y: 800 },
            { x: 1200, y: 600 },
            { x: 1500, y: 800 },
            { x: 1800, y: 1000 },
            { x: 2100, y: 1200 }
        ]
        
        platformPositions.forEach(pos => {
            const platform = this.platforms.create(pos.x, pos.y, 'platform')
            platform.setScale(1, 1).refreshBody()
        })
        
        // 创建网格背景用于调试
        this.createGridBackground()
    }
    
    createGridBackground() {
        const graphics = this.add.graphics()
        graphics.lineStyle(1, 0x333333, 0.3)
        
        // 绘制垂直线
        for (let x = 0; x <= this.worldWidth; x += 100) {
            graphics.moveTo(x, 0)
            graphics.lineTo(x, this.worldHeight)
        }
        
        // 绘制水平线
        for (let y = 0; y <= this.worldHeight; y += 100) {
            graphics.moveTo(0, y)
            graphics.lineTo(this.worldWidth, y)
        }
        
        graphics.strokePath()
        graphics.setDepth(-50) // 放在最底层
    }
    
    createPlayer() {
        // 创建玩家精灵
        this.player = new Player(this, 100, this.worldHeight - 200)
        
        // 设置玩家物理属性
        this.player.setBounce(0.2)
        this.player.setCollideWorldBounds(true)
        
        // 设置玩家动画（简单的颜色变化）
        this.createPlayerAnimations()
    }
    
    createPlayerAnimations() {
        // 创建简单的动画效果
        this.tweens.add({
            targets: this.player,
            scaleX: 1.1,
            scaleY: 0.9,
            duration: 100,
            yoyo: true,
            repeat: -1,
            paused: true
        })
    }
    
    setupCamera() {
        const camera = this.cameras.main
        
        // 设置摄像机边界
        camera.setBounds(0, 0, this.worldWidth, this.worldHeight)
        
        // 创建摄像机控制器
        this.cameraController = new CameraController(this, camera, this.player)
        
        // 设置初始跟随
        this.cameraController.enableSmartFollow()
        
        // 设置死区
        camera.setDeadzone(150, 100)
    }
    
    setupControls() {
        // 创建方向键
        this.cursors = this.input.keyboard.createCursorKeys()
        
        // 创建额外的控制键
        this.keys = this.input.keyboard.addKeys({
            'W': Phaser.Input.Keyboard.KeyCodes.W,
            'A': Phaser.Input.Keyboard.KeyCodes.A,
            'S': Phaser.Input.Keyboard.KeyCodes.S,
            'D': Phaser.Input.Keyboard.KeyCodes.D,
            'Q': Phaser.Input.Keyboard.KeyCodes.Q,
            'E': Phaser.Input.Keyboard.KeyCodes.E,
            'R': Phaser.Input.Keyboard.KeyCodes.R,
            'T': Phaser.Input.Keyboard.KeyCodes.T,
            'SPACE': Phaser.Input.Keyboard.KeyCodes.SPACE,
            'SHIFT': Phaser.Input.Keyboard.KeyCodes.SHIFT
        })
    }
    
    createUI() {
        // 创建摄像机信息显示
        this.cameraInfo = this.add.text(10, 10, '', {
            fontSize: '14px',
            fill: '#ffffff',
            backgroundColor: '#000000',
            padding: { x: 10, y: 5 }
        })
        this.cameraInfo.setScrollFactor(0) // 固定在屏幕上
        this.cameraInfo.setDepth(100)
        
        // 创建操作说明
        this.instructions = this.add.text(10, this.cameras.main.height - 120, 
            '控制说明:\n' +
            '方向键/WASD: 移动角色\n' +
            'Q/E: 缩放摄像机\n' +
            'R: 重置摄像机\n' +
            'T: 震动效果\n' +
            'SHIFT: 锁定摄像机', {
            fontSize: '12px',
            fill: '#ffffff',
            backgroundColor: '#000000',
            padding: { x: 10, y: 5 }
        })
        this.instructions.setScrollFactor(0)
        this.instructions.setDepth(100)
        
        // ESC键返回菜单
        this.input.keyboard.on('keydown-ESC', () => {
            this.scene.start('MenuScene')
        })
    }
    
    setupCollisions() {
        // 玩家与平台的碰撞
        this.physics.add.collider(this.player, this.platforms)
    }
    
    update(time, delta) {
        // 更新玩家
        if (this.player) {
            this.player.update(this.cursors, this.keys)
        }
        
        // 更新摄像机控制器
        if (this.cameraController) {
            this.cameraController.update(delta)
        }
        
        // 更新视差背景
        if (this.parallaxBg) {
            this.parallaxBg.update()
        }
        
        // 更新摄像机控制
        this.updateCameraControls()
        
        // 更新UI信息
        this.updateUI()
    }
    
    updateCameraControls() {
        const camera = this.cameras.main
        
        // 缩放控制
        if (this.keys.Q.isDown) {
            camera.zoom = Math.min(3, camera.zoom + 0.02)
        }
        if (this.keys.E.isDown) {
            camera.zoom = Math.max(0.3, camera.zoom - 0.02)
        }
        
        // 重置摄像机
        if (Phaser.Input.Keyboard.JustDown(this.keys.R)) {
            camera.zoom = 1
            camera.rotation = 0
            this.cameraController.enableSmartFollow()
        }
        
        // 震动效果
        if (Phaser.Input.Keyboard.JustDown(this.keys.T)) {
            camera.shake(300, 0.02)
        }
        
        // 锁定/解锁摄像机
        if (Phaser.Input.Keyboard.JustDown(this.keys.SHIFT)) {
            if (camera.followTarget) {
                camera.stopFollow()
            } else {
                this.cameraController.enableSmartFollow()
            }
        }
    }
    
    updateUI() {
        const camera = this.cameras.main
        const player = this.player
        
        // 更新摄像机信息
        this.cameraInfo.setText(
            `摄像机信息:\n` +
            `位置: (${Math.round(camera.scrollX)}, ${Math.round(camera.scrollY)})\n` +
            `缩放: ${camera.zoom.toFixed(2)}\n` +
            `跟随: ${camera.followTarget ? '开启' : '关闭'}\n` +
            `玩家位置: (${Math.round(player.x)}, ${Math.round(player.y)})`
        )
    }
}
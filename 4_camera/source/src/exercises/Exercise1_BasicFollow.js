import Phaser from 'phaser'

/**
 * 练习1: 基础摄像机跟随
 * 目标: 实现一个基本的摄像机跟随系统
 */
export default class Exercise1_BasicFollow extends Phaser.Scene {
    constructor() {
        super({ key: 'Exercise1_BasicFollow' })
        
        this.worldWidth = 1600
        this.worldHeight = 1200
        this.player = null
        this.cursors = null
    }
    
    preload() {
        // 创建简单的纹理
        this.createTextures()
    }
    
    create() {
        // 设置世界边界
        this.physics.world.setBounds(0, 0, this.worldWidth, this.worldHeight)
        
        // 创建背景网格
        this.createGrid()
        
        // 创建玩家
        this.createPlayer()
        
        // 设置摄像机跟随 - 这是练习的核心
        this.setupBasicCameraFollow()
        
        // 创建控制
        this.cursors = this.input.keyboard.createCursorKeys()
        
        // 创建UI提示
        this.createUI()
    }
    
    createTextures() {
        // 玩家纹理
        const graphics = this.add.graphics()
        graphics.fillStyle(0xff6b6b)
        graphics.fillRect(0, 0, 32, 32)
        graphics.generateTexture('player_red', 32, 32)
        graphics.destroy()
    }
    
    createGrid() {
        const graphics = this.add.graphics()
        graphics.lineStyle(1, 0x444444, 0.5)
        
        // 绘制网格
        for (let x = 0; x <= this.worldWidth; x += 100) {
            graphics.moveTo(x, 0)
            graphics.lineTo(x, this.worldHeight)
        }
        
        for (let y = 0; y <= this.worldHeight; y += 100) {
            graphics.moveTo(0, y)
            graphics.lineTo(this.worldWidth, y)
        }
        
        graphics.strokePath()
        
        // 添加坐标标记
        for (let x = 0; x <= this.worldWidth; x += 200) {
            for (let y = 0; y <= this.worldHeight; y += 200) {
                this.add.text(x + 10, y + 10, `(${x},${y})`, {
                    fontSize: '12px',
                    fill: '#666666'
                })
            }
        }
    }
    
    createPlayer() {
        this.player = this.physics.add.sprite(100, 100, 'player_red')
        this.player.setCollideWorldBounds(true)
        this.player.setDrag(300)
    }
    
    setupBasicCameraFollow() {
        const camera = this.cameras.main
        
        // 练习要点1: 设置摄像机边界
        camera.setBounds(0, 0, this.worldWidth, this.worldHeight)
        
        // 练习要点2: 开始跟随玩家
        camera.startFollow(this.player)
        
        // 练习要点3: 设置死区（可选）
        // camera.setDeadzone(100, 100)
        
        // 练习要点4: 设置平滑跟随（可选）
        // camera.startFollow(this.player, true, 0.1, 0.1)
    }
    
    createUI() {
        const instructions = this.add.text(10, 10, 
            '练习1: 基础摄像机跟随\n' +
            '使用方向键移动红色方块\n' +
            '观察摄像机如何跟随玩家\n' +
            '按ESC返回主菜单', {
            fontSize: '14px',
            fill: '#ffffff',
            backgroundColor: '#000000',
            padding: { x: 10, y: 5 }
        })
        instructions.setScrollFactor(0)
        instructions.setDepth(100)
        
        // 摄像机信息
        this.cameraInfo = this.add.text(10, this.cameras.main.height - 80, '', {
            fontSize: '12px',
            fill: '#ffffff',
            backgroundColor: '#000000',
            padding: { x: 10, y: 5 }
        })
        this.cameraInfo.setScrollFactor(0)
        this.cameraInfo.setDepth(100)
        
        // ESC键返回
        this.input.keyboard.on('keydown-ESC', () => {
            this.scene.start('GameScene')
        })
    }
    
    update() {
        // 玩家移动
        const speed = 200
        
        if (this.cursors.left.isDown) {
            this.player.setVelocityX(-speed)
        } else if (this.cursors.right.isDown) {
            this.player.setVelocityX(speed)
        } else {
            this.player.setVelocityX(0)
        }
        
        if (this.cursors.up.isDown) {
            this.player.setVelocityY(-speed)
        } else if (this.cursors.down.isDown) {
            this.player.setVelocityY(speed)
        } else {
            this.player.setVelocityY(0)
        }
        
        // 更新摄像机信息
        const camera = this.cameras.main
        this.cameraInfo.setText(
            `摄像机位置: (${Math.round(camera.scrollX)}, ${Math.round(camera.scrollY)})\n` +
            `玩家位置: (${Math.round(this.player.x)}, ${Math.round(this.player.y)})\n` +
            `摄像机中心: (${Math.round(camera.centerX)}, ${Math.round(camera.centerY)})`
        )
    }
}
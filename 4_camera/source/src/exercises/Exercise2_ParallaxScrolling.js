import Phaser from 'phaser'

/**
 * 练习2: 视差滚动背景
 * 目标: 创建多层视差滚动背景效果
 */
export default class Exercise2_ParallaxScrolling extends Phaser.Scene {
    constructor() {
        super({ key: 'Exercise2_ParallaxScrolling' })
        
        this.worldWidth = 2400
        this.worldHeight = 800
        this.player = null
        this.cursors = null
        this.backgroundLayers = []
    }
    
    preload() {
        this.createBackgroundTextures()
        this.createPlayerTexture()
    }
    
    create() {
        // 设置世界边界
        this.physics.world.setBounds(0, 0, this.worldWidth, this.worldHeight)
        
        // 创建多层背景
        this.createParallaxLayers()
        
        // 创建地面
        this.createGround()
        
        // 创建玩家
        this.createPlayer()
        
        // 设置摄像机
        this.setupCamera()
        
        // 创建控制
        this.cursors = this.input.keyboard.createCursorKeys()
        
        // 创建UI
        this.createUI()
    }
    
    createBackgroundTextures() {
        // 天空层
        const skyGraphics = this.add.graphics()
        const gradient = skyGraphics.createGeometry()
        skyGraphics.fillGradientStyle(0x87CEEB, 0x87CEEB, 0xE0F6FF, 0xE0F6FF, 1)
        skyGraphics.fillRect(0, 0, 800, 600)
        skyGraphics.generateTexture('sky_layer', 800, 600)
        skyGraphics.destroy()
        
        // 云层
        const cloudGraphics = this.add.graphics()
        cloudGraphics.fillStyle(0xffffff, 0.8)
        // 绘制几朵云
        for (let i = 0; i < 5; i++) {
            const x = i * 160 + 50
            const y = 100 + Math.sin(i) * 30
            this.drawCloud(cloudGraphics, x, y)
        }
        cloudGraphics.generateTexture('cloud_layer', 800, 600)
        cloudGraphics.destroy()
        
        // 远山层
        const mountainGraphics = this.add.graphics()
        mountainGraphics.fillStyle(0x8B7355, 0.7)
        mountainGraphics.beginPath()
        mountainGraphics.moveTo(0, 400)
        for (let x = 0; x <= 800; x += 40) {
            const height = 250 + Math.sin(x * 0.02) * 80 + Math.sin(x * 0.05) * 40
            mountainGraphics.lineTo(x, height)
        }
        mountainGraphics.lineTo(800, 600)
        mountainGraphics.lineTo(0, 600)
        mountainGraphics.closePath()
        mountainGraphics.fillPath()
        mountainGraphics.generateTexture('mountain_layer', 800, 600)
        mountainGraphics.destroy()
        
        // 树林层
        const treeGraphics = this.add.graphics()
        treeGraphics.fillStyle(0x228B22, 0.8)
        for (let i = 0; i < 10; i++) {
            const x = i * 80 + 20
            const height = 80 + Math.random() * 40
            this.drawTree(treeGraphics, x, 600 - height, height)
        }
        treeGraphics.generateTexture('tree_layer', 800, 600)
        treeGraphics.destroy()
    }
    
    drawCloud(graphics, x, y) {
        graphics.fillCircle(x, y, 25)
        graphics.fillCircle(x + 20, y, 20)
        graphics.fillCircle(x - 20, y, 20)
        graphics.fillCircle(x + 10, y - 15, 15)
        graphics.fillCircle(x - 10, y - 15, 15)
    }
    
    drawTree(graphics, x, y, height) {
        // 树干
        graphics.fillStyle(0x8B4513)
        graphics.fillRect(x - 5, y, 10, height)
        
        // 树冠
        graphics.fillStyle(0x228B22)
        graphics.fillCircle(x, y - 10, height * 0.4)
    }
    
    createPlayerTexture() {
        const graphics = this.add.graphics()
        graphics.fillStyle(0x3498db)
        graphics.fillRect(0, 0, 32, 48)
        graphics.generateTexture('player_blue', 32, 48)
        graphics.destroy()
    }
    
    createParallaxLayers() {
        // 创建不同滚动速度的背景层
        const layerConfigs = [
            { texture: 'sky_layer', scrollFactor: 0, depth: -100 },
            { texture: 'cloud_layer', scrollFactor: 0.1, depth: -90 },
            { texture: 'mountain_layer', scrollFactor: 0.3, depth: -80 },
            { texture: 'tree_layer', scrollFactor: 0.6, depth: -70 }
        ]
        
        layerConfigs.forEach(config => {
            const layer = this.add.tileSprite(
                0, 0,
                this.cameras.main.width,
                this.cameras.main.height,
                config.texture
            )
            layer.setOrigin(0, 0)
            layer.setScrollFactor(config.scrollFactor)
            layer.setDepth(config.depth)
            
            this.backgroundLayers.push({
                sprite: layer,
                scrollFactor: config.scrollFactor,
                originalX: 0
            })
        })
    }
    
    createGround() {
        // 创建地面平台
        const platforms = this.physics.add.staticGroup()
        
        for (let x = 0; x < this.worldWidth; x += 100) {
            const platform = platforms.create(x + 50, this.worldHeight - 25, null)
            platform.setSize(100, 50)
            platform.setVisible(false) // 不可见的碰撞体
        }
        
        this.platforms = platforms
        
        // 创建可见的地面
        const groundGraphics = this.add.graphics()
        groundGraphics.fillStyle(0x8B4513)
        groundGraphics.fillRect(0, this.worldHeight - 50, this.worldWidth, 50)
        groundGraphics.setDepth(-60)
    }
    
    createPlayer() {
        this.player = this.physics.add.sprite(100, this.worldHeight - 100, 'player_blue')
        this.player.setBounce(0.2)
        this.player.setCollideWorldBounds(true)
        
        // 玩家与地面碰撞
        this.physics.add.collider(this.player, this.platforms)
    }
    
    setupCamera() {
        const camera = this.cameras.main
        camera.setBounds(0, 0, this.worldWidth, this.worldHeight)
        camera.startFollow(this.player, true, 0.1, 0.1)
        camera.setDeadzone(100, 50)
    }
    
    createUI() {
        const instructions = this.add.text(10, 10, 
            '练习2: 视差滚动背景\n' +
            '方向键移动，观察不同层的滚动速度\n' +
            '天空不动，云层慢，山层中等，树层快\n' +
            '按ESC返回主菜单', {
            fontSize: '14px',
            fill: '#ffffff',
            backgroundColor: '#000000',
            padding: { x: 10, y: 5 }
        })
        instructions.setScrollFactor(0)
        instructions.setDepth(100)
        
        // 层级信息
        this.layerInfo = this.add.text(10, this.cameras.main.height - 120, '', {
            fontSize: '12px',
            fill: '#ffffff',
            backgroundColor: '#000000',
            padding: { x: 10, y: 5 }
        })
        this.layerInfo.setScrollFactor(0)
        this.layerInfo.setDepth(100)
        
        // ESC键返回
        this.input.keyboard.on('keydown-ESC', () => {
            this.scene.start('GameScene')
        })
    }
    
    update() {
        // 玩家移动
        const speed = 200
        const jumpPower = 400
        
        if (this.cursors.left.isDown) {
            this.player.setVelocityX(-speed)
        } else if (this.cursors.right.isDown) {
            this.player.setVelocityX(speed)
        } else {
            this.player.setVelocityX(0)
        }
        
        if (this.cursors.up.isDown && this.player.body.touching.down) {
            this.player.setVelocityY(-jumpPower)
        }
        
        // 更新视差背景
        this.updateParallaxLayers()
        
        // 更新UI信息
        this.updateLayerInfo()
    }
    
    updateParallaxLayers() {
        const camera = this.cameras.main
        
        this.backgroundLayers.forEach(layer => {
            // 计算视差偏移
            const offsetX = camera.scrollX * (1 - layer.scrollFactor)
            layer.sprite.tilePositionX = offsetX
        })
    }
    
    updateLayerInfo() {
        const camera = this.cameras.main
        let info = '视差层信息:\n'
        
        const layerNames = ['天空', '云层', '远山', '树林']
        this.backgroundLayers.forEach((layer, index) => {
            const offset = Math.round(camera.scrollX * (1 - layer.scrollFactor))
            info += `${layerNames[index]}: 偏移 ${offset} (因子: ${layer.scrollFactor})\n`
        })
        
        this.layerInfo.setText(info)
    }
}
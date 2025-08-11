import Phaser from 'phaser'

/**
 * 高级摄像机演示
 * 展示电影级摄像机运镜和复杂场景滚动
 */
export default class AdvancedCameraDemo extends Phaser.Scene {
    constructor() {
        super({ key: 'AdvancedCameraDemo' })
        
        this.worldWidth = 3200
        this.worldHeight = 2400
        this.player = null
        this.cursors = null
        this.cinematicMode = false
        this.waypoints = []
        this.currentWaypoint = 0
    }
    
    preload() {
        this.createTextures()
    }
    
    create() {
        // 设置世界边界
        this.physics.world.setBounds(0, 0, this.worldWidth, this.worldHeight)
        
        // 创建复杂的游戏世界
        this.createComplexWorld()
        
        // 创建玩家
        this.createPlayer()
        
        // 设置高级摄像机系统
        this.setupAdvancedCamera()
        
        // 创建路径点
        this.createWaypoints()
        
        // 创建控制
        this.setupControls()
        
        // 创建UI
        this.createUI()
        
        // 开始介绍动画
        this.startIntroSequence()
    }
    
    createTextures() {
        // 玩家纹理
        const playerGraphics = this.add.graphics()
        playerGraphics.fillStyle(0x9b59b6)
        playerGraphics.fillRect(0, 0, 32, 48)
        playerGraphics.generateTexture('player_advanced', 32, 48)
        playerGraphics.destroy()
        
        // 建筑纹理
        const buildingGraphics = this.add.graphics()
        buildingGraphics.fillStyle(0x34495e)
        buildingGraphics.fillRect(0, 0, 100, 200)
        buildingGraphics.fillStyle(0xf39c12)
        for (let i = 0; i < 8; i++) {
            for (let j = 0; j < 4; j++) {
                buildingGraphics.fillRect(10 + i * 10, 20 + j * 40, 8, 30)
            }
        }
        buildingGraphics.generateTexture('building', 100, 200)
        buildingGraphics.destroy()
        
        // 路径点纹理
        const waypointGraphics = this.add.graphics()
        waypointGraphics.lineStyle(4, 0xe74c3c)
        waypointGraphics.strokeCircle(16, 16, 12)
        waypointGraphics.fillStyle(0xe74c3c, 0.3)
        waypointGraphics.fillCircle(16, 16, 12)
        waypointGraphics.generateTexture('waypoint', 32, 32)
        waypointGraphics.destroy()
    }
    
    createComplexWorld() {
        // 创建多层背景
        this.createLayeredBackground()
        
        // 创建建筑群
        this.createBuildings()
        
        // 创建地形
        this.createTerrain()
        
        // 创建装饰元素
        this.createDecorations()
    }
    
    createLayeredBackground() {
        // 天空层 - 渐变背景
        const skyGraphics = this.add.graphics()
        skyGraphics.fillGradientStyle(0x2c3e50, 0x2c3e50, 0x3498db, 0x3498db, 1)
        skyGraphics.fillRect(0, 0, this.worldWidth, this.worldHeight / 2)
        skyGraphics.setDepth(-100)
        
        // 云层
        for (let i = 0; i < 20; i++) {
            const cloud = this.add.graphics()
            cloud.fillStyle(0xffffff, 0.6)
            this.drawCloud(cloud, 0, 0)
            cloud.x = Math.random() * this.worldWidth
            cloud.y = 100 + Math.random() * 300
            cloud.setScrollFactor(0.1 + Math.random() * 0.2)
            cloud.setDepth(-90)
            
            // 云朵飘动
            this.tweens.add({
                targets: cloud,
                x: cloud.x + 200 + Math.random() * 400,
                duration: 20000 + Math.random() * 10000,
                repeat: -1,
                yoyo: true,
                ease: 'Sine.easeInOut'
            })
        }
        
        // 远山层
        const mountainGraphics = this.add.graphics()
        mountainGraphics.fillStyle(0x7f8c8d, 0.8)
        mountainGraphics.beginPath()
        mountainGraphics.moveTo(0, this.worldHeight * 0.6)
        for (let x = 0; x <= this.worldWidth; x += 100) {
            const height = this.worldHeight * 0.4 + Math.sin(x * 0.01) * 200 + Math.sin(x * 0.03) * 100
            mountainGraphics.lineTo(x, height)
        }
        mountainGraphics.lineTo(this.worldWidth, this.worldHeight)
        mountainGraphics.lineTo(0, this.worldHeight)
        mountainGraphics.closePath()
        mountainGraphics.fillPath()
        mountainGraphics.setScrollFactor(0.3)
        mountainGraphics.setDepth(-80)
    }
    
    drawCloud(graphics, x, y) {
        graphics.fillCircle(x, y, 30)
        graphics.fillCircle(x + 25, y, 25)
        graphics.fillCircle(x - 25, y, 25)
        graphics.fillCircle(x + 12, y - 15, 20)
        graphics.fillCircle(x - 12, y - 15, 20)
    }
    
    createBuildings() {
        this.buildings = this.physics.add.staticGroup()
        
        // 创建城市天际线
        for (let x = 200; x < this.worldWidth - 200; x += 150) {
            const height = 200 + Math.random() * 300
            const building = this.buildings.create(x, this.worldHeight - height / 2, 'building')
            building.setScale(1, height / 200)
            building.refreshBody()
            
            // 添加建筑顶部装饰
            const decoration = this.add.graphics()
            decoration.fillStyle(0xe74c3c)
            decoration.fillRect(-5, -10, 10, 20)
            decoration.x = x
            decoration.y = this.worldHeight - height - 10
        }
    }
    
    createTerrain() {
        // 创建地面
        this.platforms = this.physics.add.staticGroup()
        
        for (let x = 0; x < this.worldWidth; x += 100) {
            const platform = this.platforms.create(x + 50, this.worldHeight - 25, null)
            platform.setSize(100, 50)
            platform.setVisible(false)
        }
        
        // 可见地面
        const groundGraphics = this.add.graphics()
        groundGraphics.fillStyle(0x27ae60)
        groundGraphics.fillRect(0, this.worldHeight - 50, this.worldWidth, 50)
        
        // 创建一些平台
        const platformPositions = [
            { x: 400, y: this.worldHeight - 200 },
            { x: 800, y: this.worldHeight - 350 },
            { x: 1200, y: this.worldHeight - 500 },
            { x: 1600, y: this.worldHeight - 300 },
            { x: 2000, y: this.worldHeight - 450 },
            { x: 2400, y: this.worldHeight - 250 },
            { x: 2800, y: this.worldHeight - 400 }
        ]
        
        platformPositions.forEach(pos => {
            const platform = this.platforms.create(pos.x, pos.y, null)
            platform.setSize(150, 30)
            platform.setVisible(false)
            
            // 可见平台
            const platformGraphics = this.add.graphics()
            platformGraphics.fillStyle(0x8e44ad)
            platformGraphics.fillRect(pos.x - 75, pos.y - 15, 150, 30)
        })
    }
    
    createDecorations() {
        // 添加粒子效果
        this.createParticleEffects()
        
        // 添加动态光效
        this.createLightEffects()
    }
    
    createParticleEffects() {
        // 飘落的叶子
        this.leaves = this.add.particles(0, 0, null, {
            x: { min: 0, max: this.worldWidth },
            y: -50,
            scale: { start: 0.3, end: 0.1 },
            alpha: { start: 0.8, end: 0 },
            speed: { min: 20, max: 60 },
            gravityY: 50,
            lifespan: 8000,
            frequency: 500,
            tint: [0x27ae60, 0xf39c12, 0xe74c3c]
        })
        this.leaves.setScrollFactor(0.8)
        this.leaves.setDepth(-60)
    }
    
    createLightEffects() {
        // 创建动态光束
        for (let i = 0; i < 5; i++) {
            const light = this.add.graphics()
            light.fillGradientStyle(0xf1c40f, 0xf1c40f, 0xf1c40f, 0xf1c40f, 0.3, 0, 0.3, 0)
            light.fillRect(0, 0, 20, this.worldHeight)
            light.x = 500 + i * 600
            light.setScrollFactor(0.5)
            light.setDepth(-70)
            
            // 光束摆动
            this.tweens.add({
                targets: light,
                rotation: { from: -0.1, to: 0.1 },
                duration: 3000 + i * 500,
                yoyo: true,
                repeat: -1,
                ease: 'Sine.easeInOut'
            })
        }
    }
    
    createPlayer() {
        this.player = this.physics.add.sprite(100, this.worldHeight - 100, 'player_advanced')
        this.player.setBounce(0.2)
        this.player.setCollideWorldBounds(true)
        
        // 碰撞检测
        this.physics.add.collider(this.player, this.platforms)
        this.physics.add.collider(this.player, this.buildings)
    }
    
    setupAdvancedCamera() {
        this.camera = this.cameras.main
        this.camera.setBounds(0, 0, this.worldWidth, this.worldHeight)
        
        // 创建多个摄像机预设
        this.cameraPresets = {
            follow: () => {
                this.camera.startFollow(this.player, true, 0.1, 0.1)
                this.camera.setDeadzone(100, 50)
            },
            cinematic: () => {
                this.camera.stopFollow()
                this.camera.setDeadzone(0, 0)
            },
            overview: () => {
                this.camera.stopFollow()
                this.camera.setZoom(0.3)
                this.camera.centerOn(this.worldWidth / 2, this.worldHeight / 2)
            }
        }
        
        // 默认跟随模式
        this.cameraPresets.follow()
    }
    
    createWaypoints() {
        const waypointPositions = [
            { x: 400, y: this.worldHeight - 300, name: '城市入口' },
            { x: 1200, y: this.worldHeight - 600, name: '高台观景' },
            { x: 2000, y: this.worldHeight - 200, name: '商业区' },
            { x: 2800, y: this.worldHeight - 500, name: '工业区' },
            { x: 1600, y: 200, name: '天空之城' }
        ]
        
        waypointPositions.forEach((pos, index) => {
            const waypoint = this.add.sprite(pos.x, pos.y, 'waypoint')
            waypoint.setInteractive()
            waypoint.on('pointerdown', () => this.flyToWaypoint(index))
            
            // 添加标签
            const label = this.add.text(pos.x, pos.y - 30, pos.name, {
                fontSize: '14px',
                fill: '#ffffff',
                backgroundColor: '#000000',
                padding: { x: 5, y: 2 }
            })
            label.setOrigin(0.5)
            
            // 脉冲动画
            this.tweens.add({
                targets: waypoint,
                scale: { from: 1, to: 1.3 },
                alpha: { from: 1, to: 0.7 },
                duration: 1500,
                yoyo: true,
                repeat: -1,
                ease: 'Sine.easeInOut'
            })
            
            this.waypoints.push({ sprite: waypoint, label: label, ...pos })
        })
    }
    
    setupControls() {
        this.cursors = this.input.keyboard.createCursorKeys()
        this.keys = this.input.keyboard.addKeys({
            'C': Phaser.Input.Keyboard.KeyCodes.C,
            'V': Phaser.Input.Keyboard.KeyCodes.V,
            'B': Phaser.Input.Keyboard.KeyCodes.B,
            'N': Phaser.Input.Keyboard.KeyCodes.N,
            'M': Phaser.Input.Keyboard.KeyCodes.M,
            'SPACE': Phaser.Input.Keyboard.KeyCodes.SPACE
        })
    }
    
    createUI() {
        const instructions = this.add.text(10, 10, 
            '高级摄像机演示\n' +
            '方向键移动 | C: 电影模式 | V: 俯视模式 | B: 跟随模式\n' +
            'N: 下一个路径点 | M: 摄像机巡游 | 点击红圈传送\n' +
            '按ESC返回菜单', {
            fontSize: '14px',
            fill: '#ffffff',
            backgroundColor: '#000000',
            padding: { x: 10, y: 5 }
        })
        instructions.setScrollFactor(0)
        instructions.setDepth(100)
        
        // 摄像机模式显示
        this.modeDisplay = this.add.text(this.cameras.main.width - 10, 10, '', {
            fontSize: '16px',
            fill: '#f1c40f',
            backgroundColor: '#000000',
            padding: { x: 10, y: 5 }
        })
        this.modeDisplay.setOrigin(1, 0)
        this.modeDisplay.setScrollFactor(0)
        this.modeDisplay.setDepth(100)
        
        // ESC键返回
        this.input.keyboard.on('keydown-ESC', () => {
            this.scene.start('MenuScene')
        })
    }
    
    startIntroSequence() {
        this.cinematicMode = true
        this.modeDisplay.setText('电影模式: 介绍序列')
        
        // 电影级介绍镜头
        const introKeyframes = [
            { x: this.worldWidth / 2, y: 200, zoom: 0.3, duration: 2000 },
            { x: 400, y: 400, zoom: 0.8, duration: 1500 },
            { x: 1200, y: 300, zoom: 1.2, duration: 1500 },
            { x: this.player.x, y: this.player.y, zoom: 1, duration: 2000 }
        ]
        
        this.createCinematicSequence(introKeyframes, () => {
            this.cinematicMode = false
            this.cameraPresets.follow()
            this.modeDisplay.setText('跟随模式')
        })
    }
    
    createCinematicSequence(keyframes, onComplete) {
        this.cameraPresets.cinematic()
        
        const timeline = this.tweens.createTimeline()
        
        keyframes.forEach((keyframe, index) => {
            timeline.add({
                targets: this.camera,
                scrollX: keyframe.x - this.camera.width / 2,
                scrollY: keyframe.y - this.camera.height / 2,
                zoom: keyframe.zoom,
                duration: keyframe.duration,
                ease: 'Power2'
            })
        })
        
        timeline.setCallback('onComplete', onComplete)
        timeline.play()
    }
    
    flyToWaypoint(index) {
        const waypoint = this.waypoints[index]
        this.cinematicMode = true
        this.modeDisplay.setText(`飞向: ${waypoint.name}`)
        
        this.tweens.add({
            targets: this.camera,
            scrollX: waypoint.x - this.camera.width / 2,
            scrollY: waypoint.y - this.camera.height / 2,
            zoom: 1.5,
            duration: 2000,
            ease: 'Power2',
            onComplete: () => {
                this.time.delayedCall(1500, () => {
                    this.tweens.add({
                        targets: this.camera,
                        zoom: 1,
                        duration: 1000,
                        ease: 'Power2',
                        onComplete: () => {
                            this.cinematicMode = false
                            this.cameraPresets.follow()
                            this.modeDisplay.setText('跟随模式')
                        }
                    })
                })
            }
        })
    }
    
    startCameraTour() {
        this.cinematicMode = true
        this.modeDisplay.setText('摄像机巡游模式')
        
        const tourKeyframes = this.waypoints.map(waypoint => ({
            x: waypoint.x,
            y: waypoint.y,
            zoom: 1 + Math.random() * 0.5,
            duration: 3000
        }))
        
        this.createCinematicSequence(tourKeyframes, () => {
            this.cinematicMode = false
            this.cameraPresets.follow()
            this.modeDisplay.setText('跟随模式')
        })
    }
    
    update() {
        if (!this.cinematicMode) {
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
        }
        
        // 摄像机模式切换
        if (Phaser.Input.Keyboard.JustDown(this.keys.C)) {
            this.cinematicMode = !this.cinematicMode
            if (this.cinematicMode) {
                this.cameraPresets.cinematic()
                this.modeDisplay.setText('电影模式')
            } else {
                this.cameraPresets.follow()
                this.modeDisplay.setText('跟随模式')
            }
        }
        
        if (Phaser.Input.Keyboard.JustDown(this.keys.V)) {
            this.cameraPresets.overview()
            this.modeDisplay.setText('俯视模式')
        }
        
        if (Phaser.Input.Keyboard.JustDown(this.keys.B)) {
            this.cameraPresets.follow()
            this.cinematicMode = false
            this.modeDisplay.setText('跟随模式')
        }
        
        if (Phaser.Input.Keyboard.JustDown(this.keys.N)) {
            this.currentWaypoint = (this.currentWaypoint + 1) % this.waypoints.length
            this.flyToWaypoint(this.currentWaypoint)
        }
        
        if (Phaser.Input.Keyboard.JustDown(this.keys.M)) {
            this.startCameraTour()
        }
    }
}
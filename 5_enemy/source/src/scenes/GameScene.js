import Player from '../sprites/Player.js'
import CollisionSystem from '../systems/CollisionSystem.js'
import EnemyManager from '../systems/EnemyManager.js'
import PatrolEnemy from '../sprites/enemies/PatrolEnemy.js'
import ChaserEnemy from '../sprites/enemies/ChaserEnemy.js'
import GuardEnemy from '../sprites/enemies/GuardEnemy.js'

export default class GameScene extends Phaser.Scene {
    constructor() {
        super({ key: 'GameScene' })
    }
    
    create() {
        console.log('GameScene started')
        
        // 创建世界
        this.createWorld()
        
        // 创建玩家
        this.createPlayer()
        
        // 创建敌人系统
        this.createEnemySystem()
        
        // 创建碰撞系统
        this.createCollisionSystem()
        
        // 创建UI
        this.createUI()
        
        // 设置摄像机
        this.setupCamera()
        
        // 创建输入处理
        this.createInput()
        
        // 创建调试系统
        this.createDebugSystem()
    }
    
    createWorld() {
        // 设置世界边界
        this.physics.world.setBounds(0, 0, 1600, 1200)
        
        // 创建地形
        this.createTerrain()
        
        // 创建背景
        this.createBackground()
    }
    
    createBackground() {
        // 创建简单的网格背景
        const graphics = this.add.graphics()
        graphics.lineStyle(1, 0x333333, 0.3)
        
        // 绘制网格
        for (let x = 0; x <= 1600; x += 100) {
            graphics.moveTo(x, 0)
            graphics.lineTo(x, 1200)
        }
        
        for (let y = 0; y <= 1200; y += 100) {
            graphics.moveTo(0, y)
            graphics.lineTo(1600, y)
        }
        
        graphics.strokePath()
        graphics.setDepth(-100)
    }
    
    createTerrain() {
        // 创建一些地面平台
        this.platforms = this.physics.add.staticGroup()
        
        // 主地面
        for (let x = 0; x < 1600; x += 32) {
            const ground = this.platforms.create(x + 16, 1200 - 16, 'ground')
            ground.setScale(1).refreshBody()
        }
        
        // 一些平台
        const platformData = [
            { x: 300, y: 1000, width: 200 },
            { x: 600, y: 800, width: 150 },
            { x: 900, y: 900, width: 180 },
            { x: 1200, y: 700, width: 200 },
            { x: 200, y: 600, width: 120 },
            { x: 1400, y: 500, width: 150 }
        ]
        
        platformData.forEach(platform => {
            for (let i = 0; i < platform.width; i += 32) {
                const tile = this.platforms.create(platform.x + i, platform.y, 'ground')
                tile.setScale(1).refreshBody()
            }
        })
    }
    
    createPlayer() {
        this.player = new Player(this, 100, 1100)
        this.player.setCollideWorldBounds(true)
    }
    
    createEnemySystem() {
        // 创建敌人管理器
        this.enemyManager = new EnemyManager(this)
        
        // 注册敌人类型
        this.enemyManager.registerEnemyType('patrol', PatrolEnemy, 3)
        this.enemyManager.registerEnemyType('chaser', ChaserEnemy, 2)
        this.enemyManager.registerEnemyType('guard', GuardEnemy, 2)
        
        // 添加生成点
        this.enemyManager.addSpawnPoint(400, 950, 'patrol')
        this.enemyManager.addSpawnPoint(700, 750, 'chaser')
        this.enemyManager.addSpawnPoint(1000, 850, 'guard')
        this.enemyManager.addSpawnPoint(1300, 650, 'patrol')
        this.enemyManager.addSpawnPoint(300, 550, 'chaser')
        this.enemyManager.addSpawnPoint(1500, 450, 'guard')
        
        // 初始生成一些敌人
        this.enemyManager.spawnEnemy(400, 950, 'patrol')
        this.enemyManager.spawnEnemy(700, 750, 'chaser')
        this.enemyManager.spawnEnemy(1000, 850, 'guard')
    }
    
    createCollisionSystem() {
        this.collisionSystem = new CollisionSystem(this)
        
        // 创建碰撞组
        this.collisionSystem.createCollisionGroup('player')
        this.collisionSystem.createCollisionGroup('enemies')
        this.collisionSystem.createCollisionGroup('terrain')
        
        // 添加玩家到碰撞组
        this.collisionSystem.addToGroup('player', this.player)
        
        // 设置玩家与地形的碰撞
        this.physics.add.collider(this.player, this.platforms)
        
        // 设置敌人与地形的碰撞
        this.physics.add.collider(this.collisionSystem.getGroup('enemies'), this.platforms)
        
        // 设置玩家与敌人的碰撞（伤害检测）
        this.collisionSystem.setOverlap('player', 'enemies', (player, enemy) => {
            if (enemy.isAlive && !player.invulnerable) {
                player.takeDamage(enemy.contactDamage)
            }
        })
    }
    
    createUI() {
        // 创建敌人计数器
        this.enemyCountText = this.add.text(400, 30, '', {
            fontSize: '16px',
            fill: '#ffffff',
            fontFamily: 'Arial'
        }).setScrollFactor(0).setDepth(1000)
        
        // 创建控制说明
        this.add.text(10, 70, 'WASD: 移动\nSPACE: 攻击\nR: 重新开始', {
            fontSize: '14px',
            fill: '#cccccc',
            fontFamily: 'Arial'
        }).setScrollFactor(0).setDepth(1000)
    }
    
    setupCamera() {
        // 设置摄像机跟随玩家
        this.cameras.main.startFollow(this.player, true, 0.1, 0.1)
        this.cameras.main.setBounds(0, 0, 1600, 1200)
        this.cameras.main.setZoom(1)
    }
    
    createInput() {
        // 重新开始游戏
        this.input.keyboard.on('keydown-R', () => {
            this.scene.restart()
        })
        
        // 切换调试模式
        this.input.keyboard.on('keydown-F1', () => {
            this.toggleDebug()
        })
        
        // ESC返回菜单
        this.input.keyboard.on('keydown-ESC', () => {
            this.scene.start('MenuScene')
        })
    }
    
    createDebugSystem() {
        this.debugMode = false
        this.debugGraphics = this.add.graphics()
        this.debugGraphics.setDepth(2000)
        
        // 调试信息文本
        this.debugText = this.add.text(10, 150, '', {
            fontSize: '12px',
            fill: '#00ff00',
            fontFamily: 'Arial',
            backgroundColor: '#000000',
            padding: { x: 5, y: 5 }
        }).setScrollFactor(0).setDepth(2001)
    }
    
    toggleDebug() {
        this.debugMode = !this.debugMode
        this.debugGraphics.setVisible(this.debugMode)
        this.debugText.setVisible(this.debugMode)
    }
    
    update(time, deltaTime) {
        // 更新玩家
        if (this.player) {
            this.player.update(deltaTime)
        }
        
        // 更新敌人系统
        if (this.enemyManager) {
            this.enemyManager.update(deltaTime)
        }
        
        // 更新UI
        this.updateUI()
        
        // 更新调试信息
        if (this.debugMode) {
            this.updateDebug()
        }
    }
    
    updateUI() {
        if (this.enemyManager && this.enemyCountText) {
            const activeEnemies = this.enemyManager.getActiveEnemyCount()
            this.enemyCountText.setText(`敌人数量: ${activeEnemies}`)
        }
    }
    
    updateDebug() {
        if (!this.debugMode) return
        
        // 清除之前的调试绘制
        this.debugGraphics.clear()
        
        // 绘制敌人视野
        if (this.enemyManager) {
            this.enemyManager.enemies.forEach(enemy => {
                if (enemy.isAlive && enemy.visionSystem) {
                    enemy.visionSystem.debugDraw(this.debugGraphics)
                }
            })
        }
        
        // 更新调试文本
        let debugInfo = `FPS: ${Math.round(this.game.loop.actualFps)}\n`
        debugInfo += `玩家位置: (${Math.round(this.player.x)}, ${Math.round(this.player.y)})\n`
        debugInfo += `玩家血量: ${this.player.health}/${this.player.maxHealth}\n`
        
        if (this.enemyManager) {
            debugInfo += `活跃敌人: ${this.enemyManager.getActiveEnemyCount()}\n`
            debugInfo += `敌人状态:\n`
            
            this.enemyManager.enemies.forEach((enemy, index) => {
                if (enemy.isAlive) {
                    debugInfo += `  ${index}: ${enemy.name} - ${enemy.getCurrentState()}\n`
                }
            })
        }
        
        this.debugText.setText(debugInfo)
    }
}
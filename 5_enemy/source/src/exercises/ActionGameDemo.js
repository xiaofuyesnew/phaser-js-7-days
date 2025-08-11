import Player from '../sprites/Player.js'
import AdvancedCollisionSystem from './Exercise2_CollisionSystem.js'
import EnemyManager from '../systems/EnemyManager.js'
import AdvancedAIEnemy, { AIDebugger } from './Exercise3_AdvancedAI.js'
import PatrolEnemy from '../sprites/enemies/PatrolEnemy.js'
import ChaserEnemy from '../sprites/enemies/ChaserEnemy.js'
import GuardEnemy from '../sprites/enemies/GuardEnemy.js'

/**
 * 完整的动作游戏示例
 * 
 * 这个示例展示了如何将所有练习内容整合成一个完整的游戏
 * 包含：
 * - 多种敌人类型和AI行为
 * - 完整的碰撞检测系统
 * - 游戏状态管理
 * - 性能优化
 */

export default class ActionGameDemo extends Phaser.Scene {
    constructor() {
        super({ key: 'ActionGameDemo' })
    }
    
    create() {
        console.log('ActionGameDemo started')
        
        // 游戏状态
        this.gameState = 'playing' // playing, paused, gameOver
        this.score = 0
        this.wave = 1
        this.enemiesKilled = 0
        
        // 创建世界
        this.createWorld()
        
        // 创建玩家
        this.createPlayer()
        
        // 创建高级敌人系统
        this.createAdvancedEnemySystem()
        
        // 创建高级碰撞系统
        this.createAdvancedCollisionSystem()
        
        // 创建游戏UI
        this.createGameUI()
        
        // 创建道具系统
        this.createItemSystem()
        
        // 设置摄像机
        this.setupCamera()
        
        // 创建输入处理
        this.createInput()
        
        // 创建调试系统
        this.createDebugSystem()
        
        // 创建波次系统
        this.createWaveSystem()
        
        // 创建音效系统（简化版）
        this.createAudioSystem()
    }
    
    createWorld() {
        // 设置更大的世界
        this.physics.world.setBounds(0, 0, 2400, 1800)
        
        // 创建复杂地形
        this.createComplexTerrain()
        
        // 创建背景
        this.createBackground()
        
        // 创建环境装饰
        this.createEnvironmentDecorations()
    }
    
    createComplexTerrain() {
        this.platforms = this.physics.add.staticGroup()
        
        // 主地面
        for (let x = 0; x < 2400; x += 32) {
            const ground = this.platforms.create(x + 16, 1800 - 16, 'ground')
            ground.setScale(1).refreshBody()
        }
        
        // 多层平台结构
        const platformData = [
            // 底层平台
            { x: 200, y: 1600, width: 300 },
            { x: 600, y: 1500, width: 200 },
            { x: 1000, y: 1550, width: 250 },
            { x: 1400, y: 1450, width: 300 },
            { x: 1800, y: 1500, width: 200 },
            
            // 中层平台
            { x: 300, y: 1300, width: 200 },
            { x: 700, y: 1200, width: 150 },
            { x: 1100, y: 1250, width: 200 },
            { x: 1500, y: 1150, width: 180 },
            
            // 高层平台
            { x: 400, y: 1000, width: 150 },
            { x: 800, y: 900, width: 120 },
            { x: 1200, y: 950, width: 160 },
            { x: 1600, y: 850, width: 140 },
            
            // 顶层平台
            { x: 500, y: 700, width: 100 },
            { x: 900, y: 600, width: 120 },
            { x: 1300, y: 650, width: 100 }
        ]
        
        platformData.forEach(platform => {
            for (let i = 0; i < platform.width; i += 32) {
                const tile = this.platforms.create(platform.x + i, platform.y, 'ground')
                tile.setScale(1).refreshBody()
            }
        })
    }
    
    createBackground() {
        // 创建层次化背景
        const graphics = this.add.graphics()
        
        // 天空渐变
        graphics.fillGradientStyle(0x87CEEB, 0x87CEEB, 0xFFFFFF, 0xFFFFFF, 1)
        graphics.fillRect(0, 0, 2400, 900)
        
        // 远山
        graphics.fillStyle(0x8B7355)
        for (let x = 0; x < 2400; x += 100) {
            const height = 300 + Math.sin(x * 0.01) * 100
            graphics.fillTriangle(x, 900, x + 50, 900 - height, x + 100, 900)
        }
        
        graphics.setDepth(-100)
    }
    
    createEnvironmentDecorations() {
        // 添加环境装饰物
        const decorations = []
        
        for (let i = 0; i < 20; i++) {
            const x = Math.random() * 2400
            const y = Math.random() * 1800
            
            // 创建简单的装饰圆圈
            const decoration = this.add.circle(x, y, 5 + Math.random() * 10, 0x228B22, 0.6)
            decorations.push(decoration)
        }
        
        this.decorations = decorations
    }
    
    createPlayer() {
        this.player = new Player(this, 200, 1500)
        this.player.setCollideWorldBounds(true)
        
        // 增强玩家能力
        this.player.maxHealth = 150
        this.player.health = 150
        this.player.attackDamage = 25
    }
    
    createAdvancedEnemySystem() {
        this.enemyManager = new EnemyManager(this)
        
        // 注册所有敌人类型
        this.enemyManager.registerEnemyType('patrol', PatrolEnemy, 4)
        this.enemyManager.registerEnemyType('chaser', ChaserEnemy, 3)
        this.enemyManager.registerEnemyType('guard', GuardEnemy, 2)
        this.enemyManager.registerEnemyType('smart', AdvancedAIEnemy, 2)
        
        // 设置更多生成点
        const spawnPoints = [
            { x: 500, y: 1550, type: 'patrol' },
            { x: 800, y: 1450, type: 'chaser' },
            { x: 1200, y: 1500, type: 'guard' },
            { x: 1600, y: 1400, type: 'smart' },
            { x: 400, y: 1250, type: 'patrol' },
            { x: 900, y: 1150, type: 'chaser' },
            { x: 1400, y: 1200, type: 'smart' },
            { x: 600, y: 950, type: 'guard' },
            { x: 1000, y: 850, type: 'smart' },
            { x: 1500, y: 800, type: 'chaser' }
        ]
        
        spawnPoints.forEach(point => {
            this.enemyManager.addSpawnPoint(point.x, point.y, point.type)
        })
        
        // 调整生成参数
        this.enemyManager.setMaxEnemies(12)
        this.enemyManager.setSpawnCooldown(3000)
    }
    
    createAdvancedCollisionSystem() {
        this.collisionSystem = new AdvancedCollisionSystem(this)
        
        // 创建碰撞组
        this.collisionSystem.createCollisionGroup('player')
        this.collisionSystem.createCollisionGroup('enemies')
        this.collisionSystem.createCollisionGroup('items')
        this.collisionSystem.createCollisionGroup('effects')
        
        // 添加玩家到碰撞组
        this.collisionSystem.addToGroup('player', this.player)
        
        // 设置碰撞关系
        this.physics.add.collider(this.player, this.platforms)
        this.physics.add.collider(this.collisionSystem.getGroup('enemies'), this.platforms)
        
        // 玩家与敌人碰撞
        this.collisionSystem.setOverlap('player', 'enemies', (player, enemy) => {
            this.collisionSystem.handleCollision(player, enemy)
        })
        
        // 玩家与道具碰撞
        this.collisionSystem.setOverlap('player', 'items', (player, item) => {
            this.collisionSystem.handleCollision(player, item)
        })
    }
    
    createGameUI() {
        // 游戏信息面板
        this.gameUI = this.add.container(0, 0)
        this.gameUI.setScrollFactor(0)
        this.gameUI.setDepth(2000)
        
        // 背景面板
        const uiBackground = this.add.rectangle(0, 0, 800, 80, 0x000000, 0.7)
        uiBackground.setOrigin(0, 0)
        this.gameUI.add(uiBackground)
        
        // 分数显示
        this.scoreText = this.add.text(20, 20, `分数: ${this.score}`, {
            fontSize: '18px',
            fill: '#ffffff',
            fontFamily: 'Arial'
        })
        this.gameUI.add(this.scoreText)
        
        // 波次显示
        this.waveText = this.add.text(200, 20, `波次: ${this.wave}`, {
            fontSize: '18px',
            fill: '#ffffff',
            fontFamily: 'Arial'
        })
        this.gameUI.add(this.waveText)
        
        // 击杀数显示
        this.killsText = this.add.text(350, 20, `击杀: ${this.enemiesKilled}`, {
            fontSize: '18px',
            fill: '#ffffff',
            fontFamily: 'Arial'
        })
        this.gameUI.add(this.killsText)
        
        // 性能显示
        this.performanceText = this.add.text(500, 20, '', {
            fontSize: '14px',
            fill: '#00ff00',
            fontFamily: 'Arial'
        })
        this.gameUI.add(this.performanceText)
        
        // 控制提示
        this.add.text(20, 100, 'WASD: 移动 | SPACE: 攻击 | F1: 调试 | F2: AI调试 | ESC: 菜单', {
            fontSize: '14px',
            fill: '#cccccc',
            fontFamily: 'Arial'
        }).setScrollFactor(0).setDepth(2000)
    }
    
    createItemSystem() {
        this.items = []
        this.itemSpawnTimer = 0
        this.itemSpawnInterval = 8000 // 8秒生成一个道具
        
        // 道具类型
        this.itemTypes = [
            { type: 'health', color: 0x00ff00, effect: 'heal' },
            { type: 'damage', color: 0xff0000, effect: 'damage_boost' },
            { type: 'speed', color: 0x0000ff, effect: 'speed_boost' },
            { type: 'shield', color: 0xffff00, effect: 'shield' }
        ]
    }
    
    createWaveSystem() {
        this.waveTimer = 0
        this.waveInterval = 30000 // 30秒一波
        this.enemiesPerWave = 3
    }
    
    createAudioSystem() {
        // 简化的音效系统
        this.audioEnabled = true
        this.soundEffects = {
            playerHit: () => console.log('🔊 玩家受伤'),
            enemyHit: () => console.log('🔊 敌人受伤'),
            enemyDeath: () => console.log('🔊 敌人死亡'),
            itemCollect: () => console.log('🔊 收集道具'),
            waveStart: () => console.log('🔊 新波次开始')
        }
    }
    
    setupCamera() {
        this.cameras.main.startFollow(this.player, true, 0.08, 0.08)
        this.cameras.main.setBounds(0, 0, 2400, 1800)
        this.cameras.main.setZoom(0.8)
    }
    
    createInput() {
        // 游戏控制
        this.input.keyboard.on('keydown-ESC', () => {
            this.pauseGame()
        })
        
        this.input.keyboard.on('keydown-R', () => {
            this.restartGame()
        })
        
        // 调试控制
        this.input.keyboard.on('keydown-F1', () => {
            this.toggleDebug()
        })
        
        this.input.keyboard.on('keydown-F2', () => {
            if (this.aiDebugger) {
                this.aiDebugger.toggle()
            }
        })
        
        // 作弊码（用于测试）
        this.input.keyboard.on('keydown-F3', () => {
            this.player.heal(50)
            console.log('🩹 玩家回血')
        })
        
        this.input.keyboard.on('keydown-F4', () => {
            this.addScore(100)
            console.log('💰 增加分数')
        })
    }
    
    createDebugSystem() {
        this.debugMode = false
        this.debugGraphics = this.add.graphics()
        this.debugGraphics.setDepth(3000)
        
        // AI调试器
        this.aiDebugger = new AIDebugger(this)
        
        // 性能监控
        this.performanceMonitor = {
            frameCount: 0,
            lastTime: 0,
            fps: 0
        }
    }
    
    update(time, deltaTime) {
        if (this.gameState !== 'playing') return
        
        // 更新玩家
        this.player.update(deltaTime)
        
        // 更新敌人系统
        this.enemyManager.update(deltaTime)
        
        // 更新道具系统
        this.updateItemSystem(deltaTime)
        
        // 更新波次系统
        this.updateWaveSystem(deltaTime)
        
        // 更新UI
        this.updateGameUI()
        
        // 更新调试系统
        if (this.debugMode) {
            this.updateDebug()
        }
        
        // 更新AI调试器
        if (this.aiDebugger) {
            this.aiDebugger.update(time)
        }
        
        // 更新性能监控
        this.updatePerformanceMonitor(time)
        
        // 检查游戏结束条件
        this.checkGameOver()
    }
    
    updateItemSystem(deltaTime) {
        this.itemSpawnTimer += deltaTime
        
        if (this.itemSpawnTimer >= this.itemSpawnInterval) {
            this.spawnRandomItem()
            this.itemSpawnTimer = 0
        }
        
        // 更新道具
        this.items.forEach(item => {
            if (item.update) {
                item.update(deltaTime)
            }
        })
    }
    
    spawnRandomItem() {
        const itemType = Phaser.Utils.Array.GetRandom(this.itemTypes)
        const x = 200 + Math.random() * 2000
        const y = 500 + Math.random() * 1000
        
        const item = this.add.circle(x, y, 15, itemType.color)
        item.itemType = itemType.type
        item.collisionType = 'collectible'
        
        // 添加到物理系统
        this.physics.add.existing(item)
        item.body.setCollideWorldBounds(true)
        item.body.setBounce(0.3)
        
        // 添加到碰撞组
        this.collisionSystem.addToGroup('items', item)
        
        // 添加闪烁效果
        this.tweens.add({
            targets: item,
            alpha: 0.5,
            duration: 1000,
            yoyo: true,
            repeat: -1
        })
        
        this.items.push(item)
        
        // 10秒后自动消失
        this.time.delayedCall(10000, () => {
            this.removeItem(item)
        })
    }
    
    removeItem(item) {
        const index = this.items.indexOf(item)
        if (index !== -1) {
            this.items.splice(index, 1)
            this.collisionSystem.removeFromGroup('items', item)
            item.destroy()
        }
    }
    
    updateWaveSystem(deltaTime) {
        this.waveTimer += deltaTime
        
        if (this.waveTimer >= this.waveInterval) {
            this.startNewWave()
            this.waveTimer = 0
        }
    }
    
    startNewWave() {
        this.wave++
        this.enemiesPerWave = Math.min(8, 3 + Math.floor(this.wave / 2))
        
        // 生成波次敌人
        for (let i = 0; i < this.enemiesPerWave; i++) {
            this.time.delayedCall(i * 1000, () => {
                const spawnPoint = Phaser.Utils.Array.GetRandom(this.enemyManager.spawnPoints)
                this.enemyManager.spawnEnemy(spawnPoint.x, spawnPoint.y, spawnPoint.enemyType)
            })
        }
        
        // 播放音效
        this.soundEffects.waveStart()
        
        // 显示波次提示
        this.showWaveNotification()
    }
    
    showWaveNotification() {
        const notification = this.add.text(400, 300, `第 ${this.wave} 波来袭!`, {
            fontSize: '32px',
            fill: '#ff0000',
            fontFamily: 'Arial'
        }).setOrigin(0.5).setScrollFactor(0).setDepth(3000)
        
        // 动画效果
        this.tweens.add({
            targets: notification,
            scaleX: 1.5,
            scaleY: 1.5,
            alpha: 0,
            duration: 2000,
            ease: 'Power2',
            onComplete: () => {
                notification.destroy()
            }
        })
    }
    
    updateGameUI() {
        this.scoreText.setText(`分数: ${this.score}`)
        this.waveText.setText(`波次: ${this.wave}`)
        this.killsText.setText(`击杀: ${this.enemiesKilled}`)
    }
    
    updatePerformanceMonitor(time) {
        this.performanceMonitor.frameCount++
        
        if (time - this.performanceMonitor.lastTime >= 1000) {
            this.performanceMonitor.fps = this.performanceMonitor.frameCount
            this.performanceMonitor.frameCount = 0
            this.performanceMonitor.lastTime = time
            
            // 更新性能显示
            const collisionStats = this.collisionSystem.getPerformanceStats()
            this.performanceText.setText(
                `FPS: ${this.performanceMonitor.fps} | 敌人: ${this.enemyManager.getActiveEnemyCount()}`
            )
        }
    }
    
    updateDebug() {
        this.debugGraphics.clear()
        
        // 绘制敌人视野
        this.enemyManager.enemies.forEach(enemy => {
            if (enemy.isAlive && enemy.visionSystem) {
                enemy.visionSystem.debugDraw(this.debugGraphics)
            }
        })
        
        // 绘制碰撞边界
        this.debugGraphics.lineStyle(1, 0x00ff00, 0.5)
        this.physics.world.bodies.entries.forEach(body => {
            if (body.gameObject && body.gameObject.active) {
                this.debugGraphics.strokeRect(
                    body.x, body.y, body.width, body.height
                )
            }
        })
    }
    
    // 游戏事件处理
    onEnemyKilled(enemy) {
        this.enemiesKilled++
        this.addScore(enemy.maxHealth * 2)
        this.soundEffects.enemyDeath()
    }
    
    onPlayerHit(damage) {
        this.soundEffects.playerHit()
    }
    
    onItemCollected(item) {
        this.soundEffects.itemCollect()
        this.addScore(10)
    }
    
    addScore(points) {
        this.score += points
    }
    
    pauseGame() {
        if (this.gameState === 'playing') {
            this.gameState = 'paused'
            this.physics.pause()
            this.anims.pauseAll()
            
            // 显示暂停菜单
            this.showPauseMenu()
        } else if (this.gameState === 'paused') {
            this.resumeGame()
        }
    }
    
    resumeGame() {
        this.gameState = 'playing'
        this.physics.resume()
        this.anims.resumeAll()
        this.hidePauseMenu()
    }
    
    restartGame() {
        this.scene.restart()
    }
    
    checkGameOver() {
        if (this.player.health <= 0) {
            this.gameOver()
        }
    }
    
    gameOver() {
        this.gameState = 'gameOver'
        this.physics.pause()
        
        // 显示游戏结束界面
        this.showGameOverScreen()
    }
    
    showPauseMenu() {
        // 简化的暂停菜单
        this.pauseMenu = this.add.text(400, 300, '游戏暂停\n按ESC继续', {
            fontSize: '24px',
            fill: '#ffffff',
            fontFamily: 'Arial',
            align: 'center'
        }).setOrigin(0.5).setScrollFactor(0).setDepth(4000)
    }
    
    hidePauseMenu() {
        if (this.pauseMenu) {
            this.pauseMenu.destroy()
            this.pauseMenu = null
        }
    }
    
    showGameOverScreen() {
        const gameOverText = this.add.text(400, 300, 
            `游戏结束!\n最终分数: ${this.score}\n击杀数: ${this.enemiesKilled}\n按R重新开始`, {
            fontSize: '24px',
            fill: '#ff0000',
            fontFamily: 'Arial',
            align: 'center'
        }).setOrigin(0.5).setScrollFactor(0).setDepth(4000)
    }
    
    toggleDebug() {
        this.debugMode = !this.debugMode
        this.debugGraphics.setVisible(this.debugMode)
    }
}
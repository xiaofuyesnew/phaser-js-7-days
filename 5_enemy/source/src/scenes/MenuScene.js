export default class MenuScene extends Phaser.Scene {
    constructor() {
        super({ key: 'MenuScene' })
    }
    
    preload() {
        // 创建简单的纹理
        this.createTextures()
    }
    
    create() {
        // 添加标题
        this.add.text(400, 200, 'Day 5: 敌人与碰撞检测', {
            fontSize: '32px',
            fill: '#ffffff',
            fontFamily: 'Arial'
        }).setOrigin(0.5)
        
        // 添加说明
        this.add.text(400, 280, '使用 WASD 移动，空格键攻击', {
            fontSize: '18px',
            fill: '#cccccc',
            fontFamily: 'Arial'
        }).setOrigin(0.5)
        
        // 添加开始按钮
        const startButton = this.add.text(400, 350, '开始游戏', {
            fontSize: '24px',
            fill: '#00ff00',
            fontFamily: 'Arial'
        }).setOrigin(0.5)
        
        startButton.setInteractive()
        startButton.on('pointerdown', () => {
            this.scene.start('GameScene')
        })
        
        startButton.on('pointerover', () => {
            startButton.setStyle({ fill: '#ffffff' })
        })
        
        startButton.on('pointerout', () => {
            startButton.setStyle({ fill: '#00ff00' })
        })
        
        // 添加控制说明
        this.add.text(400, 450, '按 R 键重新开始', {
            fontSize: '16px',
            fill: '#888888',
            fontFamily: 'Arial'
        }).setOrigin(0.5)
    }
    
    createTextures() {
        // 创建玩家纹理
        const playerGraphics = this.add.graphics()
        playerGraphics.fillStyle(0x00ff00)
        playerGraphics.fillRect(0, 0, 32, 32)
        playerGraphics.generateTexture('player', 32, 32)
        playerGraphics.destroy()
        
        // 创建敌人纹理
        const enemyGraphics = this.add.graphics()
        enemyGraphics.fillStyle(0xff0000)
        enemyGraphics.fillRect(0, 0, 28, 28)
        enemyGraphics.generateTexture('enemy', 28, 28)
        enemyGraphics.destroy()
        
        // 创建巡逻兵纹理
        const patrolGraphics = this.add.graphics()
        patrolGraphics.fillStyle(0xff6666)
        patrolGraphics.fillRect(0, 0, 24, 24)
        patrolGraphics.generateTexture('patrol-enemy', 24, 24)
        patrolGraphics.destroy()
        
        // 创建追击者纹理
        const chaserGraphics = this.add.graphics()
        chaserGraphics.fillStyle(0xff3333)
        chaserGraphics.fillRect(0, 0, 26, 26)
        chaserGraphics.generateTexture('chaser-enemy', 26, 26)
        chaserGraphics.destroy()
        
        // 创建守卫纹理
        const guardGraphics = this.add.graphics()
        guardGraphics.fillStyle(0x990000)
        guardGraphics.fillRect(0, 0, 32, 32)
        guardGraphics.generateTexture('guard-enemy', 32, 32)
        guardGraphics.destroy()
        
        // 创建子弹纹理
        const bulletGraphics = this.add.graphics()
        bulletGraphics.fillStyle(0xffff00)
        bulletGraphics.fillCircle(4, 4, 4)
        bulletGraphics.generateTexture('bullet', 8, 8)
        bulletGraphics.destroy()
        
        // 创建金币纹理
        const coinGraphics = this.add.graphics()
        coinGraphics.fillStyle(0xffd700)
        coinGraphics.fillCircle(8, 8, 8)
        coinGraphics.generateTexture('coin', 16, 16)
        coinGraphics.destroy()
        
        // 创建地面纹理
        const groundGraphics = this.add.graphics()
        groundGraphics.fillStyle(0x8B4513)
        groundGraphics.fillRect(0, 0, 32, 32)
        groundGraphics.generateTexture('ground', 32, 32)
        groundGraphics.destroy()
    }
}
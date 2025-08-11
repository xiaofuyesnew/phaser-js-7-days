import EnemyStateMachine from '../ai/StateMachine.js'
import VisionSystem from '../ai/VisionSystem.js'
import HearingSystem from '../ai/HearingSystem.js'
import PatrolState from '../ai/states/PatrolState.js'
import ChaseState from '../ai/states/ChaseState.js'
import AttackState from '../ai/states/AttackState.js'

// 敌人基类
export default class Enemy extends Phaser.Physics.Arcade.Sprite {
    constructor(scene, x, y, texture) {
        super(scene, x, y, texture)
        
        // 添加到场景
        scene.add.existing(this)
        scene.physics.add.existing(this)
        
        // 基础属性
        this.health = 30
        this.maxHealth = 30
        this.speed = 50
        this.contactDamage = 5
        this.collisionType = 'enemy'
        this.name = 'Enemy'
        
        // AI系统
        this.stateMachine = new EnemyStateMachine(this)
        this.visionSystem = new VisionSystem(this)
        this.hearingSystem = new HearingSystem(this)
        
        // 添加状态
        this.stateMachine.addState('patrol', new PatrolState())
        this.stateMachine.addState('chase', new ChaseState())
        this.stateMachine.addState('attack', new AttackState())
        
        // 开始巡逻
        this.stateMachine.changeState('patrol')
        
        // 设置物理属性
        this.setCollideWorldBounds(true)
        this.setBounce(0.2)
        this.setDrag(100)
        
        // 创建血条
        this.createHealthBar()
        
        // 标记为活跃状态
        this.isAlive = true
        this.shouldDestroy = false
    }
    
    createHealthBar() {
        this.healthBarBg = this.scene.add.rectangle(
            this.x, this.y - 30, 40, 6, 0x000000
        )
        this.healthBar = this.scene.add.rectangle(
            this.x, this.y - 30, 38, 4, 0x00ff00
        )
        
        this.healthBarBg.setDepth(100)
        this.healthBar.setDepth(101)
    }
    
    update(deltaTime) {
        if (!this.isAlive) return
        
        // 更新AI状态机
        this.stateMachine.update(deltaTime)
        
        // 更新血条位置
        this.updateHealthBar()
        
        // 更新视野方向（基于移动方向）
        if (this.body.velocity.x !== 0) {
            this.visionSystem.viewDirection = this.body.velocity.x > 0 ? 0 : Math.PI
        }
    }
    
    updateHealthBar() {
        if (!this.healthBarBg || !this.healthBar) return
        
        this.healthBarBg.setPosition(this.x, this.y - 30)
        this.healthBar.setPosition(this.x, this.y - 30)
        
        const healthPercent = this.health / this.maxHealth
        this.healthBar.scaleX = healthPercent
        
        // 根据血量改变颜色
        if (healthPercent > 0.6) {
            this.healthBar.setFillStyle(0x00ff00)
        } else if (healthPercent > 0.3) {
            this.healthBar.setFillStyle(0xffff00)
        } else {
            this.healthBar.setFillStyle(0xff0000)
        }
    }
    
    takeDamage(damage) {
        if (!this.isAlive) return
        
        this.health -= damage
        
        // 受伤效果
        this.setTint(0xff6666)
        this.scene.time.delayedCall(200, () => {
            if (this.isAlive) {
                this.clearTint()
            }
        })
        
        // 击退效果
        const knockbackForce = 100
        const angle = Math.random() * Math.PI * 2
        this.setVelocity(
            Math.cos(angle) * knockbackForce,
            Math.sin(angle) * knockbackForce
        )
        
        if (this.health <= 0) {
            this.die()
        }
    }
    
    die() {
        if (!this.isAlive) return
        
        this.isAlive = false
        console.log(`${this.name} 死亡`)
        
        // 死亡动画
        this.setTint(0x666666)
        
        // 清理血条
        if (this.healthBarBg) {
            this.healthBarBg.destroy()
            this.healthBarBg = null
        }
        if (this.healthBar) {
            this.healthBar.destroy()
            this.healthBar = null
        }
        
        // 掉落物品
        this.dropItems()
        
        // 标记为需要销毁
        this.shouldDestroy = true
        
        // 延迟销毁
        this.scene.time.delayedCall(1000, () => {
            this.destroy()
        })
    }
    
    dropItems() {
        // 随机掉落物品
        if (Math.random() < 0.3) {
            // 30%概率掉落金币
            const coin = this.scene.add.sprite(this.x, this.y, 'coin')
            coin.setScale(0.5)
            
            // 简单的掉落动画
            this.scene.tweens.add({
                targets: coin,
                y: coin.y - 20,
                duration: 500,
                ease: 'Power2',
                yoyo: true
            })
            
            // 5秒后自动消失
            this.scene.time.delayedCall(5000, () => {
                if (coin && coin.active) {
                    coin.destroy()
                }
            })
        }
    }
    
    // 重置敌人状态（用于对象池）
    reset(x, y) {
        this.setPosition(x, y)
        this.health = this.maxHealth
        this.isAlive = true
        this.shouldDestroy = false
        this.clearTint()
        this.setVelocity(0, 0)
        
        // 重新创建血条
        this.createHealthBar()
        
        // 重置状态机
        this.stateMachine.changeState('patrol')
    }
    
    // 清理资源
    cleanup() {
        if (this.healthBarBg) {
            this.healthBarBg.destroy()
            this.healthBarBg = null
        }
        if (this.healthBar) {
            this.healthBar.destroy()
            this.healthBar = null
        }
    }
    
    // 获取当前状态
    getCurrentState() {
        return this.stateMachine.getCurrentStateName()
    }
}
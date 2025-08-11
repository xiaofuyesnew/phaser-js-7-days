import CollisionSystem from '../systems/CollisionSystem.js'

/**
 * 练习2: 智能碰撞系统
 * 
 * 目标: 实现完整的碰撞检测和响应系统
 * 
 * 要求:
 * 1. 创建多种碰撞类型
 * 2. 实现碰撞响应回调
 * 3. 添加击退和伤害效果
 * 4. 优化碰撞检测性能
 */

export default class AdvancedCollisionSystem extends CollisionSystem {
    constructor(scene) {
        super(scene)
        
        // 碰撞响应系统
        this.collisionResponses = new Map()
        
        // 碰撞效果系统
        this.effectsEnabled = true
        
        // 性能统计
        this.collisionStats = {
            totalChecks: 0,
            activeCollisions: 0,
            lastFrameTime: 0
        }
        
        this.setupCollisionResponses()
    }
    
    setupCollisionResponses() {
        // 玩家与敌人碰撞
        this.registerCollisionResponse('player', 'enemy', (player, enemy) => {
            if (!player.invulnerable && enemy.isAlive) {
                // 造成伤害
                player.takeDamage(enemy.contactDamage)
                
                // 击退效果
                this.applyKnockback(player, enemy, 150)
                
                // 创建碰撞特效
                this.createCollisionEffect(player.x, player.y, 'damage')
                
                // 屏幕震动
                this.scene.cameras.main.shake(100, 0.005)
            }
        })
        
        // 子弹与敌人碰撞
        this.registerCollisionResponse('bullet', 'enemy', (bullet, enemy) => {
            if (enemy.isAlive) {
                // 造成伤害
                enemy.takeDamage(bullet.damage || 10)
                
                // 击退效果
                this.applyKnockback(enemy, bullet, 100)
                
                // 创建击中特效
                this.createCollisionEffect(bullet.x, bullet.y, 'hit')
                
                // 销毁子弹
                bullet.destroy()
            }
        })
        
        // 玩家与收集品碰撞
        this.registerCollisionResponse('player', 'collectible', (player, item) => {
            // 收集物品
            this.collectItem(player, item)
            
            // 创建收集特效
            this.createCollisionEffect(item.x, item.y, 'collect')
            
            // 销毁物品
            item.destroy()
        })
    }
    
    // 注册碰撞响应
    registerCollisionResponse(type1, type2, callback) {
        const key = `${type1}-${type2}`
        this.collisionResponses.set(key, callback)
        
        // 同时注册反向碰撞
        const reverseKey = `${type2}-${type1}`
        this.collisionResponses.set(reverseKey, (obj2, obj1) => callback(obj1, obj2))
    }
    
    // 处理碰撞
    handleCollision(object1, object2) {
        this.collisionStats.totalChecks++
        
        const type1 = object1.collisionType || 'default'
        const type2 = object2.collisionType || 'default'
        const key = `${type1}-${type2}`
        
        const response = this.collisionResponses.get(key)
        if (response) {
            this.collisionStats.activeCollisions++
            response(object1, object2)
            return true
        }
        
        return false
    }
    
    // 应用击退效果
    applyKnockback(target, source, force) {
        if (!target.body || !source) return
        
        const angle = Phaser.Math.Angle.Between(
            source.x, source.y,
            target.x, target.y
        )
        
        const knockbackX = Math.cos(angle) * force
        const knockbackY = Math.sin(angle) * force
        
        target.setVelocity(knockbackX, knockbackY)
    }
    
    // 创建碰撞特效
    createCollisionEffect(x, y, type) {
        if (!this.effectsEnabled) return
        
        let color, size, duration
        
        switch (type) {
            case 'damage':
                color = 0xff0000
                size = 30
                duration = 300
                break
            case 'hit':
                color = 0xffff00
                size = 20
                duration = 200
                break
            case 'collect':
                color = 0x00ff00
                size = 25
                duration = 400
                break
            default:
                color = 0xffffff
                size = 15
                duration = 250
        }
        
        // 创建特效圆圈
        const effect = this.scene.add.circle(x, y, size, color, 0.6)
        effect.setDepth(1000)
        
        // 特效动画
        this.scene.tweens.add({
            targets: effect,
            scaleX: 2,
            scaleY: 2,
            alpha: 0,
            duration: duration,
            ease: 'Power2',
            onComplete: () => {
                effect.destroy()
            }
        })
        
        // 添加粒子效果
        this.createParticleEffect(x, y, color)
    }
    
    // 创建粒子效果
    createParticleEffect(x, y, color) {
        const particleCount = 5
        
        for (let i = 0; i < particleCount; i++) {
            const particle = this.scene.add.circle(x, y, 3, color)
            particle.setDepth(999)
            
            const angle = (Math.PI * 2 * i) / particleCount
            const speed = 50 + Math.random() * 50
            
            this.scene.tweens.add({
                targets: particle,
                x: x + Math.cos(angle) * speed,
                y: y + Math.sin(angle) * speed,
                alpha: 0,
                duration: 500,
                ease: 'Power2',
                onComplete: () => {
                    particle.destroy()
                }
            })
        }
    }
    
    // 收集物品
    collectItem(player, item) {
        switch (item.itemType) {
            case 'health':
                player.heal(20)
                this.showFloatingText(item.x, item.y, '+20 HP', 0x00ff00)
                break
            case 'coin':
                // 增加分数或金币
                this.showFloatingText(item.x, item.y, '+10', 0xffd700)
                break
            case 'powerup':
                // 应用增益效果
                this.showFloatingText(item.x, item.y, 'Power Up!', 0xff00ff)
                break
        }
    }
    
    // 显示浮动文字
    showFloatingText(x, y, text, color) {
        const floatingText = this.scene.add.text(x, y, text, {
            fontSize: '16px',
            fill: `#${color.toString(16).padStart(6, '0')}`,
            fontFamily: 'Arial'
        }).setOrigin(0.5)
        
        floatingText.setDepth(1001)
        
        this.scene.tweens.add({
            targets: floatingText,
            y: y - 50,
            alpha: 0,
            duration: 1000,
            ease: 'Power2',
            onComplete: () => {
                floatingText.destroy()
            }
        })
    }
    
    // 高级射线检测
    advancedRaycast(startX, startY, endX, endY, options = {}) {
        const {
            ignoreTypes = [],
            maxDistance = Infinity,
            piercing = false
        } = options
        
        const line = new Phaser.Geom.Line(startX, startY, endX, endY)
        const hits = []
        
        // 获取所有可能的碰撞对象
        const allObjects = []
        this.collisionGroups.forEach(group => {
            group.children.entries.forEach(obj => {
                if (obj.active && obj.body && !ignoreTypes.includes(obj.collisionType)) {
                    allObjects.push(obj)
                }
            })
        })
        
        // 检测碰撞
        allObjects.forEach(obj => {
            const bounds = obj.body.getBounds()
            const rect = new Phaser.Geom.Rectangle(
                bounds.x, bounds.y, bounds.width, bounds.height
            )
            
            const intersection = Phaser.Geom.Intersects.GetLineToRectangle(line, rect)
            if (intersection.length > 0) {
                const distance = Phaser.Math.Distance.Between(
                    startX, startY,
                    intersection[0].x, intersection[0].y
                )
                
                if (distance <= maxDistance) {
                    hits.push({
                        object: obj,
                        point: intersection[0],
                        distance: distance
                    })
                }
            }
        })
        
        // 按距离排序
        hits.sort((a, b) => a.distance - b.distance)
        
        // 如果不是穿透射线，只返回第一个命中
        return piercing ? hits : hits.slice(0, 1)
    }
    
    // 获取性能统计
    getPerformanceStats() {
        return {
            ...this.collisionStats,
            efficiency: this.collisionStats.totalChecks > 0 ? 
                this.collisionStats.activeCollisions / this.collisionStats.totalChecks : 0
        }
    }
    
    // 重置统计
    resetStats() {
        this.collisionStats = {
            totalChecks: 0,
            activeCollisions: 0,
            lastFrameTime: 0
        }
    }
    
    // 切换特效
    toggleEffects(enabled) {
        this.effectsEnabled = enabled
    }
}

// 练习指导
export const Exercise2Guide = {
    title: "练习2: 智能碰撞系统",
    description: "实现完整的碰撞检测和响应系统",
    
    steps: [
        {
            step: 1,
            title: "设置碰撞组",
            description: "创建不同类型的碰撞组并设置碰撞关系",
            code: `
// 在GameScene中使用AdvancedCollisionSystem
import AdvancedCollisionSystem from './exercises/Exercise2_CollisionSystem.js'

this.collisionSystem = new AdvancedCollisionSystem(this)
            `
        },
        {
            step: 2,
            title: "自定义碰撞响应",
            description: "为不同类型的碰撞添加自定义响应",
            code: `
// 添加自定义碰撞响应
this.collisionSystem.registerCollisionResponse('player', 'trap', (player, trap) => {
    player.takeDamage(trap.damage)
    trap.activate()
})
            `
        },
        {
            step: 3,
            title: "性能优化",
            description: "监控碰撞检测性能并进行优化",
            code: `
// 获取性能统计
const stats = this.collisionSystem.getPerformanceStats()
console.log('碰撞检测效率:', stats.efficiency)
            `
        }
    ],
    
    challenges: [
        {
            title: "碰撞预测系统",
            description: "实现碰撞预测，提前计算可能的碰撞",
            difficulty: "⭐⭐⭐",
            hints: [
                "计算对象的未来位置",
                "使用速度向量预测轨迹",
                "实现预测性碰撞检测",
                "添加预警系统"
            ],
            solution: `
// 碰撞预测实现
predictCollision(object1, object2, timeStep = 100) {
    const futurePos1 = {
        x: object1.x + object1.body.velocity.x * timeStep / 1000,
        y: object1.y + object1.body.velocity.y * timeStep / 1000
    }
    
    const futurePos2 = {
        x: object2.x + object2.body.velocity.x * timeStep / 1000,
        y: object2.y + object2.body.velocity.y * timeStep / 1000
    }
    
    return this.checkCollisionAtPositions(futurePos1, futurePos2)
}
            `
        },
        {
            title: "碰撞层级系统",
            description: "添加碰撞层级系统，某些对象只与特定层级碰撞",
            difficulty: "⭐⭐",
            hints: [
                "为对象添加layer属性",
                "创建层级碰撞矩阵",
                "实现层级过滤逻辑",
                "优化碰撞检测性能"
            ],
            solution: `
// 层级系统实现
setupCollisionLayers() {
    this.collisionMatrix = {
        'player': ['enemy', 'item', 'environment'],
        'enemy': ['player', 'environment'],
        'bullet': ['enemy', 'environment'],
        'item': ['player']
    }
}

canCollide(obj1, obj2) {
    const layer1 = obj1.collisionLayer || 'default'
    const layer2 = obj2.collisionLayer || 'default'
    
    return this.collisionMatrix[layer1]?.includes(layer2) || false
}
            `
        },
        {
            title: "可破坏环境",
            description: "创建可破坏的环境，玩家攻击可以破坏某些地形",
            difficulty: "⭐⭐⭐",
            hints: [
                "创建可破坏地形类",
                "添加耐久度系统",
                "实现破坏动画效果",
                "处理地形移除后的物理更新"
            ],
            solution: `
// 可破坏地形实现
class DestructibleTerrain extends Phaser.Physics.Arcade.Sprite {
    constructor(scene, x, y) {
        super(scene, x, y, 'destructible_wall')
        this.durability = 3
        this.maxDurability = 3
    }
    
    takeDamage(damage) {
        this.durability -= damage
        this.updateVisual()
        
        if (this.durability <= 0) {
            this.destroy()
        }
    }
    
    updateVisual() {
        const alpha = this.durability / this.maxDurability
        this.setAlpha(alpha)
    }
}
            `
        }
    ],
    
    practiceExercises: [
        {
            title: "碰撞效果练习",
            description: "为不同类型的碰撞添加视觉和音效反馈",
            steps: [
                "注册自定义碰撞响应",
                "添加粒子特效",
                "实现屏幕震动",
                "播放音效反馈"
            ],
            expectedResult: "碰撞时有丰富的视觉和听觉反馈"
        },
        {
            title: "性能优化练习",
            description: "监控和优化碰撞检测性能",
            steps: [
                "启用性能统计",
                "观察碰撞检测效率",
                "实现空间分割优化",
                "测试优化效果"
            ],
            expectedResult: "理解碰撞检测的性能影响和优化方法"
        },
        {
            title: "高级射线检测练习",
            description: "使用射线检测实现视线检查和瞄准辅助",
            steps: [
                "实现基础射线检测",
                "添加穿透和非穿透模式",
                "可视化射线轨迹",
                "应用到游戏逻辑中"
            ],
            expectedResult: "掌握射线检测的应用场景和实现方法"
        }
    ]
}
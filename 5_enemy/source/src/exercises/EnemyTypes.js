/**
 * 多种敌人类型定义
 * 
 * 这个文件包含了各种不同行为模式的敌人类型
 * 用于练习和测试不同的AI行为
 */

import Enemy from '../sprites/Enemy.js'
import State from '../ai/State.js'

// 狂暴状态 - 用于愤怒敌人
class BerserkState extends State {
    constructor() {
        super('berserk')
        this.berserkDuration = 8000
        this.berserkTimer = 0
    }
    
    enter() {
        console.log(`${this.owner.name} 进入狂暴状态!`)
        this.owner.setTint(0xff0000) // 红色表示狂暴
        this.berserkTimer = 0
        
        // 提升能力
        this.originalSpeed = this.owner.speed
        this.originalDamage = this.owner.contactDamage
        
        this.owner.speed *= 1.5
        this.owner.contactDamage *= 1.3
        
        // 创建狂暴特效
        this.createBerserkEffect()
    }
    
    update(deltaTime) {
        this.berserkTimer += deltaTime
        
        // 狂暴状态下的行为
        this.aggressiveBehavior()
        
        // 检查狂暴时间
        if (this.berserkTimer >= this.berserkDuration) {
            this.stateMachine.changeState('patrol')
            return
        }
        
        // 如果能看到玩家，继续追击
        if (this.owner.visionSystem.canSee(this.owner.scene.player)) {
            this.chasePlayer()
        }
    }
    
    aggressiveBehavior() {
        // 狂暴状态下更激进的行为
        if (Math.random() < 0.05) { // 5%概率发出咆哮
            this.roar()
        }
        
        // 破坏周围环境
        if (Math.random() < 0.02) {
            this.destroyNearbyObjects()
        }
    }
    
    chasePlayer() {
        const player = this.owner.scene.player
        if (!player) return
        
        const angle = Phaser.Math.Angle.Between(
            this.owner.x, this.owner.y,
            player.x, player.y
        )
        
        this.owner.setVelocity(
            Math.cos(angle) * this.owner.speed,
            Math.sin(angle) * this.owner.speed
        )
    }
    
    roar() {
        console.log(`${this.owner.name} 发出愤怒的咆哮!`)
        
        // 震慑附近敌人
        const nearbyEnemies = this.owner.scene.enemyManager.getEnemiesInRange(
            this.owner.x, this.owner.y, 150
        )
        
        nearbyEnemies.forEach(enemy => {
            if (enemy !== this.owner) {
                enemy.receiveInspiration() // 激励其他敌人
            }
        })
    }
    
    createBerserkEffect() {
        // 创建狂暴光环效果
        const effect = this.owner.scene.add.circle(
            this.owner.x, this.owner.y, 40, 0xff0000, 0.3
        )
        effect.setDepth(this.owner.depth - 1)
        
        // 跟随敌人移动
        this.owner.scene.tweens.add({
            targets: effect,
            scaleX: 1.5,
            scaleY: 1.5,
            alpha: 0.1,
            duration: 500,
            yoyo: true,
            repeat: -1
        })
        
        // 保存特效引用以便清理
        this.berserkEffect = effect
    }
    
    destroyNearbyObjects() {
        // 简化的环境破坏效果
        console.log(`${this.owner.name} 破坏了周围的环境!`)
        
        // 创建破坏特效
        const debris = this.owner.scene.add.particles(
            this.owner.x, this.owner.y, 'debris', {
                speed: { min: 50, max: 100 },
                scale: { start: 0.3, end: 0 },
                lifespan: 1000,
                quantity: 5
            }
        )
        
        // 1秒后清理特效
        this.owner.scene.time.delayedCall(1000, () => {
            debris.destroy()
        })
    }
    
    exit() {
        console.log(`${this.owner.name} 狂暴状态结束`)
        
        // 恢复原始能力
        this.owner.speed = this.originalSpeed
        this.owner.contactDamage = this.originalDamage
        
        // 清理特效
        if (this.berserkEffect) {
            this.berserkEffect.destroy()
            this.berserkEffect = null
        }
        
        // 清除颜色
        this.owner.clearTint()
        
        this.berserkTimer = 0
    }
}

// 恐惧状态 - 用于胆小敌人
class FearState extends State {
    constructor() {
        super('fear')
        this.fearDuration = 5000
        this.fearTimer = 0
        this.fleeSpeed = 80
    }
    
    enter() {
        console.log(`${this.owner.name} 感到恐惧，开始逃跑!`)
        this.owner.setTint(0x4444ff) // 蓝色表示恐惧
        this.fearTimer = 0
        
        // 寻找逃跑方向
        this.findFleeDirection()
    }
    
    update(deltaTime) {
        this.fearTimer += deltaTime
        
        // 继续逃跑
        this.fleeFromPlayer()
        
        // 恐惧时间结束
        if (this.fearTimer >= this.fearDuration) {
            this.stateMachine.changeState('patrol')
            return
        }
        
        // 如果玩家太近，继续恐惧
        const player = this.owner.scene.player
        if (player) {
            const distance = Phaser.Math.Distance.Between(
                this.owner.x, this.owner.y,
                player.x, player.y
            )
            
            if (distance < 100) {
                this.fearTimer = Math.max(0, this.fearTimer - deltaTime * 0.5)
            }
        }
    }
    
    findFleeDirection() {
        const player = this.owner.scene.player
        if (!player) return
        
        // 计算远离玩家的方向
        this.fleeAngle = Phaser.Math.Angle.Between(
            player.x, player.y,
            this.owner.x, this.owner.y
        )
        
        // 添加一些随机性
        this.fleeAngle += (Math.random() - 0.5) * Math.PI * 0.5
    }
    
    fleeFromPlayer() {
        this.owner.setVelocity(
            Math.cos(this.fleeAngle) * this.fleeSpeed,
            Math.sin(this.fleeAngle) * this.fleeSpeed
        )
        
        // 偶尔调整逃跑方向
        if (Math.random() < 0.02) {
            this.findFleeDirection()
        }
    }
    
    exit() {
        this.owner.setVelocity(0, 0)
        this.owner.clearTint()
        this.fearTimer = 0
    }
}

// 狂暴敌人 - 受伤后会进入狂暴状态
export class BerserkEnemy extends Enemy {
    constructor(scene, x, y) {
        super(scene, x, y, 'enemy')
        
        this.name = 'Berserker'
        this.health = 40
        this.maxHealth = 40
        this.speed = 50
        this.contactDamage = 8
        this.berserkThreshold = 0.5 // 血量低于50%时狂暴
        
        // 添加狂暴状态
        this.stateMachine.addState('berserk', new BerserkState())
        
        this.setTint(0xffaaaa) // 淡红色
    }
    
    takeDamage(damage) {
        super.takeDamage(damage)
        
        // 检查是否应该进入狂暴状态
        const healthPercent = this.health / this.maxHealth
        if (healthPercent <= this.berserkThreshold && !this.stateMachine.isInState('berserk')) {
            this.stateMachine.changeState('berserk')
        }
    }
    
    receiveInspiration() {
        // 受到其他狂暴敌人的激励
        if (this.stateMachine.isInState('patrol') || this.stateMachine.isInState('chase')) {
            this.speed *= 1.2
            this.contactDamage *= 1.1
            
            console.log(`${this.name} 受到激励，变得更加强大!`)
            
            // 3秒后恢复
            this.scene.time.delayedCall(3000, () => {
                this.speed /= 1.2
                this.contactDamage /= 1.1
            })
        }
    }
}

// 胆小敌人 - 玩家靠近时会逃跑
export class CowardEnemy extends Enemy {
    constructor(scene, x, y) {
        super(scene, x, y, 'enemy')
        
        this.name = 'Coward'
        this.health = 15
        this.maxHealth = 15
        this.speed = 70
        this.contactDamage = 3
        this.fearDistance = 120 // 恐惧距离
        
        // 添加恐惧状态
        this.stateMachine.addState('fear', new FearState())
        
        // 调整视野 - 更大的视野但更容易害怕
        this.visionSystem.viewDistance = 150
        this.visionSystem.viewAngle = Math.PI // 180度视角
        
        this.setTint(0xaaaaff) // 淡蓝色
    }
    
    update(deltaTime) {
        super.update(deltaTime)
        
        // 检查是否应该恐惧
        if (!this.stateMachine.isInState('fear')) {
            this.checkForFear()
        }
    }
    
    checkForFear() {
        const player = this.scene.player
        if (!player) return
        
        const distance = Phaser.Math.Distance.Between(
            this.x, this.y, player.x, player.y
        )
        
        if (distance < this.fearDistance && this.visionSystem.canSee(player)) {
            this.stateMachine.changeState('fear')
        }
    }
    
    takeDamage(damage) {
        super.takeDamage(damage)
        
        // 受伤时立即进入恐惧状态
        if (!this.stateMachine.isInState('fear')) {
            this.stateMachine.changeState('fear')
        }
    }
}

// 群体敌人 - 喜欢聚集在一起
export class PackEnemy extends Enemy {
    constructor(scene, x, y) {
        super(scene, x, y, 'enemy')
        
        this.name = 'PackHunter'
        this.health = 25
        this.maxHealth = 25
        this.speed = 55
        this.contactDamage = 5
        this.packRange = 100 // 群体范围
        this.packBonus = 1.0 // 群体加成
        
        this.setTint(0xffaaff) // 淡紫色
    }
    
    update(deltaTime) {
        super.update(deltaTime)
        
        // 更新群体加成
        this.updatePackBonus()
        
        // 群体行为
        this.packBehavior()
    }
    
    updatePackBonus() {
        const packMembers = this.scene.enemyManager.enemies.filter(enemy => {
            return enemy !== this && 
                   enemy.constructor === PackEnemy &&
                   Phaser.Math.Distance.Between(this.x, this.y, enemy.x, enemy.y) < this.packRange
        })
        
        // 根据群体数量计算加成
        const packSize = packMembers.length + 1
        this.packBonus = 1.0 + (packSize - 1) * 0.15 // 每个成员增加15%
        
        // 应用加成到属性
        const baseSpeed = 55
        const baseDamage = 5
        
        this.speed = baseSpeed * this.packBonus
        this.contactDamage = baseDamage * this.packBonus
        
        // 视觉反馈
        if (packSize > 1) {
            this.setTint(0xff44ff) // 更深的紫色表示群体加成
        } else {
            this.setTint(0xffaaff) // 恢复原色
        }
    }
    
    packBehavior() {
        // 如果没有在追击玩家，尝试靠近其他群体成员
        if (this.stateMachine.isInState('patrol')) {
            this.moveTowardsPack()
        }
    }
    
    moveTowardsPack() {
        const nearbyPack = this.scene.enemyManager.enemies.filter(enemy => {
            return enemy !== this && 
                   enemy.constructor === PackEnemy &&
                   Phaser.Math.Distance.Between(this.x, this.y, enemy.x, enemy.y) < 200
        })
        
        if (nearbyPack.length > 0) {
            // 计算群体中心
            let centerX = 0, centerY = 0
            nearbyPack.forEach(enemy => {
                centerX += enemy.x
                centerY += enemy.y
            })
            centerX /= nearbyPack.length
            centerY /= nearbyPack.length
            
            // 如果距离群体中心太远，向中心移动
            const distanceToCenter = Phaser.Math.Distance.Between(
                this.x, this.y, centerX, centerY
            )
            
            if (distanceToCenter > this.packRange) {
                const angle = Phaser.Math.Angle.Between(
                    this.x, this.y, centerX, centerY
                )
                
                this.setVelocity(
                    Math.cos(angle) * this.speed * 0.5,
                    Math.sin(angle) * this.speed * 0.5
                )
            }
        }
    }
}

// 陷阱敌人 - 伪装成道具，玩家靠近时攻击
export class TrapEnemy extends Enemy {
    constructor(scene, x, y) {
        super(scene, x, y, 'item') // 伪装成道具
        
        this.name = 'Mimic'
        this.health = 30
        this.maxHealth = 30
        this.speed = 0 // 初始不移动
        this.contactDamage = 12
        this.triggerDistance = 50
        this.isRevealed = false
        
        // 初始状态为伪装
        this.stateMachine.changeState('disguise')
        this.addDisguiseState()
        
        this.setTint(0xffd700) // 金色，像宝箱
    }
    
    addDisguiseState() {
        const disguiseState = new State('disguise')
        
        disguiseState.enter = () => {
            console.log(`${this.name} 伪装成道具`)
            this.setVelocity(0, 0)
            this.isRevealed = false
        }
        
        disguiseState.update = (deltaTime) => {
            const player = this.scene.player
            if (!player) return
            
            const distance = Phaser.Math.Distance.Between(
                this.x, this.y, player.x, player.y
            )
            
            if (distance < this.triggerDistance) {
                this.stateMachine.changeState('reveal')
            }
        }
        
        this.stateMachine.addState('disguise', disguiseState)
        
        // 添加揭露状态
        const revealState = new State('reveal')
        
        revealState.enter = () => {
            console.log(`${this.name} 露出真面目!`)
            this.reveal()
        }
        
        revealState.update = (deltaTime) => {
            // 揭露后正常AI行为
            if (this.visionSystem.canSee(this.scene.player)) {
                this.stateMachine.changeState('chase')
            }
        }
        
        this.stateMachine.addState('reveal', revealState)
    }
    
    reveal() {
        this.isRevealed = true
        this.speed = 45
        this.setTexture('enemy') // 切换到敌人贴图
        this.setTint(0xff4444) // 红色表示危险
        
        // 创建揭露特效
        const revealEffect = this.scene.add.circle(this.x, this.y, 60, 0xff0000, 0.5)
        revealEffect.setDepth(this.depth + 1)
        
        this.scene.tweens.add({
            targets: revealEffect,
            scaleX: 2,
            scaleY: 2,
            alpha: 0,
            duration: 800,
            ease: 'Power2',
            onComplete: () => {
                revealEffect.destroy()
            }
        })
        
        // 震动屏幕
        this.scene.cameras.main.shake(200, 0.01)
    }
    
    takeDamage(damage) {
        // 受到伤害时立即揭露
        if (!this.isRevealed) {
            this.stateMachine.changeState('reveal')
        }
        
        super.takeDamage(damage)
    }
}

// 远程敌人 - 可以发射子弹
export class RangedEnemy extends Enemy {
    constructor(scene, x, y) {
        super(scene, x, y, 'enemy')
        
        this.name = 'Archer'
        this.health = 20
        this.maxHealth = 20
        this.speed = 40
        this.contactDamage = 3
        this.attackRange = 200
        this.attackCooldown = 2000
        this.lastAttackTime = 0
        
        this.setTint(0x44ff44) // 绿色
        
        // 调整AI参数
        this.visionSystem.viewDistance = 250
        this.preferredDistance = 150 // 偏好保持的距离
    }
    
    update(deltaTime) {
        super.update(deltaTime)
        
        // 远程攻击逻辑
        this.rangedAttackBehavior()
    }
    
    rangedAttackBehavior() {
        const player = this.scene.player
        if (!player || !this.visionSystem.canSee(player)) return
        
        const distance = Phaser.Math.Distance.Between(
            this.x, this.y, player.x, player.y
        )
        
        const currentTime = Date.now()
        
        // 在攻击范围内且冷却完成
        if (distance <= this.attackRange && 
            currentTime - this.lastAttackTime >= this.attackCooldown) {
            this.fireProjectile(player)
            this.lastAttackTime = currentTime
        }
        
        // 保持适当距离
        this.maintainDistance(player, distance)
    }
    
    maintainDistance(player, distance) {
        if (distance < this.preferredDistance * 0.8) {
            // 太近了，后退
            const angle = Phaser.Math.Angle.Between(
                player.x, player.y, this.x, this.y
            )
            
            this.setVelocity(
                Math.cos(angle) * this.speed,
                Math.sin(angle) * this.speed
            )
        } else if (distance > this.attackRange) {
            // 太远了，靠近
            const angle = Phaser.Math.Angle.Between(
                this.x, this.y, player.x, player.y
            )
            
            this.setVelocity(
                Math.cos(angle) * this.speed * 0.7,
                Math.sin(angle) * this.speed * 0.7
            )
        } else {
            // 距离合适，停止移动
            this.setVelocity(0, 0)
        }
    }
    
    fireProjectile(target) {
        console.log(`${this.name} 发射子弹!`)
        
        // 创建简单的子弹
        const bullet = this.scene.add.circle(this.x, this.y, 4, 0xffff00)
        this.scene.physics.add.existing(bullet)
        
        bullet.damage = 8
        bullet.collisionType = 'bullet'
        
        // 计算子弹方向
        const angle = Phaser.Math.Angle.Between(
            this.x, this.y, target.x, target.y
        )
        
        const bulletSpeed = 200
        bullet.body.setVelocity(
            Math.cos(angle) * bulletSpeed,
            Math.sin(angle) * bulletSpeed
        )
        
        // 子弹生命周期
        this.scene.time.delayedCall(3000, () => {
            if (bullet && bullet.active) {
                bullet.destroy()
            }
        })
        
        // 添加到碰撞系统
        if (this.scene.collisionSystem) {
            this.scene.collisionSystem.addToGroup('bullets', bullet)
        }
    }
}

// 导出所有敌人类型
export const EnemyTypes = {
    BerserkEnemy,
    CowardEnemy,
    PackEnemy,
    TrapEnemy,
    RangedEnemy
}

// 敌人类型配置
export const EnemyTypeConfigs = {
    berserker: {
        class: BerserkEnemy,
        description: "狂暴敌人 - 受伤后会进入狂暴状态，攻击力和速度大幅提升",
        difficulty: "⭐⭐⭐",
        specialAbilities: ["狂暴状态", "激励其他敌人", "环境破坏"],
        counters: ["保持距离", "利用地形", "快速击杀"]
    },
    
    coward: {
        class: CowardEnemy,
        description: "胆小敌人 - 玩家靠近时会逃跑，但速度很快",
        difficulty: "⭐",
        specialAbilities: ["快速逃跑", "大视野", "恐惧状态"],
        counters: ["包围战术", "远程攻击", "预判路径"]
    },
    
    pack: {
        class: PackEnemy,
        description: "群体敌人 - 聚集时获得攻击和速度加成",
        difficulty: "⭐⭐",
        specialAbilities: ["群体加成", "聚集行为", "协作攻击"],
        counters: ["分散击破", "AOE攻击", "引诱分离"]
    },
    
    trap: {
        class: TrapEnemy,
        description: "陷阱敌人 - 伪装成道具，玩家靠近时突然攻击",
        difficulty: "⭐⭐⭐",
        specialAbilities: ["伪装", "突然攻击", "高伤害"],
        counters: ["远程探测", "谨慎接近", "快速反应"]
    },
    
    ranged: {
        class: RangedEnemy,
        description: "远程敌人 - 可以发射子弹，保持距离攻击",
        difficulty: "⭐⭐",
        specialAbilities: ["远程攻击", "距离控制", "子弹射击"],
        counters: ["快速接近", "利用掩体", "躲避走位"]
    }
}
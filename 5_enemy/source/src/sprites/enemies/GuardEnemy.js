import Enemy from '../Enemy.js'

// 重装守卫
export default class GuardEnemy extends Enemy {
    constructor(scene, x, y) {
        super(scene, x, y, 'guard-enemy')
        
        this.name = 'GuardEnemy'
        this.health = 50
        this.maxHealth = 50
        this.speed = 30
        this.contactDamage = 15
        this.armor = 5
        this.visionSystem.viewDistance = 120
        
        // 设置较小的巡逻范围（守卫特性）
        const patrolState = this.stateMachine.states.get('patrol')
        if (patrolState) {
            patrolState.patrolPoints = [
                { x: x - 50, y: y },
                { x: x + 50, y: y }
            ]
            patrolState.patrolSpeed = this.speed
            patrolState.waitTime = 3000 // 更长的等待时间
        }
        
        // 调整追击参数（守卫不会追太远）
        const chaseState = this.stateMachine.states.get('chase')
        if (chaseState) {
            chaseState.chaseSpeed = this.speed * 1.5
            chaseState.loseTargetTime = 2000 // 更短的追击时间
        }
        
        // 强化攻击参数
        const attackState = this.stateMachine.states.get('attack')
        if (attackState) {
            attackState.attackDamage = this.contactDamage
            attackState.attackCooldown = 1200
            attackState.attackRange = 70 // 更大的攻击范围
        }
        
        // 重写受伤逻辑以包含护甲
        this.originalTakeDamage = this.takeDamage
        this.takeDamage = (damage) => {
            const actualDamage = Math.max(1, damage - this.armor)
            this.originalTakeDamage(actualDamage)
            
            // 护甲效果提示
            if (damage > actualDamage) {
                this.showArmorEffect()
            }
        }
    }
    
    showArmorEffect() {
        // 显示护甲效果
        const armorText = this.scene.add.text(this.x, this.y - 50, 'ARMOR!', {
            fontSize: '12px',
            fill: '#ffff00',
            fontFamily: 'Arial'
        }).setOrigin(0.5)
        
        // 护甲文字动画
        this.scene.tweens.add({
            targets: armorText,
            y: armorText.y - 30,
            alpha: 0,
            duration: 1000,
            ease: 'Power2',
            onComplete: () => {
                armorText.destroy()
            }
        })
    }
}
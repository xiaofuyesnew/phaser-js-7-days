import State from '../State.js'

// 攻击状态
export default class AttackState extends State {
    constructor() {
        super('attack')
        this.attackCooldown = 1000 // 攻击冷却时间
        this.attackTimer = 0
        this.attackRange = 60
        this.attackDamage = 10
        this.isAttacking = false
    }
    
    enter() {
        console.log(`${this.owner.name || 'Enemy'} 开始攻击`)
        this.owner.setTint(0xff0000) // 红色表示攻击状态
        this.attackTimer = 0
        this.isAttacking = false
    }
    
    update(deltaTime) {
        const player = this.owner.scene.player
        if (!player) {
            this.stateMachine.changeState('patrol')
            return
        }
        
        const distance = Phaser.Math.Distance.Between(
            this.owner.x, this.owner.y,
            player.x, player.y
        )
        
        // 如果玩家逃出攻击范围，切换到追击状态
        if (distance > this.attackRange * 1.5) {
            this.stateMachine.changeState('chase')
            return
        }
        
        this.attackTimer += deltaTime
        
        if (!this.isAttacking && this.attackTimer >= this.attackCooldown) {
            this.performAttack()
        }
        
        // 面向玩家
        const angle = Phaser.Math.Angle.Between(
            this.owner.x, this.owner.y,
            player.x, player.y
        )
        this.owner.setFlipX(Math.cos(angle) < 0)
    }
    
    performAttack() {
        this.isAttacking = true
        this.attackTimer = 0
        
        // 播放攻击动画
        if (this.owner.anims && this.owner.anims.exists('attack')) {
            this.owner.anims.play('attack', true)
            
            // 攻击动画完成后执行伤害判定
            this.owner.once('animationcomplete-attack', () => {
                this.dealDamage()
                this.isAttacking = false
            })
        } else {
            // 没有动画时直接执行伤害判定
            this.owner.scene.time.delayedCall(200, () => {
                this.dealDamage()
                this.isAttacking = false
            })
        }
    }
    
    dealDamage() {
        const player = this.owner.scene.player
        if (!player) return
        
        const distance = Phaser.Math.Distance.Between(
            this.owner.x, this.owner.y,
            player.x, player.y
        )
        
        if (distance <= this.attackRange) {
            // 对玩家造成伤害
            if (player.takeDamage) {
                player.takeDamage(this.attackDamage)
            }
            
            // 击退效果
            const angle = Phaser.Math.Angle.Between(
                this.owner.x, this.owner.y,
                player.x, player.y
            )
            
            const knockbackForce = 200
            player.setVelocity(
                Math.cos(angle) * knockbackForce,
                Math.sin(angle) * knockbackForce
            )
            
            // 屏幕震动效果
            this.owner.scene.cameras.main.shake(200, 0.01)
        }
    }
    
    exit() {
        this.isAttacking = false
        this.owner.setVelocity(0, 0)
        this.attackTimer = 0
    }
}
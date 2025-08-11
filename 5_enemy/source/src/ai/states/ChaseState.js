import State from '../State.js'

// 追击状态
export default class ChaseState extends State {
    constructor() {
        super('chase')
        this.chaseSpeed = 80
        this.loseTargetTime = 3000 // 失去目标后多久放弃追击
        this.loseTargetTimer = 0
        this.lastSeenPosition = null
    }
    
    enter() {
        console.log(`${this.owner.name || 'Enemy'} 开始追击玩家`)
        this.owner.setTint(0xff6666) // 红色表示警戒
        this.loseTargetTimer = 0
        this.lastSeenPosition = null
    }
    
    update(deltaTime) {
        const player = this.owner.scene.player
        if (!player) {
            this.stateMachine.changeState('patrol')
            return
        }
        
        const canSeePlayer = this.owner.visionSystem.canSee(player)
        
        if (canSeePlayer) {
            // 能看到玩家，直接追击
            this.loseTargetTimer = 0
            this.lastSeenPosition = { x: player.x, y: player.y }
            this.chaseTarget(player)
            
            // 检查是否进入攻击范围
            const distance = Phaser.Math.Distance.Between(
                this.owner.x, this.owner.y,
                player.x, player.y
            )
            
            if (distance < 60) {
                this.stateMachine.changeState('attack')
                return
            }
        } else {
            // 看不到玩家
            this.loseTargetTimer += deltaTime
            
            if (this.lastSeenPosition) {
                // 追击到最后看到的位置
                const distance = Phaser.Math.Distance.Between(
                    this.owner.x, this.owner.y,
                    this.lastSeenPosition.x, this.lastSeenPosition.y
                )
                
                if (distance > 10) {
                    this.chaseTarget(this.lastSeenPosition)
                } else {
                    this.lastSeenPosition = null
                }
            }
            
            // 超时后放弃追击
            if (this.loseTargetTimer >= this.loseTargetTime) {
                this.stateMachine.changeState('patrol')
                return
            }
        }
    }
    
    chaseTarget(target) {
        const angle = Phaser.Math.Angle.Between(
            this.owner.x, this.owner.y,
            target.x, target.y
        )
        
        this.owner.setVelocity(
            Math.cos(angle) * this.chaseSpeed,
            Math.sin(angle) * this.chaseSpeed
        )
        
        // 更新朝向和动画
        this.owner.visionSystem.viewDirection = angle
        this.owner.setFlipX(Math.cos(angle) < 0)
        
        // 播放跑步动画（如果有的话）
        if (this.owner.anims && this.owner.anims.exists('run')) {
            this.owner.anims.play('run', true)
        }
    }
    
    exit() {
        this.owner.setVelocity(0, 0)
        this.loseTargetTimer = 0
        this.lastSeenPosition = null
    }
}
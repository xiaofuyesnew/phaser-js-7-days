import State from '../State.js'

// 巡逻状态
export default class PatrolState extends State {
    constructor() {
        super('patrol')
        this.patrolPoints = []
        this.currentPointIndex = 0
        this.patrolSpeed = 50
        this.waitTime = 2000 // 在巡逻点等待时间
        this.waitTimer = 0
        this.isWaiting = false
    }
    
    enter() {
        console.log(`${this.owner.name || 'Enemy'} 开始巡逻`)
        this.owner.setTint(0xffffff) // 正常颜色
        
        // 如果没有巡逻点，创建默认巡逻路径
        if (this.patrolPoints.length === 0) {
            this.createDefaultPatrolPath()
        }
        
        this.moveToNextPoint()
    }
    
    update(deltaTime) {
        // 检查是否发现玩家
        if (this.owner.scene.player && this.owner.visionSystem.canSee(this.owner.scene.player)) {
            this.stateMachine.changeState('chase')
            return
        }
        
        // 检查是否听到声音
        const sound = this.owner.hearingSystem.getLatestSound()
        if (sound && sound.type === 'footstep') {
            this.owner.lastKnownPlayerPosition = { x: sound.x, y: sound.y }
            // 可以添加调查状态，这里简化为直接追击
            this.stateMachine.changeState('chase')
            return
        }
        
        if (this.isWaiting) {
            this.waitTimer += deltaTime
            if (this.waitTimer >= this.waitTime) {
                this.isWaiting = false
                this.waitTimer = 0
                this.moveToNextPoint()
            }
        } else {
            this.updateMovement()
        }
    }
    
    updateMovement() {
        if (this.patrolPoints.length === 0) return
        
        const currentPoint = this.patrolPoints[this.currentPointIndex]
        const distance = Phaser.Math.Distance.Between(
            this.owner.x, this.owner.y,
            currentPoint.x, currentPoint.y
        )
        
        if (distance < 10) {
            // 到达巡逻点
            this.isWaiting = true
            this.owner.setVelocity(0, 0)
            
            // 播放空闲动画（如果有的话）
            if (this.owner.anims && this.owner.anims.exists('idle')) {
                this.owner.anims.play('idle', true)
            }
        } else {
            // 移动到巡逻点
            const angle = Phaser.Math.Angle.Between(
                this.owner.x, this.owner.y,
                currentPoint.x, currentPoint.y
            )
            
            this.owner.setVelocity(
                Math.cos(angle) * this.patrolSpeed,
                Math.sin(angle) * this.patrolSpeed
            )
            
            // 更新朝向
            this.owner.visionSystem.viewDirection = angle
            this.owner.setFlipX(Math.cos(angle) < 0)
            
            // 播放行走动画（如果有的话）
            if (this.owner.anims && this.owner.anims.exists('walk')) {
                this.owner.anims.play('walk', true)
            }
        }
    }
    
    moveToNextPoint() {
        if (this.patrolPoints.length > 0) {
            this.currentPointIndex = (this.currentPointIndex + 1) % this.patrolPoints.length
        }
    }
    
    createDefaultPatrolPath() {
        const startX = this.owner.x
        const startY = this.owner.y
        
        this.patrolPoints = [
            { x: startX - 100, y: startY },
            { x: startX + 100, y: startY }
        ]
    }
    
    // 设置巡逻路径
    setPatrolPath(points) {
        this.patrolPoints = points
        this.currentPointIndex = 0
    }
    
    exit() {
        this.owner.setVelocity(0, 0)
        this.isWaiting = false
        this.waitTimer = 0
    }
}
import Enemy from '../Enemy.js'

// 快速追击者
export default class ChaserEnemy extends Enemy {
    constructor(scene, x, y) {
        super(scene, x, y, 'chaser-enemy')
        
        this.name = 'ChaserEnemy'
        this.health = 15
        this.maxHealth = 15
        this.speed = 80
        this.contactDamage = 4
        this.visionSystem.viewDistance = 200
        this.visionSystem.viewAngle = Math.PI / 2 // 90度视角
        
        // 设置巡逻路径（更大的范围）
        const patrolState = this.stateMachine.states.get('patrol')
        if (patrolState) {
            patrolState.patrolPoints = [
                { x: x - 120, y: y },
                { x: x + 120, y: y },
                { x: x, y: y - 60 },
                { x: x, y: y + 60 }
            ]
            patrolState.patrolSpeed = this.speed * 0.6
            patrolState.waitTime = 1000 // 更短的等待时间
        }
        
        // 修改追击状态参数
        const chaseState = this.stateMachine.states.get('chase')
        if (chaseState) {
            chaseState.chaseSpeed = this.speed
            chaseState.loseTargetTime = 5000 // 更长的追击时间
        }
        
        // 调整攻击参数
        const attackState = this.stateMachine.states.get('attack')
        if (attackState) {
            attackState.attackDamage = this.contactDamage
            attackState.attackCooldown = 800 // 更快的攻击速度
            attackState.attackRange = 50
        }
    }
}
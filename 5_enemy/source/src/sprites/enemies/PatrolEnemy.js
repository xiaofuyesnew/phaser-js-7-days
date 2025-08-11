import Enemy from '../Enemy.js'

// 基础巡逻兵
export default class PatrolEnemy extends Enemy {
    constructor(scene, x, y) {
        super(scene, x, y, 'patrol-enemy')
        
        this.name = 'PatrolEnemy'
        this.health = 20
        this.maxHealth = 20
        this.speed = 40
        this.contactDamage = 3
        this.visionSystem.viewDistance = 150
        
        // 设置巡逻路径
        const patrolState = this.stateMachine.states.get('patrol')
        if (patrolState) {
            patrolState.patrolPoints = [
                { x: x - 80, y: y },
                { x: x + 80, y: y }
            ]
            patrolState.patrolSpeed = this.speed
        }
        
        // 调整追击参数
        const chaseState = this.stateMachine.states.get('chase')
        if (chaseState) {
            chaseState.chaseSpeed = this.speed * 1.2
        }
        
        // 调整攻击参数
        const attackState = this.stateMachine.states.get('attack')
        if (attackState) {
            attackState.attackDamage = this.contactDamage
            attackState.attackCooldown = 1500
        }
    }
}
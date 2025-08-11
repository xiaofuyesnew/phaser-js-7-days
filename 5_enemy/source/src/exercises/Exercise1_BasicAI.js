import Enemy from '../sprites/Enemy.js'
import PatrolState from '../ai/states/PatrolState.js'
import ChaseState from '../ai/states/ChaseState.js'

/**
 * 练习1: 基础敌人AI
 * 
 * 目标: 创建一个简单的巡逻敌人，实现基础的AI行为
 * 
 * 要求:
 * 1. 实现基础的巡逻行为
 * 2. 添加玩家检测功能
 * 3. 实现简单的追击逻辑
 * 4. 添加血量系统
 */

export default class BasicAIEnemy extends Enemy {
    constructor(scene, x, y) {
        super(scene, x, y, 'enemy')
        
        this.name = 'BasicAI'
        this.health = 25
        this.maxHealth = 25
        this.speed = 45
        this.contactDamage = 4
        
        // 设置视野参数
        this.visionSystem.viewDistance = 120
        this.visionSystem.viewAngle = Math.PI / 4 // 45度视角
        
        // 自定义巡逻路径
        this.setupPatrolPath()
        
        // 调整AI参数
        this.adjustAIParameters()
    }
    
    setupPatrolPath() {
        const patrolState = this.stateMachine.states.get('patrol')
        if (patrolState) {
            // 创建简单的左右巡逻路径
            patrolState.patrolPoints = [
                { x: this.x - 60, y: this.y },
                { x: this.x + 60, y: this.y }
            ]
            patrolState.patrolSpeed = this.speed * 0.8
            patrolState.waitTime = 1500
        }
    }
    
    adjustAIParameters() {
        // 调整追击参数
        const chaseState = this.stateMachine.states.get('chase')
        if (chaseState) {
            chaseState.chaseSpeed = this.speed * 1.3
            chaseState.loseTargetTime = 2500
        }
    }
    
    // 练习扩展: 添加自定义行为
    customBehavior() {
        // 学生可以在这里添加自定义的AI行为
        // 例如: 随机改变巡逻方向、发出警报等
        
        if (Math.random() < 0.01) { // 1%概率
            console.log(`${this.name} 执行自定义行为`)
            
            // 随机改变视野方向
            this.visionSystem.viewDirection += (Math.random() - 0.5) * 0.5
        }
    }
    
    update(deltaTime) {
        super.update(deltaTime)
        
        // 执行自定义行为
        this.customBehavior()
    }
}

// 练习指导
export const Exercise1Guide = {
    title: "练习1: 基础敌人AI",
    description: "创建一个具有基础AI行为的敌人",
    
    steps: [
        {
            step: 1,
            title: "理解状态机",
            description: "观察敌人在巡逻、追击状态之间的切换",
            code: `
// 在GameScene中添加BasicAIEnemy
import BasicAIEnemy from './exercises/Exercise1_BasicAI.js'

// 在createEnemySystem方法中
const basicEnemy = new BasicAIEnemy(this, 500, 1000)
            `
        },
        {
            step: 2,
            title: "调整AI参数",
            description: "修改视野距离、巡逻速度等参数，观察行为变化",
            code: `
// 在BasicAIEnemy构造函数中调整参数
this.visionSystem.viewDistance = 200 // 增加视野距离
this.visionSystem.viewAngle = Math.PI / 2 // 增加视野角度
            `
        },
        {
            step: 3,
            title: "自定义巡逻路径",
            description: "创建更复杂的巡逻路径",
            code: `
// 创建矩形巡逻路径
patrolState.patrolPoints = [
    { x: this.x - 80, y: this.y },
    { x: this.x - 80, y: this.y - 60 },
    { x: this.x + 80, y: this.y - 60 },
    { x: this.x + 80, y: this.y }
]
            `
        }
    ],
    
    challenges: [
        {
            title: "愤怒状态系统",
            description: "让敌人在受到攻击后进入愤怒状态，提高移动速度",
            difficulty: "⭐⭐",
            hints: [
                "在Enemy类中添加anger属性",
                "创建AngerState状态类",
                "在takeDamage方法中触发愤怒状态",
                "愤怒状态下提高移动速度和攻击力"
            ],
            solution: `
// 在Enemy类中添加
this.anger = 0
this.maxAnger = 100

takeDamage(damage) {
    super.takeDamage(damage)
    this.anger = Math.min(this.maxAnger, this.anger + 20)
    if (this.anger >= 50 && !this.stateMachine.isInState('anger')) {
        this.stateMachine.changeState('anger')
    }
}
            `
        },
        {
            title: "敌人通信系统",
            description: "添加敌人之间的通信，一个敌人发现玩家时通知附近的敌人",
            difficulty: "⭐⭐⭐",
            hints: [
                "创建通信范围检测",
                "实现信息传递机制",
                "添加警报状态",
                "使用事件系统进行通信"
            ],
            solution: `
// 在发现玩家时通知附近敌人
onPlayerDetected() {
    this.alertNearbyEnemies()
    this.stateMachine.changeState('chase')
}

alertNearbyEnemies() {
    const alertRange = 200
    this.scene.enemyManager.enemies.forEach(enemy => {
        if (enemy !== this && this.distanceTo(enemy) < alertRange) {
            enemy.receiveAlert(this.x, this.y)
        }
    })
}
            `
        },
        {
            title: "AI记忆系统",
            description: "实现敌人的记忆系统，记住玩家最后出现的位置",
            difficulty: "⭐⭐⭐",
            hints: [
                "创建记忆数据结构",
                "记录玩家位置历史",
                "实现搜索行为",
                "添加记忆衰减机制"
            ],
            solution: `
// 记忆系统实现
initMemory() {
    this.memory = {
        lastSeenPosition: null,
        lastSeenTime: 0,
        searchPoints: [],
        memoryDecayTime: 10000
    }
}

updateMemory() {
    if (this.visionSystem.canSee(this.scene.player)) {
        this.memory.lastSeenPosition = {
            x: this.scene.player.x,
            y: this.scene.player.y
        }
        this.memory.lastSeenTime = Date.now()
    }
}
            `
        }
    ],
    
    practiceExercises: [
        {
            title: "基础巡逻练习",
            description: "创建一个简单的巡逻敌人",
            steps: [
                "创建BasicAIEnemy实例",
                "设置巡逻路径点",
                "调整巡逻速度",
                "测试玩家检测功能"
            ],
            expectedResult: "敌人在设定路径间巡逻，发现玩家时开始追击"
        },
        {
            title: "视野调试练习",
            description: "调整敌人视野参数并观察行为变化",
            steps: [
                "修改viewDistance参数",
                "调整viewAngle角度",
                "测试不同参数下的检测效果",
                "找到最佳的平衡点"
            ],
            expectedResult: "理解视野参数对AI行为的影响"
        },
        {
            title: "状态切换练习",
            description: "观察和理解AI状态机的工作原理",
            steps: [
                "在控制台输出状态切换信息",
                "观察巡逻->追击->攻击的状态流转",
                "分析状态切换的触发条件",
                "尝试修改状态切换逻辑"
            ],
            expectedResult: "深入理解状态机设计模式"
        }
    ]
}
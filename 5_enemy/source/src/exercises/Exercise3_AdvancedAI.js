import Enemy from '../sprites/Enemy.js'
import State from '../ai/State.js'

/**
 * 练习3: 高级AI行为
 * 
 * 目标: 创建复杂的敌人AI系统
 * 
 * 要求:
 * 1. 实现多种敌人类型
 * 2. 添加协作行为
 * 3. 创建动态难度调整
 * 4. 实现AI调试工具
 */

// 群体AI状态 - 警戒状态
class AlertState extends State {
    constructor() {
        super('alert')
        this.alertDuration = 5000
        this.alertTimer = 0
    }
    
    enter() {
        console.log(`${this.owner.name} 进入警戒状态`)
        this.owner.setTint(0xffaa00) // 橙色表示警戒
        this.alertTimer = 0
        
        // 通知附近的敌人
        this.alertNearbyEnemies()
    }
    
    update(deltaTime) {
        this.alertTimer += deltaTime
        
        // 检查是否发现玩家
        if (this.owner.visionSystem.canSee(this.owner.scene.player)) {
            this.stateMachine.changeState('chase')
            return
        }
        
        // 警戒时间结束，返回巡逻
        if (this.alertTimer >= this.alertDuration) {
            this.stateMachine.changeState('patrol')
            return
        }
        
        // 警戒时的行为 - 扩大搜索范围
        this.searchBehavior()
    }
    
    alertNearbyEnemies() {
        const alertRange = 200
        const nearbyEnemies = this.owner.scene.enemyManager.getEnemiesInRange(
            this.owner.x, this.owner.y, alertRange
        )
        
        nearbyEnemies.forEach(enemy => {
            if (enemy !== this.owner && enemy.stateMachine.isInState('patrol')) {
                enemy.stateMachine.changeState('alert')
            }
        })
    }
    
    searchBehavior() {
        // 随机移动搜索
        if (Math.random() < 0.02) { // 2%概率改变方向
            const angle = Math.random() * Math.PI * 2
            const distance = 50 + Math.random() * 50
            
            this.owner.setVelocity(
                Math.cos(angle) * distance,
                Math.sin(angle) * distance
            )
        }
    }
    
    exit() {
        this.owner.setVelocity(0, 0)
        this.alertTimer = 0
    }
}

// 协作AI状态 - 包围状态
class SurroundState extends State {
    constructor() {
        super('surround')
        this.targetPosition = null
        this.surroundRadius = 100
        this.surroundAngle = 0
    }
    
    enter() {
        console.log(`${this.owner.name} 开始包围玩家`)
        this.owner.setTint(0xff4444)
        
        // 计算包围位置
        this.calculateSurroundPosition()
    }
    
    update(deltaTime) {
        const player = this.owner.scene.player
        if (!player) {
            this.stateMachine.changeState('patrol')
            return
        }
        
        // 更新包围位置
        this.calculateSurroundPosition()
        
        // 移动到包围位置
        if (this.targetPosition) {
            const distance = Phaser.Math.Distance.Between(
                this.owner.x, this.owner.y,
                this.targetPosition.x, this.targetPosition.y
            )
            
            if (distance > 20) {
                const angle = Phaser.Math.Angle.Between(
                    this.owner.x, this.owner.y,
                    this.targetPosition.x, this.targetPosition.y
                )
                
                this.owner.setVelocity(
                    Math.cos(angle) * 60,
                    Math.sin(angle) * 60
                )
            } else {
                // 到达包围位置，开始攻击
                this.stateMachine.changeState('attack')
            }
        }
    }
    
    calculateSurroundPosition() {
        const player = this.owner.scene.player
        if (!player) return
        
        // 获取所有参与包围的敌人
        const surroundingEnemies = this.owner.scene.enemyManager.enemies.filter(
            enemy => enemy.stateMachine.isInState('surround')
        )
        
        // 计算当前敌人在包围圈中的角度
        const enemyIndex = surroundingEnemies.indexOf(this.owner)
        const totalEnemies = surroundingEnemies.length
        
        if (enemyIndex !== -1 && totalEnemies > 0) {
            this.surroundAngle = (enemyIndex / totalEnemies) * Math.PI * 2
            
            this.targetPosition = {
                x: player.x + Math.cos(this.surroundAngle) * this.surroundRadius,
                y: player.y + Math.sin(this.surroundAngle) * this.surroundRadius
            }
        }
    }
    
    exit() {
        this.owner.setVelocity(0, 0)
        this.targetPosition = null
    }
}

// 高级AI敌人
export default class AdvancedAIEnemy extends Enemy {
    constructor(scene, x, y, aiType = 'smart') {
        super(scene, x, y, 'enemy')
        
        this.name = 'AdvancedAI'
        this.aiType = aiType
        this.health = 35
        this.maxHealth = 35
        this.speed = 55
        this.contactDamage = 6
        
        // AI增强属性
        this.alertLevel = 0 // 警戒等级
        this.memory = new Map() // AI记忆系统
        this.teamId = Math.floor(Math.random() * 3) // 队伍ID
        
        // 添加高级状态
        this.stateMachine.addState('alert', new AlertState())
        this.stateMachine.addState('surround', new SurroundState())
        
        // 根据AI类型调整参数
        this.setupAIType()
        
        // 初始化记忆系统
        this.initializeMemory()
    }
    
    setupAIType() {
        switch (this.aiType) {
            case 'smart':
                this.visionSystem.viewDistance = 180
                this.visionSystem.viewAngle = Math.PI / 2
                this.hearingSystem.hearingRange = 200
                break
                
            case 'aggressive':
                this.speed = 70
                this.contactDamage = 8
                this.visionSystem.viewDistance = 220
                this.stateMachine.states.get('chase').loseTargetTime = 6000
                break
                
            case 'defensive':
                this.health = 50
                this.maxHealth = 50
                this.visionSystem.viewDistance = 150
                this.stateMachine.states.get('patrol').waitTime = 3000
                break
                
            case 'scout':
                this.speed = 80
                this.health = 20
                this.maxHealth = 20
                this.visionSystem.viewDistance = 250
                this.visionSystem.viewAngle = Math.PI
                break
        }
    }
    
    initializeMemory() {
        this.memory.set('lastPlayerPosition', null)
        this.memory.set('playerSightings', [])
        this.memory.set('alertEvents', [])
        this.memory.set('teamCommunication', [])
    }
    
    update(deltaTime) {
        super.update(deltaTime)
        
        // 更新记忆系统
        this.updateMemory()
        
        // 处理团队通信
        this.processTeamCommunication()
        
        // 动态难度调整
        this.adjustDifficulty()
    }
    
    updateMemory() {
        const player = this.scene.player
        if (!player) return
        
        // 记录玩家位置
        if (this.visionSystem.canSee(player)) {
            this.memory.set('lastPlayerPosition', { x: player.x, y: player.y, time: Date.now() })
            
            // 记录目击事件
            const sightings = this.memory.get('playerSightings') || []
            sightings.push({ x: player.x, y: player.y, time: Date.now() })
            
            // 只保留最近10次目击记录
            if (sightings.length > 10) {
                sightings.shift()
            }
            
            this.memory.set('playerSightings', sightings)
        }
    }
    
    processTeamCommunication() {
        // 与同队敌人共享信息
        const teammates = this.scene.enemyManager.enemies.filter(
            enemy => enemy.teamId === this.teamId && enemy !== this
        )
        
        teammates.forEach(teammate => {
            const distance = Phaser.Math.Distance.Between(
                this.x, this.y, teammate.x, teammate.y
            )
            
            // 在通信范围内
            if (distance < 150) {
                this.shareInformation(teammate)
            }
        })
    }
    
    shareInformation(teammate) {
        const myLastSeen = this.memory.get('lastPlayerPosition')
        const teammateLastSeen = teammate.memory.get('lastPlayerPosition')
        
        // 分享更新的玩家位置信息
        if (myLastSeen && (!teammateLastSeen || myLastSeen.time > teammateLastSeen.time)) {
            teammate.memory.set('lastPlayerPosition', myLastSeen)
            
            // 如果队友在巡逻，让其进入警戒状态
            if (teammate.stateMachine.isInState('patrol')) {
                teammate.stateMachine.changeState('alert')
            }
        }
    }
    
    adjustDifficulty() {
        // 根据玩家表现动态调整难度
        const player = this.scene.player
        if (!player) return
        
        const playerHealthPercent = player.health / player.maxHealth
        
        // 玩家血量低时，降低敌人攻击性
        if (playerHealthPercent < 0.3) {
            this.contactDamage = Math.max(3, this.contactDamage - 0.1)
            this.speed = Math.max(30, this.speed - 0.5)
        }
        // 玩家血量高时，提高敌人攻击性
        else if (playerHealthPercent > 0.8) {
            this.contactDamage = Math.min(10, this.contactDamage + 0.05)
            this.speed = Math.min(80, this.speed + 0.2)
        }
    }
    
    // 智能决策系统
    makeDecision() {
        const player = this.scene.player
        if (!player) return 'patrol'
        
        const distance = Phaser.Math.Distance.Between(this.x, this.y, player.x, player.y)
        const canSee = this.visionSystem.canSee(player)
        const lastSeen = this.memory.get('lastPlayerPosition')
        
        // 决策逻辑
        if (canSee && distance < 60) {
            return 'attack'
        } else if (canSee && distance < 200) {
            // 检查是否应该包围
            const nearbyTeammates = this.scene.enemyManager.enemies.filter(
                enemy => enemy.teamId === this.teamId && 
                         enemy !== this &&
                         Phaser.Math.Distance.Between(this.x, this.y, enemy.x, enemy.y) < 200
            )
            
            if (nearbyTeammates.length >= 2) {
                return 'surround'
            } else {
                return 'chase'
            }
        } else if (lastSeen && Date.now() - lastSeen.time < 5000) {
            return 'alert'
        } else {
            return 'patrol'
        }
    }
    
    // 获取AI调试信息
    getDebugInfo() {
        return {
            name: this.name,
            aiType: this.aiType,
            currentState: this.getCurrentState(),
            health: `${this.health}/${this.maxHealth}`,
            alertLevel: this.alertLevel,
            teamId: this.teamId,
            memory: {
                lastPlayerPosition: this.memory.get('lastPlayerPosition'),
                sightingsCount: this.memory.get('playerSightings').length
            }
        }
    }
}

// AI调试工具
export class AIDebugger {
    constructor(scene) {
        this.scene = scene
        this.debugPanel = null
        this.isVisible = false
        this.updateInterval = 500 // 更新间隔(ms)
        this.lastUpdate = 0
    }
    
    toggle() {
        this.isVisible = !this.isVisible
        
        if (this.isVisible) {
            this.createDebugPanel()
        } else {
            this.destroyDebugPanel()
        }
    }
    
    createDebugPanel() {
        if (this.debugPanel) return
        
        this.debugPanel = this.scene.add.container(10, 200)
        this.debugPanel.setScrollFactor(0)
        this.debugPanel.setDepth(3000)
        
        // 背景
        const bg = this.scene.add.rectangle(0, 0, 300, 400, 0x000000, 0.8)
        bg.setOrigin(0, 0)
        this.debugPanel.add(bg)
        
        // 标题
        const title = this.scene.add.text(10, 10, 'AI Debug Panel', {
            fontSize: '16px',
            fill: '#ffffff',
            fontFamily: 'Arial'
        })
        this.debugPanel.add(title)
        
        // AI信息文本
        this.debugText = this.scene.add.text(10, 40, '', {
            fontSize: '12px',
            fill: '#00ff00',
            fontFamily: 'Arial'
        })
        this.debugPanel.add(this.debugText)
    }
    
    destroyDebugPanel() {
        if (this.debugPanel) {
            this.debugPanel.destroy()
            this.debugPanel = null
            this.debugText = null
        }
    }
    
    update(time) {
        if (!this.isVisible || !this.debugText) return
        
        if (time - this.lastUpdate < this.updateInterval) return
        this.lastUpdate = time
        
        let debugInfo = 'AI状态信息:\n\n'
        
        if (this.scene.enemyManager) {
            this.scene.enemyManager.enemies.forEach((enemy, index) => {
                if (enemy.isAlive && enemy.getDebugInfo) {
                    const info = enemy.getDebugInfo()
                    debugInfo += `${index + 1}. ${info.name} (${info.aiType})\n`
                    debugInfo += `   状态: ${info.currentState}\n`
                    debugInfo += `   血量: ${info.health}\n`
                    debugInfo += `   队伍: ${info.teamId}\n`
                    debugInfo += `   记忆: ${info.memory.sightingsCount} 次目击\n\n`
                }
            })
        }
        
        this.debugText.setText(debugInfo)
    }
}

// 练习指导
export const Exercise3Guide = {
    title: "练习3: 高级AI行为",
    description: "创建复杂的敌人AI系统",
    
    steps: [
        {
            step: 1,
            title: "创建高级AI敌人",
            description: "实例化不同类型的高级AI敌人",
            code: `
// 在GameScene中创建不同类型的AI
const smartEnemy = new AdvancedAIEnemy(this, 400, 1000, 'smart')
const aggressiveEnemy = new AdvancedAIEnemy(this, 600, 1000, 'aggressive')
const scoutEnemy = new AdvancedAIEnemy(this, 800, 1000, 'scout')
            `
        },
        {
            step: 2,
            title: "启用AI调试器",
            description: "使用AI调试工具监控敌人行为",
            code: `
// 在GameScene中添加AI调试器
import { AIDebugger } from './exercises/Exercise3_AdvancedAI.js'

this.aiDebugger = new AIDebugger(this)

// 按F2切换调试面板
this.input.keyboard.on('keydown-F2', () => {
    this.aiDebugger.toggle()
})
            `
        },
        {
            step: 3,
            title: "观察团队协作",
            description: "观察敌人之间的通信和协作行为",
            code: `
// 创建同一队伍的敌人
const team1Enemy1 = new AdvancedAIEnemy(this, 400, 1000, 'smart')
const team1Enemy2 = new AdvancedAIEnemy(this, 500, 1000, 'aggressive')
team1Enemy1.teamId = 1
team1Enemy2.teamId = 1
            `
        }
    ],
    
    challenges: [
        {
            title: "AI学习系统",
            description: "实现敌人的学习系统，让AI根据玩家行为调整策略",
            difficulty: "⭐⭐⭐⭐",
            hints: [
                "记录玩家行为模式",
                "分析玩家偏好",
                "调整AI策略",
                "实现适应性行为"
            ],
            solution: `
// AI学习系统实现
class LearningSystem {
    constructor() {
        this.playerBehaviorData = {
            movementPatterns: [],
            attackFrequency: 0,
            preferredPositions: [],
            reactionTimes: []
        }
    }
    
    analyzePlayerBehavior(player) {
        // 分析玩家移动模式
        this.recordMovementPattern(player)
        
        // 分析攻击频率
        this.recordAttackPattern(player)
        
        // 调整AI策略
        this.adjustAIStrategy()
    }
}
            `
        },
        {
            title: "敌人指挥官系统",
            description: "创建敌人指挥官，可以指挥其他敌人的行为",
            difficulty: "⭐⭐⭐⭐",
            hints: [
                "创建Commander类",
                "实现命令传递机制",
                "设计战术指令",
                "管理小队行为"
            ],
            solution: `
// 指挥官系统实现
class CommanderEnemy extends AdvancedAIEnemy {
    constructor(scene, x, y) {
        super(scene, x, y, 'commander')
        this.subordinates = []
        this.commandRange = 300
        this.tacticalState = 'defensive'
    }
    
    issueCommand(command, targets = null) {
        const subordinates = targets || this.getSubordinatesInRange()
        subordinates.forEach(enemy => {
            enemy.receiveCommand(command, this)
        })
    }
    
    analyzeSituation() {
        const playerThreatLevel = this.assessPlayerThreat()
        const subordinateCount = this.subordinates.length
        
        if (playerThreatLevel > 0.7 && subordinateCount >= 2) {
            this.tacticalState = 'aggressive'
            this.issueCommand('surround_target')
        }
    }
}
            `
        },
        {
            title: "情绪系统",
            description: "添加敌人情绪系统，不同情绪下有不同的行为模式",
            difficulty: "⭐⭐⭐",
            hints: [
                "定义情绪类型",
                "实现情绪状态机",
                "情绪影响行为参数",
                "添加情绪转换条件"
            ],
            solution: `
// 情绪系统实现
class EmotionSystem {
    constructor(owner) {
        this.owner = owner
        this.emotions = {
            calm: 0.5,
            angry: 0,
            fearful: 0,
            excited: 0
        }
        this.dominantEmotion = 'calm'
    }
    
    updateEmotions(events) {
        events.forEach(event => {
            switch(event.type) {
                case 'damaged':
                    this.emotions.angry += 0.3
                    this.emotions.fearful += 0.1
                    break
                case 'player_nearby':
                    this.emotions.excited += 0.2
                    break
            }
        })
        
        this.applyEmotionalEffects()
    }
}
            `
        },
        {
            title: "动态难度系统",
            description: "实现动态难度系统，根据玩家技能水平调整敌人强度",
            difficulty: "⭐⭐⭐⭐",
            hints: [
                "监控玩家表现",
                "计算技能评分",
                "调整敌人参数",
                "平滑难度变化"
            ],
            solution: `
// 动态难度系统实现
class DynamicDifficulty {
    constructor() {
        this.playerSkillScore = 50 // 0-100
        this.difficultyMultiplier = 1.0
        this.adjustmentRate = 0.1
    }
    
    updatePlayerSkill(performance) {
        const {
            accuracy,
            survivalTime,
            damageAvoidance,
            killEfficiency
        } = performance
        
        const skillScore = (accuracy + survivalTime + damageAvoidance + killEfficiency) / 4
        this.playerSkillScore = Phaser.Math.Linear(this.playerSkillScore, skillScore, this.adjustmentRate)
        
        this.adjustDifficulty()
    }
    
    adjustDifficulty() {
        this.difficultyMultiplier = 0.5 + (this.playerSkillScore / 100) * 1.5
    }
}
            `
        }
    ],
    
    practiceExercises: [
        {
            title: "多类型AI练习",
            description: "创建不同类型的高级AI敌人并观察其行为差异",
            steps: [
                "创建smart、aggressive、defensive、scout类型的敌人",
                "观察不同类型的行为特点",
                "调整AI参数",
                "测试团队协作效果"
            ],
            expectedResult: "理解不同AI类型的设计思路和应用场景"
        },
        {
            title: "AI调试练习",
            description: "使用AI调试工具监控和分析敌人行为",
            steps: [
                "启用AI调试面板",
                "观察AI状态变化",
                "分析决策过程",
                "优化AI参数"
            ],
            expectedResult: "掌握AI调试和优化的方法"
        },
        {
            title: "团队协作练习",
            description: "设置同队敌人，观察协作行为",
            steps: [
                "创建同队敌人",
                "观察信息共享",
                "测试包围战术",
                "分析协作效果"
            ],
            expectedResult: "理解多智能体协作的实现原理"
        }
    ]
}
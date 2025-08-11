/**
 * 练习系统
 * 
 * 提供结构化的练习和挑战，帮助学习者逐步掌握敌人AI和碰撞系统
 */

import { EnemyTypes, EnemyTypeConfigs } from './EnemyTypes.js'
import AIBalanceTester from './AIBalanceTester.js'

export default class PracticeSystem {
    constructor(scene) {
        this.scene = scene
        this.currentPractice = null
        this.practiceProgress = new Map()
        this.achievements = new Set()
        
        // 练习难度等级
        this.difficultyLevels = {
            beginner: { name: "初学者", color: 0x00ff00, multiplier: 0.7 },
            intermediate: { name: "中级", color: 0xffff00, multiplier: 1.0 },
            advanced: { name: "高级", color: 0xff8800, multiplier: 1.3 },
            expert: { name: "专家", color: 0xff0000, multiplier: 1.6 }
        }
        
        this.setupPractices()
        this.createPracticeUI()
    }
    
    setupPractices() {
        this.practices = [
            // 基础练习
            {
                id: 'basic_patrol',
                title: '基础巡逻练习',
                description: '学习创建和配置基础的巡逻敌人',
                difficulty: 'beginner',
                category: 'AI基础',
                objectives: [
                    '创建一个巡逻敌人',
                    '设置巡逻路径',
                    '调整巡逻速度',
                    '测试玩家检测'
                ],
                setup: () => this.setupBasicPatrolPractice(),
                checkCompletion: () => this.checkBasicPatrolCompletion(),
                hints: [
                    '使用BasicAIEnemy类创建敌人',
                    '在setupPatrolPath方法中定义路径点',
                    '调整patrolSpeed参数控制速度',
                    '观察敌人的视野范围'
                ],
                timeLimit: 300000, // 5分钟
                rewards: ['巡逻大师', '基础AI理解']
            },
            
            {
                id: 'vision_tuning',
                title: '视野系统调优',
                description: '学习调整敌人的视野参数以获得最佳效果',
                difficulty: 'beginner',
                category: 'AI基础',
                objectives: [
                    '理解视野距离的影响',
                    '调整视野角度',
                    '测试不同参数组合',
                    '找到平衡点'
                ],
                setup: () => this.setupVisionTuningPractice(),
                checkCompletion: () => this.checkVisionTuningCompletion(),
                hints: [
                    'viewDistance控制视野距离',
                    'viewAngle控制视野角度',
                    '过大的视野会让游戏过难',
                    '过小的视野会让敌人显得愚蠢'
                ],
                timeLimit: 600000, // 10分钟
                rewards: ['视野专家', '参数调优师']
            },
            
            {
                id: 'state_machine',
                title: '状态机理解',
                description: '深入理解AI状态机的工作原理',
                difficulty: 'intermediate',
                category: 'AI进阶',
                objectives: [
                    '观察状态切换过程',
                    '理解状态切换条件',
                    '修改状态切换逻辑',
                    '添加自定义状态'
                ],
                setup: () => this.setupStateMachinePractice(),
                checkCompletion: () => this.checkStateMachineCompletion(),
                hints: [
                    '在控制台输出状态变化',
                    '每个状态都有enter、update、exit方法',
                    '状态切换基于条件判断',
                    '可以添加新的状态类'
                ],
                timeLimit: 900000, // 15分钟
                rewards: ['状态机大师', '逻辑设计师']
            },
            
            {
                id: 'collision_effects',
                title: '碰撞效果设计',
                description: '为不同类型的碰撞添加视觉和音效反馈',
                difficulty: 'intermediate',
                category: '碰撞系统',
                objectives: [
                    '注册碰撞响应',
                    '添加粒子特效',
                    '实现屏幕震动',
                    '创建音效反馈'
                ],
                setup: () => this.setupCollisionEffectsPractice(),
                checkCompletion: () => this.checkCollisionEffectsCompletion(),
                hints: [
                    '使用registerCollisionResponse注册响应',
                    'createCollisionEffect创建特效',
                    'cameras.main.shake实现震动',
                    '音效可以用console.log模拟'
                ],
                timeLimit: 1200000, // 20分钟
                rewards: ['特效大师', '用户体验设计师']
            },
            
            {
                id: 'advanced_ai',
                title: '高级AI行为',
                description: '实现复杂的AI行为，包括协作和记忆系统',
                difficulty: 'advanced',
                category: 'AI进阶',
                objectives: [
                    '创建多种AI类型',
                    '实现敌人协作',
                    '添加记忆系统',
                    '测试团队行为'
                ],
                setup: () => this.setupAdvancedAIPractice(),
                checkCompletion: () => this.checkAdvancedAICompletion(),
                hints: [
                    '使用AdvancedAIEnemy类',
                    '设置相同的teamId实现协作',
                    '记忆系统存储在memory Map中',
                    '观察包围和警戒行为'
                ],
                timeLimit: 1800000, // 30分钟
                rewards: ['AI架构师', '协作系统专家']
            },
            
            {
                id: 'enemy_variety',
                title: '敌人类型多样化',
                description: '创建和测试多种不同行为模式的敌人',
                difficulty: 'advanced',
                category: '游戏设计',
                objectives: [
                    '实现5种不同敌人类型',
                    '测试每种敌人的特点',
                    '平衡敌人强度',
                    '创建有趣的组合'
                ],
                setup: () => this.setupEnemyVarietyPractice(),
                checkCompletion: () => this.checkEnemyVarietyCompletion(),
                hints: [
                    '使用EnemyTypes中的不同类',
                    '每种敌人都有独特的行为',
                    '注意敌人之间的相互作用',
                    '考虑玩家的应对策略'
                ],
                timeLimit: 2400000, // 40分钟
                rewards: ['敌人设计师', '游戏平衡专家']
            },
            
            {
                id: 'balance_testing',
                title: '平衡性测试',
                description: '使用测试工具分析和优化游戏平衡性',
                difficulty: 'expert',
                category: '游戏平衡',
                objectives: [
                    '运行自动化测试',
                    '分析测试结果',
                    '根据建议调整参数',
                    '验证优化效果'
                ],
                setup: () => this.setupBalanceTestingPractice(),
                checkCompletion: () => this.checkBalanceTestingCompletion(),
                hints: [
                    '使用AIBalanceTester进行测试',
                    '关注难度分数和平衡分数',
                    '根据建议调整敌人参数',
                    '多次测试验证改进效果'
                ],
                timeLimit: 3600000, // 60分钟
                rewards: ['平衡大师', '数据分析专家']
            }
        ]
    }
    
    // 开始练习
    startPractice(practiceId) {
        const practice = this.practices.find(p => p.id === practiceId)
        if (!practice) {
            console.log(`未找到练习: ${practiceId}`)
            return false
        }
        
        if (this.currentPractice) {
            console.log('请先完成当前练习')
            return false
        }
        
        this.currentPractice = practice
        this.practiceStartTime = Date.now()
        
        console.log(`开始练习: ${practice.title}`)
        console.log(`难度: ${this.difficultyLevels[practice.difficulty].name}`)
        console.log(`描述: ${practice.description}`)
        
        // 设置练习环境
        if (practice.setup) {
            practice.setup()
        }
        
        // 显示练习UI
        this.showPracticeUI()
        
        // 设置时间限制
        if (practice.timeLimit) {
            this.practiceTimer = this.scene.time.delayedCall(practice.timeLimit, () => {
                this.timeoutPractice()
            })
        }
        
        return true
    }
    
    // 检查练习完成
    checkPracticeCompletion() {
        if (!this.currentPractice) return false
        
        if (this.currentPractice.checkCompletion) {
            return this.currentPractice.checkCompletion()
        }
        
        return false
    }
    
    // 完成练习
    completePractice() {
        if (!this.currentPractice) return
        
        const practice = this.currentPractice
        const timeSpent = Date.now() - this.practiceStartTime
        
        console.log(`练习完成: ${practice.title}`)
        console.log(`用时: ${Math.round(timeSpent / 1000)}秒`)
        
        // 记录进度
        this.practiceProgress.set(practice.id, {
            completed: true,
            timeSpent: timeSpent,
            completedAt: new Date(),
            difficulty: practice.difficulty
        })
        
        // 添加成就
        practice.rewards.forEach(reward => {
            this.achievements.add(reward)
        })
        
        // 显示完成界面
        this.showCompletionUI()
        
        // 清理
        this.cleanupPractice()
    }
    
    // 练习超时
    timeoutPractice() {
        if (!this.currentPractice) return
        
        console.log(`练习超时: ${this.currentPractice.title}`)
        
        // 显示超时界面
        this.showTimeoutUI()
        
        // 清理
        this.cleanupPractice()
    }
    
    // 清理练习
    cleanupPractice() {
        if (this.practiceTimer) {
            this.practiceTimer.destroy()
            this.practiceTimer = null
        }
        
        this.currentPractice = null
        this.practiceStartTime = 0
        
        // 隐藏练习UI
        this.hidePracticeUI()
    }
    
    // 获取提示
    getHint() {
        if (!this.currentPractice) return null
        
        const hints = this.currentPractice.hints || []
        if (hints.length === 0) return null
        
        // 随机返回一个提示
        return hints[Math.floor(Math.random() * hints.length)]
    }
    
    // 跳过练习
    skipPractice() {
        if (!this.currentPractice) return
        
        console.log(`跳过练习: ${this.currentPractice.title}`)
        this.cleanupPractice()
    }
    
    // 创建练习UI
    createPracticeUI() {
        // 练习选择界面
        this.practiceMenuUI = null
        this.practiceActiveUI = null
    }
    
    // 显示练习菜单
    showPracticeMenu() {
        if (this.practiceMenuUI) {
            this.practiceMenuUI.setVisible(true)
            return
        }
        
        this.practiceMenuUI = this.scene.add.container(400, 300)
        this.practiceMenuUI.setScrollFactor(0)
        this.practiceMenuUI.setDepth(4000)
        
        // 背景
        const bg = this.scene.add.rectangle(0, 0, 600, 500, 0x000000, 0.9)
        bg.setOrigin(0.5)
        this.practiceMenuUI.add(bg)
        
        // 标题
        const title = this.scene.add.text(0, -220, '练习选择', {
            fontSize: '24px',
            fill: '#ffffff',
            fontFamily: 'Arial'
        }).setOrigin(0.5)
        this.practiceMenuUI.add(title)
        
        // 练习列表
        this.practices.forEach((practice, index) => {
            const y = -180 + index * 40
            const difficulty = this.difficultyLevels[practice.difficulty]
            const completed = this.practiceProgress.has(practice.id)
            
            const practiceText = this.scene.add.text(-280, y, 
                `${index + 1}. ${practice.title} [${difficulty.name}] ${completed ? '✓' : ''}`, {
                fontSize: '14px',
                fill: completed ? '#00ff00' : '#ffffff',
                fontFamily: 'Arial'
            })
            
            practiceText.setInteractive()
            practiceText.on('pointerdown', () => {
                this.hidePracticeMenu()
                this.startPractice(practice.id)
            })
            
            this.practiceMenuUI.add(practiceText)
        })
        
        // 关闭按钮
        const closeButton = this.scene.add.text(0, 200, '关闭 (ESC)', {
            fontSize: '16px',
            fill: '#ff0000',
            fontFamily: 'Arial'
        }).setOrigin(0.5)
        
        closeButton.setInteractive()
        closeButton.on('pointerdown', () => {
            this.hidePracticeMenu()
        })
        
        this.practiceMenuUI.add(closeButton)
    }
    
    // 隐藏练习菜单
    hidePracticeMenu() {
        if (this.practiceMenuUI) {
            this.practiceMenuUI.setVisible(false)
        }
    }
    
    // 显示练习UI
    showPracticeUI() {
        if (!this.currentPractice) return
        
        this.practiceActiveUI = this.scene.add.container(10, 10)
        this.practiceActiveUI.setScrollFactor(0)
        this.practiceActiveUI.setDepth(3000)
        
        // 背景
        const bg = this.scene.add.rectangle(0, 0, 350, 200, 0x000000, 0.8)
        bg.setOrigin(0, 0)
        this.practiceActiveUI.add(bg)
        
        // 标题
        const title = this.scene.add.text(10, 10, this.currentPractice.title, {
            fontSize: '16px',
            fill: '#ffffff',
            fontFamily: 'Arial'
        })
        this.practiceActiveUI.add(title)
        
        // 目标列表
        const objectives = this.currentPractice.objectives.map((obj, index) => 
            `${index + 1}. ${obj}`
        ).join('\n')
        
        this.objectivesText = this.scene.add.text(10, 40, objectives, {
            fontSize: '12px',
            fill: '#cccccc',
            fontFamily: 'Arial'
        })
        this.practiceActiveUI.add(this.objectivesText)
        
        // 控制提示
        const controls = this.scene.add.text(10, 160, 'H: 提示 | S: 跳过 | ESC: 退出', {
            fontSize: '10px',
            fill: '#888888',
            fontFamily: 'Arial'
        })
        this.practiceActiveUI.add(controls)
        
        // 添加按键监听
        this.scene.input.keyboard.on('keydown-H', () => {
            const hint = this.getHint()
            if (hint) {
                console.log(`💡 提示: ${hint}`)
            }
        })
        
        this.scene.input.keyboard.on('keydown-S', () => {
            this.skipPractice()
        })
    }
    
    // 隐藏练习UI
    hidePracticeUI() {
        if (this.practiceActiveUI) {
            this.practiceActiveUI.destroy()
            this.practiceActiveUI = null
        }
    }
    
    // 显示完成界面
    showCompletionUI() {
        const completionUI = this.scene.add.container(400, 300)
        completionUI.setScrollFactor(0)
        completionUI.setDepth(5000)
        
        // 背景
        const bg = this.scene.add.rectangle(0, 0, 400, 300, 0x004400, 0.9)
        bg.setOrigin(0.5)
        completionUI.add(bg)
        
        // 完成文本
        const completionText = this.scene.add.text(0, -50, 
            `练习完成!\n${this.currentPractice.title}\n\n获得成就:\n${this.currentPractice.rewards.join('\n')}`, {
            fontSize: '16px',
            fill: '#ffffff',
            fontFamily: 'Arial',
            align: 'center'
        }).setOrigin(0.5)
        completionUI.add(completionText)
        
        // 自动关闭
        this.scene.time.delayedCall(3000, () => {
            completionUI.destroy()
        })
    }
    
    // 显示超时界面
    showTimeoutUI() {
        const timeoutUI = this.scene.add.container(400, 300)
        timeoutUI.setScrollFactor(0)
        timeoutUI.setDepth(5000)
        
        // 背景
        const bg = this.scene.add.rectangle(0, 0, 400, 200, 0x440000, 0.9)
        bg.setOrigin(0.5)
        timeoutUI.add(bg)
        
        // 超时文本
        const timeoutText = this.scene.add.text(0, 0, 
            `练习超时!\n${this.currentPractice.title}\n\n可以重新尝试`, {
            fontSize: '16px',
            fill: '#ffffff',
            fontFamily: 'Arial',
            align: 'center'
        }).setOrigin(0.5)
        timeoutUI.add(timeoutText)
        
        // 自动关闭
        this.scene.time.delayedCall(3000, () => {
            timeoutUI.destroy()
        })
    }
    
    // 获取练习统计
    getPracticeStats() {
        const completed = Array.from(this.practiceProgress.values()).filter(p => p.completed)
        const totalTime = completed.reduce((sum, p) => sum + p.timeSpent, 0)
        
        return {
            totalPractices: this.practices.length,
            completedPractices: completed.length,
            completionRate: completed.length / this.practices.length,
            totalTimeSpent: totalTime,
            achievements: Array.from(this.achievements),
            averageTime: completed.length > 0 ? totalTime / completed.length : 0
        }
    }
    
    // 练习具体实现方法
    setupBasicPatrolPractice() {
        // 清除现有敌人
        if (this.scene.enemyManager) {
            this.scene.enemyManager.clearAllEnemies()
        }
        
        console.log('创建一个BasicAIEnemy并设置其巡逻路径')
    }
    
    checkBasicPatrolCompletion() {
        // 检查是否有巡逻敌人存在
        return this.scene.enemyManager && 
               this.scene.enemyManager.enemies.some(enemy => 
                   enemy.name === 'BasicAI' && enemy.isAlive
               )
    }
    
    setupVisionTuningPractice() {
        console.log('调整敌人的视野参数，观察行为变化')
    }
    
    checkVisionTuningCompletion() {
        // 简化的完成检查
        return Date.now() - this.practiceStartTime > 60000 // 1分钟后自动完成
    }
    
    setupStateMachinePractice() {
        console.log('观察敌人状态机的工作原理')
    }
    
    checkStateMachineCompletion() {
        return Date.now() - this.practiceStartTime > 120000 // 2分钟后自动完成
    }
    
    setupCollisionEffectsPractice() {
        console.log('为碰撞添加视觉和音效反馈')
    }
    
    checkCollisionEffectsCompletion() {
        return Date.now() - this.practiceStartTime > 180000 // 3分钟后自动完成
    }
    
    setupAdvancedAIPractice() {
        console.log('实现高级AI行为和协作系统')
    }
    
    checkAdvancedAICompletion() {
        return Date.now() - this.practiceStartTime > 300000 // 5分钟后自动完成
    }
    
    setupEnemyVarietyPractice() {
        console.log('创建多种不同类型的敌人')
    }
    
    checkEnemyVarietyCompletion() {
        return Date.now() - this.practiceStartTime > 600000 // 10分钟后自动完成
    }
    
    setupBalanceTestingPractice() {
        console.log('使用平衡测试工具分析游戏')
        
        // 创建平衡测试器
        if (!this.scene.balanceTester) {
            this.scene.balanceTester = new AIBalanceTester(this.scene)
        }
    }
    
    checkBalanceTestingCompletion() {
        return this.scene.balanceTester && 
               this.scene.balanceTester.testResults.size > 0
    }
}

// 使用指南
export const PracticeSystemGuide = {
    title: "练习系统使用指南",
    description: "结构化的学习路径，帮助掌握敌人AI和碰撞系统",
    
    usage: [
        {
            step: 1,
            title: "创建练习系统",
            code: `
// 在GameScene中创建练习系统
import PracticeSystem from './exercises/PracticeSystem.js'

this.practiceSystem = new PracticeSystem(this)
            `
        },
        {
            step: 2,
            title: "显示练习菜单",
            code: `
// 按P键显示练习菜单
this.input.keyboard.on('keydown-P', () => {
    this.practiceSystem.showPracticeMenu()
})
            `
        },
        {
            step: 3,
            title: "检查练习进度",
            code: `
// 获取练习统计
const stats = this.practiceSystem.getPracticeStats()
console.log('完成率:', stats.completionRate)
console.log('获得成就:', stats.achievements)
            `
        }
    ],
    
    practiceCategories: [
        {
            name: "AI基础",
            description: "学习基础的AI概念和实现",
            practices: ["基础巡逻练习", "视野系统调优"]
        },
        {
            name: "AI进阶",
            description: "掌握复杂的AI行为和状态机",
            practices: ["状态机理解", "高级AI行为"]
        },
        {
            name: "碰撞系统",
            description: "学习碰撞检测和响应系统",
            practices: ["碰撞效果设计"]
        },
        {
            name: "游戏设计",
            description: "学习游戏设计和平衡原理",
            practices: ["敌人类型多样化"]
        },
        {
            name: "游戏平衡",
            description: "掌握游戏平衡测试和优化",
            practices: ["平衡性测试"]
        }
    ],
    
    tips: [
        "按照难度等级循序渐进",
        "仔细阅读练习目标",
        "善用提示功能",
        "不要急于跳过练习",
        "多次练习加深理解"
    ]
}
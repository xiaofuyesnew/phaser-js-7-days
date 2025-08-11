/**
 * 综合演示场景
 * 
 * 这个场景展示了如何将所有练习组件整合在一起
 * 包括多种敌人类型、平衡测试、练习系统等
 */

import GameScene from '../scenes/GameScene.js'
import PracticeSystem from './PracticeSystem.js'
import AIBalanceTester from './AIBalanceTester.js'
import { EnemyTypes } from './EnemyTypes.js'

export default class IntegratedDemo extends GameScene {
    constructor() {
        super({ key: 'IntegratedDemo' })
        this.demoMode = 'showcase' // showcase, practice, testing
    }
    
    create() {
        super.create()
        
        console.log('🎮 Day 5 综合演示场景启动')
        console.log('📚 包含完整的敌人AI和碰撞系统练习')
        
        // 创建练习系统
        this.practiceSystem = new PracticeSystem(this)
        
        // 创建平衡测试器
        this.balanceTester = new AIBalanceTester(this)
        
        // 设置演示模式
        this.setupDemoMode()
        
        // 创建控制界面
        this.createControlInterface()
        
        // 显示欢迎信息
        this.showWelcomeMessage()
    }
    
    setupDemoMode() {
        switch (this.demoMode) {
            case 'showcase':
                this.setupShowcaseMode()
                break
            case 'practice':
                this.setupPracticeMode()
                break
            case 'testing':
                this.setupTestingMode()
                break
        }
    }
    
    // 展示模式 - 演示所有敌人类型
    setupShowcaseMode() {
        console.log('🎭 展示模式: 演示所有敌人类型和行为')
        
        // 创建各种类型的敌人
        const enemyConfigs = [
            { type: 'BerserkEnemy', x: 500, y: 1400, name: '狂暴敌人' },
            { type: 'CowardEnemy', x: 700, y: 1400, name: '胆小敌人' },
            { type: 'PackEnemy', x: 900, y: 1400, name: '群体敌人1' },
            { type: 'PackEnemy', x: 950, y: 1400, name: '群体敌人2' },
            { type: 'TrapEnemy', x: 1100, y: 1400, name: '陷阱敌人' },
            { type: 'RangedEnemy', x: 1300, y: 1400, name: '远程敌人' }
        ]
        
        enemyConfigs.forEach(config => {
            const EnemyClass = EnemyTypes[config.type]
            if (EnemyClass) {
                const enemy = new EnemyClass(this, config.x, config.y)
                enemy.name = config.name
                this.enemyManager.addEnemy(enemy)
            }
        })
        
        // 创建展示说明
        this.createShowcaseInfo()
    }
    
    // 练习模式 - 启动练习系统
    setupPracticeMode() {
        console.log('📖 练习模式: 结构化学习路径')
        
        // 显示练习菜单
        this.time.delayedCall(1000, () => {
            this.practiceSystem.showPracticeMenu()
        })
    }
    
    // 测试模式 - 启动平衡测试
    setupTestingMode() {
        console.log('🔬 测试模式: AI平衡性测试')
        
        // 开始自动测试序列
        this.time.delayedCall(2000, () => {
            this.balanceTester.startBalanceTest()
        })
    }
    
    // 创建控制界面
    createControlInterface() {
        this.controlUI = this.add.container(10, 550)
        this.controlUI.setScrollFactor(0)
        this.controlUI.setDepth(2000)
        
        // 背景
        const bg = this.add.rectangle(0, 0, 780, 120, 0x000000, 0.7)
        bg.setOrigin(0, 0)
        this.controlUI.add(bg)
        
        // 控制说明
        const controls = [
            '🎮 控制说明:',
            '1-6: 切换敌人类型演示 | P: 练习菜单 | T: 平衡测试 | F1: 调试模式',
            'M: 切换模式 | R: 重置场景 | H: 帮助 | ESC: 返回主菜单',
            'WASD: 移动 | SPACE: 攻击 | 鼠标: 交互'
        ]
        
        controls.forEach((text, index) => {
            const controlText = this.add.text(10, 10 + index * 20, text, {
                fontSize: '12px',
                fill: index === 0 ? '#ffff00' : '#ffffff',
                fontFamily: 'Arial'
            })
            this.controlUI.add(controlText)
        })
        
        // 设置按键监听
        this.setupKeyboardControls()
    }
    
    // 设置键盘控制
    setupKeyboardControls() {
        // 数字键1-6: 演示不同敌人类型
        for (let i = 1; i <= 6; i++) {
            this.input.keyboard.on(`keydown-DIGIT${i}`, () => {
                this.demonstrateEnemyType(i)
            })
        }
        
        // P: 练习菜单
        this.input.keyboard.on('keydown-P', () => {
            this.practiceSystem.showPracticeMenu()
        })
        
        // T: 平衡测试
        this.input.keyboard.on('keydown-T', () => {
            if (!this.balanceTester.isRunning) {
                this.balanceTester.startBalanceTest()
            } else {
                console.log('测试正在进行中...')
            }
        })
        
        // M: 切换模式
        this.input.keyboard.on('keydown-M', () => {
            this.switchDemoMode()
        })
        
        // R: 重置场景
        this.input.keyboard.on('keydown-R', () => {
            this.resetScene()
        })
        
        // H: 帮助
        this.input.keyboard.on('keydown-H', () => {
            this.showHelpDialog()
        })
        
        // F1: 调试模式
        this.input.keyboard.on('keydown-F1', () => {
            this.toggleDebugMode()
        })
    }
    
    // 演示特定敌人类型
    demonstrateEnemyType(typeIndex) {
        const enemyTypes = [
            { type: 'BerserkEnemy', name: '狂暴敌人', description: '受伤后进入狂暴状态' },
            { type: 'CowardEnemy', name: '胆小敌人', description: '玩家靠近时逃跑' },
            { type: 'PackEnemy', name: '群体敌人', description: '聚集时获得加成' },
            { type: 'TrapEnemy', name: '陷阱敌人', description: '伪装成道具突然攻击' },
            { type: 'RangedEnemy', name: '远程敌人', description: '发射子弹攻击' },
            { type: 'AdvancedAIEnemy', name: '高级AI', description: '复杂的协作行为' }
        ]
        
        const config = enemyTypes[typeIndex - 1]
        if (!config) return
        
        console.log(`🎯 演示: ${config.name} - ${config.description}`)
        
        // 清除现有敌人
        this.enemyManager.clearAllEnemies()
        
        // 创建演示敌人
        const EnemyClass = EnemyTypes[config.type] || require('./Exercise3_AdvancedAI.js').default
        
        if (config.type === 'PackEnemy') {
            // 群体敌人需要多个
            for (let i = 0; i < 3; i++) {
                const enemy = new EnemyClass(this, 600 + i * 100, 1400)
                enemy.name = `${config.name}${i + 1}`
                this.enemyManager.addEnemy(enemy)
            }
        } else {
            const enemy = new EnemyClass(this, 600, 1400)
            enemy.name = config.name
            this.enemyManager.addEnemy(enemy)
        }
        
        // 显示演示信息
        this.showDemonstrationInfo(config)
    }
    
    // 显示演示信息
    showDemonstrationInfo(config) {
        if (this.demoInfoUI) {
            this.demoInfoUI.destroy()
        }
        
        this.demoInfoUI = this.add.container(400, 200)
        this.demoInfoUI.setScrollFactor(0)
        this.demoInfoUI.setDepth(3000)
        
        // 背景
        const bg = this.add.rectangle(0, 0, 400, 150, 0x000044, 0.9)
        bg.setOrigin(0.5)
        this.demoInfoUI.add(bg)
        
        // 信息文本
        const infoText = this.add.text(0, 0, 
            `🎯 正在演示: ${config.name}\n\n${config.description}\n\n靠近敌人观察其行为`, {
            fontSize: '16px',
            fill: '#ffffff',
            fontFamily: 'Arial',
            align: 'center'
        }).setOrigin(0.5)
        this.demoInfoUI.add(infoText)
        
        // 3秒后自动隐藏
        this.time.delayedCall(3000, () => {
            if (this.demoInfoUI) {
                this.demoInfoUI.destroy()
                this.demoInfoUI = null
            }
        })
    }
    
    // 切换演示模式
    switchDemoMode() {
        const modes = ['showcase', 'practice', 'testing']
        const currentIndex = modes.indexOf(this.demoMode)
        const nextIndex = (currentIndex + 1) % modes.length
        this.demoMode = modes[nextIndex]
        
        const modeNames = {
            showcase: '展示模式',
            practice: '练习模式',
            testing: '测试模式'
        }
        
        console.log(`🔄 切换到: ${modeNames[this.demoMode]}`)
        
        // 重新设置模式
        this.setupDemoMode()
    }
    
    // 重置场景
    resetScene() {
        console.log('🔄 重置场景')
        
        // 清除所有敌人
        this.enemyManager.clearAllEnemies()
        
        // 重置玩家
        this.player.health = this.player.maxHealth
        this.player.x = 200
        this.player.y = 1500
        
        // 清除UI
        if (this.demoInfoUI) {
            this.demoInfoUI.destroy()
            this.demoInfoUI = null
        }
        
        // 重新设置演示模式
        this.setupDemoMode()
    }
    
    // 显示帮助对话框
    showHelpDialog() {
        if (this.helpUI) {
            this.helpUI.destroy()
        }
        
        this.helpUI = this.add.container(400, 300)
        this.helpUI.setScrollFactor(0)
        this.helpUI.setDepth(4000)
        
        // 背景
        const bg = this.add.rectangle(0, 0, 600, 500, 0x000000, 0.95)
        bg.setOrigin(0.5)
        this.helpUI.add(bg)
        
        // 标题
        const title = this.add.text(0, -220, '📖 Day 5 综合演示帮助', {
            fontSize: '20px',
            fill: '#ffff00',
            fontFamily: 'Arial'
        }).setOrigin(0.5)
        this.helpUI.add(title)
        
        // 帮助内容
        const helpContent = [
            '🎯 敌人类型演示:',
            '1. 狂暴敌人 - 受伤后变得更强',
            '2. 胆小敌人 - 会逃跑但速度快',
            '3. 群体敌人 - 聚集时获得加成',
            '4. 陷阱敌人 - 伪装成道具',
            '5. 远程敌人 - 发射子弹攻击',
            '6. 高级AI - 复杂协作行为',
            '',
            '📚 学习功能:',
            'P - 打开练习系统，结构化学习',
            'T - 启动平衡测试，分析游戏难度',
            'F1 - 调试模式，查看AI内部状态',
            '',
            '🎮 游戏控制:',
            'WASD - 移动角色',
            'SPACE - 攻击',
            'R - 重置场景',
            'M - 切换演示模式'
        ].join('\n')
        
        const content = this.add.text(0, -50, helpContent, {
            fontSize: '12px',
            fill: '#ffffff',
            fontFamily: 'Arial',
            align: 'left'
        }).setOrigin(0.5)
        this.helpUI.add(content)
        
        // 关闭按钮
        const closeButton = this.add.text(0, 200, '关闭 (ESC)', {
            fontSize: '16px',
            fill: '#ff0000',
            fontFamily: 'Arial'
        }).setOrigin(0.5)
        
        closeButton.setInteractive()
        closeButton.on('pointerdown', () => {
            this.helpUI.destroy()
            this.helpUI = null
        })
        
        this.helpUI.add(closeButton)
        
        // ESC键关闭
        this.input.keyboard.once('keydown-ESC', () => {
            if (this.helpUI) {
                this.helpUI.destroy()
                this.helpUI = null
            }
        })
    }
    
    // 创建展示信息
    createShowcaseInfo() {
        this.showcaseUI = this.add.container(10, 200)
        this.showcaseUI.setScrollFactor(0)
        this.showcaseUI.setDepth(2000)
        
        // 背景
        const bg = this.add.rectangle(0, 0, 300, 300, 0x000000, 0.8)
        bg.setOrigin(0, 0)
        this.showcaseUI.add(bg)
        
        // 标题
        const title = this.add.text(10, 10, '🎭 敌人类型展示', {
            fontSize: '16px',
            fill: '#ffff00',
            fontFamily: 'Arial'
        })
        this.showcaseUI.add(title)
        
        // 敌人列表
        const enemyList = [
            '1. 狂暴敌人 (红色)',
            '2. 胆小敌人 (蓝色)',
            '3. 群体敌人 (紫色)',
            '4. 陷阱敌人 (金色)',
            '5. 远程敌人 (绿色)',
            '',
            '按数字键1-6演示',
            '每种敌人都有独特行为',
            '观察它们的AI模式'
        ].join('\n')
        
        const listText = this.add.text(10, 40, enemyList, {
            fontSize: '12px',
            fill: '#ffffff',
            fontFamily: 'Arial'
        })
        this.showcaseUI.add(listText)
    }
    
    // 显示欢迎信息
    showWelcomeMessage() {
        const welcomeUI = this.add.container(400, 300)
        welcomeUI.setScrollFactor(0)
        welcomeUI.setDepth(5000)
        
        // 背景
        const bg = this.add.rectangle(0, 0, 500, 300, 0x004400, 0.95)
        bg.setOrigin(0.5)
        welcomeUI.add(bg)
        
        // 欢迎文本
        const welcomeText = this.add.text(0, 0, 
            `🎮 欢迎来到 Day 5 综合演示!\n\n` +
            `这里包含了完整的敌人AI和碰撞系统练习\n\n` +
            `🎯 当前模式: ${this.demoMode === 'showcase' ? '展示模式' : 
                           this.demoMode === 'practice' ? '练习模式' : '测试模式'}\n\n` +
            `按 H 键查看详细帮助\n` +
            `按 ESC 键关闭此消息`, {
            fontSize: '16px',
            fill: '#ffffff',
            fontFamily: 'Arial',
            align: 'center'
        }).setOrigin(0.5)
        welcomeUI.add(welcomeText)
        
        // 自动关闭或ESC关闭
        this.time.delayedCall(5000, () => {
            welcomeUI.destroy()
        })
        
        this.input.keyboard.once('keydown-ESC', () => {
            welcomeUI.destroy()
        })
    }
    
    update(time, deltaTime) {
        super.update(time, deltaTime)
        
        // 更新练习系统
        if (this.practiceSystem && this.practiceSystem.currentPractice) {
            if (this.practiceSystem.checkPracticeCompletion()) {
                this.practiceSystem.completePractice()
            }
        }
    }
    
    // 切换调试模式
    toggleDebugMode() {
        this.debugMode = !this.debugMode
        
        if (this.debugMode) {
            console.log('🔍 调试模式开启')
            // 显示AI调试信息
            if (this.aiDebugger) {
                this.aiDebugger.toggle()
            }
        } else {
            console.log('🔍 调试模式关闭')
            if (this.aiDebugger) {
                this.aiDebugger.toggle()
            }
        }
    }
}

// 使用说明
export const IntegratedDemoGuide = {
    title: "Day 5 综合演示使用指南",
    description: "完整的敌人AI和碰撞系统学习环境",
    
    features: [
        "多种敌人类型演示",
        "结构化练习系统",
        "AI平衡性测试工具",
        "实时调试功能",
        "交互式学习体验"
    ],
    
    modes: {
        showcase: {
            name: "展示模式",
            description: "演示所有敌人类型和行为",
            usage: "按数字键1-6切换不同敌人类型"
        },
        practice: {
            name: "练习模式",
            description: "结构化的学习练习",
            usage: "按P键打开练习菜单，选择练习项目"
        },
        testing: {
            name: "测试模式",
            description: "AI平衡性自动测试",
            usage: "按T键启动测试，查看平衡性报告"
        }
    },
    
    learningObjectives: [
        "理解不同AI行为模式的设计思路",
        "掌握敌人类型的多样化实现",
        "学会使用调试工具分析AI行为",
        "了解游戏平衡性测试的重要性",
        "体验完整的游戏开发流程"
    ],
    
    tips: [
        "先在展示模式中观察各种敌人行为",
        "使用练习模式进行结构化学习",
        "利用调试模式深入理解AI内部机制",
        "通过测试模式了解游戏平衡的重要性",
        "尝试修改代码参数观察行为变化"
    ]
}
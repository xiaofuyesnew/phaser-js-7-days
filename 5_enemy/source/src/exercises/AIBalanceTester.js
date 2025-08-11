/**
 * AI行为平衡性测试工具
 * 
 * 这个工具用于测试和调整敌人AI的平衡性
 * 包括难度评估、行为分析和参数优化
 */

export default class AIBalanceTester {
    constructor(scene) {
        this.scene = scene
        this.testResults = new Map()
        this.isRunning = false
        this.testDuration = 30000 // 30秒测试
        this.testStartTime = 0
        
        // 测试数据收集
        this.playerData = {
            damageDealt: 0,
            damageTaken: 0,
            distanceTraveled: 0,
            timeAlive: 0,
            enemiesKilled: 0,
            deathCount: 0,
            averageHealth: 0,
            healthSamples: []
        }
        
        this.enemyData = new Map() // 每种敌人类型的数据
        
        // 测试场景配置
        this.testScenarios = [
            {
                name: "基础战斗测试",
                description: "测试基本的战斗平衡性",
                enemyTypes: ['patrol', 'chaser'],
                enemyCount: 3,
                duration: 30000
            },
            {
                name: "多样性测试",
                description: "测试多种敌人类型的组合",
                enemyTypes: ['berserker', 'coward', 'pack'],
                enemyCount: 5,
                duration: 45000
            },
            {
                name: "高难度测试",
                description: "测试高难度敌人的平衡性",
                enemyTypes: ['smart', 'ranged', 'trap'],
                enemyCount: 4,
                duration: 60000
            },
            {
                name: "群体协作测试",
                description: "测试敌人协作行为",
                enemyTypes: ['pack', 'smart'],
                enemyCount: 6,
                duration: 40000
            }
        ]
        
        this.currentScenario = null
        this.scenarioIndex = 0
    }
    
    // 开始平衡性测试
    startBalanceTest(scenarioName = null) {
        if (this.isRunning) {
            console.log("测试已在进行中")
            return
        }
        
        // 选择测试场景
        if (scenarioName) {
            this.currentScenario = this.testScenarios.find(s => s.name === scenarioName)
        } else {
            this.currentScenario = this.testScenarios[this.scenarioIndex]
        }
        
        if (!this.currentScenario) {
            console.log("未找到测试场景")
            return
        }
        
        console.log(`开始测试: ${this.currentScenario.name}`)
        console.log(`描述: ${this.currentScenario.description}`)
        
        this.isRunning = true
        this.testStartTime = Date.now()
        this.resetTestData()
        
        // 设置测试环境
        this.setupTestEnvironment()
        
        // 开始数据收集
        this.startDataCollection()
        
        // 设置测试结束定时器
        this.scene.time.delayedCall(this.currentScenario.duration, () => {
            this.endBalanceTest()
        })
    }
    
    // 设置测试环境
    setupTestEnvironment() {
        // 清除现有敌人
        if (this.scene.enemyManager) {
            this.scene.enemyManager.clearAllEnemies()
        }
        
        // 重置玩家状态
        if (this.scene.player) {
            this.scene.player.health = this.scene.player.maxHealth
            this.scene.player.x = 400
            this.scene.player.y = 1500
        }
        
        // 生成测试敌人
        this.spawnTestEnemies()
        
        // 显示测试UI
        this.showTestUI()
    }
    
    // 生成测试敌人
    spawnTestEnemies() {
        const { enemyTypes, enemyCount } = this.currentScenario
        
        for (let i = 0; i < enemyCount; i++) {
            const enemyType = enemyTypes[i % enemyTypes.length]
            const x = 600 + (i * 150) + Math.random() * 100
            const y = 1400 + Math.random() * 200
            
            // 根据类型生成敌人
            let enemy
            switch (enemyType) {
                case 'berserker':
                    const { BerserkEnemy } = require('./EnemyTypes.js')
                    enemy = new BerserkEnemy(this.scene, x, y)
                    break
                case 'coward':
                    const { CowardEnemy } = require('./EnemyTypes.js')
                    enemy = new CowardEnemy(this.scene, x, y)
                    break
                case 'pack':
                    const { PackEnemy } = require('./EnemyTypes.js')
                    enemy = new PackEnemy(this.scene, x, y)
                    break
                case 'trap':
                    const { TrapEnemy } = require('./EnemyTypes.js')
                    enemy = new TrapEnemy(this.scene, x, y)
                    break
                case 'ranged':
                    const { RangedEnemy } = require('./EnemyTypes.js')
                    enemy = new RangedEnemy(this.scene, x, y)
                    break
                default:
                    // 使用默认敌人管理器
                    if (this.scene.enemyManager) {
                        this.scene.enemyManager.spawnEnemy(x, y, enemyType)
                    }
                    continue
            }
            
            if (enemy && this.scene.enemyManager) {
                this.scene.enemyManager.addEnemy(enemy)
            }
        }
    }
    
    // 开始数据收集
    startDataCollection() {
        this.dataCollectionTimer = this.scene.time.addEvent({
            delay: 100, // 每100ms收集一次数据
            callback: this.collectData,
            callbackScope: this,
            loop: true
        })
    }
    
    // 收集测试数据
    collectData() {
        if (!this.isRunning) return
        
        const player = this.scene.player
        if (!player) return
        
        // 收集玩家数据
        this.playerData.timeAlive = Date.now() - this.testStartTime
        this.playerData.healthSamples.push(player.health)
        
        // 计算平均血量
        const totalHealth = this.playerData.healthSamples.reduce((sum, h) => sum + h, 0)
        this.playerData.averageHealth = totalHealth / this.playerData.healthSamples.length
        
        // 收集敌人数据
        if (this.scene.enemyManager) {
            this.scene.enemyManager.enemies.forEach(enemy => {
                const enemyType = enemy.constructor.name
                
                if (!this.enemyData.has(enemyType)) {
                    this.enemyData.set(enemyType, {
                        totalSpawned: 0,
                        totalKilled: 0,
                        totalDamageDealt: 0,
                        averageLifetime: 0,
                        lifetimes: [],
                        effectivenessScore: 0
                    })
                }
                
                const data = this.enemyData.get(enemyType)
                
                if (enemy.isAlive) {
                    // 活着的敌人数据
                    data.totalSpawned++
                } else {
                    // 死亡的敌人数据
                    data.totalKilled++
                    if (enemy.lifetime) {
                        data.lifetimes.push(enemy.lifetime)
                        data.averageLifetime = data.lifetimes.reduce((sum, t) => sum + t, 0) / data.lifetimes.length
                    }
                }
            })
        }
        
        // 更新测试UI
        this.updateTestUI()
    }
    
    // 结束平衡性测试
    endBalanceTest() {
        if (!this.isRunning) return
        
        this.isRunning = false
        
        // 停止数据收集
        if (this.dataCollectionTimer) {
            this.dataCollectionTimer.destroy()
            this.dataCollectionTimer = null
        }
        
        // 计算最终结果
        this.calculateTestResults()
        
        // 显示测试报告
        this.showTestReport()
        
        console.log(`测试完成: ${this.currentScenario.name}`)
    }
    
    // 计算测试结果
    calculateTestResults() {
        const results = {
            scenario: this.currentScenario.name,
            duration: this.playerData.timeAlive,
            playerSurvivalRate: this.playerData.deathCount === 0 ? 1.0 : 0.0,
            averagePlayerHealth: this.playerData.averageHealth,
            totalDamageDealt: this.playerData.damageDealt,
            totalDamageTaken: this.playerData.damageTaken,
            enemiesKilled: this.playerData.enemiesKilled,
            difficultyScore: 0,
            balanceScore: 0,
            recommendations: []
        }
        
        // 计算难度分数 (0-100)
        const healthPercent = this.playerData.averageHealth / (this.scene.player?.maxHealth || 100)
        const survivalBonus = results.playerSurvivalRate * 20
        const killEfficiency = Math.min(this.playerData.enemiesKilled / this.currentScenario.enemyCount, 1) * 30
        
        results.difficultyScore = Math.max(0, 100 - (healthPercent * 50 + survivalBonus + killEfficiency))
        
        // 计算平衡分数 (0-100, 50为最佳平衡)
        const idealDifficulty = 60 // 理想难度
        results.balanceScore = 100 - Math.abs(results.difficultyScore - idealDifficulty) * 2
        
        // 生成建议
        this.generateRecommendations(results)
        
        this.testResults.set(this.currentScenario.name, results)
    }
    
    // 生成平衡建议
    generateRecommendations(results) {
        const { difficultyScore, averagePlayerHealth, enemiesKilled } = results
        const maxHealth = this.scene.player?.maxHealth || 100
        
        if (difficultyScore < 40) {
            results.recommendations.push({
                type: "增加难度",
                description: "游戏过于简单，建议增加敌人数量或提高敌人属性",
                priority: "高",
                suggestions: [
                    "增加敌人生命值 10-20%",
                    "提高敌人移动速度 15%",
                    "减少敌人攻击间隔",
                    "增加敌人生成数量"
                ]
            })
        } else if (difficultyScore > 80) {
            results.recommendations.push({
                type: "降低难度",
                description: "游戏过于困难，建议降低敌人威胁或增强玩家能力",
                priority: "高",
                suggestions: [
                    "降低敌人攻击力 15-25%",
                    "增加玩家生命值回复",
                    "延长敌人攻击间隔",
                    "减少敌人检测范围"
                ]
            })
        }
        
        if (averagePlayerHealth < maxHealth * 0.3) {
            results.recommendations.push({
                type: "生存性改进",
                description: "玩家生存压力过大",
                priority: "中",
                suggestions: [
                    "增加治疗道具生成",
                    "降低敌人伤害输出",
                    "增加玩家无敌时间",
                    "优化敌人AI攻击频率"
                ]
            })
        }
        
        if (enemiesKilled < this.currentScenario.enemyCount * 0.5) {
            results.recommendations.push({
                type: "击杀效率",
                description: "玩家击杀效率偏低",
                priority: "中",
                suggestions: [
                    "增加玩家攻击力",
                    "降低敌人生命值",
                    "改进玩家攻击范围",
                    "优化敌人逃跑行为"
                ]
            })
        }
        
        // 敌人类型特定建议
        this.enemyData.forEach((data, enemyType) => {
            const killRate = data.totalKilled / (data.totalSpawned || 1)
            
            if (killRate < 0.3) {
                results.recommendations.push({
                    type: `${enemyType} 平衡`,
                    description: `${enemyType} 过于强大，存活率过高`,
                    priority: "中",
                    suggestions: [
                        `降低 ${enemyType} 的生命值`,
                        `减少 ${enemyType} 的攻击力`,
                        `增加 ${enemyType} 的弱点`
                    ]
                })
            } else if (killRate > 0.8) {
                results.recommendations.push({
                    type: `${enemyType} 平衡`,
                    description: `${enemyType} 过于脆弱，容易被击杀`,
                    priority: "低",
                    suggestions: [
                        `增加 ${enemyType} 的生命值`,
                        `提高 ${enemyType} 的移动速度`,
                        `增强 ${enemyType} 的特殊能力`
                    ]
                })
            }
        })
    }
    
    // 显示测试UI
    showTestUI() {
        if (this.testUI) {
            this.testUI.destroy()
        }
        
        this.testUI = this.scene.add.container(10, 10)
        this.testUI.setScrollFactor(0)
        this.testUI.setDepth(4000)
        
        // 背景
        const bg = this.scene.add.rectangle(0, 0, 300, 150, 0x000000, 0.8)
        bg.setOrigin(0, 0)
        this.testUI.add(bg)
        
        // 标题
        const title = this.scene.add.text(10, 10, 'AI平衡测试', {
            fontSize: '16px',
            fill: '#ffffff',
            fontFamily: 'Arial'
        })
        this.testUI.add(title)
        
        // 测试信息
        this.testInfoText = this.scene.add.text(10, 35, '', {
            fontSize: '12px',
            fill: '#00ff00',
            fontFamily: 'Arial'
        })
        this.testUI.add(this.testInfoText)
    }
    
    // 更新测试UI
    updateTestUI() {
        if (!this.testInfoText || !this.isRunning) return
        
        const elapsed = Date.now() - this.testStartTime
        const remaining = Math.max(0, this.currentScenario.duration - elapsed)
        
        const info = [
            `场景: ${this.currentScenario.name}`,
            `剩余时间: ${Math.ceil(remaining / 1000)}s`,
            `玩家血量: ${this.scene.player?.health || 0}`,
            `平均血量: ${Math.round(this.playerData.averageHealth)}`,
            `击杀数: ${this.playerData.enemiesKilled}`,
            `存活敌人: ${this.scene.enemyManager?.getActiveEnemyCount() || 0}`
        ].join('\n')
        
        this.testInfoText.setText(info)
    }
    
    // 显示测试报告
    showTestReport() {
        const results = this.testResults.get(this.currentScenario.name)
        if (!results) return
        
        console.log('\n=== AI平衡测试报告 ===')
        console.log(`测试场景: ${results.scenario}`)
        console.log(`测试时长: ${Math.round(results.duration / 1000)}秒`)
        console.log(`难度分数: ${Math.round(results.difficultyScore)}/100`)
        console.log(`平衡分数: ${Math.round(results.balanceScore)}/100`)
        console.log(`玩家存活率: ${Math.round(results.playerSurvivalRate * 100)}%`)
        console.log(`平均血量: ${Math.round(results.averagePlayerHealth)}`)
        console.log(`击杀敌人: ${results.enemiesKilled}`)
        
        console.log('\n--- 敌人数据 ---')
        this.enemyData.forEach((data, type) => {
            console.log(`${type}: 生成${data.totalSpawned}, 击杀${data.totalKilled}, 存活率${Math.round((1 - data.totalKilled / data.totalSpawned) * 100)}%`)
        })
        
        console.log('\n--- 平衡建议 ---')
        results.recommendations.forEach((rec, index) => {
            console.log(`${index + 1}. [${rec.priority}] ${rec.type}`)
            console.log(`   ${rec.description}`)
            rec.suggestions.forEach(suggestion => {
                console.log(`   - ${suggestion}`)
            })
        })
        
        // 在游戏中显示简化报告
        this.showInGameReport(results)
    }
    
    // 在游戏中显示报告
    showInGameReport(results) {
        if (this.reportUI) {
            this.reportUI.destroy()
        }
        
        this.reportUI = this.scene.add.container(400, 300)
        this.reportUI.setScrollFactor(0)
        this.reportUI.setDepth(5000)
        
        // 背景
        const bg = this.scene.add.rectangle(0, 0, 500, 400, 0x000000, 0.9)
        bg.setOrigin(0.5, 0.5)
        this.reportUI.add(bg)
        
        // 标题
        const title = this.scene.add.text(0, -180, '测试报告', {
            fontSize: '24px',
            fill: '#ffffff',
            fontFamily: 'Arial'
        }).setOrigin(0.5)
        this.reportUI.add(title)
        
        // 报告内容
        const reportText = [
            `场景: ${results.scenario}`,
            `难度分数: ${Math.round(results.difficultyScore)}/100`,
            `平衡分数: ${Math.round(results.balanceScore)}/100`,
            ``,
            `主要建议:`,
            ...results.recommendations.slice(0, 3).map(rec => `• ${rec.type}`)
        ].join('\n')
        
        const content = this.scene.add.text(0, -50, reportText, {
            fontSize: '14px',
            fill: '#cccccc',
            fontFamily: 'Arial',
            align: 'center'
        }).setOrigin(0.5)
        this.reportUI.add(content)
        
        // 按钮
        const nextButton = this.scene.add.text(0, 150, '下一个测试 (N)', {
            fontSize: '16px',
            fill: '#00ff00',
            fontFamily: 'Arial'
        }).setOrigin(0.5)
        this.reportUI.add(nextButton)
        
        const closeButton = this.scene.add.text(0, 180, '关闭 (ESC)', {
            fontSize: '16px',
            fill: '#ff0000',
            fontFamily: 'Arial'
        }).setOrigin(0.5)
        this.reportUI.add(closeButton)
        
        // 添加按键监听
        this.scene.input.keyboard.once('keydown-N', () => {
            this.nextTest()
        })
        
        this.scene.input.keyboard.once('keydown-ESC', () => {
            this.closeReport()
        })
    }
    
    // 下一个测试
    nextTest() {
        this.closeReport()
        this.scenarioIndex = (this.scenarioIndex + 1) % this.testScenarios.length
        
        // 延迟开始下一个测试
        this.scene.time.delayedCall(1000, () => {
            this.startBalanceTest()
        })
    }
    
    // 关闭报告
    closeReport() {
        if (this.reportUI) {
            this.reportUI.destroy()
            this.reportUI = null
        }
        
        if (this.testUI) {
            this.testUI.destroy()
            this.testUI = null
        }
    }
    
    // 重置测试数据
    resetTestData() {
        this.playerData = {
            damageDealt: 0,
            damageTaken: 0,
            distanceTraveled: 0,
            timeAlive: 0,
            enemiesKilled: 0,
            deathCount: 0,
            averageHealth: 0,
            healthSamples: []
        }
        
        this.enemyData.clear()
    }
    
    // 获取所有测试结果
    getAllTestResults() {
        return Array.from(this.testResults.values())
    }
    
    // 导出测试数据
    exportTestData() {
        const data = {
            timestamp: new Date().toISOString(),
            scenarios: this.testScenarios,
            results: this.getAllTestResults(),
            summary: this.generateSummary()
        }
        
        console.log('测试数据导出:', JSON.stringify(data, null, 2))
        return data
    }
    
    // 生成测试总结
    generateSummary() {
        const results = this.getAllTestResults()
        if (results.length === 0) return null
        
        const avgDifficulty = results.reduce((sum, r) => sum + r.difficultyScore, 0) / results.length
        const avgBalance = results.reduce((sum, r) => sum + r.balanceScore, 0) / results.length
        
        return {
            totalTests: results.length,
            averageDifficulty: Math.round(avgDifficulty),
            averageBalance: Math.round(avgBalance),
            bestBalancedScenario: results.reduce((best, current) => 
                current.balanceScore > best.balanceScore ? current : best
            ).scenario,
            recommendations: this.generateOverallRecommendations(results)
        }
    }
    
    // 生成总体建议
    generateOverallRecommendations(results) {
        const recommendations = []
        
        const avgDifficulty = results.reduce((sum, r) => sum + r.difficultyScore, 0) / results.length
        
        if (avgDifficulty < 45) {
            recommendations.push("整体难度偏低，建议全面提升敌人能力")
        } else if (avgDifficulty > 75) {
            recommendations.push("整体难度偏高，建议降低敌人威胁或增强玩家能力")
        } else {
            recommendations.push("整体难度平衡良好")
        }
        
        return recommendations
    }
}

// 使用示例和说明
export const BalanceTesterGuide = {
    title: "AI平衡测试工具使用指南",
    description: "用于测试和优化敌人AI的平衡性",
    
    usage: [
        {
            step: 1,
            title: "创建测试器",
            code: `
// 在GameScene中创建平衡测试器
import AIBalanceTester from './exercises/AIBalanceTester.js'

this.balanceTester = new AIBalanceTester(this)
            `
        },
        {
            step: 2,
            title: "开始测试",
            code: `
// 开始特定场景测试
this.balanceTester.startBalanceTest('基础战斗测试')

// 或开始默认测试序列
this.balanceTester.startBalanceTest()
            `
        },
        {
            step: 3,
            title: "查看结果",
            code: `
// 获取测试结果
const results = this.balanceTester.getAllTestResults()

// 导出测试数据
const data = this.balanceTester.exportTestData()
            `
        }
    ],
    
    features: [
        "自动化测试多种敌人组合",
        "实时数据收集和分析",
        "难度和平衡性评分",
        "具体的优化建议",
        "测试报告生成和导出"
    ],
    
    metrics: [
        "玩家存活率",
        "平均血量",
        "击杀效率",
        "敌人威胁度",
        "游戏节奏"
    ]
}
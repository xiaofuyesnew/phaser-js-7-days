/**
 * Day 5 练习索引
 * 
 * 这个文件包含了所有练习的导入和说明
 */

// 练习1: 基础敌人AI
export { default as BasicAIEnemy, Exercise1Guide } from './Exercise1_BasicAI.js'

// 练习2: 智能碰撞系统
export { default as AdvancedCollisionSystem, Exercise2Guide } from './Exercise2_CollisionSystem.js'

// 练习3: 高级AI行为
export { default as AdvancedAIEnemy, AIDebugger, Exercise3Guide } from './Exercise3_AdvancedAI.js'

// 完整游戏示例
export { default as ActionGameDemo } from './ActionGameDemo.js'

// 多种敌人类型
export { EnemyTypes, EnemyTypeConfigs } from './EnemyTypes.js'

// AI平衡测试工具
export { default as AIBalanceTester, BalanceTesterGuide } from './AIBalanceTester.js'

// 练习系统
export { default as PracticeSystem, PracticeSystemGuide } from './PracticeSystem.js'

// 综合演示场景
export { default as IntegratedDemo, IntegratedDemoGuide } from './IntegratedDemo.js'

// 练习指南
export const ExerciseGuides = {
    exercise1: {
        title: "基础敌人AI",
        difficulty: "⭐",
        description: "学习创建基础的敌人AI行为，包括巡逻、追击和攻击状态",
        objectives: [
            "理解状态机的工作原理",
            "实现基础的巡逻行为",
            "添加玩家检测功能",
            "实现简单的追击逻辑",
            "添加血量系统"
        ],
        keyLearning: [
            "状态机设计模式",
            "AI行为状态切换",
            "视野检测系统",
            "基础游戏AI逻辑"
        ]
    },
    
    exercise2: {
        title: "智能碰撞系统",
        difficulty: "⭐⭐",
        description: "构建完整的碰撞检测和响应系统，包括特效和性能优化",
        objectives: [
            "创建多种碰撞类型",
            "实现碰撞响应回调",
            "添加击退和伤害效果",
            "优化碰撞检测性能",
            "创建视觉特效系统"
        ],
        keyLearning: [
            "碰撞检测优化",
            "事件驱动的碰撞响应",
            "游戏特效系统",
            "性能监控和分析"
        ]
    },
    
    exercise3: {
        title: "高级AI行为",
        difficulty: "⭐⭐⭐",
        description: "实现复杂的AI系统，包括团队协作、记忆系统和动态难度调整",
        objectives: [
            "实现多种敌人类型",
            "添加协作行为",
            "创建AI记忆系统",
            "实现动态难度调整",
            "开发AI调试工具"
        ],
        keyLearning: [
            "高级AI架构设计",
            "多智能体协作",
            "AI记忆和学习系统",
            "动态难度平衡",
            "AI调试和可视化"
        ]
    }
}

// 学习路径建议
export const LearningPath = {
    beginner: [
        {
            step: 1,
            title: "理解基础概念",
            description: "先学习状态机和基础AI概念",
            exercises: ["exercise1"],
            timeEstimate: "1-2小时"
        },
        {
            step: 2,
            title: "掌握碰撞系统",
            description: "学习碰撞检测和响应机制",
            exercises: ["exercise2"],
            timeEstimate: "2-3小时"
        },
        {
            step: 3,
            title: "探索高级AI",
            description: "尝试高级AI功能，但不要求完全掌握",
            exercises: ["exercise3"],
            timeEstimate: "1-2小时"
        }
    ],
    
    intermediate: [
        {
            step: 1,
            title: "快速回顾基础",
            description: "快速浏览基础AI实现",
            exercises: ["exercise1"],
            timeEstimate: "30分钟"
        },
        {
            step: 2,
            title: "深入碰撞系统",
            description: "完整实现碰撞系统并优化性能",
            exercises: ["exercise2"],
            timeEstimate: "2-3小时"
        },
        {
            step: 3,
            title: "掌握高级AI",
            description: "实现复杂AI行为和调试工具",
            exercises: ["exercise3"],
            timeEstimate: "3-4小时"
        }
    ],
    
    advanced: [
        {
            step: 1,
            title: "系统整合",
            description: "将所有系统整合成完整游戏",
            exercises: ["exercise1", "exercise2", "exercise3"],
            timeEstimate: "4-6小时"
        },
        {
            step: 2,
            title: "性能优化",
            description: "优化游戏性能和用户体验",
            exercises: ["ActionGameDemo"],
            timeEstimate: "2-3小时"
        },
        {
            step: 3,
            title: "扩展功能",
            description: "添加自定义功能和创新玩法",
            exercises: ["自定义扩展"],
            timeEstimate: "开放式"
        }
    ]
}

// 常见问题和解决方案
export const FAQ = {
    "敌人AI反应太慢怎么办？": {
        problem: "敌人检测玩家或切换状态的反应时间过长",
        solutions: [
            "减少状态机的更新间隔",
            "优化视野检测的计算频率",
            "调整AI决策的触发条件",
            "使用预测性AI提前做出反应"
        ],
        code: `
// 调整状态机更新频率
update(deltaTime) {
    // 每帧都更新，而不是间隔更新
    this.stateMachine.update(deltaTime)
}

// 优化视野检测
canSee(target) {
    // 先进行距离检查，再进行角度检查
    const distance = Phaser.Math.Distance.Between(...)
    if (distance > this.viewDistance) return false
    
    // 其他检查...
}
        `
    },
    
    "碰撞检测性能问题": {
        problem: "大量对象时碰撞检测导致帧率下降",
        solutions: [
            "使用空间分割算法",
            "实现碰撞层级过滤",
            "使用对象池管理",
            "动态启用/禁用碰撞检测"
        ],
        code: `
// 使用空间分割优化
class SpatialGrid {
    getNearbyObjects(x, y, radius) {
        // 只检测附近区域的对象
        return this.getObjectsInRadius(x, y, radius)
    }
}

// 动态碰撞管理
if (distance > maxInteractionDistance) {
    object.body.enable = false // 禁用远距离对象的碰撞
}
        `
    },
    
    "AI行为不够自然": {
        problem: "敌人行为过于机械化，缺乏真实感",
        solutions: [
            "添加随机性和不确定性",
            "实现情绪和个性系统",
            "使用噪声函数创建自然变化",
            "添加反应延迟和犹豫"
        ],
        code: `
// 添加随机性
makeDecision() {
    const baseDecision = this.calculateOptimalDecision()
    
    // 添加随机因素
    if (Math.random() < 0.1) {
        return this.getRandomDecision()
    }
    
    return baseDecision
}

// 添加反应延迟
onPlayerDetected() {
    const reactionTime = 200 + Math.random() * 500
    this.scene.time.delayedCall(reactionTime, () => {
        this.stateMachine.changeState('chase')
    })
}
        `
    }
}

// 扩展建议
export const ExtensionIdeas = [
    {
        title: "敌人类型扩展",
        description: "创建更多种类的敌人",
        ideas: [
            "飞行敌人 - 不受地形限制",
            "远程敌人 - 发射子弹攻击",
            "召唤师 - 可以召唤其他敌人",
            "变形敌人 - 可以改变形态和能力"
        ]
    },
    {
        title: "AI行为扩展",
        description: "实现更复杂的AI行为",
        ideas: [
            "路径规划 - 使用A*算法寻路",
            "群体行为 - 实现蜂群算法",
            "学习系统 - AI根据玩家行为调整策略",
            "情绪系统 - 不同情绪下的不同行为"
        ]
    },
    {
        title: "游戏机制扩展",
        description: "添加更多游戏玩法",
        ideas: [
            "技能系统 - 玩家可以学习新技能",
            "装备系统 - 不同装备提供不同能力",
            "环境交互 - 可破坏的环境和机关",
            "多人合作 - 支持多玩家协作"
        ]
    }
]

// 完整的练习体系
export const CompletePracticeSystem = {
    title: "Day 5 完整练习体系",
    description: "从基础到高级的完整学习路径",
    
    learningPath: {
        beginner: {
            title: "初学者路径",
            description: "适合刚接触游戏AI的学习者",
            practices: [
                "基础巡逻练习",
                "视野系统调优",
                "碰撞效果设计"
            ],
            estimatedTime: "2-3小时",
            prerequisites: ["完成Day 1-4的学习"],
            outcomes: ["理解AI基础概念", "掌握基本碰撞系统", "能够创建简单敌人"]
        },
        
        intermediate: {
            title: "中级路径",
            description: "适合有一定编程基础的学习者",
            practices: [
                "状态机理解",
                "高级AI行为",
                "敌人类型多样化"
            ],
            estimatedTime: "4-6小时",
            prerequisites: ["完成初学者路径"],
            outcomes: ["掌握状态机设计", "实现复杂AI行为", "创建多样化敌人"]
        },
        
        advanced: {
            title: "高级路径",
            description: "适合有经验的开发者",
            practices: [
                "平衡性测试",
                "AI架构设计",
                "性能优化"
            ],
            estimatedTime: "6-8小时",
            prerequisites: ["完成中级路径"],
            outcomes: ["掌握游戏平衡", "设计AI架构", "优化游戏性能"]
        }
    },
    
    practiceTypes: {
        guided: {
            name: "引导式练习",
            description: "有详细步骤和提示的练习",
            examples: ["基础巡逻练习", "视野系统调优"]
        },
        
        exploratory: {
            name: "探索式练习",
            description: "给定目标，自由探索实现方法",
            examples: ["敌人类型多样化", "AI行为扩展"]
        },
        
        challenge: {
            name: "挑战式练习",
            description: "高难度的综合性挑战",
            examples: ["平衡性测试", "完整游戏制作"]
        }
    },
    
    assessmentCriteria: {
        functionality: {
            name: "功能实现",
            weight: 40,
            description: "代码是否正确实现了要求的功能"
        },
        
        codeQuality: {
            name: "代码质量",
            weight: 25,
            description: "代码结构、可读性和最佳实践"
        },
        
        creativity: {
            name: "创新性",
            weight: 20,
            description: "是否有创新的想法和独特的实现"
        },
        
        performance: {
            name: "性能表现",
            weight: 15,
            description: "代码的执行效率和资源使用"
        }
    }
}
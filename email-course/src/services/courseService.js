import fs from 'fs/promises'
import path from 'path'
import { fileURLToPath } from 'url'
import { marked } from 'marked'
import { logger } from '../utils/logger.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

export class CourseService {
  constructor(database, emailService) {
    this.db = database
    this.emailService = emailService
    this.courseContent = new Map()
    this.contentDir = path.join(__dirname, '../content/course')
  }
  
  async initialize() {
    try {
      await this.loadCourseContent()
      logger.info('课程服务初始化完成')
    } catch (error) {
      logger.error('课程服务初始化失败:', error)
      throw error
    }
  }
  
  async loadCourseContent() {
    try {
      const days = [1, 2, 3, 4, 5, 6, 7]
      
      for (const day of days) {
        try {
          const contentPath = path.join(this.contentDir, `day${day}.md`)
          const content = await fs.readFile(contentPath, 'utf-8')
          const courseData = this.parseCourseContent(content, day)
          this.courseContent.set(day, courseData)
        } catch (error) {
          logger.warn(`课程内容文件不存在: day${day}.md`)
          // 使用默认内容
          this.courseContent.set(day, this.getDefaultCourseContent(day))
        }
      }
      
      logger.info(`已加载 ${this.courseContent.size} 天的课程内容`)
    } catch (error) {
      logger.error('加载课程内容失败:', error)
      throw error
    }
  }
  
  parseCourseContent(content, day) {
    // 解析 Front Matter
    const frontMatterMatch = content.match(/^---\n([\s\S]*?)\n---/)
    let metadata = {}
    let mainContent = content
    
    if (frontMatterMatch) {
      const frontMatter = frontMatterMatch[1]
      mainContent = content.replace(frontMatterMatch[0], '').trim()
      
      // 解析 YAML-like 格式
      const lines = frontMatter.split('\n')
      for (const line of lines) {
        const [key, ...valueParts] = line.split(':')
        if (key && valueParts.length > 0) {
          const value = valueParts.join(':').trim()
          if (key.trim() === 'objectives' || key.trim() === 'deliverables') {
            // 解析数组
            metadata[key.trim()] = value.split(',').map(item => item.trim())
          } else {
            metadata[key.trim()] = value.replace(/^["']|["']$/g, '')
          }
        }
      }
    }
    
    return {
      day,
      title: metadata.title || `Day ${day}: Phaser.js 学习`,
      description: metadata.description || '',
      objectives: metadata.objectives || [],
      deliverables: metadata.deliverables || [],
      estimatedTime: metadata.estimatedTime || '2-3小时',
      difficulty: metadata.difficulty || '中级',
      content: mainContent,
      htmlContent: marked(mainContent),
      wordCount: this.countWords(mainContent),
      readingTime: this.estimateReadingTime(mainContent)
    }
  }
  
  getDefaultCourseContent(day) {
    const defaultContent = {
      1: {
        title: 'Day 1: Phaser.js 基础入门',
        description: '学习 Phaser.js 的核心概念和基本用法',
        objectives: [
          '理解 Phaser.js 的基本架构',
          '创建第一个 Phaser 游戏',
          '掌握场景系统的使用',
          '学会加载和显示游戏资源'
        ],
        content: `# Day 1: Phaser.js 基础入门

## 欢迎来到 Phaser.js 的世界！

今天我们将开始 Phaser.js 游戏开发的学习之旅。Phaser.js 是一个强大的 HTML5 游戏框架，让我们能够轻松创建跨平台的 2D 游戏。

## 学习目标

- 理解 Phaser.js 的基本架构
- 创建第一个 Phaser 游戏
- 掌握场景系统的使用
- 学会加载和显示游戏资源

## 基础概念

### 什么是 Phaser.js？

Phaser.js 是一个快速、免费且开源的 HTML5 游戏框架。它支持 Canvas 和 WebGL 渲染，内置物理引擎，并提供了丰富的功能来创建 2D 游戏。

### 核心组件

1. **Game 对象**: 游戏的主要容器
2. **Scene 场景**: 游戏的不同状态或关卡
3. **GameObject 游戏对象**: 精灵、文本、图形等
4. **Physics 物理系统**: 处理碰撞和运动

## 第一个 Phaser 游戏

让我们创建一个简单的 "Hello World" 游戏：

\`\`\`javascript
// 游戏配置
const config = {
    type: Phaser.AUTO,
    width: 800,
    height: 600,
    scene: {
        preload: preload,
        create: create,
        update: update
    }
};

function preload() {
    // 加载游戏资源
    console.log('加载资源...');
}

function create() {
    // 创建游戏对象
    this.add.text(400, 300, 'Hello Phaser!', {
        fontSize: '32px',
        fill: '#000'
    }).setOrigin(0.5);
}

function update() {
    // 游戏循环更新
}

// 启动游戏
const game = new Phaser.Game(config);
\`\`\`

## 今天的练习

1. 创建一个基础的 Phaser 项目
2. 显示一个简单的文本
3. 尝试修改文本的颜色和位置
4. 添加一个简单的图形

## 小结

今天我们学习了 Phaser.js 的基础知识，创建了第一个游戏。明天我们将学习如何添加精灵和动画。

继续加油！🎮`
      },
      2: {
        title: 'Day 2: 精灵与动画',
        description: '学习如何在游戏中添加精灵和动画效果',
        objectives: [
          '掌握精灵的创建和管理',
          '学习纹理和精灵图的使用',
          '实现基本的动画效果',
          '处理用户输入控制精灵'
        ]
      },
      3: {
        title: 'Day 3: 物理系统与碰撞',
        description: '学习 Phaser.js 的物理引擎和碰撞检测',
        objectives: [
          '理解 Arcade Physics 物理系统',
          '实现重力和跳跃机制',
          '处理物体间的碰撞',
          '创建平台跳跃游戏'
        ]
      },
      4: {
        title: 'Day 4: 摄像机与世界',
        description: '学习摄像机控制和大型游戏世界的管理',
        objectives: [
          '掌握摄像机跟随技术',
          '实现世界边界限制',
          '创建滚动背景效果',
          '优化大型场景渲染'
        ]
      },
      5: {
        title: 'Day 5: 敌人与 AI',
        description: '实现敌人系统和基础人工智能',
        objectives: [
          '创建敌人类和行为系统',
          '实现简单的 AI 逻辑',
          '处理玩家与敌人的交互',
          '优化游戏性能'
        ]
      },
      6: {
        title: 'Day 6: 音效与 UI',
        description: '添加音效系统和用户界面',
        objectives: [
          '集成音频系统',
          '创建游戏 UI 界面',
          '实现菜单和设置',
          '添加游戏状态管理'
        ]
      },
      7: {
        title: 'Day 7: 优化与发布',
        description: '学习游戏优化技巧和发布流程',
        objectives: [
          '优化游戏性能',
          '处理不同设备适配',
          '学习构建和部署',
          '完成最终游戏项目'
        ]
      }
    }
    
    const dayContent = defaultContent[day]
    if (!dayContent) {
      return {
        day,
        title: `Day ${day}: 课程内容`,
        description: '课程内容正在准备中...',
        objectives: [],
        deliverables: [],
        content: '# 课程内容正在准备中\n\n请稍后查看。',
        htmlContent: '<h1>课程内容正在准备中</h1><p>请稍后查看。</p>'
      }
    }
    
    return {
      day,
      title: dayContent.title,
      description: dayContent.description,
      objectives: dayContent.objectives,
      deliverables: dayContent.deliverables || [],
      estimatedTime: '2-3小时',
      difficulty: '中级',
      content: dayContent.content || `# ${dayContent.title}\n\n${dayContent.description}\n\n## 学习目标\n\n${dayContent.objectives.map(obj => `- ${obj}`).join('\n')}`,
      htmlContent: marked(dayContent.content || `# ${dayContent.title}\n\n${dayContent.description}\n\n## 学习目标\n\n${dayContent.objectives.map(obj => `- ${obj}`).join('\n')}`),
      wordCount: 500,
      readingTime: '5分钟'
    }
  }
  
  // 获取课程内容
  async getCourseContent(day) {
    try {
      const dayNum = parseInt(day)
      if (isNaN(dayNum) || dayNum < 1 || dayNum > 7) {
        throw new Error('无效的课程天数')
      }
      
      return this.courseContent.get(dayNum)
    } catch (error) {
      logger.error('获取课程内容失败:', error)
      throw error
    }
  }
  
  // 获取所有课程概览
  async getCourseOverview() {
    try {
      const overview = []
      
      for (let day = 1; day <= 7; day++) {
        const content = this.courseContent.get(day)
        if (content) {
          overview.push({
            day: content.day,
            title: content.title,
            description: content.description,
            objectives: content.objectives,
            estimatedTime: content.estimatedTime,
            difficulty: content.difficulty,
            wordCount: content.wordCount,
            readingTime: content.readingTime
          })
        }
      }
      
      return overview
    } catch (error) {
      logger.error('获取课程概览失败:', error)
      throw error
    }
  }
  
  // 发送每日课程邮件
  async sendDailyCourseEmails(day) {
    try {
      const courseContent = await this.getCourseContent(day)
      if (!courseContent) {
        throw new Error(`Day ${day} 课程内容不存在`)
      }
      
      // 获取需要接收该天课程的订阅者
      const subscribers = await this.db.all(`
        SELECT * FROM subscribers 
        WHERE status = 'active' 
        AND currentDay < ?
        AND (lastEmailSent IS NULL OR date(lastEmailSent) < date('now'))
      `, [day])
      
      const results = []
      
      for (const subscriber of subscribers) {
        try {
          // 解析订阅者数据
          if (subscriber.preferences) {
            subscriber.preferences = JSON.parse(subscriber.preferences)
          }
          if (subscriber.completedDays) {
            subscriber.completedDays = JSON.parse(subscriber.completedDays)
          }
          
          // 发送课程邮件
          await this.emailService.sendCourseEmail(subscriber, day, courseContent)
          
          // 更新订阅者状态
          await this.db.run(`
            UPDATE subscribers 
            SET currentDay = ?, lastEmailSent = ?, emailsSent = emailsSent + 1
            WHERE id = ?
          `, [day, new Date().toISOString(), subscriber.id])
          
          // 记录发送事件
          await this.db.run(`
            INSERT INTO events (subscriberId, eventType, eventData, timestamp)
            VALUES (?, ?, ?, ?)
          `, [subscriber.id, 'email_sent', JSON.stringify({
            day,
            courseTitle: courseContent.title
          }), new Date().toISOString()])
          
          results.push({
            success: true,
            email: subscriber.email,
            day
          })
          
          // 发送间隔，避免过快发送
          await new Promise(resolve => setTimeout(resolve, 100))
        } catch (error) {
          logger.error(`发送课程邮件失败: ${subscriber.email}`, error)
          results.push({
            success: false,
            email: subscriber.email,
            error: error.message
          })
        }
      }
      
      logger.info(`Day ${day} 课程邮件发送完成: 成功 ${results.filter(r => r.success).length}, 失败 ${results.filter(r => !r.success).length}`)
      return results
    } catch (error) {
      logger.error('发送每日课程邮件失败:', error)
      throw error
    }
  }
  
  // 发送提醒邮件
  async sendReminderEmails() {
    try {
      // 获取3天内没有活动的活跃订阅者
      const subscribers = await this.db.all(`
        SELECT * FROM subscribers 
        WHERE status = 'active' 
        AND (lastActivity IS NULL OR datetime(lastActivity) < datetime('now', '-3 days'))
        AND (lastEmailSent IS NULL OR datetime(lastEmailSent) < datetime('now', '-1 day'))
      `)
      
      const results = []
      
      for (const subscriber of subscribers) {
        try {
          if (subscriber.preferences) {
            subscriber.preferences = JSON.parse(subscriber.preferences)
          }
          
          const currentDay = subscriber.currentDay || 1
          
          // 发送提醒邮件
          await this.emailService.sendReminderEmail(subscriber, currentDay)
          
          // 更新发送记录
          await this.db.run(`
            UPDATE subscribers 
            SET lastEmailSent = ?, emailsSent = emailsSent + 1
            WHERE id = ?
          `, [new Date().toISOString(), subscriber.id])
          
          results.push({
            success: true,
            email: subscriber.email
          })
          
          await new Promise(resolve => setTimeout(resolve, 100))
        } catch (error) {
          logger.error(`发送提醒邮件失败: ${subscriber.email}`, error)
          results.push({
            success: false,
            email: subscriber.email,
            error: error.message
          })
        }
      }
      
      logger.info(`提醒邮件发送完成: 成功 ${results.filter(r => r.success).length}, 失败 ${results.filter(r => !r.success).length}`)
      return results
    } catch (error) {
      logger.error('发送提醒邮件失败:', error)
      throw error
    }
  }
  
  // 记录课程访问
  async recordCourseAccess(subscriberId, day) {
    try {
      await this.db.run(`
        INSERT INTO events (subscriberId, eventType, eventData, timestamp)
        VALUES (?, ?, ?, ?)
      `, [subscriberId, 'course_access', JSON.stringify({ day }), new Date().toISOString()])
      
      // 更新最后活动时间
      await this.db.run(`
        UPDATE subscribers 
        SET lastActivity = ?
        WHERE id = ?
      `, [new Date().toISOString(), subscriberId])
    } catch (error) {
      logger.error('记录课程访问失败:', error)
    }
  }
  
  // 记录课程完成
  async recordCourseCompletion(subscriberId, day) {
    try {
      const subscriber = await this.db.get('SELECT * FROM subscribers WHERE id = ?', [subscriberId])
      if (!subscriber) return
      
      const completedDays = JSON.parse(subscriber.completedDays || '[]')
      if (!completedDays.includes(day)) {
        completedDays.push(day)
        completedDays.sort((a, b) => a - b)
        
        await this.db.run(`
          UPDATE subscribers 
          SET completedDays = ?, lastActivity = ?
          WHERE id = ?
        `, [JSON.stringify(completedDays), new Date().toISOString(), subscriberId])
        
        // 记录完成事件
        await this.db.run(`
          INSERT INTO events (subscriberId, eventType, eventData, timestamp)
          VALUES (?, ?, ?, ?)
        `, [subscriberId, 'course_complete', JSON.stringify({ day }), new Date().toISOString()])
        
        // 检查是否完成所有课程
        if (completedDays.length === 7) {
          await this.handleAllCoursesComplete(subscriberId)
        }
      }
    } catch (error) {
      logger.error('记录课程完成失败:', error)
    }
  }
  
  // 处理所有课程完成
  async handleAllCoursesComplete(subscriberId) {
    try {
      const subscriber = await this.db.get('SELECT * FROM subscribers WHERE id = ?', [subscriberId])
      if (!subscriber) return
      
      // 更新状态为已完成
      await this.db.run(`
        UPDATE subscribers 
        SET status = 'completed', completionDate = ?
        WHERE id = ?
      `, [new Date().toISOString(), subscriberId])
      
      // 发送完成邮件
      try {
        await this.emailService.sendCompletionEmail(subscriber)
      } catch (error) {
        logger.error('发送完成邮件失败:', error)
      }
      
      // 记录完成事件
      await this.db.run(`
        INSERT INTO events (subscriberId, eventType, eventData, timestamp)
        VALUES (?, ?, ?, ?)
      `, [subscriberId, 'all_courses_complete', JSON.stringify({}), new Date().toISOString()])
      
      logger.info(`用户完成所有课程: ${subscriber.email}`)
    } catch (error) {
      logger.error('处理所有课程完成失败:', error)
    }
  }
  
  // 获取课程统计
  async getCourseStats() {
    try {
      const stats = {}
      
      for (let day = 1; day <= 7; day++) {
        const dayStats = await this.db.get(`
          SELECT 
            COUNT(*) as totalSubscribers,
            SUM(CASE WHEN JSON_EXTRACT(completedDays, '$') LIKE '%${day}%' THEN 1 ELSE 0 END) as completedCount
          FROM subscribers 
          WHERE status IN ('active', 'completed')
        `)
        
        stats[`day${day}`] = {
          totalSubscribers: dayStats.totalSubscribers,
          completedCount: dayStats.completedCount,
          completionRate: dayStats.totalSubscribers > 0 
            ? Math.round((dayStats.completedCount / dayStats.totalSubscribers) * 100) 
            : 0
        }
      }
      
      return stats
    } catch (error) {
      logger.error('获取课程统计失败:', error)
      throw error
    }
  }
  
  // 辅助方法
  countWords(text) {
    const plainText = text
      .replace(/```[\s\S]*?```/g, '') // 移除代码块
      .replace(/`[^`]+`/g, '') // 移除行内代码
      .replace(/[#*_~`]/g, '') // 移除 Markdown 标记
    
    const chineseChars = (plainText.match(/[\u4e00-\u9fa5]/g) || []).length
    const englishWords = (plainText.match(/[a-zA-Z]+/g) || []).length
    
    return chineseChars + englishWords
  }
  
  estimateReadingTime(text) {
    const wordCount = this.countWords(text)
    const minutes = Math.ceil(wordCount / 250) // 假设阅读速度为 250 字/分钟
    return `${minutes} 分钟`
  }
}
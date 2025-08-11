#!/usr/bin/env node

import cron from 'node-cron'
import dotenv from 'dotenv'
import { Database } from './database/database.js'
import { EmailService } from './services/emailService.js'
import { CourseService } from './services/courseService.js'
import { SubscriptionService } from './services/subscriptionService.js'
import { logger } from './utils/logger.js'

// 加载环境变量
dotenv.config()

class EmailCourseScheduler {
  constructor() {
    this.database = null
    this.emailService = null
    this.courseService = null
    this.subscriptionService = null
    this.isRunning = false
  }
  
  async initialize() {
    try {
      logger.info('初始化邮件课程调度器...')
      
      // 初始化数据库
      this.database = new Database()
      await this.database.initialize()
      
      // 初始化邮件服务
      this.emailService = new EmailService({
        host: process.env.SMTP_HOST,
        port: process.env.SMTP_PORT,
        secure: process.env.SMTP_SECURE === 'true',
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS
        }
      })
      await this.emailService.initialize()
      
      // 初始化业务服务
      this.subscriptionService = new SubscriptionService(this.database, this.emailService)
      this.courseService = new CourseService(this.database, this.emailService)
      await this.courseService.initialize()
      
      logger.info('邮件课程调度器初始化完成')
    } catch (error) {
      logger.error('调度器初始化失败:', error)
      throw error
    }
  }
  
  start() {
    if (this.isRunning) {
      logger.warn('调度器已在运行中')
      return
    }
    
    this.isRunning = true
    logger.info('启动邮件课程调度器')
    
    // 每日课程邮件发送 - 每天上午9点
    cron.schedule('0 9 * * *', async () => {
      logger.info('开始发送每日课程邮件')
      await this.sendDailyCourseEmails()
    }, {
      timezone: process.env.TIMEZONE || 'Asia/Shanghai'
    })
    
    // 提醒邮件发送 - 每天下午6点
    cron.schedule('0 18 * * *', async () => {
      logger.info('开始发送提醒邮件')
      await this.sendReminderEmails()
    }, {
      timezone: process.env.TIMEZONE || 'Asia/Shanghai'
    })
    
    // 数据库清理 - 每周日凌晨2点
    cron.schedule('0 2 * * 0', async () => {
      logger.info('开始数据库清理')
      await this.performDatabaseCleanup()
    }, {
      timezone: process.env.TIMEZONE || 'Asia/Shanghai'
    })
    
    // 统计报告生成 - 每天凌晨1点
    cron.schedule('0 1 * * *', async () => {
      logger.info('生成每日统计报告')
      await this.generateDailyReport()
    }, {
      timezone: process.env.TIMEZONE || 'Asia/Shanghai'
    })
    
    // 健康检查 - 每小时
    cron.schedule('0 * * * *', async () => {
      await this.performHealthCheck()
    })
    
    logger.info('所有定时任务已启动')
  }
  
  stop() {
    if (!this.isRunning) {
      logger.warn('调度器未在运行')
      return
    }
    
    this.isRunning = false
    cron.destroy()
    logger.info('邮件课程调度器已停止')
  }
  
  // 发送每日课程邮件
  async sendDailyCourseEmails() {
    try {
      const today = new Date()
      const dayOfWeek = today.getDay() // 0 = Sunday, 1 = Monday, etc.
      
      // 跳过周末
      if (dayOfWeek === 0 || dayOfWeek === 6) {
        logger.info('周末跳过课程邮件发送')
        return
      }
      
      // 获取所有活跃订阅者
      const activeSubscribers = await this.database.all(`
        SELECT * FROM subscribers 
        WHERE status = 'active'
        AND (lastEmailSent IS NULL OR date(lastEmailSent) < date('now'))
      `)
      
      logger.info(`找到 ${activeSubscribers.length} 个活跃订阅者`)
      
      const results = {
        total: 0,
        sent: 0,
        failed: 0,
        skipped: 0
      }
      
      for (const subscriber of activeSubscribers) {
        try {
          results.total++
          
          // 解析订阅者数据
          if (subscriber.preferences) {
            subscriber.preferences = JSON.parse(subscriber.preferences)
          }
          if (subscriber.completedDays) {
            subscriber.completedDays = JSON.parse(subscriber.completedDays)
          }
          
          // 确定要发送的课程天数
          const nextDay = subscriber.currentDay + 1
          
          // 检查是否已完成所有课程
          if (nextDay > 7) {
            results.skipped++
            continue
          }
          
          // 检查用户偏好的发送时间
          const userSendTime = subscriber.preferences?.sendTime || '09:00'
          const currentHour = today.getHours()
          const [preferredHour] = userSendTime.split(':').map(Number)
          
          // 如果当前时间不匹配用户偏好，跳过
          if (Math.abs(currentHour - preferredHour) > 1) {
            results.skipped++
            continue
          }
          
          // 发送课程邮件
          await this.courseService.sendDailyCourseEmails(nextDay)
          results.sent++
          
          // 添加发送间隔
          await new Promise(resolve => setTimeout(resolve, 200))
        } catch (error) {
          logger.error(`发送课程邮件失败: ${subscriber.email}`, error)
          results.failed++
        }
      }
      
      logger.info(`每日课程邮件发送完成: 总计 ${results.total}, 成功 ${results.sent}, 失败 ${results.failed}, 跳过 ${results.skipped}`)
      
      // 记录发送统计
      await this.recordEmailStats('daily_course', results)
    } catch (error) {
      logger.error('发送每日课程邮件失败:', error)
    }
  }
  
  // 发送提醒邮件
  async sendReminderEmails() {
    try {
      const results = await this.courseService.sendReminderEmails()
      
      const stats = {
        total: results.length,
        sent: results.filter(r => r.success).length,
        failed: results.filter(r => !r.success).length
      }
      
      logger.info(`提醒邮件发送完成: 总计 ${stats.total}, 成功 ${stats.sent}, 失败 ${stats.failed}`)
      
      // 记录发送统计
      await this.recordEmailStats('reminder', stats)
    } catch (error) {
      logger.error('发送提醒邮件失败:', error)
    }
  }
  
  // 数据库清理
  async performDatabaseCleanup() {
    try {
      const daysToKeep = parseInt(process.env.DATA_RETENTION_DAYS) || 90
      const result = await this.database.cleanup(daysToKeep)
      
      logger.info(`数据库清理完成: 删除 ${result.eventsDeleted} 条事件记录, ${result.emailLogsDeleted} 条邮件记录`)
    } catch (error) {
      logger.error('数据库清理失败:', error)
    }
  }
  
  // 生成每日报告
  async generateDailyReport() {
    try {
      const today = new Date().toISOString().split('T')[0]
      
      // 获取订阅统计
      const subscriptionStats = await this.database.get(`
        SELECT 
          COUNT(*) as total,
          SUM(CASE WHEN status = 'active' THEN 1 ELSE 0 END) as active,
          SUM(CASE WHEN status = 'completed' THEN 1 ELSE 0 END) as completed,
          SUM(CASE WHEN date(subscribeDate) = date('now') THEN 1 ELSE 0 END) as newToday
        FROM subscribers
      `)
      
      // 获取邮件统计
      const emailStats = await this.database.get(`
        SELECT 
          COUNT(*) as totalSent,
          SUM(CASE WHEN status = 'delivered' THEN 1 ELSE 0 END) as delivered,
          SUM(CASE WHEN openedAt IS NOT NULL THEN 1 ELSE 0 END) as opened,
          SUM(CASE WHEN clickedAt IS NOT NULL THEN 1 ELSE 0 END) as clicked
        FROM email_logs 
        WHERE date(sentAt) = date('now')
      `)
      
      // 获取课程进度统计
      const courseStats = {}
      for (let day = 1; day <= 7; day++) {
        const dayStats = await this.database.get(`
          SELECT COUNT(*) as completed
          FROM subscribers 
          WHERE JSON_EXTRACT(completedDays, '$') LIKE '%${day}%'
        `)
        courseStats[`day${day}`] = dayStats.completed
      }
      
      const report = {
        date: today,
        subscription: subscriptionStats,
        email: emailStats,
        course: courseStats,
        generatedAt: new Date().toISOString()
      }
      
      // 保存报告到数据库
      await this.database.run(`
        INSERT INTO events (subscriberId, eventType, eventData, timestamp)
        VALUES (0, 'daily_report', ?, ?)
      `, [JSON.stringify(report), new Date().toISOString()])
      
      logger.info('每日报告生成完成', report)
      
      // 如果配置了管理员邮箱，发送报告
      if (process.env.ADMIN_EMAIL) {
        await this.sendAdminReport(report)
      }
    } catch (error) {
      logger.error('生成每日报告失败:', error)
    }
  }
  
  // 发送管理员报告
  async sendAdminReport(report) {
    try {
      const subject = `邮件课程系统日报 - ${report.date}`
      const content = `
        <h2>邮件课程系统日报</h2>
        <p><strong>日期:</strong> ${report.date}</p>
        
        <h3>订阅统计</h3>
        <ul>
          <li>总订阅者: ${report.subscription.total}</li>
          <li>活跃订阅者: ${report.subscription.active}</li>
          <li>已完成: ${report.subscription.completed}</li>
          <li>今日新增: ${report.subscription.newToday}</li>
        </ul>
        
        <h3>邮件统计</h3>
        <ul>
          <li>今日发送: ${report.email.totalSent}</li>
          <li>成功送达: ${report.email.delivered}</li>
          <li>邮件打开: ${report.email.opened}</li>
          <li>链接点击: ${report.email.clicked}</li>
        </ul>
        
        <h3>课程进度</h3>
        <ul>
          ${Object.entries(report.course).map(([day, count]) => 
            `<li>${day}: ${count} 人完成</li>`
          ).join('')}
        </ul>
        
        <p><em>报告生成时间: ${report.generatedAt}</em></p>
      `
      
      await this.emailService.sendEmail(
        process.env.ADMIN_EMAIL,
        subject,
        'admin-report',
        { content }
      )
      
      logger.info('管理员报告发送成功')
    } catch (error) {
      logger.error('发送管理员报告失败:', error)
    }
  }
  
  // 健康检查
  async performHealthCheck() {
    try {
      // 检查数据库连接
      if (!this.database.isConnected()) {
        logger.error('数据库连接丢失')
        await this.database.initialize()
      }
      
      // 检查邮件服务
      if (!this.emailService.transporter) {
        logger.error('邮件服务连接丢失')
        await this.emailService.initialize()
      }
      
      // 检查磁盘空间
      const stats = await this.database.getStats()
      const maxSize = parseInt(process.env.MAX_DB_SIZE) || 100 * 1024 * 1024 // 100MB
      
      if (stats.size > maxSize) {
        logger.warn(`数据库大小超过限制: ${stats.size} bytes`)
      }
      
      logger.debug('健康检查完成')
    } catch (error) {
      logger.error('健康检查失败:', error)
    }
  }
  
  // 记录邮件统计
  async recordEmailStats(type, stats) {
    try {
      await this.database.run(`
        INSERT INTO events (subscriberId, eventType, eventData, timestamp)
        VALUES (0, 'email_stats', ?, ?)
      `, [JSON.stringify({ type, ...stats }), new Date().toISOString()])
    } catch (error) {
      logger.error('记录邮件统计失败:', error)
    }
  }
  
  // 手动触发任务
  async triggerTask(taskName) {
    logger.info(`手动触发任务: ${taskName}`)
    
    switch (taskName) {
      case 'daily-course':
        await this.sendDailyCourseEmails()
        break
      case 'reminder':
        await this.sendReminderEmails()
        break
      case 'cleanup':
        await this.performDatabaseCleanup()
        break
      case 'report':
        await this.generateDailyReport()
        break
      case 'health-check':
        await this.performHealthCheck()
        break
      default:
        throw new Error(`未知任务: ${taskName}`)
    }
  }
  
  // 获取调度器状态
  getStatus() {
    return {
      isRunning: this.isRunning,
      services: {
        database: !!this.database?.isConnected(),
        email: !!this.emailService?.transporter,
        course: !!this.courseService,
        subscription: !!this.subscriptionService
      },
      nextRuns: cron.getTasks().size > 0 ? 'Active' : 'Inactive'
    }
  }
  
  // 优雅关闭
  async shutdown() {
    logger.info('正在关闭邮件课程调度器...')
    
    this.stop()
    
    if (this.emailService) {
      await this.emailService.close()
    }
    
    if (this.database) {
      await this.database.close()
    }
    
    logger.info('邮件课程调度器已关闭')
  }
}

// 如果直接运行此文件，启动调度器
if (import.meta.url === `file://${process.argv[1]}`) {
  const scheduler = new EmailCourseScheduler()
  
  // 处理命令行参数
  const args = process.argv.slice(2)
  const command = args[0]
  
  if (command === 'trigger' && args[1]) {
    // 手动触发任务
    scheduler.initialize()
      .then(() => scheduler.triggerTask(args[1]))
      .then(() => {
        logger.info('任务执行完成')
        process.exit(0)
      })
      .catch(error => {
        logger.error('任务执行失败:', error)
        process.exit(1)
      })
  } else {
    // 启动调度器
    scheduler.initialize()
      .then(() => {
        scheduler.start()
        
        // 优雅关闭处理
        process.on('SIGTERM', async () => {
          await scheduler.shutdown()
          process.exit(0)
        })
        
        process.on('SIGINT', async () => {
          await scheduler.shutdown()
          process.exit(0)
        })
        
        logger.info('邮件课程调度器已启动，按 Ctrl+C 停止')
      })
      .catch(error => {
        logger.error('启动调度器失败:', error)
        process.exit(1)
      })
  }
}

export { EmailCourseScheduler }
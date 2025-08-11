import nodemailer from 'nodemailer'
import fs from 'fs/promises'
import path from 'path'
import { fileURLToPath } from 'url'
import Handlebars from 'handlebars'
import { marked } from 'marked'
import { logger } from '../utils/logger.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

export class EmailService {
  constructor(config) {
    this.config = config
    this.transporter = null
    this.templates = new Map()
    this.templateDir = path.join(__dirname, '../templates/email')
  }
  
  async initialize() {
    try {
      // 创建邮件传输器
      this.transporter = nodemailer.createTransporter(this.config)
      
      // 验证连接
      await this.transporter.verify()
      logger.info('邮件服务初始化成功')
      
      // 预加载模板
      await this.loadTemplates()
      
      return true
    } catch (error) {
      logger.error('邮件服务初始化失败:', error)
      throw error
    }
  }
  
  async loadTemplates() {
    try {
      const templateFiles = [
        'welcome.hbs',
        'course-day.hbs',
        'reminder.hbs',
        'completion.hbs',
        'unsubscribe-confirm.hbs',
        'feedback-request.hbs'
      ]
      
      for (const file of templateFiles) {
        const templatePath = path.join(this.templateDir, file)
        try {
          const templateContent = await fs.readFile(templatePath, 'utf-8')
          const template = Handlebars.compile(templateContent)
          const templateName = path.basename(file, '.hbs')
          this.templates.set(templateName, template)
        } catch (error) {
          logger.warn(`模板文件不存在: ${templatePath}`)
          // 使用默认模板
          this.templates.set(path.basename(file, '.hbs'), this.getDefaultTemplate(path.basename(file, '.hbs')))
        }
      }
      
      logger.info(`已加载 ${this.templates.size} 个邮件模板`)
    } catch (error) {
      logger.error('加载邮件模板失败:', error)
    }
  }
  
  getDefaultTemplate(templateName) {
    const templates = {
      welcome: Handlebars.compile(`
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #667eea;">欢迎加入 Phaser.js 7天教程！</h1>
          <p>你好 {{name}}，</p>
          <p>感谢你订阅我们的 Phaser.js 7天游戏开发教程！</p>
          <p>在接下来的7天里，你将收到：</p>
          <ul>
            <li>每日精心准备的教程内容</li>
            <li>完整的代码示例和练习</li>
            <li>实用的开发技巧和最佳实践</li>
            <li>一步步构建完整的游戏项目</li>
          </ul>
          <p>第一天的内容将在明天发送给你。</p>
          <p>祝学习愉快！</p>
          <p>Phaser Tutorial Team</p>
          <hr>
          <p style="font-size: 12px; color: #666;">
            如果你不想再收到这些邮件，可以 <a href="{{unsubscribeUrl}}">点击这里退订</a>
          </p>
        </div>
      `),
      
      'course-day': Handlebars.compile(`
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #667eea;">{{title}}</h1>
          <p>你好 {{name}}，</p>
          <p>欢迎来到第 {{day}} 天的学习！</p>
          <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
            {{{content}}}
          </div>
          <p>今天的学习目标：</p>
          <ul>
            {{#each objectives}}
            <li>{{this}}</li>
            {{/each}}
          </ul>
          <p><a href="{{courseUrl}}" style="background: #667eea; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">开始学习</a></p>
          <p>如果你有任何问题，随时回复这封邮件。</p>
          <p>加油！</p>
          <p>Phaser Tutorial Team</p>
          <hr>
          <p style="font-size: 12px; color: #666;">
            <a href="{{unsubscribeUrl}}">退订</a> | <a href="{{feedbackUrl}}">反馈</a>
          </p>
        </div>
      `),
      
      reminder: Handlebars.compile(`
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #f39c12;">别忘了今天的学习！</h1>
          <p>你好 {{name}}，</p>
          <p>我们注意到你还没有完成第 {{day}} 天的学习。</p>
          <p>不要担心，学习需要时间和坚持。每天花一点时间就能看到进步！</p>
          <p><a href="{{courseUrl}}" style="background: #f39c12; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">继续学习</a></p>
          <p>我们相信你能做到！</p>
          <p>Phaser Tutorial Team</p>
        </div>
      `),
      
      completion: Handlebars.compile(`
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #27ae60;">🎉 恭喜完成 Phaser.js 7天教程！</h1>
          <p>你好 {{name}}，</p>
          <p>恭喜你完成了 Phaser.js 7天游戏开发教程！</p>
          <p>在这7天里，你学会了：</p>
          <ul>
            <li>Phaser.js 的核心概念和架构</li>
            <li>精灵、动画和物理系统</li>
            <li>游戏逻辑和用户交互</li>
            <li>音效、UI 和状态管理</li>
            <li>游戏优化和部署</li>
          </ul>
          <p>现在你已经具备了创建自己游戏的能力！</p>
          <p><a href="{{certificateUrl}}" style="background: #27ae60; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">获取完成证书</a></p>
          <p>继续你的游戏开发之旅吧！</p>
          <p>Phaser Tutorial Team</p>
        </div>
      `)
    }
    
    return templates[templateName] || Handlebars.compile('<p>{{content}}</p>')
  }
  
  async sendEmail(to, subject, templateName, data = {}) {
    try {
      if (!this.transporter) {
        await this.initialize()
      }
      
      const template = this.templates.get(templateName)
      if (!template) {
        throw new Error(`邮件模板不存在: ${templateName}`)
      }
      
      // 渲染模板
      const html = template(data)
      
      // 发送邮件
      const mailOptions = {
        from: `"Phaser Tutorial" <${this.config.auth.user}>`,
        to,
        subject,
        html,
        // 添加文本版本
        text: this.htmlToText(html)
      }
      
      const result = await this.transporter.sendMail(mailOptions)
      
      logger.info(`邮件发送成功: ${to} - ${subject}`, {
        messageId: result.messageId,
        template: templateName
      })
      
      return result
    } catch (error) {
      logger.error(`邮件发送失败: ${to} - ${subject}`, error)
      throw error
    }
  }
  
  async sendWelcomeEmail(subscriber) {
    const unsubscribeUrl = `${process.env.BASE_URL}/unsubscribe?token=${subscriber.unsubscribeToken}`
    
    return await this.sendEmail(
      subscriber.email,
      '欢迎加入 Phaser.js 7天教程！',
      'welcome',
      {
        name: subscriber.name,
        email: subscriber.email,
        unsubscribeUrl
      }
    )
  }
  
  async sendCourseEmail(subscriber, day, courseContent) {
    const unsubscribeUrl = `${process.env.BASE_URL}/unsubscribe?token=${subscriber.unsubscribeToken}`
    const courseUrl = `${process.env.BASE_URL}/course/${day}?token=${subscriber.accessToken}`
    const feedbackUrl = `${process.env.BASE_URL}/feedback?token=${subscriber.accessToken}&day=${day}`
    
    // 将 Markdown 内容转换为 HTML
    const htmlContent = marked(courseContent.content)
    
    return await this.sendEmail(
      subscriber.email,
      `Day ${day}: ${courseContent.title}`,
      'course-day',
      {
        name: subscriber.name,
        day,
        title: courseContent.title,
        content: htmlContent,
        objectives: courseContent.objectives,
        courseUrl,
        unsubscribeUrl,
        feedbackUrl
      }
    )
  }
  
  async sendReminderEmail(subscriber, day) {
    const courseUrl = `${process.env.BASE_URL}/course/${day}?token=${subscriber.accessToken}`
    
    return await this.sendEmail(
      subscriber.email,
      `别忘了 Day ${day} 的学习！`,
      'reminder',
      {
        name: subscriber.name,
        day,
        courseUrl
      }
    )
  }
  
  async sendCompletionEmail(subscriber) {
    const certificateUrl = `${process.env.BASE_URL}/certificate?token=${subscriber.accessToken}`
    
    return await this.sendEmail(
      subscriber.email,
      '🎉 恭喜完成 Phaser.js 7天教程！',
      'completion',
      {
        name: subscriber.name,
        certificateUrl
      }
    )
  }
  
  async sendUnsubscribeConfirmation(subscriber) {
    return await this.sendEmail(
      subscriber.email,
      '退订确认',
      'unsubscribe-confirm',
      {
        name: subscriber.name
      }
    )
  }
  
  async sendFeedbackRequest(subscriber, day) {
    const feedbackUrl = `${process.env.BASE_URL}/feedback?token=${subscriber.accessToken}&day=${day}`
    
    return await this.sendEmail(
      subscriber.email,
      `Day ${day} 学习反馈`,
      'feedback-request',
      {
        name: subscriber.name,
        day,
        feedbackUrl
      }
    )
  }
  
  // 批量发送邮件
  async sendBulkEmails(emails) {
    const results = []
    const batchSize = 10 // 每批发送10封邮件
    
    for (let i = 0; i < emails.length; i += batchSize) {
      const batch = emails.slice(i, i + batchSize)
      const batchPromises = batch.map(email => 
        this.sendEmail(email.to, email.subject, email.template, email.data)
          .then(result => ({ success: true, email: email.to, result }))
          .catch(error => ({ success: false, email: email.to, error: error.message }))
      )
      
      const batchResults = await Promise.all(batchPromises)
      results.push(...batchResults)
      
      // 批次间延迟，避免发送过快
      if (i + batchSize < emails.length) {
        await new Promise(resolve => setTimeout(resolve, 1000))
      }
    }
    
    return results
  }
  
  // HTML 转文本
  htmlToText(html) {
    return html
      .replace(/<[^>]*>/g, '') // 移除 HTML 标签
      .replace(/&nbsp;/g, ' ') // 替换空格实体
      .replace(/&amp;/g, '&') // 替换 & 实体
      .replace(/&lt;/g, '<') // 替换 < 实体
      .replace(/&gt;/g, '>') // 替换 > 实体
      .replace(/\s+/g, ' ') // 压缩空白字符
      .trim()
  }
  
  // 验证邮箱地址
  validateEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
  }
  
  // 获取发送统计
  async getEmailStats() {
    // 这里可以集成第三方邮件服务的统计 API
    return {
      sent: 0,
      delivered: 0,
      opened: 0,
      clicked: 0,
      bounced: 0,
      complained: 0
    }
  }
  
  // 关闭连接
  async close() {
    if (this.transporter) {
      this.transporter.close()
      this.transporter = null
    }
  }
}
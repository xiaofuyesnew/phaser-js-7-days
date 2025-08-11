import crypto from 'crypto'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import validator from 'validator'
import { logger } from '../utils/logger.js'

export class SubscriptionService {
  constructor(database, emailService) {
    this.db = database
    this.emailService = emailService
  }
  
  // 创建订阅
  async subscribe(email, name, preferences = {}) {
    try {
      // 验证邮箱
      if (!validator.isEmail(email)) {
        throw new Error('邮箱格式无效')
      }
      
      // 检查是否已订阅
      const existing = await this.getSubscriberByEmail(email)
      if (existing && existing.status === 'active') {
        throw new Error('该邮箱已订阅')
      }
      
      // 生成令牌
      const unsubscribeToken = this.generateToken()
      const accessToken = this.generateAccessToken(email)
      
      // 创建订阅记录
      const subscriber = {
        email: email.toLowerCase().trim(),
        name: name.trim(),
        status: 'active',
        subscribeDate: new Date().toISOString(),
        unsubscribeToken,
        accessToken,
        preferences: JSON.stringify({
          timezone: preferences.timezone || 'Asia/Shanghai',
          sendTime: preferences.sendTime || '09:00',
          language: preferences.language || 'zh-CN',
          ...preferences
        }),
        currentDay: 0,
        completedDays: JSON.stringify([]),
        lastEmailSent: null,
        emailsSent: 0,
        emailsOpened: 0,
        emailsClicked: 0
      }
      
      // 如果已存在但已退订，则更新记录
      if (existing) {
        await this.updateSubscriber(existing.id, subscriber)
        subscriber.id = existing.id
      } else {
        const result = await this.db.run(`
          INSERT INTO subscribers (
            email, name, status, subscribeDate, unsubscribeToken, accessToken,
            preferences, currentDay, completedDays, lastEmailSent,
            emailsSent, emailsOpened, emailsClicked
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `, [
          subscriber.email, subscriber.name, subscriber.status, subscriber.subscribeDate,
          subscriber.unsubscribeToken, subscriber.accessToken, subscriber.preferences,
          subscriber.currentDay, subscriber.completedDays, subscriber.lastEmailSent,
          subscriber.emailsSent, subscriber.emailsOpened, subscriber.emailsClicked
        ])
        
        subscriber.id = result.lastID
      }
      
      // 发送欢迎邮件
      try {
        await this.emailService.sendWelcomeEmail(subscriber)
        await this.updateEmailStats(subscriber.id, 'sent')
      } catch (error) {
        logger.error('发送欢迎邮件失败:', error)
        // 不抛出错误，订阅仍然成功
      }
      
      // 记录订阅事件
      await this.logEvent(subscriber.id, 'subscribe', {
        email: subscriber.email,
        name: subscriber.name
      })
      
      logger.info(`新订阅: ${email}`)
      return subscriber
    } catch (error) {
      logger.error('创建订阅失败:', error)
      throw error
    }
  }
  
  // 取消订阅
  async unsubscribe(token, reason = '') {
    try {
      const subscriber = await this.getSubscriberByToken(token)
      if (!subscriber) {
        throw new Error('无效的退订链接')
      }
      
      if (subscriber.status === 'unsubscribed') {
        return subscriber // 已经退订
      }
      
      // 更新状态
      await this.updateSubscriber(subscriber.id, {
        status: 'unsubscribed',
        unsubscribeDate: new Date().toISOString(),
        unsubscribeReason: reason
      })
      
      // 发送退订确认邮件
      try {
        await this.emailService.sendUnsubscribeConfirmation(subscriber)
      } catch (error) {
        logger.error('发送退订确认邮件失败:', error)
      }
      
      // 记录退订事件
      await this.logEvent(subscriber.id, 'unsubscribe', {
        reason
      })
      
      logger.info(`用户退订: ${subscriber.email}`)
      return subscriber
    } catch (error) {
      logger.error('退订失败:', error)
      throw error
    }
  }
  
  // 重新订阅
  async resubscribe(email) {
    try {
      const subscriber = await this.getSubscriberByEmail(email)
      if (!subscriber) {
        throw new Error('订阅记录不存在')
      }
      
      if (subscriber.status === 'active') {
        return subscriber // 已经是活跃状态
      }
      
      // 重新激活
      await this.updateSubscriber(subscriber.id, {
        status: 'active',
        resubscribeDate: new Date().toISOString()
      })
      
      // 记录重新订阅事件
      await this.logEvent(subscriber.id, 'resubscribe')
      
      logger.info(`用户重新订阅: ${email}`)
      return subscriber
    } catch (error) {
      logger.error('重新订阅失败:', error)
      throw error
    }
  }
  
  // 更新学习进度
  async updateProgress(subscriberId, day, completed = true) {
    try {
      const subscriber = await this.getSubscriberById(subscriberId)
      if (!subscriber) {
        throw new Error('订阅者不存在')
      }
      
      const completedDays = JSON.parse(subscriber.completedDays || '[]')
      
      if (completed && !completedDays.includes(day)) {
        completedDays.push(day)
        completedDays.sort((a, b) => a - b)
      } else if (!completed) {
        const index = completedDays.indexOf(day)
        if (index > -1) {
          completedDays.splice(index, 1)
        }
      }
      
      const currentDay = Math.max(subscriber.currentDay, day)
      
      await this.updateSubscriber(subscriberId, {
        currentDay,
        completedDays: JSON.stringify(completedDays),
        lastActivity: new Date().toISOString()
      })
      
      // 记录进度事件
      await this.logEvent(subscriberId, 'progress', {
        day,
        completed,
        totalCompleted: completedDays.length
      })
      
      // 检查是否完成所有课程
      if (completedDays.length === 7) {
        await this.handleCourseCompletion(subscriberId)
      }
      
      return { currentDay, completedDays }
    } catch (error) {
      logger.error('更新学习进度失败:', error)
      throw error
    }
  }
  
  // 处理课程完成
  async handleCourseCompletion(subscriberId) {
    try {
      const subscriber = await this.getSubscriberById(subscriberId)
      if (!subscriber) return
      
      // 更新完成状态
      await this.updateSubscriber(subscriberId, {
        status: 'completed',
        completionDate: new Date().toISOString()
      })
      
      // 发送完成邮件
      try {
        await this.emailService.sendCompletionEmail(subscriber)
        await this.updateEmailStats(subscriberId, 'sent')
      } catch (error) {
        logger.error('发送完成邮件失败:', error)
      }
      
      // 记录完成事件
      await this.logEvent(subscriberId, 'complete')
      
      logger.info(`用户完成课程: ${subscriber.email}`)
    } catch (error) {
      logger.error('处理课程完成失败:', error)
    }
  }
  
  // 获取订阅者信息
  async getSubscriberById(id) {
    try {
      const subscriber = await this.db.get('SELECT * FROM subscribers WHERE id = ?', [id])
      if (subscriber && subscriber.preferences) {
        subscriber.preferences = JSON.parse(subscriber.preferences)
      }
      if (subscriber && subscriber.completedDays) {
        subscriber.completedDays = JSON.parse(subscriber.completedDays)
      }
      return subscriber
    } catch (error) {
      logger.error('获取订阅者失败:', error)
      throw error
    }
  }
  
  async getSubscriberByEmail(email) {
    try {
      const subscriber = await this.db.get('SELECT * FROM subscribers WHERE email = ?', [email.toLowerCase()])
      if (subscriber && subscriber.preferences) {
        subscriber.preferences = JSON.parse(subscriber.preferences)
      }
      if (subscriber && subscriber.completedDays) {
        subscriber.completedDays = JSON.parse(subscriber.completedDays)
      }
      return subscriber
    } catch (error) {
      logger.error('获取订阅者失败:', error)
      throw error
    }
  }
  
  async getSubscriberByToken(token) {
    try {
      const subscriber = await this.db.get('SELECT * FROM subscribers WHERE unsubscribeToken = ?', [token])
      if (subscriber && subscriber.preferences) {
        subscriber.preferences = JSON.parse(subscriber.preferences)
      }
      if (subscriber && subscriber.completedDays) {
        subscriber.completedDays = JSON.parse(subscriber.completedDays)
      }
      return subscriber
    } catch (error) {
      logger.error('获取订阅者失败:', error)
      throw error
    }
  }
  
  async getSubscriberByAccessToken(token) {
    try {
      // 验证 JWT token
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'default-secret')
      return await this.getSubscriberByEmail(decoded.email)
    } catch (error) {
      logger.error('验证访问令牌失败:', error)
      return null
    }
  }
  
  // 更新订阅者信息
  async updateSubscriber(id, updates) {
    try {
      const fields = Object.keys(updates).map(key => `${key} = ?`).join(', ')
      const values = Object.values(updates)
      values.push(id)
      
      await this.db.run(`UPDATE subscribers SET ${fields} WHERE id = ?`, values)
    } catch (error) {
      logger.error('更新订阅者失败:', error)
      throw error
    }
  }
  
  // 获取活跃订阅者列表
  async getActiveSubscribers(limit = 100, offset = 0) {
    try {
      const subscribers = await this.db.all(`
        SELECT * FROM subscribers 
        WHERE status = 'active' 
        ORDER BY subscribeDate DESC 
        LIMIT ? OFFSET ?
      `, [limit, offset])
      
      return subscribers.map(subscriber => {
        if (subscriber.preferences) {
          subscriber.preferences = JSON.parse(subscriber.preferences)
        }
        if (subscriber.completedDays) {
          subscriber.completedDays = JSON.parse(subscriber.completedDays)
        }
        return subscriber
      })
    } catch (error) {
      logger.error('获取活跃订阅者失败:', error)
      throw error
    }
  }
  
  // 获取需要发送邮件的订阅者
  async getSubscribersForDay(day) {
    try {
      const subscribers = await this.db.all(`
        SELECT * FROM subscribers 
        WHERE status = 'active' 
        AND currentDay < ? 
        AND (lastEmailSent IS NULL OR date(lastEmailSent) < date('now'))
      `, [day])
      
      return subscribers.map(subscriber => {
        if (subscriber.preferences) {
          subscriber.preferences = JSON.parse(subscriber.preferences)
        }
        if (subscriber.completedDays) {
          subscriber.completedDays = JSON.parse(subscriber.completedDays)
        }
        return subscriber
      })
    } catch (error) {
      logger.error('获取待发送邮件订阅者失败:', error)
      throw error
    }
  }
  
  // 更新邮件统计
  async updateEmailStats(subscriberId, action) {
    try {
      const updates = {}
      
      switch (action) {
        case 'sent':
          updates.emailsSent = 'emailsSent + 1'
          updates.lastEmailSent = new Date().toISOString()
          break
        case 'opened':
          updates.emailsOpened = 'emailsOpened + 1'
          break
        case 'clicked':
          updates.emailsClicked = 'emailsClicked + 1'
          break
      }
      
      if (Object.keys(updates).length > 0) {
        const fields = Object.keys(updates).map(key => 
          typeof updates[key] === 'string' && updates[key].includes('+') 
            ? `${key} = ${updates[key]}`
            : `${key} = ?`
        ).join(', ')
        
        const values = Object.values(updates).filter(value => 
          !(typeof value === 'string' && value.includes('+'))
        )
        values.push(subscriberId)
        
        await this.db.run(`UPDATE subscribers SET ${fields} WHERE id = ?`, values)
      }
    } catch (error) {
      logger.error('更新邮件统计失败:', error)
    }
  }
  
  // 记录事件
  async logEvent(subscriberId, eventType, data = {}) {
    try {
      await this.db.run(`
        INSERT INTO events (subscriberId, eventType, eventData, timestamp)
        VALUES (?, ?, ?, ?)
      `, [subscriberId, eventType, JSON.stringify(data), new Date().toISOString()])
    } catch (error) {
      logger.error('记录事件失败:', error)
    }
  }
  
  // 生成令牌
  generateToken() {
    return crypto.randomBytes(32).toString('hex')
  }
  
  // 生成访问令牌
  generateAccessToken(email) {
    return jwt.sign(
      { email, type: 'access' },
      process.env.JWT_SECRET || 'default-secret',
      { expiresIn: '30d' }
    )
  }
  
  // 获取订阅统计
  async getSubscriptionStats() {
    try {
      const stats = await this.db.get(`
        SELECT 
          COUNT(*) as total,
          SUM(CASE WHEN status = 'active' THEN 1 ELSE 0 END) as active,
          SUM(CASE WHEN status = 'unsubscribed' THEN 1 ELSE 0 END) as unsubscribed,
          SUM(CASE WHEN status = 'completed' THEN 1 ELSE 0 END) as completed,
          SUM(CASE WHEN date(subscribeDate) = date('now') THEN 1 ELSE 0 END) as todaySubscriptions
        FROM subscribers
      `)
      
      return stats
    } catch (error) {
      logger.error('获取订阅统计失败:', error)
      throw error
    }
  }
}
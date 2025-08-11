import sqlite3 from 'sqlite3'
import path from 'path'
import { fileURLToPath } from 'url'
import fs from 'fs/promises'
import { logger } from '../utils/logger.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

export class Database {
  constructor(dbPath = null) {
    this.dbPath = dbPath || path.join(__dirname, '../../data/email-course.db')
    this.db = null
  }
  
  async initialize() {
    try {
      // 确保数据目录存在
      const dataDir = path.dirname(this.dbPath)
      await fs.mkdir(dataDir, { recursive: true })
      
      // 创建数据库连接
      this.db = new sqlite3.Database(this.dbPath)
      
      // 启用外键约束
      await this.run('PRAGMA foreign_keys = ON')
      
      // 创建表结构
      await this.createTables()
      
      logger.info(`数据库初始化完成: ${this.dbPath}`)
    } catch (error) {
      logger.error('数据库初始化失败:', error)
      throw error
    }
  }
  
  async createTables() {
    try {
      // 订阅者表
      await this.run(`
        CREATE TABLE IF NOT EXISTS subscribers (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          email TEXT UNIQUE NOT NULL,
          name TEXT NOT NULL,
          status TEXT NOT NULL DEFAULT 'active',
          subscribeDate TEXT NOT NULL,
          unsubscribeDate TEXT,
          unsubscribeReason TEXT,
          resubscribeDate TEXT,
          completionDate TEXT,
          unsubscribeToken TEXT UNIQUE NOT NULL,
          accessToken TEXT NOT NULL,
          preferences TEXT,
          currentDay INTEGER DEFAULT 0,
          completedDays TEXT DEFAULT '[]',
          lastEmailSent TEXT,
          lastActivity TEXT,
          emailsSent INTEGER DEFAULT 0,
          emailsOpened INTEGER DEFAULT 0,
          emailsClicked INTEGER DEFAULT 0,
          createdAt TEXT DEFAULT CURRENT_TIMESTAMP,
          updatedAt TEXT DEFAULT CURRENT_TIMESTAMP
        )
      `)
      
      // 事件日志表
      await this.run(`
        CREATE TABLE IF NOT EXISTS events (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          subscriberId INTEGER NOT NULL,
          eventType TEXT NOT NULL,
          eventData TEXT,
          timestamp TEXT NOT NULL,
          ipAddress TEXT,
          userAgent TEXT,
          FOREIGN KEY (subscriberId) REFERENCES subscribers (id) ON DELETE CASCADE
        )
      `)
      
      // 邮件模板表
      await this.run(`
        CREATE TABLE IF NOT EXISTS email_templates (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          name TEXT UNIQUE NOT NULL,
          subject TEXT NOT NULL,
          content TEXT NOT NULL,
          type TEXT NOT NULL DEFAULT 'html',
          isActive INTEGER DEFAULT 1,
          createdAt TEXT DEFAULT CURRENT_TIMESTAMP,
          updatedAt TEXT DEFAULT CURRENT_TIMESTAMP
        )
      `)
      
      // 邮件发送记录表
      await this.run(`
        CREATE TABLE IF NOT EXISTS email_logs (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          subscriberId INTEGER NOT NULL,
          templateName TEXT NOT NULL,
          subject TEXT NOT NULL,
          status TEXT NOT NULL DEFAULT 'pending',
          sentAt TEXT,
          deliveredAt TEXT,
          openedAt TEXT,
          clickedAt TEXT,
          bouncedAt TEXT,
          errorMessage TEXT,
          messageId TEXT,
          FOREIGN KEY (subscriberId) REFERENCES subscribers (id) ON DELETE CASCADE
        )
      `)
      
      // 反馈表
      await this.run(`
        CREATE TABLE IF NOT EXISTS feedback (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          subscriberId INTEGER NOT NULL,
          day INTEGER,
          rating INTEGER,
          comment TEXT,
          suggestions TEXT,
          createdAt TEXT DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (subscriberId) REFERENCES subscribers (id) ON DELETE CASCADE
        )
      `)
      
      // 管理员表
      await this.run(`
        CREATE TABLE IF NOT EXISTS admins (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          username TEXT UNIQUE NOT NULL,
          email TEXT UNIQUE NOT NULL,
          passwordHash TEXT NOT NULL,
          role TEXT NOT NULL DEFAULT 'admin',
          isActive INTEGER DEFAULT 1,
          lastLoginAt TEXT,
          createdAt TEXT DEFAULT CURRENT_TIMESTAMP,
          updatedAt TEXT DEFAULT CURRENT_TIMESTAMP
        )
      `)
      
      // 系统设置表
      await this.run(`
        CREATE TABLE IF NOT EXISTS settings (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          key TEXT UNIQUE NOT NULL,
          value TEXT NOT NULL,
          description TEXT,
          type TEXT DEFAULT 'string',
          updatedAt TEXT DEFAULT CURRENT_TIMESTAMP
        )
      `)
      
      // 创建索引
      await this.createIndexes()
      
      logger.info('数据库表结构创建完成')
    } catch (error) {
      logger.error('创建数据库表失败:', error)
      throw error
    }
  }
  
  async createIndexes() {
    try {
      const indexes = [
        'CREATE INDEX IF NOT EXISTS idx_subscribers_email ON subscribers (email)',
        'CREATE INDEX IF NOT EXISTS idx_subscribers_status ON subscribers (status)',
        'CREATE INDEX IF NOT EXISTS idx_subscribers_subscribe_date ON subscribers (subscribeDate)',
        'CREATE INDEX IF NOT EXISTS idx_subscribers_unsubscribe_token ON subscribers (unsubscribeToken)',
        'CREATE INDEX IF NOT EXISTS idx_events_subscriber_id ON events (subscriberId)',
        'CREATE INDEX IF NOT EXISTS idx_events_type ON events (eventType)',
        'CREATE INDEX IF NOT EXISTS idx_events_timestamp ON events (timestamp)',
        'CREATE INDEX IF NOT EXISTS idx_email_logs_subscriber_id ON email_logs (subscriberId)',
        'CREATE INDEX IF NOT EXISTS idx_email_logs_status ON email_logs (status)',
        'CREATE INDEX IF NOT EXISTS idx_feedback_subscriber_id ON feedback (subscriberId)',
        'CREATE INDEX IF NOT EXISTS idx_feedback_day ON feedback (day)'
      ]
      
      for (const indexSql of indexes) {
        await this.run(indexSql)
      }
      
      logger.info('数据库索引创建完成')
    } catch (error) {
      logger.error('创建数据库索引失败:', error)
    }
  }
  
  // 包装 sqlite3 方法为 Promise
  run(sql, params = []) {
    return new Promise((resolve, reject) => {
      this.db.run(sql, params, function(err) {
        if (err) {
          reject(err)
        } else {
          resolve({ lastID: this.lastID, changes: this.changes })
        }
      })
    })
  }
  
  get(sql, params = []) {
    return new Promise((resolve, reject) => {
      this.db.get(sql, params, (err, row) => {
        if (err) {
          reject(err)
        } else {
          resolve(row)
        }
      })
    })
  }
  
  all(sql, params = []) {
    return new Promise((resolve, reject) => {
      this.db.all(sql, params, (err, rows) => {
        if (err) {
          reject(err)
        } else {
          resolve(rows)
        }
      })
    })
  }
  
  // 事务支持
  async transaction(callback) {
    try {
      await this.run('BEGIN TRANSACTION')
      const result = await callback(this)
      await this.run('COMMIT')
      return result
    } catch (error) {
      await this.run('ROLLBACK')
      throw error
    }
  }
  
  // 批量插入
  async batchInsert(tableName, records) {
    if (!records || records.length === 0) return []
    
    const keys = Object.keys(records[0])
    const placeholders = keys.map(() => '?').join(', ')
    const sql = `INSERT INTO ${tableName} (${keys.join(', ')}) VALUES (${placeholders})`
    
    const results = []
    
    await this.transaction(async () => {
      for (const record of records) {
        const values = keys.map(key => record[key])
        const result = await this.run(sql, values)
        results.push(result)
      }
    })
    
    return results
  }
  
  // 批量更新
  async batchUpdate(tableName, records, keyField = 'id') {
    if (!records || records.length === 0) return []
    
    const results = []
    
    await this.transaction(async () => {
      for (const record of records) {
        const { [keyField]: keyValue, ...updates } = record
        const keys = Object.keys(updates)
        const setClause = keys.map(key => `${key} = ?`).join(', ')
        const sql = `UPDATE ${tableName} SET ${setClause} WHERE ${keyField} = ?`
        const values = [...keys.map(key => updates[key]), keyValue]
        
        const result = await this.run(sql, values)
        results.push(result)
      }
    })
    
    return results
  }
  
  // 数据库备份
  async backup(backupPath) {
    try {
      const backupDb = new sqlite3.Database(backupPath)
      
      return new Promise((resolve, reject) => {
        this.db.backup(backupDb, (err) => {
          backupDb.close()
          if (err) {
            reject(err)
          } else {
            resolve(backupPath)
          }
        })
      })
    } catch (error) {
      logger.error('数据库备份失败:', error)
      throw error
    }
  }
  
  // 数据库优化
  async optimize() {
    try {
      await this.run('VACUUM')
      await this.run('ANALYZE')
      logger.info('数据库优化完成')
    } catch (error) {
      logger.error('数据库优化失败:', error)
      throw error
    }
  }
  
  // 获取数据库统计信息
  async getStats() {
    try {
      const stats = {}
      
      // 表统计
      const tables = ['subscribers', 'events', 'email_logs', 'feedback']
      for (const table of tables) {
        const result = await this.get(`SELECT COUNT(*) as count FROM ${table}`)
        stats[table] = result.count
      }
      
      // 数据库大小
      const sizeResult = await this.get('PRAGMA page_count')
      const pageSizeResult = await this.get('PRAGMA page_size')
      stats.size = sizeResult.page_count * pageSizeResult.page_size
      
      return stats
    } catch (error) {
      logger.error('获取数据库统计失败:', error)
      throw error
    }
  }
  
  // 清理旧数据
  async cleanup(daysToKeep = 90) {
    try {
      const cutoffDate = new Date()
      cutoffDate.setDate(cutoffDate.getDate() - daysToKeep)
      const cutoffISO = cutoffDate.toISOString()
      
      // 清理旧事件日志
      const eventsResult = await this.run(`
        DELETE FROM events 
        WHERE timestamp < ? 
        AND eventType NOT IN ('subscribe', 'unsubscribe', 'complete')
      `, [cutoffISO])
      
      // 清理旧邮件日志
      const emailLogsResult = await this.run(`
        DELETE FROM email_logs 
        WHERE sentAt < ?
      `, [cutoffISO])
      
      logger.info(`数据清理完成: 删除 ${eventsResult.changes} 条事件记录, ${emailLogsResult.changes} 条邮件记录`)
      
      // 优化数据库
      await this.optimize()
      
      return {
        eventsDeleted: eventsResult.changes,
        emailLogsDeleted: emailLogsResult.changes
      }
    } catch (error) {
      logger.error('数据库清理失败:', error)
      throw error
    }
  }
  
  // 关闭数据库连接
  async close() {
    return new Promise((resolve, reject) => {
      if (this.db) {
        this.db.close((err) => {
          if (err) {
            reject(err)
          } else {
            this.db = null
            resolve()
          }
        })
      } else {
        resolve()
      }
    })
  }
  
  // 检查数据库连接
  isConnected() {
    return this.db !== null
  }
  
  // 执行原始 SQL
  async query(sql, params = []) {
    try {
      if (sql.trim().toLowerCase().startsWith('select')) {
        return await this.all(sql, params)
      } else {
        return await this.run(sql, params)
      }
    } catch (error) {
      logger.error('执行 SQL 查询失败:', error)
      throw error
    }
  }
}
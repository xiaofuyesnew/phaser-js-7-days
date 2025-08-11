import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import { fileURLToPath } from 'url'
import path from 'path'
import dotenv from 'dotenv'

import { Database } from './database/database.js'
import { EmailService } from './services/emailService.js'
import { SubscriptionService } from './services/subscriptionService.js'
import { CourseService } from './services/courseService.js'
import { AnalyticsService } from './services/analyticsService.js'
import { rateLimiter } from './middleware/rateLimiter.js'
import { logger } from './utils/logger.js'

// 路由
import authRoutes from './routes/auth.js'
import subscriptionRoutes from './routes/subscription.js'
import courseRoutes from './routes/course.js'
import analyticsRoutes from './routes/analytics.js'
import adminRoutes from './routes/admin.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// 加载环境变量
dotenv.config()

const app = express()
const port = process.env.PORT || 3002

// 中间件
app.use(helmet())
app.use(cors({
  origin: process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:3000'],
  credentials: true
}))
app.use(express.json({ limit: '10mb' }))
app.use(express.urlencoded({ extended: true, limit: '10mb' }))
app.use(express.static(path.join(__dirname, '../public')))

// 速率限制
app.use('/api/', rateLimiter)

// 请求日志
app.use((req, res, next) => {
  logger.info(`${req.method} ${req.path}`, {
    ip: req.ip,
    userAgent: req.get('User-Agent')
  })
  next()
})

// 服务实例
let database = null
let emailService = null
let subscriptionService = null
let courseService = null
let analyticsService = null

// 初始化服务
async function initializeServices() {
  try {
    // 初始化数据库
    database = new Database()
    await database.initialize()
    
    // 初始化邮件服务
    emailService = new EmailService({
      host: process.env.SMTP_HOST,
      port: process.env.SMTP_PORT,
      secure: process.env.SMTP_SECURE === 'true',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
      }
    })
    
    // 初始化业务服务
    subscriptionService = new SubscriptionService(database, emailService)
    courseService = new CourseService(database, emailService)
    analyticsService = new AnalyticsService(database)
    
    // 将服务实例添加到 app 中，供路由使用
    app.locals.services = {
      database,
      emailService,
      subscriptionService,
      courseService,
      analyticsService
    }
    
    logger.info('所有服务初始化完成')
  } catch (error) {
    logger.error('服务初始化失败:', error)
    process.exit(1)
  }
}

// API 路由
app.use('/api/auth', authRoutes)
app.use('/api/subscription', subscriptionRoutes)
app.use('/api/course', courseRoutes)
app.use('/api/analytics', analyticsRoutes)
app.use('/api/admin', adminRoutes)

// 健康检查
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    services: {
      database: !!database,
      email: !!emailService,
      subscription: !!subscriptionService,
      course: !!courseService,
      analytics: !!analyticsService
    }
  })
})

// 首页
app.get('/', (req, res) => {
  res.json({
    name: 'Phaser.js 教程邮件课程系统',
    version: '1.0.0',
    description: '7天掌握 Phaser.js 游戏开发',
    endpoints: {
      subscription: '/api/subscription',
      course: '/api/course',
      analytics: '/api/analytics',
      admin: '/api/admin'
    }
  })
})

// 订阅页面
app.get('/subscribe', (req, res) => {
  res.sendFile(path.join(__dirname, '../public/subscribe.html'))
})

// 退订页面
app.get('/unsubscribe', (req, res) => {
  res.sendFile(path.join(__dirname, '../public/unsubscribe.html'))
})

// 课程内容预览
app.get('/preview/:day', async (req, res) => {
  try {
    const { day } = req.params
    const courseContent = await courseService.getCourseContent(day)
    
    if (!courseContent) {
      return res.status(404).json({ error: '课程内容不存在' })
    }
    
    res.json(courseContent)
  } catch (error) {
    logger.error('获取课程预览失败:', error)
    res.status(500).json({ error: '服务器错误' })
  }
})

// 错误处理中间件
app.use((error, req, res, next) => {
  logger.error('服务器错误:', error)
  
  if (error.name === 'ValidationError') {
    return res.status(400).json({
      error: '数据验证失败',
      details: error.message
    })
  }
  
  if (error.name === 'UnauthorizedError') {
    return res.status(401).json({
      error: '未授权访问'
    })
  }
  
  res.status(500).json({
    error: '内部服务器错误',
    message: process.env.NODE_ENV === 'development' ? error.message : '服务暂时不可用'
  })
})

// 404 处理
app.use((req, res) => {
  res.status(404).json({
    error: '接口不存在',
    path: req.path,
    method: req.method
  })
})

// 启动服务器
async function startServer() {
  try {
    await initializeServices()
    
    app.listen(port, () => {
      logger.info(`邮件课程服务器运行在 http://localhost:${port}`)
      logger.info(`订阅页面: http://localhost:${port}/subscribe`)
      logger.info(`API 文档: http://localhost:${port}/api/docs`)
    })
  } catch (error) {
    logger.error('启动服务器失败:', error)
    process.exit(1)
  }
}

// 优雅关闭
async function gracefulShutdown(signal) {
  logger.info(`收到 ${signal} 信号，正在关闭服务器...`)
  
  try {
    if (database) {
      await database.close()
    }
    
    if (emailService) {
      await emailService.close()
    }
    
    logger.info('服务器已优雅关闭')
    process.exit(0)
  } catch (error) {
    logger.error('关闭服务器时出错:', error)
    process.exit(1)
  }
}

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'))
process.on('SIGINT', () => gracefulShutdown('SIGINT'))

// 未处理的错误
process.on('unhandledRejection', (reason, promise) => {
  logger.error('未处理的 Promise 拒绝:', reason)
})

process.on('uncaughtException', (error) => {
  logger.error('未捕获的异常:', error)
  process.exit(1)
})

// 启动服务器
startServer()

export default app
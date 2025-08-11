import express from 'express'
import fs from 'fs-extra'
import path from 'path'
import { fileURLToPath } from 'url'
import { PDFGenerator } from './generator.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const app = express()
const port = process.env.PORT || 3001

// 中间件
app.use(express.json({ limit: '50mb' }))
app.use(express.urlencoded({ extended: true, limit: '50mb' }))
app.use(express.static(path.join(__dirname, '../public')))

// CORS 支持
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*')
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization')
  
  if (req.method === 'OPTIONS') {
    res.sendStatus(200)
  } else {
    next()
  }
})

// PDF 生成器实例
let pdfGenerator = null

// 初始化 PDF 生成器
async function initializePDFGenerator() {
  if (!pdfGenerator) {
    pdfGenerator = new PDFGenerator({
      outputDir: path.join(__dirname, '../output')
    })
    await pdfGenerator.initialize()
  }
  return pdfGenerator
}

// API 路由

// 健康检查
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() })
})

// 从 Markdown 内容生成 PDF
app.post('/api/generate/markdown', async (req, res) => {
  try {
    const { content, options = {} } = req.body
    
    if (!content) {
      return res.status(400).json({ error: '缺少 Markdown 内容' })
    }
    
    const generator = await initializePDFGenerator()
    
    // 创建临时文件
    const tempDir = path.join(__dirname, '../temp')
    await fs.ensureDir(tempDir)
    
    const tempMarkdownFile = path.join(tempDir, `temp-${Date.now()}.md`)
    const outputFile = path.join(tempDir, `output-${Date.now()}.pdf`)
    
    try {
      // 写入临时 Markdown 文件
      await fs.writeFile(tempMarkdownFile, content, 'utf-8')
      
      // 生成 PDF
      await generator.generateFromMarkdown(tempMarkdownFile, outputFile, options)
      
      // 读取生成的 PDF
      const pdfBuffer = await fs.readFile(outputFile)
      
      // 设置响应头
      res.setHeader('Content-Type', 'application/pdf')
      res.setHeader('Content-Disposition', `attachment; filename="${options.filename || 'document.pdf'}"`)
      res.setHeader('Content-Length', pdfBuffer.length)
      
      // 发送 PDF
      res.send(pdfBuffer)
      
      // 清理临时文件
      await fs.remove(tempMarkdownFile)
      await fs.remove(outputFile)
    } catch (error) {
      // 清理临时文件
      await fs.remove(tempMarkdownFile).catch(() => {})
      await fs.remove(outputFile).catch(() => {})
      throw error
    }
  } catch (error) {
    console.error('生成 PDF 失败:', error)
    res.status(500).json({ error: error.message })
  }
})

// 从文件路径生成 PDF
app.post('/api/generate/file', async (req, res) => {
  try {
    const { filePath, options = {} } = req.body
    
    if (!filePath) {
      return res.status(400).json({ error: '缺少文件路径' })
    }
    
    // 检查文件是否存在
    if (!await fs.pathExists(filePath)) {
      return res.status(404).json({ error: '文件不存在' })
    }
    
    const generator = await initializePDFGenerator()
    
    const tempDir = path.join(__dirname, '../temp')
    await fs.ensureDir(tempDir)
    
    const outputFile = path.join(tempDir, `output-${Date.now()}.pdf`)
    
    try {
      // 生成 PDF
      await generator.generateFromMarkdown(filePath, outputFile, options)
      
      // 读取生成的 PDF
      const pdfBuffer = await fs.readFile(outputFile)
      
      // 设置响应头
      res.setHeader('Content-Type', 'application/pdf')
      res.setHeader('Content-Disposition', `attachment; filename="${options.filename || path.basename(filePath, '.md') + '.pdf'}"`)
      res.setHeader('Content-Length', pdfBuffer.length)
      
      // 发送 PDF
      res.send(pdfBuffer)
      
      // 清理临时文件
      await fs.remove(outputFile)
    } catch (error) {
      await fs.remove(outputFile).catch(() => {})
      throw error
    }
  } catch (error) {
    console.error('生成 PDF 失败:', error)
    res.status(500).json({ error: error.message })
  }
})

// 合并多个文件生成 PDF
app.post('/api/generate/merge', async (req, res) => {
  try {
    const { files, options = {} } = req.body
    
    if (!files || !Array.isArray(files) || files.length === 0) {
      return res.status(400).json({ error: '缺少文件列表' })
    }
    
    // 检查所有文件是否存在
    for (const file of files) {
      if (typeof file === 'string') {
        if (!await fs.pathExists(file)) {
          return res.status(404).json({ error: `文件不存在: ${file}` })
        }
      }
    }
    
    const generator = await initializePDFGenerator()
    
    const tempDir = path.join(__dirname, '../temp')
    await fs.ensureDir(tempDir)
    
    const outputFile = path.join(tempDir, `merged-${Date.now()}.pdf`)
    
    try {
      // 处理文件列表
      const filePaths = []
      const tempFiles = []
      
      for (const file of files) {
        if (typeof file === 'string') {
          // 文件路径
          filePaths.push(file)
        } else if (file.content) {
          // 内容对象
          const tempFile = path.join(tempDir, `temp-${Date.now()}-${Math.random().toString(36).substr(2, 9)}.md`)
          await fs.writeFile(tempFile, file.content, 'utf-8')
          filePaths.push(tempFile)
          tempFiles.push(tempFile)
        }
      }
      
      // 生成合并的 PDF
      await generator.generateFromMultipleMarkdown(filePaths, outputFile, options)
      
      // 读取生成的 PDF
      const pdfBuffer = await fs.readFile(outputFile)
      
      // 设置响应头
      res.setHeader('Content-Type', 'application/pdf')
      res.setHeader('Content-Disposition', `attachment; filename="${options.filename || 'merged-document.pdf'}"`)
      res.setHeader('Content-Length', pdfBuffer.length)
      
      // 发送 PDF
      res.send(pdfBuffer)
      
      // 清理临时文件
      await fs.remove(outputFile)
      for (const tempFile of tempFiles) {
        await fs.remove(tempFile)
      }
    } catch (error) {
      await fs.remove(outputFile).catch(() => {})
      for (const tempFile of tempFiles) {
        await fs.remove(tempFile).catch(() => {})
      }
      throw error
    }
  } catch (error) {
    console.error('合并生成 PDF 失败:', error)
    res.status(500).json({ error: error.message })
  }
})

// 生成教程 PDF
app.post('/api/generate/tutorial', async (req, res) => {
  try {
    const { tutorialDir, options = {} } = req.body
    
    if (!tutorialDir) {
      return res.status(400).json({ error: '缺少教程目录路径' })
    }
    
    // 检查目录是否存在
    if (!await fs.pathExists(tutorialDir)) {
      return res.status(404).json({ error: '教程目录不存在' })
    }
    
    const generator = await initializePDFGenerator()
    
    const tempDir = path.join(__dirname, '../temp')
    await fs.ensureDir(tempDir)
    
    const outputFile = path.join(tempDir, `tutorial-${Date.now()}.pdf`)
    
    try {
      // 生成教程 PDF
      await generator.generateTutorialPDF(tutorialDir, outputFile, options)
      
      // 读取生成的 PDF
      const pdfBuffer = await fs.readFile(outputFile)
      
      // 设置响应头
      res.setHeader('Content-Type', 'application/pdf')
      res.setHeader('Content-Disposition', `attachment; filename="${options.filename || 'phaser-tutorial.pdf'}"`)
      res.setHeader('Content-Length', pdfBuffer.length)
      
      // 发送 PDF
      res.send(pdfBuffer)
      
      // 清理临时文件
      await fs.remove(outputFile)
    } catch (error) {
      await fs.remove(outputFile).catch(() => {})
      throw error
    }
  } catch (error) {
    console.error('生成教程 PDF 失败:', error)
    res.status(500).json({ error: error.message })
  }
})

// 获取生成状态
app.get('/api/status', async (req, res) => {
  try {
    const generator = await initializePDFGenerator()
    
    res.json({
      status: 'ready',
      browser: !!generator.browser,
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    res.status(500).json({
      status: 'error',
      error: error.message,
      timestamp: new Date().toISOString()
    })
  }
})

// 预览 HTML
app.post('/api/preview', async (req, res) => {
  try {
    const { content, options = {} } = req.body
    
    if (!content) {
      return res.status(400).json({ error: '缺少 Markdown 内容' })
    }
    
    const generator = await initializePDFGenerator()
    
    // 处理 Markdown 内容
    const processed = await generator.markdownProcessor.process(content, options)
    
    // 生成 HTML
    const html = await generator.templateEngine.render('default', {
      title: options.title || '预览文档',
      content: processed.html,
      toc: processed.toc,
      metadata: processed.metadata,
      styles: await generator.styleManager.getStyles('pdf'),
      ...options
    })
    
    res.setHeader('Content-Type', 'text/html; charset=utf-8')
    res.send(html)
  } catch (error) {
    console.error('生成预览失败:', error)
    res.status(500).json({ error: error.message })
  }
})

// 错误处理中间件
app.use((error, req, res, next) => {
  console.error('服务器错误:', error)
  res.status(500).json({
    error: '内部服务器错误',
    message: error.message,
    timestamp: new Date().toISOString()
  })
})

// 404 处理
app.use((req, res) => {
  res.status(404).json({
    error: '接口不存在',
    path: req.path,
    method: req.method,
    timestamp: new Date().toISOString()
  })
})

// 启动服务器
app.listen(port, () => {
  console.log(`PDF 生成服务器运行在 http://localhost:${port}`)
  console.log(`API 文档: http://localhost:${port}/api/docs`)
})

// 优雅关闭
process.on('SIGTERM', async () => {
  console.log('收到 SIGTERM 信号，正在关闭服务器...')
  
  if (pdfGenerator) {
    await pdfGenerator.close()
  }
  
  process.exit(0)
})

process.on('SIGINT', async () => {
  console.log('收到 SIGINT 信号，正在关闭服务器...')
  
  if (pdfGenerator) {
    await pdfGenerator.close()
  }
  
  process.exit(0)
})

export default app
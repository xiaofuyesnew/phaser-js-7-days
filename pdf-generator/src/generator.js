import puppeteer from 'puppeteer'
import fs from 'fs-extra'
import path from 'path'
import { fileURLToPath } from 'url'
import { MarkdownProcessor } from './processors/markdownProcessor.js'
import { TemplateEngine } from './templates/templateEngine.js'
import { StyleManager } from './styles/styleManager.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

export class PDFGenerator {
  constructor(options = {}) {
    this.options = {
      outputDir: options.outputDir || path.join(process.cwd(), 'output'),
      templateDir: options.templateDir || path.join(__dirname, 'templates'),
      stylesDir: options.stylesDir || path.join(__dirname, 'styles'),
      assetsDir: options.assetsDir || path.join(__dirname, 'assets'),
      format: options.format || 'A4',
      margin: options.margin || {
        top: '2cm',
        right: '2cm',
        bottom: '2cm',
        left: '2cm'
      },
      displayHeaderFooter: options.displayHeaderFooter !== false,
      printBackground: options.printBackground !== false,
      ...options
    }
    
    this.markdownProcessor = new MarkdownProcessor()
    this.templateEngine = new TemplateEngine(this.options.templateDir)
    this.styleManager = new StyleManager(this.options.stylesDir)
    this.browser = null
  }
  
  async initialize() {
    // 启动浏览器
    this.browser = await puppeteer.launch({
      headless: 'new',
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    })
    
    // 确保输出目录存在
    await fs.ensureDir(this.options.outputDir)
    
    console.log('PDF 生成器初始化完成')
  }
  
  async generateFromMarkdown(markdownPath, outputPath, options = {}) {
    if (!this.browser) {
      await this.initialize()
    }
    
    try {
      console.log(`开始生成 PDF: ${markdownPath} -> ${outputPath}`)
      
      // 读取 Markdown 文件
      const markdownContent = await fs.readFile(markdownPath, 'utf-8')
      
      // 处理 Markdown 内容
      const processedContent = await this.markdownProcessor.process(markdownContent, {
        baseDir: path.dirname(markdownPath),
        ...options
      })
      
      // 生成 HTML
      const html = await this.templateEngine.render('default', {
        title: options.title || path.basename(markdownPath, '.md'),
        content: processedContent.html,
        toc: processedContent.toc,
        metadata: processedContent.metadata,
        styles: await this.styleManager.getStyles('pdf'),
        ...options
      })
      
      // 生成 PDF
      await this.generatePDFFromHTML(html, outputPath, options)
      
      console.log(`PDF 生成完成: ${outputPath}`)
      return outputPath
    } catch (error) {
      console.error('PDF 生成失败:', error)
      throw error
    }
  }
  
  async generateFromMultipleMarkdown(markdownFiles, outputPath, options = {}) {
    if (!this.browser) {
      await this.initialize()
    }
    
    try {
      console.log(`开始生成合并 PDF: ${markdownFiles.length} 个文件 -> ${outputPath}`)
      
      const chapters = []
      let globalToc = []
      
      // 处理每个 Markdown 文件
      for (const [index, filePath] of markdownFiles.entries()) {
        const markdownContent = await fs.readFile(filePath, 'utf-8')
        const processed = await this.markdownProcessor.process(markdownContent, {
          baseDir: path.dirname(filePath),
          chapterNumber: index + 1,
          ...options
        })
        
        chapters.push({
          title: options.chapterTitles?.[index] || path.basename(filePath, '.md'),
          content: processed.html,
          toc: processed.toc,
          metadata: processed.metadata
        })
        
        // 合并目录
        globalToc = globalToc.concat(processed.toc.map(item => ({
          ...item,
          chapter: index + 1,
          chapterTitle: chapters[index].title
        })))
      }
      
      // 生成合并的 HTML
      const html = await this.templateEngine.render('book', {
        title: options.title || 'Phaser.js 教程小册',
        chapters,
        toc: globalToc,
        metadata: {
          author: options.author || 'Phaser Tutorial Team',
          version: options.version || '1.0.0',
          date: new Date().toLocaleDateString('zh-CN'),
          ...options.metadata
        },
        styles: await this.styleManager.getStyles('book'),
        ...options
      })
      
      // 生成 PDF
      await this.generatePDFFromHTML(html, outputPath, {
        ...options,
        displayHeaderFooter: true,
        headerTemplate: await this.templateEngine.render('header', {
          title: options.title || 'Phaser.js 教程小册'
        }),
        footerTemplate: await this.templateEngine.render('footer', {
          author: options.author || 'Phaser Tutorial Team'
        })
      })
      
      console.log(`合并 PDF 生成完成: ${outputPath}`)
      return outputPath
    } catch (error) {
      console.error('合并 PDF 生成失败:', error)
      throw error
    }
  }
  
  async generatePDFFromHTML(html, outputPath, options = {}) {
    const page = await this.browser.newPage()
    
    try {
      // 设置页面内容
      await page.setContent(html, {
        waitUntil: 'networkidle0',
        timeout: 30000
      })
      
      // 等待图表渲染完成
      await page.evaluate(() => {
        return new Promise((resolve) => {
          if (window.mermaid) {
            window.mermaid.init().then(resolve)
          } else {
            resolve()
          }
        })
      })
      
      // 生成 PDF
      const pdfOptions = {
        path: outputPath,
        format: this.options.format,
        margin: this.options.margin,
        displayHeaderFooter: this.options.displayHeaderFooter,
        printBackground: this.options.printBackground,
        preferCSSPageSize: true,
        ...options
      }
      
      await page.pdf(pdfOptions)
    } finally {
      await page.close()
    }
  }
  
  async generateTutorialPDF(tutorialDir, outputPath, options = {}) {
    const tutorialFiles = [
      path.join(tutorialDir, '1_starter/README.md'),
      path.join(tutorialDir, '2_sprite/README.md'),
      path.join(tutorialDir, '3_tilemap/README.md'),
      path.join(tutorialDir, '4_camera/README.md'),
      path.join(tutorialDir, '5_enemy/README.md'),
      path.join(tutorialDir, '6_audio_ui_status/README.md'),
      path.join(tutorialDir, '7_deploy_review/README.md')
    ]
    
    const chapterTitles = [
      'Day 1: Phaser.js 基础',
      'Day 2: 精灵与动画',
      'Day 3: 地图与物理系统',
      'Day 4: 摄像机与场景滚动',
      'Day 5: 敌人与碰撞检测',
      'Day 6: 音效、UI 与状态管理',
      'Day 7: 游戏部署与优化'
    ]
    
    // 过滤存在的文件
    const existingFiles = []
    const existingTitles = []
    
    for (const [index, filePath] of tutorialFiles.entries()) {
      if (await fs.pathExists(filePath)) {
        existingFiles.push(filePath)
        existingTitles.push(chapterTitles[index])
      }
    }
    
    return await this.generateFromMultipleMarkdown(existingFiles, outputPath, {
      title: 'Phaser.js 7天游戏开发教程',
      author: 'Phaser Tutorial Team',
      version: '1.0.0',
      chapterTitles: existingTitles,
      ...options
    })
  }
  
  async close() {
    if (this.browser) {
      await this.browser.close()
      this.browser = null
    }
  }
  
  // 批量生成
  async generateBatch(tasks) {
    if (!this.browser) {
      await this.initialize()
    }
    
    const results = []
    
    for (const task of tasks) {
      try {
        let result
        
        if (task.type === 'single') {
          result = await this.generateFromMarkdown(task.input, task.output, task.options)
        } else if (task.type === 'multiple') {
          result = await this.generateFromMultipleMarkdown(task.inputs, task.output, task.options)
        } else if (task.type === 'tutorial') {
          result = await this.generateTutorialPDF(task.tutorialDir, task.output, task.options)
        }
        
        results.push({ success: true, task, result })
      } catch (error) {
        results.push({ success: false, task, error: error.message })
      }
    }
    
    return results
  }
  
  // 获取生成统计
  async getGenerationStats(outputPath) {
    try {
      const stats = await fs.stat(outputPath)
      return {
        size: stats.size,
        sizeFormatted: this.formatFileSize(stats.size),
        created: stats.birthtime,
        modified: stats.mtime
      }
    } catch (error) {
      return null
    }
  }
  
  formatFileSize(bytes) {
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    if (bytes === 0) return '0 Bytes'
    const i = Math.floor(Math.log(bytes) / Math.log(1024))
    return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i]
  }
}
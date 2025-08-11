import { marked } from 'marked'
import hljs from 'highlight.js'
import fs from 'fs-extra'
import path from 'path'

export class MarkdownProcessor {
  constructor() {
    this.setupMarked()
  }
  
  setupMarked() {
    // 配置 marked 选项
    marked.setOptions({
      highlight: (code, language) => {
        if (language && hljs.getLanguage(language)) {
          try {
            return hljs.highlight(code, { language }).value
          } catch (err) {
            console.warn('代码高亮失败:', err)
          }
        }
        return hljs.highlightAuto(code).value
      },
      langPrefix: 'hljs language-',
      breaks: true,
      gfm: true
    })
    
    // 自定义渲染器
    const renderer = new marked.Renderer()
    
    // 自定义代码块渲染 - PDF 优化
    renderer.code = (code, language, escaped) => {
      const validLang = language && hljs.getLanguage(language) ? language : 'plaintext'
      const highlightedCode = hljs.highlight(code, { language: validLang }).value
      
      return `
        <div class="code-block" data-language="${validLang}">
          <div class="code-header">
            <span class="language-tag">${validLang.toUpperCase()}</span>
          </div>
          <pre class="code-content"><code class="hljs language-${validLang}">${highlightedCode}</code></pre>
        </div>
      `
    }
    
    // 自定义标题渲染，添加章节编号和锚点
    renderer.heading = (text, level) => {
      const anchor = this.generateAnchor(text)
      const chapterPrefix = this.currentChapterNumber ? `${this.currentChapterNumber}.` : ''
      
      return `
        <h${level} id="${anchor}" class="heading level-${level}" data-level="${level}">
          <span class="heading-number">${chapterPrefix}</span>
          <span class="heading-text">${text}</span>
        </h${level}>
      `
    }
    
    // 自定义链接渲染
    renderer.link = (href, title, text) => {
      // 处理相对路径
      if (href.startsWith('./') || href.startsWith('../')) {
        href = this.resolveRelativePath(href)
      }
      
      const titleAttr = title ? ` title="${title}"` : ''
      return `<a href="${href}"${titleAttr} class="content-link">${text}</a>`
    }
    
    // 自定义图片渲染
    renderer.image = (href, title, text) => {
      // 处理相对路径
      if (href.startsWith('./') || href.startsWith('../')) {
        href = this.resolveRelativePath(href)
      }
      
      const titleAttr = title ? ` title="${title}"` : ''
      const altAttr = text ? ` alt="${text}"` : ''
      
      return `
        <figure class="image-figure">
          <img src="${href}"${altAttr}${titleAttr} class="content-image" />
          ${text ? `<figcaption class="image-caption">${text}</figcaption>` : ''}
        </figure>
      `
    }
    
    // 自定义表格渲染
    renderer.table = (header, body) => {
      return `
        <div class="table-wrapper">
          <table class="content-table">
            <thead>${header}</thead>
            <tbody>${body}</tbody>
          </table>
        </div>
      `
    }
    
    // 自定义引用块渲染
    renderer.blockquote = (quote) => {
      // 检测特殊类型的引用块
      const content = quote.trim()
      
      if (content.includes('💡') || content.toLowerCase().includes('tip')) {
        return `<div class="callout callout-tip">${quote}</div>`
      } else if (content.includes('⚠️') || content.toLowerCase().includes('warning')) {
        return `<div class="callout callout-warning">${quote}</div>`
      } else if (content.includes('❌') || content.toLowerCase().includes('danger')) {
        return `<div class="callout callout-danger">${quote}</div>`
      } else if (content.includes('ℹ️') || content.toLowerCase().includes('info')) {
        return `<div class="callout callout-info">${quote}</div>`
      }
      
      return `<blockquote class="content-blockquote">${quote}</blockquote>`
    }
    
    // 自定义列表渲染
    renderer.list = (body, ordered, start) => {
      const type = ordered ? 'ol' : 'ul'
      const startAttr = ordered && start !== 1 ? ` start="${start}"` : ''
      return `<${type}${startAttr} class="content-list ${ordered ? 'ordered' : 'unordered'}">${body}</${type}>`
    }
    
    // 自定义段落渲染
    renderer.paragraph = (text) => {
      return `<p class="content-paragraph">${text}</p>`
    }
    
    marked.use({ renderer })
  }
  
  async process(markdown, options = {}) {
    try {
      this.currentChapterNumber = options.chapterNumber
      this.baseDir = options.baseDir || process.cwd()
      
      // 预处理 Markdown
      const preprocessed = await this.preprocess(markdown, options)
      
      // 渲染为 HTML
      const html = marked(preprocessed)
      
      // 后处理 HTML
      const processed = this.postprocess(html, options)
      
      // 提取元数据
      const metadata = this.extractMetadata(markdown)
      
      // 生成目录
      const toc = this.generateTOC(preprocessed)
      
      return {
        html: processed,
        toc,
        metadata,
        wordCount: this.countWords(markdown),
        readingTime: this.estimateReadingTime(markdown)
      }
    } catch (error) {
      console.error('Markdown 处理失败:', error)
      throw error
    }
  }
  
  async preprocess(markdown, options) {
    let processed = markdown
    
    // 处理文件包含
    processed = await this.processIncludes(processed, options)
    
    // 处理 Mermaid 图表
    processed = this.processMermaid(processed)
    
    // 处理任务列表
    processed = this.processTaskLists(processed)
    
    // 处理特殊标记
    processed = this.processSpecialMarkers(processed)
    
    // 处理分页符
    processed = this.processPageBreaks(processed)
    
    return processed
  }
  
  async processIncludes(markdown, options) {
    const includeRegex = /!\[include\]\(([^)]+)\)/g
    let processed = markdown
    let match
    
    while ((match = includeRegex.exec(markdown)) !== null) {
      const includePath = match[1]
      const fullPath = path.resolve(this.baseDir, includePath)
      
      try {
        if (await fs.pathExists(fullPath)) {
          const includeContent = await fs.readFile(fullPath, 'utf-8')
          processed = processed.replace(match[0], includeContent)
        } else {
          console.warn(`包含文件不存在: ${fullPath}`)
          processed = processed.replace(match[0], `<!-- 文件不存在: ${includePath} -->`)
        }
      } catch (error) {
        console.warn(`读取包含文件失败: ${fullPath}`, error)
        processed = processed.replace(match[0], `<!-- 读取失败: ${includePath} -->`)
      }
    }
    
    return processed
  }
  
  processMermaid(markdown) {
    return markdown.replace(/```mermaid\n([\s\S]*?)\n```/g, (match, diagram) => {
      const diagramId = Math.random().toString(36).substr(2, 9)
      return `
        <div class="mermaid-container" id="mermaid-${diagramId}">
          <div class="mermaid">${diagram.trim()}</div>
        </div>
      `
    })
  }
  
  processTaskLists(markdown) {
    return markdown.replace(/^(\s*)- \[([ x])\] (.+)$/gm, (match, indent, checked, text) => {
      const isChecked = checked === 'x'
      return `${indent}- <span class="task-item ${isChecked ? 'completed' : 'pending'}">
        <span class="task-checkbox">${isChecked ? '✓' : '☐'}</span>
        <span class="task-text">${text}</span>
      </span>`
    })
  }
  
  processSpecialMarkers(markdown) {
    // 处理页面分隔符
    markdown = markdown.replace(/^---\s*page-break\s*---$/gm, '<div class="page-break"></div>')
    
    // 处理章节分隔符
    markdown = markdown.replace(/^---\s*chapter-break\s*---$/gm, '<div class="chapter-break"></div>')
    
    // 处理高亮文本
    markdown = markdown.replace(/==(.*?)==/g, '<mark class="highlight">$1</mark>')
    
    // 处理键盘按键
    markdown = markdown.replace(/\[\[([^\]]+)\]\]/g, '<kbd class="key">$1</kbd>')
    
    return markdown
  }
  
  processPageBreaks(markdown) {
    // 在每个一级标题前添加分页符（除了第一个）
    const lines = markdown.split('\n')
    const processed = []
    let firstH1 = true
    
    for (const line of lines) {
      if (line.startsWith('# ') && !firstH1) {
        processed.push('<div class="page-break"></div>')
        processed.push('')
      }
      
      if (line.startsWith('# ')) {
        firstH1 = false
      }
      
      processed.push(line)
    }
    
    return processed.join('\n')
  }
  
  postprocess(html, options) {
    // 优化图片路径
    html = html.replace(/src="([^"]+)"/g, (match, src) => {
      if (src.startsWith('./') || src.startsWith('../')) {
        const resolvedPath = path.resolve(this.baseDir, src)
        return `src="file://${resolvedPath}"`
      }
      return match
    })
    
    // 添加打印优化类
    html = html.replace(/<table/g, '<table class="print-table"')
    html = html.replace(/<img/g, '<img class="print-image"')
    
    // 处理长代码块的分页
    html = html.replace(/<div class="code-block"[^>]*>([\s\S]*?)<\/div>/g, (match) => {
      return `<div class="code-block-wrapper">${match}</div>`
    })
    
    return html
  }
  
  extractMetadata(markdown) {
    const metadata = {}
    
    // 提取 Front Matter
    const frontMatterMatch = markdown.match(/^---\n([\s\S]*?)\n---/)
    if (frontMatterMatch) {
      const frontMatter = frontMatterMatch[1]
      const lines = frontMatter.split('\n')
      
      for (const line of lines) {
        const [key, ...valueParts] = line.split(':')
        if (key && valueParts.length > 0) {
          const value = valueParts.join(':').trim()
          metadata[key.trim()] = value.replace(/^["']|["']$/g, '')
        }
      }
    }
    
    // 提取第一个标题作为标题
    const titleMatch = markdown.match(/^#\s+(.+)$/m)
    if (titleMatch && !metadata.title) {
      metadata.title = titleMatch[1]
    }
    
    // 统计信息
    metadata.wordCount = this.countWords(markdown)
    metadata.readingTime = this.estimateReadingTime(markdown)
    metadata.generatedAt = new Date().toISOString()
    
    return metadata
  }
  
  generateTOC(markdown) {
    const toc = []
    const headingRegex = /^(#{1,6})\s+(.+)$/gm
    let match
    
    while ((match = headingRegex.exec(markdown)) !== null) {
      const level = match[1].length
      const text = match[2].trim()
      const anchor = this.generateAnchor(text)
      
      toc.push({
        level,
        text,
        anchor,
        id: anchor
      })
    }
    
    return toc
  }
  
  generateAnchor(text) {
    return text
      .toLowerCase()
      .replace(/[^\w\u4e00-\u9fa5\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '')
  }
  
  resolveRelativePath(href) {
    if (this.baseDir) {
      return path.resolve(this.baseDir, href)
    }
    return href
  }
  
  countWords(text) {
    // 移除 Markdown 标记
    const plainText = text
      .replace(/```[\s\S]*?```/g, '') // 代码块
      .replace(/`[^`]+`/g, '') // 行内代码
      .replace(/!\[.*?\]\(.*?\)/g, '') // 图片
      .replace(/\[.*?\]\(.*?\)/g, '') // 链接
      .replace(/[#*_~`]/g, '') // Markdown 标记
    
    // 统计中文字符和英文单词
    const chineseChars = (plainText.match(/[\u4e00-\u9fa5]/g) || []).length
    const englishWords = (plainText.match(/[a-zA-Z]+/g) || []).length
    
    return chineseChars + englishWords
  }
  
  estimateReadingTime(text) {
    const wordCount = this.countWords(text)
    // 假设中文阅读速度为 300 字/分钟，英文为 200 词/分钟
    const minutes = Math.ceil(wordCount / 250)
    return `${minutes} 分钟`
  }
}
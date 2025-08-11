import { marked } from 'marked'
import hljs from 'highlight.js'

class MarkdownRenderer {
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
    
    // 自定义代码块渲染
    renderer.code = (code, language, escaped) => {
      const validLang = language && hljs.getLanguage(language) ? language : 'plaintext'
      const highlightedCode = hljs.highlight(code, { language: validLang }).value
      const codeId = Math.random().toString(36).substr(2, 9)
      const isRunnable = ['javascript', 'html', 'css'].includes(validLang)
      
      return `
        <div class="code-block" data-language="${validLang}" data-code-id="${codeId}">
          <div class="code-header">
            <span class="language-tag">${validLang.toUpperCase()}</span>
            <div class="code-actions">
              <button class="copy-btn" onclick="window.copyCode && window.copyCode('${codeId}')">
                <span class="icon">📋</span>
                复制
              </button>
              ${isRunnable ? `
                <button class="run-btn" onclick="window.runCode && window.runCode('${codeId}')" data-runnable="true">
                  <span class="icon">▶</span>
                  运行
                </button>
              ` : ''}
            </div>
          </div>
          <pre><code class="hljs language-${validLang}" id="code-${codeId}">${highlightedCode}</code></pre>
        </div>
      `
    }
    
    // 自定义标题渲染，添加锚点
    renderer.heading = (text, level) => {
      const anchor = text.toLowerCase().replace(/[^\w\u4e00-\u9fa5]+/g, '-')
      return `
        <h${level} id="${anchor}" class="heading-with-anchor">
          <a href="#${anchor}" class="anchor-link">#</a>
          ${text}
        </h${level}>
      `
    }
    
    // 自定义链接渲染，外部链接新窗口打开
    renderer.link = (href, title, text) => {
      const isExternal = href.startsWith('http') && !href.includes(window.location.hostname)
      const target = isExternal ? ' target="_blank" rel="noopener noreferrer"' : ''
      const titleAttr = title ? ` title="${title}"` : ''
      return `<a href="${href}"${titleAttr}${target}>${text}</a>`
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
      if (quote.includes('💡')) {
        return `<div class="callout callout-tip">${quote}</div>`
      } else if (quote.includes('⚠️')) {
        return `<div class="callout callout-warning">${quote}</div>`
      } else if (quote.includes('❌')) {
        return `<div class="callout callout-danger">${quote}</div>`
      } else if (quote.includes('ℹ️')) {
        return `<div class="callout callout-info">${quote}</div>`
      }
      return `<blockquote class="content-blockquote">${quote}</blockquote>`
    }
    
    // 自定义列表渲染
    renderer.list = (body, ordered, start) => {
      const type = ordered ? 'ol' : 'ul'
      const startAttr = ordered && start !== 1 ? ` start="${start}"` : ''
      return `<${type}${startAttr} class="content-list">${body}</${type}>`
    }
    
    marked.use({ renderer })
  }
  
  async render(markdown) {
    try {
      // 预处理 Markdown 内容
      let processedMarkdown = this.preprocessMarkdown(markdown)
      
      // 渲染为 HTML
      let html = marked(processedMarkdown)
      
      // 后处理 HTML
      html = this.postprocessHtml(html)
      
      return html
    } catch (error) {
      console.error('Markdown 渲染失败:', error)
      return `<div class="error">内容渲染失败: ${error.message}</div>`
    }
  }
  
  preprocessMarkdown(markdown) {
    // 处理 Mermaid 图表
    markdown = markdown.replace(/```mermaid\n([\s\S]*?)\n```/g, (match, diagram) => {
      const diagramId = Math.random().toString(36).substr(2, 9)
      return `<div class="mermaid-container">
        <div class="mermaid" id="mermaid-${diagramId}">${diagram.trim()}</div>
      </div>`
    })
    
    // 处理特殊的代码块标记
    markdown = markdown.replace(/```(\w+)\s*\{([^}]+)\}\n([\s\S]*?)\n```/g, (match, lang, attrs, code) => {
      const attributes = this.parseAttributes(attrs)
      return `\`\`\`${lang} ${JSON.stringify(attributes)}\n${code}\n\`\`\``
    })
    
    // 处理任务列表
    markdown = markdown.replace(/^(\s*)- \[([ x])\] (.+)$/gm, (match, indent, checked, text) => {
      const isChecked = checked === 'x'
      return `${indent}- <input type="checkbox" ${isChecked ? 'checked' : ''} disabled> ${text}`
    })
    
    return markdown
  }
  
  postprocessHtml(html) {
    // 添加图片懒加载
    html = html.replace(/<img([^>]+)src="([^"]+)"([^>]*)>/g, (match, before, src, after) => {
      return `<img${before}src="${src}" loading="lazy" class="content-image"${after}>`
    })
    
    // 为表格添加响应式包装
    html = html.replace(/<table>/g, '<div class="table-responsive"><table class="table">')
    html = html.replace(/<\/table>/g, '</table></div>')
    
    // 添加段落类名
    html = html.replace(/<p>/g, '<p class="content-paragraph">')
    
    return html
  }
  
  parseAttributes(attrString) {
    const attributes = {}
    const pairs = attrString.split(',').map(s => s.trim())
    
    pairs.forEach(pair => {
      const [key, value] = pair.split('=').map(s => s.trim())
      if (key && value) {
        attributes[key] = value.replace(/['"]/g, '')
      } else if (key) {
        attributes[key] = true
      }
    })
    
    return attributes
  }
  
  // 提取目录
  extractToc(markdown) {
    const headings = []
    const headingRegex = /^(#{1,6})\s+(.+)$/gm
    let match
    
    while ((match = headingRegex.exec(markdown)) !== null) {
      const level = match[1].length
      const text = match[2].trim()
      const anchor = text.toLowerCase().replace(/[^\w\u4e00-\u9fa5]+/g, '-')
      
      headings.push({
        level,
        text,
        anchor,
        id: anchor
      })
    }
    
    return headings
  }
  
  // 生成目录 HTML
  generateTocHtml(toc) {
    if (!toc || toc.length === 0) return ''
    
    let html = '<nav class="table-of-contents"><h3>目录</h3><ul class="toc-list">'
    
    toc.forEach(heading => {
      const indent = 'toc-level-' + heading.level
      html += `<li class="${indent}">
        <a href="#${heading.anchor}" class="toc-link">${heading.text}</a>
      </li>`
    })
    
    html += '</ul></nav>'
    return html
  }
  
  // 搜索功能
  searchContent(markdown, query) {
    if (!query || query.trim() === '') return []
    
    const lines = markdown.split('\n')
    const results = []
    const searchTerm = query.toLowerCase()
    
    lines.forEach((line, index) => {
      if (line.toLowerCase().includes(searchTerm)) {
        // 获取上下文
        const start = Math.max(0, index - 2)
        const end = Math.min(lines.length, index + 3)
        const context = lines.slice(start, end).join('\n')
        
        results.push({
          lineNumber: index + 1,
          line: line.trim(),
          context: context,
          relevance: this.calculateRelevance(line, searchTerm)
        })
      }
    })
    
    // 按相关性排序
    return results.sort((a, b) => b.relevance - a.relevance)
  }
  
  calculateRelevance(text, searchTerm) {
    const lowerText = text.toLowerCase()
    const lowerTerm = searchTerm.toLowerCase()
    
    let score = 0
    
    // 完全匹配得分最高
    if (lowerText === lowerTerm) score += 100
    
    // 开头匹配
    if (lowerText.startsWith(lowerTerm)) score += 50
    
    // 单词边界匹配
    const wordBoundaryRegex = new RegExp(`\\b${lowerTerm}\\b`)
    if (wordBoundaryRegex.test(lowerText)) score += 30
    
    // 包含匹配
    if (lowerText.includes(lowerTerm)) score += 10
    
    // 标题权重更高
    if (text.startsWith('#')) score *= 2
    
    return score
  }
}

export const markdownRenderer = new MarkdownRenderer()
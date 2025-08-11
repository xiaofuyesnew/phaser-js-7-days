import fs from 'fs-extra'
import path from 'path'

export class TemplateEngine {
  constructor(templateDir) {
    this.templateDir = templateDir
    this.templates = new Map()
  }
  
  async loadTemplate(name) {
    if (this.templates.has(name)) {
      return this.templates.get(name)
    }
    
    const templatePath = path.join(this.templateDir, `${name}.html`)
    
    try {
      const template = await fs.readFile(templatePath, 'utf-8')
      this.templates.set(name, template)
      return template
    } catch (error) {
      console.warn(`模板文件不存在: ${templatePath}`)
      return this.getDefaultTemplate(name)
    }
  }
  
  async render(templateName, data = {}) {
    const template = await this.loadTemplate(templateName)
    return this.processTemplate(template, data)
  }
  
  processTemplate(template, data) {
    let processed = template
    
    // 处理变量替换 {{variable}}
    processed = processed.replace(/\{\{(\w+)\}\}/g, (match, key) => {
      return data[key] !== undefined ? data[key] : match
    })
    
    // 处理条件语句 {{#if condition}}...{{/if}}
    processed = processed.replace(/\{\{#if\s+(\w+)\}\}([\s\S]*?)\{\{\/if\}\}/g, (match, condition, content) => {
      return data[condition] ? content : ''
    })
    
    // 处理循环语句 {{#each array}}...{{/each}}
    processed = processed.replace(/\{\{#each\s+(\w+)\}\}([\s\S]*?)\{\{\/each\}\}/g, (match, arrayName, itemTemplate) => {
      const array = data[arrayName]
      if (!Array.isArray(array)) return ''
      
      return array.map((item, index) => {
        let itemHtml = itemTemplate
        
        // 替换 {{this}} 为当前项
        itemHtml = itemHtml.replace(/\{\{this\}\}/g, item)
        
        // 替换 {{@index}} 为索引
        itemHtml = itemHtml.replace(/\{\{@index\}\}/g, index)
        
        // 替换对象属性 {{property}}
        if (typeof item === 'object') {
          for (const [key, value] of Object.entries(item)) {
            const regex = new RegExp(`\\{\\{${key}\\}\\}`, 'g')
            itemHtml = itemHtml.replace(regex, value)
          }
        }
        
        return itemHtml
      }).join('')
    })
    
    // 处理嵌套模板 {{>partial}}
    processed = processed.replace(/\{\{>(\w+)\}\}/g, (match, partialName) => {
      try {
        const partial = this.templates.get(partialName) || this.getDefaultTemplate(partialName)
        return this.processTemplate(partial, data)
      } catch (error) {
        console.warn(`部分模板不存在: ${partialName}`)
        return ''
      }
    })
    
    return processed
  }
  
  getDefaultTemplate(name) {
    switch (name) {
      case 'default':
        return this.getDefaultPageTemplate()
      case 'book':
        return this.getBookTemplate()
      case 'header':
        return this.getHeaderTemplate()
      case 'footer':
        return this.getFooterTemplate()
      case 'toc':
        return this.getTocTemplate()
      case 'chapter':
        return this.getChapterTemplate()
      default:
        return '<div>模板不存在</div>'
    }
  }
  
  getDefaultPageTemplate() {
    return `
<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>{{title}}</title>
    <style>
        {{styles}}
    </style>
    <script src="https://cdn.jsdelivr.net/npm/mermaid@10.8.0/dist/mermaid.min.js"></script>
</head>
<body>
    <div class="document">
        <header class="document-header">
            <h1 class="document-title">{{title}}</h1>
            {{#if metadata.author}}
            <p class="document-author">作者: {{metadata.author}}</p>
            {{/if}}
            {{#if metadata.date}}
            <p class="document-date">日期: {{metadata.date}}</p>
            {{/if}}
        </header>
        
        {{#if toc}}
        <nav class="table-of-contents">
            <h2>目录</h2>
            <ul class="toc-list">
                {{#each toc}}
                <li class="toc-item level-{{level}}">
                    <a href="#{{anchor}}" class="toc-link">{{text}}</a>
                </li>
                {{/each}}
            </ul>
        </nav>
        <div class="page-break"></div>
        {{/if}}
        
        <main class="document-content">
            {{content}}
        </main>
        
        <footer class="document-footer">
            <p>生成时间: {{metadata.generatedAt}}</p>
            {{#if metadata.wordCount}}
            <p>字数统计: {{metadata.wordCount}} 字</p>
            {{/if}}
            {{#if metadata.readingTime}}
            <p>预计阅读时间: {{metadata.readingTime}}</p>
            {{/if}}
        </footer>
    </div>
    
    <script>
        // 初始化 Mermaid
        mermaid.initialize({
            startOnLoad: true,
            theme: 'default',
            securityLevel: 'loose'
        });
        
        // 等待页面加载完成后初始化图表
        document.addEventListener('DOMContentLoaded', function() {
            mermaid.init(undefined, document.querySelectorAll('.mermaid'));
        });
    </script>
</body>
</html>`
  }
  
  getBookTemplate() {
    return `
<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>{{title}}</title>
    <style>
        {{styles}}
    </style>
    <script src="https://cdn.jsdelivr.net/npm/mermaid@10.8.0/dist/mermaid.min.js"></script>
</head>
<body>
    <div class="book">
        <!-- 封面 -->
        <div class="cover-page">
            <div class="cover-content">
                <h1 class="book-title">{{title}}</h1>
                {{#if metadata.subtitle}}
                <h2 class="book-subtitle">{{metadata.subtitle}}</h2>
                {{/if}}
                {{#if metadata.author}}
                <p class="book-author">{{metadata.author}}</p>
                {{/if}}
                {{#if metadata.version}}
                <p class="book-version">版本 {{metadata.version}}</p>
                {{/if}}
                {{#if metadata.date}}
                <p class="book-date">{{metadata.date}}</p>
                {{/if}}
            </div>
        </div>
        
        <div class="page-break"></div>
        
        <!-- 目录 -->
        <div class="toc-page">
            <h1 class="toc-title">目录</h1>
            <div class="toc-content">
                {{#each toc}}
                <div class="toc-entry level-{{level}}">
                    {{#if chapterTitle}}
                    <span class="toc-chapter">{{chapterTitle}}</span>
                    {{/if}}
                    <a href="#{{anchor}}" class="toc-link">{{text}}</a>
                    <span class="toc-dots"></span>
                    <span class="toc-page-number">{{@index}}</span>
                </div>
                {{/each}}
            </div>
        </div>
        
        <div class="page-break"></div>
        
        <!-- 章节内容 -->
        {{#each chapters}}
        <div class="chapter" id="chapter-{{@index}}">
            <div class="chapter-header">
                <h1 class="chapter-title">{{title}}</h1>
            </div>
            <div class="chapter-content">
                {{content}}
            </div>
        </div>
        {{#if @index}}
        <div class="page-break"></div>
        {{/if}}
        {{/each}}
        
        <!-- 版权页 -->
        <div class="copyright-page">
            <div class="copyright-content">
                <h2>版权信息</h2>
                <p><strong>{{title}}</strong></p>
                {{#if metadata.author}}
                <p>作者: {{metadata.author}}</p>
                {{/if}}
                {{#if metadata.version}}
                <p>版本: {{metadata.version}}</p>
                {{/if}}
                <p>生成时间: {{metadata.date}}</p>
                <p>本文档由 PDF 生成系统自动生成</p>
            </div>
        </div>
    </div>
    
    <script>
        mermaid.initialize({
            startOnLoad: true,
            theme: 'default',
            securityLevel: 'loose'
        });
        
        document.addEventListener('DOMContentLoaded', function() {
            mermaid.init(undefined, document.querySelectorAll('.mermaid'));
        });
    </script>
</body>
</html>`
  }
  
  getHeaderTemplate() {
    return `
<div class="pdf-header">
    <span class="header-title">{{title}}</span>
    <span class="header-page">第 <span class="pageNumber"></span> 页</span>
</div>`
  }
  
  getFooterTemplate() {
    return `
<div class="pdf-footer">
    <span class="footer-author">{{author}}</span>
    <span class="footer-date">{{date}}</span>
    <span class="footer-page">共 <span class="totalPages"></span> 页</span>
</div>`
  }
  
  getTocTemplate() {
    return `
<nav class="table-of-contents">
    <h2 class="toc-title">目录</h2>
    <ul class="toc-list">
        {{#each items}}
        <li class="toc-item level-{{level}}">
            <a href="#{{anchor}}" class="toc-link">
                <span class="toc-text">{{text}}</span>
                <span class="toc-dots"></span>
                <span class="toc-page">{{page}}</span>
            </a>
        </li>
        {{/each}}
    </ul>
</nav>`
  }
  
  getChapterTemplate() {
    return `
<div class="chapter">
    <header class="chapter-header">
        <h1 class="chapter-title">{{title}}</h1>
        {{#if subtitle}}
        <h2 class="chapter-subtitle">{{subtitle}}</h2>
        {{/if}}
    </header>
    <div class="chapter-content">
        {{content}}
    </div>
</div>`
  }
  
  // 辅助方法
  registerHelper(name, fn) {
    this.helpers = this.helpers || new Map()
    this.helpers.set(name, fn)
  }
  
  // 注册默认辅助方法
  registerDefaultHelpers() {
    this.registerHelper('formatDate', (date) => {
      return new Date(date).toLocaleDateString('zh-CN')
    })
    
    this.registerHelper('formatFileSize', (bytes) => {
      const sizes = ['Bytes', 'KB', 'MB', 'GB']
      if (bytes === 0) return '0 Bytes'
      const i = Math.floor(Math.log(bytes) / Math.log(1024))
      return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i]
    })
    
    this.registerHelper('truncate', (text, length = 100) => {
      if (text.length <= length) return text
      return text.substring(0, length) + '...'
    })
    
    this.registerHelper('capitalize', (text) => {
      return text.charAt(0).toUpperCase() + text.slice(1)
    })
  }
  
  constructor(templateDir) {
    this.templateDir = templateDir
    this.templates = new Map()
    this.registerDefaultHelpers()
  }
}
import fs from 'fs-extra'
import path from 'path'

export class StyleManager {
  constructor(stylesDir) {
    this.stylesDir = stylesDir
    this.styles = new Map()
  }
  
  async loadStyles(name) {
    if (this.styles.has(name)) {
      return this.styles.get(name)
    }
    
    const stylePath = path.join(this.stylesDir, `${name}.css`)
    
    try {
      const styles = await fs.readFile(stylePath, 'utf-8')
      this.styles.set(name, styles)
      return styles
    } catch (error) {
      console.warn(`样式文件不存在: ${stylePath}`)
      return this.getDefaultStyles(name)
    }
  }
  
  async getStyles(type = 'default') {
    const baseStyles = await this.loadStyles('base')
    const typeStyles = await this.loadStyles(type)
    
    return `${baseStyles}\n\n${typeStyles}`
  }
  
  getDefaultStyles(name) {
    switch (name) {
      case 'base':
        return this.getBaseStyles()
      case 'pdf':
        return this.getPdfStyles()
      case 'book':
        return this.getBookStyles()
      default:
        return ''
    }
  }
  
  getBaseStyles() {
    return `
/* 基础样式 */
* {
    box-sizing: border-box;
}

html {
    font-size: 14px;
    line-height: 1.6;
}

body {
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", "PingFang SC", "Hiragino Sans GB", "Microsoft YaHei", "Helvetica Neue", Helvetica, Arial, sans-serif;
    color: #333;
    background: white;
    margin: 0;
    padding: 0;
}

/* 标题样式 */
h1, h2, h3, h4, h5, h6 {
    font-weight: 600;
    line-height: 1.3;
    margin: 1.5em 0 0.5em 0;
    color: #1a1a1a;
}

h1 {
    font-size: 2.2em;
    border-bottom: 2px solid #e1e4e8;
    padding-bottom: 0.3em;
}

h2 {
    font-size: 1.8em;
    border-bottom: 1px solid #e1e4e8;
    padding-bottom: 0.2em;
}

h3 {
    font-size: 1.5em;
}

h4 {
    font-size: 1.3em;
}

h5 {
    font-size: 1.1em;
}

h6 {
    font-size: 1em;
    color: #666;
}

/* 段落样式 */
p {
    margin: 0.8em 0;
    text-align: justify;
}

/* 链接样式 */
a {
    color: #0366d6;
    text-decoration: none;
}

a:hover {
    text-decoration: underline;
}

/* 列表样式 */
ul, ol {
    margin: 0.8em 0;
    padding-left: 2em;
}

li {
    margin: 0.3em 0;
}

/* 引用块样式 */
blockquote {
    margin: 1em 0;
    padding: 0.5em 1em;
    border-left: 4px solid #dfe2e5;
    background: #f6f8fa;
    color: #6a737d;
}

/* 代码样式 */
code {
    font-family: "SFMono-Regular", Consolas, "Liberation Mono", Menlo, monospace;
    font-size: 0.9em;
    background: #f6f8fa;
    padding: 0.2em 0.4em;
    border-radius: 3px;
}

pre {
    font-family: "SFMono-Regular", Consolas, "Liberation Mono", Menlo, monospace;
    font-size: 0.85em;
    line-height: 1.45;
    background: #f6f8fa;
    padding: 1em;
    border-radius: 6px;
    overflow-x: auto;
    margin: 1em 0;
}

pre code {
    background: none;
    padding: 0;
}

/* 表格样式 */
table {
    border-collapse: collapse;
    width: 100%;
    margin: 1em 0;
}

th, td {
    border: 1px solid #dfe2e5;
    padding: 0.6em 1em;
    text-align: left;
}

th {
    background: #f6f8fa;
    font-weight: 600;
}

/* 图片样式 */
img {
    max-width: 100%;
    height: auto;
    display: block;
    margin: 1em auto;
}

/* 分隔线样式 */
hr {
    border: none;
    border-top: 1px solid #e1e4e8;
    margin: 2em 0;
}

/* 强调样式 */
strong {
    font-weight: 600;
}

em {
    font-style: italic;
}

/* 删除线样式 */
del {
    text-decoration: line-through;
    color: #6a737d;
}

/* 高亮样式 */
mark {
    background: #fff3cd;
    padding: 0.1em 0.2em;
    border-radius: 2px;
}

/* 键盘按键样式 */
kbd {
    font-family: "SFMono-Regular", Consolas, "Liberation Mono", Menlo, monospace;
    font-size: 0.85em;
    background: #fafbfc;
    border: 1px solid #d1d5da;
    border-radius: 3px;
    box-shadow: inset 0 -1px 0 #d1d5da;
    padding: 0.1em 0.3em;
}
`
  }
  
  getPdfStyles() {
    return `
/* PDF 专用样式 */
@page {
    size: A4;
    margin: 2cm;
}

@media print {
    body {
        font-size: 12px;
        line-height: 1.5;
    }
    
    /* 分页控制 */
    .page-break {
        page-break-before: always;
    }
    
    .no-break {
        page-break-inside: avoid;
    }
    
    /* 标题分页控制 */
    h1, h2 {
        page-break-after: avoid;
    }
    
    h1, h2, h3, h4, h5, h6 {
        page-break-inside: avoid;
    }
    
    /* 代码块分页控制 */
    .code-block {
        page-break-inside: avoid;
        break-inside: avoid;
    }
    
    /* 表格分页控制 */
    table {
        page-break-inside: avoid;
    }
    
    /* 图片分页控制 */
    .image-figure {
        page-break-inside: avoid;
    }
    
    /* 隐藏不需要打印的元素 */
    .no-print {
        display: none !important;
    }
}

/* 文档结构 */
.document {
    max-width: none;
    margin: 0;
    padding: 0;
}

.document-header {
    text-align: center;
    margin-bottom: 2em;
    padding-bottom: 1em;
    border-bottom: 2px solid #e1e4e8;
}

.document-title {
    font-size: 2.5em;
    margin-bottom: 0.5em;
    color: #1a1a1a;
}

.document-author,
.document-date {
    color: #666;
    margin: 0.3em 0;
}

.document-content {
    margin: 2em 0;
}

.document-footer {
    margin-top: 3em;
    padding-top: 1em;
    border-top: 1px solid #e1e4e8;
    text-align: center;
    color: #666;
    font-size: 0.9em;
}

/* 目录样式 */
.table-of-contents {
    margin: 2em 0;
    padding: 1em;
    background: #f8f9fa;
    border-radius: 6px;
}

.table-of-contents h2 {
    margin-top: 0;
    text-align: center;
}

.toc-list {
    list-style: none;
    padding: 0;
}

.toc-item {
    margin: 0.5em 0;
    padding-left: 0;
}

.toc-item.level-1 {
    font-weight: 600;
    margin-top: 1em;
}

.toc-item.level-2 {
    padding-left: 1em;
}

.toc-item.level-3 {
    padding-left: 2em;
}

.toc-item.level-4 {
    padding-left: 3em;
}

.toc-link {
    color: #333;
    text-decoration: none;
    display: flex;
    justify-content: space-between;
    align-items: center;
}

.toc-link:hover {
    color: #0366d6;
}

/* 代码块样式增强 */
.code-block {
    margin: 1.5em 0;
    border: 1px solid #e1e4e8;
    border-radius: 6px;
    overflow: hidden;
}

.code-header {
    background: #f6f8fa;
    padding: 0.5em 1em;
    border-bottom: 1px solid #e1e4e8;
    font-size: 0.85em;
    color: #586069;
}

.language-tag {
    font-weight: 600;
    text-transform: uppercase;
}

.code-content {
    margin: 0;
    background: #f8f8f8;
}

.code-content code {
    background: none;
}

/* 调用框样式 */
.callout {
    margin: 1em 0;
    padding: 1em;
    border-radius: 6px;
    border-left: 4px solid;
}

.callout-tip {
    background: #e6f7ff;
    border-left-color: #1890ff;
}

.callout-warning {
    background: #fff7e6;
    border-left-color: #fa8c16;
}

.callout-danger {
    background: #fff2f0;
    border-left-color: #f5222d;
}

.callout-info {
    background: #f6ffed;
    border-left-color: #52c41a;
}

/* 任务列表样式 */
.task-item {
    display: flex;
    align-items: center;
    margin: 0.3em 0;
}

.task-checkbox {
    margin-right: 0.5em;
    font-weight: bold;
}

.task-item.completed .task-text {
    text-decoration: line-through;
    color: #6a737d;
}

/* Mermaid 图表样式 */
.mermaid-container {
    text-align: center;
    margin: 2em 0;
    padding: 1em;
    background: #f8f9fa;
    border-radius: 6px;
}

/* 页眉页脚样式 */
.pdf-header,
.pdf-footer {
    font-size: 10px;
    color: #666;
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 0.5em 0;
}

.pdf-header {
    border-bottom: 1px solid #e1e4e8;
}

.pdf-footer {
    border-top: 1px solid #e1e4e8;
}
`
  }
  
  getBookStyles() {
    return `
/* 书籍样式 */
.book {
    font-size: 12px;
    line-height: 1.6;
}

/* 封面样式 */
.cover-page {
    height: 100vh;
    display: flex;
    align-items: center;
    justify-content: center;
    text-align: center;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
}

.cover-content {
    max-width: 600px;
    padding: 2em;
}

.book-title {
    font-size: 3em;
    font-weight: 700;
    margin-bottom: 0.5em;
    text-shadow: 2px 2px 4px rgba(0,0,0,0.3);
}

.book-subtitle {
    font-size: 1.5em;
    font-weight: 300;
    margin-bottom: 2em;
    opacity: 0.9;
}

.book-author {
    font-size: 1.2em;
    margin-bottom: 0.5em;
}

.book-version,
.book-date {
    font-size: 1em;
    opacity: 0.8;
    margin: 0.3em 0;
}

/* 目录页样式 */
.toc-page {
    padding: 2em 0;
}

.toc-title {
    text-align: center;
    font-size: 2.5em;
    margin-bottom: 2em;
    color: #1a1a1a;
}

.toc-content {
    max-width: 800px;
    margin: 0 auto;
}

.toc-entry {
    display: flex;
    align-items: baseline;
    margin: 0.8em 0;
    padding: 0.5em 0;
    border-bottom: 1px dotted #ddd;
}

.toc-entry.level-1 {
    font-weight: 600;
    font-size: 1.1em;
    margin-top: 1.5em;
}

.toc-entry.level-2 {
    padding-left: 1em;
}

.toc-entry.level-3 {
    padding-left: 2em;
    font-size: 0.95em;
}

.toc-chapter {
    color: #666;
    font-size: 0.9em;
    margin-right: 1em;
    min-width: 100px;
}

.toc-link {
    color: #333;
    text-decoration: none;
    flex: 1;
}

.toc-dots {
    flex: 1;
    border-bottom: 1px dotted #ccc;
    margin: 0 0.5em;
    height: 1px;
}

.toc-page-number {
    color: #666;
    font-weight: 500;
    min-width: 30px;
    text-align: right;
}

/* 章节样式 */
.chapter {
    margin: 2em 0;
}

.chapter-header {
    text-align: center;
    margin-bottom: 3em;
    padding-bottom: 1em;
    border-bottom: 2px solid #e1e4e8;
}

.chapter-title {
    font-size: 2.2em;
    color: #1a1a1a;
    margin-bottom: 0.5em;
}

.chapter-content {
    max-width: none;
}

/* 版权页样式 */
.copyright-page {
    height: 100vh;
    display: flex;
    align-items: center;
    justify-content: center;
    text-align: center;
}

.copyright-content {
    max-width: 500px;
    padding: 2em;
    border: 1px solid #e1e4e8;
    border-radius: 6px;
    background: #f8f9fa;
}

.copyright-content h2 {
    margin-top: 0;
    color: #1a1a1a;
}

.copyright-content p {
    margin: 0.5em 0;
    color: #666;
}

/* 打印优化 */
@media print {
    .cover-page,
    .toc-page,
    .copyright-page {
        page-break-after: always;
    }
    
    .chapter {
        page-break-before: always;
    }
    
    .chapter-header {
        page-break-after: avoid;
    }
}

/* 响应式调整 */
@media screen and (max-width: 768px) {
    .book-title {
        font-size: 2em;
    }
    
    .book-subtitle {
        font-size: 1.2em;
    }
    
    .toc-title {
        font-size: 2em;
    }
    
    .chapter-title {
        font-size: 1.8em;
    }
}
`
  }
  
  // 合并多个样式文件
  async combineStyles(styleNames) {
    const styles = []
    
    for (const name of styleNames) {
      const style = await this.loadStyles(name)
      styles.push(`/* ${name.toUpperCase()} STYLES */`)
      styles.push(style)
      styles.push('')
    }
    
    return styles.join('\n')
  }
  
  // 压缩 CSS
  minifyCSS(css) {
    return css
      .replace(/\/\*[\s\S]*?\*\//g, '') // 移除注释
      .replace(/\s+/g, ' ') // 压缩空白
      .replace(/;\s*}/g, '}') // 移除最后一个分号
      .replace(/\s*{\s*/g, '{') // 压缩大括号
      .replace(/\s*}\s*/g, '}')
      .replace(/\s*;\s*/g, ';') // 压缩分号
      .replace(/\s*:\s*/g, ':') // 压缩冒号
      .trim()
  }
  
  // 添加自定义样式
  addCustomStyles(customCSS) {
    this.styles.set('custom', customCSS)
  }
  
  // 清除缓存
  clearCache() {
    this.styles.clear()
  }
}
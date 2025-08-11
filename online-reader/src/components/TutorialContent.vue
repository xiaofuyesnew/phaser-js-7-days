<template>
  <div class="tutorial-content">
    <div v-if="loading" class="loading">
      加载中...
    </div>
    <div v-else class="content-wrapper">
      <!-- 章节导航 -->
      <div class="chapter-nav">
        <button 
          class="nav-btn prev" 
          @click="$emit('navigate', 'prev')"
          :disabled="!hasPrevChapter"
        >
          ← 上一章
        </button>
        <div class="chapter-info">
          <span class="chapter-number">{{ chapterInfo.day }}</span>
          <span class="chapter-title">{{ chapterInfo.title }}</span>
        </div>
        <button 
          class="nav-btn next" 
          @click="$emit('navigate', 'next')"
          :disabled="!hasNextChapter"
        >
          下一章 →
        </button>
      </div>

      <!-- 内容区域 -->
      <article class="article-content" v-html="processedContent"></article>

      <!-- 章节完成按钮 -->
      <div class="chapter-actions">
        <button 
          class="complete-btn"
          :class="{ completed: isCompleted }"
          @click="toggleComplete"
        >
          <span v-if="isCompleted">✓ 已完成</span>
          <span v-else>标记为完成</span>
        </button>
        
        <div class="action-buttons">
          <button class="action-btn" @click="runCode" v-if="hasRunnableCode">
            <span class="icon">▶</span>
            运行代码
          </button>
          <button class="action-btn" @click="downloadCode" v-if="hasDownloadableCode">
            <span class="icon">⬇</span>
            下载代码
          </button>
        </div>
      </div>

      <!-- 代码运行器 -->
      <div v-if="showCodeRunner" class="code-runner">
        <div class="runner-header">
          <h3>代码运行结果</h3>
          <button class="close-btn" @click="showCodeRunner = false">×</button>
        </div>
        <iframe 
          ref="codeFrame"
          class="code-frame"
          sandbox="allow-scripts allow-same-origin"
        ></iframe>
      </div>
    </div>
  </div>
</template>

<script>
import { tutorialData } from '../data/tutorialData.js'
import { codeRunner } from '../utils/codeRunner.js'

export default {
  name: 'TutorialContent',
  props: {
    chapter: String,
    content: String,
    loading: Boolean
  },
  emits: ['chapter-complete', 'navigate'],
  data() {
    return {
      showCodeRunner: false,
      isCompleted: false,
      processedContent: ''
    }
  },
  computed: {
    chapterInfo() {
      return tutorialData.chapters.find(c => c.id === this.chapter) || {}
    },
    
    hasPrevChapter() {
      const currentIndex = tutorialData.chapters.findIndex(c => c.id === this.chapter)
      return currentIndex > 0
    },
    
    hasNextChapter() {
      const currentIndex = tutorialData.chapters.findIndex(c => c.id === this.chapter)
      return currentIndex < tutorialData.chapters.length - 1
    },
    
    hasRunnableCode() {
      return this.processedContent.includes('data-runnable="true"')
    },
    
    hasDownloadableCode() {
      return this.processedContent.includes('<pre>')
    }
  },
  watch: {
    content: {
      immediate: true,
      handler(newContent) {
        if (newContent) {
          this.processContent(newContent)
        }
      }
    },
    
    chapter: {
      immediate: true,
      handler(newChapter) {
        if (newChapter) {
          this.loadChapterState()
        }
      }
    }
  },
  methods: {
    processContent(content) {
      // 处理代码块，添加复制按钮和运行功能
      let processed = content.replace(
        /<pre><code class="language-(\w+)">([\s\S]*?)<\/code><\/pre>/g,
        (match, language, code) => {
          const isRunnable = language === 'javascript' || language === 'html'
          const codeId = Math.random().toString(36).substr(2, 9)
          
          return `
            <div class="code-block" data-language="${language}" data-code-id="${codeId}">
              <div class="code-header">
                <span class="language-tag">${language.toUpperCase()}</span>
                <div class="code-actions">
                  <button class="copy-btn" onclick="copyCode('${codeId}')">复制</button>
                  ${isRunnable ? `<button class="run-btn" onclick="runCode('${codeId}')" data-runnable="true">运行</button>` : ''}
                </div>
              </div>
              <pre><code class="language-${language}" id="code-${codeId}">${code}</code></pre>
            </div>
          `
        }
      )
      
      // 处理 Mermaid 图表
      processed = processed.replace(
        /```mermaid\n([\s\S]*?)\n```/g,
        (match, diagram) => {
          const diagramId = Math.random().toString(36).substr(2, 9)
          return `<div class="mermaid" id="mermaid-${diagramId}">${diagram}</div>`
        }
      )
      
      this.processedContent = processed
      
      // 在下一个 tick 中初始化代码高亮和图表
      this.$nextTick(() => {
        this.initializeCodeHighlight()
        this.initializeMermaid()
        this.attachCodeActions()
      })
    },
    
    initializeCodeHighlight() {
      if (window.hljs) {
        document.querySelectorAll('pre code').forEach((block) => {
          window.hljs.highlightElement(block)
        })
      }
    },
    
    initializeMermaid() {
      if (window.mermaid) {
        window.mermaid.init(undefined, document.querySelectorAll('.mermaid'))
      }
    },
    
    attachCodeActions() {
      // 将复制和运行函数绑定到全局
      window.copyCode = this.copyCodeById
      window.runCode = this.runCodeById
    },
    
    copyCodeById(codeId) {
      const codeElement = document.getElementById(`code-${codeId}`)
      if (codeElement) {
        const code = codeElement.textContent
        navigator.clipboard.writeText(code).then(() => {
          this.showToast('代码已复制到剪贴板')
        })
      }
    },
    
    runCodeById(codeId) {
      const codeElement = document.getElementById(`code-${codeId}`)
      if (codeElement) {
        const code = codeElement.textContent
        const language = codeElement.className.match(/language-(\w+)/)?.[1]
        this.executeCode(code, language)
      }
    },
    
    executeCode(code, language) {
      this.showCodeRunner = true
      this.$nextTick(() => {
        codeRunner.run(code, language, this.$refs.codeFrame)
      })
    },
    
    runCode() {
      // 运行页面中第一个可运行的代码块
      const runnableCode = document.querySelector('[data-runnable="true"]')
      if (runnableCode) {
        runnableCode.click()
      }
    },
    
    downloadCode() {
      // 收集所有代码块并打包下载
      const codeBlocks = document.querySelectorAll('pre code')
      const codes = Array.from(codeBlocks).map((block, index) => {
        const language = block.className.match(/language-(\w+)/)?.[1] || 'txt'
        const extension = this.getFileExtension(language)
        return {
          filename: `example-${index + 1}.${extension}`,
          content: block.textContent
        }
      })
      
      this.downloadAsZip(codes, `${this.chapter}-code-examples.zip`)
    },
    
    getFileExtension(language) {
      const extensions = {
        javascript: 'js',
        html: 'html',
        css: 'css',
        json: 'json',
        markdown: 'md'
      }
      return extensions[language] || 'txt'
    },
    
    downloadAsZip(files, filename) {
      // 这里应该使用 JSZip 库来创建 ZIP 文件
      // 为了简化，这里只下载第一个文件
      if (files.length > 0) {
        const blob = new Blob([files[0].content], { type: 'text/plain' })
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = files[0].filename
        a.click()
        URL.revokeObjectURL(url)
      }
    },
    
    toggleComplete() {
      this.isCompleted = !this.isCompleted
      this.saveChapterState()
      
      if (this.isCompleted) {
        this.$emit('chapter-complete', this.chapter)
        this.showToast('章节已标记为完成！')
      }
    },
    
    loadChapterState() {
      const progress = JSON.parse(localStorage.getItem('phaser-tutorial-progress') || '{}')
      this.isCompleted = progress.completedChapters?.includes(this.chapter) || false
    },
    
    saveChapterState() {
      const progress = JSON.parse(localStorage.getItem('phaser-tutorial-progress') || '{}')
      if (!progress.completedChapters) {
        progress.completedChapters = []
      }
      
      if (this.isCompleted && !progress.completedChapters.includes(this.chapter)) {
        progress.completedChapters.push(this.chapter)
      } else if (!this.isCompleted) {
        progress.completedChapters = progress.completedChapters.filter(c => c !== this.chapter)
      }
      
      progress.lastUpdated = new Date().toISOString()
      localStorage.setItem('phaser-tutorial-progress', JSON.stringify(progress))
    },
    
    showToast(message) {
      // 简单的 toast 提示
      const toast = document.createElement('div')
      toast.className = 'toast'
      toast.textContent = message
      toast.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: #38a169;
        color: white;
        padding: 1rem 1.5rem;
        border-radius: 0.5rem;
        z-index: 1000;
        animation: slideIn 0.3s ease;
      `
      
      document.body.appendChild(toast)
      setTimeout(() => {
        toast.remove()
      }, 3000)
    }
  }
}
</script>

<style scoped>
.tutorial-content {
  max-width: 800px;
  margin: 0 auto;
  padding: 2rem;
}

.loading {
  text-align: center;
  padding: 4rem;
  color: #718096;
  font-size: 1.125rem;
}

.chapter-nav {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
  padding: 1rem;
  background: #f7fafc;
  border-radius: 0.5rem;
}

.nav-btn {
  background: #3182ce;
  color: white;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 0.25rem;
  cursor: pointer;
  transition: all 0.3s ease;
}

.nav-btn:hover:not(:disabled) {
  background: #2c5aa0;
}

.nav-btn:disabled {
  background: #cbd5e0;
  cursor: not-allowed;
}

.chapter-info {
  text-align: center;
}

.chapter-number {
  display: block;
  font-size: 0.875rem;
  color: #718096;
  margin-bottom: 0.25rem;
}

.chapter-title {
  font-weight: 600;
  color: #1a202c;
}

.article-content {
  line-height: 1.7;
  color: #4a5568;
}

.chapter-actions {
  margin-top: 3rem;
  padding-top: 2rem;
  border-top: 1px solid #e2e8f0;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.complete-btn {
  background: #e2e8f0;
  color: #4a5568;
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 0.5rem;
  cursor: pointer;
  transition: all 0.3s ease;
  font-weight: 500;
}

.complete-btn.completed {
  background: #38a169;
  color: white;
}

.complete-btn:hover {
  transform: translateY(-1px);
}

.action-buttons {
  display: flex;
  gap: 1rem;
}

.action-btn {
  background: #3182ce;
  color: white;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 0.25rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  transition: all 0.3s ease;
}

.action-btn:hover {
  background: #2c5aa0;
}

.icon {
  font-size: 0.875rem;
}

.code-runner {
  margin-top: 2rem;
  border: 1px solid #e2e8f0;
  border-radius: 0.5rem;
  overflow: hidden;
}

.runner-header {
  background: #f7fafc;
  padding: 1rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid #e2e8f0;
}

.runner-header h3 {
  margin: 0;
  font-size: 1rem;
  font-weight: 600;
}

.close-btn {
  background: none;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  color: #718096;
}

.close-btn:hover {
  color: #4a5568;
}

.code-frame {
  width: 100%;
  height: 400px;
  border: none;
  background: white;
}

/* 全局样式 - 代码块 */
:deep(.code-block) {
  margin: 1.5rem 0;
  border-radius: 0.5rem;
  overflow: hidden;
  border: 1px solid #e2e8f0;
}

:deep(.code-header) {
  background: #f7fafc;
  padding: 0.75rem 1rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid #e2e8f0;
}

:deep(.language-tag) {
  font-size: 0.75rem;
  font-weight: 600;
  color: #4a5568;
  text-transform: uppercase;
}

:deep(.code-actions) {
  display: flex;
  gap: 0.5rem;
}

:deep(.copy-btn),
:deep(.run-btn) {
  background: #3182ce;
  color: white;
  border: none;
  padding: 0.25rem 0.75rem;
  border-radius: 0.25rem;
  font-size: 0.75rem;
  cursor: pointer;
  transition: all 0.3s ease;
}

:deep(.copy-btn:hover),
:deep(.run-btn:hover) {
  background: #2c5aa0;
}

:deep(.run-btn) {
  background: #38a169;
}

:deep(.run-btn:hover) {
  background: #2f855a;
}

:deep(pre) {
  margin: 0;
  padding: 1.5rem;
  background: #1a202c;
  overflow-x: auto;
}

:deep(code) {
  font-family: 'Fira Code', 'Monaco', 'Consolas', monospace;
  font-size: 0.875rem;
  line-height: 1.5;
}

/* Mermaid 图表样式 */
:deep(.mermaid) {
  text-align: center;
  margin: 2rem 0;
  padding: 1rem;
  background: #f7fafc;
  border-radius: 0.5rem;
}

/* Toast 动画 */
@keyframes slideIn {
  from {
    transform: translateX(100%);
    opacity: 0;
  }
  to {
    transform: translateX(0);
    opacity: 1;
  }
}

/* 响应式设计 */
@media (max-width: 768px) {
  .tutorial-content {
    padding: 1rem;
  }
  
  .chapter-nav {
    flex-direction: column;
    gap: 1rem;
  }
  
  .chapter-actions {
    flex-direction: column;
    gap: 1rem;
    align-items: stretch;
  }
  
  .action-buttons {
    justify-content: center;
  }
}
</style>
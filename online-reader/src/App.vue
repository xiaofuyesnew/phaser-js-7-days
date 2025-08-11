<template>
  <div id="app">
    <!-- 顶部导航栏 -->
    <header class="header">
      <div class="header-content">
        <div class="logo">
          <h1>Phaser.js 7天教程</h1>
          <span class="subtitle">从零基础到完整游戏</span>
        </div>
        <nav class="nav">
          <button 
            class="nav-btn"
            :class="{ active: currentView === 'home' }"
            @click="setView('home')"
          >
            首页
          </button>
          <button 
            class="nav-btn"
            :class="{ active: currentView === 'tutorial' }"
            @click="setView('tutorial')"
          >
            教程
          </button>
          <button 
            class="nav-btn"
            :class="{ active: currentView === 'progress' }"
            @click="setView('progress')"
          >
            进度
          </button>
        </nav>
      </div>
    </header>

    <!-- 主要内容区域 -->
    <main class="main">
      <!-- 侧边栏 -->
      <aside class="sidebar" v-if="currentView === 'tutorial'">
        <div class="sidebar-content">
          <h3>学习目录</h3>
          <nav class="chapter-nav">
            <div 
              v-for="chapter in chapters" 
              :key="chapter.id"
              class="chapter-item"
              :class="{ 
                active: currentChapter === chapter.id,
                completed: isChapterCompleted(chapter.id)
              }"
              @click="loadChapter(chapter.id)"
            >
              <div class="chapter-icon">
                <span v-if="isChapterCompleted(chapter.id)">✓</span>
                <span v-else>{{ chapter.day }}</span>
              </div>
              <div class="chapter-info">
                <h4>{{ chapter.title }}</h4>
                <p>{{ chapter.description }}</p>
              </div>
            </div>
          </nav>
        </div>
      </aside>

      <!-- 内容区域 -->
      <div class="content" :class="{ 'full-width': currentView !== 'tutorial' }">
        <!-- 首页 -->
        <div v-if="currentView === 'home'" class="home-view">
          <HomeView @start-tutorial="startTutorial" />
        </div>

        <!-- 教程内容 -->
        <div v-else-if="currentView === 'tutorial'" class="tutorial-view">
          <TutorialContent 
            :chapter="currentChapter"
            :content="currentContent"
            :loading="contentLoading"
            @chapter-complete="markChapterComplete"
          />
        </div>

        <!-- 进度页面 -->
        <div v-else-if="currentView === 'progress'" class="progress-view">
          <ProgressView :progress="learningProgress" />
        </div>
      </div>
    </main>
  </div>
</template>

<script>
import HomeView from './components/HomeView.vue'
import TutorialContent from './components/TutorialContent.vue'
import ProgressView from './components/ProgressView.vue'
import { tutorialData } from './data/tutorialData.js'
import { markdownRenderer } from './utils/markdownRenderer.js'

export default {
  name: 'App',
  components: {
    HomeView,
    TutorialContent,
    ProgressView
  },
  data() {
    return {
      currentView: 'home',
      currentChapter: null,
      currentContent: '',
      contentLoading: false,
      chapters: tutorialData.chapters,
      learningProgress: this.loadProgress()
    }
  },
  methods: {
    setView(view) {
      this.currentView = view
    },
    
    startTutorial() {
      this.currentView = 'tutorial'
      this.loadChapter('day1')
    },
    
    async loadChapter(chapterId) {
      this.currentChapter = chapterId
      this.contentLoading = true
      
      try {
        const chapter = this.chapters.find(c => c.id === chapterId)
        if (chapter) {
          // 模拟加载 Markdown 内容
          const markdownContent = await this.fetchChapterContent(chapterId)
          this.currentContent = await markdownRenderer.render(markdownContent)
        }
      } catch (error) {
        console.error('加载章节内容失败:', error)
        this.currentContent = '<p>内容加载失败，请稍后重试。</p>'
      } finally {
        this.contentLoading = false
      }
    },
    
    async fetchChapterContent(chapterId) {
      // 这里应该从实际的 Markdown 文件加载内容
      // 现在返回示例内容
      const chapter = this.chapters.find(c => c.id === chapterId)
      return `# ${chapter.title}

## 学习目标

${chapter.objectives.map(obj => `- ${obj}`).join('\n')}

## 内容概述

${chapter.description}

## 代码示例

\`\`\`javascript
// Phaser.js 基础示例
const config = {
    type: Phaser.AUTO,
    width: 800,
    height: 600,
    scene: {
        preload: preload,
        create: create,
        update: update
    }
};

function preload() {
    // 加载游戏资源
}

function create() {
    // 创建游戏对象
}

function update() {
    // 游戏循环更新
}

const game = new Phaser.Game(config);
\`\`\`

## 实践练习

1. 创建基础的 Phaser 游戏配置
2. 实现简单的场景切换
3. 添加基本的游戏对象

## 本章小结

通过本章学习，你应该掌握了 Phaser.js 的基础概念和基本用法。`
    },
    
    markChapterComplete(chapterId) {
      if (!this.learningProgress.completedChapters.includes(chapterId)) {
        this.learningProgress.completedChapters.push(chapterId)
        this.learningProgress.lastUpdated = new Date().toISOString()
        this.saveProgress()
      }
    },
    
    isChapterCompleted(chapterId) {
      return this.learningProgress.completedChapters.includes(chapterId)
    },
    
    loadProgress() {
      const saved = localStorage.getItem('phaser-tutorial-progress')
      if (saved) {
        return JSON.parse(saved)
      }
      return {
        completedChapters: [],
        currentChapter: null,
        startDate: new Date().toISOString(),
        lastUpdated: new Date().toISOString()
      }
    },
    
    saveProgress() {
      localStorage.setItem('phaser-tutorial-progress', JSON.stringify(this.learningProgress))
    }
  }
}
</script>
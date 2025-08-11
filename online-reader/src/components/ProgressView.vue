<template>
  <div class="progress-view">
    <div class="container">
      <div class="progress-header">
        <h1>学习进度</h1>
        <p>跟踪你的 Phaser.js 学习之旅</p>
      </div>

      <!-- 总体进度 -->
      <div class="overall-progress">
        <div class="progress-card">
          <div class="progress-info">
            <h2>总体进度</h2>
            <div class="progress-stats">
              <span class="completed">{{ completedCount }}</span>
              <span class="separator">/</span>
              <span class="total">{{ totalChapters }}</span>
              <span class="label">章节完成</span>
            </div>
          </div>
          <div class="progress-circle">
            <svg class="circle-svg" viewBox="0 0 120 120">
              <circle
                class="circle-bg"
                cx="60"
                cy="60"
                r="50"
                fill="none"
                stroke="#e2e8f0"
                stroke-width="8"
              />
              <circle
                class="circle-progress"
                cx="60"
                cy="60"
                r="50"
                fill="none"
                stroke="#3182ce"
                stroke-width="8"
                stroke-linecap="round"
                :stroke-dasharray="circumference"
                :stroke-dashoffset="progressOffset"
                transform="rotate(-90 60 60)"
              />
            </svg>
            <div class="circle-text">
              <span class="percentage">{{ progressPercentage }}%</span>
            </div>
          </div>
        </div>
      </div>

      <!-- 学习统计 -->
      <div class="stats-grid">
        <div class="stat-card">
          <div class="stat-icon">📅</div>
          <div class="stat-info">
            <h3>学习天数</h3>
            <p class="stat-value">{{ studyDays }}</p>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon">⏱️</div>
          <div class="stat-info">
            <h3>预计剩余时间</h3>
            <p class="stat-value">{{ remainingTime }}</p>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon">🎯</div>
          <div class="stat-info">
            <h3>当前目标</h3>
            <p class="stat-value">{{ currentGoal }}</p>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon">🏆</div>
          <div class="stat-info">
            <h3>完成度</h3>
            <p class="stat-value">{{ completionLevel }}</p>
          </div>
        </div>
      </div>

      <!-- 章节进度详情 -->
      <div class="chapters-progress">
        <h2>章节详情</h2>
        <div class="chapters-list">
          <div 
            v-for="chapter in chaptersWithProgress" 
            :key="chapter.id"
            class="chapter-progress-item"
            :class="{ 
              completed: chapter.completed,
              current: chapter.current
            }"
          >
            <div class="chapter-status">
              <div class="status-icon">
                <span v-if="chapter.completed">✓</span>
                <span v-else-if="chapter.current">📖</span>
                <span v-else>{{ chapter.day }}</span>
              </div>
            </div>
            <div class="chapter-details">
              <h3>{{ chapter.title }}</h3>
              <p>{{ chapter.description }}</p>
              <div class="chapter-meta">
                <span class="difficulty">难度: {{ chapter.difficulty }}</span>
                <span class="duration">预计时间: {{ chapter.duration }}</span>
              </div>
              <div v-if="chapter.completedAt" class="completion-info">
                完成于: {{ formatDate(chapter.completedAt) }}
              </div>
            </div>
            <div class="chapter-actions">
              <button 
                v-if="!chapter.completed"
                class="start-btn"
                @click="startChapter(chapter.id)"
              >
                {{ chapter.current ? '继续学习' : '开始学习' }}
              </button>
              <button 
                v-else
                class="review-btn"
                @click="reviewChapter(chapter.id)"
              >
                复习
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- 学习建议 -->
      <div class="recommendations">
        <h2>学习建议</h2>
        <div class="recommendation-cards">
          <div 
            v-for="recommendation in recommendations" 
            :key="recommendation.type"
            class="recommendation-card"
            :class="recommendation.type"
          >
            <div class="recommendation-icon">{{ recommendation.icon }}</div>
            <div class="recommendation-content">
              <h3>{{ recommendation.title }}</h3>
              <p>{{ recommendation.message }}</p>
              <button 
                v-if="recommendation.action"
                class="recommendation-btn"
                @click="handleRecommendation(recommendation.action)"
              >
                {{ recommendation.actionText }}
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- 成就系统 -->
      <div class="achievements">
        <h2>学习成就</h2>
        <div class="achievements-grid">
          <div 
            v-for="achievement in achievements" 
            :key="achievement.id"
            class="achievement-card"
            :class="{ unlocked: achievement.unlocked }"
          >
            <div class="achievement-icon">{{ achievement.icon }}</div>
            <div class="achievement-info">
              <h3>{{ achievement.title }}</h3>
              <p>{{ achievement.description }}</p>
              <div class="achievement-progress" v-if="!achievement.unlocked">
                <div class="progress-bar">
                  <div 
                    class="progress-fill"
                    :style="{ width: achievement.progress + '%' }"
                  ></div>
                </div>
                <span class="progress-text">{{ achievement.progress }}%</span>
              </div>
              <div v-else class="unlocked-date">
                解锁于: {{ formatDate(achievement.unlockedAt) }}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { tutorialData } from '../data/tutorialData.js'

export default {
  name: 'ProgressView',
  props: {
    progress: {
      type: Object,
      default: () => ({})
    }
  },
  computed: {
    totalChapters() {
      return tutorialData.chapters.length
    },
    
    completedCount() {
      return this.progress.completedChapters?.length || 0
    },
    
    progressPercentage() {
      return Math.round((this.completedCount / this.totalChapters) * 100)
    },
    
    circumference() {
      return 2 * Math.PI * 50 // radius = 50
    },
    
    progressOffset() {
      const progress = this.progressPercentage / 100
      return this.circumference * (1 - progress)
    },
    
    studyDays() {
      if (!this.progress.startDate) return 0
      const start = new Date(this.progress.startDate)
      const now = new Date()
      const diffTime = Math.abs(now - start)
      return Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    },
    
    remainingTime() {
      const remaining = this.totalChapters - this.completedCount
      if (remaining === 0) return '已完成'
      return `${remaining} 天`
    },
    
    currentGoal() {
      if (this.completedCount === this.totalChapters) {
        return '全部完成！'
      }
      const nextChapter = tutorialData.chapters[this.completedCount]
      return nextChapter ? nextChapter.title : '开始学习'
    },
    
    completionLevel() {
      const percentage = this.progressPercentage
      if (percentage === 100) return '大师'
      if (percentage >= 80) return '专家'
      if (percentage >= 60) return '熟练'
      if (percentage >= 40) return '进阶'
      if (percentage >= 20) return '入门'
      return '新手'
    },
    
    chaptersWithProgress() {
      return tutorialData.chapters.map((chapter, index) => {
        const completed = this.progress.completedChapters?.includes(chapter.id) || false
        const current = !completed && index === this.completedCount
        
        return {
          ...chapter,
          completed,
          current,
          completedAt: completed ? this.progress.lastUpdated : null,
          difficulty: this.getChapterDifficulty(chapter.id),
          duration: this.getChapterDuration(chapter.id)
        }
      })
    },
    
    recommendations() {
      const recs = []
      
      if (this.completedCount === 0) {
        recs.push({
          type: 'start',
          icon: '🚀',
          title: '开始你的学习之旅',
          message: '从第一章开始，建立 Phaser.js 的基础知识。',
          action: 'start-learning',
          actionText: '开始学习'
        })
      } else if (this.completedCount < this.totalChapters) {
        const nextChapter = tutorialData.chapters[this.completedCount]
        recs.push({
          type: 'continue',
          icon: '📚',
          title: '继续学习进度',
          message: `继续学习 "${nextChapter.title}"，保持学习节奏。`,
          action: 'continue-learning',
          actionText: '继续学习'
        })
      }
      
      if (this.studyDays > 3 && this.completedCount < 3) {
        recs.push({
          type: 'motivation',
          icon: '💪',
          title: '保持学习动力',
          message: '学习需要坚持，每天花一点时间就能看到进步。',
          action: 'set-reminder',
          actionText: '设置提醒'
        })
      }
      
      if (this.completedCount === this.totalChapters) {
        recs.push({
          type: 'celebration',
          icon: '🎉',
          title: '恭喜完成所有章节！',
          message: '你已经掌握了 Phaser.js 的核心知识，可以开始创建自己的游戏了。',
          action: 'start-project',
          actionText: '开始项目'
        })
      }
      
      return recs
    },
    
    achievements() {
      return [
        {
          id: 'first-step',
          title: '第一步',
          description: '完成第一章学习',
          icon: '👶',
          unlocked: this.completedCount >= 1,
          progress: Math.min(this.completedCount * 100, 100),
          unlockedAt: this.completedCount >= 1 ? this.progress.lastUpdated : null
        },
        {
          id: 'halfway',
          title: '半程马拉松',
          description: '完成一半的章节',
          icon: '🏃',
          unlocked: this.completedCount >= Math.ceil(this.totalChapters / 2),
          progress: Math.min((this.completedCount / Math.ceil(this.totalChapters / 2)) * 100, 100),
          unlockedAt: this.completedCount >= Math.ceil(this.totalChapters / 2) ? this.progress.lastUpdated : null
        },
        {
          id: 'master',
          title: '游戏开发大师',
          description: '完成所有章节',
          icon: '🎓',
          unlocked: this.completedCount === this.totalChapters,
          progress: this.progressPercentage,
          unlockedAt: this.completedCount === this.totalChapters ? this.progress.lastUpdated : null
        },
        {
          id: 'consistent',
          title: '坚持不懈',
          description: '连续7天学习',
          icon: '🔥',
          unlocked: this.studyDays >= 7,
          progress: Math.min((this.studyDays / 7) * 100, 100),
          unlockedAt: this.studyDays >= 7 ? this.progress.lastUpdated : null
        }
      ]
    }
  },
  methods: {
    getChapterDifficulty(chapterId) {
      const difficulties = {
        day1: '入门',
        day2: '入门',
        day3: '中级',
        day4: '中级',
        day5: '中级',
        day6: '高级',
        day7: '高级'
      }
      return difficulties[chapterId] || '中级'
    },
    
    getChapterDuration(chapterId) {
      const durations = {
        day1: '2-3小时',
        day2: '2-3小时',
        day3: '3-4小时',
        day4: '2-3小时',
        day5: '3-4小时',
        day6: '3-4小时',
        day7: '2-3小时'
      }
      return durations[chapterId] || '2-3小时'
    },
    
    formatDate(dateString) {
      if (!dateString) return ''
      const date = new Date(dateString)
      return date.toLocaleDateString('zh-CN', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      })
    },
    
    startChapter(chapterId) {
      this.$emit('navigate-to-chapter', chapterId)
    },
    
    reviewChapter(chapterId) {
      this.$emit('navigate-to-chapter', chapterId)
    },
    
    handleRecommendation(action) {
      switch (action) {
        case 'start-learning':
        case 'continue-learning':
          this.$emit('start-tutorial')
          break
        case 'set-reminder':
          this.setStudyReminder()
          break
        case 'start-project':
          this.openProjectGuide()
          break
      }
    },
    
    setStudyReminder() {
      // 这里可以集成浏览器通知 API
      if ('Notification' in window) {
        Notification.requestPermission().then(permission => {
          if (permission === 'granted') {
            alert('学习提醒已设置！我们会在适当的时候提醒你继续学习。')
          }
        })
      } else {
        alert('你的浏览器不支持通知功能，请手动设置学习提醒。')
      }
    },
    
    openProjectGuide() {
      // 打开项目指导页面
      window.open('/project-guide', '_blank')
    }
  }
}
</script>

<style scoped>
.progress-view {
  padding: 2rem;
  max-width: 1200px;
  margin: 0 auto;
}

.container {
  width: 100%;
}

.progress-header {
  text-align: center;
  margin-bottom: 3rem;
}

.progress-header h1 {
  font-size: 2.5rem;
  font-weight: 700;
  color: #1a202c;
  margin-bottom: 0.5rem;
}

.progress-header p {
  font-size: 1.125rem;
  color: #718096;
}

.overall-progress {
  margin-bottom: 3rem;
}

.progress-card {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 2rem;
  border-radius: 1rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.progress-info h2 {
  font-size: 1.5rem;
  margin-bottom: 1rem;
}

.progress-stats {
  display: flex;
  align-items: baseline;
  gap: 0.5rem;
}

.completed {
  font-size: 3rem;
  font-weight: 700;
}

.separator {
  font-size: 2rem;
  opacity: 0.7;
}

.total {
  font-size: 2rem;
  font-weight: 600;
  opacity: 0.8;
}

.label {
  font-size: 1rem;
  opacity: 0.9;
  margin-left: 0.5rem;
}

.progress-circle {
  position: relative;
  width: 120px;
  height: 120px;
}

.circle-svg {
  width: 100%;
  height: 100%;
  transform: rotate(-90deg);
}

.circle-progress {
  transition: stroke-dashoffset 0.5s ease;
}

.circle-text {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  text-align: center;
}

.percentage {
  font-size: 1.5rem;
  font-weight: 700;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1.5rem;
  margin-bottom: 3rem;
}

.stat-card {
  background: white;
  padding: 1.5rem;
  border-radius: 0.5rem;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  display: flex;
  align-items: center;
  gap: 1rem;
}

.stat-icon {
  font-size: 2rem;
  width: 60px;
  height: 60px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f7fafc;
  border-radius: 50%;
}

.stat-info h3 {
  font-size: 0.875rem;
  color: #718096;
  margin-bottom: 0.25rem;
  text-transform: uppercase;
  font-weight: 600;
}

.stat-value {
  font-size: 1.5rem;
  font-weight: 700;
  color: #1a202c;
  margin: 0;
}

.chapters-progress {
  margin-bottom: 3rem;
}

.chapters-progress h2 {
  font-size: 1.5rem;
  font-weight: 600;
  margin-bottom: 1.5rem;
  color: #1a202c;
}

.chapters-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.chapter-progress-item {
  background: white;
  border-radius: 0.5rem;
  padding: 1.5rem;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  display: flex;
  align-items: center;
  gap: 1.5rem;
  transition: all 0.3s ease;
}

.chapter-progress-item:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0,0,0,0.15);
}

.chapter-progress-item.completed {
  background: #f0fff4;
  border-left: 4px solid #38a169;
}

.chapter-progress-item.current {
  background: #ebf8ff;
  border-left: 4px solid #3182ce;
}

.chapter-status {
  flex-shrink: 0;
}

.status-icon {
  width: 50px;
  height: 50px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  background: #e2e8f0;
  color: #4a5568;
}

.chapter-progress-item.completed .status-icon {
  background: #38a169;
  color: white;
}

.chapter-progress-item.current .status-icon {
  background: #3182ce;
  color: white;
}

.chapter-details {
  flex: 1;
}

.chapter-details h3 {
  font-size: 1.125rem;
  font-weight: 600;
  margin-bottom: 0.5rem;
  color: #1a202c;
}

.chapter-details p {
  color: #718096;
  margin-bottom: 0.75rem;
  line-height: 1.5;
}

.chapter-meta {
  display: flex;
  gap: 1rem;
  font-size: 0.875rem;
  color: #4a5568;
}

.completion-info {
  font-size: 0.875rem;
  color: #38a169;
  margin-top: 0.5rem;
}

.chapter-actions {
  flex-shrink: 0;
}

.start-btn,
.review-btn {
  background: #3182ce;
  color: white;
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 0.25rem;
  cursor: pointer;
  font-weight: 500;
  transition: all 0.3s ease;
}

.start-btn:hover,
.review-btn:hover {
  background: #2c5aa0;
}

.review-btn {
  background: #718096;
}

.review-btn:hover {
  background: #4a5568;
}

.recommendations {
  margin-bottom: 3rem;
}

.recommendations h2 {
  font-size: 1.5rem;
  font-weight: 600;
  margin-bottom: 1.5rem;
  color: #1a202c;
}

.recommendation-cards {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.recommendation-card {
  background: white;
  border-radius: 0.5rem;
  padding: 1.5rem;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  display: flex;
  align-items: center;
  gap: 1rem;
}

.recommendation-card.start {
  border-left: 4px solid #3182ce;
}

.recommendation-card.continue {
  border-left: 4px solid #38a169;
}

.recommendation-card.motivation {
  border-left: 4px solid #ed8936;
}

.recommendation-card.celebration {
  border-left: 4px solid #9f7aea;
}

.recommendation-icon {
  font-size: 2rem;
  width: 60px;
  height: 60px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f7fafc;
  border-radius: 50%;
  flex-shrink: 0;
}

.recommendation-content {
  flex: 1;
}

.recommendation-content h3 {
  font-size: 1.125rem;
  font-weight: 600;
  margin-bottom: 0.5rem;
  color: #1a202c;
}

.recommendation-content p {
  color: #718096;
  margin-bottom: 1rem;
  line-height: 1.5;
}

.recommendation-btn {
  background: #3182ce;
  color: white;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 0.25rem;
  cursor: pointer;
  font-weight: 500;
  transition: all 0.3s ease;
}

.recommendation-btn:hover {
  background: #2c5aa0;
}

.achievements h2 {
  font-size: 1.5rem;
  font-weight: 600;
  margin-bottom: 1.5rem;
  color: #1a202c;
}

.achievements-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 1.5rem;
}

.achievement-card {
  background: white;
  border-radius: 0.5rem;
  padding: 1.5rem;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  display: flex;
  align-items: center;
  gap: 1rem;
  opacity: 0.6;
  transition: all 0.3s ease;
}

.achievement-card.unlocked {
  opacity: 1;
  background: linear-gradient(135deg, #ffd89b 0%, #19547b 100%);
  color: white;
}

.achievement-icon {
  font-size: 2rem;
  width: 60px;
  height: 60px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(255,255,255,0.1);
  border-radius: 50%;
  flex-shrink: 0;
}

.achievement-info {
  flex: 1;
}

.achievement-info h3 {
  font-size: 1.125rem;
  font-weight: 600;
  margin-bottom: 0.5rem;
}

.achievement-info p {
  margin-bottom: 0.75rem;
  line-height: 1.5;
  opacity: 0.9;
}

.achievement-progress {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.progress-bar {
  flex: 1;
  height: 6px;
  background: rgba(255,255,255,0.2);
  border-radius: 3px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: #3182ce;
  transition: width 0.3s ease;
}

.progress-text {
  font-size: 0.875rem;
  font-weight: 500;
}

.unlocked-date {
  font-size: 0.875rem;
  opacity: 0.8;
}

@media (max-width: 768px) {
  .progress-view {
    padding: 1rem;
  }
  
  .progress-card {
    flex-direction: column;
    text-align: center;
    gap: 2rem;
  }
  
  .stats-grid {
    grid-template-columns: 1fr;
  }
  
  .chapter-progress-item {
    flex-direction: column;
    text-align: center;
    gap: 1rem;
  }
  
  .chapter-meta {
    justify-content: center;
  }
  
  .recommendation-card {
    flex-direction: column;
    text-align: center;
  }
  
  .achievements-grid {
    grid-template-columns: 1fr;
  }
  
  .achievement-card {
    flex-direction: column;
    text-align: center;
  }
}
</style>
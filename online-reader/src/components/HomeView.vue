<template>
  <div class="home-view">
    <div class="hero-section">
      <div class="hero-content">
        <h1 class="hero-title">7天掌握 Phaser.js 游戏开发</h1>
        <p class="hero-subtitle">
          从零基础到完整游戏项目，循序渐进的学习路径，
          让你快速入门HTML5游戏开发
        </p>
        <div class="hero-actions">
          <button class="btn-primary" @click="$emit('start-tutorial')">
            开始学习
          </button>
          <button class="btn-secondary" @click="scrollToFeatures">
            了解更多
          </button>
        </div>
      </div>
      <div class="hero-image">
        <div class="game-preview">
          <div class="game-screen">
            <div class="game-element player"></div>
            <div class="game-element enemy"></div>
            <div class="game-element platform"></div>
          </div>
        </div>
      </div>
    </div>

    <div class="features-section" ref="featuresSection">
      <div class="container">
        <h2 class="section-title">为什么选择这个教程？</h2>
        <div class="features-grid">
          <div class="feature-card">
            <div class="feature-icon">📚</div>
            <h3>循序渐进</h3>
            <p>7天学习计划，每天一个主题，从基础概念到完整项目</p>
          </div>
          <div class="feature-card">
            <div class="feature-icon">💻</div>
            <h3>实战导向</h3>
            <p>每天都有可运行的代码示例和实践练习</p>
          </div>
          <div class="feature-card">
            <div class="feature-icon">🎮</div>
            <h3>完整项目</h3>
            <p>最终制作出一款完整的卷轴滚动游戏</p>
          </div>
          <div class="feature-card">
            <div class="feature-icon">📱</div>
            <h3>响应式学习</h3>
            <p>支持多设备访问，随时随地学习</p>
          </div>
        </div>
      </div>
    </div>

    <div class="curriculum-section">
      <div class="container">
        <h2 class="section-title">学习路径</h2>
        <div class="curriculum-timeline">
          <div 
            v-for="(day, index) in curriculum" 
            :key="day.id"
            class="timeline-item"
            :class="{ 'timeline-item-right': index % 2 === 1 }"
          >
            <div class="timeline-marker">
              <span>{{ day.day }}</span>
            </div>
            <div class="timeline-content">
              <h3>{{ day.title }}</h3>
              <p>{{ day.description }}</p>
              <ul class="objectives-list">
                <li v-for="objective in day.objectives.slice(0, 3)" :key="objective">
                  {{ objective }}
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="cta-section">
      <div class="container">
        <div class="cta-content">
          <h2>准备开始你的游戏开发之旅吗？</h2>
          <p>加入数千名开发者，一起学习 Phaser.js 游戏开发</p>
          <button class="btn-primary large" @click="$emit('start-tutorial')">
            立即开始学习
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { tutorialData } from '../data/tutorialData.js'

export default {
  name: 'HomeView',
  emits: ['start-tutorial'],
  data() {
    return {
      curriculum: tutorialData.chapters
    }
  },
  methods: {
    scrollToFeatures() {
      this.$refs.featuresSection.scrollIntoView({ 
        behavior: 'smooth' 
      })
    }
  }
}
</script>

<style scoped>
.home-view {
  width: 100%;
}

.hero-section {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 4rem 2rem;
  display: flex;
  align-items: center;
  min-height: 500px;
}

.hero-content {
  flex: 1;
  max-width: 600px;
}

.hero-title {
  font-size: 3rem;
  font-weight: 700;
  margin-bottom: 1rem;
  line-height: 1.2;
}

.hero-subtitle {
  font-size: 1.25rem;
  margin-bottom: 2rem;
  opacity: 0.9;
  line-height: 1.6;
}

.hero-actions {
  display: flex;
  gap: 1rem;
}

.btn-primary {
  background: white;
  color: #667eea;
  border: none;
  padding: 1rem 2rem;
  border-radius: 0.5rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
}

.btn-primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0,0,0,0.15);
}

.btn-primary.large {
  padding: 1.25rem 2.5rem;
  font-size: 1.125rem;
}

.btn-secondary {
  background: transparent;
  color: white;
  border: 2px solid rgba(255,255,255,0.3);
  padding: 1rem 2rem;
  border-radius: 0.5rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
}

.btn-secondary:hover {
  background: rgba(255,255,255,0.1);
  border-color: rgba(255,255,255,0.5);
}

.hero-image {
  flex: 1;
  display: flex;
  justify-content: center;
  align-items: center;
}

.game-preview {
  width: 300px;
  height: 200px;
  background: #1a202c;
  border-radius: 1rem;
  padding: 1rem;
  position: relative;
  overflow: hidden;
}

.game-screen {
  width: 100%;
  height: 100%;
  background: linear-gradient(to bottom, #4299e1, #63b3ed);
  border-radius: 0.5rem;
  position: relative;
}

.game-element {
  position: absolute;
  border-radius: 0.25rem;
}

.player {
  width: 20px;
  height: 20px;
  background: #f56565;
  bottom: 60px;
  left: 50px;
  animation: bounce 2s infinite;
}

.enemy {
  width: 16px;
  height: 16px;
  background: #9f7aea;
  bottom: 60px;
  right: 50px;
  animation: float 3s infinite;
}

.platform {
  width: 80%;
  height: 20px;
  background: #38a169;
  bottom: 40px;
  left: 10%;
}

@keyframes bounce {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-10px); }
}

@keyframes float {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-5px); }
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 2rem;
}

.features-section {
  padding: 4rem 0;
  background: white;
}

.section-title {
  text-align: center;
  font-size: 2.5rem;
  font-weight: 700;
  margin-bottom: 3rem;
  color: #1a202c;
}

.features-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 2rem;
}

.feature-card {
  text-align: center;
  padding: 2rem;
  border-radius: 1rem;
  background: #f7fafc;
  transition: all 0.3s ease;
}

.feature-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 10px 25px rgba(0,0,0,0.1);
}

.feature-icon {
  font-size: 3rem;
  margin-bottom: 1rem;
}

.feature-card h3 {
  font-size: 1.25rem;
  font-weight: 600;
  margin-bottom: 1rem;
  color: #1a202c;
}

.feature-card p {
  color: #4a5568;
  line-height: 1.6;
}

.curriculum-section {
  padding: 4rem 0;
  background: #f8fafc;
}

.curriculum-timeline {
  position: relative;
  max-width: 800px;
  margin: 0 auto;
}

.curriculum-timeline::before {
  content: '';
  position: absolute;
  left: 50%;
  top: 0;
  bottom: 0;
  width: 2px;
  background: #e2e8f0;
  transform: translateX(-50%);
}

.timeline-item {
  display: flex;
  align-items: center;
  margin-bottom: 3rem;
  position: relative;
}

.timeline-item-right {
  flex-direction: row-reverse;
}

.timeline-marker {
  width: 60px;
  height: 60px;
  background: #667eea;
  color: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  font-size: 1.125rem;
  position: relative;
  z-index: 2;
  flex-shrink: 0;
}

.timeline-content {
  flex: 1;
  background: white;
  padding: 2rem;
  border-radius: 1rem;
  margin: 0 2rem;
  box-shadow: 0 4px 6px rgba(0,0,0,0.05);
}

.timeline-content h3 {
  font-size: 1.25rem;
  font-weight: 600;
  margin-bottom: 0.5rem;
  color: #1a202c;
}

.timeline-content p {
  color: #4a5568;
  margin-bottom: 1rem;
  line-height: 1.6;
}

.objectives-list {
  list-style: none;
  padding: 0;
}

.objectives-list li {
  color: #4a5568;
  margin-bottom: 0.5rem;
  position: relative;
  padding-left: 1.5rem;
}

.objectives-list li::before {
  content: '✓';
  position: absolute;
  left: 0;
  color: #38a169;
  font-weight: 600;
}

.cta-section {
  padding: 4rem 0;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  text-align: center;
}

.cta-content h2 {
  font-size: 2rem;
  font-weight: 700;
  margin-bottom: 1rem;
}

.cta-content p {
  font-size: 1.125rem;
  margin-bottom: 2rem;
  opacity: 0.9;
}

@media (max-width: 768px) {
  .hero-section {
    flex-direction: column;
    text-align: center;
    padding: 2rem 1rem;
  }
  
  .hero-title {
    font-size: 2rem;
  }
  
  .hero-actions {
    justify-content: center;
    flex-wrap: wrap;
  }
  
  .curriculum-timeline::before {
    left: 30px;
  }
  
  .timeline-item,
  .timeline-item-right {
    flex-direction: row;
  }
  
  .timeline-marker {
    position: absolute;
    left: 0;
  }
  
  .timeline-content {
    margin-left: 80px;
    margin-right: 0;
  }
  
  .section-title {
    font-size: 2rem;
  }
}
</style>
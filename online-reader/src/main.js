import { createApp } from 'vue'
import App from './App.vue'
import './style/main.css'

// 初始化代码高亮
import hljs from 'highlight.js'
import 'highlight.js/styles/github-dark.css'

// 初始化 Mermaid
import mermaid from 'mermaid'
mermaid.initialize({
  startOnLoad: true,
  theme: 'default',
  securityLevel: 'loose'
})

// 全局配置代码高亮
window.hljs = hljs

const app = createApp(App)
app.mount('#app')
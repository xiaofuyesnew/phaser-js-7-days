# Phaser.js 教程在线阅读系统

这是一个为 Phaser.js 7天游戏开发教程打造的在线阅读系统，提供了现代化的学习体验。

## 功能特性

### 📚 核心功能
- **Markdown 到 HTML 转换**: 支持代码高亮和交互功能
- **响应式设计**: 完美适配桌面端和移动端
- **进度追踪**: 自动保存学习进度和完成状态
- **章节导航**: 便捷的章节切换和目录导航

### 💻 代码功能
- **代码高亮**: 基于 highlight.js 的语法高亮
- **一键复制**: 快速复制代码到剪贴板
- **在线运行**: 支持 JavaScript、HTML、CSS 代码在线执行
- **Phaser.js 支持**: 内置 Phaser.js CDN，支持游戏代码运行

### 📊 学习体验
- **学习统计**: 详细的学习进度和时间统计
- **成就系统**: 学习里程碑和成就解锁
- **个性化推荐**: 基于学习进度的智能推荐
- **离线支持**: 支持离线阅读和进度同步

## 技术栈

- **前端框架**: Vue.js 3
- **构建工具**: Vite
- **Markdown 解析**: marked
- **代码高亮**: highlight.js
- **图表渲染**: Mermaid
- **样式**: 原生 CSS + 响应式设计

## 快速开始

### 安装依赖

```bash
npm install
```

### 开发模式

```bash
npm run dev
```

访问 http://localhost:3000 查看应用

### 构建生产版本

```bash
npm run build
```

### 预览生产版本

```bash
npm run preview
```

## 项目结构

```
online-reader/
├── public/                 # 静态资源
│   └── favicon.svg        # 网站图标
├── src/
│   ├── components/        # Vue 组件
│   │   ├── HomeView.vue   # 首页组件
│   │   ├── TutorialContent.vue  # 教程内容组件
│   │   └── ProgressView.vue     # 进度页面组件
│   ├── data/             # 数据文件
│   │   └── tutorialData.js      # 教程数据
│   ├── style/            # 样式文件
│   │   └── main.css      # 主样式文件
│   ├── utils/            # 工具函数
│   │   ├── markdownRenderer.js  # Markdown 渲染器
│   │   └── codeRunner.js        # 代码运行器
│   ├── App.vue           # 主应用组件
│   └── main.js           # 应用入口
├── index.html            # HTML 模板
├── package.json          # 项目配置
├── vite.config.js        # Vite 配置
└── README.md            # 项目说明
```

## 核心组件说明

### MarkdownRenderer
负责将 Markdown 内容转换为 HTML，支持：
- 代码语法高亮
- Mermaid 图表渲染
- 自定义渲染规则
- 目录生成
- 搜索功能

### CodeRunner
提供代码在线运行功能，支持：
- JavaScript 代码执行
- HTML 页面渲染
- CSS 样式预览
- Phaser.js 游戏运行
- 错误处理和调试

### TutorialContent
教程内容展示组件，包含：
- 章节导航
- 内容渲染
- 进度管理
- 代码交互
- 完成状态追踪

### ProgressView
学习进度管理，提供：
- 总体进度统计
- 章节完成状态
- 学习建议
- 成就系统
- 时间统计

## 自定义配置

### 添加新章节

在 `src/data/tutorialData.js` 中添加新的章节数据：

```javascript
{
  id: 'day8',
  day: 'Day 8',
  title: '新章节标题',
  description: '章节描述',
  objectives: ['学习目标1', '学习目标2'],
  deliverables: ['交付物1', '交付物2']
}
```

### 自定义样式

修改 `src/style/main.css` 中的 CSS 变量：

```css
:root {
  --primary-color: #667eea;
  --secondary-color: #764ba2;
  --text-color: #333;
  --background-color: #f8fafc;
}
```

### 扩展代码运行器

在 `src/utils/codeRunner.js` 中添加新的语言支持：

```javascript
getNewLanguageTemplate(code) {
  return `<!-- 新语言模板 -->`
}
```

## 部署说明

### 静态网站部署

构建后的 `dist` 目录可以直接部署到任何静态网站托管服务：

- GitHub Pages
- Vercel
- Netlify
- 阿里云 OSS
- 腾讯云 COS

### 服务器部署

如需服务器部署，可以使用 nginx 或 Apache 托管静态文件。

### CDN 加速

建议配置 CDN 加速以提升全球访问速度：

```javascript
// vite.config.js
export default defineConfig({
  base: 'https://your-cdn-domain.com/',
  // ...其他配置
})
```

## 浏览器支持

- Chrome 80+
- Firefox 75+
- Safari 13+
- Edge 80+

## 贡献指南

1. Fork 项目
2. 创建功能分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 打开 Pull Request

## 许可证

本项目采用 MIT 许可证 - 查看 [LICENSE](LICENSE) 文件了解详情。

## 联系方式

如有问题或建议，请通过以下方式联系：

- 提交 Issue
- 发送邮件到 [your-email@example.com]
- 访问项目主页 [https://your-project-url.com]
# 🚀 游戏部署指南

本指南将帮助你将Phaser.js游戏部署到各种平台，包括自动化部署流程的设置。

## 📋 部署前检查清单

在部署之前，请确保完成以下检查：

### ✅ 代码质量检查
- [ ] 所有功能正常工作
- [ ] 没有控制台错误
- [ ] 性能测试通过
- [ ] 移动端适配良好
- [ ] 音效和图片资源正常加载

### ✅ 构建优化检查
- [ ] 运行 `npm run build:optimize`
- [ ] 检查构建产物大小
- [ ] 验证资源压缩效果
- [ ] 确认代码分割正常

### ✅ 性能检查
- [ ] 运行 `npm run test:performance`
- [ ] FPS稳定在30+
- [ ] 内存使用合理
- [ ] 加载时间可接受

## 🌐 部署平台选择

### GitHub Pages (免费)
**优点**: 免费、简单、与GitHub集成
**缺点**: 只支持静态网站、有流量限制
**适合**: 个人项目、演示、开源项目

### Vercel (免费层 + 付费)
**优点**: 快速部署、全球CDN、自动HTTPS
**缺点**: 免费层有限制
**适合**: 个人和商业项目

### Netlify (免费层 + 付费)
**优点**: 持续部署、表单处理、函数支持
**缺点**: 免费层有带宽限制
**适合**: 静态网站、JAMstack应用

## 🔧 自动化部署设置

### 1. GitHub Actions 自动部署

我们已经为你准备了GitHub Actions工作流程文件 `.github/workflows/deploy.yml`。

#### 设置步骤：

1. **启用GitHub Pages**
   ```bash
   # 在GitHub仓库设置中：
   # Settings > Pages > Source > GitHub Actions
   ```

2. **配置Vercel部署（可选）**
   ```bash
   # 在GitHub仓库设置中添加Secrets：
   # VERCEL_TOKEN: 你的Vercel令牌
   # VERCEL_ORG_ID: 你的组织ID
   # VERCEL_PROJECT_ID: 你的项目ID
   ```

3. **推送代码触发部署**
   ```bash
   git add .
   git commit -m "Deploy game"
   git push origin main
   ```

### 2. 手动部署命令

#### GitHub Pages
```bash
npm run deploy:github
```

#### Vercel
```bash
# 首次部署
npm install -g vercel
vercel login
npm run deploy:vercel

# 后续部署
npm run deploy:vercel
```

#### Netlify
```bash
# 首次部署
npm install -g netlify-cli
netlify login
npm run deploy:netlify

# 后续部署
npm run deploy:netlify
```

## 📊 部署后验证

### 1. 功能测试
- [ ] 游戏正常启动
- [ ] 所有控制响应正常
- [ ] 音效播放正常
- [ ] 移动端触摸控制工作
- [ ] 性能监控显示正常

### 2. 性能测试
- [ ] 页面加载速度 < 3秒
- [ ] 游戏启动时间 < 5秒
- [ ] FPS稳定在目标值
- [ ] 内存使用稳定

### 3. 兼容性测试
- [ ] Chrome/Edge (桌面)
- [ ] Firefox (桌面)
- [ ] Safari (桌面/移动)
- [ ] Chrome (Android)
- [ ] Safari (iOS)

## 🔍 故障排除

### 常见问题

#### 1. 构建失败
```bash
# 清理并重新构建
npm run clean
npm install
npm run build:optimize
```

#### 2. 资源加载失败
- 检查资源路径是否正确
- 确认所有资源文件都在public目录中
- 验证构建后的文件结构

#### 3. 部署后游戏不工作
- 检查浏览器控制台错误
- 验证HTTPS设置（某些API需要HTTPS）
- 确认所有依赖都已正确打包

#### 4. 性能问题
```bash
# 运行性能分析
npm run analyze
npm run test:performance
```

### 调试工具

#### 浏览器开发者工具
- **Console**: 查看JavaScript错误
- **Network**: 检查资源加载
- **Performance**: 分析运行时性能
- **Application**: 检查缓存和存储

#### 游戏内调试
- 按 `P` 键：切换性能监控
- 按 `F` 键：切换全屏模式
- 按 `T` 键：切换触摸控制显示

## 📈 性能优化建议

### 1. 资源优化
```bash
# 运行优化脚本
npm run build:optimize

# 检查优化效果
npm run analyze
```

### 2. 代码优化
- 使用对象池减少垃圾回收
- 避免在update循环中创建对象
- 合理使用纹理图集
- 启用WebGL渲染

### 3. 网络优化
- 启用Gzip压缩
- 使用CDN加速
- 设置合适的缓存策略
- 预加载关键资源

## 🌍 多环境部署

### 开发环境
```bash
npm run dev
# 访问: http://localhost:5173
```

### 预览环境
```bash
npm run build
npm run preview
# 访问: http://localhost:4173
```

### 生产环境
```bash
npm run build:optimize
# 部署dist目录到服务器
```

## 📱 PWA部署

游戏已配置为PWA（渐进式Web应用），支持：

- 离线缓存
- 桌面安装
- 推送通知（需要额外配置）

### PWA验证
1. 在Chrome中打开游戏
2. 按F12打开开发者工具
3. 转到"Application"标签
4. 检查"Service Workers"和"Manifest"

## 🔒 安全考虑

### HTTPS要求
- 现代浏览器API需要HTTPS
- PWA功能需要HTTPS
- 推荐使用免费的Let's Encrypt证书

### 内容安全策略(CSP)
```html
<meta http-equiv="Content-Security-Policy" 
      content="default-src 'self'; script-src 'self' 'unsafe-eval'; style-src 'self' 'unsafe-inline';">
```

## 📊 监控和分析

### 错误监控
游戏内置了错误处理和日志系统：

```javascript
// 查看错误日志
console.log(logger.getErrors());

// 导出日志
logger.exportLogs();
```

### 用户分析
可以集成Google Analytics或其他分析工具：

```html
<!-- 在index.html中添加 -->
<script async src="https://www.googletagmanager.com/gtag/js?id=GA_MEASUREMENT_ID"></script>
```

## 🎯 部署最佳实践

### 1. 版本控制
- 使用语义化版本号
- 标记重要的发布版本
- 维护更新日志

### 2. 回滚策略
- 保留之前版本的构建
- 准备快速回滚方案
- 监控部署后的错误率

### 3. 渐进式部署
- 先部署到测试环境
- 使用A/B测试验证新功能
- 逐步推广到所有用户

## 📞 获取帮助

如果遇到部署问题，可以：

1. 查看构建日志和错误信息
2. 运行性能测试诊断问题
3. 检查浏览器控制台错误
4. 参考各平台的官方文档

---

## 🎉 部署成功！

恭喜你成功部署了Phaser.js游戏！现在你可以：

- 分享游戏链接给朋友
- 在社交媒体上展示你的作品
- 继续添加新功能和改进
- 收集用户反馈并迭代

记住，部署只是开始，持续的维护和改进才能让你的游戏越来越好！🚀
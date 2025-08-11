# 部署指南

本文档详细说明了《七天速通 Phaser.js 游戏开发》项目的部署流程和配置选项。

## 📋 目录

- [快速部署](#快速部署)
- [部署平台](#部署平台)
- [自动化部署](#自动化部署)
- [自定义域名](#自定义域名)
- [CDN 优化](#cdn-优化)
- [SSL 证书](#ssl-证书)
- [监控和分析](#监控和分析)
- [故障排除](#故障排除)

## 🚀 快速部署

### 一键部署到 GitHub Pages

```bash
# 克隆项目
git clone https://github.com/your-repo/phaser-tutorial-handbook.git
cd phaser-tutorial-handbook

# 安装依赖
pnpm install

# 部署到 GitHub Pages
pnpm deploy
```

### 部署到其他平台

```bash
# 部署到 Vercel
pnpm deploy:vercel

# 部署到 Netlify
pnpm deploy:netlify
```

## 🌐 部署平台

### GitHub Pages

**优势:**
- 免费托管
- 与 GitHub 仓库深度集成
- 自动 HTTPS
- 支持自定义域名

**限制:**
- 仅支持静态网站
- 100GB 带宽限制/月
- 1GB 存储限制

**配置步骤:**

1. **启用 GitHub Pages**
   ```bash
   # 使用 GitHub CLI
   gh repo edit --enable-pages --pages-branch gh-pages
   
   # 或手动在仓库设置中启用
   ```

2. **配置自动部署**
   - GitHub Actions 已配置在 `.github/workflows/deploy.yml`
   - 推送到 `main` 分支时自动部署

3. **自定义域名**
   ```bash
   # 设置自定义域名
   pnpm domain:setup example.com github-pages
   ```

### Vercel

**优势:**
- 全球 CDN
- 自动 HTTPS
- 边缘函数支持
- 优秀的开发体验

**限制:**
- 免费版有带宽限制
- 构建时间限制

**配置步骤:**

1. **安装 Vercel CLI**
   ```bash
   npm install -g vercel
   ```

2. **登录并部署**
   ```bash
   vercel login
   pnpm deploy:vercel
   ```

3. **配置域名**
   ```bash
   pnpm domain:setup example.com vercel
   ```

### Netlify

**优势:**
- 强大的构建系统
- 表单处理
- 边缘函数
- 分支预览

**限制:**
- 免费版有带宽限制
- 构建时间限制

**配置步骤:**

1. **安装 Netlify CLI**
   ```bash
   npm install -g netlify-cli
   ```

2. **登录并部署**
   ```bash
   netlify login
   pnpm deploy:netlify
   ```

3. **配置域名**
   ```bash
   pnpm domain:setup example.com netlify
   ```

## 🤖 自动化部署

### GitHub Actions 工作流

项目包含完整的 CI/CD 流程：

```yaml
# .github/workflows/deploy.yml
name: Deploy to GitHub Pages

on:
  push:
    branches: [ main ]
  pull_request:
    branches: [ main ]

jobs:
  test:    # 运行测试
  build:   # 构建项目
  deploy:  # 部署到 GitHub Pages
  release: # 创建发布版本
```

### 触发部署

1. **自动触发**
   - 推送到 `main` 分支
   - 创建 Pull Request

2. **手动触发**
   ```bash
   # 本地部署
   pnpm deploy
   
   # 跳过测试快速部署
   pnpm deploy --skip-tests
   ```

3. **发布版本**
   ```bash
   # 创建新版本
   pnpm release
   
   # 推送版本标签触发发布
   git push --follow-tags
   ```

### 部署状态检查

```bash
# 检查部署状态
gh run list

# 查看部署日志
gh run view [run-id]
```

## 🌍 自定义域名

### 域名配置工具

项目提供了域名配置工具：

```bash
# 设置域名
pnpm domain:setup your-domain.com [platform]

# 测试域名配置
pnpm domain:test your-domain.com

# 移除域名配置
pnpm domain:remove
```

### DNS 配置

#### GitHub Pages
```
类型    名称    值
A       @       185.199.108.153
A       @       185.199.109.153
A       @       185.199.110.153
A       @       185.199.111.153
CNAME   www     your-domain.com
```

#### Vercel
```
类型    名称    值
CNAME   @       cname.vercel-dns.com
CNAME   www     cname.vercel-dns.com
```

#### Netlify
```
类型    名称    值
CNAME   @       your-site.netlify.app
CNAME   www     your-site.netlify.app
```

### 域名验证

```bash
# 检查 DNS 解析
dig your-domain.com

# 检查 HTTPS
curl -I https://your-domain.com

# 使用工具验证
pnpm domain:test your-domain.com
```

## ⚡ CDN 优化

### 自动优化

部署时自动执行 CDN 优化：

```bash
# 手动运行优化
pnpm optimize
```

### 优化内容

1. **文件压缩**
   - Gzip 压缩
   - Brotli 压缩

2. **资源哈希**
   - 文件名添加哈希
   - 缓存破坏

3. **图片优化**
   - 压缩图片
   - 格式转换

4. **缓存策略**
   - 静态资源长期缓存
   - HTML 文件短期缓存

### 缓存配置

```
# 静态资源 (1年)
Cache-Control: public, max-age=31536000, immutable

# HTML 文件 (不缓存)
Cache-Control: public, max-age=0, must-revalidate

# API 响应 (5分钟)
Cache-Control: public, max-age=300
```

## 🔒 SSL 证书

### 自动 HTTPS

所有支持的平台都提供自动 HTTPS：

- **GitHub Pages**: Let's Encrypt 证书
- **Vercel**: 自动 SSL 证书
- **Netlify**: Let's Encrypt 证书

### 强制 HTTPS

```bash
# 在 netlify.toml 中配置
[[redirects]]
  from = "http://your-domain.com/*"
  to = "https://your-domain.com/:splat"
  status = 301
  force = true
```

### HSTS 配置

```
Strict-Transport-Security: max-age=31536000; includeSubDomains; preload
```

## 📊 监控和分析

### 性能监控

1. **Web Vitals**
   - Core Web Vitals 监控
   - 性能指标收集

2. **错误追踪**
   - JavaScript 错误监控
   - 用户行为分析

3. **访问统计**
   - Google Analytics
   - 自定义统计

### 监控工具集成

```javascript
// 性能监控
import { getCLS, getFID, getFCP, getLCP, getTTFB } from 'web-vitals';

getCLS(console.log);
getFID(console.log);
getFCP(console.log);
getLCP(console.log);
getTTFB(console.log);
```

### 健康检查

```bash
# API 健康检查
curl https://your-domain.com/api/health

# 站点可用性检查
curl -I https://your-domain.com
```

## 🔧 故障排除

### 常见问题

#### 1. 部署失败

**症状**: GitHub Actions 构建失败

**解决方案**:
```bash
# 检查构建日志
gh run view --log

# 本地测试构建
pnpm build

# 检查依赖
pnpm install --frozen-lockfile
```

#### 2. 域名无法访问

**症状**: 自定义域名返回 404

**解决方案**:
```bash
# 检查 DNS 配置
dig your-domain.com

# 验证 CNAME 文件
cat dist/CNAME

# 检查 GitHub Pages 设置
gh api repos/:owner/:repo/pages
```

#### 3. SSL 证书错误

**症状**: HTTPS 连接失败

**解决方案**:
```bash
# 检查证书状态
openssl s_client -connect your-domain.com:443

# 等待证书生成（可能需要几小时）
# 检查平台控制面板
```

#### 4. 缓存问题

**症状**: 更新未生效

**解决方案**:
```bash
# 清除浏览器缓存
# 或使用隐身模式

# 检查 CDN 缓存状态
curl -I https://your-domain.com

# 强制刷新 CDN
# 在平台控制面板中清除缓存
```

### 调试工具

```bash
# 检查部署状态
pnpm deploy --dry-run

# 验证构建输出
ls -la dist/

# 测试本地构建
pnpm build && pnpm preview
```

### 日志分析

```bash
# GitHub Actions 日志
gh run view --log

# Vercel 部署日志
vercel logs

# Netlify 部署日志
netlify logs
```

## 📈 性能优化

### 构建优化

1. **代码分割**
   - 按路由分割
   - 按功能分割

2. **Tree Shaking**
   - 移除未使用代码
   - 优化依赖包

3. **资源优化**
   - 图片压缩
   - 字体优化

### 运行时优化

1. **懒加载**
   - 图片懒加载
   - 组件懒加载

2. **缓存策略**
   - Service Worker
   - 浏览器缓存

3. **CDN 加速**
   - 全球节点
   - 边缘缓存

## 🔄 回滚策略

### 版本回滚

```bash
# 回滚到上一个版本
git revert HEAD
git push origin main

# 回滚到特定版本
git reset --hard <commit-hash>
git push --force-with-lease origin main
```

### 快速回滚

```bash
# 使用 GitHub CLI 回滚部署
gh api repos/:owner/:repo/deployments/:deployment_id/statuses \
  -f state=inactive
```

## 📞 支持和帮助

### 获取帮助

1. **文档**: 查看 [README.md](README.md) 和相关文档
2. **Issues**: 在 [GitHub Issues](https://github.com/your-repo/issues) 中提问
3. **讨论**: 参与 [GitHub Discussions](https://github.com/your-repo/discussions)
4. **邮件**: 联系 [support@example.com](mailto:support@example.com)

### 社区资源

- **Discord**: [加入讨论](https://discord.gg/your-server)
- **QQ 群**: [中文交流群](https://qm.qq.com/your-group)
- **微信群**: 扫码加入

---

## 📝 更新日志

查看 [CHANGELOG.md](CHANGELOG.md) 了解最新的部署相关更新。

## 📄 许可证

本部署指南基于 [MIT License](LICENSE) 许可证。
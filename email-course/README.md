# Phaser.js 教程邮件课程系统

这是一个专为 Phaser.js 7天游戏开发教程设计的邮件课程系统，提供自动化的邮件发送、用户管理和学习进度追踪功能。

## 功能特性

### 📧 邮件功能
- **自动化邮件发送**: 基于用户学习进度自动发送课程内容
- **个性化邮件模板**: 支持 Handlebars 模板引擎的邮件定制
- **多种邮件类型**: 欢迎邮件、课程邮件、提醒邮件、完成邮件
- **批量邮件处理**: 高效的批量邮件发送和管理

### 👥 用户管理
- **订阅管理**: 用户订阅、退订、重新订阅
- **学习进度追踪**: 自动记录用户学习进度和完成状态
- **个性化设置**: 支持时区、发送时间等个人偏好设置
- **访问令牌**: 安全的用户身份验证和访问控制

### 📊 数据分析
- **详细统计**: 订阅数据、邮件发送、用户活跃度统计
- **学习分析**: 课程完成率、学习路径分析
- **实时监控**: 系统健康状态和性能监控
- **报告生成**: 自动生成每日、每周统计报告

### ⏰ 定时任务
- **智能调度**: 基于用户偏好的个性化发送时间
- **自动提醒**: 学习进度提醒和激励邮件
- **数据维护**: 自动数据清理和数据库优化
- **健康检查**: 系统状态监控和自动恢复

## 快速开始

### 环境要求

- Node.js 18+
- SQLite 3
- SMTP 邮件服务器

### 安装依赖

```bash
npm install
```

### 环境配置

创建 `.env` 文件：

```env
# 服务器配置
PORT=3002
NODE_ENV=development
BASE_URL=http://localhost:3002

# 数据库配置
DATABASE_PATH=./data/email-course.db
DATA_RETENTION_DAYS=90
MAX_DB_SIZE=104857600

# SMTP 邮件配置
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password

# JWT 密钥
JWT_SECRET=your-jwt-secret-key

# 时区设置
TIMEZONE=Asia/Shanghai

# 管理员邮箱（接收系统报告）
ADMIN_EMAIL=admin@example.com

# 允许的来源（CORS）
ALLOWED_ORIGINS=http://localhost:3000,http://localhost:3001
```

### 数据库初始化

```bash
npm run migrate
```

### 启动服务

#### 开发模式
```bash
npm run dev
```

#### 生产模式
```bash
npm start
```

#### 启动调度器
```bash
npm run scheduler
```

## API 接口

### 订阅管理

**订阅课程 (POST /api/subscription/subscribe)**
```javascript
{
  "email": "user@example.com",
  "name": "用户姓名",
  "preferences": {
    "timezone": "Asia/Shanghai",
    "sendTime": "09:00",
    "language": "zh-CN"
  }
}
```

**取消订阅 (POST /api/subscription/unsubscribe)**
```javascript
{
  "token": "unsubscribe-token",
  "reason": "不再需要"
}
```

**更新学习进度 (POST /api/subscription/progress)**
```javascript
{
  "token": "access-token",
  "day": 1,
  "completed": true
}
```

### 课程内容

**获取课程内容 (GET /api/course/:day)**
```
GET /api/course/1?token=access-token
```

**获取课程概览 (GET /api/course/overview)**
```
GET /api/course/overview
```

### 分析统计

**获取订阅统计 (GET /api/analytics/subscription)**
```
GET /api/analytics/subscription
```

**获取课程统计 (GET /api/analytics/course)**
```
GET /api/analytics/course
```

## 项目结构

```
email-course/
├── src/
│   ├── server.js              # 主服务器
│   ├── scheduler.js           # 定时任务调度器
│   ├── services/              # 业务服务
│   │   ├── emailService.js    # 邮件服务
│   │   ├── subscriptionService.js # 订阅服务
│   │   ├── courseService.js   # 课程服务
│   │   └── analyticsService.js # 分析服务
│   ├── database/              # 数据库
│   │   ├── database.js        # 数据库连接和操作
│   │   ├── migrate.js         # 数据库迁移
│   │   └── seed.js           # 测试数据
│   ├── routes/               # API 路由
│   │   ├── auth.js           # 认证路由
│   │   ├── subscription.js   # 订阅路由
│   │   ├── course.js         # 课程路由
│   │   ├── analytics.js      # 分析路由
│   │   └── admin.js          # 管理路由
│   ├── middleware/           # 中间件
│   │   ├── rateLimiter.js    # 速率限制
│   │   ├── auth.js           # 身份验证
│   │   └── validation.js     # 数据验证
│   ├── templates/            # 邮件模板
│   │   └── email/            # 邮件模板文件
│   ├── content/              # 课程内容
│   │   └── course/           # 课程 Markdown 文件
│   └── utils/                # 工具函数
│       ├── logger.js         # 日志工具
│       └── helpers.js        # 辅助函数
├── public/                   # 静态文件
│   ├── subscribe.html        # 订阅页面
│   ├── unsubscribe.html      # 退订页面
│   └── assets/               # 静态资源
├── data/                     # 数据文件
├── logs/                     # 日志文件
├── package.json
└── README.md
```

## 邮件模板

### 模板语法

使用 Handlebars 模板引擎，支持以下语法：

```handlebars
<!-- 变量 -->
{{name}}
{{email}}

<!-- 条件语句 -->
{{#if condition}}
  内容
{{/if}}

<!-- 循环 -->
{{#each items}}
  <li>{{this}}</li>
{{/each}}

<!-- 部分模板 -->
{{>header}}
```

### 内置模板

- `welcome.hbs` - 欢迎邮件
- `course-day.hbs` - 每日课程邮件
- `reminder.hbs` - 学习提醒邮件
- `completion.hbs` - 课程完成邮件
- `unsubscribe-confirm.hbs` - 退订确认邮件

### 自定义模板

在 `src/templates/email/` 目录下创建 `.hbs` 文件：

```handlebars
<!-- custom-template.hbs -->
<div style="font-family: Arial, sans-serif;">
  <h1>{{title}}</h1>
  <p>你好 {{name}}，</p>
  <div>{{{content}}}</div>
  <p>{{signature}}</p>
</div>
```

## 定时任务

### 内置任务

- **每日课程邮件**: 每天上午9点发送
- **学习提醒**: 每天下午6点发送
- **数据库清理**: 每周日凌晨2点执行
- **统计报告**: 每天凌晨1点生成
- **健康检查**: 每小时执行

### 手动触发任务

```bash
# 发送每日课程邮件
node src/scheduler.js trigger daily-course

# 发送提醒邮件
node src/scheduler.js trigger reminder

# 数据库清理
node src/scheduler.js trigger cleanup

# 生成报告
node src/scheduler.js trigger report

# 健康检查
node src/scheduler.js trigger health-check
```

### 自定义任务

在 `scheduler.js` 中添加新的定时任务：

```javascript
// 每周一上午10点发送周报
cron.schedule('0 10 * * 1', async () => {
  await this.sendWeeklyReport()
}, {
  timezone: process.env.TIMEZONE || 'Asia/Shanghai'
})
```

## 课程内容管理

### 内容格式

课程内容使用 Markdown 格式，支持 Front Matter：

```markdown
---
title: "Day 1: Phaser.js 基础入门"
description: "学习 Phaser.js 的核心概念和基本用法"
objectives:
  - "理解 Phaser.js 的基本架构"
  - "创建第一个 Phaser 游戏"
estimatedTime: "2-3小时"
difficulty: "初级"
---

# Day 1: Phaser.js 基础入门

## 学习目标

今天我们将学习...

## 代码示例

```javascript
const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600
};
```

## 练习

1. 创建基础项目
2. 添加游戏对象
```

### 添加新课程

1. 在 `src/content/course/` 目录下创建 `dayX.md` 文件
2. 重启课程服务或调用 API 重新加载内容

## 数据库管理

### 数据库结构

- `subscribers` - 订阅者信息
- `events` - 事件日志
- `email_templates` - 邮件模板
- `email_logs` - 邮件发送记录
- `feedback` - 用户反馈
- `admins` - 管理员账户
- `settings` - 系统设置

### 数据备份

```bash
# 手动备份
node -e "
const { Database } = require('./src/database/database.js');
const db = new Database();
db.initialize().then(() => db.backup('./backup.db'));
"
```

### 数据清理

```bash
# 清理90天前的数据
node src/scheduler.js trigger cleanup
```

## 监控和日志

### 日志级别

- `error` - 错误信息
- `warn` - 警告信息
- `info` - 一般信息
- `debug` - 调试信息

### 日志文件

- `logs/error.log` - 错误日志
- `logs/combined.log` - 综合日志
- `logs/email.log` - 邮件发送日志

### 监控指标

- 订阅者数量和增长率
- 邮件发送成功率
- 课程完成率
- 系统性能指标

## 部署指南

### Docker 部署

```dockerfile
FROM node:18-alpine

WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production

COPY . .
EXPOSE 3002

CMD ["npm", "start"]
```

### PM2 部署

```javascript
// ecosystem.config.js
module.exports = {
  apps: [{
    name: 'email-course-server',
    script: 'src/server.js',
    instances: 1,
    autorestart: true,
    watch: false,
    max_memory_restart: '1G',
    env: {
      NODE_ENV: 'production'
    }
  }, {
    name: 'email-course-scheduler',
    script: 'src/scheduler.js',
    instances: 1,
    autorestart: true,
    watch: false,
    max_memory_restart: '512M',
    env: {
      NODE_ENV: 'production'
    }
  }]
}
```

### Nginx 配置

```nginx
server {
    listen 80;
    server_name your-domain.com;

    location / {
        proxy_pass http://localhost:3002;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

## 故障排除

### 常见问题

**1. 邮件发送失败**
- 检查 SMTP 配置
- 验证邮箱密码和权限
- 查看邮件服务商限制

**2. 数据库连接错误**
- 检查数据库文件权限
- 验证数据库路径
- 查看磁盘空间

**3. 定时任务不执行**
- 检查时区设置
- 验证 cron 表达式
- 查看调度器日志

### 调试模式

```bash
# 启用调试日志
DEBUG=email-course:* npm run dev

# 查看详细错误信息
NODE_ENV=development npm start
```

## 性能优化

### 邮件发送优化

- 批量发送邮件
- 控制发送频率
- 使用连接池
- 异步处理

### 数据库优化

- 定期清理旧数据
- 优化查询索引
- 使用事务处理
- 数据库备份

### 内存优化

- 及时释放资源
- 使用流式处理
- 限制并发数量
- 监控内存使用

## API 文档

完整的 API 文档可以通过以下方式访问：
- 启动服务器后访问 `/api/docs`
- 查看 `docs/api.md` 文件

## 许可证

本项目采用 MIT 许可证 - 查看 [LICENSE](LICENSE) 文件了解详情。

## 贡献

欢迎提交 Issue 和 Pull Request！

1. Fork 项目
2. 创建功能分支
3. 提交更改
4. 推送到分支
5. 创建 Pull Request

## 联系方式

如有问题或建议，请通过以下方式联系：
- 提交 GitHub Issue
- 发送邮件到 [your-email@example.com]
- 访问项目主页 [https://your-project-url.com]
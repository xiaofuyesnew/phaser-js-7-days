# Phaser.js 7天教程 - 项目模板

这个目录包含了Phaser.js 7天教程的统一项目配置模板和工具。

## 📁 模板内容

- `package.json` - 统一的npm包配置
- `vite.config.js` - Vite构建工具配置
- `.gitignore` - Git忽略文件配置
- `index.html` - HTML模板
- `CODE_STANDARDS.md` - 代码规范和项目结构标准
- `setup-project.js` - 项目初始化脚本

## 🚀 使用方法

### 初始化所有教程项目

```bash
# 在项目根目录运行
node project-template/setup-project.js
```

### 初始化特定教程项目

```bash
# 初始化第一天的项目
node project-template/setup-project.js 1_starter

# 初始化第二天的项目
node project-template/setup-project.js 2_sprite
```

### 可用的项目键名

- `1_starter` - Phaser.js基础
- `2_sprite` - 精灵与动画
- `3_tilemap` - 地图与物理系统
- `4_camera` - 摄像机与场景滚动
- `5_enemy` - 敌人与碰撞检测
- `6_audio_ui_status` - 音效、UI与状态管理
- `7_deploy_review` - 游戏部署与优化

## 📋 项目结构标准

每个教程项目都遵循以下结构：

```
day_x/
├── README.md              # 教程内容
└── source/               # 源代码项目
    ├── public/           # 静态资源
    │   └── assets/       # 游戏资源
    ├── src/              # 源代码
    │   ├── scenes/       # 游戏场景
    │   ├── sprites/      # 游戏精灵
    │   ├── utils/        # 工具函数
    │   └── main.js       # 入口文件
    ├── package.json      # 项目配置
    ├── vite.config.js    # 构建配置
    ├── .gitignore        # Git忽略
    └── index.html        # HTML模板
```

## 🔧 开发工作流

1. **初始化项目**
   ```bash
   node project-template/setup-project.js <project-key>
   ```

2. **安装依赖**
   ```bash
   cd <project>/source
   pnpm install
   ```

3. **启动开发服务器**
   ```bash
   pnpm dev
   ```

4. **构建生产版本**
   ```bash
   pnpm build
   ```

## 📖 配置说明

### package.json 特性
- 使用pnpm作为包管理器
- 包含ESLint和Prettier配置
- 支持现代JavaScript特性
- 优化的构建脚本

### vite.config.js 特性
- 开发服务器热重载
- 资源别名配置
- 构建优化设置
- 支持多种资源格式

### 代码规范
详细的代码规范请参考 `CODE_STANDARDS.md` 文件。

## 🛠️ 自定义配置

如果需要修改模板配置：

1. 编辑对应的模板文件
2. 运行初始化脚本更新项目
3. 或者手动复制配置到目标项目

## 📝 注意事项

- 确保已安装Node.js 18+和pnpm
- 初始化脚本会覆盖现有的配置文件
- 建议在修改前备份重要的自定义配置
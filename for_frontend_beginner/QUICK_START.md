# 🚀 快速开始指南

欢迎来到 Phaser.js 游戏开发之旅！这个快速开始指南将帮助您在 10 分钟内搭建完整的开发环境。

## 📋 准备工作

在开始之前，请确保您有：
- 稳定的网络连接
- 管理员权限（Windows 用户）
- 至少 2GB 的可用磁盘空间

## 🎯 一键安装（推荐）

### Windows 用户

1. **以管理员身份打开 PowerShell**
   - 按 `Win + X`，选择 "Windows PowerShell (管理员)"

2. **运行安装命令**
   ```powershell
   # 下载并运行安装脚本
   iwr -useb https://raw.githubusercontent.com/your-repo/main/for_frontend_beginner/scripts/install-tools.ps1 | iex
   ```

### macOS 用户

1. **打开终端**
   - 按 `Cmd + Space`，输入 "Terminal"

2. **运行安装命令**
   ```bash
   # 下载并运行安装脚本
   curl -fsSL https://raw.githubusercontent.com/your-repo/main/for_frontend_beginner/scripts/install-tools.sh | bash
   ```

### Linux 用户

1. **打开终端**
   - 按 `Ctrl + Alt + T`

2. **运行安装命令**
   ```bash
   # 下载并运行安装脚本
   curl -fsSL https://raw.githubusercontent.com/your-repo/main/for_frontend_beginner/scripts/install-tools.sh | bash
   ```

## 🔧 手动安装（分步进行）

如果您更喜欢了解每个步骤，可以按照以下方式手动安装：

### 步骤 1: 下载项目

```bash
# 克隆项目
git clone https://github.com/your-repo/phaser-tutorial-handbook.git
cd phaser-tutorial-handbook/for_frontend_beginner/scripts

# 或者直接下载脚本文件
mkdir phaser-setup && cd phaser-setup
# 下载所需的脚本文件...
```

### 步骤 2: 检查当前环境

```bash
node check-environment.js
```

这个命令会检查您当前的开发环境状态，并告诉您需要安装哪些工具。

### 步骤 3: 安装开发工具

**Windows:**
```powershell
powershell -ExecutionPolicy Bypass -File install-tools.ps1
```

**macOS/Linux:**
```bash
chmod +x install-tools.sh
./install-tools.sh
```

### 步骤 4: 验证安装

```bash
node check-environment.js
```

确保所有工具都正确安装。

### 步骤 5: 创建第一个项目

```bash
node setup-project.js
```

按照提示输入项目信息，脚本会自动创建完整的项目结构。

## 🎮 开始开发

安装完成后，您可以：

### 1. 进入项目目录
```bash
cd your-project-name
```

### 2. 启动开发服务器
```bash
pnpm dev
```

### 3. 在浏览器中查看
打开 http://localhost:3000，您应该能看到一个简单的 Phaser 游戏！

### 4. 开始学习
现在您可以开始学习 [Day 1: Phaser.js 基础](../1_starter/README.md)

## 🛠️ 开发工具介绍

安装完成后，您将拥有以下工具：

### Node.js & npm/pnpm
- **Node.js**: JavaScript 运行环境
- **pnpm**: 快速的包管理器
- **用途**: 安装依赖、运行构建脚本

### Git
- **功能**: 版本控制系统
- **用途**: 管理代码版本、协作开发

### VS Code
- **功能**: 代码编辑器
- **扩展**: 已预装游戏开发相关扩展
- **用途**: 编写和调试代码

### Vite
- **功能**: 现代化构建工具
- **特性**: 快速热重载、优化构建
- **用途**: 开发服务器和生产构建

## 📚 下一步学习路径

1. **Day 1**: [Phaser.js 基础](../1_starter/README.md)
   - 了解游戏引擎基础概念
   - 创建第一个游戏场景

2. **Day 2**: [精灵与动画](../2_sprite/README.md)
   - 学习精灵系统
   - 实现角色动画

3. **Day 3**: [地图与物理系统](../3_tilemap/README.md)
   - 创建游戏地图
   - 添加物理引擎

4. **继续学习**: 按照 7 天教程逐步深入

## ❓ 常见问题

### Q: 安装过程中出现网络错误怎么办？
A: 尝试配置国内镜像源：
```bash
npm config set registry https://registry.npmmirror.com
pnpm config set registry https://registry.npmmirror.com
```

### Q: Windows 上 PowerShell 执行策略错误？
A: 以管理员身份运行 PowerShell，然后执行：
```powershell
Set-ExecutionPolicy RemoteSigned -Scope CurrentUser
```

### Q: macOS 上提示需要 Xcode Command Line Tools？
A: 运行以下命令安装：
```bash
xcode-select --install
```

### Q: VS Code 扩展安装失败？
A: 手动安装必备扩展：
```bash
code --install-extension ms-ceintl.vscode-language-pack-zh-hans
code --install-extension esbenp.prettier-vscode
code --install-extension dbaeumer.vscode-eslint
```

## 🆘 获取帮助

如果遇到问题：

1. **查看详细文档**: [完整环境搭建指南](README.md)
2. **运行诊断**: `node check-environment.js`
3. **查看脚本文档**: [scripts/README.md](scripts/README.md)
4. **提交 Issue**: 在项目页面提交问题

## 🎉 恭喜！

如果您看到这里，说明您已经成功搭建了 Phaser.js 开发环境！

现在您可以：
- ✅ 编写现代 JavaScript 代码
- ✅ 使用 Phaser.js 创建游戏
- ✅ 享受快速的开发体验
- ✅ 开始您的游戏开发之旅

**准备好了吗？让我们开始创造您的第一个游戏吧！** 🎮

---

*如果这个指南对您有帮助，请给项目一个 ⭐ Star！*
# 附录：零基础前端开发环境搭建

本指南将帮助零基础学习者搭建完整的前端开发环境，为学习 Phaser.js 游戏开发做好准备。我们将逐步安装和配置所需的工具，包括 Node.js、Git、VS Code 等。

## 目录

- [系统要求](#系统要求)
- [Git 安装与配置](#git-安装与配置)
- [Node.js 安装与版本管理](#nodejs-安装与版本管理)
- [包管理器 pnpm 安装](#包管理器-pnpm-安装)
- [VS Code 安装与配置](#vs-code-安装与配置)
- [环境验证](#环境验证)
- [常见问题解答](#常见问题解答)
- [故障排除指南](#故障排除指南)

## 系统要求

在开始之前，请确保您的系统满足以下要求：

- **Windows**: Windows 10 或更高版本
- **macOS**: macOS 10.15 (Catalina) 或更高版本
- **Linux**: Ubuntu 18.04+ 或其他主流发行版
- **内存**: 至少 4GB RAM（推荐 8GB+）
- **存储**: 至少 2GB 可用空间
- **网络**: 稳定的互联网连接

## Git 安装与配置

Git 是版本控制系统，用于管理代码版本和协作开发。

### Windows 系统

1. **下载 Git**
   - 访问 [Git 官网](https://git-scm.com/download/win)
   - 下载最新版本的 Git for Windows

2. **安装 Git**
   - 运行下载的安装程序
   - 保持默认设置，一路点击 "Next"
   - 在 "Choosing the default editor" 步骤中，建议选择 "Use Visual Studio Code as Git's default editor"
   - 完成安装

3. **验证安装**
   ```bash
   git --version
   ```

### macOS 系统

1. **使用 Homebrew 安装（推荐）**
   ```bash
   # 如果没有 Homebrew，先安装
   /bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
   
   # 安装 Git
   brew install git
   ```

2. **或者下载安装包**
   - 访问 [Git 官网](https://git-scm.com/download/mac)
   - 下载并安装 dmg 文件

### Linux 系统

```bash
# Ubuntu/Debian
sudo apt update
sudo apt install git

# CentOS/RHEL/Fedora
sudo yum install git
# 或者 (较新版本)
sudo dnf install git
```

### Git 基础配置

安装完成后，需要配置用户信息：

```bash
# 设置用户名
git config --global user.name "您的姓名"

# 设置邮箱
git config --global user.email "您的邮箱@example.com"

# 验证配置
git config --list
```

## Node.js 安装与版本管理

Node.js 是 JavaScript 运行环境，我们需要它来运行构建工具和包管理器。

### 推荐方式：使用版本管理器

版本管理器可以让您轻松切换不同版本的 Node.js。

#### Windows 系统 - 使用 NVS

1. **安装 NVS**
   - 访问 [NVS GitHub](https://github.com/jasongin/nvs)
   - 下载 `nvs.msi` 安装包
   - 运行安装程序

2. **使用 NVS 安装 Node.js**
   ```bash
   # 安装最新的 LTS 版本
   nvs add lts
   nvs use lts
   
   # 或者安装指定版本
   nvs add 18.19.0
   nvs use 18.19.0
   ```

#### macOS/Linux 系统 - 使用 NVM

1. **安装 NVM**
   ```bash
   curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash
   
   # 重新加载终端配置
   source ~/.bashrc
   # 或者
   source ~/.zshrc
   ```

2. **使用 NVM 安装 Node.js**
   ```bash
   # 安装最新的 LTS 版本
   nvm install --lts
   nvm use --lts
   
   # 或者安装指定版本
   nvm install 18.19.0
   nvm use 18.19.0
   ```

### 直接安装方式

如果不想使用版本管理器，也可以直接安装：

1. 访问 [Node.js 官网](https://nodejs.org/)
2. 下载 LTS 版本（推荐 18.x 或更高版本）
3. 运行安装程序，保持默认设置

### 验证安装

```bash
# 检查 Node.js 版本
node --version

# 检查 npm 版本
npm --version
```

## 包管理器 pnpm 安装

pnpm 是更快、更节省磁盘空间的包管理器，我们推荐使用它替代 npm。

### 安装 pnpm

```bash
# 使用 npm 安装 pnpm
npm install -g pnpm

# 或者使用官方安装脚本
curl -fsSL https://get.pnpm.io/install.sh | sh -
```

### Windows 用户额外选项

```powershell
# 使用 PowerShell
iwr https://get.pnpm.io/install.ps1 -useb | iex

# 或者使用 Chocolatey
choco install pnpm

# 或者使用 Scoop
scoop install pnpm
```

### 验证安装

```bash
pnpm --version
```

### pnpm 基础配置

```bash
# 设置淘宝镜像（可选，提高下载速度）
pnpm config set registry https://registry.npmmirror.com

# 查看配置
pnpm config list
```

## VS Code 安装与配置

Visual Studio Code 是我们推荐的代码编辑器，功能强大且扩展丰富。

### 安装 VS Code

1. **下载安装**
   - 访问 [VS Code 官网](https://code.visualstudio.com/)
   - 下载适合您系统的版本
   - 运行安装程序

2. **Linux 用户额外选项**
   ```bash
   # Ubuntu/Debian
   wget -qO- https://packages.microsoft.com/keys/microsoft.asc | gpg --dearmor > packages.microsoft.gpg
   sudo install -o root -g root -m 644 packages.microsoft.gpg /etc/apt/trusted.gpg.d/
   sudo sh -c 'echo "deb [arch=amd64,arm64,armhf signed-by=/etc/apt/trusted.gpg.d/packages.microsoft.gpg] https://packages.microsoft.com/repos/code stable main" > /etc/apt/sources.list.d/vscode.list'
   sudo apt update
   sudo apt install code
   ```

### 必备扩展安装

安装以下扩展来提升开发体验：

1. **基础扩展**
   - `Chinese (Simplified)` - 中文语言包
   - `Auto Rename Tag` - 自动重命名标签
   - `Bracket Pair Colorizer 2` - 括号配对着色
   - `indent-rainbow` - 缩进彩虹线

2. **JavaScript/前端开发**
   - `ES7+ React/Redux/React-Native snippets` - 代码片段
   - `JavaScript (ES6) code snippets` - ES6 代码片段
   - `Prettier - Code formatter` - 代码格式化
   - `ESLint` - 代码检查

3. **Git 相关**
   - `GitLens` - Git 增强功能
   - `Git History` - Git 历史查看

4. **其他实用扩展**
   - `Live Server` - 本地服务器
   - `Thunder Client` - API 测试工具
   - `Material Icon Theme` - 文件图标主题

### 快速安装扩展

您可以通过命令行快速安装所有推荐扩展：

```bash
# 基础扩展
code --install-extension ms-ceintl.vscode-language-pack-zh-hans
code --install-extension formulahendry.auto-rename-tag
code --install-extension coenraads.bracket-pair-colorizer-2
code --install-extension oderwat.indent-rainbow

# JavaScript/前端开发
code --install-extension dsznajder.es7-react-js-snippets
code --install-extension xabikos.javascriptsnippets
code --install-extension esbenp.prettier-vscode
code --install-extension dbaeumer.vscode-eslint

# Git 相关
code --install-extension eamodio.gitlens
code --install-extension donjayamanne.githistory

# 其他实用扩展
code --install-extension ritwickdey.liveserver
code --install-extension rangav.vscode-thunder-client
code --install-extension pkief.material-icon-theme
```

### VS Code 基础配置

创建用户设置文件来优化开发体验：

1. 打开 VS Code
2. 按 `Ctrl+Shift+P` (Windows/Linux) 或 `Cmd+Shift+P` (macOS)
3. 输入 "Preferences: Open Settings (JSON)"
4. 添加以下配置：

```json
{
  "editor.fontSize": 14,
  "editor.tabSize": 2,
  "editor.insertSpaces": true,
  "editor.wordWrap": "on",
  "editor.minimap.enabled": true,
  "editor.formatOnSave": true,
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": true
  },
  "files.autoSave": "afterDelay",
  "files.autoSaveDelay": 1000,
  "terminal.integrated.fontSize": 13,
  "workbench.iconTheme": "material-icon-theme",
  "git.enableSmartCommit": true,
  "git.confirmSync": false,
  "prettier.singleQuote": true,
  "prettier.semi": true,
  "prettier.trailingComma": "es5"
}
```

## 环境验证

完成所有安装后，让我们验证环境是否正确配置：

### 创建测试项目

```bash
# 创建测试目录
mkdir phaser-test
cd phaser-test

# 初始化项目
pnpm init

# 安装 Phaser.js
pnpm add phaser

# 安装开发依赖
pnpm add -D vite
```

### 创建简单的测试文件

创建 `index.html`:
```html
<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Phaser 环境测试</title>
</head>
<body>
    <div id="game"></div>
    <script type="module" src="./main.js"></script>
</body>
</html>
```

创建 `main.js`:
```javascript
import Phaser from 'phaser';

const config = {
    type: Phaser.AUTO,
    width: 800,
    height: 600,
    parent: 'game',
    scene: {
        create: function() {
            this.add.text(400, 300, 'Phaser 环境配置成功！', {
                fontSize: '32px',
                fill: '#000'
            }).setOrigin(0.5);
        }
    }
};

new Phaser.Game(config);
```

创建 `package.json` 脚本:
```json
{
  "scripts": {
    "dev": "vite",
    "build": "vite build"
  }
}
```

### 运行测试

```bash
# 启动开发服务器
pnpm dev
```

如果一切正常，您应该能在浏览器中看到 "Phaser 环境配置成功！" 的文字。

## 常见问题解答

### Q1: Node.js 安装后命令不可用

**A**: 这通常是环境变量问题。

**Windows 解决方案**:
1. 重启命令提示符或 PowerShell
2. 检查环境变量 PATH 中是否包含 Node.js 安装路径
3. 重新安装 Node.js，确保勾选 "Add to PATH" 选项

**macOS/Linux 解决方案**:
```bash
# 重新加载 shell 配置
source ~/.bashrc
# 或者
source ~/.zshrc

# 检查 PATH
echo $PATH
```

### Q2: pnpm 安装失败

**A**: 尝试以下解决方案：

```bash
# 清除 npm 缓存
npm cache clean --force

# 使用官方安装脚本
curl -fsSL https://get.pnpm.io/install.sh | sh -

# 或者使用 npm 重新安装
npm uninstall -g pnpm
npm install -g pnpm
```

### Q3: VS Code 扩展安装失败

**A**: 可能的解决方案：

1. **网络问题**: 检查网络连接，尝试使用代理
2. **权限问题**: 以管理员身份运行 VS Code
3. **手动安装**: 从 VS Code 市场下载 .vsix 文件手动安装

### Q4: Git 配置问题

**A**: 常见配置检查：

```bash
# 检查 Git 配置
git config --list

# 重新配置用户信息
git config --global user.name "您的姓名"
git config --global user.email "您的邮箱"

# 检查 SSH 密钥（如果使用 GitHub）
ssh-keygen -t rsa -b 4096 -C "您的邮箱"
```

### Q5: 项目运行时端口被占用

**A**: 解决端口冲突：

```bash
# 查看端口占用情况
# Windows
netstat -ano | findstr :3000

# macOS/Linux
lsof -i :3000

# 或者指定其他端口运行
pnpm dev --port 3001
```

## 故障排除指南

### 网络连接问题

如果遇到下载缓慢或失败的问题：

1. **配置 npm 镜像**:
   ```bash
   npm config set registry https://registry.npmmirror.com
   pnpm config set registry https://registry.npmmirror.com
   ```

2. **配置 Git 代理**（如果需要）:
   ```bash
   git config --global http.proxy http://proxy.company.com:8080
   git config --global https.proxy https://proxy.company.com:8080
   ```

### 权限问题

**Windows 用户**:
- 以管理员身份运行命令提示符或 PowerShell
- 检查用户账户控制 (UAC) 设置

**macOS/Linux 用户**:
```bash
# 修复 npm 权限问题
sudo chown -R $(whoami) ~/.npm
sudo chown -R $(whoami) /usr/local/lib/node_modules
```

### 版本冲突问题

如果遇到版本不兼容的问题：

```bash
# 清除所有缓存
npm cache clean --force
pnpm store prune

# 删除 node_modules 和 lock 文件
rm -rf node_modules
rm package-lock.json
rm pnpm-lock.yaml

# 重新安装
pnpm install
```

### 系统特定问题

**Windows 用户**:
- 确保启用了开发者模式
- 安装 Windows Build Tools: `npm install -g windows-build-tools`

**macOS 用户**:
- 安装 Xcode Command Line Tools: `xcode-select --install`
- 确保 Homebrew 正常工作

**Linux 用户**:
- 安装必要的构建工具:
  ```bash
  # Ubuntu/Debian
  sudo apt install build-essential
  
  # CentOS/RHEL
  sudo yum groupinstall "Development Tools"
  ```

## 下一步

环境搭建完成后，您可以：

1. 开始学习 [Day 1: Phaser.js 基础](../1_starter/README.md)
2. 查看 [项目模板](../project-template/README.md) 了解项目结构
3. 阅读 [推荐资源](../recommend_resource/README.md) 获取更多学习材料

如果在环境搭建过程中遇到问题，请参考上述故障排除指南，或者在项目的 Issues 页面寻求帮助。

---

**提示**: 建议将这个环境搭建过程保存为书签，以便将来参考或帮助其他同学搭建环境。

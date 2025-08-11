# 脚本工具集

这个目录包含了用于 Phaser.js 开发环境配置和项目管理的完整脚本工具集。

## 🚀 快速开始

运行脚本管理器来访问所有工具：

```bash
node script-manager.js
```

## 📋 脚本列表

### 🔧 环境配置脚本

| 脚本 | 描述 | 使用场景 |
|------|------|----------|
| `script-manager.js` | 统一的脚本管理器 | 访问所有工具的入口 |
| `check-environment.js` | 环境检测工具 | 检查开发环境配置 |
| `auto-setup.js` | 自动环境配置 | 一键配置完整开发环境 |
| `install-tools.ps1` | Windows 工具安装 | Windows 系统环境搭建 |
| `install-tools.sh` | Linux/Mac 工具安装 | Unix 系统环境搭建 |

### 🎮 项目创建脚本

| 脚本 | 描述 | 使用场景 |
|------|------|----------|
| `setup-project.js` | 基础项目创建器 | 创建标准 Phaser.js 项目 |
| `template-generator.js` | 模板项目生成器 | 创建不同类型的游戏项目 |
| `quick-start.js` | 项目快速启动 | 快速启动现有项目 |

## 🛠️ 详细使用指南

### 1. 脚本管理器 (推荐)

最简单的使用方式，提供交互式菜单：

```bash
node script-manager.js
```

功能：
- 📋 交互式菜单选择
- 💻 系统信息显示
- 📚 内置帮助文档
- ⚡ 快速命令参考

### 2. 环境检测

检查开发环境是否正确配置：

```bash
node check-environment.js
```

检查项目：
- ✅ Node.js 版本 (≥16.0.0)
- ✅ 包管理器 (pnpm/npm)
- ✅ Git 配置
- ✅ VS Code 和扩展
- ✅ 项目结构完整性

### 3. 自动环境配置

一键配置完整的开发环境：

```bash
node auto-setup.js
```

配置内容：
- 📦 安装全局工具 (pnpm, vite, eslint)
- 🔧 配置 Git 用户信息
- 🔌 安装 VS Code 扩展
- ⚙️ 创建项目配置文件
- 🚀 生成快速启动脚本

### 4. 项目创建

#### 基础项目创建

```bash
node setup-project.js
```

创建内容：
- 📁 标准项目结构
- 🎮 基础游戏场景
- ⚙️ Vite 构建配置
- 🔍 ESLint 代码检查
- 📝 完整文档

#### 模板项目生成

```bash
node template-generator.js
```

可用模板：
- 🎯 **基础模板** - 简单的游戏框架
- 🏃 **平台跳跃** - 包含物理系统和关卡设计
- 🔫 **射击游戏** - 射击机制和敌人系统
- 🧩 **益智游戏** - 网格系统和匹配逻辑

### 5. 快速启动

快速启动现有项目：

```bash
node quick-start.js
```

功能：
- 🔍 项目结构检查
- 📦 依赖自动安装
- 🚀 开发服务器启动
- 💡 常用命令提示

### 6. 系统工具安装

#### Windows 系统

```powershell
# 以管理员权限运行
powershell -ExecutionPolicy Bypass -File install-tools.ps1
```

安装内容：
- Node.js (通过 Chocolatey)
- Git
- VS Code
- 基础开发工具

#### Linux/Mac 系统

```bash
# 添加执行权限
chmod +x install-tools.sh

# 运行安装脚本
bash install-tools.sh
```

安装内容：
- Node.js (通过包管理器)
- Git
- VS Code (Linux)
- 开发工具链

## 🎯 使用场景

### 新手入门

1. 运行环境检测：`node check-environment.js`
2. 如有问题，运行自动配置：`node auto-setup.js`
3. 创建第一个项目：`node setup-project.js`
4. 开始开发！

### 经验开发者

1. 使用模板生成器：`node template-generator.js`
2. 选择合适的游戏类型模板
3. 使用快速启动：`node quick-start.js`

### 团队协作

1. 统一环境配置：`node auto-setup.js`
2. 使用相同的项目模板
3. 共享 VS Code 配置和扩展

## 📁 配置文件

脚本会创建以下配置文件：

```
.vscode/
├── settings.json          # VS Code 编辑器设置
└── extensions.json        # 推荐扩展列表

templates/
├── vscode-settings.json   # VS Code 设置模板
├── vscode-extensions.json # 扩展推荐模板
└── project-template.json  # 项目模板配置
```

## 🔧 自定义配置

### 修改模板配置

编辑 `templates/project-template.json` 来自定义：
- 项目模板类型
- 依赖包版本
- 构建配置
- 资源结构

### 添加 VS Code 扩展

编辑 `templates/vscode-extensions.json` 来添加：
- 新的推荐扩展
- 项目特定扩展
- 不需要的扩展

### 自定义脚本

所有脚本都支持模块化导入：

```javascript
const { checkCommand } = require('./check-environment.js');
const { createProject } = require('./setup-project.js');
```

## 🐛 故障排除

### 常见问题

1. **权限错误**
   - Windows: 以管理员权限运行 PowerShell
   - Linux/Mac: 使用 `sudo` 或检查文件权限

2. **Node.js 版本过低**
   - 更新到 Node.js 16.0.0 或更高版本
   - 使用 nvm 管理多个 Node.js 版本

3. **网络连接问题**
   - 配置 npm 镜像：`npm config set registry https://registry.npmmirror.com`
   - 使用代理或 VPN

4. **VS Code 扩展安装失败**
   - 手动安装推荐扩展
   - 检查 VS Code 是否添加到 PATH

### 获取帮助

- 运行 `node script-manager.js` 并选择帮助选项
- 查看各脚本的详细输出信息
- 检查系统环境和权限设置

## 📝 更新日志

- **v1.0.0** - 初始版本，包含基础环境配置
- **v1.1.0** - 添加模板项目生成器
- **v1.2.0** - 添加脚本管理器和快速启动
- **v1.3.0** - 完善 VS Code 配置和扩展推荐

## 🤝 贡献

欢迎提交 Issue 和 Pull Request 来改进这些脚本工具！
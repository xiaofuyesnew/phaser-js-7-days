#!/bin/bash

# 自动化开发环境安装脚本 (macOS/Linux)
# 安装 Node.js, Git, VS Code 和必要的工具

set -e

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 日志函数
log() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

warn() {
    echo -e "${YELLOW}[WARN]${NC} $1"
}

error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# 检测操作系统
detect_os() {
    if [[ "$OSTYPE" == "darwin"* ]]; then
        OS="macos"
        log "检测到 macOS 系统"
    elif [[ "$OSTYPE" == "linux-gnu"* ]]; then
        OS="linux"
        if [ -f /etc/debian_version ]; then
            DISTRO="debian"
            log "检测到 Debian/Ubuntu 系统"
        elif [ -f /etc/redhat-release ]; then
            DISTRO="redhat"
            log "检测到 RedHat/CentOS/Fedora 系统"
        else
            DISTRO="unknown"
            warn "未知的 Linux 发行版"
        fi
    else
        error "不支持的操作系统: $OSTYPE"
        exit 1
    fi
}

# 检查命令是否存在
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# 安装 Homebrew (macOS)
install_homebrew() {
    if ! command_exists brew; then
        log "安装 Homebrew..."
        /bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
        
        # 添加到 PATH
        if [[ "$SHELL" == *"zsh"* ]]; then
            echo 'eval "$(/opt/homebrew/bin/brew shellenv)"' >> ~/.zshrc
            eval "$(/opt/homebrew/bin/brew shellenv)"
        else
            echo 'eval "$(/opt/homebrew/bin/brew shellenv)"' >> ~/.bash_profile
            eval "$(/opt/homebrew/bin/brew shellenv)"
        fi
    else
        log "Homebrew 已安装"
    fi
}

# 安装 Git
install_git() {
    if ! command_exists git; then
        log "安装 Git..."
        case $OS in
            "macos")
                brew install git
                ;;
            "linux")
                case $DISTRO in
                    "debian")
                        sudo apt update
                        sudo apt install -y git
                        ;;
                    "redhat")
                        if command_exists dnf; then
                            sudo dnf install -y git
                        else
                            sudo yum install -y git
                        fi
                        ;;
                esac
                ;;
        esac
    else
        log "Git 已安装: $(git --version)"
    fi
}

# 安装 Node.js (使用 NVM)
install_nodejs() {
    if ! command_exists node; then
        log "安装 Node.js..."
        
        # 安装 NVM
        if ! command_exists nvm; then
            log "安装 NVM..."
            curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash
            
            # 重新加载 shell 配置
            export NVM_DIR="$HOME/.nvm"
            [ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"
            [ -s "$NVM_DIR/bash_completion" ] && \. "$NVM_DIR/bash_completion"
        fi
        
        # 安装最新 LTS 版本的 Node.js
        nvm install --lts
        nvm use --lts
        nvm alias default lts/*
    else
        log "Node.js 已安装: $(node --version)"
    fi
}

# 安装 pnpm
install_pnpm() {
    if ! command_exists pnpm; then
        log "安装 pnpm..."
        npm install -g pnpm
        
        # 配置淘宝镜像
        pnpm config set registry https://registry.npmmirror.com
    else
        log "pnpm 已安装: $(pnpm --version)"
    fi
}

# 安装 VS Code
install_vscode() {
    if ! command_exists code; then
        log "安装 VS Code..."
        case $OS in
            "macos")
                brew install --cask visual-studio-code
                ;;
            "linux")
                case $DISTRO in
                    "debian")
                        # 添加 Microsoft GPG 密钥和仓库
                        wget -qO- https://packages.microsoft.com/keys/microsoft.asc | gpg --dearmor > packages.microsoft.gpg
                        sudo install -o root -g root -m 644 packages.microsoft.gpg /etc/apt/trusted.gpg.d/
                        sudo sh -c 'echo "deb [arch=amd64,arm64,armhf signed-by=/etc/apt/trusted.gpg.d/packages.microsoft.gpg] https://packages.microsoft.com/repos/code stable main" > /etc/apt/sources.list.d/vscode.list'
                        sudo apt update
                        sudo apt install -y code
                        ;;
                    "redhat")
                        sudo rpm --import https://packages.microsoft.com/keys/microsoft.asc
                        sudo sh -c 'echo -e "[code]\nname=Visual Studio Code\nbaseurl=https://packages.microsoft.com/yumrepos/vscode\nenabled=1\ngpgcheck=1\ngpgkey=https://packages.microsoft.com/keys/microsoft.asc" > /etc/yum.repos.d/vscode.repo'
                        if command_exists dnf; then
                            sudo dnf check-update
                            sudo dnf install -y code
                        else
                            sudo yum check-update
                            sudo yum install -y code
                        fi
                        ;;
                esac
                ;;
        esac
    else
        log "VS Code 已安装"
    fi
}

# 安装 VS Code 扩展
install_vscode_extensions() {
    log "安装 VS Code 扩展..."
    
    extensions=(
        "ms-ceintl.vscode-language-pack-zh-hans"
        "esbenp.prettier-vscode"
        "dbaeumer.vscode-eslint"
        "ritwickdey.liveserver"
        "eamodio.gitlens"
        "pkief.material-icon-theme"
        "formulahendry.auto-rename-tag"
        "oderwat.indent-rainbow"
        "dsznajder.es7-react-js-snippets"
        "xabikos.javascriptsnippets"
    )
    
    for extension in "${extensions[@]}"; do
        if code --list-extensions | grep -q "$extension"; then
            log "扩展已安装: $extension"
        else
            log "安装扩展: $extension"
            code --install-extension "$extension" --force
        fi
    done
}

# 配置 Git
configure_git() {
    log "配置 Git..."
    
    if [ -z "$(git config --global user.name)" ]; then
        read -p "请输入您的姓名: " git_name
        git config --global user.name "$git_name"
    fi
    
    if [ -z "$(git config --global user.email)" ]; then
        read -p "请输入您的邮箱: " git_email
        git config --global user.email "$git_email"
    fi
    
    # 设置默认编辑器为 VS Code
    git config --global core.editor "code --wait"
    
    log "Git 配置完成:"
    log "  姓名: $(git config --global user.name)"
    log "  邮箱: $(git config --global user.email)"
}

# 创建开发目录
create_dev_directory() {
    DEV_DIR="$HOME/Development"
    if [ ! -d "$DEV_DIR" ]; then
        log "创建开发目录: $DEV_DIR"
        mkdir -p "$DEV_DIR"
    fi
    
    PHASER_DIR="$DEV_DIR/phaser-projects"
    if [ ! -d "$PHASER_DIR" ]; then
        log "创建 Phaser 项目目录: $PHASER_DIR"
        mkdir -p "$PHASER_DIR"
    fi
}

# 验证安装
verify_installation() {
    log "验证安装..."
    
    echo "=========================================="
    echo "环境检查结果:"
    echo "=========================================="
    
    if command_exists git; then
        echo "✅ Git: $(git --version)"
    else
        echo "❌ Git: 未安装"
    fi
    
    if command_exists node; then
        echo "✅ Node.js: $(node --version)"
    else
        echo "❌ Node.js: 未安装"
    fi
    
    if command_exists npm; then
        echo "✅ npm: $(npm --version)"
    else
        echo "❌ npm: 未安装"
    fi
    
    if command_exists pnpm; then
        echo "✅ pnpm: $(pnpm --version)"
    else
        echo "❌ pnpm: 未安装"
    fi
    
    if command_exists code; then
        echo "✅ VS Code: 已安装"
    else
        echo "❌ VS Code: 未安装"
    fi
    
    echo "=========================================="
}

# 主函数
main() {
    echo "🚀 Phaser.js 开发环境自动安装脚本"
    echo "=========================================="
    
    detect_os
    
    # macOS 需要先安装 Homebrew
    if [ "$OS" = "macos" ]; then
        install_homebrew
    fi
    
    install_git
    install_nodejs
    install_pnpm
    install_vscode
    
    # 等待 VS Code 安装完成
    sleep 2
    
    install_vscode_extensions
    configure_git
    create_dev_directory
    
    echo ""
    log "🎉 开发环境安装完成！"
    echo ""
    log "下一步操作:"
    log "1. 重新启动终端或运行: source ~/.bashrc (或 ~/.zshrc)"
    log "2. 运行环境检查: node check-environment.js"
    log "3. 创建第一个项目: node setup-project.js"
    echo ""
    
    verify_installation
}

# 运行主函数
main "$@"
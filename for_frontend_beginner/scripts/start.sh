#!/bin/bash

# Phaser.js 开发环境管理工具启动脚本

echo ""
echo "========================================"
echo "  Phaser.js 开发环境管理工具"
echo "========================================"
echo ""

# 检查 Node.js 是否安装
if ! command -v node &> /dev/null; then
    echo "❌ Node.js 未安装或未添加到 PATH"
    echo ""
    echo "请先安装 Node.js:"
    echo "1. 访问 https://nodejs.org"
    echo "2. 下载并安装 LTS 版本"
    echo "3. 重新运行此脚本"
    echo ""
    read -p "按 Enter 键退出..."
    exit 1
fi

# 显示 Node.js 版本
NODE_VERSION=$(node --version)
echo "✅ Node.js 版本: $NODE_VERSION"
echo ""

# 运行脚本管理器
echo "🚀 启动脚本管理器..."
echo ""
node script-manager.js

echo ""
echo "👋 感谢使用 Phaser.js 开发环境管理工具！"
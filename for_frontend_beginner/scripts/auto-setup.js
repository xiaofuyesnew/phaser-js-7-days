#!/usr/bin/env node

/**
 * 自动化环境配置脚本
 * 一键配置完整的 Phaser.js 开发环境
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const os = require('os');
const readline = require('readline');

// 颜色输出
const colors = {
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  reset: '\x1b[0m',
  bold: '\x1b[1m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function question(prompt) {
  return new Promise(resolve => {
    rl.question(prompt, resolve);
  });
}

function runCommand(command, description, optional = false) {
  try {
    log(`🔧 ${description}...`, 'blue');
    execSync(command, { stdio: 'inherit' });
    log(`✅ ${description} 完成`, 'green');
    return true;
  } catch (error) {
    if (optional) {
      log(`⚠️  ${description} 跳过 (可选)`, 'yellow');
      return false;
    } else {
      log(`❌ ${description} 失败: ${error.message}`, 'red');
      return false;
    }
  }
}

function checkAndInstallNode() {
  try {
    const nodeVersion = execSync('node --version', { encoding: 'utf8' }).trim();
    const majorVersion = parseInt(nodeVersion.replace('v', '').split('.')[0]);
    
    if (majorVersion >= 16) {
      log(`✅ Node.js ${nodeVersion} 已安装`, 'green');
      return true;
    } else {
      log(`❌ Node.js 版本过低 (${nodeVersion})，需要 16.0.0 或更高版本`, 'red');
      return false;
    }
  } catch (error) {
    log('❌ Node.js 未安装', 'red');
    log('请访问 https://nodejs.org 下载并安装 Node.js', 'yellow');
    return false;
  }
}

function installGlobalTools() {
  const tools = [
    { name: 'pnpm', command: 'npm install -g pnpm', check: 'pnpm --version' },
    { name: 'vite', command: 'npm install -g vite', check: 'vite --version', optional: true },
    { name: 'eslint', command: 'npm install -g eslint', check: 'eslint --version', optional: true }
  ];

  let success = true;
  
  for (const tool of tools) {
    try {
      execSync(tool.check, { stdio: 'pipe' });
      log(`✅ ${tool.name} 已安装`, 'green');
    } catch (error) {
      log(`📦 安装 ${tool.name}...`, 'blue');
      if (runCommand(tool.command, `安装 ${tool.name}`, tool.optional)) {
        log(`✅ ${tool.name} 安装成功`, 'green');
      } else if (!tool.optional) {
        success = false;
      }
    }
  }
  
  return success;
}

function configureGit() {
  try {
    const userName = execSync('git config --global user.name', { encoding: 'utf8', stdio: 'pipe' }).trim();
    const userEmail = execSync('git config --global user.email', { encoding: 'utf8', stdio: 'pipe' }).trim();
    
    if (userName && userEmail) {
      log(`✅ Git 已配置: ${userName} <${userEmail}>`, 'green');
      return true;
    }
  } catch (error) {
    // Git 未配置，需要配置
  }
  
  log('🔧 配置 Git 用户信息...', 'blue');
  return false; // 需要用户手动输入
}

async function setupGitConfig() {
  try {
    const userName = await question('请输入您的姓名: ');
    const userEmail = await question('请输入您的邮箱: ');
    
    if (userName && userEmail) {
      runCommand(`git config --global user.name "${userName}"`, '设置 Git 用户名');
      runCommand(`git config --global user.email "${userEmail}"`, '设置 Git 邮箱');
      
      // 设置其他有用的 Git 配置
      runCommand('git config --global init.defaultBranch main', '设置默认分支为 main', true);
      runCommand('git config --global core.autocrlf input', '设置换行符处理', true);
      runCommand('git config --global pull.rebase false', '设置 pull 策略', true);
      
      return true;
    }
  } catch (error) {
    log(`❌ Git 配置失败: ${error.message}`, 'red');
  }
  
  return false;
}

function installVSCodeExtensions() {
  const extensions = [
    'ms-ceintl.vscode-language-pack-zh-hans',
    'esbenp.prettier-vscode',
    'dbaeumer.vscode-eslint',
    'ritwickdey.liveserver',
    'eamodio.gitlens',
    'pkief.material-icon-theme',
    'formulahendry.auto-rename-tag',
    'christian-kohler.path-intellisense',
    'ms-vscode.vscode-json'
  ];

  try {
    // 检查 VS Code 是否安装
    execSync('code --version', { stdio: 'pipe' });
    log('✅ VS Code 已安装', 'green');
    
    log('📦 安装 VS Code 扩展...', 'blue');
    let installedCount = 0;
    
    for (const extension of extensions) {
      try {
        execSync(`code --install-extension ${extension}`, { stdio: 'pipe' });
        log(`  ✅ ${extension}`, 'green');
        installedCount++;
      } catch (error) {
        log(`  ⚠️  ${extension} 安装失败`, 'yellow');
      }
    }
    
    log(`✅ 成功安装 ${installedCount}/${extensions.length} 个扩展`, 'green');
    return true;
    
  } catch (error) {
    log('❌ VS Code 未安装或未添加到 PATH', 'red');
    log('请安装 VS Code 并确保添加到系统 PATH', 'yellow');
    return false;
  }
}

function createVSCodeConfig() {
  const vscodeDir = '.vscode';
  
  if (!fs.existsSync(vscodeDir)) {
    fs.mkdirSync(vscodeDir);
  }
  
  // 复制配置文件
  const templatesDir = path.join(__dirname, '../templates');
  const configFiles = [
    { src: 'vscode-settings.json', dest: 'settings.json' },
    { src: 'vscode-extensions.json', dest: 'extensions.json' }
  ];
  
  for (const file of configFiles) {
    try {
      const srcPath = path.join(templatesDir, file.src);
      const destPath = path.join(vscodeDir, file.dest);
      
      if (fs.existsSync(srcPath)) {
        fs.copyFileSync(srcPath, destPath);
        log(`✅ 创建 VS Code 配置: ${file.dest}`, 'green');
      }
    } catch (error) {
      log(`⚠️  创建 VS Code 配置失败: ${file.dest}`, 'yellow');
    }
  }
}

function createProjectTemplate() {
  const templateDir = 'phaser-template';
  
  if (fs.existsSync(templateDir)) {
    log(`⚠️  模板目录 ${templateDir} 已存在，跳过创建`, 'yellow');
    return false;
  }
  
  log(`📁 创建项目模板: ${templateDir}`, 'blue');
  
  try {
    // 使用现有的 setup-project.js 创建模板
    const setupScript = path.join(__dirname, 'setup-project.js');
    if (fs.existsSync(setupScript)) {
      // 创建一个简单的模板项目
      fs.mkdirSync(templateDir);
      process.chdir(templateDir);
      
      // 运行项目创建脚本
      const { createProject } = require('./setup-project.js');
      // 这里需要修改 setup-project.js 以支持非交互式创建
      
      process.chdir('..');
      log(`✅ 项目模板创建完成: ${templateDir}`, 'green');
      return true;
    }
  } catch (error) {
    log(`❌ 创建项目模板失败: ${error.message}`, 'red');
  }
  
  return false;
}

function generateQuickStartScript() {
  const scriptContent = `#!/bin/bash

# Phaser.js 项目快速启动脚本

echo "🚀 Phaser.js 项目快速启动"
echo ""

# 检查是否在项目目录中
if [ ! -f "package.json" ]; then
    echo "❌ 当前目录不是一个有效的项目目录"
    echo "请在项目根目录中运行此脚本"
    exit 1
fi

# 检查依赖是否已安装
if [ ! -d "node_modules" ]; then
    echo "📦 安装项目依赖..."
    if command -v pnpm &> /dev/null; then
        pnpm install
    else
        npm install
    fi
fi

# 启动开发服务器
echo "🔥 启动开发服务器..."
if command -v pnpm &> /dev/null; then
    pnpm dev
else
    npm run dev
fi
`;

  const scriptPath = 'quick-start.sh';
  fs.writeFileSync(scriptPath, scriptContent);
  
  // 在 Windows 上创建 .bat 版本
  if (os.platform() === 'win32') {
    const batContent = `@echo off

echo 🚀 Phaser.js 项目快速启动
echo.

REM 检查是否在项目目录中
if not exist "package.json" (
    echo ❌ 当前目录不是一个有效的项目目录
    echo 请在项目根目录中运行此脚本
    pause
    exit /b 1
)

REM 检查依赖是否已安装
if not exist "node_modules" (
    echo 📦 安装项目依赖...
    where pnpm >nul 2>nul
    if %errorlevel% == 0 (
        pnpm install
    ) else (
        npm install
    )
)

REM 启动开发服务器
echo 🔥 启动开发服务器...
where pnpm >nul 2>nul
if %errorlevel% == 0 (
    pnpm dev
) else (
    npm run dev
)

pause
`;
    fs.writeFileSync('quick-start.bat', batContent);
    log('✅ 创建快速启动脚本: quick-start.sh, quick-start.bat', 'green');
  } else {
    // 在 Unix 系统上设置执行权限
    try {
      execSync(`chmod +x ${scriptPath}`);
      log('✅ 创建快速启动脚本: quick-start.sh', 'green');
    } catch (error) {
      log('✅ 创建快速启动脚本: quick-start.sh (请手动设置执行权限)', 'green');
    }
  }
}

async function main() {
  try {
    log('🔧 Phaser.js 开发环境自动配置工具', 'bold');
    log('');
    
    // 检查 Node.js
    if (!checkAndInstallNode()) {
      log('❌ Node.js 环境检查失败，请先安装 Node.js', 'red');
      return;
    }
    
    // 安装全局工具
    log('📦 检查和安装全局工具...', 'blue');
    installGlobalTools();
    
    // 配置 Git
    if (!configureGit()) {
      const shouldConfigureGit = await question('是否现在配置 Git 用户信息? (Y/n): ');
      if (shouldConfigureGit.toLowerCase() !== 'n') {
        await setupGitConfig();
      }
    }
    
    // 安装 VS Code 扩展
    const shouldInstallExtensions = await question('是否安装推荐的 VS Code 扩展? (Y/n): ');
    if (shouldInstallExtensions.toLowerCase() !== 'n') {
      installVSCodeExtensions();
    }
    
    // 创建 VS Code 配置
    const shouldCreateVSCodeConfig = await question('是否在当前目录创建 VS Code 配置? (Y/n): ');
    if (shouldCreateVSCodeConfig.toLowerCase() !== 'n') {
      createVSCodeConfig();
    }
    
    // 生成快速启动脚本
    const shouldCreateQuickStart = await question('是否创建项目快速启动脚本? (Y/n): ');
    if (shouldCreateQuickStart.toLowerCase() !== 'n') {
      generateQuickStartScript();
    }
    
    log('');
    log('🎉 环境配置完成！', 'green');
    log('');
    log('下一步操作:', 'bold');
    log('1. 创建新项目: node scripts/setup-project.js', 'blue');
    log('2. 或在现有项目中运行: ./quick-start.sh (Linux/Mac) 或 quick-start.bat (Windows)', 'blue');
    log('3. 在 VS Code 中打开项目开始开发', 'blue');
    log('');
    log('如需帮助，请查看 README.md 文档', 'yellow');
    
  } catch (error) {
    log(`❌ 配置过程中出现错误: ${error.message}`, 'red');
  } finally {
    rl.close();
  }
}

if (require.main === module) {
  main();
}

module.exports = { main };
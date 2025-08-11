#!/usr/bin/env node

/**
 * 环境检测脚本
 * 检查开发环境是否正确配置
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const os = require('os');

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

function checkCommand(command, name, minVersion = null) {
  try {
    const output = execSync(command, { encoding: 'utf8', stdio: 'pipe' });
    const version = output.trim();
    
    if (minVersion && !checkVersion(version, minVersion)) {
      log(`❌ ${name}: ${version} (需要 ${minVersion} 或更高版本)`, 'red');
      return false;
    }
    
    log(`✅ ${name}: ${version}`, 'green');
    return true;
  } catch (error) {
    log(`❌ ${name}: 未安装`, 'red');
    return false;
  }
}

function checkVersion(current, required) {
  const currentParts = current.replace(/[^\d.]/g, '').split('.').map(Number);
  const requiredParts = required.split('.').map(Number);
  
  for (let i = 0; i < Math.max(currentParts.length, requiredParts.length); i++) {
    const currentPart = currentParts[i] || 0;
    const requiredPart = requiredParts[i] || 0;
    
    if (currentPart > requiredPart) return true;
    if (currentPart < requiredPart) return false;
  }
  
  return true;
}

function checkGitConfig() {
  try {
    const userName = execSync('git config --global user.name', { encoding: 'utf8', stdio: 'pipe' }).trim();
    const userEmail = execSync('git config --global user.email', { encoding: 'utf8', stdio: 'pipe' }).trim();
    
    if (userName && userEmail) {
      log(`✅ Git 配置: ${userName} <${userEmail}>`, 'green');
      return true;
    } else {
      log(`❌ Git 配置: 用户信息未设置`, 'red');
      return false;
    }
  } catch (error) {
    log(`❌ Git 配置: 配置信息获取失败`, 'red');
    return false;
  }
}

function checkVSCodeExtensions() {
  try {
    const extensions = execSync('code --list-extensions', { encoding: 'utf8', stdio: 'pipe' });
    const installedExtensions = extensions.split('\n').filter(ext => ext.trim());
    
    const recommendedExtensions = [
      'ms-ceintl.vscode-language-pack-zh-hans',
      'esbenp.prettier-vscode',
      'dbaeumer.vscode-eslint',
      'ritwickdey.liveserver',
      'eamodio.gitlens'
    ];
    
    const missingExtensions = recommendedExtensions.filter(ext => 
      !installedExtensions.some(installed => installed.toLowerCase().includes(ext.toLowerCase()))
    );
    
    if (missingExtensions.length === 0) {
      log(`✅ VS Code 扩展: 所有推荐扩展已安装`, 'green');
      return true;
    } else {
      log(`⚠️  VS Code 扩展: 缺少 ${missingExtensions.length} 个推荐扩展`, 'yellow');
      log(`   缺少的扩展: ${missingExtensions.join(', ')}`, 'yellow');
      return false;
    }
  } catch (error) {
    log(`❌ VS Code: 未安装或未添加到 PATH`, 'red');
    return false;
  }
}

function checkProjectStructure() {
  const projectRoot = process.cwd();
  const requiredFiles = ['package.json'];
  const optionalFiles = ['vite.config.js', 'index.html', 'src/main.js'];
  
  let hasRequired = true;
  let hasOptional = 0;
  
  requiredFiles.forEach(file => {
    if (fs.existsSync(path.join(projectRoot, file))) {
      log(`✅ 项目文件: ${file}`, 'green');
    } else {
      log(`❌ 项目文件: ${file} 缺失`, 'red');
      hasRequired = false;
    }
  });
  
  optionalFiles.forEach(file => {
    if (fs.existsSync(path.join(projectRoot, file))) {
      log(`✅ 项目文件: ${file}`, 'green');
      hasOptional++;
    } else {
      log(`⚠️  项目文件: ${file} 缺失 (可选)`, 'yellow');
    }
  });
  
  return hasRequired;
}

function generateReport(results) {
  log('\n' + '='.repeat(50), 'blue');
  log('环境检测报告', 'bold');
  log('='.repeat(50), 'blue');
  
  const passed = results.filter(r => r.status).length;
  const total = results.length;
  
  log(`\n总体状态: ${passed}/${total} 项检查通过`, passed === total ? 'green' : 'yellow');
  
  if (passed < total) {
    log('\n需要修复的问题:', 'red');
    results.filter(r => !r.status).forEach(r => {
      log(`- ${r.name}: ${r.suggestion}`, 'red');
    });
  }
  
  log('\n系统信息:', 'blue');
  log(`- 操作系统: ${os.type()} ${os.release()}`, 'blue');
  log(`- CPU 架构: ${os.arch()}`, 'blue');
  log(`- Node.js 架构: ${process.arch}`, 'blue');
  log(`- 内存: ${Math.round(os.totalmem() / 1024 / 1024 / 1024)}GB`, 'blue');
}

async function main() {
  log('🔍 开始检测开发环境...', 'bold');
  log('');
  
  const results = [];
  
  // 检查基础工具
  results.push({
    name: 'Node.js',
    status: checkCommand('node --version', 'Node.js', '16.0.0'),
    suggestion: '请安装 Node.js 16.0.0 或更高版本'
  });
  
  results.push({
    name: 'npm',
    status: checkCommand('npm --version', 'npm', '7.0.0'),
    suggestion: '请更新 npm 到 7.0.0 或更高版本'
  });
  
  results.push({
    name: 'pnpm',
    status: checkCommand('pnpm --version', 'pnpm'),
    suggestion: '请安装 pnpm: npm install -g pnpm'
  });
  
  results.push({
    name: 'Git',
    status: checkCommand('git --version', 'Git', '2.20.0'),
    suggestion: '请安装 Git 2.20.0 或更高版本'
  });
  
  // 检查 Git 配置
  results.push({
    name: 'Git 配置',
    status: checkGitConfig(),
    suggestion: '请配置 Git 用户信息: git config --global user.name "姓名" && git config --global user.email "邮箱"'
  });
  
  // 检查 VS Code
  results.push({
    name: 'VS Code 扩展',
    status: checkVSCodeExtensions(),
    suggestion: '请安装推荐的 VS Code 扩展'
  });
  
  // 检查项目结构（如果在项目目录中）
  if (fs.existsSync('package.json')) {
    results.push({
      name: '项目结构',
      status: checkProjectStructure(),
      suggestion: '请确保项目包含必要的配置文件'
    });
  }
  
  log('');
  generateReport(results);
  
  // 提供修复建议
  if (results.some(r => !r.status)) {
    log('\n🔧 快速修复命令:', 'yellow');
    log('');
    
    if (!results.find(r => r.name === 'pnpm')?.status) {
      log('# 安装 pnpm', 'yellow');
      log('npm install -g pnpm', 'blue');
      log('');
    }
    
    if (!results.find(r => r.name === 'Git 配置')?.status) {
      log('# 配置 Git', 'yellow');
      log('git config --global user.name "您的姓名"', 'blue');
      log('git config --global user.email "您的邮箱"', 'blue');
      log('');
    }
    
    if (!results.find(r => r.name === 'VS Code 扩展')?.status) {
      log('# 安装 VS Code 扩展', 'yellow');
      log('code --install-extension ms-ceintl.vscode-language-pack-zh-hans', 'blue');
      log('code --install-extension esbenp.prettier-vscode', 'blue');
      log('code --install-extension dbaeumer.vscode-eslint', 'blue');
      log('code --install-extension ritwickdey.liveserver', 'blue');
      log('code --install-extension eamodio.gitlens', 'blue');
      log('');
    }
  } else {
    log('\n🎉 恭喜！您的开发环境配置完美！', 'green');
    log('现在可以开始 Phaser.js 游戏开发之旅了！', 'green');
  }
}

if (require.main === module) {
  main().catch(console.error);
}

module.exports = { checkCommand, checkVersion, checkGitConfig };
#!/usr/bin/env node

/**
 * 快速启动脚本
 * 一键启动 Phaser.js 项目开发环境
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

function runCommand(command, description, options = {}) {
  try {
    log(`🔧 ${description}...`, 'blue');
    const result = execSync(command, { 
      encoding: 'utf8', 
      stdio: options.silent ? 'pipe' : 'inherit',
      ...options 
    });
    log(`✅ ${description} 完成`, 'green');
    return result;
  } catch (error) {
    log(`❌ ${description} 失败: ${error.message}`, 'red');
    return null;
  }
}

function checkProjectStructure() {
  const requiredFiles = ['package.json'];
  const optionalFiles = ['vite.config.js', 'index.html', 'src/main.js'];
  
  log('🔍 检查项目结构...', 'blue');
  
  // 检查必需文件
  for (const file of requiredFiles) {
    if (!fs.existsSync(file)) {
      log(`❌ 缺少必需文件: ${file}`, 'red');
      log('这不是一个有效的项目目录', 'red');
      return false;
    }
  }
  
  // 检查可选文件
  let missingOptional = [];
  for (const file of optionalFiles) {
    if (!fs.existsSync(file)) {
      missingOptional.push(file);
    }
  }
  
  if (missingOptional.length > 0) {
    log(`⚠️  缺少可选文件: ${missingOptional.join(', ')}`, 'yellow');
  }
  
  log('✅ 项目结构检查通过', 'green');
  return true;
}

function checkDependencies() {
  log('📦 检查项目依赖...', 'blue');
  
  if (!fs.existsSync('node_modules')) {
    log('⚠️  依赖未安装，开始安装...', 'yellow');
    return installDependencies();
  }
  
  // 检查 package.json 是否有更新
  try {
    const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
    const packageLock = fs.existsSync('pnpm-lock.yaml') ? 'pnpm-lock.yaml' : 
                       fs.existsSync('package-lock.json') ? 'package-lock.json' : null;
    
    if (packageLock) {
      const packageStat = fs.statSync('package.json');
      const lockStat = fs.statSync(packageLock);
      
      if (packageStat.mtime > lockStat.mtime) {
        log('⚠️  package.json 已更新，重新安装依赖...', 'yellow');
        return installDependencies();
      }
    }
  } catch (error) {
    log('⚠️  检查依赖时出错，重新安装...', 'yellow');
    return installDependencies();
  }
  
  log('✅ 依赖检查通过', 'green');
  return true;
}

function installDependencies() {
  // 优先使用 pnpm
  if (checkPackageManager('pnpm')) {
    return runCommand('pnpm install', '使用 pnpm 安装依赖') !== null;
  }
  
  // 备选 npm
  if (checkPackageManager('npm')) {
    return runCommand('npm install', '使用 npm 安装依赖') !== null;
  }
  
  log('❌ 未找到可用的包管理器 (pnpm 或 npm)', 'red');
  return false;
}

function checkPackageManager(manager) {
  try {
    execSync(`${manager} --version`, { stdio: 'pipe' });
    return true;
  } catch (error) {
    return false;
  }
}

function startDevServer() {
  log('🚀 启动开发服务器...', 'blue');
  
  // 检查可用的启动命令
  const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
  const scripts = packageJson.scripts || {};
  
  let startCommand = null;
  
  if (scripts.dev) {
    startCommand = 'dev';
  } else if (scripts.start) {
    startCommand = 'start';
  } else if (scripts.serve) {
    startCommand = 'serve';
  }
  
  if (!startCommand) {
    log('❌ 未找到启动脚本 (dev, start, serve)', 'red');
    log('请检查 package.json 中的 scripts 配置', 'yellow');
    return false;
  }
  
  // 使用合适的包管理器启动
  if (checkPackageManager('pnpm')) {
    log(`🔥 使用 pnpm run ${startCommand} 启动...`, 'green');
    execSync(`pnpm run ${startCommand}`, { stdio: 'inherit' });
  } else if (checkPackageManager('npm')) {
    log(`🔥 使用 npm run ${startCommand} 启动...`, 'green');
    execSync(`npm run ${startCommand}`, { stdio: 'inherit' });
  } else {
    log('❌ 未找到可用的包管理器', 'red');
    return false;
  }
  
  return true;
}

function showProjectInfo() {
  try {
    const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
    
    log('📋 项目信息:', 'bold');
    log(`   名称: ${packageJson.name}`, 'blue');
    log(`   版本: ${packageJson.version}`, 'blue');
    log(`   描述: ${packageJson.description || '无'}`, 'blue');
    
    if (packageJson.dependencies) {
      const deps = Object.keys(packageJson.dependencies);
      log(`   依赖: ${deps.join(', ')}`, 'blue');
    }
    
    log('');
  } catch (error) {
    log('⚠️  无法读取项目信息', 'yellow');
  }
}

function showUsefulCommands() {
  log('💡 常用命令:', 'bold');
  log('');
  
  const commands = [
    { cmd: 'pnpm dev', desc: '启动开发服务器' },
    { cmd: 'pnpm build', desc: '构建生产版本' },
    { cmd: 'pnpm preview', desc: '预览生产版本' },
    { cmd: 'pnpm lint', desc: '检查代码规范' },
    { cmd: 'pnpm lint:fix', desc: '自动修复代码规范问题' }
  ];
  
  commands.forEach(({ cmd, desc }) => {
    log(`   ${cmd.padEnd(20)} - ${desc}`, 'blue');
  });
  
  log('');
  log('🔧 开发工具:', 'bold');
  log('   code .                - 在 VS Code 中打开项目', 'blue');
  log('   git init              - 初始化 Git 仓库', 'blue');
  log('   git add .             - 添加所有文件到暂存区', 'blue');
  log('   git commit -m "msg"   - 提交更改', 'blue');
  log('');
}

function checkEnvironment() {
  log('🔍 检查开发环境...', 'blue');
  
  const checks = [
    { name: 'Node.js', command: 'node --version', required: true },
    { name: 'pnpm', command: 'pnpm --version', required: false },
    { name: 'npm', command: 'npm --version', required: false },
    { name: 'Git', command: 'git --version', required: false },
    { name: 'VS Code', command: 'code --version', required: false }
  ];
  
  let hasRequired = true;
  let hasOptional = 0;
  
  for (const check of checks) {
    try {
      const version = execSync(check.command, { encoding: 'utf8', stdio: 'pipe' }).trim();
      log(`   ✅ ${check.name}: ${version.split('\n')[0]}`, 'green');
      if (!check.required) hasOptional++;
    } catch (error) {
      if (check.required) {
        log(`   ❌ ${check.name}: 未安装`, 'red');
        hasRequired = false;
      } else {
        log(`   ⚠️  ${check.name}: 未安装`, 'yellow');
      }
    }
  }
  
  if (!hasRequired) {
    log('❌ 缺少必需的环境依赖', 'red');
    return false;
  }
  
  log(`✅ 环境检查完成 (${hasOptional}/4 个可选工具已安装)`, 'green');
  return true;
}

function main() {
  log('🚀 Phaser.js 项目快速启动工具', 'bold');
  log('');
  
  // 检查是否在项目目录中
  if (!checkProjectStructure()) {
    log('');
    log('💡 提示:', 'yellow');
    log('   如果您想创建新项目，请运行:', 'yellow');
    log('   node scripts/setup-project.js', 'blue');
    log('   或', 'yellow');
    log('   node scripts/template-generator.js', 'blue');
    return;
  }
  
  // 显示项目信息
  showProjectInfo();
  
  // 检查环境
  if (!checkEnvironment()) {
    log('');
    log('💡 提示: 运行环境配置脚本来自动安装缺少的工具:', 'yellow');
    log('   node scripts/auto-setup.js', 'blue');
    return;
  }
  
  // 检查和安装依赖
  if (!checkDependencies()) {
    log('❌ 依赖安装失败', 'red');
    return;
  }
  
  log('');
  log('🎉 准备就绪！', 'green');
  log('');
  
  // 显示有用的命令
  showUsefulCommands();
  
  // 询问是否立即启动开发服务器
  const readline = require('readline');
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });
  
  rl.question('是否现在启动开发服务器? (Y/n): ', (answer) => {
    rl.close();
    
    if (answer.toLowerCase() !== 'n') {
      log('');
      startDevServer();
    } else {
      log('');
      log('👋 准备好开发时，运行 pnpm dev 启动服务器', 'blue');
    }
  });
}

if (require.main === module) {
  main();
}

module.exports = { main };
#!/usr/bin/env node

/**
 * 脚本管理器
 * 统一管理所有环境配置和项目创建脚本
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const readline = require('readline');

// 颜色输出
const colors = {
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
  magenta: '\x1b[35m',
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

// 可用的脚本
const scripts = {
  '1': {
    name: '环境检测',
    description: '检查开发环境是否正确配置',
    file: 'check-environment.js',
    icon: '🔍'
  },
  '2': {
    name: '自动环境配置',
    description: '一键配置完整的开发环境',
    file: 'auto-setup.js',
    icon: '🔧'
  },
  '3': {
    name: '创建基础项目',
    description: '创建标准的 Phaser.js 项目',
    file: 'setup-project.js',
    icon: '📁'
  },
  '4': {
    name: '模板项目生成器',
    description: '根据模板创建不同类型的游戏项目',
    file: 'template-generator.js',
    icon: '🎮'
  },
  '5': {
    name: '快速启动',
    description: '快速启动现有项目的开发环境',
    file: 'quick-start.js',
    icon: '🚀'
  },
  '6': {
    name: '安装开发工具 (Windows)',
    description: '在 Windows 系统上安装开发工具',
    file: 'install-tools.ps1',
    icon: '🪟'
  },
  '7': {
    name: '安装开发工具 (Linux/Mac)',
    description: '在 Linux/Mac 系统上安装开发工具',
    file: 'install-tools.sh',
    icon: '🐧'
  }
};

function displayMenu() {
  log('🎯 Phaser.js 开发环境管理工具', 'bold');
  log('', 'reset');
  log('请选择要执行的操作:', 'cyan');
  log('', 'reset');
  
  Object.entries(scripts).forEach(([key, script]) => {
    log(`  ${key}. ${script.icon} ${script.name}`, 'blue');
    log(`     ${script.description}`, 'reset');
    log('', 'reset');
  });
  
  log('  0. 🚪 退出', 'red');
  log('', 'reset');
}

function displaySystemInfo() {
  const os = require('os');
  
  log('💻 系统信息:', 'bold');
  log(`   操作系统: ${os.type()} ${os.release()}`, 'blue');
  log(`   CPU 架构: ${os.arch()}`, 'blue');
  log(`   Node.js 版本: ${process.version}`, 'blue');
  log(`   内存: ${Math.round(os.totalmem() / 1024 / 1024 / 1024)}GB`, 'blue');
  log('', 'reset');
}

function checkScriptExists(scriptFile) {
  const scriptPath = path.join(__dirname, scriptFile);
  return fs.existsSync(scriptPath);
}

async function runScript(scriptFile) {
  const scriptPath = path.join(__dirname, scriptFile);
  
  if (!checkScriptExists(scriptFile)) {
    log(`❌ 脚本文件不存在: ${scriptFile}`, 'red');
    return false;
  }
  
  try {
    log(`🔄 执行脚本: ${scriptFile}`, 'blue');
    log('', 'reset');
    
    if (scriptFile.endsWith('.js')) {
      // 执行 Node.js 脚本
      execSync(`node "${scriptPath}"`, { stdio: 'inherit' });
    } else if (scriptFile.endsWith('.ps1')) {
      // 执行 PowerShell 脚本
      execSync(`powershell -ExecutionPolicy Bypass -File "${scriptPath}"`, { stdio: 'inherit' });
    } else if (scriptFile.endsWith('.sh')) {
      // 执行 Shell 脚本
      execSync(`bash "${scriptPath}"`, { stdio: 'inherit' });
    }
    
    log('', 'reset');
    log('✅ 脚本执行完成', 'green');
    return true;
  } catch (error) {
    log('', 'reset');
    log(`❌ 脚本执行失败: ${error.message}`, 'red');
    return false;
  }
}

function displayHelp() {
  log('📚 使用帮助:', 'bold');
  log('', 'reset');
  
  log('🔍 环境检测:', 'yellow');
  log('   检查 Node.js、pnpm、Git、VS Code 等工具是否正确安装', 'reset');
  log('   推荐在开始开发前运行此检测', 'reset');
  log('', 'reset');
  
  log('🔧 自动环境配置:', 'yellow');
  log('   自动安装和配置开发环境', 'reset');
  log('   包括全局工具安装、Git 配置、VS Code 扩展等', 'reset');
  log('', 'reset');
  
  log('📁 创建基础项目:', 'yellow');
  log('   创建标准的 Phaser.js 项目结构', 'reset');
  log('   包含基本的场景、配置文件和开发环境', 'reset');
  log('', 'reset');
  
  log('🎮 模板项目生成器:', 'yellow');
  log('   根据不同游戏类型创建项目模板', 'reset');
  log('   支持平台跳跃、射击、益智等游戏类型', 'reset');
  log('', 'reset');
  
  log('🚀 快速启动:', 'yellow');
  log('   快速启动现有项目的开发服务器', 'reset');
  log('   自动检查依赖并启动开发环境', 'reset');
  log('', 'reset');
  
  log('🪟🐧 安装开发工具:', 'yellow');
  log('   在不同操作系统上自动安装开发工具', 'reset');
  log('   包括 Node.js、Git、VS Code 等', 'reset');
  log('', 'reset');
}

function displayQuickCommands() {
  log('⚡ 快速命令:', 'bold');
  log('', 'reset');
  
  const commands = [
    { cmd: 'node scripts/script-manager.js', desc: '启动脚本管理器' },
    { cmd: 'node scripts/check-environment.js', desc: '检查环境' },
    { cmd: 'node scripts/auto-setup.js', desc: '自动配置环境' },
    { cmd: 'node scripts/setup-project.js', desc: '创建基础项目' },
    { cmd: 'node scripts/template-generator.js', desc: '创建模板项目' },
    { cmd: 'node scripts/quick-start.js', desc: '快速启动项目' }
  ];
  
  commands.forEach(({ cmd, desc }) => {
    log(`   ${cmd}`, 'blue');
    log(`   ${desc}`, 'reset');
    log('', 'reset');
  });
}

async function main() {
  try {
    while (true) {
      console.clear();
      displayMenu();
      displaySystemInfo();
      
      const choice = await question('请输入选项 (0-7, h=帮助, q=快速命令): ');
      
      if (choice === '0' || choice.toLowerCase() === 'exit') {
        log('👋 再见！', 'green');
        break;
      }
      
      if (choice.toLowerCase() === 'h' || choice.toLowerCase() === 'help') {
        console.clear();
        displayHelp();
        await question('按 Enter 键返回主菜单...');
        continue;
      }
      
      if (choice.toLowerCase() === 'q' || choice.toLowerCase() === 'quick') {
        console.clear();
        displayQuickCommands();
        await question('按 Enter 键返回主菜单...');
        continue;
      }
      
      if (scripts[choice]) {
        console.clear();
        const script = scripts[choice];
        log(`${script.icon} ${script.name}`, 'bold');
        log(`${script.description}`, 'cyan');
        log('', 'reset');
        
        const confirm = await question('确认执行此脚本? (Y/n): ');
        if (confirm.toLowerCase() !== 'n') {
          await runScript(script.file);
          await question('按 Enter 键返回主菜单...');
        }
      } else {
        log('❌ 无效的选项，请重新选择', 'red');
        await question('按 Enter 键继续...');
      }
    }
  } catch (error) {
    log(`❌ 程序执行出错: ${error.message}`, 'red');
  } finally {
    rl.close();
  }
}

// 如果直接运行此脚本
if (require.main === module) {
  main();
}

module.exports = { main, scripts };
#!/usr/bin/env node

/**
 * Phaser.js 7天教程项目初始化脚本
 * 用于快速创建新的教程项目或更新现有项目配置
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 配置选项
const CONFIG = {
    templateDir: __dirname,
    days: [
        { key: '1_starter', title: 'Phaser.js基础' },
        { key: '2_sprite', title: '精灵与动画' },
        { key: '3_tilemap', title: '地图与物理系统' },
        { key: '4_camera', title: '摄像机与场景滚动' },
        { key: '5_enemy', title: '敌人与碰撞检测' },
        { key: '6_audio_ui_status', title: '音效、UI与状态管理' },
        { key: '7_deploy_review', title: '游戏部署与优化' }
    ]
};

/**
 * 复制文件
 * @param {string} src 源文件路径
 * @param {string} dest 目标文件路径
 */
function copyFile(src, dest) {
    try {
        const content = fs.readFileSync(src, 'utf8');
        fs.writeFileSync(dest, content);
        console.log(`✅ 复制文件: ${dest}`);
    } catch (error) {
        console.error(`❌ 复制文件失败: ${dest}`, error.message);
    }
}

/**
 * 创建目录
 * @param {string} dir 目录路径
 */
function createDirectory(dir) {
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
        console.log(`📁 创建目录: ${dir}`);
    }
}

/**
 * 更新package.json文件
 * @param {string} projectPath 项目路径
 * @param {Object} dayInfo 天数信息
 */
function updatePackageJson(projectPath, dayInfo) {
    const packagePath = path.join(projectPath, 'package.json');
    const templatePackagePath = path.join(CONFIG.templateDir, 'package.json');
    
    try {
        const templatePackage = JSON.parse(fs.readFileSync(templatePackagePath, 'utf8'));
        
        // 更新项目特定信息
        templatePackage.name = `phaser-tutorial-${dayInfo.key}`;
        templatePackage.description = `Phaser.js 7天教程 - ${dayInfo.title}`;
        
        fs.writeFileSync(packagePath, JSON.stringify(templatePackage, null, 2));
        console.log(`📦 更新 package.json: ${packagePath}`);
    } catch (error) {
        console.error(`❌ 更新 package.json 失败: ${packagePath}`, error.message);
    }
}

/**
 * 更新index.html文件
 * @param {string} projectPath 项目路径
 * @param {Object} dayInfo 天数信息
 */
function updateIndexHtml(projectPath, dayInfo) {
    const indexPath = path.join(projectPath, 'index.html');
    const templateIndexPath = path.join(CONFIG.templateDir, 'index.html');
    
    try {
        let content = fs.readFileSync(templateIndexPath, 'utf8');
        
        // 替换标题
        content = content.replace(
            '<title>Phaser.js 7天教程 - Day X</title>',
            `<title>Phaser.js 7天教程 - ${dayInfo.title}</title>`
        );
        
        fs.writeFileSync(indexPath, content);
        console.log(`🌐 更新 index.html: ${indexPath}`);
    } catch (error) {
        console.error(`❌ 更新 index.html 失败: ${indexPath}`, error.message);
    }
}

/**
 * 创建基础源代码结构
 * @param {string} projectPath 项目路径
 */
function createSourceStructure(projectPath) {
    const srcPath = path.join(projectPath, 'src');
    const publicPath = path.join(projectPath, 'public');
    
    // 创建目录结构
    createDirectory(srcPath);
    createDirectory(path.join(srcPath, 'scenes'));
    createDirectory(path.join(srcPath, 'sprites'));
    createDirectory(path.join(srcPath, 'utils'));
    createDirectory(path.join(srcPath, 'styles'));
    
    createDirectory(publicPath);
    createDirectory(path.join(publicPath, 'assets'));
    createDirectory(path.join(publicPath, 'assets', 'images'));
    createDirectory(path.join(publicPath, 'assets', 'audio'));
    createDirectory(path.join(publicPath, 'assets', 'data'));
    
    // 创建基础文件
    const mainJsContent = `/**
 * Phaser.js 7天教程 - 主入口文件
 * 
 * 这里是游戏的启动点，配置Phaser游戏实例
 */

import Phaser from 'phaser';

// 游戏配置
const config = {
    type: Phaser.AUTO,
    width: 800,
    height: 600,
    parent: 'game',
    backgroundColor: '#2c3e50',
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { y: 300 },
            debug: false
        }
    },
    scene: [
        // 在这里添加游戏场景
    ]
};

// 创建游戏实例
const game = new Phaser.Game(config);

// 导出游戏实例供调试使用
window.game = game;
`;
    
    fs.writeFileSync(path.join(srcPath, 'main.js'), mainJsContent);
    console.log(`🎮 创建 main.js: ${path.join(srcPath, 'main.js')}`);
    
    // 创建常量文件
    const constantsContent = `/**
 * 游戏常量定义
 */

export const GAME_CONFIG = {
    WIDTH: 800,
    HEIGHT: 600,
    GRAVITY: 300
};

export const PLAYER_CONFIG = {
    SPEED: 200,
    JUMP_VELOCITY: -500,
    HEALTH: 100
};

export const SCENE_KEYS = {
    LOAD: 'load-scene',
    MENU: 'menu-scene',
    GAME: 'game-scene',
    GAME_OVER: 'game-over-scene'
};

export const ASSET_KEYS = {
    PLAYER: 'player-sprite',
    ENEMY: 'enemy-sprite',
    BACKGROUND: 'background',
    JUMP_SOUND: 'jump-sound'
};
`;
    
    fs.writeFileSync(path.join(srcPath, 'utils', 'constants.js'), constantsContent);
    console.log(`📋 创建 constants.js: ${path.join(srcPath, 'utils', 'constants.js')}`);
}

/**
 * 设置单个项目
 * @param {Object} dayInfo 天数信息
 */
function setupProject(dayInfo) {
    console.log(`\n🚀 设置项目: ${dayInfo.title} (${dayInfo.key})`);
    
    const projectPath = path.join(process.cwd(), dayInfo.key, 'source');
    
    // 确保项目目录存在
    createDirectory(projectPath);
    
    // 复制配置文件
    const filesToCopy = ['.gitignore', 'vite.config.js'];
    
    filesToCopy.forEach(file => {
        const srcPath = path.join(CONFIG.templateDir, file);
        const destPath = path.join(projectPath, file);
        
        if (fs.existsSync(srcPath)) {
            copyFile(srcPath, destPath);
        }
    });
    
    // 更新项目特定文件
    updatePackageJson(projectPath, dayInfo);
    updateIndexHtml(projectPath, dayInfo);
    
    // 创建源代码结构（如果不存在）
    if (!fs.existsSync(path.join(projectPath, 'src'))) {
        createSourceStructure(projectPath);
    }
    
    console.log(`✅ 项目设置完成: ${dayInfo.title}`);
}

/**
 * 主函数
 */
function main() {
    console.log('🎯 Phaser.js 7天教程项目初始化工具');
    console.log('=====================================');
    
    const args = process.argv.slice(2);
    
    if (args.length === 0) {
        // 设置所有项目
        console.log('📋 设置所有教程项目...');
        CONFIG.days.forEach(setupProject);
    } else {
        // 设置指定项目
        const dayKey = args[0];
        const dayInfo = CONFIG.days.find(day => day.key === dayKey);
        
        if (dayInfo) {
            setupProject(dayInfo);
        } else {
            console.error(`❌ 未找到项目: ${dayKey}`);
            console.log('可用的项目:');
            CONFIG.days.forEach(day => {
                console.log(`  - ${day.key}: ${day.title}`);
            });
            process.exit(1);
        }
    }
    
    console.log('\n🎉 项目初始化完成！');
    console.log('\n📖 下一步:');
    console.log('1. 进入项目目录: cd <project>/source');
    console.log('2. 安装依赖: pnpm install');
    console.log('3. 启动开发服务器: pnpm dev');
}

// 运行主函数
if (import.meta.url === `file://${process.argv[1]}`) {
    main();
}
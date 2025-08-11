/**
 * GameScene - Day 3 主游戏场景
 * 
 * 这个场景展示了Tilemap系统和物理引擎的完整集成：
 * - 程序化地图生成
 * - 复杂的物理系统
 * - 高级碰撞检测
 * - 环境交互系统
 * - 性能优化技巧
 * 
 * 学习重点:
 * - 掌握Tilemap的创建和管理
 * - 理解物理引擎的高级用法
 * - 学会环境效果的实现
 * - 了解大地图的性能优化
 */

import { Player } from '../sprites/Player.js';
import { MapGenerator } from '../utils/MapGenerator.js';
import { PhysicsManager } from '../utils/PhysicsManager.js';
import { 
    GAME_CONFIG, 
    SCENE_KEYS, 
    TILEMAP_CONFIG, 
    PHYSICS_CONFIG,
    CAMERA_CONFIG,
    DEBUG_CONFIG
} from '../utils/constants.js';
import { Logger, PerformanceUtils, CullingUtils } from '../utils/helpers.js';

export class GameScene extends Phaser.Scene {
    constructor() {
        super({ key: SCENE_KEYS.GAME });
        
        // 核心系统
        this.mapGenerator = null;
        this.physicsManager = null;
        
        // 地图相关
        this.tilemap = null;
        this.tileset = null;
        this.groundLayer = null;
        this.backgroundLayer = null;
        this.decorationLayer = null;
        
        // 游戏对象
        this.player = null;
        this.enemies = null;
        this.collectibles = null;
        
        // 粒子系统
        this.particles = {};
        
        // UI元素
        this.ui = {};
        
        // 游戏状态
        this.gameState = {
            score: 0,
            lives: 3,
            level: 1,
            gameTime: 0,
            isPaused: false
        };
        
        // 输入系统
        this.inputKeys = {};
        
        // 性能监控
        this.performanceStats = {
            visibleTiles: 0,
            activeObjects: 0,
            lastCullingUpdate: 0
        };
    }
    
    preload() {
        Logger.info('🎮 GameScene: 开始加载Day 3资源...');
        
        // 创建地图生成器
        this.mapGenerator = new MapGenerator(this);
        
        // 创建瓦片集纹理
        this.mapGenerator.createTileset();
        
        // 创建玩家精灵图
        this.createPlayerSpriteSheet();
        
        // 创建粒子纹理
        this.createParticleTextures();
        
        Logger.info('✅ GameScene: Day 3资源加载完成');
    }    
   
 create() {
        Logger.info('🏗️ GameScene: 开始创建Day 3场景...');
        
        // 初始化物理系统管理器
        this.physicsManager = new PhysicsManager(this);
        this.physicsManager.initializePhysicsWorld();
        
        // 创建地图
        this.createTilemap();
        
        // 创建粒子系统
        this.createParticleSystems();
        
        // 创建玩家
        this.createPlayer();
        
        // 创建敌人和收集品
        this.createGameObjects();
        
        // 创建UI
        this.createUI();
        
        // 设置输入
        this.setupInput();
        
        // 设置碰撞
        this.setupCollisions();
        
        // 设置摄像机
        this.setupCamera();
        
        // 显示教学信息
        this.showTutorialMessage();
        
        Logger.info('✅ GameScene: Day 3场景创建完成');
    }
    
    update(time, delta) {
        const deltaTime = delta / 1000;
        
        // 更新游戏时间
        this.gameState.gameTime += deltaTime;
        
        // 性能监控
        PerformanceUtils.updateFPS(time);
        PerformanceUtils.checkPerformance(delta);
        
        // 更新物理系统
        this.physicsManager.update(deltaTime);
        
        // 更新玩家
        if (this.player && this.player.active) {
            this.player.update(this.inputKeys, deltaTime);
        }
        
        // 更新游戏对象
        this.updateGameObjects(deltaTime);
        
        // 更新UI
        this.updateUI();
        
        // 视口剔除优化
        this.updateCulling();
        
        // 检查游戏状态
        this.checkGameState();
    }
    
    /**
     * 创建玩家精灵图
     */
    createPlayerSpriteSheet() {
        const frameWidth = 32;
        const frameHeight = 32;
        const cols = 8;
        const rows = 5;
        
        // 创建画布
        const canvas = this.add.graphics();
        
        // 定义动画帧的颜色和样式
        const animations = [
            // 待机动画 (0-3)
            { color: 0x4ecdc4, style: 'circle', frames: 4 },
            // 行走动画 (4-11)
            { color: 0x45b7d1, style: 'square', frames: 8 },
            // 跑步动画 (12-19)
            { color: 0x96ceb4, style: 'diamond', frames: 8 },
            // 跳跃动画 (20-23)
            { color: 0x6c5ce7, style: 'triangle', frames: 4 },
            // 下落动画 (24-27)
            { color: 0xa29bfe, style: 'oval', frames: 4 },
            // 着陆动画 (28-31)
            { color: 0xfd79a8, style: 'star', frames: 4 },
            // 冲刺动画 (32-35)
            { color: 0xfdcb6e, style: 'lightning', frames: 4 },
            // 受伤动画 (36-39)
            { color: 0xff6b6b, style: 'cross', frames: 4 }
        ];
        
        let frameIndex = 0;
        
        animations.forEach(anim => {
            for (let i = 0; i < anim.frames; i++) {
                const col = frameIndex % cols;
                const row = Math.floor(frameIndex / cols);
                const x = col * frameWidth;
                const y = row * frameHeight;
                
                canvas.clear();
                this.drawPlayerFrame(canvas, x, y, frameWidth, frameHeight, anim, i);
                canvas.generateTexture(`player-frame-${frameIndex}`, frameWidth, frameHeight);
                
                frameIndex++;
            }
        });
        
        // 创建精灵图纹理
        const spriteSheetCanvas = this.add.renderTexture(0, 0, cols * frameWidth, rows * frameHeight);
        
        for (let i = 0; i < frameIndex; i++) {
            const col = i % cols;
            const row = Math.floor(i / cols);
            const x = col * frameWidth;
            const y = row * frameHeight;
            
            spriteSheetCanvas.draw(`player-frame-${i}`, x, y);
        }
        
        spriteSheetCanvas.saveTexture('player-spritesheet');
        spriteSheetCanvas.destroy();
        canvas.destroy();
        
        Logger.info('🎭 玩家精灵图创建完成');
    }
    
    /**
     * 绘制玩家帧
     */
    drawPlayerFrame(graphics, x, y, width, height, anim, frameIndex) {
        const centerX = x + width / 2;
        const centerY = y + height / 2;
        const size = Math.min(width, height) * 0.6;
        
        graphics.fillStyle(anim.color);
        graphics.lineStyle(2, 0xffffff);
        
        switch (anim.style) {
            case 'circle':
                const radius = size / 2 + Math.sin(frameIndex * 0.5) * 2;
                graphics.fillCircle(centerX, centerY, radius);
                graphics.strokeCircle(centerX, centerY, radius);
                break;
                
            case 'square':
                const offset = Math.sin(frameIndex * 0.8) * 2;
                graphics.fillRect(centerX - size/2, centerY - size/2 + offset, size, size);
                graphics.strokeRect(centerX - size/2, centerY - size/2 + offset, size, size);
                break;
                
            case 'diamond':
                graphics.beginPath();
                graphics.moveTo(centerX, centerY - size/2);
                graphics.lineTo(centerX + size/2, centerY);
                graphics.lineTo(centerX, centerY + size/2);
                graphics.lineTo(centerX - size/2, centerY);
                graphics.closePath();
                graphics.fillPath();
                graphics.strokePath();
                break;
                
            case 'triangle':
                graphics.beginPath();
                graphics.moveTo(centerX, centerY - size/2);
                graphics.lineTo(centerX + size/2, centerY + size/2);
                graphics.lineTo(centerX - size/2, centerY + size/2);
                graphics.closePath();
                graphics.fillPath();
                graphics.strokePath();
                break;
                
            case 'oval':
                const scaleY = 0.7 + Math.sin(frameIndex * 0.6) * 0.2;
                graphics.fillEllipse(centerX, centerY, size, size * scaleY);
                graphics.strokeEllipse(centerX, centerY, size, size * scaleY);
                break;
                
            case 'star':
                this.drawStar(graphics, centerX, centerY, 5, size/2, size/4);
                break;
                
            case 'lightning':
                this.drawLightning(graphics, centerX, centerY, size);
                break;
                
            case 'cross':
                graphics.fillRect(centerX - size/6, centerY - size/2, size/3, size);
                graphics.fillRect(centerX - size/2, centerY - size/6, size, size/3);
                graphics.strokeRect(centerX - size/6, centerY - size/2, size/3, size);
                graphics.strokeRect(centerX - size/2, centerY - size/6, size, size/3);
                break;
        }
        
        // 添加眼睛
        graphics.fillStyle(0x000000);
        graphics.fillCircle(centerX - size/4, centerY - size/6, 2);
        graphics.fillCircle(centerX + size/4, centerY - size/6, 2);
    }
    
    /**
     * 绘制星形
     */
    drawStar(graphics, centerX, centerY, points, outerRadius, innerRadius) {
        graphics.beginPath();
        
        for (let i = 0; i < points * 2; i++) {
            const angle = (i * Math.PI) / points;
            const radius = i % 2 === 0 ? outerRadius : innerRadius;
            const x = centerX + Math.cos(angle) * radius;
            const y = centerY + Math.sin(angle) * radius;
            
            if (i === 0) {
                graphics.moveTo(x, y);
            } else {
                graphics.lineTo(x, y);
            }
        }
        
        graphics.closePath();
        graphics.fillPath();
        graphics.strokePath();
    }
    
    /**
     * 绘制闪电
     */
    drawLightning(graphics, centerX, centerY, size) {
        graphics.beginPath();
        graphics.moveTo(centerX - size/4, centerY - size/2);
        graphics.lineTo(centerX + size/6, centerY - size/6);
        graphics.lineTo(centerX - size/6, centerY);
        graphics.lineTo(centerX + size/4, centerY + size/2);
        graphics.lineTo(centerX - size/8, centerY + size/6);
        graphics.lineTo(centerX + size/8, centerY - size/4);
        graphics.closePath();
        graphics.fillPath();
        graphics.strokePath();
    }
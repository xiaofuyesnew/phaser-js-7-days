/**
 * MapGenerator - 地图生成器
 * 
 * 这个类负责程序化生成游戏地图：
 * - 多种地形生成算法
 * - 瓦片集纹理创建
 * - 地图数据结构管理
 * - 碰撞属性配置
 * 
 * 学习重点:
 * - 理解程序化生成的原理
 * - 掌握地图数据的组织方式
 * - 学会瓦片属性的管理
 * - 了解性能优化技巧
 */

import { TILEMAP_CONFIG, TILE_TYPES } from './constants.js';
import { Logger, MathUtils } from './helpers.js';

export class MapGenerator {
    constructor(scene) {
        this.scene = scene;
        this.tileSize = TILEMAP_CONFIG.TILE_SIZE;
        this.tilesPerRow = TILEMAP_CONFIG.TILES_PER_ROW;
        
        // 瓦片类型定义
        this.tileTypes = [
            { id: 0, name: 'air', color: 0x000000, collision: false, alpha: 0 },
            { id: 1, name: 'dirt', color: 0x8B4513, collision: true, friction: 0.8 },
            { id: 2, name: 'grass', color: 0x228B22, collision: true, friction: 0.6 },
            { id: 3, name: 'stone', color: 0x696969, collision: true, friction: 0.9 },
            { id: 4, name: 'water', color: 0x4169E1, collision: false, liquid: true },
            { id: 5, name: 'sand', color: 0xDEB887, collision: true, friction: 0.4 },
            { id: 6, name: 'moss', color: 0x8FBC8F, collision: true, friction: 0.5 },
            { id: 7, name: 'rock', color: 0x2F4F4F, collision: true, friction: 1.0 },
            { id: 8, name: 'wood', color: 0xD2691E, collision: true, friction: 0.7 },
            { id: 9, name: 'metal', color: 0x708090, collision: true, friction: 0.3 },
            { id: 10, name: 'ice', color: 0xB0E0E6, collision: true, friction: 0.1 },
            { id: 11, name: 'lava', color: 0xFF4500, collision: false, damage: true }
        ];
        
        Logger.info('🗺️ 地图生成器初始化完成');
    }
    
    /**
     * 创建瓦片集纹理
     */
    createTileset() {
        const tilesetWidth = this.tilesPerRow * this.tileSize;
        const tilesetHeight = Math.ceil(this.tileTypes.length / this.tilesPerRow) * this.tileSize;
        
        // 创建瓦片集画布
        const canvas = this.scene.add.renderTexture(0, 0, tilesetWidth, tilesetHeight);
        
        this.tileTypes.forEach((tileType, index) => {
            const x = (index % this.tilesPerRow) * this.tileSize;
            const y = Math.floor(index / this.tilesPerRow) * this.tileSize;
            
            // 创建瓦片图形
            const graphics = this.scene.add.graphics();
            
            if (tileType.alpha === 0) {
                // 透明瓦片（空气）
                graphics.clear();
            } else {
                // 填充基础颜色
                graphics.fillStyle(tileType.color);
                graphics.fillRect(0, 0, this.tileSize, this.tileSize);
                
                // 添加纹理细节
                this.addTileTexture(graphics, tileType);
                
                // 添加边框
                graphics.lineStyle(1, 0x000000, 0.2);
                graphics.strokeRect(0, 0, this.tileSize, this.tileSize);
            }
            
            // 绘制到画布
            canvas.draw(graphics, x, y);
            graphics.destroy();
        });
        
        // 保存为纹理
        canvas.saveTexture('tileset');
        canvas.destroy();
        
        Logger.info('🎨 瓦片集纹理创建完成');
        return 'tileset';
    }
    
    /**
     * 添加瓦片纹理细节
     */
    addTileTexture(graphics, tileType) {
        const size = this.tileSize;
        
        switch (tileType.name) {
            case 'grass':
                this.addGrassTexture(graphics, size);
                break;
            case 'dirt':
                this.addDirtTexture(graphics, size);
                break;
            case 'stone':
                this.addStoneTexture(graphics, size);
                break;
            case 'water':
                this.addWaterTexture(graphics, size);
                break;
            case 'sand':
                this.addSandTexture(graphics, size);
                break;
            case 'wood':
                this.addWoodTexture(graphics, size);
                break;
            case 'metal':
                this.addMetalTexture(graphics, size);
                break;
            case 'ice':
                this.addIceTexture(graphics, size);
                break;
            case 'lava':
                this.addLavaTexture(graphics, size);
                break;
        }
    }
    
    /**
     * 草地纹理
     */
    addGrassTexture(graphics, size) {
        graphics.fillStyle(0x32CD32, 0.6);
        
        // 添加草叶
        for (let i = 0; i < 8; i++) {
            const x = MathUtils.randomInt(2, size - 4);
            const y = MathUtils.randomInt(0, size * 0.4);
            const height = MathUtils.randomInt(3, 6);
            
            graphics.fillRect(x, y, 1, height);
        }
        
        // 添加小花
        if (Math.random() < 0.3) {
            graphics.fillStyle(0xFFFFFF);
            graphics.fillCircle(
                MathUtils.randomInt(4, size - 4),
                MathUtils.randomInt(2, size * 0.3),
                1
            );
        }
    }
    
    /**
     * 泥土纹理
     */
    addDirtTexture(graphics, size) {
        graphics.fillStyle(0x654321, 0.4);
        
        // 添加土块
        for (let i = 0; i < 6; i++) {
            const x = MathUtils.randomInt(0, size - 3);
            const y = MathUtils.randomInt(0, size - 3);
            const w = MathUtils.randomInt(2, 4);
            const h = MathUtils.randomInt(2, 4);
            
            graphics.fillRect(x, y, w, h);
        }
    }
    
    /**
     * 石头纹理
     */
    addStoneTexture(graphics, size) {
        graphics.fillStyle(0x808080, 0.5);
        
        // 添加石头斑点
        for (let i = 0; i < 5; i++) {
            const x = MathUtils.randomInt(0, size);
            const y = MathUtils.randomInt(0, size);
            const radius = MathUtils.randomInt(1, 3);
            
            graphics.fillCircle(x, y, radius);
        }
        
        // 添加裂纹
        graphics.lineStyle(1, 0x000000, 0.3);
        graphics.beginPath();
        graphics.moveTo(0, MathUtils.randomInt(0, size));
        graphics.lineTo(size, MathUtils.randomInt(0, size));
        graphics.strokePath();
    }
    
    /**
     * 水纹理
     */
    addWaterTexture(graphics, size) {
        // 添加水波纹
        graphics.lineStyle(1, 0x87CEEB, 0.6);
        
        for (let i = 0; i < 3; i++) {
            const y = (i + 1) * size / 4;
            graphics.beginPath();
            graphics.moveTo(0, y);
            
            for (let x = 0; x <= size; x += 4) {
                const waveY = y + Math.sin(x * 0.2 + i) * 2;
                graphics.lineTo(x, waveY);
            }
            
            graphics.strokePath();
        }
    }
    
    /**
     * 沙子纹理
     */
    addSandTexture(graphics, size) {
        graphics.fillStyle(0xF4A460, 0.3);
        
        // 添加沙粒
        for (let i = 0; i < 12; i++) {
            const x = MathUtils.randomInt(0, size);
            const y = MathUtils.randomInt(0, size);
            
            graphics.fillCircle(x, y, 0.5);
        }
    }
    
    /**
     * 木头纹理
     */
    addWoodTexture(graphics, size) {
        // 添加木纹
        graphics.lineStyle(1, 0x8B4513, 0.4);
        
        for (let i = 0; i < 4; i++) {
            const y = i * size / 4 + MathUtils.randomInt(-2, 2);
            graphics.beginPath();
            graphics.moveTo(0, y);
            graphics.lineTo(size, y + MathUtils.randomInt(-1, 1));
            graphics.strokePath();
        }
        
        // 添加年轮
        graphics.lineStyle(1, 0x654321, 0.3);
        graphics.strokeCircle(size / 2, size / 2, size / 3);
    }
    
    /**
     * 金属纹理
     */
    addMetalTexture(graphics, size) {
        // 添加金属光泽
        graphics.fillStyle(0xC0C0C0, 0.3);
        graphics.fillRect(0, 0, size / 2, size / 2);
        graphics.fillRect(size / 2, size / 2, size / 2, size / 2);
        
        // 添加螺丝
        graphics.fillStyle(0x000000);
        graphics.fillCircle(4, 4, 1);
        graphics.fillCircle(size - 4, 4, 1);
        graphics.fillCircle(4, size - 4, 1);
        graphics.fillCircle(size - 4, size - 4, 1);
    }
    
    /**
     * 冰纹理
     */
    addIceTexture(graphics, size) {
        // 添加冰晶
        graphics.lineStyle(1, 0xFFFFFF, 0.8);
        
        const centerX = size / 2;
        const centerY = size / 2;
        
        for (let i = 0; i < 6; i++) {
            const angle = (i * Math.PI) / 3;
            const endX = centerX + Math.cos(angle) * size / 3;
            const endY = centerY + Math.sin(angle) * size / 3;
            
            graphics.beginPath();
            graphics.moveTo(centerX, centerY);
            graphics.lineTo(endX, endY);
            graphics.strokePath();
        }
    }
    
    /**
     * 岩浆纹理
     */
    addLavaTexture(graphics, size) {
        // 添加岩浆泡泡
        graphics.fillStyle(0xFFFF00, 0.6);
        
        for (let i = 0; i < 4; i++) {
            const x = MathUtils.randomInt(2, size - 2);
            const y = MathUtils.randomInt(2, size - 2);
            const radius = MathUtils.randomInt(1, 3);
            
            graphics.fillCircle(x, y, radius);
        }
        
        // 添加发光效果
        graphics.fillStyle(0xFF6600, 0.4);
        graphics.fillRect(0, 0, size, size);
    }
    
    /**
     * 生成平台跳跃地图
     */
    generatePlatformMap(width, height) {
        const mapData = [];
        
        // 初始化空地图
        for (let y = 0; y < height; y++) {
            mapData[y] = [];
            for (let x = 0; x < width; x++) {
                mapData[y][x] = 0; // 空气
            }
        }
        
        // 生成地面
        const groundLevel = Math.floor(height * 0.8);
        for (let x = 0; x < width; x++) {
            for (let y = groundLevel; y < height; y++) {
                if (y === groundLevel) {
                    mapData[y][x] = 2; // 草地
                } else {
                    mapData[y][x] = 1; // 泥土
                }
            }
        }
        
        // 生成平台
        this.generatePlatforms(mapData, width, height);
        
        // 生成装饰
        this.generateDecorations(mapData, width, height);
        
        Logger.info(`🏗️ 生成平台地图: ${width}x${height}`);
        return mapData;
    }
    
    /**
     * 生成平台
     */
    generatePlatforms(mapData, width, height) {
        const platformCount = Math.floor(width / 8);
        
        for (let i = 0; i < platformCount; i++) {
            const platformX = MathUtils.randomInt(5, width - 10);
            const platformY = MathUtils.randomInt(Math.floor(height * 0.3), Math.floor(height * 0.7));
            const platformLength = MathUtils.randomInt(3, 8);
            const platformType = MathUtils.randomInt(2, 4); // 草地或石头
            
            // 检查是否与现有平台重叠
            let canPlace = true;
            for (let x = platformX; x < platformX + platformLength && x < width; x++) {
                if (mapData[platformY][x] !== 0) {
                    canPlace = false;
                    break;
                }
            }
            
            if (canPlace) {
                for (let x = platformX; x < platformX + platformLength && x < width; x++) {
                    mapData[platformY][x] = platformType;
                }
            }
        }
    }
    
    /**
     * 生成装饰
     */
    generateDecorations(mapData, width, height) {
        // 添加水池
        const poolCount = MathUtils.randomInt(1, 3);
        for (let i = 0; i < poolCount; i++) {
            const poolX = MathUtils.randomInt(5, width - 10);
            const poolY = Math.floor(height * 0.8) - 1;
            const poolWidth = MathUtils.randomInt(3, 6);
            
            for (let x = poolX; x < poolX + poolWidth && x < width; x++) {
                if (mapData[poolY][x] === 2) { // 如果是草地
                    mapData[poolY][x] = 4; // 替换为水
                }
            }
        }
        
        // 添加沙地区域
        const sandCount = MathUtils.randomInt(1, 2);
        for (let i = 0; i < sandCount; i++) {
            const sandX = MathUtils.randomInt(5, width - 15);
            const sandY = Math.floor(height * 0.8);
            const sandWidth = MathUtils.randomInt(5, 10);
            
            for (let x = sandX; x < sandX + sandWidth && x < width; x++) {
                if (mapData[sandY][x] === 2) { // 如果是草地
                    mapData[sandY][x] = 5; // 替换为沙子
                }
            }
        }
    }
    
    /**
     * 生成洞穴地图
     */
    generateCaveMap(width, height) {
        const mapData = [];
        
        // 初始化为实心
        for (let y = 0; y < height; y++) {
            mapData[y] = [];
            for (let x = 0; x < width; x++) {
                mapData[y][x] = 3; // 石头
            }
        }
        
        // 使用细胞自动机生成洞穴
        this.generateCaveWithCellularAutomata(mapData, width, height);
        
        // 确保有入口和出口
        this.ensureCaveEntrances(mapData, width, height);
        
        Logger.info(`🕳️ 生成洞穴地图: ${width}x${height}`);
        return mapData;
    }
    
    /**
     * 使用细胞自动机生成洞穴
     */
    generateCaveWithCellularAutomata(mapData, width, height) {
        // 第一步：随机填充
        for (let y = 1; y < height - 1; y++) {
            for (let x = 1; x < width - 1; x++) {
                if (Math.random() < 0.45) {
                    mapData[y][x] = 0; // 空气
                }
            }
        }
        
        // 第二步：应用细胞自动机规则
        for (let iteration = 0; iteration < 5; iteration++) {
            const newMapData = JSON.parse(JSON.stringify(mapData));
            
            for (let y = 1; y < height - 1; y++) {
                for (let x = 1; x < width - 1; x++) {
                    const neighbors = this.countSolidNeighbors(mapData, x, y);
                    
                    if (neighbors >= 4) {
                        newMapData[y][x] = 3; // 石头
                    } else if (neighbors <= 3) {
                        newMapData[y][x] = 0; // 空气
                    }
                }
            }
            
            // 复制新数据
            for (let y = 0; y < height; y++) {
                for (let x = 0; x < width; x++) {
                    mapData[y][x] = newMapData[y][x];
                }
            }
        }
    }
    
    /**
     * 计算实心邻居数量
     */
    countSolidNeighbors(mapData, x, y) {
        let count = 0;
        
        for (let dy = -1; dy <= 1; dy++) {
            for (let dx = -1; dx <= 1; dx++) {
                if (dx === 0 && dy === 0) continue;
                
                const nx = x + dx;
                const ny = y + dy;
                
                if (nx < 0 || nx >= mapData[0].length || ny < 0 || ny >= mapData.length) {
                    count++; // 边界视为实心
                } else if (mapData[ny][nx] !== 0) {
                    count++;
                }
            }
        }
        
        return count;
    }
    
    /**
     * 确保洞穴有入口和出口
     */
    ensureCaveEntrances(mapData, width, height) {
        // 左侧入口
        const leftEntranceY = Math.floor(height / 2);
        for (let x = 0; x < 5; x++) {
            for (let y = leftEntranceY - 2; y <= leftEntranceY + 2; y++) {
                if (y >= 0 && y < height) {
                    mapData[y][x] = 0;
                }
            }
        }
        
        // 右侧出口
        const rightEntranceY = Math.floor(height / 2);
        for (let x = width - 5; x < width; x++) {
            for (let y = rightEntranceY - 2; y <= rightEntranceY + 2; y++) {
                if (y >= 0 && y < height) {
                    mapData[y][x] = 0;
                }
            }
        }
    }
    
    /**
     * 生成迷宫地图
     */
    generateMazeMap(width, height) {
        const mapData = [];
        
        // 初始化为墙壁
        for (let y = 0; y < height; y++) {
            mapData[y] = [];
            for (let x = 0; x < width; x++) {
                mapData[y][x] = 3; // 石头墙
            }
        }
        
        // 使用递归回溯算法生成迷宫
        this.generateMazeWithBacktracking(mapData, width, height);
        
        Logger.info(`🌀 生成迷宫地图: ${width}x${height}`);
        return mapData;
    }
    
    /**
     * 使用递归回溯算法生成迷宫
     */
    generateMazeWithBacktracking(mapData, width, height) {
        const stack = [];
        const visited = new Set();
        
        // 起始点
        const startX = 1;
        const startY = 1;
        
        stack.push({ x: startX, y: startY });
        visited.add(`${startX},${startY}`);
        mapData[startY][startX] = 0; // 空气
        
        const directions = [
            { dx: 0, dy: -2 }, // 上
            { dx: 2, dy: 0 },  // 右
            { dx: 0, dy: 2 },  // 下
            { dx: -2, dy: 0 }  // 左
        ];
        
        while (stack.length > 0) {
            const current = stack[stack.length - 1];
            const neighbors = [];
            
            // 查找未访问的邻居
            for (const dir of directions) {
                const nx = current.x + dir.dx;
                const ny = current.y + dir.dy;
                
                if (nx > 0 && nx < width - 1 && ny > 0 && ny < height - 1) {
                    if (!visited.has(`${nx},${ny}`)) {
                        neighbors.push({ x: nx, y: ny, dx: dir.dx, dy: dir.dy });
                    }
                }
            }
            
            if (neighbors.length > 0) {
                // 随机选择一个邻居
                const next = neighbors[Math.floor(Math.random() * neighbors.length)];
                
                // 打通墙壁
                const wallX = current.x + next.dx / 2;
                const wallY = current.y + next.dy / 2;
                mapData[wallY][wallX] = 0;
                mapData[next.y][next.x] = 0;
                
                // 标记为已访问
                visited.add(`${next.x},${next.y}`);
                stack.push(next);
            } else {
                // 回溯
                stack.pop();
            }
        }
    }
    
    /**
     * 获取瓦片类型信息
     */
    getTileType(tileId) {
        return this.tileTypes.find(type => type.id === tileId) || this.tileTypes[0];
    }
    
    /**
     * 获取所有瓦片类型
     */
    getAllTileTypes() {
        return [...this.tileTypes];
    }
}
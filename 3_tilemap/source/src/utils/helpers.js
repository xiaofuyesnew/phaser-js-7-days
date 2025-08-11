/**
 * Day 3 游戏辅助函数
 * 
 * 为地图与物理系统提供专用的工具函数
 */

import { DEBUG_CONFIG, PERFORMANCE_CONFIG } from './constants.js';

/**
 * 日志工具类
 */
export class Logger {
    static debug(message, ...args) {
        if (DEBUG_CONFIG.LOG_LEVEL === 'debug' && DEBUG_CONFIG.ENABLE_CONSOLE) {
            console.log(`🐛 [DEBUG] ${message}`, ...args);
        }
    }
    
    static info(message, ...args) {
        if (['debug', 'info'].includes(DEBUG_CONFIG.LOG_LEVEL) && DEBUG_CONFIG.ENABLE_CONSOLE) {
            console.log(`ℹ️ [INFO] ${message}`, ...args);
        }
    }
    
    static warn(message, ...args) {
        if (['debug', 'info', 'warn'].includes(DEBUG_CONFIG.LOG_LEVEL) && DEBUG_CONFIG.ENABLE_CONSOLE) {
            console.warn(`⚠️ [WARN] ${message}`, ...args);
        }
    }
    
    static error(message, ...args) {
        if (DEBUG_CONFIG.ENABLE_CONSOLE) {
            console.error(`❌ [ERROR] ${message}`, ...args);
        }
    }
}

/**
 * 数学工具函数
 */
export class MathUtils {
    /**
     * 将值限制在指定范围内
     */
    static clamp(value, min, max) {
        return Math.min(Math.max(value, min), max);
    }
    
    /**
     * 线性插值
     */
    static lerp(start, end, t) {
        return start + (end - start) * t;
    }
    
    /**
     * 计算两点之间的距离
     */
    static distance(x1, y1, x2, y2) {
        const dx = x2 - x1;
        const dy = y2 - y1;
        return Math.sqrt(dx * dx + dy * dy);
    }
    
    /**
     * 生成指定范围内的随机整数
     */
    static randomInt(min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }
    
    /**
     * 生成指定范围内的随机浮点数
     */
    static randomFloat(min, max) {
        return Math.random() * (max - min) + min;
    }
    
    /**
     * 角度转弧度
     */
    static degToRad(degrees) {
        return degrees * (Math.PI / 180);
    }
    
    /**
     * 弧度转角度
     */
    static radToDeg(radians) {
        return radians * (180 / Math.PI);
    }
    
    /**
     * 计算向量的长度
     */
    static vectorLength(x, y) {
        return Math.sqrt(x * x + y * y);
    }
    
    /**
     * 标准化向量
     */
    static normalizeVector(x, y) {
        const length = this.vectorLength(x, y);
        if (length === 0) return { x: 0, y: 0 };
        return { x: x / length, y: y / length };
    }
    
    /**
     * 计算两个向量的点积
     */
    static dotProduct(x1, y1, x2, y2) {
        return x1 * x2 + y1 * y2;
    }
    
    /**
     * 计算两个向量的叉积
     */
    static crossProduct(x1, y1, x2, y2) {
        return x1 * y2 - y1 * x2;
    }
    
    /**
     * 计算向量的角度
     */
    static vectorAngle(x, y) {
        return Math.atan2(y, x);
    }
    
    /**
     * 旋转向量
     */
    static rotateVector(x, y, angle) {
        const cos = Math.cos(angle);
        const sin = Math.sin(angle);
        return {
            x: x * cos - y * sin,
            y: x * sin + y * cos
        };
    }
    
    /**
     * 平滑阻尼
     */
    static smoothDamp(current, target, velocity, smoothTime, deltaTime) {
        const omega = 2 / smoothTime;
        const x = omega * deltaTime;
        const exp = 1 / (1 + x + 0.48 * x * x + 0.235 * x * x * x);
        const change = current - target;
        const originalTo = target;
        
        const maxChange = Infinity;
        const clampedChange = this.clamp(change, -maxChange, maxChange);
        target = current - clampedChange;
        
        const temp = (velocity + omega * clampedChange) * deltaTime;
        velocity = (velocity - omega * temp) * exp;
        let output = target + (clampedChange + temp) * exp;
        
        if (originalTo - current > 0.0 === output > originalTo) {
            output = originalTo;
            velocity = (output - originalTo) / deltaTime;
        }
        
        return { value: output, velocity: velocity };
    }
    
    /**
     * 检查点是否在矩形内
     */
    static pointInRect(px, py, rx, ry, rw, rh) {
        return px >= rx && px <= rx + rw && py >= ry && py <= ry + rh;
    }
    
    /**
     * 检查点是否在圆形内
     */
    static pointInCircle(px, py, cx, cy, radius) {
        const distance = this.distance(px, py, cx, cy);
        return distance <= radius;
    }
    
    /**
     * 检查两个矩形是否重叠
     */
    static rectOverlap(r1x, r1y, r1w, r1h, r2x, r2y, r2w, r2h) {
        return r1x < r2x + r2w &&
               r1x + r1w > r2x &&
               r1y < r2y + r2h &&
               r1y + r1h > r2y;
    }
    
    /**
     * 检查两个圆形是否重叠
     */
    static circleOverlap(c1x, c1y, r1, c2x, c2y, r2) {
        const distance = this.distance(c1x, c1y, c2x, c2y);
        return distance <= r1 + r2;
    }
}

/**
 * 瓦片地图工具函数
 */
export class TilemapUtils {
    /**
     * 世界坐标转瓦片坐标
     */
    static worldToTile(worldX, worldY, tileSize) {
        return {
            x: Math.floor(worldX / tileSize),
            y: Math.floor(worldY / tileSize)
        };
    }
    
    /**
     * 瓦片坐标转世界坐标
     */
    static tileToWorld(tileX, tileY, tileSize) {
        return {
            x: tileX * tileSize,
            y: tileY * tileSize
        };
    }
    
    /**
     * 获取瓦片的世界边界
     */
    static getTileWorldBounds(tileX, tileY, tileSize) {
        const worldPos = this.tileToWorld(tileX, tileY, tileSize);
        return {
            x: worldPos.x,
            y: worldPos.y,
            width: tileSize,
            height: tileSize,
            right: worldPos.x + tileSize,
            bottom: worldPos.y + tileSize,
            centerX: worldPos.x + tileSize / 2,
            centerY: worldPos.y + tileSize / 2
        };
    }
    
    /**
     * 检查瓦片坐标是否有效
     */
    static isValidTileCoord(tileX, tileY, mapWidth, mapHeight) {
        return tileX >= 0 && tileX < mapWidth && tileY >= 0 && tileY < mapHeight;
    }
    
    /**
     * 获取相邻瓦片
     */
    static getNeighborTiles(tileX, tileY, mapWidth, mapHeight, includeDiagonal = false) {
        const neighbors = [];
        const directions = includeDiagonal ? 
            [[-1,-1], [0,-1], [1,-1], [-1,0], [1,0], [-1,1], [0,1], [1,1]] :
            [[0,-1], [-1,0], [1,0], [0,1]];
        
        for (const [dx, dy] of directions) {
            const nx = tileX + dx;
            const ny = tileY + dy;
            
            if (this.isValidTileCoord(nx, ny, mapWidth, mapHeight)) {
                neighbors.push({ x: nx, y: ny });
            }
        }
        
        return neighbors;
    }
    
    /**
     * 计算瓦片之间的曼哈顿距离
     */
    static manhattanDistance(x1, y1, x2, y2) {
        return Math.abs(x2 - x1) + Math.abs(y2 - y1);
    }
    
    /**
     * 计算瓦片之间的欧几里得距离
     */
    static euclideanDistance(x1, y1, x2, y2) {
        return Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2);
    }
    
    /**
     * 使用Bresenham算法绘制瓦片线
     */
    static drawTileLine(x0, y0, x1, y1) {
        const tiles = [];
        const dx = Math.abs(x1 - x0);
        const dy = Math.abs(y1 - y0);
        const sx = x0 < x1 ? 1 : -1;
        const sy = y0 < y1 ? 1 : -1;
        let err = dx - dy;
        
        let x = x0;
        let y = y0;
        
        while (true) {
            tiles.push({ x, y });
            
            if (x === x1 && y === y1) break;
            
            const e2 = 2 * err;
            if (e2 > -dy) {
                err -= dy;
                x += sx;
            }
            if (e2 < dx) {
                err += dx;
                y += sy;
            }
        }
        
        return tiles;
    }
    
    /**
     * 洪水填充算法
     */
    static floodFill(mapData, startX, startY, newValue, targetValue = null) {
        const width = mapData[0].length;
        const height = mapData.length;
        
        if (!this.isValidTileCoord(startX, startY, width, height)) {
            return [];
        }
        
        if (targetValue === null) {
            targetValue = mapData[startY][startX];
        }
        
        if (targetValue === newValue) {
            return [];
        }
        
        const filled = [];
        const stack = [{ x: startX, y: startY }];
        const visited = new Set();
        
        while (stack.length > 0) {
            const { x, y } = stack.pop();
            const key = `${x},${y}`;
            
            if (visited.has(key)) continue;
            if (!this.isValidTileCoord(x, y, width, height)) continue;
            if (mapData[y][x] !== targetValue) continue;
            
            visited.add(key);
            mapData[y][x] = newValue;
            filled.push({ x, y });
            
            // 添加相邻瓦片
            stack.push({ x: x + 1, y });
            stack.push({ x: x - 1, y });
            stack.push({ x, y: y + 1 });
            stack.push({ x, y: y - 1 });
        }
        
        return filled;
    }
}

/**
 * 物理工具函数
 */
export class PhysicsUtils {
    /**
     * 计算反弹速度
     */
    static calculateBounceVelocity(velocity, normal, restitution = 1) {
        const dot = velocity.x * normal.x + velocity.y * normal.y;
        return {
            x: velocity.x - 2 * dot * normal.x * restitution,
            y: velocity.y - 2 * dot * normal.y * restitution
        };
    }
    
    /**
     * 应用摩擦力
     */
    static applyFriction(velocity, friction, deltaTime) {
        const frictionForce = friction * deltaTime;
        const speed = Math.sqrt(velocity.x ** 2 + velocity.y ** 2);
        
        if (speed > 0) {
            const frictionX = (velocity.x / speed) * frictionForce;
            const frictionY = (velocity.y / speed) * frictionForce;
            
            velocity.x = Math.abs(velocity.x) > Math.abs(frictionX) ? 
                velocity.x - frictionX : 0;
            velocity.y = Math.abs(velocity.y) > Math.abs(frictionY) ? 
                velocity.y - frictionY : 0;
        }
        
        return velocity;
    }
    
    /**
     * 计算重力影响
     */
    static applyGravity(velocity, gravity, deltaTime, terminalVelocity = Infinity) {
        velocity.y += gravity * deltaTime;
        velocity.y = Math.min(velocity.y, terminalVelocity);
        return velocity;
    }
    
    /**
     * 检查物体是否在地面上
     */
    static isGrounded(body, groundThreshold = 5) {
        return body.touching.down || body.blocked.down || 
               (body.velocity.y >= -groundThreshold && body.velocity.y <= groundThreshold);
    }
    
    /**
     * 计算抛物线轨迹
     */
    static calculateTrajectory(startX, startY, velocityX, velocityY, gravity, steps = 50) {
        const points = [];
        const timeStep = 0.1;
        
        for (let i = 0; i < steps; i++) {
            const t = i * timeStep;
            const x = startX + velocityX * t;
            const y = startY + velocityY * t + 0.5 * gravity * t * t;
            
            points.push({ x, y, time: t });
            
            // 如果物体落到地面以下，停止计算
            if (y > startY + 1000) break;
        }
        
        return points;
    }
    
    /**
     * 计算两个物体的碰撞响应
     */
    static resolveCollision(obj1, obj2, restitution = 0.8) {
        const dx = obj2.x - obj1.x;
        const dy = obj2.y - obj1.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        if (distance === 0) return;
        
        // 标准化碰撞向量
        const nx = dx / distance;
        const ny = dy / distance;
        
        // 相对速度
        const dvx = obj2.body.velocity.x - obj1.body.velocity.x;
        const dvy = obj2.body.velocity.y - obj1.body.velocity.y;
        
        // 相对速度在碰撞法线方向的分量
        const dvn = dvx * nx + dvy * ny;
        
        // 如果物体正在分离，不处理碰撞
        if (dvn > 0) return;
        
        // 碰撞冲量
        const impulse = 2 * dvn / (obj1.body.mass + obj2.body.mass);
        
        // 应用冲量
        obj1.body.velocity.x += impulse * obj2.body.mass * nx * restitution;
        obj1.body.velocity.y += impulse * obj2.body.mass * ny * restitution;
        obj2.body.velocity.x -= impulse * obj1.body.mass * nx * restitution;
        obj2.body.velocity.y -= impulse * obj1.body.mass * ny * restitution;
    }
}

/**
 * 性能监控工具
 */
export class PerformanceUtils {
    static startTime = 0;
    static frameCount = 0;
    static lastFpsUpdate = 0;
    static currentFps = 0;
    static memoryUsage = { used: 0, total: 0, limit: 0 };
    
    /**
     * 开始性能计时
     */
    static startTimer(label = 'default') {
        this.startTime = performance.now();
        Logger.debug(`⏱️ 开始计时: ${label}`);
    }
    
    /**
     * 结束性能计时
     */
    static endTimer(label = 'default') {
        const endTime = performance.now();
        const duration = endTime - this.startTime;
        Logger.debug(`⏱️ 计时结束: ${label} - ${duration.toFixed(2)}ms`);
        return duration;
    }
    
    /**
     * 更新FPS计数
     */
    static updateFPS(time) {
        this.frameCount++;
        
        if (time - this.lastFpsUpdate >= 1000) {
            this.currentFps = this.frameCount;
            this.frameCount = 0;
            this.lastFpsUpdate = time;
        }
    }
    
    /**
     * 获取当前FPS
     */
    static getFPS() {
        return this.currentFps;
    }
    
    /**
     * 获取内存使用情况
     */
    static getMemoryInfo() {
        if (performance.memory) {
            this.memoryUsage = {
                used: Math.round(performance.memory.usedJSHeapSize / 1024 / 1024),
                total: Math.round(performance.memory.totalJSHeapSize / 1024 / 1024),
                limit: Math.round(performance.memory.jsHeapSizeLimit / 1024 / 1024)
            };
            return this.memoryUsage;
        }
        return null;
    }
    
    /**
     * 检查性能警告
     */
    static checkPerformance(deltaTime) {
        if (deltaTime > PERFORMANCE_CONFIG.MAX_DELTA) {
            Logger.warn(`⚠️ 性能警告: 帧时间过长 ${deltaTime.toFixed(2)}ms`);
        }
        
        const memInfo = this.getMemoryInfo();
        if (memInfo && memInfo.used > memInfo.limit * 0.8) {
            Logger.warn(`⚠️ 内存警告: 使用率过高 ${memInfo.used}MB/${memInfo.limit}MB`);
        }
    }
    
    /**
     * 获取性能统计
     */
    static getPerformanceStats() {
        return {
            fps: this.currentFps,
            memory: this.memoryUsage,
            timestamp: Date.now()
        };
    }
}

/**
 * 视口剔除工具
 */
export class CullingUtils {
    /**
     * 检查对象是否在摄像机视野内
     */
    static isInCameraView(object, camera, margin = 0) {
        const objBounds = object.getBounds ? object.getBounds() : {
            x: object.x - object.width / 2,
            y: object.y - object.height / 2,
            width: object.width,
            height: object.height
        };
        
        const camBounds = {
            x: camera.scrollX - margin,
            y: camera.scrollY - margin,
            width: camera.width + margin * 2,
            height: camera.height + margin * 2
        };
        
        return MathUtils.rectOverlap(
            objBounds.x, objBounds.y, objBounds.width, objBounds.height,
            camBounds.x, camBounds.y, camBounds.width, camBounds.height
        );
    }
    
    /**
     * 获取摄像机视野内的瓦片范围
     */
    static getCameraViewTileRange(camera, tileSize, margin = 1) {
        const startX = Math.max(0, Math.floor((camera.scrollX - margin * tileSize) / tileSize));
        const startY = Math.max(0, Math.floor((camera.scrollY - margin * tileSize) / tileSize));
        const endX = Math.ceil((camera.scrollX + camera.width + margin * tileSize) / tileSize);
        const endY = Math.ceil((camera.scrollY + camera.height + margin * tileSize) / tileSize);
        
        return { startX, startY, endX, endY };
    }
    
    /**
     * 剔除视野外的对象
     */
    static cullObjects(objects, camera, margin = PERFORMANCE_CONFIG.CULLING_MARGIN) {
        const visibleObjects = [];
        const culledObjects = [];
        
        objects.forEach(obj => {
            if (this.isInCameraView(obj, camera, margin)) {
                visibleObjects.push(obj);
                if (!obj.visible) obj.setVisible(true);
            } else {
                culledObjects.push(obj);
                if (obj.visible) obj.setVisible(false);
            }
        });
        
        return { visible: visibleObjects, culled: culledObjects };
    }
}

/**
 * 对象池工具
 */
export class ObjectPool {
    constructor(createFn, resetFn, initialSize = 10) {
        this.createFn = createFn;
        this.resetFn = resetFn;
        this.pool = [];
        this.active = [];
        
        // 预创建对象
        for (let i = 0; i < initialSize; i++) {
            const obj = this.createFn();
            obj.setActive(false);
            obj.setVisible(false);
            this.pool.push(obj);
        }
    }
    
    /**
     * 获取对象
     */
    get() {
        let obj;
        
        if (this.pool.length > 0) {
            obj = this.pool.pop();
        } else {
            obj = this.createFn();
        }
        
        obj.setActive(true);
        obj.setVisible(true);
        this.active.push(obj);
        
        return obj;
    }
    
    /**
     * 释放对象
     */
    release(obj) {
        const index = this.active.indexOf(obj);
        if (index > -1) {
            this.active.splice(index, 1);
            this.resetFn(obj);
            obj.setActive(false);
            obj.setVisible(false);
            this.pool.push(obj);
        }
    }
    
    /**
     * 释放所有对象
     */
    releaseAll() {
        this.active.forEach(obj => {
            this.resetFn(obj);
            obj.setActive(false);
            obj.setVisible(false);
            this.pool.push(obj);
        });
        this.active.length = 0;
    }
    
    /**
     * 获取统计信息
     */
    getStats() {
        return {
            poolSize: this.pool.length,
            activeSize: this.active.length,
            totalSize: this.pool.length + this.active.length
        };
    }
    
    /**
     * 销毁对象池
     */
    destroy() {
        [...this.pool, ...this.active].forEach(obj => {
            if (obj && obj.destroy) {
                obj.destroy();
            }
        });
        
        this.pool = [];
        this.active = [];
    }
}

/**
 * 路径查找工具
 */
export class PathfindingUtils {
    /**
     * A*路径查找算法
     */
    static findPath(mapData, startX, startY, endX, endY, allowDiagonal = false) {
        const width = mapData[0].length;
        const height = mapData.length;
        
        if (!TilemapUtils.isValidTileCoord(startX, startY, width, height) ||
            !TilemapUtils.isValidTileCoord(endX, endY, width, height)) {
            return [];
        }
        
        const openSet = [{ x: startX, y: startY, f: 0, g: 0, h: 0, parent: null }];
        const closedSet = new Set();
        const costs = new Map();
        
        costs.set(`${startX},${startY}`, 0);
        
        while (openSet.length > 0) {
            // 找到f值最小的节点
            openSet.sort((a, b) => a.f - b.f);
            const current = openSet.shift();
            
            // 到达目标
            if (current.x === endX && current.y === endY) {
                return this.reconstructPath(current);
            }
            
            closedSet.add(`${current.x},${current.y}`);
            
            // 检查邻居
            const neighbors = TilemapUtils.getNeighborTiles(
                current.x, current.y, width, height, allowDiagonal
            );
            
            for (const neighbor of neighbors) {
                const key = `${neighbor.x},${neighbor.y}`;
                
                // 跳过已访问的节点
                if (closedSet.has(key)) continue;
                
                // 跳过障碍物
                if (mapData[neighbor.y][neighbor.x] !== 0) continue;
                
                const gScore = current.g + 1;
                const existingCost = costs.get(key);
                
                if (existingCost === undefined || gScore < existingCost) {
                    costs.set(key, gScore);
                    
                    const hScore = TilemapUtils.manhattanDistance(
                        neighbor.x, neighbor.y, endX, endY
                    );
                    
                    const neighborNode = {
                        x: neighbor.x,
                        y: neighbor.y,
                        f: gScore + hScore,
                        g: gScore,
                        h: hScore,
                        parent: current
                    };
                    
                    // 添加到开放集合
                    const existingIndex = openSet.findIndex(
                        node => node.x === neighbor.x && node.y === neighbor.y
                    );
                    
                    if (existingIndex === -1) {
                        openSet.push(neighborNode);
                    } else if (gScore < openSet[existingIndex].g) {
                        openSet[existingIndex] = neighborNode;
                    }
                }
            }
        }
        
        return []; // 没有找到路径
    }
    
    /**
     * 重构路径
     */
    static reconstructPath(node) {
        const path = [];
        let current = node;
        
        while (current) {
            path.unshift({ x: current.x, y: current.y });
            current = current.parent;
        }
        
        return path;
    }
    
    /**
     * 简化路径（移除不必要的中间点）
     */
    static simplifyPath(path, mapData) {
        if (path.length <= 2) return path;
        
        const simplified = [path[0]];
        let current = 0;
        
        while (current < path.length - 1) {
            let next = current + 1;
            
            // 找到最远的可直达点
            while (next < path.length - 1) {
                if (this.hasLineOfSight(
                    path[current].x, path[current].y,
                    path[next + 1].x, path[next + 1].y,
                    mapData
                )) {
                    next++;
                } else {
                    break;
                }
            }
            
            simplified.push(path[next]);
            current = next;
        }
        
        return simplified;
    }
    
    /**
     * 检查两点之间是否有直线视野
     */
    static hasLineOfSight(x0, y0, x1, y1, mapData) {
        const line = TilemapUtils.drawTileLine(x0, y0, x1, y1);
        
        for (const point of line) {
            if (mapData[point.y] && mapData[point.y][point.x] !== 0) {
                return false;
            }
        }
        
        return true;
    }
}
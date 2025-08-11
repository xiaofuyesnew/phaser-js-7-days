/**
 * Day 2 游戏辅助函数
 * 
 * 为精灵与动画系统提供专用的工具函数
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
}

/**
 * 动画工具函数
 */
export class AnimationUtils {
    /**
     * 创建淡入动画
     */
    static fadeIn(scene, target, duration = 1000, onComplete = null) {
        target.setAlpha(0);
        scene.tweens.add({
            targets: target,
            alpha: 1,
            duration: duration,
            ease: 'Power2',
            onComplete: onComplete
        });
    }
    
    /**
     * 创建淡出动画
     */
    static fadeOut(scene, target, duration = 1000, onComplete = null) {
        scene.tweens.add({
            targets: target,
            alpha: 0,
            duration: duration,
            ease: 'Power2',
            onComplete: onComplete
        });
    }
    
    /**
     * 创建缩放动画
     */
    static scaleTo(scene, target, scale, duration = 500, onComplete = null) {
        scene.tweens.add({
            targets: target,
            scaleX: scale,
            scaleY: scale,
            duration: duration,
            ease: 'Back.easeOut',
            onComplete: onComplete
        });
    }
    
    /**
     * 创建弹跳动画
     */
    static bounce(scene, target, height = 20, duration = 500) {
        const originalY = target.y;
        scene.tweens.add({
            targets: target,
            y: originalY - height,
            duration: duration / 2,
            ease: 'Power2',
            yoyo: true,
            repeat: 0
        });
    }
    
    /**
     * 创建摇摆动画
     */
    static shake(scene, target, intensity = 10, duration = 500) {
        const originalX = target.x;
        const originalY = target.y;
        
        scene.tweens.add({
            targets: target,
            x: originalX + MathUtils.randomFloat(-intensity, intensity),
            y: originalY + MathUtils.randomFloat(-intensity, intensity),
            duration: 50,
            repeat: duration / 50,
            yoyo: true,
            onComplete: () => {
                target.setPosition(originalX, originalY);
            }
        });
    }
    
    /**
     * 创建脉冲动画
     */
    static pulse(scene, target, scale = 1.2, duration = 800) {
        scene.tweens.add({
            targets: target,
            scaleX: scale,
            scaleY: scale,
            duration: duration / 2,
            ease: 'Sine.easeInOut',
            yoyo: true,
            repeat: -1
        });
    }
    
    /**
     * 创建旋转动画
     */
    static rotate(scene, target, angle = 360, duration = 2000, repeat = -1) {
        scene.tweens.add({
            targets: target,
            angle: angle,
            duration: duration,
            ease: 'Linear',
            repeat: repeat
        });
    }
    
    /**
     * 创建浮动动画
     */
    static float(scene, target, amplitude = 10, duration = 1500) {
        const originalY = target.y;
        scene.tweens.add({
            targets: target,
            y: originalY - amplitude,
            duration: duration,
            ease: 'Sine.easeInOut',
            yoyo: true,
            repeat: -1
        });
    }
    
    /**
     * 创建闪烁动画
     */
    static blink(scene, target, duration = 100, repeat = 5) {
        scene.tweens.add({
            targets: target,
            alpha: 0,
            duration: duration,
            ease: 'Power2',
            yoyo: true,
            repeat: repeat
        });
    }
}

/**
 * 精灵工具函数
 */
export class SpriteUtils {
    /**
     * 创建精灵图动画配置
     */
    static createAnimationConfig(key, spritesheet, frames, frameRate = 10, repeat = -1) {
        return {
            key: key,
            frames: frames,
            frameRate: frameRate,
            repeat: repeat
        };
    }
    
    /**
     * 批量创建动画
     */
    static createAnimations(scene, animations) {
        animations.forEach(anim => {
            if (!scene.anims.exists(anim.key)) {
                scene.anims.create(anim);
            }
        });
    }
    
    /**
     * 设置精灵的物理属性
     */
    static setupPhysics(sprite, options = {}) {
        const {
            collideWorldBounds = true,
            bounce = 0,
            drag = 0,
            maxVelocity = null,
            size = null,
            offset = null
        } = options;
        
        sprite.setCollideWorldBounds(collideWorldBounds);
        sprite.setBounce(bounce);
        
        if (drag > 0) {
            sprite.setDrag(drag);
        }
        
        if (maxVelocity) {
            sprite.setMaxVelocity(maxVelocity.x || Infinity, maxVelocity.y || Infinity);
        }
        
        if (size) {
            sprite.setSize(size.width, size.height);
        }
        
        if (offset) {
            sprite.setOffset(offset.x, offset.y);
        }
    }
    
    /**
     * 创建精灵拖尾效果
     */
    static createTrail(scene, sprite, trailLength = 5, fadeSpeed = 0.1) {
        const trail = [];
        
        const updateTrail = () => {
            // 添加新的拖尾点
            trail.unshift({
                x: sprite.x,
                y: sprite.y,
                alpha: 1
            });
            
            // 限制拖尾长度
            if (trail.length > trailLength) {
                trail.pop();
            }
            
            // 更新拖尾透明度
            trail.forEach((point, index) => {
                point.alpha = Math.max(0, point.alpha - fadeSpeed);
            });
        };
        
        return { trail, updateTrail };
    }
    
    /**
     * 检查精灵是否在屏幕内
     */
    static isOnScreen(sprite, camera, margin = 50) {
        const bounds = sprite.getBounds();
        const camBounds = camera.worldView;
        
        return bounds.right > camBounds.left - margin &&
               bounds.left < camBounds.right + margin &&
               bounds.bottom > camBounds.top - margin &&
               bounds.top < camBounds.bottom + margin;
    }
    
    /**
     * 计算精灵之间的距离
     */
    static distanceBetween(sprite1, sprite2) {
        return MathUtils.distance(sprite1.x, sprite1.y, sprite2.x, sprite2.y);
    }
    
    /**
     * 让精灵面向目标
     */
    static faceTarget(sprite, targetX, targetY) {
        const angle = Phaser.Math.Angle.Between(sprite.x, sprite.y, targetX, targetY);
        sprite.setRotation(angle);
    }
    
    /**
     * 让精灵移向目标
     */
    static moveTowards(sprite, targetX, targetY, speed) {
        const distance = MathUtils.distance(sprite.x, sprite.y, targetX, targetY);
        if (distance > 0) {
            const normalizedX = (targetX - sprite.x) / distance;
            const normalizedY = (targetY - sprite.y) / distance;
            
            sprite.setVelocity(normalizedX * speed, normalizedY * speed);
        }
    }
}

/**
 * 粒子系统工具函数
 */
export class ParticleUtils {
    /**
     * 创建爆炸效果
     */
    static createExplosion(scene, x, y, particleKey, config = {}) {
        const {
            speed = { min: 50, max: 150 },
            scale = { start: 1, end: 0 },
            lifespan = 600,
            quantity = 10
        } = config;
        
        const particles = scene.add.particles(x, y, particleKey, {
            speed: speed,
            scale: scale,
            lifespan: lifespan,
            quantity: quantity,
            emitting: false
        });
        
        particles.explode();
        
        // 自动清理
        scene.time.delayedCall(lifespan, () => {
            particles.destroy();
        });
        
        return particles;
    }
    
    /**
     * 创建拖尾效果
     */
    static createTrailEffect(scene, target, particleKey, config = {}) {
        const {
            speed = { min: 20, max: 50 },
            scale = { start: 0.5, end: 0 },
            lifespan = 300,
            frequency = 50
        } = config;
        
        const particles = scene.add.particles(0, 0, particleKey, {
            speed: speed,
            scale: scale,
            lifespan: lifespan,
            frequency: frequency
        });
        
        particles.startFollow(target);
        
        return particles;
    }
    
    /**
     * 创建环形粒子效果
     */
    static createRingEffect(scene, x, y, particleKey, config = {}) {
        const {
            speed = 100,
            scale = { start: 0.8, end: 0 },
            lifespan = 800,
            quantity = 12
        } = config;
        
        const particles = scene.add.particles(x, y, particleKey, {
            speed: speed,
            scale: scale,
            lifespan: lifespan,
            quantity: quantity,
            emitting: false,
            angle: { min: 0, max: 360 }
        });
        
        particles.explode();
        
        return particles;
    }
}

/**
 * 输入工具函数
 */
export class InputUtils {
    /**
     * 创建输入缓冲系统
     */
    static createInputBuffer() {
        return {
            buffer: new Map(),
            
            setInput(key, duration = 150) {
                this.buffer.set(key, duration);
            },
            
            checkInput(key) {
                return this.buffer.has(key) && this.buffer.get(key) > 0;
            },
            
            update(deltaTime) {
                for (let [key, time] of this.buffer) {
                    const newTime = time - deltaTime;
                    if (newTime <= 0) {
                        this.buffer.delete(key);
                    } else {
                        this.buffer.set(key, newTime);
                    }
                }
            },
            
            clear() {
                this.buffer.clear();
            }
        };
    }
    
    /**
     * 检查组合键
     */
    static checkComboKeys(keys, combo) {
        return combo.every(key => keys[key] && keys[key].isDown);
    }
    
    /**
     * 获取输入方向
     */
    static getInputDirection(keys) {
        let x = 0;
        let y = 0;
        
        if (keys.left && keys.left.isDown) x -= 1;
        if (keys.right && keys.right.isDown) x += 1;
        if (keys.up && keys.up.isDown) y -= 1;
        if (keys.down && keys.down.isDown) y += 1;
        
        // 标准化对角线移动
        if (x !== 0 && y !== 0) {
            const length = Math.sqrt(x * x + y * y);
            x /= length;
            y /= length;
        }
        
        return { x, y };
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
            return {
                used: Math.round(performance.memory.usedJSHeapSize / 1024 / 1024),
                total: Math.round(performance.memory.totalJSHeapSize / 1024 / 1024),
                limit: Math.round(performance.memory.jsHeapSizeLimit / 1024 / 1024)
            };
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
            this.pool.push(this.createFn());
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
            this.pool.push(obj);
        }
    }
    
    /**
     * 释放所有对象
     */
    releaseAll() {
        this.active.forEach(obj => {
            this.resetFn(obj);
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
}
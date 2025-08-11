/**
 * 游戏辅助函数
 * 
 * 提供常用的工具函数，提高代码复用性
 */

import { DEBUG_CONFIG } from './constants.js';

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
     * @param {number} value - 要限制的值
     * @param {number} min - 最小值
     * @param {number} max - 最大值
     * @returns {number} 限制后的值
     */
    static clamp(value, min, max) {
        return Math.min(Math.max(value, min), max);
    }
    
    /**
     * 线性插值
     * @param {number} start - 起始值
     * @param {number} end - 结束值
     * @param {number} t - 插值参数 (0-1)
     * @returns {number} 插值结果
     */
    static lerp(start, end, t) {
        return start + (end - start) * t;
    }
    
    /**
     * 计算两点之间的距离
     * @param {number} x1 - 第一个点的X坐标
     * @param {number} y1 - 第一个点的Y坐标
     * @param {number} x2 - 第二个点的X坐标
     * @param {number} y2 - 第二个点的Y坐标
     * @returns {number} 距离
     */
    static distance(x1, y1, x2, y2) {
        const dx = x2 - x1;
        const dy = y2 - y1;
        return Math.sqrt(dx * dx + dy * dy);
    }
    
    /**
     * 生成指定范围内的随机整数
     * @param {number} min - 最小值
     * @param {number} max - 最大值
     * @returns {number} 随机整数
     */
    static randomInt(min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }
    
    /**
     * 生成指定范围内的随机浮点数
     * @param {number} min - 最小值
     * @param {number} max - 最大值
     * @returns {number} 随机浮点数
     */
    static randomFloat(min, max) {
        return Math.random() * (max - min) + min;
    }
    
    /**
     * 角度转弧度
     * @param {number} degrees - 角度
     * @returns {number} 弧度
     */
    static degToRad(degrees) {
        return degrees * (Math.PI / 180);
    }
    
    /**
     * 弧度转角度
     * @param {number} radians - 弧度
     * @returns {number} 角度
     */
    static radToDeg(radians) {
        return radians * (180 / Math.PI);
    }
}

/**
 * 颜色工具函数
 */
export class ColorUtils {
    /**
     * 将十六进制颜色转换为RGB
     * @param {number} hex - 十六进制颜色值
     * @returns {Object} RGB对象 {r, g, b}
     */
    static hexToRgb(hex) {
        return {
            r: (hex >> 16) & 255,
            g: (hex >> 8) & 255,
            b: hex & 255
        };
    }
    
    /**
     * 将RGB转换为十六进制颜色
     * @param {number} r - 红色分量 (0-255)
     * @param {number} g - 绿色分量 (0-255)
     * @param {number} b - 蓝色分量 (0-255)
     * @returns {number} 十六进制颜色值
     */
    static rgbToHex(r, g, b) {
        return (r << 16) | (g << 8) | b;
    }
    
    /**
     * 颜色插值
     * @param {number} color1 - 起始颜色
     * @param {number} color2 - 结束颜色
     * @param {number} t - 插值参数 (0-1)
     * @returns {number} 插值后的颜色
     */
    static lerpColor(color1, color2, t) {
        const rgb1 = this.hexToRgb(color1);
        const rgb2 = this.hexToRgb(color2);
        
        const r = Math.round(MathUtils.lerp(rgb1.r, rgb2.r, t));
        const g = Math.round(MathUtils.lerp(rgb1.g, rgb2.g, t));
        const b = Math.round(MathUtils.lerp(rgb1.b, rgb2.b, t));
        
        return this.rgbToHex(r, g, b);
    }
}

/**
 * 游戏对象工具函数
 */
export class GameObjectUtils {
    /**
     * 检查两个矩形是否重叠
     * @param {Object} rect1 - 第一个矩形 {x, y, width, height}
     * @param {Object} rect2 - 第二个矩形 {x, y, width, height}
     * @returns {boolean} 是否重叠
     */
    static rectanglesOverlap(rect1, rect2) {
        return rect1.x < rect2.x + rect2.width &&
               rect1.x + rect1.width > rect2.x &&
               rect1.y < rect2.y + rect2.height &&
               rect1.y + rect1.height > rect2.y;
    }
    
    /**
     * 检查点是否在矩形内
     * @param {number} x - 点的X坐标
     * @param {number} y - 点的Y坐标
     * @param {Object} rect - 矩形 {x, y, width, height}
     * @returns {boolean} 是否在矩形内
     */
    static pointInRectangle(x, y, rect) {
        return x >= rect.x && x <= rect.x + rect.width &&
               y >= rect.y && y <= rect.y + rect.height;
    }
    
    /**
     * 检查点是否在圆形内
     * @param {number} x - 点的X坐标
     * @param {number} y - 点的Y坐标
     * @param {number} centerX - 圆心X坐标
     * @param {number} centerY - 圆心Y坐标
     * @param {number} radius - 半径
     * @returns {boolean} 是否在圆形内
     */
    static pointInCircle(x, y, centerX, centerY, radius) {
        const distance = MathUtils.distance(x, y, centerX, centerY);
        return distance <= radius;
    }
}

/**
 * 动画工具函数
 */
export class AnimationUtils {
    /**
     * 创建淡入动画
     * @param {Phaser.Scene} scene - 场景对象
     * @param {Phaser.GameObjects.GameObject} target - 目标对象
     * @param {number} duration - 动画时长
     * @param {Function} onComplete - 完成回调
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
     * @param {Phaser.Scene} scene - 场景对象
     * @param {Phaser.GameObjects.GameObject} target - 目标对象
     * @param {number} duration - 动画时长
     * @param {Function} onComplete - 完成回调
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
     * @param {Phaser.Scene} scene - 场景对象
     * @param {Phaser.GameObjects.GameObject} target - 目标对象
     * @param {number} scale - 目标缩放值
     * @param {number} duration - 动画时长
     * @param {Function} onComplete - 完成回调
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
     * @param {Phaser.Scene} scene - 场景对象
     * @param {Phaser.GameObjects.GameObject} target - 目标对象
     * @param {number} height - 弹跳高度
     * @param {number} duration - 动画时长
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
}

/**
 * 存储工具函数
 */
export class StorageUtils {
    /**
     * 保存数据到本地存储
     * @param {string} key - 键名
     * @param {*} value - 值
     */
    static save(key, value) {
        try {
            localStorage.setItem(key, JSON.stringify(value));
            Logger.debug(`数据已保存: ${key}`);
        } catch (error) {
            Logger.error(`保存数据失败: ${key}`, error);
        }
    }
    
    /**
     * 从本地存储读取数据
     * @param {string} key - 键名
     * @param {*} defaultValue - 默认值
     * @returns {*} 读取的值或默认值
     */
    static load(key, defaultValue = null) {
        try {
            const value = localStorage.getItem(key);
            return value ? JSON.parse(value) : defaultValue;
        } catch (error) {
            Logger.error(`读取数据失败: ${key}`, error);
            return defaultValue;
        }
    }
    
    /**
     * 删除本地存储数据
     * @param {string} key - 键名
     */
    static remove(key) {
        try {
            localStorage.removeItem(key);
            Logger.debug(`数据已删除: ${key}`);
        } catch (error) {
            Logger.error(`删除数据失败: ${key}`, error);
        }
    }
    
    /**
     * 清空所有本地存储数据
     */
    static clear() {
        try {
            localStorage.clear();
            Logger.debug('所有数据已清空');
        } catch (error) {
            Logger.error('清空数据失败', error);
        }
    }
}

/**
 * 性能监控工具
 */
export class PerformanceUtils {
    static startTime = 0;
    
    /**
     * 开始性能计时
     * @param {string} label - 标签
     */
    static startTimer(label = 'default') {
        this.startTime = performance.now();
        Logger.debug(`⏱️ 开始计时: ${label}`);
    }
    
    /**
     * 结束性能计时
     * @param {string} label - 标签
     */
    static endTimer(label = 'default') {
        const endTime = performance.now();
        const duration = endTime - this.startTime;
        Logger.debug(`⏱️ 计时结束: ${label} - ${duration.toFixed(2)}ms`);
        return duration;
    }
    
    /**
     * 获取内存使用情况
     * @returns {Object} 内存信息
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
}
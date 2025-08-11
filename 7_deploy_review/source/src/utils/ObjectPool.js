/**
 * 对象池管理器
 * 用于优化游戏性能，减少对象创建和销毁的开销
 */
export class ObjectPool {
    constructor() {
        this.pools = new Map();
        this.stats = new Map();
    }
    
    /**
     * 创建对象池
     * @param {string} key - 池的唯一标识
     * @param {Function} createFn - 创建对象的函数
     * @param {Function} resetFn - 重置对象的函数
     * @param {number} initialSize - 初始池大小
     * @param {number} maxSize - 最大池大小
     */
    createPool(key, createFn, resetFn, initialSize = 10, maxSize = 100) {
        if (this.pools.has(key)) {
            console.warn(`Pool '${key}' already exists`);
            return;
        }
        
        const pool = {
            objects: [],
            createFn,
            resetFn,
            maxSize,
            activeCount: 0,
            totalCreated: 0,
            totalReused: 0
        };
        
        // 预创建对象
        for (let i = 0; i < initialSize; i++) {
            const obj = createFn();
            this.preparePoolObject(obj);
            pool.objects.push(obj);
            pool.totalCreated++;
        }
        
        this.pools.set(key, pool);
        this.stats.set(key, {
            gets: 0,
            releases: 0,
            creates: initialSize,
            reuses: 0
        });
        
        console.log(`Created object pool '${key}' with ${initialSize} objects`);
    }
    
    /**
     * 准备池对象（添加池相关属性）
     */
    preparePoolObject(obj) {
        obj._pooled = true;
        obj._poolActive = false;
        
        if (obj.setActive) {
            obj.setActive(false);
        }
        if (obj.setVisible) {
            obj.setVisible(false);
        }
    }
    
    /**
     * 从池中获取对象
     * @param {string} key - 池标识
     * @returns {Object|null} 池对象
     */
    get(key) {
        const pool = this.pools.get(key);
        if (!pool) {
            console.error(`Pool '${key}' does not exist`);
            return null;
        }
        
        const stats = this.stats.get(key);
        stats.gets++;
        
        // 查找可用对象
        for (let obj of pool.objects) {
            if (!obj._poolActive) {
                obj._poolActive = true;
                pool.activeCount++;
                stats.reuses++;
                pool.totalReused++;
                
                // 激活对象
                if (obj.setActive) obj.setActive(true);
                if (obj.setVisible) obj.setVisible(true);
                
                return obj;
            }
        }
        
        // 如果没有可用对象且未达到最大限制，创建新对象
        if (pool.objects.length < pool.maxSize) {
            const newObj = pool.createFn();
            this.preparePoolObject(newObj);
            newObj._poolActive = true;
            
            pool.objects.push(newObj);
            pool.activeCount++;
            pool.totalCreated++;
            stats.creates++;
            
            // 激活对象
            if (newObj.setActive) newObj.setActive(true);
            if (newObj.setVisible) newObj.setVisible(true);
            
            return newObj;
        }
        
        // 池已满，返回null或最老的对象
        console.warn(`Pool '${key}' is full (${pool.maxSize} objects)`);
        return null;
    }
    
    /**
     * 释放对象回池中
     * @param {string} key - 池标识
     * @param {Object} obj - 要释放的对象
     */
    release(key, obj) {
        const pool = this.pools.get(key);
        if (!pool) {
            console.error(`Pool '${key}' does not exist`);
            return;
        }
        
        if (!obj._pooled || !obj._poolActive) {
            console.warn('Trying to release non-pooled or inactive object');
            return;
        }
        
        const stats = this.stats.get(key);
        stats.releases++;
        
        // 重置对象
        pool.resetFn(obj);
        
        // 标记为非活动
        obj._poolActive = false;
        pool.activeCount--;
        
        // 隐藏对象
        if (obj.setActive) obj.setActive(false);
        if (obj.setVisible) obj.setVisible(false);
    }
    
    /**
     * 批量释放对象
     * @param {string} key - 池标识
     * @param {Array} objects - 要释放的对象数组
     */
    releaseAll(key, objects) {
        objects.forEach(obj => {
            this.release(key, obj);
        });
    }
    
    /**
     * 清空池中的所有对象
     * @param {string} key - 池标识
     */
    clear(key) {
        const pool = this.pools.get(key);
        if (!pool) {
            console.error(`Pool '${key}' does not exist`);
            return;
        }
        
        // 销毁所有对象
        pool.objects.forEach(obj => {
            if (obj.destroy) {
                obj.destroy();
            }
        });
        
        pool.objects = [];
        pool.activeCount = 0;
        
        // 重置统计
        const stats = this.stats.get(key);
        stats.gets = 0;
        stats.releases = 0;
        stats.creates = 0;
        stats.reuses = 0;
        
        console.log(`Cleared pool '${key}'`);
    }
    
    /**
     * 删除池
     * @param {string} key - 池标识
     */
    destroyPool(key) {
        this.clear(key);
        this.pools.delete(key);
        this.stats.delete(key);
        
        console.log(`Destroyed pool '${key}'`);
    }
    
    /**
     * 获取池状态
     * @param {string} key - 池标识
     * @returns {Object|null} 池状态信息
     */
    getPoolStats(key) {
        const pool = this.pools.get(key);
        const stats = this.stats.get(key);
        
        if (!pool || !stats) {
            return null;
        }
        
        return {
            total: pool.objects.length,
            active: pool.activeCount,
            available: pool.objects.length - pool.activeCount,
            maxSize: pool.maxSize,
            totalCreated: pool.totalCreated,
            totalReused: pool.totalReused,
            gets: stats.gets,
            releases: stats.releases,
            creates: stats.creates,
            reuses: stats.reuses,
            efficiency: stats.gets > 0 ? (stats.reuses / stats.gets * 100).toFixed(1) + '%' : '0%'
        };
    }
    
    /**
     * 获取所有池的状态
     * @returns {Object} 所有池的状态信息
     */
    getAllStats() {
        const allStats = {};
        
        this.pools.forEach((pool, key) => {
            allStats[key] = this.getPoolStats(key);
        });
        
        return allStats;
    }
    
    /**
     * 打印池状态到控制台
     * @param {string} key - 池标识，如果不提供则打印所有池
     */
    printStats(key = null) {
        if (key) {
            const stats = this.getPoolStats(key);
            if (stats) {
                console.table({ [key]: stats });
            }
        } else {
            const allStats = this.getAllStats();
            console.table(allStats);
        }
    }
    
    /**
     * 自动清理未使用的对象（垃圾回收）
     * @param {string} key - 池标识
     * @param {number} keepCount - 保留的最小对象数量
     */
    cleanup(key, keepCount = 5) {
        const pool = this.pools.get(key);
        if (!pool) return;
        
        const inactiveObjects = pool.objects.filter(obj => !obj._poolActive);
        const excessCount = inactiveObjects.length - keepCount;
        
        if (excessCount > 0) {
            // 移除多余的非活动对象
            const objectsToRemove = inactiveObjects.slice(0, excessCount);
            
            objectsToRemove.forEach(obj => {
                const index = pool.objects.indexOf(obj);
                if (index > -1) {
                    pool.objects.splice(index, 1);
                    if (obj.destroy) {
                        obj.destroy();
                    }
                }
            });
            
            console.log(`Cleaned up ${excessCount} objects from pool '${key}'`);
        }
    }
    
    /**
     * 自动清理所有池
     * @param {number} keepCount - 每个池保留的最小对象数量
     */
    cleanupAll(keepCount = 5) {
        this.pools.forEach((pool, key) => {
            this.cleanup(key, keepCount);
        });
    }
    
    /**
     * 预热池（预创建对象）
     * @param {string} key - 池标识
     * @param {number} count - 预创建的对象数量
     */
    warmup(key, count) {
        const pool = this.pools.get(key);
        if (!pool) return;
        
        const currentSize = pool.objects.length;
        const targetSize = Math.min(currentSize + count, pool.maxSize);
        const createCount = targetSize - currentSize;
        
        for (let i = 0; i < createCount; i++) {
            const obj = pool.createFn();
            this.preparePoolObject(obj);
            pool.objects.push(obj);
            pool.totalCreated++;
        }
        
        const stats = this.stats.get(key);
        stats.creates += createCount;
        
        console.log(`Warmed up pool '${key}' with ${createCount} additional objects`);
    }
    
    /**
     * 检查对象是否来自池
     * @param {Object} obj - 要检查的对象
     * @returns {boolean} 是否为池对象
     */
    isPooled(obj) {
        return obj && obj._pooled === true;
    }
    
    /**
     * 检查池对象是否活动
     * @param {Object} obj - 要检查的对象
     * @returns {boolean} 是否活动
     */
    isActive(obj) {
        return this.isPooled(obj) && obj._poolActive === true;
    }
    
    /**
     * 获取池的名称列表
     * @returns {Array} 池名称数组
     */
    getPoolNames() {
        return Array.from(this.pools.keys());
    }
    
    /**
     * 销毁所有池
     */
    destroyAll() {
        this.pools.forEach((pool, key) => {
            this.destroyPool(key);
        });
        
        console.log('All object pools destroyed');
    }
}

// 创建全局对象池实例
export const objectPool = new ObjectPool();

// 常用的池创建辅助函数
export const PoolHelpers = {
    /**
     * 为Phaser精灵创建池
     */
    createSpritePool(scene, key, texture, poolSize = 20) {
        objectPool.createPool(
            key,
            () => {
                const sprite = scene.add.sprite(0, 0, texture);
                sprite.setActive(false);
                sprite.setVisible(false);
                return sprite;
            },
            (sprite) => {
                sprite.setPosition(0, 0);
                sprite.setRotation(0);
                sprite.setScale(1);
                sprite.setAlpha(1);
                sprite.clearTint();
                if (sprite.body) {
                    sprite.body.setVelocity(0, 0);
                }
            },
            poolSize
        );
    },
    
    /**
     * 为物理精灵创建池
     */
    createPhysicsSpritePool(scene, key, texture, poolSize = 20) {
        objectPool.createPool(
            key,
            () => {
                const sprite = scene.physics.add.sprite(0, 0, texture);
                sprite.setActive(false);
                sprite.setVisible(false);
                return sprite;
            },
            (sprite) => {
                sprite.setPosition(0, 0);
                sprite.setRotation(0);
                sprite.setScale(1);
                sprite.setAlpha(1);
                sprite.clearTint();
                sprite.body.setVelocity(0, 0);
                sprite.body.setAcceleration(0, 0);
                sprite.body.setAngularVelocity(0);
            },
            poolSize
        );
    },
    
    /**
     * 为文本对象创建池
     */
    createTextPool(scene, key, style = {}, poolSize = 10) {
        objectPool.createPool(
            key,
            () => {
                const text = scene.add.text(0, 0, '', style);
                text.setActive(false);
                text.setVisible(false);
                return text;
            },
            (text) => {
                text.setPosition(0, 0);
                text.setText('');
                text.setAlpha(1);
                text.setScale(1);
                text.setRotation(0);
            },
            poolSize
        );
    },
    
    /**
     * 为粒子发射器创建池
     */
    createParticlePool(scene, key, texture, config = {}, poolSize = 5) {
        objectPool.createPool(
            key,
            () => {
                const emitter = scene.add.particles(0, 0, texture, config);
                emitter.setActive(false);
                emitter.setVisible(false);
                return emitter;
            },
            (emitter) => {
                emitter.setPosition(0, 0);
                emitter.stop();
            },
            poolSize
        );
    }
};
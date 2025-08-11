import ObjectPool from './ObjectPool.js'

// 敌人管理器
export default class EnemyManager {
    constructor(scene) {
        this.scene = scene
        this.enemies = []
        this.enemyPools = new Map()
        this.spawnPoints = []
        this.maxEnemies = 8
        this.spawnCooldown = 5000
        this.lastSpawnTime = 0
        this.isActive = true
    }
    
    // 注册敌人类型
    registerEnemyType(type, enemyClass, poolSize = 3) {
        this.enemyPools.set(type, new ObjectPool(this.scene, enemyClass, poolSize))
    }
    
    // 添加生成点
    addSpawnPoint(x, y, enemyType = 'basic') {
        this.spawnPoints.push({ x, y, enemyType })
    }
    
    // 生成敌人
    spawnEnemy(x, y, type = 'basic') {
        if (this.enemies.length >= this.maxEnemies) {
            return null
        }
        
        const pool = this.enemyPools.get(type)
        if (!pool) {
            console.warn(`Enemy type ${type} not registered`)
            return null
        }
        
        const enemy = pool.get(x, y)
        enemy.enemyType = type
        enemy.manager = this
        
        this.enemies.push(enemy)
        
        // 添加到碰撞系统
        if (this.scene.collisionSystem) {
            this.scene.collisionSystem.addToGroup('enemies', enemy)
        }
        
        console.log(`生成敌人: ${type} at (${x}, ${y})`)
        return enemy
    }
    
    // 移除敌人
    removeEnemy(enemy) {
        const index = this.enemies.indexOf(enemy)
        if (index !== -1) {
            this.enemies.splice(index, 1)
            
            // 从碰撞系统移除
            if (this.scene.collisionSystem) {
                this.scene.collisionSystem.removeFromGroup('enemies', enemy)
            }
            
            // 回收到对象池
            const pool = this.enemyPools.get(enemy.enemyType)
            if (pool) {
                pool.release(enemy)
            }
        }
    }
    
    // 自动生成敌人
    update(deltaTime) {
        if (!this.isActive) return
        
        const currentTime = Date.now()
        
        // 自动生成敌人
        if (currentTime - this.lastSpawnTime >= this.spawnCooldown) {
            if (this.enemies.length < this.maxEnemies && this.spawnPoints.length > 0) {
                const spawnPoint = Phaser.Utils.Array.GetRandom(this.spawnPoints)
                
                // 检查生成点是否远离玩家
                const player = this.scene.player
                if (player) {
                    const distance = Phaser.Math.Distance.Between(
                        spawnPoint.x, spawnPoint.y,
                        player.x, player.y
                    )
                    
                    if (distance > 300) { // 只在远离玩家的地方生成
                        this.spawnEnemy(spawnPoint.x, spawnPoint.y, spawnPoint.enemyType)
                        this.lastSpawnTime = currentTime
                    }
                }
            }
        }
        
        // 更新所有敌人
        for (let i = this.enemies.length - 1; i >= 0; i--) {
            const enemy = this.enemies[i]
            if (enemy.active && enemy.isAlive) {
                enemy.update(deltaTime)
                
                // 检查是否需要移除
                if (enemy.shouldDestroy || !enemy.isAlive) {
                    this.removeEnemy(enemy)
                }
            }
        }
        
        // 更新对象池
        this.enemyPools.forEach(pool => pool.updateAll(deltaTime))
    }
    
    // 获取最近的敌人
    getNearestEnemy(x, y, maxDistance = Infinity) {
        let nearest = null
        let nearestDistance = maxDistance
        
        this.enemies.forEach(enemy => {
            if (!enemy.isAlive) return
            
            const distance = Phaser.Math.Distance.Between(x, y, enemy.x, enemy.y)
            if (distance < nearestDistance) {
                nearest = enemy
                nearestDistance = distance
            }
        })
        
        return nearest
    }
    
    // 获取范围内的敌人
    getEnemiesInRange(x, y, range) {
        return this.enemies.filter(enemy => {
            if (!enemy.isAlive) return false
            
            const distance = Phaser.Math.Distance.Between(x, y, enemy.x, enemy.y)
            return distance <= range
        })
    }
    
    // 获取活跃敌人数量
    getActiveEnemyCount() {
        return this.enemies.filter(enemy => enemy.isAlive).length
    }
    
    // 清理所有敌人
    clear() {
        this.enemies.forEach(enemy => {
            if (this.scene.collisionSystem) {
                this.scene.collisionSystem.removeFromGroup('enemies', enemy)
            }
        })
        
        this.enemies = []
        this.enemyPools.forEach(pool => pool.clear())
    }
    
    // 暂停/恢复敌人系统
    setActive(active) {
        this.isActive = active
    }
    
    // 设置最大敌人数量
    setMaxEnemies(max) {
        this.maxEnemies = max
    }
    
    // 设置生成冷却时间
    setSpawnCooldown(cooldown) {
        this.spawnCooldown = cooldown
    }
}
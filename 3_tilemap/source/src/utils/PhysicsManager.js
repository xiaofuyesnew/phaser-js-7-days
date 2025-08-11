/**
 * PhysicsManager - 物理系统管理器
 * 
 * 这个类负责管理游戏的物理系统：
 * - 碰撞检测和响应
 * - 物理体属性管理
 * - 触发器系统
 * - 物理效果处理
 * 
 * 学习重点:
 * - 理解Arcade Physics的工作原理
 * - 掌握碰撞检测的优化技巧
 * - 学会物理属性的动态调整
 * - 了解触发器的实现方式
 */

import { PHYSICS_CONFIG, TILE_PROPERTIES, TILE_TYPES } from './constants.js';
import { Logger, MathUtils } from './helpers.js';

export class PhysicsManager {
    constructor(scene) {
        this.scene = scene;
        this.physics = scene.physics;
        
        // 碰撞组管理
        this.collisionGroups = new Map();
        this.colliders = [];
        this.overlaps = [];
        
        // 触发器系统
        this.triggers = new Map();
        this.triggerCallbacks = new Map();
        
        // 物理效果
        this.liquidAreas = [];
        this.windZones = [];
        this.gravityZones = [];
        
        // 性能优化
        this.spatialGrid = new SpatialGrid(64);
        this.activeCollisions = new Set();
        
        Logger.info('⚡ 物理系统管理器初始化完成');
    }
    
    /**
     * 初始化物理世界
     */
    initializePhysicsWorld() {
        // 设置世界边界
        this.physics.world.setBounds(
            PHYSICS_CONFIG.WORLD_BOUNDS.x,
            PHYSICS_CONFIG.WORLD_BOUNDS.y,
            PHYSICS_CONFIG.WORLD_BOUNDS.width,
            PHYSICS_CONFIG.WORLD_BOUNDS.height
        );
        
        // 设置重力
        this.physics.world.gravity.y = PHYSICS_CONFIG.GRAVITY;
        
        // 启用调试模式
        if (PHYSICS_CONFIG.DEBUG) {
            this.physics.world.createDebugGraphic();
        }
        
        Logger.info('🌍 物理世界初始化完成');
    }
    
    /**
     * 创建碰撞组
     */
    createCollisionGroup(name, config = {}) {
        const group = this.physics.add.group({
            classType: config.classType || Phaser.Physics.Arcade.Sprite,
            maxSize: config.maxSize || -1,
            runChildUpdate: config.runChildUpdate !== false,
            createCallback: config.createCallback,
            removeCallback: config.removeCallback
        });
        
        this.collisionGroups.set(name, group);
        
        Logger.debug(`📦 创建碰撞组: ${name}`);
        return group;
    }
    
    /**
     * 获取碰撞组
     */
    getCollisionGroup(name) {
        return this.collisionGroups.get(name);
    }
    
    /**
     * 添加碰撞器
     */
    addCollider(object1, object2, callback = null, processCallback = null, context = null) {
        const collider = this.physics.add.collider(
            object1, 
            object2, 
            callback, 
            processCallback, 
            context
        );
        
        this.colliders.push({
            collider: collider,
            object1: object1,
            object2: object2,
            callback: callback,
            active: true
        });
        
        return collider;
    }
    
    /**
     * 添加重叠检测
     */
    addOverlap(object1, object2, callback = null, processCallback = null, context = null) {
        const overlap = this.physics.add.overlap(
            object1, 
            object2, 
            callback, 
            processCallback, 
            context
        );
        
        this.overlaps.push({
            overlap: overlap,
            object1: object1,
            object2: object2,
            callback: callback,
            active: true
        });
        
        return overlap;
    }
    
    /**
     * 设置瓦片碰撞属性
     */
    setupTileCollisions(layer, tilemap) {
        // 遍历所有瓦片，设置物理属性
        layer.forEachTile((tile) => {
            if (tile.index > 0) {
                const tileProperties = TILE_PROPERTIES[tile.index] || TILE_PROPERTIES[TILE_TYPES.STONE];
                
                // 设置碰撞
                if (tileProperties.collision) {
                    tile.setCollision(true);
                }
                
                // 设置自定义属性
                tile.properties = {
                    ...tileProperties,
                    originalIndex: tile.index
                };
            }
        });
        
        Logger.info('🧱 瓦片碰撞属性设置完成');
    }
    
    /**
     * 处理玩家与瓦片的碰撞
     */
    handlePlayerTileCollision(player, tile) {
        const tileProperties = tile.properties || TILE_PROPERTIES[TILE_TYPES.STONE];
        
        // 检查碰撞方向
        const collisionSide = this.getCollisionSide(player, tile);
        
        // 根据瓦片类型处理特殊效果
        switch (tile.index) {
            case TILE_TYPES.SPIKE:
                this.handleSpikeCollision(player, tile);
                break;
                
            case TILE_TYPES.SPRING:
                this.handleSpringCollision(player, tile, collisionSide);
                break;
                
            case TILE_TYPES.ICE:
                this.handleIceCollision(player, tile);
                break;
                
            case TILE_TYPES.CONVEYOR_LEFT:
            case TILE_TYPES.CONVEYOR_RIGHT:
                this.handleConveyorCollision(player, tile);
                break;
                
            case TILE_TYPES.BREAKABLE:
                this.handleBreakableCollision(player, tile);
                break;
        }
        
        // 应用摩擦力
        if (collisionSide === 'bottom' && tileProperties.friction !== undefined) {
            player.body.friction.x = tileProperties.friction;
        }
        
        // 播放着陆音效
        if (collisionSide === 'bottom' && player.body.velocity.y > 100) {
            this.scene.sound.play('land-sound', { volume: 0.3 });
            this.createLandingEffect(player.x, player.y + player.height / 2);
        }
    }
    
    /**
     * 获取碰撞方向
     */
    getCollisionSide(sprite, tile) {
        const spriteCenter = {
            x: sprite.x,
            y: sprite.y
        };
        
        const tileCenter = {
            x: tile.pixelX + tile.width / 2,
            y: tile.pixelY + tile.height / 2
        };
        
        const dx = spriteCenter.x - tileCenter.x;
        const dy = spriteCenter.y - tileCenter.y;
        
        const absDx = Math.abs(dx);
        const absDy = Math.abs(dy);
        
        if (absDx > absDy) {
            return dx > 0 ? 'right' : 'left';
        } else {
            return dy > 0 ? 'bottom' : 'top';
        }
    }
    
    /**
     * 处理尖刺碰撞
     */
    handleSpikeCollision(player, tile) {
        const damage = TILE_PROPERTIES[TILE_TYPES.SPIKE].damage;
        
        // 造成伤害
        if (player.takeDamage) {
            player.takeDamage(damage);
        }
        
        // 击退效果
        const knockbackForce = 200;
        const direction = player.x < tile.pixelX + tile.width / 2 ? -1 : 1;
        player.body.setVelocityX(direction * knockbackForce);
        player.body.setVelocityY(-150);
        
        // 创建伤害效果
        this.createDamageEffect(player.x, player.y);
        
        // 播放音效
        this.scene.sound.play('damage-sound', { volume: 0.5 });
        
        Logger.debug('💥 玩家触碰尖刺');
    }
    
    /**
     * 处理弹簧碰撞
     */
    handleSpringCollision(player, tile, collisionSide) {
        if (collisionSide === 'bottom') {
            const springForce = TILE_PROPERTIES[TILE_TYPES.SPRING].springForce;
            player.body.setVelocityY(springForce);
            
            // 创建弹簧效果
            this.createSpringEffect(tile.pixelX + tile.width / 2, tile.pixelY);
            
            // 播放音效
            this.scene.sound.play('spring-sound', { volume: 0.4 });
            
            Logger.debug('🚀 玩家触发弹簧');
        }
    }
    
    /**
     * 处理冰面碰撞
     */
    handleIceCollision(player, tile) {
        // 降低摩擦力
        player.body.friction.x = TILE_PROPERTIES[TILE_TYPES.ICE].friction;
        
        // 添加滑行效果
        if (Math.abs(player.body.velocity.x) > 50) {
            this.createIceSlideEffect(player.x, player.y + player.height / 2);
        }
    }
    
    /**
     * 处理传送带碰撞
     */
    handleConveyorCollision(player, tile) {
        const conveyorSpeed = 100;
        const direction = tile.index === TILE_TYPES.CONVEYOR_LEFT ? -1 : 1;
        
        // 应用传送带力
        player.body.velocity.x += direction * conveyorSpeed * 0.1;
        
        // 创建传送带效果
        if (Math.random() < 0.1) {
            this.createConveyorEffect(
                tile.pixelX + Math.random() * tile.width,
                tile.pixelY,
                direction
            );
        }
    }
    
    /**
     * 处理可破坏方块碰撞
     */
    handleBreakableCollision(player, tile) {
        const collisionSide = this.getCollisionSide(player, tile);
        
        // 只有从下方撞击才能破坏
        if (collisionSide === 'top' && player.body.velocity.y < -200) {
            this.breakTile(tile);
        }
    }
    
    /**
     * 破坏瓦片
     */
    breakTile(tile) {
        // 移除瓦片
        const layer = tile.layer;
        layer.removeTileAt(tile.x, tile.y);
        
        // 创建破坏效果
        this.createBreakEffect(
            tile.pixelX + tile.width / 2,
            tile.pixelY + tile.height / 2,
            tile.index
        );
        
        // 播放音效
        this.scene.sound.play('break-sound', { volume: 0.6 });
        
        Logger.debug('💥 瓦片被破坏');
    }
    
    /**
     * 处理液体区域
     */
    handleLiquidArea(sprite, liquidType) {
        const properties = TILE_PROPERTIES[liquidType];
        
        if (properties.liquid) {
            // 应用粘性
            sprite.body.velocity.x *= (1 - properties.viscosity * 0.1);
            sprite.body.velocity.y *= (1 - properties.viscosity * 0.05);
            
            // 浮力效果
            if (liquidType === TILE_TYPES.WATER) {
                sprite.body.velocity.y -= PHYSICS_CONFIG.GRAVITY * 0.3;
            }
            
            // 伤害效果
            if (properties.damage > 0) {
                if (sprite.takeDamage && Math.random() < 0.02) {
                    sprite.takeDamage(properties.damage);
                }
            }
            
            // 创建液体效果
            if (Math.random() < 0.1) {
                this.createLiquidEffect(sprite.x, sprite.y, liquidType);
            }
        }
    }
    
    /**
     * 添加触发器
     */
    addTrigger(x, y, width, height, callback, context = null) {
        const triggerId = `trigger_${Date.now()}_${Math.random()}`;
        
        const trigger = this.scene.add.zone(x, y, width, height);
        this.physics.add.existing(trigger);
        trigger.body.setImmovable(true);
        
        this.triggers.set(triggerId, trigger);
        this.triggerCallbacks.set(triggerId, { callback, context });
        
        return triggerId;
    }
    
    /**
     * 移除触发器
     */
    removeTrigger(triggerId) {
        const trigger = this.triggers.get(triggerId);
        if (trigger) {
            trigger.destroy();
            this.triggers.delete(triggerId);
            this.triggerCallbacks.delete(triggerId);
        }
    }
    
    /**
     * 检查触发器
     */
    checkTriggers(sprite) {
        this.triggers.forEach((trigger, triggerId) => {
            if (this.physics.overlap(sprite, trigger)) {
                const triggerData = this.triggerCallbacks.get(triggerId);
                if (triggerData && triggerData.callback) {
                    triggerData.callback.call(triggerData.context, sprite, trigger);
                }
            }
        });
    }
    
    /**
     * 创建着陆效果
     */
    createLandingEffect(x, y) {
        if (this.scene.landingParticles) {
            this.scene.landingParticles.emitParticleAt(x, y);
        }
    }
    
    /**
     * 创建伤害效果
     */
    createDamageEffect(x, y) {
        // 创建红色粒子效果
        if (this.scene.damageParticles) {
            this.scene.damageParticles.emitParticleAt(x, y);
        }
        
        // 屏幕震动
        this.scene.cameras.main.shake(200, 0.01);
    }
    
    /**
     * 创建弹簧效果
     */
    createSpringEffect(x, y) {
        // 创建向上的粒子效果
        if (this.scene.springParticles) {
            this.scene.springParticles.emitParticleAt(x, y);
        }
    }
    
    /**
     * 创建冰滑效果
     */
    createIceSlideEffect(x, y) {
        // 创建冰晶粒子效果
        if (this.scene.iceParticles) {
            this.scene.iceParticles.emitParticleAt(x, y);
        }
    }
    
    /**
     * 创建传送带效果
     */
    createConveyorEffect(x, y, direction) {
        // 创建移动的粒子效果
        const particle = this.scene.add.circle(x, y, 2, 0xFFFFFF, 0.6);
        
        this.scene.tweens.add({
            targets: particle,
            x: x + direction * 20,
            alpha: 0,
            duration: 500,
            onComplete: () => {
                particle.destroy();
            }
        });
    }
    
    /**
     * 创建破坏效果
     */
    createBreakEffect(x, y, tileIndex) {
        if (this.scene.breakParticles) {
            // 根据瓦片类型设置粒子颜色
            const tileType = this.scene.mapGenerator.getTileType(tileIndex);
            this.scene.breakParticles.setTint(tileType.color);
            this.scene.breakParticles.emitParticleAt(x, y);
        }
    }
    
    /**
     * 创建液体效果
     */
    createLiquidEffect(x, y, liquidType) {
        let color = 0x4169E1; // 默认水的颜色
        
        if (liquidType === TILE_TYPES.LAVA) {
            color = 0xFF4500;
        }
        
        const bubble = this.scene.add.circle(
            x + MathUtils.randomInt(-10, 10),
            y + MathUtils.randomInt(-5, 5),
            MathUtils.randomInt(1, 3),
            color,
            0.6
        );
        
        this.scene.tweens.add({
            targets: bubble,
            y: bubble.y - 20,
            alpha: 0,
            duration: 1000,
            onComplete: () => {
                bubble.destroy();
            }
        });
    }
    
    /**
     * 更新物理系统
     */
    update(deltaTime) {
        // 更新空间网格
        this.spatialGrid.clear();
        
        // 添加活动对象到空间网格
        this.collisionGroups.forEach((group, name) => {
            group.children.entries.forEach(sprite => {
                if (sprite.active && sprite.body) {
                    this.spatialGrid.insert(sprite);
                }
            });
        });
        
        // 检查触发器
        const playerGroup = this.collisionGroups.get('players');
        if (playerGroup) {
            playerGroup.children.entries.forEach(player => {
                if (player.active) {
                    this.checkTriggers(player);
                }
            });
        }
    }
    
    /**
     * 启用/禁用碰撞器
     */
    setColliderActive(collider, active) {
        const colliderData = this.colliders.find(c => c.collider === collider);
        if (colliderData) {
            colliderData.active = active;
            collider.active = active;
        }
    }
    
    /**
     * 启用/禁用重叠检测
     */
    setOverlapActive(overlap, active) {
        const overlapData = this.overlaps.find(o => o.overlap === overlap);
        if (overlapData) {
            overlapData.active = active;
            overlap.active = active;
        }
    }
    
    /**
     * 清理物理系统
     */
    cleanup() {
        // 清理碰撞器
        this.colliders.forEach(colliderData => {
            if (colliderData.collider && colliderData.collider.destroy) {
                colliderData.collider.destroy();
            }
        });
        this.colliders = [];
        
        // 清理重叠检测
        this.overlaps.forEach(overlapData => {
            if (overlapData.overlap && overlapData.overlap.destroy) {
                overlapData.overlap.destroy();
            }
        });
        this.overlaps = [];
        
        // 清理触发器
        this.triggers.forEach(trigger => {
            if (trigger && trigger.destroy) {
                trigger.destroy();
            }
        });
        this.triggers.clear();
        this.triggerCallbacks.clear();
        
        // 清理碰撞组
        this.collisionGroups.forEach(group => {
            if (group && group.destroy) {
                group.destroy();
            }
        });
        this.collisionGroups.clear();
        
        Logger.info('🧹 物理系统清理完成');
    }
}

/**
 * 空间网格类 - 用于优化碰撞检测
 */
class SpatialGrid {
    constructor(cellSize) {
        this.cellSize = cellSize;
        this.grid = new Map();
    }
    
    /**
     * 清空网格
     */
    clear() {
        this.grid.clear();
    }
    
    /**
     * 插入对象
     */
    insert(object) {
        const bounds = object.getBounds ? object.getBounds() : {
            x: object.x - object.width / 2,
            y: object.y - object.height / 2,
            width: object.width,
            height: object.height
        };
        
        const startX = Math.floor(bounds.x / this.cellSize);
        const startY = Math.floor(bounds.y / this.cellSize);
        const endX = Math.floor((bounds.x + bounds.width) / this.cellSize);
        const endY = Math.floor((bounds.y + bounds.height) / this.cellSize);
        
        for (let y = startY; y <= endY; y++) {
            for (let x = startX; x <= endX; x++) {
                const key = `${x},${y}`;
                if (!this.grid.has(key)) {
                    this.grid.set(key, []);
                }
                this.grid.get(key).push(object);
            }
        }
    }
    
    /**
     * 获取附近的对象
     */
    getNearby(x, y, radius = 0) {
        const nearby = new Set();
        
        const startX = Math.floor((x - radius) / this.cellSize);
        const startY = Math.floor((y - radius) / this.cellSize);
        const endX = Math.floor((x + radius) / this.cellSize);
        const endY = Math.floor((y + radius) / this.cellSize);
        
        for (let cy = startY; cy <= endY; cy++) {
            for (let cx = startX; cx <= endX; cx++) {
                const key = `${cx},${cy}`;
                const objects = this.grid.get(key);
                if (objects) {
                    objects.forEach(obj => nearby.add(obj));
                }
            }
        }
        
        return Array.from(nearby);
    }
}
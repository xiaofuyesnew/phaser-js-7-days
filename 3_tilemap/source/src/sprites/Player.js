/**
 * Player - Day 3 玩家角色类
 * 
 * 这个类展示了与Tilemap和物理系统的深度集成：
 * - 高级物理属性管理
 * - 瓦片碰撞响应
 * - 环境交互系统
 * - 状态机和动画
 * 
 * 学习重点:
 * - 理解物理体的高级配置
 * - 掌握瓦片碰撞的处理
 * - 学会环境效果的实现
 * - 了解性能优化技巧
 */

import { PLAYER_CONFIG, TILE_TYPES, PHYSICS_CONFIG } from '../utils/constants.js';
import { Logger, MathUtils, PhysicsUtils } from '../utils/helpers.js';

export class Player extends Phaser.Physics.Arcade.Sprite {
    constructor(scene, x, y) {
        super(scene, x, y, 'player-idle');
        
        // 保存场景引用
        this.scene = scene;
        
        // 添加到场景
        scene.add.existing(this);
        scene.physics.add.existing(this);
        
        // 初始化属性
        this.initializeProperties();
        
        // 设置物理属性
        this.setupPhysics();
        
        // 创建动画
        this.createAnimations();
        
        // 初始化状态
        this.initializeState();
        
        Logger.info('👤 Day 3 玩家角色创建完成');
    }
    
    /**
     * 初始化玩家属性
     */
    initializeProperties() {
        // 基础移动属性
        this.speed = PLAYER_CONFIG.SPEED;
        this.jumpVelocity = PLAYER_CONFIG.JUMP_VELOCITY;
        this.maxFallSpeed = PLAYER_CONFIG.MAX_FALL_SPEED;
        
        // 高级移动属性
        this.acceleration = PLAYER_CONFIG.ACCELERATION;
        this.friction = PLAYER_CONFIG.FRICTION;
        this.airResistance = 0.98;
        
        // 状态属性
        this.isGrounded = false;
        this.isMoving = false;
        this.facingDirection = 1;
        this.currentState = 'idle';
        this.previousState = 'idle';
        
        // 能力属性
        this.canDoubleJump = PLAYER_CONFIG.DOUBLE_JUMP;
        this.doubleJumpUsed = false;
        this.canWallJump = PLAYER_CONFIG.WALL_JUMP;
        this.canDash = PLAYER_CONFIG.DASH;
        this.dashCooldown = 0;
        
        // 环境交互
        this.currentTileType = TILE_TYPES.AIR;
        this.inLiquid = false;
        this.liquidViscosity = 0;
        this.onIce = false;
        this.onConveyor = false;
        this.conveyorDirection = 0;
        
        // 输入缓冲
        this.inputBuffer = {
            jump: 0,
            dash: 0
        };
        
        // 土狼时间（离开地面后仍可跳跃的时间）
        this.coyoteTime = 0;
        
        // 健康和伤害
        this.health = 100;
        this.maxHealth = 100;
        this.invulnerable = false;
        this.invulnerabilityTime = 0;
        
        Logger.debug('🔧 玩家属性初始化完成');
    }    

    /**
     * 设置物理属性
     */
    setupPhysics() {
        // 设置碰撞体
        this.setCollideWorldBounds(true);
        this.setBounce(PLAYER_CONFIG.BOUNCE);
        this.setDrag(PLAYER_CONFIG.DRAG, 0);
        this.setMaxVelocity(this.speed, this.maxFallSpeed);
        
        // 设置碰撞体大小
        this.setSize(PLAYER_CONFIG.COLLISION_WIDTH, PLAYER_CONFIG.COLLISION_HEIGHT);
        this.setOffset(
            (this.width - PLAYER_CONFIG.COLLISION_WIDTH) / 2,
            this.height - PLAYER_CONFIG.COLLISION_HEIGHT
        );
        
        // 设置质量
        this.body.mass = PLAYER_CONFIG.MASS;
        
        Logger.debug('⚡ 玩家物理属性设置完成');
    }
    
    /**
     * 创建动画
     */
    createAnimations() {
        // 检查动画是否已存在
        if (this.scene.anims.exists('player-idle')) {
            return;
        }
        
        // 待机动画
        this.scene.anims.create({
            key: 'player-idle',
            frames: this.scene.anims.generateFrameNumbers('player-spritesheet', { 
                start: 0, end: 3 
            }),
            frameRate: 6,
            repeat: -1
        });
        
        // 行走动画
        this.scene.anims.create({
            key: 'player-walk',
            frames: this.scene.anims.generateFrameNumbers('player-spritesheet', { 
                start: 4, end: 11 
            }),
            frameRate: 12,
            repeat: -1
        });
        
        // 跑步动画
        this.scene.anims.create({
            key: 'player-run',
            frames: this.scene.anims.generateFrameNumbers('player-spritesheet', { 
                start: 12, end: 19 
            }),
            frameRate: 15,
            repeat: -1
        });
        
        // 跳跃动画
        this.scene.anims.create({
            key: 'player-jump',
            frames: this.scene.anims.generateFrameNumbers('player-spritesheet', { 
                start: 20, end: 23 
            }),
            frameRate: 10,
            repeat: 0
        });
        
        // 下落动画
        this.scene.anims.create({
            key: 'player-fall',
            frames: this.scene.anims.generateFrameNumbers('player-spritesheet', { 
                start: 24, end: 27 
            }),
            frameRate: 8,
            repeat: -1
        });
        
        // 着陆动画
        this.scene.anims.create({
            key: 'player-land',
            frames: this.scene.anims.generateFrameNumbers('player-spritesheet', { 
                start: 28, end: 31 
            }),
            frameRate: 15,
            repeat: 0
        });
        
        // 冲刺动画
        this.scene.anims.create({
            key: 'player-dash',
            frames: this.scene.anims.generateFrameNumbers('player-spritesheet', { 
                start: 32, end: 35 
            }),
            frameRate: 20,
            repeat: 0
        });
        
        // 受伤动画
        this.scene.anims.create({
            key: 'player-hurt',
            frames: this.scene.anims.generateFrameNumbers('player-spritesheet', { 
                start: 36, end: 39 
            }),
            frameRate: 12,
            repeat: 0
        });
        
        Logger.debug('🎬 玩家动画创建完成');
    } 
   
    /**
     * 初始化状态
     */
    initializeState() {
        this.play('player-idle');
        this.setScale(PLAYER_CONFIG.SCALE);
        this.setDepth(10);
    }
    
    /**
     * 更新玩家状态
     */
    update(cursors, deltaTime) {
        // 更新计时器
        this.updateTimers(deltaTime);
        
        // 检查地面状态
        this.checkGroundStatus();
        
        // 检查环境效果
        this.checkEnvironmentalEffects();
        
        // 处理输入
        this.handleInput(cursors, deltaTime);
        
        // 更新状态
        this.updateState();
        
        // 更新动画
        this.updateAnimation();
        
        // 应用环境效果
        this.applyEnvironmentalEffects(deltaTime);
        
        // 更新视觉效果
        this.updateVisualEffects();
    }
    
    /**
     * 更新计时器
     */
    updateTimers(deltaTime) {
        // 输入缓冲
        this.inputBuffer.jump = Math.max(0, this.inputBuffer.jump - deltaTime);
        this.inputBuffer.dash = Math.max(0, this.inputBuffer.dash - deltaTime);
        
        // 土狼时间
        this.coyoteTime = Math.max(0, this.coyoteTime - deltaTime);
        
        // 冲刺冷却
        this.dashCooldown = Math.max(0, this.dashCooldown - deltaTime);
        
        // 无敌时间
        this.invulnerabilityTime = Math.max(0, this.invulnerabilityTime - deltaTime);
        this.invulnerable = this.invulnerabilityTime > 0;
    }
    
    /**
     * 检查地面状态
     */
    checkGroundStatus() {
        const wasGrounded = this.isGrounded;
        this.isGrounded = PhysicsUtils.isGrounded(this.body);
        
        // 着陆检测
        if (!wasGrounded && this.isGrounded) {
            this.onLanding();
        }
        
        // 离开地面检测
        if (wasGrounded && !this.isGrounded) {
            this.onLeaveGround();
        }
        
        // 更新土狼时间
        if (this.isGrounded) {
            this.coyoteTime = PLAYER_CONFIG.COYOTE_TIME;
            this.doubleJumpUsed = false;
        }
    }
    
    /**
     * 检查环境效果
     */
    checkEnvironmentalEffects() {
        // 获取玩家脚下的瓦片
        const tileBelow = this.scene.groundLayer.getTileAtWorldXY(
            this.x, 
            this.y + this.height / 2 + 1
        );
        
        if (tileBelow) {
            this.currentTileType = tileBelow.index;
            const tileProperties = tileBelow.properties || {};
            
            // 检查液体
            this.inLiquid = tileProperties.liquid || false;
            this.liquidViscosity = tileProperties.viscosity || 0;
            
            // 检查冰面
            this.onIce = tileBelow.index === TILE_TYPES.ICE;
            
            // 检查传送带
            this.onConveyor = tileBelow.index === TILE_TYPES.CONVEYOR_LEFT || 
                             tileBelow.index === TILE_TYPES.CONVEYOR_RIGHT;
            this.conveyorDirection = tileBelow.index === TILE_TYPES.CONVEYOR_LEFT ? -1 : 
                                   tileBelow.index === TILE_TYPES.CONVEYOR_RIGHT ? 1 : 0;
        } else {
            this.currentTileType = TILE_TYPES.AIR;
            this.inLiquid = false;
            this.onIce = false;
            this.onConveyor = false;
            this.conveyorDirection = 0;
        }
    } 
   
    /**
     * 处理用户输入
     */
    handleInput(cursors, deltaTime) {
        // 水平移动
        this.handleHorizontalMovement(cursors, deltaTime);
        
        // 跳跃输入
        this.handleJumpInput(cursors);
        
        // 冲刺输入
        this.handleDashInput(cursors);
    }
    
    /**
     * 处理水平移动
     */
    handleHorizontalMovement(cursors, deltaTime) {
        let inputX = 0;
        
        if (cursors.left.isDown) {
            inputX = -1;
        } else if (cursors.right.isDown) {
            inputX = 1;
        }
        
        // 计算目标速度
        let targetVelocityX = inputX * this.speed;
        
        // 应用环境修正
        if (this.inLiquid) {
            targetVelocityX *= (1 - this.liquidViscosity * 0.5);
        }
        
        if (this.onIce) {
            // 冰面上减少控制力
            targetVelocityX *= 0.7;
        }
        
        // 应用加速度
        if (inputX !== 0) {
            const acceleration = this.isGrounded ? this.acceleration : this.acceleration * 0.6;
            const velocityChange = acceleration * deltaTime / 1000;
            
            if (Math.abs(this.body.velocity.x - targetVelocityX) > velocityChange) {
                const direction = targetVelocityX > this.body.velocity.x ? 1 : -1;
                this.body.velocity.x += direction * velocityChange;
            } else {
                this.body.velocity.x = targetVelocityX;
            }
            
            // 更新朝向
            this.facingDirection = inputX;
            this.setFlipX(inputX < 0);
            
            this.isMoving = true;
        } else {
            // 应用摩擦力
            if (this.isGrounded) {
                const friction = this.onIce ? this.friction * 0.1 : this.friction;
                const frictionForce = friction * deltaTime / 1000;
                
                if (Math.abs(this.body.velocity.x) > frictionForce) {
                    const direction = this.body.velocity.x > 0 ? -1 : 1;
                    this.body.velocity.x += direction * frictionForce;
                } else {
                    this.body.velocity.x = 0;
                }
            } else {
                // 空中阻力
                this.body.velocity.x *= this.airResistance;
            }
            
            this.isMoving = Math.abs(this.body.velocity.x) > 10;
        }
        
        // 应用传送带效果
        if (this.onConveyor && this.isGrounded) {
            this.body.velocity.x += this.conveyorDirection * 50 * deltaTime / 1000;
        }
    }
    
    /**
     * 处理跳跃输入
     */
    handleJumpInput(cursors) {
        // 检查跳跃输入
        if (cursors.up.isDown && !cursors.up.wasDown) {
            this.inputBuffer.jump = PLAYER_CONFIG.JUMP_BUFFER_TIME;
        }
        
        // 执行跳跃
        if (this.inputBuffer.jump > 0) {
            if (this.isGrounded || this.coyoteTime > 0) {
                // 普通跳跃
                this.jump();
                this.inputBuffer.jump = 0;
            } else if (this.canDoubleJump && !this.doubleJumpUsed) {
                // 二段跳
                this.doubleJump();
                this.inputBuffer.jump = 0;
            } else if (this.canWallJump && this.checkWallJump()) {
                // 墙跳
                this.wallJump();
                this.inputBuffer.jump = 0;
            }
        }
    }
    
    /**
     * 处理冲刺输入
     */
    handleDashInput(cursors) {
        if (cursors.shift && cursors.shift.isDown && !cursors.shift.wasDown) {
            this.inputBuffer.dash = PLAYER_CONFIG.JUMP_BUFFER_TIME;
        }
        
        if (this.inputBuffer.dash > 0 && this.canDash && this.dashCooldown <= 0) {
            this.dash();
            this.inputBuffer.dash = 0;
        }
    }
    
    /**
     * 跳跃
     */
    jump() {
        let jumpVelocity = this.jumpVelocity;
        
        // 液体中跳跃力减弱
        if (this.inLiquid) {
            jumpVelocity *= (1 - this.liquidViscosity * 0.3);
        }
        
        this.body.setVelocityY(jumpVelocity);
        this.coyoteTime = 0;
        
        // 播放跳跃效果
        this.playJumpEffect();
        
        Logger.debug('🦘 玩家跳跃');
    }
    
    /**
     * 二段跳
     */
    doubleJump() {
        this.body.setVelocityY(this.jumpVelocity * 0.8);
        this.doubleJumpUsed = true;
        
        // 播放二段跳效果
        this.playDoubleJumpEffect();
        
        Logger.debug('🦘🦘 玩家二段跳');
    }
    
    /**
     * 检查墙跳
     */
    checkWallJump() {
        // 检查左右两侧是否有墙
        const leftTile = this.scene.groundLayer.getTileAtWorldXY(
            this.x - this.width / 2 - 5, this.y
        );
        const rightTile = this.scene.groundLayer.getTileAtWorldXY(
            this.x + this.width / 2 + 5, this.y
        );
        
        return (leftTile && leftTile.collides) || (rightTile && rightTile.collides);
    }
    
    /**
     * 墙跳
     */
    wallJump() {
        // 检查墙的方向
        const leftTile = this.scene.groundLayer.getTileAtWorldXY(
            this.x - this.width / 2 - 5, this.y
        );
        const rightTile = this.scene.groundLayer.getTileAtWorldXY(
            this.x + this.width / 2 + 5, this.y
        );
        
        let wallDirection = 0;
        if (leftTile && leftTile.collides) wallDirection = 1;
        if (rightTile && rightTile.collides) wallDirection = -1;
        
        // 向远离墙的方向跳跃
        this.body.setVelocityY(this.jumpVelocity * 0.9);
        this.body.setVelocityX(wallDirection * this.speed * 0.8);
        
        // 播放墙跳效果
        this.playWallJumpEffect();
        
        Logger.debug('🧗 玩家墙跳');
    }
    
    /**
     * 冲刺
     */
    dash() {
        const dashVelocity = this.facingDirection * PLAYER_CONFIG.DASH_DISTANCE;
        this.body.setVelocityX(dashVelocity);
        
        // 设置冲刺冷却
        this.dashCooldown = PLAYER_CONFIG.DASH_COOLDOWN;
        
        // 播放冲刺效果
        this.playDashEffect();
        
        Logger.debug('💨 玩家冲刺');
    } 
   
    /**
     * 更新状态
     */
    updateState() {
        this.previousState = this.currentState;
        
        // 受伤状态优先级最高
        if (this.invulnerable && this.invulnerabilityTime > 500) {
            this.currentState = 'hurt';
            return;
        }
        
        // 冲刺状态
        if (this.dashCooldown > PLAYER_CONFIG.DASH_COOLDOWN - 200) {
            this.currentState = 'dash';
            return;
        }
        
        // 空中状态
        if (!this.isGrounded) {
            if (this.body.velocity.y < -50) {
                this.currentState = 'jump';
            } else if (this.body.velocity.y > 50) {
                this.currentState = 'fall';
            }
            return;
        }
        
        // 地面状态
        if (this.isMoving) {
            const speed = Math.abs(this.body.velocity.x);
            if (speed > this.speed * 0.7) {
                this.currentState = 'run';
            } else {
                this.currentState = 'walk';
            }
        } else {
            this.currentState = 'idle';
        }
    }
    
    /**
     * 更新动画
     */
    updateAnimation() {
        const animationKey = `player-${this.currentState}`;
        
        // 只在状态改变时切换动画
        if (this.currentState !== this.previousState) {
            if (this.scene.anims.exists(animationKey)) {
                this.play(animationKey);
            }
        }
        
        // 特殊动画处理
        if (this.currentState === 'land') {
            this.once('animationcomplete', () => {
                if (this.currentState === 'land') {
                    this.currentState = 'idle';
                }
            });
        }
    }
    
    /**
     * 应用环境效果
     */
    applyEnvironmentalEffects(deltaTime) {
        // 液体效果
        if (this.inLiquid) {
            // 浮力
            if (this.currentTileType === TILE_TYPES.WATER) {
                this.body.velocity.y -= PHYSICS_CONFIG.GRAVITY * 0.3 * deltaTime / 1000;
            }
            
            // 粘性阻力
            this.body.velocity.x *= (1 - this.liquidViscosity * 0.1);
            this.body.velocity.y *= (1 - this.liquidViscosity * 0.05);
            
            // 伤害（岩浆）
            if (this.currentTileType === TILE_TYPES.LAVA && !this.invulnerable) {
                this.takeDamage(10);
            }
        }
        
        // 冰面效果
        if (this.onIce && this.isGrounded) {
            // 降低摩擦力已在移动处理中实现
            
            // 创建冰滑效果
            if (Math.abs(this.body.velocity.x) > 50 && Math.random() < 0.1) {
                this.createIceSlideEffect();
            }
        }
    }
    
    /**
     * 更新视觉效果
     */
    updateVisualEffects() {
        // 无敌闪烁效果
        if (this.invulnerable) {
            this.alpha = Math.sin(this.scene.time.now * 0.02) * 0.5 + 0.5;
        } else {
            this.alpha = 1;
        }
        
        // 液体中的气泡效果
        if (this.inLiquid && Math.random() < 0.05) {
            this.createBubbleEffect();
        }
        
        // 传送带上的粒子效果
        if (this.onConveyor && this.isGrounded && Math.random() < 0.1) {
            this.createConveyorEffect();
        }
    }
    
    /**
     * 着陆事件
     */
    onLanding() {
        // 重置跳跃能力
        this.doubleJumpUsed = false;
        
        // 播放着陆动画
        if (this.body.velocity.y > 200) {
            this.currentState = 'land';
            this.playLandingEffect();
        }
        
        Logger.debug('🛬 玩家着陆');
    }
    
    /**
     * 离开地面事件
     */
    onLeaveGround() {
        // 开始土狼时间计时
        this.coyoteTime = PLAYER_CONFIG.COYOTE_TIME;
    }
    
    /**
     * 受到伤害
     */
    takeDamage(damage) {
        if (this.invulnerable) return;
        
        this.health -= damage;
        this.health = Math.max(0, this.health);
        
        // 设置无敌时间
        this.invulnerabilityTime = 1000;
        
        // 击退效果
        const knockbackForce = 150;
        this.body.setVelocityX(-this.facingDirection * knockbackForce);
        this.body.setVelocityY(-100);
        
        // 播放受伤效果
        this.playHurtEffect();
        
        // 检查死亡
        if (this.health <= 0) {
            this.die();
        }
        
        Logger.debug(`💔 玩家受到伤害: ${damage}, 剩余血量: ${this.health}`);
    }
    
    /**
     * 治疗
     */
    heal(amount) {
        this.health += amount;
        this.health = Math.min(this.maxHealth, this.health);
        
        // 播放治疗效果
        this.playHealEffect();
        
        Logger.debug(`💚 玩家恢复血量: ${amount}, 当前血量: ${this.health}`);
    }
    
    /**
     * 死亡
     */
    die() {
        this.currentState = 'dead';
        this.body.setVelocity(0, 0);
        
        // 播放死亡效果
        this.playDeathEffect();
        
        // 触发游戏结束事件
        this.scene.events.emit('player-died', this);
        
        Logger.info('💀 玩家死亡');
    }    
   
 /**
     * 播放跳跃效果
     */
    playJumpEffect() {
        if (this.scene.jumpParticles) {
            this.scene.jumpParticles.emitParticleAt(this.x, this.y + this.height / 2);
        }
        
        this.scene.cameras.main.shake(100, 0.005);
        this.scene.sound.play('jump-sound', { volume: 0.3 });
    }
    
    /**
     * 播放二段跳效果
     */
    playDoubleJumpEffect() {
        if (this.scene.doubleJumpParticles) {
            this.scene.doubleJumpParticles.emitParticleAt(this.x, this.y);
        }
        
        this.setTint(0x00ffff);
        this.scene.time.delayedCall(200, () => {
            this.clearTint();
        });
        
        this.scene.sound.play('double-jump-sound', { volume: 0.4 });
    }
    
    /**
     * 播放墙跳效果
     */
    playWallJumpEffect() {
        if (this.scene.wallJumpParticles) {
            this.scene.wallJumpParticles.emitParticleAt(this.x, this.y);
        }
        
        this.scene.sound.play('wall-jump-sound', { volume: 0.3 });
    }
    
    /**
     * 播放冲刺效果
     */
    playDashEffect() {
        this.createDashTrail();
        
        this.setTint(0xffff00);
        this.scene.time.delayedCall(300, () => {
            this.clearTint();
        });
        
        this.scene.sound.play('dash-sound', { volume: 0.4 });
    }
    
    /**
     * 播放着陆效果
     */
    playLandingEffect() {
        if (this.scene.landingParticles) {
            this.scene.landingParticles.emitParticleAt(this.x, this.y + this.height / 2);
        }
        
        this.scene.cameras.main.shake(150, 0.008);
        this.scene.sound.play('land-sound', { volume: 0.3 });
    }
    
    /**
     * 播放受伤效果
     */
    playHurtEffect() {
        if (this.scene.hurtParticles) {
            this.scene.hurtParticles.emitParticleAt(this.x, this.y);
        }
        
        this.setTint(0xff0000);
        this.scene.time.delayedCall(100, () => {
            this.clearTint();
        });
        
        this.scene.cameras.main.shake(300, 0.015);
        this.scene.sound.play('hurt-sound', { volume: 0.5 });
    }
    
    /**
     * 播放治疗效果
     */
    playHealEffect() {
        if (this.scene.healParticles) {
            this.scene.healParticles.emitParticleAt(this.x, this.y);
        }
        
        this.setTint(0x00ff00);
        this.scene.time.delayedCall(200, () => {
            this.clearTint();
        });
        
        this.scene.sound.play('heal-sound', { volume: 0.4 });
    }
    
    /**
     * 播放死亡效果
     */
    playDeathEffect() {
        if (this.scene.deathParticles) {
            this.scene.deathParticles.emitParticleAt(this.x, this.y);
        }
        
        this.scene.cameras.main.shake(500, 0.02);
        this.scene.sound.play('death-sound', { volume: 0.6 });
    }
    
    /**
     * 创建冲刺轨迹
     */
    createDashTrail() {
        const trail = this.scene.add.sprite(this.x, this.y, this.texture.key, this.frame.name);
        trail.setScale(this.scaleX, this.scaleY);
        trail.setFlipX(this.flipX);
        trail.setTint(0xffff00);
        trail.setAlpha(0.6);
        trail.setDepth(this.depth - 1);
        
        this.scene.tweens.add({
            targets: trail,
            alpha: 0,
            scaleX: trail.scaleX * 1.2,
            scaleY: trail.scaleY * 1.2,
            duration: 300,
            ease: 'Power2',
            onComplete: () => {
                trail.destroy();
            }
        });
    }
    
    /**
     * 创建冰滑效果
     */
    createIceSlideEffect() {
        const particle = this.scene.add.circle(
            this.x + MathUtils.randomInt(-10, 10),
            this.y + this.height / 2,
            MathUtils.randomInt(1, 3),
            0xb0e0e6,
            0.7
        );
        
        this.scene.tweens.add({
            targets: particle,
            alpha: 0,
            scale: 0,
            duration: 500,
            onComplete: () => {
                particle.destroy();
            }
        });
    }
    
    /**
     * 创建气泡效果
     */
    createBubbleEffect() {
        const bubble = this.scene.add.circle(
            this.x + MathUtils.randomInt(-5, 5),
            this.y + MathUtils.randomInt(-10, 10),
            MathUtils.randomInt(2, 4),
            0x87ceeb,
            0.6
        );
        
        this.scene.tweens.add({
            targets: bubble,
            y: bubble.y - 30,
            alpha: 0,
            duration: 1000,
            onComplete: () => {
                bubble.destroy();
            }
        });
    }
    
    /**
     * 创建传送带效果
     */
    createConveyorEffect() {
        const particle = this.scene.add.circle(
            this.x + MathUtils.randomInt(-10, 10),
            this.y + this.height / 2,
            1,
            0xffffff,
            0.8
        );
        
        this.scene.tweens.add({
            targets: particle,
            x: particle.x + this.conveyorDirection * 20,
            alpha: 0,
            duration: 300,
            onComplete: () => {
                particle.destroy();
            }
        });
    }
    
    /**
     * 获取玩家状态信息
     */
    getStatusInfo() {
        return {
            position: { x: Math.round(this.x), y: Math.round(this.y) },
            velocity: { 
                x: Math.round(this.body.velocity.x), 
                y: Math.round(this.body.velocity.y) 
            },
            state: this.currentState,
            health: this.health,
            isGrounded: this.isGrounded,
            canDoubleJump: this.canDoubleJump && !this.doubleJumpUsed,
            dashCooldown: Math.round(this.dashCooldown),
            currentTile: this.currentTileType,
            inLiquid: this.inLiquid,
            onIce: this.onIce,
            onConveyor: this.onConveyor,
            invulnerable: this.invulnerable
        };
    }
    
    /**
     * 重置玩家状态
     */
    reset(x, y) {
        // 重置位置
        this.setPosition(x, y);
        
        // 重置速度
        this.body.setVelocity(0, 0);
        
        // 重置状态
        this.currentState = 'idle';
        this.previousState = 'idle';
        this.isGrounded = false;
        this.isMoving = false;
        this.facingDirection = 1;
        
        // 重置能力
        this.doubleJumpUsed = false;
        this.dashCooldown = 0;
        this.coyoteTime = 0;
        
        // 重置健康
        this.health = this.maxHealth;
        this.invulnerable = false;
        this.invulnerabilityTime = 0;
        
        // 重置环境状态
        this.currentTileType = TILE_TYPES.AIR;
        this.inLiquid = false;
        this.onIce = false;
        this.onConveyor = false;
        
        // 重置视觉
        this.clearTint();
        this.setAlpha(1);
        this.setFlipX(false);
        this.play('player-idle');
        
        Logger.info('🔄 玩家状态已重置');
    }
    
    /**
     * 销毁玩家对象
     */
    destroy() {
        // 清理效果
        this.scene.tweens.killTweensOf(this);
        
        // 调用父类销毁方法
        super.destroy();
        
        Logger.info('💀 玩家对象已销毁');
    }
}
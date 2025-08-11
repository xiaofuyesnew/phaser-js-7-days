/**
 * Player - 玩家角色类
 * 
 * 这个类展示了Phaser.js精灵系统的核心功能：
 * - 精灵创建和管理
 * - 动画系统的使用
 * - 用户输入处理
 * - 状态管理和切换
 * 
 * 学习重点:
 * - 理解精灵的生命周期
 * - 掌握动画的创建和播放
 * - 学会状态机的实现
 * - 了解性能优化技巧
 */

import { PLAYER_CONFIG, ANIMATION_CONFIG } from '../utils/constants.js';
import { Logger, MathUtils } from '../utils/helpers.js';

export class Player extends Phaser.Physics.Arcade.Sprite {
    constructor(scene, x, y) {
        // 调用父类构造函数
        super(scene, x, y, 'player-idle');
        
        // 保存场景引用
        this.scene = scene;
        
        // 添加到场景
        scene.add.existing(this);
        scene.physics.add.existing(this);
        
        // 初始化玩家属性
        this.initializeProperties();
        
        // 设置物理属性
        this.setupPhysics();
        
        // 创建动画
        this.createAnimations();
        
        // 初始化状态
        this.initializeState();
        
        Logger.info('👤 玩家角色创建完成');
    }
    
    /**
     * 初始化玩家属性
     */
    initializeProperties() {
        // 移动属性
        this.speed = PLAYER_CONFIG.SPEED;
        this.jumpVelocity = PLAYER_CONFIG.JUMP_VELOCITY;
        this.acceleration = PLAYER_CONFIG.ACCELERATION;
        this.friction = PLAYER_CONFIG.FRICTION;
        
        // 状态属性
        this.isGrounded = false;
        this.isMoving = false;
        this.facingDirection = 1; // 1: 右, -1: 左
        this.currentState = 'idle';
        this.previousState = 'idle';
        
        // 能力属性
        this.canDoubleJump = true;
        this.doubleJumpUsed = false;
        this.dashCooldown = 0;
        this.dashDistance = PLAYER_CONFIG.DASH_DISTANCE;
        
        // 视觉效果
        this.trailParticles = [];
        this.landingDust = null;
        
        // 输入缓冲
        this.inputBuffer = {
            jump: 0,
            dash: 0
        };
    }
    
    /**
     * 设置物理属性
     */
    setupPhysics() {
        // 设置碰撞体
        this.setCollideWorldBounds(true);
        this.setBounce(0.1);
        this.setDragX(this.friction);
        
        // 设置碰撞体大小
        this.setSize(PLAYER_CONFIG.COLLISION_WIDTH, PLAYER_CONFIG.COLLISION_HEIGHT);
        this.setOffset(
            (this.width - PLAYER_CONFIG.COLLISION_WIDTH) / 2,
            this.height - PLAYER_CONFIG.COLLISION_HEIGHT
        );
        
        // 设置最大速度
        this.setMaxVelocity(this.speed, PLAYER_CONFIG.MAX_FALL_SPEED);
    }
    
    /**
     * 创建所有动画
     */
    createAnimations() {
        // 检查动画是否已存在，避免重复创建
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
        
        Logger.info('🎬 玩家动画创建完成');
    }
    
    /**
     * 初始化状态
     */
    initializeState() {
        // 播放初始动画
        this.play('player-idle');
        
        // 设置初始缩放
        this.setScale(PLAYER_CONFIG.SCALE);
        
        // 设置深度
        this.setDepth(10);
    }
    
    /**
     * 更新玩家状态
     * @param {Object} cursors - 键盘输入对象
     * @param {number} deltaTime - 帧时间间隔
     */
    update(cursors, deltaTime) {
        // 更新输入缓冲
        this.updateInputBuffer(deltaTime);
        
        // 更新冷却时间
        this.updateCooldowns(deltaTime);
        
        // 检查地面状态
        this.checkGroundStatus();
        
        // 处理输入
        this.handleInput(cursors);
        
        // 更新状态
        this.updateState();
        
        // 更新动画
        this.updateAnimation();
        
        // 更新视觉效果
        this.updateVisualEffects();
    }
    
    /**
     * 更新输入缓冲
     */
    updateInputBuffer(deltaTime) {
        // 减少缓冲时间
        this.inputBuffer.jump = Math.max(0, this.inputBuffer.jump - deltaTime);
        this.inputBuffer.dash = Math.max(0, this.inputBuffer.dash - deltaTime);
    }
    
    /**
     * 更新冷却时间
     */
    updateCooldowns(deltaTime) {
        this.dashCooldown = Math.max(0, this.dashCooldown - deltaTime);
    }
    
    /**
     * 检查地面状态
     */
    checkGroundStatus() {
        const wasGrounded = this.isGrounded;
        this.isGrounded = this.body.touching.down || this.body.blocked.down;
        
        // 着陆检测
        if (!wasGrounded && this.isGrounded) {
            this.onLanding();
        }
        
        // 离开地面检测
        if (wasGrounded && !this.isGrounded) {
            this.onLeaveGround();
        }
    }
    
    /**
     * 处理用户输入
     */
    handleInput(cursors) {
        // 水平移动
        this.handleHorizontalMovement(cursors);
        
        // 跳跃输入
        this.handleJumpInput(cursors);
        
        // 冲刺输入
        this.handleDashInput(cursors);
        
        // 特殊技能输入
        this.handleSpecialInput(cursors);
    }
    
    /**
     * 处理水平移动
     */
    handleHorizontalMovement(cursors) {
        let inputX = 0;
        
        // 检查输入
        if (cursors.left.isDown) {
            inputX = -1;
        } else if (cursors.right.isDown) {
            inputX = 1;
        }
        
        // 应用移动
        if (inputX !== 0) {
            // 设置速度
            const targetVelocity = inputX * this.speed;
            this.setVelocityX(targetVelocity);
            
            // 更新朝向
            this.facingDirection = inputX;
            this.setFlipX(inputX < 0);
            
            this.isMoving = true;
        } else {
            // 应用摩擦力
            if (this.isGrounded) {
                this.setVelocityX(this.body.velocity.x * 0.8);
            }
            
            this.isMoving = Math.abs(this.body.velocity.x) > 10;
        }
    }
    
    /**
     * 处理跳跃输入
     */
    handleJumpInput(cursors) {
        // 检查跳跃输入
        if (cursors.up.isDown && !cursors.up.wasDown) {
            this.inputBuffer.jump = PLAYER_CONFIG.INPUT_BUFFER_TIME;
        }
        
        // 执行跳跃
        if (this.inputBuffer.jump > 0) {
            if (this.isGrounded) {
                // 普通跳跃
                this.jump();
                this.inputBuffer.jump = 0;
            } else if (this.canDoubleJump && !this.doubleJumpUsed) {
                // 二段跳
                this.doubleJump();
                this.inputBuffer.jump = 0;
            }
        }
    }
    
    /**
     * 处理冲刺输入
     */
    handleDashInput(cursors) {
        // 检查冲刺输入 (Shift键)
        if (cursors.shift && cursors.shift.isDown && !cursors.shift.wasDown) {
            this.inputBuffer.dash = PLAYER_CONFIG.INPUT_BUFFER_TIME;
        }
        
        // 执行冲刺
        if (this.inputBuffer.dash > 0 && this.dashCooldown <= 0) {
            this.dash();
            this.inputBuffer.dash = 0;
        }
    }
    
    /**
     * 处理特殊技能输入
     */
    handleSpecialInput(cursors) {
        // 这里可以添加其他特殊技能的输入处理
        // 例如：攻击、防御、技能释放等
    }
    
    /**
     * 跳跃
     */
    jump() {
        this.setVelocityY(this.jumpVelocity);
        this.doubleJumpUsed = false;
        this.canDoubleJump = true;
        
        // 播放跳跃音效
        this.playJumpEffect();
        
        Logger.debug('🦘 玩家跳跃');
    }
    
    /**
     * 二段跳
     */
    doubleJump() {
        this.setVelocityY(this.jumpVelocity * 0.8);
        this.doubleJumpUsed = true;
        this.canDoubleJump = false;
        
        // 播放二段跳特效
        this.playDoubleJumpEffect();
        
        Logger.debug('🦘🦘 玩家二段跳');
    }
    
    /**
     * 冲刺
     */
    dash() {
        const dashVelocity = this.facingDirection * this.dashDistance;
        this.setVelocityX(dashVelocity);
        
        // 设置冲刺冷却
        this.dashCooldown = PLAYER_CONFIG.DASH_COOLDOWN;
        
        // 播放冲刺特效
        this.playDashEffect();
        
        Logger.debug('💨 玩家冲刺');
    }
    
    /**
     * 更新状态
     */
    updateState() {
        this.previousState = this.currentState;
        
        // 状态判断逻辑
        if (!this.isGrounded) {
            if (this.body.velocity.y < -50) {
                this.currentState = 'jump';
            } else if (this.body.velocity.y > 50) {
                this.currentState = 'fall';
            }
        } else {
            if (this.isMoving) {
                // 根据速度判断是走路还是跑步
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
        
        // 特殊状态检查
        if (this.dashCooldown > PLAYER_CONFIG.DASH_COOLDOWN - 200) {
            this.currentState = 'dash';
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
            // 着陆动画播放完后切换到待机
            this.once('animationcomplete', () => {
                if (this.currentState === 'land') {
                    this.currentState = 'idle';
                }
            });
        }
    }
    
    /**
     * 更新视觉效果
     */
    updateVisualEffects() {
        // 更新拖尾效果
        this.updateTrailEffect();
        
        // 更新着陆尘土效果
        this.updateLandingDust();
    }
    
    /**
     * 着陆事件
     */
    onLanding() {
        // 重置跳跃能力
        this.canDoubleJump = true;
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
        // 如果不是主动跳跃，则不能二段跳
        if (this.currentState !== 'jump') {
            this.canDoubleJump = false;
        }
    }
    
    /**
     * 播放跳跃特效
     */
    playJumpEffect() {
        // 创建跳跃粒子效果
        if (this.scene.jumpParticles) {
            this.scene.jumpParticles.emitParticleAt(this.x, this.y + this.height / 2);
        }
        
        // 屏幕轻微震动
        this.scene.cameras.main.shake(100, 0.005);
    }
    
    /**
     * 播放二段跳特效
     */
    playDoubleJumpEffect() {
        // 创建更强烈的粒子效果
        if (this.scene.doubleJumpParticles) {
            this.scene.doubleJumpParticles.emitParticleAt(this.x, this.y);
        }
        
        // 角色闪烁效果
        this.setTint(0x00ffff);
        this.scene.time.delayedCall(200, () => {
            this.clearTint();
        });
    }
    
    /**
     * 播放冲刺特效
     */
    playDashEffect() {
        // 创建冲刺轨迹
        this.createDashTrail();
        
        // 角色变色
        this.setTint(0xffff00);
        this.scene.time.delayedCall(300, () => {
            this.clearTint();
        });
    }
    
    /**
     * 播放着陆特效
     */
    playLandingEffect() {
        // 创建着陆尘土
        if (this.scene.landingParticles) {
            this.scene.landingParticles.emitParticleAt(this.x, this.y + this.height / 2);
        }
        
        // 轻微的屏幕震动
        this.scene.cameras.main.shake(150, 0.008);
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
        
        // 轨迹淡出
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
     * 更新拖尾效果
     */
    updateTrailEffect() {
        // 如果在冲刺状态，创建拖尾
        if (this.currentState === 'dash' && Math.random() < 0.3) {
            this.createTrailParticle();
        }
    }
    
    /**
     * 创建拖尾粒子
     */
    createTrailParticle() {
        const particle = this.scene.add.circle(
            this.x + MathUtils.randomInt(-10, 10),
            this.y + MathUtils.randomInt(-10, 10),
            MathUtils.randomInt(2, 5),
            0xffff00,
            0.6
        );
        
        this.scene.tweens.add({
            targets: particle,
            alpha: 0,
            scale: 0,
            duration: 200,
            onComplete: () => {
                particle.destroy();
            }
        });
    }
    
    /**
     * 更新着陆尘土效果
     */
    updateLandingDust() {
        // 这里可以添加持续的尘土效果更新逻辑
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
            isGrounded: this.isGrounded,
            canDoubleJump: this.canDoubleJump,
            dashCooldown: Math.round(this.dashCooldown)
        };
    }
    
    /**
     * 重置玩家状态
     */
    reset(x, y) {
        // 重置位置
        this.setPosition(x, y);
        
        // 重置速度
        this.setVelocity(0, 0);
        
        // 重置状态
        this.currentState = 'idle';
        this.previousState = 'idle';
        this.isGrounded = false;
        this.isMoving = false;
        this.facingDirection = 1;
        
        // 重置能力
        this.canDoubleJump = true;
        this.doubleJumpUsed = false;
        this.dashCooldown = 0;
        
        // 重置视觉
        this.clearTint();
        this.setFlipX(false);
        this.play('player-idle');
        
        Logger.info('🔄 玩家状态已重置');
    }
    
    /**
     * 销毁玩家对象
     */
    destroy() {
        // 清理粒子效果
        this.trailParticles.forEach(particle => {
            if (particle && particle.destroy) {
                particle.destroy();
            }
        });
        
        // 调用父类销毁方法
        super.destroy();
        
        Logger.info('💀 玩家对象已销毁');
    }
}
/**
 * 玩家精灵类
 */
export class Player extends Phaser.Physics.Arcade.Sprite {
    constructor(scene, x, y) {
        super(scene, x, y, 'player');
        
        // 添加到场景
        scene.add.existing(this);
        scene.physics.add.existing(this);
        
        // 设置玩家外观
        this.setTint(0x00ff00);
        this.setScale(20, 30);
        
        // 玩家属性
        this.health = 100;
        this.maxHealth = 100;
        this.speed = 200;
        this.jumpPower = 400;
        this.isGrounded = false;
        this.canDoubleJump = true;
        this.hasDoubleJumped = false;
        
        // 动画状态
        this.isMoving = false;
        this.facingDirection = 1; // 1 = right, -1 = left
        
        // 特殊能力
        this.invulnerable = false;
        this.invulnerabilityTime = 0;
        
        // 粒子效果
        this.dustParticles = null;
        this.createParticleEffects();
        
        // 设置物理属性
        this.setupPhysics();
    }
    
    /**
     * 设置物理属性
     */
    setupPhysics() {
        this.setCollideWorldBounds(true);
        this.setBounce(0.1);
        this.setDrag(500, 0);
        this.setMaxVelocity(300, 600);
        
        // 设置碰撞体
        this.body.setSize(this.width * 0.8, this.height * 0.9);
        this.body.setOffset(this.width * 0.1, this.height * 0.1);
    }
    
    /**
     * 创建粒子效果
     */
    createParticleEffects() {
        // 创建尘土粒子效果
        this.dustParticles = this.scene.add.particles(this.x, this.y + this.height/2, 'player', {
            scale: { start: 0.3, end: 0 },
            alpha: { start: 0.6, end: 0 },
            tint: 0x8B4513,
            lifespan: 300,
            speed: { min: 20, max: 50 },
            angle: { min: 60, max: 120 },
            frequency: 50,
            on: false
        });
    }
    
    /**
     * 更新玩家状态
     */
    update() {
        // 检查是否在地面上
        this.checkGrounded();
        
        // 更新无敌状态
        this.updateInvulnerability();
        
        // 更新粒子效果位置
        this.updateParticleEffects();
        
        // 更新动画状态
        this.updateAnimationState();
    }
    
    /**
     * 检查是否在地面上
     */
    checkGrounded() {
        const wasGrounded = this.isGrounded;
        this.isGrounded = this.body.touching.down || this.body.blocked.down;
        
        // 如果刚着地，重置双跳
        if (!wasGrounded && this.isGrounded) {
            this.hasDoubleJumped = false;
            this.onLanded();
        }
    }
    
    /**
     * 着地时的处理
     */
    onLanded() {
        // 着地粒子效果
        this.createLandingEffect();
        
        // 着地音效
        if (this.scene.events) {
            this.scene.events.emit('playerLanded');
        }
    }
    
    /**
     * 创建着地效果
     */
    createLandingEffect() {
        if (this.dustParticles) {
            this.dustParticles.explode(5, this.x, this.y + this.height/2);
        }
    }
    
    /**
     * 更新无敌状态
     */
    updateInvulnerability() {
        if (this.invulnerable) {
            this.invulnerabilityTime -= this.scene.game.loop.delta;
            
            // 闪烁效果
            this.setAlpha(Math.sin(this.invulnerabilityTime * 0.02) * 0.5 + 0.5);
            
            if (this.invulnerabilityTime <= 0) {
                this.invulnerable = false;
                this.setAlpha(1);
            }
        }
    }
    
    /**
     * 更新粒子效果
     */
    updateParticleEffects() {
        if (this.dustParticles) {
            this.dustParticles.setPosition(this.x, this.y + this.height/2);
            
            // 移动时产生尘土
            if (this.isMoving && this.isGrounded && Math.abs(this.body.velocity.x) > 50) {
                this.dustParticles.start();
            } else {
                this.dustParticles.stop();
            }
        }
    }
    
    /**
     * 更新动画状态
     */
    updateAnimationState() {
        // 根据移动方向翻转精灵
        if (this.body.velocity.x > 0) {
            this.facingDirection = 1;
            this.setFlipX(false);
        } else if (this.body.velocity.x < 0) {
            this.facingDirection = -1;
            this.setFlipX(true);
        }
        
        // 更新移动状态
        this.isMoving = Math.abs(this.body.velocity.x) > 10;
        
        // 根据状态改变颜色
        if (!this.isGrounded) {
            this.setTint(0x00ccff); // 跳跃时蓝色
        } else if (this.isMoving) {
            this.setTint(0x00ff00); // 移动时绿色
        } else {
            this.setTint(0x00aa00); // 静止时深绿色
        }
    }
    
    /**
     * 向左移动
     */
    moveLeft() {
        this.setVelocityX(-this.speed);
    }
    
    /**
     * 向右移动
     */
    moveRight() {
        this.setVelocityX(this.speed);
    }
    
    /**
     * 停止水平移动
     */
    stopMoving() {
        this.setVelocityX(0);
    }
    
    /**
     * 跳跃
     */
    jump() {
        if (this.isGrounded) {
            // 普通跳跃
            this.setVelocityY(-this.jumpPower);
            this.createJumpEffect();
            
            if (this.scene.events) {
                this.scene.events.emit('playerJump');
            }
            
            return true;
        } else if (this.canDoubleJump && !this.hasDoubleJumped) {
            // 二段跳
            this.setVelocityY(-this.jumpPower * 0.8);
            this.hasDoubleJumped = true;
            this.createDoubleJumpEffect();
            
            if (this.scene.events) {
                this.scene.events.emit('playerDoubleJump');
            }
            
            return true;
        }
        
        return false;
    }
    
    /**
     * 创建跳跃效果
     */
    createJumpEffect() {
        if (this.dustParticles) {
            this.dustParticles.explode(8, this.x, this.y + this.height/2);
        }
        
        // 跳跃时的缩放效果
        this.scene.tweens.add({
            targets: this,
            scaleX: this.scaleX * 1.2,
            scaleY: this.scaleY * 0.8,
            duration: 100,
            yoyo: true,
            ease: 'Power2'
        });
    }
    
    /**
     * 创建二段跳效果
     */
    createDoubleJumpEffect() {
        // 二段跳的特殊效果
        const effect = this.scene.add.circle(this.x, this.y, 30, 0x00ffff, 0.5);
        
        this.scene.tweens.add({
            targets: effect,
            scaleX: 2,
            scaleY: 2,
            alpha: 0,
            duration: 300,
            ease: 'Power2',
            onComplete: () => {
                effect.destroy();
            }
        });
    }
    
    /**
     * 受到伤害
     * @param {number} damage - 伤害值
     */
    takeDamage(damage) {
        if (this.invulnerable) {
            return false;
        }
        
        this.health = Math.max(0, this.health - damage);
        
        // 设置无敌时间
        this.invulnerable = true;
        this.invulnerabilityTime = 1500; // 1.5秒无敌
        
        // 受伤效果
        this.createHurtEffect();
        
        // 触发受伤事件
        if (this.scene.events) {
            this.scene.events.emit('playerHurt', damage);
        }
        
        // 检查是否死亡
        if (this.health <= 0) {
            this.die();
        }
        
        return true;
    }
    
    /**
     * 创建受伤效果
     */
    createHurtEffect() {
        // 屏幕震动
        if (this.scene.cameras && this.scene.cameras.main) {
            this.scene.cameras.main.shake(200, 0.02);
        }
        
        // 受伤时的红色闪光
        this.setTint(0xff0000);
        this.scene.time.delayedCall(100, () => {
            this.clearTint();
        });
        
        // 击退效果
        const knockbackX = this.facingDirection * -100;
        const knockbackY = -50;
        this.setVelocity(knockbackX, knockbackY);
    }
    
    /**
     * 恢复生命值
     * @param {number} amount - 恢复量
     */
    heal(amount) {
        const oldHealth = this.health;
        this.health = Math.min(this.maxHealth, this.health + amount);
        
        if (this.health > oldHealth) {
            this.createHealEffect();
            
            if (this.scene.events) {
                this.scene.events.emit('playerHealed', amount);
            }
        }
    }
    
    /**
     * 创建治疗效果
     */
    createHealEffect() {
        // 治疗光效
        const healEffect = this.scene.add.circle(this.x, this.y, 20, 0x00ff00, 0.6);
        
        this.scene.tweens.add({
            targets: healEffect,
            scaleX: 2,
            scaleY: 2,
            alpha: 0,
            duration: 500,
            ease: 'Power2',
            onComplete: () => {
                healEffect.destroy();
            }
        });
        
        // 治疗粒子
        if (this.dustParticles) {
            const originalConfig = this.dustParticles.config;
            this.dustParticles.setConfig({
                ...originalConfig,
                tint: 0x00ff00,
                lifespan: 800,
                speed: { min: 10, max: 30 },
                angle: { min: 0, max: 360 }
            });
            
            this.dustParticles.explode(10, this.x, this.y);
            
            // 恢复原始配置
            this.scene.time.delayedCall(100, () => {
                this.dustParticles.setConfig(originalConfig);
            });
        }
    }
    
    /**
     * 玩家死亡
     */
    die() {
        // 死亡效果
        this.createDeathEffect();
        
        // 触发死亡事件
        if (this.scene.events) {
            this.scene.events.emit('playerDied');
        }
        
        // 禁用物理和输入
        this.body.setEnable(false);
        
        // 死亡动画
        this.scene.tweens.add({
            targets: this,
            alpha: 0,
            scaleX: 0,
            scaleY: 0,
            rotation: Math.PI * 2,
            duration: 1000,
            ease: 'Power2',
            onComplete: () => {
                // 重生或游戏结束
                this.respawn();
            }
        });
    }
    
    /**
     * 创建死亡效果
     */
    createDeathEffect() {
        // 死亡爆炸效果
        if (this.dustParticles) {
            this.dustParticles.setConfig({
                scale: { start: 0.5, end: 0 },
                alpha: { start: 1, end: 0 },
                tint: 0xff0000,
                lifespan: 1000,
                speed: { min: 50, max: 150 },
                angle: { min: 0, max: 360 },
                frequency: 20
            });
            
            this.dustParticles.explode(20, this.x, this.y);
        }
    }
    
    /**
     * 重生
     */
    respawn() {
        // 重置属性
        this.health = this.maxHealth;
        this.invulnerable = false;
        this.invulnerabilityTime = 0;
        this.hasDoubleJumped = false;
        
        // 重置外观
        this.setAlpha(1);
        this.setScale(20, 30);
        this.setRotation(0);
        this.clearTint();
        
        // 重新启用物理
        this.body.setEnable(true);
        
        // 重生位置
        this.setPosition(100, this.scene.cameras.main.height - 150);
        this.setVelocity(0, 0);
        
        // 重生效果
        this.createRespawnEffect();
        
        // 触发重生事件
        if (this.scene.events) {
            this.scene.events.emit('playerRespawned');
        }
    }
    
    /**
     * 创建重生效果
     */
    createRespawnEffect() {
        // 重生光环
        const respawnRing = this.scene.add.circle(this.x, this.y, 10, 0xffffff, 0);
        respawnRing.setStrokeStyle(3, 0x00ff00);
        
        this.scene.tweens.add({
            targets: respawnRing,
            scaleX: 3,
            scaleY: 3,
            alpha: 0,
            duration: 800,
            ease: 'Power2',
            onComplete: () => {
                respawnRing.destroy();
            }
        });
        
        // 短暂无敌
        this.invulnerable = true;
        this.invulnerabilityTime = 2000;
    }
    
    /**
     * 销毁玩家
     */
    destroy() {
        if (this.dustParticles) {
            this.dustParticles.destroy();
        }
        
        super.destroy();
    }
}
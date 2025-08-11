export class Player extends Phaser.Physics.Arcade.Sprite {
    constructor(scene, x, y) {
        super(scene, x, y, 'player')
        
        // 添加到场景
        scene.add.existing(this)
        scene.physics.add.existing(this)
        
        // 玩家属性
        this.speed = 200
        this.jumpPower = 400
        this.isGrounded = false
        this.canDoubleJump = false
        this.hasDoubleJumped = false
        
        // 移动状态
        this.isMoving = false
        this.facingDirection = 1 // 1 = 右, -1 = 左
        
        // 动画状态
        this.currentAnimation = 'idle'
        
        // 粒子效果
        this.dustParticles = null
        this.jumpParticles = null
        
        // 初始化
        this.init()
    }
    
    init() {
        // 设置物理属性
        this.setCollideWorldBounds(true)
        this.setBounce(0.1)
        this.setDrag(800, 0)
        
        // 创建粒子效果
        this.createParticleEffects()
        
        // 创建动画
        this.createAnimations()
    }
    
    createParticleEffects() {
        // 跑步尘土效果
        this.dustParticles = this.scene.add.particles(this.x, this.y + 20, 'platform', {
            scale: { start: 0.1, end: 0 },
            alpha: { start: 0.3, end: 0 },
            speed: { min: 20, max: 40 },
            lifespan: 300,
            quantity: 2,
            frequency: 100,
            emitting: false,
            tint: 0x8B4513
        })
        
        // 跳跃粒子效果
        this.jumpParticles = this.scene.add.particles(this.x, this.y + 20, 'platform', {
            scale: { start: 0.15, end: 0 },
            alpha: { start: 0.5, end: 0 },
            speed: { min: 50, max: 100 },
            lifespan: 500,
            quantity: 8,
            emitting: false,
            tint: 0x3498db
        })
    }
    
    createAnimations() {
        // 由于我们使用的是简单的矩形纹理，这里创建简单的缩放动画来模拟动作
        
        // 空闲动画
        this.idleTween = this.scene.tweens.add({
            targets: this,
            scaleY: { from: 1, to: 1.05 },
            duration: 1000,
            yoyo: true,
            repeat: -1,
            ease: 'Sine.easeInOut',
            paused: true
        })
        
        // 跑步动画
        this.runTween = this.scene.tweens.add({
            targets: this,
            scaleX: { from: 1, to: 1.1 },
            scaleY: { from: 1, to: 0.9 },
            duration: 150,
            yoyo: true,
            repeat: -1,
            ease: 'Power2',
            paused: true
        })
        
        // 跳跃动画
        this.jumpTween = this.scene.tweens.add({
            targets: this,
            scaleX: { from: 1, to: 0.8 },
            scaleY: { from: 1, to: 1.2 },
            duration: 200,
            yoyo: true,
            ease: 'Back.easeOut',
            paused: true
        })
    }
    
    update(cursors, keys) {
        // 检查是否在地面上
        this.checkGrounded()
        
        // 处理水平移动
        this.handleHorizontalMovement(cursors, keys)
        
        // 处理跳跃
        this.handleJumping(cursors, keys)
        
        // 更新动画
        this.updateAnimations()
        
        // 更新粒子效果位置
        this.updateParticleEffects()
        
        // 更新朝向
        this.updateFacing()
    }
    
    checkGrounded() {
        // 简单的地面检测
        this.isGrounded = this.body.touching.down
        
        if (this.isGrounded) {
            this.canDoubleJump = true
            this.hasDoubleJumped = false
        }
    }
    
    handleHorizontalMovement(cursors, keys) {
        let velocityX = 0
        
        // 检查左右移动输入
        if (cursors.left.isDown || keys.A.isDown) {
            velocityX = -this.speed
            this.facingDirection = -1
            this.isMoving = true
        } else if (cursors.right.isDown || keys.D.isDown) {
            velocityX = this.speed
            this.facingDirection = 1
            this.isMoving = true
        } else {
            this.isMoving = false
        }
        
        // 应用水平速度
        this.setVelocityX(velocityX)
        
        // 控制跑步粒子效果
        if (this.isMoving && this.isGrounded) {
            this.dustParticles.start()
        } else {
            this.dustParticles.stop()
        }
    }
    
    handleJumping(cursors, keys) {
        const jumpPressed = Phaser.Input.Keyboard.JustDown(cursors.up) || 
                           Phaser.Input.Keyboard.JustDown(keys.W) ||
                           Phaser.Input.Keyboard.JustDown(keys.SPACE)
        
        if (jumpPressed) {
            if (this.isGrounded) {
                // 普通跳跃
                this.jump()
            } else if (this.canDoubleJump && !this.hasDoubleJumped) {
                // 二段跳
                this.doubleJump()
            }
        }
    }
    
    jump() {
        this.setVelocityY(-this.jumpPower)
        this.isGrounded = false
        
        // 播放跳跃动画
        this.playJumpAnimation()
        
        // 触发跳跃粒子效果
        this.jumpParticles.emitParticleAt(this.x, this.y + 20)
        
        // 播放跳跃音效（如果有的话）
        // this.scene.sound.play('jump')
    }
    
    doubleJump() {
        this.setVelocityY(-this.jumpPower * 0.8)
        this.hasDoubleJumped = true
        this.canDoubleJump = false
        
        // 播放二段跳动画
        this.playJumpAnimation()
        
        // 触发更强的粒子效果
        this.jumpParticles.emitParticleAt(this.x, this.y + 20, 12)
        
        // 添加旋转效果
        this.scene.tweens.add({
            targets: this,
            rotation: this.rotation + Math.PI * 2,
            duration: 400,
            ease: 'Power2'
        })
    }
    
    playJumpAnimation() {
        // 停止其他动画
        this.stopAllAnimations()
        
        // 播放跳跃动画
        this.jumpTween.restart()
        this.currentAnimation = 'jump'
    }
    
    updateAnimations() {
        const newAnimation = this.determineAnimation()
        
        if (newAnimation !== this.currentAnimation) {
            this.stopAllAnimations()
            this.currentAnimation = newAnimation
            
            switch (newAnimation) {
                case 'idle':
                    this.idleTween.resume()
                    break
                case 'run':
                    this.runTween.resume()
                    break
                case 'jump':
                    // 跳跃动画已在jump方法中处理
                    break
            }
        }
    }
    
    determineAnimation() {
        if (!this.isGrounded) {
            return 'jump'
        } else if (this.isMoving) {
            return 'run'
        } else {
            return 'idle'
        }
    }
    
    stopAllAnimations() {
        this.idleTween.pause()
        this.runTween.pause()
        this.jumpTween.pause()
        
        // 重置缩放
        this.setScale(1, 1)
    }
    
    updateParticleEffects() {
        // 更新粒子效果位置
        this.dustParticles.setPosition(this.x, this.y + 20)
        this.jumpParticles.setPosition(this.x, this.y + 20)
    }
    
    updateFacing() {
        // 更新朝向（翻转精灵）
        if (this.facingDirection === -1) {
            this.setFlipX(true)
        } else {
            this.setFlipX(false)
        }
    }
    
    // 受到伤害时的效果
    takeDamage(amount = 1) {
        // 闪烁效果
        this.scene.tweens.add({
            targets: this,
            alpha: { from: 1, to: 0.3 },
            duration: 100,
            yoyo: true,
            repeat: 3,
            ease: 'Power2'
        })
        
        // 击退效果
        const knockbackForce = 200
        this.setVelocityX(this.facingDirection * -knockbackForce)
        this.setVelocityY(-100)
    }
    
    // 获得道具时的效果
    collectItem() {
        // 收集动画
        this.scene.tweens.add({
            targets: this,
            scaleX: { from: 1, to: 1.3 },
            scaleY: { from: 1, to: 1.3 },
            duration: 200,
            yoyo: true,
            ease: 'Back.easeOut'
        })
        
        // 发光效果
        this.setTint(0xffff00)
        this.scene.time.delayedCall(300, () => {
            this.clearTint()
        })
    }
    
    // 重置玩家状态
    reset(x, y) {
        this.setPosition(x, y)
        this.setVelocity(0, 0)
        this.clearTint()
        this.setAlpha(1)
        this.setRotation(0)
        this.setScale(1, 1)
        this.stopAllAnimations()
        this.currentAnimation = 'idle'
        this.idleTween.resume()
    }
    
    // 销毁时清理
    destroy() {
        if (this.dustParticles) {
            this.dustParticles.destroy()
        }
        if (this.jumpParticles) {
            this.jumpParticles.destroy()
        }
        
        this.stopAllAnimations()
        super.destroy()
    }
}
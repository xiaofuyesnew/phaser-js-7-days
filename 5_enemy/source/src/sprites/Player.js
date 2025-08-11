// 玩家类
export default class Player extends Phaser.Physics.Arcade.Sprite {
    constructor(scene, x, y) {
        super(scene, x, y, 'player')
        
        // 添加到场景
        scene.add.existing(this)
        scene.physics.add.existing(this)
        
        // 玩家属性
        this.health = 100
        this.maxHealth = 100
        this.speed = 120
        this.jumpPower = 300
        this.collisionType = 'player'
        
        // 攻击属性
        this.attackDamage = 20
        this.attackCooldown = 500
        this.lastAttackTime = 0
        
        // 设置物理属性
        this.setCollideWorldBounds(true)
        this.setBounce(0.2)
        this.setDrag(200)
        
        // 输入处理
        this.cursors = scene.input.keyboard.createCursorKeys()
        this.wasd = scene.input.keyboard.addKeys('W,S,A,D,SPACE')
        
        // 创建血条
        this.createHealthBar()
        
        // 无敌时间
        this.invulnerable = false
        this.invulnerableTime = 1000
    }
    
    createHealthBar() {
        // 创建固定位置的血条UI
        this.healthBarBg = this.scene.add.rectangle(100, 30, 150, 20, 0x000000)
        this.healthBar = this.scene.add.rectangle(100, 30, 146, 16, 0x00ff00)
        
        this.healthBarBg.setScrollFactor(0)
        this.healthBar.setScrollFactor(0)
        this.healthBarBg.setDepth(1000)
        this.healthBar.setDepth(1001)
        
        // 添加血量文字
        this.healthText = this.scene.add.text(100, 30, `${this.health}/${this.maxHealth}`, {
            fontSize: '14px',
            fill: '#ffffff',
            fontFamily: 'Arial'
        }).setOrigin(0.5).setScrollFactor(0).setDepth(1002)
    }
    
    update(deltaTime) {
        this.handleInput()
        this.updateHealthBar()
        
        // 更新攻击冷却
        this.lastAttackTime += deltaTime
    }
    
    handleInput() {
        const isLeftDown = this.cursors.left.isDown || this.wasd.A.isDown
        const isRightDown = this.cursors.right.isDown || this.wasd.D.isDown
        const isUpDown = this.cursors.up.isDown || this.wasd.W.isDown
        const isDownDown = this.cursors.down.isDown || this.wasd.S.isDown
        const isSpaceDown = this.wasd.SPACE.isDown
        
        // 水平移动
        if (isLeftDown) {
            this.setVelocityX(-this.speed)
            this.setFlipX(true)
        } else if (isRightDown) {
            this.setVelocityX(this.speed)
            this.setFlipX(false)
        } else {
            this.setVelocityX(0)
        }
        
        // 垂直移动（简化版，实际游戏中可能只有跳跃）
        if (isUpDown) {
            this.setVelocityY(-this.speed)
        } else if (isDownDown) {
            this.setVelocityY(this.speed)
        } else {
            this.setVelocityY(0)
        }
        
        // 攻击
        if (isSpaceDown && this.lastAttackTime >= this.attackCooldown) {
            this.attack()
        }
        
        // 发出脚步声（用于敌人听觉系统）
        if (Math.abs(this.body.velocity.x) > 10 || Math.abs(this.body.velocity.y) > 10) {
            this.emitFootstepSound()
        }
    }
    
    attack() {
        this.lastAttackTime = 0
        
        // 创建攻击范围检测
        const attackRange = 80
        const attackArea = new Phaser.Geom.Circle(this.x, this.y, attackRange)
        
        // 检测范围内的敌人
        if (this.scene.enemyManager) {
            const enemies = this.scene.enemyManager.enemies
            enemies.forEach(enemy => {
                if (enemy.isAlive && Phaser.Geom.Circle.Contains(attackArea, enemy.x, enemy.y)) {
                    enemy.takeDamage(this.attackDamage)
                    
                    // 击退效果
                    const angle = Phaser.Math.Angle.Between(this.x, this.y, enemy.x, enemy.y)
                    const knockbackForce = 150
                    enemy.setVelocity(
                        Math.cos(angle) * knockbackForce,
                        Math.sin(angle) * knockbackForce
                    )
                }
            })
        }
        
        // 攻击特效
        this.showAttackEffect()
    }
    
    showAttackEffect() {
        // 创建攻击特效圆圈
        const attackEffect = this.scene.add.circle(this.x, this.y, 80, 0xffff00, 0.3)
        
        // 特效动画
        this.scene.tweens.add({
            targets: attackEffect,
            scaleX: 1.5,
            scaleY: 1.5,
            alpha: 0,
            duration: 200,
            ease: 'Power2',
            onComplete: () => {
                attackEffect.destroy()
            }
        })
    }
    
    emitFootstepSound() {
        // 向所有敌人发送脚步声事件
        if (this.scene.enemyManager) {
            this.scene.enemyManager.enemies.forEach(enemy => {
                if (enemy.isAlive) {
                    enemy.hearingSystem.addSoundEvent(this.x, this.y, 1.0, 'footstep')
                }
            })
        }
    }
    
    takeDamage(damage) {
        if (this.invulnerable) return
        
        this.health -= damage
        this.health = Math.max(0, this.health)
        
        // 受伤效果
        this.setTint(0xff0000)
        this.scene.time.delayedCall(200, () => {
            this.clearTint()
        })
        
        // 设置无敌时间
        this.invulnerable = true
        this.scene.time.delayedCall(this.invulnerableTime, () => {
            this.invulnerable = false
        })
        
        // 无敌时间闪烁效果
        const blinkTween = this.scene.tweens.add({
            targets: this,
            alpha: 0.5,
            duration: 100,
            yoyo: true,
            repeat: Math.floor(this.invulnerableTime / 200)
        })
        
        if (this.health <= 0) {
            this.die()
        }
    }
    
    updateHealthBar() {
        if (!this.healthBar || !this.healthText) return
        
        const healthPercent = this.health / this.maxHealth
        this.healthBar.scaleX = healthPercent
        
        // 根据血量改变颜色
        if (healthPercent > 0.6) {
            this.healthBar.setFillStyle(0x00ff00)
        } else if (healthPercent > 0.3) {
            this.healthBar.setFillStyle(0xffff00)
        } else {
            this.healthBar.setFillStyle(0xff0000)
        }
        
        // 更新血量文字
        this.healthText.setText(`${this.health}/${this.maxHealth}`)
    }
    
    die() {
        console.log('玩家死亡')
        
        // 死亡效果
        this.setTint(0x666666)
        this.setVelocity(0, 0)
        
        // 显示游戏结束界面
        this.scene.time.delayedCall(1000, () => {
            this.scene.scene.start('MenuScene')
        })
    }
    
    // 治疗
    heal(amount) {
        this.health = Math.min(this.maxHealth, this.health + amount)
    }
}
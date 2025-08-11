export class CameraController {
    constructor(scene, camera, target) {
        this.scene = scene
        this.camera = camera
        this.target = target
        
        // 跟随参数
        this.smoothness = { x: 0.1, y: 0.1 }
        this.deadzone = { width: 150, height: 100 }
        this.offset = { x: 0, y: 50 }
        
        // 预测跟随
        this.lastPosition = { x: target.x, y: target.y }
        this.velocity = { x: 0, y: 0 }
        this.predictionFactor = 1.5
        
        // 边界控制
        this.bounds = null
        this.padding = { top: 50, right: 50, bottom: 50, left: 50 }
        
        // 锁定状态
        this.isLocked = false
        this.lockDuration = 0
        this.lockTimer = 0
        this.originalTarget = null
        
        // 特效状态
        this.shakeIntensity = 0
        this.shakeDuration = 0
        this.shakeTimer = 0
        this.isShaking = false
        
        // 初始化
        this.init()
    }
    
    init() {
        // 设置初始边界
        this.setBounds(0, 0, this.scene.worldWidth, this.scene.worldHeight)
    }
    
    // 启用智能跟随
    enableSmartFollow() {
        this.camera.startFollow(this.target, true, this.smoothness.x, this.smoothness.y)
        this.camera.setDeadzone(this.deadzone.width, this.deadzone.height)
        this.camera.setFollowOffset(this.offset.x, this.offset.y)
    }
    
    // 设置跟随参数
    setFollowParams(smoothnessX, smoothnessY, deadzoneWidth, deadzoneHeight) {
        this.smoothness.x = smoothnessX
        this.smoothness.y = smoothnessY
        this.deadzone.width = deadzoneWidth
        this.deadzone.height = deadzoneHeight
        
        if (this.camera.followTarget) {
            this.camera.setLerp(smoothnessX, smoothnessY)
            this.camera.setDeadzone(deadzoneWidth, deadzoneHeight)
        }
    }
    
    // 设置跟随偏移
    setFollowOffset(x, y) {
        this.offset.x = x
        this.offset.y = y
        this.camera.setFollowOffset(x, y)
    }
    
    // 临时锁定摄像机到指定位置
    lockToPosition(x, y, duration = 1000) {
        this.originalTarget = this.camera.followTarget
        this.camera.stopFollow()
        
        this.scene.tweens.add({
            targets: this.camera,
            scrollX: x - this.camera.width / 2,
            scrollY: y - this.camera.height / 2,
            duration: 500,
            ease: 'Power2',
            onComplete: () => {
                this.isLocked = true
                this.lockDuration = duration
                this.lockTimer = 0
            }
        })
    }
    
    // 平移到指定位置
    panTo(x, y, duration = 1000, ease = 'Power2') {
        return this.scene.tweens.add({
            targets: this.camera,
            scrollX: x - this.camera.width / 2,
            scrollY: y - this.camera.height / 2,
            duration: duration,
            ease: ease
        })
    }
    
    // 缩放到指定级别
    zoomTo(zoom, duration = 1000, ease = 'Power2') {
        return this.scene.tweens.add({
            targets: this.camera,
            zoom: zoom,
            duration: duration,
            ease: ease
        })
    }
    
    // 旋转到指定角度
    rotateTo(rotation, duration = 1000, ease = 'Power2') {
        return this.scene.tweens.add({
            targets: this.camera,
            rotation: rotation,
            duration: duration,
            ease: ease
        })
    }
    
    // 聚焦到目标
    focusOn(target, zoom = 2, duration = 1000) {
        const targetX = target.x || target.x
        const targetY = target.y || target.y
        
        return this.scene.tweens.add({
            targets: this.camera,
            scrollX: targetX - this.camera.width / 2,
            scrollY: targetY - this.camera.height / 2,
            zoom: zoom,
            duration: duration,
            ease: 'Power2'
        })
    }
    
    // 创建电影镜头效果
    createCinematicShot(keyframes, totalDuration = 3000) {
        const timeline = this.scene.tweens.createTimeline()
        
        keyframes.forEach((keyframe, index) => {
            timeline.add({
                targets: this.camera,
                scrollX: keyframe.x - this.camera.width / 2,
                scrollY: keyframe.y - this.camera.height / 2,
                zoom: keyframe.zoom || this.camera.zoom,
                rotation: keyframe.rotation || this.camera.rotation,
                duration: keyframe.duration || totalDuration / keyframes.length,
                ease: keyframe.ease || 'Power2',
                offset: keyframe.offset || 0
            })
        })
        
        timeline.play()
        return timeline
    }
    
    // 震动效果
    shake(intensity = 10, duration = 500) {
        this.shakeIntensity = intensity
        this.shakeDuration = duration
        this.shakeTimer = 0
        this.isShaking = true
    }
    
    // 设置边界
    setBounds(x, y, width, height) {
        this.bounds = { x, y, width, height }
        this.camera.setBounds(x, y, width, height)
    }
    
    // 约束摄像机在边界内
    constrainCamera() {
        if (!this.bounds) return
        
        const minX = this.bounds.x + this.padding.left
        const minY = this.bounds.y + this.padding.top
        const maxX = this.bounds.x + this.bounds.width - this.camera.width - this.padding.right
        const maxY = this.bounds.y + this.bounds.height - this.camera.height - this.padding.bottom
        
        this.camera.scrollX = Phaser.Math.Clamp(this.camera.scrollX, minX, maxX)
        this.camera.scrollY = Phaser.Math.Clamp(this.camera.scrollY, minY, maxY)
    }
    
    // 检查是否接近边界
    isNearBoundary(threshold = 100) {
        if (!this.bounds) return false
        
        const distances = this.getBoundaryDistances()
        return Object.values(distances).some(distance => distance < threshold)
    }
    
    // 获取到边界的距离
    getBoundaryDistances() {
        if (!this.bounds) return {}
        
        return {
            left: this.camera.scrollX - this.bounds.x,
            right: (this.bounds.x + this.bounds.width) - (this.camera.scrollX + this.camera.width),
            top: this.camera.scrollY - this.bounds.y,
            bottom: (this.bounds.y + this.bounds.height) - (this.camera.scrollY + this.camera.height)
        }
    }
    
    // 预测性跟随更新
    updatePredictiveFollow() {
        if (!this.target || !this.camera.followTarget) return
        
        // 计算目标速度
        this.velocity.x = this.target.x - this.lastPosition.x
        this.velocity.y = this.target.y - this.lastPosition.y
        
        // 根据速度调整跟随参数
        const speed = Math.abs(this.velocity.x) + Math.abs(this.velocity.y)
        
        if (speed > 5) {
            // 高速移动时，增加预测性和响应速度
            const predictiveOffsetX = this.velocity.x * this.predictionFactor
            const predictiveOffsetY = this.velocity.y * this.predictionFactor * 0.5
            
            this.camera.setFollowOffset(
                this.offset.x + predictiveOffsetX,
                this.offset.y + predictiveOffsetY
            )
            
            // 调整跟随速度
            if (speed > 10) {
                this.camera.setLerp(0.15, 0.15)
            } else {
                this.camera.setLerp(0.1, 0.1)
            }
        } else {
            // 慢速或静止时，恢复正常偏移
            this.camera.setFollowOffset(this.offset.x, this.offset.y)
            this.camera.setLerp(0.05, 0.05)
        }
        
        // 更新上一帧位置
        this.lastPosition.x = this.target.x
        this.lastPosition.y = this.target.y
    }
    
    // 更新震动效果
    updateShake(deltaTime) {
        if (!this.isShaking) return
        
        this.shakeTimer += deltaTime
        
        if (this.shakeTimer >= this.shakeDuration) {
            this.isShaking = false
            return
        }
        
        // 计算震动偏移
        const progress = this.shakeTimer / this.shakeDuration
        const currentIntensity = this.shakeIntensity * (1 - progress)
        
        const offsetX = (Math.random() - 0.5) * currentIntensity
        const offsetY = (Math.random() - 0.5) * currentIntensity
        
        // 应用震动偏移
        const originalScrollX = this.camera.scrollX
        const originalScrollY = this.camera.scrollY
        
        this.camera.setScroll(
            originalScrollX + offsetX,
            originalScrollY + offsetY
        )
    }
    
    // 主更新方法
    update(deltaTime) {
        // 更新锁定状态
        if (this.isLocked) {
            this.lockTimer += deltaTime
            if (this.lockTimer >= this.lockDuration) {
                this.isLocked = false
                if (this.originalTarget) {
                    this.enableSmartFollow()
                }
            }
        }
        
        // 更新预测性跟随
        this.updatePredictiveFollow()
        
        // 更新震动效果
        this.updateShake(deltaTime)
        
        // 约束摄像机边界
        this.constrainCamera()
    }
    
    // 获取摄像机可见区域
    getVisibleBounds() {
        return {
            x: this.camera.scrollX,
            y: this.camera.scrollY,
            width: this.camera.width,
            height: this.camera.height,
            centerX: this.camera.scrollX + this.camera.width / 2,
            centerY: this.camera.scrollY + this.camera.height / 2
        }
    }
    
    // 检查点是否在摄像机视野内
    isPointInView(x, y, margin = 0) {
        const bounds = this.getVisibleBounds()
        return x >= bounds.x - margin && 
               x <= bounds.x + bounds.width + margin &&
               y >= bounds.y - margin && 
               y <= bounds.y + bounds.height + margin
    }
    
    // 检查矩形是否与摄像机视野相交
    isRectInView(rect, margin = 0) {
        const bounds = this.getVisibleBounds()
        return !(rect.x + rect.width < bounds.x - margin ||
                 rect.x > bounds.x + bounds.width + margin ||
                 rect.y + rect.height < bounds.y - margin ||
                 rect.y > bounds.y + bounds.height + margin)
    }
}
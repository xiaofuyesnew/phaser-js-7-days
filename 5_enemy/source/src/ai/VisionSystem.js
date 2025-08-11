// 视野检测系统
export default class VisionSystem {
    constructor(owner) {
        this.owner = owner
        this.viewDistance = 200
        this.viewAngle = Math.PI / 3 // 60度视角
        this.viewDirection = 0 // 朝向角度
    }
    
    // 检查目标是否在视野内
    canSee(target) {
        const distance = Phaser.Math.Distance.Between(
            this.owner.x, this.owner.y,
            target.x, target.y
        )
        
        // 距离检查
        if (distance > this.viewDistance) {
            return false
        }
        
        // 角度检查
        const angleToTarget = Phaser.Math.Angle.Between(
            this.owner.x, this.owner.y,
            target.x, target.y
        )
        
        const angleDiff = Math.abs(angleToTarget - this.viewDirection)
        const normalizedAngleDiff = Math.min(angleDiff, 2 * Math.PI - angleDiff)
        
        if (normalizedAngleDiff > this.viewAngle / 2) {
            return false
        }
        
        // 障碍物检查（射线检测）
        return this.hasLineOfSight(target)
    }
    
    // 射线检测 - 检查是否有障碍物阻挡
    hasLineOfSight(target) {
        // 简化版本，实际项目中可以加入地形检测
        return true
    }
    
    // 获取视野内的所有目标
    getTargetsInView(targets) {
        return targets.filter(target => this.canSee(target))
    }
    
    // 可视化视野范围（调试用）
    debugDraw(graphics) {
        if (!graphics) return
        
        graphics.clear()
        graphics.lineStyle(2, 0xff0000, 0.3)
        
        // 绘制视野扇形
        const startAngle = this.viewDirection - this.viewAngle / 2
        const endAngle = this.viewDirection + this.viewAngle / 2
        
        graphics.beginPath()
        graphics.moveTo(this.owner.x, this.owner.y)
        graphics.arc(
            this.owner.x, this.owner.y,
            this.viewDistance,
            startAngle, endAngle
        )
        graphics.closePath()
        graphics.strokePath()
    }
    
    // 设置视野参数
    setViewDistance(distance) {
        this.viewDistance = distance
    }
    
    setViewAngle(angle) {
        this.viewAngle = angle
    }
    
    setViewDirection(direction) {
        this.viewDirection = direction
    }
}
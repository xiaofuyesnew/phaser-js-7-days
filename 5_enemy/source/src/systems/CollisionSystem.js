// 碰撞检测系统
export default class CollisionSystem {
    constructor(scene) {
        this.scene = scene
        this.collisionGroups = new Map()
        this.collisionMatrix = new Map()
        this.collisionCallbacks = new Map()
    }
    
    // 创建碰撞组
    createCollisionGroup(name) {
        const group = this.scene.physics.add.group()
        this.collisionGroups.set(name, group)
        return group
    }
    
    // 设置碰撞关系
    setCollision(group1Name, group2Name, callback = null, processCallback = null) {
        const group1 = this.collisionGroups.get(group1Name)
        const group2 = this.collisionGroups.get(group2Name)
        
        if (!group1 || !group2) {
            console.warn(`Collision groups not found: ${group1Name}, ${group2Name}`)
            return
        }
        
        // 设置碰撞检测
        const collider = this.scene.physics.add.collider(
            group1, group2, callback, processCallback
        )
        
        // 记录碰撞关系
        const key = `${group1Name}-${group2Name}`
        this.collisionMatrix.set(key, collider)
        
        return collider
    }
    
    // 设置重叠检测
    setOverlap(group1Name, group2Name, callback = null, processCallback = null) {
        const group1 = this.collisionGroups.get(group1Name)
        const group2 = this.collisionGroups.get(group2Name)
        
        if (!group1 || !group2) {
            console.warn(`Collision groups not found: ${group1Name}, ${group2Name}`)
            return
        }
        
        const overlap = this.scene.physics.add.overlap(
            group1, group2, callback, processCallback
        )
        
        return overlap
    }
    
    // 添加对象到碰撞组
    addToGroup(groupName, object) {
        const group = this.collisionGroups.get(groupName)
        if (group) {
            group.add(object)
        }
    }
    
    // 移除对象从碰撞组
    removeFromGroup(groupName, object) {
        const group = this.collisionGroups.get(groupName)
        if (group) {
            group.remove(object)
        }
    }
    
    // 获取碰撞组
    getGroup(groupName) {
        return this.collisionGroups.get(groupName)
    }
    
    // 自定义碰撞检测
    checkCustomCollision(object1, object2) {
        return this.scene.physics.world.overlap(object1.body, object2.body)
    }
    
    // 射线检测
    raycast(startX, startY, endX, endY, objects) {
        const line = new Phaser.Geom.Line(startX, startY, endX, endY)
        const hits = []
        
        objects.forEach(obj => {
            if (obj.body) {
                const bounds = obj.body.getBounds()
                const rect = new Phaser.Geom.Rectangle(
                    bounds.x, bounds.y, bounds.width, bounds.height
                )
                
                const intersection = Phaser.Geom.Intersects.GetLineToRectangle(line, rect)
                if (intersection.length > 0) {
                    hits.push({
                        object: obj,
                        point: intersection[0],
                        distance: Phaser.Math.Distance.Between(
                            startX, startY,
                            intersection[0].x, intersection[0].y
                        )
                    })
                }
            }
        })
        
        // 按距离排序
        hits.sort((a, b) => a.distance - b.distance)
        return hits
    }
    
    // 清理所有碰撞关系
    clear() {
        this.collisionGroups.clear()
        this.collisionMatrix.clear()
        this.collisionCallbacks.clear()
    }
}
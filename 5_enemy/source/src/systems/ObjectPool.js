// 对象池系统
export default class ObjectPool {
    constructor(scene, classType, initialSize = 5) {
        this.scene = scene
        this.classType = classType
        this.pool = []
        this.active = []
        
        // 预创建对象
        for (let i = 0; i < initialSize; i++) {
            const obj = new classType(scene, 0, 0)
            obj.setActive(false)
            obj.setVisible(false)
            this.pool.push(obj)
        }
    }
    
    // 获取对象
    get(x, y, ...args) {
        let obj
        
        if (this.pool.length > 0) {
            obj = this.pool.pop()
        } else {
            obj = new this.classType(this.scene, x, y, ...args)
        }
        
        obj.setActive(true)
        obj.setVisible(true)
        obj.setPosition(x, y)
        
        // 重置对象状态
        if (obj.reset) {
            obj.reset(x, y, ...args)
        }
        
        this.active.push(obj)
        return obj
    }
    
    // 释放对象
    release(obj) {
        const index = this.active.indexOf(obj)
        if (index !== -1) {
            this.active.splice(index, 1)
            
            obj.setActive(false)
            obj.setVisible(false)
            
            // 清理对象状态
            if (obj.cleanup) {
                obj.cleanup()
            }
            
            this.pool.push(obj)
        }
    }
    
    // 批量更新
    updateAll(deltaTime) {
        for (let i = this.active.length - 1; i >= 0; i--) {
            const obj = this.active[i]
            if (obj.active && obj.update) {
                obj.update(deltaTime)
            }
            
            // 自动回收
            if (obj.shouldDestroy && obj.shouldDestroy()) {
                this.release(obj)
            }
        }
    }
    
    // 获取活跃对象数量
    getActiveCount() {
        return this.active.length
    }
    
    // 获取池中对象数量
    getPoolCount() {
        return this.pool.length
    }
    
    // 获取总对象数量
    getTotalCount() {
        return this.active.length + this.pool.length
    }
    
    // 清理所有对象
    clear() {
        this.active.forEach(obj => {
            if (obj.cleanup) obj.cleanup()
            obj.destroy()
        })
        
        this.pool.forEach(obj => {
            if (obj.cleanup) obj.cleanup()
            obj.destroy()
        })
        
        this.active = []
        this.pool = []
    }
    
    // 预热对象池（创建更多对象）
    warmUp(count) {
        for (let i = 0; i < count; i++) {
            const obj = new this.classType(this.scene, 0, 0)
            obj.setActive(false)
            obj.setVisible(false)
            this.pool.push(obj)
        }
    }
}
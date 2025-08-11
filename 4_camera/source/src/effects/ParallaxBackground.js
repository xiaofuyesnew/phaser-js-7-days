export class ParallaxBackground {
    constructor(scene) {
        this.scene = scene
        this.layers = []
        this.camera = scene.cameras.main
    }
    
    // 添加视差层
    addLayer(texture, scrollFactor, depth = 0, config = {}) {
        const layer = this.scene.add.tileSprite(
            0, 0,
            this.camera.width,
            this.camera.height,
            texture
        )
        
        // 设置层属性
        layer.setScrollFactor(scrollFactor)
        layer.setDepth(depth)
        layer.setOrigin(0, 0)
        
        // 应用配置
        if (config.alpha !== undefined) {
            layer.setAlpha(config.alpha)
        }
        
        if (config.tint !== undefined) {
            layer.setTint(config.tint)
        }
        
        if (config.scale !== undefined) {
            layer.setScale(config.scale)
        }
        
        // 存储层信息
        const layerData = {
            sprite: layer,
            scrollFactor: scrollFactor,
            originalX: 0,
            originalY: 0,
            texture: texture,
            config: config,
            // 动画属性
            animationSpeed: config.animationSpeed || 0,
            animationOffset: 0
        }
        
        this.layers.push(layerData)
        
        return layer
    }
    
    // 添加动画背景层
    addAnimatedLayer(texture, scrollFactor, depth = 0, animationSpeed = 1) {
        return this.addLayer(texture, scrollFactor, depth, {
            animationSpeed: animationSpeed
        })
    }
    
    // 添加云层效果
    addCloudLayer(count = 5, scrollFactor = 0.05, depth = -95) {
        const clouds = []
        
        for (let i = 0; i < count; i++) {
            const cloud = this.scene.add.graphics()
            
            // 绘制云朵
            cloud.fillStyle(0xffffff, 0.8)
            cloud.fillCircle(0, 0, 30)
            cloud.fillCircle(25, 0, 25)
            cloud.fillCircle(-25, 0, 25)
            cloud.fillCircle(12, -15, 20)
            cloud.fillCircle(-12, -15, 20)
            
            // 随机位置
            cloud.x = Math.random() * this.scene.worldWidth
            cloud.y = 100 + Math.random() * 200
            
            cloud.setScrollFactor(scrollFactor)
            cloud.setDepth(depth)
            
            clouds.push({
                sprite: cloud,
                baseX: cloud.x,
                speed: 0.2 + Math.random() * 0.3
            })
        }
        
        // 添加云朵动画
        this.scene.time.addEvent({
            delay: 50,
            callback: () => {
                clouds.forEach(cloud => {
                    cloud.sprite.x += cloud.speed
                    if (cloud.sprite.x > this.scene.worldWidth + 100) {
                        cloud.sprite.x = -100
                    }
                })
            },
            loop: true
        })
        
        return clouds
    }
    
    // 移除层
    removeLayer(index) {
        if (index >= 0 && index < this.layers.length) {
            const layer = this.layers[index]
            layer.sprite.destroy()
            this.layers.splice(index, 1)
        }
    }
    
    // 清除所有层
    clearLayers() {
        this.layers.forEach(layer => {
            layer.sprite.destroy()
        })
        this.layers = []
    }
    
    // 设置层的可见性
    setLayerVisible(index, visible) {
        if (index >= 0 && index < this.layers.length) {
            this.layers[index].sprite.setVisible(visible)
        }
    }
    
    // 设置层的透明度
    setLayerAlpha(index, alpha) {
        if (index >= 0 && index < this.layers.length) {
            this.layers[index].sprite.setAlpha(alpha)
        }
    }
    
    // 设置层的色调
    setLayerTint(index, tint) {
        if (index >= 0 && index < this.layers.length) {
            this.layers[index].sprite.setTint(tint)
        }
    }
    
    // 创建时间相关的背景效果
    createTimeBasedEffects() {
        // 日夜循环效果
        this.scene.tweens.add({
            targets: this.layers.filter(layer => layer.texture === 'sky').map(layer => layer.sprite),
            tint: { from: 0x87CEEB, to: 0x191970 },
            duration: 30000,
            yoyo: true,
            repeat: -1,
            ease: 'Sine.easeInOut'
        })
    }
    
    // 创建天气效果
    createWeatherEffect(type = 'rain') {
        switch (type) {
            case 'rain':
                this.createRainEffect()
                break
            case 'snow':
                this.createSnowEffect()
                break
            case 'fog':
                this.createFogEffect()
                break
        }
    }
    
    // 雨效果
    createRainEffect() {
        const raindrops = []
        const raindropCount = 50
        
        for (let i = 0; i < raindropCount; i++) {
            const raindrop = this.scene.add.graphics()
            raindrop.lineStyle(2, 0x4A90E2, 0.6)
            raindrop.lineBetween(0, 0, 0, 20)
            
            raindrop.x = Math.random() * this.scene.worldWidth
            raindrop.y = Math.random() * this.scene.worldHeight
            raindrop.setScrollFactor(0.8)
            raindrop.setDepth(-60)
            
            raindrops.push({
                sprite: raindrop,
                speed: 5 + Math.random() * 3
            })
        }
        
        // 雨滴动画
        this.scene.time.addEvent({
            delay: 16,
            callback: () => {
                raindrops.forEach(drop => {
                    drop.sprite.y += drop.speed
                    if (drop.sprite.y > this.scene.worldHeight) {
                        drop.sprite.y = -20
                        drop.sprite.x = Math.random() * this.scene.worldWidth
                    }
                })
            },
            loop: true
        })
    }
    
    // 雪效果
    createSnowEffect() {
        const snowflakes = []
        const snowflakeCount = 30
        
        for (let i = 0; i < snowflakeCount; i++) {
            const snowflake = this.scene.add.graphics()
            snowflake.fillStyle(0xffffff, 0.8)
            snowflake.fillCircle(0, 0, 3)
            
            snowflake.x = Math.random() * this.scene.worldWidth
            snowflake.y = Math.random() * this.scene.worldHeight
            snowflake.setScrollFactor(0.6)
            snowflake.setDepth(-60)
            
            snowflakes.push({
                sprite: snowflake,
                speed: 1 + Math.random() * 2,
                drift: Math.random() * 2 - 1
            })
        }
        
        // 雪花动画
        this.scene.time.addEvent({
            delay: 50,
            callback: () => {
                snowflakes.forEach(flake => {
                    flake.sprite.y += flake.speed
                    flake.sprite.x += flake.drift
                    
                    if (flake.sprite.y > this.scene.worldHeight) {
                        flake.sprite.y = -10
                        flake.sprite.x = Math.random() * this.scene.worldWidth
                    }
                })
            },
            loop: true
        })
    }
    
    // 雾效果
    createFogEffect() {
        const fog = this.scene.add.graphics()
        fog.fillGradientStyle(0xffffff, 0xffffff, 0xffffff, 0xffffff, 0.3, 0.1, 0.3, 0.1)
        fog.fillRect(0, this.scene.worldHeight * 0.7, this.scene.worldWidth, this.scene.worldHeight * 0.3)
        fog.setScrollFactor(0.2)
        fog.setDepth(-65)
        
        // 雾的飘动效果
        this.scene.tweens.add({
            targets: fog,
            alpha: { from: 0.3, to: 0.1 },
            duration: 3000,
            yoyo: true,
            repeat: -1,
            ease: 'Sine.easeInOut'
        })
    }
    
    // 主更新方法
    update() {
        this.layers.forEach(layer => {
            // 基础视差滚动
            const offsetX = this.camera.scrollX * (1 - layer.scrollFactor)
            const offsetY = this.camera.scrollY * (1 - layer.scrollFactor)
            
            layer.sprite.tilePositionX = offsetX + layer.animationOffset
            layer.sprite.tilePositionY = offsetY
            
            // 动画效果
            if (layer.animationSpeed !== 0) {
                layer.animationOffset += layer.animationSpeed
            }
        })
    }
    
    // 获取层数量
    getLayerCount() {
        return this.layers.length
    }
    
    // 获取指定层
    getLayer(index) {
        return this.layers[index] || null
    }
    
    // 重新排序层
    reorderLayer(fromIndex, toIndex) {
        if (fromIndex >= 0 && fromIndex < this.layers.length &&
            toIndex >= 0 && toIndex < this.layers.length) {
            const layer = this.layers.splice(fromIndex, 1)[0]
            this.layers.splice(toIndex, 0, layer)
        }
    }
    
    // 销毁
    destroy() {
        this.clearLayers()
    }
}
/**
 * 性能监控类
 * 监控游戏的FPS、内存使用、渲染性能等指标
 */
export class PerformanceMonitor {
    constructor(scene) {
        this.scene = scene;
        this.enabled = __DEV__;
        this.visible = false;
        
        // 性能数据
        this.metrics = {
            fps: 0,
            memory: 0,
            drawCalls: 0,
            gameObjects: 0,
            physicsBodies: 0
        };
        
        // UI元素
        this.container = null;
        this.texts = new Map();
        
        // 历史数据用于图表
        this.history = {
            fps: [],
            memory: [],
            maxHistory: 60 // 保存60帧数据
        };
        
        this.init();
    }
    
    init() {
        if (!this.enabled) return;
        
        this.createUI();
        this.setupUpdateLoop();
    }
    
    createUI() {
        // 创建容器
        this.container = this.scene.add.container(10, 10);
        this.container.setScrollFactor(0);
        this.container.setDepth(10000);
        this.container.setVisible(false);
        
        // 背景
        const bg = this.scene.add.rectangle(0, 0, 280, 160, 0x000000, 0.8);
        bg.setOrigin(0, 0);
        this.container.add(bg);
        
        // 标题
        const title = this.scene.add.text(10, 10, 'Performance Monitor', {
            fontSize: '14px',
            fill: '#4CAF50',
            fontStyle: 'bold'
        });
        this.container.add(title);
        
        // 创建各项指标文本
        const metrics = [
            { key: 'fps', label: 'FPS', color: '#4CAF50' },
            { key: 'memory', label: 'Memory', color: '#2196F3' },
            { key: 'gameObjects', label: 'Objects', color: '#FF9800' },
            { key: 'physicsBodies', label: 'Physics', color: '#9C27B0' },
            { key: 'drawCalls', label: 'Draw Calls', color: '#F44336' }
        ];
        
        metrics.forEach((metric, index) => {
            const text = this.scene.add.text(10, 35 + index * 20, `${metric.label}: 0`, {
                fontSize: '12px',
                fill: metric.color
            });
            this.container.add(text);
            this.texts.set(metric.key, text);
        });
        
        // 添加切换按钮提示
        const hint = this.scene.add.text(10, 145, 'Press P to toggle', {
            fontSize: '10px',
            fill: '#888888'
        });
        this.container.add(hint);
    }
    
    setupUpdateLoop() {
        // 每秒更新10次
        this.scene.time.addEvent({
            delay: 100,
            callback: this.updateMetrics,
            callbackScope: this,
            loop: true
        });
    }
    
    updateMetrics() {
        if (!this.enabled) return;
        
        // 更新FPS
        this.metrics.fps = Math.round(this.scene.game.loop.actualFps);
        
        // 更新内存使用
        if (performance.memory) {
            this.metrics.memory = Math.round(performance.memory.usedJSHeapSize / 1024 / 1024);
        }
        
        // 更新游戏对象数量
        this.metrics.gameObjects = this.scene.children.length;
        
        // 更新物理体数量
        if (this.scene.physics && this.scene.physics.world) {
            this.metrics.physicsBodies = this.scene.physics.world.bodies.entries.length;
        }
        
        // 估算绘制调用数（简化版本）
        this.metrics.drawCalls = this.estimateDrawCalls();
        
        // 更新历史数据
        this.updateHistory();
        
        // 更新UI显示
        this.updateUI();
        
        // 检查性能警告
        this.checkPerformanceWarnings();
    }
    
    estimateDrawCalls() {
        // 这是一个简化的估算，实际的绘制调用数需要更复杂的监控
        let drawCalls = 0;
        
        // 遍历所有游戏对象
        this.scene.children.each((child) => {
            if (child.visible) {
                drawCalls++;
                
                // 如果是容器，计算子对象
                if (child.type === 'Container') {
                    drawCalls += child.length;
                }
                
                // 如果是精灵图，可能有多个帧
                if (child.type === 'Sprite' && child.anims && child.anims.isPlaying) {
                    drawCalls += 1; // 动画可能增加绘制复杂度
                }
            }
        });
        
        return drawCalls;
    }
    
    updateHistory() {
        // 添加新数据
        this.history.fps.push(this.metrics.fps);
        this.history.memory.push(this.metrics.memory);
        
        // 限制历史数据长度
        if (this.history.fps.length > this.history.maxHistory) {
            this.history.fps.shift();
            this.history.memory.shift();
        }
    }
    
    updateUI() {
        if (!this.visible) return;
        
        // 更新FPS显示
        const fpsText = this.texts.get('fps');
        if (fpsText) {
            fpsText.setText(`FPS: ${this.metrics.fps}`);
            
            // 根据FPS调整颜色
            if (this.metrics.fps >= 55) {
                fpsText.setFill('#4CAF50'); // 绿色：良好
            } else if (this.metrics.fps >= 30) {
                fpsText.setFill('#FF9800'); // 橙色：一般
            } else {
                fpsText.setFill('#F44336'); // 红色：差
            }
        }
        
        // 更新内存显示
        const memoryText = this.texts.get('memory');
        if (memoryText) {
            memoryText.setText(`Memory: ${this.metrics.memory}MB`);
        }
        
        // 更新游戏对象数量
        const objectsText = this.texts.get('gameObjects');
        if (objectsText) {
            objectsText.setText(`Objects: ${this.metrics.gameObjects}`);
        }
        
        // 更新物理体数量
        const physicsText = this.texts.get('physicsBodies');
        if (physicsText) {
            physicsText.setText(`Physics: ${this.metrics.physicsBodies}`);
        }
        
        // 更新绘制调用数
        const drawCallsText = this.texts.get('drawCalls');
        if (drawCallsText) {
            drawCallsText.setText(`Draw Calls: ${this.metrics.drawCalls}`);
        }
    }
    
    checkPerformanceWarnings() {
        const warnings = [];
        
        // FPS警告
        if (this.metrics.fps < 30) {
            warnings.push('Low FPS detected');
        }
        
        // 内存警告
        if (this.metrics.memory > 100) {
            warnings.push('High memory usage');
        }
        
        // 对象数量警告
        if (this.metrics.gameObjects > 1000) {
            warnings.push('Too many game objects');
        }
        
        // 绘制调用警告
        if (this.metrics.drawCalls > 500) {
            warnings.push('High draw call count');
        }
        
        // 输出警告
        if (warnings.length > 0 && __DEV__) {
            console.warn('Performance warnings:', warnings);
        }
    }
    
    show() {
        this.visible = true;
        if (this.container) {
            this.container.setVisible(true);
        }
    }
    
    hide() {
        this.visible = false;
        if (this.container) {
            this.container.setVisible(false);
        }
    }
    
    toggle() {
        if (this.visible) {
            this.hide();
        } else {
            this.show();
        }
    }
    
    // 获取性能报告
    getPerformanceReport() {
        const avgFps = this.history.fps.length > 0 
            ? this.history.fps.reduce((a, b) => a + b, 0) / this.history.fps.length 
            : 0;
            
        const avgMemory = this.history.memory.length > 0
            ? this.history.memory.reduce((a, b) => a + b, 0) / this.history.memory.length
            : 0;
        
        return {
            current: { ...this.metrics },
            averages: {
                fps: Math.round(avgFps),
                memory: Math.round(avgMemory)
            },
            history: {
                fps: [...this.history.fps],
                memory: [...this.history.memory]
            },
            timestamp: Date.now()
        };
    }
    
    // 重置统计数据
    reset() {
        this.history.fps = [];
        this.history.memory = [];
        this.metrics = {
            fps: 0,
            memory: 0,
            drawCalls: 0,
            gameObjects: 0,
            physicsBodies: 0
        };
    }
    
    // 销毁监控器
    destroy() {
        if (this.container) {
            this.container.destroy();
        }
        this.texts.clear();
        this.enabled = false;
    }
}
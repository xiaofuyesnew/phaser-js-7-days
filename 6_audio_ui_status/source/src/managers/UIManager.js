/**
 * UI管理器
 * 统一管理游戏中的UI元素创建和更新
 */
export class UIManager {
    constructor(scene) {
        this.scene = scene;
        this.elements = {};
        this.containers = {};
        this.groups = {};
    }
    
    /**
     * 创建文本元素
     * @param {string} key - 元素键名
     * @param {number} x - X坐标
     * @param {number} y - Y坐标
     * @param {string} text - 文本内容
     * @param {object} style - 文本样式
     */
    createText(key, x, y, text, style = {}) {
        const defaultStyle = {
            fontSize: '24px',
            fontFamily: 'Arial',
            color: '#ffffff',
            stroke: '#000000',
            strokeThickness: 2,
            align: 'left'
        };
        
        const textObj = this.scene.add.text(x, y, text, {
            ...defaultStyle,
            ...style
        });
        
        this.elements[key] = textObj;
        return textObj;
    }
    
    /**
     * 创建按钮
     * @param {string} key - 按钮键名
     * @param {number} x - X坐标
     * @param {number} y - Y坐标
     * @param {string} text - 按钮文本
     * @param {function} callback - 点击回调
     * @param {object} context - 回调上下文
     * @param {object} style - 按钮样式
     */
    createButton(key, x, y, text, callback, context, style = {}) {
        const defaultStyle = {
            fontSize: '20px',
            fontFamily: 'Arial',
            color: '#ffffff',
            backgroundColor: '#333333',
            padding: { x: 20, y: 10 },
            borderRadius: 5
        };
        
        const button = this.scene.add.text(x, y, text, {
            ...defaultStyle,
            ...style
        })
        .setOrigin(0.5)
        .setInteractive({ useHandCursor: true })
        .on('pointerdown', callback, context)
        .on('pointerover', () => {
            button.setStyle({ backgroundColor: '#555555' });
            button.setScale(1.05);
        })
        .on('pointerout', () => {
            button.setStyle({ backgroundColor: style.backgroundColor || '#333333' });
            button.setScale(1);
        });
        
        this.elements[key] = button;
        return button;
    }
    
    /**
     * 创建图片按钮
     * @param {string} key - 按钮键名
     * @param {number} x - X坐标
     * @param {number} y - Y坐标
     * @param {string} texture - 纹理键名
     * @param {function} callback - 点击回调
     * @param {object} context - 回调上下文
     */
    createImageButton(key, x, y, texture, callback, context) {
        const button = this.scene.add.image(x, y, texture)
            .setInteractive({ useHandCursor: true })
            .on('pointerdown', callback, context)
            .on('pointerover', () => {
                button.setTint(0xcccccc);
                button.setScale(1.1);
            })
            .on('pointerout', () => {
                button.clearTint();
                button.setScale(1);
            });
        
        this.elements[key] = button;
        return button;
    }
    
    /**
     * 创建进度条
     * @param {string} key - 进度条键名
     * @param {number} x - X坐标
     * @param {number} y - Y坐标
     * @param {number} width - 宽度
     * @param {number} height - 高度
     * @param {number} fillColor - 填充颜色
     * @param {number} bgColor - 背景颜色
     */
    createProgressBar(key, x, y, width, height, fillColor = 0x00ff00, bgColor = 0x333333) {
        const container = this.scene.add.container(x, y);
        
        // 背景
        const bg = this.scene.add.rectangle(0, 0, width, height, bgColor);
        bg.setStrokeStyle(2, 0x666666);
        
        // 填充
        const fill = this.scene.add.rectangle(-width/2, 0, 0, height - 4, fillColor);
        fill.setOrigin(0, 0.5);
        
        container.add([bg, fill]);
        
        // 添加更新方法
        container.updateProgress = (progress) => {
            const clampedProgress = Math.max(0, Math.min(1, progress));
            fill.width = (width - 4) * clampedProgress;
        };
        
        // 添加颜色更新方法
        container.setFillColor = (color) => {
            fill.setFillStyle(color);
        };
        
        this.elements[key] = container;
        return container;
    }
    
    /**
     * 创建滑块
     * @param {string} key - 滑块键名
     * @param {number} x - X坐标
     * @param {number} y - Y坐标
     * @param {number} width - 宽度
     * @param {number} initialValue - 初始值 (0-1)
     * @param {function} onChange - 值变化回调
     */
    createSlider(key, x, y, width, initialValue = 0.5, onChange) {
        const container = this.scene.add.container(x, y);
        
        // 滑轨
        const track = this.scene.add.rectangle(0, 0, width, 6, 0x666666);
        
        // 滑块
        const handle = this.scene.add.circle(0, 0, 12, 0xffffff);
        handle.setStrokeStyle(2, 0x333333);
        handle.setInteractive({ draggable: true });
        
        // 设置初始位置
        const initialX = (initialValue - 0.5) * width;
        handle.x = Math.max(-width/2, Math.min(width/2, initialX));
        
        // 拖拽事件
        handle.on('drag', (pointer, dragX) => {
            const clampedX = Math.max(-width/2, Math.min(width/2, dragX));
            handle.x = clampedX;
            
            const value = (clampedX + width/2) / width;
            if (onChange) {
                onChange(value);
            }
        });
        
        container.add([track, handle]);
        
        // 添加设置值方法
        container.setValue = (value) => {
            const clampedValue = Math.max(0, Math.min(1, value));
            handle.x = (clampedValue - 0.5) * width;
        };
        
        // 添加获取值方法
        container.getValue = () => {
            return (handle.x + width/2) / width;
        };
        
        this.elements[key] = container;
        return container;
    }
    
    /**
     * 创建容器
     * @param {string} key - 容器键名
     * @param {number} x - X坐标
     * @param {number} y - Y坐标
     */
    createContainer(key, x, y) {
        const container = this.scene.add.container(x, y);
        this.containers[key] = container;
        return container;
    }
    
    /**
     * 创建面板
     * @param {string} key - 面板键名
     * @param {number} x - X坐标
     * @param {number} y - Y坐标
     * @param {number} width - 宽度
     * @param {number} height - 高度
     * @param {number} color - 背景颜色
     * @param {number} alpha - 透明度
     */
    createPanel(key, x, y, width, height, color = 0x000000, alpha = 0.8) {
        const panel = this.scene.add.rectangle(x, y, width, height, color, alpha);
        panel.setStrokeStyle(2, 0x666666);
        
        this.elements[key] = panel;
        return panel;
    }
    
    /**
     * 更新文本内容
     * @param {string} key - 元素键名
     * @param {string} text - 新文本内容
     */
    updateText(key, text) {
        const element = this.elements[key];
        if (element && element.setText) {
            element.setText(text);
        }
    }
    
    /**
     * 设置元素可见性
     * @param {string} key - 元素键名
     * @param {boolean} visible - 是否可见
     */
    setVisible(key, visible) {
        const element = this.elements[key] || this.containers[key];
        if (element) {
            element.setVisible(visible);
        }
    }
    
    /**
     * 设置元素透明度
     * @param {string} key - 元素键名
     * @param {number} alpha - 透明度 (0-1)
     */
    setAlpha(key, alpha) {
        const element = this.elements[key] || this.containers[key];
        if (element) {
            element.setAlpha(alpha);
        }
    }
    
    /**
     * 移除元素
     * @param {string} key - 元素键名
     */
    removeElement(key) {
        const element = this.elements[key] || this.containers[key];
        if (element) {
            element.destroy();
            delete this.elements[key];
            delete this.containers[key];
        }
    }
    
    /**
     * 创建动画效果
     * @param {string} key - 元素键名
     * @param {object} config - 动画配置
     */
    animateElement(key, config) {
        const element = this.elements[key] || this.containers[key];
        if (element) {
            return this.scene.tweens.add({
                targets: element,
                ...config
            });
        }
    }
    
    /**
     * 销毁所有UI元素
     */
    destroy() {
        Object.values(this.elements).forEach(element => {
            if (element && element.destroy) {
                element.destroy();
            }
        });
        
        Object.values(this.containers).forEach(container => {
            if (container && container.destroy) {
                container.destroy();
            }
        });
        
        this.elements = {};
        this.containers = {};
        this.groups = {};
    }
}
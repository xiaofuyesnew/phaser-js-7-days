/**
 * 触摸控制系统
 * 为移动设备提供虚拟按钮和手势控制
 */
export class TouchControls {
    constructor(scene) {
        this.scene = scene;
        this.enabled = false;
        this.visible = false;
        
        // 虚拟按钮容器
        this.virtualButtons = new Map();
        this.container = null;
        
        // 输入状态
        this.inputState = {
            direction: { x: 0, y: 0 },
            buttons: new Map()
        };
        
        // 配置
        this.config = {
            buttonSize: 60,
            padSize: 120,
            opacity: 0.7,
            margin: 20
        };
        
        this.init();
    }
    
    init() {
        // 检查是否需要触摸控制
        if (this.shouldEnableTouchControls()) {
            this.enabled = true;
            this.createTouchControls();
            this.setupEventListeners();
        }
    }
    
    shouldEnableTouchControls() {
        // 检查设备是否支持触摸
        const hasTouch = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
        
        // 检查是否为移动设备
        const isMobile = /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
        
        // 检查屏幕尺寸
        const isSmallScreen = window.innerWidth <= 1024;
        
        return hasTouch && (isMobile || isSmallScreen);
    }
    
    createTouchControls() {
        // 创建主容器
        this.container = this.scene.add.container(0, 0);
        this.container.setScrollFactor(0);
        this.container.setDepth(10000);
        this.container.setVisible(false);
        
        // 创建虚拟方向盘
        this.createDirectionPad();
        
        // 创建动作按钮
        this.createActionButtons();
        
        // 创建菜单按钮
        this.createMenuButton();
        
        console.log('Touch controls created');
    }
    
    createDirectionPad() {
        const padSize = this.config.padSize;
        const margin = this.config.margin;
        const padX = margin + padSize / 2;
        const padY = this.scene.cameras.main.height - margin - padSize / 2;
        
        // 方向盘背景
        const padBg = this.scene.add.circle(padX, padY, padSize / 2, 0x000000, this.config.opacity * 0.5);
        padBg.setStrokeStyle(2, 0xffffff, this.config.opacity);
        
        // 方向盘摇杆
        const stick = this.scene.add.circle(padX, padY, 25, 0xffffff, this.config.opacity);
        stick.setStrokeStyle(2, 0x000000, this.config.opacity);
        
        // 添加到容器
        this.container.add([padBg, stick]);
        
        // 设置交互
        this.setupDirectionPadInteraction(padBg, stick, padX, padY, padSize / 2);
        
        this.virtualButtons.set('dpad', {
            background: padBg,
            stick: stick,
            centerX: padX,
            centerY: padY,
            radius: padSize / 2
        });
    }
    
    setupDirectionPadInteraction(padBg, stick, centerX, centerY, radius) {
        // 使背景可交互
        padBg.setInteractive(new Phaser.Geom.Circle(0, 0, radius), Phaser.Geom.Circle.Contains);
        
        let isDragging = false;
        let pointerId = null;
        
        // 开始拖拽
        padBg.on('pointerdown', (pointer) => {
            if (isDragging) return;
            
            isDragging = true;
            pointerId = pointer.id;
            
            this.updateStickPosition(pointer, stick, centerX, centerY, radius);
        });
        
        // 拖拽中
        this.scene.input.on('pointermove', (pointer) => {
            if (!isDragging || pointer.id !== pointerId) return;
            
            this.updateStickPosition(pointer, stick, centerX, centerY, radius);
        });
        
        // 结束拖拽
        this.scene.input.on('pointerup', (pointer) => {
            if (!isDragging || pointer.id !== pointerId) return;
            
            isDragging = false;
            pointerId = null;
            
            // 回弹到中心
            this.scene.tweens.add({
                targets: stick,
                x: centerX,
                y: centerY,
                duration: 200,
                ease: 'Back.easeOut'
            });
            
            // 重置输入状态
            this.inputState.direction = { x: 0, y: 0 };
            this.emitDirectionInput(0, 0);
        });
    }
    
    updateStickPosition(pointer, stick, centerX, centerY, maxRadius) {
        // 计算相对位置
        const deltaX = pointer.x - centerX;
        const deltaY = pointer.y - centerY;
        const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
        
        // 限制在圆形范围内
        const stickRadius = 25;
        const maxDistance = maxRadius - stickRadius;
        
        if (distance <= maxDistance) {
            stick.x = pointer.x;
            stick.y = pointer.y;
        } else {
            const angle = Math.atan2(deltaY, deltaX);
            stick.x = centerX + Math.cos(angle) * maxDistance;
            stick.y = centerY + Math.sin(angle) * maxDistance;
        }
        
        // 计算输入值 (-1 到 1)
        const inputX = (stick.x - centerX) / maxDistance;
        const inputY = (stick.y - centerY) / maxDistance;
        
        // 更新输入状态
        this.inputState.direction = { x: inputX, y: inputY };
        this.emitDirectionInput(inputX, inputY);
    }
    
    createActionButtons() {
        const buttonSize = this.config.buttonSize;
        const margin = this.config.margin;
        const rightMargin = margin + buttonSize / 2;
        const bottomMargin = margin + buttonSize / 2;
        
        // 按钮配置
        const buttons = [
            {
                key: 'jump',
                label: 'Jump',
                color: 0x4CAF50,
                x: this.scene.cameras.main.width - rightMargin,
                y: this.scene.cameras.main.height - bottomMargin
            },
            {
                key: 'attack',
                label: 'Fire',
                color: 0xF44336,
                x: this.scene.cameras.main.width - rightMargin - buttonSize - 10,
                y: this.scene.cameras.main.height - bottomMargin
            },
            {
                key: 'special',
                label: 'Spec',
                color: 0x2196F3,
                x: this.scene.cameras.main.width - rightMargin,
                y: this.scene.cameras.main.height - bottomMargin - buttonSize - 10
            }
        ];
        
        buttons.forEach(buttonConfig => {
            this.createActionButton(buttonConfig);
        });
    }
    
    createActionButton(config) {
        // 创建按钮背景
        const button = this.scene.add.circle(
            config.x,
            config.y,
            this.config.buttonSize / 2,
            config.color,
            this.config.opacity
        );
        button.setStrokeStyle(2, 0xffffff, this.config.opacity);
        
        // 创建按钮文字
        const text = this.scene.add.text(
            config.x,
            config.y,
            config.label,
            {
                fontSize: '14px',
                fill: '#ffffff',
                fontStyle: 'bold'
            }
        );
        text.setOrigin(0.5);
        
        // 添加到容器
        this.container.add([button, text]);
        
        // 设置交互
        this.setupButtonInteraction(button, config.key);
        
        this.virtualButtons.set(config.key, {
            button: button,
            text: text,
            originalAlpha: this.config.opacity
        });
    }
    
    setupButtonInteraction(button, key) {
        button.setInteractive();
        
        button.on('pointerdown', () => {
            button.setAlpha(0.5);
            this.inputState.buttons.set(key, true);
            this.emitButtonInput(key, true);
        });
        
        button.on('pointerup', () => {
            button.setAlpha(this.config.opacity);
            this.inputState.buttons.set(key, false);
            this.emitButtonInput(key, false);
        });
        
        button.on('pointerout', () => {
            button.setAlpha(this.config.opacity);
            this.inputState.buttons.set(key, false);
            this.emitButtonInput(key, false);
        });
    }
    
    createMenuButton() {
        const buttonSize = 40;
        const margin = 20;
        
        // 菜单按钮
        const menuButton = this.scene.add.circle(
            this.scene.cameras.main.width - margin - buttonSize / 2,
            margin + buttonSize / 2,
            buttonSize / 2,
            0x666666,
            this.config.opacity
        );
        menuButton.setStrokeStyle(2, 0xffffff, this.config.opacity);
        
        // 菜单图标（三条线）
        const iconGraphics = this.scene.add.graphics();
        iconGraphics.lineStyle(2, 0xffffff, this.config.opacity);
        
        const iconX = menuButton.x;
        const iconY = menuButton.y;
        const lineWidth = 16;
        const lineSpacing = 4;
        
        for (let i = 0; i < 3; i++) {
            const y = iconY - lineSpacing + i * lineSpacing;
            iconGraphics.moveTo(iconX - lineWidth / 2, y);
            iconGraphics.lineTo(iconX + lineWidth / 2, y);
        }
        iconGraphics.strokePath();
        
        // 添加到容器
        this.container.add([menuButton, iconGraphics]);
        
        // 设置交互
        menuButton.setInteractive();
        menuButton.on('pointerdown', () => {
            this.emitMenuInput();
        });
        
        this.virtualButtons.set('menu', {
            button: menuButton,
            icon: iconGraphics
        });
    }
    
    setupEventListeners() {
        // 监听游戏尺寸变化
        this.scene.events.on('resize', (resizeInfo) => {
            this.handleResize(resizeInfo);
        });
        
        // 监听场景暂停/恢复
        this.scene.events.on('pause', () => {
            this.hide();
        });
        
        this.scene.events.on('resume', () => {
            if (this.enabled) {
                this.show();
            }
        });
    }
    
    emitDirectionInput(x, y) {
        this.scene.events.emit('touchDirection', { x, y });
        
        // 也可以触发全局事件
        window.dispatchEvent(new CustomEvent('gameTouch', {
            detail: { type: 'direction', x, y }
        }));
    }
    
    emitButtonInput(button, pressed) {
        this.scene.events.emit('touchButton', { button, pressed });
        
        // 也可以触发全局事件
        window.dispatchEvent(new CustomEvent('gameTouch', {
            detail: { type: 'button', button, pressed }
        }));
    }
    
    emitMenuInput() {
        this.scene.events.emit('touchMenu');
        
        // 也可以触发全局事件
        window.dispatchEvent(new CustomEvent('gameTouch', {
            detail: { type: 'menu' }
        }));
    }
    
    show() {
        if (!this.enabled) return;
        
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
    
    handleResize(resizeInfo) {
        if (!this.enabled || !this.container) return;
        
        const { scale, gameWidth, gameHeight } = resizeInfo;
        
        // 重新定位虚拟按钮
        this.repositionControls(gameWidth, gameHeight, scale);
    }
    
    repositionControls(gameWidth, gameHeight, scale) {
        const margin = this.config.margin * scale;
        const buttonSize = this.config.buttonSize * scale;
        const padSize = this.config.padSize * scale;
        
        // 重新定位方向盘
        const dpad = this.virtualButtons.get('dpad');
        if (dpad) {
            const padX = margin + padSize / 2;
            const padY = gameHeight - margin - padSize / 2;
            
            dpad.background.setPosition(padX, padY);
            dpad.background.setRadius(padSize / 2);
            dpad.stick.setPosition(padX, padY);
            
            // 更新中心点
            dpad.centerX = padX;
            dpad.centerY = padY;
            dpad.radius = padSize / 2;
        }
        
        // 重新定位动作按钮
        const actionButtons = ['jump', 'attack', 'special'];
        actionButtons.forEach((key, index) => {
            const buttonData = this.virtualButtons.get(key);
            if (buttonData) {
                let x, y;
                
                switch (key) {
                    case 'jump':
                        x = gameWidth - margin - buttonSize / 2;
                        y = gameHeight - margin - buttonSize / 2;
                        break;
                    case 'attack':
                        x = gameWidth - margin - buttonSize / 2 - buttonSize - 10 * scale;
                        y = gameHeight - margin - buttonSize / 2;
                        break;
                    case 'special':
                        x = gameWidth - margin - buttonSize / 2;
                        y = gameHeight - margin - buttonSize / 2 - buttonSize - 10 * scale;
                        break;
                }
                
                buttonData.button.setPosition(x, y);
                buttonData.button.setRadius(buttonSize / 2);
                
                if (buttonData.text) {
                    buttonData.text.setPosition(x, y);
                    buttonData.text.setScale(scale);
                }
            }
        });
        
        // 重新定位菜单按钮
        const menuButton = this.virtualButtons.get('menu');
        if (menuButton) {
            const menuButtonSize = 40 * scale;
            const x = gameWidth - margin - menuButtonSize / 2;
            const y = margin + menuButtonSize / 2;
            
            menuButton.button.setPosition(x, y);
            menuButton.button.setRadius(menuButtonSize / 2);
            
            if (menuButton.icon) {
                menuButton.icon.setPosition(x, y);
                menuButton.icon.setScale(scale);
            }
        }
    }
    
    // 获取当前输入状态
    getInputState() {
        return {
            direction: { ...this.inputState.direction },
            buttons: new Map(this.inputState.buttons)
        };
    }
    
    // 检查按钮是否被按下
    isButtonPressed(button) {
        return this.inputState.buttons.get(button) || false;
    }
    
    // 获取方向输入
    getDirectionInput() {
        return { ...this.inputState.direction };
    }
    
    // 设置控制器可见性
    setVisible(visible) {
        if (visible) {
            this.show();
        } else {
            this.hide();
        }
    }
    
    // 设置控制器透明度
    setOpacity(opacity) {
        this.config.opacity = opacity;
        
        this.virtualButtons.forEach(buttonData => {
            if (buttonData.button) {
                buttonData.button.setAlpha(opacity);
            }
            if (buttonData.background) {
                buttonData.background.setAlpha(opacity * 0.5);
            }
            if (buttonData.stick) {
                buttonData.stick.setAlpha(opacity);
            }
        });
    }
    
    // 销毁触摸控制
    destroy() {
        if (this.container) {
            this.container.destroy();
        }
        
        this.virtualButtons.clear();
        this.inputState.buttons.clear();
        
        console.log('Touch controls destroyed');
    }
}
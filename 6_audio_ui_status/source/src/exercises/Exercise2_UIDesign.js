import { UIManager } from '../managers/UIManager.js';

/**
 * 练习2：UI界面设计
 * 
 * 学习目标：
 * - 掌握UI元素的创建和布局
 * - 实现响应式UI设计
 * - 创建交互式UI组件
 * - 学习UI动画和效果
 */
export class UIDesignExercise extends Phaser.Scene {
    constructor() {
        super({ key: 'UIDesignExercise' });
    }
    
    create() {
        this.ui = new UIManager(this);
        
        // 创建练习界面
        this.createExerciseHeader();
        
        // 创建基础UI元素演示
        this.createBasicUIDemo();
        
        // 创建交互式组件演示
        this.createInteractiveComponentsDemo();
        
        // 创建布局系统演示
        this.createLayoutSystemDemo();
        
        // 创建动画效果演示
        this.createAnimationDemo();
        
        // 创建响应式设计演示
        this.createResponsiveDesignDemo();
    }
    
    /**
     * 创建练习标题
     */
    createExerciseHeader() {
        const { width, height } = this.cameras.main;
        
        // 标题
        this.ui.createText('title', width/2, 30, 'Exercise 2: UI Design', {
            fontSize: '24px',
            color: '#ffffff',
            fontStyle: 'bold'
        }).setOrigin(0.5);
        
        // 说明文本
        this.ui.createText('subtitle', width/2, 60, 'Learn UI creation, layout, and interaction design', {
            fontSize: '16px',
            color: '#cccccc'
        }).setOrigin(0.5);
        
        // 返回按钮
        this.ui.createButton('backBtn', 50, height - 30, '← Back', () => {
            this.scene.start('MenuScene');
        }, this, {
            fontSize: '14px',
            backgroundColor: '#666666',
            padding: { x: 10, y: 5 }
        });
    }
    
    /**
     * 创建基础UI元素演示
     */
    createBasicUIDemo() {
        const { width } = this.cameras.main;
        let yPos = 100;
        
        // 区域标题
        this.ui.createText('basicTitle', 100, yPos, 'Basic UI Elements', {
            fontSize: '18px',
            color: '#ffff00',
            fontStyle: 'bold'
        });
        
        yPos += 30;
        
        // 文本元素
        this.ui.createText('sampleText', 100, yPos, 'Sample Text Element', {
            fontSize: '16px',
            color: '#ffffff'
        });
        
        yPos += 25;
        
        // 按钮元素
        this.ui.createButton('sampleBtn', 100, yPos, 'Sample Button', () => {
            this.showNotification('Button clicked!', '#4CAF50');
        }, this, {
            fontSize: '14px',
            backgroundColor: '#2196F3',
            padding: { x: 15, y: 8 }
        });
        
        yPos += 35;
        
        // 进度条
        this.ui.createText('progressLabel', 100, yPos, 'Progress Bar:', {
            fontSize: '14px',
            color: '#cccccc'
        });
        
        this.progressBar = this.ui.createProgressBar('progressBar', 200, yPos + 5, 150, 16, 0x4CAF50);
        
        // 进度条动画
        let progress = 0;
        const progressTimer = this.time.addEvent({
            delay: 50,
            callback: () => {
                progress += 0.02;
                this.progressBar.updateProgress(progress);
                
                if (progress >= 1) {
                    progress = 0;
                }
            },
            repeat: -1
        });
        
        yPos += 35;
        
        // 滑块
        this.ui.createText('sliderLabel', 100, yPos, 'Slider:', {
            fontSize: '14px',
            color: '#cccccc'
        });
        
        this.sliderValue = this.ui.createText('sliderValue', 320, yPos, '50%', {
            fontSize: '14px',
            color: '#00ff00'
        });
        
        this.slider = this.ui.createSlider('slider', 200, yPos + 5, 100, 0.5, (value) => {
            this.sliderValue.setText(Math.round(value * 100) + '%');
        });
        
        yPos += 35;
        
        // 面板
        this.ui.createText('panelLabel', 100, yPos, 'Panel:', {
            fontSize: '14px',
            color: '#cccccc'
        });
        
        const panel = this.ui.createPanel('samplePanel', 250, yPos + 15, 120, 60, 0x333333, 0.8);
        
        this.ui.createText('panelText', 250, yPos + 15, 'Panel Content', {
            fontSize: '12px',
            color: '#ffffff'
        }).setOrigin(0.5);
    }
    
    /**
     * 创建交互式组件演示
     */
    createInteractiveComponentsDemo() {
        const { width } = this.cameras.main;
        let yPos = 100;
        const xPos = width/2 + 50;
        
        // 区域标题
        this.ui.createText('interactiveTitle', xPos, yPos, 'Interactive Components', {
            fontSize: '18px',
            color: '#ffff00',
            fontStyle: 'bold'
        });
        
        yPos += 30;
        
        // 切换按钮
        this.toggleState = false;
        this.toggleButton = this.ui.createButton('toggleBtn', xPos, yPos, 'Toggle: OFF', () => {
            this.toggleState = !this.toggleState;
            this.toggleButton.setText(`Toggle: ${this.toggleState ? 'ON' : 'OFF'}`);
            this.toggleButton.setStyle({
                backgroundColor: this.toggleState ? '#4CAF50' : '#f44336'
            });
            this.showNotification(`Toggle ${this.toggleState ? 'enabled' : 'disabled'}`, 
                this.toggleState ? '#4CAF50' : '#f44336');
        }, this, {
            fontSize: '14px',
            backgroundColor: '#f44336',
            padding: { x: 15, y: 8 }
        });
        
        yPos += 35;
        
        // 计数器
        this.counter = 0;
        this.ui.createText('counterLabel', xPos - 50, yPos, 'Counter:', {
            fontSize: '14px',
            color: '#cccccc'
        });
        
        this.counterDisplay = this.ui.createText('counterDisplay', xPos, yPos, '0', {
            fontSize: '16px',
            color: '#00ff00',
            fontStyle: 'bold'
        }).setOrigin(0.5);
        
        this.ui.createButton('decreaseBtn', xPos - 40, yPos + 25, '-', () => {
            this.counter--;
            this.updateCounter();
        }, this, {
            fontSize: '16px',
            backgroundColor: '#f44336',
            padding: { x: 10, y: 5 }
        });
        
        this.ui.createButton('increaseBtn', xPos + 40, yPos + 25, '+', () => {
            this.counter++;
            this.updateCounter();
        }, this, {
            fontSize: '16px',
            backgroundColor: '#4CAF50',
            padding: { x: 10, y: 5 }
        });
        
        yPos += 60;
        
        // 选项卡
        this.createTabSystem(xPos, yPos);
        
        yPos += 80;
        
        // 下拉菜单模拟
        this.createDropdownMenu(xPos, yPos);
    }
    
    /**
     * 创建选项卡系统
     */
    createTabSystem(x, y) {
        this.ui.createText('tabLabel', x, y, 'Tab System:', {
            fontSize: '14px',
            color: '#cccccc'
        }).setOrigin(0.5);
        
        const tabs = ['Tab 1', 'Tab 2', 'Tab 3'];
        this.activeTab = 0;
        this.tabButtons = [];
        this.tabContents = [];
        
        // 创建选项卡按钮
        tabs.forEach((tabName, index) => {
            const tabBtn = this.ui.createButton(`tab${index}`, x - 60 + index * 40, y + 20, 
                tabName, () => {
                    this.switchTab(index);
                }, this, {
                    fontSize: '12px',
                    backgroundColor: index === 0 ? '#2196F3' : '#666666',
                    padding: { x: 8, y: 4 }
                });
            this.tabButtons.push(tabBtn);
        });
        
        // 创建选项卡内容
        const contentTexts = ['Content for Tab 1', 'Content for Tab 2', 'Content for Tab 3'];
        contentTexts.forEach((content, index) => {
            const contentText = this.ui.createText(`tabContent${index}`, x, y + 50, content, {
                fontSize: '12px',
                color: '#ffffff'
            }).setOrigin(0.5);
            
            contentText.setVisible(index === 0);
            this.tabContents.push(contentText);
        });
    }
    
    /**
     * 切换选项卡
     */
    switchTab(tabIndex) {
        this.activeTab = tabIndex;
        
        // 更新按钮样式
        this.tabButtons.forEach((btn, index) => {
            btn.setStyle({
                backgroundColor: index === tabIndex ? '#2196F3' : '#666666'
            });
        });
        
        // 更新内容显示
        this.tabContents.forEach((content, index) => {
            content.setVisible(index === tabIndex);
        });
        
        this.showNotification(`Switched to Tab ${tabIndex + 1}`, '#2196F3');
    }
    
    /**
     * 创建下拉菜单
     */
    createDropdownMenu(x, y) {
        this.ui.createText('dropdownLabel', x, y, 'Dropdown Menu:', {
            fontSize: '14px',
            color: '#cccccc'
        }).setOrigin(0.5);
        
        this.selectedOption = 'Option 1';
        this.dropdownOpen = false;
        
        // 主按钮
        this.dropdownButton = this.ui.createButton('dropdownBtn', x, y + 20, 
            this.selectedOption + ' ▼', () => {
                this.toggleDropdown();
            }, this, {
                fontSize: '12px',
                backgroundColor: '#666666',
                padding: { x: 15, y: 6 }
            });
        
        // 下拉选项
        const options = ['Option 1', 'Option 2', 'Option 3'];
        this.dropdownOptions = [];
        
        options.forEach((option, index) => {
            const optionBtn = this.ui.createButton(`option${index}`, x, y + 45 + index * 25, 
                option, () => {
                    this.selectOption(option);
                }, this, {
                    fontSize: '12px',
                    backgroundColor: '#555555',
                    padding: { x: 15, y: 4 }
                });
            
            optionBtn.setVisible(false);
            this.dropdownOptions.push(optionBtn);
        });
    }
    
    /**
     * 切换下拉菜单
     */
    toggleDropdown() {
        this.dropdownOpen = !this.dropdownOpen;
        
        this.dropdownOptions.forEach(option => {
            option.setVisible(this.dropdownOpen);
        });
        
        this.dropdownButton.setText(this.selectedOption + (this.dropdownOpen ? ' ▲' : ' ▼'));
    }
    
    /**
     * 选择下拉选项
     */
    selectOption(option) {
        this.selectedOption = option;
        this.dropdownButton.setText(option + ' ▼');
        this.toggleDropdown();
        this.showNotification(`Selected: ${option}`, '#4CAF50');
    }
    
    /**
     * 创建布局系统演示
     */
    createLayoutSystemDemo() {
        const { width, height } = this.cameras.main;
        let yPos = height - 200;
        
        // 区域标题
        this.ui.createText('layoutTitle', 100, yPos, 'Layout Systems', {
            fontSize: '18px',
            color: '#ffff00',
            fontStyle: 'bold'
        });
        
        yPos += 30;
        
        // 网格布局演示
        this.ui.createText('gridLabel', 100, yPos, 'Grid Layout:', {
            fontSize: '14px',
            color: '#cccccc'
        });
        
        // 创建3x3网格
        for (let row = 0; row < 3; row++) {
            for (let col = 0; col < 3; col++) {
                const x = 200 + col * 30;
                const y = yPos + 20 + row * 30;
                
                const cell = this.add.rectangle(x, y, 25, 25, 0x444444);
                cell.setStrokeStyle(1, 0x666666);
                cell.setInteractive();
                
                cell.on('pointerover', () => {
                    cell.setFillStyle(0x666666);
                });
                
                cell.on('pointerout', () => {
                    cell.setFillStyle(0x444444);
                });
                
                cell.on('pointerdown', () => {
                    this.showNotification(`Grid cell (${row}, ${col}) clicked`, '#2196F3');
                });
            }
        }
        
        // 弹性布局演示
        this.ui.createText('flexLabel', 350, yPos, 'Flex Layout:', {
            fontSize: '14px',
            color: '#cccccc'
        });
        
        const flexItems = ['A', 'B', 'C', 'D'];
        flexItems.forEach((item, index) => {
            const flexItem = this.ui.createButton(`flex${index}`, 400 + index * 40, yPos + 40, 
                item, () => {
                    this.showNotification(`Flex item ${item} clicked`, '#FF9800');
                }, this, {
                    fontSize: '14px',
                    backgroundColor: '#FF9800',
                    padding: { x: 8, y: 6 }
                });
        });
    }
    
    /**
     * 创建动画效果演示
     */
    createAnimationDemo() {
        const { width, height } = this.cameras.main;
        const xPos = width/2 + 200;
        let yPos = height - 200;
        
        // 区域标题
        this.ui.createText('animationTitle', xPos, yPos, 'UI Animations', {
            fontSize: '18px',
            color: '#ffff00',
            fontStyle: 'bold'
        });
        
        yPos += 30;
        
        // 淡入淡出动画
        this.ui.createButton('fadeBtn', xPos, yPos, 'Fade Animation', () => {
            this.demonstrateFadeAnimation(xPos + 100, yPos);
        }, this, {
            fontSize: '12px',
            backgroundColor: '#9C27B0',
            padding: { x: 10, y: 5 }
        });
        
        yPos += 30;
        
        // 缩放动画
        this.ui.createButton('scaleBtn', xPos, yPos, 'Scale Animation', () => {
            this.demonstrateScaleAnimation(xPos + 100, yPos);
        }, this, {
            fontSize: '12px',
            backgroundColor: '#E91E63',
            padding: { x: 10, y: 5 }
        });
        
        yPos += 30;
        
        // 滑动动画
        this.ui.createButton('slideBtn', xPos, yPos, 'Slide Animation', () => {
            this.demonstrateSlideAnimation(xPos + 100, yPos);
        }, this, {
            fontSize: '12px',
            backgroundColor: '#00BCD4',
            padding: { x: 10, y: 5 }
        });
        
        yPos += 30;
        
        // 弹跳动画
        this.ui.createButton('bounceBtn', xPos, yPos, 'Bounce Animation', () => {
            this.demonstrateBounceAnimation(xPos + 100, yPos);
        }, this, {
            fontSize: '12px',
            backgroundColor: '#4CAF50',
            padding: { x: 10, y: 5 }
        });
    }
    
    /**
     * 创建响应式设计演示
     */
    createResponsiveDesignDemo() {
        const { width, height } = this.cameras.main;
        
        // 响应式容器
        this.responsiveContainer = this.ui.createContainer('responsiveContainer', width - 150, 150);
        
        // 容器背景
        const containerBg = this.add.rectangle(0, 0, 200, 100, 0x333333, 0.8);
        containerBg.setStrokeStyle(2, 0x666666);
        this.responsiveContainer.add(containerBg);
        
        // 响应式文本
        const responsiveText = this.add.text(0, -20, 'Responsive UI', {
            fontSize: '16px',
            color: '#ffffff',
            fontStyle: 'bold'
        }).setOrigin(0.5);
        this.responsiveContainer.add(responsiveText);
        
        // 尺寸信息
        this.sizeInfo = this.add.text(0, 10, `${width} x ${height}`, {
            fontSize: '12px',
            color: '#cccccc'
        }).setOrigin(0.5);
        this.responsiveContainer.add(this.sizeInfo);
        
        // 模拟窗口大小变化
        this.ui.createButton('resizeBtn', width - 150, 220, 'Simulate Resize', () => {
            this.simulateResize();
        }, this, {
            fontSize: '12px',
            backgroundColor: '#607D8B',
            padding: { x: 10, y: 5 }
        });
    }
    
    /**
     * 演示淡入淡出动画
     */
    demonstrateFadeAnimation(x, y) {
        const fadeElement = this.add.circle(x, y, 15, 0x9C27B0);
        
        this.tweens.add({
            targets: fadeElement,
            alpha: 0,
            duration: 1000,
            yoyo: true,
            repeat: 1,
            ease: 'Power2',
            onComplete: () => {
                fadeElement.destroy();
            }
        });
    }
    
    /**
     * 演示缩放动画
     */
    demonstrateScaleAnimation(x, y) {
        const scaleElement = this.add.circle(x, y, 10, 0xE91E63);
        
        this.tweens.add({
            targets: scaleElement,
            scaleX: 2,
            scaleY: 2,
            duration: 500,
            yoyo: true,
            repeat: 1,
            ease: 'Back.easeInOut',
            onComplete: () => {
                scaleElement.destroy();
            }
        });
    }
    
    /**
     * 演示滑动动画
     */
    demonstrateSlideAnimation(x, y) {
        const slideElement = this.add.rectangle(x - 50, y, 20, 20, 0x00BCD4);
        
        this.tweens.add({
            targets: slideElement,
            x: x + 50,
            duration: 1000,
            ease: 'Power2',
            onComplete: () => {
                slideElement.destroy();
            }
        });
    }
    
    /**
     * 演示弹跳动画
     */
    demonstrateBounceAnimation(x, y) {
        const bounceElement = this.add.circle(x, y, 12, 0x4CAF50);
        
        this.tweens.add({
            targets: bounceElement,
            y: y - 30,
            duration: 300,
            ease: 'Power2',
            yoyo: true,
            repeat: 3,
            onComplete: () => {
                bounceElement.destroy();
            }
        });
    }
    
    /**
     * 模拟窗口大小变化
     */
    simulateResize() {
        const newWidth = Phaser.Math.Between(600, 1000);
        const newHeight = Phaser.Math.Between(400, 700);
        
        this.sizeInfo.setText(`${newWidth} x ${newHeight}`);
        
        // 调整响应式容器位置
        this.tweens.add({
            targets: this.responsiveContainer,
            x: newWidth - 150,
            duration: 500,
            ease: 'Power2'
        });
        
        this.showNotification(`Simulated resize to ${newWidth}x${newHeight}`, '#607D8B');
    }
    
    /**
     * 更新计数器显示
     */
    updateCounter() {
        this.counterDisplay.setText(this.counter.toString());
        
        // 计数器动画
        this.tweens.add({
            targets: this.counterDisplay,
            scaleX: 1.2,
            scaleY: 1.2,
            duration: 100,
            yoyo: true,
            ease: 'Power2'
        });
    }
    
    /**
     * 显示通知
     */
    showNotification(message, color = '#4CAF50') {
        const { width } = this.cameras.main;
        
        const notification = this.add.text(width/2, 80, message, {
            fontSize: '14px',
            color: '#ffffff',
            backgroundColor: color,
            padding: { x: 10, y: 5 }
        }).setOrigin(0.5);
        
        this.tweens.add({
            targets: notification,
            alpha: 0,
            y: 60,
            duration: 2000,
            ease: 'Power2',
            onComplete: () => {
                notification.destroy();
            }
        });
    }
    
    /**
     * 销毁场景
     */
    destroy() {
        if (this.ui) {
            this.ui.destroy();
        }
    }
}
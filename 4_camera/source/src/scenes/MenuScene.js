import Phaser from 'phaser'

export default class MenuScene extends Phaser.Scene {
    constructor() {
        super({ key: 'MenuScene' })
        this.menuItems = []
        this.selectedIndex = 0
    }
    
    preload() {
        this.createMenuTextures()
    }
    
    create() {
        // 创建标题
        this.createTitle()
        
        // 创建菜单项
        this.createMenuItems()
        
        // 创建说明
        this.createInstructions()
        
        // 设置输入
        this.setupInput()
    }
    
    createMenuTextures() {
        // 菜单项背景
        const menuBg = this.add.graphics()
        menuBg.fillStyle(0x3498db, 0.8)
        menuBg.fillRoundedRect(0, 0, 400, 60, 10)
        menuBg.generateTexture('menu_item', 400, 60)
        menuBg.destroy()
        
        // 选中状态背景
        const selectedBg = this.add.graphics()
        selectedBg.fillStyle(0xe74c3c, 0.9)
        selectedBg.fillRoundedRect(0, 0, 400, 60, 10)
        selectedBg.generateTexture('menu_item_selected', 400, 60)
        selectedBg.destroy()
    }
    
    createTitle() {
        const title = this.add.text(this.cameras.main.centerX, 100, 
            'Day 4: 摄像机与场景滚动', {
            fontSize: '32px',
            fill: '#ffffff',
            fontStyle: 'bold'
        })
        title.setOrigin(0.5)
        
        const subtitle = this.add.text(this.cameras.main.centerX, 140, 
            'Camera System & Scene Scrolling', {
            fontSize: '16px',
            fill: '#bdc3c7'
        })
        subtitle.setOrigin(0.5)
    }
    
    createMenuItems() {
        const menuConfig = [
            {
                text: '主要演示 - 完整摄像机系统',
                description: '体验完整的摄像机跟随、视差滚动和特效系统',
                scene: 'GameScene'
            },
            {
                text: '高级演示 - 电影级摄像机运镜',
                description: '体验电影级摄像机运镜和复杂场景滚动',
                scene: 'AdvancedCameraDemo'
            },
            {
                text: '练习1 - 基础摄像机跟随',
                description: '学习摄像机跟随的基本原理和实现',
                scene: 'Exercise1_BasicFollow'
            },
            {
                text: '练习2 - 视差滚动背景',
                description: '创建多层背景的视差滚动效果',
                scene: 'Exercise2_ParallaxScrolling'
            },
            {
                text: '练习3 - 摄像机特效系统',
                description: '实现震动、闪光、缩放等摄像机特效',
                scene: 'Exercise3_CameraEffects'
            }
        ]
        
        const startY = 220
        const itemHeight = 80
        
        menuConfig.forEach((config, index) => {
            const y = startY + index * itemHeight
            
            // 背景
            const bg = this.add.sprite(this.cameras.main.centerX, y, 'menu_item')
            bg.setOrigin(0.5)
            
            // 标题文本
            const titleText = this.add.text(this.cameras.main.centerX, y - 10, config.text, {
                fontSize: '18px',
                fill: '#ffffff',
                fontStyle: 'bold'
            })
            titleText.setOrigin(0.5)
            
            // 描述文本
            const descText = this.add.text(this.cameras.main.centerX, y + 15, config.description, {
                fontSize: '14px',
                fill: '#ecf0f1'
            })
            descText.setOrigin(0.5)
            
            // 存储菜单项
            this.menuItems.push({
                background: bg,
                title: titleText,
                description: descText,
                scene: config.scene,
                index: index
            })
            
            // 设置交互
            bg.setInteractive()
            bg.on('pointerover', () => this.selectItem(index))
            bg.on('pointerdown', () => this.activateItem(index))
        })
        
        // 初始选择第一项
        this.selectItem(0)
    }
    
    createInstructions() {
        const instructions = this.add.text(this.cameras.main.centerX, 
            this.cameras.main.height - 80, 
            '使用方向键或鼠标选择，回车键或点击确认\n' +
            '每个练习都有详细的说明和交互提示', {
            fontSize: '14px',
            fill: '#95a5a6',
            align: 'center'
        })
        instructions.setOrigin(0.5)
    }
    
    setupInput() {
        // 键盘控制
        const cursors = this.input.keyboard.createCursorKeys()
        const enterKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ENTER)
        
        // 上下选择
        cursors.up.on('down', () => {
            this.selectItem((this.selectedIndex - 1 + this.menuItems.length) % this.menuItems.length)
        })
        
        cursors.down.on('down', () => {
            this.selectItem((this.selectedIndex + 1) % this.menuItems.length)
        })
        
        // 确认选择
        enterKey.on('down', () => {
            this.activateItem(this.selectedIndex)
        })
    }
    
    selectItem(index) {
        // 重置所有项目
        this.menuItems.forEach(item => {
            item.background.setTexture('menu_item')
            item.title.setTint(0xffffff)
            item.description.setTint(0xecf0f1)
        })
        
        // 高亮选中项
        const selectedItem = this.menuItems[index]
        selectedItem.background.setTexture('menu_item_selected')
        selectedItem.title.setTint(0xffffff)
        selectedItem.description.setTint(0xffffff)
        
        this.selectedIndex = index
    }
    
    activateItem(index) {
        const selectedItem = this.menuItems[index]
        
        // 添加点击效果
        this.tweens.add({
            targets: selectedItem.background,
            scaleX: 0.95,
            scaleY: 0.95,
            duration: 100,
            yoyo: true,
            onComplete: () => {
                // 启动对应场景
                this.scene.start(selectedItem.scene)
            }
        })
    }
}
import { GameStateManager } from '../managers/GameStateManager.js';
import { UIManager } from '../managers/UIManager.js';

/**
 * 练习3：状态管理系统
 * 
 * 学习目标：
 * - 理解游戏状态的概念和管理
 * - 实现状态切换和数据持久化
 * - 创建成就系统和进度跟踪
 * - 学习事件驱动的状态管理
 */
export class StateManagementExercise extends Phaser.Scene {
    constructor() {
        super({ key: 'StateManagementExercise' });
    }
    
    init() {
        // 初始化状态管理器
        this.gameState = new GameStateManager();
        this.ui = new UIManager(this);
        
        // 演示数据
        this.simulationRunning = false;
        this.simulationTimer = null;
    }
    
    create() {
        // 创建练习界面
        this.createExerciseHeader();
        
        // 创建状态显示面板
        this.createStateDisplayPanel();
        
        // 创建状态控制面板
        this.createStateControlPanel();
        
        // 创建数据操作面板
        this.createDataOperationPanel();
        
        // 创建成就系统演示
        this.createAchievementSystemDemo();
        
        // 创建持久化演示
        this.createPersistenceDemo();
        
        // 设置事件监听
        this.setupEventListeners();
        
        // 初始更新显示
        this.updateStateDisplay();
    }
    
    /**
     * 创建练习标题
     */
    createExerciseHeader() {
        const { width, height } = this.cameras.main;
        
        // 标题
        this.ui.createText('title', width/2, 30, 'Exercise 3: State Management', {
            fontSize: '24px',
            color: '#ffffff',
            fontStyle: 'bold'
        }).setOrigin(0.5);
        
        // 说明文本
        this.ui.createText('subtitle', width/2, 60, 'Learn game state management and data persistence', {
            fontSize: '16px',
            color: '#cccccc'
        }).setOrigin(0.5);
        
        // 返回按钮
        this.ui.createButton('backBtn', 50, height - 30, '← Back', () => {
            this.cleanup();
            this.scene.start('MenuScene');
        }, this, {
            fontSize: '14px',
            backgroundColor: '#666666',
            padding: { x: 10, y: 5 }
        });
    }
    
    /**
     * 创建状态显示面板
     */
    createStateDisplayPanel() {
        const { width } = this.cameras.main;
        let yPos = 100;
        
        // 面板标题
        this.ui.createText('stateTitle', 50, yPos, 'Current Game State', {
            fontSize: '18px',
            color: '#ffff00',
            fontStyle: 'bold'
        });
        
        yPos += 30;
        
        // 创建状态显示面板
        this.statePanel = this.ui.createPanel('statePanel', 200, yPos + 80, 300, 140, 0x333333, 0.9);
        
        // 状态信息文本
        this.stateInfoTexts = {};
        
        const stateLabels = [
            { key: 'currentState', label: 'State:', value: 'menu' },
            { key: 'score', label: 'Score:', value: '0' },
            { key: 'level', label: 'Level:', value: '1' },
            { key: 'lives', label: 'Lives:', value: '3' },
            { key: 'health', label: 'Health:', value: '100/100' },
            { key: 'coins', label: 'Coins:', value: '0' }
        ];
        
        stateLabels.forEach((item, index) => {
            const row = Math.floor(index / 2);
            const col = index % 2;
            const x = 80 + col * 140;
            const y = yPos + 40 + row * 25;
            
            this.ui.createText(`${item.key}Label`, x, y, item.label, {
                fontSize: '14px',
                color: '#cccccc'
            });
            
            this.stateInfoTexts[item.key] = this.ui.createText(`${item.key}Value`, x + 60, y, item.value, {
                fontSize: '14px',
                color: '#00ff00',
                fontStyle: 'bold'
            });
        });
        
        // 实时更新指示器
        this.updateIndicator = this.add.circle(320, yPos + 20, 5, 0x00ff00);
        this.ui.createText('updateLabel', 340, yPos + 20, 'Live Updates', {
            fontSize: '12px',
            color: '#cccccc'
        });
        
        // 指示器闪烁动画
        this.tweens.add({
            targets: this.updateIndicator,
            alpha: 0.3,
            duration: 1000,
            yoyo: true,
            repeat: -1,
            ease: 'Power2'
        });
    }
    
    /**
     * 创建状态控制面板
     */
    createStateControlPanel() {
        const { width } = this.cameras.main;
        let yPos = 100;
        const xPos = width/2 + 50;
        
        // 面板标题
        this.ui.createText('controlTitle', xPos, yPos, 'State Controls', {
            fontSize: '18px',
            color: '#ffff00',
            fontStyle: 'bold'
        });
        
        yPos += 30;
        
        // 状态切换按钮
        const states = [
            { key: 'menu', name: 'Menu', color: '#2196F3' },
            { key: 'playing', name: 'Playing', color: '#4CAF50' },
            { key: 'paused', name: 'Paused', color: '#FF9800' },
            { key: 'gameOver', name: 'Game Over', color: '#f44336' }
        ];
        
        states.forEach((state, index) => {
            const row = Math.floor(index / 2);
            const col = index % 2;
            const x = xPos - 50 + col * 100;
            const y = yPos + row * 35;
            
            this.ui.createButton(`state_${state.key}`, x, y, state.name, () => {
                this.gameState.setState(state.key);
                this.updateStateDisplay();
                this.showNotification(`State changed to: ${state.name}`, state.color);
            }, this, {
                fontSize: '12px',
                backgroundColor: state.color,
                padding: { x: 12, y: 6 }
            });
        });
        
        yPos += 80;
        
        // 游戏模拟控制
        this.ui.createText('simulationTitle', xPos, yPos, 'Game Simulation', {
            fontSize: '16px',
            color: '#cccccc',
            fontStyle: 'bold'
        }).setOrigin(0.5);
        
        yPos += 25;
        
        this.simulationButton = this.ui.createButton('simulationBtn', xPos, yPos, 'Start Simulation', () => {
            this.toggleSimulation();
        }, this, {
            fontSize: '14px',
            backgroundColor: '#4CAF50',
            padding: { x: 15, y: 8 }
        });
    }
    
    /**
     * 创建数据操作面板
     */
    createDataOperationPanel() {
        let yPos = 320;
        
        // 面板标题
        this.ui.createText('dataTitle', 50, yPos, 'Data Operations', {
            fontSize: '18px',
            color: '#ffff00',
            fontStyle: 'bold'
        });
        
        yPos += 30;
        
        // 数据操作按钮
        const operations = [
            { name: 'Add Score', action: () => this.gameState.addScore(100), color: '#4CAF50' },
            { name: 'Take Damage', action: () => this.gameState.takeDamage(20), color: '#f44336' },
            { name: 'Heal', action: () => this.gameState.heal(15), color: '#00BCD4' },
            { name: 'Lose Life', action: () => this.gameState.loseLife(), color: '#FF5722' },
            { name: 'Gain Life', action: () => this.gameState.gainLife(), color: '#8BC34A' },
            { name: 'Add Coins', action: () => { this.gameState.gameData.coins += 10; }, color: '#FFC107' }
        ];
        
        operations.forEach((op, index) => {
            const row = Math.floor(index / 3);
            const col = index % 3;
            const x = 50 + col * 120;
            const y = yPos + row * 35;
            
            this.ui.createButton(`op_${index}`, x, y, op.name, () => {
                op.action();
                this.updateStateDisplay();
                this.showNotification(`${op.name} executed`, op.color);
            }, this, {
                fontSize: '12px',
                backgroundColor: op.color,
                padding: { x: 10, y: 6 }
            });
        });
    }
    
    /**
     * 创建成就系统演示
     */
    createAchievementSystemDemo() {
        const { width } = this.cameras.main;
        let yPos = 320;
        const xPos = width/2 + 50;
        
        // 面板标题
        this.ui.createText('achievementTitle', xPos, yPos, 'Achievement System', {
            fontSize: '18px',
            color: '#ffff00',
            fontStyle: 'bold'
        });
        
        yPos += 30;
        
        // 成就列表
        this.achievementList = this.ui.createContainer('achievementList', xPos, yPos + 50);
        
        // 创建成就显示
        this.updateAchievementDisplay();
        
        // 检查成就按钮
        this.ui.createButton('checkAchievements', xPos, yPos + 120, 'Check Achievements', () => {
            this.gameState.checkAchievements();
            this.updateAchievementDisplay();
            this.showNotification('Achievements checked', '#9C27B0');
        }, this, {
            fontSize: '14px',
            backgroundColor: '#9C27B0',
            padding: { x: 15, y: 8 }
        });
    }
    
    /**
     * 创建持久化演示
     */
    createPersistenceDemo() {
        const { width, height } = this.cameras.main;
        let yPos = height - 120;
        
        // 面板标题
        this.ui.createText('persistenceTitle', 50, yPos, 'Data Persistence', {
            fontSize: '18px',
            color: '#ffff00',
            fontStyle: 'bold'
        });
        
        yPos += 30;
        
        // 持久化操作按钮
        this.ui.createButton('saveBtn', 100, yPos, 'Save Data', () => {
            const success = this.gameState.saveData();
            this.showNotification(success ? 'Data saved successfully' : 'Save failed', 
                success ? '#4CAF50' : '#f44336');
        }, this, {
            fontSize: '14px',
            backgroundColor: '#4CAF50',
            padding: { x: 15, y: 8 }
        });
        
        this.ui.createButton('loadBtn', 200, yPos, 'Load Data', () => {
            const success = this.gameState.loadData();
            this.updateStateDisplay();
            this.updateAchievementDisplay();
            this.showNotification(success ? 'Data loaded successfully' : 'Load failed', 
                success ? '#2196F3' : '#f44336');
        }, this, {
            fontSize: '14px',
            backgroundColor: '#2196F3',
            padding: { x: 15, y: 8 }
        });
        
        this.ui.createButton('clearBtn', 300, yPos, 'Clear Data', () => {
            this.gameState.clearData();
            this.updateStateDisplay();
            this.updateAchievementDisplay();
            this.showNotification('Data cleared', '#FF9800');
        }, this, {
            fontSize: '14px',
            backgroundColor: '#FF9800',
            padding: { x: 15, y: 8 }
        });
        
        this.ui.createButton('resetBtn', 400, yPos, 'Reset All', () => {
            this.gameState.resetAllData();
            this.updateStateDisplay();
            this.updateAchievementDisplay();
            this.showNotification('All data reset', '#f44336');
        }, this, {
            fontSize: '14px',
            backgroundColor: '#f44336',
            padding: { x: 15, y: 8 }
        });
        
        // 存储信息显示
        yPos += 40;
        this.storageInfo = this.ui.createText('storageInfo', 50, yPos, 'Storage: Not checked', {
            fontSize: '12px',
            color: '#cccccc'
        });
        
        this.updateStorageInfo();
    }
    
    /**
     * 设置事件监听
     */
    setupEventListeners() {
        // 监听状态变化
        this.gameState.on('stateChange', (data) => {
            console.log('State changed:', data);
            this.updateStateDisplay();
        });
        
        // 监听分数变化
        this.gameState.on('scoreChanged', (score) => {
            console.log('Score changed:', score);
            this.updateStateDisplay();
            this.createScoreEffect();
        });
        
        // 监听生命值变化
        this.gameState.on('healthChanged', (health) => {
            console.log('Health changed:', health);
            this.updateStateDisplay();
            this.createHealthEffect(health);
        });
        
        // 监听生命数变化
        this.gameState.on('livesChanged', (lives) => {
            console.log('Lives changed:', lives);
            this.updateStateDisplay();
        });
        
        // 监听升级
        this.gameState.on('levelUp', (level) => {
            console.log('Level up:', level);
            this.updateStateDisplay();
            this.createLevelUpEffect();
        });
        
        // 监听成就解锁
        this.gameState.on('achievementUnlocked', (achievement) => {
            console.log('Achievement unlocked:', achievement);
            this.updateAchievementDisplay();
            this.createAchievementEffect(achievement);
        });
        
        // 监听新纪录
        this.gameState.on('newHighScore', (score) => {
            console.log('New high score:', score);
            this.createHighScoreEffect();
        });
    }
    
    /**
     * 更新状态显示
     */
    updateStateDisplay() {
        const data = this.gameState.gameData;
        
        this.stateInfoTexts.currentState.setText(this.gameState.currentState);
        this.stateInfoTexts.score.setText(data.score.toString());
        this.stateInfoTexts.level.setText(data.level.toString());
        this.stateInfoTexts.lives.setText(data.lives.toString());
        this.stateInfoTexts.health.setText(`${data.health}/${data.maxHealth}`);
        this.stateInfoTexts.coins.setText(data.coins.toString());
        
        // 根据状态改变颜色
        const stateColors = {
            menu: '#2196F3',
            playing: '#4CAF50',
            paused: '#FF9800',
            gameOver: '#f44336'
        };
        
        this.stateInfoTexts.currentState.setColor(stateColors[this.gameState.currentState] || '#ffffff');
        
        // 健康状态颜色
        const healthPercent = data.health / data.maxHealth;
        let healthColor = '#00ff00';
        if (healthPercent < 0.3) healthColor = '#ff0000';
        else if (healthPercent < 0.6) healthColor = '#ffff00';
        
        this.stateInfoTexts.health.setColor(healthColor);
    }
    
    /**
     * 更新成就显示
     */
    updateAchievementDisplay() {
        // 清除现有显示
        this.achievementList.removeAll(true);
        
        const achievements = this.gameState.progress.achievements;
        const maxDisplay = 4;
        
        if (achievements.length === 0) {
            const noAchievements = this.add.text(0, 0, 'No achievements yet', {
                fontSize: '12px',
                color: '#666666'
            }).setOrigin(0.5);
            this.achievementList.add(noAchievements);
        } else {
            achievements.slice(0, maxDisplay).forEach((achievementId, index) => {
                const achievementText = this.add.text(0, index * 20, `✓ ${achievementId}`, {
                    fontSize: '12px',
                    color: '#ffd700'
                }).setOrigin(0.5);
                this.achievementList.add(achievementText);
            });
            
            if (achievements.length > maxDisplay) {
                const moreText = this.add.text(0, maxDisplay * 20, `+${achievements.length - maxDisplay} more`, {
                    fontSize: '10px',
                    color: '#cccccc'
                }).setOrigin(0.5);
                this.achievementList.add(moreText);
            }
        }
    }
    
    /**
     * 更新存储信息
     */
    updateStorageInfo() {
        try {
            const savedData = localStorage.getItem('phaserGameData');
            if (savedData) {
                const data = JSON.parse(savedData);
                const size = new Blob([savedData]).size;
                this.storageInfo.setText(`Storage: ${size} bytes, saved ${new Date(data.timestamp).toLocaleTimeString()}`);
            } else {
                this.storageInfo.setText('Storage: No saved data');
            }
        } catch (error) {
            this.storageInfo.setText('Storage: Error reading data');
        }
    }
    
    /**
     * 切换游戏模拟
     */
    toggleSimulation() {
        if (this.simulationRunning) {
            this.stopSimulation();
        } else {
            this.startSimulation();
        }
    }
    
    /**
     * 开始游戏模拟
     */
    startSimulation() {
        this.simulationRunning = true;
        this.simulationButton.setText('Stop Simulation');
        this.simulationButton.setStyle({ backgroundColor: '#f44336' });
        
        this.gameState.setState('playing');
        
        // 模拟游戏事件
        this.simulationTimer = this.time.addEvent({
            delay: 1000,
            callback: () => {
                // 随机事件
                const events = [
                    () => this.gameState.addScore(Phaser.Math.Between(10, 50)),
                    () => this.gameState.takeDamage(Phaser.Math.Between(5, 15)),
                    () => this.gameState.heal(Phaser.Math.Between(5, 10)),
                    () => { this.gameState.gameData.coins += Phaser.Math.Between(1, 5); }
                ];
                
                const randomEvent = Phaser.Utils.Array.GetRandom(events);
                randomEvent();
                
                this.updateStateDisplay();
                
                // 检查游戏结束条件
                if (this.gameState.gameData.lives <= 0) {
                    this.gameState.setState('gameOver');
                    this.stopSimulation();
                }
            },
            repeat: -1
        });
        
        this.showNotification('Game simulation started', '#4CAF50');
    }
    
    /**
     * 停止游戏模拟
     */
    stopSimulation() {
        this.simulationRunning = false;
        this.simulationButton.setText('Start Simulation');
        this.simulationButton.setStyle({ backgroundColor: '#4CAF50' });
        
        if (this.simulationTimer) {
            this.simulationTimer.destroy();
            this.simulationTimer = null;
        }
        
        this.gameState.setState('menu');
        this.showNotification('Game simulation stopped', '#FF9800');
    }
    
    /**
     * 创建分数效果
     */
    createScoreEffect() {
        const scoreText = this.stateInfoTexts.score;
        
        this.tweens.add({
            targets: scoreText,
            scaleX: 1.3,
            scaleY: 1.3,
            duration: 200,
            yoyo: true,
            ease: 'Power2'
        });
    }
    
    /**
     * 创建健康效果
     */
    createHealthEffect(health) {
        const healthText = this.stateInfoTexts.health;
        
        if (health <= 20) {
            // 低血量闪烁
            this.tweens.add({
                targets: healthText,
                alpha: 0.5,
                duration: 300,
                yoyo: true,
                repeat: 2,
                ease: 'Power2'
            });
        }
    }
    
    /**
     * 创建升级效果
     */
    createLevelUpEffect() {
        const { width, height } = this.cameras.main;
        
        const levelUpText = this.add.text(width/2, height/2, 'LEVEL UP!', {
            fontSize: '32px',
            color: '#ffff00',
            fontStyle: 'bold',
            stroke: '#000000',
            strokeThickness: 3
        }).setOrigin(0.5);
        
        this.tweens.add({
            targets: levelUpText,
            scaleX: 1.5,
            scaleY: 1.5,
            alpha: 0,
            duration: 2000,
            ease: 'Power2',
            onComplete: () => {
                levelUpText.destroy();
            }
        });
    }
    
    /**
     * 创建成就效果
     */
    createAchievementEffect(achievement) {
        const { width } = this.cameras.main;
        
        const achievementNotification = this.add.container(width + 200, 200);
        
        const bg = this.add.rectangle(0, 0, 250, 60, 0x333333, 0.9);
        bg.setStrokeStyle(2, 0xffd700);
        
        const title = this.add.text(0, -15, 'Achievement Unlocked!', {
            fontSize: '12px',
            color: '#ffd700',
            fontStyle: 'bold'
        }).setOrigin(0.5);
        
        const name = this.add.text(0, 5, achievement.name, {
            fontSize: '14px',
            color: '#ffffff'
        }).setOrigin(0.5);
        
        achievementNotification.add([bg, title, name]);
        
        // 滑入动画
        this.tweens.add({
            targets: achievementNotification,
            x: width - 150,
            duration: 500,
            ease: 'Back.easeOut'
        });
        
        // 自动消失
        this.time.delayedCall(3000, () => {
            this.tweens.add({
                targets: achievementNotification,
                x: width + 200,
                duration: 500,
                ease: 'Back.easeIn',
                onComplete: () => {
                    achievementNotification.destroy();
                }
            });
        });
    }
    
    /**
     * 创建新纪录效果
     */
    createHighScoreEffect() {
        const { width, height } = this.cameras.main;
        
        const highScoreText = this.add.text(width/2, height/2 + 50, 'NEW HIGH SCORE!', {
            fontSize: '24px',
            color: '#ff0000',
            fontStyle: 'bold',
            stroke: '#ffffff',
            strokeThickness: 2
        }).setOrigin(0.5);
        
        this.tweens.add({
            targets: highScoreText,
            scaleX: 1.2,
            scaleY: 1.2,
            alpha: 0,
            duration: 3000,
            ease: 'Power2',
            onComplete: () => {
                highScoreText.destroy();
            }
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
     * 清理资源
     */
    cleanup() {
        if (this.simulationTimer) {
            this.simulationTimer.destroy();
            this.simulationTimer = null;
        }
        
        this.simulationRunning = false;
        
        if (this.gameState) {
            this.gameState.destroy();
        }
    }
    
    /**
     * 销毁场景
     */
    destroy() {
        this.cleanup();
        
        if (this.ui) {
            this.ui.destroy();
        }
    }
}
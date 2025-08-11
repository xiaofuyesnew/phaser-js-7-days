/**
 * 游戏状态管理器
 * 管理游戏的各种状态和数据
 */
export class GameStateManager {
    constructor() {
        this.currentState = 'menu';
        this.previousState = null;
        
        // 游戏数据
        this.gameData = {
            score: 0,
            level: 1,
            lives: 3,
            health: 100,
            maxHealth: 100,
            experience: 0,
            coins: 0,
            powerUps: []
        };
        
        // 游戏设置
        this.settings = {
            musicVolume: 0.5,
            sfxVolume: 0.7,
            isMuted: false,
            difficulty: 'normal',
            controls: 'keyboard',
            language: 'zh'
        };
        
        // 游戏进度
        this.progress = {
            currentLevel: 1,
            unlockedLevels: [1],
            achievements: [],
            totalPlayTime: 0,
            gamesPlayed: 0,
            highScore: 0
        };
        
        // 临时数据
        this.tempData = {};
        
        // 事件监听器
        this.listeners = {};
        
        // 计时器
        this.gameTimer = null;
        this.gameStartTime = 0;
        
        this.loadData();
    }
    
    /**
     * 设置游戏状态
     * @param {string} newState - 新状态
     * @param {object} data - 状态数据
     */
    setState(newState, data = {}) {
        const oldState = this.currentState;
        this.previousState = oldState;
        this.currentState = newState;
        
        console.log(`State changed: ${oldState} -> ${newState}`);
        
        // 触发状态变化事件
        this.emit('stateChange', { oldState, newState, data });
        this.onStateChange(oldState, newState, data);
    }
    
    /**
     * 状态变化处理
     * @param {string} oldState - 旧状态
     * @param {string} newState - 新状态
     * @param {object} data - 状态数据
     */
    onStateChange(oldState, newState, data) {
        switch (newState) {
            case 'playing':
                this.startGame();
                break;
            case 'paused':
                this.pauseGame();
                break;
            case 'gameOver':
                this.endGame();
                break;
            case 'menu':
                this.resetGameData();
                break;
        }
    }
    
    /**
     * 开始游戏
     */
    startGame() {
        this.gameStartTime = Date.now();
        this.startGameTimer();
        this.progress.gamesPlayed++;
    }
    
    /**
     * 暂停游戏
     */
    pauseGame() {
        this.pauseGameTimer();
    }
    
    /**
     * 结束游戏
     */
    endGame() {
        this.stopGameTimer();
        this.updateHighScore();
        this.checkAchievements();
        this.saveData();
    }
    
    /**
     * 重置游戏数据
     */
    resetGameData() {
        this.gameData = {
            score: 0,
            level: 1,
            lives: 3,
            health: 100,
            maxHealth: 100,
            experience: 0,
            coins: 0,
            powerUps: []
        };
    }
    
    /**
     * 添加分数
     * @param {number} points - 分数
     */
    addScore(points) {
        this.gameData.score += points;
        this.emit('scoreChanged', this.gameData.score);
        this.checkLevelUp();
    }
    
    /**
     * 受到伤害
     * @param {number} damage - 伤害值
     */
    takeDamage(damage) {
        this.gameData.health = Math.max(0, this.gameData.health - damage);
        this.emit('healthChanged', this.gameData.health);
        
        if (this.gameData.health <= 0) {
            this.loseLife();
        }
    }
    
    /**
     * 恢复生命值
     * @param {number} amount - 恢复量
     */
    heal(amount) {
        this.gameData.health = Math.min(this.gameData.maxHealth, this.gameData.health + amount);
        this.emit('healthChanged', this.gameData.health);
    }
    
    /**
     * 失去生命
     */
    loseLife() {
        this.gameData.lives--;
        this.gameData.health = this.gameData.maxHealth;
        this.emit('livesChanged', this.gameData.lives);
        
        if (this.gameData.lives <= 0) {
            this.setState('gameOver');
        }
    }
    
    /**
     * 获得生命
     */
    gainLife() {
        this.gameData.lives++;
        this.emit('livesChanged', this.gameData.lives);
    }
    
    /**
     * 检查升级
     */
    checkLevelUp() {
        const requiredExp = this.gameData.level * 1000;
        if (this.gameData.score >= requiredExp) {
            this.levelUp();
        }
    }
    
    /**
     * 升级
     */
    levelUp() {
        this.gameData.level++;
        this.gameData.maxHealth += 10;
        this.gameData.health = this.gameData.maxHealth;
        this.emit('levelUp', this.gameData.level);
    }
    
    /**
     * 更新最高分
     */
    updateHighScore() {
        if (this.gameData.score > this.progress.highScore) {
            this.progress.highScore = this.gameData.score;
            this.emit('newHighScore', this.progress.highScore);
        }
    }
    
    /**
     * 检查成就
     */
    checkAchievements() {
        const achievements = [
            {
                id: 'firstScore',
                name: '初次得分',
                description: '获得第一分',
                condition: () => this.gameData.score > 0
            },
            {
                id: 'highScore',
                name: '高分达人',
                description: '单局得分超过1000',
                condition: () => this.gameData.score >= 1000
            },
            {
                id: 'survivor',
                name: '生存专家',
                description: '累计游戏时间超过5分钟',
                condition: () => this.progress.totalPlayTime >= 300
            },
            {
                id: 'veteran',
                name: '游戏老手',
                description: '游戏次数超过10次',
                condition: () => this.progress.gamesPlayed >= 10
            },
            {
                id: 'levelMaster',
                name: '等级大师',
                description: '达到10级',
                condition: () => this.gameData.level >= 10
            }
        ];
        
        achievements.forEach(achievement => {
            if (!this.progress.achievements.includes(achievement.id) && achievement.condition()) {
                this.unlockAchievement(achievement);
            }
        });
    }
    
    /**
     * 解锁成就
     * @param {object} achievement - 成就对象
     */
    unlockAchievement(achievement) {
        this.progress.achievements.push(achievement.id);
        this.emit('achievementUnlocked', achievement);
        console.log(`Achievement unlocked: ${achievement.name}`);
    }
    
    /**
     * 开始游戏计时器
     */
    startGameTimer() {
        this.gameTimer = setInterval(() => {
            this.progress.totalPlayTime++;
        }, 1000);
    }
    
    /**
     * 暂停游戏计时器
     */
    pauseGameTimer() {
        if (this.gameTimer) {
            clearInterval(this.gameTimer);
        }
    }
    
    /**
     * 停止游戏计时器
     */
    stopGameTimer() {
        if (this.gameTimer) {
            clearInterval(this.gameTimer);
            this.gameTimer = null;
        }
    }
    
    /**
     * 保存数据到本地存储
     */
    saveData() {
        const saveData = {
            settings: this.settings,
            progress: this.progress,
            timestamp: Date.now(),
            version: '1.0'
        };
        
        try {
            localStorage.setItem('phaserGameData', JSON.stringify(saveData));
            return true;
        } catch (error) {
            console.error('Failed to save data:', error);
            return false;
        }
    }
    
    /**
     * 从本地存储加载数据
     */
    loadData() {
        try {
            const savedData = localStorage.getItem('phaserGameData');
            if (savedData) {
                const data = JSON.parse(savedData);
                
                // 合并设置
                this.settings = { ...this.settings, ...data.settings };
                
                // 合并进度
                this.progress = { ...this.progress, ...data.progress };
                
                console.log('Data loaded successfully');
                return true;
            }
        } catch (error) {
            console.error('Failed to load data:', error);
        }
        return false;
    }
    
    /**
     * 清除保存数据
     */
    clearData() {
        localStorage.removeItem('phaserGameData');
        this.resetAllData();
    }
    
    /**
     * 重置所有数据
     */
    resetAllData() {
        this.resetGameData();
        this.settings = {
            musicVolume: 0.5,
            sfxVolume: 0.7,
            isMuted: false,
            difficulty: 'normal',
            controls: 'keyboard',
            language: 'zh'
        };
        this.progress = {
            currentLevel: 1,
            unlockedLevels: [1],
            achievements: [],
            totalPlayTime: 0,
            gamesPlayed: 0,
            highScore: 0
        };
    }
    
    /**
     * 添加事件监听器
     * @param {string} event - 事件名
     * @param {function} callback - 回调函数
     */
    on(event, callback) {
        if (!this.listeners[event]) {
            this.listeners[event] = [];
        }
        this.listeners[event].push(callback);
    }
    
    /**
     * 移除事件监听器
     * @param {string} event - 事件名
     * @param {function} callback - 回调函数
     */
    off(event, callback) {
        if (this.listeners[event]) {
            this.listeners[event] = this.listeners[event].filter(cb => cb !== callback);
        }
    }
    
    /**
     * 触发事件
     * @param {string} event - 事件名
     * @param {*} data - 事件数据
     */
    emit(event, data) {
        if (this.listeners[event]) {
            this.listeners[event].forEach(callback => {
                callback(data);
            });
        }
    }
    
    /**
     * 销毁状态管理器
     */
    destroy() {
        this.stopGameTimer();
        this.listeners = {};
        this.saveData();
    }
}
import { PerformanceMonitor } from '../utils/PerformanceMonitor.js';
import { ResponsiveManager } from '../utils/ResponsiveManager.js';
import { TouchControls } from '../controls/TouchControls.js';
import { objectPool, PoolHelpers } from '../utils/ObjectPool.js';
import { logger, log } from '../utils/Logger.js';

/**
 * 完整的游戏示例
 * 展示所有优化功能的综合使用
 */
export class CompleteGameDemo extends Phaser.Scene {
    constructor() {
        super({ key: 'CompleteGameDemo' });
        
        // 游戏状态
        this.gameState = {
            score: 0,
            lives: 3,
            level: 1,
            paused: false,
            gameOver: false,
            highScore: parseInt(localStorage.getItem('highScore') || '0')
        };
        
        // 游戏对象
        this.player = null;
        this.enemies = null;
        this.bullets = null;
        this.powerups = null;
        this.particles = null;
        
        // UI元素
        this.ui = {};
        
        // 系统组件
        this.performanceMonitor = null;
        this.responsiveManager = null;
        this.touchControls = null;
        
        // 游戏配置
        this.config = {
            playerSpeed: 200,
            bulletSpeed: 400,
            enemySpeed: 100,
            spawnRate: 2000,
            maxEnemies: 10
        };
        
        // 输入控制
        this.cursors = null;
        this.keys = {};
        
        // 音效
        this.sounds = {};
        
        // 时间管理
        this.timers = {};
    }
    
    preload() {
        log.gameEvent('scene-preload', { scene: 'CompleteGameDemo' });
        
        // 创建加载进度条 
       this.createLoadingBar();
        
        // 加载游戏资源
        this.loadGameAssets();
        
        // 监听加载进度
        this.load.on('progress', this.updateLoadingBar, this);
        this.load.on('complete', this.onLoadComplete, this);
    }
    
    create() {
        log.gameEvent('scene-create', { scene: 'CompleteGameDemo' });
        
        // 初始化系统组件
        this.initializeSystems();
        
        // 创建游戏世界
        this.createGameWorld();
        
        // 创建玩家
        this.createPlayer();
        
        // 创建敌人系统
        this.createEnemySystem();
        
        // 创建UI
        this.createUI();
        
        // 设置输入控制
        this.setupInput();
        
        // 设置碰撞检测
        this.setupCollisions();
        
        // 启动游戏循环
        this.startGameLoop();
        
        // 触发游戏加载完成事件
        window.dispatchEvent(new CustomEvent('gameLoaded'));
    }
    
    update(time, delta) {
        if (this.gameState.paused || this.gameState.gameOver) {
            return;
        }
        
        // 更新性能监控
        if (this.performanceMonitor) {
            this.performanceMonitor.update(time, delta);
        }
        
        // 更新玩家
        this.updatePlayer(time, delta);
        
        // 更新敌人
        this.updateEnemies(time, delta);
        
        // 更新子弹
        this.updateBullets(time, delta);
        
        // 更新粒子效果
        this.updateParticles(time, delta);
        
        // 更新UI
        this.updateUI(time, delta);
        
        // 检查游戏状态
        this.checkGameState();
    }
    
    // 系统初始化
    initializeSystems() {
        // 性能监控
        this.performanceMonitor = new PerformanceMonitor(this);
        
        // 响应式管理
        this.responsiveManager = new ResponsiveManager(this);
        
        // 触摸控制
        this.touchControls = new TouchControls(this);
        
        // 初始化对象池
        objectPool.init();
        
        log.system('systems-initialized', { 
            performance: true, 
            responsive: true, 
            touch: true, 
            objectPool: true 
        });
    }  
  
    // 资源加载
    createLoadingBar() {
        const { width, height } = this.cameras.main;
        
        // 加载背景
        this.add.rectangle(width / 2, height / 2, width, height, 0x000000);
        
        // 加载文本
        this.add.text(width / 2, height / 2 - 50, 'Loading Game...', {
            fontSize: '32px',
            fill: '#ffffff'
        }).setOrigin(0.5);
        
        // 进度条背景
        const progressBg = this.add.rectangle(width / 2, height / 2, 400, 20, 0x333333);
        
        // 进度条
        this.loadingBar = this.add.rectangle(width / 2 - 200, height / 2, 0, 20, 0x00ff00);
        this.loadingBar.setOrigin(0, 0.5);
    }
    
    updateLoadingBar(progress) {
        this.loadingBar.width = 400 * progress;
        
        // 更新外部加载条
        const externalBar = document.getElementById('loading-bar');
        if (externalBar) {
            externalBar.style.width = (progress * 100) + '%';
        }
    }
    
    onLoadComplete() {
        // 清理加载界面
        this.children.removeAll();
        
        log.gameEvent('assets-loaded', { totalAssets: this.load.totalComplete });
    }
    
    loadGameAssets() {
        // 创建简单的彩色方块作为精灵
        this.load.image('player', 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==');
        this.load.image('enemy', 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==');
        this.load.image('bullet', 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==');
        this.load.image('powerup', 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==');
        
        // 音效（使用Web Audio API生成）
        this.generateAudioAssets();
    }
    
    generateAudioAssets() {
        // 生成简单的音效
        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        
        // 射击音效
        const shootBuffer = this.createBeepSound(audioContext, 200, 0.1);
        this.cache.audio.add('shoot', shootBuffer);
        
        // 爆炸音效
        const explosionBuffer = this.createNoiseSound(audioContext, 0.3);
        this.cache.audio.add('explosion', explosionBuffer);
        
        // 得分音效
        const scoreBuffer = this.createBeepSound(audioContext, 400, 0.2);
        this.cache.audio.add('score', scoreBuffer);
    }
    
    createBeepSound(audioContext, frequency, duration) {
        const sampleRate = audioContext.sampleRate;
        const numSamples = sampleRate * duration;
        const buffer = audioContext.createBuffer(1, numSamples, sampleRate);
        const data = buffer.getChannelData(0);
        
        for (let i = 0; i < numSamples; i++) {
            data[i] = Math.sin(2 * Math.PI * frequency * i / sampleRate) * 0.3;
        }
        
        return buffer;
    }
    
    createNoiseSound(audioContext, duration) {
        const sampleRate = audioContext.sampleRate;
        const numSamples = sampleRate * duration;
        const buffer = audioContext.createBuffer(1, numSamples, sampleRate);
        const data = buffer.getChannelData(0);
        
        for (let i = 0; i < numSamples; i++) {
            data[i] = (Math.random() * 2 - 1) * 0.3 * Math.exp(-i / (sampleRate * 0.1));
        }
        
        return buffer;
    }    
   
 // 游戏世界创建
    createGameWorld() {
        const { width, height } = this.cameras.main;
        
        // 创建星空背景
        this.createStarField();
        
        // 设置世界边界
        this.physics.world.setBounds(0, 0, width, height);
        
        log.gameEvent('world-created', { width, height });
    }
    
    createStarField() {
        const { width, height } = this.cameras.main;
        
        // 创建星星
        this.stars = this.add.group();
        
        for (let i = 0; i < 100; i++) {
            const x = Phaser.Math.Between(0, width);
            const y = Phaser.Math.Between(0, height);
            const star = this.add.circle(x, y, 1, 0xffffff, 0.8);
            this.stars.add(star);
        }
    }
    
    // 玩家创建
    createPlayer() {
        const { width, height } = this.cameras.main;
        
        // 创建玩家精灵
        this.player = this.physics.add.sprite(width / 2, height - 100, 'player');
        this.player.setDisplaySize(32, 32);
        this.player.setTint(0x00ff00);
        this.player.setCollideWorldBounds(true);
        
        // 玩家属性
        this.player.health = 100;
        this.player.maxHealth = 100;
        this.player.fireRate = 200;
        this.player.lastFired = 0;
        
        log.gameEvent('player-created', { x: this.player.x, y: this.player.y });
    }
    
    // 敌人系统
    createEnemySystem() {
        // 创建敌人组
        this.enemies = this.physics.add.group({
            maxSize: this.config.maxEnemies,
            runChildUpdate: true
        });
        
        // 设置敌人生成定时器
        this.timers.enemySpawn = this.time.addEvent({
            delay: this.config.spawnRate,
            callback: this.spawnEnemy,
            callbackScope: this,
            loop: true
        });
        
        log.gameEvent('enemy-system-created', { maxEnemies: this.config.maxEnemies });
    }
    
    spawnEnemy() {
        if (this.enemies.children.size >= this.config.maxEnemies) {
            return;
        }
        
        const { width } = this.cameras.main;
        const x = Phaser.Math.Between(50, width - 50);
        
        // 从对象池获取敌人或创建新的
        let enemy = objectPool.get('enemy');
        if (!enemy) {
            enemy = this.physics.add.sprite(x, -50, 'enemy');
            enemy.setDisplaySize(24, 24);
            enemy.setTint(0xff0000);
            PoolHelpers.setupPoolObject(enemy, 'enemy');
        } else {
            enemy.setPosition(x, -50);
            enemy.setActive(true);
            enemy.setVisible(true);
        }
        
        // 敌人属性
        enemy.health = 50;
        enemy.speed = this.config.enemySpeed;
        enemy.setVelocityY(enemy.speed);
        
        this.enemies.add(enemy);
        
        log.gameEvent('enemy-spawned', { x: enemy.x, y: enemy.y });
    } 
   
    // UI创建
    createUI() {
        const { width, height } = this.cameras.main;
        
        // 分数显示
        this.ui.scoreText = this.add.text(20, 20, `Score: ${this.gameState.score}`, {
            fontSize: '24px',
            fill: '#ffffff'
        });
        
        // 生命值显示
        this.ui.livesText = this.add.text(20, 50, `Lives: ${this.gameState.lives}`, {
            fontSize: '24px',
            fill: '#ffffff'
        });
        
        // 等级显示
        this.ui.levelText = this.add.text(20, 80, `Level: ${this.gameState.level}`, {
            fontSize: '24px',
            fill: '#ffffff'
        });
        
        // 最高分显示
        this.ui.highScoreText = this.add.text(width - 20, 20, `High: ${this.gameState.highScore}`, {
            fontSize: '24px',
            fill: '#ffff00'
        }).setOrigin(1, 0);
        
        // 暂停按钮
        this.ui.pauseButton = this.add.text(width - 20, 50, 'PAUSE', {
            fontSize: '20px',
            fill: '#ffffff',
            backgroundColor: '#333333',
            padding: { x: 10, y: 5 }
        }).setOrigin(1, 0).setInteractive();
        
        this.ui.pauseButton.on('pointerdown', this.togglePause, this);
        
        // 性能显示切换按钮
        this.ui.perfButton = this.add.text(width - 20, 90, 'PERF', {
            fontSize: '16px',
            fill: '#ffffff',
            backgroundColor: '#333333',
            padding: { x: 8, y: 4 }
        }).setOrigin(1, 0).setInteractive();
        
        this.ui.perfButton.on('pointerdown', () => {
            if (this.performanceMonitor) {
                this.performanceMonitor.toggleDisplay();
            }
        });
        
        log.gameEvent('ui-created', { elements: Object.keys(this.ui).length });
    }
    
    // 输入设置
    setupInput() {
        // 键盘输入
        this.cursors = this.input.keyboard.createCursorKeys();
        this.keys.space = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
        this.keys.p = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.P);
        this.keys.r = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.R);
        this.keys.f = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.F);
        this.keys.t = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.T);
        
        // 按键事件
        this.keys.p.on('down', this.togglePause, this);
        this.keys.r.on('down', this.restartGame, this);
        this.keys.f.on('down', this.toggleFullscreen, this);
        this.keys.t.on('down', () => {
            if (this.touchControls) {
                this.touchControls.toggleVisibility();
            }
        });
        
        // 鼠标/触摸输入
        this.input.on('pointerdown', this.onPointerDown, this);
        
        log.gameEvent('input-setup', { keyboard: true, pointer: true });
    }
    
    onPointerDown(pointer) {
        if (this.gameState.gameOver) {
            this.restartGame();
            return;
        }
        
        // 触摸射击
        this.fireBullet();
        
        log.userAction('touch-fire', { x: pointer.x, y: pointer.y });
    }  
  
    // 碰撞设置
    setupCollisions() {
        // 创建子弹组
        this.bullets = this.physics.add.group({
            maxSize: 50,
            runChildUpdate: true
        });
        
        // 玩家子弹 vs 敌人
        this.physics.add.overlap(this.bullets, this.enemies, this.bulletHitEnemy, null, this);
        
        // 敌人 vs 玩家
        this.physics.add.overlap(this.player, this.enemies, this.enemyHitPlayer, null, this);
        
        log.gameEvent('collisions-setup', { groups: 3 });
    }
    
    bulletHitEnemy(bullet, enemy) {
        // 创建爆炸效果
        this.createExplosion(enemy.x, enemy.y);
        
        // 播放音效
        this.playSound('explosion');
        
        // 回收对象到池中
        objectPool.release(bullet);
        objectPool.release(enemy);
        
        // 移除对象
        bullet.setActive(false);
        bullet.setVisible(false);
        enemy.setActive(false);
        enemy.setVisible(false);
        
        // 增加分数
        this.addScore(100);
        
        log.gameEvent('enemy-destroyed', { score: 100 });
    }
    
    enemyHitPlayer(player, enemy) {
        // 创建爆炸效果
        this.createExplosion(player.x, player.y);
        
        // 播放音效
        this.playSound('explosion');
        
        // 回收敌人
        objectPool.release(enemy);
        enemy.setActive(false);
        enemy.setVisible(false);
        
        // 减少生命值
        this.gameState.lives--;
        this.updateUI();
        
        // 检查游戏结束
        if (this.gameState.lives <= 0) {
            this.gameOver();
        }
        
        log.gameEvent('player-hit', { livesRemaining: this.gameState.lives });
    }
    
    // 游戏循环
    startGameLoop() {
        // 启动各种定时器和循环
        this.timers.difficultyIncrease = this.time.addEvent({
            delay: 30000, // 30秒
            callback: this.increaseDifficulty,
            callbackScope: this,
            loop: true
        });
        
        log.gameEvent('game-loop-started');
    }
    
    // 更新方法
    updatePlayer(time, delta) {
        if (!this.player || !this.player.active) return;
        
        const speed = this.config.playerSpeed;
        
        // 键盘控制
        if (this.cursors.left.isDown) {
            this.player.setVelocityX(-speed);
        } else if (this.cursors.right.isDown) {
            this.player.setVelocityX(speed);
        } else {
            this.player.setVelocityX(0);
        }
        
        if (this.cursors.up.isDown) {
            this.player.setVelocityY(-speed);
        } else if (this.cursors.down.isDown) {
            this.player.setVelocityY(speed);
        } else {
            this.player.setVelocityY(0);
        }
        
        // 自动射击
        if (this.keys.space.isDown && time > this.player.lastFired + this.player.fireRate) {
            this.fireBullet();
            this.player.lastFired = time;
        }
        
        // 触摸控制
        if (this.touchControls) {
            const touchInput = this.touchControls.getInput();
            if (touchInput.movement.x !== 0 || touchInput.movement.y !== 0) {
                this.player.setVelocity(
                    touchInput.movement.x * speed,
                    touchInput.movement.y * speed
                );
            }
            
            if (touchInput.fire && time > this.player.lastFired + this.player.fireRate) {
                this.fireBullet();
                this.player.lastFired = time;
            }
        }
    }  
  
    updateEnemies(time, delta) {
        this.enemies.children.entries.forEach(enemy => {
            if (!enemy.active) return;
            
            // 移除超出屏幕的敌人
            if (enemy.y > this.cameras.main.height + 50) {
                objectPool.release(enemy);
                enemy.setActive(false);
                enemy.setVisible(false);
            }
        });
    }
    
    updateBullets(time, delta) {
        this.bullets.children.entries.forEach(bullet => {
            if (!bullet.active) return;
            
            // 移除超出屏幕的子弹
            if (bullet.y < -50) {
                objectPool.release(bullet);
                bullet.setActive(false);
                bullet.setVisible(false);
            }
        });
    }
    
    updateParticles(time, delta) {
        // 粒子系统更新（如果有的话）
    }
    
    updateUI(time, delta) {
        if (this.ui.scoreText) {
            this.ui.scoreText.setText(`Score: ${this.gameState.score}`);
        }
        if (this.ui.livesText) {
            this.ui.livesText.setText(`Lives: ${this.gameState.lives}`);
        }
        if (this.ui.levelText) {
            this.ui.levelText.setText(`Level: ${this.gameState.level}`);
        }
        if (this.ui.highScoreText) {
            this.ui.highScoreText.setText(`High: ${this.gameState.highScore}`);
        }
    }
    
    // 游戏逻辑
    fireBullet() {
        if (!this.player || !this.player.active) return;
        
        // 从对象池获取子弹
        let bullet = objectPool.get('bullet');
        if (!bullet) {
            bullet = this.physics.add.sprite(this.player.x, this.player.y - 20, 'bullet');
            bullet.setDisplaySize(4, 12);
            bullet.setTint(0xffff00);
            PoolHelpers.setupPoolObject(bullet, 'bullet');
        } else {
            bullet.setPosition(this.player.x, this.player.y - 20);
            bullet.setActive(true);
            bullet.setVisible(true);
        }
        
        bullet.setVelocityY(-this.config.bulletSpeed);
        this.bullets.add(bullet);
        
        // 播放射击音效
        this.playSound('shoot');
        
        log.gameEvent('bullet-fired', { x: bullet.x, y: bullet.y });
    }
    
    createExplosion(x, y) {
        // 创建简单的爆炸效果
        const explosion = this.add.circle(x, y, 20, 0xff6600, 0.8);
        
        this.tweens.add({
            targets: explosion,
            scaleX: 2,
            scaleY: 2,
            alpha: 0,
            duration: 300,
            onComplete: () => {
                explosion.destroy();
            }
        });
    }
    
    addScore(points) {
        this.gameState.score += points;
        
        // 检查新纪录
        if (this.gameState.score > this.gameState.highScore) {
            this.gameState.highScore = this.gameState.score;
            localStorage.setItem('highScore', this.gameState.highScore.toString());
            this.playSound('score');
        }
        
        // 检查升级
        const newLevel = Math.floor(this.gameState.score / 1000) + 1;
        if (newLevel > this.gameState.level) {
            this.gameState.level = newLevel;
            this.levelUp();
        }
    }    

    levelUp() {
        // 增加难度
        this.config.spawnRate = Math.max(500, this.config.spawnRate - 100);
        this.config.enemySpeed += 20;
        
        // 更新敌人生成定时器
        if (this.timers.enemySpawn) {
            this.timers.enemySpawn.delay = this.config.spawnRate;
        }
        
        // 显示升级提示
        const levelUpText = this.add.text(
            this.cameras.main.centerX,
            this.cameras.main.centerY,
            `LEVEL ${this.gameState.level}!`,
            {
                fontSize: '48px',
                fill: '#ffff00',
                stroke: '#000000',
                strokeThickness: 4
            }
        ).setOrigin(0.5);
        
        this.tweens.add({
            targets: levelUpText,
            scaleX: 1.5,
            scaleY: 1.5,
            alpha: 0,
            duration: 2000,
            onComplete: () => {
                levelUpText.destroy();
            }
        });
        
        log.gameEvent('level-up', { level: this.gameState.level });
    }
    
    increaseDifficulty() {
        this.config.maxEnemies = Math.min(20, this.config.maxEnemies + 1);
        this.config.enemySpeed += 10;
        
        log.gameEvent('difficulty-increased', { 
            maxEnemies: this.config.maxEnemies,
            enemySpeed: this.config.enemySpeed
        });
    }
    
    checkGameState() {
        // 检查各种游戏状态条件
        if (this.gameState.lives <= 0 && !this.gameState.gameOver) {
            this.gameOver();
        }
    }
    
    // 游戏状态控制
    togglePause() {
        this.gameState.paused = !this.gameState.paused;
        
        if (this.gameState.paused) {
            this.physics.pause();
            this.time.paused = true;
            
            // 显示暂停界面
            this.showPauseScreen();
        } else {
            this.physics.resume();
            this.time.paused = false;
            
            // 隐藏暂停界面
            this.hidePauseScreen();
        }
        
        log.gameEvent('game-paused', { paused: this.gameState.paused });
    }
    
    showPauseScreen() {
        if (this.pauseScreen) return;
        
        const { width, height } = this.cameras.main;
        
        this.pauseScreen = this.add.container(width / 2, height / 2);
        
        // 半透明背景
        const bg = this.add.rectangle(0, 0, width, height, 0x000000, 0.7);
        
        // 暂停文本
        const pauseText = this.add.text(0, -50, 'PAUSED', {
            fontSize: '48px',
            fill: '#ffffff'
        }).setOrigin(0.5);
        
        // 继续按钮
        const resumeButton = this.add.text(0, 20, 'RESUME', {
            fontSize: '24px',
            fill: '#ffffff',
            backgroundColor: '#333333',
            padding: { x: 20, y: 10 }
        }).setOrigin(0.5).setInteractive();
        
        resumeButton.on('pointerdown', this.togglePause, this);
        
        this.pauseScreen.add([bg, pauseText, resumeButton]);
    }
    
    hidePauseScreen() {
        if (this.pauseScreen) {
            this.pauseScreen.destroy();
            this.pauseScreen = null;
        }
    }    
   
 gameOver() {
        this.gameState.gameOver = true;
        
        // 停止所有定时器
        Object.values(this.timers).forEach(timer => {
            if (timer) timer.remove();
        });
        
        // 显示游戏结束界面
        this.showGameOverScreen();
        
        log.gameEvent('game-over', { 
            score: this.gameState.score,
            level: this.gameState.level,
            highScore: this.gameState.highScore
        });
    }
    
    showGameOverScreen() {
        const { width, height } = this.cameras.main;
        
        this.gameOverScreen = this.add.container(width / 2, height / 2);
        
        // 半透明背景
        const bg = this.add.rectangle(0, 0, width, height, 0x000000, 0.8);
        
        // 游戏结束文本
        const gameOverText = this.add.text(0, -100, 'GAME OVER', {
            fontSize: '48px',
            fill: '#ff0000'
        }).setOrigin(0.5);
        
        // 分数显示
        const scoreText = this.add.text(0, -50, `Final Score: ${this.gameState.score}`, {
            fontSize: '24px',
            fill: '#ffffff'
        }).setOrigin(0.5);
        
        // 最高分显示
        const highScoreText = this.add.text(0, -20, `High Score: ${this.gameState.highScore}`, {
            fontSize: '20px',
            fill: '#ffff00'
        }).setOrigin(0.5);
        
        // 重新开始按钮
        const restartButton = this.add.text(0, 30, 'RESTART (R)', {
            fontSize: '24px',
            fill: '#ffffff',
            backgroundColor: '#333333',
            padding: { x: 20, y: 10 }
        }).setOrigin(0.5).setInteractive();
        
        restartButton.on('pointerdown', this.restartGame, this);
        
        // 提示文本
        const hintText = this.add.text(0, 80, 'Click anywhere or press R to restart', {
            fontSize: '16px',
            fill: '#cccccc'
        }).setOrigin(0.5);
        
        this.gameOverScreen.add([bg, gameOverText, scoreText, highScoreText, restartButton, hintText]);
    }
    
    restartGame() {
        log.gameEvent('game-restart');
        
        // 重置游戏状态
        this.gameState = {
            score: 0,
            lives: 3,
            level: 1,
            paused: false,
            gameOver: false,
            highScore: parseInt(localStorage.getItem('highScore') || '0')
        };
        
        // 重置配置
        this.config = {
            playerSpeed: 200,
            bulletSpeed: 400,
            enemySpeed: 100,
            spawnRate: 2000,
            maxEnemies: 10
        };
        
        // 重启场景
        this.scene.restart();
    }
    
    toggleFullscreen() {
        if (this.scale.isFullscreen) {
            this.scale.stopFullscreen();
        } else {
            this.scale.startFullscreen();
        }
        
        log.userAction('fullscreen-toggle', { isFullscreen: this.scale.isFullscreen });
    }
    
    // 音效播放
    playSound(key) {
        try {
            if (this.cache.audio.exists(key)) {
                // 使用Web Audio API播放
                const audioContext = new (window.AudioContext || window.webkitAudioContext)();
                const buffer = this.cache.audio.get(key);
                const source = audioContext.createBufferSource();
                source.buffer = buffer;
                source.connect(audioContext.destination);
                source.start();
            }
        } catch (error) {
            console.warn('Audio playback failed:', error);
        }
    }
    
    // 清理资源
    destroy() {
        // 清理定时器
        Object.values(this.timers).forEach(timer => {
            if (timer) timer.remove();
        });
        
        // 清理系统组件
        if (this.performanceMonitor) {
            this.performanceMonitor.destroy();
        }
        
        if (this.responsiveManager) {
            this.responsiveManager.destroy();
        }
        
        if (this.touchControls) {
            this.touchControls.destroy();
        }
        
        // 清理对象池
        objectPool.clear();
        
        log.gameEvent('scene-destroyed');
        
        super.destroy();
    }
}
import { PerformanceMonitor } from '../utils/PerformanceMonitor.js';
import { ResponsiveManager } from '../utils/ResponsiveManager.js';
import { TouchControls } from '../controls/TouchControls.js';
import { objectPool, PoolHelpers } from '../utils/ObjectPool.js';
import Phaser from 'phaser';

/**
 * 主游戏场景
 * 展示所有优化功能的集成使用
 */
export class GameScene extends Phaser.Scene {
    constructor() {
        super({ key: 'GameScene' });

        // 游戏对象
        this.player = null;
        this.enemies = null;
        this.bullets = null;
        this.particles = null;

        // 系统组件
        this.performanceMonitor = null;
        this.responsiveManager = null;
        this.touchControls = null;

        // 输入控制
        this.cursors = null;
        this.wasd = null;

        // 游戏状态
        this.gameState = {
            score: 0,
            lives: 3,
            level: 1,
            paused: false
        };

        // UI元素
        this.ui = {
            scoreText: null,
            livesText: null,
            levelText: null,
            fpsText: null
        };
    }

    preload() {
        console.log('GameScene: Loading assets...');

        // 显示加载进度
        this.showLoadingProgress();

        // 加载游戏资源
        this.loadGameAssets();
    }

    showLoadingProgress() {
        const width = this.cameras.main.width;
        const height = this.cameras.main.height;

        // 加载背景
        const loadingBg = this.add.rectangle(width / 2, height / 2, width, height, 0x1a1a1a);

        // 加载文本
        const loadingText = this.add.text(width / 2, height / 2 - 50, 'Loading Game...', {
            fontSize: '24px',
            fill: '#ffffff'
        });
        loadingText.setOrigin(0.5);

        // 进度条背景
        const progressBg = this.add.rectangle(width / 2, height / 2, 400, 20, 0x333333);

        // 进度条
        const progressBar = this.add.rectangle(width / 2 - 200, height / 2, 0, 20, 0x4CAF50);
        progressBar.setOrigin(0, 0.5);

        // 进度文本
        const progressText = this.add.text(width / 2, height / 2 + 30, '0%', {
            fontSize: '16px',
            fill: '#ffffff'
        });
        progressText.setOrigin(0.5);

        // 监听加载进度
        this.load.on('progress', (value) => {
            progressBar.width = 400 * value;
            progressText.setText(Math.round(value * 100) + '%');
        });

        // 加载完成后清理
        this.load.on('complete', () => {
            loadingBg.destroy();
            loadingText.destroy();
            progressBg.destroy();
            progressBar.destroy();
            progressText.destroy();
        });
    }

    loadGameAssets() {
        // 创建简单的彩色方块作为精灵
        this.load.image('player', 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==');
        this.load.image('enemy', 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==');
        this.load.image('bullet', 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==');
        this.load.image('particle', 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==');

        // 模拟加载延迟
        for (let i = 0; i < 10; i++) {
            this.load.image(`dummy${i}`, 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==');
        }
    }

    create() {
        console.log('GameScene: Creating game objects...');

        // 初始化系统组件
        this.initializeSystemComponents();

        // 创建游戏世界
        this.createGameWorld();

        // 设置输入控制
        this.setupInputControls();

        // 创建UI
        this.createUI();

        // 设置对象池
        this.setupObjectPools();

        // 开始游戏循环
        this.startGameLoop();

        // 触发游戏加载完成事件
        window.dispatchEvent(new CustomEvent('gameLoaded'));

        console.log('GameScene: Game created successfully');
    }

    initializeSystemComponents() {
        // 性能监控器
        if (__DEV__) {
            this.performanceMonitor = new PerformanceMonitor(this);
        }

        // 响应式管理器
        this.responsiveManager = new ResponsiveManager(this.game);

        // 触摸控制
        this.touchControls = new TouchControls(this);

        // 监听触摸输入
        this.events.on('touchDirection', this.handleTouchDirection, this);
        this.events.on('touchButton', this.handleTouchButton, this);
        this.events.on('touchMenu', this.handleTouchMenu, this);
    }

    createGameWorld() {
        // 设置世界边界
        this.physics.world.setBounds(0, 0, 1600, 1200);

        // 创建玩家
        this.createPlayer();

        // 创建敌人组
        this.enemies = this.physics.add.group();

        // 创建子弹组
        this.bullets = this.physics.add.group();

        // 创建粒子系统
        this.createParticleSystem();

        // 设置碰撞检测
        this.setupCollisions();

        // 设置摄像机
        this.setupCamera();
    }

    createPlayer() {
        // 创建玩家精灵
        this.player = this.physics.add.sprite(400, 300, 'player');
        this.player.setDisplaySize(32, 32);
        this.player.setTint(0x4CAF50); // 绿色
        this.player.setCollideWorldBounds(true);
        this.player.setBounce(0.2);
        this.player.setDrag(300);

        // 玩家属性
        this.player.health = 100;
        this.player.maxHealth = 100;
        this.player.speed = 200;
        this.player.fireRate = 200; // 毫秒
        this.player.lastFired = 0;
    }

    createParticleSystem() {
        // 创建粒子发射器（使用简单的图形）
        this.particles = this.add.particles(0, 0, 'particle', {
            speed: { min: 50, max: 100 },
            scale: { start: 0.5, end: 0 },
            lifespan: 300,
            tint: [0xff6b6b, 0x4ecdc4, 0x45b7d1, 0xf9ca24]
        });
        this.particles.stop();
    }

    setupCollisions() {
        // 玩家与敌人碰撞
        this.physics.add.overlap(this.player, this.enemies, this.playerHitEnemy, null, this);

        // 子弹与敌人碰撞
        this.physics.add.overlap(this.bullets, this.enemies, this.bulletHitEnemy, null, this);
    }

    setupCamera() {
        // 摄像机跟随玩家
        this.cameras.main.startFollow(this.player);
        this.cameras.main.setLerp(0.1, 0.1);
        this.cameras.main.setDeadzone(100, 100);
    }

    setupInputControls() {
        // 键盘控制
        this.cursors = this.input.keyboard.createCursorKeys();
        this.wasd = this.input.keyboard.addKeys('W,S,A,D,SPACE');

        // 调试快捷键
        if (__DEV__) {
            this.input.keyboard.on('keydown-P', () => {
                if (this.performanceMonitor) {
                    this.performanceMonitor.toggle();
                }
            });

            this.input.keyboard.on('keydown-F', () => {
                this.responsiveManager.toggleFullscreen();
            });

            this.input.keyboard.on('keydown-T', () => {
                this.touchControls.toggle();
            });
        }

        // 鼠标/触摸射击
        this.input.on('pointerdown', this.handlePointerDown, this);
    }

    createUI() {
        // 分数显示
        this.ui.scoreText = this.add.text(16, 16, 'Score: 0', {
            fontSize: '18px',
            fill: '#ffffff',
            backgroundColor: '#000000',
            padding: { x: 8, y: 4 }
        });
        this.ui.scoreText.setScrollFactor(0);

        // 生命值显示
        this.ui.livesText = this.add.text(16, 50, 'Lives: 3', {
            fontSize: '18px',
            fill: '#ffffff',
            backgroundColor: '#000000',
            padding: { x: 8, y: 4 }
        });
        this.ui.livesText.setScrollFactor(0);

        // 等级显示
        this.ui.levelText = this.add.text(16, 84, 'Level: 1', {
            fontSize: '18px',
            fill: '#ffffff',
            backgroundColor: '#000000',
            padding: { x: 8, y: 4 }
        });
        this.ui.levelText.setScrollFactor(0);

        // 开发模式信息
        if (__DEV__) {
            this.ui.debugText = this.add.text(16, this.cameras.main.height - 100, 'Debug Mode\nP: Performance\nF: Fullscreen\nT: Touch Controls', {
                fontSize: '12px',
                fill: '#ffff00',
                backgroundColor: '#000000',
                padding: { x: 4, y: 2 }
            });
            this.ui.debugText.setScrollFactor(0);
        }
    }

    setupObjectPools() {
        // 创建敌人对象池
        PoolHelpers.createPhysicsSpritePool(this, 'enemy-pool', 'enemy', 20);

        // 创建子弹对象池
        PoolHelpers.createPhysicsSpritePool(this, 'bullet-pool', 'bullet', 50);

        // 创建粒子对象池
        PoolHelpers.createParticlePool(this, 'explosion-pool', 'particle', {
            speed: { min: 100, max: 200 },
            scale: { start: 1, end: 0 },
            lifespan: 500
        }, 10);
    }

    startGameLoop() {
        // 敌人生成定时器
        this.enemySpawnTimer = this.time.addEvent({
            delay: 2000,
            callback: this.spawnEnemy,
            callbackScope: this,
            loop: true
        });

        // 游戏状态更新定时器
        this.gameUpdateTimer = this.time.addEvent({
            delay: 1000,
            callback: this.updateGameState,
            callbackScope: this,
            loop: true
        });
    }

    update(time, delta) {
        if (this.gameState.paused) return;

        // 更新玩家
        this.updatePlayer(time, delta);

        // 更新敌人
        this.updateEnemies(time, delta);

        // 更新子弹
        this.updateBullets(time, delta);

        // 更新UI
        this.updateUI();

        // 清理超出边界的对象
        this.cleanupObjects();
    }

    updatePlayer(time, delta) {
        if (!this.player || !this.player.active) return;

        const speed = this.player.speed;
        let velocityX = 0;
        let velocityY = 0;

        // 键盘输入
        if (this.cursors.left.isDown || this.wasd.A.isDown) {
            velocityX = -speed;
        } else if (this.cursors.right.isDown || this.wasd.D.isDown) {
            velocityX = speed;
        }

        if (this.cursors.up.isDown || this.wasd.W.isDown) {
            velocityY = -speed;
        } else if (this.cursors.down.isDown || this.wasd.S.isDown) {
            velocityY = speed;
        }

        // 触摸输入
        if (this.touchControls && this.touchControls.enabled) {
            const touchInput = this.touchControls.getDirectionInput();
            velocityX += touchInput.x * speed;
            velocityY += touchInput.y * speed;
        }

        // 应用速度
        this.player.setVelocity(velocityX, velocityY);

        // 射击
        if ((this.wasd.SPACE.isDown || this.touchControls.isButtonPressed('attack')) &&
            time > this.player.lastFired + this.player.fireRate) {
            this.firePlayerBullet();
            this.player.lastFired = time;
        }
    }

    updateEnemies(time, delta) {
        this.enemies.children.entries.forEach(enemy => {
            if (!enemy.active) return;

            // 简单的AI：朝玩家移动
            if (this.player && this.player.active) {
                const angle = Phaser.Math.Angle.Between(
                    enemy.x, enemy.y,
                    this.player.x, this.player.y
                );

                const speed = enemy.speed || 50;
                enemy.setVelocity(
                    Math.cos(angle) * speed,
                    Math.sin(angle) * speed
                );
            }
        });
    }

    updateBullets(time, delta) {
        this.bullets.children.entries.forEach(bullet => {
            if (!bullet.active) return;

            // 检查子弹是否超出世界边界
            if (bullet.x < -50 || bullet.x > this.physics.world.bounds.width + 50 ||
                bullet.y < -50 || bullet.y > this.physics.world.bounds.height + 50) {
                this.recycleBullet(bullet);
            }
        });
    }

    updateUI() {
        this.ui.scoreText.setText(`Score: ${this.gameState.score}`);
        this.ui.livesText.setText(`Lives: ${this.gameState.lives}`);
        this.ui.levelText.setText(`Level: ${this.gameState.level}`);
    }

    cleanupObjects() {
        // 清理死亡的敌人
        this.enemies.children.entries.forEach(enemy => {
            if (enemy.active && (enemy.health <= 0 || enemy.y > this.physics.world.bounds.height + 100)) {
                this.recycleEnemy(enemy);
            }
        });
    }

    spawnEnemy() {
        const enemy = objectPool.get('enemy-pool');
        if (!enemy) return;

        // 随机位置生成
        const x = Phaser.Math.Between(50, this.physics.world.bounds.width - 50);
        const y = -50;

        enemy.setPosition(x, y);
        enemy.setDisplaySize(24, 24);
        enemy.setTint(0xF44336); // 红色
        enemy.setVelocity(0, 50);
        enemy.setBounce(0.1);
        enemy.setCollideWorldBounds(false);

        // 敌人属性
        enemy.health = 50;
        enemy.maxHealth = 50;
        enemy.speed = Phaser.Math.Between(30, 80);
        enemy.points = 10;

        this.enemies.add(enemy);
    }

    firePlayerBullet() {
        const bullet = objectPool.get('bullet-pool');
        if (!bullet) return;

        bullet.setPosition(this.player.x, this.player.y - 20);
        bullet.setDisplaySize(8, 16);
        bullet.setTint(0xFFEB3B); // 黄色
        bullet.setVelocity(0, -400);
        bullet.setCollideWorldBounds(false);

        // 子弹属性
        bullet.damage = 25;
        bullet.owner = 'player';

        this.bullets.add(bullet);
    }

    playerHitEnemy(player, enemy) {
        // 玩家受伤
        player.health -= 10;

        // 创建爆炸效果
        this.createExplosion(enemy.x, enemy.y);

        // 回收敌人
        this.recycleEnemy(enemy);

        // 检查玩家生命值
        if (player.health <= 0) {
            this.playerDied();
        }
    }

    bulletHitEnemy(bullet, enemy) {
        // 敌人受伤
        enemy.health -= bullet.damage;

        // 回收子弹
        this.recycleBullet(bullet);

        // 检查敌人是否死亡
        if (enemy.health <= 0) {
            // 增加分数
            this.gameState.score += enemy.points;

            // 创建爆炸效果
            this.createExplosion(enemy.x, enemy.y);

            // 回收敌人
            this.recycleEnemy(enemy);
        }
    }

    createExplosion(x, y) {
        // 使用粒子系统创建爆炸效果
        this.particles.setPosition(x, y);
        this.particles.explode(10);
    }

    recycleEnemy(enemy) {
        this.enemies.remove(enemy);
        objectPool.release('enemy-pool', enemy);
    }

    recycleBullet(bullet) {
        this.bullets.remove(bullet);
        objectPool.release('bullet-pool', bullet);
    }

    playerDied() {
        this.gameState.lives--;

        if (this.gameState.lives <= 0) {
            this.gameOver();
        } else {
            // 重置玩家
            this.player.health = this.player.maxHealth;
            this.player.setPosition(400, 300);
        }
    }

    gameOver() {
        this.gameState.paused = true;

        // 显示游戏结束界面
        const gameOverText = this.add.text(
            this.cameras.main.centerX,
            this.cameras.main.centerY,
            `Game Over\nFinal Score: ${this.gameState.score}\nPress R to Restart`,
            {
                fontSize: '32px',
                fill: '#ffffff',
                backgroundColor: '#000000',
                padding: { x: 20, y: 10 },
                align: 'center'
            }
        );
        gameOverText.setOrigin(0.5);
        gameOverText.setScrollFactor(0);

        // 重启按键
        this.input.keyboard.once('keydown-R', () => {
            this.scene.restart();
        });
    }

    updateGameState() {
        // 检查升级条件
        if (this.gameState.score > this.gameState.level * 100) {
            this.gameState.level++;

            // 增加难度
            this.enemySpawnTimer.delay = Math.max(500, this.enemySpawnTimer.delay - 100);
        }
    }

    // 触摸输入处理
    handleTouchDirection(data) {
        // 触摸方向输入已在updatePlayer中处理
    }

    handleTouchButton(data) {
        if (data.button === 'jump' && data.pressed) {
            // 跳跃功能（如果需要）
        }
    }

    handleTouchMenu() {
        this.togglePause();
    }

    handlePointerDown(pointer) {
        // 鼠标点击射击
        if (this.time.now > this.player.lastFired + this.player.fireRate) {
            this.firePlayerBullet();
            this.player.lastFired = this.time.now;
        }
    }

    togglePause() {
        this.gameState.paused = !this.gameState.paused;

        if (this.gameState.paused) {
            this.physics.pause();
            this.anims.pauseAll();
        } else {
            this.physics.resume();
            this.anims.resumeAll();
        }
    }

    // 响应式处理
    handleResize(resizeInfo) {
        const { scale, gameWidth, gameHeight } = resizeInfo;

        // 更新UI位置
        if (this.ui.debugText) {
            this.ui.debugText.setPosition(16, gameHeight - 100);
        }

        // 通知触摸控制器
        if (this.touchControls) {
            this.touchControls.handleResize(resizeInfo);
        }
    }

    // 场景销毁
    destroy() {
        // 清理定时器
        if (this.enemySpawnTimer) {
            this.enemySpawnTimer.destroy();
        }
        if (this.gameUpdateTimer) {
            this.gameUpdateTimer.destroy();
        }

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
        objectPool.destroyAll();

        super.destroy();
    }
}
/**
 * Day 2 游戏常量定义
 * 
 * 精灵与动画系统的配置常量
 */

// 游戏基础配置
export const GAME_CONFIG = {
    WIDTH: 800,
    HEIGHT: 600,
    BACKGROUND_COLOR: '#87ceeb',
    PHYSICS_GRAVITY: 800,
    DEBUG_MODE: false
};

// 玩家配置
export const PLAYER_CONFIG = {
    // 基础属性
    SPEED: 200,
    JUMP_VELOCITY: -400,
    MAX_FALL_SPEED: 600,
    SCALE: 1.5,
    
    // 高级移动
    ACCELERATION: 800,
    FRICTION: 600,
    DASH_DISTANCE: 300,
    DASH_COOLDOWN: 1000,
    
    // 碰撞体
    COLLISION_WIDTH: 20,
    COLLISION_HEIGHT: 28,
    
    // 输入响应
    INPUT_BUFFER_TIME: 150, // 毫秒
    COYOTE_TIME: 100, // 土狼时间
    
    // 视觉效果
    TRAIL_DURATION: 200,
    LANDING_SHAKE_INTENSITY: 0.008
};

// 收集品配置
export const COLLECTIBLE_CONFIG = {
    VALUE: 100,
    SIZE: 24,
    ANIMATION_SPEED: 12,
    FLOAT_AMPLITUDE: 10,
    FLOAT_DURATION: 1500
};

// 场景键名
export const SCENE_KEYS = {
    LOAD: 'load-scene',
    MENU: 'menu-scene',
    GAME: 'game-scene',
    GAME_OVER: 'game-over-scene'
};

// 资源键名
export const ASSET_KEYS = {
    PLAYER_SPRITESHEET: 'player-spritesheet',
    COLLECTIBLE_SPRITESHEET: 'collectible-spritesheet',
    PLATFORM: 'platform',
    SMALL_PLATFORM: 'small-platform',
    JUMP_PARTICLE: 'jump-particle',
    DOUBLE_JUMP_PARTICLE: 'double-jump-particle',
    LANDING_PARTICLE: 'landing-particle',
    COLLECT_PARTICLE: 'collect-particle'
};

// 动画配置
export const ANIMATION_CONFIG = {
    // 玩家动画
    PLAYER_IDLE_SPEED: 6,
    PLAYER_WALK_SPEED: 12,
    PLAYER_RUN_SPEED: 15,
    PLAYER_JUMP_SPEED: 10,
    PLAYER_FALL_SPEED: 8,
    PLAYER_LAND_SPEED: 15,
    PLAYER_DASH_SPEED: 20,
    
    // 收集品动画
    COLLECTIBLE_SPIN_SPEED: 12,
    
    // 粒子动画
    PARTICLE_FADE_DURATION: 500,
    TRAIL_FADE_DURATION: 300,
    
    // UI动画
    SCORE_POPUP_DURATION: 1000,
    UI_FADE_DURATION: 1000
};

// UI配置
export const UI_CONFIG = {
    FONT_FAMILY: 'Arial, sans-serif',
    PRIMARY_COLOR: '#2c3e50',
    SECONDARY_COLOR: '#7f8c8d',
    SUCCESS_COLOR: '#27ae60',
    WARNING_COLOR: '#f39c12',
    DANGER_COLOR: '#e74c3c',
    SCORE_COLOR: '#e67e22',
    
    // 字体大小
    TITLE_SIZE: '28px',
    SCORE_SIZE: '24px',
    INFO_SIZE: '20px',
    STATUS_SIZE: '16px',
    CONTROLS_SIZE: '14px'
};

// 粒子系统配置
export const PARTICLE_CONFIG = {
    JUMP: {
        SPEED: { min: 50, max: 100 },
        SCALE: { start: 0.8, end: 0 },
        LIFESPAN: 400,
        QUANTITY: 5
    },
    
    DOUBLE_JUMP: {
        SPEED: { min: 80, max: 150 },
        SCALE: { start: 1, end: 0 },
        LIFESPAN: 600,
        QUANTITY: 8
    },
    
    LANDING: {
        SPEED: { min: 30, max: 80 },
        GRAVITY_Y: 200,
        SCALE: { start: 0.6, end: 0.2 },
        LIFESPAN: 800,
        QUANTITY: 6
    },
    
    COLLECT: {
        SPEED: { min: 100, max: 200 },
        SCALE: { start: 1, end: 0 },
        LIFESPAN: 500,
        QUANTITY: 10
    }
};

// 平台配置
export const PLATFORM_CONFIG = {
    GROUND_HEIGHT: 32,
    PLATFORM_WIDTH: 64,
    PLATFORM_HEIGHT: 16,
    SMALL_PLATFORM_WIDTH: 32,
    SMALL_PLATFORM_HEIGHT: 12
};

// 输入键配置
export const INPUT_KEYS = {
    UP: ['UP', 'W'],
    DOWN: ['DOWN', 'S'],
    LEFT: ['LEFT', 'A'],
    RIGHT: ['RIGHT', 'D'],
    JUMP: ['UP', 'W', 'SPACE'],
    DASH: ['SHIFT'],
    RESET: ['R'],
    PAUSE: ['P', 'ESC']
};

// 游戏状态
export const GAME_STATES = {
    LOADING: 'loading',
    MENU: 'menu',
    PLAYING: 'playing',
    PAUSED: 'paused',
    GAME_OVER: 'game_over',
    VICTORY: 'victory'
};

// 玩家状态
export const PLAYER_STATES = {
    IDLE: 'idle',
    WALK: 'walk',
    RUN: 'run',
    JUMP: 'jump',
    FALL: 'fall',
    LAND: 'land',
    DASH: 'dash'
};

// 调试配置
export const DEBUG_CONFIG = {
    SHOW_FPS: false,
    SHOW_PHYSICS: false,
    SHOW_PLAYER_STATUS: true,
    LOG_LEVEL: 'info', // 'debug', 'info', 'warn', 'error'
    ENABLE_CONSOLE: true,
    SHOW_COLLISION_BOXES: false
};

// 性能配置
export const PERFORMANCE_CONFIG = {
    TARGET_FPS: 60,
    MAX_DELTA: 1000 / 30, // 最大帧时间 (30 FPS)
    OBJECT_POOL_SIZE: 50,
    MAX_PARTICLES: 100,
    PARTICLE_CLEANUP_INTERVAL: 5000 // 5秒清理一次
};

// 音效配置 (为Day 6准备)
export const AUDIO_CONFIG = {
    MASTER_VOLUME: 0.7,
    SFX_VOLUME: 0.8,
    MUSIC_VOLUME: 0.5,
    
    // 音效键名
    JUMP_SOUND: 'jump-sound',
    DOUBLE_JUMP_SOUND: 'double-jump-sound',
    DASH_SOUND: 'dash-sound',
    COLLECT_SOUND: 'collect-sound',
    LAND_SOUND: 'land-sound'
};

// 颜色配置
export const COLOR_CONFIG = {
    // 玩家颜色
    PLAYER_IDLE: 0x4ecdc4,
    PLAYER_WALK: 0x45b7d1,
    PLAYER_RUN: 0x96ceb4,
    PLAYER_JUMP: 0x6c5ce7,
    PLAYER_FALL: 0xa29bfe,
    PLAYER_LAND: 0xfd79a8,
    PLAYER_DASH: 0xfdcb6e,
    
    // 收集品颜色
    COLLECTIBLE_OUTER: 0xffd700,
    COLLECTIBLE_INNER: 0xffff00,
    COLLECTIBLE_SPARK: 0xffffff,
    
    // 平台颜色
    PLATFORM_MAIN: 0x8b4513,
    PLATFORM_BORDER: 0x654321,
    SMALL_PLATFORM_MAIN: 0x228b22,
    SMALL_PLATFORM_BORDER: 0x006400,
    
    // 粒子颜色
    JUMP_PARTICLE: 0x4ecdc4,
    DOUBLE_JUMP_PARTICLE: 0x00ffff,
    LANDING_PARTICLE: 0x8b4513,
    COLLECT_PARTICLE: 0xffd700,
    
    // 背景颜色
    SKY_TOP: 0x87ceeb,
    SKY_BOTTOM: 0x98fb98,
    CLOUD: 0xffffff,
    MOUNTAIN: 0x696969
};
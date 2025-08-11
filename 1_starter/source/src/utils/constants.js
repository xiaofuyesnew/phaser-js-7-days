/**
 * 游戏常量定义
 * 
 * 将所有的魔法数字和配置项集中管理，便于维护和修改
 */

// 游戏基础配置
export const GAME_CONFIG = {
    WIDTH: 800,
    HEIGHT: 600,
    BACKGROUND_COLOR: '#2c3e50',
    PHYSICS_GRAVITY: 300,
    DEBUG_MODE: false
};

// 玩家配置
export const PLAYER_CONFIG = {
    SPEED: 200,
    SIZE: 40,
    START_X: 100,
    START_Y: 300,
    COLOR: 0x3498db
};

// 收集品配置
export const COLLECTIBLE_CONFIG = {
    COIN_VALUE: 10,
    COIN_SIZE: 30,
    COIN_COLOR: 0xf1c40f,
    ANIMATION_DURATION: 1000
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
    PLAYER: 'player',
    COIN: 'coin',
    OBSTACLE: 'obstacle',
    BACKGROUND: 'background'
};

// UI配置
export const UI_CONFIG = {
    FONT_FAMILY: 'Arial, sans-serif',
    PRIMARY_COLOR: '#2c3e50',
    SECONDARY_COLOR: '#7f8c8d',
    SUCCESS_COLOR: '#27ae60',
    WARNING_COLOR: '#f39c12',
    DANGER_COLOR: '#e74c3c'
};

// 输入键配置
export const INPUT_KEYS = {
    UP: ['UP', 'W'],
    DOWN: ['DOWN', 'S'],
    LEFT: ['LEFT', 'A'],
    RIGHT: ['RIGHT', 'D'],
    SPACE: 'SPACE',
    ENTER: 'ENTER',
    ESC: 'ESC'
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

// 动画配置
export const ANIMATION_CONFIG = {
    FADE_DURATION: 1000,
    SCALE_DURATION: 200,
    FLOAT_DURATION: 2000,
    ROTATION_DURATION: 2000
};

// 调试配置
export const DEBUG_CONFIG = {
    SHOW_FPS: false,
    SHOW_PHYSICS: false,
    LOG_LEVEL: 'info', // 'debug', 'info', 'warn', 'error'
    ENABLE_CONSOLE: true
};

// 性能配置
export const PERFORMANCE_CONFIG = {
    TARGET_FPS: 60,
    MAX_DELTA: 1000 / 30, // 最大帧时间 (30 FPS)
    OBJECT_POOL_SIZE: 100
};
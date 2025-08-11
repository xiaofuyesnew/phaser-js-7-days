/**
 * Day 3 游戏常量定义
 * 
 * 地图与物理系统的配置常量
 */

// 游戏基础配置
export const GAME_CONFIG = {
    WIDTH: 800,
    HEIGHT: 600,
    BACKGROUND_COLOR: '#87ceeb',
    DEBUG_MODE: false
};

// 瓦片地图配置
export const TILEMAP_CONFIG = {
    TILE_SIZE: 32,
    TILES_PER_ROW: 8,
    MAP_WIDTH: 40,
    MAP_HEIGHT: 25,
    LAYER_DEPTH: {
        BACKGROUND: -10,
        TERRAIN: 0,
        DECORATION: 5,
        COLLISION: 10,
        FOREGROUND: 15
    }
};

// 物理系统配置
export const PHYSICS_CONFIG = {
    GRAVITY: 800,
    DEBUG: false,
    WORLD_BOUNDS: {
        x: 0,
        y: 0,
        width: TILEMAP_CONFIG.MAP_WIDTH * TILEMAP_CONFIG.TILE_SIZE,
        height: TILEMAP_CONFIG.MAP_HEIGHT * TILEMAP_CONFIG.TILE_SIZE
    },
    
    // 碰撞组
    COLLISION_GROUPS: {
        PLAYER: 1,
        TERRAIN: 2,
        ENEMIES: 4,
        COLLECTIBLES: 8,
        PROJECTILES: 16,
        TRIGGERS: 32
    }
};

// 玩家配置
export const PLAYER_CONFIG = {
    SPEED: 200,
    JUMP_VELOCITY: -450,
    MAX_FALL_SPEED: 600,
    SCALE: 1.2,
    
    // 物理属性
    BOUNCE: 0.1,
    DRAG: 500,
    MASS: 1,
    
    // 碰撞体
    COLLISION_WIDTH: 24,
    COLLISION_HEIGHT: 30,
    
    // 高级移动
    ACCELERATION: 600,
    FRICTION: 400,
    COYOTE_TIME: 150,
    JUMP_BUFFER_TIME: 100,
    
    // 能力
    DOUBLE_JUMP: true,
    WALL_JUMP: true,
    DASH: true,
    DASH_DISTANCE: 200,
    DASH_COOLDOWN: 1000
};

// 瓦片类型
export const TILE_TYPES = {
    AIR: 0,
    DIRT: 1,
    GRASS: 2,
    STONE: 3,
    WATER: 4,
    SAND: 5,
    MOSS: 6,
    ROCK: 7,
    WOOD: 8,
    METAL: 9,
    ICE: 10,
    LAVA: 11,
    
    // 特殊瓦片
    PLATFORM: 20,
    SPIKE: 21,
    SPRING: 22,
    CONVEYOR_LEFT: 23,
    CONVEYOR_RIGHT: 24,
    BREAKABLE: 25,
    SWITCH: 26,
    DOOR: 27
};

// 瓦片属性
export const TILE_PROPERTIES = {
    [TILE_TYPES.AIR]: {
        collision: false,
        friction: 0,
        bounce: 0,
        damage: 0,
        liquid: false
    },
    [TILE_TYPES.DIRT]: {
        collision: true,
        friction: 0.8,
        bounce: 0,
        damage: 0,
        liquid: false
    },
    [TILE_TYPES.GRASS]: {
        collision: true,
        friction: 0.6,
        bounce: 0.1,
        damage: 0,
        liquid: false
    },
    [TILE_TYPES.STONE]: {
        collision: true,
        friction: 0.9,
        bounce: 0,
        damage: 0,
        liquid: false
    },
    [TILE_TYPES.WATER]: {
        collision: false,
        friction: 0.3,
        bounce: 0,
        damage: 0,
        liquid: true,
        viscosity: 0.5
    },
    [TILE_TYPES.SAND]: {
        collision: true,
        friction: 0.4,
        bounce: 0,
        damage: 0,
        liquid: false
    },
    [TILE_TYPES.ICE]: {
        collision: true,
        friction: 0.1,
        bounce: 0.2,
        damage: 0,
        liquid: false
    },
    [TILE_TYPES.LAVA]: {
        collision: false,
        friction: 0.2,
        bounce: 0,
        damage: 10,
        liquid: true,
        viscosity: 0.8
    },
    [TILE_TYPES.SPIKE]: {
        collision: true,
        friction: 0.8,
        bounce: 0,
        damage: 5,
        liquid: false
    },
    [TILE_TYPES.SPRING]: {
        collision: true,
        friction: 0.6,
        bounce: 2.0,
        damage: 0,
        liquid: false,
        springForce: -800
    }
};

// 场景键名
export const SCENE_KEYS = {
    LOAD: 'load-scene',
    MENU: 'menu-scene',
    GAME: 'game-scene',
    EDITOR: 'editor-scene',
    GAME_OVER: 'game-over-scene'
};

// 资源键名
export const ASSET_KEYS = {
    TILESET: 'tileset',
    PLAYER_SPRITESHEET: 'player-spritesheet',
    ENEMY_SPRITESHEET: 'enemy-spritesheet',
    COLLECTIBLE_SPRITESHEET: 'collectible-spritesheet',
    PARTICLE_ATLAS: 'particle-atlas',
    
    // 音效
    JUMP_SOUND: 'jump-sound',
    LAND_SOUND: 'land-sound',
    COLLECT_SOUND: 'collect-sound',
    BREAK_SOUND: 'break-sound',
    SWITCH_SOUND: 'switch-sound'
};

// 动画配置
export const ANIMATION_CONFIG = {
    PLAYER_IDLE_SPEED: 6,
    PLAYER_WALK_SPEED: 12,
    PLAYER_RUN_SPEED: 15,
    PLAYER_JUMP_SPEED: 10,
    PLAYER_FALL_SPEED: 8,
    
    COLLECTIBLE_SPIN_SPEED: 8,
    WATER_WAVE_SPEED: 4,
    LAVA_BUBBLE_SPEED: 6
};

// UI配置
export const UI_CONFIG = {
    FONT_FAMILY: 'Arial, sans-serif',
    PRIMARY_COLOR: '#2c3e50',
    SECONDARY_COLOR: '#7f8c8d',
    SUCCESS_COLOR: '#27ae60',
    WARNING_COLOR: '#f39c12',
    DANGER_COLOR: '#e74c3c',
    
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
    
    LANDING: {
        SPEED: { min: 30, max: 80 },
        GRAVITY_Y: 200,
        SCALE: { start: 0.6, end: 0.2 },
        LIFESPAN: 800,
        QUANTITY: 6
    },
    
    BREAK_TILE: {
        SPEED: { min: 80, max: 150 },
        SCALE: { start: 1, end: 0 },
        LIFESPAN: 600,
        QUANTITY: 8
    },
    
    WATER_SPLASH: {
        SPEED: { min: 60, max: 120 },
        GRAVITY_Y: 300,
        SCALE: { start: 0.8, end: 0 },
        LIFESPAN: 1000,
        QUANTITY: 10
    }
};

// 地图生成配置
export const MAP_GENERATION = {
    PLATFORM_MAP: {
        GROUND_LEVEL: 0.8,
        PLATFORM_COUNT_RATIO: 0.125, // 每8个瓦片一个平台
        PLATFORM_MIN_LENGTH: 3,
        PLATFORM_MAX_LENGTH: 8,
        DECORATION_CHANCE: 0.3
    },
    
    CAVE_MAP: {
        INITIAL_FILL_CHANCE: 0.45,
        CELLULAR_ITERATIONS: 5,
        NEIGHBOR_THRESHOLD: 4,
        ENTRANCE_SIZE: 5
    },
    
    MAZE_MAP: {
        WALL_THICKNESS: 1,
        PATH_WIDTH: 1,
        DEAD_END_CHANCE: 0.1
    }
};

// 敌人配置
export const ENEMY_CONFIG = {
    GOOMBA: {
        SPEED: 50,
        HEALTH: 1,
        DAMAGE: 1,
        BOUNCE_VELOCITY: -200,
        AI_TYPE: 'patrol'
    },
    
    FLYING: {
        SPEED: 80,
        HEALTH: 2,
        DAMAGE: 1,
        HOVER_AMPLITUDE: 20,
        AI_TYPE: 'hover'
    },
    
    SPIKER: {
        SPEED: 0,
        HEALTH: 999,
        DAMAGE: 5,
        AI_TYPE: 'static'
    }
};

// 收集品配置
export const COLLECTIBLE_CONFIG = {
    COIN: {
        VALUE: 100,
        SIZE: 24,
        ANIMATION: 'coin-spin'
    },
    
    GEM: {
        VALUE: 500,
        SIZE: 28,
        ANIMATION: 'gem-sparkle'
    },
    
    POWER_UP: {
        VALUE: 0,
        SIZE: 32,
        ANIMATION: 'powerup-glow',
        DURATION: 10000 // 10秒
    }
};

// 调试配置
export const DEBUG_CONFIG = {
    SHOW_FPS: false,
    SHOW_PHYSICS: false,
    SHOW_TILE_GRID: false,
    SHOW_COLLISION_BOXES: false,
    LOG_LEVEL: 'info',
    ENABLE_CONSOLE: true,
    SHOW_COORDINATES: false
};

// 性能配置
export const PERFORMANCE_CONFIG = {
    TARGET_FPS: 60,
    MAX_DELTA: 1000 / 30,
    CULLING_MARGIN: 100, // 视口剔除边距
    MAX_PARTICLES: 200,
    PARTICLE_CLEANUP_INTERVAL: 5000,
    
    // 对象池大小
    POOL_SIZES: {
        BULLETS: 50,
        PARTICLES: 100,
        ENEMIES: 20,
        COLLECTIBLES: 30
    }
};

// 输入配置
export const INPUT_CONFIG = {
    KEYBOARD: {
        MOVE_LEFT: ['LEFT', 'A'],
        MOVE_RIGHT: ['RIGHT', 'D'],
        JUMP: ['UP', 'W', 'SPACE'],
        DASH: ['SHIFT'],
        INTERACT: ['E'],
        RESET: ['R'],
        PAUSE: ['P', 'ESC'],
        DEBUG: ['F1']
    },
    
    GAMEPAD: {
        MOVE_THRESHOLD: 0.2,
        JUMP_BUTTON: 0,
        DASH_BUTTON: 1,
        INTERACT_BUTTON: 2
    }
};

// 摄像机配置
export const CAMERA_CONFIG = {
    FOLLOW_OFFSET_X: 0,
    FOLLOW_OFFSET_Y: 50,
    DEADZONE_WIDTH: 100,
    DEADZONE_HEIGHT: 100,
    LERP_X: 0.1,
    LERP_Y: 0.1,
    ZOOM: 1,
    SHAKE_INTENSITY: 0.01,
    SHAKE_DURATION: 200
};

// 音效配置
export const AUDIO_CONFIG = {
    MASTER_VOLUME: 0.7,
    SFX_VOLUME: 0.8,
    MUSIC_VOLUME: 0.5,
    
    FADE_IN_DURATION: 1000,
    FADE_OUT_DURATION: 500
};
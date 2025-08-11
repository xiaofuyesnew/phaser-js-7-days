/**
 * 响应式管理器
 * 处理游戏的响应式设计和移动端适配
 */
export class ResponsiveManager {
    constructor(game) {
        this.game = game;
        this.baseWidth = 800;
        this.baseHeight = 600;
        this.minRatio = 0.5;
        this.maxRatio = 2.0;
        
        // 设备信息
        this.deviceInfo = this.getDeviceInfo();
        
        // 当前缩放信息
        this.currentScale = 1;
        this.currentOrientation = 'landscape';
        
        this.init();
    }
    
    init() {
        this.setupResponsive();
        this.setupOrientationHandling();
        this.handleResize(); // 初始化尺寸
        
        console.log('ResponsiveManager initialized', this.deviceInfo);
    }
    
    setupResponsive() {
        // 监听窗口大小变化
        window.addEventListener('resize', () => {
            this.debounce(() => {
                this.handleResize();
            }, 100)();
        });
        
        // 监听设备方向变化
        window.addEventListener('orientationchange', () => {
            // 延迟处理，等待浏览器完成方向变化
            setTimeout(() => {
                this.handleOrientationChange();
                this.handleResize();
            }, 100);
        });
        
        // 监听全屏变化
        document.addEventListener('fullscreenchange', () => {
            setTimeout(() => {
                this.handleResize();
            }, 100);
        });
    }
    
    setupOrientationHandling() {
        // 检查是否支持屏幕方向API
        if (screen.orientation) {
            screen.orientation.addEventListener('change', () => {
                this.handleOrientationChange();
            });
        }
    }
    
    handleResize() {
        const canvas = this.game.canvas;
        const container = canvas.parentElement || document.body;
        
        // 获取容器尺寸
        const containerWidth = container.clientWidth || window.innerWidth;
        const containerHeight = container.clientHeight || window.innerHeight;
        
        // 计算缩放比例
        const scaleX = containerWidth / this.baseWidth;
        const scaleY = containerHeight / this.baseHeight;
        let scale = Math.min(scaleX, scaleY);
        
        // 限制缩放范围
        scale = Math.max(this.minRatio, Math.min(this.maxRatio, scale));
        
        // 移动设备特殊处理
        if (this.deviceInfo.isMobile) {
            scale = this.adjustScaleForMobile(scale, containerWidth, containerHeight);
        }
        
        // 计算最终尺寸
        const gameWidth = Math.floor(this.baseWidth * scale);
        const gameHeight = Math.floor(this.baseHeight * scale);
        
        // 更新游戏尺寸
        this.game.scale.resize(gameWidth, gameHeight);
        
        // 居中显示
        this.centerGame(canvas, containerWidth, containerHeight, gameWidth, gameHeight);
        
        // 更新当前缩放信息
        this.currentScale = scale;
        
        // 通知场景尺寸变化
        this.notifyScenes({
            scale,
            gameWidth,
            gameHeight,
            containerWidth,
            containerHeight
        });
        
        // 触发自定义事件
        this.dispatchResizeEvent({
            scale,
            gameWidth,
            gameHeight,
            containerWidth,
            containerHeight
        });
        
        console.log(`Game resized: ${gameWidth}x${gameHeight} (scale: ${scale.toFixed(2)})`);
    }
    
    adjustScaleForMobile(scale, containerWidth, containerHeight) {
        // 移动设备缩放调整
        const isPortrait = containerHeight > containerWidth;
        
        if (isPortrait) {
            // 竖屏模式：优先适配宽度
            scale = Math.min(scale, containerWidth / this.baseWidth);
        } else {
            // 横屏模式：优先适配高度
            scale = Math.min(scale, containerHeight / this.baseHeight);
        }
        
        // 确保在移动设备上不会太小
        if (this.deviceInfo.isMobile) {
            scale = Math.max(scale, 0.6);
        }
        
        return scale;
    }
    
    centerGame(canvas, containerWidth, containerHeight, gameWidth, gameHeight) {
        // 计算居中位置
        const offsetX = Math.floor((containerWidth - gameWidth) / 2);
        const offsetY = Math.floor((containerHeight - gameHeight) / 2);
        
        // 应用样式
        canvas.style.position = 'absolute';
        canvas.style.left = `${offsetX}px`;
        canvas.style.top = `${offsetY}px`;
        canvas.style.width = `${gameWidth}px`;
        canvas.style.height = `${gameHeight}px`;
        
        // 添加边框（开发模式）
        if (__DEV__) {
            canvas.style.border = '1px solid #333';
        }
    }
    
    handleOrientationChange() {
        const newOrientation = this.getOrientation();
        
        if (newOrientation !== this.currentOrientation) {
            console.log(`Orientation changed: ${this.currentOrientation} -> ${newOrientation}`);
            this.currentOrientation = newOrientation;
            
            // 更新设备信息
            this.deviceInfo = this.getDeviceInfo();
            
            // 触发方向变化事件
            this.dispatchOrientationEvent(newOrientation);
        }
    }
    
    getOrientation() {
        if (screen.orientation) {
            return screen.orientation.angle === 0 || screen.orientation.angle === 180 
                ? 'portrait' : 'landscape';
        }
        
        return window.innerHeight > window.innerWidth ? 'portrait' : 'landscape';
    }
    
    notifyScenes(resizeInfo) {
        // 通知所有活动场景
        this.game.scene.getScenes(true).forEach(scene => {
            if (scene.handleResize) {
                scene.handleResize(resizeInfo);
            }
            
            // 触发场景的resize事件
            scene.events.emit('resize', resizeInfo);
        });
    }
    
    dispatchResizeEvent(resizeInfo) {
        const event = new CustomEvent('gameResize', {
            detail: resizeInfo
        });
        window.dispatchEvent(event);
    }
    
    dispatchOrientationEvent(orientation) {
        const event = new CustomEvent('gameOrientationChange', {
            detail: { orientation, deviceInfo: this.deviceInfo }
        });
        window.dispatchEvent(event);
    }
    
    // 获取设备信息
    getDeviceInfo() {
        const userAgent = navigator.userAgent;
        
        return {
            // 设备类型检测
            isMobile: /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(userAgent),
            isTablet: /iPad|Android/i.test(userAgent) && window.innerWidth > 768,
            isDesktop: window.innerWidth > 1024,
            
            // 具体设备检测
            isIOS: /iPad|iPhone|iPod/.test(userAgent),
            isAndroid: /Android/.test(userAgent),
            
            // 浏览器检测
            isChrome: /Chrome/.test(userAgent),
            isSafari: /Safari/.test(userAgent) && !/Chrome/.test(userAgent),
            isFirefox: /Firefox/.test(userAgent),
            
            // 屏幕信息
            orientation: this.getOrientation(),
            pixelRatio: window.devicePixelRatio || 1,
            screenWidth: screen.width,
            screenHeight: screen.height,
            viewportWidth: window.innerWidth,
            viewportHeight: window.innerHeight,
            
            // 功能支持检测
            touchSupport: 'ontouchstart' in window,
            webglSupport: this.checkWebGLSupport(),
            audioSupport: this.checkAudioSupport(),
            
            // 性能相关
            hardwareConcurrency: navigator.hardwareConcurrency || 1,
            memory: navigator.deviceMemory || 'unknown'
        };
    }
    
    checkWebGLSupport() {
        try {
            const canvas = document.createElement('canvas');
            const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
            return !!gl;
        } catch (e) {
            return false;
        }
    }
    
    checkAudioSupport() {
        const audio = document.createElement('audio');
        return {
            mp3: !!(audio.canPlayType && audio.canPlayType('audio/mpeg;').replace(/no/, '')),
            ogg: !!(audio.canPlayType && audio.canPlayType('audio/ogg; codecs="vorbis"').replace(/no/, '')),
            wav: !!(audio.canPlayType && audio.canPlayType('audio/wav; codecs="1"').replace(/no/, '')),
            webm: !!(audio.canPlayType && audio.canPlayType('audio/webm; codecs="vorbis"').replace(/no/, ''))
        };
    }
    
    // 进入全屏
    enterFullscreen() {
        const canvas = this.game.canvas;
        
        if (canvas.requestFullscreen) {
            canvas.requestFullscreen();
        } else if (canvas.webkitRequestFullscreen) {
            canvas.webkitRequestFullscreen();
        } else if (canvas.mozRequestFullScreen) {
            canvas.mozRequestFullScreen();
        } else if (canvas.msRequestFullscreen) {
            canvas.msRequestFullscreen();
        }
    }
    
    // 退出全屏
    exitFullscreen() {
        if (document.exitFullscreen) {
            document.exitFullscreen();
        } else if (document.webkitExitFullscreen) {
            document.webkitExitFullscreen();
        } else if (document.mozCancelFullScreen) {
            document.mozCancelFullScreen();
        } else if (document.msExitFullscreen) {
            document.msExitFullscreen();
        }
    }
    
    // 检查是否全屏
    isFullscreen() {
        return !!(document.fullscreenElement || 
                 document.webkitFullscreenElement || 
                 document.mozFullScreenElement || 
                 document.msFullscreenElement);
    }
    
    // 切换全屏
    toggleFullscreen() {
        if (this.isFullscreen()) {
            this.exitFullscreen();
        } else {
            this.enterFullscreen();
        }
    }
    
    // 防抖函数
    debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }
    
    // 获取当前缩放信息
    getScaleInfo() {
        return {
            scale: this.currentScale,
            baseWidth: this.baseWidth,
            baseHeight: this.baseHeight,
            currentWidth: this.game.canvas.width,
            currentHeight: this.game.canvas.height,
            orientation: this.currentOrientation
        };
    }
    
    // 设置基础尺寸
    setBaseSize(width, height) {
        this.baseWidth = width;
        this.baseHeight = height;
        this.handleResize();
    }
    
    // 设置缩放范围
    setScaleRange(min, max) {
        this.minRatio = min;
        this.maxRatio = max;
        this.handleResize();
    }
    
    // 销毁管理器
    destroy() {
        // 移除事件监听器
        window.removeEventListener('resize', this.handleResize);
        window.removeEventListener('orientationchange', this.handleOrientationChange);
        
        if (screen.orientation) {
            screen.orientation.removeEventListener('change', this.handleOrientationChange);
        }
        
        console.log('ResponsiveManager destroyed');
    }
}
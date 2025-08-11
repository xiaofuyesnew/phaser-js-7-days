/**
 * 全局错误处理器
 * 捕获和处理JavaScript错误、Promise拒绝、资源加载错误等
 */
export class ErrorHandler {
    constructor() {
        this.errors = [];
        this.maxErrors = 100;
        this.isInitialized = false;
        
        this.init();
    }
    
    init() {
        if (this.isInitialized) return;
        
        this.setupGlobalHandlers();
        this.isInitialized = true;
        
        console.log('ErrorHandler initialized');
    }
    
    setupGlobalHandlers() {
        // 捕获JavaScript错误
        window.addEventListener('error', (event) => {
            this.handleError({
                type: 'javascript',
                message: event.message,
                filename: event.filename,
                lineno: event.lineno,
                colno: event.colno,
                error: event.error,
                stack: event.error?.stack,
                timestamp: Date.now(),
                userAgent: navigator.userAgent,
                url: window.location.href
            });
        });
        
        // 捕获Promise拒绝
        window.addEventListener('unhandledrejection', (event) => {
            this.handleError({
                type: 'promise',
                message: event.reason?.message || 'Unhandled Promise Rejection',
                error: event.reason,
                stack: event.reason?.stack,
                timestamp: Date.now(),
                userAgent: navigator.userAgent,
                url: window.location.href
            });
        });
        
        // 捕获资源加载错误
        window.addEventListener('error', (event) => {
            if (event.target !== window) {
                this.handleError({
                    type: 'resource',
                    message: `Failed to load: ${event.target.src || event.target.href}`,
                    element: event.target.tagName,
                    source: event.target.src || event.target.href,
                    timestamp: Date.now(),
                    userAgent: navigator.userAgent,
                    url: window.location.href
                });
            }
        }, true);
        
        // 捕获Phaser特定错误
        this.setupPhaserErrorHandling();
    }
    
    setupPhaserErrorHandling() {
        // 监听Phaser游戏对象的错误
        if (window.Phaser) {
            const originalLog = console.error;
            console.error = (...args) => {
                // 检查是否是Phaser相关错误
                const message = args.join(' ');
                if (message.includes('Phaser') || message.includes('WebGL') || message.includes('Canvas')) {
                    this.handleError({
                        type: 'phaser',
                        message: message,
                        timestamp: Date.now(),
                        userAgent: navigator.userAgent,
                        url: window.location.href
                    });
                }
                
                // 调用原始的console.error
                originalLog.apply(console, args);
            };
        }
    }
    
    handleError(errorInfo) {
        // 添加到错误列表
        this.errors.push(errorInfo);
        
        // 限制错误数量
        if (this.errors.length > this.maxErrors) {
            this.errors.shift();
        }
        
        // 开发环境下输出详细错误
        if (__DEV__) {
            console.group(`🚨 Game Error [${errorInfo.type}]`);
            console.error('Message:', errorInfo.message);
            console.error('Details:', errorInfo);
            if (errorInfo.stack) {
                console.error('Stack:', errorInfo.stack);
            }
            console.groupEnd();
        }
        
        // 生产环境发送错误报告
        if (!__DEV__) {
            this.reportError(errorInfo);
        }
        
        // 尝试恢复
        this.attemptRecovery(errorInfo);
        
        // 触发错误事件
        this.dispatchErrorEvent(errorInfo);
    }
    
    reportError(errorInfo) {
        // 发送到错误监控服务（如Sentry、LogRocket等）
        const errorReport = {
            ...errorInfo,
            gameVersion: __VERSION__,
            buildTime: __BUILD_TIME__,
            sessionId: this.getSessionId(),
            deviceInfo: this.getDeviceInfo()
        };
        
        // 这里可以集成实际的错误报告服务
        // 例如：Sentry.captureException(errorReport);
        
        // 简单的HTTP报告（需要后端支持）
        if (this.shouldReportError(errorInfo)) {
            fetch('/api/errors', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(errorReport)
            }).catch(() => {
                // 静默处理发送失败
                console.warn('Failed to report error to server');
            });
        }
    }
    
    shouldReportError(errorInfo) {
        // 过滤掉一些不需要报告的错误
        const ignoredMessages = [
            'Script error',
            'Non-Error promise rejection captured',
            'ResizeObserver loop limit exceeded'
        ];
        
        return !ignoredMessages.some(ignored => 
            errorInfo.message.includes(ignored)
        );
    }
    
    attemptRecovery(errorInfo) {
        switch (errorInfo.type) {
            case 'resource':
                this.handleResourceError(errorInfo);
                break;
                
            case 'javascript':
                this.handleJavaScriptError(errorInfo);
                break;
                
            case 'phaser':
                this.handlePhaserError(errorInfo);
                break;
                
            case 'promise':
                this.handlePromiseError(errorInfo);
                break;
        }
    }
    
    handleResourceError(errorInfo) {
        // 尝试重新加载资源
        if (errorInfo.source && this.shouldRetryResource(errorInfo)) {
            console.log('Attempting to retry resource load:', errorInfo.source);
            
            // 延迟重试
            setTimeout(() => {
                this.retryResourceLoad(errorInfo.source);
            }, 1000);
        }
    }
    
    handleJavaScriptError(errorInfo) {
        // 检查是否是关键错误
        if (this.isCriticalError(errorInfo)) {
            this.showErrorScreen(errorInfo);
        } else {
            // 非关键错误，尝试继续运行
            console.warn('Non-critical error, continuing execution');
        }
    }
    
    handlePhaserError(errorInfo) {
        // Phaser相关错误处理
        console.warn('Phaser error detected:', errorInfo.message);
        
        // 可以尝试重启游戏场景
        if (window.game && this.isCriticalPhaserError(errorInfo)) {
            this.restartGame();
        }
    }
    
    handlePromiseError(errorInfo) {
        // Promise错误通常不需要特殊处理
        console.warn('Unhandled promise rejection:', errorInfo.message);
    }
    
    shouldRetryResource(errorInfo) {
        // 检查是否应该重试资源加载
        const retryableTypes = ['image', 'audio', 'script'];
        const element = errorInfo.element?.toLowerCase();
        
        return retryableTypes.includes(element);
    }
    
    retryResourceLoad(source) {
        // 实现资源重试逻辑
        // 这里需要根据具体的资源类型来实现
        console.log('Resource retry not implemented for:', source);
    }
    
    isCriticalError(errorInfo) {
        const criticalPatterns = [
            'phaser',
            'game.scene',
            'Cannot read property',
            'is not a function',
            'WebGL',
            'Canvas'
        ];
        
        return criticalPatterns.some(pattern => 
            errorInfo.message.toLowerCase().includes(pattern.toLowerCase())
        );
    }
    
    isCriticalPhaserError(errorInfo) {
        const criticalPhaserPatterns = [
            'WebGL context lost',
            'Canvas not supported',
            'Failed to create WebGL context'
        ];
        
        return criticalPhaserPatterns.some(pattern =>
            errorInfo.message.includes(pattern)
        );
    }
    
    showErrorScreen(errorInfo) {
        // 显示友好的错误页面
        const errorScreen = document.createElement('div');
        errorScreen.id = 'error-screen';
        errorScreen.innerHTML = `
            <div style="
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%);
                color: white;
                font-family: 'Arial', sans-serif;
                display: flex;
                justify-content: center;
                align-items: center;
                z-index: 99999;
            ">
                <div style="text-align: center; max-width: 500px; padding: 20px;">
                    <div style="font-size: 64px; margin-bottom: 20px;">🎮</div>
                    <h1 style="font-size: 24px; margin-bottom: 16px; color: #ff6b6b;">游戏遇到了问题</h1>
                    <p style="font-size: 16px; margin-bottom: 24px; color: #cccccc; line-height: 1.5;">
                        很抱歉，游戏运行时出现了错误。请尝试刷新页面，如果问题持续存在，请联系开发者。
                    </p>
                    ${__DEV__ ? `
                        <details style="margin-bottom: 20px; text-align: left;">
                            <summary style="cursor: pointer; color: #4CAF50;">错误详情 (开发模式)</summary>
                            <pre style="
                                background: #000;
                                padding: 10px;
                                border-radius: 4px;
                                font-size: 12px;
                                overflow: auto;
                                margin-top: 10px;
                                color: #ff6b6b;
                            ">${errorInfo.message}\n\n${errorInfo.stack || ''}</pre>
                        </details>
                    ` : ''}
                    <div>
                        <button onclick="location.reload()" style="
                            padding: 12px 24px;
                            background: #4CAF50;
                            color: white;
                            border: none;
                            border-radius: 6px;
                            cursor: pointer;
                            font-size: 16px;
                            margin-right: 10px;
                            transition: background 0.3s;
                        " onmouseover="this.style.background='#45a049'" onmouseout="this.style.background='#4CAF50'">
                            刷新页面
                        </button>
                        <button onclick="this.parentElement.parentElement.parentElement.parentElement.remove()" style="
                            padding: 12px 24px;
                            background: transparent;
                            color: #cccccc;
                            border: 1px solid #cccccc;
                            border-radius: 6px;
                            cursor: pointer;
                            font-size: 16px;
                            transition: all 0.3s;
                        " onmouseover="this.style.background='#cccccc'; this.style.color='#1a1a1a'" onmouseout="this.style.background='transparent'; this.style.color='#cccccc'">
                            继续尝试
                        </button>
                    </div>
                </div>
            </div>
        `;
        
        document.body.appendChild(errorScreen);
    }
    
    restartGame() {
        if (window.game && window.game.scene) {
            try {
                // 尝试重启当前场景
                const activeScene = window.game.scene.getScenes(true)[0];
                if (activeScene) {
                    activeScene.scene.restart();
                    console.log('Game scene restarted due to critical error');
                }
            } catch (error) {
                console.error('Failed to restart game scene:', error);
                // 如果重启失败，显示错误屏幕
                this.showErrorScreen({
                    message: 'Failed to restart game',
                    stack: error.stack
                });
            }
        }
    }
    
    dispatchErrorEvent(errorInfo) {
        // 触发自定义错误事件，其他模块可以监听
        const errorEvent = new CustomEvent('gameError', {
            detail: errorInfo
        });
        window.dispatchEvent(errorEvent);
    }
    
    getSessionId() {
        // 生成或获取会话ID
        let sessionId = sessionStorage.getItem('gameSessionId');
        if (!sessionId) {
            sessionId = 'session_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
            sessionStorage.setItem('gameSessionId', sessionId);
        }
        return sessionId;
    }
    
    getDeviceInfo() {
        return {
            userAgent: navigator.userAgent,
            platform: navigator.platform,
            language: navigator.language,
            cookieEnabled: navigator.cookieEnabled,
            onLine: navigator.onLine,
            screen: {
                width: screen.width,
                height: screen.height,
                colorDepth: screen.colorDepth
            },
            viewport: {
                width: window.innerWidth,
                height: window.innerHeight
            },
            pixelRatio: window.devicePixelRatio || 1
        };
    }
    
    // 获取错误统计报告
    getErrorReport() {
        const errorTypes = {};
        const recentErrors = this.errors.slice(-10);
        
        this.errors.forEach(error => {
            errorTypes[error.type] = (errorTypes[error.type] || 0) + 1;
        });
        
        return {
            totalErrors: this.errors.length,
            errorTypes,
            recentErrors,
            sessionId: this.getSessionId(),
            timestamp: Date.now()
        };
    }
    
    // 清除错误历史
    clearErrors() {
        this.errors = [];
        console.log('Error history cleared');
    }
    
    // 销毁错误处理器
    destroy() {
        // 移除事件监听器
        // 注意：实际上很难完全移除全局错误处理器
        this.errors = [];
        this.isInitialized = false;
        console.log('ErrorHandler destroyed');
    }
}

// 创建全局错误处理器实例
export const errorHandler = new ErrorHandler();
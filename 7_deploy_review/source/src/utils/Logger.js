/**
 * 游戏日志系统
 * 提供结构化的日志记录和分析功能
 */
export class Logger {
    constructor(options = {}) {
        this.options = {
            level: options.level || (__DEV__ ? 'debug' : 'info'),
            enableConsole: options.enableConsole !== false,
            enableStorage: options.enableStorage !== false,
            enableRemote: options.enableRemote || false,
            maxStorageEntries: options.maxStorageEntries || 1000,
            remoteEndpoint: options.remoteEndpoint || null,
            ...options
        };
        
        this.levels = {
            debug: 0,
            info: 1,
            warn: 2,
            error: 3,
            fatal: 4
        };
        
        this.currentLevel = this.levels[this.options.level] || this.levels.info;
        this.logs = [];
        this.sessionId = this.generateSessionId();
        this.startTime = Date.now();
        
        this.init();
    }
    
    init() {
        // 加载存储的日志
        if (this.options.enableStorage) {
            this.loadStoredLogs();
        }
        
        // 设置全局错误捕获
        this.setupGlobalErrorHandling();
        
        // 设置性能监控
        this.setupPerformanceMonitoring();
        
        // 设置定期上传
        if (this.options.enableRemote) {
            this.setupRemoteLogging();
        }
        
        this.info('Logger initialized', {
            sessionId: this.sessionId,
            level: this.options.level,
            features: {
                console: this.options.enableConsole,
                storage: this.options.enableStorage,
                remote: this.options.enableRemote
            }
        });
    }
    
    generateSessionId() {
        return 'session_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    }
    
    setupGlobalErrorHandling() {
        // JavaScript错误
        window.addEventListener('error', (event) => {
            this.error('JavaScript Error', {
                message: event.message,
                filename: event.filename,
                lineno: event.lineno,
                colno: event.colno,
                stack: event.error?.stack,
                type: 'javascript'
            });
        });
        
        // Promise拒绝
        window.addEventListener('unhandledrejection', (event) => {
            this.error('Unhandled Promise Rejection', {
                reason: event.reason?.message || event.reason,
                stack: event.reason?.stack,
                type: 'promise'
            });
        });
        
        // 资源加载错误
        window.addEventListener('error', (event) => {
            if (event.target !== window) {
                this.warn('Resource Load Error', {
                    element: event.target.tagName,
                    source: event.target.src || event.target.href,
                    type: 'resource'
                });
            }
        }, true);
    }
    
    setupPerformanceMonitoring() {
        // 页面加载性能
        window.addEventListener('load', () => {
            setTimeout(() => {
                if ('performance' in window) {
                    const perfData = performance.getEntriesByType('navigation')[0];
                    if (perfData) {
                        this.info('Page Load Performance', {
                            dns: perfData.domainLookupEnd - perfData.domainLookupStart,
                            tcp: perfData.connectEnd - perfData.connectStart,
                            request: perfData.responseStart - perfData.requestStart,
                            response: perfData.responseEnd - perfData.responseStart,
                            dom: perfData.domContentLoadedEventEnd - perfData.responseEnd,
                            total: perfData.loadEventEnd - perfData.navigationStart,
                            type: 'performance'
                        });
                    }
                }
            }, 0);
        });
        
        // 内存使用监控
        if ('memory' in performance) {
            setInterval(() => {
                const memInfo = performance.memory;
                const usedMB = memInfo.usedJSHeapSize / 1024 / 1024;
                
                if (usedMB > 100) { // 100MB阈值
                    this.warn('High Memory Usage', {
                        used: usedMB,
                        total: memInfo.totalJSHeapSize / 1024 / 1024,
                        limit: memInfo.jsHeapSizeLimit / 1024 / 1024,
                        type: 'memory'
                    });
                }
            }, 30000); // 每30秒检查一次
        }
        
        // 网络状态监控
        if ('onLine' in navigator) {
            window.addEventListener('online', () => {
                this.info('Network Status', { status: 'online', type: 'network' });
            });
            
            window.addEventListener('offline', () => {
                this.warn('Network Status', { status: 'offline', type: 'network' });
            });
        }
    }
    
    setupRemoteLogging() {
        // 定期上传日志
        setInterval(() => {
            this.uploadLogs();
        }, 60000); // 每分钟上传一次
        
        // 页面卸载时上传
        window.addEventListener('beforeunload', () => {
            this.uploadLogs(true); // 同步上传
        });
        
        // 页面隐藏时上传
        document.addEventListener('visibilitychange', () => {
            if (document.hidden) {
                this.uploadLogs();
            }
        });
    }
    
    log(level, message, data = {}, context = {}) {
        if (this.levels[level] < this.currentLevel) {
            return; // 日志级别不够，跳过
        }
        
        const logEntry = {
            id: this.generateLogId(),
            timestamp: Date.now(),
            sessionId: this.sessionId,
            level,
            message,
            data: this.sanitizeData(data),
            context: {
                url: window.location.href,
                userAgent: navigator.userAgent,
                viewport: {
                    width: window.innerWidth,
                    height: window.innerHeight
                },
                ...context
            },
            gameState: this.getGameState()
        };
        
        // 添加到内存日志
        this.logs.push(logEntry);
        
        // 限制内存中的日志数量
        if (this.logs.length > this.options.maxStorageEntries) {
            this.logs.shift();
        }
        
        // 控制台输出
        if (this.options.enableConsole) {
            this.outputToConsole(logEntry);
        }
        
        // 存储到本地
        if (this.options.enableStorage) {
            this.saveToStorage(logEntry);
        }
        
        // 触发日志事件
        this.dispatchLogEvent(logEntry);
        
        return logEntry;
    }
    
    debug(message, data, context) {
        return this.log('debug', message, data, context);
    }
    
    info(message, data, context) {
        return this.log('info', message, data, context);
    }
    
    warn(message, data, context) {
        return this.log('warn', message, data, context);
    }
    
    error(message, data, context) {
        return this.log('error', message, data, context);
    }
    
    fatal(message, data, context) {
        return this.log('fatal', message, data, context);
    }
    
    // 游戏特定的日志方法
    gameEvent(event, data = {}) {
        return this.info(`Game Event: ${event}`, {
            ...data,
            type: 'game-event',
            event
        });
    }
    
    userAction(action, data = {}) {
        return this.info(`User Action: ${action}`, {
            ...data,
            type: 'user-action',
            action
        });
    }
    
    performance(metric, value, data = {}) {
        return this.info(`Performance: ${metric}`, {
            metric,
            value,
            ...data,
            type: 'performance'
        });
    }
    
    generateLogId() {
        return Date.now().toString(36) + Math.random().toString(36).substr(2, 5);
    }
    
    sanitizeData(data) {
        // 移除敏感信息和循环引用
        try {
            return JSON.parse(JSON.stringify(data, (key, value) => {
                // 过滤敏感字段
                if (['password', 'token', 'secret', 'key'].includes(key.toLowerCase())) {
                    return '[REDACTED]';
                }
                
                // 处理函数
                if (typeof value === 'function') {
                    return '[Function]';
                }
                
                // 处理DOM元素
                if (value instanceof Element) {
                    return `[Element: ${value.tagName}]`;
                }
                
                return value;
            }));
        } catch (error) {
            return { error: 'Failed to serialize data', original: String(data) };
        }
    }
    
    getGameState() {
        // 尝试获取游戏状态
        try {
            if (window.game && window.game.scene) {
                const activeScene = window.game.scene.getScenes(true)[0];
                if (activeScene) {
                    return {
                        scene: activeScene.scene.key,
                        fps: Math.round(window.game.loop.actualFps),
                        objects: activeScene.children.length,
                        physics: activeScene.physics ? activeScene.physics.world.bodies.entries.length : 0
                    };
                }
            }
        } catch (error) {
            // 忽略获取游戏状态的错误
        }
        
        return null;
    }
    
    outputToConsole(logEntry) {
        const { level, message, data, timestamp } = logEntry;
        const time = new Date(timestamp).toLocaleTimeString();
        const prefix = `[${time}] [${level.toUpperCase()}]`;
        
        const consoleMethod = {
            debug: 'debug',
            info: 'info',
            warn: 'warn',
            error: 'error',
            fatal: 'error'
        }[level] || 'log';
        
        if (Object.keys(data).length > 0) {
            console[consoleMethod](prefix, message, data);
        } else {
            console[consoleMethod](prefix, message);
        }
    }
    
    saveToStorage(logEntry) {
        try {
            const storageKey = `game_logs_${this.sessionId}`;
            const existingLogs = JSON.parse(localStorage.getItem(storageKey) || '[]');
            
            existingLogs.push(logEntry);
            
            // 限制存储的日志数量
            if (existingLogs.length > this.options.maxStorageEntries) {
                existingLogs.splice(0, existingLogs.length - this.options.maxStorageEntries);
            }
            
            localStorage.setItem(storageKey, JSON.stringify(existingLogs));
        } catch (error) {
            // 存储失败，可能是空间不足
            console.warn('Failed to save log to storage:', error);
        }
    }
    
    loadStoredLogs() {
        try {
            const storageKey = `game_logs_${this.sessionId}`;
            const storedLogs = JSON.parse(localStorage.getItem(storageKey) || '[]');
            this.logs = storedLogs;
        } catch (error) {
            console.warn('Failed to load stored logs:', error);
        }
    }
    
    dispatchLogEvent(logEntry) {
        const event = new CustomEvent('gameLog', {
            detail: logEntry
        });
        window.dispatchEvent(event);
    }
    
    async uploadLogs(sync = false) {
        if (!this.options.enableRemote || !this.options.remoteEndpoint) {
            return;
        }
        
        const logsToUpload = this.logs.filter(log => !log.uploaded);
        if (logsToUpload.length === 0) {
            return;
        }
        
        const payload = {
            sessionId: this.sessionId,
            logs: logsToUpload,
            metadata: {
                userAgent: navigator.userAgent,
                url: window.location.href,
                timestamp: Date.now(),
                gameVersion: __VERSION__ || '1.0.0'
            }
        };
        
        try {
            const method = sync ? 'sendBeacon' : 'fetch';
            
            if (sync && 'sendBeacon' in navigator) {
                // 同步上传（页面卸载时）
                navigator.sendBeacon(
                    this.options.remoteEndpoint,
                    JSON.stringify(payload)
                );
            } else {
                // 异步上传
                const response = await fetch(this.options.remoteEndpoint, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(payload)
                });
                
                if (response.ok) {
                    // 标记为已上传
                    logsToUpload.forEach(log => {
                        log.uploaded = true;
                    });
                    
                    this.debug('Logs uploaded successfully', {
                        count: logsToUpload.length,
                        type: 'log-upload'
                    });
                }
            }
        } catch (error) {
            this.warn('Failed to upload logs', {
                error: error.message,
                count: logsToUpload.length,
                type: 'log-upload'
            });
        }
    }
    
    // 获取日志统计
    getStats() {
        const stats = {
            total: this.logs.length,
            byLevel: {},
            byType: {},
            sessionDuration: Date.now() - this.startTime,
            sessionId: this.sessionId
        };
        
        this.logs.forEach(log => {
            // 按级别统计
            stats.byLevel[log.level] = (stats.byLevel[log.level] || 0) + 1;
            
            // 按类型统计
            const type = log.data.type || 'general';
            stats.byType[type] = (stats.byType[type] || 0) + 1;
        });
        
        return stats;
    }
    
    // 搜索日志
    search(query, options = {}) {
        const {
            level = null,
            type = null,
            startTime = null,
            endTime = null,
            limit = 100
        } = options;
        
        let results = this.logs.filter(log => {
            // 级别过滤
            if (level && log.level !== level) return false;
            
            // 类型过滤
            if (type && log.data.type !== type) return false;
            
            // 时间范围过滤
            if (startTime && log.timestamp < startTime) return false;
            if (endTime && log.timestamp > endTime) return false;
            
            // 文本搜索
            if (query) {
                const searchText = (log.message + JSON.stringify(log.data)).toLowerCase();
                return searchText.includes(query.toLowerCase());
            }
            
            return true;
        });
        
        // 限制结果数量
        if (limit > 0) {
            results = results.slice(-limit);
        }
        
        return results;
    }
    
    // 导出日志
    export(format = 'json') {
        const data = {
            sessionId: this.sessionId,
            exportTime: Date.now(),
            stats: this.getStats(),
            logs: this.logs
        };
        
        switch (format) {
            case 'json':
                return JSON.stringify(data, null, 2);
                
            case 'csv':
                return this.exportToCSV(data.logs);
                
            case 'txt':
                return this.exportToText(data.logs);
                
            default:
                throw new Error(`Unsupported export format: ${format}`);
        }
    }
    
    exportToCSV(logs) {
        const headers = ['timestamp', 'level', 'message', 'type', 'data'];
        const rows = logs.map(log => [
            new Date(log.timestamp).toISOString(),
            log.level,
            log.message,
            log.data.type || '',
            JSON.stringify(log.data)
        ]);
        
        return [headers, ...rows]
            .map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(','))
            .join('\n');
    }
    
    exportToText(logs) {
        return logs.map(log => {
            const time = new Date(log.timestamp).toISOString();
            const data = Object.keys(log.data).length > 0 ? ` | ${JSON.stringify(log.data)}` : '';
            return `[${time}] [${log.level.toUpperCase()}] ${log.message}${data}`;
        }).join('\n');
    }
    
    // 清理日志
    clear() {
        this.logs = [];
        
        if (this.options.enableStorage) {
            try {
                const storageKey = `game_logs_${this.sessionId}`;
                localStorage.removeItem(storageKey);
            } catch (error) {
                console.warn('Failed to clear stored logs:', error);
            }
        }
        
        this.info('Logs cleared');
    }
    
    // 销毁日志器
    destroy() {
        // 上传剩余日志
        if (this.options.enableRemote) {
            this.uploadLogs(true);
        }
        
        this.logs = [];
        this.info('Logger destroyed');
    }
}

// 创建全局日志器实例
export const logger = new Logger({
    level: __DEV__ ? 'debug' : 'info',
    enableRemote: !__DEV__, // 生产环境启用远程日志
    remoteEndpoint: '/api/logs' // 需要后端支持
});

// 便捷的全局日志方法
export const log = {
    debug: (message, data, context) => logger.debug(message, data, context),
    info: (message, data, context) => logger.info(message, data, context),
    warn: (message, data, context) => logger.warn(message, data, context),
    error: (message, data, context) => logger.error(message, data, context),
    fatal: (message, data, context) => logger.fatal(message, data, context),
    
    // 游戏特定方法
    gameEvent: (event, data) => logger.gameEvent(event, data),
    userAction: (action, data) => logger.userAction(action, data),
    performance: (metric, value, data) => logger.performance(metric, value, data)
};
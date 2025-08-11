/**
 * Service Worker for Game Caching and Offline Support
 * 为游戏提供缓存和离线支持
 */

const CACHE_NAME = 'phaser-game-v1.0.0';
const STATIC_CACHE_NAME = 'phaser-game-static-v1.0.0';
const DYNAMIC_CACHE_NAME = 'phaser-game-dynamic-v1.0.0';

// 需要缓存的静态资源
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/src/main.js',
  '/src/style/index.css',
  '/vite.svg',
  '/manifest.json'
];

// 需要缓存的动态资源模式
const CACHE_PATTERNS = [
  /\/src\/.*\.js$/,
  /\/src\/.*\.css$/,
  /\/images\/.*\.(png|jpg|jpeg|gif|svg|webp)$/,
  /\/audio\/.*\.(mp3|ogg|wav|m4a)$/,
  /\/fonts\/.*\.(woff|woff2|ttf|eot)$/
];

// 不需要缓存的资源模式
const EXCLUDE_PATTERNS = [
  /\/api\//,
  /\/admin\//,
  /\.hot-update\./,
  /sockjs-node/
];

/**
 * Service Worker 安装事件
 */
self.addEventListener('install', (event) => {
  console.log('Service Worker: Installing...');
  
  event.waitUntil(
    caches.open(STATIC_CACHE_NAME)
      .then((cache) => {
        console.log('Service Worker: Caching static assets');
        return cache.addAll(STATIC_ASSETS);
      })
      .then(() => {
        console.log('Service Worker: Static assets cached');
        return self.skipWaiting(); // 立即激活新的 Service Worker
      })
      .catch((error) => {
        console.error('Service Worker: Failed to cache static assets', error);
      })
  );
});

/**
 * Service Worker 激活事件
 */
self.addEventListener('activate', (event) => {
  console.log('Service Worker: Activating...');
  
  event.waitUntil(
    caches.keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            // 删除旧版本的缓存
            if (cacheName !== STATIC_CACHE_NAME && 
                cacheName !== DYNAMIC_CACHE_NAME &&
                cacheName.startsWith('phaser-game-')) {
              console.log('Service Worker: Deleting old cache', cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      })
      .then(() => {
        console.log('Service Worker: Activated');
        return self.clients.claim(); // 立即控制所有客户端
      })
      .catch((error) => {
        console.error('Service Worker: Activation failed', error);
      })
  );
});

/**
 * 网络请求拦截
 */
self.addEventListener('fetch', (event) => {
  const request = event.request;
  const url = new URL(request.url);
  
  // 跳过非 GET 请求
  if (request.method !== 'GET') {
    return;
  }
  
  // 跳过不需要缓存的资源
  if (EXCLUDE_PATTERNS.some(pattern => pattern.test(url.pathname))) {
    return;
  }
  
  // 处理静态资源
  if (STATIC_ASSETS.includes(url.pathname) || url.pathname === '/') {
    event.respondWith(handleStaticAsset(request));
    return;
  }
  
  // 处理动态资源
  if (CACHE_PATTERNS.some(pattern => pattern.test(url.pathname))) {
    event.respondWith(handleDynamicAsset(request));
    return;
  }
  
  // 处理其他请求
  event.respondWith(handleOtherRequests(request));
});

/**
 * 处理静态资源 - Cache First 策略
 */
async function handleStaticAsset(request) {
  try {
    const cache = await caches.open(STATIC_CACHE_NAME);
    const cachedResponse = await cache.match(request);
    
    if (cachedResponse) {
      console.log('Service Worker: Serving from static cache', request.url);
      return cachedResponse;
    }
    
    console.log('Service Worker: Fetching static asset', request.url);
    const networkResponse = await fetch(request);
    
    if (networkResponse.ok) {
      cache.put(request, networkResponse.clone());
    }
    
    return networkResponse;
  } catch (error) {
    console.error('Service Worker: Static asset fetch failed', error);
    
    // 返回离线页面或默认响应
    if (request.destination === 'document') {
      return getOfflinePage();
    }
    
    throw error;
  }
}

/**
 * 处理动态资源 - Network First 策略
 */
async function handleDynamicAsset(request) {
  try {
    console.log('Service Worker: Fetching dynamic asset', request.url);
    const networkResponse = await fetch(request);
    
    if (networkResponse.ok) {
      const cache = await caches.open(DYNAMIC_CACHE_NAME);
      cache.put(request, networkResponse.clone());
      console.log('Service Worker: Cached dynamic asset', request.url);
    }
    
    return networkResponse;
  } catch (error) {
    console.log('Service Worker: Network failed, trying cache', request.url);
    
    const cache = await caches.open(DYNAMIC_CACHE_NAME);
    const cachedResponse = await cache.match(request);
    
    if (cachedResponse) {
      console.log('Service Worker: Serving from dynamic cache', request.url);
      return cachedResponse;
    }
    
    console.error('Service Worker: Dynamic asset not found in cache', error);
    throw error;
  }
}

/**
 * 处理其他请求 - Network Only 策略
 */
async function handleOtherRequests(request) {
  try {
    return await fetch(request);
  } catch (error) {
    console.error('Service Worker: Other request failed', error);
    throw error;
  }
}

/**
 * 获取离线页面
 */
function getOfflinePage() {
  return new Response(`
    <!DOCTYPE html>
    <html lang="zh-CN">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>离线模式 - Phaser Game</title>
      <style>
        body {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          background: linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%);
          color: white;
          margin: 0;
          padding: 0;
          display: flex;
          justify-content: center;
          align-items: center;
          min-height: 100vh;
          text-align: center;
        }
        .offline-content {
          max-width: 500px;
          padding: 20px;
        }
        .offline-icon {
          font-size: 64px;
          margin-bottom: 20px;
        }
        .offline-title {
          font-size: 24px;
          margin-bottom: 16px;
          color: #ff6b6b;
        }
        .offline-message {
          font-size: 16px;
          margin-bottom: 24px;
          color: #cccccc;
          line-height: 1.5;
        }
        .offline-button {
          padding: 12px 24px;
          background: #4CAF50;
          color: white;
          border: none;
          border-radius: 6px;
          cursor: pointer;
          font-size: 16px;
          transition: background 0.3s;
        }
        .offline-button:hover {
          background: #45a049;
        }
      </style>
    </head>
    <body>
      <div class="offline-content">
        <div class="offline-icon">📱</div>
        <h1 class="offline-title">离线模式</h1>
        <p class="offline-message">
          您当前处于离线状态。游戏的某些功能可能无法正常使用。
          请检查网络连接后重试。
        </p>
        <button class="offline-button" onclick="location.reload()">
          重新连接
        </button>
      </div>
      
      <script>
        // 监听网络状态变化
        window.addEventListener('online', () => {
          location.reload();
        });
        
        // 定期检查网络状态
        setInterval(() => {
          if (navigator.onLine) {
            location.reload();
          }
        }, 5000);
      </script>
    </body>
    </html>
  `, {
    headers: {
      'Content-Type': 'text/html',
      'Cache-Control': 'no-cache'
    }
  });
}

/**
 * 后台同步事件
 */
self.addEventListener('sync', (event) => {
  console.log('Service Worker: Background sync', event.tag);
  
  if (event.tag === 'game-data-sync') {
    event.waitUntil(syncGameData());
  }
});

/**
 * 同步游戏数据
 */
async function syncGameData() {
  try {
    console.log('Service Worker: Syncing game data...');
    
    // 这里可以实现游戏数据同步逻辑
    // 例如：上传游戏进度、分数等
    
    console.log('Service Worker: Game data synced');
  } catch (error) {
    console.error('Service Worker: Game data sync failed', error);
  }
}

/**
 * 推送通知事件
 */
self.addEventListener('push', (event) => {
  console.log('Service Worker: Push received', event);
  
  const options = {
    body: event.data ? event.data.text() : '游戏有新的更新！',
    icon: '/vite.svg',
    badge: '/vite.svg',
    vibrate: [100, 50, 100],
    data: {
      dateOfArrival: Date.now(),
      primaryKey: 1
    },
    actions: [
      {
        action: 'explore',
        title: '查看游戏',
        icon: '/images/checkmark.png'
      },
      {
        action: 'close',
        title: '关闭',
        icon: '/images/xmark.png'
      }
    ]
  };
  
  event.waitUntil(
    self.registration.showNotification('Phaser Game', options)
  );
});

/**
 * 通知点击事件
 */
self.addEventListener('notificationclick', (event) => {
  console.log('Service Worker: Notification click', event);
  
  event.notification.close();
  
  if (event.action === 'explore') {
    event.waitUntil(
      clients.openWindow('/')
    );
  }
});

/**
 * 消息事件 - 与主线程通信
 */
self.addEventListener('message', (event) => {
  console.log('Service Worker: Message received', event.data);
  
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
  
  if (event.data && event.data.type === 'GET_VERSION') {
    event.ports[0].postMessage({
      type: 'VERSION',
      version: CACHE_NAME
    });
  }
  
  if (event.data && event.data.type === 'CLEAR_CACHE') {
    event.waitUntil(
      caches.keys().then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (cacheName.startsWith('phaser-game-')) {
              return caches.delete(cacheName);
            }
          })
        );
      })
    );
  }
});

/**
 * 错误处理
 */
self.addEventListener('error', (event) => {
  console.error('Service Worker: Error', event.error);
});

self.addEventListener('unhandledrejection', (event) => {
  console.error('Service Worker: Unhandled rejection', event.reason);
});

console.log('Service Worker: Script loaded');
/**
 * FastFingers — Custom Service Worker
 * @author Dupley Maxim Igorevich
 * @copyright 2025-2026 Dupley Maxim Igorevich
 * 
 * Расширенный сервис-воркер с улучшенным кэшированием
 */

const CACHE_NAME = 'fastfingers-v1'
const STATIC_CACHE = 'fastfingers-static-v1'
const DYNAMIC_CACHE = 'fastfingers-dynamic-v1'
const IMAGE_CACHE = 'fastfingers-images-v1'

// Debug mode: only log in development
const IS_DEBUG = self.location.hostname === 'localhost' || self.location.hostname === '127.0.0.1'

/** @param {unknown[]} args */
function debugLog(...args) {
  if (IS_DEBUG) console.log('[SW]', ...args)
}
/** @param {unknown[]} args */
function debugError(...args) {
  if (IS_DEBUG) console.error('[SW]', ...args)
}

// Ресурсы для пре-кэширования
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/offline.html',
  '/manifest.webmanifest',
]

// Лимиты кэша
const CACHE_LIMITS = {
  dynamic: 50,
  images: 30,
}

// Установка сервис-воркера
self.addEventListener('install', /** @param {ExtendableEvent} event */ (event) => {
  debugLog('Installing service worker...')

  event.waitUntil(
    caches.open(STATIC_CACHE)
      .then((cache) => {
        debugLog('Pre-caching static assets')
        return cache.addAll(STATIC_ASSETS)
      })
      .catch((err) => {
        debugError('Pre-cache failed:', err)
      })
  )

  self.skipWaiting()
})

// Активация сервис-воркера
self.addEventListener('activate', /** @param {ExtendableEvent} event */ (event) => {
  debugLog('Activating service worker...')
  
  event.waitUntil(
    Promise.all([
      // Очистка старых кэшей
      caches.keys().then((cacheNames) => {
        return Promise.all(
          cacheNames
            .filter((cacheName) => {
              return cacheName !== STATIC_CACHE && 
                     cacheName !== DYNAMIC_CACHE && 
                     cacheName !== IMAGE_CACHE
            })
            .map((cacheName) => {
              debugLog('Deleting old cache:', cacheName)
              return caches.delete(cacheName)
            })
        )
      }),
      // Очистка превышающих лимит кэшей
      trimCache(DYNAMIC_CACHE, CACHE_LIMITS.dynamic),
      trimCache(IMAGE_CACHE, CACHE_LIMITS.images),
    ]).then(() => {
      debugLog('Service worker activated')
      return self.clients.claim()
    })
  )
})

// Перехват запросов
self.addEventListener('fetch', /** @param {FetchEvent} event */ (event) => {
  const { request } = event
  const url = new URL(request.url)
  
  // Пропускаем не-GET запросы
  if (request.method !== 'GET') {
    return
  }
  
  // Пропускаем chrome-extension и другие не-http запросы
  if (!url.protocol.startsWith('http')) {
    return
  }
  
  event.respondWith(handleRequest(request))
})

// Обработка запросов
/**
 * @param {Request} request
 * @returns {Promise<Response>}
 */
async function handleRequest(request) {
  const url = new URL(request.url)
  
  try {
    // Для изображений используем Cache First
    if (isImageRequest(url)) {
      return await handleImageRequest(request)
    }
    
    // Для API запросов используем Network First
    if (isApiRequest(url)) {
      return await handleApiRequest(request)
    }
    
    // Для статических ресурсов используем Cache First
    if (isStaticAsset(url)) {
      return await handleStaticRequest(request)
    }
    
    // Для остальных запросов используем Stale While Revalidate
    return await handleDynamicRequest(request)
  } catch (error) {
    debugError('Request failed:', error)
    return await caches.match('/offline.html') || new Response('Offline', { status: 503 })
  }
}

// Проверка типа запроса
/**
 * @param {URL} url
 * @returns {boolean}
 */
function isImageRequest(url) {
  return /\.(png|jpg|jpeg|gif|svg|webp|ico)$/i.test(url.pathname)
}

/**
 * @param {URL} url
 * @returns {boolean}
 */
function isApiRequest(url) {
  return url.pathname.startsWith('/api/') ||
         url.hostname.includes('supabase') ||
         url.hostname.includes('api.')
}

/**
 * @param {URL} url
 * @returns {boolean}
 */
function isStaticAsset(url) {
  return /\.(js|css|woff|woff2|ttf|eot)$/i.test(url.pathname) ||
         url.pathname.includes('/assets/')
}

// Обработчики запросов
/**
 * @param {Request} request
 * @returns {Promise<Response>}
 */
async function handleImageRequest(request) {
  const cachedResponse = await caches.match(request)
  
  if (cachedResponse) {
    // Возвращаем из кэша, но обновляем в фоне
    fetch(request).then((response) => {
      if (response.ok) {
        caches.open(IMAGE_CACHE).then((cache) => cache.put(request, response))
      }
    }).catch(() => {})
    
    return cachedResponse
  }
  
  try {
    const response = await fetch(request)
    if (response.ok) {
      const cache = await caches.open(IMAGE_CACHE)
      cache.put(request, response.clone())
      await trimCache(IMAGE_CACHE, CACHE_LIMITS.images)
    }
    return response
  } catch (error) {
    // Возвращаем placeholder для изображений
    return new Response('', { status: 404 })
  }
}

/**
 * @param {Request} request
 * @returns {Promise<Response>}
 */
async function handleApiRequest(request) {
  try {
    const response = await fetch(request)
    
    if (response.ok) {
      const cache = await caches.open(DYNAMIC_CACHE)
      cache.put(request, response.clone())
    }
    
    return response
  } catch (error) {
    // Возвращаем из кэша если сеть недоступна
    const cachedResponse = await caches.match(request)
    if (cachedResponse) {
      return cachedResponse
    }
    
    throw error
  }
}

/**
 * @param {Request} request
 * @returns {Promise<Response>}
 */
async function handleStaticRequest(request) {
  const cachedResponse = await caches.match(request)
  
  if (cachedResponse) {
    return cachedResponse
  }
  
  try {
    const response = await fetch(request)
    if (response.ok) {
      const cache = await caches.open(STATIC_CACHE)
      cache.put(request, response.clone())
    }
    return response
  } catch (error) {
    throw error
  }
}

/**
 * @param {Request} request
 * @returns {Promise<Response>}
 */
async function handleDynamicRequest(request) {
  const cachedResponse = await caches.match(request)
  
  const fetchPromise = fetch(request).then((networkResponse) => {
    if (networkResponse.ok) {
      caches.open(DYNAMIC_CACHE).then((cache) => {
        cache.put(request, networkResponse.clone())
        trimCache(DYNAMIC_CACHE, CACHE_LIMITS.dynamic)
      })
    }
    return networkResponse
  })
  
  // Возвращаем из кэша или ждём сеть
  return cachedResponse || fetchPromise
}

// Очистка кэша до лимита
/**
 * @param {string} cacheName
 * @param {number} limit
 * @returns {Promise<void>}
 */
async function trimCache(cacheName, limit) {
  try {
    const cache = await caches.open(cacheName)
    const keys = await cache.keys()
    
    if (keys.length > limit) {
      debugLog(`Trimming ${cacheName} cache from ${keys.length} to ${limit} items`)
      
      const deleteCount = keys.length - limit
      await Promise.all(
        keys.slice(0, deleteCount).map((key) => cache.delete(key))
      )
    }
  } catch (error) {
    debugError('Cache trim failed:', error)
  }
}

// Background sync для офлайн действий
self.addEventListener('sync', /** @param {SyncEvent} event */ (event) => {
  debugLog('Sync event:', event.tag)
  
  if (event.tag === 'sync-typing-data') {
    event.waitUntil(syncTypingData())
  }
})

async function syncTypingData() {
  // Логика синхронизации данных печати
  debugLog('Syncing typing data...')
  
  try {
    const db = await openDatabase()
    const pendingData = await getPendingData(db)
    
    for (const data of pendingData) {
      await fetch('/api/sessions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      await removePendingData(db, data.id)
    }
    
    debugLog('Typing data synced successfully')
  } catch (error) {
    debugError('Sync failed:', error)
  }
}

// IndexedDB утилиты
/**
 * @returns {Promise<IDBDatabase>}
 */
function openDatabase() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('fastfingers-offline', 1)

    request.onerror = () => reject(request.error)
    request.onsuccess = () => resolve(request.result)

    request.onupgradeneeded = (event) => {
      const db = /** @type {IDBOpenDBRequest} */ (event.target).result
      if (!db.objectStoreNames.contains('pendingSessions')) {
        db.createObjectStore('pendingSessions', { keyPath: 'id' })
      }
    }
  })
}

/**
 * @param {IDBDatabase} db
 * @returns {Promise<any[]>}
 */
function getPendingData(db) {
  return new Promise((resolve, reject) => {
    const transaction = db.transaction('pendingSessions', 'readonly')
    const store = transaction.objectStore('pendingSessions')
    const request = store.getAll()
    
    request.onerror = () => reject(request.error)
    request.onsuccess = () => resolve(request.result || [])
  })
}

/**
 * @param {IDBDatabase} db
 * @param {string} id
 * @returns {Promise<void>}
 */
function removePendingData(db, id) {
  return new Promise((resolve, reject) => {
    const transaction = db.transaction('pendingSessions', 'readwrite')
    const store = transaction.objectStore('pendingSessions')
    const request = store.delete(id)
    
    request.onerror = () => reject(request.error)
    request.onsuccess = () => resolve()
  })
}

// Push notifications
self.addEventListener('push', /** @param {PushEvent} event */ (event) => {
  debugLog('Push received:', event)
  
  const data = event.data?.json() || {}
  const title = data.title || 'FastFingers'
  const options = {
    body: data.body || 'Новое уведомление',
    icon: '/icons/icon-192x192.png',
    badge: '/icons/badge-72x72.png',
    vibrate: [100, 50, 100],
    data: data.data || {},
    actions: data.actions || [],
  }
  
  event.waitUntil(
    self.registration.showNotification(title, options)
  )
})

// Notification click handler
self.addEventListener('notificationclick', /** @param {NotificationEvent} event */ (event) => {
  debugLog('Notification clicked:', event.action)
  
  event.notification.close()
  
  if (event.action === 'open-practice') {
    event.waitUntil(
      clients.openWindow('/?mode=practice')
    )
  } else if (event.action === 'open-sprint') {
    event.waitUntil(
      clients.openWindow('/?mode=sprint')
    )
  } else {
    event.waitUntil(
      clients.openWindow('/')
    )
  }
})

// Message handler для коммуникации с приложением
self.addEventListener('message', /** @param {ExtendableMessageEvent} event */ (event) => {
  debugLog('Message received:', event.data)
  
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting()
  }
  
  if (event.data && event.data.type === 'GET_VERSION') {
    event.ports[0].postMessage({ version: CACHE_NAME })
  }
  
  if (event.data && event.data.type === 'CLEAR_CACHE') {
    event.waitUntil(
      Promise.all([
        caches.delete(DYNAMIC_CACHE),
        caches.delete(IMAGE_CACHE),
      ]).then(() => {
        event.ports[0].postMessage({ success: true })
      })
    )
  }
})

debugLog('Service worker script loaded')

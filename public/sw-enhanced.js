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
self.addEventListener('install', (event: ExtendableEvent) => {
  console.log('[SW] Installing service worker...')
  
  event.waitUntil(
    caches.open(STATIC_CACHE)
      .then((cache) => {
        console.log('[SW] Pre-caching static assets')
        return cache.addAll(STATIC_ASSETS)
      })
      .catch((err) => {
        console.error('[SW] Pre-cache failed:', err)
      })
  )
  
  self.skipWaiting()
})

// Активация сервис-воркера
self.addEventListener('activate', (event: ExtendableEvent) => {
  console.log('[SW] Activating service worker...')
  
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
              console.log('[SW] Deleting old cache:', cacheName)
              return caches.delete(cacheName)
            })
        )
      }),
      // Очистка превышающих лимит кэшей
      trimCache(DYNAMIC_CACHE, CACHE_LIMITS.dynamic),
      trimCache(IMAGE_CACHE, CACHE_LIMITS.images),
    ]).then(() => {
      console.log('[SW] Service worker activated')
      return self.clients.claim()
    })
  )
})

// Перехват запросов
self.addEventListener('fetch', (event: FetchEvent) => {
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
async function handleRequest(request: Request): Promise<Response> {
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
    console.error('[SW] Request failed:', error)
    return await caches.match('/offline.html') || new Response('Offline', { status: 503 })
  }
}

// Проверка типа запроса
function isImageRequest(url: URL): boolean {
  return /\.(png|jpg|jpeg|gif|svg|webp|ico)$/i.test(url.pathname)
}

function isApiRequest(url: URL): boolean {
  return url.pathname.startsWith('/api/') || 
         url.hostname.includes('supabase') ||
         url.hostname.includes('api.')
}

function isStaticAsset(url: URL): boolean {
  return /\.(js|css|woff|woff2|ttf|eot)$/i.test(url.pathname) ||
         url.pathname.includes('/assets/')
}

// Обработчики запросов
async function handleImageRequest(request: Request): Promise<Response> {
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

async function handleApiRequest(request: Request): Promise<Response> {
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

async function handleStaticRequest(request: Request): Promise<Response> {
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

async function handleDynamicRequest(request: Request): Promise<Response> {
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
async function trimCache(cacheName: string, limit: number): Promise<void> {
  try {
    const cache = await caches.open(cacheName)
    const keys = await cache.keys()
    
    if (keys.length > limit) {
      console.log(`[SW] Trimming ${cacheName} cache from ${keys.length} to ${limit} items`)
      
      const deleteCount = keys.length - limit
      await Promise.all(
        keys.slice(0, deleteCount).map((key) => cache.delete(key))
      )
    }
  } catch (error) {
    console.error('[SW] Cache trim failed:', error)
  }
}

// Background sync для офлайн действий
self.addEventListener('sync', (event: SyncEvent) => {
  console.log('[SW] Sync event:', event.tag)
  
  if (event.tag === 'sync-typing-data') {
    event.waitUntil(syncTypingData())
  }
})

async function syncTypingData(): Promise<void> {
  // Логика синхронизации данных печати
  console.log('[SW] Syncing typing data...')
  
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
    
    console.log('[SW] Typing data synced successfully')
  } catch (error) {
    console.error('[SW] Sync failed:', error)
  }
}

// IndexedDB утилиты
function openDatabase(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('fastfingers-offline', 1)
    
    request.onerror = () => reject(request.error)
    request.onsuccess = () => resolve(request.result)
    
    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result
      if (!db.objectStoreNames.contains('pendingSessions')) {
        db.createObjectStore('pendingSessions', { keyPath: 'id' })
      }
    }
  })
}

function getPendingData(db: IDBDatabase): Promise<any[]> {
  return new Promise((resolve, reject) => {
    const transaction = db.transaction('pendingSessions', 'readonly')
    const store = transaction.objectStore('pendingSessions')
    const request = store.getAll()
    
    request.onerror = () => reject(request.error)
    request.onsuccess = () => resolve(request.result || [])
  })
}

function removePendingData(db: IDBDatabase, id: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const transaction = db.transaction('pendingSessions', 'readwrite')
    const store = transaction.objectStore('pendingSessions')
    const request = store.delete(id)
    
    request.onerror = () => reject(request.error)
    request.onsuccess = () => resolve()
  })
}

// Push notifications
self.addEventListener('push', (event: PushEvent) => {
  console.log('[SW] Push received:', event)
  
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
self.addEventListener('notificationclick', (event: NotificationEvent) => {
  console.log('[SW] Notification clicked:', event.action)
  
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
self.addEventListener('message', (event: ExtendableMessageEvent) => {
  console.log('[SW] Message received:', event.data)
  
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

console.log('[SW] Service worker script loaded')

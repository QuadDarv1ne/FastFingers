# Fallback UI при недоступности бэкенда

## Обзор

Компоненты и хуки для обработки недоступности бэкенда (Supabase) и предоставления пользователю обратной связи.

## Компоненты

### `BackendFallbackBanner`

Баннер-уведомление о недоступности бэкенда.

```tsx
import { BackendFallbackBanner } from '@/components/BackendFallbackBanner'

function MyComponent() {
  return <BackendFallbackBanner onRetry={() => console.log('Retrying...')} />
}
```

**Props:**

- `onRetry?: () => void` - Callback при нажатии кнопки "Проверить снова"
- `className?: string` - Дополнительные CSS-классы

### `WithBackendFallback`

Обёртка для компонентов с fallback UI.

```tsx
import { WithBackendFallback } from '@/components/WithBackendFallback'

function MyComponent() {
  return (
    <WithBackendFallback
      showBanner={true}
      fallback={<div>Сервер недоступен, показываем локальные данные</div>}
    >
      <Leaderboard />
    </WithBackendFallback>
  )
}
```

**Props:**

- `fallback?: ReactNode` - UI для показа когда бэкенд недоступен
- `showBanner?: boolean` - Показывать баннер вместо скрытия контента
- `className?: string` - Дополнительные CSS-классы

## Хуки

### `useBackendAvailability`

Хук для отслеживания доступности бэкенда.

```tsx
import { useBackendAvailability } from '@/hooks/useBackendAvailability'

function MyComponent() {
  const {
    isAvailable,
    isChecking,
    canRetry,
    retryCount,
    checkBackend,
    resetStatus,
    isOfflineMode,
  } = useBackendAvailability({
    autoCheck: true,
    checkInterval: 30000,
  })

  if (isChecking) return <div>Проверка...</div>
  if (!isAvailable) return <div>Офлайн режим</div>

  return <div>Онлайн</div>
}
```

**Options:**

- `autoCheck?: boolean` - Автоматически проверять соединение (по умолчанию true)
- `checkInterval?: number` - Интервал проверки в мс (по умолчанию 30000)

**Returns:**

- `isAvailable: boolean` - Доступен ли бэкенд
- `isChecking: boolean` - Идёт ли проверка
- `lastChecked: number | null` - Время последней проверки
- `retryCount: number` - Количество попыток
- `canRetry: boolean` - Можно ли сделать повторную попытку
- `checkBackend: () => Promise<void>` - Принудительная проверка
- `resetStatus: () => void` - Сброс статуса
- `isOfflineMode: boolean` - Режим офлайн

## Сервис `cloudSync.ts`

### Новые функции

```ts
// Проверка доступности бэкенда
isBackendAvailable(): boolean

// Получение статуса бэкенда с кэшированием
getBackendStatus(): BackendStatus

// Обновление статуса бэкенда
updateBackendStatus(features?: Partial<BackendStatus['features']>): BackendStatus

// Проверка доступности конкретной функции
isFeatureAvailable(feature: keyof BackendStatus['features']): boolean
```

### Обновлённые функции

Функции теперь возвращают статус вместо `void`:

```ts
// Синхронизация статистики пользователя
syncUserStats(user, stats): Promise<{ success: boolean; isOffline: boolean }>

// Сохранение сессии печати
saveTypingSession(userId, stats, xp): Promise<{ success: boolean; isOffline: boolean }>

// Загрузка сессий пользователя
loadUserSessions(userId, limit): Promise<{ sessions: CloudSession[]; isOffline: boolean }>
```

## Примеры использования

### Пример 1: Компонент с fallback

```tsx
import { WithBackendFallback } from '@/components/WithBackendFallback'
import { Leaderboard } from '@/components/Leaderboard'

function Dashboard() {
  return (
    <WithBackendFallback
      showBanner={true}
      fallback={
        <div className="p-4 bg-warning-500/10 rounded-lg">
          <p>Лидерборд временно недоступен</p>
        </div>
      }
    >
      <Leaderboard />
    </WithBackendFallback>
  )
}
```

### Пример 2: Ручная проверка статуса

```tsx
import { useBackendAvailability } from '@/hooks/useBackendAvailability'
import { getBackendStatus } from '@/services/cloudSync'

function StatusIndicator() {
  const { isAvailable, checkBackend } = useBackendAvailability({ autoCheck: false })

  const handleCheck = async () => {
    await checkBackend()
    const status = getBackendStatus()
    console.log('Backend status:', status)
  }

  return (
    <div>
      <span>{isAvailable ? '🟢' : '🔴'}</span>
      <button onClick={handleCheck}>Проверить</button>
    </div>
  )
}
```

### Пример 3: Синхронизация с обработкой ошибок

```tsx
import { syncUserStats } from '@/services/cloudSync'

async function handleStatsUpdate(user, newStats) {
  const result = await syncUserStats(user, newStats)

  if (result.success && result.isOffline) {
    toast.info('Данные сохранены локально и будут синхронизированы позже')
  } else if (!result.success) {
    toast.error('Не удалось сохранить данные')
  }
}
```

## Миграция

### Обновление существующего кода

**До:**

```ts
await syncUserStats(user, stats) // void
await saveTypingSession(userId, stats, xp) // void
```

**После:**

```ts
const syncResult = await syncUserStats(user, stats)
if (syncResult.isOffline) {
  // Обработка офлайн-режима
}

const saveResult = await saveTypingSession(userId, stats, xp)
if (saveResult.success) {
  // Успешно сохранено
}
```

## Тестирование

```tsx
import { render, screen } from '@testing-library/react'
import { BackendFallbackBanner } from '@/components/BackendFallbackBanner'

test('показывает баннер при недоступном бэкенде', () => {
  render(<BackendFallbackBanner />)
  expect(screen.getByText(/режим ограниченной функциональности/i)).toBeInTheDocument()
})

test('скрывает баннер при доступном бэкенде', () => {
  // Mock isBackendAvailable to return true
  render(<BackendFallbackBanner />)
  expect(screen.queryByRole('alert')).not.toBeInTheDocument()
})
```

## Примечания

1. **Кэширование статуса**: Статус бэкенда кэшируется в localStorage на 5 минут
2. **Автоматические проверки**: Хук автоматически проверяет соединение каждые 30 секунд
3. **Ограниченное количество попыток**: Максимум 3 попытки переподключения
4. **Fallback на localStorage**: Все данные сохраняются локально при недоступности бэкенда

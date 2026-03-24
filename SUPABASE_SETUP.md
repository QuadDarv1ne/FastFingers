# Настройка Supabase для FastFingers

## Шаг 1: Создание проекта

1. Перейдите на https://supabase.com
2. Нажмите "Start your project" или "New Project"
3. Заполните форму:
   - **Name**: fastfingers (или ваше название)
   - **Database Password**: надежный пароль (сохраните!)
   - **Region**: выберите ближайший к вам
4. Нажмите "Create new project"

## Шаг 2: Получение ключей доступа

1. В панели проекта перейдите в **Settings** (шестеренка внизу)
2. Выберите **API** в левом меню
3. Скопируйте значения:
   - **Project URL**: `https://xxxxx.supabase.co`
   - **anon/public key**: `eyJhbG...` (длинная строка)

## Шаг 3: Настройка переменных окружения

1. Скопируйте `.env.example` в `.env`:
   ```bash
   cp .env.example .env
   ```

2. Отредактируйте `.env` и вставьте ваши значения:
   ```env
   VITE_SUPABASE_URL=https://your-project.supabase.co
   VITE_SUPABASE_ANON_KEY=your-anon-key-here
   ```

## Шаг 4: Применение миграций базы данных

### Вариант A: Через Supabase Dashboard (рекомендуется)

1. В панели проекта перейдите в **SQL Editor**
2. Нажмите "New Query"
3. Скопируйте содержимое файлов миграции по порядку:
   - `supabase/migrations/001_initial_schema.sql`
   - `supabase/migrations/002_hardcore_mode.sql`
   - `supabase/migrations/003_leaderboards_duels.sql`
   - `supabase/migrations/004_user_stats_table.sql`
4. Выполните каждый файл (нажмите "Run" или Ctrl+Enter)

### Вариант B: Через Supabase CLI

```bash
# Установите Supabase CLI
npm install -g supabase

# Войдите в аккаунт
supabase login

# Привяжите проект
supabase link --project-ref your-project-ref

# Примените миграции
supabase db push
```

## Шаг 5: Проверка подключения

1. Запустите проект:
   ```bash
   npm run dev
   ```

2. Откройте приложение в браузере
3. Попробуйте:
   - Зарегистрировать нового пользователя
   - Войти в систему
   - Сохранить прогресс
   - Открыть таблицу лидеров

## Шаг 6: Настройка Realtime (для дуэлей и турниров)

1. В панели проекта перейдите в **Database** → **Replication**
2. Включите Realtime для таблиц:
   - `duels`
   - `tournaments`
   - `tournament_participants`

## Таблицы базы данных

После применения миграций будут созданы следующие таблицы:

### Основные таблицы
- `users` — профили пользователей
- `user_stats` — статистика пользователей (для синхронизации)
- `typing_sessions` — истории тренировок

### Лидерборды и соревнования
- `leaderboards` — записи лидербордов
- `duels` — дуэли между пользователями
- `tournaments` — турниры
- `tournament_participants` — участники турниров

### Функции и триггеры
- `get_leaderboard(user_id, game_mode, time_filter)` — получение лидерборда
- `get_user_rank(user_id, game_mode)` — ранг пользователя
- `update_user_stats_after_session()` — обновление статистики после сессии

## Проверка работы

### Cloud Sync Service

```typescript
import { cloudSyncService } from './services/cloudSyncService'

// Сохранение прогресса
await cloudSyncService.saveProgress(user, stats)

// Загрузка прогресса
const saved = await cloudSyncService.loadProgress(userId)

// Синхронизация
const merged = await cloudSyncService.sync(user, localStats)
```

### Leaderboard

```typescript
import { useLeaderboard, useUserRank } from './hooks/useLeaderboard'

// Получение лидерборда
const { data, isLoading } = useLeaderboard({
  gameMode: 'classic',
  timeFilter: 'week',
  sortBy: 'wpm',
})

// Ранг пользователя
const { data: rankData } = useUserRank(userId, 'classic')
```

## Устранение неполадок

### Ошибка "Supabase not configured"

- Проверьте что `.env` файл существует
- Убедитесь что переменные `VITE_SUPABASE_URL` и `VITE_SUPABASE_ANON_KEY` установлены
- Перезапустите dev-сервер

### Ошибка CORS

- Убедитесь что URL правильный (https://)
- Проверьте что anon key скопирован полностью

### Ошибка "Table does not exist"

- Примените все миграции в правильном порядке
- Проверьте что миграции выполнены в SQL Editor

### Realtime не работает

- Включите Realtime в настройках таблицы
- Проверьте что RLS политики настроены правильно

## Безопасность

### Row Level Security (RLS)

Все таблицы защищены RLS политиками:
- Пользователи могут читать/записывать только свои данные
- Лидерборды публичные (только чтение)
- Дуэли видны обоим участникам

### Рекомендации

1. **Никогда не коммитьте `.env` файл** — он в `.gitignore`
2. **Используйте environment variables** для production
3. **Регулярно делайте бэкапы** базы данных

## Production настройка

### Vercel

```bash
# Добавьте переменные окружения в настройках проекта
vercel env add VITE_SUPABASE_URL
vercel env add VITE_SUPABASE_ANON_KEY
```

### Netlify

```bash
# Settings → Build & deploy → Environment
# Добавьте переменные окружения
```

### Docker

```dockerfile
ENV VITE_SUPABASE_URL=https://your-project.supabase.co
ENV VITE_SUPABASE_ANON_KEY=your-anon-key
```

## Полезные ссылки

- [Supabase Documentation](https://supabase.com/docs)
- [Supabase JS Client](https://supabase.com/docs/reference/javascript/introduction)
- [Row Level Security Guide](https://supabase.com/docs/guides/auth/row-level-security)
- [Realtime Guide](https://supabase.com/docs/guides/realtime)

## Поддержка

Вопросы и проблемы:
- GitHub Issues: https://github.com/fastfingers/fastfingers/issues
- Supabase Discord: https://discord.supabase.com

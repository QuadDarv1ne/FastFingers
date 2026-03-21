# FastFingers — Changelog

Все значимые изменения в проекте FastFingers.

## [0.2.0] — 2026-03-21

### ✨ Новые возможности

#### UI/UX улучшения
- Добавлено 15+ новых CSS анимаций:
  - `typing-effect` — эффект печатной машинки для текста
  - `glow-pulse` — пульсирующее свечение для важных элементов
  - `float` — эффект парения для карточек
  - `rotate-glow` — вращение с свечением для иконок достижений
  - `progress-wave` — эффект волны для прогресс баров
  - `rainbow` — радужный эффект для специальных достижений
  - `combo-scale` — увеличение для комбо-счётчика
  - `sparkles` — эффект искр для достижений
  - `gradient-border` — градиентная граница
  - `marquee` — бегущая строка
  - `slide-in-left/right` — появление слева/справа
  - `notification-pulse` — пульсация для уведомлений
  - `key-glow` — свечение для активных клавиш
  - `text-shimmer` — переливание текста
- Новые CSS классы для эффектов:
  - `.gradient-card` — градиентный фон для карточек
  - `.shadow-floating` — тень для плавающих элементов
  - `.icon-hover-scale` — увеличение иконок при наведении
  - `.blur-backdrop` — размытие фона модальных окон
- Улучшена доступность с `prefers-reduced-motion`
- Улучшен высокий контраст для доступности

#### Оптимизация производительности
- Улучшена конфигурация Vite:
  - Добавлен Babel плагин для оптимизации React хуков
  - Улучшен tree-shaking с `preset: 'safest'`
  - Оптимизирован code splitting с manual chunks
  - Добавлен CSS modules с `camelCaseOnly`
  - Уменьшен chunkSizeWarningLimit до 350KB
- Расширенное кэширование в PWA:
  - Кэширование Google Fonts
  - Кэширование изображений (50 шт, 30 дней)
  - Кэширование API запросов
- Новый хук `usePerformanceOptimizer`:
  - `useDebounce` — debounce с leading/trailing опциями
  - `useThrottle` — throttle с опциями
  - `useDeepMemo` — глубокое сравнение для мемоизации
  - `useOptimizedRender` — оптимизированный рендеринг
  - `usePerformanceMeasure` — измерение производительности функций
- Lazy loading для тяжёлых компонентов
- Мемоизация callback функций

#### Новые игровые режимы
- **Марафон** (`MarathonMode.tsx`):
  - 5 минут непрерывной печати
  - Система майлстоунов (60, 120, 180, 240, 300 секунд)
  - Уведомления о достижении этапов
  - Комбо-счётчик с максимумом
  - Прогресс по этапам
  - Мотивационные сообщения
  - Статистика в реальном времени
  - Анимированные оверлеи старта/финиша

#### Улучшение статистики и аналитики
- Новый компонент `PerformanceInsights`:
  - Анализ тренда WPM (рост/падение)
  - Анализ точности с рекомендациями
  - Анализ продуктивности по времени суток
  - Определение лучшего времени для тренировок
  - Инсайты с иконками и категориями (positive/warning/info)
- Компонент `TimeOfDayAnalysis`:
  - Визуализация продуктивности по времени суток
  - Сравнение утро/день/вечер/ночь
  - Прогресс бары с анимацией
  - Определение пиковой производительности
- Компонент `GoalsProgress`:
  - Дневные и недельные цели
  - Прогресс бары с анимацией
  - Уведомления о достижении целей
  - Мотивационные сообщения

#### i18n улучшения
- Добавлено 3 новых языка:
  - **Немецкий (de)** — полный перевод всех ключей
  - **Французский (fr)** — полный перевод всех ключей
  - **Испанский (es)** — полный перевод всех ключей
- Обновлён `LanguageSwitcher` с новыми флагами
- Поддержка RTL для иврита
- 7 языков всего: ru, en, zh, he, de, fr, es

#### PWA и мобильные улучшения
- Обновлён `manifest.webmanifest`:
  - Добавлены категории (education, productivity, games)
  - Скриншоты для desktop и mobile
  - Иконки всех размеров (72x72 — 512x512)
  - App shortcuts (Практика, Спринт, Статистика)
  - Share target API
  - Handle links preference
- Новый сервис-воркер `sw-enhanced.js`:
  - Стратегия Cache First для статики
  - Стратегия Network First для API
  - Stale While Revalidate для динамики
  - Очистка кэша по лимитам
  - Background sync для офлайн действий
  - Push notifications
  - Обработка уведомлений с действиями
  - Communication через message API
- Offline страница (`offline.html`):
  - Красивый UI с анимациями
  - Подсказки для домашней позиции
  - Список работающих функций офлайн
  - Авто-перезагрузка при появлении сети
  - PWA установка

#### Звуковые улучшения
- Новая звуковая тема **ASMR**:
  - Мягкие приятные звуки
  - Увеличенная реверберация (0.4)
  - Минимальная вариация питча (0.01)
  - Длительный release (0.4)
- Улучшенный хук `useTypingSoundEnhanced`:
  - Поддержка 6 звуковых тем
  - Реверберация с импульсными ответами
  - Динамический компрессор
  - ADSR огибающая (attack, decay, sustain, release)
  - Гармоники для богатого звучания
  - Частоты для каждой клавиши (пентатоника)
  - Метод `playMilestone` для достижений
  - Автоматическая очистка осцилляторов
- Обновлён тип `SoundTheme` с 'asmr'

#### Новые скины клавиатуры
- Добавлен скин **Galaxy**
- Обновлён тип `KeyboardSkin` с 9 вариантами

### 🔧 Оптимизация

#### Размер бандла
- Уменьшен chunkSizeWarningLimit: 400KB → 350KB
- Удалены legal comments в production
- Оптимизирован manual chunks для лучшего разделения
- Tree-shaking с `propertyReadSideEffects: false`

#### Кэширование
- Добавлено кэширование для:
  - Google Fonts (365 дней)
  - Gstatic Fonts (365 дней)
  - Изображений (30 дней, 50 шт)
  - API запросов
- Очистка старых кэшей при активации SW
- Лимиты на размер кэша

#### Рендеринг
- Мемоизация callback функций
- Deep memo для сложных объектов
- Throttle/debounce для частых операций
- Оптимизированный рендеринг списков

### 📦 Изменения в зависимостях

#### Обновлённые типы
- `SoundTheme`: добавлен 'asmr'
- `KeyboardSkin`: добавлен 'galaxy'
- `SupportedLanguage`: добавлен 'de', 'fr', 'es'

#### Новые файлы
- `src/hooks/usePerformanceOptimizer.ts` — оптимизация производительности
- `src/hooks/usePerformanceOptimizer.test.ts` — тесты
- `src/hooks/useTypingSoundEnhanced.ts` — улучшенные звуки
- `src/components/MarathonMode.tsx` — режим марафона
- `src/components/PerformanceInsights.tsx` — аналитика
- `src/components/PerformanceInsights.test.tsx` — тесты аналитики
- `public/sw-enhanced.js` — сервис-воркер
- `public/offline.html` — офлайн страница

### 📝 Документация

- Обновлён CHANGELOG.md с подробным описанием изменений
- Добавлены JSDoc комментарии во все новые файлы
- Авторство и copyright во всех файлах

### 🧪 Тесты

- **Unit тестов**: 850+ (50 файлов)
- **E2E тестов**: 35+ (2 файла)
- **Test Coverage**: 92%+

Новые тесты:
- Тесты для `useDebounce` (5 тестов)
- Тесты для `useThrottle` (3 теста)
- Тесты для `PerformanceInsights` (6 тестов)
- Тесты для `TimeOfDayAnalysis` (3 теста)
- Тесты для `GoalsProgress` (4 теста)

### 📈 Метрики проекта

| Метрика | Значение | Изменение |
|---------|----------|-----------|
| Unit тестов | 850+ | +50 |
| E2E тестов | 35+ | 0 |
| Test Coverage | 92%+ | +1% |
| Время сборки | ~14s | 0 |
| Размер pdf-vendor | 390 KB | 0 |
| Размер Web Worker | 3.15 KB | 0 |
| Размер core чанков | <100 KB | 0 |
| Количество языков | 7 | +3 |
| Количество скинов | 9 | +1 |
| Количество звуковых тем | 6 | +1 |

### 🐛 Исправления

- Исправлена поддержка RTL для иврита
- Улучшена обработка ошибок AudioContext
- Исправлена очистка осцилляторов при размонтировании
- Улучшена обработка офлайн режима

---

### ✨ Новые возможности

#### Автосохранение прогресса
- Добавлен хук `useAutoSave` для автосохранения прогресса
- Сохранение при закрытии вкладки (`beforeunload`)
- Сохранение при потере видимости страницы (`visibilitychange`)
- Восстановление сессии (если < 5 минут)
- Debounce сохранение (1 секунда)
- Обработка ошибок localStorage
- 7 unit тестов

#### Web Workers для статистики
- Добавлен Web Worker для тяжёлых вычислений (`stats.worker.ts`)
- Хук `useStatsWorker` для использования в React компонентах
- Методы:
  - `calculateRhythm` — расчёт равномерности печати
  - `calculateFingerBalance` — баланс левой/правой руки
  - `calculateErrorRecovery` — время исправления ошибок
  - `analyzeTimeOfDay` — анализ по времени суток
  - `analyzeFunnel` — воронка конверсии WPM
  - `calculateCorrelationMatrix` — матрица корреляции метрик
- Интеграция в `StatisticsPage`
- 11 unit тестов

#### IndexedDB для большой истории
- Утилиты `indexedDB.ts` для работы с IndexedDB
- Хуки `useIndexedDB` и `useIndexedDBAll` для React
- 4 хранилища: `sessions`, `settings`, `progress`, `achievements`
- Миграция с LocalStorage (`migrateFromLocalStorage`)
- Документация (`indexedDB.docs.ts`)
- 14 unit тестов

#### E2E тесты критических путей
- Добавлен файл `e2e/critical-paths.spec.ts`
- Тесты для:
  - HardcoreMode (запуск, счётчик серии, завершение при ошибке)
  - Certificate Generator (генерация сертификата, ранг)
  - Export Functionality (CSV, PDF экспорт)
  - AutoSave (сохранение при перезагрузке)
  - Performance (время загрузки, размер бандла)
  - Accessibility (навигация с клавиатуры, ARIA)
- 20+ E2E тестов
- Обновлён `e2e/README.md`

#### Lighthouse CI
- Конфигурация `lighthouserc.js`
- GitHub Actions workflow для Lighthouse
- Аудит категорий: Performance, Accessibility, Best Practices, SEO
- Пороговые значения:
  - Performance ≥ 90%
  - Accessibility ≥ 95%
  - Best Practices ≥ 90%
  - SEO ≥ 90%

### 🔧 Оптимизация

#### PDF оптимизация
- Удалена зависимость `jspdf-autotable` из `certificate.ts`
- Удалена зависимость `jspdf-autotable` из `pdfExport.ts`
- Ручное рисование таблиц для сертификатов
- Ручное рисование таблиц для экспорта статистики
- **pdf-vendor чанк: 421 KB → 390 KB (-7.4%)**

#### Lazy loading
- `ActivityHeatmap` вынесен в отдельный чанк (4 KB)
- `CorrelationMatrix`, `FunnelAnalysis` готовы к lazy loading

### 📦 Изменения в сборке

- Web Worker вынесен в отдельный чанк (`stats.worker-*.js`, 3.15 KB)
- Добавлены скрипты для Lighthouse CI в `package.json`
- Обновлён CI workflow для Lighthouse аудита

### 📝 Документация

- `indexedDB.docs.ts` — документация по IndexedDB
- `stats.worker.docs.ts` — документация по Web Workers
- `e2e/README.md` — обновлено с описанием критических путей
- `CHANGELOG.md` — этот файл

### 🐛 Исправления

- Исправлены предупреждения TypeScript в `FontSizeSelector.tsx`, `LanguageSwitcher.tsx`
- Удалён неиспользуемый код в `App.tsx`
- Обновлён `vitest.config.ts` для исключения IndexedDB тестов

### 🧪 Тесты

- **Unit тестов**: 800+ (47 файлов)
- **E2E тестов**: 35+ (2 файла)
- **Test Coverage**: 91%+

### 📈 Метрики проекта

| Метрика | Значение |
|---------|----------|
| Unit тестов | 800+ |
| E2E тестов | 35+ |
| Test Coverage | 91%+ |
| Время сборки | ~14s |
| Размер pdf-vendor | 390 KB |
| Размер Web Worker | 3.15 KB |
| Размер core чанков | <100 KB |

---

## [0.0.9] — 2026-03-15

### Исправления
- Исправлены ошибки TypeScript
- Обновлены зависимости

---

## [0.0.8] — 2026-03-10

### Новые возможности
- Добавлены скины клавиатуры (8 тем)
- Генератор сертификатов
- Интеграция сертификатов в SprintMode

---

*Формат основан на [Keep a Changelog](https://keepachangelog.com/ru/1.0.0/).
Проект следует [Semantic Versioning](https://semver.org/lang/ru/).*

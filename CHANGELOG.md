# FastFingers — Changelog

Все значимые изменения в проекте FastFingers.

## [0.1.0] — 2026-03-20

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

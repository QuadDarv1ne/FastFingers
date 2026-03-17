# FastFingers — План улучшений

## ✅ Выполнено (Completed)

### Обработка ошибок и устойчивость

- [x] Error Boundary для lazy-компонентов (LazyBoundary.tsx)
- [x] Retry-логика для Supabase (fetchWithRetry в supabase.ts)
- [x] Offline-режим (useOfflineSync hook)
- [x] Fallback UI при недоступности бэкенда (BackendFallbackBanner, WithBackendFallback)
- [x] Обработка edge cases в useTypingGame (пустой текст, null значения)
- [x] Error handling в TypingTrainer и stats utils

### Производительность

- [x] Мемоизация тяжелых вычислений (stats.ts — calculateRhythmScore, calculateFingerBalance, calculateErrorRecoveryTime, analyzeTimeOfDayPerformance, analyzeFunnel)
- [x] Code splitting (vite.config.ts — auth-vendor, utils-vendor)
- [x] Virtual scrolling для длинных списков (TrainingHistory, Leaderboard)
- [x] Lazy loading для графиков Recharts (LazyRecharts.tsx)
- [x] Оптимизация re-renders в TypingTrainer (React.memo, useMemo)
- [x] Bundle size оптимизация (~300KB gzipped → <250KB)

### Доступность (a11y)

- [x] ARIA-атрибуты для 15+ компонентов (TypingTrainer, Keyboard, Stats, Header, SprintMode, NotificationBell, ThemeToggle, KeyboardSkinSelector, ClockWidget, OnlineStatus, MotivationalQuote, LoadingFallback, Skeleton, TrainingHistory)
- [x] Keyboard navigation для меню (ThemeToggle, KeyboardSkinSelector)
- [x] Screen reader announcements (aria-live, aria-atomic)
- [x] Focus management в модальных окнах (useFocusTrap улучшен)
- [x] Контрастность цветов для WCAG AA (index.css улучшен)
- [x] ARIA для CertificateGenerator и AdvancedAnalytics

### Функциональность

- [x] Экспорт статистики в CSV (useExport hook, export.ts, TrainingHistory интеграция)
- [x] Экспорт в PDF (CertificateGenerator с рангами и темами)
- [x] 8 тем оформления клавиатуры (classic, neon, cyberpunk, minimal, ocean, sunset, matrix, monokai)

### UI/UX

- [x] Skeleton loaders (Skeleton.tsx, SkeletonList.tsx, LoadingFallback.tsx)
- [x] Анимация shimmer для skeleton

### i18n

- [x] 4 языка: RU, EN, ZH, HE
- [x] 200+ переводных ключей
- [x] RTL поддержка для иврита
- [x] LanguageSwitcher компонент

### Тестирование

- [x] Unit тесты: 328 тестов проходят (35 test files)
- [x] E2E тесты: 15 тестов (Playwright настроен)
- [x] Тесты для Skeleton (4 теста)
- [x] Тесты для export utils (7 тестов)
- [x] Тесты для hooks (useLocalStorageState, usePagination, useClipboard, useLoading)
- [x] Тесты для компонентов (ErrorBoundary, Keyboard, ThemeToggle, SprintMode)
- [x] Тесты для stats utils, notifications, soundThemes, dailyChallenge

---

## 🔴 Критические (High Priority) — Все выполнено ✅

- [x] Error boundary для обработки падений React компонентов
- [x] Retry-логика для нестабильных API запросов
- [x] Offline fallback для работы без интернета
- [x] Обработка null/undefined в данных
- [x] Типизация TypeScript для всех компонентов

## 🟡 Важные (Medium Priority)

### 4. Функциональность

- [x] Система рангов для HardcoreMode (C-B-A-S-S+-SS-SS+-👑)
- [ ] Сравнение результатов с другими пользователями
- [ ] Персонализированные рекомендации упражнений
- [ ] Адаптивная сложность (auto-adjust на основе точности)
- [ ] Режим "Анти-забывание" (spaced repetition для сложных клавиш)
- [ ] Групповые челленджи с друзьями
- [ ] Достижения с прогресс-барами
- [ ] Дуэли (PvP) — требует backend
- [ ] Еженедельные турниры с таблицей лидеров

### 5. UI/UX

- [x] Тултипы с горячими клавишами (Button.tsx — tooltip/shortcut props)
- [x] Тёмная/светлая тема с авто-переключением (useTheme — system preference)
- [ ] Анимации переходов между режимами
- [ ] Toast-уведомления для всех действий
- [ ] Адаптивная верстка для мобильных (mobile-first)
- [ ] Пользовательские цвета тем (color picker)

### 6. Тестирование

- [x] E2E тесты для критических путей (Playwright настроен, 15 тестов)
- [ ] Integration тесты для hooks
- [ ] Coverage > 80% для utils и hooks
- [ ] Performance тесты (Lighthouse CI)
- [ ] Accessibility тесты (axe-core)

---

## 🟢 Желательные (Low Priority)

### 7. Расширения

- [ ] Пользовательские темы клавиатуры (расширение KeyboardSkinSelector)
- [ ] Кастомные звуковые пакеты (загрузка своих звуков)
- [ ] Интеграция с Discord/GitHub для авторизации
- [ ] WebSocket для live-лидербордов
- [ ] PWA offline push-уведомления
- [ ] Мобильное приложение (Capacitor)

### 8. Аналитика

- [ ] Трекинг пользовательских паттернов
- [ ] Heatmap активности по времени суток
- [ ] Прогноз прогресса (ML-based / линейная регрессия)
- [ ] A/B тестирование UI изменений
- [ ] Session replay для отладки UX проблем
- [ ] Анализ ошибок по времени суток

### 9. Рефакторинг

- [ ] Выделить логику из AppContent в отдельные хуки
- [ ] Унифицировать обработку состояний загрузки
- [ ] Типизировать все API ответы (TypeScript)
- [ ] Вынести константы в отдельные файлы
- [ ] Упростить пропсы компонентов (object pattern)
- [ ] Вынести тексты упражнений в отдельный JSON/DB

---

## 📊 Метрики качества

| Метрика                  | Текущее | Цель   |
| ------------------------ | ------- | ------ |
| Test Coverage            | ~75%    | 85%    |
| E2E Tests                | 15      | 20+    |
| Unit Tests               | 328     | 400+   |
| Lighthouse Performance   | 90+     | 95+    |
| Lighthouse Accessibility | 95+     | 100    |
| Bundle Size (gzipped)    | <250KB  | <200KB |
| First Contentful Paint   | <1s     | <0.8s  |
| Time to Interactive      | <2s     | <1.5s  |
| i18n Languages           | 4       | 6+     |
| TypeScript Errors        | 0       | 0      |
| ESLint Errors            | 0       | 0      |
| Build Time               | ~13s    | <10s   |

---

## 📝 Заметки

### Технические долги

1. **HardcoreMode** — оптимизирован (284 строки вместо 496) ✅
2. **App.tsx** — 735 строк (было 742), вынести логику режимов в хуки
3. **exercises.ts** — вынести тексты в отдельный JSON/DB
4. **exercises.ts** — non-null assertion warnings — исправлено ✅
5. **useTypingSound** — проверить утечки памяти при частых play/stop
6. **TypeScript errors** — 0 ошибок ✅
7. **hardcoreRank.ts** — non-null assertion (намеренно, т.к. последний ранг имеет Infinity)
8. **NotificationContext** — react-refresh warning (намеренно, т.к. экспортируем хук + контекст)

### Текущий статус (2026-03-17)

- **Стабильность**: все системы работают штатно
- **Производительность**: сборка ~13s, bundle <250KB gzipped
- **Качество кода**: 0 TS ошибок, 0 ESLint ошибок (2 warning намеренные)
- **Тесты**: 328 unit + 15 E2E = 343 теста (100% pass)
- **PWA**: 34 entries кэшировано, service worker активен

### Новые наблюдения (2026-03-17)

1. **E2E тесты** — 15 тестов проходят, покрытие критических путей (SprintMode, HardcoreMode, CertificateGenerator, TrainingHistory, Leaderboard)
2. **Code splitting** — настроен для auth/vendor/utils chunks, bundle <250KB gzipped
3. **Lazy loading** — Recharts лениво загружается, улучшило FCP
4. **Error handling** — добавлены Error Boundary, retry-логика для Supabase
5. **i18n** — 4 языка (RU, EN, ZH, HE), легко добавлять новые
6. **ARIA** — большинство компонентов доступны, остались сложные (CertificateGenerator)
7. **Offline режим** — PWA с кэшированием, offline sync hook готов
8. **HardcoreMode** — оптимизирован с 496 до 284 строк
9. **TypeScript** — 0 ошибок, типизация всех компонентов ✅
10. **ESLint** — 0 ошибок (2 warning — намеренные) ✅
11. **Logger** — централизованное логирование через logger.ts (console.warn/error только там)
12. **App.tsx** — 735 строк, lazy loading для 15+ компонентов

### Новые файлы (2026-03-17)

13. **hardcoreRank.ts** — система рангов (8 уровней от C до 👑)
14. **useNotifications** — хук в NotificationContext для безопасного доступа

### Новые улучшения (2026-03-17 — текущий спринт)

15. **Button** — добавлены tooltip и shortcut props для горячих клавиш
16. **HardcoreMode** — система рангов (C, B, A, S, S+, SS, SS+, 👑) с анимацией и confetti
17. **useTheme** — авто-переключение темы по системной настройке (matchMedia)
18. **ThemeToggle** — поддержка режима 'auto' (system preference)
19. **NotificationContext** — добавлен useNotifications хук для безопасного использования
20. **i18n** — добавлены переводы для misc.themeAuto (4 языка)
21. **Сборка** — успешна, ~13s, bundle <250KB gzipped, PWA 34 entries
22. **Тесты** — 328 unit тестов (35 файлов) — 100% pass

### Идеи для экспериментов

- [ ] Web Speech API для голосовых подсказок
- [ ] Web Workers для тяжелых вычислений статистики
- [ ] IndexedDB для кэширования истории
- [ ] Web Animations API для производительных анимаций
- [ ] Haptic feedback через Vibration API
- [ ] AI-генерация персонализированных текстов

### Безопасность

- [ ] CSP заголовки
- [ ] Rate limiting для API запросов
- [ ] XSS защита для пользовательского контента
- [ ] Валидация всех входных данных
- [ ] Secure context только (HTTPS)

---

## 🎯 Следующий спринт (1-2 недели)

### Приоритет 1 — Тестирование

1. E2E тесты: покрытие критических путей расширено (15 тестов) ✅
2. Integration тесты для hooks (useTypingGame, useProgressStore)
3. Coverage >80% для utils и hooks
4. Performance тесты (Lighthouse CI)

### Приоритет 2 — Контент

1. Вынести тексты упражнений в texts.json с категориями
2. Добавить 50+ новых текстов (фильмы, новости, философия, бизнес)
3. Фильтрация текстов по сложности

### Приоритет 3 — Новые режимы

1. Режим «Без ошибок» (Хардкор) — оптимизирован ✅
2. Дуэли (PvP) — выбрать backend решение
3. Еженедельные турниры — таблица лидеров

---

_Последнее обновление: 2026-03-17 (актуально)_
_Выполнено за спринт: 25+ задач (a11y, i18n, Skeleton, CSV export, E2E тесты, code splitting, lazy loading, error handling, HardcoreMode оптимизация, TypeScript 0 ошибок, система рангов, авто-тема, Button shortcuts)_
_Всего тестов: 328 unit + 15 E2E = 343_
_Статус: ✅ ESLint 0 ошибок (2 warning намеренные), ✅ TypeScript 0 ошибок, ✅ 35 test files passed (100%)_
_Стабильность: 40+ хуков, 75+ компонентов, PWA готово, сборка ~13s_

### Выполнено в текущем спринте (2026-03-17)

- ✅ Button: tooltip и shortcut props для горячих клавиш
- ✅ HardcoreMode: система рангов (C-B-A-S-S+-SS-SS+-👑) + анимация rank up + confetti
- ✅ useTheme: авто-переключение по системной теме (matchMedia)
- ✅ ThemeToggle: режим 'auto' (system preference)
- ✅ NotificationContext: useNotifications хук
- ✅ i18n: misc.themeAuto переводы (RU, EN, ZH, HE)
- ✅ hardcoreRank.ts: утилита для расчёта рангов и прогресса
- ✅ PWA: service worker активен, 34 entries в кэше

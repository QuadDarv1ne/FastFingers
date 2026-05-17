# FastFingers — TODO & Improvements

**Author:** Dupley Maxim Igorevich | **Автор:** Дулей Максим Игорович
**Copyright:** 2025-2026 © Dupley Maxim Igorevich
**Last updated:** 2026-05-17 (full code audit) | **Последнее обновление:** 2026-05-17 (полный аудит кода)

---

## 📊 Current Project Status / Текущий статус проекта

| Metric / Метрика | Value / Значение | Status / Статус |
|------------------|-----------------|-----------------|
| Unit tests / Unit-тесты | 916 passed (56 files) | ✅ |
| Test Coverage / Покрытие тестов | ~91% | ✅ |
| Build time / Время сборки | **~8s** (was / было 14.4s) | ✅ **<15s** |
| Bundle size (core) / Размер бандла | ~250KB gzipped | ✅ |
| pdf-vendor | **0 KB** (removed / удален) | ✅ |
| charts-vendor | **0 KB** (removed, replaced with SVG / заменен на SVG) | ✅ |
| TypeScript errors / Ошибки TypeScript | 0 | ✅ |
| ESLint errors / Ошибки ESLint | 0 | ✅ |

---

## 🔴 High Priority / Высокий приоритет

### 1. Bundle Size Optimization (long-term) / Оптимизация размера бандла (долгосрочно)

- [x] **pdf-vendor**: 390 KB → 0 KB (removed jspdf / удален jspdf)
  - ✅ Replaced with Canvas API (certificateOptimized.ts) / Заменен на Canvas API
  - ✅ Removed jspdf dependency from package.json / Удалена зависимость из package.json
  - ✅ All tests pass (916 passed) / Все тесты проходят
  - ✅ Build successful / Сборка успешна
- [x] **charts-vendor**: 532 KB → 0 KB
  - ✅ Replaced with hand-built SVG components (SimpleBarChart, SimpleAreaChart, SimplePieChart)
  - ✅ Removed recharts dependency from package.json / Удалена зависимость recharts
  - ✅ Deleted LazyRecharts.tsx / Удален LazyRecharts.tsx
  - ✅ All tests pass (905 passed) / Все тесты проходят
  - ✅ Build ~8s / Сборка ~8s

---

## 🟡 Medium Priority / Средний приоритет

### 2. Split Monolithic i18n Config into Per-Language Files / Разделить монолитный i18n config на файлы по языкам

- [ ] `src/i18n/config.ts` — 1569 lines, all 10 languages in a single file / 1569 строк, все 10 языков в одном файле
- [ ] IT/PT/JA translations compressed to 1-2 lines each — hard to maintain / IT/PT/JA переводы сжаты до 1-2 строк — сложно поддерживать
- [ ] **Solution / Решение:** Extract each language into `src/i18n/locales/{en,ru,de,fr,es,it,pt,zh,ja,he}.json`
- [ ] Load languages dynamically via `i18next.use(Backend)` / Загружать языки динамически
- [ ] **Benefit / Выгода:** Faster cold start, smaller initial bundle, easier maintenance / быстрее холодный старт, меньше начальный бандл, проще поддержка

### 3. Replace Direct `console` Calls with `logger` Utility / Заменить прямые `console` вызовы на утилиту `logger`

- [x] All raw `console.warn/error` calls replaced with `@utils/logger` utility
- [x] Only `logger.ts` itself and service worker (`sw-enhanced.js`) use console directly
- [x] Service worker console calls are acceptable (runs in separate context) / вызовы допустимы (работает в отдельном контексте)

### 4. Create `.env.example` File / Создать файл `.env.example`

- [x] README references `.env.example` and the file exists / README упоминает `.env.example`, файл существует
- [x] Document required environment variables / Документированы обязательные переменные:
  - `VITE_SUPABASE_URL`
  - `VITE_SUPABASE_ANON_KEY`
  - `VITE_SENTRY_DSN`
  - `VITE_API_URL`
- [x] Fixed outdated migration reference (001_initial_schema.sql → full_migration.sql)

### 5. Remove `as any` in Production Code / Убрать `as any` в продакшн-коде

- [x] All production code: 0 `as any` usages / Все файлы: 0 использований
- [x] ESLint rule `@typescript-eslint/no-explicit-any` set to `error` for production
- [x] ESLint override allows `as any` in test files via `overrides`
- [x] Replaced `any` with `unknown` in `indexedDB.ts:migrateFromLocalStorage`

### 6. Add Vitest Coverage Thresholds / Добавить пороги покрытия в Vitest

- [x] Added thresholds in `vitest.config.ts`: lines 70%, branches 65%, functions 70%, statements 70%

### 7. Standardize Error Handling / Стандартизировать обработку ошибок

- [x] Currently a mix of: `try/catch` + `console.warn`, `try/catch` + `logger`, silently swallowed errors
  / Сейчас смесь: `try/catch` + `console.warn`, `try/catch` + `logger`, проглоченные ошибки
- [x] Establish rule: always use `logger`, never silently swallow errors
  / Установить правило: всегда использовать `logger`, никогда не глотать ошибки молча
- [x] Added `logger.warn` to 67 previously silent catch blocks across 18 files:
  / Добавлен `logger.warn` в 67 ранее молчаливых catch блоков в 18 файлах:
  - src/services/cloudSync.ts (12), src/hooks/useTheme.ts (10), src/utils/number.ts (9),
  - src/hooks/useOfflineSync.ts (4), src/hooks/useLocalStorage.ts (4), src/hooks/useSessionStorage.ts (4),
  - src/utils/format.ts (4), src/hooks/useDailyChallenges.ts (3), src/hooks/useLocalStorageState.ts (3),
  - src/hooks/useMusicGenerator.ts (2), src/hooks/useTypingHistory.ts (2), src/hooks/useSessionTimer.ts (2),
  - src/services/apiClient.ts (2), src/hooks/useClipboard.ts (2),
  - src/hooks/useBackendAvailability.ts (1), src/hooks/useAppState.ts (1),
  - src/utils/adaptiveDifficulty.ts (1), src/utils/validation.ts (1)

### 8. Add Tests for Key Modules / Добавить тесты для ключевых модулей

Coverage gaps / Пробелы в покрытии:

- [ ] `TypingTrainer.tsx` — core engine, no direct tests / основной движок, нет прямых тестов
- [ ] `useHotkeys` — no tests / нет тестов
- [ ] `useTheme` — no tests / нет тестов
- [ ] `AuthContext` — no tests / нет тестов

### 9. Decouple localStorage Auth Fallback from Supabase Service / Отделить localStorage auth fallback от Supabase сервиса

- [ ] `authService.ts` mixes Supabase auth with SHA-256 client-side fallback
  / смешивает Supabase auth с SHA-256 client-side fallback
- [ ] Extract localStorage auth into a separate `LocalAuthProvider`
  / Вынести localStorage auth в отдельный `LocalAuthProvider`
- [ ] Make `authService.ts` a facade delegating to the active provider
  / Сделать `authService.ts` фасадом, делегирующим активному провайдеру

### 10. Consistent Nullable Supabase Client Handling / Консистентная обработка nullable Supabase клиента

- [ ] `supabase` is conditionally created and can be `null` / создаётся условно и может быть `null`
- [ ] Create `useSupabase()` hook with `{ client, isReady }` or a no-op stub
  / Создать `useSupabase()` hook с `{ client, isReady }` или no-op stub
- [ ] Centralize null-handling logic / Централизовать null-handling логику

### 11. Test Fixes / Исправление тестов

- [x] act() warnings in useStatsWorker.test.ts (11 warnings — rhythm score, finger balance, error recovery time, time of day, funnel, correlation matrix, worker not ready, error handling, sequential calculations) — fixed 2026-05-02 / исправлено 2026-05-02

### 12. Supabase Integration (if backend is required) / Supabase интеграция (если требуется backend)

- [x] Code fully ready (auth, leaderboards, duels, tournaments, cloud sync) / Код полностью готов
- [x] Created combined SQL script (full_migration.sql) / Создан объединённый SQL-скрипт
- [x] Written step-by-step guide (SUPABASE_SETUP.md) / Написана пошаговая инструкция
- [x] Project created: jfzqncgwoiorhvyzvrig / Проект создан
- [x] Migration applied (11 tables created) / Миграция применена (11 таблиц создано)
- [x] `.env` configured with keys / `.env` настроен с ключами
- [ ] Enable Realtime for duels, tournaments, tournament_participants / Включить Realtime для duels, tournaments, tournament_participants
- [ ] Test leaderboards / Протестировать leaderboards
- [ ] Test duels (PvP) / Протестировать дуэли (PvP)
- [ ] Test cloud sync / Протестировать cloud sync

### 13. UX Improvements / Улучшение UX

- [x] Mode transition animations (Framer Motion) — mode-specific animations / Анимации переходов между режимами
- [x] Toast notifications for all actions — Sprint, Hardcore, Marathon, Code, SpeedTest, Theme / Toast-уведомления для всех действий
- [x] Mobile landscape mode UX improvements — comprehensive CSS / Улучшение мобильного UX для landscape режима
- [x] Haptic feedback for mobile devices / Haptic feedback для мобильных устройств
- [x] Removed unused useFeedbackToast hook / Удалён unused useFeedbackToast hook

### 14. Content / Контент

- [x] Add 50+ new texts (total 170+) — movies, business, science / Добавить 50+ новых текстов (итого 170+) — фильмы, бизнес, наука
  - [x] 20 movie/series quotes (movie-21 — movie-40) / 20 цитат из фильмов/сериалов
  - [x] 15 business/professional texts (biz-21 — biz-35) / 15 бизнес/профессиональных текстов
  - [x] 15 popular science texts (sci-21 — sci-35) / 15 научно-популярных текстов
- [x] User-created texts (CRUD) via admin panel / Пользовательские тексты (CRUD) через панель администратора
- [ ] Exercise import/export / Импорт/экспорт упражнений

### 15. Accessibility (a11y) / Доступность (a11y)

- [x] Axe-core testing — axe-playwright E2E tests / Axe-core тестирование
- [x] Improved contrast — already improved in previous iterations / Улучшить контрастность
- [x] Full screen reader support — aria-expanded, aria-pressed, role=switch, aria-checked / Полная поддержка screen reader
- [x] Global :focus-visible styles for keyboard navigation / Global :focus-visible стили для клавиатурной навигации
- [x] Expanded prefers-reduced-motion — all animations and transitions disabled / все анимации и переходы отключены

---

## 🟢 Low Priority / Низкий приоритет

### 16. New Game Modes / Новые режимы

- [ ] Tournaments (weekly) — TournamentMode has a stub, needs backend integration
  / Турниры (еженедельные) — TournamentMode имеет stub, нужна backend интеграция
- [ ] Group challenges with friends / Групповые челленджи с друзьями
- [ ] "Learning" mode (step-by-step guide) / Режим "Обучение" (пошаговое руководство)
- [x] "Marathon" mode (5 minutes) — already exists / Режим "Марафон" (5 минут) — уже есть ✅

### 17. Duel Mode — WebSocket/Realtime Implementation / Duel Mode — WebSocket/Realtime реализация

- [ ] `DuelMode.tsx` has placeholder opponent search logic
  / имеет placeholder логику поиска соперника
- [ ] Integrate Supabase Realtime or WebSockets for live duels
  / Интегрировать Supabase Realtime или WebSockets для live дуэлей
- [ ] Add state machine for duel phases (searching → playing → results)
  / Добавить state machine для фаз дуэли (searching → playing → results)

### 18. Analytics / Аналитика

- [ ] User pattern tracking (optional) / Трекинг пользовательских паттернов (опционально)
- [ ] A/B testing for UI changes / A/B тестирование UI изменений
- [ ] Progress prediction (linear regression) / Прогноз прогресса (линейная регрессия)

### 19. Experiments / Эксперименты

- [ ] Web Speech API for voice prompts / Web Speech API для голосовых подсказок
- [x] Haptic feedback via Vibration API — implemented ✅ / реализовано
- [ ] AI-generated personalized texts (long-term) / AI-генерация персонализированных текстов (долгосрочно)

### 20. Add ESLint `no-restricted-syntax` Rule / Добавить ESLint `no-restricted-syntax` правило

- [x] Ban `any` in production code via ESLint (`@typescript-eslint/no-explicit-any`: `error`)
- [x] Allow in tests via `overrides`

### 21. Remove Dead Documentation Files / Удалить dead documentation файлы

- [x] `src/workers/stats.worker.docs.ts` — removed (contained commented-out examples)
- [x] `src/utils/indexedDB.docs.ts` — removed (same)

### 22. Per-Route Error Boundaries / Per-Route Error Boundaries

- [x] Currently one global `ErrorBoundary` / Сейчас один глобальный `ErrorBoundary`
- [x] Add per-route boundaries so a crash in Stats doesn't take down Practice
  / Добавить per-route boundaries чтобы краш в Stats не ронял Practice

### 23. E2E Test for Offline Mode / E2E тест для offline режима

- [ ] Test localStorage fallback / Проверить localStorage fallback
- [ ] Test IndexedDB persistence / Проверить IndexedDB persistence
- [ ] Test cloud sync reconnection / Проверить cloud sync reconnection

### 24. Visual Regression Tests / Визуальные regression тесты

- [ ] Playwright screenshot tests for key pages: practice, stats, settings
  / Playwright screenshot тесты для ключевых страниц: practice, stats, settings

---

## 📝 Technical Debt / Технические долги

1. **App.tsx** — 735 lines, extract mode logic into separate hooks
   / 735 строк, вынести логику режимов в отдельные хуки
   (✅ in progress — created useModeNavigation, GameModeRenderer / в процессе — создан useModeNavigation, GameModeRenderer)
2. **useTypingSound** — check for memory leaks on frequent play/stop
   / проверить утечки памяти при частых play/stop
3. **HardcoreMode** — optimized (284 lines), but can be improved further
   / оптимизирован (284 строки), но можно ещё улучшить
4. **NotificationContext** — react-refresh warning (intentional / намеренно)
5. **PWA** — add background sync for offline actions
   / добавить background sync для офлайн действий
6. **Logging consistency** — all production code uses `logger` utility; only SW uses console directly
   / весь продакшн-код использует `logger`; только SW использует console напрямую
7. **`as any` in production code** — indexedDB.ts, contrast.ts (stats.worker.ts cleaned up)
   / `as any` в продакшн-коде
8. **Nullable Supabase client** — null checks scattered across codebase, need unified approach
   / null-чеки размазаны по коду, нужен единый подход

---

## ✅ Completed (Recent) / Выполнено (Последнее)

### 2026-05-17 — Admin Panel & Error Handling / Панель администратора и обработка ошибок
- ✅ Standardized error handling: added `logger.warn` to 67 catch blocks in 18 files
  / Стандартизирована обработка ошибок: добавлен `logger.warn` в 67 catch блоков в 18 файлах
- ✅ Added `role` field to User type ('user' | 'admin')
  / Добавлено поле `role` в тип User
- ✅ First registered user automatically becomes admin / Первый зарегистрированный пользователь автоматически становится админом
- ✅ Admin panel (/Admin) with 3 tabs: Overview, Text Manager, User Manager
  / Панель администратора с 3 вкладками: Обзор, Тексты, Пользователи
- ✅ Text Manager: CRUD for custom practice texts (localStorage-backed)
  / Менеджер текстов: CRUD для пользовательских текстов (на localStorage)
- ✅ User Manager: view users, promote/demote admin
  / Менеджер пользователей: просмотр, назначение/снятие админа
- ✅ Admin nav button visible only to admin users / Кнопка Admin видна только админам

### 2026-05-11 — Code Quality & Developer Experience / Качество кода и DX
- ✅ ESLint `@typescript-eslint/no-explicit-any` upgraded from `warn` to `error`
- ✅ Added ESLint `overrides` to allow `as any` in test files
- ✅ Removed 5 unused `eslint-disable` directives from test files
- ✅ Added Vitest coverage thresholds (lines 70%, branches 65%, functions 70%, statements 70%)
- ✅ Fixed `.env.example` outdated migration reference
- ✅ Replaced `any` with `unknown` in `indexedDB.ts:migrateFromLocalStorage`
- ✅ 0 ESLint errors, 26 pre-existing warnings / 0 ошибок ESLint

### 2026-05-11 — Supabase Migration Applied / Supabase миграция применена
- ✅ Project created: jfzqncgwoiorhvyzvrig / Проект создан
- ✅ Migration executed (11 tables: users, typing_sessions, leaderboards, duels, tournaments, etc.)
  / Миграция выполнена (11 таблиц)
- ✅ .env configured with real keys / .env настроен с реальными ключами
- ⏳ Remaining: enable Realtime for duels, tournaments, tournament_participants
  / Осталось: включить Realtime для duels, tournaments, tournament_participants

### 2026-05-11 — UX Improvements / Улучшение UX
- ✅ Mode-specific framer-motion animations (StatsMotion, GameMotion, HardcoreMotion)
  / Mode-specific framer-motion анимации
- ✅ Toast notifications on session completion (Sprint, Hardcore, Marathon, Code)
  / Toast-уведомления при завершении сессий
- ✅ Improved mobile landscape CSS (headings, padding, gaps, toast positioning)
  / Улучшен mobile landscape CSS
- ✅ Removed unused useFeedbackToast hook / Удалён unused useFeedbackToast hook

### 2026-05-11 — Supabase Documentation / Документация Supabase
- ✅ Created full_migration.sql (combined script of all 4 migrations)
  / Создан full_migration.sql (объединённый скрипт всех 4 миграций)
- ✅ Updated SUPABASE_SETUP.md with combined migration instructions
  / Обновлён SUPABASE_SETUP.md
- ✅ Updated .env with clear comments and guide link
  / Обновлён .env с понятными комментариями

### 2026-05-11 — Charts Optimization (recharts removed) / Оптимизация charts-vendor (recharts удален)
- ✅ Created hand-built SVG components: SimpleBarChart, SimpleAreaChart, SimplePieChart
- ✅ Replaced all 4 charts in StatisticsPage with lightweight SVG components
  / Заменены все 4 графика в StatisticsPage на лёгкие SVG компоненты
- ✅ Deleted LazyRecharts.tsx / Удален LazyRecharts.tsx
- ✅ Removed recharts dependency from package.json (532 KB → 0 KB)
  / Удалена зависимость recharts из package.json
- ✅ Removed dead chunking rules for recharts and jspdf in vite.config.ts
  / Убраны dead chunking правила
- ✅ Build accelerated: ~12s → **~8s** (-33%) / Сборка ускорена
- ✅ All 905 tests pass / Все 905 тестов проходят
- ✅ TypeScript 0 errors, ESLint 0 errors / TypeScript 0 ошибок, ESLint 0 ошибок

### 2026-05-11 — Refactoring: Removed Unused Components & Fixed Memory Leaks
/ Рефакторинг: удаление unused компонентов и исправление memory leaks
- ✅ Removed unused components: CorrelationMatrix, FunnelAnalysis, PredictionCurve, SpiderChart, TypingSpeedChart (-1119 lines)
  / Удалены unused компоненты
- ✅ Moved lazy components from App.tsx to GameModeRenderer with Suspense fallback
  / Перенесены lazy-компоненты из App.tsx в GameModeRenderer
- ✅ Removed unused exports from LazyRecharts (LineChart, Line, Legend, Radar, etc.)
  / Удалены unused экспорты из LazyRecharts
- ✅ Added toast notifications on theme change and SpeedTest completion
  / Добавлены toast-уведомления при смене темы и завершении SpeedTest
- ✅ Fixed memory leaks in useTypingSound (isMountedRef, cleanup timeouts)
  / Исправлены memory leaks в useTypingSound
- ✅ Added cleanup in useMusicGenerator on unmount
  / Добавлен cleanup в useMusicGenerator при unmount
- ✅ Fixed eslint-disable warnings in GameModeRenderer
  / Исправлены eslint-disable warnings в GameModeRenderer
- ✅ All 905 tests pass / Все 905 тестов проходят
- ✅ TypeScript 0 errors, ESLint 0 errors in changed files
  / TypeScript 0 ошибок, ESLint 0 ошибок в изменённых файлах

### 2026-05-11 — Bug Fixes & i18n Improvements / Исправление ошибок и улучшение i18n
- ✅ Fixed deprecated poolOptions in vitest.config.ts for Vitest 4 compatibility
  / Исправлен deprecated poolOptions в vitest.config.ts
- ✅ Removed unused lastOnline state from useOnlineStatus hook
  / Удален неиспользуемый lastOnline state из useOnlineStatus hook
- ✅ Replaced hardcoded Russian text in Toast.tsx aria-label with i18n translation
  / Заменен хардкод русского текста в Toast.tsx aria-label на i18n перевод
- ✅ Updated Toast tests to use translated text
  / Обновлены тесты Toast для использования переведенного текста
- ✅ All 905 tests pass / Все 905 тестов проходят
- ✅ Branches synchronized / Ветки синхронизированы

### 2026-05-06 — Bundle Size Optimization (jspdf removed) / Оптимизация bundle size (jspdf удален)
- ✅ Created certificateOptimized.ts using Canvas API / Создан certificateOptimized.ts с использованием Canvas API
- ✅ Removed jspdf dependency (@420KB) from package.json
  / Удалена зависимость jspdf из package.json
- ✅ Deleted certificate.ts and pdfExport.ts / Удалены certificate.ts и pdfExport.ts
- ✅ pdf-vendor chunk removed (390 KB saved) / pdf-vendor чанк удален (экономия 390 KB)
- ✅ All tests pass (916 passed) / Все тесты проходят (916 passed)
- ✅ Build ~12s / Сборка ~12s

### 2026-05-06 — App.tsx Refactoring (Phase 1) / Рефакторинг App.tsx (этап 1)
- ✅ Created useModeNavigation hook for mode navigation management
  / Создан хук useModeNavigation для управления навигацией по режимам
- ✅ Created GameModeRenderer component for rendering game modes
  / Создан компонент GameModeRenderer для рендеринга игровых режимов
- ✅ Added tests for useModeNavigation / Добавлены тесты для useModeNavigation
- ✅ All 909 tests pass / Все 909 тестов проходят
- ✅ Build ~8.9s / Сборка ~8.9s

### 2026-05-06 — TypeScript Fixes & Test Improvements / Исправление TypeScript и улучшение тестов
- ✅ Added DuelsData interface for typing duel data
  / Добавлен интерфейс DuelsData для типизации данных дуэлей
- ✅ Fixed error counting logic in HardcoreMode (only current error counts)
  / Исправлена логика подсчета ошибок в HardcoreMode
- ✅ Updated pdfExport: fixed getNumberOfPages() call for jspdf 4.x compatibility
  / Обновлен pdfExport: исправлен вызов getNumberOfPages() для совместимости с jspdf 4.x
- ✅ Updated dependencies: framer-motion 12.38.0, vite 6.4.2, @types/react 18.3.28
  / Обновлены зависимости
- ✅ Added @types/jspdf, @types/react-query for better typing
  / Добавлены типы для лучшей типизации
- ✅ Fixed useHardcoreMode.test.ts: added fake timers, fixed FormEvent types
  / Исправлены тесты useHardcoreMode.test.ts
- ✅ All 906 tests pass without errors / Все 906 тестов проходят без ошибок
- ✅ Build ~9.75s / Сборка ~9.75s

### 2026-05-05 — Added Haptic Feedback for Virtual Keyboard
/ Добавлена тактильная обратная связь (haptic feedback) для виртуальной клавиатуры
- ✅ Created useHapticFeedback hook for Vibration API access
  / Создан хук useHapticFeedback для доступа к Vibration API
- ✅ Integrated haptic feedback into Keyboard component for key presses
  / Интегрирована тактильная обратная связь в компонент Keyboard для нажатий клавиш
- ✅ All tests pass without regressions / Все тесты проходят без регрессий
- ✅ Build successful, chunk sizes remain within targets
  / Сборка успешна, размеры чанков остаются в пределах целей

### 2026-05-04 — Fixed Funnel Data Type & Chunking Optimization
/ Исправление типа funnel data и оптимизация chunking
- ✅ Fixed type error in StatisticsPage.tsx: setFunnelData expects array of stages, not object with stages and conversionRates
  / Исправлена ошибка типа в StatisticsPage.tsx
- ✅ Changed recharts chunking strategy: all modules now in a single charts-vendor chunk to reduce chunk count
  / Изменена стратегия chunking для recharts
- ✅ Production build: 10.57s (close to <10s target, further optimization possible)
  / Production сборка: 10.57s
- ✅ All 900 tests pass without errors / Все 900 тестов проходят без ошибок

### 2026-05-02 — Bundle Size Optimization Research / Исследование оптимизации bundle size
- ✅ Analyzed recharts structure for improved chunking
  / Проанализирована структура recharts для улучшения chunking
- ✅ Tested granular recharts chunking, but it caused circular dependencies
  / Тестировался granular chunking recharts, но привел к круговым зависимостям
- ✅ Reverted to original two-chunk split (charts-vendor/charts-core)
  / Возвращен к исходному двухчанковому делению
- ✅ Investigated jspdf: current version 4.2.1 is already the latest, significant reduction unlikely without custom build
  / Исследован jspdf: текущая версия 4.2.1 уже последняя
- ✅ All 900 tests pass without warnings / Все 900 тестов проходят без warnings

### 2026-05-02 — Test Fixes / Исправление тестов
- ✅ Fixed act() warnings in useStatsWorker.test.ts / Исправлены act() warnings в useStatsWorker.test.ts
- ✅ All 900 tests pass without warnings / Все 900 тестов проходят без warnings

### 2026-04-30 — Build Optimization / Оптимизация сборки
- ✅ Removed Brotli compression plugin from production build
  / Удалён Brotli compression plugin из production сборки
- ✅ Build accelerated: 14.4s → **9.5s** (-34%) / Сборка ускорена: 14.4s → **9.5s** (-34%)
- ✅ <10s target achieved / Цель <10s достигнута

### 2026-04-30 — Test Fixes / Исправление тестов
- ✅ Fixed act() warnings in useStatsWorker.test.ts / Исправлены act() warnings в useStatsWorker.test.ts
- ✅ All 900 tests pass without warnings / Все 900 тестов проходят без warnings
- ✅ Build optimized: 14.4s → 13.3s / Сборка оптимизирована: 14.4s → 13.3s

### 2026-03-25 — Stability Day / День стабильности
- ✅ 900 tests pass (100% pass rate) / 900 тестов проходят
- ✅ Coverage >90% (91%) / Покрытие >90% (91%)
- ✅ TypeScript 0 errors / TypeScript 0 ошибок
- ✅ ESLint 0 errors / ESLint 0 ошибок
- ✅ i18n: 10 languages (ru, en, zh, he, de, fr, es, it, pt, ja) / 10 языков
- ✅ Mobile-first adaptation (Apple HIG compliance) / Mobile-first адаптация
- ✅ 9 game modes (Practice, Sprint, Hardcore, SpeedTest, Reaction, Marathon, Code, Duel, Tournament) / 9 режимов игры
- ✅ Supabase integration ready (migrations 001-004) / Supabase интеграция готова
- ✅ Cross-platform build (Capacitor + Tauri) / Кроссплатформенная сборка
- ✅ Build time optimized (~14s) / Build time оптимизирована
- ✅ Test duration optimized (~10s, -60% from ~21s) / Test duration оптимизирована
- ✅ pdf-vendor: 390 KB (-25 KB from 415 KB)
- ✅ charts-vendor: 434 KB (-98 KB from 532 KB)

### 2026-03-21 — Stability Sprint / Спринт стабильности
- ✅ PerformanceInsights component (418 lines) / PerformanceInsights компонент (418 строк)
- ✅ usePerformanceOptimizer hooks (286 lines) / usePerformanceOptimizer хуки (286 строк)
- ✅ Web Workers for statistics / Web Workers для статистики
- ✅ IndexedDB for large history / IndexedDB для большой истории
- ✅ E2E tests for critical paths (20+ tests) / E2E тесты критических путей (20+ тестов)
- ✅ Lighthouse CI configured / Lighthouse CI настроен
- ✅ Adaptive difficulty (algorithm + integration) / Адаптивная сложность
- ✅ ComboCounter, FeedbackToast, AriaAnnouncer, SkipLink

---

## 🎯 Next Sprint Priorities / Следующий спринт (приоритеты)

1. **Split i18n config** — Break 1569-line config.ts into per-language JSON files
   / Разбить 1569-строчный config.ts на per-language JSON файлы
2. **Replace console with logger** — 19 files, quick win for consistency
   / 19 файлов, быстрый win для консистентности
3. **Create .env.example** — simple task, blocks new developers
   / простая задача, блокирует новых разработчиков
4. **Supabase Realtime** — Enable for duels, tournaments, tournament_participants
   / Включить для duels, tournaments, tournament_participants
5. **Vitest coverage thresholds** — Add minimum coverage gates
   / Добавить минимальные пороги
6. **E2E tests** — Critical path coverage + offline mode
   / Покрытие критических путей + offline mode

---

## 📌 Notes / Заметки

### Critical Paths (Covered by E2E) / Критические пути (покрыты E2E)
- ✅ HardcoreMode (start, streak counter, completion on error)
  / HardcoreMode (запуск, счётчик серии, завершение при ошибке)
- ✅ Certificate Generator (generation, ranks)
  / Certificate Generator (генерация, ранги)
- ✅ Export (CSV, PNG) / Export (CSV, PNG)
- ✅ AutoSave (save on reload) / AutoSave (сохранение при перезагрузке)
- ✅ Performance (load time, bundle size) / Performance (время загрузки, размер бандла)
- ✅ Accessibility (keyboard navigation, ARIA)
  / Accessibility (навигация с клавиатуры, ARIA)

### Architectural Decisions / Архитектурные решения
- **State Management**: React Query + Zustand
- **i18n**: i18next + react-i18next
- **Styling**: Tailwind CSS + Framer Motion
- **Testing**: Vitest + Playwright
- **CI/CD**: GitHub Actions + Cloudflare Pages
- **Monitoring**: Sentry (integrated / интегрирован)

### Known Limitations / Известные ограничения
- ~~pdf-vendor chunk large due to jspdf dependencies~~ ✅ Removed / Удален
- ~~charts-vendor chunk large due to Recharts + D3~~ ✅ Replaced with hand-built SVG / Заменен на hand-built SVG
- Some tests require `act()` wrapper (React warnings)
  / Некоторые тесты требуют `act()` обёртки (React warnings)

### Project Metrics (2026-05-11) / Метрики проекта

- **Tests / Тесты**: 905 passed, 8 skipped (56 files / файлов)
- **Coverage / Покрытие**: ~91%
- **Build / Сборка**: ~8s (was / было 14.4s, optimization -44%)
- **Bundle / Бандл**: animations-vendor 125KB gzipped, settings 85KB, game-modes 67KB
- **Removed dependencies / Удалено зависимостей**: jspdf (390KB), recharts (532KB) = 922KB saved / экономии
- **i18n**: 10 languages / языков (ru, en, zh, he, de, fr, es, it, pt, ja)
- **Game Modes / Режимы**: 9 (Practice, Sprint, Hardcore, SpeedTest, Reaction, Marathon, Code, Duel, Tournament)
- **Texts / Тексты**: 170+ in 15 categories / в 15 категориях
- **E2E**: 20+ critical path tests + accessibility / 20+ тестов критических путей + accessibility

### Dependencies (key) / Зависимости (ключевые)
- React 18.3, TypeScript 5.3, Vite 6.4
- Framer Motion 12.38, Tailwind 3.4
- i18next 25.8, Zustand 5.0
- Supabase JS 2.98, TanStack Query 5.90
- Vitest 4.0, Playwright 1.58
- axe-playwright (added 2026-05-11 / добавлен 2026-05-11)

### Chunk Structure (production) / Структура чанков (production)

| Chunk / Чанк | Size / Размер | Gzip |
|---|---|---|
| animations-vendor | 125 KB | 41 KB |
| settings | 85 KB | 27 KB |
| typing-core | 67 KB | 21 KB |
| game-modes | 67 KB | 18 KB |
| auth-components | 34 KB | 7 KB |
| main | 33 KB | 11 KB |
| stats-pages | 35 KB | 9 KB |
| i18n-vendor | 43 KB | 13 KB |

---

*Last updated: 2026-05-17 | Последнее обновление: 2026-05-17*

---

## 📋 Community Review / Ревью сообщества (2026-05-17)

Сводка предложений по улучшению проекта на основе внешнего аудита:

### 🔴 High Priority / Высокий приоритет

1. **Dependency Upgrades / Обновление зависимостей**
   - [ ] **React 18 → React 19** — улучшенный SSR, concurrent features, new hook APIs
   - [ ] **Framer Motion 12 → latest** — новые возможности анимаций, багфиксы
   - [ ] **TypeScript 5.3 → 5.7+** — improved type inference, better ESM support
   - [ ] **Tailwind CSS 3.4 → 4.0** — performance improvements, CSS-first config
   - [ ] **Benefit / Выгода:** актуальная экосистема, безопасность, производительность
   - **Note:** Requires regression testing; some deps may have breaking changes
     / Требует регрессионного тестирования; возможны breaking changes

### 🟡 Medium Priority / Средний приоритет

2. **Dependabot / Renovate Auto-Updates** — настроить автоматические PR на обновление зависимостей
    - [x] GitHub Dependabot config (`.github/dependabot.yml`)
    - [ ] Или Renovate bot для более гибкого контроля
   - **Benefit / Выгода:** зависимости не устаревают, безопасность

3. **Monorepo with Turborepo / Nx** — если планируется рост кодовой базы
   - [ ] Разделить frontend, backend (supabase functions), docs
   - [ ] Кэширование сборок, параллельные задачи
   - **Low priority** / Низкий приоритет

### 🟢 Already Tracked / Уже в TODO

Следующие пункты уже присутствуют в TODO выше — помечены для отслеживания:

| # | Предложение | Статус в TODO |
|---|------------|---------------|
| 1 | Разделить i18n config (1569 → per-language files) | 🟡 Medium #2 |
| 2 | Null-safe Supabase client (`useSupabase()` hook) | 🟡 Medium #10 |
| 3 | Per-route Error Boundaries | 🟢 Low #22 |
| 4 | Тесты: TypingTrainer, useHotkeys, useTheme, AuthContext | 🟡 Medium #8 |
| 5 | Стандартизация обработки ошибок (logger) | 🟡 Medium #7 |
| 6 | Decouple localStorage auth → LocalAuthProvider | 🟡 Medium #9 |
| 7 | App.tsx → дальше дробить (сейчас 735 строк) | 📝 Tech Debt #1 |
| 8 | Live-дуэли через Supabase Realtime | 🟢 Low #17 |
| 9 | PWA background sync | 📝 Tech Debt #5 |
| 10 | Визуальные regression тесты (Playwright screenshots) | 🟢 Low #24 |
| 11 | Пользовательские тексты (CRUD, импорт/экспорт) | 🟡 Medium #14 (частично) |

---

*Review conducted: 2026-05-17 | Ревью проведено: 2026-05-17*

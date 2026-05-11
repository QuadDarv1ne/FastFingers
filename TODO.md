# FastFingers — Todo & Improvements

**Автор:** Dupley Maxim Igorevich  
**Copyright:** 2025-2026 © Dupley Maxim Igorevich  
**Последнее обновление:** 2026-05-11 13:00

---

## 📊 Текущий статус проекта

| Метрика | Значение | Статус |
|---------|----------|--------|
| Unit тесты | 916 passed (56 файлов) | ✅ |
| Test Coverage | ~91% | ✅ |
| Сборка | **~12s** | ✅ **<15s** |
| Bundle size (core) | ~250KB gzipped | ✅ |
| pdf-vendor | **0 KB** (удален) | ✅ |
| charts-vendor | **0 KB** (удален, заменен на SVG) | ✅ |
| TypeScript ошибки | 0 | ✅ |
| ESLint ошибки | 0 | ✅ |

---

## 🔴 Высокий приоритет

### 1. Оптимизация bundle size (долгосрочно)
- [x] **pdf-vendor**: 390 KB → 0 KB (удален jspdf)
  - ✅ Заменен на Canvas API (certificateOptimized.ts)
  - ✅ Удалена зависимость jspdf из package.json
  - ✅ Все тесты проходят (916 passed)
  - ✅ Сборка успешна
- [x] **charts-vendor**: 532 KB → 0 KB
  - ✅ Заменен на hand-built SVG компоненты (SimpleBarChart, SimpleAreaChart, SimplePieChart)
  - ✅ Удалена зависимость recharts из package.json
  - ✅ Удален LazyRecharts.tsx
  - ✅ Все тесты проходят (905 passed)
  - ✅ Сборка ~8s

---

## 🟡 Средний приоритет

### 2. Исправление тестов
- [x] act() warnings в useStatsWorker.test.ts (11 warnings — rhythm score, finger balance, error recovery time, time of day, funnel, correlation matrix, worker not ready, error handling, sequential calculations) — исправлено 2026-05-02

### 3. Supabase интеграция (если требуется backend)
- [x] Код полностью готов (auth, leaderboards, duels, tournaments, cloud sync)
- [x] Создан объединённый SQL-скрипт (full_migration.sql)
- [x] Написана пошаговая инструкция (SUPABASE_SETUP.md)
- [ ] Создать проект на https://app.supabase.com
- [ ] Применить миграцию (full_migration.sql)
- [ ] Настроить `.env` с ключами
- [ ] Протестировать leaderboards
- [ ] Протестировать дуэли (PvP)
- [ ] Протестировать cloud sync

### 4. Улучшение UX
- [ ] Анимации переходов между режимами (Framer Motion)
- [ ] Toast-уведомления для всех действий
- [ ] Улучшение мобильного UX для landscape режима
- [x] Haptic feedback для мобильных устройств

### 5. Контент
- [ ] Добавить 50+ новых текстов (итого 110+)
  - Фильмы/сериалы (цитаты)
  - Бизнес/профессиональные тексты
  - Научная популяризация
- [ ] Пользовательские тексты (CRUD)
- [ ] Импорт/экспорт упражнений

### 6. Доступность (a11y)
- [ ] Axe-core тестирование
- [ ] Улучшить контрастность для некоторых элементов
- [ ] Полная поддержка screen reader для всех режимов

---

## 🟢 Низкий приоритет

### 7. Новые режимы
- [ ] Турниры (еженедельные)
- [ ] Групповые челленджи с друзьями
- [ ] Режим "Обучение" (пошаговое руководство)
- [x] Режим "Марафон" (5 минут) — уже есть ✅

### 8. Аналитика
- [ ] Трекинг пользовательских паттернов (опционально)
- [ ] A/B тестирование UI изменений
- [ ] Прогноз прогресса (линейная регрессия)

### 9. Эксперименты
- [ ] Web Speech API для голосовых подсказок
- [ ] Haptic feedback через Vibration API
- [ ] AI-генерация персонализированных текстов (долгосрочно)

---

## 📝 Технические долги

1. **App.tsx** — 735 строк, вынести логику режимов в отдельные хуки (✅ в процессе — создан useModeNavigation, GameModeRenderer)
2. **useTypingSound** — проверить утечки памяти при частых play/stop
3. **HardcoreMode** — оптимизирован (284 строки), но можно ещё улучшить
4. **NotificationContext** — react-refresh warning (намеренно)
5. **PWA** — добавить background sync для офлайн действий

---

## ✅ Выполнено (Recent)

### 2026-05-11 — Документация Supabase
- ✅ Создан full_migration.sql (объединённый скрипт всех 4 миграций)
- ✅ Обновлён SUPABASE_SETUP.md с инструкциями по combined migration
- ✅ Обновлён .env с понятными комментариями и ссылкой на гайд

### 2026-05-11 — Оптимизация charts-vendor (recharts удален)
- ✅ Созданы hand-built SVG компоненты: SimpleBarChart, SimpleAreaChart, SimplePieChart
- ✅ Заменены все 4 графика в StatisticsPage на лёгкие SVG компоненты
- ✅ Удален LazyRecharts.tsx
- ✅ Удалена зависимость recharts из package.json (532 KB → 0 KB)
- ✅ Убраны dead chunking правила для recharts и jspdf в vite.config.ts
- ✅ Сборка ускорена: ~12s → **~8s** (-33%)
- ✅ Все 905 тестов проходят
- ✅ TypeScript 0 ошибок, ESLint 0 ошибок

### 2026-05-11 — Рефакторинг: удаление unused компонентов и исправление memory leaks
- ✅ Удалены unused компоненты: CorrelationMatrix, FunnelAnalysis, PredictionCurve, SpiderChart, TypingSpeedChart (-1119 строк)
- ✅ Перенесены lazy-компоненты из App.tsx в GameModeRenderer с Suspense fallback
- ✅ Удалены unused экспорты из LazyRecharts (LineChart, Line, Legend, Radar и др.)
- ✅ Добавлены toast-уведомления при смене темы и завершении SpeedTest
- ✅ Исправлены memory leaks в useTypingSound (isMountedRef, cleanup timeouts)
- ✅ Добавлен cleanup в useMusicGenerator при unmount
- ✅ Исправлены eslint-disable warnings в GameModeRenderer
- ✅ Все 905 тестов проходят
- ✅ TypeScript 0 ошибок, ESLint 0 ошибок в изменённых файлах

### 2026-05-11 — Исправление ошибок и улучшение i18n
- ✅ Исправлен deprecated poolOptions в vitest.config.ts для совместимости с Vitest 4
- ✅ Удален неиспользуемый lastOnline state из useOnlineStatus hook
- ✅ Заменен хардкод русского текста в Toast.tsx aria-label на i18n перевод
- ✅ Обновлены тесты Toast для использования переведенного текста
- ✅ Все 905 тестов проходят
- ✅ Ветки синхронизированы

### 2026-05-06 — Оптимизация bundle size (jspdf удален)
- ✅ Создан certificateOptimized.ts с использованием Canvas API
- ✅ Удалена зависимость jspdf (@420KB) из package.json
- ✅ Удалены certificate.ts и pdfExport.ts
- ✅ pdf-vendor чанк удален (экономия 390 KB)
- ✅ Все тесты проходят (916 passed)
- ✅ Сборка ~12s

### 2026-05-06 — Рефакторинг App.tsx (этап 1)
- ✅ Создан хук useModeNavigation для управления навигацией по режимам
- ✅ Создан компонент GameModeRenderer для рендеринга игровых режимов
- ✅ Добавлены тесты для useModeNavigation
- ✅ Все 909 тестов проходят
- ✅ Сборка ~8.9s

### 2026-05-06 — Исправление TypeScript и улучшение тестов
- ✅ Добавлен интерфейс DuelsData для типизации данных дуэлей
- ✅ Исправлена логика подсчета ошибок в HardcoreMode (только текущая ошибка считается)
- ✅ Обновлен pdfExport: исправлен вызов getNumberOfPages() для совместимости с jspdf 4.x
- ✅ Обновлены зависимости: framer-motion 12.38.0, vite 6.4.2, @types/react 18.3.28
- ✅ Добавлены типы @types/jspdf, @types/react-query для лучшей типизации
- ✅ Исправлены тесты useHardcoreMode.test.ts: добавлены фейковые таймеры, исправлены типы FormEvent
- ✅ Все 906 тестов проходят без ошибок
- ✅ Сборка ~9.75s

### 2026-05-05 — Добавлена тактильная обратная связь (haptic feedback) для виртуальной клавиатуры
- ✅ Создан хук useHapticFeedback для доступа к Vibration API
- ✅ Интегрирована тактильная обратная связь в компонент Keyboard для нажатий клавиш
- ✅ Все тесты проходят без регрессий
- ✅ Сборка успешна, размеры чанков остаются в пределах целей

### 2026-05-04 — Исправление типа funnel data и оптимизация chunking
- ✅ Исправлена ошибка типа в StatisticsPage.tsx: setFunnelData ожидает массив стадий, а не объект с stages и conversionRates
- ✅ Изменена стратегия chunking для recharts: все модули теперь в единый charts-vendor чанк для уменьшения количества чанков
- ✅ Production сборка: 10.57s (близко к цели <10s, дальнейшая оптимизация возможна)
- ✅ Все 900 тестов проходят без ошибок

### 2026-05-02 — Исследование оптимизации bundle size
- ✅ Проанализирована структура recharts для улучшения chunking
- ✅ Тестировался granular chunking recharts, но привел к круговым зависимостям
- ✅ Возвращен к исходному двухчанковому делению (charts-vendor/charts-core)
- ✅ Исследован jspdf: текущая версия 4.2.1 уже последняя, значительное уменьшение маловероятно без кастомной сборки
- ✅ Все 900 тестов проходят без warnings

### 2026-05-02 — Исправление тестов
- ✅ Исправлены act() warnings в useStatsWorker.test.ts
- ✅ Все 900 тестов проходят без warnings

### 2026-04-30 — Оптимизация сборки
- ✅ Удалён Brotli compression plugin из production сборки
- ✅ Сборка ускорена: 14.4s → **9.5s** (-34%)
- ✅ Цель <10s достигнута

### 2026-04-30 — Исправление тестов
- ✅ Исправлены act() warnings в useStatsWorker.test.ts
- ✅ Все 900 тестов проходят без warnings
- ✅ Сборка оптимизирована: 14.4s → 13.3s

### 2026-03-25 — День стабильности
- ✅ 900 тестов проходят (100% pass rate)
- ✅ Coverage >90% (91%)
- ✅ TypeScript 0 ошибок
- ✅ ESLint 0 ошибок
- ✅ i18n: 10 языков (ru, en, zh, he, de, fr, es, it, pt, ja)
- ✅ Mobile-first адаптация (Apple HIG compliance)
- ✅ 9 режимов игры (Practice, Sprint, Hardcore, SpeedTest, Reaction, Marathon, Code, Duel, Tournament)
- ✅ Supabase интеграция готова (миграции 001-004)
- ✅ Кроссплатформенная сборка (Capacitor + Tauri)
- ✅ Build time оптимизирована (~14s)
- ✅ Test duration оптимизирована (~10s, -60% от ~21s)
- ✅ pdf-vendor: 390 KB (-25 KB от 415 KB)
- ✅ charts-vendor: 434 KB (-98 KB от 532 KB)

### 2026-03-21 — Спринт стабильности
- ✅ PerformanceInsights компонент (418 строк)
- ✅ usePerformanceOptimizer хуки (286 строк)
- ✅ Web Workers для статистики
- ✅ IndexedDB для большой истории
- ✅ E2E тесты критических путей (20+ тестов)
- ✅ Lighthouse CI настроен
- ✅ Адаптивная сложность (алгоритм + интеграция)
- ✅ ComboCounter, FeedbackToast, AriaAnnouncer, SkipLink

---

## 🎯 Следующий спринт (приоритеты)

1. **Supabase интеграция** — создать проект, применить миграции, протестировать
2. **E2E тесты** — покрытие критических путей
3. **Новые тексты** — 50+ упражнений
4. **Accessibility** — a11y улучшения

---

## 📌 Заметки

### Критические пути (покрыты E2E)
- ✅ HardcoreMode (запуск, счётчик серии, завершение при ошибке)
- ✅ Certificate Generator (генерация, ранги)
- ✅ Export (CSV, PNG)
- ✅ AutoSave (сохранение при перезагрузке)
- ✅ Performance (время загрузки, размер бандла)
- ✅ Accessibility (навигация с клавиатуры, ARIA)

### Архитектурные решения
- **State Management**: React Query + Zustand
- **i18n**: i18next + react-i18next
- **Styling**: Tailwind CSS + Framer Motion
- **Testing**: Vitest + Playwright
- **CI/CD**: GitHub Actions + Netlify
- **Monitoring**: Sentry (интегрирован)

### Известные ограничения
- ~~pdf-vendor чанк большой из-за jspdf зависимостей~~ ✅ Удален
- ~~charts-vendor чанк большой из-за Recharts + D3~~ ✅ Заменен на hand-built SVG
- Некоторые тесты требуют `act()` обёртки (React warnings)

---

*Последнее обновление: 2026-05-11 12:50*

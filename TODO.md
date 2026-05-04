# FastFingers — Todo & Improvements
**Автор:** Dupley Maxim Igorevich
**Copyright:** 2025-2026 © Dupley Maxim Igorevich

**Последнее обновление:** 2026-05-02 13:45

---

## 📊 Текущий статус проекта

| Метрика | Значение | Статус |
|---------|----------|--------|
| Unit тесты | 900 passed (54 файла) | ✅ |
| Test Coverage | ~91% | ✅ |
| Сборка | **~8.6s** | ✅ **<10s** |
| Bundle size (core) | ~250KB gzipped | ✅ |
| pdf-vendor | 390 KB (128 KB gzipped) | ⚠️ |
| charts-core | 529 KB (146 KB gzipped) | ⚠️ |
| TypeScript ошибки | 0 | ✅ |
| ESLint ошибки | 0 | ✅ |

---

## 🔴 Высокий приоритет

### 1. Оптимизация bundle size (долгосрочно)
- [ ] **pdf-vendor**: 390 KB → <300 KB
  - Текущий: 389.82 KB (128.45 KB gzipped)
  - Исследовать: замена jspdf на более лёгкую библиотеку
  - Исследовать: оптимизация chunking для лучшего tree-shaking
- [ ] **charts-core**: 529 KB → <400 KB
  - Текущий: 528.90 KB (145.79 KB gzipped)
  - Исследовать: замена Recharts на более лёгкую альтернативу
  - Исследовать: lazy loading для отдельных графиков
  - Исследовать: улучшение manualChunks для более granular splitting

### 2. Ускорение сборки
- ✅ Сборка ~8.6s → <10s (цель достигнута стабильно)

---

## 🟡 Средний приоритет

### 3. Исправление тестов
- [x] act() warnings в useStatsWorker.test.ts (11 warnings — rhythm score, finger balance, error recovery time, time of day, funnel, correlation matrix, worker not ready, error handling, sequential calculations) — исправлено 2026-05-02

### 4. Supabase интеграция (если требуется backend)
- [ ] Создать проект на Supabase
- [ ] Применить миграции (001-004)
- [ ] Настроить `.env` с ключами
- [ ] Протестировать leaderboards
- [ ] Протестировать дуэли (PvP)
- [ ] Протестировать cloud sync

### 5. Улучшение UX
- [ ] Анимации переходов между режимами (Framer Motion)
- [ ] Toast-уведомления для всех действий
- [ ] Улучшение мобильного UX для landscape режима
- [ ] Haptic feedback для мобильных устройств

### 6. Контент
- [ ] Добавить 50+ новых текстов (итого 110+)
  - Фильмы/сериалы (цитаты)
  - Бизнес/профессиональные тексты
  - Научная популяризация
- [ ] Пользовательские тексты (CRUD)
- [ ] Импорт/экспорт упражнений

### 7. Доступность (a11y)
- [ ] Axe-core тестирование
- [ ] Улучшить контрастность для некоторых элементов
- [ ] Полная поддержка screen reader для всех режимов

---

## 🟢 Низкий приоритет

### 8. Новые режимы
- [ ] Турниры (еженедельные)
- [ ] Групповые челленджи с друзьями
- [ ] Режим "Обучение" (пошаговое руководство)
- [ ] Режим "Марафон" (5 минут) — уже есть ✅

### 9. Аналитика
- [ ] Трекинг пользовательских паттернов (опционально)
- [ ] A/B тестирование UI изменений
- [ ] Прогноз прогресса (линейная регрессия)

### 10. Эксперименты
- [ ] Web Speech API для голосовых подсказок
- [ ] Haptic feedback через Vibration API
- [ ] AI-генерация персонализированных текстов (долгосрочно)

---

## 📝 Технические долги

1. **App.tsx** — 735 строк, вынести логику режимов в отдельные хуки
2. **useTypingSound** — проверить утечки памяти при частых play/stop
3. **HardcoreMode** — оптимизирован (284 строки), но можно ещё улучшить
4. **NotificationContext** — react-refresh warning (намеренно)
5. **PWA** — добавить background sync для офлайн действий

---

## ✅ Выполнено (Recent)

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

1. **Оптимизация bundle size** — pdf-vendor <300 KB, charts-core <400 KB
2. **Исправление warnings в тестах** — act() warnings
3. **Supabase deployment** — если требуется backend функционал

---

## 📌 Заметки

### Критические пути (покрыты E2E)
- ✅ HardcoreMode (запуск, счётчик серии, завершение при ошибке)
- ✅ Certificate Generator (генерация, ранги)
- ✅ Export (CSV, PDF)
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
- pdf-vendor чанк большой из-за jspdf зависимостей
- charts-core чанк большой из-за Recharts + D3
- Некоторые тесты требуют `act()` обёртки (React warnings)

---

## ⏰ Напоминания по workflow (от 2026-05-04)
- Качество важнее количества: сосредоточься на значимых улучшениях
- Работай в ветке dev, затем проверяй и мерджи в main
- Всегда синхронизируй изменения с remote (git push)
- Используй короткие commit сообщения без пробелов в -m

_Последнее обновление: 2026-05-04 10:00_
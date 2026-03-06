# FastFingers — План улучшений

## 🔴 Критические (High Priority)

### 1. Обработка ошибок и устойчивость
- [ ] Добавить Error Boundary для всех ленивых компонентов
- [ ] Retry-логика для failed запросов к Supabase
- [ ] Fallback UI при недоступности бэкенда
- [ ] Offline-режим с синхронизацией при подключении
- [ ] Обработка edge cases в useTypingGame (пустой текст, null значения)

### 2. Производительность
- [ ] Code splitting для тяжелых компонентов (StatisticsPage, AdvancedAnalytics)
- [ ] Virtual scrolling для длинных списков (TrainingHistory, Leaderboard)
- [ ] Мемоизация тяжелых вычислений (calculateRhythmScore, calculateFingerBalance)
- [ ] Lazy loading для графиков Recharts
- [ ] Оптимизация re-renders в TypingTrainer (React.memo, useMemo)

### 3. Доступность (a11y)
- [ ] ARIA-атрибуты для всех интерактивных элементов
- [ ] Keyboard navigation для всех модальных окон
- [ ] Screen reader announcements для ошибок и успехов
- [ ] Focus management в модальных окнах
- [ ] Контрастность цветов для WCAG AA

---

## 🟡 Важные (Medium Priority)

### 4. Функциональность
- [ ] Экспорт статистики в CSV/Excel
- [ ] Сравнение результатов с другими пользователями
- [ ] Персонализированные рекомендации упражнений
- [ ] Адаптивная сложность (auto-adjust на основе точности)
- [ ] Режим "Анти-забывание" (spaced repetition для сложных клавиш)
- [ ] Групповые челленджи с друзьями
- [ ] Достижения с прогресс-барами

### 5. UI/UX
- [ ] Анимации переходов между режимами
- [ ] Skeleton loaders вместо спиннеров
- [ ] Toast-уведомления для всех действий
- [ ] Тултипы с горячими клавишами
- [ ] Адаптивная верстка для мобильных (mobile-first)
- [ ] Тёмная/светлая тема с авто-переключением

### 6. Тестирование
- [ ] E2E тесты для критических путей (Playwright)
- [ ] Integration тесты для hooks
- [ ] Coverage > 80% для utils и hooks
- [ ] Performance тесты (Lighthouse CI)
- [ ] Accessibility тесты (axe-core)

---

## 🟢 Желательные (Low Priority)

### 7. Расширения
- [ ] Мультиязычность (i18n для всех UI текстов)
- [ ] Пользовательские темы клавиатуры
- [ ] Кастомные звуковые пакеты (загрузка своих звуков)
- [ ] Интеграция с Discord/GitHub для авторизации
- [ ] WebSocket для live-лидербордов
- [ ] PWA offline push-уведомления

### 8. Аналитика
- [ ] Трекинг пользовательских паттернов
- [ ] Heatmap активности по времени суток
- [ ] Прогноз прогресса (ML-based)
- [ ] A/B тестирование UI изменений
- [ ] Session replay для отладки UX проблем

### 9. Рефакторинг
- [ ] Выделить логику из AppContent в отдельные хуки
- [ ] Унифицировать обработку состояний загрузки
- [ ] Типизировать все API ответы (TypeScript)
- [ ] Вынести константы в отдельные файлы
- [ ] Упростить пропсы компонентов (object pattern)

---

## 📊 Метрики качества

| Метрика | Текущее | Цель |
|---------|---------|------|
| Test Coverage | ~70% | 85% |
| Lighthouse Performance | 90 | 95+ |
| Lighthouse Accessibility | 85 | 100 |
| Bundle Size (gzipped) | ~300KB | <250KB |
| First Contentful Paint | <1.5s | <1s |
| Time to Interactive | <3s | <2s |

---

## 📝 Заметки

### Технические долги
1. **useTypingSound** — проверить утечки памяти при частых play/stop
2. **HardcoreMode** — большая компонента, нужно разбить
3. **App.tsx** — 700+ строк, вынести логику режимов в хуки
4. **exercises.ts** — вынести тексты в отдельный JSON/DB

### Идеи для экспериментов
- [ ] Web Speech API для голосовых подсказок
- [ ] Web Workers для тяжелых вычислений статистики
- [ ] IndexedDB для кэширования истории
- [ ] Web Animations API для производительных анимаций
- [ ] Haptic feedback через Vibration API

### Безопасность
- [ ] CSP заголовки
- [ ] Rate limiting для API запросов
- [ ] XSS защита для пользовательского контента
- [ ] Валидация всех входных данных
- [ ] Secure context только (HTTPS)

---

## 🎯 Следующий спринт (1-2 недели)

1. Исправить все 🔴 критические проблемы
2. Добавить virtual scrolling для TrainingHistory
3. Покрыть тестами useTypingGame hooks (>90%)
4. Оптимизировать bundle size (tree-shaking)
5. Добавить skeleton loaders

---

*Последнее обновление: 2026-03-06*

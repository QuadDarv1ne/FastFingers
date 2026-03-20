# Руководство для разработчиков FastFingers

**Автор:** Dupley Maxim Igorevich  
**Copyright:** 2025-2026 © Dupley Maxim Igorevich

## 🚀 Быстрый старт

### Установка зависимостей

```bash
npm install
```

### Запуск в режиме разработки

```bash
npm run dev
```

### Сборка для production

```bash
npm run build
```

## 📁 Структура проекта

```
FastFingers/
├── src/
│   ├── components/      # React компоненты
│   │   ├── auth/        # Компоненты аутентификации
│   │   └── ...
│   ├── contexts/        # React контексты
│   ├── hooks/           # Кастомные хуки
│   ├── i18n/            # Интернационализация
│   ├── services/        # API сервисы
│   ├── tests/           # Unit тесты
│   ├── types/           # TypeScript типы
│   ├── utils/           # Утилиты
│   ├── App.tsx          # Корневой компонент
│   └── main.tsx         # Точка входа
├── e2e/                 # E2E тесты (Playwright)
├── docs/                # Документация
├── .github/workflows/   # GitHub Actions
└── public/              # Статические файлы
```

## 🧪 Тестирование

### Unit тесты

```bash
npm run test          # Запуск в watch режиме
npm run test:run      # Однократный запуск
npm run test:coverage # Отчёт о покрытии
npm run test:ui       # Vitest UI
```

### E2E тесты

```bash
npm run e2e           # Запуск всех тестов
npm run e2e:headed    # Запуск с браузером
npm run e2e:ui        # Playwright UI
npm run e2e:report    # Показать отчёт
```

### Покрытие тестами

```
src/tests/
├── stats.test.ts           # 19 тестов
├── exercises.test.ts       # 12 тестов
├── storage.test.ts         # 13 тестов
├── notifications.test.ts   # 7 тестов
├── streakBonus.test.ts     # 9 тестов
├── ThemeToggle.test.tsx    # 7 тестов
└── ErrorBoundary.test.tsx  # 6 тестов
```

**Всего: 73 теста**

## 🎨 Code Style

### Линтинг

```bash
npm run lint       # Проверка
npm run lint:fix   # Авто-исправление
```

### Форматирование

```bash
npx prettier --write src/
```

### Pre-commit хуки

Husky автоматически запускает lint-staged при коммите:

- ESLint для .ts, .tsx файлов
- Prettier для .css, .json, .md файлов

## 📦 Импорт алиасы

```typescript
import { Component } from '@components/Component'
import { useHook } from '@hooks/useHook'
import { util } from '@utils/util'
import { Type } from '@types/types'
import { Context } from '@contexts/Context'
```

## 🔧 Конфигурация

### Переменные окружения

Создайте `.env` файл:

```env
# Sentry (отслеживание ошибок)
VITE_SENTRY_DSN=https://your-dsn@sentry.io/project-id

# API (будущая интеграция)
# VITE_API_URL=https://api.fastfingers.local
```

### Vite плагины

- `@vitejs/plugin-react` - React поддержка
- `vite-plugin-pwa` - PWA функциональность
- `rollup-plugin-visualizer` - Анализ бандла

## 🚀 Деплой

### Автоматический (GitHub Actions)

При push в `main`:

1. Запускаются тесты и линтер
2. Создаётся production сборка
3. Деплой на Netlify

### Ручной

```bash
npm run build
# Загрузите папку dist на хостинг
```

## 🐛 Отладка

### React DevTools

Установите расширение для браузера

### React Query DevTools

Открываются автоматически в режиме разработки (кнопка внизу справа)

### Sentry

Ошибки отправляются в Sentry если установлен `VITE_SENTRY_DSN`

## 📊 Мониторинг

### Bundle анализ

```bash
npm run build
# Откройте dist/stats.html в браузере
```

### Performance метрики

- Lighthouse в Chrome DevTools
- Web Vitals через Sentry

## 🧩 Добавление новых компонентов

### 1. Создайте компонент

```typescript
// src/components/NewComponent.tsx
interface Props {
  title: string
}

export function NewComponent({ title }: Props) {
  return <div>{title}</div>
}
```

### 2. Добавьте тест

```typescript
// src/tests/NewComponent.test.tsx
import { render, screen } from '@testing-library/react'
import { NewComponent } from '../components/NewComponent'

describe('NewComponent', () => {
  it('должен рендериться', () => {
    render(<NewComponent title="Test" />)
    expect(screen.getByText('Test')).toBeInTheDocument()
  })
})
```

### 3. Экспортируйте

```typescript
// src/components/index.ts
export * from './NewComponent'
```

## 🔐 Безопасность

- Не коммитьте `.env` файлы
- Используйте переменные окружения для секретов
- Валидируйте все пользовательские данные

## 📚 Ресурсы

- [React документация](https://react.dev)
- [TypeScript handbook](https://www.typescriptlang.org/docs/)
- [Vite guide](https://vitejs.dev/guide/)
- [Testing Library](https://testing-library.com)
- [Playwright](https://playwright.dev)

## 🤝 Вклад в проект

1. Создайте ветку `feature/your-feature`
2. Внесите изменения
3. Убедитесь что все тесты проходят
4. Создайте Pull Request

## ❓ FAQ

**Q: Как добавить новую зависимость?**

```bash
npm install package-name
```

**Q: Как обновить зависимости?**

```bash
npm update
```

**Q: Где смотреть покрытие тестов?**

```bash
npm run test:coverage
# Откройте coverage/index.html
```

**Q: Как запустить production локально?**

```bash
npm run build
npm run preview
```

---

**FastFingers** © 2026

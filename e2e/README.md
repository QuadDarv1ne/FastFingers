# E2E Тесты FastFingers

E2E (End-to-End) тесты для FastFingers используют [Playwright](https://playwright.dev/).

## Быстрый старт

### Установка браузеров

```bash
npx playwright install
```

### Запуск тестов

```bash
# Запуск всех тестов
npm run e2e

# Запуск в режиме headless (без GUI)
npm run e2e

# Запуск с открытым браузером (для отладки)
npm run e2e:headed

# Запуск с UI для отладки
npm run e2e:ui

# Показать отчёт
npm run e2e:report
```

## Структура тестов

```
e2e/
├── app.spec.ts              # Основные тесты приложения
├── critical-paths.spec.ts   # Тесты критических путей (HardcoreMode, экспорт, сертификаты)
├── auth.spec.ts             # Тесты аутентификации (будет)
├── typing.spec.ts           # Тесты режима печати (будет)
└── fixtures/
    └── test-data.ts         # Тестовые данные (будет)
```

## Написание тестов

```typescript
import { test, expect } from '@playwright/test'

test.describe('Набор тестов', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
  })

  test('должен делать что-то', async ({ page }) => {
    // Пример теста
    await expect(page.getByText('Привет')).toBeVisible()
  })
})
```

## Покрытие тестами

### critical-paths.spec.ts

Тесты для критических путей пользователя:

- **HardcoreMode**: запуск режима, счётчик серии, завершение при ошибке, таблица рекордов
- **Certificate Generator**: генерация сертификата после спринта, отображение ранга
- **Export Functionality**: экспорт в CSV, экспорт в PDF
- **AutoSave**: сохранение прогресса при перезагрузке, восстановление сессии
- **Performance**: время загрузки < 3с, размер бандла < 500KB
- **Accessibility**: навигация с клавиатуры, ARIA метки, role атрибуты

### app.spec.ts

Базовые тесты приложения:

- Загрузка и рендеринг
- Переключение режимов
- Настройки и темы
- История тренировок
- Таблица лидеров
- Переключение языка

## Доступные браузеры

- Chromium (Desktop Chrome)
- Firefox (Desktop Firefox)
- WebKit (Desktop Safari)
- Mobile Chrome (Pixel 5)
- Mobile Safari (iPhone 12)

## CI/CD

В GitHub Actions тесты запускаются автоматически при push и pull request.

## Отчётность

После запуска тестов отчёт сохраняется в `playwright-report/`.

Для просмотра отчёта:

```bash
npm run e2e:report
```

## Отладка

Для отладки тестов используйте:

```bash
# Режим с открытым браузером
npm run e2e:headed

# UI режим с пошаговой отладкой
npm run e2e:ui

# Запуск конкретного теста
npx playwright test e2e/critical-paths.spec.ts --headed

# Запуск с логировкой
npx playwright test e2e/critical-paths.spec.ts --debug
```

## Советы

1. Используйте `await page.waitForLoadState('networkidle')` для ожидания загрузки
2. Добавляйте `timeout` для медленных элементов
3. Используйте `catch(() => false)` для опциональных проверок
4. Проверяйте тесты в нескольких браузерах

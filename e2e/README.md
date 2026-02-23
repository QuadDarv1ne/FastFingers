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
├── app.spec.ts           # Основные тесты приложения
├── auth.spec.ts          # Тесты аутентификации (будет)
├── typing.spec.ts        # Тесты режима печати (будет)
└── fixtures/
    └── test-data.ts      # Тестовые данные (будет)
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

## Доступные браузеры

- Chromium (Desktop Chrome)
- Firefox (Desktop Firefox)
- WebKit (Desktop Safari)
- Mobile Chrome (Pixel 5)
- Mobile Safari (iPhone 12)

## CI/CD

В GitHub Actions тесты запускаются автоматически при push и pull request.

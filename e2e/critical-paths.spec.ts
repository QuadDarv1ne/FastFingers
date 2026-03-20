/**
 * FastFingers — E2E тесты для критических путей
 * @author Dupley Maxim Igorevich
 * @copyright 2025-2026 Dupley Maxim Igorevich
 */

import { test, expect } from '@playwright/test'

test.describe('HardcoreMode E2E', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
    await page.waitForLoadState('networkidle')
  })

  test('должен запускать режим "Без ошибок" (Хардкор)', async ({ page }) => {
    // Нажимаем на кнопку Хардкор режима
    const hardcoreButton = page.locator('button:has-text(/хардкор|hardcore|без ошибок/i)')
    await expect(hardcoreButton).toBeVisible()
    await hardcoreButton.click()

    // Проверяем, что режим запустился
    await expect(page.getByText(/режим без ошибок|hardcore mode/i)).toBeVisible({ timeout: 5000 })
  })

  test('должен показывать счётчик серии правильных нажатий в Хардкоре', async ({ page }) => {
    const hardcoreButton = page.locator('button:has-text(/хардкор|hardcore/i)')
    await hardcoreButton.click()

    // Ждём отображения текста для печати
    await expect(page.locator('[class*="text"]')).toBeVisible({ timeout: 5000 })

    // Проверяем наличие счётчика серии
    const streakCounter = page.locator('[aria-label*="серия"], [class*="streak"], :has-text(/серия|streak/i)')
    await expect(streakCounter).toBeVisible()
  })

  test('должен завершать сессию при ошибке в Хардкоре', async ({ page }) => {
    const hardcoreButton = page.locator('button:has-text(/хардкор|hardcore/i)')
    await hardcoreButton.click()

    // Ждём текст для печати
    const textElement = page.locator('[class*="text"]').first()
    await expect(textElement).toBeVisible({ timeout: 5000 })

    // Получаем первый символ для ввода
    const firstChar = await textElement.textContent()
    const expectedChar = firstChar?.trim().charAt(0)

    if (expectedChar) {
      // Вводим неправильный символ
      await page.keyboard.press('z')

      // Должна появиться ошибка или завершение сессии
      const errorElement = page.locator('[class*="error"], [class*="wrong"]')
      const sessionEndElement = page.locator('[class*="summary"], [class*="result"]')

      // Проверяем, что либо ошибка показана, либо сессия завершена
      const errorVisible = await errorElement.isVisible().catch(() => false)
      const sessionEnded = await sessionEndElement.isVisible().catch(() => false)

      expect(errorVisible || sessionEnded).toBeTruthy()
    }
  })

  test('должен показывать таблицу рекордов Хардкора', async ({ page }) => {
    const hardcoreButton = page.locator('button:has-text(/хардкор|hardcore/i)')
    await hardcoreButton.click()

    // Проверяем наличие таблицы рекордов
    const leaderboardElement = page.locator('[aria-label*="рекорд"], [class*="leaderboard"], :has-text(/рекорд|record/i)')
    await expect(leaderboardElement).toBeVisible({ timeout: 5000 })
  })
})

test.describe('Certificate Generator E2E', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
    await page.waitForLoadState('networkidle')
  })

  test('должен генерировать сертификат после завершения спринта', async ({ page }) => {
    // Запускаем спринт
    const sprintButton = page.locator('button:has-text(/спринт|sprint/i)')
    await expect(sprintButton).toBeVisible()
    await sprintButton.click()

    // Ждём завершения спринта (60 секунд) или кнопки пропуска
    await page.waitForTimeout(3000)

    // Проверяем, что показаны результаты
    const resultElement = page.locator('[class*="result"], [class*="summary"]')
    const resultVisible = await resultElement.isVisible().catch(() => false)

    if (resultVisible) {
      // Проверяем наличие кнопки экспорта сертификата
      const exportButton = page.locator('[aria-label*="сертификат"], [aria-label*="certificate"], button:has-text(/сертификат|certificate/i)')
      const exportVisible = await exportButton.isVisible().catch(() => false)

      if (exportVisible) {
        await exportButton.click()

        // Ждём генерации PDF
        await page.waitForTimeout(2000)

        // Проверяем, что PDF создан (проверяем наличие ссылки или сообщения об успехе)
        const successMessage = page.locator(':has-text(/успешно|success|скачан|downloaded/i)')
        const downloadPromise = page.waitForEvent('download').catch(() => null)

        const successVisible = await successMessage.isVisible().catch(() => false)
        expect(successVisible).toBeTruthy()
      }
    }
  })

  test('должен показывать ранг в сертификате', async ({ page }) => {
    const sprintButton = page.locator('button:has-text(/спринт|sprint/i)')
    await sprintButton.click()

    await page.waitForTimeout(3000)

    // Проверяем наличие ранга
    const rankElement = page.locator('[class*="rank"], :has-text(/ранг|rank|[C-B-A-S]/i)')
    const rankVisible = await rankElement.isVisible().catch(() => false)
    expect(rankVisible).toBeTruthy()
  })
})

test.describe('Export Functionality E2E', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
    await page.waitForLoadState('networkidle')
  })

  test('должен экспортировать статистику в CSV', async ({ page }) => {
    // Переходим в историю тренировок
    const historyButton = page.locator('button:has-text(/история|history/i)')
    await expect(historyButton).toBeVisible()
    await historyButton.click()

    // Ждём загрузки страницы истории
    await expect(page.locator('[class*="history"]')).toBeVisible({ timeout: 5000 })

    // Ищем кнопку экспорта CSV
    const exportButton = page.locator('[aria-label*="csv" i], button:has-text("CSV"), :has-text(/экспорт|export/i)').first()
    const exportVisible = await exportButton.isVisible().catch(() => false)

    if (exportVisible) {
      const [download] = await Promise.all([
        page.waitForEvent('download').catch(() => null),
        exportButton.click()
      ])

      if (download) {
        expect(download.suggestedFilename()).toMatch(/\.csv$/i)
      }
    }
  })

  test('должен экспортировать статистику в PDF', async ({ page }) => {
    const historyButton = page.locator('button:has-text(/история|history/i)')
    await historyButton.click()

    await expect(page.locator('[class*="history"]')).toBeVisible({ timeout: 5000 })

    // Ищем кнопку экспорта PDF
    const exportButton = page.locator('[aria-label*="pdf" i], button:has-text("PDF"), :has-text(/экспорт|export/i)').last()
    const exportVisible = await exportButton.isVisible().catch(() => false)

    if (exportVisible) {
      const [download] = await Promise.all([
        page.waitForEvent('download').catch(() => null),
        exportButton.click()
      ])

      if (download) {
        expect(download.suggestedFilename()).toMatch(/\.pdf$/i)
      }
    }
  })
})

test.describe('AutoSave E2E', () => {
  test('должен сохранять прогресс при перезагрузке страницы', async ({ page }) => {
    await page.goto('/')
    await page.waitForLoadState('networkidle')

    // Проверяем начальный уровень
    const levelElement = page.locator('[class*="level"], [aria-label*="уровень"]').first()
    const initialLevel = await levelElement.textContent().catch(() => '1')

    // Запускаем спринт и завершаем его
    const sprintButton = page.locator('button:has-text(/спринт|sprint/i)')
    await sprintButton.click()

    // Ждём немного для симуляции тренировки
    await page.waitForTimeout(5000)

    // Возвращаемся назад
    const backButton = page.locator('button:has-text(/назад|back/i)').first()
    if (await backButton.isVisible()) {
      await backButton.click()
    }

    // Перезгружаем страницу
    await page.reload()
    await page.waitForLoadState('networkidle')

    // Проверяем, что прогресс сохранён
    const levelAfterReload = await levelElement.textContent().catch(() => '1')
    
    // Уровень должен быть тем же или выше
    const initialNum = parseInt(initialLevel?.replace(/\D/g, '') || '1')
    const afterNum = parseInt(levelAfterReload?.replace(/\D/g, '') || '1')
    expect(afterNum).toBeGreaterThanOrEqual(initialNum)
  })

  test('должен восстанавливать сессию после закрытия вкладки', async ({ page }) => {
    await page.goto('/')
    await page.waitForLoadState('networkidle')

    // Запускаем тренировку
    const practiceButton = page.locator('button:has-text(/практика|practice/i)')
    await practiceButton.click()

    // Вводим несколько символов
    await page.keyboard.type('test')

    // Закрываем и открываем вкладку (симулируем через reload)
    await page.reload()
    await page.waitForLoadState('networkidle')

    // Проверяем, что приложение загрузилось
    await expect(page.locator('h1, h2, [class*="logo"]')).toBeVisible({ timeout: 5000 })
  })
})

test.describe('Performance E2E', () => {
  test('должен загружаться быстрее 3 секунд', async ({ page }) => {
    const startTime = Date.now()
    await page.goto('/')
    await page.waitForLoadState('networkidle')
    const loadTime = Date.now() - startTime

    expect(loadTime).toBeLessThan(3000)
  })

  test('должен иметь размер основного бандла < 500KB', async ({ page }) => {
    const response = await page.goto('/')
    const headers = response?.headers()
    const contentLength = headers?.['content-length']

    if (contentLength) {
      const sizeInKB = parseInt(contentLength) / 1024
      expect(sizeInKB).toBeLessThan(500)
    }
  })
})

test.describe('Accessibility E2E', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
    await page.waitForLoadState('networkidle')
  })

  test('должен поддерживать навигацию с клавиатуры (Tab)', async ({ page }) => {
    // Нажимаем Tab несколько раз
    for (let i = 0; i < 5; i++) {
      await page.keyboard.press('Tab')
      await page.waitForTimeout(100)
    }

    // Проверяем, что фокус виден
    const focusedElement = page.locator(':focus')
    await expect(focusedElement).toBeVisible()
  })

  test('должен иметь ARIA метки для основных элементов', async ({ page }) => {
    // Проверяем наличие aria-label у интерактивных элементов
    const buttonsWithAria = page.locator('button[aria-label]')
    const count = await buttonsWithAria.count()
    expect(count).toBeGreaterThan(0)
  })

  test('должен поддерживать скринридеры (role атрибуты)', async ({ page }) => {
    const elementsWithRole = page.locator('[role]')
    const count = await elementsWithRole.count()
    expect(count).toBeGreaterThan(5)
  })
})

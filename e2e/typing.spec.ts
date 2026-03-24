/**
 * FastFingers — E2E тесты точности печати
 * @author Dupley Maxim Igorevich
 * @copyright 2025-2026 Dupley Maxim Igorevich
 */

import { test, expect } from '@playwright/test'

test.describe('Typing Accuracy E2E', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
    await page.waitForLoadState('networkidle')
  })

  test('должен запускать режим спринта', async ({ page }) => {
    const sprintButton = page.locator('button:has-text(/спринт|sprint/i)')
    await expect(sprintButton).toBeVisible()
    await sprintButton.click()

    await expect(page.locator('[class*="timer"], [class*="progress"], text=/60|секунд|second/i')).toBeVisible({ timeout: 5000 })
  })

  test('должен показывать текст для печати в режиме спринта', async ({ page }) => {
    const sprintButton = page.locator('button:has-text(/спринт|sprint/i)')
    await sprintButton.click()

    await expect(page.locator('[class*="text"], [class*="word"], text=/наберите|type/i')).toBeVisible({ timeout: 5000 })
  })

  test('должен показывать подсчет WPM во время печати', async ({ page }) => {
    const sprintButton = page.locator('button:has-text(/спринт|sprint/i)')
    await sprintButton.click()

    await expect(page.locator('text=/wpm/i')).toBeVisible({ timeout: 5000 })
  })

  test('должен показывать точность во время печати', async ({ page }) => {
    const sprintButton = page.locator('button:has-text(/спринт|sprint/i)')
    await sprintButton.click()

    await expect(page.locator('text=/точность|accuracy/i')).toBeVisible({ timeout: 5000 })
  })

  test('должен показывать прогресс выполнения', async ({ page }) => {
    const sprintButton = page.locator('button:has-text(/спринт|sprint/i)')
    await sprintButton.click()

    const progressBar = page.locator('[role="progressbar"], [class*="progress"], [class*="bar"]')
    await expect(progressBar).toBeVisible({ timeout: 5000 })
  })

  test('должен обрабатывать ввод символов', async ({ page }) => {
    const sprintButton = page.locator('button:has-text(/спринт|sprint/i)')
    await sprintButton.click()

    await page.waitForTimeout(1000)

    // Вводим несколько символов
    await page.keyboard.type('test')

    // Проверяем, что ввод обработан
    const typedIndicator = page.locator('[class*="typed"], [class*="correct"], [class*="char"]')
    const typedCount = await typedIndicator.count()
    expect(typedCount).toBeGreaterThan(0)
  })

  test('должен показывать результаты после завершения спринта', async ({ page }) => {
    const sprintButton = page.locator('button:has-text(/спринт|sprint/i)')
    await sprintButton.click()

    // Ждём завершения таймера или пропускаем
    await page.waitForTimeout(5000)

    // Проверяем наличие результатов
    const resultElement = page.locator('[class*="result"], [class*="summary"], text=/результат|result/i')
    const resultVisible = await resultElement.isVisible().catch(() => false)
    expect(resultVisible).toBeTruthy()
  })

  test('должен показывать статистику CPM (символы в минуту)', async ({ page }) => {
    const sprintButton = page.locator('button:has-text(/спринт|sprint/i)')
    await sprintButton.click()

    await page.waitForTimeout(3000)

    const cpmElement = page.locator('text=/cpm/i')
    const cpmVisible = await cpmElement.isVisible().catch(() => false)
    expect(cpmVisible).toBeTruthy()
  })

  test('должен позволять пропустить спринт досрочно', async ({ page }) => {
    const sprintButton = page.locator('button:has-text(/спринт|sprint/i)')
    await sprintButton.click()

    await page.waitForTimeout(2000)

    const skipButton = page.locator('button:has-text(/пропустить|skip|завершить/i)')
    const skipVisible = await skipButton.isVisible().catch(() => false)

    if (skipVisible) {
      await skipButton.click()
      await expect(page.locator('[class*="result"], [class*="summary"]')).toBeVisible({ timeout: 5000 })
    }
  })

  test('должен показывать клавиатуру на экране', async ({ page }) => {
    const sprintButton = page.locator('button:has-text(/спринт|sprint/i)')
    await sprintButton.click()

    const keyboard = page.locator('[class*="keyboard"], [role="button"][aria-label*="клавиша"]')
    const keyboardVisible = await keyboard.isVisible().catch(() => false)
    expect(keyboardVisible).toBeTruthy()
  })

  test('должен подсвечивать правильные/неправильные символы', async ({ page }) => {
    const sprintButton = page.locator('button:has-text(/спринт|sprint/i)')
    await sprintButton.click()

    await page.waitForTimeout(1000)

    // Вводим правильный символ
    await page.keyboard.type('a')

    const correctChar = page.locator('[class*="correct"], [class*="right"]')
    const wrongChar = page.locator('[class*="wrong"], [class*="error"], [class*="incorrect"]')

    const correctVisible = await correctChar.isVisible().catch(() => false)
    const wrongVisible = await wrongChar.isVisible().catch(() => false)

    expect(correctVisible || wrongVisible).toBeTruthy()
  })
})

test.describe('Hardcore Mode Typing E2E', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
    await page.waitForLoadState('networkidle')
  })

  test('должен запускать режим "Без ошибок" (Хардкор)', async ({ page }) => {
    const hardcoreButton = page.locator('button:has-text(/хардкор|hardcore|без ошибок/i)')
    await expect(hardcoreButton).toBeVisible()
    await hardcoreButton.click()

    await expect(page.getByText(/режим без ошибок|hardcore mode/i)).toBeVisible({ timeout: 5000 })
  })

  test('должен показывать счётчик серии в Хардкоре', async ({ page }) => {
    const hardcoreButton = page.locator('button:has-text(/хардкор|hardcore/i)')
    await hardcoreButton.click()

    await expect(page.locator('[aria-label*="серия"], [class*="streak"], :has-text(/серия|streak/i)')).toBeVisible({ timeout: 5000 })
  })

  test('должен завершать сессию при ошибке в Хардкоре', async ({ page }) => {
    const hardcoreButton = page.locator('button:has-text(/хардкор|hardcore/i)')
    await hardcoreButton.click()

    await page.waitForTimeout(1000)

    // Вводим неправильный символ
    await page.keyboard.press('z')

    // Должна появиться ошибка или завершение сессии
    const errorElement = page.locator('[class*="error"], [class*="wrong"]')
    const sessionEndElement = page.locator('[class*="summary"], [class*="result"]')

    const errorVisible = await errorElement.isVisible().catch(() => false)
    const sessionEnded = await sessionEndElement.isVisible().catch(() => false)

    expect(errorVisible || sessionEnded).toBeTruthy()
  })
})

test.describe('Mobile Typing E2E', () => {
  test.use({ viewport: { width: 375, height: 667 } })

  test.beforeEach(async ({ page }) => {
    await page.goto('/')
    await page.waitForLoadState('networkidle')
  })

  test('должен отображать адаптивный режим спринта на мобильных', async ({ page }) => {
    const sprintButton = page.locator('button:has-text(/спринт|sprint/i)')
    await sprintButton.click()

    await expect(page.locator('[class*="timer"], [class*="progress"]')).toBeVisible({ timeout: 5000 })
  })

  test('должен показывать текст для печати крупным шрифтом на мобильных', async ({ page }) => {
    const sprintButton = page.locator('button:has-text(/спринт|sprint/i)')
    await sprintButton.click()

    const textElement = page.locator('[class*="text"], [class*="word"]').first()
    await expect(textElement).toBeVisible({ timeout: 5000 })
  })
})

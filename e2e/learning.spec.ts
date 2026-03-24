/**
 * FastFingers — E2E тесты режима обучения (LearningMode)
 * @author Dupley Maxim Igorevich
 * @copyright 2025-2026 Dupley Maxim Igorevich
 */

import { test, expect } from '@playwright/test'

test.describe('LearningMode E2E', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
    await page.waitForLoadState('networkidle')
  })

  test('должен открывать режим обучения', async ({ page }) => {
    const learningButton = page.locator('button:has-text(/обучение|learning/i)')
    await expect(learningButton).toBeVisible()
    await learningButton.click()

    await expect(page.locator('h2:has-text(/режим обучения|learning mode/i)')).toBeVisible({ timeout: 5000 })
  })

  test('должен показывать список уроков', async ({ page }) => {
    const learningButton = page.locator('button:has-text(/обучение|learning/i)')
    await learningButton.click()

    // Проверяем наличие карточек уроков
    const lessonCards = page.locator('[class*="lesson"], [class*="card"]')
    await expect(lessonCards).toHaveCount({ min: 5 })
  })

  test('должен показывать прогресс обучения', async ({ page }) => {
    const learningButton = page.locator('button:has-text(/обучение|learning/i)')
    await learningButton.click()

    const progressElement = page.locator('[class*="progress"], text=/прогресс|progress/i')
    await expect(progressElement).toBeVisible({ timeout: 5000 })
  })

  test('должен показывать первый урок доступным', async ({ page }) => {
    const learningButton = page.locator('button:has-text(/обучение|learning/i)')
    await learningButton.click()

    // Первый урок должен быть доступен (не заблокирован)
    const firstLesson = page.locator('[class*="lesson"]').first()
    await expect(firstLesson).toBeVisible()
    await expect(firstLesson).not.toHaveClass(/locked/i)
  })

  test('должен блокировать последующие уроки', async ({ page }) => {
    const learningButton = page.locator('button:has-text(/обучение|learning/i)')
    await learningButton.click()

    // Проверяем наличие заблокированных уроков
    const lockedLessons = page.locator('[class*="locked"], [aria-disabled="true"]')
    const lockedCount = await lockedLessons.count()
    expect(lockedCount).toBeGreaterThan(0)
  })

  test('должен открывать детали урока при клике', async ({ page }) => {
    const learningButton = page.locator('button:has-text(/обучение|learning/i)')
    await learningButton.click()

    const firstLesson = page.locator('[class*="lesson"]').first()
    await firstLesson.click()

    // Проверяем отображение деталей урока
    await expect(page.locator('h3:has-text(/основной ряд|home row|урок|lesson/i)')).toBeVisible({ timeout: 5000 })
  })

  test('должен показывать клавиши для изучения в уроке', async ({ page }) => {
    const learningButton = page.locator('button:has-text(/обучение|learning/i)')
    await learningButton.click()

    const firstLesson = page.locator('[class*="lesson"]').first()
    await firstLesson.click()

    // Проверяем наличие клавиш
    const keyElements = page.locator('[class*="key"], [class*="keyboard-key"]')
    await expect(keyElements).toHaveCount({ min: 4 })
  })

  test('должен показывать упражнения в уроке', async ({ page }) => {
    const learningButton = page.locator('button:has-text(/обучение|learning/i)')
    await learningButton.click()

    const firstLesson = page.locator('[class*="lesson"]').first()
    await firstLesson.click()

    // Проверяем наличие упражнений
    const exerciseElements = page.locator('text=/упражнение|exercise/i')
    await expect(exerciseElements).toHaveCount({ min: 3 })
  })

  test('должен запускать упражнение при клике на "Начать"', async ({ page }) => {
    const learningButton = page.locator('button:has-text(/обучение|learning/i)')
    await learningButton.click()

    const firstLesson = page.locator('[class*="lesson"]').first()
    await firstLesson.click()

    const startButton = page.locator('button:has-text(/начать|start/i)').first()
    await startButton.click()

    // Проверяем запуск упражнения
    await expect(page.locator('[class*="text"], [class*="word"]')).toBeVisible({ timeout: 5000 })
  })

  test('должен показывать иконки для каждого урока', async ({ page }) => {
    const learningButton = page.locator('button:has-text(/обучение|learning/i)')
    await learningButton.click()

    const lessonIcons = page.locator('[class*="lesson"] .text-4xl, [class*="icon"]')
    const iconCount = await lessonIcons.count()
    expect(iconCount).toBeGreaterThan(5)
  })

  test('должен возвращаться к списку уроков из деталей', async ({ page }) => {
    const learningButton = page.locator('button:has-text(/обучение|learning/i)')
    await learningButton.click()

    const firstLesson = page.locator('[class*="lesson"]').first()
    await firstLesson.click()

    const backButton = page.locator('button:has-text(/назад|back/i), text=/назад к урокам/i')
    await backButton.click()

    // Проверяем возврат к списку
    await expect(page.locator('h2:has-text(/режим обучения|learning mode/i)')).toBeVisible({ timeout: 5000 })
  })

  test('должен закрываться по кнопке закрытия', async ({ page }) => {
    const learningButton = page.locator('button:has-text(/обучение|learning/i)')
    await learningButton.click()

    const closeButton = page.locator('button[aria-label="Закрыть"], button[aria-label*="close"]').first()
    await closeButton.click()

    // Режим обучения должен закрыться
    await expect(page.locator('h2:has-text(/режим обучения|learning mode/i)')).not.toBeVisible({ timeout: 3000 })
  })

  test('должен закрываться по Escape', async ({ page }) => {
    const learningButton = page.locator('button:has-text(/обучение|learning/i)')
    await learningButton.click()

    await page.keyboard.press('Escape')

    await expect(page.locator('h2:has-text(/режим обучения|learning mode/i)')).not.toBeVisible({ timeout: 3000 })
  })

  test('должен поддерживать навигацию с клавиатуры', async ({ page }) => {
    const learningButton = page.locator('button:has-text(/обучение|learning/i)')
    await learningButton.click()

    // Tab навигация
    await page.keyboard.press('Tab')
    await expect(page.locator(':focus')).toBeVisible()

    for (let i = 0; i < 5; i++) {
      await page.keyboard.press('Tab')
      await page.waitForTimeout(100)
    }

    await expect(page.locator(':focus')).toBeVisible()
  })
})

test.describe('Learning Progress E2E', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
    await page.waitForLoadState('networkidle')
  })

  test('должен сохранять прогресс урока после выполнения', async ({ page }) => {
    const learningButton = page.locator('button:has-text(/обучение|learning/i)')
    await learningButton.click()

    // Открываем первый урок
    const firstLesson = page.locator('[class*="lesson"]').first()
    await firstLesson.click()

    // Запускаем упражнение
    const startButton = page.locator('button:has-text(/начать|start/i)').first()
    await startButton.click()

    // Вводим текст упражнения
    await page.waitForTimeout(1000)
    await page.keyboard.type('test')

    // Возвращаемся к списку уроков
    await page.keyboard.press('Escape')
    await page.keyboard.press('Escape')

    // Открываем режим обучения снова
    await learningButton.click()

    // Проверяем, что прогресс сохранён (урок отмечен как выполненный)
    const completedLesson = page.locator('[class*="completed"], [class*="checkmark"], text=/✓/')
    const completedVisible = await completedLesson.isVisible().catch(() => false)
    expect(completedVisible).toBeTruthy()
  })

  test('должен показывать общий прогресс в процентах', async ({ page }) => {
    const learningButton = page.locator('button:has-text(/обучение|learning/i)')
    await learningButton.click()

    const progressText = page.locator('text=/[0-9]+.*\/.*[0-9]+/, text=/прогресс|progress/i')
    const progressVisible = await progressText.isVisible().catch(() => false)
    expect(progressVisible).toBeTruthy()
  })
})

test.describe('Mobile Learning E2E', () => {
  test.use({ viewport: { width: 375, height: 667 } })

  test.beforeEach(async ({ page }) => {
    await page.goto('/')
    await page.waitForLoadState('networkidle')
  })

  test('должен отображать адаптивный список уроков на мобильных', async ({ page }) => {
    const learningButton = page.locator('button:has-text(/обучение|learning/i)')
    await learningButton.click()

    await expect(page.locator('[class*="lesson"]')).toHaveCount({ min: 5 })
  })

  test('должен показывать крупные карточки уроков на мобильных', async ({ page }) => {
    const learningButton = page.locator('button:has-text(/обучение|learning/i)')
    await learningButton.click()

    const firstLesson = page.locator('[class*="lesson"]').first()
    await expect(firstLesson).toBeVisible()
  })
})

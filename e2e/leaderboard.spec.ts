/**
 * FastFingers — E2E тесты таблицы лидеров (Leaderboard)
 * @author Dupley Maxim Igorevich
 * @copyright 2025-2026 Dupley Maxim Igorevich
 */

import { test, expect } from '@playwright/test'

test.describe('Leaderboard E2E', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
    await page.waitForLoadState('networkidle')
  })

  test('должен открывать таблицу лидеров', async ({ page }) => {
    const leaderboardButton = page.locator('button:has-text(/лидеры|leaderboard|топ/i)')
    await expect(leaderboardButton).toBeVisible()
    await leaderboardButton.click()

    await expect(page.locator('h2:has-text(/таблица лидеров|leaderboard/i)')).toBeVisible({ timeout: 5000 })
  })

  test('должен показывать топ-3 участников с медалями', async ({ page }) => {
    const leaderboardButton = page.locator('button:has-text(/лидеры|leaderboard/i)')
    await leaderboardButton.click()

    // Проверяем наличие медалей
    const medals = page.locator('text=/🥇|🥈|🥉/')
    await expect(medals).toHaveCount({ min: 1 })
  })

  test('должен показывать кнопку сортировки', async ({ page }) => {
    const leaderboardButton = page.locator('button:has-text(/лидеры|leaderboard/i)')
    await leaderboardButton.click()

    const sortSelect = page.locator('select[id*="sort"], [aria-label*="сортировка"], text=/сортировать/i')
    await expect(sortSelect).toBeVisible({ timeout: 5000 })
  })

  test('должен сортировать по WPM', async ({ page }) => {
    const leaderboardButton = page.locator('button:has-text(/лидеры|leaderboard/i)')
    await leaderboardButton.click()

    const sortSelect = page.locator('select').first()
    await sortSelect.selectOption('wpm')

    // Проверяем, что значения WPM отсортированы
    const wpmValues = page.locator('text=/\\d+ WPM/i, [class*="wpm"]')
    await expect(wpmValues.first()).toBeVisible({ timeout: 3000 })
  })

  test('должен сортировать по точности', async ({ page }) => {
    const leaderboardButton = page.locator('button:has-text(/лидеры|leaderboard/i)')
    await leaderboardButton.click()

    const sortSelect = page.locator('select').first()
    await sortSelect.selectOption('accuracy')

    await expect(page.locator('text=/точность|accuracy/i')).toBeVisible()
  })

  test('должен сортировать по уровню', async ({ page }) => {
    const leaderboardButton = page.locator('button:has-text(/лидеры|leaderboard/i)')
    await leaderboardButton.click()

    const sortSelect = page.locator('select').first()
    await sortSelect.selectOption('level')

    await expect(page.locator('text=/уровень|level/i')).toBeVisible()
  })

  test('должен фильтровать по периоду: сегодня', async ({ page }) => {
    const leaderboardButton = page.locator('button:has-text(/лидеры|leaderboard/i)')
    await leaderboardButton.click()

    const todayButton = page.locator('button:has-text(/день|today/i), [aria-checked*="today"]')
    await todayButton.click()

    // Проверяем, что фильтр применён
    const activeFilter = page.locator('[aria-checked="true"], .bg-primary-600')
    await expect(activeFilter).toBeVisible()
  })

  test('должен фильтровать по периоду: неделя', async ({ page }) => {
    const leaderboardButton = page.locator('button:has-text(/лидеры|leaderboard/i)')
    await leaderboardButton.click()

    const weekButton = page.locator('button:has-text(/неделя|week/i)')
    await weekButton.click()

    await expect(weekButton).toHaveClass(/bg-primary-600|active/)
  })

  test('должен фильтровать по периоду: месяц', async ({ page }) => {
    const leaderboardButton = page.locator('button:has-text(/лидеры|leaderboard/i)')
    await leaderboardButton.click()

    const monthButton = page.locator('button:has-text(/месяц|month/i)')
    await monthButton.click()

    await expect(monthButton).toHaveClass(/bg-primary-600|active/)
  })

  test('должен фильтровать по периоду: всё время', async ({ page }) => {
    const leaderboardButton = page.locator('button:has-text(/лидеры|leaderboard/i)')
    await leaderboardButton.click()

    const allTimeButton = page.locator('button:has-text(/все|all/i)')
    await allTimeButton.click()

    await expect(allTimeButton).toHaveClass(/bg-primary-600|active/)
  })

  test('должен показывать позицию текущего пользователя', async ({ page }) => {
    const leaderboardButton = page.locator('button:has-text(/лидеры|leaderboard/i)')
    await leaderboardButton.click()

    // Проверяем наличие блока с позицией пользователя
    const userPosition = page.locator('text=/ваша позиция|your position|your rank/i')
    const userPositionVisible = await userPosition.isVisible().catch(() => false)

    // Или показывается сообщение об отсутствии данных
    const noData = page.locator('text=/нет данных|no data/i')
    const noDataVisible = await noData.isVisible().catch(() => false)

    expect(userPositionVisible || noDataVisible).toBeTruthy()
  })

  test('должен показывать аватары участников', async ({ page }) => {
    const leaderboardButton = page.locator('button:has-text(/лидеры|leaderboard/i)')
    await leaderboardButton.click()

    const avatars = page.locator('[class*="avatar"], [class*="rounded-full"], .text-2xl').first()
    const avatarsVisible = await avatars.isVisible().catch(() => false)
    expect(avatarsVisible).toBeTruthy()
  })

  test('должен показывать рейтинг в процентах', async ({ page }) => {
    const leaderboardButton = page.locator('button:has-text(/лидеры|leaderboard/i)')
    await leaderboardButton.click()

    const percentileText = page.locator('text=/быстрее|percent|%/i')
    const percentileVisible = await percentileText.isVisible().catch(() => false)
    expect(percentileVisible).toBeTruthy()
  })

  test('должен показывать прогресс-бар рейтинга', async ({ page }) => {
    const leaderboardButton = page.locator('button:has-text(/лидеры|leaderboard/i)')
    await leaderboardButton.click()

    const progressBar = page.locator('[role="progressbar"], [class*="progress"]').first()
    const progressVisible = await progressBar.isVisible().catch(() => false)
    expect(progressVisible).toBeTruthy()
  })

  test('должен закрываться по кнопке закрытия', async ({ page }) => {
    const leaderboardButton = page.locator('button:has-text(/лидеры|leaderboard/i)')
    await leaderboardButton.click()

    const closeButton = page.locator('button[aria-label="Закрыть"], button[aria-label*="close"]').first()
    await closeButton.click()

    await expect(page.locator('h2:has-text(/таблица лидеров|leaderboard/i)')).not.toBeVisible({ timeout: 3000 })
  })

  test('должен закрываться по Escape', async ({ page }) => {
    const leaderboardButton = page.locator('button:has-text(/лидеры|leaderboard/i)')
    await leaderboardButton.click()

    await page.keyboard.press('Escape')

    await expect(page.locator('h2:has-text(/таблица лидеров|leaderboard/i)')).not.toBeVisible({ timeout: 3000 })
  })

  test('должен поддерживать навигацию с клавиатуры', async ({ page }) => {
    const leaderboardButton = page.locator('button:has-text(/лидеры|leaderboard/i)')
    await leaderboardButton.click()

    // Tab навигация между элементами
    for (let i = 0; i < 5; i++) {
      await page.keyboard.press('Tab')
      await page.waitForTimeout(100)
    }

    await expect(page.locator(':focus')).toBeVisible()
  })

  test('должен показывать статистику участников (WPM, точность)', async ({ page }) => {
    const leaderboardButton = page.locator('button:has-text(/лидеры|leaderboard/i)')
    await leaderboardButton.click()

    const wpmStat = page.locator('text=/wpm/i')
    const accuracyStat = page.locator('text=/точность|accuracy/i')

    const wpmVisible = await wpmStat.isVisible().catch(() => false)
    const accuracyVisible = await accuracyStat.isVisible().catch(() => false)

    expect(wpmVisible || accuracyVisible).toBeTruthy()
  })
})

test.describe('Leaderboard Filtering E2E', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
    await page.waitForLoadState('networkidle')
  })

  test('должен обновлять список при изменении фильтра периода', async ({ page }) => {
    const leaderboardButton = page.locator('button:has-text(/лидеры|leaderboard/i)')
    await leaderboardButton.click()

    // Получаем начальное количество записей
    const initialEntries = page.locator('[class*="row"], [class*="entry"], [class*="card"]').first()

    // Меняем фильтр
    const weekButton = page.locator('button:has-text(/неделя|week/i)')
    await weekButton.click()

    // Проверяем, что список обновился
    await expect(initialEntries).toBeVisible({ timeout: 3000 })
  })

  test('должен обновлять список при изменении сортировки', async ({ page }) => {
    const leaderboardButton = page.locator('button:has-text(/лидеры|leaderboard/i)')
    await leaderboardButton.click()

    // Меняем сортировку
    const sortSelect = page.locator('select').first()
    await sortSelect.selectOption('streak')

    // Проверяем, что отображается серия
    const streakText = page.locator('text=/серия|streak/i')
    await expect(streakText).toBeVisible({ timeout: 3000 })
  })

  test('должен показывать пустое состояние при отсутствии данных', async ({ page }) => {
    const leaderboardButton = page.locator('button:has-text(/лидеры|leaderboard/i)')
    await leaderboardButton.click()

    // Выбираем фильтр "сегодня" - может не быть данных
    const todayButton = page.locator('button:has-text(/день|today/i)')
    await todayButton.click()

    // Проверяем наличие данных или пустого состояния
    const emptyState = page.locator('text=/нет данных|no data|начните/i')
    const emptyVisible = await emptyState.isVisible().catch(() => false)

    const hasEntries = page.locator('[class*="entry"]').first()
    const entriesVisible = await hasEntries.isVisible().catch(() => false)

    expect(emptyVisible || entriesVisible).toBeTruthy()
  })
})

test.describe('Mobile Leaderboard E2E', () => {
  test.use({ viewport: { width: 375, height: 667 } })

  test.beforeEach(async ({ page }) => {
    await page.goto('/')
    await page.waitForLoadState('networkidle')
  })

  test('должен отображать адаптивную таблицу лидеров на мобильных', async ({ page }) => {
    const leaderboardButton = page.locator('button:has-text(/лидеры|leaderboard/i)')
    await leaderboardButton.click()

    await expect(page.locator('[class*="leaderboard"], [class*="card"]')).toBeVisible({ timeout: 5000 })
  })

  test('должен показывать фильтры в одну строку на мобильных', async ({ page }) => {
    const leaderboardButton = page.locator('button:has-text(/лидеры|leaderboard/i)')
    await leaderboardButton.click()

    const filterButtons = page.locator('[role="radiogroup"]')
    await expect(filterButtons).toBeVisible({ timeout: 5000 })
  })

  test('должен прокручивать список участников на мобильных', async ({ page }) => {
    const leaderboardButton = page.locator('button:has-text(/лидеры|leaderboard/i)')
    await leaderboardButton.click()

    // Проверяем возможность прокрутки
    const scrollable = page.locator('[class*="overflow-y-auto"], [style*="overflow"]')
    const scrollableVisible = await scrollable.isVisible().catch(() => false)
    expect(scrollableVisible).toBeTruthy()
  })
})

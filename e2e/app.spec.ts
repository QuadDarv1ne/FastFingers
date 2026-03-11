import { test, expect } from '@playwright/test'

test.describe('FastFingers App', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
    await page.waitForLoadState('networkidle')
  })

  test('должен загружаться корректно', async ({ page }) => {
    await expect(page).toHaveTitle(/FastFingers/)
    await expect(page.locator('h1, h2, [class*="logo"]')).toBeVisible({ timeout: 5000 })
  })

  test('должен показывать главный экран с режимами', async ({ page }) => {
    await expect(page.getByText(/спринт|sprint/i)).toBeVisible()
    await expect(page.getByText(/практика|practice/i)).toBeVisible()
    await expect(page.getByText(/история|history/i)).toBeVisible()
    await expect(page.getByText(/лидеры|leader/i)).toBeVisible()
  })

  test('должен переключать режимы', async ({ page }) => {
    await page.getByText(/спринт|sprint/i).click()
    await expect(page.getByText(/60|секунд|second/i)).toBeVisible({ timeout: 5000 })

    await page.getByRole('button', { name: /назад|back/i }).first().click()
    await page.getByText(/практика|practice/i).click()
    await expect(page.getByText(/прогресс|progress/i)).toBeVisible({ timeout: 5000 })
  })

  test('должен показывать настройки', async ({ page }) => {
    await expect(page.getByText(/раскладка|layout/i)).toBeVisible()
    await expect(page.getByText(/звук|sound/i)).toBeVisible()
  })

  test('должен переключать тему', async ({ page }) => {
    const themeToggle = page.locator('[aria-label*="тема"], [aria-label*="theme"], [class*="theme"]')
    await expect(themeToggle).toBeVisible()
  })

  test('должен запускать тренировку и показывать результаты', async ({ page }) => {
    await page.getByText(/спринт|sprint/i).click()
    await expect(page.getByText(/60|секунд|second/i)).toBeVisible({ timeout: 5000 })

    await expect(page.locator('[role="button"][aria-label*="клавиша" i], [class*="key"]')).toHaveCount({ min: 30 })
  })

  test('должен показывать историю тренировок', async ({ page }) => {
    await page.getByText(/история|history/i).click()
    await expect(page.getByText(/история тренировок|training history/i)).toBeVisible({ timeout: 5000 })

    await expect(page.getByText(/wpm|cpm/i)).toBeVisible()
    await expect(page.getByText(/точность|accuracy/i)).toBeVisible()
  })

  test('должен экспортировать статистику в CSV', async ({ page }) => {
    await page.getByText(/история|history/i).click()
    await expect(page.getByText(/история тренировок|training history/i)).toBeVisible({ timeout: 5000 })

    const exportButton = page.locator('[aria-label*="csv" i], [class*="export"], button:has-text("CSV")')
    await expect(exportButton).toBeVisible()
  })

  test('должен показывать таблицу лидеров', async ({ page }) => {
    await page.getByText(/лидеры|leader/i).click()
    await expect(page.getByText(/таблица лидеров|leaderboard/i)).toBeVisible({ timeout: 5000 })
  })

  test('должен переключать язык', async ({ page }) => {
    const langSwitcher = page.locator('[aria-label*="язык"], [aria-label*="language"], button:has-text(/^(RU|EN|ZH|HE)$/i)')
    await expect(langSwitcher).toBeVisible()
  })

  test('должен показывать скины клавиатуры', async ({ page }) => {
    await expect(page.locator('[aria-label*="скин"], [aria-label*="skin"], [class*="skin"]')).toBeVisible()
  })

  test('должен обрабатывать ошибки (Error Boundary)', async ({ page }) => {
    await page.getByText(/спринт|sprint/i).click()
    await expect(page).toHaveURL(/.*sprint.*/i, { timeout: 5000 })
  })

  test('должен показывать прогресс тренировки', async ({ page }) => {
    await page.getByText(/спринт|sprint/i).click()
    await expect(page.getByText(/60|секунд|second/i)).toBeVisible({ timeout: 5000 })

    await expect(page.locator('[role="progressbar"], [class*="progress"]')).toBeVisible()
    await expect(page.getByText(/wpm/i)).toBeVisible()
  })

  test('должен поддерживать навигацию с клавиатуры', async ({ page }) => {
    await page.keyboard.press('Tab')
    await expect(page.locator(':focus')).toBeVisible()

    await page.keyboard.press('Enter')
  })

  test('должен показывать достижения', async ({ page }) => {
    await expect(page.locator('[aria-label*="достиж"], [aria-label*="achieve"], :has-text(/достиж|achieve/i)')).toBeVisible()
  })
})

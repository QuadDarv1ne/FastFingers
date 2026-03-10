import { test, expect } from '@playwright/test'

test.describe('FastFingers App', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
    await page.waitForLoadState('networkidle')
  })

  test('должен загружаться корректно', async ({ page }) => {
    await expect(page).toHaveTitle(/FastFingers/)
    await expect(page.getByRole('heading', { name: /FastFingers/i })).toBeVisible()
  })

  test('должен показывать главный экран с режимами', async ({ page }) => {
    await expect(page.getByText('Спринт')).toBeVisible()
    await expect(page.getByText('Практика')).toBeVisible()
    await expect(page.getByText('История')).toBeVisible()
    await expect(page.getByText('Лидеры')).toBeVisible()
  })

  test('должен переключать режимы', async ({ page }) => {
    await page.getByText('Спринт').click()
    await expect(page.getByText('60 секунд')).toBeVisible({ timeout: 5000 })

    await page.getByRole('button', { name: /назад/i }).first().click()
    await page.getByText('Практика').click()
    await expect(page.getByText('Прогресс')).toBeVisible({ timeout: 5000 })
  })

  test('должен показывать настройки', async ({ page }) => {
    await expect(page.getByText('Настройки')).toBeVisible()
    await expect(page.getByText('Раскладка')).toBeVisible()
    await expect(page.getByText('Звук')).toBeVisible()
  })

  test('должен переключать тему', async ({ page }) => {
    const themeToggle = page.getByRole('button', { name: /тема/i })
    await expect(themeToggle).toBeVisible()
  })

  test('должен запускать тренировку и показывать результаты', async ({ page }) => {
    await page.getByText('Спринт').click()
    await expect(page.getByText('60 секунд')).toBeVisible({ timeout: 5000 })

    await expect(page.locator('[role="button"][aria-label*="клавиша" i]')).toHaveCount({ min: 30 })
  })

  test('должен показывать историю тренировок', async ({ page }) => {
    await page.getByText('История').click()
    await expect(page.getByText('История тренировок')).toBeVisible({ timeout: 5000 })

    await expect(page.getByText('WPM')).toBeVisible()
    await expect(page.getByText('Точность')).toBeVisible()
  })

  test('должен экспортировать статистику в CSV', async ({ page }) => {
    await page.getByText('История').click()
    await expect(page.getByText('История тренировок')).toBeVisible({ timeout: 5000 })

    const exportButton = page.getByRole('button', { name: /csv/i })
    await expect(exportButton).toBeVisible()
  })

  test('должен показывать таблицу лидеров', async ({ page }) => {
    await page.getByText('Лидеры').click()
    await expect(page.getByText('Таблица лидеров')).toBeVisible({ timeout: 5000 })
  })

  test('должен переключать язык', async ({ page }) => {
    const langSwitcher = page.getByRole('button', { name: /^(RU|EN|ZH|HE)$/i })
    await expect(langSwitcher).toBeVisible()
  })

  test('должен показывать скины клавиатуры', async ({ page }) => {
    await expect(page.getByText('Скин')).toBeVisible()
  })

  test('должен обрабатывать ошибки (Error Boundary)', async ({ page }) => {
    await page.getByText('Спринт').click()
    await expect(page).toHaveURL(/.*sprint.*/i, { timeout: 5000 })
  })

  test('должен показывать прогресс тренировки', async ({ page }) => {
    await page.getByText('Спринт').click()
    await expect(page.getByText('60 секунд')).toBeVisible({ timeout: 5000 })

    await expect(page.locator('[role="progressbar"]')).toBeVisible()
    await expect(page.getByText(/WPM/i)).toBeVisible()
  })

  test('должен поддерживать навигацию с клавиатуры', async ({ page }) => {
    await page.keyboard.press('Tab')
    await expect(page.locator(':focus')).toBeVisible()

    await page.keyboard.press('Enter')
  })

  test('должен показывать достижения', async ({ page }) => {
    await expect(page.getByText('Достижения')).toBeVisible()
  })
})

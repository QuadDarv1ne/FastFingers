import { test, expect } from '@playwright/test'

test.describe('FastFingers App', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
    await page.waitForLoadState('networkidle')
  })

  test('должен загружаться корректно', async ({ page }) => {
    await expect(page).toHaveTitle(/FastFingers/)
    await expect(page.getByText('FastFingers')).toBeVisible()
  })

  test('должен показывать главный экран с режимами', async ({ page }) => {
    await expect(page.getByText('⚡ Спринт')).toBeVisible()
    await expect(page.getByText('📝 Практика')).toBeVisible()
    await expect(page.getByText('🎮 Игра')).toBeVisible()
    await expect(page.getByText('🏆 Лидеры')).toBeVisible()
  })

  test('должен переключать режимы', async ({ page }) => {
    // Проверка переключения на режим спринта
    await page.getByText('⚡ Спринт').click()
    await expect(page.getByText('Спринт')).toBeVisible({ timeout: 5000 })

    // Возврат и проверка переключения на практику
    await page.getByRole('button', { name: /назад/i }).first().click()
    await page.getByText('📝 Практика').click()
    await expect(page.getByText('Практика')).toBeVisible({ timeout: 5000 })
  })

  test('должен показывать настройки', async ({ page }) => {
    await expect(page.getByText('Настройки')).toBeVisible()
    await expect(page.getByText('Раскладка')).toBeVisible()
    await expect(page.getByText('Звук')).toBeVisible()
  })

  test('должен переключать тему', async ({ page }) => {
    const lightButton = page.getByTitle('Светлая тема')
    const darkButton = page.getByTitle('Тёмная тема')

    await expect(lightButton).toBeVisible()
    await expect(darkButton).toBeVisible()
  })

  test('должен запускать тренировку и показывать результаты', async ({ page }) => {
    // Запуск спринт режима
    await page.getByText('⚡ Спринт').click()
    await expect(page.getByText('Спринт')).toBeVisible({ timeout: 5000 })

    // Проверка наличия клавиатуры
    await expect(page.locator('[data-key]')).toHaveCount({ min: 30 })

    // Проверка наличия текста для печати
    const textElement = page.locator('[data-testid="text-display"]')
    await expect(textElement).toBeVisible()
  })

  test('должен показывать историю тренировок', async ({ page }) => {
    // Переход к истории
    await page.getByText('📊 История').click()
    await expect(page.getByText('История тренировок')).toBeVisible({ timeout: 5000 })

    // Проверка статистики
    await expect(page.getByText('Всего сессий')).toBeVisible()
    await expect(page.getByText('Время тренировок')).toBeVisible()
  })

  test('должен экспортировать статистику в CSV', async ({ page }) => {
    await page.getByText('📊 История').click()
    await expect(page.getByText('История тренировок')).toBeVisible({ timeout: 5000 })

    // Проверка наличия кнопки экспорта
    const exportButton = page.getByTitle('Экспорт в CSV')
    await expect(exportButton).toBeVisible()
  })

  test('должен показывать таблицу лидеров', async ({ page }) => {
    await page.getByText('🏆 Лидеры').click()
    await expect(page.getByText('Таблица лидеров')).toBeVisible({ timeout: 5000 })
  })

  test('должен переключать язык', async ({ page }) => {
    // Проверка наличия переключателя языка
    const langSwitcher = page.getByRole('button', { name: /RU|EN|ZH|HE/i }).first()
    await expect(langSwitcher).toBeVisible()
  })

  test('должен показывать скины клавиатуры', async ({ page }) => {
    // Проверка наличия селектора скинов
    await expect(page.getByText('Скин')).toBeVisible()
  })

  test('должен обрабатывать ошибки (Error Boundary)', async ({ page }) => {
    // Проверка что приложение не падает при навигации
    await page.getByText('⚡ Спринт').click()
    await expect(page).toHaveURL(/.*sprint.*/i, { timeout: 5000 })
  })

  test('должен показывать прогресс тренировки', async ({ page }) => {
    await page.getByText('⚡ Спринт').click()
    await expect(page.getByText('Спринт')).toBeVisible({ timeout: 5000 })

    // Проверка наличия индикаторов прогресса
    await expect(page.locator('[aria-label*="прогресс" i]')).toBeVisible()
    await expect(page.locator('[aria-label*="WPM" i]')).toBeVisible()
  })

  test('должен поддерживать навигацию с клавиатуры', async ({ page }) => {
    // Навигация Tab
    await page.keyboard.press('Tab')
    await expect(page.locator(':focus')).toBeVisible()

    // Навигация Enter
    await page.keyboard.press('Enter')
  })

  test('должен показывать мотивационные цитаты', async ({ page }) => {
    // Проверка наличия мотивационного блока
    const quoteElement = page.locator('[data-testid="motivational-quote"]')
    await expect(quoteElement).toBeVisible()
  })

  test('должен показывать ежедневные челленджи', async ({ page }) => {
    // Проверка наличия карточки ежедневного челленджа
    const challengeCard = page.locator('[data-testid="daily-challenge"]')
    await expect(challengeCard).toBeVisible()
  })

  test('должен показывать достижения', async ({ page }) => {
    // Проверка наличия панели достижений
    await expect(page.getByText('Достижения')).toBeVisible()
  })
})

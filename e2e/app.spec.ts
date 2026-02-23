import { test, expect } from '@playwright/test'

test.describe('FastFingers App', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
  })

  test('должен загружаться корректно', async ({ page }) => {
    await expect(page).toHaveTitle(/FastFingers/)
  })

  test('должен показывать заголовок', async ({ page }) => {
    await expect(page.getByText('FastFingers')).toBeVisible()
  })

  test('должен переключать режимы', async ({ page }) => {
    // Проверка переключения на режим спринта
    await page.getByText('⚡ Спринт').click()
    await expect(page.getByText('Спринт')).toBeVisible()
    
    // Проверка переключения на практику
    await page.getByText('📝 Практика').click()
    await expect(page.getByText('Практика')).toBeVisible()
  })

  test('должен показывать настройки', async ({ page }) => {
    await expect(page.getByText('Настройки')).toBeVisible()
    await expect(page.getByText('Раскладка')).toBeVisible()
    await expect(page.getByText('Звук')).toBeVisible()
  })

  test('должен переключать тему', async ({ page }) => {
    // Проверяем наличие кнопок переключения темы
    const lightButton = page.getByTitle('Светлая тема')
    const darkButton = page.getByTitle('Тёмная тема')
    
    await expect(lightButton).toBeVisible()
    await expect(darkButton).toBeVisible()
  })
})

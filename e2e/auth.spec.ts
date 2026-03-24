/**
 * FastFingers — E2E тесты аутентификации
 * @author Dupley Maxim Igorevich
 * @copyright 2025-2026 Dupley Maxim Igorevich
 */

import { test, expect } from '@playwright/test'

test.describe('Authentication E2E', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
    await page.waitForLoadState('networkidle')
  })

  test('должен показывать кнопку входа на главной странице', async ({ page }) => {
    const loginButton = page.locator('button:has-text(/войти|login|вход/i)').first()
    await expect(loginButton).toBeVisible()
  })

  test('должен открывать форму входа при клике на кнопку входа', async ({ page }) => {
    const loginButton = page.locator('button:has-text(/войти|login/i)').first()
    await loginButton.click()

    // Проверяем отображение формы входа
    await expect(page.locator('h1:has-text(/с возвращением|welcome/i), input[type="email"]')).toBeVisible({ timeout: 5000 })
  })

  test('должен показывать ошибку при неверном формате email', async ({ page }) => {
    const loginButton = page.locator('button:has-text(/войти|login/i)').first()
    await loginButton.click()

    const emailInput = page.locator('input[type="email"]').first()
    await emailInput.fill('invalid-email')
    await emailInput.blur()

    const errorMessage = page.locator('text=/неверный формат|invalid email/i')
    await expect(errorMessage).toBeVisible()
  })

  test('должен переключаться на форму регистрации', async ({ page }) => {
    const loginButton = page.locator('button:has-text(/войти|login/i)').first()
    await loginButton.click()

    const registerLink = page.locator('button:has-text(/зарегистрироваться|register/i), a:has-text(/зарегистрироваться/i)')
    await registerLink.click()

    await expect(page.locator('h1:has-text(/создать аккаунт|create account/i)')).toBeVisible({ timeout: 5000 })
  })

  test('должен показывать форму регистрации с полями', async ({ page }) => {
    const loginButton = page.locator('button:has-text(/войти|login/i)').first()
    await loginButton.click()

    const registerLink = page.locator('button:has-text(/зарегистрироваться|register/i)')
    await registerLink.click()

    // Проверяем наличие всех полей
    await expect(page.locator('input[placeholder*="имя"], input[type="text"]').first()).toBeVisible()
    await expect(page.locator('input[type="email"]')).toBeVisible()
    await expect(page.locator('input[type="password"]')).toHaveCount({ min: 2 })
  })

  test('должен показывать индикатор сложности пароля', async ({ page }) => {
    const loginButton = page.locator('button:has-text(/войти|login/i)').first()
    await loginButton.click()

    const registerLink = page.locator('button:has-text(/зарегистрироваться|register/i)')
    await registerLink.click()

    const passwordInput = page.locator('input[type="password"]').first()
    await passwordInput.fill('weak')

    const passwordStrength = page.locator('text=/слабый|weak пароль/i, [class*="strength"], [class*="password"]')
    await expect(passwordStrength).toBeVisible()
  })

  test('должен показывать ошибку при несовпадении паролей', async ({ page }) => {
    const loginButton = page.locator('button:has-text(/войти|login/i)').first()
    await loginButton.click()

    const registerLink = page.locator('button:has-text(/зарегистрироваться|register/i)')
    await registerLink.click()

    const passwordInput = page.locator('input[type="password"]').first()
    await passwordInput.fill('password123')

    const confirmPasswordInput = page.locator('input[type="password"]').nth(1)
    await confirmPasswordInput.fill('different123')
    await confirmPasswordInput.blur()

    const errorMessage = page.locator('text=/пароли не совпадают|passwords do not match/i')
    await expect(errorMessage).toBeVisible()
  })

  test('должен требовать согласия с условиями', async ({ page }) => {
    const loginButton = page.locator('button:has-text(/войти|login/i)').first()
    await loginButton.click()

    const registerLink = page.locator('button:has-text(/зарегистрироваться|register/i)')
    await registerLink.click()

    const submitButton = page.locator('button[type="submit"]:has-text(/создать|create/i)')
    await expect(submitButton).toBeDisabled()
  })

  test('должен переключать видимость пароля', async ({ page }) => {
    const loginButton = page.locator('button:has-text(/войти|login/i)').first()
    await loginButton.click()

    const passwordInput = page.locator('input[type="password"]').first()
    await expect(passwordInput).toHaveAttribute('type', 'password')

    const toggleButton = page.locator('button[type="button"][aria-label*="password"], button[type="button"]').first()
    await toggleButton.click()

    await expect(passwordInput).toHaveAttribute('type', 'text')
  })

  test('должен закрывать форму по кнопке Escape', async ({ page }) => {
    const loginButton = page.locator('button:has-text(/войти|login/i)').first()
    await loginButton.click()

    await page.keyboard.press('Escape')

    // Форма должна закрыться
    await expect(page.locator('input[type="email"]')).not.toBeVisible({ timeout: 3000 })
  })

  test('должен поддерживать навигацию с клавиатуры в форме входа', async ({ page }) => {
    const loginButton = page.locator('button:has-text(/войти|login/i)').first()
    await loginButton.click()

    // Tab навигация между полями
    await page.keyboard.press('Tab')
    await expect(page.locator(':focus')).toBeVisible()

    await page.keyboard.press('Tab')
    await expect(page.locator(':focus')).toBeVisible()
  })

  test('должен показывать состояние загрузки при отправке формы', async ({ page }) => {
    const loginButton = page.locator('button:has-text(/войти|login/i)').first()
    await loginButton.click()

    const emailInput = page.locator('input[type="email"]').first()
    const passwordInput = page.locator('input[type="password"]').first()

    await emailInput.fill('test@example.com')
    await passwordInput.fill('password123')

    const submitButton = page.locator('button[type="submit"]')
    await submitButton.click()

    // Проверяем наличие индикатора загрузки или текста
    const loadingState = page.locator('[class*="animate-spin"], text=/вход...|loginning.../i')
    await expect(loadingState).toBeVisible({ timeout: 3000 })
  })
})

test.describe('Mobile Auth E2E', () => {
  test.use({ viewport: { width: 375, height: 667 } })

  test.beforeEach(async ({ page }) => {
    await page.goto('/')
    await page.waitForLoadState('networkidle')
  })

  test('должен отображать адаптивную форму входа на мобильных', async ({ page }) => {
    const loginButton = page.locator('button:has-text(/войти|login/i)').first()
    await loginButton.click()

    await expect(page.locator('.glass, [class*="modal"], [class*="form"]')).toBeVisible({ timeout: 5000 })
  })

  test('должен корректно открывать виртуальную клавиатуру на мобильных', async ({ page }) => {
    const loginButton = page.locator('button:has-text(/войти|login/i)').first()
    await loginButton.click()

    const emailInput = page.locator('input[type="email"]').first()
    await emailInput.focus()

    // Input должен быть в фокусе
    await expect(emailInput).toBeFocused()
  })
})

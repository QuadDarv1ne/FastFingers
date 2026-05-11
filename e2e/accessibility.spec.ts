import { test, expect } from '@playwright/test'
import { injectAxe, getViolations } from 'axe-playwright'

test.describe('Accessibility', () => {
  test('главная страница не имеет критических нарушений доступности', async ({ page }) => {
    await page.goto('/')
    await page.waitForLoadState('networkidle')

    await injectAxe(page)
    const violations = await getViolations(page, null, {
      includedImpacts: ['critical', 'serious'],
    })

    expect(violations).toHaveLength(0)
  })

  test('фокус-кольцо видно при навигации клавиатурой', async ({ page }) => {
    await page.goto('/')
    await page.waitForLoadState('networkidle')

    // Press Tab to move focus
    await page.keyboard.press('Tab')

    // At least one element should have focus-visible outline
    const focused = page.locator(':focus-visible')
    await expect(focused).toBeVisible()
  })

  test('режимы имеют aria-pressed для screen readers', async ({ page }) => {
    await page.goto('/')
    await page.waitForLoadState('networkidle')

    // Mode buttons should have aria-pressed
    const modeButtons = page.locator('button[aria-pressed]')
    const count = await modeButtons.count()
    expect(count).toBeGreaterThan(0)
  })
})

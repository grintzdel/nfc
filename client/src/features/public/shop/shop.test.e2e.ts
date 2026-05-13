import { test, expect } from '@playwright/test'

test.describe('Shop Page', () => {
  test('renders the catalog hero and at least one seeded product card', async ({ browser }) => {
    const ctx = await browser.newContext({ storageState: { cookies: [], origins: [] } })
    const page = await ctx.newPage()
    await page.goto('/shop')
    await expect(page.getByRole('heading', { name: /Equipez votre evenement/i })).toBeVisible()
    await expect(page.getByText(/PULSE/).first()).toBeVisible()
    await expect(page).toHaveTitle(/Boutique/)
    await ctx.close()
  })
})

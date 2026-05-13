import { test, expect } from '@playwright/test'

test.describe('About Page', () => {
  test('renders hero heading and document title', async ({ browser }) => {
    const ctx = await browser.newContext({ storageState: { cookies: [], origins: [] } })
    const page = await ctx.newPage()
    await page.goto('/about')
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible()
    await expect(page).toHaveTitle(/À propos/)
    await ctx.close()
  })
})

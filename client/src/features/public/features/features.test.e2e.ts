import { test, expect } from '@playwright/test'

test.describe('Features Page', () => {
  test('renders the features hero and the Tap pillars', async ({ browser }) => {
    const ctx = await browser.newContext({ storageState: { cookies: [], origins: [] } })
    const page = await ctx.newPage()
    await page.goto('/features')
    await expect(page.getByRole('heading', { name: /Tap & Connect/ })).toBeVisible()
    await expect(page.getByRole('heading', { name: /Tap & Go/ })).toBeVisible()
    await expect(page).toHaveTitle(/Fonctionnalités/)
    await ctx.close()
  })
})

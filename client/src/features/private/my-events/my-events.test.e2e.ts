import { test, expect } from '@playwright/test'

test.describe('My Events Page', () => {
  test('redirects anonymous user to /login with redirect param', async ({ browser }) => {
    const ctx = await browser.newContext({ storageState: { cookies: [], origins: [] } })
    const page = await ctx.newPage()
    await page.goto('/me/events')
    await expect(page).toHaveURL(/\/login\?redirect=/)
    await ctx.close()
  })

  test('shows the events heading for an authenticated user', async ({ browser }) => {
    const ctx = await browser.newContext({ storageState: 'src/e2e/.auth/user.json' })
    const page = await ctx.newPage()
    await page.goto('/me/events')
    await expect(page.getByRole('heading', { level: 1, name: /Mes événements/i })).toBeVisible()
    await ctx.close()
  })
})

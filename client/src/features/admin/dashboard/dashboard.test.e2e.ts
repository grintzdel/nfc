import { test, expect } from '@playwright/test'

test.describe('Admin Dashboard Page', () => {
  test('renders the dashboard header and the stats grid for an admin', async ({ page }) => {
    await page.goto('/admin/dashboard')
    await expect(page.getByRole('heading', { level: 1, name: 'Dashboard' })).toBeVisible()
    await expect(page.getByText(/Vue d'ensemble/i)).toBeVisible()
  })

  test('non-admin user is redirected to /', async ({ browser }) => {
    const ctx = await browser.newContext({ storageState: 'src/e2e/.auth/user.json' })
    const page = await ctx.newPage()
    await page.goto('/admin/dashboard')
    await expect(page).toHaveURL('http://localhost:5173/')
    await ctx.close()
  })

  test('anonymous user is redirected to /login with redirect param', async ({ browser }) => {
    const ctx = await browser.newContext({ storageState: { cookies: [], origins: [] } })
    const page = await ctx.newPage()
    await page.goto('/admin/dashboard')
    await expect(page).toHaveURL(/\/login\?redirect=/)
    await ctx.close()
  })
})

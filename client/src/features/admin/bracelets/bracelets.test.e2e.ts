import { test, expect } from '@playwright/test'

test.describe('Admin Bracelets Page', () => {
  test('renders the bracelets admin header for an admin', async ({ page }) => {
    await page.goto('/admin/bracelets')
    await expect(page.getByRole('heading', { level: 1, name: 'Bracelets' })).toBeVisible()
    await expect(page.getByText(/Inventaire global/i)).toBeVisible()
  })

  test('non-admin user is redirected to /', async ({ browser }) => {
    const ctx = await browser.newContext({ storageState: 'src/e2e/.auth/user.json' })
    const page = await ctx.newPage()
    await page.goto('/admin/bracelets')
    await expect(page).toHaveURL('/')
    await ctx.close()
  })
})

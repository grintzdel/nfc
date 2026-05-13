import { test, expect } from '@playwright/test'

test.describe('Admin Orders Page', () => {
  test('renders the orders admin header for an admin', async ({ page }) => {
    await page.goto('/admin/orders')
    await expect(page.getByRole('heading', { level: 1, name: 'Commandes' })).toBeVisible()
    await expect(page.getByText(/Suivi et statut/i)).toBeVisible()
  })

  test('non-admin user is redirected to /', async ({ browser }) => {
    const ctx = await browser.newContext({ storageState: 'src/e2e/.auth/user.json' })
    const page = await ctx.newPage()
    await page.goto('/admin/orders')
    await expect(page).toHaveURL('/')
    await ctx.close()
  })
})

import { test, expect } from '@playwright/test'

test.describe('Admin Products Page', () => {
  test('renders the catalog admin header for an admin', async ({ page }) => {
    await page.goto('/admin/products')
    await expect(page.getByRole('heading', { level: 1, name: 'Catalogue' })).toBeVisible()
    await expect(page.getByText(/Gestion des produits/i)).toBeVisible()
  })

  test('non-admin user is redirected to /', async ({ browser }) => {
    const ctx = await browser.newContext({ storageState: 'src/e2e/.auth/user.json' })
    const page = await ctx.newPage()
    await page.goto('/admin/products')
    await expect(page).toHaveURL('/')
    await ctx.close()
  })
})

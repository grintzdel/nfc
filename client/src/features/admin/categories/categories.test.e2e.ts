import { test, expect } from '@playwright/test'

test.describe('Admin Categories Page', () => {
  test('renders the categories admin header for an admin', async ({ page }) => {
    await page.goto('/admin/categories')
    await expect(page.getByRole('heading', { level: 1, name: 'Catégories' })).toBeVisible()
    await expect(page.getByText(/Organisation du catalogue/i)).toBeVisible()
  })

  test('non-admin user is redirected to /', async ({ browser }) => {
    const ctx = await browser.newContext({ storageState: 'src/e2e/.auth/user.json' })
    const page = await ctx.newPage()
    await page.goto('/admin/categories')
    await expect(page).toHaveURL('/')
    await ctx.close()
  })
})

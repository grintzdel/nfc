import { test, expect } from '@playwright/test'

test.describe('My Orders Page', () => {
  test('renders the orders heading for an authenticated user', async ({ page }) => {
    await page.goto('/orders')
    await expect(page.getByRole('heading', { level: 1, name: 'Mes commandes' })).toBeVisible()
  })

  test('shows the empty state when the user has no orders', async ({ browser }) => {
    const ctx = await browser.newContext({ storageState: 'src/e2e/.auth/user.json' })
    const page = await ctx.newPage()
    await page.goto('/orders')
    await expect(page.getByRole('heading', { level: 1, name: 'Mes commandes' })).toBeVisible()
    await expect(page.getByText(/Aucune commande pour le moment/i)).toBeVisible()
    await ctx.close()
  })
})

import { test, expect } from '@playwright/test'

test.describe('Product Detail Page', () => {
  test('renders the product hero with add-to-cart for a seeded slug', async ({ browser }) => {
    const ctx = await browser.newContext({ storageState: { cookies: [], origins: [] } })
    const page = await ctx.newPage()
    await page.goto('/product/pulse-classic')
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible()
    await expect(page.getByRole('button', { name: /Ajouter au panier/i })).toBeVisible()
    await ctx.close()
  })

  test('shows the "produit introuvable" fallback for an unknown slug', async ({ browser }) => {
    const ctx = await browser.newContext({ storageState: { cookies: [], origins: [] } })
    const page = await ctx.newPage()
    await page.goto('/product/does-not-exist')
    await expect(page.getByText(/Produit introuvable/i)).toBeVisible({ timeout: 15_000 })
    await ctx.close()
  })
})

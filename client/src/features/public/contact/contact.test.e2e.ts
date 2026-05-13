import { test, expect } from '@playwright/test'

test.describe('Contact Page', () => {
  test('renders the contact hero with H1 and the FAQ section heading', async ({ browser }) => {
    const ctx = await browser.newContext({ storageState: { cookies: [], origins: [] } })
    const page = await ctx.newPage()
    await page.goto('/contact')
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible()
    await expect(page.getByRole('heading', { name: /Questions frequentes/i })).toBeVisible()
    await ctx.close()
  })

  test('document title reflects the page', async ({ browser }) => {
    const ctx = await browser.newContext({ storageState: { cookies: [], origins: [] } })
    const page = await ctx.newPage()
    await page.goto('/contact')
    await expect(page).toHaveTitle(/Contact/)
    await ctx.close()
  })
})

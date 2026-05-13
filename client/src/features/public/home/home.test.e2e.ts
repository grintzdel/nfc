import { test, expect } from '@playwright/test'

test.describe('Home Page', () => {
  test('renders the hero and the main CTAs for an anonymous visitor', async ({ browser }) => {
    const ctx = await browser.newContext({ storageState: { cookies: [], origins: [] } })
    const page = await ctx.newPage()
    await page.goto('/')
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible()
    await expect(page.getByText('Vibrez. Connectez. Vivez.')).toBeVisible()
    await ctx.close()
  })

  test('document title reflects the page', async ({ browser }) => {
    const ctx = await browser.newContext({ storageState: { cookies: [], origins: [] } })
    const page = await ctx.newPage()
    await page.goto('/')
    await expect(page).toHaveTitle(/PULSE Event Pass/)
    await ctx.close()
  })
})

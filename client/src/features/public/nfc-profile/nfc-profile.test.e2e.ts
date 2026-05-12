import { test, expect } from '@playwright/test'

test.describe('NFC Profile Page', () => {
  test('renders Marie Dubois with 3 link cards', async ({ browser }) => {
    const ctx = await browser.newContext({ storageState: { cookies: [], origins: [] } })
    const page = await ctx.newPage()
    await page.goto('/p/demo-nfc-001')
    await expect(page.getByText('Marie Dubois')).toBeVisible()
    await expect(page.getByRole('link', { name: /LinkedIn/ })).toBeVisible()
    await expect(page.getByRole('link', { name: /GitHub/ })).toBeVisible()
    await expect(page.getByRole('link', { name: /Calendly/ })).toBeVisible()
    await ctx.close()
  })

  test('renders error state for unknown nfcId', async ({ browser }) => {
    const ctx = await browser.newContext({ storageState: { cookies: [], origins: [] } })
    const page = await ctx.newPage()
    await page.goto('/p/does-not-exist')
    await expect(page.getByText(/n'est pas activé/)).toBeVisible()
    await ctx.close()
  })
})

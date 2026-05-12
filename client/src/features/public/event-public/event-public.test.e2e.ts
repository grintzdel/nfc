import { test, expect } from '@playwright/test'

test.describe('Event Public Page', () => {
  test('shows hero + description + register button for an active event', async ({ browser }) => {
    const ctx = await browser.newContext({ storageState: { cookies: [], origins: [] } })
    const page = await ctx.newPage()
    await page.goto('/events/pulse-demo-2026')
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible()
    await expect(page.getByText(/À propos/)).toBeVisible()
    await expect(page.getByRole('button', { name: /S'inscrire/ })).toBeVisible()
    await ctx.close()
  })

  test('shows "not available" for an unknown slug', async ({ browser }) => {
    const ctx = await browser.newContext({ storageState: { cookies: [], origins: [] } })
    const page = await ctx.newPage()
    await page.goto('/events/does-not-exist')
    await expect(page.getByText(/n'est pas disponible/)).toBeVisible()
    await ctx.close()
  })
})

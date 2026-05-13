import { test, expect } from '@playwright/test'

test.describe('Admin Events Page', () => {
  test('renders the events admin header for an admin', async ({ page }) => {
    await page.goto('/admin/events')
    await expect(page.getByRole('heading', { level: 1, name: 'Evenements' })).toBeVisible()
  })

  test('shows at least one seeded event in the table', async ({ page }) => {
    await page.goto('/admin/events')
    await expect(page.getByText('Pulse Demo 2026').first()).toBeVisible()
  })

  test('non-admin user is redirected to /', async ({ browser }) => {
    const ctx = await browser.newContext({ storageState: 'src/e2e/.auth/user.json' })
    const page = await ctx.newPage()
    await page.goto('/admin/events')
    await expect(page).toHaveURL('/')
    await ctx.close()
  })
})

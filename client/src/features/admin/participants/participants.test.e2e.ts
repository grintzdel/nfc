import { test, expect } from '@playwright/test'

test.describe('Admin Participants Page', () => {
  test('renders the participants admin header for an admin', async ({ page }) => {
    await page.goto('/admin/participants')
    await expect(page.getByRole('heading', { level: 1, name: 'Participants' })).toBeVisible()
    await expect(page.getByText(/Vue globale des participants/i)).toBeVisible()
  })

  test('non-admin user is redirected to /', async ({ browser }) => {
    const ctx = await browser.newContext({ storageState: 'src/e2e/.auth/user.json' })
    const page = await ctx.newPage()
    await page.goto('/admin/participants')
    await expect(page).toHaveURL('/')
    await ctx.close()
  })
})

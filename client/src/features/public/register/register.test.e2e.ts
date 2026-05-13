import { test, expect } from '@playwright/test'

test.describe('Register Page', () => {
  test('renders the registration form with required fields', async ({ browser }) => {
    const ctx = await browser.newContext({ storageState: { cookies: [], origins: [] } })
    const page = await ctx.newPage()
    await page.goto('/register')
    await expect(page.getByRole('heading', { name: /Creer un compte/i })).toBeVisible()
    await expect(page.getByLabel(/Email/i)).toBeVisible()
    await expect(page.getByLabel(/Mot de passe/i)).toBeVisible()
    await expect(page.getByRole('button', { name: /Creer|S'inscrire|Inscription/i })).toBeVisible()
    await ctx.close()
  })

  test('signs up a fresh user and lands authenticated on the homepage', async ({ browser }) => {
    const ctx = await browser.newContext({ storageState: { cookies: [], origins: [] } })
    const page = await ctx.newPage()
    await page.goto('/register')

    const email = `e2e-register-${Date.now()}@pulse.test`
    await page.getByLabel(/Pr[ée]nom/i).fill('E2E')
    await page.getByLabel('Nom', { exact: true }).fill('Register')
    await page.getByLabel(/Email/i).fill(email)
    await page.getByLabel(/Mot de passe/i).fill('Pulse2026Test!')
    await page.getByRole('button', { name: /Creer|S'inscrire|Inscription/i }).click()

    await expect(page).toHaveURL(/^https?:\/\/localhost:5173\/(\?.*)?$/)
    const token = await page.evaluate(() => localStorage.getItem('token'))
    expect(token).toBeTruthy()
    await ctx.close()
  })
})

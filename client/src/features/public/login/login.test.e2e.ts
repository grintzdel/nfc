import { test, expect } from '@playwright/test'

test.describe('Login Page', () => {
  test('renders the login form with email + password inputs', async ({ browser }) => {
    const ctx = await browser.newContext({ storageState: { cookies: [], origins: [] } })
    const page = await ctx.newPage()
    await page.goto('/login')
    await expect(page.getByRole('heading', { name: 'Bon retour !' })).toBeVisible()
    await expect(page.getByLabel(/Email/i)).toBeVisible()
    await expect(page.getByLabel(/Mot de passe/i)).toBeVisible()
    await expect(page.getByRole('button', { name: /Se connecter|Connexion/i })).toBeVisible()
    await ctx.close()
  })

  test('shows an error message when credentials are invalid', async ({ browser }) => {
    const ctx = await browser.newContext({ storageState: { cookies: [], origins: [] } })
    const page = await ctx.newPage()
    await page.goto('/login')
    await page.getByLabel(/Email/i).fill('does-not-exist@pulse.test')
    await page.getByLabel(/Mot de passe/i).fill('wrong-password')
    await page.getByRole('button', { name: /Se connecter|Connexion/i }).click()
    await expect(page.getByText(/identifiant|mot de passe|incorrect|invalide/i).first()).toBeVisible()
    await ctx.close()
  })
})

import { test, expect } from '@playwright/test'

test.describe('Full user parcours (signup → SaaS → cart → checkout)', () => {
  test.use({ storageState: { cookies: [], origins: [] } })

  test('completes the 7 mandatory steps end-to-end', async ({ page }) => {
    const stamp = Date.now()
    const email = `e2e-parcours-${stamp}@pulse.test`
    const password = 'Pulse2026Test!'

    await page.goto('/register')
    await page.getByPlaceholder('Prenom').fill('Parcours')
    await page.getByPlaceholder('Nom', { exact: true }).fill('Tester')
    await page.getByPlaceholder('vous@exemple.com').fill(email)
    await page.getByPlaceholder('••••••••').fill(password)
    await page.getByRole('button', { name: /Creer mon compte/ }).click()

    await expect(page).toHaveURL('/')
    await expect(page.getByText(/Compte cree avec succes/)).toBeVisible({ timeout: 5_000 })

    await page.evaluate(() => localStorage.removeItem('token'))
    await page.goto('/login')
    await page.getByPlaceholder('vous@exemple.com').fill(email)
    await page.getByPlaceholder('••••••••').fill(password)
    await page.getByRole('button', { name: /Se connecter/ }).click()
    await expect(page).toHaveURL('/')

    await page.goto('/me/events')
    await expect(page.getByRole('heading', { name: 'Mes événements' })).toBeVisible()
    await expect(page.getByText(/Aucune inscription/)).toBeVisible()

    await page.goto('/me/events')
    await expect(page.getByRole('button', { name: /Voir la boutique/ })).toBeVisible()
    await page.getByRole('button', { name: /Voir la boutique/ }).click()
    await expect(page).toHaveURL(/\/shop$/)

    await page
      .getByRole('button', { name: /^Ajouter$/ })
      .first()
      .click()
    await expect(page.getByText(/Article ajoute au panier/)).toBeVisible()

    await page
      .getByRole('button', { name: /panier|cart/i })
      .first()
      .click()
      .catch(async () => {
        const cartIcon = page.locator('button:has(svg.lucide-shopping-cart)')
        await cartIcon.first().click()
      })

    await expect(page.getByRole('heading', { name: 'Votre panier' })).toBeVisible()
    await page.getByRole('button', { name: /Paiement securise/ }).click()

    await expect(page).toHaveURL(/\/orders$/, { timeout: 10_000 })
    await expect(page.getByText(/Commande validee/)).toBeVisible({ timeout: 5_000 })
    await expect(page.getByRole('heading', { name: 'Mes commandes' })).toBeVisible()
  })
})

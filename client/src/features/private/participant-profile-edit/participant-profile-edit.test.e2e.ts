import { test, expect } from '@playwright/test'

test.describe('Participant Profile Edit', () => {
  test('redirects anonymous user to login with redirect param', async ({ browser }) => {
    const ctx = await browser.newContext({ storageState: { cookies: [], origins: [] } })
    const page = await ctx.newPage()
    await page.goto('/me/events/some-id')
    await expect(page).toHaveURL(/\/login\?redirect=(%2F|\/)?me(%2F|\/)events(%2F|\/)some-id/)
    await ctx.close()
  })

  test('owner can edit displayName + add a link + save', async ({ page, request }) => {
    await page.goto('/')
    const token = await page.evaluate(() => localStorage.getItem('token'))
    test.skip(!token, 'baseline user has no token (auth seed skipped?)')

    const meRes = await request.get('http://localhost:3001/api/participants/me', {
      headers: { Authorization: `Bearer ${token}` },
    })
    test.skip(
      !meRes.ok(),
      `baseline user cannot fetch /participants/me (status ${meRes.status()}) — backend or seed issue`
    )

    const participations = ((await meRes.json()) as { data: Array<{ id: string }> }).data
    test.skip(participations.length === 0, 'baseline E2E user has no participations — seed required')

    const id = participations[0]!.id
    await page.goto(`/me/events/${id}`)
    await expect(page.getByText('Modifier mon profil')).toBeVisible()

    await page.getByLabel('Nom affiché').fill('E2E Updated Name')

    await page.getByRole('button', { name: /Ajouter un lien/ }).click()
    const urlInputs = page.getByPlaceholder('https://...')
    await urlInputs.last().fill('https://linkedin.com/in/e2e-user')

    await page.getByRole('button', { name: /Enregistrer/ }).click()
    await expect(page.getByText(/Profil mis à jour/)).toBeVisible()
  })
})

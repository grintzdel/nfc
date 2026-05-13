import { test, expect } from '@playwright/test'

const DEMO_SLUG = 'pulse-demo-2026'
const DRAFT_SLUG = 'pulse-draft-demo'

async function resolveEventIdBySlug(
  slug: string,
  request: import('@playwright/test').APIRequestContext
): Promise<string> {
  const res = await request.get(`http://localhost:3001/api/events/public/${slug}`)
  if (!res.ok())
    throw new Error(`Cannot resolve event slug "${slug}" — status ${res.status()}. Did you run \`pnpm seed\`?`)
  const body = (await res.json()) as { data: { id: string } }
  return body.data.id
}

test.describe('Admin Event Detail', () => {
  test('header + 3 tabs render with seeded demo event', async ({ page, request }) => {
    const eventId = await resolveEventIdBySlug(DEMO_SLUG, request)
    await page.goto(`/admin/events/${eventId}`)

    await expect(page.getByRole('main').getByRole('heading', { level: 1, name: 'Pulse Demo 2026' })).toBeVisible()
    await expect(page.getByText('Page publique')).toBeVisible()

    await expect(page.getByText(/Participants$/).first()).toBeVisible()
    await expect(page.getByText(/Bracelets actifs/)).toBeVisible()
    await expect(page.getByText(/^Check-ins$/).first()).toBeVisible()
    await expect(page.getByText(/Dernier check-in/)).toBeVisible()

    await expect(page.getByText('Marie Dubois')).toBeVisible()

    await page.getByRole('tab', { name: /Bracelets/ }).click()
    await expect(page.getByText('demo-nfc-001').first()).toBeVisible()

    await page.getByRole('tab', { name: /Check-ins/ }).click()
    await expect(page.getByText(/Total check-ins/)).toBeVisible()
    await expect(page.getByText(/Participants uniques/)).toBeVisible()
  })

  test('Publier action is rendered on a draft event', async ({ page, request }) => {
    const eventId = await resolveEventIdBySlug(DRAFT_SLUG, request).catch(() => null)
    test.skip(!eventId, 'pulse-draft-demo not seeded — run `pnpm seed`')

    await page.goto(`/admin/events/${eventId}`)
    await expect(page.getByRole('button', { name: /Publier/ })).toBeVisible()
    await expect(page.getByRole('button', { name: /Démarrer/ })).toHaveCount(0)
    await expect(page.getByRole('button', { name: /Clôturer/ })).toHaveCount(0)
  })

  test('participants search filters server-side', async ({ page, request }) => {
    const eventId = await resolveEventIdBySlug(DEMO_SLUG, request)
    await page.goto(`/admin/events/${eventId}`)

    await page.getByPlaceholder(/Rechercher par nom/).fill('marie')

    await expect(page.getByText('Marie Dubois')).toBeVisible()
    await expect(page.getByText('Demo Participant 1')).toHaveCount(0)
  })

  test('non-admin user is redirected to /', async ({ browser, request }) => {
    const eventId = await resolveEventIdBySlug(DEMO_SLUG, request)
    const ctx = await browser.newContext({ storageState: 'src/e2e/.auth/user.json' })
    const page = await ctx.newPage()
    await page.goto(`/admin/events/${eventId}`)
    await expect(page).toHaveURL('http://localhost:5173/')
    await ctx.close()
  })

  test('anonymous user is redirected to /login with redirect param', async ({ browser, request }) => {
    const eventId = await resolveEventIdBySlug(DEMO_SLUG, request)
    const ctx = await browser.newContext({ storageState: { cookies: [], origins: [] } })
    const page = await ctx.newPage()
    await page.goto(`/admin/events/${eventId}`)
    await expect(page).toHaveURL(/\/login\?redirect=/)
    await ctx.close()
  })
})

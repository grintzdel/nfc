import { test, expect } from '@playwright/test'

const DEMO_SLUG = 'pulse-demo-2026'

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

test.describe('Admin Event Scanner Page', () => {
  test('renders the scanner shell with search input for the seeded event', async ({ page, request }) => {
    const eventId = await resolveEventIdBySlug(DEMO_SLUG, request)
    await page.goto(`/admin/events/${eventId}/scanner`)
    await expect(page.getByRole('heading', { level: 1, name: 'Pulse Demo 2026' })).toBeVisible()
    await expect(page.getByPlaceholder(/Rechercher/i)).toBeVisible()
  })

  test('non-admin user is redirected to /', async ({ browser, request }) => {
    const eventId = await resolveEventIdBySlug(DEMO_SLUG, request)
    const ctx = await browser.newContext({ storageState: 'src/e2e/.auth/user.json' })
    const page = await ctx.newPage()
    await page.goto(`/admin/events/${eventId}/scanner`)
    await expect(page).toHaveURL('/')
    await ctx.close()
  })
})

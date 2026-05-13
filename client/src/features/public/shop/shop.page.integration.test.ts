import { flushPromises } from '@vue/test-utils'
import { describe, expect, it, vi } from 'vitest'

import type { ProductDomainModel } from '@/modules/product/core/model/product.domain-model'
import type { IProductPort } from '@/modules/product/core/ports/product.port'

import { mountIntegration } from '../../../__tests__/integration/mount-with-deps'
import ShopPage from './shop.page.vue'

vi.mock('vue-sonner', () => ({ toast: { success: vi.fn(), error: vi.fn() }, Toaster: { template: '<div />' } }))

function makeProductPort(overrides: Partial<IProductPort> = {}): IProductPort {
  return {
    getAll: vi.fn(),
    getBySlug: vi.fn(),
    getFeatured: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
    ...overrides,
  }
}

function makeProduct(
  overrides: Partial<ProductDomainModel.ProductOverviewDto> = {}
): ProductDomainModel.ProductOverviewDto {
  return {
    id: 'p1',
    name: 'PULSE Classic',
    slug: 'pulse-classic',
    description: 'Bracelet NFC classique',
    price: 29.99,
    imageUrl: '/images/pulse-classic.webp',
    stock: 100,
    featured: true,
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z',
    ...overrides,
  }
}

describe('ShopPage — integration (query lifecycle)', () => {
  it('renders the loading spinner while the products query is pending', async () => {
    const pendingPromise = new Promise<ProductDomainModel.ProductOverviewDto[]>(() => {
      /* never resolves */
    })
    const productPort = makeProductPort({ getAll: vi.fn().mockReturnValue(pendingPromise) })
    const { wrapper } = await mountIntegration(ShopPage, {
      deps: { productPort },
      initialRoute: '/shop',
    })

    expect(wrapper.find('.animate-spin').exists()).toBe(true)
    expect(wrapper.text()).not.toContain('Impossible de charger les produits')
  })

  it('renders the product cards when the query resolves with data', async () => {
    const productPort = makeProductPort({
      getAll: vi
        .fn()
        .mockResolvedValue([
          makeProduct({ id: 'p1', name: 'PULSE Classic' }),
          makeProduct({ id: 'p2', name: 'PULSE Pro' }),
        ]),
    })
    const { wrapper } = await mountIntegration(ShopPage, {
      deps: { productPort },
      initialRoute: '/shop',
    })

    await flushPromises()

    expect(wrapper.find('.animate-spin').exists()).toBe(false)
    expect(wrapper.text()).toContain('PULSE Classic')
    expect(wrapper.text()).toContain('PULSE Pro')
  })

  it('renders the error fallback when the query rejects', async () => {
    const productPort = makeProductPort({ getAll: vi.fn().mockRejectedValue(new Error('boom')) })
    const { wrapper } = await mountIntegration(ShopPage, {
      deps: { productPort },
      initialRoute: '/shop',
    })

    await flushPromises()

    expect(wrapper.text()).toContain('Impossible de charger les produits')
    expect(wrapper.find('.animate-spin').exists()).toBe(false)
  })

  it('renders the empty state when the catalog is empty', async () => {
    const productPort = makeProductPort({ getAll: vi.fn().mockResolvedValue([]) })
    const { wrapper } = await mountIntegration(ShopPage, {
      deps: { productPort },
      initialRoute: '/shop',
    })

    await flushPromises()

    expect(wrapper.text()).toContain('Aucun produit disponible')
  })
})

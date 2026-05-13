import { QueryClient, VueQueryPlugin } from '@tanstack/vue-query'
import { createHead } from '@unhead/vue/client'
import { mount, type VueWrapper } from '@vue/test-utils'
import type { Component } from 'vue'
import { createMemoryHistory, createRouter, type Router } from 'vue-router'

import type { Dependencies } from '@/modules/app/core/dependencies'
import { DEPENDENCIES_KEY } from '@/modules/app/ui/hooks/use-dependencies'

const placeholder = { template: '<div data-placeholder />' }

const routes = [
  { path: '/', component: placeholder },
  { path: '/login', component: placeholder },
  { path: '/register', component: placeholder },
  { path: '/shop', component: placeholder },
  { path: '/orders', component: placeholder },
  { path: '/admin/dashboard', component: placeholder },
  { path: '/admin/products', component: placeholder },
]

export type MountIntegrationOptions = {
  deps: Partial<Dependencies>
  initialRoute?: string
  routeQuery?: Record<string, string>
}

export type MountIntegrationResult = {
  wrapper: VueWrapper
  router: Router
  queryClient: QueryClient
}

export async function mountIntegration(
  Component: Component,
  options: MountIntegrationOptions
): Promise<MountIntegrationResult> {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false, gcTime: 0 }, mutations: { retry: false } },
  })

  const router = createRouter({ history: createMemoryHistory(), routes })
  await router.push({ path: options.initialRoute ?? '/', query: options.routeQuery })
  await router.isReady()

  const head = createHead()

  const wrapper = mount(Component, {
    global: {
      plugins: [[VueQueryPlugin, { queryClient }], router, head],
      provide: { [DEPENDENCIES_KEY]: options.deps as Dependencies },
    },
  })

  return { wrapper, router, queryClient }
}

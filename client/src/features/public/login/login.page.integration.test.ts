import { flushPromises } from '@vue/test-utils'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import type { IAuthPort } from '@/modules/auth/core/ports/auth.port'

import { mountIntegration } from '../../../__tests__/integration/mount-with-deps'
import LoginPage from './login.page.vue'

const toast = vi.hoisted(() => ({ success: vi.fn(), error: vi.fn() }))
vi.mock('vue-sonner', () => ({ toast, Toaster: { template: '<div />' } }))

function makeAuthPort(overrides: Partial<IAuthPort> = {}): IAuthPort {
  return { register: vi.fn(), login: vi.fn(), ...overrides }
}

describe('LoginPage — integration', () => {
  beforeEach(() => {
    localStorage.clear()
    toast.success.mockReset()
    toast.error.mockReset()
  })

  it('logs the user in, stores the token, and redirects to / when no redirect param is set', async () => {
    const authPort = makeAuthPort({ login: vi.fn().mockResolvedValue({ token: 'jwt-customer' }) })
    const { wrapper, router } = await mountIntegration(LoginPage, {
      deps: { authPort },
      initialRoute: '/login',
    })
    const pushSpy = vi.spyOn(router, 'push')

    await wrapper.find('#login-email').setValue('user@example.com')
    await wrapper.find('#login-password').setValue('secret123')
    await wrapper.find('form').trigger('submit.prevent')
    await flushPromises()

    expect(authPort.login).toHaveBeenCalledWith({ email: 'user@example.com', password: 'secret123' })
    expect(localStorage.getItem('token')).toBe('jwt-customer')
    expect(toast.success).toHaveBeenCalledWith('Connexion reussie !')
    expect(pushSpy).toHaveBeenCalledWith('/')
  })

  it('respects the ?redirect= query param after a successful login', async () => {
    const authPort = makeAuthPort({ login: vi.fn().mockResolvedValue({ token: 'jwt-customer' }) })
    const { wrapper, router } = await mountIntegration(LoginPage, {
      deps: { authPort },
      initialRoute: '/login',
      routeQuery: { redirect: '/admin/products' },
    })
    const pushSpy = vi.spyOn(router, 'push')

    await wrapper.find('#login-email').setValue('admin@example.com')
    await wrapper.find('#login-password').setValue('secret123')
    await wrapper.find('form').trigger('submit.prevent')
    await flushPromises()

    expect(pushSpy).toHaveBeenCalledWith('/admin/products')
  })

  it('toggles the loading state on the submit button while the request is in flight', async () => {
    let resolveLogin!: (value: { token: string }) => void
    const loginPromise = new Promise<{ token: string }>((resolve) => {
      resolveLogin = resolve
    })
    const authPort = makeAuthPort({ login: vi.fn().mockReturnValue(loginPromise) })
    const { wrapper } = await mountIntegration(LoginPage, {
      deps: { authPort },
      initialRoute: '/login',
    })

    await wrapper.find('#login-email').setValue('user@example.com')
    await wrapper.find('#login-password').setValue('secret123')
    await wrapper.find('form').trigger('submit.prevent')
    await flushPromises()

    const submitButton = wrapper.find('button[type="submit"]')
    expect(submitButton.text()).toBe('Connexion...')
    expect((submitButton.element as HTMLButtonElement).disabled).toBe(true)

    resolveLogin({ token: 'jwt-customer' })
    await flushPromises()

    expect(submitButton.text()).toBe('Se connecter')
    expect((submitButton.element as HTMLButtonElement).disabled).toBe(false)
  })

  it('surfaces a domain error from the API as a toast', async () => {
    const authPort = makeAuthPort({
      login: vi.fn().mockRejectedValue(new Error('Identifiants invalides')),
    })
    const { wrapper, router } = await mountIntegration(LoginPage, {
      deps: { authPort },
      initialRoute: '/login',
    })
    const pushSpy = vi.spyOn(router, 'push')

    await wrapper.find('#login-email').setValue('user@example.com')
    await wrapper.find('#login-password').setValue('wrong-password')
    await wrapper.find('form').trigger('submit.prevent')
    await flushPromises()

    expect(toast.error).toHaveBeenCalledWith('Identifiants invalides')
    expect(toast.success).not.toHaveBeenCalled()
    expect(pushSpy).not.toHaveBeenCalled()
    expect(localStorage.getItem('token')).toBeNull()
  })

  it('rejects an empty form without calling the API', async () => {
    const authPort = makeAuthPort()
    const { wrapper } = await mountIntegration(LoginPage, {
      deps: { authPort },
      initialRoute: '/login',
    })

    await wrapper.find('form').trigger('submit.prevent')
    await flushPromises()

    expect(toast.error).toHaveBeenCalledWith('Veuillez remplir tous les champs')
    expect(authPort.login).not.toHaveBeenCalled()
  })
})

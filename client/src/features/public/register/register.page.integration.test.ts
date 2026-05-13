import { flushPromises } from '@vue/test-utils'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import type { IAuthPort } from '@/modules/auth/core/ports/auth.port'

import { mountIntegration } from '../../../__tests__/integration/mount-with-deps'
import RegisterPage from './register.page.vue'

const toast = vi.hoisted(() => ({ success: vi.fn(), error: vi.fn() }))
vi.mock('vue-sonner', () => ({ toast, Toaster: { template: '<div />' } }))

function makeAuthPort(overrides: Partial<IAuthPort> = {}): IAuthPort {
  return { register: vi.fn(), login: vi.fn(), ...overrides }
}

describe('RegisterPage — integration', () => {
  beforeEach(() => {
    localStorage.clear()
    toast.success.mockReset()
    toast.error.mockReset()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('submits the form, shows loading, stores the token, and navigates to /', async () => {
    let resolveRegister!: (value: { token: string }) => void
    const registerPromise = new Promise<{ token: string }>((resolve) => {
      resolveRegister = resolve
    })
    const authPort = makeAuthPort({ register: vi.fn().mockReturnValue(registerPromise) })
    const { wrapper, router } = await mountIntegration(RegisterPage, {
      deps: { authPort },
      initialRoute: '/register',
    })
    const pushSpy = vi.spyOn(router, 'push')

    await wrapper.find('#register-firstName').setValue('Alice')
    await wrapper.find('#register-lastName').setValue('Martin')
    await wrapper.find('#register-email').setValue('alice@example.com')
    await wrapper.find('#register-password').setValue('secret123')
    await wrapper.find('form').trigger('submit.prevent')
    await flushPromises()

    expect(authPort.register).toHaveBeenCalledWith({
      email: 'alice@example.com',
      password: 'secret123',
      firstName: 'Alice',
      lastName: 'Martin',
    })
    const submitButton = wrapper.find('button[type="submit"]')
    expect(submitButton.text()).toBe('Creation...')
    expect((submitButton.element as HTMLButtonElement).disabled).toBe(true)

    resolveRegister({ token: 'jwt-abc' })
    await flushPromises()

    expect(localStorage.getItem('token')).toBe('jwt-abc')
    expect(toast.success).toHaveBeenCalledWith('Compte cree avec succes !')
    expect(pushSpy).toHaveBeenCalledWith('/')
  })

  it('shows an error toast when the API rejects and does not navigate', async () => {
    const authPort = makeAuthPort({
      register: vi.fn().mockRejectedValue(new Error('Email deja utilise')),
    })
    const { wrapper, router } = await mountIntegration(RegisterPage, {
      deps: { authPort },
      initialRoute: '/register',
    })
    const pushSpy = vi.spyOn(router, 'push')

    await wrapper.find('#register-firstName').setValue('Alice')
    await wrapper.find('#register-lastName').setValue('Martin')
    await wrapper.find('#register-email').setValue('taken@example.com')
    await wrapper.find('#register-password').setValue('secret123')
    await wrapper.find('form').trigger('submit.prevent')
    await flushPromises()

    expect(toast.error).toHaveBeenCalledWith('Email deja utilise')
    expect(toast.success).not.toHaveBeenCalled()
    expect(pushSpy).not.toHaveBeenCalled()
    expect(localStorage.getItem('token')).toBeNull()
    expect(wrapper.find('button[type="submit"]').text()).toBe('Creer mon compte')
  })

  it('shows a validation toast and does not call the API when fields are empty', async () => {
    const authPort = makeAuthPort()
    const { wrapper } = await mountIntegration(RegisterPage, {
      deps: { authPort },
      initialRoute: '/register',
    })

    await wrapper.find('form').trigger('submit.prevent')
    await flushPromises()

    expect(toast.error).toHaveBeenCalledWith('Veuillez remplir tous les champs')
    expect(authPort.register).not.toHaveBeenCalled()
  })
})

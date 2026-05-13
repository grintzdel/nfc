import { writeFileSync, mkdirSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

import { test as setup } from '@playwright/test'

import { signInAdmin, signUpUser } from './fixtures/seed'

const here = dirname(fileURLToPath(import.meta.url))
const authDir = resolve(here, '.auth')

function writeStorageState(file: string, token: string): void {
  mkdirSync(authDir, { recursive: true })
  writeFileSync(
    resolve(authDir, file),
    JSON.stringify({
      cookies: [],
      origins: [{ origin: 'http://localhost:5173', localStorage: [{ name: 'token', value: token }] }],
    })
  )
}

setup('seed baseline user + save auth state', async () => {
  if (process.env.E2E_SKIP_AUTH_SEED === '1') return
  const { token } = await signUpUser({
    firstName: 'E2E',
    lastName: 'User',
    email: 'e2e-baseline@pulse.test',
    password: 'Pulse2026Test!',
  })
  writeStorageState('user.json', token)
})

setup('sign in admin + save auth state', async () => {
  if (process.env.E2E_SKIP_AUTH_SEED === '1') return
  const { token } = await signInAdmin()
  writeStorageState('admin.json', token)
})

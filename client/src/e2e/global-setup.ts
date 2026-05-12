import { test as setup } from '@playwright/test'
import { writeFileSync, mkdirSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { signUpUser } from './fixtures/seed'

const here = dirname(fileURLToPath(import.meta.url))

setup('seed baseline user + save auth state', async () => {
  if (process.env.E2E_SKIP_AUTH_SEED === '1') return
  const { token } = await signUpUser({
    firstName: 'E2E',
    lastName: 'User',
    email: 'e2e-baseline@pulse.test',
    password: 'Pulse2026Test!',
  })
  const authDir = resolve(here, '.auth')
  mkdirSync(authDir, { recursive: true })
  writeFileSync(
    resolve(authDir, 'user.json'),
    JSON.stringify({
      cookies: [],
      origins: [{ origin: 'http://localhost:5173', localStorage: [{ name: 'token', value: token }] }],
    }),
  )
})

import { defineConfig, devices } from '@playwright/test'

const protocol = process.env.VITE_DISABLE_HTTPS === '1' ? 'http' : 'https'
const baseURL = `${protocol}://localhost:5173`

export default defineConfig({
  testDir: './src',
  testMatch: '**/*.test.e2e.ts',
  timeout: 30_000,
  fullyParallel: false,
  retries: process.env.CI ? 2 : 0,
  workers: 1,
  reporter: 'list',
  use: { baseURL, locale: 'fr-FR', timezoneId: 'Europe/Paris', trace: 'on-first-retry', ignoreHTTPSErrors: true },
  projects: [
    { name: 'setup', testMatch: 'src/e2e/global-setup.ts' },
    { name: 'smoke', testMatch: 'src/e2e/smoke/**/*.test.e2e.ts', use: { ...devices['Desktop Chrome'] } },
    {
      name: 'authenticated',
      testMatch: 'src/**/*.test.e2e.ts',
      testIgnore: ['src/e2e/smoke/**', 'src/features/admin/**'],
      use: { ...devices['Desktop Chrome'], storageState: 'src/e2e/.auth/user.json' },
      dependencies: ['setup'],
    },
    {
      name: 'admin',
      testMatch: 'src/features/admin/**/*.test.e2e.ts',
      use: { ...devices['Desktop Chrome'], storageState: 'src/e2e/.auth/admin.json' },
      dependencies: ['setup'],
    },
  ],
  webServer: {
    command: 'cd .. && pnpm dev',
    url: baseURL,
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
    ignoreHTTPSErrors: true,
  },
})

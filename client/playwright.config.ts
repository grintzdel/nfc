import { defineConfig, devices } from '@playwright/test'

export default defineConfig({
  testDir: './src',
  testMatch: '**/*.test.e2e.ts',
  timeout: 30_000,
  fullyParallel: false,
  retries: process.env.CI ? 2 : 0,
  workers: 1,
  reporter: 'list',
  use: { baseURL: 'http://localhost:5173', locale: 'fr-FR', timezoneId: 'Europe/Paris', trace: 'on-first-retry' },
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
    url: 'http://localhost:5173',
    reuseExistingServer: !process.env.CI,
    timeout: 60_000,
  },
})

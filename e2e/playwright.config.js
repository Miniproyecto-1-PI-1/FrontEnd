import { defineConfig, devices } from '@playwright/test'

export const BASE_URL = process.env.E2E_BASE_URL ?? 'https://mini-proyecto-1-pi-1.inmemorialake.dev'
export const API_URL = process.env.E2E_API_URL ?? 'https://backend-h0fc.onrender.com'

// Los archivos se llaman *.e2e.js para que Vitest (que toma *.test.js y *.spec.js) no los ejecute.
export default defineConfig({
  testDir: '.',
  testMatch: '*.e2e.js',
  // Render gratis puede tardar ~1 min en despertar: los tiempos son holgados a propósito.
  timeout: 180_000,
  expect: { timeout: 30_000 },
  // Todas las pruebas de un archivo comparten un usuario temporal, así que van en serie.
  workers: 1,
  fullyParallel: false,
  retries: process.env.CI ? 1 : 0,
  reporter: [['list'], ['html', { outputFolder: 'playwright-report', open: 'never' }]],
  outputDir: 'test-results',
  use: {
    ...devices['Desktop Chrome'],
    baseURL: BASE_URL,
    viewport: { width: 1280, height: 800 },
    // La app calcula "hoy" con la hora del navegador y el backend con la de Colombia.
    timezoneId: 'America/Bogota',
    locale: 'es-CO',
    navigationTimeout: 90_000,
    actionTimeout: 30_000,
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
  },
})

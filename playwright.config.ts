import { defineConfig, devices } from '@playwright/test';

const port = process.env.STATIC_EXPORT ? 4173 : 3000;
const baseURL = `http://127.0.0.1:${port}`;

export default defineConfig({
  testDir: './tests',
  testIgnore: '**/export.test.mjs',
  webServer: {
    command: process.env.STATIC_EXPORT ? `python3 -m http.server ${port} --bind 127.0.0.1 --directory out` : 'npm run dev',
    url: baseURL,
    reuseExistingServer: !process.env.CI && !process.env.STATIC_EXPORT,
    timeout: 120_000,
  },
  use: {
    baseURL,
    trace: 'on-first-retry',
  },
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
    { name: 'mobile-chrome', use: { ...devices['Pixel 5'] } },
  ],
});

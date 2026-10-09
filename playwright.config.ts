import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  timeout: 180000,
  use: {
    baseURL: 'http://localhost:5175',
    channel: 'chrome',
    headless: true,
  },
});

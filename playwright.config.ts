// PURPOSE: Central Playwright configuration.
// WHY: Controls how all tests run — browsers, timeouts, retries,
// reporters, and parallel execution. Single place to change
// behavior across the entire framework for any client.

import { defineConfig, devices } from '@playwright/test';
import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config();

const ENV_NAME = process.env.ENV_NAME || 'staging';
const HEADLESS = process.env.HEADLESS !== 'false';
const BASE_URL = process.env.BASE_URL || 'http://localhost:3000';
const TIMEOUT = parseInt(process.env.TIMEOUT || '30000');

export default defineConfig({
  // Test directory
  testDir: './tests',

  // Run tests in files in parallel
  fullyParallel: true,

  // Fail the build on CI if test.only is accidentally left in
  forbidOnly: !!process.env.CI,

  // Retry on CI only
  retries: process.env.CI ? 2 : 0,

  // Limit parallel workers on CI
  workers: process.env.CI ? 2 : undefined,

  // Reporters
  reporter: [
    ['list'],
    ['html', { outputFolder: 'playwright-report', open: 'never' }],
    ['allure-playwright', { outputFolder: 'allure-results' }],
    ...(process.env.CI ? [['github'] as ['github']] : []),
  ],

  // Global test settings
  use: {
    baseURL: BASE_URL,
    headless: HEADLESS,
    actionTimeout: TIMEOUT,
    navigationTimeout: TIMEOUT,
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'on-first-retry',
  },

  // Test projects — UI, API, Hybrid
  projects: [
    // API tests — no browser needed
    {
      name: 'api',
      testDir: './tests/api',
      use: {
        ...devices['Desktop Chrome'],
      },
    },

    // UI tests — full browser
    {
      name: 'ui',
      testDir: './tests/ui',
      use: {
        ...devices['Desktop Chrome'],
        baseURL: BASE_URL,
      },
    },

    // Hybrid tests — browser + API in same test
    {
      name: 'hybrid',
      testDir: './tests/hybrid',
      use: {
        ...devices['Desktop Chrome'],
        baseURL: BASE_URL,
      },
    },

    // Mobile — optional, enable per client
    // {
    //   name: 'mobile',
    //   testDir: './tests/ui',
    //   use: { ...devices['iPhone 14'] },
    // },
  ],

  // Output directories
  outputDir: 'test-results',
});
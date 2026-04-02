import { test, expect } from '@playwright/test';

test('test', async ({ page }) => {
  await page.goto('https://practicesoftwaretesting.com/');
  await page.locator('[data-test="nav-sign-in"]').click();
  await page.locator('[data-test="email"]').click();
  await page.locator('[data-test="email"]').fill('admin@practicesoftwaretesting.com');
  await page.locator('[data-test="password"]').click();
  await page.locator('[data-test="password"]').fill('welcome01');
  await page.locator('[data-test="login-submit"]').click();
  await page.locator('[data-test="nav-menu"]').click();
  await page.locator('[data-test="nav-menu"]').click();
});
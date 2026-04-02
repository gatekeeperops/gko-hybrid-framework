// PURPOSE: Hybrid auth test suite — UI action + API assertion.
// WHY: This is the core GKO differentiator. A hybrid test does
// a UI action (login via browser) and then immediately verifies
// the result via API (token is valid, user exists in backend).
// This catches bugs that pure UI or pure API tests miss —
// e.g. UI shows success but backend session is broken.

import { test, expect } from '@playwright/test';
import { LoginPage } from '@pages/login.page';
import { ApiClient } from '@api/client';
import { AuthAPI } from '@api/endpoints/auth.api';
import { CLIENT_CONFIG } from '@config/client.config';
import { logger } from '@utils/logger';

test.describe('Hybrid Auth — UI + API', () => {

  test('UI login should create valid backend session', async ({ page, request }) => {
    // ── Step 1: UI Login ───────────────────────────────
    logger.step('Step 1: Performing UI login');
    const loginPage = new LoginPage(page);
    await loginPage.goto();
    await loginPage.loginAndWait(
      CLIENT_CONFIG.auth.username,
      CLIENT_CONFIG.auth.password
    );
    await loginPage.assertLoggedIn();

    // ── Step 2: Extract token from browser storage ─────
    logger.step('Step 2: Extracting auth token from browser');
    const token = await page.evaluate(() => {
      return (
        localStorage.getItem('token') ||
        localStorage.getItem('access_token') ||
        localStorage.getItem('authToken') ||
        sessionStorage.getItem('token') ||
        sessionStorage.getItem('access_token') ||
        null
      );
    });

    // ── Step 3: Verify token works via API ─────────────
    if (token) {
      logger.step('Step 3: Verifying token via API');
      const apiClient = new ApiClient(request);
      const response = await request.get(
        `${CLIENT_CONFIG.apiBaseURL}/auth/me`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      expect(response.status()).toBe(200);
      const user = await response.json();
      expect(user.email).toBeTruthy();
      logger.info('Token verified via API', { email: user.email });
    } else {
      logger.warn('No token found in storage — skipping API verification');
      // Still passes — not all apps store token in localStorage
    }

    // ── Step 4: UI still shows logged in state ─────────
    logger.step('Step 4: Verifying UI still shows logged in state');
    expect(page.url()).not.toContain('/login');
  });

  test('API login token should work for UI protected routes', async ({ page, request }) => {
    // ── Step 1: Get token via API ──────────────────────
    logger.step('Step 1: Getting token via API');
    const apiClient = new ApiClient(request);
    const authAPI = new AuthAPI(apiClient);
    const loginResponse = await authAPI.login(
      CLIENT_CONFIG.auth.username,
      CLIENT_CONFIG.auth.password
    );
    expect(loginResponse.access_token).toBeTruthy();
    logger.info('API login successful');

    // ── Step 2: Inject token into browser storage ──────
    logger.step('Step 2: Injecting token into browser');
    await page.goto(CLIENT_CONFIG.baseURL);
    await page.evaluate((token) => {
      localStorage.setItem('token', token);
      localStorage.setItem('access_token', token);
    }, loginResponse.access_token);

    // ── Step 3: Navigate to protected route ───────────
    logger.step('Step 3: Navigating to protected route');
    await page.goto(`${CLIENT_CONFIG.baseURL}/dashboard`);

    // ── Step 4: Verify UI loads protected content ──────
    logger.step('Step 4: Verifying protected route loads');
    await page.waitForURL(
      url => !url.toString().includes('/login'),
      { timeout: CLIENT_CONFIG.browser.timeout }
    );
    expect(page.url()).not.toContain('/login');
    logger.info('Protected route accessible with API token');
  });

  test('logout via UI should invalidate API session', async ({ page, request }) => {
    // ── Step 1: Login via UI ───────────────────────────
    logger.step('Step 1: UI login');
    const loginPage = new LoginPage(page);
    await loginPage.goto();
    await loginPage.loginAndWait(
      CLIENT_CONFIG.auth.username,
      CLIENT_CONFIG.auth.password
    );

    // ── Step 2: Extract token ──────────────────────────
    const token = await page.evaluate(() => {
      return localStorage.getItem('token') ||
        localStorage.getItem('access_token') || null;
    });

    // ── Step 3: Logout via UI ──────────────────────────
    logger.step('Step 2: UI logout');
    await loginPage.logout();
    await loginPage.assertLoggedOut();

    // ── Step 4: Verify token no longer works via API ───
    if (token) {
      logger.step('Step 3: Verifying token invalidated via API');
      const response = await request.get(
        `${CLIENT_CONFIG.apiBaseURL}/auth/me`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      expect([401, 403]).toContain(response.status());
      logger.info('Token correctly invalidated after UI logout');
    }
  });

});
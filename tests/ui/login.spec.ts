// PURPOSE: UI login test suite for Toolshop.
// WHY: Validates the client's login page — successful login,
// invalid credentials error, empty field validation, and
// post-login state. These are the first UI tests to run when
// onboarding a new client.
//
// KEY DESIGN: Each test is fully independent.
// WHY: test.use({ storageState: { cookies: [], origins: [] } })
// clears any saved auth state so login tests always hit the
// actual login page — not a cached authenticated session.
// authenticatedPage fixture performs a fresh login per test —
// no shared state file, no stale session risk.

import { test, expect } from '@fixtures/auth.fixture';
import { LoginPage } from '@pages/login.page';
import { CLIENT_CONFIG } from '@config/client.config';

test.describe('UI Login', () => {

  // WHY: clear any saved auth state so unauthenticated tests
  // always start from a clean browser session
  test.use({ storageState: { cookies: [], origins: [] } });

  test('should login with valid credentials and redirect away from login', async ({ page }) => {
    const loginPage = new LoginPage(page);

    await loginPage.goto();
    await loginPage.loginAndWait(
      CLIENT_CONFIG.auth.username,
      CLIENT_CONFIG.auth.password
    );

    // WHY waitForURL not URL check: loginAndWait already waits for
    // redirect — this assert confirms final URL state
    expect(page.url()).not.toContain('/login');
  });

  test('should show error with invalid credentials', async ({ page }) => {
    const loginPage = new LoginPage(page);

    await loginPage.goto();
    await loginPage.login('invalid@email.com', 'wrongpassword');

    // WHY assertLoginError: waits for API response before checking
    // error element — avoids race between submit and DOM update
    await loginPage.assertLoginError();
  });

  test('should show error with empty credentials', async ({ page }) => {
    const loginPage = new LoginPage(page);

    await loginPage.goto();
    await loginPage.login('', '');

    // Toolshop either stays on login page or shows inline error
    // WHY flexible assertion: both are valid empty-field responses
    const url = page.url();
    const staysOnLogin = url.includes('/login');
    const hasError = await page
      .locator('[class*="error"], [class*="alert"], [role="alert"]')
      .isVisible()
      .catch(() => false);

    expect(staysOnLogin || hasError).toBe(true);
  });

  test('should redirect to login when accessing protected route unauthenticated', async ({ page }) => {
    await page.goto(`${CLIENT_CONFIG.baseURL}/account`);

    // WHY waitForURL: auto-wait for redirect to complete before asserting
    await page.waitForURL(
      url => url.toString().includes('/login'),
      { timeout: CLIENT_CONFIG.browser.timeout }
    );

    expect(page.url()).toContain('/login');
  });

  test('should persist login across page navigation', async ({ authenticatedPage }) => {
    // WHY authenticatedPage: fixture performs fresh login — no shared
    // state file, guaranteed clean authenticated session per test
    await authenticatedPage.goto(`${CLIENT_CONFIG.baseURL}/account`);

    // WHY waitForURL: confirm navigation completed before asserting
    await authenticatedPage.waitForURL(
      url => !url.toString().includes('/login'),
      { timeout: CLIENT_CONFIG.browser.timeout }
    );

    expect(authenticatedPage.url()).not.toContain('/login');
  });

  test('should logout successfully', async ({ authenticatedPage }) => {
    const loginPage = new LoginPage(authenticatedPage);

    await authenticatedPage.goto(`${CLIENT_CONFIG.baseURL}/account`);

    // WHY waitForURL before logout: confirm we are on account page
    // before interacting with nav — avoids acting on wrong page state
    await authenticatedPage.waitForURL(
      url => !url.toString().includes('/login'),
      { timeout: CLIENT_CONFIG.browser.timeout }
    );

    await loginPage.logout();
    await loginPage.assertLoggedOut();
  });

});
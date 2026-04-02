// PURPOSE: UI login test suite for Toolshop.
// WHY: Validates the client's login page — successful login,
// invalid credentials error, empty field validation, and
// post-login state. These are the first UI tests to run when
// onboarding a new client.

import { test, expect } from '@fixtures/auth.fixture';
import { LoginPage } from '@pages/login.page';
import { CLIENT_CONFIG } from '@config/client.config';

test.describe('UI Login', () => {

  // Clear saved auth state before this suite so each test
  // starts from a clean unauthenticated browser session.
  // WHY: auth.fixture reuses saved state — login tests need
  // to actually hit the login page, not skip straight to dashboard.
  test.use({ storageState: { cookies: [], origins: [] } });

  test('should login with valid credentials and redirect away from login', async ({ page }) => {
    const loginPage = new LoginPage(page);

    await loginPage.goto();
    await loginPage.loginAndWait(
      CLIENT_CONFIG.auth.username,
      CLIENT_CONFIG.auth.password
    );

    // After login, URL should not contain /login
    expect(page.url()).not.toContain('/login');
  });

  test('should show error with invalid credentials', async ({ page }) => {
    const loginPage = new LoginPage(page);

    await loginPage.goto();
    await loginPage.login('invalid@email.com', 'wrongpassword');

    // Error message should appear — selector handles multiple client patterns
    await loginPage.assertLoginError();
  });

  test('should show error with empty credentials', async ({ page }) => {
    const loginPage = new LoginPage(page);

    await loginPage.goto();
    await loginPage.login('', '');

    // Either stays on login page or shows error
    const url = page.url();
    const staysOnLogin = url.includes('/login');
    const hasError = await page.locator('[class*="error"], [class*="alert"], [role="alert"]').isVisible().catch(() => false);

    expect(staysOnLogin || hasError).toBe(true);
  });

  test('should redirect to login when accessing protected route unauthenticated', async ({ page }) => {
    // Navigate to a protected route without auth
    await page.goto(`${CLIENT_CONFIG.baseURL}/account`);

    // Should redirect to login
    await page.waitForURL(url => url.toString().includes('/login'), {
      timeout: CLIENT_CONFIG.browser.timeout,
    });
    expect(page.url()).toContain('/login');
  });

  test('should persist login across page navigation', async ({ authenticatedPage }) => {
    // authenticatedPage fixture handles login via saved auth state
    await authenticatedPage.goto(`${CLIENT_CONFIG.baseURL}/account`);

    // Should stay on account page, not redirect to login
    expect(authenticatedPage.url()).not.toContain('/login');
  });

  test('should logout successfully', async ({ authenticatedPage }) => {
    const loginPage = new LoginPage(authenticatedPage);

    // Navigate to a page that has a logout option
    await authenticatedPage.goto(`${CLIENT_CONFIG.baseURL}/account`);

    await loginPage.logout();

    // After logout should redirect to login
    await loginPage.assertLoggedOut();
  });

});
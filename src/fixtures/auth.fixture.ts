// PURPOSE: Playwright fixture that injects authenticated browser
// context into tests that need a logged-in user.
// WHY: Fixtures are Playwright's dependency injection system.
// Tests declare authenticatedPage as a parameter — Playwright
// handles setup and teardown automatically.
//
// KEY DESIGN: No shared auth state file on disk.
// WHY: A shared file persists stale/expired sessions across runs,
// causing silent auth failures in CI. Each context performs a
// fresh login instead — reliable, isolated, no cross-run pollution.

import { test as base, BrowserContext, Page } from '@playwright/test';
import { CLIENT_CONFIG } from '@config/client.config';
import { LoginPage } from '@pages/login.page';
import { logger } from '@utils/logger';

type AuthFixtures = {
  authenticatedPage: Page;
  authenticatedContext: BrowserContext;
};

export const test = base.extend<AuthFixtures>({
  authenticatedContext: async ({ browser }, use) => {
    // WHY fresh login every time: no shared state file means no
    // stale session risk. Login is fast (~1s API call + redirect).
    logger.step('Performing fresh login');
    const context = await browser.newContext();
    const page = await context.newPage();
    const loginPage = new LoginPage(page);

    await loginPage.goto();
    await loginPage.loginAndWait(
      CLIENT_CONFIG.auth.username,
      CLIENT_CONFIG.auth.password
    );

    await page.close();
    await use(context);
    await context.close();
  },

  authenticatedPage: async ({ authenticatedContext }, use) => {
    const page = await authenticatedContext.newPage();
    await use(page);
    await page.close();
  },
});

export { expect } from '@playwright/test';
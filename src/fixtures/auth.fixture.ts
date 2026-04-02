import { test as base, Browser, BrowserContext, Page } from '@playwright/test';
import { CLIENT_CONFIG } from '@config/client.config';
import { LoginPage } from '@pages/login.page';
import { logger } from '@utils/logger';
import * as path from 'path';
import * as fs from 'fs';

const AUTH_STATE_DIR = path.join(process.cwd(), '.auth');
const AUTH_STATE_FILE = path.join(AUTH_STATE_DIR, 'auth-state.json');

type AuthFixtures = {
  authenticatedPage: Page;
  authenticatedContext: BrowserContext;
};

export const test = base.extend<AuthFixtures>({
  authenticatedContext: async ({ browser }, use) => {
    // Reuse saved auth state if it exists
    if (fs.existsSync(AUTH_STATE_FILE)) {
      logger.info('Reusing saved auth state');
      const context = await browser.newContext({
        storageState: AUTH_STATE_FILE,
      });
      await use(context);
      await context.close();
      return;
    }

    // Fresh login via LoginPage — no raw selectors in fixtures
    logger.step('Performing fresh login');
    const context = await browser.newContext();
    const page = await context.newPage();
    const loginPage = new LoginPage(page);

    await loginPage.goto();
    await loginPage.loginAndWait(
      CLIENT_CONFIG.auth.username,
      CLIENT_CONFIG.auth.password
    );

    // Save auth state for reuse across tests
    if (!fs.existsSync(AUTH_STATE_DIR)) {
      fs.mkdirSync(AUTH_STATE_DIR, { recursive: true });
    }
    await context.storageState({ path: AUTH_STATE_FILE });
    logger.info('Auth state saved');

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
// PURPOSE: Login page object for UI authentication flows.
// WHY: Every client has a login page. This page object handles
// the login flow in a reusable way. Client-specific selectors
// are configurable — the flow logic stays the same across clients.

import { Page } from '@playwright/test';
import { BasePage } from './base.page';
import { CLIENT_CONFIG } from '@config/client.config';
import { logger } from '@utils/logger';

export class LoginPage extends BasePage {
  private selectors = {
    emailInput: '[data-test="email"], [name="email"], [name="username"], #email, #username, [type="email"]',
    passwordInput: '[data-test="password"], [name="password"], #password, [type="password"]',
    submitButton: '[data-test="login-submit"]',
    errorMessage: '[data-test="login-error"]',
    navMenu: '[data-test="nav-menu"]',
    signOut: '[data-test="nav-sign-out"]',
    signIn: '[data-test="nav-sign-in"]',
  };

  constructor(page: Page) {
    super(page);
  }

  async goto(): Promise<void> {
    await this.navigate('/');
    await this.click(
      this.page.locator('[data-test="nav-sign-in"]'),
      'nav sign-in'
    );
    await this.page.locator('[data-test="email"]').waitFor({
      state: 'visible',
      timeout: CLIENT_CONFIG.browser.timeout,
    });
  }

  async login(
    username: string = CLIENT_CONFIG.auth.username,
    password: string = CLIENT_CONFIG.auth.password
  ): Promise<void> {
    logger.step(`Logging in as: ${username}`);
    await this.fill(
      this.page.locator(this.selectors.emailInput).first(),
      username,
      'email/username'
    );
    await this.fill(
      this.page.locator(this.selectors.passwordInput).first(),
      password,
      'password'
    );
    await this.click(
      this.page.locator(this.selectors.submitButton).first(),
      'submit button'
    );
  }

  async loginAndWait(
    username: string = CLIENT_CONFIG.auth.username,
    password: string = CLIENT_CONFIG.auth.password
  ): Promise<void> {
    await this.login(username, password);
    // WHY nav-user-menu not waitForURL: Toolshop uses client-side
    // routing — URL does not change after login. The nav-user-menu
    // appearing is the reliable post-login DOM signal.
    await this.page.locator('[data-test="nav-user-menu"]').waitFor({
      state: 'visible',
      timeout: CLIENT_CONFIG.browser.timeout,
    });
    logger.info('Login successful');
  }

  async assertLoginError(message?: string): Promise<void> {
    await this.page.waitForResponse(
      response => response.url().includes('/users/login'),
      { timeout: 10000 }
    ).catch(() => {});

    const errorLocator = this.page.locator('[data-test="login-error"]');
    await this.assertVisible(errorLocator, 'error message');
    if (message) {
      await this.assertText(errorLocator, message);
    }
  }

  async logout(): Promise<void> {
    logger.step('Logging out');
    // Open nav dropdown
    await this.page.locator(this.selectors.navMenu).click();
    // WHY: wait for visibility before clicking — avoids force click
    // which bypasses Playwright actionability checks
    await this.page.locator(this.selectors.signOut).waitFor({
      state: 'visible',
      timeout: CLIENT_CONFIG.browser.timeout,
    });
    await this.page.locator(this.selectors.signOut).click();
    // Wait for sign-in nav to confirm logout completed
    await this.page.locator(this.selectors.signIn).waitFor({
      state: 'visible',
      timeout: CLIENT_CONFIG.browser.timeout,
    });
    logger.info('Logged out successfully');
  }

  async assertLoggedIn(): Promise<void> {
    await this.page.waitForURL(
      url => !url.toString().includes('/login'),
      { timeout: CLIENT_CONFIG.browser.timeout }
    );
    logger.info('Asserted: user is logged in');
  }

  async assertLoggedOut(): Promise<void> {
    await this.assertURL(/\/login/);
    logger.info('Asserted: user is logged out');
  }
}
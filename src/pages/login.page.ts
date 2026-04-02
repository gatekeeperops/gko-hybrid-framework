// PURPOSE: Login page object for UI authentication flows.
// WHY: Every client has a login page. This page object handles
// the login flow in a reusable way. Client-specific selectors
// are configurable — the flow logic stays the same across clients.

import { Page } from '@playwright/test';
import { BasePage } from './base.page';
import { CLIENT_CONFIG } from '@config/client.config';
import { logger } from '@utils/logger';

export class LoginPage extends BasePage {
  // Selectors — update per client if needed
  private selectors = {
    // data-test selectors take priority — most reliable, framework-agnostic
    // Fallbacks handle clients without data-test attributes
    emailInput: '[data-test="email"], [name="email"], [name="username"], #email, #username, [type="email"]',
    passwordInput: '[data-test="password"], [name="password"], #password, [type="password"]',
    submitButton: '[data-test="login-submit"]',
    errorMessage: '[data-test="login-error"]',
    logoutButton: '[data-test="nav-sign-out"], button:has-text("Logout"), button:has-text("Sign out"), [href*="logout"]',
  };

  constructor(page: Page) {
    super(page);
  }

  // ── Actions ────────────────────────────────────────────

  async goto(): Promise<void> {
    // Toolshop: navigate to homepage, click sign-in nav to reach login form
    await this.navigate('/');
    await this.click(
      this.page.locator('[data-test="nav-sign-in"]'),
      'nav sign-in'
    );
    // Wait for login form to be ready
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
    // WHY: Wait for either admin nav-menu or customer nav-user-menu
    await this.page.locator(
      '[data-test="nav-menu"], [data-test="nav-user-menu"]'
    ).first().waitFor({
      state: 'visible',
      timeout: CLIENT_CONFIG.browser.timeout,
    });
    logger.info('Login successful');
  }
  
  async assertLoginError(message?: string): Promise<void> {
    // WHY: Wait for network response before checking error — API call takes ~1s
    await this.page.waitForResponse(
      response => response.url().includes('/users/login'),
      { timeout: 10000 }
    ).catch(() => {}); // ignore if already completed
  
    const errorLocator = this.page.locator('[data-test="login-error"]');
    await this.assertVisible(errorLocator, 'error message');
    if (message) {
      await this.assertText(errorLocator, message);
    }
  }

  async logout(): Promise<void> {
    logger.step('Logging out');
    // WHY: nav-menu is a dropdown toggle — click it to expand, then click sign-out
    // Use force click to bypass visibility check on the dropdown item
    await this.page.locator('[data-test="nav-menu"]').click();
    await this.page.locator('[data-test="nav-sign-out"]').click({ force: true });
    await this.page.locator('[data-test="nav-sign-in"]').waitFor({
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
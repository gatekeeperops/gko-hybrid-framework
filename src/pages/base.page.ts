// PURPOSE: Base page object that all other page objects extend.
// WHY: Common browser actions (click, fill, wait, navigate) are
// defined once here with built-in logging and error handling.
// Client-specific page objects extend this and only define
// selectors and flows — no repeated boilerplate per client.

import { Page, Locator, expect } from '@playwright/test';
import { CLIENT_CONFIG } from '@config/client.config';
import { logger } from '@utils/logger';

export class BasePage {
  readonly page: Page;
  readonly baseURL: string;

  constructor(page: Page) {
    this.page = page;
    this.baseURL = CLIENT_CONFIG.baseURL;
  }

  // ── Navigation ─────────────────────────────────────────

  async navigate(path: string = '/'): Promise<void> {
    const url = `${this.baseURL}${path}`;
    logger.step(`Navigating to ${url}`);
    await this.page.goto(url, { waitUntil: 'networkidle' });
  }

  async waitForURL(urlPattern: string | RegExp): Promise<void> {
    await this.page.waitForURL(urlPattern, {
      timeout: CLIENT_CONFIG.browser.timeout,
    });
  }

  // ── Interactions ───────────────────────────────────────

  async click(locator: Locator, description?: string): Promise<void> {
    logger.step(`Clicking: ${description || locator.toString()}`);
    await locator.waitFor({ state: 'visible' });
    await locator.click();
  }

  async fill(locator: Locator, value: string, description?: string): Promise<void> {
    logger.step(`Filling: ${description || locator.toString()}`);
    await locator.waitFor({ state: 'visible' });
    await locator.clear();
    await locator.fill(value);
  }

  async selectOption(locator: Locator, value: string): Promise<void> {
    await locator.waitFor({ state: 'visible' });
    await locator.selectOption(value);
  }

  // ── Waits ──────────────────────────────────────────────

  async waitForElement(locator: Locator, state: 'visible' | 'hidden' | 'attached' = 'visible'): Promise<void> {
    await locator.waitFor({
      state,
      timeout: CLIENT_CONFIG.browser.timeout,
    });
  }

  async waitForResponse(urlPattern: string | RegExp): Promise<void> {
    await this.page.waitForResponse(urlPattern, {
      timeout: CLIENT_CONFIG.browser.timeout,
    });
  }

  // ── Assertions ─────────────────────────────────────────

  async assertVisible(locator: Locator, description?: string): Promise<void> {
    logger.step(`Asserting visible: ${description || locator.toString()}`);
    await expect(locator).toBeVisible({ timeout: CLIENT_CONFIG.browser.timeout });
  }

  async assertText(locator: Locator, text: string): Promise<void> {
    await expect(locator).toContainText(text, {
      timeout: CLIENT_CONFIG.browser.timeout,
    });
  }

  async assertURL(pattern: string | RegExp): Promise<void> {
    await expect(this.page).toHaveURL(pattern, {
      timeout: CLIENT_CONFIG.browser.timeout,
    });
  }

  // ── Utilities ──────────────────────────────────────────

  async screenshot(name: string): Promise<void> {
    await this.page.screenshot({
      path: `test-results/screenshots/${name}-${Date.now()}.png`,
      fullPage: true,
    });
  }

  async getTitle(): Promise<string> {
    return this.page.title();
  }

  getCurrentURL(): string {
    return this.page.url();
  }
}
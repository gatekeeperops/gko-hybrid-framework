/**
 * detect-selectors.ts
 * Navigates to the client login page and detects selectors automatically.
 * Outputs a selector config block ready to paste into client.config.ts.
 * Usage: npx tsx scripts/detect-selectors.ts
 */

import { chromium } from 'playwright';
import * as dotenv from 'dotenv';

dotenv.config();

const BASE_URL = process.env.BASE_URL || '';

interface SelectorResult {
  emailInput: string | null;
  passwordInput: string | null;
  submitButton: string | null;
  errorMessage: string | null;
  navSignIn: string | null;
}

async function detectSelectors(): Promise<SelectorResult> {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();

  console.log(`Navigating to: ${BASE_URL}`);
  await page.goto(BASE_URL, { waitUntil: 'networkidle' });

  const result: SelectorResult = {
    emailInput: null,
    passwordInput: null,
    submitButton: null,
    errorMessage: null,
    navSignIn: null,
  };

  // Detect nav sign-in link
  const navSignIn = await page.evaluate(() => {
    const candidates = [
      '[data-test="nav-sign-in"]',
      'a[href*="login"]',
      'a[href*="signin"]',
      'button:has-text("Sign in")',
      'a:has-text("Sign in")',
      'a:has-text("Login")',
    ];
    for (const sel of candidates) {
      try {
        if (document.querySelector(sel)) return sel;
      } catch {}
    }
    return null;
  });
  result.navSignIn = navSignIn;

  // Click nav sign-in if found to reveal login form
  if (navSignIn) {
    await page.locator(navSignIn).first().click().catch(() => {});
    await page.waitForTimeout(1500);
  }

  // Detect email input
  result.emailInput = await page.evaluate(() => {
    const candidates = [
      '[data-test="email"]',
      '[name="email"]',
      '[name="username"]',
      '#email',
      '#username',
      '[type="email"]',
      'input[placeholder*="email" i]',
    ];
    for (const sel of candidates) {
      if (document.querySelector(sel)) return sel;
    }
    return null;
  });

  // Detect password input
  result.passwordInput = await page.evaluate(() => {
    const candidates = [
      '[data-test="password"]',
      '[name="password"]',
      '#password',
      '[type="password"]',
    ];
    for (const sel of candidates) {
      if (document.querySelector(sel)) return sel;
    }
    return null;
  });

  // Detect submit button
  result.submitButton = await page.evaluate(() => {
    const candidates = [
      '[data-test="login-submit"]',
      'button[type="submit"]',
      'input[type="submit"]',
      'button:has-text("Login")',
      'button:has-text("Sign in")',
      'button:has-text("Log in")',
    ];
    for (const sel of candidates) {
      try {
        if (document.querySelector(sel)) return sel;
      } catch {}
    }
    return null;
  });

  // Detect error message container
  result.errorMessage = await page.evaluate(() => {
    const candidates = [
      '[data-test="login-error"]',
      '[data-test="error"]',
      '[class*="error"]',
      '[class*="alert"]',
      '[role="alert"]',
    ];
    for (const sel of candidates) {
      if (document.querySelector(sel)) return sel;
    }
    return null;
  });

  await browser.close();
  return result;
}

async function main(): Promise<void> {
  console.log('Detecting selectors...\n');
  const selectors = await detectSelectors();

  console.log('Detected selectors:');
  console.log(JSON.stringify(selectors, null, 2));

  console.log('\nPaste this into your client.config.ts selectors section:');
  console.log(`
selectors: {
  login: {
    navSignIn: '${selectors.navSignIn ?? ''}',
    emailInput: '${selectors.emailInput ?? ''}',
    passwordInput: '${selectors.passwordInput ?? ''}',
    submitButton: '${selectors.submitButton ?? ''}',
    errorMessage: '${selectors.errorMessage ?? ''}',
  },
},`);
}

main().catch(console.error);
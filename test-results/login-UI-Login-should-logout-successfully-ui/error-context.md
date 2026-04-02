# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: ui\login.spec.ts >> UI Login >> should logout successfully
- Location: tests\ui\login.spec.ts:75:7

# Error details

```
Test timeout of 30000ms exceeded.
```

```
Error: locator.click: Target page, context or browser has been closed
Call log:
  - waiting for locator('[data-test="nav-menu"]')

```

# Test source

```ts
  1   | // PURPOSE: Login page object for UI authentication flows.
  2   | // WHY: Every client has a login page. This page object handles
  3   | // the login flow in a reusable way. Client-specific selectors
  4   | // are configurable — the flow logic stays the same across clients.
  5   | 
  6   | import { Page } from '@playwright/test';
  7   | import { BasePage } from './base.page';
  8   | import { CLIENT_CONFIG } from '@config/client.config';
  9   | import { logger } from '@utils/logger';
  10  | 
  11  | export class LoginPage extends BasePage {
  12  |   // Selectors — update per client if needed
  13  |   private selectors = {
  14  |     // data-test selectors take priority — most reliable, framework-agnostic
  15  |     // Fallbacks handle clients without data-test attributes
  16  |     emailInput: '[data-test="email"], [name="email"], [name="username"], #email, #username, [type="email"]',
  17  |     passwordInput: '[data-test="password"], [name="password"], #password, [type="password"]',
  18  |     submitButton: '[data-test="login-submit"]',
  19  |     errorMessage: '[data-test="login-error"]',
  20  |     logoutButton: '[data-test="nav-sign-out"], button:has-text("Logout"), button:has-text("Sign out"), [href*="logout"]',
  21  |   };
  22  | 
  23  |   constructor(page: Page) {
  24  |     super(page);
  25  |   }
  26  | 
  27  |   // ── Actions ────────────────────────────────────────────
  28  | 
  29  |   async goto(): Promise<void> {
  30  |     // Toolshop: navigate to homepage, click sign-in nav to reach login form
  31  |     await this.navigate('/');
  32  |     await this.click(
  33  |       this.page.locator('[data-test="nav-sign-in"]'),
  34  |       'nav sign-in'
  35  |     );
  36  |     // Wait for login form to be ready
  37  |     await this.page.locator('[data-test="email"]').waitFor({
  38  |       state: 'visible',
  39  |       timeout: CLIENT_CONFIG.browser.timeout,
  40  |     });
  41  |   }
  42  | 
  43  |   async login(
  44  |     username: string = CLIENT_CONFIG.auth.username,
  45  |     password: string = CLIENT_CONFIG.auth.password
  46  |   ): Promise<void> {
  47  |     logger.step(`Logging in as: ${username}`);
  48  |     await this.fill(
  49  |       this.page.locator(this.selectors.emailInput).first(),
  50  |       username,
  51  |       'email/username'
  52  |     );
  53  |     await this.fill(
  54  |       this.page.locator(this.selectors.passwordInput).first(),
  55  |       password,
  56  |       'password'
  57  |     );
  58  |     await this.click(
  59  |       this.page.locator(this.selectors.submitButton).first(),
  60  |       'submit button'
  61  |     );
  62  |   }
  63  | 
  64  |   async loginAndWait(
  65  |     username: string = CLIENT_CONFIG.auth.username,
  66  |     password: string = CLIENT_CONFIG.auth.password
  67  |   ): Promise<void> {
  68  |     await this.login(username, password);
  69  |     // WHY: Wait for either admin nav-menu or customer nav-user-menu
  70  |     await this.page.locator(
  71  |       '[data-test="nav-menu"], [data-test="nav-user-menu"]'
  72  |     ).first().waitFor({
  73  |       state: 'visible',
  74  |       timeout: CLIENT_CONFIG.browser.timeout,
  75  |     });
  76  |     logger.info('Login successful');
  77  |   }
  78  |   
  79  |   async assertLoginError(message?: string): Promise<void> {
  80  |     // WHY: Wait for network response before checking error — API call takes ~1s
  81  |     await this.page.waitForResponse(
  82  |       response => response.url().includes('/users/login'),
  83  |       { timeout: 10000 }
  84  |     ).catch(() => {}); // ignore if already completed
  85  |   
  86  |     const errorLocator = this.page.locator('[data-test="login-error"]');
  87  |     await this.assertVisible(errorLocator, 'error message');
  88  |     if (message) {
  89  |       await this.assertText(errorLocator, message);
  90  |     }
  91  |   }
  92  | 
  93  |   async logout(): Promise<void> {
  94  |     logger.step('Logging out');
  95  |     // WHY: nav-menu is a dropdown toggle — click it to expand, then click sign-out
  96  |     // Use force click to bypass visibility check on the dropdown item
> 97  |     await this.page.locator('[data-test="nav-menu"]').click();
      |                                                       ^ Error: locator.click: Target page, context or browser has been closed
  98  |     await this.page.locator('[data-test="nav-sign-out"]').click({ force: true });
  99  |     await this.page.locator('[data-test="nav-sign-in"]').waitFor({
  100 |       state: 'visible',
  101 |       timeout: CLIENT_CONFIG.browser.timeout,
  102 |     });
  103 |     logger.info('Logged out successfully');
  104 |   }
  105 | 
  106 | 
  107 |   async assertLoggedIn(): Promise<void> {
  108 |     await this.page.waitForURL(
  109 |       url => !url.toString().includes('/login'),
  110 |       { timeout: CLIENT_CONFIG.browser.timeout }
  111 |     );
  112 |     logger.info('Asserted: user is logged in');
  113 |   }
  114 | 
  115 |   async assertLoggedOut(): Promise<void> {
  116 |     await this.assertURL(/\/login/);
  117 |     logger.info('Asserted: user is logged out');
  118 |   }
  119 | }
```
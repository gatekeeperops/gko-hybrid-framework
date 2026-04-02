// PURPOSE: Playwright fixture that injects ApiClient into every test.
// WHY: Fixtures are Playwright's dependency injection system. Instead
// of creating a new ApiClient in every test file, we define it once
// here. Every test that needs API access just declares it as a
// parameter — Playwright handles setup and teardown automatically.
//
// KEY FIX: authenticatedApiClient now performs a real login to get
// a valid token instead of relying on a static API_TOKEN env var.
// This works for any client that uses bearer token auth via login endpoint.

import { test as base, request } from '@playwright/test';
import { ApiClient } from '@api/client';
import { CLIENT_CONFIG } from '@config/client.config';
import { logger } from '@utils/logger';

type ApiFixtures = {
  apiClient: ApiClient;
  authenticatedApiClient: ApiClient;
};

export const test = base.extend<ApiFixtures>({
  // Unauthenticated API client — for login, public endpoints, 401 tests
  apiClient: async ({}, use) => {
    const context = await request.newContext({
      baseURL: CLIENT_CONFIG.apiBaseURL,
      timeout: CLIENT_CONFIG.browser.timeout,
    });
    const client = new ApiClient(context);
    logger.info('API client initialized');
    await use(client);
    await context.dispose();
  },

  // Pre-authenticated API client — performs real login to get token.
  // WHY real login: static API_TOKEN in .env may be empty or expired.
  // Login-first approach works for any client regardless of token lifetime.
  authenticatedApiClient: async ({}, use) => {
    // Step 1: create unauthenticated context to perform login
    const loginContext = await request.newContext({
      baseURL: CLIENT_CONFIG.apiBaseURL,
      timeout: CLIENT_CONFIG.browser.timeout,
    });
    const loginClient = new ApiClient(loginContext);

    // Step 2: login and extract token from response
    let token: string;

    if (CLIENT_CONFIG.auth.type === 'bearer') {
      // Perform real login — get fresh token every test run
      const loginResponse = await loginClient.post(
        CLIENT_CONFIG.endpoints.login,
        {
          email: CLIENT_CONFIG.auth.username,
          password: CLIENT_CONFIG.auth.password,
        }
      );
      const body = await loginResponse.json();
      // Token key from config — different clients use different key names
      token = body[CLIENT_CONFIG.endpoints.tokenStorageKey];

      if (!token) {
        throw new Error(
          `Login failed — no token in response. ` +
          `Check endpoints.tokenStorageKey in client.config.ts. ` +
          `Response: ${JSON.stringify(body)}`
        );
      }
    } else {
      // Basic auth — token is base64 encoded credentials
      token = Buffer.from(
        `${CLIENT_CONFIG.auth.username}:${CLIENT_CONFIG.auth.password}`
      ).toString('base64');
    }

    await loginContext.dispose();

    // Step 3: create authenticated context with real token
    const authContext = await request.newContext({
      baseURL: CLIENT_CONFIG.apiBaseURL,
      timeout: CLIENT_CONFIG.browser.timeout,
      extraHTTPHeaders: {
        Authorization:
          CLIENT_CONFIG.auth.type === 'bearer'
            ? `Bearer ${token}`
            : `Basic ${token}`,
      },
    });

    const client = new ApiClient(authContext);
    logger.info('Authenticated API client initialized');
    await use(client);
    await authContext.dispose();
  },
});

export { expect } from '@playwright/test';
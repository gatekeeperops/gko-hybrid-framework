// PURPOSE: API authentication test suite.
// WHY: Validates the client's auth API endpoints — login success,
// invalid credentials, token structure, and current user endpoint.
// These are the first tests to run when onboarding a new client —
// if auth works, everything else can be tested.

import { test, expect } from '@fixtures/api.fixture';
import { AuthAPI } from '@api/endpoints/auth.api';
import { CLIENT_CONFIG } from '@config/client.config';

test.describe('Auth API', () => {

  test.describe('POST /auth/login', () => {

    test('should login with valid credentials and return token', async ({ apiClient }) => {
      const authAPI = new AuthAPI(apiClient);

      const response = await authAPI.login(
        CLIENT_CONFIG.auth.username,
        CLIENT_CONFIG.auth.password
      );

      expect(response.access_token).toBeTruthy();
      expect(typeof response.access_token).toBe('string');
      expect(response.access_token.length).toBeGreaterThan(10);
    });

    test('should return 401 with invalid credentials', async ({ apiClient }) => {
      const authAPI = new AuthAPI(apiClient);

      const response = await authAPI.loginWithInvalidCredentials(
        'invalid@email.com',
        'wrongpassword'
      );

      expect(response.status()).toBe(401);
    });

    test('should return 400 with missing credentials', async ({ apiClient }) => {
      const authAPI = new AuthAPI(apiClient);

      const response = await authAPI.loginWithInvalidCredentials('', '');

      // Toolshop returns 422 for missing fields — kept flexible for other clients
      expect([400, 401, 422]).toContain(response.status());
    });

  });

  test.describe('GET /auth/me', () => {

    test('should return current user details', async ({ authenticatedApiClient }) => {
      const authAPI = new AuthAPI(authenticatedApiClient);

      const user = await authAPI.getCurrentUser();

      expect(user.id).toBeTruthy();
      expect(user.email).toContain('@');
      // Toolshop returns first_name + last_name — check at least one name field exists
      const hasName = user.first_name || user.last_name || user.name;
      expect(hasName).toBeTruthy();
    });

    test('should return 401 without auth token', async ({ apiClient }) => {
      // Use config endpoint — never hardcode paths in tests
      const response = await apiClient.get(CLIENT_CONFIG.endpoints.me);
      expect(response.status()).toBe(401);
    });

  });

});
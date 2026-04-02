# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: api\auth.spec.ts >> Auth API >> POST /auth/login >> should return 400 with missing credentials
- Location: tests\api\auth.spec.ts:39:9

# Error details

```
Error: expect(received).toContain(expected) // indexOf

Expected value: 404
Received array: [400, 401, 422]
```

# Test source

```ts
  1  | // PURPOSE: API authentication test suite.
  2  | // WHY: Validates the client's auth API endpoints — login success,
  3  | // invalid credentials, token structure, and current user endpoint.
  4  | // These are the first tests to run when onboarding a new client —
  5  | // if auth works, everything else can be tested.
  6  | 
  7  | import { test, expect } from '@fixtures/api.fixture';
  8  | import { AuthAPI } from '@api/endpoints/auth.api';
  9  | import { CLIENT_CONFIG } from '@config/client.config';
  10 | 
  11 | test.describe('Auth API', () => {
  12 | 
  13 |   test.describe('POST /auth/login', () => {
  14 | 
  15 |     test('should login with valid credentials and return token', async ({ apiClient }) => {
  16 |       const authAPI = new AuthAPI(apiClient);
  17 | 
  18 |       const response = await authAPI.login(
  19 |         CLIENT_CONFIG.auth.username,
  20 |         CLIENT_CONFIG.auth.password
  21 |       );
  22 | 
  23 |       expect(response.access_token).toBeTruthy();
  24 |       expect(typeof response.access_token).toBe('string');
  25 |       expect(response.access_token.length).toBeGreaterThan(10);
  26 |     });
  27 | 
  28 |     test('should return 401 with invalid credentials', async ({ apiClient }) => {
  29 |       const authAPI = new AuthAPI(apiClient);
  30 | 
  31 |       const response = await authAPI.loginWithInvalidCredentials(
  32 |         'invalid@email.com',
  33 |         'wrongpassword'
  34 |       );
  35 | 
  36 |       expect(response.status()).toBe(401);
  37 |     });
  38 | 
  39 |     test('should return 400 with missing credentials', async ({ apiClient }) => {
  40 |       const authAPI = new AuthAPI(apiClient);
  41 | 
  42 |       const response = await authAPI.loginWithInvalidCredentials('', '');
  43 | 
> 44 |       expect([400, 401, 422]).toContain(response.status());
     |                               ^ Error: expect(received).toContain(expected) // indexOf
  45 |     });
  46 | 
  47 |   });
  48 | 
  49 |   test.describe('GET /auth/me', () => {
  50 | 
  51 |     test('should return current user details', async ({ authenticatedApiClient }) => {
  52 |       const authAPI = new AuthAPI(authenticatedApiClient);
  53 | 
  54 |       const user = await authAPI.getCurrentUser();
  55 | 
  56 |       expect(user.id).toBeTruthy();
  57 |       expect(user.email).toContain('@');
  58 |     });
  59 | 
  60 |     test('should return 401 without auth token', async ({ apiClient }) => {
  61 |       const response = await apiClient.get('/auth/me');
  62 |       expect(response.status()).toBe(401);
  63 |     });
  64 | 
  65 |   });
  66 | 
  67 | });
```
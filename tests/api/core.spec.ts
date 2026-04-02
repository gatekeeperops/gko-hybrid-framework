// PURPOSE: Core resource CRUD API test suite.
// WHY: Validates the client's primary business resource endpoints
// — list, paginate, create, read, update, delete.
// Tests run sequentially via test.describe.serial to share
// createdResourceId across create/get/update/delete tests.
// Replace product-specific payload fields per client engagement.

import { test, expect } from '@fixtures/api.fixture';
import { CoreAPI } from '@api/endpoints/core.api';
import { CLIENT_CONFIG } from '@config/client.config';

// WHY serial: createdResourceId must be set by create test before
// get/update/delete tests run. Parallel execution breaks this dependency.
test.describe.serial('Core Resource API', () => {

  let createdResourceId: string;
  // Live reference IDs fetched from Toolshop at runtime
  // WHY: Toolshop reseeds on restart — hardcoded ULIDs become stale
  let liveCategoryId: string;
  let liveBrandId: string;
  let liveImageId: string;

  test.describe('GET /api/v1/resources', () => {

    test('should return list of resources', async ({ authenticatedApiClient }) => {
      const coreAPI = new CoreAPI(authenticatedApiClient);
      const result = await coreAPI.getAll();

      expect(result.data).toBeDefined();
      expect(Array.isArray(result.data)).toBe(true);
      expect(result.data.length).toBeGreaterThan(0);

      // Extract live reference IDs from first product for use in create test
      // WHY: Toolshop reseeds periodically — cannot hardcode ULIDs
      const first = result.data[0];
      liveCategoryId = first.category?.id as string;
      liveBrandId = first.brand?.id as string;
      liveImageId = first.product_image?.id as string;

      expect(liveCategoryId).toBeTruthy();
      expect(liveBrandId).toBeTruthy();
      expect(liveImageId).toBeTruthy();
    });

    test('should support pagination params', async ({ authenticatedApiClient }) => {
      const coreAPI = new CoreAPI(authenticatedApiClient);
      const result = await coreAPI.getAll({ page: '1', per_page: '5' });

      expect(result.data).toBeDefined();
      // WHY: Toolshop ignores per_page and always returns its default page size
      // Test confirms pagination params are accepted without error
      expect(Array.isArray(result.data)).toBe(true);
      expect(result.current_page).toBe(1);
    });

    test('should return 200 without auth - products endpoint is public', async ({ apiClient }) => {
      // WHY 200 not 401: Toolshop /products is a public endpoint
      // Auth is only required for write operations (POST/PUT/DELETE)
      const response = await apiClient.get(CLIENT_CONFIG.endpoints.resource);
      expect(response.status()).toBe(200);
    });

  });

  test.describe('POST /api/v1/resources', () => {

    test('should create a new resource', async ({ authenticatedApiClient }) => {
      const coreAPI = new CoreAPI(authenticatedApiClient);

      // WHY: liveCategoryId etc set by GET list test above (serial execution)
      expect(liveCategoryId).toBeTruthy();

      const payload = {
        name: `GKO Test Product ${Date.now()}`,
        description: 'GKO automated test product — safe to delete',
        price: 9.99,
        category_id: liveCategoryId,
        brand_id: liveBrandId,
        product_image_id: liveImageId,
        is_location_offer: false,
        is_rental: false,
      };

      const created = await coreAPI.create(payload);
      expect(created.id).toBeTruthy();
      expect(created.name).toBe(payload.name);

      // Store for get/update/delete tests
      createdResourceId = created.id as string;
    });

    test('should return 422 with invalid payload', async ({ authenticatedApiClient }) => {
      // WHY 422: Toolshop uses Laravel validation — returns 422 not 400
      const response = await authenticatedApiClient.post(
        CLIENT_CONFIG.endpoints.resource,
        {}
      );
      expect([400, 422]).toContain(response.status());
    });

  });

  test.describe('GET /api/v1/resources/:id', () => {

    test('should return resource by id', async ({ authenticatedApiClient }) => {
      const coreAPI = new CoreAPI(authenticatedApiClient);
      expect(createdResourceId).toBeTruthy();

      const resource = await coreAPI.getById(createdResourceId);
      expect(resource.id).toBe(createdResourceId);
      expect(resource.name).toContain('GKO Test Product');
    });

    test('should return 404 for non-existent resource', async ({ authenticatedApiClient }) => {
      const response = await authenticatedApiClient.get(
        `${CLIENT_CONFIG.endpoints.resource}/00000000000000000000000000`
      );
      expect(response.status()).toBe(404);
    });

  });

  test.describe('PUT /api/v1/resources/:id', () => {

    test('should update existing resource', async ({ authenticatedApiClient }) => {
      const coreAPI = new CoreAPI(authenticatedApiClient);
      expect(createdResourceId).toBeTruthy();

      await coreAPI.update(createdResourceId, {
        name: `GKO Updated Product ${Date.now()}`,
        description: 'GKO automated test product — updated',
        price: 19.99,
        category_id: liveCategoryId,
        brand_id: liveBrandId,
        product_image_id: liveImageId,
        is_location_offer: false,
        is_rental: false,
      });
    });

  });

  test.describe('DELETE /api/v1/resources/:id', () => {

    test('should delete existing resource', async ({ authenticatedApiClient }) => {
      const coreAPI = new CoreAPI(authenticatedApiClient);
      expect(createdResourceId).toBeTruthy();
      await coreAPI.delete(createdResourceId);
    });

  });

  test.describe('GET /health', () => {

    test('should return healthy status', async ({ authenticatedApiClient }) => {
      const coreAPI = new CoreAPI(authenticatedApiClient);
      await coreAPI.healthCheck();
    });

  });

});
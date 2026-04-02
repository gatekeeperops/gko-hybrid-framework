# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: api\core.spec.ts >> Core Resource API >> POST /api/v1/resources >> should return 400 with invalid payload
- Location: tests\api\core.spec.ts:60:9

# Error details

```
Error: expect(received).toContain(expected) // indexOf

Expected value: 404
Received array: [400, 422]
```

# Test source

```ts
  1   | // PURPOSE: Core resource CRUD API test suite.
  2   | // WHY: Validates the client's primary business resource endpoints
  3   | // — create, read, update, delete. This suite is the template for
  4   | // every client's core API testing. Replace 'resource' with the
  5   | // client's actual entity (transaction, policy, order, loan etc).
  6   | 
  7   | import { test, expect } from '@fixtures/api.fixture';
  8   | import { CoreAPI } from '@api/endpoints/core.api';
  9   | 
  10  | test.describe('Core Resource API', () => {
  11  | 
  12  |   let createdResourceId: string | number;
  13  | 
  14  |   test.describe('GET /api/v1/resources', () => {
  15  | 
  16  |     test('should return list of resources', async ({ authenticatedApiClient }) => {
  17  |       const coreAPI = new CoreAPI(authenticatedApiClient);
  18  | 
  19  |       const result = await coreAPI.getAll();
  20  | 
  21  |       expect(result.data).toBeDefined();
  22  |       expect(Array.isArray(result.data)).toBe(true);
  23  |     });
  24  | 
  25  |     test('should support pagination params', async ({ authenticatedApiClient }) => {
  26  |       const coreAPI = new CoreAPI(authenticatedApiClient);
  27  | 
  28  |       const result = await coreAPI.getAll({ page: '1', per_page: '10' });
  29  | 
  30  |       expect(result.data).toBeDefined();
  31  |       expect(result.data.length).toBeLessThanOrEqual(10);
  32  |     });
  33  | 
  34  |     test('should return 401 without auth', async ({ apiClient }) => {
  35  |       const response = await apiClient.get('/api/v1/resources');
  36  |       expect(response.status()).toBe(401);
  37  |     });
  38  | 
  39  |   });
  40  | 
  41  |   test.describe('POST /api/v1/resources', () => {
  42  | 
  43  |     test('should create a new resource', async ({ authenticatedApiClient }) => {
  44  |       const coreAPI = new CoreAPI(authenticatedApiClient);
  45  | 
  46  |       const payload = {
  47  |         name: `GKO Test Resource ${Date.now()}`,
  48  |         status: 'active',
  49  |       };
  50  | 
  51  |       const created = await coreAPI.create(payload);
  52  | 
  53  |       expect(created.id).toBeTruthy();
  54  |       expect(created.name).toBe(payload.name);
  55  | 
  56  |       // Store for cleanup in later tests
  57  |       createdResourceId = created.id;
  58  |     });
  59  | 
  60  |     test('should return 400 with invalid payload', async ({ authenticatedApiClient }) => {
  61  |       const response = await authenticatedApiClient.post(
  62  |         '/api/v1/resources',
  63  |         {}
  64  |       );
> 65  |       expect([400, 422]).toContain(response.status());
      |                          ^ Error: expect(received).toContain(expected) // indexOf
  66  |     });
  67  | 
  68  |   });
  69  | 
  70  |   test.describe('GET /api/v1/resources/:id', () => {
  71  | 
  72  |     test('should return resource by id', async ({ authenticatedApiClient }) => {
  73  |       const coreAPI = new CoreAPI(authenticatedApiClient);
  74  | 
  75  |       // Use created resource id or fallback to 1
  76  |       const id = createdResourceId || 1;
  77  |       const resource = await coreAPI.getById(id);
  78  | 
  79  |       expect(resource.id).toBeTruthy();
  80  |     });
  81  | 
  82  |     test('should return 404 for non-existent resource', async ({ authenticatedApiClient }) => {
  83  |       const response = await authenticatedApiClient.get(
  84  |         '/api/v1/resources/999999999'
  85  |       );
  86  |       expect(response.status()).toBe(404);
  87  |     });
  88  | 
  89  |   });
  90  | 
  91  |   test.describe('PUT /api/v1/resources/:id', () => {
  92  | 
  93  |     test('should update existing resource', async ({ authenticatedApiClient }) => {
  94  |       const coreAPI = new CoreAPI(authenticatedApiClient);
  95  |       const id = createdResourceId || 1;
  96  | 
  97  |       const updated = await coreAPI.update(id, {
  98  |         name: `GKO Updated Resource ${Date.now()}`,
  99  |         status: 'inactive',
  100 |       });
  101 | 
  102 |       expect(updated.id).toBeTruthy();
  103 |     });
  104 | 
  105 |   });
  106 | 
  107 |   test.describe('DELETE /api/v1/resources/:id', () => {
  108 | 
  109 |     test('should delete existing resource', async ({ authenticatedApiClient }) => {
  110 |       const coreAPI = new CoreAPI(authenticatedApiClient);
  111 |       const id = createdResourceId || 1;
  112 | 
  113 |       await coreAPI.delete(id);
  114 |     });
  115 | 
  116 |   });
  117 | 
  118 |   test.describe('GET /health', () => {
  119 | 
  120 |     test('should return healthy status', async ({ authenticatedApiClient }) => {
  121 |       const coreAPI = new CoreAPI(authenticatedApiClient);
  122 |       await coreAPI.healthCheck();
  123 |     });
  124 | 
  125 |   });
  126 | 
  127 | });
```
# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: api\core.spec.ts >> Core Resource API >> PUT /api/v1/resources/:id >> should update existing resource
- Location: tests\api\core.spec.ts:93:9

# Error details

```
Error: Expected status 200 but got 404.
Body: {"message":"Resource not found"}
```

# Test source

```ts
  1  | // PURPOSE: Reusable response validation utility.
  2  | // WHY: Every API test needs to validate response status and body shape.
  3  | // This utility wraps Zod parsing with clear error messages so test
  4  | // failures tell you exactly what field failed, not just "parse error".
  5  | 
  6  | import { APIResponse } from '@playwright/test';
  7  | import { z, ZodSchema } from 'zod';
  8  | 
  9  | export async function validateResponse<T>(
  10 |   response: APIResponse,
  11 |   schema: ZodSchema<T>,
  12 |   expectedStatus: number = 200
  13 | ): Promise<T> {
  14 |   // Status check
  15 |   if (response.status() !== expectedStatus) {
  16 |     const body = await response.text();
> 17 |     throw new Error(
     |           ^ Error: Expected status 200 but got 404.
  18 |       `Expected status ${expectedStatus} but got ${response.status()}.\nBody: ${body}`
  19 |     );
  20 |   }
  21 | 
  22 |   // Parse body
  23 |   const body = await response.json();
  24 | 
  25 |   // Schema validation
  26 |   const result = schema.safeParse(body);
  27 |   if (!result.success) {
  28 |     throw new Error(
  29 |       `Response schema validation failed:\n${JSON.stringify(result.error.format(), null, 2)}\n\nActual response:\n${JSON.stringify(body, null, 2)}`
  30 |     );
  31 |   }
  32 | 
  33 |   return result.data;
  34 | }
  35 | 
  36 | export async function expectStatus(
  37 |   response: APIResponse,
  38 |   expectedStatus: number
  39 | ): Promise<void> {
  40 |   if (response.status() !== expectedStatus) {
  41 |     const body = await response.text();
  42 |     throw new Error(
  43 |       `Expected status ${expectedStatus} but got ${response.status()}.\nBody: ${body}`
  44 |     );
  45 |   }
  46 | }
  47 | 
  48 | export function validateSchema<T>(data: unknown, schema: ZodSchema<T>): T {
  49 |   const result = schema.safeParse(data);
  50 |   if (!result.success) {
  51 |     throw new Error(
  52 |       `Schema validation failed:\n${JSON.stringify(result.error.format(), null, 2)}`
  53 |     );
  54 |   }
  55 |   return result.data;
  56 | }
```
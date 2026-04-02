// PURPOSE: Reusable response validation utility.
// WHY: Every API test needs to validate response status and body shape.
// This utility wraps Zod parsing with clear error messages so test
// failures tell you exactly what field failed, not just "parse error".

import { APIResponse } from '@playwright/test';
import { z, ZodSchema } from 'zod';

export async function validateResponse<T>(
  response: APIResponse,
  schema: ZodSchema<T>,
  expectedStatus: number = 200
): Promise<T> {
  // Status check
  if (response.status() !== expectedStatus) {
    const body = await response.text();
    throw new Error(
      `Expected status ${expectedStatus} but got ${response.status()}.\nBody: ${body}`
    );
  }

  // Parse body
  const body = await response.json();

  // Schema validation
  const result = schema.safeParse(body);
  if (!result.success) {
    throw new Error(
      `Response schema validation failed:\n${JSON.stringify(result.error.format(), null, 2)}\n\nActual response:\n${JSON.stringify(body, null, 2)}`
    );
  }

  return result.data;
}

export async function expectStatus(
  response: APIResponse,
  expectedStatus: number
): Promise<void> {
  if (response.status() !== expectedStatus) {
    const body = await response.text();
    throw new Error(
      `Expected status ${expectedStatus} but got ${response.status()}.\nBody: ${body}`
    );
  }
}

export function validateSchema<T>(data: unknown, schema: ZodSchema<T>): T {
  const result = schema.safeParse(data);
  if (!result.success) {
    throw new Error(
      `Schema validation failed:\n${JSON.stringify(result.error.format(), null, 2)}`
    );
  }
  return result.data;
}
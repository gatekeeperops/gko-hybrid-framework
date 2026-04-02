// PURPOSE: Zod schemas for API response validation.
// WHY: Instead of manually checking response fields in every test,
// we define the expected shape once here. If the API changes its
// response structure, the schema catches it immediately with a
// clear error message — not a cryptic undefined error mid-test.

import { z } from 'zod';

// ── Generic Schemas ────────────────────────────────────────

export const PaginationSchema = z.object({
  page: z.number(),
  per_page: z.number(),
  total: z.number(),
  total_pages: z.number(),
});

export const ErrorResponseSchema = z.object({
  message: z.string(),
  code: z.string().optional(),
  errors: z.array(z.string()).optional(),
});

// ── Auth Schemas ───────────────────────────────────────────

export const LoginResponseSchema = z.object({
  // Toolshop returns only access_token — all other fields optional
  // for compatibility with other clients that return more fields
  access_token: z.string(),
  token_type: z.string().optional(),
  expires_in: z.number().optional(),
  refresh_token: z.string().optional(),
});

// Toolshop /users/me response shape — verified April 2 2026
// Replace first_name/last_name/address with client's actual fields
export const UserSchema = z.object({
  id: z.union([z.string(), z.number()]),
  email: z.string().email(),
  first_name: z.string().optional(),
  last_name: z.string().optional(),
  // name kept optional for clients that return a single name field
  name: z.string().optional(),
  phone: z.string().nullable().optional(),
  dob: z.string().nullable().optional(),
  role: z.string().optional(),
  enabled: z.boolean().optional(),
  totp_enabled: z.boolean().optional(),
  failed_login_attempts: z.number().optional(),
  provider: z.string().nullable().optional(),
  // Address is a nested object on Toolshop — passthrough handles
  // clients that return a flat structure or no address at all
  address: z.object({
    street: z.string().optional(),
    city: z.string().optional(),
    state: z.string().nullable().optional(),
    country: z.string().optional(),
    postal_code: z.string().nullable().optional(),
  }).optional(),
  created_at: z.string().optional(),
}).passthrough(); // passthrough allows unknown fields per client

// ── Health Check Schema ────────────────────────────────────

export const HealthCheckSchema = z.object({
  status: z.enum(['ok', 'healthy', 'up']),
  version: z.string().optional(),
  timestamp: z.string().optional(),
});

// ── Type exports ───────────────────────────────────────────

export type LoginResponse = z.infer<typeof LoginResponseSchema>;
export type User = z.infer<typeof UserSchema>;
export type ErrorResponse = z.infer<typeof ErrorResponseSchema>;
export type HealthCheck = z.infer<typeof HealthCheckSchema>;
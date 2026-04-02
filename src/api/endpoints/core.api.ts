// PURPOSE: Core product API endpoints wrapper.
// WHY: These are the client's main business API endpoints —
// CRUD operations on their primary resource. This file is the
// most customized per client. The structure stays the same,
// only the endpoint paths and schemas change per client.
// Endpoint path comes from CLIENT_CONFIG.endpoints.resource —
// never hardcoded here.

import { ApiClient } from '@api/client';
import { validateResponse, expectStatus } from '@utils/validator';
import { CLIENT_CONFIG } from '@config/client.config';
import { z } from 'zod';
import { logger } from '@utils/logger';

// ── Schema — update per client ─────────────────────────────
// Toolshop product schema — verified April 2 2026.
// category.id and brand.id are ULIDs (strings) not numbers.
// Replace with client's actual resource structure per engagement.

export const ResourceSchema = z.object({
  id: z.string(),
  name: z.string().optional(),
  price: z.number().optional(),
  description: z.string().optional(),
  is_location_offer: z.boolean().optional(),
  is_rental: z.boolean().optional(),
  in_stock: z.union([z.boolean(), z.number()]).nullable().optional(),
  co2_rating: z.string().nullable().optional(),
  is_eco_friendly: z.boolean().optional(),
  // category.id is a ULID string — not a number
  category: z.object({
    id: z.string().optional(),
    name: z.string().optional(),
    slug: z.string().optional(),
  }).optional(),
  // brand.id is also a ULID string
  brand: z.object({
    id: z.string().optional(),
    name: z.string().optional(),
  }).optional(),
  // product_image is nested object — passthrough handles extra fields
  product_image: z.object({
    id: z.string().optional(),
    by_name: z.string().optional(),
    by_url: z.string().optional(),
    source_name: z.string().optional(),
    source_url: z.string().optional(),
    file_name: z.string().optional(),
    title: z.string().optional(),
  }).optional(),
  status: z.string().optional(),
  created_at: z.string().optional(),
  updated_at: z.string().optional(),
}).passthrough();

export const ResourceListSchema = z.object({
  data: z.array(ResourceSchema),
  total: z.number().optional(),
  current_page: z.number().optional(),
  page: z.number().optional(),
  per_page: z.number().optional(),
  last_page: z.number().optional(),
  from: z.number().optional(),
  to: z.number().optional(),
}).passthrough();

export type Resource = z.infer<typeof ResourceSchema>;
export type ResourceList = z.infer<typeof ResourceListSchema>;

// ── Core API Class ─────────────────────────────────────────

export class CoreAPI {
  private client: ApiClient;
  // Path from config — never hardcoded here
  private get endpoint() {
    return CLIENT_CONFIG.endpoints.resource;
  }

  constructor(client: ApiClient) {
    this.client = client;
  }

  async getAll(params?: Record<string, string>): Promise<ResourceList> {
    logger.step('GET all resources');
    const response = await this.client.get(this.endpoint, params);
    return validateResponse(response, ResourceListSchema, 200);
  }

  async getById(id: string | number): Promise<Resource> {
    logger.step(`GET resource: ${id}`);
    const response = await this.client.get(`${this.endpoint}/${id}`);
    return validateResponse(response, ResourceSchema, 200);
  }

  async create(payload: Record<string, unknown>): Promise<Resource> {
    logger.step('POST create resource');
    const response = await this.client.post(this.endpoint, payload);
    return validateResponse(response, ResourceSchema, 201);
  }

  async update(
    id: string | number,
    payload: Record<string, unknown>
  ): Promise<void> {
    logger.step(`PUT update resource: ${id}`);
    const response = await this.client.put(`${this.endpoint}/${id}`, payload);
    // WHY expectStatus not validateResponse: Toolshop PUT returns {success: true}
    // not the updated resource. Use expectStatus for clients that return minimal responses.
    await expectStatus(response, 200);
  }

  async partialUpdate(
    id: string | number,
    payload: Record<string, unknown>
  ): Promise<Resource> {
    logger.step(`PATCH update resource: ${id}`);
    const response = await this.client.patch(`${this.endpoint}/${id}`, payload);
    return validateResponse(response, ResourceSchema, 200);
  }

  async delete(id: string | number): Promise<void> {
    logger.step(`DELETE resource: ${id}`);
    const response = await this.client.delete(`${this.endpoint}/${id}`);
    await expectStatus(response, 204);
  }

  async healthCheck(): Promise<void> {
    logger.step('Health check');
    const response = await this.client.get(CLIENT_CONFIG.endpoints.health);
    await expectStatus(response, 200);
  }
}
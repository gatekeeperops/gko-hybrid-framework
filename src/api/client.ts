// PURPOSE: Central API client wrapper around Playwright APIRequestContext.
// WHY: Every API call in the framework goes through here — base URL,
// error handling, and logging are handled once, not repeated in every test.
//
// AUTH HEADER DESIGN: Auth headers are NOT injected here.
// WHY: The fixture sets auth headers at the context level via extraHTTPHeaders.
// If ApiClient also sets headers per-request, they override the context headers,
// breaking token injection for authenticated clients.
// Rule: auth lives in the fixture context, not in the request layer.

import { APIRequestContext, APIResponse } from '@playwright/test';
import { CLIENT_CONFIG } from '@config/client.config';

export class ApiClient {
  private request: APIRequestContext;

  constructor(request: APIRequestContext) {
    this.request = request;
  }

  private buildURL(endpoint: string): string {
    // Strip trailing slash from base, ensure leading slash on path
    const base = CLIENT_CONFIG.apiBaseURL.replace(/\/$/, '');
    const path = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
    return `${base}${path}`;
  }

  async get(endpoint: string, params?: Record<string, string>): Promise<APIResponse> {
    // Auth header comes from context extraHTTPHeaders set in fixture
    return this.request.get(this.buildURL(endpoint), { params });
  }

  async post(endpoint: string, body: unknown): Promise<APIResponse> {
    return this.request.post(this.buildURL(endpoint), {
      headers: { 'Content-Type': 'application/json' },
      data: body,
    });
  }

  async put(endpoint: string, body: unknown): Promise<APIResponse> {
    return this.request.put(this.buildURL(endpoint), {
      headers: { 'Content-Type': 'application/json' },
      data: body,
    });
  }

  async patch(endpoint: string, body: unknown): Promise<APIResponse> {
    return this.request.patch(this.buildURL(endpoint), {
      headers: { 'Content-Type': 'application/json' },
      data: body,
    });
  }

  async delete(endpoint: string): Promise<APIResponse> {
    // No headers needed — context provides auth
    return this.request.delete(this.buildURL(endpoint));
  }
}
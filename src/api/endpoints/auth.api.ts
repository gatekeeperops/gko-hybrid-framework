// PURPOSE: Auth API endpoints wrapper.
// WHY: All auth-related API calls (login, logout, refresh token,
// get current user) are defined here. Tests never call ApiClient
// directly — they call these named methods which are readable,
// reusable, and easy to update when the client's API changes.
// Endpoint paths come from CLIENT_CONFIG.endpoints — never hardcoded.

import { APIResponse } from '@playwright/test';
import { ApiClient } from '@api/client';
import { validateResponse, expectStatus } from '@utils/validator';
import { LoginResponseSchema, UserSchema, LoginResponse, User } from '@schemas/api.schema';
import { CLIENT_CONFIG } from '@config/client.config';
import { logger } from '@utils/logger';

export class AuthAPI {
  private client: ApiClient;

  constructor(client: ApiClient) {
    this.client = client;
  }

  async login(
    username: string = CLIENT_CONFIG.auth.username,
    password: string = CLIENT_CONFIG.auth.password
  ): Promise<LoginResponse> {
    logger.step(`API login: ${username}`);
    // Path from config — change endpoint in client.config.ts, not here
    const response = await this.client.post(CLIENT_CONFIG.endpoints.login, {
      email: username,
      password,
    });
    return validateResponse(response, LoginResponseSchema, 200);
  }

  async logout(token?: string): Promise<void> {
    logger.step('API logout');
    const response = await this.client.post(CLIENT_CONFIG.endpoints.logout, { token });
    await expectStatus(response, 200);
  }

  async refreshToken(refreshToken: string): Promise<LoginResponse> {
    logger.step('Refreshing token');
    const response = await this.client.post(CLIENT_CONFIG.endpoints.refresh, {
      refresh_token: refreshToken,
    });
    return validateResponse(response, LoginResponseSchema, 200);
  }

  async getCurrentUser(): Promise<User> {
    logger.step('Getting current user');
    const response = await this.client.get(CLIENT_CONFIG.endpoints.me);
    return validateResponse(response, UserSchema, 200);
  }

  async loginWithInvalidCredentials(
    username: string,
    password: string
  ): Promise<APIResponse> {
    logger.step(`API login with invalid creds: ${username}`);
    return this.client.post(CLIENT_CONFIG.endpoints.login, {
      email: username,
      password,
    });
  }
}
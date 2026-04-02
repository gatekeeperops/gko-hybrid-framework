// PURPOSE: Per-client configuration profile.
// WHY: This is the ONLY file that changes per client.
// Clone the framework, fill this file, run — everything works.
// Adding endpoints config here eliminates hardcoded paths in
// api layer files. Per-client endpoint differences stay here.

import { ENV } from './environment';

export const CLIENT_CONFIG = {
  // Identity
  clientName: process.env.CLIENT_NAME || 'default',
  environment: ENV.ENV_NAME,

  // URLs
  baseURL: ENV.BASE_URL,
  apiBaseURL: ENV.API_BASE_URL,

  // Auth strategy
  auth: {
    type: ENV.AUTH_TYPE as 'basic' | 'bearer' | 'oauth',
    username: ENV.USERNAME,
    password: ENV.PASSWORD,
    token: ENV.API_TOKEN,
  },

  // Endpoint paths — update per client, never hardcode in api files
  endpoints: {
    login: '/users/login',
    logout: '/users/logout',
    me: '/users/me',
    refresh: '/auth/refresh',
    resource: '/products',
    health: '/products?page=1&per_page=1',
    tokenStorageKey: 'access_token',
    loginPath: '/',           // navigate here first to access login
    loginNavSelector: '[data-test="nav-sign-in"]', // click to open login form
  },

  // Browser config
  browser: {
    headless: ENV.HEADLESS,
    slowMo: ENV.SLOW_MO,
    timeout: ENV.TIMEOUT,
  },

  // Feature flags — toggle per client
  features: {
    apiTesting: true,
    uiTesting: true,
    hybridTesting: true,
    performanceTesting: false,   // enable when k6 module added
    accessibilityTesting: false, // enable when axe module added
    aiTesting: false,            // enable when AI module added
  },
};
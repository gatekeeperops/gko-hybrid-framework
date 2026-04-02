// PURPOSE: Single source of truth for all environment variables.
// WHY: Every client gets their own .env file. This file loads and
// validates those variables so the rest of the framework never
// reads process.env directly — all config flows through here.
//
// IMPORTANT: Do not use USERNAME as an env var name on Windows.
// USERNAME is a reserved Windows system variable that always resolves
// to the logged-in Windows username, overriding any .env value.
// Use TEST_USERNAME instead.

import * as dotenv from 'dotenv';
dotenv.config();

function required(key: string): string {
  const value = process.env[key];
  if (!value) throw new Error(`Missing required env variable: ${key}`);
  return value;
}

function optional(key: string, fallback: string): string {
  return process.env[key] || fallback;
}

export const ENV = {
  // Client target
  BASE_URL: required('BASE_URL'),
  API_BASE_URL: optional('API_BASE_URL', process.env.BASE_URL || ''),

  // Auth — use TEST_USERNAME not USERNAME (Windows reserved variable)
  AUTH_TYPE: optional('AUTH_TYPE', 'basic'),
  USERNAME: optional('TEST_USERNAME', ''),
  PASSWORD: optional('TEST_PASSWORD', ''),
  API_TOKEN: optional('API_TOKEN', ''),

  // Test config
  ENV_NAME: optional('ENV_NAME', 'staging'),
  HEADLESS: optional('HEADLESS', 'true') === 'true',
  SLOW_MO: parseInt(optional('SLOW_MO', '0')),
  TIMEOUT: parseInt(optional('TIMEOUT', '30000')),

  // Reporting
  ALLURE_RESULTS_DIR: optional('ALLURE_RESULTS_DIR', 'allure-results'),
};
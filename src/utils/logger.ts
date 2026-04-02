// PURPOSE: Structured logger for test execution.
// WHY: console.log is noisy and unstructured. This logger adds
// timestamps, log levels, and context so when a test fails in
// CI you can trace exactly what happened and when.

import { CLIENT_CONFIG } from '@config/client.config';

type LogLevel = 'INFO' | 'WARN' | 'ERROR' | 'DEBUG' | 'STEP';

const COLORS = {
  INFO: '\x1b[36m',   // cyan
  WARN: '\x1b[33m',   // yellow
  ERROR: '\x1b[31m',  // red
  DEBUG: '\x1b[90m',  // gray
  STEP: '\x1b[32m',   // green
  RESET: '\x1b[0m',
};

function timestamp(): string {
  return new Date().toISOString();
}

function log(level: LogLevel, message: string, data?: unknown): void {
  const color = COLORS[level];
  const reset = COLORS.RESET;
  const client = CLIENT_CONFIG.clientName.toUpperCase();
  const env = CLIENT_CONFIG.environment.toUpperCase();
  const prefix = `${color}[${level}]${reset} [${timestamp()}] [${client}:${env}]`;

  if (data !== undefined) {
    console.log(`${prefix} ${message}`, JSON.stringify(data, null, 2));
  } else {
    console.log(`${prefix} ${message}`);
  }
}

export const logger = {
  info: (message: string, data?: unknown) => log('INFO', message, data),
  warn: (message: string, data?: unknown) => log('WARN', message, data),
  error: (message: string, data?: unknown) => log('ERROR', message, data),
  debug: (message: string, data?: unknown) => log('DEBUG', message, data),
  step: (message: string, data?: unknown) => log('STEP', message, data),

  // API specific helpers
  request: (method: string, url: string) =>
    log('INFO', `→ ${method.toUpperCase()} ${url}`),
  response: (status: number, url: string, durationMs?: number) =>
    log(status < 400 ? 'INFO' : 'ERROR',
      `← ${status} ${url}${durationMs ? ` (${durationMs}ms)` : ''}`),
};
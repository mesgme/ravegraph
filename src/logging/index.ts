import pino from 'pino';
import type { AppConfig } from '../config/index.js';

export function createLogger(config: AppConfig): pino.Logger {
  const transport =
    config.nodeEnv === 'development'
      ? { target: 'pino-pretty', options: { colorize: true } }
      : undefined;

  return pino({
    level: config.logLevel,
    transport,
  });
}

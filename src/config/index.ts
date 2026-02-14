import { z } from 'zod/v4';

const logLevels = ['fatal', 'error', 'warn', 'info', 'debug', 'trace'] as const;

const configSchema = z.object({
  db: z.object({
    host: z.string().default('localhost'),
    port: z.coerce.number().int().min(1).max(65535).default(5432),
    database: z.string().default('ravegraph'),
    user: z.string().default('ravegraph'),
    password: z.string().default('ravegraph_dev'),
  }),
  logLevel: z.enum(logLevels).default('info'),
  nodeEnv: z.enum(['development', 'production', 'test']).default('development'),
});

export type AppConfig = z.infer<typeof configSchema>;

export function loadConfig(): AppConfig {
  return configSchema.parse({
    db: {
      host: process.env.DB_HOST,
      port: process.env.DB_PORT,
      database: process.env.DB_NAME,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
    },
    logLevel: process.env.LOG_LEVEL,
    nodeEnv: process.env.NODE_ENV,
  });
}

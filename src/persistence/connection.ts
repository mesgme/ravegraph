import { Kysely, PostgresDialect } from 'kysely';
import pkg from 'pg';
import type { AppConfig } from '../config/index.js';
import type { Database } from './database.js';

const { Pool } = pkg;

export function createDb(config: AppConfig): Kysely<Database> {
  const dialect = new PostgresDialect({
    pool: new Pool({
      host: config.db.host,
      port: config.db.port,
      database: config.db.database,
      user: config.db.user,
      password: config.db.password,
    }),
  });

  return new Kysely<Database>({ dialect });
}

export async function testConnection(db: Kysely<Database>): Promise<boolean> {
  try {
    await db.selectFrom('services').select('id').limit(1).execute();
    return true;
  } catch {
    return false;
  }
}

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { loadConfig } from '../../../src/config/index.js';

describe('loadConfig', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    process.env = { ...originalEnv };
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  it('returns defaults when no env vars are set', () => {
    delete process.env.DB_HOST;
    delete process.env.DB_PORT;
    delete process.env.DB_NAME;
    delete process.env.DB_USER;
    delete process.env.DB_PASSWORD;
    delete process.env.LOG_LEVEL;
    delete process.env.NODE_ENV;

    const config = loadConfig();
    expect(config.db.host).toBe('localhost');
    expect(config.db.port).toBe(5432);
    expect(config.db.database).toBe('ravegraph');
    expect(config.db.user).toBe('ravegraph');
    expect(config.db.password).toBe('ravegraph_dev');
    expect(config.logLevel).toBe('info');
    expect(config.nodeEnv).toBe('development');
  });

  it('reads values from env vars', () => {
    process.env.DB_HOST = 'db.example.com';
    process.env.DB_PORT = '5433';
    process.env.DB_NAME = 'mydb';
    process.env.DB_USER = 'admin';
    process.env.DB_PASSWORD = 'secret';
    process.env.LOG_LEVEL = 'debug';
    process.env.NODE_ENV = 'production';

    const config = loadConfig();
    expect(config.db.host).toBe('db.example.com');
    expect(config.db.port).toBe(5433);
    expect(config.db.database).toBe('mydb');
    expect(config.db.user).toBe('admin');
    expect(config.db.password).toBe('secret');
    expect(config.logLevel).toBe('debug');
    expect(config.nodeEnv).toBe('production');
  });

  it('rejects invalid DB_PORT', () => {
    process.env.DB_PORT = 'not-a-number';
    expect(() => loadConfig()).toThrow();
  });

  it('rejects invalid LOG_LEVEL', () => {
    process.env.LOG_LEVEL = 'verbose';
    expect(() => loadConfig()).toThrow();
  });
});

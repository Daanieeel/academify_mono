import { describe, expect, it } from 'bun:test';

import { createEnv, databaseEnvSchema, redisEnvSchema } from './index';

describe('databaseEnvSchema', () => {
  it('accepts a valid DATABASE_URL', () => {
    const env = createEnv({
      server: databaseEnvSchema,
      runtimeEnv: { DATABASE_URL: 'postgresql://user:pass@localhost:5432/db' },
    });

    expect(env.DATABASE_URL).toBe('postgresql://user:pass@localhost:5432/db');
  });

  it('throws when DATABASE_URL is missing', () => {
    expect(() =>
      createEnv({ server: databaseEnvSchema, runtimeEnv: {} }),
    ).toThrow();
  });
});

describe('redisEnvSchema', () => {
  it('applies defaults when nothing is set', () => {
    const env = createEnv({ server: redisEnvSchema, runtimeEnv: {} });

    expect(env.REDIS_HOST).toBe('127.0.0.1');
    expect(env.REDIS_PORT).toBe(6379);
    expect(env.REDIS_USERNAME).toBeUndefined();
  });

  it('coerces REDIS_PORT from a string', () => {
    const env = createEnv({
      server: redisEnvSchema,
      runtimeEnv: { REDIS_PORT: '6380' },
    });

    expect(env.REDIS_PORT).toBe(6380);
  });
});

import { afterAll, beforeAll, describe, expect, it } from 'bun:test';
import { inArray } from 'drizzle-orm';

import { app } from '../index';
import { db, institutionRegistry } from '../db';

describe('directory', () => {
  const suffix = crypto.randomUUID().slice(0, 8);
  const activeSlug = `active-school-${suffix}`;
  const suspendedSlug = `suspended-school-${suffix}`;

  beforeAll(async () => {
    await db.insert(institutionRegistry).values([
      {
        slug: activeSlug,
        displayName: `Active School ${suffix}`,
        region: 'eu-central',
        backendUrl: 'http://localhost:3001',
        status: 'active',
      },
      {
        slug: suspendedSlug,
        displayName: `Suspended School ${suffix}`,
        backendUrl: 'http://localhost:3001',
        status: 'suspended',
      },
    ]);
  });

  afterAll(async () => {
    await db
      .delete(institutionRegistry)
      .where(inArray(institutionRegistry.slug, [activeSlug, suspendedSlug]));
  });

  it('finds an institution by partial name search, returning only public fields', async () => {
    const response = await app.handle(
      new Request(
        `http://localhost/institutions?search=Active+School+${suffix}`,
      ),
    );
    const body = (await response.json()) as {
      institutions: {
        slug: string;
        display_name: string;
        region: string | null;
      }[];
    };

    expect(
      body.institutions.some((institution) => institution.slug === activeSlug),
    ).toBe(true);
    expect(body.institutions[0]).not.toHaveProperty('backend_url');
  });

  it('resolves an active institution to its backend_url', async () => {
    const response = await app.handle(
      new Request(`http://localhost/institutions/${activeSlug}/resolve`),
    );
    const body = (await response.json()) as {
      backend_url: string;
      deployment_mode: string;
    };

    expect(response.status).toBe(200);
    expect(body.backend_url).toBe('http://localhost:3001');
    expect(body.deployment_mode).toBe('hosted');
  });

  it('does not resolve a suspended institution', async () => {
    const response = await app.handle(
      new Request(`http://localhost/institutions/${suspendedSlug}/resolve`),
    );

    expect(response.status).toBe(404);
  });

  it('404s for an unknown slug', async () => {
    const response = await app.handle(
      new Request(
        `http://localhost/institutions/does-not-exist-${suffix}/resolve`,
      ),
    );

    expect(response.status).toBe(404);
  });
});

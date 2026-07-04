import { eq, ilike, or } from 'drizzle-orm';
import { Elysia, t } from 'elysia';

import { db } from './db';
import { env } from './env';
import { institutionRegistry } from './schema';

// Public control-plane API: no auth, no PII — just enough to pick a school
// and find out which backend serves it. See ADR-0009.
export const app = new Elysia()
  .get('/health', () => ({ ok: true, service: 'directory' }))
  .get(
    '/institutions',
    async ({ query }) => {
      const rows = await db
        .select({
          slug: institutionRegistry.slug,
          display_name: institutionRegistry.displayName,
          type: institutionRegistry.type,
          region: institutionRegistry.region,
          country: institutionRegistry.country,
        })
        .from(institutionRegistry)
        .where(
          query.search
            ? or(
                ilike(institutionRegistry.displayName, `%${query.search}%`),
                ilike(institutionRegistry.slug, `%${query.search}%`),
              )
            : undefined,
        )
        .limit((query.limit ?? 25) + 1)
        .offset(query.offset ?? 0);

      const limit = query.limit ?? 25;
      const has_more = rows.length > limit;
      const institutions = rows.slice(0, limit);

      return { institutions, has_more };
    },
    {
      query: t.Object({
        search: t.Optional(t.String()),
        limit: t.Optional(t.Numeric()),
        offset: t.Optional(t.Numeric()),
      }),
    },
  )
  .get(
    '/institutions/:slug/resolve',
    async ({ params, status }) => {
      const [institution] = await db
        .select({
          slug: institutionRegistry.slug,
          display_name: institutionRegistry.displayName,
          deployment_mode: institutionRegistry.deploymentMode,
          backend_url: institutionRegistry.backendUrl,
          status: institutionRegistry.status,
        })
        .from(institutionRegistry)
        .where(eq(institutionRegistry.slug, params.slug));

      if (!institution || institution.status !== 'active') {
        return status(404, { error: 'institution not found' });
      }

      return institution;
    },
    { params: t.Object({ slug: t.String({ minLength: 1 }) }) },
  );

export type App = typeof app;

if (import.meta.main) {
  app.listen(env.DIRECTORY_PORT);
  console.log(
    `Registry listening on ${app.server?.hostname}:${app.server?.port}`,
  );
}

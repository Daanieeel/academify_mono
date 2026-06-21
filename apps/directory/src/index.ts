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
          region: institutionRegistry.region,
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
        .limit(25);

      return { institutions: rows };
    },
    { query: t.Object({ search: t.Optional(t.String()) }) },
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

if (import.meta.main) {
  app.listen(env.DIRECTORY_PORT);
  console.log(
    `Directory listening on ${app.server?.hostname}:${app.server?.port}`,
  );
}

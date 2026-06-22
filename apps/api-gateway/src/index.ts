import { Elysia } from 'elysia';
import { auth } from '@repo/auth';

import { env } from './env';
import { chatsRoutes } from './routes/chats';
import { messagesRoutes } from './routes/messages';
import { mlsRoutes } from './routes/mls';
import { reportsRoutes } from './routes/reports';
import { searchRoutes } from './routes/search';
import { syncRoutes } from './routes/sync';
import { wsRoutes } from './ws';

export const app = new Elysia()
  .get('/health', () => ({ ok: true, service: 'api-gateway' }))
  .mount(auth.handler)
  .use(chatsRoutes)
  .use(messagesRoutes)
  .use(syncRoutes)
  .use(mlsRoutes)
  .use(reportsRoutes)
  .use(searchRoutes)
  .use(wsRoutes);

if (import.meta.main) {
  app.listen(env.API_GATEWAY_PORT);
  console.log(
    `API Gateway listening on ${app.server?.hostname}:${app.server?.port}`,
  );
}

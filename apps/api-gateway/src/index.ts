import { Elysia } from 'elysia';
import { auth } from '@repo/auth';
import { initializeBuckets } from '@academify/storage';

import { env } from './env';
import { errorPlugin } from './plugins/error';
import { chatsRoutes } from './modules/chats';
import { messagesRoutes } from './modules/messages';
import { mlsRoutes } from './modules/mls';
import { reportsRoutes } from './modules/reports';
import { searchRoutes } from './modules/search';
import { syncRoutes } from './modules/sync';
import { institutionsRoutes } from './modules/institutions';
import { wsRoutes } from './modules/ws';
import { usersRoutes } from './modules/users';

export const app = new Elysia()
  .use(errorPlugin)
  .get('/health', () => ({ ok: true, service: 'api-gateway' }))
  .mount(auth.handler)
  .use(chatsRoutes)
  .use(messagesRoutes)
  .use(syncRoutes)
  .use(mlsRoutes)
  .use(reportsRoutes)
  .use(searchRoutes)
  .use(institutionsRoutes)
  .use(usersRoutes)
  .use(wsRoutes);

export type App = typeof app;

if (import.meta.main) {
  if (process.env.NODE_ENV !== 'production') {
    initializeBuckets().catch(console.error);
  }

  app.listen(env.API_GATEWAY_PORT);
  console.log(
    `API Gateway listening on ${app.server?.hostname}:${app.server?.port}`,
  );
}

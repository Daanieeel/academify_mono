import { Elysia } from 'elysia';
import { authMiddleware } from '../../plugins/auth';
import { SearchService } from './service';
import { SearchQuerySchema } from './model';

export const searchRoutes = new Elysia().use(authMiddleware).get(
  '/search',
  ({ query, userId, institutionId }) => {
    return SearchService.search(
      userId,
      institutionId,
      query.q,
      query.limit,
      query.offset,
      query.category,
    );
  },
  { query: SearchQuerySchema },
);

import { t } from 'elysia';

export const SearchQuerySchema = t.Object({
  q: t.String({ minLength: 1 }),
  limit: t.Optional(t.Numeric({ default: 5, maximum: 50 })),
  offset: t.Optional(t.Numeric({ default: 0 })),
  category: t.Optional(
    t.Enum({
      contacts: 'contacts',
      chats: 'chats',
      blackboards: 'blackboards',
      clubs: 'clubs',
    }),
  ),
});

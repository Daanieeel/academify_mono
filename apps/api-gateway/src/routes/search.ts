import { and, desc, eq, ilike, inArray, ne, or } from 'drizzle-orm';
import { Elysia, t } from 'elysia';
import {
  blackboardPosts,
  chatMembers,
  chats,
  classes,
  classMemberships,
  clubs,
  db,
  profiles,
  roleBindings,
  user,
} from '@repo/database';

import { authMiddleware } from '../auth-middleware';

export const searchRoutes = new Elysia().use(authMiddleware).get(
  '/search',
  async ({ query, userId, institutionId, status }) => {
    if (!institutionId) {
      return status(403, { error: 'no institution profile for this user' });
    }

    const q = `%${query.q}%`;
    const limit = query.limit ?? 5;
    const offset = query.offset ?? 0;
    const requestedCategory = query.category;

    const results: any = {};

    // 1. Search Contacts
    if (!requestedCategory || requestedCategory === 'contacts') {
      const contactRows = await db
        .select({
          userId: profiles.userId,
          displayName: profiles.displayNameCiphertext,
          username: user.username,
          avatarBackgroundColor: profiles.avatarBackgroundColor,
          avatarEmoji: profiles.avatarEmoji,
        })
        .from(profiles)
        .innerJoin(user, eq(user.id, profiles.userId))
        .where(
          and(
            eq(profiles.institutionId, institutionId),
            ne(profiles.userId, userId),
            or(
              ilike(profiles.displayNameCiphertext, q),
              ilike(user.username, q),
            ),
          ),
        )
        .limit(limit + 1)
        .offset(offset);

      const hasMoreContacts = contactRows.length > limit;
      const contactsToReturn = contactRows.slice(0, limit);
      const contactIds = contactsToReturn.map((row) => row.userId);

      const roleByUserId = new Map<string, string>();
      const classNameByUserId = new Map<string, string>();

      if (contactIds.length > 0) {
        const roleRows = await db
          .select({ userId: roleBindings.userId, role: roleBindings.role })
          .from(roleBindings)
          .where(
            and(
              inArray(roleBindings.userId, contactIds),
              eq(roleBindings.institutionId, institutionId),
            ),
          );
        for (const row of roleRows) {
          if (!roleByUserId.has(row.userId)) {
            roleByUserId.set(row.userId, row.role);
          }
        }

        const classRows = await db
          .select({ userId: classMemberships.userId, className: classes.name })
          .from(classMemberships)
          .innerJoin(classes, eq(classes.id, classMemberships.classId))
          .where(
            and(
              inArray(classMemberships.userId, contactIds),
              eq(classes.institutionId, institutionId),
              eq(classMemberships.state, 'active'),
            ),
          );
        for (const row of classRows) {
          if (!classNameByUserId.has(row.userId)) {
            classNameByUserId.set(row.userId, row.className);
          }
        }
      }

      results.contacts = {
        items: contactsToReturn.map((row) => ({
          user_id: row.userId,
          display_name: row.displayName ?? row.username,
          role: roleByUserId.get(row.userId) ?? null,
          class_name: classNameByUserId.get(row.userId) ?? null,
          avatar_background_color: row.avatarBackgroundColor,
          avatar_emoji: row.avatarEmoji,
        })),
        has_more: hasMoreContacts,
      };
    }

    // 2. Search Chats
    if (!requestedCategory || requestedCategory === 'chats') {
      const memberships = await db
        .select({ chatId: chatMembers.chatId, chatType: chats.type })
        .from(chatMembers)
        .innerJoin(chats, eq(chats.id, chatMembers.chatId))
        .where(
          and(eq(chatMembers.userId, userId), eq(chatMembers.state, 'active')),
        );

      const chatIds = memberships.map((m) => m.chatId);

      let chatResults: any[] = [];
      let hasMoreChats = false;

      if (chatIds.length > 0) {
        // Find peers matching the query
        const matchingPeers = await db
          .select({
            chatId: chatMembers.chatId,
            userId: chatMembers.userId,
            displayName: profiles.displayNameCiphertext,
            username: user.username,
          })
          .from(chatMembers)
          .innerJoin(user, eq(user.id, chatMembers.userId))
          .leftJoin(profiles, eq(profiles.userId, chatMembers.userId))
          .where(
            and(
              inArray(chatMembers.chatId, chatIds),
              eq(chatMembers.state, 'active'),
              ne(chatMembers.userId, userId),
              or(
                ilike(profiles.displayNameCiphertext, q),
                ilike(user.username, q),
              ),
            ),
          )
          .limit(limit + 1)
          .offset(offset);

        hasMoreChats = matchingPeers.length > limit;
        const peersToReturn = matchingPeers.slice(0, limit);

        const membershipMap = new Map(memberships.map((m) => [m.chatId, m]));

        chatResults = peersToReturn.map((peerRow) => {
          const membership = membershipMap.get(peerRow.chatId);
          return {
            chat_id: peerRow.chatId,
            type: membership?.chatType ?? 'dm',
            peer: {
              user_id: peerRow.userId,
              display_name:
                peerRow.displayName ?? peerRow.username ?? peerRow.userId,
            },
            last_message_at: null, // Note: finding last message is expensive here, leaving null for search
          };
        });
      }

      results.chats = {
        items: chatResults,
        has_more: hasMoreChats,
      };
    }

    // 3. Search Blackboards
    if (!requestedCategory || requestedCategory === 'blackboards') {
      const blackboardRows = await db
        .select({
          id: blackboardPosts.id,
          title: blackboardPosts.title,
          body: blackboardPosts.body,
          authorUserId: blackboardPosts.authorUserId,
          createdAt: blackboardPosts.createdAt,
        })
        .from(blackboardPosts)
        .where(
          and(
            eq(blackboardPosts.institutionId, institutionId),
            or(ilike(blackboardPosts.title, q), ilike(blackboardPosts.body, q)),
          ),
        )
        .orderBy(desc(blackboardPosts.createdAt))
        .limit(limit + 1)
        .offset(offset);

      const hasMoreBlackboards = blackboardRows.length > limit;
      const blackboardsToReturn = blackboardRows.slice(0, limit);

      results.blackboards = {
        items: blackboardsToReturn.map((post) => ({
          id: post.id,
          title: post.title,
          body:
            post.body.substring(0, 100) + (post.body.length > 100 ? '...' : ''), // truncate body
          author_user_id: post.authorUserId,
          created_at: post.createdAt.toISOString(),
        })),
        has_more: hasMoreBlackboards,
      };
    }

    // 4. Search Clubs
    if (!requestedCategory || requestedCategory === 'clubs') {
      const clubRows = await db
        .select({
          id: clubs.id,
          name: clubs.name,
          description: clubs.description,
          createdAt: clubs.createdAt,
        })
        .from(clubs)
        .where(
          and(
            eq(clubs.institutionId, institutionId),
            or(ilike(clubs.name, q), ilike(clubs.description, q)),
          ),
        )
        .orderBy(desc(clubs.createdAt))
        .limit(limit + 1)
        .offset(offset);

      const hasMoreClubs = clubRows.length > limit;
      const clubsToReturn = clubRows.slice(0, limit);

      results.clubs = {
        items: clubsToReturn.map((club) => ({
          id: club.id,
          name: club.name,
          description: club.description,
          created_at: club.createdAt.toISOString(),
        })),
        has_more: hasMoreClubs,
      };
    }

    return results;
  },
  {
    query: t.Object({
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
    }),
  },
);

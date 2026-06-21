import { and, count, desc, eq, inArray, lt, ne } from 'drizzle-orm';
import { Elysia, t } from 'elysia';
import {
  chatMembers,
  chats,
  classes,
  classMemberships,
  db,
  mlsGroups,
  messages,
  profiles,
  roleBindings,
  user,
  userCursorState,
  userEventStream,
} from '@repo/database';

import { authMiddleware } from '../auth-middleware';

// School context: avatar emoji must stay wholesome. Server-side source of
// truth — mirror of the client list in apps/mobile/lib/avatar.ts.
const BLOCKED_AVATAR_EMOJIS = new Set<string>([
  '🖕', // obscene gesture
  '🍆', // sexual innuendo
  '🍑', // sexual innuendo
  '💦', // sexual innuendo
  '🍌', // sexual innuendo
  '👅', // sexual/suggestive
  '🔞', // adult-content marker
  '🍺', // alcohol
  '🍻', // alcohol
  '🍷', // alcohol
  '🍸', // alcohol
  '🍹', // alcohol
  '🍾', // alcohol
  '🥃', // alcohol
  '🚬', // smoking
  '💉', // drug use
  '💊', // drug use
  '🔫', // weapon
  '🔪', // weapon
  '🗡️', // weapon
  '⚔️', // weapon
  '💣', // weapon / violence
  '🧨', // explosive
  '🩸', // graphic / violence
  '💀', // death / morbid
  '☠️', // death / morbid
  '👿', // hateful / demonic
  '😈', // hateful / demonic
  '🤬', // profanity
  '🖤', // co-opted in edgy / hate contexts
  '🐵', // monkey emoji abused in racist harassment
  '🐒', // monkey emoji abused in racist harassment
  '🦍', // ape emoji abused in racist harassment
  '👌', // co-opted as a white-power hand symbol
  '🍉', // weaponised in racist tropes
]);

// The chat-list/contacts surface a real chat UI needs that wasn't part of the
// original sync/messages/mls/reports routes (those only ever needed a
// single-message fetch, triggered by a sync event). The server never
// decrypts message content here — previews are the client's job once it has
// the MLS secrets to do so.
export const chatsRoutes = new Elysia()
  .use(authMiddleware)
  .get('/me', async ({ userId, institutionId, status }) => {
    const [profile] = await db
      .select({
        username: user.username,
        displayName: profiles.displayNameCiphertext,
        avatarBackgroundColor: profiles.avatarBackgroundColor,
        avatarEmoji: profiles.avatarEmoji,
      })
      .from(user)
      .leftJoin(profiles, eq(profiles.userId, user.id))
      .where(eq(user.id, userId));

    if (!profile) {
      return status(404, { error: 'user not found' });
    }

    let role: string | null = null;
    let className: string | null = null;
    if (institutionId) {
      const [roleRow] = await db
        .select({ role: roleBindings.role })
        .from(roleBindings)
        .where(
          and(
            eq(roleBindings.userId, userId),
            eq(roleBindings.institutionId, institutionId),
          ),
        );
      role = roleRow?.role ?? null;

      const [classRow] = await db
        .select({ className: classes.name })
        .from(classMemberships)
        .innerJoin(classes, eq(classes.id, classMemberships.classId))
        .where(
          and(
            eq(classMemberships.userId, userId),
            eq(classes.institutionId, institutionId),
            eq(classMemberships.state, 'active'),
          ),
        );
      className = classRow?.className ?? null;
    }

    return {
      user_id: userId,
      username: profile.username,
      display_name: profile.displayName ?? profile.username,
      role,
      class_name: className,
      avatar_background_color: profile.avatarBackgroundColor,
      avatar_emoji: profile.avatarEmoji,
    };
  })
  .patch(
    '/me/avatar',
    async ({ body, status, userId }) => {
      // School context: enforce the wholesome-emoji policy server-side, not
      // just in the client picker. Keep this in sync with the mobile mirror
      // in apps/mobile/lib/avatar.ts.
      if (BLOCKED_AVATAR_EMOJIS.has(body.emoji.trim())) {
        return status(422, { error: 'emoji not allowed' });
      }

      const [updated] = await db
        .update(profiles)
        .set({
          avatarBackgroundColor: body.background_color,
          avatarEmoji: body.emoji,
        })
        .where(eq(profiles.userId, userId))
        .returning({
          avatarBackgroundColor: profiles.avatarBackgroundColor,
          avatarEmoji: profiles.avatarEmoji,
        });

      return {
        avatar_background_color: updated?.avatarBackgroundColor ?? null,
        avatar_emoji: updated?.avatarEmoji ?? null,
      };
    },
    {
      body: t.Object({
        // A single hex color or a "from,to" gradient pair.
        background_color: t.String({
          pattern: '^#[0-9A-Fa-f]{6}(,#[0-9A-Fa-f]{6})?$',
        }),
        // Generous upper bound — ZWJ emoji sequences are many code units.
        emoji: t.String({ minLength: 1, maxLength: 32 }),
      }),
    },
  )
  .get('/contacts', async ({ userId, institutionId, status }) => {
    if (!institutionId) {
      return status(403, { error: 'no institution profile for this user' });
    }

    const rows = await db
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
        ),
      );

    if (rows.length === 0) {
      return [];
    }

    const contactIds = rows.map((row) => row.userId);

    const roleRows = await db
      .select({ userId: roleBindings.userId, role: roleBindings.role })
      .from(roleBindings)
      .where(
        and(
          inArray(roleBindings.userId, contactIds),
          eq(roleBindings.institutionId, institutionId),
        ),
      );
    const roleByUserId = new Map<string, string>();
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
    const classNameByUserId = new Map<string, string>();
    for (const row of classRows) {
      if (!classNameByUserId.has(row.userId)) {
        classNameByUserId.set(row.userId, row.className);
      }
    }

    return rows.map((row) => ({
      user_id: row.userId,
      display_name: row.displayName ?? row.username,
      role: roleByUserId.get(row.userId) ?? null,
      class_name: classNameByUserId.get(row.userId) ?? null,
      avatar_background_color: row.avatarBackgroundColor,
      avatar_emoji: row.avatarEmoji,
    }));
  })
  .get('/classes', async ({ institutionId, status }) => {
    if (!institutionId) {
      return status(403, { error: 'no institution profile for this user' });
    }

    const rows = await db
      .select({
        classId: classes.id,
        className: classes.name,
        memberCount: count(classMemberships.id),
      })
      .from(classes)
      .leftJoin(
        classMemberships,
        and(
          eq(classMemberships.classId, classes.id),
          eq(classMemberships.state, 'active'),
        ),
      )
      .where(eq(classes.institutionId, institutionId))
      .groupBy(classes.id, classes.name);

    return rows.map((row) => ({
      class_id: row.classId,
      class_name: row.className,
      member_count: row.memberCount,
    }));
  })
  .get('/chats', async ({ userId }) => {
    const memberships = await db
      .select({ chatId: chatMembers.chatId, chatType: chats.type })
      .from(chatMembers)
      .innerJoin(chats, eq(chats.id, chatMembers.chatId))
      .where(
        and(eq(chatMembers.userId, userId), eq(chatMembers.state, 'active')),
      );

    if (memberships.length === 0) {
      return { chats: [] };
    }

    const chatIds = memberships.map((membership) => membership.chatId);

    const otherMembers = await db
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
        ),
      );

    const peerByChatId = new Map<
      string,
      { user_id: string; display_name: string }
    >();
    for (const row of otherMembers) {
      if (!peerByChatId.has(row.chatId)) {
        peerByChatId.set(row.chatId, {
          user_id: row.userId,
          display_name: row.displayName ?? row.username ?? row.userId,
        });
      }
    }

    const allMessages = await db
      .select()
      .from(messages)
      .where(inArray(messages.chatId, chatIds))
      .orderBy(desc(messages.createdAt));

    const lastMessageByChatId = new Map<string, (typeof allMessages)[number]>();
    for (const message of allMessages) {
      if (!lastMessageByChatId.has(message.chatId)) {
        lastMessageByChatId.set(message.chatId, message);
      }
    }

    const lastMessageIds = [...lastMessageByChatId.values()].map(
      (message) => message.id,
    );
    const inboxRows = lastMessageIds.length
      ? await db
          .select({
            entityId: userEventStream.entityId,
            cursor: userEventStream.cursor,
          })
          .from(userEventStream)
          .where(
            and(
              eq(userEventStream.userId, userId),
              eq(userEventStream.eventType, 'message.created'),
              inArray(userEventStream.entityId, lastMessageIds),
            ),
          )
      : [];
    const cursorByMessageId = new Map(
      inboxRows.map((row) => [row.entityId, row.cursor]),
    );

    const [cursorState] = await db
      .select({ lastAckCursor: userCursorState.lastAckCursor })
      .from(userCursorState)
      .where(eq(userCursorState.userId, userId));
    const lastAck = cursorState?.lastAckCursor ?? 0n;

    return {
      chats: memberships.map((membership) => {
        const lastMessage = lastMessageByChatId.get(membership.chatId) ?? null;
        const lastMessageCursor = lastMessage
          ? cursorByMessageId.get(lastMessage.id)
          : undefined;
        // A chat is unread if its last message is someone else's and the
        // caller's inbox cursor for it is still ahead of their last ack.
        const read =
          !lastMessage ||
          lastMessage.senderUserId === userId ||
          (lastMessageCursor ?? 0n) <= lastAck;

        return {
          chat_id: membership.chatId,
          type: membership.chatType,
          peer: peerByChatId.get(membership.chatId) ?? null,
          last_message_at: lastMessage?.createdAt.toISOString() ?? null,
          read,
        };
      }),
    };
  })
  .post(
    '/chats',
    async ({ body, userId, institutionId, status }) => {
      if (!institutionId) {
        return status(403, { error: 'no institution profile for this user' });
      }
      if (body.peer_user_id === userId) {
        return status(400, { error: 'cannot start a chat with yourself' });
      }

      const [peerProfile] = await db
        .select({ userId: profiles.userId })
        .from(profiles)
        .where(
          and(
            eq(profiles.userId, body.peer_user_id),
            eq(profiles.institutionId, institutionId),
          ),
        );
      if (!peerProfile) {
        return status(404, { error: 'peer not found in this institution' });
      }

      const callerDmChats = await db
        .select({ chatId: chatMembers.chatId })
        .from(chatMembers)
        .innerJoin(chats, eq(chats.id, chatMembers.chatId))
        .where(
          and(
            eq(chats.type, 'dm'),
            eq(chats.institutionId, institutionId),
            eq(chatMembers.userId, userId),
            eq(chatMembers.state, 'active'),
          ),
        );

      if (callerDmChats.length > 0) {
        const [existingWithPeer] = await db
          .select({ chatId: chatMembers.chatId })
          .from(chatMembers)
          .where(
            and(
              inArray(
                chatMembers.chatId,
                callerDmChats.map((row) => row.chatId),
              ),
              eq(chatMembers.userId, body.peer_user_id),
              eq(chatMembers.state, 'active'),
            ),
          );
        if (existingWithPeer) {
          return { chat_id: existingWithPeer.chatId };
        }
      }

      const chat = await db.transaction(async (tx) => {
        const [created] = await tx
          .insert(chats)
          .values({ institutionId, type: 'dm', createdBy: userId })
          .returning();

        await tx.insert(chatMembers).values([
          { chatId: created!.id, userId },
          { chatId: created!.id, userId: body.peer_user_id },
        ]);

        return created!;
      });

      return { chat_id: chat.id };
    },
    { body: t.Object({ peer_user_id: t.String({ minLength: 1 }) }) },
  )
  .get(
    '/chats/:id',
    async ({ params, userId, status }) => {
      const [membership] = await db
        .select({ userId: chatMembers.userId })
        .from(chatMembers)
        .where(
          and(
            eq(chatMembers.chatId, params.id),
            eq(chatMembers.userId, userId),
            eq(chatMembers.state, 'active'),
          ),
        );
      if (!membership) {
        return status(403, { error: 'not a member of this chat' });
      }

      const [peerRow] = await db
        .select({
          userId: chatMembers.userId,
          displayName: profiles.displayNameCiphertext,
          username: user.username,
        })
        .from(chatMembers)
        .innerJoin(user, eq(user.id, chatMembers.userId))
        .leftJoin(profiles, eq(profiles.userId, chatMembers.userId))
        .where(
          and(
            eq(chatMembers.chatId, params.id),
            eq(chatMembers.state, 'active'),
            ne(chatMembers.userId, userId),
          ),
        );

      const [group] = await db
        .select()
        .from(mlsGroups)
        .where(eq(mlsGroups.chatId, params.id));

      return {
        chat_id: params.id,
        peer: peerRow
          ? {
              user_id: peerRow.userId,
              display_name: peerRow.displayName ?? peerRow.username,
            }
          : null,
        group_exists: Boolean(group),
        current_epoch: group?.currentEpoch ?? null,
      };
    },
    { params: t.Object({ id: t.String({ minLength: 1 }) }) },
  )
  .get(
    '/chats/:id/messages',
    async ({ params, query, userId, status }) => {
      const [membership] = await db
        .select({ userId: chatMembers.userId })
        .from(chatMembers)
        .where(
          and(
            eq(chatMembers.chatId, params.id),
            eq(chatMembers.userId, userId),
            eq(chatMembers.state, 'active'),
          ),
        );
      if (!membership) {
        return status(403, { error: 'not a member of this chat' });
      }

      const limit = query.limit ?? 50;
      const conditions = [eq(messages.chatId, params.id)];
      if (query.before_cursor) {
        conditions.push(lt(messages.createdAt, new Date(query.before_cursor)));
      }

      const rows = await db
        .select()
        .from(messages)
        .where(and(...conditions))
        .orderBy(desc(messages.createdAt))
        .limit(limit);

      return {
        messages: rows.map((row) => ({
          message_id: row.id,
          chat_id: row.chatId,
          sender_user_id: row.senderUserId,
          sender_device_id: row.senderDeviceId,
          mls_epoch: row.mlsEpoch,
          ciphertext: row.ciphertext.toString('base64url'),
          content_type: row.contentType,
          created_at: row.createdAt.toISOString(),
          deleted: row.deletedAt !== null,
        })),
        has_more: rows.length === limit,
      };
    },
    {
      params: t.Object({ id: t.String({ minLength: 1 }) }),
      query: t.Object({
        before_cursor: t.Optional(t.String()),
        limit: t.Optional(t.Integer({ minimum: 1, maximum: 200 })),
      }),
    },
  )
  .delete(
    '/chats/:id',
    async ({ params, userId, status }) => {
      const [membership] = await db
        .select({ userId: chatMembers.userId })
        .from(chatMembers)
        .where(
          and(
            eq(chatMembers.chatId, params.id),
            eq(chatMembers.userId, userId),
            eq(chatMembers.state, 'active'),
          ),
        );
      if (!membership) {
        return status(403, { error: 'not a member of this chat' });
      }

      const [messageCount] = await db
        .select({ count: count() })
        .from(messages)
        .where(eq(messages.chatId, params.id));

      if (messageCount && messageCount.count > 0) {
        return status(400, { error: 'cannot delete a chat that has messages' });
      }

      await db.transaction(async (tx) => {
        await tx.delete(mlsGroups).where(eq(mlsGroups.chatId, params.id));
        await tx.delete(chatMembers).where(eq(chatMembers.chatId, params.id));
        await tx.delete(chats).where(eq(chats.id, params.id));
      });

      return { success: true };
    },
    { params: t.Object({ id: t.String({ minLength: 1 }) }) },
  );

import { and, count, desc, eq, inArray, lt, ne } from 'drizzle-orm';
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
  institutions,
} from '@repo/database';
import {
  PolicyEngine,
  PermissionError,
  type InstitutionSettings,
} from '@repo/permissions';
import { AppError } from '../../plugins/error';

// School context: avatar emoji must stay wholesome. Server-side source of
// truth — mirror of the client list in apps/mobile/lib/avatar.ts.
const BLOCKED_AVATAR_EMOJIS = new Set<string>([
  '🖕',
  '🍆',
  '🍑',
  '💦',
  '🍌',
  '👅',
  '🔞',
  '🍺',
  '🍻',
  '🍷',
  '🍸',
  '🍹',
  '🍾',
  '🥃',
  '🚬',
  '💉',
  '💊',
  '🔫',
  '🔪',
  '🗡️',
  '⚔️',
  '💣',
  '🧨',
  '🩸',
  '💀',
  '☠️',
  '👿',
  '😈',
  '🤬',
  '🖤',
  '🐵',
  '🐒',
  '🦍',
  '👌',
  '🍉',
]);

export class ChatsService {
  static async getMe(userId: string, institutionId: string | null) {
    const [profile] = await db
      .select({
        username: user.username,
        displayName: profiles.displayNameCiphertext,
        avatarBackgroundColor: user.avatarBackgroundColor,
        avatarEmoji: user.avatarEmoji,
      })
      .from(user)
      .leftJoin(profiles, eq(profiles.userId, user.id))
      .where(eq(user.id, userId));

    if (!profile) {
      throw new AppError(404, 'USER_NOT_FOUND', 'user not found');
    }

    let roles: string[] = [];
    let className: string | null = null;
    let settings: InstitutionSettings | null = null;
    if (institutionId) {
      const roleRows = await db
        .select({ role: roleBindings.role })
        .from(roleBindings)
        .where(
          and(
            eq(roleBindings.userId, userId),
            eq(roleBindings.institutionId, institutionId),
          ),
        );
      roles = roleRows.map((r) => r.role);

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

      const [instRow] = await db
        .select({ settings: institutions.settings })
        .from(institutions)
        .where(eq(institutions.id, institutionId));
      settings = instRow?.settings ?? null;
    }

    const roleNames = roles.length > 0 ? roles : ['student'];
    const permissions = PolicyEngine.computePermissions(roleNames, settings);
    const features = PolicyEngine.computeFeatures(settings);

    return {
      user_id: userId,
      username: profile.username,
      display_name: profile.displayName ?? profile.username,
      roles, // Expose multiple roles
      role: roles[0] ?? null, // Backwards compatibility
      class_name: className,
      avatar_background_color: profile.avatarBackgroundColor,
      avatar_emoji: profile.avatarEmoji,
      permissions,
      features,
    };
  }

  static async updateAvatar(
    userId: string,
    backgroundColor: string,
    emoji: string,
  ) {
    if (BLOCKED_AVATAR_EMOJIS.has(emoji.trim())) {
      throw new AppError(422, 'EMOJI_NOT_ALLOWED', 'emoji not allowed');
    }

    const [updated] = await db
      .update(user)
      .set({
        avatarBackgroundColor: backgroundColor,
        avatarEmoji: emoji,
      })
      .where(eq(user.id, userId))
      .returning({
        avatarBackgroundColor: user.avatarBackgroundColor,
        avatarEmoji: user.avatarEmoji,
      });

    return {
      avatar_background_color: updated?.avatarBackgroundColor ?? null,
      avatar_emoji: updated?.avatarEmoji ?? null,
    };
  }

  static async getContacts(userId: string, institutionId: string | null) {
    if (!institutionId) {
      throw new AppError(
        403,
        'NO_INSTITUTION_PROFILE',
        'no institution profile for this user',
      );
    }

    const rows = await db
      .select({
        userId: profiles.userId,
        displayName: profiles.displayNameCiphertext,
        username: user.username,
        avatarBackgroundColor: user.avatarBackgroundColor,
        avatarEmoji: user.avatarEmoji,
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
  }

  static async getClasses(institutionId: string | null) {
    if (!institutionId) {
      throw new AppError(
        403,
        'NO_INSTITUTION_PROFILE',
        'no institution profile for this user',
      );
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
  }

  static async getChats(userId: string) {
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
  }

  static async createChat(
    userId: string,
    institutionId: string | null,
    peerUserId: string,
  ) {
    if (!institutionId) {
      throw new AppError(
        403,
        'NO_INSTITUTION_PROFILE',
        'no institution profile for this user',
      );
    }
    if (peerUserId === userId) {
      throw new AppError(
        400,
        'CANNOT_CHAT_SELF',
        'cannot start a chat with yourself',
      );
    }

    const callerRoleRows = await db
      .select({ role: roleBindings.role })
      .from(roleBindings)
      .where(
        and(
          eq(roleBindings.userId, userId),
          eq(roleBindings.institutionId, institutionId),
        ),
      );
    const callerRoles =
      callerRoleRows.length > 0
        ? callerRoleRows.map((r) => r.role)
        : ['student'];

    const peerRoleRows = await db
      .select({ role: roleBindings.role })
      .from(roleBindings)
      .where(
        and(
          eq(roleBindings.userId, peerUserId),
          eq(roleBindings.institutionId, institutionId),
        ),
      );
    const peerRoles =
      peerRoleRows.length > 0 ? peerRoleRows.map((r) => r.role) : ['student'];

    const [instRow] = await db
      .select({ settings: institutions.settings })
      .from(institutions)
      .where(eq(institutions.id, institutionId));
    const settings = instRow?.settings ?? null;

    if (!PolicyEngine.canInitiateChat(callerRoles, peerRoles, settings)) {
      throw new PermissionError(
        'ERR_CHAT_NOT_ALLOWED',
        'you are not allowed to start a chat with this user',
      );
    }

    const [peerProfile] = await db
      .select({ userId: profiles.userId })
      .from(profiles)
      .where(
        and(
          eq(profiles.userId, peerUserId),
          eq(profiles.institutionId, institutionId),
        ),
      );
    if (!peerProfile) {
      throw new AppError(
        404,
        'PEER_NOT_FOUND',
        'peer not found in this institution',
      );
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
            eq(chatMembers.userId, peerUserId),
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

      if (!created) {
        throw new Error('Failed to create chat');
      }

      await tx.insert(chatMembers).values([
        { chatId: created.id, userId },
        { chatId: created.id, userId: peerUserId },
      ]);

      return created;
    });

    return { chat_id: chat.id };
  }

  static async getChatById(userId: string, chatId: string) {
    const [membership] = await db
      .select({ userId: chatMembers.userId })
      .from(chatMembers)
      .where(
        and(
          eq(chatMembers.chatId, chatId),
          eq(chatMembers.userId, userId),
          eq(chatMembers.state, 'active'),
        ),
      );
    if (!membership) {
      throw new AppError(403, 'NOT_CHAT_MEMBER', 'not a member of this chat');
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
          eq(chatMembers.chatId, chatId),
          eq(chatMembers.state, 'active'),
          ne(chatMembers.userId, userId),
        ),
      );

    const [group] = await db
      .select()
      .from(mlsGroups)
      .where(eq(mlsGroups.chatId, chatId));

    return {
      chat_id: chatId,
      peer: peerRow
        ? {
            user_id: peerRow.userId,
            display_name: peerRow.displayName ?? peerRow.username,
          }
        : null,
      group_exists: Boolean(group),
      current_epoch: group?.currentEpoch ?? null,
    };
  }

  static async getChatMessages(
    userId: string,
    chatId: string,
    limit: number,
    beforeCursor?: string,
  ) {
    const [membership] = await db
      .select({ userId: chatMembers.userId })
      .from(chatMembers)
      .where(
        and(
          eq(chatMembers.chatId, chatId),
          eq(chatMembers.userId, userId),
          eq(chatMembers.state, 'active'),
        ),
      );
    if (!membership) {
      throw new AppError(403, 'NOT_CHAT_MEMBER', 'not a member of this chat');
    }

    const conditions = [eq(messages.chatId, chatId)];
    if (beforeCursor) {
      conditions.push(lt(messages.createdAt, new Date(beforeCursor)));
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
  }

  static async deleteChat(userId: string, chatId: string) {
    const [membership] = await db
      .select({ userId: chatMembers.userId })
      .from(chatMembers)
      .where(
        and(
          eq(chatMembers.chatId, chatId),
          eq(chatMembers.userId, userId),
          eq(chatMembers.state, 'active'),
        ),
      );
    if (!membership) {
      throw new AppError(403, 'NOT_CHAT_MEMBER', 'not a member of this chat');
    }

    const [messageCount] = await db
      .select({ count: count() })
      .from(messages)
      .where(eq(messages.chatId, chatId));

    if (messageCount && messageCount.count > 0) {
      throw new AppError(
        400,
        'CANNOT_DELETE_CHAT',
        'cannot delete a chat that has messages',
      );
    }

    await db.transaction(async (tx) => {
      await tx.delete(mlsGroups).where(eq(mlsGroups.chatId, chatId));
      await tx.delete(chatMembers).where(eq(chatMembers.chatId, chatId));
      await tx.delete(chats).where(eq(chats.id, chatId));
    });

    return { success: true };
  }
}

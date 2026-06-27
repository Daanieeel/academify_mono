import { and, eq } from 'drizzle-orm';
import {
  chatMembers,
  db,
  messages,
  roleBindings,
  institutions,
} from '@repo/database';
import { jobPayloadSchema } from '@repo/sync-protocol';
import {
  PolicyEngine,
  PERMISSIONS,
  PermissionError,
  type InstitutionSettings,
} from '@repo/permissions';

import { AppError } from '../../plugins/error';
import { enqueueJob } from '../../queue';

export class MessagesService {
  static async getMessage(userId: string, messageId: string) {
    const [message] = await db
      .select()
      .from(messages)
      .where(eq(messages.id, messageId));

    if (!message) {
      throw new AppError(404, 'MESSAGE_NOT_FOUND', 'message not found');
    }

    const [membership] = await db
      .select({ userId: chatMembers.userId })
      .from(chatMembers)
      .where(
        and(
          eq(chatMembers.chatId, message.chatId),
          eq(chatMembers.userId, userId),
        ),
      );

    if (!membership) {
      throw new AppError(403, 'NOT_CHAT_MEMBER', 'not a member of this chat');
    }

    return {
      message_id: message.id,
      chat_id: message.chatId,
      sender_user_id: message.senderUserId,
      sender_device_id: message.senderDeviceId,
      mls_epoch: message.mlsEpoch,
      ciphertext: message.ciphertext.toString('base64url'),
      content_type: message.contentType,
      deleted: message.deletedAt !== null,
    };
  }

  static async sendMessage(
    userId: string,
    institutionId: string | null,
    messageId: string,
    chatId: string,
    senderDeviceId: string,
    mlsEpoch: number,
    ciphertext: string,
    contentType: string,
  ) {
    if (!institutionId) {
      throw new AppError(
        403,
        'NO_INSTITUTION_PROFILE',
        'no institution profile',
      );
    }

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

    const [roleRow] = await db
      .select({ role: roleBindings.role })
      .from(roleBindings)
      .where(
        and(
          eq(roleBindings.userId, userId),
          eq(roleBindings.institutionId, institutionId),
        ),
      );
    const role = roleRow?.role ?? 'student';

    const [instRow] = await db
      .select({ settings: institutions.settings })
      .from(institutions)
      .where(eq(institutions.id, institutionId));
    const settings = (instRow?.settings as InstitutionSettings) ?? null;

    if (!PolicyEngine.hasPermission(role, PERMISSIONS.SEND_MESSAGE, settings)) {
      throw new PermissionError(
        'ERR_PERMISSION_DENIED',
        'you are not allowed to send messages',
      );
    }

    const payload = jobPayloadSchema.parse({
      command: 'SEND_MESSAGE',
      message_id: messageId,
      chat_id: chatId,
      sender_user_id: userId,
      sender_device_id: senderDeviceId,
      mls_epoch: mlsEpoch,
      ciphertext: ciphertext,
      content_type: contentType,
    });

    await enqueueJob(payload);

    return { accepted: true, message_id: messageId };
  }
}

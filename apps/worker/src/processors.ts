import { and, eq, ne } from 'drizzle-orm';
import { db, chatMembers, messages } from '@repo/database';
import type { JobPayload } from '@repo/sync-protocol';

import { deliverToUser } from './inbox';

async function activeChatMembers(chatId: string, excludeUserId?: string) {
  const conditions = [
    eq(chatMembers.chatId, chatId),
    eq(chatMembers.state, 'active'),
  ];
  if (excludeUserId) {
    conditions.push(ne(chatMembers.userId, excludeUserId));
  }

  return db
    .select({ userId: chatMembers.userId })
    .from(chatMembers)
    .where(and(...conditions));
}

// Recipient resolution is worker-owned (ADR-0002): the gateway only enqueues
// the intent, this is where membership turns into a concrete fan-out list.
async function handleSendMessage(
  job: Extract<JobPayload, { command: 'SEND_MESSAGE' }>,
): Promise<void> {
  await db
    .insert(messages)
    .values({
      id: job.message_id,
      chatId: job.chat_id,
      senderUserId: job.sender_user_id,
      senderDeviceId: job.sender_device_id,
      mlsEpoch: job.mls_epoch,
      ciphertext: Buffer.from(job.ciphertext, 'base64url'),
      contentType: job.content_type,
    })
    .onConflictDoNothing();

  const recipients = await activeChatMembers(job.chat_id);

  for (const { userId } of recipients) {
    await deliverToUser({
      userId,
      eventType: 'message.created',
      entityId: job.message_id,
      payloadMetadata: { encryption: 'mls', content_type: job.content_type },
      payloadRef: job.message_id,
    });
  }
}

// Simplification for the MVP: only the affected user is notified (so their
// own client learns it joined/left the chat). Notifying existing members that
// membership changed is a `chat.updated` concern, not built yet.
async function handleMembershipChanged(
  job: Extract<JobPayload, { command: 'MEMBERSHIP_CHANGED' }>,
): Promise<void> {
  await deliverToUser({
    userId: job.user_id,
    eventType:
      job.action === 'added' ? 'membership.added' : 'membership.removed',
    entityId: job.chat_id,
    payloadMetadata: { encryption: 'none', content_type: 'application/json' },
  });
}

// Recipients are everyone who currently shares an active chat with the
// updated user (so their cached display name/avatar gets refreshed).
async function handleProfileUpdated(
  job: Extract<JobPayload, { command: 'PROFILE_UPDATED' }>,
): Promise<void> {
  const sharedChats = await db
    .select({ chatId: chatMembers.chatId })
    .from(chatMembers)
    .where(
      and(eq(chatMembers.userId, job.user_id), eq(chatMembers.state, 'active')),
    );

  const recipientIds = new Set<string>();
  for (const { chatId } of sharedChats) {
    const members = await activeChatMembers(chatId, job.user_id);
    for (const { userId } of members) {
      recipientIds.add(userId);
    }
  }

  for (const userId of recipientIds) {
    await deliverToUser({
      userId,
      eventType: 'profile.updated',
      entityId: job.user_id,
      payloadMetadata: { encryption: 'none', content_type: 'application/json' },
    });
  }
}

// Audience-scope resolution (institution/class/club) for these feeds is not
// built yet (see README feature inventory) — explicit no-op, not silently
// dropped, so it's obvious this is deferred rather than broken.
function deferredFeedHandler(command: string) {
  return async (): Promise<void> => {
    console.log(
      `[worker] ${command} fan-out is deferred (not implemented yet)`,
    );
  };
}

const handlers: Record<
  JobPayload['command'],
  (job: JobPayload) => Promise<void>
> = {
  SEND_MESSAGE: handleSendMessage as (job: JobPayload) => Promise<void>,
  MEMBERSHIP_CHANGED: handleMembershipChanged as (
    job: JobPayload,
  ) => Promise<void>,
  PROFILE_UPDATED: handleProfileUpdated as (job: JobPayload) => Promise<void>,
  BLACKBOARD_POSTED: deferredFeedHandler('BLACKBOARD_POSTED'),
  EVENT_UPDATED: deferredFeedHandler('EVENT_UPDATED'),
  CLUB_UPDATED: deferredFeedHandler('CLUB_UPDATED'),
};

export async function processJob(payload: JobPayload): Promise<void> {
  await handlers[payload.command](payload);
}

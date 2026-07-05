import { afterAll, beforeAll, describe, expect, it } from 'bun:test';
import { and, eq, inArray } from 'drizzle-orm';
import {
  db,
  chatMembers,
  chats,
  devices,
  institutions,
  messages,
  user,
  userCursorState,
  userEventStream,
} from '@repo/database';

import { processJob } from '../processors';

// Integration tests: require Postgres + Redis running (docker-compose.dev.yml).
// Each test creates its own institution/users/chat scoped by a random suffix
// and tears them down, so tests can run concurrently without colliding.

async function makeFixture() {
  const suffix = crypto.randomUUID().slice(0, 8);

  const [institution] = await db
    .insert(institutions)
    .values({ slug: `test-${suffix}`, displayName: 'Test institution' })
    .returning();
  const [alice] = await db
    .insert(user)
    .values({
      id: `alice-${suffix}`,
      name: 'Alice',
      email: `alice-${suffix}@test.invalid`,
    })
    .returning();
  const [bob] = await db
    .insert(user)
    .values({
      id: `bob-${suffix}`,
      name: 'Bob',
      email: `bob-${suffix}@test.invalid`,
    })
    .returning();
  const [aliceDevice] = await db
    .insert(devices)
    .values({ userId: alice.id, identityPubkey: Buffer.from('alice-pubkey') })
    .returning();
  const [chat] = await db
    .insert(chats)
    .values({ institutionId: institution.id, type: 'dm', createdBy: alice.id })
    .returning();
  await db.insert(chatMembers).values([
    { chatId: chat.id, userId: alice.id },
    { chatId: chat.id, userId: bob.id },
  ]);

  return { institution, alice, bob, aliceDevice, chat };
}

async function teardownFixture(
  fixture: Awaited<ReturnType<typeof makeFixture>>,
) {
  const userIds = [fixture.alice.id, fixture.bob.id];
  await db
    .delete(userEventStream)
    .where(inArray(userEventStream.userId, userIds));
  await db
    .delete(userCursorState)
    .where(inArray(userCursorState.userId, userIds));
  await db.delete(messages).where(eq(messages.chatId, fixture.chat.id));
  await db.delete(chatMembers).where(eq(chatMembers.chatId, fixture.chat.id));
  await db.delete(chats).where(eq(chats.id, fixture.chat.id));
  await db.delete(devices).where(inArray(devices.userId, userIds));
  await db.delete(user).where(inArray(user.id, userIds));
  await db
    .delete(institutions)
    .where(eq(institutions.id, fixture.institution.id));
}

describe('processJob', () => {
  let fixture: Awaited<ReturnType<typeof makeFixture>>;

  beforeAll(async () => {
    fixture = await makeFixture();
  });

  afterAll(async () => {
    await teardownFixture(fixture);
  });

  it('SEND_MESSAGE persists the message and fans out to every active member, including the sender', async () => {
    const messageId = crypto.randomUUID();

    await processJob({
      command: 'SEND_MESSAGE',
      message_id: messageId,
      chat_id: fixture.chat.id,
      sender_user_id: fixture.alice.id,
      sender_device_id: fixture.aliceDevice.id,
      mls_epoch: 0,
      ciphertext: Buffer.from('hello bob').toString('base64url'),
      content_type: 'application/json',
    });

    const [persisted] = await db
      .select()
      .from(messages)
      .where(eq(messages.id, messageId));
    expect(persisted).toBeDefined();
    expect(persisted?.ciphertext.toString()).toBe('hello bob');

    const events = await db
      .select()
      .from(userEventStream)
      .where(eq(userEventStream.entityId, messageId));

    const byUser = new Map(events.map((e) => [e.userId, e]));
    expect(byUser.size).toBe(2);
    expect(byUser.get(fixture.alice.id)?.eventType).toBe('message.created');
    expect(byUser.get(fixture.bob.id)?.eventType).toBe('message.created');
  });

  it('assigns strictly increasing per-user cursors across multiple messages', async () => {
    const firstId = crypto.randomUUID();
    const secondId = crypto.randomUUID();

    await processJob({
      command: 'SEND_MESSAGE',
      message_id: firstId,
      chat_id: fixture.chat.id,
      sender_user_id: fixture.bob.id,
      sender_device_id: fixture.aliceDevice.id,
      mls_epoch: 0,
      ciphertext: Buffer.from('msg one').toString('base64url'),
      content_type: 'application/json',
    });
    await processJob({
      command: 'SEND_MESSAGE',
      message_id: secondId,
      chat_id: fixture.chat.id,
      sender_user_id: fixture.bob.id,
      sender_device_id: fixture.aliceDevice.id,
      mls_epoch: 0,
      ciphertext: Buffer.from('msg two').toString('base64url'),
      content_type: 'application/json',
    });

    const events = await db
      .select()
      .from(userEventStream)
      .where(
        and(
          eq(userEventStream.userId, fixture.alice.id),
          inArray(userEventStream.entityId, [firstId, secondId]),
        ),
      )
      .orderBy(userEventStream.cursor);

    expect(events.length).toBe(2);
    expect((events[1]?.cursor ?? 0) > (events[0]?.cursor ?? 0)).toBe(true);
  });

  it('MEMBERSHIP_CHANGED notifies only the affected user', async () => {
    await processJob({
      command: 'MEMBERSHIP_CHANGED',
      chat_id: fixture.chat.id,
      user_id: fixture.bob.id,
      action: 'removed',
    });

    const events = await db
      .select()
      .from(userEventStream)
      .where(eq(userEventStream.entityId, fixture.chat.id));

    expect(events.length).toBe(1);
    expect(events[0]?.userId).toBe(fixture.bob.id);
    expect(events[0]?.eventType).toBe('membership.removed');
  });

  it('PROFILE_UPDATED notifies chat-mates but not the updated user', async () => {
    await processJob({
      command: 'PROFILE_UPDATED',
      user_id: fixture.alice.id,
    });

    const events = await db
      .select()
      .from(userEventStream)
      .where(
        and(
          eq(userEventStream.entityId, fixture.alice.id),
          eq(userEventStream.eventType, 'profile.updated'),
        ),
      );

    expect(events.length).toBe(1);
    expect(events[0]?.userId).toBe(fixture.bob.id);
  });
});

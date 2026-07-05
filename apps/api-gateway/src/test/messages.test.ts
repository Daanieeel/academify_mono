import { afterAll, beforeAll, describe, expect, it } from 'bun:test';
import { eq, inArray } from 'drizzle-orm';
import { auth } from '@repo/auth';
import {
  account,
  chatMembers,
  chats,
  db,
  devices,
  institutions,
  user,
  userCursorState,
  userEventStream,
  messages,
} from '@repo/database';

import { app } from '../index';

const PASSWORD = 'correct-horse-1';

async function seedUser(id: string, username: string) {
  const ctx = await auth.$context;
  const [created] = await db
    .insert(user)
    .values({
      id,
      name: id,
      email: `${id}@gateway-test.invalid`,
      username,
      displayUsername: username,
      emailVerified: true,
    })
    .returning();
  const hashed = await ctx.password.hash(PASSWORD);
  await db.insert(account).values({
    id: `${id}-account`,
    accountId: id,
    providerId: 'credential',
    userId: created?.id ?? '',
    password: hashed,
  });
  if (!created) {
    throw new Error('No user');
  }
  return created;
}

async function signIn(username: string): Promise<string> {
  const response = await app.handle(
    new Request('http://localhost/api/auth/sign-in/username', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password: PASSWORD }),
    }),
  );
  const setCookie = response.headers.get('set-cookie');
  if (!setCookie) {
    throw new Error(`sign-in failed for ${username}: ${await response.text()}`);
  }
  return setCookie.split(';')[0] ?? '';
}

describe('api-gateway messaging loop', () => {
  let aliceCookie: string;
  let bobCookie: string;
  let chatId: string;
  const suffix = crypto.randomUUID().slice(0, 8);
  const aliceId = `alice-${suffix}`;
  const bobId = `bob-${suffix}`;

  beforeAll(async () => {
    const [institution] = await db
      .insert(institutions)
      .values({ slug: `gw-test-${suffix}`, displayName: 'Gateway Test' })
      .returning();

    await seedUser(aliceId, `alice_${suffix}`);
    await seedUser(bobId, `bob_${suffix}`);

    const [chat] = await db
      .insert(chats)
      .values({
        institutionId: institution?.id ?? '',
        type: 'dm',
        createdBy: aliceId,
      })
      .returning();
    chatId = chat?.id ?? '';
    await db.insert(chatMembers).values([
      { chatId, userId: aliceId },
      { chatId, userId: bobId },
    ]);

    aliceCookie = await signIn(`alice_${suffix}`);
    bobCookie = await signIn(`bob_${suffix}`);
  });

  afterAll(async () => {
    const userIds = [aliceId, bobId];
    await db
      .delete(userEventStream)
      .where(inArray(userEventStream.userId, userIds));
    await db
      .delete(userCursorState)
      .where(inArray(userCursorState.userId, userIds));
    await db.delete(messages).where(eq(messages.chatId, chatId));
    await db.delete(chatMembers).where(eq(chatMembers.chatId, chatId));
    await db.delete(chats).where(eq(chats.id, chatId));
    await db.delete(devices).where(inArray(devices.userId, userIds));
    await db.delete(account).where(inArray(account.userId, userIds));
    await db.delete(user).where(inArray(user.id, userIds));
    const [institution] = await db
      .select()
      .from(institutions)
      .where(eq(institutions.slug, `gw-test-${suffix}`));
    if (institution) {
      await db.delete(institutions).where(eq(institutions.id, institution.id));
    }
  });

  it('rejects unauthenticated requests', async () => {
    const response = await app.handle(
      new Request('http://localhost/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ version: '1.0.0', after_cursor: '0' }),
      }),
    );

    expect(response.status).toBe(401);
  });

  it('delivers a sent message to the recipient via /sync, and /ack advances monotonically', async () => {
    const messageId = crypto.randomUUID();

    const deviceResponse = await app.handle(
      new Request('http://localhost/mls/devices', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Cookie: aliceCookie },
        body: JSON.stringify({
          identity_pubkey: Buffer.from('alice-pubkey').toString('base64url'),
        }),
      }),
    );
    const { device_id: deviceId } = (await deviceResponse.json()) as {
      device_id: string;
    };

    const sendResponse = await app.handle(
      new Request('http://localhost/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Cookie: aliceCookie },
        body: JSON.stringify({
          message_id: messageId,
          chat_id: chatId,
          sender_device_id: deviceId,
          mls_epoch: 0,
          ciphertext: Buffer.from('hello bob').toString('base64url'),
          content_type: 'application/json',
        }),
      }),
    );
    expect(sendResponse.status).toBe(200);

    // Worker processes the queue job asynchronously.
    await new Promise((resolve) => setTimeout(resolve, 500));

    const syncResponse = await app.handle(
      new Request('http://localhost/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Cookie: bobCookie },
        body: JSON.stringify({
          version: '1.0.0',
          after_cursor: '0',
          limit: 50,
        }),
      }),
    );
    const syncBody = (await syncResponse.json()) as {
      events: { entity_id: string; cursor: string }[];
    };
    expect(syncBody.events.some((event) => event.entity_id === messageId)).toBe(
      true,
    );

    const cursor =
      syncBody.events.find((event) => event.entity_id === messageId)?.cursor ??
      '';

    const ackResponse = await app.handle(
      new Request('http://localhost/ack', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Cookie: bobCookie },
        body: JSON.stringify({ version: '1.0.0', last_ack_cursor: cursor }),
      }),
    );
    const ackBody = (await ackResponse.json()) as { accepted: boolean };
    expect(ackBody.accepted).toBe(true);

    const staleAckResponse = await app.handle(
      new Request('http://localhost/ack', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Cookie: bobCookie },
        body: JSON.stringify({ version: '1.0.0', last_ack_cursor: '0' }),
      }),
    );
    const staleAckBody = (await staleAckResponse.json()) as {
      accepted: boolean;
    };
    expect(staleAckBody.accepted).toBe(false);
  });

  it('rejects sending to a chat the user is not a member of', async () => {
    const response = await app.handle(
      new Request('http://localhost/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Cookie: aliceCookie },
        body: JSON.stringify({
          message_id: crypto.randomUUID(),
          chat_id: crypto.randomUUID(),
          sender_device_id: crypto.randomUUID(),
          mls_epoch: 0,
          ciphertext: Buffer.from('nope').toString('base64url'),
          content_type: 'application/json',
        }),
      }),
    );

    expect(response.status).toBe(403);
  });
});

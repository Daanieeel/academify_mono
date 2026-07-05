import { afterAll, beforeAll, describe, expect, it } from 'bun:test';
import { eq, inArray } from 'drizzle-orm';
import { auth } from '@repo/auth';
import {
  account,
  chatMembers,
  chats,
  classes,
  classMemberships,
  db,
  devices,
  institutions,
  messages,
  profiles,
  user,
  userCursorState,
  userEventStream,
} from '@repo/database';

import { app } from '../index';

const PASSWORD = 'correct-horse-1';

async function seedUser(
  id: string,
  username: string,
  displayName: string,
  institutionId: string,
) {
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
  await db.insert(profiles).values({
    userId: created?.id ?? '',
    institutionId,
    displayNameCiphertext: displayName,
    keyVersion: 1,
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

describe('api-gateway chats routes', () => {
  const suffix = crypto.randomUUID().slice(0, 8);
  const aliceId = `alice-chats-${suffix}`;
  const bobId = `bob-chats-${suffix}`;
  let institutionId: string;
  let aliceCookie: string;
  let bobCookie: string;
  let chatId: string;
  let classId: string;

  beforeAll(async () => {
    const [institution] = await db
      .insert(institutions)
      .values({ slug: `chats-test-${suffix}`, displayName: 'Chats Test' })
      .returning();
    institutionId = institution?.id ?? '';

    await seedUser(aliceId, `alice_c_${suffix}`, 'Alice', institutionId);
    await seedUser(bobId, `bob_c_${suffix}`, 'Bob', institutionId);

    const [cls] = await db
      .insert(classes)
      .values({
        institutionId,
        name: `10a-${suffix}`,
        headTeacherUserId: aliceId,
      })
      .returning();
    classId = cls?.id ?? '';
    await db
      .insert(classMemberships)
      .values([{ classId, userId: bobId, role: 'student' }]);

    aliceCookie = await signIn(`alice_c_${suffix}`);
    bobCookie = await signIn(`bob_c_${suffix}`);
  });

  afterAll(async () => {
    const userIds = [aliceId, bobId];
    await db
      .delete(userEventStream)
      .where(inArray(userEventStream.userId, userIds));
    await db
      .delete(userCursorState)
      .where(inArray(userCursorState.userId, userIds));
    if (chatId) {
      await db.delete(messages).where(eq(messages.chatId, chatId));
      await db.delete(chatMembers).where(eq(chatMembers.chatId, chatId));
      await db.delete(chats).where(eq(chats.id, chatId));
    }
    await db
      .delete(classMemberships)
      .where(eq(classMemberships.classId, classId));
    await db.delete(classes).where(eq(classes.id, classId));
    await db.delete(devices).where(inArray(devices.userId, userIds));
    await db.delete(profiles).where(inArray(profiles.userId, userIds));
    await db.delete(account).where(inArray(account.userId, userIds));
    await db.delete(user).where(inArray(user.id, userIds));
    await db.delete(institutions).where(eq(institutions.id, institutionId));
  });

  it('GET /me returns the caller’s own profile', async () => {
    const response = await app.handle(
      new Request('http://localhost/me', { headers: { Cookie: aliceCookie } }),
    );
    const body = (await response.json()) as {
      user_id: string;
      display_name: string;
    };
    expect(body.user_id).toBe(aliceId);
    expect(body.display_name).toBe('Alice');
  });

  it('GET /contacts lists other users in the same institution', async () => {
    const response = await app.handle(
      new Request('http://localhost/contacts', {
        headers: { Cookie: aliceCookie },
      }),
    );
    const body = (await response.json()) as {
      user_id: string;
      display_name: string;
    }[];
    expect(
      body.some(
        (contact) =>
          contact.user_id === bobId && contact.display_name === 'Bob',
      ),
    ).toBe(true);
  });

  it('GET /contacts includes class_name for contacts with an active membership', async () => {
    const response = await app.handle(
      new Request('http://localhost/contacts', {
        headers: { Cookie: aliceCookie },
      }),
    );
    const body = (await response.json()) as {
      user_id: string;
      class_name: string | null;
    }[];
    const bob = body.find((contact) => contact.user_id === bobId);
    expect(bob?.class_name).toBe(`10a-${suffix}`);
  });

  it('PATCH /me/avatar persists and is reflected in a subsequent GET /me', async () => {
    const patchResponse = await app.handle(
      new Request('http://localhost/me/avatar', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', Cookie: aliceCookie },
        body: JSON.stringify({ background_color: '#FF00FF', emoji: '🎉' }),
      }),
    );
    expect(patchResponse.status).toBe(200);
    const patchBody = (await patchResponse.json()) as {
      avatar_background_color: string | null;
      avatar_emoji: string | null;
    };
    expect(patchBody.avatar_background_color).toBe('#FF00FF');
    expect(patchBody.avatar_emoji).toBe('🎉');

    const meResponse = await app.handle(
      new Request('http://localhost/me', { headers: { Cookie: aliceCookie } }),
    );
    const meBody = (await meResponse.json()) as {
      avatar_background_color: string | null;
      avatar_emoji: string | null;
    };
    expect(meBody.avatar_background_color).toBe('#FF00FF');
    expect(meBody.avatar_emoji).toBe('🎉');
  });

  it('PATCH /me/avatar rejects a malformed background color', async () => {
    const response = await app.handle(
      new Request('http://localhost/me/avatar', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', Cookie: aliceCookie },
        body: JSON.stringify({ background_color: 'not-a-color', emoji: '🎉' }),
      }),
    );
    expect(response.status).toBe(422);
  });

  it('GET /contacts surfaces a peer’s generated avatar', async () => {
    await app.handle(
      new Request('http://localhost/me/avatar', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', Cookie: bobCookie },
        body: JSON.stringify({ background_color: '#00FF00', emoji: '🐸' }),
      }),
    );

    const response = await app.handle(
      new Request('http://localhost/contacts', {
        headers: { Cookie: aliceCookie },
      }),
    );
    const body = (await response.json()) as {
      user_id: string;
      avatar_background_color: string | null;
      avatar_emoji: string | null;
    }[];
    const bob = body.find((contact) => contact.user_id === bobId);
    expect(bob?.avatar_background_color).toBe('#00FF00');
    expect(bob?.avatar_emoji).toBe('🐸');
  });

  it('GET /classes lists the institution’s classes with member counts', async () => {
    const response = await app.handle(
      new Request('http://localhost/classes', {
        headers: { Cookie: aliceCookie },
      }),
    );
    const body = (await response.json()) as {
      class_id: string;
      class_name: string;
      member_count: number;
    }[];
    const cls = body.find((entry) => entry.class_id === classId);
    expect(cls?.class_name).toBe(`10a-${suffix}`);
    expect(cls?.member_count).toBe(1);
  });

  it('POST /chats creates a DM, and is idempotent on retry', async () => {
    const first = await app.handle(
      new Request('http://localhost/chats', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Cookie: aliceCookie },
        body: JSON.stringify({ peer_user_id: bobId }),
      }),
    );
    const firstBody = (await first.json()) as { chat_id: string };
    chatId = firstBody.chat_id;
    expect(chatId).toBeTruthy();

    const second = await app.handle(
      new Request('http://localhost/chats', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Cookie: aliceCookie },
        body: JSON.stringify({ peer_user_id: bobId }),
      }),
    );
    const secondBody = (await second.json()) as { chat_id: string };
    expect(secondBody.chat_id).toBe(chatId);
  });

  it('GET /chats lists the DM with the peer’s display name', async () => {
    const response = await app.handle(
      new Request('http://localhost/chats', { headers: { Cookie: bobCookie } }),
    );
    const body = (await response.json()) as {
      chats: {
        chat_id: string;
        peer: { user_id: string; display_name: string } | null;
      }[];
    };
    const entry = body.chats.find((chatEntry) => chatEntry.chat_id === chatId);
    expect(entry?.peer?.user_id).toBe(aliceId);
    expect(entry?.peer?.display_name).toBe('Alice');
  });

  it('GET /chats/:id reports no MLS group yet', async () => {
    const response = await app.handle(
      new Request(`http://localhost/chats/${chatId}`, {
        headers: { Cookie: aliceCookie },
      }),
    );
    const body = (await response.json()) as {
      group_exists: boolean;
      peer: { user_id: string } | null;
    };
    expect(body.group_exists).toBe(false);
    expect(body.peer?.user_id).toBe(bobId);
  });

  it('a sent message shows up in /chats/:id/messages and flips /chats unread state', async () => {
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

    const messageId = crypto.randomUUID();
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

    const historyResponse = await app.handle(
      new Request(`http://localhost/chats/${chatId}/messages`, {
        headers: { Cookie: bobCookie },
      }),
    );
    const historyBody = (await historyResponse.json()) as {
      messages: { message_id: string }[];
    };
    expect(
      historyBody.messages.some((message) => message.message_id === messageId),
    ).toBe(true);

    const bobChatsResponse = await app.handle(
      new Request('http://localhost/chats', { headers: { Cookie: bobCookie } }),
    );
    const bobChatsBody = (await bobChatsResponse.json()) as {
      chats: { chat_id: string; read: boolean }[];
    };
    const bobEntry = bobChatsBody.chats.find(
      (chatEntry) => chatEntry.chat_id === chatId,
    );
    expect(bobEntry?.read).toBe(false);

    // Alice sent it herself — her own copy should never show as unread.
    const aliceChatsResponse = await app.handle(
      new Request('http://localhost/chats', {
        headers: { Cookie: aliceCookie },
      }),
    );
    const aliceChatsBody = (await aliceChatsResponse.json()) as {
      chats: { chat_id: string; read: boolean }[];
    };
    const aliceEntry = aliceChatsBody.chats.find(
      (chatEntry) => chatEntry.chat_id === chatId,
    );
    expect(aliceEntry?.read).toBe(true);
  });
});

import { afterAll, beforeAll, describe, expect, it } from 'bun:test';
import { eq, inArray } from 'drizzle-orm';
import { auth } from '@repo/auth';
import {
  account,
  auditLog,
  chatMembers,
  chats,
  classes,
  classMemberships,
  complianceKeys,
  db,
  devices,
  institutions,
  messages,
  mlsGroupMembers,
  mlsGroups,
  profiles,
  reportApprovals,
  reportPackages,
  reports,
  roleBindings,
  user,
  userCursorState,
  userEventStream,
} from '@repo/database';
import { generateComplianceKeyPair, sealToPublicKey } from '@repo/crypto';
import { MlsParty } from '@repo/mls';

import { SyncClient, type SyncClientEventHandler } from '../sync-client';

// Full end-to-end harness (Ticket 1.7 / Phase 7): spawns the *real*
// api-gateway and worker as child processes (not in-process `.handle()`,
// since that can't exercise a real WS upgrade), drives two simulated users
// through real MLS encryption, the sync engine (live push + reconnect catch-up),
// and the report-escrow dual-auth review — over real HTTP/WS, against real
// Postgres + Redis.
//
// Requires: docker-compose.dev.yml services running.

const PASSWORD = 'correct-horse-1';
const TEST_PORT = 3099;
const BACKEND_URL = `http://localhost:${TEST_PORT}`;

function decodeBase64Url(value: string): Uint8Array {
  return new Uint8Array(Buffer.from(value, 'base64url'));
}

function encodeBase64Url(bytes: Uint8Array): string {
  return Buffer.from(bytes).toString('base64url');
}

async function waitForHealth(timeoutMs: number): Promise<void> {
  const deadline = Date.now() + timeoutMs;
  while (Date.now() < deadline) {
    try {
      const response = await fetch(`${BACKEND_URL}/health`);
      if (response.ok) {
        return;
      }
    } catch {
      // not up yet
    }
    await new Promise((resolve) => setTimeout(resolve, 200));
  }
  throw new Error('gateway did not become healthy in time');
}

async function seedUser(id: string, username: string, institutionId: string) {
  const ctx = await auth.$context;
  const [created] = await db
    .insert(user)
    .values({
      id,
      name: id,
      email: `${id}@e2e-harness.invalid`,
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
    userId: created!.id,
    password: hashed,
  });
  // Institution context (used by the auth middleware to derive `institutionId`)
  // comes from `profiles`, not the auth identity — deliberately separate.
  await db.insert(profiles).values({
    userId: created!.id,
    institutionId,
    displayNameCiphertext: id,
    keyVersion: 1,
  });
  return created!;
}

async function signIn(username: string): Promise<string> {
  const response = await fetch(`${BACKEND_URL}/api/auth/sign-in/username`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password: PASSWORD }),
  });
  const setCookie = response.headers.get('set-cookie');
  if (!setCookie) {
    throw new Error(`sign-in failed for ${username}: ${await response.text()}`);
  }
  return setCookie.split(';')[0]!;
}

describe('end-to-end messaging + report harness', () => {
  let gatewayProcess: ReturnType<typeof Bun.spawn>;
  let workerProcess: ReturnType<typeof Bun.spawn>;

  const suffix = crypto.randomUUID().slice(0, 8);
  const aliceId = `e2e-alice-${suffix}`;
  const bobId = `e2e-bob-${suffix}`;
  const adminId = `e2e-admin-${suffix}`;
  const teacherId = `e2e-teacher-${suffix}`;

  let chatId: string;
  let aliceCookie: string;
  let bobCookie: string;
  let adminCookie: string;
  let teacherCookie: string;
  let complianceKeyPair: { publicKey: Buffer; privateKey: Buffer };
  let institutionId: string;

  beforeAll(async () => {
    complianceKeyPair = generateComplianceKeyPair();

    const [institution] = await db
      .insert(institutions)
      .values({
        slug: `e2e-harness-${suffix}`,
        displayName: 'E2E Harness School',
      })
      .returning();
    institutionId = institution!.id;

    await db.insert(complianceKeys).values({
      institutionId,
      keyVersion: 1,
      publicKey: complianceKeyPair.publicKey,
    });

    await seedUser(aliceId, `alice_h_${suffix}`, institutionId);
    await seedUser(bobId, `bob_h_${suffix}`, institutionId);
    const admin = await seedUser(adminId, `admin_h_${suffix}`, institutionId);
    const teacher = await seedUser(
      teacherId,
      `teacher_h_${suffix}`,
      institutionId,
    );
    await db
      .insert(roleBindings)
      .values({ userId: admin.id, institutionId, role: 'admin' });

    const [cls] = await db
      .insert(classes)
      .values({
        institutionId,
        name: `10A-${suffix}`,
        headTeacherUserId: teacher.id,
      })
      .returning();
    await db.insert(classMemberships).values([
      { classId: cls!.id, userId: aliceId, role: 'student' },
      { classId: cls!.id, userId: bobId, role: 'student' },
    ]);

    const [chat] = await db
      .insert(chats)
      .values({ institutionId, type: 'dm', createdBy: aliceId })
      .returning();
    chatId = chat!.id;
    await db.insert(chatMembers).values([
      { chatId, userId: aliceId },
      { chatId, userId: bobId },
    ]);

    workerProcess = Bun.spawn(['bun', 'run', 'index.ts'], {
      cwd: `${import.meta.dir}/../../../../apps/worker`,
      env: { ...process.env },
      stdout: 'ignore',
      stderr: 'inherit',
    });

    gatewayProcess = Bun.spawn(['bun', 'run', 'src/index.ts'], {
      cwd: `${import.meta.dir}/../../../../apps/api-gateway`,
      env: {
        ...process.env,
        API_GATEWAY_PORT: String(TEST_PORT),
        COMPLIANCE_PRIVATE_KEY:
          complianceKeyPair.privateKey.toString('base64url'),
      },
      stdout: 'ignore',
      stderr: 'inherit',
    });

    await waitForHealth(15_000);

    aliceCookie = await signIn(`alice_h_${suffix}`);
    bobCookie = await signIn(`bob_h_${suffix}`);
    adminCookie = await signIn(`admin_h_${suffix}`);
    teacherCookie = await signIn(`teacher_h_${suffix}`);
  }, 30_000);

  afterAll(async () => {
    gatewayProcess?.kill();
    workerProcess?.kill();

    const userIds = [aliceId, bobId, adminId, teacherId];
    await db.delete(auditLog).where(inArray(auditLog.actorUserId, userIds));
    await db
      .delete(reportApprovals)
      .where(
        inArray(
          reportApprovals.reportId,
          db
            .select({ id: reports.id })
            .from(reports)
            .where(eq(reports.chatId, chatId)),
        ),
      );
    await db
      .delete(reportPackages)
      .where(
        inArray(
          reportPackages.reportId,
          db
            .select({ id: reports.id })
            .from(reports)
            .where(eq(reports.chatId, chatId)),
        ),
      );
    await db.delete(reports).where(eq(reports.chatId, chatId));
    await db
      .delete(userEventStream)
      .where(inArray(userEventStream.userId, userIds));
    await db
      .delete(userCursorState)
      .where(inArray(userCursorState.userId, userIds));
    await db.delete(messages).where(eq(messages.chatId, chatId));
    await db
      .delete(mlsGroupMembers)
      .where(
        inArray(
          mlsGroupMembers.groupId,
          db
            .select({ id: mlsGroups.id })
            .from(mlsGroups)
            .where(eq(mlsGroups.chatId, chatId)),
        ),
      );
    await db.delete(mlsGroups).where(eq(mlsGroups.chatId, chatId));
    await db.delete(devices).where(inArray(devices.userId, userIds));
    await db.delete(chatMembers).where(eq(chatMembers.chatId, chatId));
    await db.delete(chats).where(eq(chats.id, chatId));
    await db
      .delete(classMemberships)
      .where(inArray(classMemberships.userId, userIds));
    await db.delete(classes).where(eq(classes.institutionId, institutionId));
    await db.delete(profiles).where(inArray(profiles.userId, userIds));
    await db.delete(roleBindings).where(inArray(roleBindings.userId, userIds));
    await db
      .delete(complianceKeys)
      .where(eq(complianceKeys.institutionId, institutionId));
    await db.delete(account).where(inArray(account.userId, userIds));
    await db.delete(user).where(inArray(user.id, userIds));
    await db.delete(institutions).where(eq(institutions.id, institutionId));
  }, 15_000);

  it('delivers a real MLS-encrypted message live, then via reconnect catch-up, and survives the report-escrow dual-auth review', async () => {
    // --- MLS handshake, real wasm32 OpenMLS, through the real gateway DS ---
    const alice = new MlsParty(aliceId);
    const bob = new MlsParty(bobId);

    const bobKeyPackage = bob.generate_key_package();
    const bobDeviceRes = await fetch(`${BACKEND_URL}/mls/devices`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Cookie: bobCookie },
      body: JSON.stringify({
        identity_pubkey: encodeBase64Url(new Uint8Array([1])),
      }),
    });
    const { device_id: bobDeviceId } = (await bobDeviceRes.json()) as {
      device_id: string;
    };
    await fetch(`${BACKEND_URL}/mls/key-packages`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Cookie: bobCookie },
      body: JSON.stringify({
        device_id: bobDeviceId,
        key_package_bytes: encodeBase64Url(bobKeyPackage),
      }),
    });

    const aliceDeviceRes = await fetch(`${BACKEND_URL}/mls/devices`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Cookie: aliceCookie },
      body: JSON.stringify({
        identity_pubkey: encodeBase64Url(new Uint8Array([2])),
      }),
    });
    const { device_id: aliceDeviceId } = (await aliceDeviceRes.json()) as {
      device_id: string;
    };

    const consumeRes = await fetch(`${BACKEND_URL}/mls/key-packages/consume`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Cookie: aliceCookie },
      body: JSON.stringify({ user_id: bobId }),
    });
    const { key_package_bytes: consumedKeyPackage } =
      (await consumeRes.json()) as {
        key_package_bytes: string;
      };

    alice.create_group();
    const welcome = alice.add_member(decodeBase64Url(consumedKeyPackage));

    await fetch(`${BACKEND_URL}/mls/groups`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Cookie: aliceCookie },
      body: JSON.stringify({
        chat_id: chatId,
        mls_group_id: encodeBase64Url(new Uint8Array([9, 9, 9])),
        cipher_suite: 'MLS_128_DHKEMX25519_AES128GCM_SHA256_Ed25519',
        device_id: aliceDeviceId,
      }),
    });
    await fetch(`${BACKEND_URL}/mls/groups/${chatId}/members`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Cookie: aliceCookie },
      body: JSON.stringify({
        new_member_user_id: bobId,
        new_member_device_id: bobDeviceId,
        leaf_index: 1,
        new_epoch: 1,
        welcome_bytes: encodeBase64Url(welcome),
      }),
    });

    const welcomeRes = await fetch(
      `${BACKEND_URL}/mls/groups/${chatId}/welcome`,
      {
        headers: { Cookie: bobCookie },
      },
    );
    const { welcome_bytes: fetchedWelcome } = (await welcomeRes.json()) as {
      welcome_bytes: string;
    };
    bob.join_from_welcome(decodeBase64Url(fetchedWelcome));

    // --- Bob is connected (live path) when Alice sends message 1 ---
    const decryptedByBob: string[] = [];
    let bobLastAppliedCursor = '0';
    const onBobEvent: SyncClientEventHandler = async (event) => {
      // Real clients persist their own last-applied cursor and never replay
      // from scratch — each MLS application-message secret is single-use
      // (forward secrecy), so re-decrypting an already-applied message would
      // be a real protocol violation (OpenMLS correctly rejects it), not
      // something a reconnect should ever actually trigger.
      bobLastAppliedCursor = event.cursor;
      if (event.event_type !== 'message.created') {
        return;
      }
      const res = await fetch(`${BACKEND_URL}/messages/${event.entity_id}`, {
        headers: { Cookie: bobCookie },
      });
      const body = (await res.json()) as { ciphertext: string };
      const plaintext = bob.decrypt(decodeBase64Url(body.ciphertext));
      decryptedByBob.push(new TextDecoder().decode(plaintext));
    };

    const bobClient = new SyncClient(
      { backendUrl: BACKEND_URL, headers: { Cookie: bobCookie } },
      onBobEvent,
    );
    await bobClient.connect('0');
    expect(bobClient.getState()).toBe('live');

    const firstMessageId = crypto.randomUUID();
    const firstCiphertext = alice.encrypt(
      new TextEncoder().encode('hello bob, live'),
    );
    await fetch(`${BACKEND_URL}/messages`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Cookie: aliceCookie },
      body: JSON.stringify({
        message_id: firstMessageId,
        chat_id: chatId,
        sender_device_id: aliceDeviceId,
        mls_epoch: 1,
        ciphertext: encodeBase64Url(firstCiphertext),
        content_type: 'application/json',
      }),
    });

    await new Promise((resolve) => setTimeout(resolve, 700));
    expect(decryptedByBob).toContain('hello bob, live');

    // --- Bob disconnects (offline); Alice sends message 2 while he's gone ---
    bobClient.disconnect();
    await new Promise((resolve) => setTimeout(resolve, 200));

    const secondMessageId = crypto.randomUUID();
    const secondCiphertext = alice.encrypt(
      new TextEncoder().encode('hello bob, while offline'),
    );
    await fetch(`${BACKEND_URL}/messages`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Cookie: aliceCookie },
      body: JSON.stringify({
        message_id: secondMessageId,
        chat_id: chatId,
        sender_device_id: aliceDeviceId,
        mls_epoch: 1,
        ciphertext: encodeBase64Url(secondCiphertext),
        content_type: 'application/json',
      }),
    });
    await new Promise((resolve) => setTimeout(resolve, 500));

    // --- Bob reconnects from where he left off: gap path, catch-up fetch loop ---
    const bobClient2 = new SyncClient(
      { backendUrl: BACKEND_URL, headers: { Cookie: bobCookie } },
      onBobEvent,
    );
    await bobClient2.connect(bobLastAppliedCursor);
    expect(decryptedByBob).toContain('hello bob, while offline');
    bobClient2.disconnect();

    // --- Bob reports the second message; admin + Klassenlehrer dual-approve ---
    const reportPlaintext = JSON.stringify({
      message: 'hello bob, while offline',
      sender: aliceId,
      reason: 'reported in e2e harness',
    });
    const sealed = sealToPublicKey(
      reportPlaintext,
      complianceKeyPair.publicKey,
    );
    const reportRes = await fetch(`${BACKEND_URL}/reports`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Cookie: bobCookie },
      body: JSON.stringify({
        reported_message_id: secondMessageId,
        chat_id: chatId,
        encrypted_package: sealed,
        compliance_key_version: 1,
        content_hash: 'unused-in-this-harness',
      }),
    });
    const { report_id: reportId } = (await reportRes.json()) as {
      report_id: string;
    };

    const firstApproval = await fetch(
      `${BACKEND_URL}/reports/${reportId}/review`,
      {
        method: 'POST',
        headers: { Cookie: adminCookie },
      },
    );
    const firstApprovalBody = (await firstApproval.json()) as {
      status: string;
    };
    expect(firstApprovalBody.status).toBe('awaiting_second_approval');

    const secondApproval = await fetch(
      `${BACKEND_URL}/reports/${reportId}/review`,
      {
        method: 'POST',
        headers: { Cookie: teacherCookie },
      },
    );
    const secondApprovalBody = (await secondApproval.json()) as {
      status: string;
      plaintext: string;
    };
    expect(secondApprovalBody.status).toBe('approved');
    expect(secondApprovalBody.plaintext).toBe(reportPlaintext);
  }, 20_000);
});

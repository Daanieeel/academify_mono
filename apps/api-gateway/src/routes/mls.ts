import { and, eq, isNull } from 'drizzle-orm';

import { Elysia, t } from 'elysia';
import {
  chatMembers,
  db,
  devices,
  keyPackages,
  mlsGroupMembers,
  mlsGroups,
} from '@repo/database';

import { authMiddleware } from '../auth-middleware';

// Pure Delivery Service: stores/relays MLS metadata and ciphertext blobs the
// client gave it; never touches the wasm bindings or private key material
// (ADR-0008). Membership/epoch state here mirrors what each client already
// computed locally — the gateway doesn't run the MLS state machine itself.
export const mlsRoutes = new Elysia()
  .use(authMiddleware)
  .post(
    '/mls/devices',
    async ({ body, userId }) => {
      const [device] = await db
        .insert(devices)
        .values({
          userId,
          label: body.label,
          identityPubkey: Buffer.from(body.identity_pubkey, 'base64url'),
        })
        .returning({ id: devices.id });

      return { device_id: device!.id };
    },
    {
      body: t.Object({
        label: t.Optional(t.String()),
        identity_pubkey: t.String({ minLength: 1 }),
      }),
    },
  )
  // Purge all unconsumed key packages for every device belonging to the
  // current user. Called at session start so stale key material from a
  // previous run (whose in-memory MLS party is now gone) can never be
  // consumed by a peer, avoiding NoMatchingKeyPackage on joinFromWelcome.
  .delete('/mls/key-packages', async ({ userId }) => {
    // Collect all device IDs owned by this user
    const userDevices = await db
      .select({ id: devices.id })
      .from(devices)
      .where(and(eq(devices.userId, userId), isNull(devices.revokedAt)));

    if (userDevices.length > 0) {
      const deviceIds = userDevices.map((d) => d.id);
      // Mark unconsumed packages as consumed (soft-delete)
      for (const deviceId of deviceIds) {
        await db
          .update(keyPackages)
          .set({ consumedAt: new Date() })
          .where(
            and(
              eq(keyPackages.deviceId, deviceId),
              isNull(keyPackages.consumedAt),
            ),
          );
      }
    }

    return { purged: true };
  })
  .post(
    '/mls/key-packages',
    async ({ body, userId, status }) => {
      const [device] = await db
        .select({ id: devices.id })
        .from(devices)
        .where(and(eq(devices.id, body.device_id), eq(devices.userId, userId)));

      if (!device) {
        return status(403, { error: 'device does not belong to this user' });
      }

      const [keyPackage] = await db
        .insert(keyPackages)
        .values({
          deviceId: body.device_id,
          keyPackageBytes: Buffer.from(body.key_package_bytes, 'base64url'),
        })
        .returning({ id: keyPackages.id });

      return { key_package_id: keyPackage!.id };
    },
    {
      body: t.Object({
        device_id: t.String({ format: 'uuid' }),
        key_package_bytes: t.String({ minLength: 1 }),
      }),
    },
  )
  .post(
    '/mls/key-packages/consume',
    async ({ body, status }) => {
      const consumed = await db.transaction(async (tx) => {
        const [candidate] = await tx
          .select({
            id: keyPackages.id,
            deviceId: keyPackages.deviceId,
            keyPackageBytes: keyPackages.keyPackageBytes,
          })
          .from(keyPackages)
          .innerJoin(devices, eq(devices.id, keyPackages.deviceId))
          .where(
            and(
              eq(devices.userId, body.user_id),
              isNull(devices.revokedAt),
              isNull(keyPackages.consumedAt),
            ),
          )
          .orderBy(keyPackages.createdAt)
          .limit(1)
          .for('update', { of: keyPackages, skipLocked: true });

        if (!candidate) {
          return null;
        }

        await tx
          .update(keyPackages)
          .set({ consumedAt: new Date() })
          .where(eq(keyPackages.id, candidate.id));

        return candidate;
      });

      if (!consumed) {
        return status(404, { error: 'no available key package for this user' });
      }

      return {
        device_id: consumed.deviceId,
        key_package_bytes: consumed.keyPackageBytes.toString('base64url'),
      };
    },
    {
      body: t.Object({ user_id: t.String({ minLength: 1 }) }),
    },
  )
  .post(
    '/mls/groups',
    async ({ body, userId, status }) => {
      const [membership] = await db
        .select({ userId: chatMembers.userId })
        .from(chatMembers)
        .where(
          and(
            eq(chatMembers.chatId, body.chat_id),
            eq(chatMembers.userId, userId),
            eq(chatMembers.state, 'active'),
          ),
        );

      if (!membership) {
        return status(403, { error: 'not a member of this chat' });
      }

      const group = await db.transaction(async (tx) => {
        const [created] = await tx
          .insert(mlsGroups)
          .values({
            chatId: body.chat_id,
            mlsGroupId: Buffer.from(body.mls_group_id, 'base64url'),
            cipherSuite: body.cipher_suite,
          })
          .returning();

        await tx.insert(mlsGroupMembers).values({
          groupId: created!.id,
          userId,
          deviceId: body.device_id,
          leafIndex: 0,
          addedEpoch: 0,
        });

        return created!;
      });

      return { group_id: group.id, current_epoch: group.currentEpoch };
    },
    {
      body: t.Object({
        chat_id: t.String({ minLength: 1 }),
        mls_group_id: t.String({ minLength: 1 }),
        cipher_suite: t.String({ minLength: 1 }),
        device_id: t.String({ format: 'uuid' }),
      }),
    },
  )
  .post(
    '/mls/groups/:chatId/members',
    async ({ params, body, userId, status }) => {
      const [group] = await db
        .select()
        .from(mlsGroups)
        .where(eq(mlsGroups.chatId, params.chatId));

      if (!group) {
        return status(404, { error: 'no MLS group for this chat' });
      }

      const [callerMembership] = await db
        .select({ userId: mlsGroupMembers.userId })
        .from(mlsGroupMembers)
        .where(
          and(
            eq(mlsGroupMembers.groupId, group.id),
            eq(mlsGroupMembers.userId, userId),
            isNull(mlsGroupMembers.removedEpoch),
          ),
        );

      if (!callerMembership) {
        return status(403, { error: 'not a member of this MLS group' });
      }

      await db.transaction(async (tx) => {
        await tx.insert(mlsGroupMembers).values({
          groupId: group.id,
          userId: body.new_member_user_id,
          deviceId: body.new_member_device_id,
          leafIndex: body.leaf_index,
          addedEpoch: body.new_epoch,
          pendingWelcome: Buffer.from(body.welcome_bytes, 'base64url'),
        });

        await tx
          .update(mlsGroups)
          .set({ currentEpoch: body.new_epoch })
          .where(eq(mlsGroups.id, group.id));
      });

      return { accepted: true };
    },
    {
      params: t.Object({ chatId: t.String({ minLength: 1 }) }),
      body: t.Object({
        new_member_user_id: t.String({ minLength: 1 }),
        new_member_device_id: t.String({ format: 'uuid' }),
        leaf_index: t.Integer({ minimum: 0 }),
        new_epoch: t.Integer({ minimum: 0 }),
        welcome_bytes: t.String({ minLength: 1 }),
      }),
    },
  )
  .get(
    '/mls/groups/:chatId/welcome',
    async ({ params, userId, status }) => {
      const [group] = await db
        .select({ id: mlsGroups.id })
        .from(mlsGroups)
        .where(eq(mlsGroups.chatId, params.chatId));

      if (!group) {
        return status(404, { error: 'no MLS group for this chat' });
      }

      const fetched = await db.transaction(async (tx) => {
        const [member] = await tx
          .select()
          .from(mlsGroupMembers)
          .where(
            and(
              eq(mlsGroupMembers.groupId, group.id),
              eq(mlsGroupMembers.userId, userId),
            ),
          )
          .for('update', { of: mlsGroupMembers });

        if (!member?.pendingWelcome) {
          return null;
        }

        await tx
          .update(mlsGroupMembers)
          .set({ pendingWelcome: null })
          .where(eq(mlsGroupMembers.id, member.id));

        return member.pendingWelcome;
      });

      if (!fetched) {
        return status(404, { error: 'no pending welcome' });
      }

      return { welcome_bytes: fetched.toString('base64url') };
    },
    { params: t.Object({ chatId: t.String({ minLength: 1 }) }) },
  )
  .get(
    '/mls/groups/:chatId',
    async ({ params, userId, status }) => {
      const [group] = await db
        .select()
        .from(mlsGroups)
        .where(eq(mlsGroups.chatId, params.chatId));

      if (!group) {
        return status(404, { error: 'no MLS group for this chat' });
      }

      const members = await db
        .select({
          userId: mlsGroupMembers.userId,
          leafIndex: mlsGroupMembers.leafIndex,
          addedEpoch: mlsGroupMembers.addedEpoch,
          removedEpoch: mlsGroupMembers.removedEpoch,
        })
        .from(mlsGroupMembers)
        .where(eq(mlsGroupMembers.groupId, group.id));

      const isMember = members.some(
        (member) => member.userId === userId && member.removedEpoch === null,
      );
      if (!isMember) {
        return status(403, { error: 'not a member of this MLS group' });
      }

      return {
        current_epoch: group.currentEpoch,
        cipher_suite: group.cipherSuite,
        members: members.map((member) => ({
          user_id: member.userId,
          leaf_index: member.leafIndex,
          active: member.removedEpoch === null,
        })),
      };
    },
    { params: t.Object({ chatId: t.String({ minLength: 1 }) }) },
  );

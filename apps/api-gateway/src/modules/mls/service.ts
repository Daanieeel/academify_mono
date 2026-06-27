import { and, eq, isNull } from 'drizzle-orm';
import {
  chatMembers,
  db,
  devices,
  keyPackages,
  mlsGroupMembers,
  mlsGroups,
} from '@repo/database';
import { AppError } from '../../plugins/error';

export class MlsService {
  static async registerDevice(
    userId: string,
    label: string | undefined,
    identityPubkey: string,
  ) {
    const [device] = await db
      .insert(devices)
      .values({
        userId,
        label,
        identityPubkey: Buffer.from(identityPubkey, 'base64url'),
      })
      .returning({ id: devices.id });

    return { device_id: device!.id };
  }

  static async purgeUnconsumedKeyPackages(userId: string) {
    const userDevices = await db
      .select({ id: devices.id })
      .from(devices)
      .where(and(eq(devices.userId, userId), isNull(devices.revokedAt)));

    if (userDevices.length > 0) {
      const deviceIds = userDevices.map((d) => d.id);
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
  }

  static async uploadKeyPackage(
    userId: string,
    deviceId: string,
    keyPackageBytes: string,
  ) {
    const [device] = await db
      .select({ id: devices.id })
      .from(devices)
      .where(and(eq(devices.id, deviceId), eq(devices.userId, userId)));

    if (!device) {
      throw new AppError(
        403,
        'DEVICE_NOT_OWNED',
        'device does not belong to this user',
      );
    }

    const [keyPackage] = await db
      .insert(keyPackages)
      .values({
        deviceId,
        keyPackageBytes: Buffer.from(keyPackageBytes, 'base64url'),
      })
      .returning({ id: keyPackages.id });

    return { key_package_id: keyPackage!.id };
  }

  static async consumeKeyPackage(targetUserId: string) {
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
            eq(devices.userId, targetUserId),
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
      throw new AppError(
        404,
        'NO_KEY_PACKAGE',
        'no available key package for this user',
      );
    }

    return {
      device_id: consumed.deviceId,
      key_package_bytes: consumed.keyPackageBytes.toString('base64url'),
    };
  }

  static async createGroup(
    userId: string,
    chatId: string,
    mlsGroupId: string,
    cipherSuite: string,
    deviceId: string,
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

    const group = await db.transaction(async (tx) => {
      const [created] = await tx
        .insert(mlsGroups)
        .values({
          chatId: chatId,
          mlsGroupId: Buffer.from(mlsGroupId, 'base64url'),
          cipherSuite: cipherSuite,
        })
        .returning();

      await tx.insert(mlsGroupMembers).values({
        groupId: created!.id,
        userId,
        deviceId,
        leafIndex: 0,
        addedEpoch: 0,
      });

      return created!;
    });

    return { group_id: group.id, current_epoch: group.currentEpoch };
  }

  static async addGroupMember(
    userId: string,
    chatId: string,
    newMemberUserId: string,
    newMemberDeviceId: string,
    leafIndex: number,
    newEpoch: number,
    welcomeBytes: string,
  ) {
    const [group] = await db
      .select()
      .from(mlsGroups)
      .where(eq(mlsGroups.chatId, chatId));

    if (!group) {
      throw new AppError(404, 'NO_MLS_GROUP', 'no MLS group for this chat');
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
      throw new AppError(
        403,
        'NOT_MLS_GROUP_MEMBER',
        'not a member of this MLS group',
      );
    }

    await db.transaction(async (tx) => {
      await tx.insert(mlsGroupMembers).values({
        groupId: group.id,
        userId: newMemberUserId,
        deviceId: newMemberDeviceId,
        leafIndex: leafIndex,
        addedEpoch: newEpoch,
        pendingWelcome: Buffer.from(welcomeBytes, 'base64url'),
      });

      await tx
        .update(mlsGroups)
        .set({ currentEpoch: newEpoch })
        .where(eq(mlsGroups.id, group.id));
    });

    return { accepted: true };
  }

  static async getGroupWelcome(userId: string, chatId: string) {
    const [group] = await db
      .select({ id: mlsGroups.id })
      .from(mlsGroups)
      .where(eq(mlsGroups.chatId, chatId));

    if (!group) {
      throw new AppError(404, 'NO_MLS_GROUP', 'no MLS group for this chat');
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
      throw new AppError(404, 'NO_PENDING_WELCOME', 'no pending welcome');
    }

    return { welcome_bytes: fetched.toString('base64url') };
  }

  static async getGroup(userId: string, chatId: string) {
    const [group] = await db
      .select()
      .from(mlsGroups)
      .where(eq(mlsGroups.chatId, chatId));

    if (!group) {
      throw new AppError(404, 'NO_MLS_GROUP', 'no MLS group for this chat');
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
      throw new AppError(
        403,
        'NOT_MLS_GROUP_MEMBER',
        'not a member of this MLS group',
      );
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
  }
}

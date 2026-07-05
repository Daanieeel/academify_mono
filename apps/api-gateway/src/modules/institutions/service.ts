import { eq, and } from 'drizzle-orm';
import { db, institutions, roleBindings } from '@repo/database';
import { AppError } from '../../plugins/error';
import {
  type InstitutionSettings,
  type RoleDefinition,
  INSTITUTION_PRESETS,
} from '@repo/permissions';
import {
  getPresignedUploadUrl,
  getPublicUrl,
  PUBLIC_BUCKET_NAME,
} from '@academify/storage';

export class InstitutionsService {
  static async updateSettings(
    userId: string,
    institutionId: string,
    features?: Record<string, boolean>,
    roles?: Record<string, RoleDefinition>,
    applyPreset?: string,
  ) {
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
    if (role !== 'admin' && role !== 'headmaster') {
      throw new AppError(
        403,
        'NOT_ADMIN',
        'only admins or headmasters can update institution settings',
      );
    }

    const [instRow] = await db
      .select({ settings: institutions.settings })
      .from(institutions)
      .where(eq(institutions.id, institutionId));

    if (!instRow) {
      throw new AppError(404, 'INSTITUTION_NOT_FOUND', 'institution not found');
    }

    const currentSettings = (instRow.settings as InstitutionSettings) ?? {};

    // Merge new settings with existing settings
    const newSettings: InstitutionSettings = {
      features: { ...currentSettings.features, ...features },
      roles: { ...currentSettings.roles, ...roles },
    };

    if (applyPreset && INSTITUTION_PRESETS[applyPreset]) {
      newSettings.roles = {
        ...newSettings.roles,
        ...INSTITUTION_PRESETS[applyPreset],
      };
    }

    const [updated] = await db
      .update(institutions)
      .set({ settings: newSettings })
      .where(eq(institutions.id, institutionId))
      .returning({ settings: institutions.settings });

    if (!updated) {
      throw new Error('Failed to update institution settings');
    }

    return { settings: updated.settings };
  }

  static async generateUploadUrl(
    userId: string,
    institutionId: string,
    assetType: 'avatar' | 'banner',
    contentType: string,
  ) {
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
    if (role !== 'admin' && role !== 'headmaster') {
      throw new AppError(
        403,
        'NOT_ADMIN',
        'only admins or headmasters can upload institution assets',
      );
    }

    const [inst] = await db
      .select({ slug: institutions.slug })
      .from(institutions)
      .where(eq(institutions.id, institutionId));
    if (!inst) {
      throw new AppError(404, 'NOT_FOUND', 'institution not found');
    }

    const ext = contentType.split('/')[1] || 'png';
    const key = `${assetType}s/${inst.slug}.${ext}`;

    const uploadUrl = await getPresignedUploadUrl(
      PUBLIC_BUCKET_NAME,
      key,
      contentType,
    );
    const publicUrl = getPublicUrl(PUBLIC_BUCKET_NAME, key);

    return { uploadUrl, publicUrl };
  }

  static async updateProfile(
    userId: string,
    institutionId: string,
    data: {
      avatarUrl?: string;
      bannerUrl?: string;
      address?: string;
      telephone?: string;
      description?: string;
    },
  ) {
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
    if (role !== 'admin' && role !== 'headmaster') {
      throw new AppError(
        403,
        'NOT_ADMIN',
        'only admins or headmasters can update institution profiles',
      );
    }

    const [updated] = await db
      .update(institutions)
      .set({
        avatarUrl: data.avatarUrl,
        bannerUrl: data.bannerUrl,
        address: data.address,
        telephone: data.telephone,
        description: data.description,
      })
      .where(eq(institutions.id, institutionId))
      .returning();

    // Since we are running in a monorepo dev environment and search relies on the
    // global registry schema, we will try to update it via a raw query if it exists.
    // In production, this would be an event-driven sync.
    try {
      // Just try an update on the registry
      const sql = require('drizzle-orm').sql;
      await db.execute(sql`
        UPDATE institution_registry 
        SET 
          avatar_url = COALESCE(${data.avatarUrl ?? null}, avatar_url),
          banner_url = COALESCE(${data.bannerUrl ?? null}, banner_url),
          address = COALESCE(${data.address ?? null}, address),
          telephone = COALESCE(${data.telephone ?? null}, telephone),
          description = COALESCE(${data.description ?? null}, description)
        WHERE slug = ${updated.slug}
      `);
    } catch (e) {
      console.warn('Failed to sync to registry schema:', e);
    }

    return updated;
  }
}

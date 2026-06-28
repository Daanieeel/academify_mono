import { eq, and } from 'drizzle-orm';
import { db, institutions, roleBindings } from '@repo/database';
import { AppError } from '../../plugins/error';
import {
  type InstitutionSettings,
  type RoleDefinition,
  INSTITUTION_PRESETS,
} from '@repo/permissions';

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

    const currentSettings = (instRow.settings as InstitutionSettings) || {};

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

    return { settings: updated!.settings };
  }
}

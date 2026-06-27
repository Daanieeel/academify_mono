import { type FeatureKey, DEFAULT_FEATURES } from './features';
import { type PermissionKey, DEFAULT_ROLE_PERMISSIONS } from './permissions';

export interface InstitutionSettings {
  features?: Partial<Record<FeatureKey, boolean>>;
  permissions?: Record<string, Partial<Record<PermissionKey, boolean>>>;
}

export class PolicyEngine {
  static computeFeatures(
    settings?: InstitutionSettings | null,
  ): Record<FeatureKey, boolean> {
    return {
      ...DEFAULT_FEATURES,
      ...settings?.features,
    };
  }

  static computePermissions(
    role: string,
    settings?: InstitutionSettings | null,
  ): Record<PermissionKey, boolean> {
    const basePermissions =
      DEFAULT_ROLE_PERMISSIONS[role] || DEFAULT_ROLE_PERMISSIONS['student'];
    const overrides = settings?.permissions?.[role] || {};

    return {
      ...basePermissions,
      ...overrides,
    } as Record<PermissionKey, boolean>;
  }

  // Define who can initiate a DM with whom
  static canInitiateChat(actorRole: string, targetRole: string): boolean {
    if (actorRole === 'student') {
      // Students can only initiate chats with teachers or admins, not other students
      return (
        targetRole === 'teacher' ||
        targetRole === 'admin' ||
        targetRole === 'headmaster'
      );
    }
    if (
      actorRole === 'teacher' ||
      actorRole === 'admin' ||
      actorRole === 'headmaster'
    ) {
      // Staff can initiate with anyone
      return true;
    }
    // Compliance officers don't chat
    if (actorRole === 'compliance_officer') {
      return false;
    }
    return false;
  }
}

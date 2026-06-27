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

  static hasPermission(
    role: string,
    permission: PermissionKey,
    settings?: InstitutionSettings | null,
  ): boolean {
    const permissions = this.computePermissions(role, settings);
    return permissions[permission] ?? false;
  }

  // Define who can initiate a DM with whom
  static canInitiateChat(
    actorRole: string,
    targetRole: string,
    settings?: InstitutionSettings | null,
  ): boolean {
    const permissionKey = `chat:initiate:${targetRole}` as PermissionKey;
    return this.hasPermission(actorRole, permissionKey, settings);
  }
}

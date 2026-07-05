import { type FeatureKey, DEFAULT_FEATURES } from './features';
import { type PermissionKey, DEFAULT_ROLE_PERMISSIONS } from './permissions';

export interface RoleDefinition {
  displayName?: string;
  rank?: number; // Higher number = more important
  inherits?: string[];
  permissions?: Partial<Record<PermissionKey, boolean>>;
}

export interface InstitutionSettings {
  features?: Partial<Record<FeatureKey, boolean>>;
  roles?: Record<string, RoleDefinition>;
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

  private static computeSingleRoleRecursively(
    role: string,
    settings?: InstitutionSettings | null,
    visited = new Set<string>(),
  ): Partial<Record<PermissionKey, boolean>> {
    // Avoid circular dependencies
    if (visited.has(role)) {
      return {};
    }
    visited.add(role);

    const roleDef = settings?.roles?.[role];
    const systemDefaults = DEFAULT_ROLE_PERMISSIONS[role] || {};

    let inheritedPerms: Partial<Record<PermissionKey, boolean>> = {};
    if (roleDef?.inherits) {
      for (const parent of roleDef.inherits) {
        const parentPerms = this.computeSingleRoleRecursively(
          parent,
          settings,
          visited,
        );
        inheritedPerms = { ...inheritedPerms, ...parentPerms };
      }
    }

    return {
      ...systemDefaults,
      ...inheritedPerms,
      ...roleDef?.permissions,
    };
  }

  static computePermissions(
    roles: string[],
    settings?: InstitutionSettings | null,
  ): Partial<Record<PermissionKey, boolean>> {
    if (!roles || roles.length === 0) {
      return DEFAULT_ROLE_PERMISSIONS['student']; // Fallback
    }

    // Sort roles by rank ascending (lowest rank first).
    // That way, higher rank roles are applied last, overwriting earlier ones.
    const sortedRoles = [...roles].sort((a, b) => {
      const rankA = settings?.roles?.[a]?.rank ?? 0;
      const rankB = settings?.roles?.[b]?.rank ?? 0;
      return rankA - rankB;
    });

    let finalPerms: Partial<Record<PermissionKey, boolean>> = {};
    for (const role of sortedRoles) {
      const rolePerms = this.computeSingleRoleRecursively(role, settings);
      finalPerms = { ...finalPerms, ...rolePerms };
    }

    return finalPerms;
  }

  static hasPermission(
    roles: string[],
    permission: PermissionKey | (string & {}),
    settings?: InstitutionSettings | null,
  ): boolean {
    const permissions = this.computePermissions(roles, settings);
    const isPermissionKey = (_key: string): _key is PermissionKey => true;
    if (isPermissionKey(permission)) {
      return permissions[permission] ?? false;
    }
    return false;
  }

  static canInitiateChat(
    actorRoles: string[],
    targetRoles: string[],
    settings?: InstitutionSettings | null,
  ): boolean {
    for (const targetRole of targetRoles) {
      const permissionKey = `chat:initiate:${targetRole}`;
      if (this.hasPermission(actorRoles, permissionKey, settings)) {
        return true;
      }
    }
    return false;
  }
}

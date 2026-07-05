const ROLE_LABELS: Record<string, string> = {
  student: 'Schüler:in',
  teacher: 'Lehrer:in',
  admin: 'Admin',
  compliance_officer: 'Compliance-Beauftragte:r',
  headmaster: 'Schulleitung',
};

export function formatRoleLabel(
  role: string | null | undefined,
): string | undefined {
  return role && role in ROLE_LABELS ? ROLE_LABELS[role] : undefined;
}

const ROLE_ICONS: Record<string, string> = {
  student: 'student',
  teacher: 'chalkboard-teacher',
  admin: 'shield-star',
  compliance_officer: 'shield-check',
  headmaster: 'shield-star',
};

export function formatRoleIcon(
  role: string | null | undefined,
): string | undefined {
  return role && role in ROLE_ICONS ? ROLE_ICONS[role] : undefined;
}

export function formatChatTimestamp(iso: string): string {
  const date = new Date(iso);
  const now = new Date();
  const sameDay = date.toDateString() === now.toDateString();
  if (sameDay) {
    return date.toLocaleTimeString(undefined, {
      hour: '2-digit',
      minute: '2-digit',
    });
  }
  return date.toLocaleDateString(undefined, {
    day: '2-digit',
    month: '2-digit',
  });
}

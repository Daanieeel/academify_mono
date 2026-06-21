const ROLE_LABELS = {
  student: 'Schüler:in',
  teacher: 'Lehrer:in',
  admin: 'Admin',
  compliance_officer: 'Compliance-Beauftragte:r',
  headmaster: 'Schulleitung',
} as const;

export function formatRoleLabel(
  role: keyof typeof ROLE_LABELS | null | undefined,
): string | undefined {
  return role ? ROLE_LABELS[role] : undefined;
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

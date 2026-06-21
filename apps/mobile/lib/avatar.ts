// Shared helpers for the generated avatar (gradient background + emoji).

// Gradients are stored in the single `avatar_background_color` column as a
// comma-joined "from,to" hex pair (e.g. "#FF0000,#00FF00"). A bare single
// hex is still accepted for backward-compat and treated as a flat
// from===to gradient.
export function parseAvatarGradient(
  value: string | null | undefined,
): [string, string] | null {
  if (!value) {
    return null;
  }
  const parts = value.split(',').map((part) => part.trim());
  if (parts.length >= 2 && parts[0] && parts[1]) {
    return [parts[0], parts[1]];
  }
  if (parts[0]) {
    return [parts[0], parts[0]];
  }
  return null;
}

export function serializeAvatarGradient(gradient: [string, string]): string {
  return `${gradient[0]},${gradient[1]}`;
}

// School context: keep avatars wholesome. Block sexual, substance, weapon,
// morbid, profane and racist/hateful symbols. This is the client mirror of
// the same check the API enforces server-side (apps/api-gateway).
export const BLOCKED_EMOJIS = new Set<string>([
  '🖕', // obscene gesture
  '🍆', // sexual innuendo
  '🍑', // sexual innuendo
  '💦', // sexual innuendo
  '🍌', // sexual innuendo
  '👅', // sexual/suggestive
  '🔞', // adult-content marker
  '🍺', // alcohol
  '🍻', // alcohol
  '🍷', // alcohol
  '🍸', // alcohol
  '🍹', // alcohol
  '🍾', // alcohol
  '🥃', // alcohol
  '🚬', // smoking
  '💉', // drug use
  '💊', // drug use
  '🔫', // weapon
  '🔪', // weapon
  '🗡️', // weapon
  '⚔️', // weapon
  '💣', // weapon / violence
  '🧨', // explosive
  '🩸', // graphic / violence
  '💀', // death / morbid
  '☠️', // death / morbid
  '👿', // hateful / demonic
  '😈', // hateful / demonic
  '🤬', // profanity
  '🖤', // co-opted in edgy / hate contexts
  '🐵', // monkey emoji abused in racist harassment
  '🐒', // monkey emoji abused in racist harassment
  '🦍', // ape emoji abused in racist harassment
  '👌', // co-opted as a white-power hand symbol
  '🍉', // weaponised in racist tropes
]);

export function isEmojiAllowed(emoji: string): boolean {
  return !BLOCKED_EMOJIS.has(emoji.trim());
}

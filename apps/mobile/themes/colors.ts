/**
 * Academi.fy Design System — Semantic Color Tokens
 *
 * These are used for native StyleSheet / inline styles where Tailwind classes
 * cannot be applied (e.g. react-navigation themes, expo-status-bar, native alerts).
 *
 * The values here mirror the CSS variables defined in global.css.
 */

export interface ColorScale {
  readonly light: string;
  readonly dark: string;
}

const light = {
  background: '#f6f4ef',
  foreground: '#27231c',

  card: '#ece9e0',
  cardForeground: '#27231c',

  popover: '#f2f0e8',
  popoverForeground: '#27231c',

  primary: '#6b3314',
  primaryForeground: '#faf6ef',

  secondary: '#dcd9cc',
  secondaryForeground: '#3c372e',

  muted: '#dcd9cc',
  mutedForeground: '#726d5e',

  accent: '#d97f1e',
  accentForeground: '#1a1611',

  destructive: '#b71c1c',
  destructiveForeground: '#fafafa',

  border: '#c6c0b2',
  input: '#e4e1d7',
  ring: '#6b3314',
} as const;

const dark = {
  background: '#1a1611',
  foreground: '#ede9e0',

  card: '#241f19',
  cardForeground: '#ede9e0',

  popover: '#241f19',
  popoverForeground: '#ede9e0',

  primary: '#e8d4b0',
  primaryForeground: '#2e2017',

  secondary: '#362d24',
  secondaryForeground: '#e0dbd2',

  muted: '#362d24',
  mutedForeground: '#a09077',

  accent: '#c97a1a',
  accentForeground: '#f6f4ef',

  destructive: '#c23333',
  destructiveForeground: '#fafafa',

  border: '#3d342a',
  input: '#3d342a',
  ring: '#b39470',
} as const;

export type ColorScheme = typeof light;

export const colors = { light, dark } as const;

/** Resolve a semantic color for the given color scheme. */
export function resolveColor(
  key: keyof ColorScheme,
  colorScheme: 'light' | 'dark',
): string {
  return colors[colorScheme][key];
}

// ─── Brand colors (not part of shadcn scheme) ──────────────────────────────
export const brand = {
  untisOrange: '#ff6033',
} as const;

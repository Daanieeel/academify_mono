/**
 * Typography scale — MartianGrotesk design system.
 *
 * In Tailwind v4 / NativeWind v5, custom utilities are defined via
 * @utility in global.css or via extend in tailwind.config.js.
 * This file is kept as a reference and for JS consumers that need
 * the raw values (e.g., StyleSheet-based components).
 */
export const typography = {
  caption: {
    fontFamily: 'MartianGrotesk-StdxBd',
    fontSize: 10,
    lineHeight: 13.6,
    letterSpacing: 0.2,
  },
  label: {
    fontFamily: 'MartianGrotesk-StdMd',
    fontSize: 12,
    lineHeight: 16,
  },
  body: {
    fontFamily: 'MartianGrotesk-StdRg',
    fontSize: 14,
    lineHeight: 20.5,
  },
  lead: {
    fontFamily: 'MartianGrotesk-StdMd',
    fontSize: 18,
    lineHeight: 24,
  },
  subheading: {
    fontFamily: 'MartianGrotesk-StdMd',
    fontSize: 22.65,
    lineHeight: 31.1,
    letterSpacing: 0.1,
  },
  h2: {
    fontFamily: 'MartianGrotesk-NrBl',
    fontSize: 36.65,
    lineHeight: 40.1,
    letterSpacing: -0.2,
  },
  h1: {
    fontFamily: 'MartianGrotesk-StdxBd',
    fontSize: 59.3,
    lineHeight: 67.6,
  },
  display: {
    fontFamily: 'MartianGrotesk-StdBl',
    fontSize: 95.95,
    lineHeight: 105.4,
  },
  displayWide: {
    fontFamily: 'MartianGrotesk-sWdBl',
    fontSize: 95.95,
    lineHeight: 105.4,
  },
} as const;

export type TypographyVariant = keyof typeof typography;

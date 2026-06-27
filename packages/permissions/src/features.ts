export const FEATURES = {
  CLUBS: 'clubs',
  BLACKBOARDS: 'blackboards',
  DIRECT_MESSAGES: 'direct_messages',
} as const;

export type FeatureKey = (typeof FEATURES)[keyof typeof FEATURES];

export const DEFAULT_FEATURES: Record<FeatureKey, boolean> = {
  clubs: true,
  blackboards: true,
  direct_messages: true,
};

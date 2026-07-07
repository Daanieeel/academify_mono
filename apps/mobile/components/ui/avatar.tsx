import { Icon } from '@/components/ui/icon';
import ThemedPressable from '@/components/themed-pressable';
import { parseAvatarGradient } from '@/lib/avatar';
import { LinearGradient } from 'expo-linear-gradient';
import * as AvatarPrimitive from '@rn-primitives/avatar';
import { Text, View } from 'react-native';

const AVATAR_SIZE = {
  sm: 45,
  md: 60,
  lg: 110,
  xl: 150,
} as const;

export type AvatarSize = keyof typeof AVATAR_SIZE;

export type AvatarProps = {
  /** Size preset. Defaults to 'sm'. */
  size?: AvatarSize;
  /** Image URI for the avatar photo */
  source?: string;
  /** Custom border color override */
  customBorderColor?: string;
  onPress?: () => void;
  /** Icomoon icon name for fallback */
  icomoonIcon?: string;
  /** Show border ring around the avatar */
  showBorder?: boolean;
  /** Shape variant */
  variant?: 'circle' | 'rounded';
  /** Generated avatar background color (for gradient fallback) */
  backgroundColor?: string | null;
  /** Emoji character for generated avatar fallback */
  emoji?: string | null;
};

/**
 * Avatar — Shadcn-compatible.
 *
 * Supports photo, emoji+gradient, and icon fallbacks.
 * Shape: `circle` (person) or `rounded` (group/entity).
 */
export function Avatar({
  size = 'sm',
  variant = 'circle',
  source,
  showBorder = true,
  customBorderColor,
  onPress,
  icomoonIcon,
  backgroundColor,
  emoji,
}: AvatarProps) {
  const avatarSize = AVATAR_SIZE[size];
  const borderRadius = variant === 'circle' ? 9999 : 20;
  const fallbackIcon =
    icomoonIcon ?? (variant === 'circle' ? 'user' : 'users-three');
  const gradient = parseAvatarGradient(backgroundColor);

  return (
    <ThemedPressable
      animationEnabled={onPress !== undefined}
      onPress={onPress ?? (() => {})}
    >
      <AvatarPrimitive.Root
        alt={variant === 'circle' ? 'Profile picture' : 'Group picture'}
        className="overflow-hidden bg-muted items-center justify-center border-2"
        style={{
          borderRadius,
          height: avatarSize,
          width: avatarSize,
          borderColor: showBorder
            ? (customBorderColor ?? 'hsl(35 18% 76%)') // --border
            : 'transparent',
        }}
      >
        <AvatarPrimitive.Image
          source={source ? { uri: source } : undefined}
          style={{ height: avatarSize, width: avatarSize }}
        />
        <AvatarPrimitive.Fallback asChild>
          {emoji && gradient ? (
            <LinearGradient
              colors={gradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={{
                height: avatarSize,
                width: avatarSize,
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Text style={{ fontSize: avatarSize * 0.5 }}>{emoji}</Text>
            </LinearGradient>
          ) : (
            <View>
              <Icon
                className="text-muted-foreground"
                size={avatarSize / 2}
                name={fallbackIcon}
              />
            </View>
          )}
        </AvatarPrimitive.Fallback>
      </AvatarPrimitive.Root>
    </ThemedPressable>
  );
}

/**
 * AvatarImage — standalone avatar image (for use within AvatarPrimitive contexts).
 */
export const AvatarImage = AvatarPrimitive.Image;

/**
 * AvatarFallback — standalone avatar fallback (for use within AvatarPrimitive contexts).
 */
export const AvatarFallback = AvatarPrimitive.Fallback;

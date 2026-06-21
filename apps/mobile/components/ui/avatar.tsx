import { Icon } from '@/components/ui/icon';
import ThemedPressable from '@/components/themed-pressable';
import { parseAvatarGradient } from '@/lib/avatar';
import { LinearGradient } from 'expo-linear-gradient';
import * as AvatarPrimitive from '@rn-primitives/avatar';
import { Text, View } from 'react-native';

const AVATAR_SIZE = {
  small: 45,
  medium: 60,
  large: 110,
  'extra-large': 150,
} as const;

export type AvatarProps = {
  size?: keyof typeof AVATAR_SIZE;
  source?: string;
  customBorderColor?: string;
  onPress?: () => void;
  icomoonIcon?: string;
  showBorder?: boolean;
  variant?: 'person' | 'group';
  /** Generated avatar (no real photo yet) — background color + emoji. */
  backgroundColor?: string | null;
  emoji?: string | null;
};

export function Avatar({
  size = 'small',
  variant = 'person',
  source,
  showBorder = true,
  customBorderColor,
  onPress,
  icomoonIcon,
  backgroundColor,
  emoji,
}: AvatarProps) {
  const avatarSize = AVATAR_SIZE[size];
  const borderRadius = variant === 'person' ? 9999 : 40;
  const fallbackIcon =
    icomoonIcon ?? (variant === 'person' ? 'user' : 'users-three');
  const gradient = parseAvatarGradient(backgroundColor);

  return (
    <ThemedPressable
      animationEnabled={onPress !== undefined}
      onPress={onPress ?? (() => {})}
    >
      <AvatarPrimitive.Root
        alt={variant === 'person' ? 'Profilbild' : 'Gruppenbild'}
        className="overflow-hidden bg-neutral-200 items-center justify-center border-[2px]"
        style={{
          borderRadius,
          height: avatarSize,
          width: avatarSize,
          borderColor: showBorder
            ? (customBorderColor ?? 'rgba(39, 35, 28, 0.12)')
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
                className="text-neutral-700"
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

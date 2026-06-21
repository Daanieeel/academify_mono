import { Icon } from '@/components/ui/icon';
import ThemedPressable from '@/components/themed-pressable';
import { cn } from '@/lib/utils';
import * as AvatarPrimitive from '@rn-primitives/avatar';
import { View } from 'react-native';

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
};

export function Avatar({
  size = 'small',
  variant = 'person',
  source,
  showBorder = true,
  customBorderColor,
  onPress,
  icomoonIcon,
}: AvatarProps) {
  const avatarSize = AVATAR_SIZE[size];
  const borderRadius = variant === 'person' ? 9999 : 40;
  const fallbackIcon =
    icomoonIcon ?? (variant === 'person' ? 'user' : 'users-three');

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
          <View>
            <Icon
              className="text-neutral-700"
              size={avatarSize / 2}
              name={fallbackIcon}
            />
          </View>
        </AvatarPrimitive.Fallback>
      </AvatarPrimitive.Root>
    </ThemedPressable>
  );
}

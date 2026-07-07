import { Icon } from '@/components/ui/icon';
import { Text } from '@/components/ui/text';
import ThemedPressable from '@/components/themed-pressable';
import { cn } from '@/lib/utils';
import { View } from 'react-native';

export type ActionButtonProps = {
  label: string;
  icomoonIcon: string;
  onPress?: () => void;
  size?: number;
  className?: string;
};

/**
 * ActionButton — a circular icon button with a label below.
 *
 * Use for quick action grids (e.g., attachment tray, home shortcuts).
 * Follows Shadcn naming convention (replaces RoundButton).
 *
 * @example
 * <ActionButton label="Camera" icomoonIcon="camera" onPress={...} />
 */
export function ActionButton({
  label,
  icomoonIcon,
  onPress,
  size = 60,
  className,
}: ActionButtonProps) {
  return (
    <ThemedPressable
      onPress={onPress ?? (() => {})}
      className={cn('items-center gap-1.5', className)}
    >
      <View
        className="items-center justify-center bg-secondary border-2 border-border"
        style={{
          width: size,
          height: size,
          borderRadius: size / 2,
        }}
      >
        <Icon
          size={size * 0.4}
          name={icomoonIcon}
          className="text-foreground"
        />
      </View>
      <Text variant="caption" className="text-muted-foreground">
        {label}
      </Text>
    </ThemedPressable>
  );
}

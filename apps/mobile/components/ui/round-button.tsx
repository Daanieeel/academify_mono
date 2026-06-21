import { Icon } from '@/components/ui/icon';
import { Text } from '@/components/ui/text';
import ThemedPressable from '@/components/themed-pressable';
import { View } from 'react-native';

export type RoundButtonProps = {
  label: string;
  icomoonIcon: string;
  onPress?: () => void;
  size?: number;
};

export function RoundButton({
  label,
  icomoonIcon,
  onPress,
  size = 60,
}: RoundButtonProps) {
  return (
    <ThemedPressable
      onPress={onPress ?? (() => {})}
      className="items-center gap-[6px]"
    >
      <View
        className="items-center justify-center bg-neutral-200"
        style={{
          width: size,
          height: size,
          borderRadius: size / 2,
        }}
      >
        <Icon
          size={size * 0.4}
          name={icomoonIcon}
          className="text-neutral-900"
        />
      </View>
      <Text variant="caption" className="text-neutral-900">
        {label}
      </Text>
    </ThemedPressable>
  );
}

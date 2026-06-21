import { Text } from '@/components/ui/text';
import { cn } from '@/lib/utils';
import * as SwitchPrimitive from '@rn-primitives/switch';
import * as React from 'react';
import { View } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';

const TOGGLE_WIDTH = 71;
const THUMB_WIDTH = 45;
const DURATION = 50;
const EASING = Easing.bezier(0.4, 0, 0.2, 1);

export type SwitchProps = {
  checked?: boolean;
  defaultChecked?: boolean;
  onCheckedChange?: (checked: boolean) => void;
  labelOn?: string;
  labelOff?: string;
  disabled?: boolean;
};

export function Switch({
  checked: checkedProp,
  defaultChecked = false,
  onCheckedChange,
  labelOn = 'an',
  labelOff = 'aus',
  disabled,
}: SwitchProps) {
  const [uncontrolledChecked, setUncontrolledChecked] =
    React.useState(defaultChecked);
  const checked = checkedProp ?? uncontrolledChecked;
  const progress = useSharedValue(checked ? 1 : 0);

  React.useEffect(() => {
    progress.value = withTiming(checked ? 1 : 0, {
      duration: DURATION + 150,
      easing: EASING,
    });
  }, [checked, progress]);

  const handleCheckedChange = (next: boolean) => {
    if (checkedProp === undefined) {
      setUncontrolledChecked(next);
    }
    onCheckedChange?.(next);
  };

  const thumbAnimatedStyle = useAnimatedStyle(() => {
    const maxTranslate = TOGGLE_WIDTH - THUMB_WIDTH - 6;
    return {
      transform: [{ translateX: progress.value * maxTranslate }],
    };
  });

  return (
    <SwitchPrimitive.Root
      checked={checked}
      onCheckedChange={handleCheckedChange}
      disabled={disabled}
      className={cn(
        'py-[1.5px] px-[1.5px] w-[71px] h-[28px] rounded-full justify-center border-[1.5px] border-dashed',
        checked
          ? 'bg-primary-900 border-transparent'
          : 'bg-transparent border-primary-900',
        disabled && 'opacity-50',
      )}
    >
      <SwitchPrimitive.Thumb asChild>
        {/* className + a useAnimatedStyle() style can't coexist on the same
            Animated.View (breaks Reanimated's recognition of the component),
            so the transform lives here and visual styling lives on the plain
            View nested inside. */}
        <Animated.View
          style={[
            { width: 45, height: '100%', alignSelf: 'flex-start' },
            thumbAnimatedStyle,
          ]}
        >
          <View
            className={cn(
              'rounded-full h-full w-full justify-center items-center',
              checked ? 'bg-primary-100' : 'bg-primary-900',
            )}
          >
            <Text
              variant="caption"
              className={checked ? 'text-primary-900' : 'text-primary-100'}
            >
              {checked ? labelOn : labelOff}
            </Text>
          </View>
        </Animated.View>
      </SwitchPrimitive.Thumb>
    </SwitchPrimitive.Root>
  );
}

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
const DURATION = 200;
const EASING = Easing.bezier(0.4, 0, 0.2, 1);

export type SwitchProps = {
  checked?: boolean;
  defaultChecked?: boolean;
  onCheckedChange?: (checked: boolean) => void;
  /** Text shown inside thumb when checked */
  labelOn?: string;
  /** Text shown inside thumb when unchecked */
  labelOff?: string;
  disabled?: boolean;
};

/**
 * Switch — Shadcn-compatible.
 *
 * Custom animated pill switch using primary/secondary color tokens.
 * Checked: primary track + parchment-colored thumb
 * Unchecked: transparent track with dashed border + dark thumb
 */
export function Switch({
  checked: checkedProp,
  defaultChecked = false,
  onCheckedChange,
  labelOn = 'on',
  labelOff = 'off',
  disabled,
}: SwitchProps) {
  const [uncontrolledChecked, setUncontrolledChecked] =
    React.useState(defaultChecked);
  const checked = checkedProp ?? uncontrolledChecked;
  const progress = useSharedValue(checked ? 1 : 0);

  React.useEffect(() => {
    progress.value = withTiming(checked ? 1 : 0, {
      duration: DURATION,
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
    const maxTranslate = TOGGLE_WIDTH - THUMB_WIDTH - 4;
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
        'py-0.5 px-0.5 w-[71px] h-[28px] rounded-full justify-center border-2 border-dashed',
        checked
          ? 'bg-primary border-transparent'
          : 'bg-transparent border-primary',
        disabled && 'opacity-50',
      )}
    >
      <SwitchPrimitive.Thumb asChild>
        {/* className + useAnimatedStyle() cannot coexist on the same Animated.View
            (breaks Reanimated's recognition), so transform lives in the animated
            style and visual styling lives on the plain View nested inside. */}
        <Animated.View
          style={[
            { width: THUMB_WIDTH, height: '100%', alignSelf: 'flex-start' },
            thumbAnimatedStyle,
          ]}
        >
          <View
            className={cn(
              'rounded-full h-full w-full justify-center items-center',
              checked ? 'bg-primary-foreground' : 'bg-primary',
            )}
          >
            <Text
              variant="caption"
              className={checked ? 'text-primary' : 'text-primary-foreground'}
            >
              {checked ? labelOn : labelOff}
            </Text>
          </View>
        </Animated.View>
      </SwitchPrimitive.Thumb>
    </SwitchPrimitive.Root>
  );
}

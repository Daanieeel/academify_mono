import { useHaptic } from '@/hooks/use-haptics';
import { cn } from '@/lib/utils';
import * as CheckboxPrimitive from '@rn-primitives/checkbox';
import React, { useRef } from 'react';
import { Animated } from 'react-native';

export type ThemedSelectableProps = {
  children?: React.ReactNode;
  selected?: boolean;
  onPress?: () => void;
};

const SCALE_VALUE = 0.98;

const ThemedSelectable = ({
  selected = false,
  ...props
}: ThemedSelectableProps) => {
  const scale = useRef(new Animated.Value(1)).current;
  const haptic = useHaptic('medium');

  const handlePressIn = () => {
    Animated.timing(scale, {
      toValue: SCALE_VALUE,
      useNativeDriver: true,
      duration: 100,
    }).start();
  };

  const handlePressOut = () => {
    Animated.timing(scale, {
      toValue: 1,
      useNativeDriver: true,
      duration: 100,
    }).start();
  };

  return (
    <CheckboxPrimitive.Root
      checked={selected}
      onCheckedChange={() => {
        props.onPress?.();
        haptic?.();
      }}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      asChild
    >
      <Animated.View
        className={cn(
          'overflow-hidden rounded-[20px] border-[2px]',
          selected ? 'border-neutral-900' : 'border-transparent',
        )}
        style={{ transform: [{ scale }] }}
      >
        {props.children}
      </Animated.View>
    </CheckboxPrimitive.Root>
  );
};

export default ThemedSelectable;

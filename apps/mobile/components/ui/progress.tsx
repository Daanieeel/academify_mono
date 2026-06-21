import { cn } from '@/lib/utils';
import * as ProgressPrimitive from '@rn-primitives/progress';
import type * as React from 'react';
import { View } from 'react-native';
import Animated, {
  Extrapolation,
  interpolate,
  useAnimatedStyle,
  useDerivedValue,
  withSpring,
} from 'react-native-reanimated';

export function Progress({
  className,
  value,
  indicatorClassName,
  ...props
}: React.ComponentProps<typeof ProgressPrimitive.Root> & {
  indicatorClassName?: string;
}) {
  return (
    <ProgressPrimitive.Root
      className={cn(
        'h-[8px] w-full overflow-hidden rounded-full bg-neutral-200',
        className,
      )}
      {...props}
    >
      <Indicator value={value} className={indicatorClassName} />
    </ProgressPrimitive.Root>
  );
}

function Indicator({
  value,
  className,
}: {
  value: number | undefined | null;
  className?: string;
}) {
  const progress = useDerivedValue(() => value ?? 0);

  const indicatorStyle = useAnimatedStyle(() => ({
    width: withSpring(
      `${interpolate(progress.value, [0, 100], [1, 100], Extrapolation.CLAMP)}%`,
      { overshootClamping: true },
    ),
  }));

  return (
    <ProgressPrimitive.Indicator asChild>
      {/* className + a useAnimatedStyle() style can't coexist on the same
          Animated.View, so width animation lives here and color lives on
          the plain View nested inside. */}
      <Animated.View style={[{ height: '100%' }, indicatorStyle]}>
        <View className={cn('h-full w-full bg-primary-900', className)} />
      </Animated.View>
    </ProgressPrimitive.Indicator>
  );
}

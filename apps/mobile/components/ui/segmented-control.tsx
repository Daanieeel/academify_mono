import { Text } from '@/components/ui/text';
import { useHaptic } from '@/hooks/use-haptics';
import * as ToggleGroupPrimitive from '@rn-primitives/toggle-group';
import * as React from 'react';
import { Animated, Easing, LayoutChangeEvent, View } from 'react-native';

const SLIDER_PADDING = 5;
const ANIMATION_DURATION = 200;

export type SegmentedControlProps = {
  options: string[];
  value?: number;
  onValueChange: (index: number) => void;
};

export function SegmentedControl({
  value = 0,
  ...props
}: SegmentedControlProps) {
  const [containerWidth, setContainerWidth] = React.useState(0);
  const haptic = useHaptic('medium');

  const onLayout = (event: LayoutChangeEvent) => {
    setContainerWidth(event.nativeEvent.layout.width);
  };

  const selectedContainerWidth = containerWidth / props.options.length;

  const translateX = React.useRef(
    new Animated.Value(selectedContainerWidth * value),
  ).current;

  React.useEffect(() => {
    Animated.timing(translateX, {
      toValue: selectedContainerWidth * value,
      useNativeDriver: true,
      duration: ANIMATION_DURATION,
      easing: Easing.linear,
    }).start();
  }, [value, selectedContainerWidth, translateX]);

  const onItemValueChange = (newValue: string | undefined) => {
    if (newValue === undefined) {
      return;
    }
    const index = Number(newValue);
    if (index !== value) {
      haptic?.();
      props.onValueChange(index);
    }
  };

  return (
    <ToggleGroupPrimitive.Root
      type="single"
      value={String(value)}
      onValueChange={onItemValueChange}
      onLayout={onLayout}
      className="h-[50px] p-[5px] rounded-[18px] w-full flex-row justify-evenly bg-neutral-200"
    >
      <Animated.View
        className="h-full absolute top-[5px] rounded-[15px] z-[1] bg-neutral-50"
        style={{
          left: SLIDER_PADDING,
          width: selectedContainerWidth - SLIDER_PADDING * props.options.length,
          transform: [{ translateX }],
        }}
      />
      {props.options.map((optionName, index) => (
        <ToggleGroupPrimitive.Item
          value={String(index)}
          key={index}
          className="z-[999] rounded-[13px] justify-center items-center flex-1 bg-transparent"
        >
          <View>
            <Text
              numberOfLines={1}
              className={
                index === value ? 'text-neutral-900' : 'text-neutral-600'
              }
              variant="body"
            >
              {optionName}
            </Text>
          </View>
        </ToggleGroupPrimitive.Item>
      ))}
    </ToggleGroupPrimitive.Root>
  );
}

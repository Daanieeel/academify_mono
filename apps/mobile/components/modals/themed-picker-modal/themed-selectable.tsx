import { useHaptic } from '@/hooks/use-haptics';
import { useThemeColor } from '@/hooks/use-theme-color';
import React, { useRef } from 'react';
import { Animated, Pressable } from 'react-native';

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
  const borderColor = useThemeColor({}, 'neutral-900');

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
    <Pressable
      onPressOut={handlePressOut}
      onPressIn={handlePressIn}
      onPress={() => {
        if (props.onPress) {
          props.onPress();
        }
        if (haptic) {
          haptic();
        }
      }}
    >
      <Animated.View
        style={{
          overflow: 'hidden',
          borderRadius: 20,
          borderColor: selected ? borderColor : 'transparent',
          borderWidth: 2,
          transform: [
            {
              scale,
            },
          ],
        }}
      >
        {props.children}
      </Animated.View>
    </Pressable>
  );
};

export default ThemedSelectable;

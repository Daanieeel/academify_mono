// adds a press animation to a child along with an onPress property

import { FeedbackType, useHaptic } from '@/hooks/use-haptics';
import React, { useRef } from 'react';
import { Animated, Pressable, PressableProps } from 'react-native';

export type ThemedPressableProps = PressableProps & {
  children?: React.ReactNode;
  onPress: () => void;
  scaleFactor?: number;
  feedBackType?: FeedbackType;
  animationEnabled?: boolean;
  disabled?: boolean;
};

const ThemedPressable = ({
  disabled = false,
  feedBackType = 'selection',
  scaleFactor = 0.96,
  animationEnabled = true,
  ...props
}: ThemedPressableProps) => {
  const selectionHaptic = useHaptic(feedBackType);
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    if (animationEnabled) {
      Animated.spring(scaleAnim, {
        toValue: scaleFactor,
        useNativeDriver: true,
        speed: 30,
        bounciness: 5,
      }).start();
    }
  };

  const handlePressOut = () => {
    if (animationEnabled) {
      Animated.spring(scaleAnim, {
        toValue: 1,
        useNativeDriver: true,
        speed: 30,
        bounciness: 5,
      }).start();
    }
  };

  const handleOnPress = () => {
    if (animationEnabled) {
      selectionHaptic && selectionHaptic();
    }
    props.onPress();
  };

  return (
    <Pressable
      style={{
        opacity: disabled ? 0.6 : 1,
      }}
      disabled={disabled}
      {...props}
      onPress={handleOnPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
    >
      <Animated.View style={[{ transform: [{ scale: scaleAnim }] }]}>
        {props.children}
      </Animated.View>
    </Pressable>
  );
};

export default ThemedPressable;

// adds a press animation to a child along with an onPress property

import { FeedbackType, useHaptic } from '@/hooks/use-haptics';
import React, { useRef } from 'react';
import {
  Animated,
  Pressable,
  PressableProps,
  StyleProp,
  View,
  ViewStyle,
} from 'react-native';

export type ThemedPressableProps = Omit<PressableProps, 'style'> & {
  children?: React.ReactNode;
  onPress: () => void;
  scaleFactor?: number;
  feedBackType?: FeedbackType;
  animationEnabled?: boolean;
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
};

const ThemedPressable = ({
  disabled = false,
  feedBackType = 'selection',
  scaleFactor = 0.96,
  animationEnabled = true,
  className,
  style,
  ...props
}: ThemedPressableProps) => {
  const selectionHaptic = useHaptic(feedBackType);
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const { children, ...restProps } = props;

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
      if (selectionHaptic) {
        selectionHaptic();
      }
    }
    props.onPress();
  };

  return (
    <Animated.View
      className={className}
      style={[
        style,
        { opacity: disabled ? 0.6 : 1 },
        { transform: [{ scale: scaleAnim }] },
      ]}
    >
      <Pressable
        disabled={disabled}
        {...restProps}
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          zIndex: 1,
        }}
        onPress={handleOnPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
      />
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 8,
        }}
        pointerEvents="none"
      >
        {children}
      </View>
    </Animated.View>
  );
};

export default ThemedPressable;

// Simple button component; see figma file for variants

import { useHaptic } from '@/hooks/use-haptics';
import { useThemeColor } from '@/hooks/use-theme-color';
import React, { useRef } from 'react';
import { Animated, StyleSheet } from 'react-native';
import IcomoonIcon from '../IcomoonIcon';
import { ThemedText } from '../themed-text';

type SimpleButtonProps = {
  label: string;
  onPress: () => void;
  type: 'primary' | 'secondary';
  icomoonIcon?: string;
  icomoonIconColor?: string;
  icomoonIconSize?: number;
  dynamicIcon?: () => React.ReactNode;
  dynamicIconLeft?: () => React.ReactNode;
  className?: string;
  textClassName?: string;
  customTextColor?: string;
};

const SimpleButton = ({
  label,
  onPress,
  type,
  icomoonIcon,
  dynamicIcon,
  icomoonIconColor,
  icomoonIconSize = 24,
  dynamicIconLeft,
  customTextColor,
}: SimpleButtonProps) => {
  const selectionHaptic = useHaptic('selection');
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const neutral900Color = useThemeColor({}, 'neutral-900');
  const neutral700Color = useThemeColor({}, 'neutral-700');
  const neutral200Color = useThemeColor({}, 'neutral-200');
  const neutral50Color = useThemeColor({}, 'neutral-50');

  const handlePressIn = () => {
    if (selectionHaptic) {
      selectionHaptic();
    }
    Animated.spring(scaleAnim, {
      toValue: 0.96,
      useNativeDriver: true,
      speed: 30,
      bounciness: 5,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      useNativeDriver: true,
      speed: 30,
      bounciness: 5,
    }).start();
    onPress();
  };

  return (
    <Animated.View
      onTouchStart={handlePressIn}
      onTouchEndCapture={handlePressOut}
      style={[
        type === 'primary'
          ? { backgroundColor: neutral900Color, borderColor: neutral700Color }
          : { backgroundColor: 'transparent', borderColor: neutral200Color },
        styles['main-container'],
        { transform: [{ scale: scaleAnim }] },
      ]}
    >
      {dynamicIconLeft && dynamicIconLeft()}
      <ThemedText
        type="body"
        color={
          customTextColor ||
          (type === 'primary' ? neutral50Color : neutral900Color)
        }
        style={[styles.label]}
      >
        {label}
      </ThemedText>
      {icomoonIcon && (
        <IcomoonIcon
          name={icomoonIcon}
          size={icomoonIconSize}
          color={
            icomoonIconColor ||
            (type === 'primary' ? neutral50Color : neutral900Color)
          }
        />
      )}
      {dynamicIcon && dynamicIcon()}
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  label: {
    color: '#fff',
  },
  'main-container': {
    borderRadius: 18,
    paddingHorizontal: 25,
    height: 60,
    borderWidth: 1.5,
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
    gap: 8,
  },
});

export default SimpleButton;

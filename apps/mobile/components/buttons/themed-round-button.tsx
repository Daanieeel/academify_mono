import IcomoonIcon from '@/components/IcomoonIcon';
import { ThemedText } from '@/components/themed-text';
import { useThemeColor } from '@/hooks/use-theme-color';
import React from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';

type ThemedRoundButtonProps = {
  label: string;
  icomoonIcon: string;
  onPress?: () => void;
  size?: number;
};

const ThemedRoundButton = ({
  label,
  icomoonIcon,
  onPress,
  size = 60,
}: ThemedRoundButtonProps) => {
  const foregroundColor = useThemeColor({}, 'neutral-900');
  const backgroundColor = useThemeColor({}, 'neutral-200');

  return (
    <TouchableOpacity
      activeOpacity={0.7}
      onPress={onPress}
      style={styles.container}
    >
      <View
        style={[
          styles.iconContainer,
          {
            backgroundColor,
            width: size,
            height: size,
            borderRadius: size / 2,
          },
        ]}
      >
        <IcomoonIcon
          size={size * 0.4}
          name={icomoonIcon}
          color={foregroundColor}
        ></IcomoonIcon>
      </View>
      <ThemedText type="caption" color={foregroundColor}>
        {label}
      </ThemedText>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    gap: 6,
  },
  iconContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default ThemedRoundButton;

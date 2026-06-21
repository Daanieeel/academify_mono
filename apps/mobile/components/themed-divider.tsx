import { useThemeColor } from '@/hooks/use-theme-color';
import React from 'react';
import { View, ViewStyle, StyleSheet } from 'react-native';

export type ThemedDividerProps = {
  props?: React.ComponentProps<typeof View>;
  style?: ViewStyle;
  className?: string;
};

const ThemedDivider = (props: ThemedDividerProps) => {
  const dividerColor = useThemeColor({}, 'neutral-100');

  return (
    <View
      {...props.props}
      style={[styles.divider, { backgroundColor: dividerColor }, props.style]}
    ></View>
  );
};

const styles = StyleSheet.create({
  divider: {
    height: 1.5,
  },
});

export default ThemedDivider;

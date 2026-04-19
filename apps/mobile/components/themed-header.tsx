import { useThemeColor } from '@/hooks/use-theme-color';
import React from 'react';
import { StyleSheet, View } from 'react-native';
import { ThemedText } from './themed-text';

export type ThemedHeaderProps = {
  headerTitle: string;
  headerCompRight?: React.ReactNode;
  headerSearchBar?: React.ReactNode;
};

const ThemedHeader = (props: ThemedHeaderProps) => {
  const neutral50Color = useThemeColor({}, 'neutral-50');

  return (
    <View
      style={[
        {
          backgroundColor: neutral50Color,
        },
        styles['header-container'],
      ]}
    >
      <View style={styles['header-title-container']}>
        <ThemedText
          numberOfLines={1}
          style={{ textAlign: 'left' }}
          type="heading2"
        >
          {props.headerTitle}
        </ThemedText>
        {props.headerCompRight}
      </View>
      {props.headerSearchBar}
    </View>
  );
};

const styles = StyleSheet.create({
  'header-container': {
    paddingHorizontal: 15,
    overflow: 'hidden',
    paddingTop: 30,
    gap: 10,
  },
  'header-title-container': {
    width: '100%',
    justifyContent: 'space-between',
    flexDirection: 'row',
    alignItems: 'center',
  },
});

export default ThemedHeader;

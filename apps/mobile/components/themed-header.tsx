import React from 'react';
import { View } from 'react-native';
import { Text } from '@/components/ui/text';

export type ThemedHeaderProps = {
  headerTitle: string;
  headerCompRight?: React.ReactNode;
};

const ThemedHeader = (props: ThemedHeaderProps) => {
  return (
    <View className="px-[15px] overflow-hidden pt-[10px] pb-[10px] bg-neutral-50">
      <View className="w-full justify-between flex-row items-center">
        <Text numberOfLines={1} className="text-left" variant="heading2">
          {props.headerTitle}
        </Text>
        {props.headerCompRight}
      </View>
    </View>
  );
};

export default ThemedHeader;

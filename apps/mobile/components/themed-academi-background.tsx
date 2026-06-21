import React from 'react';
import { View } from 'react-native';
import { Text } from '@/components/ui/text';

const ThemedAcademiBackground = () => {
  return (
    <View className="absolute top-[-100px] right-[-100px] z-0 gap-[25px] -rotate-[15deg]">
      {Array.from({ length: 30 }).map((_, index) => (
        <View key={index} className="flex-row gap-[25px]">
          {Array.from({ length: 30 }).map((_, innerIndex) => (
            <Text
              key={innerIndex}
              className="text-neutral-200"
              variant="heading2"
            >
              academi
            </Text>
          ))}
        </View>
      ))}
    </View>
  );
};

export default ThemedAcademiBackground;

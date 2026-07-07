import React from 'react';
import { View } from 'react-native';
import { Text } from '@/components/ui/text';
import { Icon } from '@/components/ui/icon';

type ThemedErrorBackgroundProps = {
  title: string;
  description?: string;
  iconName?: string;
};

const ThemedErrorBackground = ({
  iconName = 'smiley-x-eyes',
  ...props
}: ThemedErrorBackgroundProps) => {
  return (
    <View className="bg-transparent border-[1.5px] border-dashed p-[20px] rounded-[18px] gap-[5px] max-w-[60%] items-center border-neutral-600">
      <Icon className="text-neutral-800" size={50} name={iconName}></Icon>
      <Text className="text-center text-neutral-800" variant="subheading">
        {props.title}
      </Text>
      <Text className="text-center text-neutral-600" variant="caption">
        {props.description}
      </Text>
    </View>
  );
};

export default ThemedErrorBackground;
